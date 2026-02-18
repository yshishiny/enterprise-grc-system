/**
 * build_master_index.ts  v2
 * ──────────────────────────────────────────────────────────
 * Reads all 7 department packs + Master_Obligations_Register,
 * scans Nextcloud evidence, applies 3-pass matching,
 * computes 4-metric coverage, detects duplicates, and
 * generates Master_Index_All_Packs.xlsx with multiple output sheets.
 *
 * Consistency Rules:
 *   GitHub = canonical source for code/templates/config
 *   Nextcloud = canonical source for approved evidence docs
 *   _POLICY_FACTORY_SYSTEM = canonical system folder (no edits outside)
 *
 * Coverage Scoring Model:
 *   100 = Approved + implemented + evidence + tested
 *   75  = Approved + partially implemented OR evidence incomplete
 *   50  = Draft + partial evidence
 *   25  = Planned but not drafted
 *   0   = Not Started
 *
 * Matching (3-pass deterministic):
 *   Pass 1: Exact match on DocumentID / Code
 *   Pass 2: Exact title match (case-insensitive)
 *   Pass 3: Fuzzy match (Jaccard > 0.3) → flagged "Needs Human Confirm"
 */
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// ════════════════════════════════════════════════════════════
// Configuration
// ════════════════════════════════════════════════════════════
const NEXTCLOUD = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures";
const PACK_DIR  = path.join(NEXTCLOUD, "Departmental_pack_cross_ownership_folder");
const SYS_DIR   = path.join(NEXTCLOUD, "_POLICY_FACTORY_SYSTEM");
const OUT_INDEX  = path.join(SYS_DIR, "02_INDEX");
const OUT_MAP    = path.join(SYS_DIR, "03_MAPPINGS");

// All evidence scan roots
const EVIDENCE_ROOTS = [
  path.join(NEXTCLOUD, "HR"),
  path.join(NEXTCLOUD, "IT & IS policies and procedures"),
  path.join(NEXTCLOUD, "Approved Procedures"),
  path.join(NEXTCLOUD, "Credit policy"),
  path.join(NEXTCLOUD, "Shari Establishment  policies -"),
  path.join(NEXTCLOUD, "_SYSTEM_BASELINE"),
  path.join(NEXTCLOUD, "_SYSTEM_WORKSPACE"),
  path.join(SYS_DIR, "00_INTAKE"),
  path.join(SYS_DIR, "04_EVIDENCE"),
  path.join(SYS_DIR, "06_OUTPUT_FINAL"),
];

interface PackConfig {
  code: string; name: string; packFolder: string; format: 'flat' | 'structured';
}

const PACKS: PackConfig[] = [
  { code: "HR",         name: "Human Resources",         packFolder: "HR_pack_cross_ownership",         format: "flat" },
  { code: "AML",        name: "AML/CFT",                 packFolder: "AML_pack_cross_ownership",        format: "structured" },
  { code: "AUDIT",      name: "Internal Audit",          packFolder: "AUDIT_pack_cross_ownership",      format: "structured" },
  { code: "FINANCE",    name: "Finance",                 packFolder: "FINANCE_pack_cross_ownership",    format: "structured" },
  { code: "OPERATIONS", name: "Operations",              packFolder: "OPERATIONS_pack_cross_ownership", format: "structured" },
  { code: "RISK",       name: "Risk Management",         packFolder: "RISK_pack_cross_ownership",       format: "structured" },
  { code: "AUD",        name: "Internal Audit (Legacy)", packFolder: "AUD_pack_cross_ownership",        format: "flat" },
];

const STATUS_VALUES = ["Not Started","Draft","In Review","Approved","Implemented","Needs Update","Retired"];
const DEFAULT_APPROVERS: Record<string,string> = {
  HR:"CEO", AML:"BOD", AUDIT:"BOD", FINANCE:"CEO",
  OPERATIONS:"Dept Head", RISK:"BOD", AUD:"BOD",
};

// ════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════
interface MasterRow {
  PackID: string;
  DocumentID: string;
  Title: string;
  Type: string;
  Owner: string;
  CrossOwners: string;
  Approver: string;
  Version: string;
  EvidenceLinkOrPath: string;
  Status: string;
  CoveragePercent: number;
  MappedObligations: string;
  MatchMethod: string;       // "ExactID" | "ExactTitle" | "Fuzzy" | "None"
  MatchConfidence: string;   // "Confirmed" | "Needs Human Confirm" | ""
  LastUpdated: string;
  Confidentiality: string;
  FrameworkTags: string;
  Notes: string;
}

