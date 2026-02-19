/**
 * import_shari_packs.ts
 * ──────────────────────────────────────────────────
 * Creates SHARI brand folder and imports BOD + COMMERCIAL packs.
 * Auto-registers all docs into Master Index with:
 *   Entity=Shari, Status=DRAFT (Template), Coverage%=0
 *   Obligation mapping placeholders per document
 *
 * Shari-only constraint: No TRU/Group references.
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
const SHARI_DIR = path.join(SYS_DIR, "SHARI");

// Status tiers
const STATUS_MODEL = ["DRAFT","IN REVIEW","APPROVED","IMPLEMENTED","MONITORED"];

interface PackModule {
  code: string;
  name: string;
  packFolder: string;  // subfolder inside Departmental_pack_cross_ownership_folder
  label: string;       // "Module A" or "Module B"
}

const MODULES: PackModule[] = [
  { code: "COM", name: "Commercial", packFolder: "COMMERCIAL_pack_cross_ownership", label: "Module A" },
  { code: "BOD", name: "Board of Directors", packFolder: "BOD_pack_cross_ownership", label: "Module B" },
];

// Obligation mapping themes per document type keyword
const OBLIGATION_THEMES: Record<string, string[]> = {
  // FRA Microfinance (primary for all)
  "default": ["FRA Microfinance Regulations (Primary)"],
  // AML/CFT keywords
  "kyc": ["AML/CFT - KYC Due Diligence"], "sanction": ["AML/CFT - Sanctions Screening"],
  "aml": ["AML/CFT - Reporting & Monitoring"], "suspicious": ["AML/CFT - STR Reporting"],
  "onboarding": ["AML/CFT - Customer Due Diligence"],
  // Labor/Social/Tax (HR/Finance/Ops interfaces)
  "employee": ["Labor Law", "Social Insurance"], "payroll": ["Tax - Income Tax", "Social Insurance"],
  "hiring": ["Labor Law - Employment Contracts"], "termination": ["Labor Law - End of Service"],
  "tax": ["Tax Compliance"], "finance": ["Tax Compliance", "Financial Reporting Standards"],
  "commission": ["Tax - Income Tax", "FRA Microfinance Regulations"],
  "incentive": ["Labor Law - Compensation", "FRA Microfinance Regulations"],
  // IT/InfoSec (only where doc touches systems/data)
  "data": ["ISO 27001 - Information Security", "NIST CSF - Data Protection"],
  "digital": ["ISO 27001 - Information Security", "CIS Controls"],
  "access": ["ISO 27001 - Access Control", "NIST 800-53 - AC"],
  "privacy": ["ISO 27001 - Privacy", "NIST CSF - PR"],
  "crm": ["ISO 27001 - Information Security", "CIS Controls"],
  // Governance
  "charter": ["Corporate Governance Code", "FRA Microfinance Regulations"],
  "committee": ["Corporate Governance Code", "FRA Board Requirements"],
  "conflict": ["Corporate Governance Code - Conflict of Interest", "FRA Related Party Rules"],
  "whistleblowing": ["Corporate Governance Code - Whistleblower Protection"],
  "board": ["Corporate Governance Code", "FRA Board Requirements"],
  "resolution": ["Corporate Governance Code", "FRA Decision Governance"],
  "delegation": ["Corporate Governance Code - Delegation of Authority"],
  // Commercial
  "pricing": ["FRA Microfinance - Pricing Transparency", "Consumer Protection"],
  "complaint": ["FRA Microfinance - Customer Complaints", "Consumer Protection"],
  "product": ["FRA Microfinance - Product Governance"],
  "partner": ["FRA Microfinance - Agent/Broker Governance"],
  "marketing": ["FRA Microfinance - Marketing Rules", "Consumer Protection"],
  "sales": ["FRA Microfinance - Sales Conduct", "Consumer Protection"],
  "customer": ["FRA Microfinance - Customer Protection", "Consumer Protection"],
};

interface MasterRow {
  Entity: string;
  Module: string;
  PackID: string;
  DocumentID: string;
  Title: string;
  Type: string;
  Owner: string;
  CrossOwners: string;
  Approver: string;
  Version: string;
  FilePath: string;
  Status: string;
  CoveragePercent: number;
  ObligationMappingPlaceholders: string;
  MatchMethod: string;
  MatchConfidence: string;
  LastUpdated: string;
  Confidentiality: string;
  FrameworkTags: string;
  Notes: string;
}

// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  📁 Created: ${dir}`);
  }
}

function getDocType(folder: string): string {
  if (folder.includes("Policies")) return "Policy";
  if (folder.includes("Procedures")) return "Procedure";
  if (folder.includes("SOPs")) return "SOP";
  if (folder.includes("Templates") || folder.includes("Registers")) return "Template/Register";
  return "Document";
}

function mapObligations(title: string, code: string): string {
  const titleLower = title.toLowerCase();
  const themes = new Set<string>(OBLIGATION_THEMES["default"]);

  for (const [keyword, oblThemes] of Object.entries(OBLIGATION_THEMES)) {
    if (keyword === "default") continue;
    if (titleLower.includes(keyword)) {
      oblThemes.forEach(t => themes.add(t));
    }
  }

  // Always add FRA for Commercial/BOD
  if (code === "COM") themes.add("FRA Microfinance - Commercial Operations");
  if (code === "BOD") themes.add("FRA Microfinance - Board Governance");

  return [...themes].join("; ");
}

function getCrossOwners(title: string, code: string): string {
  const t = title.toLowerCase();
  const cross: string[] = [];
  if (code !== "IT" && (t.includes("it") || t.includes("digital") || t.includes("data") || t.includes("crm"))) cross.push("IT");
  if (code !== "HR" && (t.includes("employee") || t.includes("training") || t.includes("incentive"))) cross.push("HR");
  if (code !== "AML" && (t.includes("kyc") || t.includes("aml") || t.includes("sanction"))) cross.push("AML");
  if (code !== "RISK" && (t.includes("risk"))) cross.push("RISK");
  if (code !== "AUDIT" && (t.includes("audit"))) cross.push("AUDIT");
  if (code !== "FINANCE" && (t.includes("finance") || t.includes("pricing") || t.includes("commission") || t.includes("tax"))) cross.push("FINANCE");
  if (code !== "COM" && (t.includes("commercial") || t.includes("sales") || t.includes("customer"))) cross.push("COM");
  return cross.join(", ");
}

// ════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════
function main() {
  console.log("🏢 Shari Brand Pack Import\n");
  console.log("═".repeat(60));

  // 1. Create SHARI folder structure
  console.log("\n📁 Creating SHARI brand folder...");
  ensureDir(SHARI_DIR);

  const allRows: MasterRow[] = [];

  for (const mod of MODULES) {
    console.log(`\n📦 Importing ${mod.label}: ${mod.name} (${mod.code})`);
    console.log("─".repeat(40));

    // Resolve source — handle nested subfolder from ZIP extraction
    let srcDir = path.join(PACK_DIR, mod.packFolder);
    const nested = path.join(srcDir, mod.packFolder);
    if (fs.existsSync(nested)) srcDir = nested;

    if (!fs.existsSync(srcDir)) {
      console.log(`  ⚠️ Source not found: ${srcDir}`);
      continue;
    }

    // Create module folder in SHARI
    const destDir = path.join(SHARI_DIR, mod.code);
    ensureDir(destDir);

    // Copy folder structure
    const docFolders = ["01_Policies", "02_Procedures", "03_SOPs",
      "04_Templates_Registers", "04_Templates", "05_Mapping", "05_Mappings", "99_Notes", "99_Appendix"];

    let docCount = 0;
    for (const folder of docFolders) {
      const srcFolder = path.join(srcDir, folder);
      if (!fs.existsSync(srcFolder)) continue;

      const destFolder = path.join(destDir, folder);
      ensureDir(destFolder);

      for (const file of fs.readdirSync(srcFolder)) {
        const srcFile = path.join(srcFolder, file);
        const destFile = path.join(destFolder, file);

        if (fs.statSync(srcFile).isFile()) {
          fs.copyFileSync(srcFile, destFile);
          docCount++;

          const ext = path.extname(file).toLowerCase();
          if (['.docx', '.pdf', '.xlsx', '.doc'].includes(ext)) {
            const baseName = file.replace(ext, '');
            // Extract doc ID from filename (e.g., "BOD-POL-01 - Board Charter Policy")
            const idMatch = baseName.match(/^([A-Z]+-[A-Z]+-\d+)/);
            const docId = idMatch ? idMatch[1] : `${mod.code}-DOC-${allRows.length + 1}`;
            const titleAfterDash = baseName.replace(/^[A-Z]+-[A-Z]+-\d+\s*-\s*/, '').trim();
            const title = titleAfterDash || baseName;

            const row: MasterRow = {
              Entity: "Shari",
              Module: mod.label,
              PackID: mod.code,
              DocumentID: docId,
              Title: title,
              Type: getDocType(folder),
              Owner: mod.code,
              CrossOwners: getCrossOwners(title, mod.code),
              Approver: mod.code === "BOD" ? "Chairman" : "CEO",
              Version: "1.0",
              FilePath: destFile,
              Status: "DRAFT",
              CoveragePercent: 0,
              ObligationMappingPlaceholders: mapObligations(title, mod.code),
              MatchMethod: "PackImport",
              MatchConfidence: "Template",
              LastUpdated: new Date().toISOString().split('T')[0],
              Confidentiality: mod.code === "BOD" ? "Confidential" : "Internal",
              FrameworkTags: "",
              Notes: `DRAFT (Template) — imported from ${mod.packFolder}`,
            };
            allRows.push(row);
          }
        }
      }
    }

    // Copy INDEX.xlsx and README
    const indexSrc = path.join(srcDir, "05_Mapping", `${mod.packFolder}_INDEX.xlsx`);
    if (fs.existsSync(indexSrc)) {
      fs.copyFileSync(indexSrc, path.join(destDir, `${mod.code}_INDEX.xlsx`));
      console.log(`  📋 Copied INDEX.xlsx`);
    }
    const readmeSrc = path.join(srcDir, "99_Notes", "README.md");
    if (!fs.existsSync(readmeSrc)) {
      const altReadme = path.join(srcDir, "99_Appendix", "README.md");
      if (fs.existsSync(altReadme)) {
        fs.copyFileSync(altReadme, path.join(destDir, "README.md"));
      }
    } else {
      fs.copyFileSync(readmeSrc, path.join(destDir, "README.md"));
    }

    console.log(`  ✅ ${docCount} files copied → ${destDir}`);
    console.log(`  📊 ${allRows.filter(r => r.PackID === mod.code).length} documents registered`);
  }

  // 2. Generate Shari Master Index supplement
  console.log("\n📊 Generating Shari_Master_Index_Supplement.xlsx...");
  const wb = XLSX.utils.book_new();

  // Sheet 1: Shari_Documents
  const wsData = XLSX.utils.json_to_sheet(allRows.map(r => ({
    Entity: r.Entity, Module: r.Module, PackID: r.PackID,
    DocumentID: r.DocumentID, Title: r.Title, Type: r.Type,
    Owner: r.Owner, CrossOwners: r.CrossOwners, Approver: r.Approver,
    Version: r.Version, FilePath: r.FilePath,
    Status: r.Status, CoveragePercent: r.CoveragePercent,
    ObligationMappingPlaceholders: r.ObligationMappingPlaceholders,
    Confidentiality: r.Confidentiality, Notes: r.Notes,
  })));
  wsData['!cols'] = [
    {wch:8},{wch:10},{wch:6},{wch:14},{wch:50},{wch:16},{wch:8},{wch:15},{wch:10},
    {wch:6},{wch:55},{wch:10},{wch:8},{wch:60},{wch:14},{wch:30},
  ];
  XLSX.utils.book_append_sheet(wb, wsData, "Shari_Documents");

  // Sheet 2: Summary
  const summary = MODULES.map(mod => {
    const modRows = allRows.filter(r => r.PackID === mod.code);
    return {
      Module: mod.label, Department: mod.code, Name: mod.name,
      Policies: modRows.filter(r => r.Type === "Policy").length,
      Procedures: modRows.filter(r => r.Type === "Procedure").length,
      SOPs: modRows.filter(r => r.Type === "SOP").length,
      "Templates/Registers": modRows.filter(r => r.Type === "Template/Register").length,
      Total: modRows.length,
      "All Status": "DRAFT (Template)",
      "Coverage %": "0% (no evidence linked)",
    };
  });
  summary.push({
    Module: "TOTAL", Department: "ALL", Name: "Shari Entity",
    Policies: allRows.filter(r => r.Type === "Policy").length,
    Procedures: allRows.filter(r => r.Type === "Procedure").length,
    SOPs: allRows.filter(r => r.Type === "SOP").length,
    "Templates/Registers": allRows.filter(r => r.Type === "Template/Register").length,
    Total: allRows.length,
    "All Status": "DRAFT (Template)",
    "Coverage %": "0% (no evidence linked)",
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Summary");

  // Sheet 3: Obligation_Map_Placeholders
  const oblMap = allRows.map(r => ({
    DocumentID: r.DocumentID, Title: r.Title, Department: r.PackID,
    "FRA Microfinance": r.ObligationMappingPlaceholders.includes("FRA") ? "✓ Mapped" : "",
    "AML/CFT": r.ObligationMappingPlaceholders.includes("AML") ? "✓ Mapped" : "",
    "Labor/Social/Tax": r.ObligationMappingPlaceholders.includes("Labor") || r.ObligationMappingPlaceholders.includes("Tax") ? "✓ Mapped" : "",
    "IT/InfoSec (ISO/NIST/CIS)": r.ObligationMappingPlaceholders.includes("ISO") || r.ObligationMappingPlaceholders.includes("NIST") || r.ObligationMappingPlaceholders.includes("CIS") ? "✓ Mapped" : "",
    "Full Obligations": r.ObligationMappingPlaceholders,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(oblMap), "Obligation_Map_Placeholders");

  // Sheet 4: Status_Model
  const statusSheet = STATUS_MODEL.map((s, i) => ({
    Tier: i + 1, Status: s,
    Meaning: ["Template exists, not validated",
      "Mapped obligations + reviewers assigned",
      "Signed approval + published version",
      "Evidence artifacts exist + audit trail",
      "KPI/KRI reporting running"][i],
    "Coverage % Range": ["0%", "25%", "50-75%", "75-100%", "100%"][i],
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statusSheet), "Status_Model");

  const outPath = path.join(SYS_DIR, "02_INDEX", "Shari_Master_Index_Supplement.xlsx");
  XLSX.writeFile(wb, outPath);
  console.log(`\n✅ Shari Index: ${outPath}`);

  // 3. Save JSON for dashboard
  const jsonPath = path.join(
    "c:\\Users\\YasserElshishiny\\Dropbox\\Projects\\Enterprise Policy factory\\policy-factory\\data",
    "shari_packs.json"
  );
  fs.writeFileSync(jsonPath, JSON.stringify({
    entity: "Shari",
    generated: new Date().toISOString(),
    modules: MODULES.map(m => ({ ...m, docCount: allRows.filter(r => r.PackID === m.code).length })),
    totalDocuments: allRows.length,
    statusModel: STATUS_MODEL,
    documents: allRows,
  }, null, 2));
  console.log(`📄 JSON: ${jsonPath}`);

  // Console summary
  console.log("\n" + "═".repeat(60));
  console.log("📊 SHARI ENTITY — IMPORT SUMMARY");
  console.log("═".repeat(60));
  for (const s of summary) {
    console.log(`  ${String(s.Module).padEnd(10)} ${String(s.Department).padEnd(6)} | ${s.Total} docs | Policies: ${s.Policies} | Procedures: ${s.Procedures} | SOPs: ${s.SOPs} | Templates: ${s["Templates/Registers"]}`);
  }
  console.log("═".repeat(60));
  console.log(`  Entity: Shari (no TRU/Group references)`);
  console.log(`  Status: All DRAFT (Template) | Coverage: 0%`);
  console.log(`  Folder: ${SHARI_DIR}`);
  console.log("═".repeat(60));
}

main();