interface EvidenceFile {
  name: string; path: string; tokens: string[];
  nameLower: string; modDate: string;
}

// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════
function tokenize(text: string): string[] {
  return text
    .replace(/[_\-\.\(\)\[\]{}،,;:]/g, ' ')
    .replace(/\.(pdf|docx|xlsx|doc|pptx|txt)$/i, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function jaccardIndex(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const inter = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function computeStatus(evidencePath: string, packStatus?: string): string {
  if (packStatus && STATUS_VALUES.includes(packStatus)) return packStatus;
  if (!evidencePath) return "Not Started";
  const l = evidencePath.toLowerCase();
  if (l.includes('approved') || l.includes('معتمد') || l.includes('final')) return "Approved";
  if (l.includes('draft') || l.includes('مسودة')) return "Draft";
  if (l.includes('review') || l.includes('مراجعة')) return "In Review";
  return "Draft";
}

function computeCoverage(status: string, hasEvidence: boolean, isMapped: boolean): number {
  if (status === "Implemented" && hasEvidence) return 100;
  if (status === "Approved"    && hasEvidence) return 75;
  if (status === "Approved"    && !hasEvidence) return 50;
  if (status === "In Review") return 50;
  if (status === "Draft"       && hasEvidence) return 50;
  if (status === "Draft"       && !hasEvidence) return 25;
  if (status === "Needs Update") return 25;
  return 0;
}

// ════════════════════════════════════════════════════════════
// Evidence Scanner
// ════════════════════════════════════════════════════════════
function scanEvidence(): EvidenceFile[] {
  const files: EvidenceFile[] = [];
  const validExts = ['.pdf','.docx','.doc','.xlsx','.pptx','.txt'];

  function scan(dir: string) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') scan(full);
        } else if (entry.isFile() && validExts.includes(path.extname(entry.name).toLowerCase())) {
          const stat = fs.statSync(full);
          files.push({
            name: entry.name, path: full, tokens: tokenize(entry.name),
            nameLower: entry.name.toLowerCase(),
            modDate: stat.mtime.toISOString().split('T')[0],
          });
        }
      }
    } catch {}
  }

  for (const root of EVIDENCE_ROOTS) { if (fs.existsSync(root)) scan(root); }
  // Also scan Nextcloud root loose files
  try {
    for (const entry of fs.readdirSync(NEXTCLOUD, { withFileTypes: true })) {
      if (entry.isFile() && validExts.includes(path.extname(entry.name).toLowerCase())) {
        const full = path.join(NEXTCLOUD, entry.name);
        const stat = fs.statSync(full);
        files.push({ name: entry.name, path: full, tokens: tokenize(entry.name),
          nameLower: entry.name.toLowerCase(), modDate: stat.mtime.toISOString().split('T')[0] });
      }
    }
  } catch {}

  return files;
}

// ════════════════════════════════════════════════════════════
// Pack Readers (same as v1 but with CrossOwners + FrameworkTags)
// ════════════════════════════════════════════════════════════
function readFlatPack(packDir: string, code: string): MasterRow[] {
  const rows: MasterRow[] = [];
  const taxFile = fs.readdirSync(packDir).find(f => f.endsWith('.json'));
  if (taxFile) {
    const taxonomy = JSON.parse(fs.readFileSync(path.join(packDir, taxFile), 'utf8'));
    let catalog: any[] = [];
    if (taxonomy.catalog) {
      for (const key of Object.keys(taxonomy.catalog)) {
        catalog.push(...(taxonomy.catalog[key] || []));
      }
    } else if (taxonomy.items) {
      catalog = taxonomy.items;
    }
    for (const item of catalog) {
      rows.push({
        PackID: code, DocumentID: item.id || `${code}-${rows.length+1}`,
        Title: item.title || item.name || "Untitled",
        Type: item.id?.split('-')[1] || item.type || "Document",
        Owner: code, CrossOwners: "", Approver: DEFAULT_APPROVERS[code] || "Dept Head",
        Version: "1.0", EvidenceLinkOrPath: "", Status: "Not Started",
        CoveragePercent: 0, MappedObligations: "",
        MatchMethod: "None", MatchConfidence: "",
        LastUpdated: "", Confidentiality: "Internal",
        FrameworkTags: "", Notes: "",
      });
    }
  }
  return rows;
}

function readStructuredPack(packDir: string, code: string): MasterRow[] {
  const rows: MasterRow[] = [];
  const regFile = path.join(packDir, "04_Registers_Trackers", "Document_Register.xlsx");
  if (fs.existsSync(regFile)) {
    const wb = XLSX.readFile(regFile);
    const data: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    for (const item of data) {
      rows.push({
        PackID: code, DocumentID: item['Doc ID'] || `${code}-DOC-${rows.length+1}`,
        Title: item['Title'] || "Untitled", Type: item['Type'] || "Document",
        Owner: item['Owner'] || code, CrossOwners: "",
        Approver: item['Approver'] || DEFAULT_APPROVERS[code] || "Dept Head",
        Version: item['Version'] || "1.0",
        EvidenceLinkOrPath: item['Link/Path'] || "",
        Status: item['Status'] || "Not Started", CoveragePercent: 0,
        MappedObligations: item['Mapped Obligations'] || "",
        MatchMethod: "None", MatchConfidence: "",
        LastUpdated: item['Effective Date'] || "",
        Confidentiality: "Internal", FrameworkTags: "", Notes: "",
      });
    }
  }
  // Read Obligations Map for cross-referencing
  const oblFile = path.join(packDir, "05_Mappings", "Obligations_Map.xlsx");
  if (fs.existsSync(oblFile)) {
    const wb = XLSX.readFile(oblFile);
    const data: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    for (const obl of data) {
      const artifact = obl['Mapped Artifact'] || "";
      const oblRef = obl['Law/Regulation'] || "";
      for (const row of rows) {
        if (artifact && row.Title.includes(artifact)) {
          row.MappedObligations = row.MappedObligations
            ? `${row.MappedObligations}; ${oblRef}` : oblRef;
        }
      }
    }
  }
  // Also add template files from pack folders
  for (const folder of ["01_Policies","02_Procedures","03_SOPs"]) {
    const fp = path.join(packDir, folder);
    if (!fs.existsSync(fp)) continue;
    for (const file of fs.readdirSync(fp)) {
      const ext = path.extname(file).toLowerCase();
      if (['.docx','.pdf','.xlsx'].includes(ext)) {
        const exists = rows.some(r => r.Title.includes(file.replace(ext,'')));
        if (!exists) {
          const type = folder.includes('Policies') ? 'Policy' : folder.includes('Procedures') ? 'Procedure' : 'SOP';
          rows.push({
            PackID: code,
            DocumentID: `${code}-${type.toUpperCase().substring(0,3)}-${rows.length+1}`,
            Title: file.replace(ext,'').replace(/_/g,' '),
            Type: type, Owner: code, CrossOwners: "",
            Approver: DEFAULT_APPROVERS[code] || "Dept Head", Version: "1.0",
            EvidenceLinkOrPath: path.join(fp, file), Status: "Draft", CoveragePercent: 25,
            MappedObligations: "", MatchMethod: "None", MatchConfidence: "",
            LastUpdated: "", Confidentiality: "Internal", FrameworkTags: "",
            Notes: "Template from pack",
          });
        }
      }
    }
  }
  return rows;
}

// ════════════════════════════════════════════════════════════
// Obligations Register Reader
// ════════════════════════════════════════════════════════════
interface Obligation {
  id: string; regulator: string; department: string; text: string;
  controlTheme: string; frameworkMap: string;
}

function readObligationsRegister(): Obligation[] {
  const oblFile = path.join(PACK_DIR, "Master_Obligations_Register_Template.xlsx");
  if (!fs.existsSync(oblFile)) return [];
  const wb = XLSX.readFile(oblFile);
  const ws = wb.Sheets["Obligations_Register"];
  if (!ws) return [];
  return (XLSX.utils.sheet_to_json(ws) as any[]).map(r => ({
    id: r['ObligationID'] || "", regulator: r['Regulator'] || "",
    department: r['DepartmentPrimary'] || "", text: r['ObligationText_Short'] || "",
    controlTheme: r['ControlTheme'] || "", frameworkMap: r['FrameworkMap'] || "",
  }));
}

// ════════════════════════════════════════════════════════════
// 3-Pass Matching Engine
// ════════════════════════════════════════════════════════════
function matchEvidence(allRows: MasterRow[], evidenceFiles: EvidenceFile[]) {
  let pass1 = 0, pass2 = 0, pass3 = 0;

  for (const row of allRows) {
    if (row.EvidenceLinkOrPath) continue;

    // Pass 1: Exact ID match
    const idMatch = evidenceFiles.find(f =>
      row.DocumentID && f.name.toUpperCase().includes(row.DocumentID.toUpperCase()));
    if (idMatch) {
      row.EvidenceLinkOrPath = idMatch.path; row.LastUpdated = idMatch.modDate;
      row.MatchMethod = "ExactID"; row.MatchConfidence = "Confirmed";
      pass1++;
      continue;
    }

    // Pass 2: Exact title match (case-insensitive)
    const titleLower = row.Title.toLowerCase().trim();
    const titleMatch = evidenceFiles.find(f => {
      const fname = f.nameLower.replace(/\.(pdf|docx|xlsx|doc)$/,'').replace(/_/g,' ').trim();
      return fname === titleLower || fname.includes(titleLower) || titleLower.includes(fname);
    });
    if (titleMatch) {
      row.EvidenceLinkOrPath = titleMatch.path; row.LastUpdated = titleMatch.modDate;
      row.MatchMethod = "ExactTitle"; row.MatchConfidence = "Confirmed";
      pass2++;
      continue;
    }

    // Pass 3: Fuzzy match (Jaccard > 0.3)
    const titleTokens = tokenize(row.Title);
    let bestMatch: EvidenceFile | null = null;
    let bestScore = 0;
    for (const f of evidenceFiles) {
      const score = jaccardIndex(titleTokens, f.tokens);
      if (score > bestScore && score > 0.3) {
        bestScore = score; bestMatch = f;
      }
    }
    if (bestMatch) {
      row.EvidenceLinkOrPath = bestMatch.path; row.LastUpdated = bestMatch.modDate;
      row.MatchMethod = "Fuzzy"; row.MatchConfidence = "Needs Human Confirm";
      pass3++;
    }
  }

  return { pass1, pass2, pass3 };
}

// ════════════════════════════════════════════════════════════
// Duplicate / Conflict Detection
// ════════════════════════════════════════════════════════════
interface Conflict {
  Title: string; DocumentIDs: string; Departments: string; Versions: string; Reason: string;
}

function detectConflicts(rows: MasterRow[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const byTitle: Record<string, MasterRow[]> = {};

  for (const r of rows) {
    const key = r.Title.toLowerCase().trim();
    if (!byTitle[key]) byTitle[key] = [];
    byTitle[key].push(r);
  }

  for (const [title, group] of Object.entries(byTitle)) {
    if (group.length > 1) {
      const depts = [...new Set(group.map(g => g.PackID))];
      if (depts.length > 1) {
        conflicts.push({
          Title: group[0].Title,
          DocumentIDs: group.map(g => g.DocumentID).join("; "),
          Departments: depts.join("; "),
          Versions: group.map(g => g.Version).join("; "),
          Reason: "Same title across multiple departments",
        });
      } else {
        conflicts.push({
          Title: group[0].Title,
          DocumentIDs: group.map(g => g.DocumentID).join("; "),
          Departments: depts.join("; "),
          Versions: group.map(g => g.Version).join("; "),
          Reason: "Duplicate title within department",
        });
      }
    }
  }
  return conflicts;
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
function main() {
  console.log("🏗️  Building Master Index v2 — All Packs\n");
  console.log("=" .repeat(60));

  // Ensure output dirs
  for (const d of [OUT_INDEX, OUT_MAP]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }

  // 1. Scan evidence
  console.log("\n📂 Scanning Nextcloud evidence...");
  const evidenceFiles = scanEvidence();
  console.log(`   Found ${evidenceFiles.length} evidence files`);

  // 2. Read obligations
  console.log("\n📋 Reading Obligations Register...");
  const obligations = readObligationsRegister();
  console.log(`   Found ${obligations.length} obligations`);

  // 3. Read all packs
  const allRows: MasterRow[] = [];
  for (const pack of PACKS) {
    const packDir = path.join(PACK_DIR, pack.packFolder);
    if (!fs.existsSync(packDir)) { console.log(`⚠️ Missing: ${pack.packFolder}`); continue; }
    console.log(`📦 Reading ${pack.name} (${pack.code})`);
    const rows = pack.format === 'flat'
      ? readFlatPack(packDir, pack.code)
      : readStructuredPack(packDir, pack.code);
    console.log(`   → ${rows.length} documents`);
    allRows.push(...rows);
  }
  console.log(`\n📊 Total required documents: ${allRows.length}`);

  // 4. 3-Pass Evidence Matching
  console.log("\n🔍 3-Pass Evidence Matching...");
  const { pass1, pass2, pass3 } = matchEvidence(allRows, evidenceFiles);
  console.log(`   Pass 1 (Exact ID):    ${pass1} matches`);
  console.log(`   Pass 2 (Exact Title): ${pass2} matches`);
  console.log(`   Pass 3 (Fuzzy):       ${pass3} matches (flagged for review)`);
  console.log(`   Total matched:        ${pass1 + pass2 + pass3} / ${allRows.length}`);

  // 5. Compute Status + Coverage + Map Obligations
  console.log("\n📐 Computing Status, Coverage & Obligation Mapping...");
  for (const row of allRows) {
    row.Status = computeStatus(row.EvidenceLinkOrPath, row.Status);
    const isMapped = !!row.MappedObligations;
    row.CoveragePercent = computeCoverage(row.Status, !!row.EvidenceLinkOrPath, isMapped);

    // Auto-map obligations by department
    if (!row.MappedObligations) {
      const deptObls = obligations.filter(o =>
        o.department.toUpperCase().includes(row.PackID.toUpperCase()));
      if (deptObls.length > 0) row.MappedObligations = deptObls.map(o => o.id).join("; ");
    }
    if (!row.FrameworkTags) {
      const oblFrameworks = obligations.filter(o =>
        row.MappedObligations.includes(o.id));
      if (oblFrameworks.length > 0) row.FrameworkTags = oblFrameworks.map(o => o.frameworkMap).join("; ");
    }
  }

  // 6. Detect conflicts/duplicates
  console.log("\n⚠️ Detecting conflicts & duplicates...");
  const conflicts = detectConflicts(allRows);
  console.log(`   Found ${conflicts.length} conflicts/duplicates`);

  // ─── Compute 4-Metric Coverage ────────────────────────────
  const totalDocs = allRows.length;
  const present = allRows.filter(r => !!r.EvidenceLinkOrPath).length;
  const approved = allRows.filter(r => r.Status === "Approved" || r.Status === "Implemented").length;
  const mapped = allRows.filter(r => !!r.MappedObligations).length;
  const fresh = allRows.filter(r => {
    if (!r.LastUpdated) return false;
    const d = new Date(r.LastUpdated);
    const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return d >= oneYearAgo;
  }).length;

  const inventoryCov = totalDocs > 0 ? Math.round((present / totalDocs) * 100) : 0;
  const approvalCov  = totalDocs > 0 ? Math.round((approved / totalDocs) * 100) : 0;
  const mappingCov   = totalDocs > 0 ? Math.round((mapped / totalDocs) * 100) : 0;
  const freshnessCov = totalDocs > 0 ? Math.round((fresh / totalDocs) * 100) : 0;

  // ─── Generate XLSX ────────────────────────────────────────
  console.log("\n📊 Generating Master_Index_All_Packs.xlsx...");
  const wb = XLSX.utils.book_new();

  // Sheet 1: Master_Index
  const wsIndex = XLSX.utils.json_to_sheet(allRows.map(r => ({
    PackID: r.PackID, DocumentID: r.DocumentID, Title: r.Title, Type: r.Type,
    Owner: r.Owner, CrossOwners: r.CrossOwners, Approver: r.Approver,
    Version: r.Version, EvidenceLinkOrPath: r.EvidenceLinkOrPath,
    Status: r.Status, CoveragePercent: r.CoveragePercent,
    MappedObligations: r.MappedObligations,
    MatchMethod: r.MatchMethod, MatchConfidence: r.MatchConfidence,
    LastUpdated: r.LastUpdated, Confidentiality: r.Confidentiality,
    FrameworkTags: r.FrameworkTags, Notes: r.Notes,
  })));
  wsIndex['!cols'] = [
    {wch:10},{wch:18},{wch:45},{wch:12},{wch:12},{wch:15},{wch:12},
    {wch:8},{wch:55},{wch:14},{wch:10},{wch:25},{wch:12},{wch:18},
    {wch:12},{wch:14},{wch:20},{wch:30},
  ];
  XLSX.utils.book_append_sheet(wb, wsIndex, "Master_Index");

  // Sheet 2: Summary (Dashboard)
  const deptGroups: Record<string, MasterRow[]> = {};
  for (const r of allRows) { if (!deptGroups[r.PackID]) deptGroups[r.PackID] = []; deptGroups[r.PackID].push(r); }

  const summaryData: any[] = [];
  for (const [dept, rows] of Object.entries(deptGroups)) {
    const t = rows.length;
    const ev = rows.filter(r => !!r.EvidenceLinkOrPath).length;
    const ap = rows.filter(r => r.Status === "Approved" || r.Status === "Implemented").length;
    const mp = rows.filter(r => !!r.MappedObligations).length;
    const fr = rows.filter(r => {
      if (!r.LastUpdated) return false;
      const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear()-1);
      return new Date(r.LastUpdated) >= oneYearAgo;
    }).length;
    summaryData.push({
      Department: dept, Name: PACKS.find(p => p.code === dept)?.name || dept,
      "Total Docs": t,
      "Inventory %": Math.round((ev/t)*100),
      "Approval %": Math.round((ap/t)*100),
      "Mapping %": Math.round((mp/t)*100),
      "Freshness %": Math.round((fr/t)*100),
      "Avg Coverage %": Math.round(rows.reduce((s,r)=>s+r.CoveragePercent,0)/t),
      "Not Started": rows.filter(r=>r.Status==="Not Started").length,
      Draft: rows.filter(r=>r.Status==="Draft").length,
      "In Review": rows.filter(r=>r.Status==="In Review").length,
      Approved: ap,
      "Needs Update": rows.filter(r=>r.Status==="Needs Update").length,
    });
  }
  summaryData.push({
    Department: "TOTAL", Name: "All Departments",
    "Total Docs": totalDocs,
    "Inventory %": inventoryCov, "Approval %": approvalCov,
    "Mapping %": mappingCov, "Freshness %": freshnessCov,
    "Avg Coverage %": totalDocs > 0 ? Math.round(allRows.reduce((s,r)=>s+r.CoveragePercent,0)/totalDocs) : 0,
    "Not Started": allRows.filter(r=>r.Status==="Not Started").length,
    Draft: allRows.filter(r=>r.Status==="Draft").length,
    "In Review": allRows.filter(r=>r.Status==="In Review").length,
    Approved: approved,
    "Needs Update": allRows.filter(r=>r.Status==="Needs Update").length,
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");

  // Sheet 3: Missing_Docs (Status = Not Started, no evidence)
  const missing = allRows
    .filter(r => !r.EvidenceLinkOrPath && r.Status === "Not Started")
    .map(r => ({ PackID: r.PackID, DocumentID: r.DocumentID, Title: r.Title, Type: r.Type, Approver: r.Approver, Priority: "High" }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(missing), "Missing_Docs");

  // Sheet 4: Needs_Review (Draft/Needs Update OR LastUpdated > 1 year)
  const needsReview = allRows
    .filter(r => r.Status === "Needs Update" || r.Status === "Draft" || (r.LastUpdated && new Date(r.LastUpdated) < new Date(Date.now() - 365*24*60*60*1000)))
    .map(r => ({ PackID: r.PackID, DocumentID: r.DocumentID, Title: r.Title, Status: r.Status, LastUpdated: r.LastUpdated, Reason: r.Status === "Needs Update" ? "Flagged" : r.Status === "Draft" ? "Still Draft" : "Expired" }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(needsReview), "Needs_Review");

  // Sheet 5: Unmapped_Obligations
  const unmapped = allRows
    .filter(r => !r.MappedObligations)
    .map(r => ({ PackID: r.PackID, DocumentID: r.DocumentID, Title: r.Title, Type: r.Type, Status: r.Status }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(unmapped), "Unmapped_Obligations");

  // Sheet 6: Conflicts_Duplicates
  if (conflicts.length > 0) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(conflicts), "Conflicts_Duplicates");
  } else {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{Result: "No conflicts or duplicates detected"}]), "Conflicts_Duplicates");
  }

  // Sheet 7: ANTIGRAVITY_RUNBOOK
  const runbook = [
    { Step: "1", Action: "GitHub is canonical for code/templates/config. Nextcloud is canonical for approved evidence docs." },
    { Step: "2", Action: `System folder: ${SYS_DIR}` },
    { Step: "3", Action: "00_INTAKE = raw uploads, 01_NORMALIZED = extracted metadata, 02_INDEX = this file + registers" },
    { Step: "4", Action: "03_MAPPINGS = framework maps, 04_EVIDENCE = approvals/minutes, 05_OUTPUT_DRAFTS, 06_OUTPUT_FINAL" },
    { Step: "5", Action: "Compute Status + Coverage% deterministically first. AI only for unknown/missing metadata." },
    { Step: "6", Action: "3-pass matching: Exact ID → Exact Title → Fuzzy (flagged 'Needs Human Confirm')." },
    { Step: "7", Action: "Coverage: Inventory% + Approval% + Mapping% + Freshness% (4 metrics)." },
    { Step: "8", Action: "Status values: Not Started | Draft | In Review | Approved | Implemented | Needs Update | Retired" },
    { Step: "9", Action: "Coverage scoring: 100=Implemented+Evidence, 75=Approved+Partial, 50=Draft+Partial, 25=Planned, 0=None" },
    { Step: "10", Action: "Re-run: npx tsx scripts/build_master_index.ts — any fix must be a single PR with green build." },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(runbook), "ANTIGRAVITY_RUNBOOK");

  // Write
  const outPath = path.join(OUT_INDEX, "Master_Index_All_Packs.xlsx");
  XLSX.writeFile(wb, outPath);
  console.log(`\n✅ Master Index generated: ${outPath}`);

  // ─── Console Summary ──────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("📊 READINESS DASHBOARD — 4-METRIC VIEW");
  console.log("═".repeat(60));
  console.log(`  Inventory Coverage:  ${inventoryCov}%  (${present}/${totalDocs} docs with evidence)`);
  console.log(`  Approval Coverage:   ${approvalCov}%  (${approved}/${totalDocs} approved/implemented)`);
  console.log(`  Mapping Coverage:    ${mappingCov}%  (${mapped}/${totalDocs} mapped to obligations)`);
  console.log(`  Freshness Coverage:  ${freshnessCov}%  (${fresh}/${totalDocs} within review cycle)`);
  console.log("═".repeat(60));
  console.log(`\n  📄 Missing Docs:           ${missing.length}`);
  console.log(`  🔄 Needs Review / Expired: ${needsReview.length}`);
  console.log(`  ❌ Unmapped Obligations:   ${unmapped.length}`);
  console.log(`  ⚠️ Conflicts/Duplicates:   ${conflicts.length}`);
  console.log("═".repeat(60));

  for (const row of summaryData) {
    const bar = "█".repeat(Math.floor(row["Avg Coverage %"]/5)) + "░".repeat(20 - Math.floor(row["Avg Coverage %"]/5));
    console.log(`  ${String(row.Department).padEnd(12)} ${bar} ${row["Avg Coverage %"]}%`);
  }
  console.log("═".repeat(60));

  // Save JSON for dashboard integration
  const jsonPath = path.join(
    "c:\\Users\\YasserElshishiny\\Dropbox\\Projects\\Enterprise Policy factory\\policy-factory\\data",
    "master_index.json"
  );
  fs.writeFileSync(jsonPath, JSON.stringify({
    generated: new Date().toISOString(),
    systemFolder: SYS_DIR,
    metrics: { inventoryCov, approvalCov, mappingCov, freshnessCov },
    totalDocuments: totalDocs,
    totalEvidence: present,
    totalApproved: approved,
    totalMapped: mapped,
    missing: missing.length,
    needsReview: needsReview.length,
    unmappedObligations: unmapped.length,
    conflicts: conflicts.length,
    departments: summaryData.filter(s => s.Department !== "TOTAL"),
    documents: allRows,
  }, null, 2));
  console.log(`📄 JSON for dashboard: ${jsonPath}`);
}

main();
