
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

// --- CONFIGURATION ---
const BASE_DIR = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures";
const HR_PACK_DIR = path.join(BASE_DIR, "HR_pack_cross_ownership");
const BASELINE_DIR = path.join(BASE_DIR, "_SYSTEM_BASELINE");
const HR_BASELINE_DIR = path.join(BASELINE_DIR, "HR");
const OBLIGATIONS_DIR = path.join(BASELINE_DIR, "Legal_Obligations");
const EVIDENCE_DIR = path.join(BASELINE_DIR, "Evidence");

// Files to copy from HR Pack to Baseline/HR
const TEMPLATES = [
  "HR_Taxonomy.json",
  "HR_Required_Documents_Matrix.xlsx",
  "HR_Policy_Register_Template.xlsx",
  "HR_Obligations_Mapping_Template.xlsx"
];

// Tokenizer for fuzzy matching
function tokenize(str: string): Set<string> {
  return new Set(str.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 2));
}

function jaccardIndex(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// --- MAIN ---
async function main() {
  console.log("🚀 Starting HR Readiness Scan...");

  // 1. Setup Folders
  const dirs = [BASELINE_DIR, HR_BASELINE_DIR, OBLIGATIONS_DIR, EVIDENCE_DIR];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      console.log(`📁 Creating directory: ${d}`);
      fs.mkdirSync(d, { recursive: true });
    }
  }

  // 2. Copy Templates
  console.log("📋 Copying templates to Baseline...");
  for (const t of TEMPLATES) {
    const src = path.join(HR_PACK_DIR, t);
    const dest = path.join(HR_BASELINE_DIR, t);
    if (fs.existsSync(src)) {
        // Only copy if destination doesn't exist to avoid overwriting user data in subsequent runs
        if (!fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            console.log(`✅ Copied ${t}`);
        } else {
             console.log(`ℹ️  Skipped ${t} (already exists in baseline)`);
        }
    } else {
      console.error(`❌ Template not found: ${src}`);
    }
  }

  // 3. Load Taxonomy
  const taxonomyPath = path.join(HR_BASELINE_DIR, "HR_Taxonomy.json");
  if (!fs.existsSync(taxonomyPath)) {
      console.error("❌ Taxonomy file missing. Aborting.");
      return;
  }
  
  const taxonomyRaw = fs.readFileSync(taxonomyPath, 'utf8');
  const taxonomy = JSON.parse(taxonomyRaw);
  const catalog = [
      ...(taxonomy.catalog.POLICY || []),
      ...(taxonomy.catalog.PROCEDURE || []),
      ...(taxonomy.catalog.SOP || []),
      ...(taxonomy.catalog.REGISTER || []),
      ...(taxonomy.catalog.FORM || [])
  ];

  console.log(`📚 Loaded ${catalog.length} taxonomy items.`);

  // 4. Scan for Files
  console.log("🔍 Scanning Policies & Procedures...");
  const foundFiles: { path: string; name: string; tokens: Set<string> }[] = [];
  
  function scanRecursively(dir: string) {
    if (dir.includes("_SYSTEM_BASELINE") || dir.includes("_CANONICAL_POLICY_FACTORY")) return; // Skip baseline and canonical
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            scanRecursively(fullPath);
        } else if (entry.isFile() && !entry.name.startsWith("~$")) { // Ignore temp lock files
            foundFiles.push({
                path: fullPath,
                name: entry.name,
                tokens: tokenize(entry.name)
            });
        }
    }
  }
  
  try {
    scanRecursively(BASE_DIR);
  } catch (e) {
      console.error("Error scanning directory:", e);
  }
  console.log(`📂 Found ${foundFiles.length} files in source.`);
  if (foundFiles.length > 0) {
      console.log("Sample files:", foundFiles.slice(0, 5).map(f => f.name));
  }
  if (catalog.length > 0) {
      console.log("Sample taxonomy:", catalog.slice(0, 3).map((t: any) => t.title));
  }

  // 5. Match & Score
  console.log("🔗 Matching files to taxonomy...");
  const results = catalog.map((item: any) => {
      const itemTokens = tokenize(item.title);
      let bestMatch: any = null;
      let maxScore = 0;

      // Logic:
      // 1. ID Match: Filename contains "HR-POL-001"
      // 2. Exact Title Match
      // 3. Fuzzy Title Match

      for (const file of foundFiles) {
          // Check ID
          if (file.name.toUpperCase().includes(item.id)) {
              bestMatch = file;
              maxScore = 1.0;
              break; // Hard ID match wins
          }

          // Fuzzy Score
          const score = jaccardIndex(itemTokens, file.tokens);
          if (score > maxScore && score > 0.3) { // Threshold
              maxScore = score;
              bestMatch = file;
          }
      }

      return {
          ...item,
          status: maxScore === 1.0 ? "Existing" : (maxScore > 0.5 ? "Draft" : "Missing"), // Simple heuristic
          matchScore: maxScore,
          matchedFile: bestMatch ? bestMatch.path : null,
          evidenceStatus: bestMatch ? "File Found" : "Missing"
      };
  });

  // 6. Generate Report
  console.log("📊 Generating Report...");
  
  // Identify Unmapped Files
  const matchedFilePaths = new Set(results.map((r: any) => r.matchedFile).filter((p: any) => p));
  const unmappedFiles = foundFiles.filter(f => !matchedFilePaths.has(f.path));

  // Prepare Excel Data (Main Sheet)
  const reportData = results.map((r: any) => ({
      DocID: r.id,
      Type: r.id.split('-')[1], 
      Title: r.title,
      PrimaryOwner: r.owner_primary,
      SupportingOwners: r.owner_supporting,
      Domain: r.domain,
      Status: r.status, 
      CoveragePercent: r.status === "Existing" ? 100 : (r.status === "Draft" ? 50 : 0),
      EvidenceLinkOrPath: r.matchedFile || "",
      Notes: r.status === "Missing" ? "No match found. Please check 'Unmapped Files' tab." : 
             (r.matchScore > 0 && r.matchScore < 1 ? `Potential fuzzy match (${(r.matchScore*100).toFixed(0)}%)` : "")
  }));

  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Readiness Matrix
  const ws = XLSX.utils.json_to_sheet(reportData);
  const colWidths = [
      { wch: 15 }, { wch: 10 }, { wch: 50 }, { wch: 15 }, { wch: 20 }, 
      { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 80 }, { wch: 40 }
  ];
  ws['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, "Readiness Matrix");

  // Sheet 2: Unmapped Files
  const unmappedData = unmappedFiles.map(f => ({
      FileName: f.name,
      Path: f.path,
      SuggestedAction: "Manually map to a DocID on the 'Readiness Matrix' sheet"
  }));
  const wsUnmapped = XLSX.utils.json_to_sheet(unmappedData);
  wsUnmapped['!cols'] = [{ wch: 50 }, { wch: 100 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsUnmapped, "Unmapped Files");
  
  const reportPath = path.join(HR_BASELINE_DIR, "HR_Readiness_Report_Generated.xlsx");
  XLSX.writeFile(wb, reportPath);

  // Stats
  const found = results.filter((r: any) => r.status !== "Missing").length;
  const total = results.length;
  const coverage = Math.round((found / total) * 100);
  const unmappedCount = unmappedFiles.length;

  console.log(`
  ==========================================
  ✅ SCAN COMPLETE
  ==========================================
  Items in Taxonomy: ${total}
  Items Matched:     ${found}
  Unmapped Files:    ${unmappedCount}
  Coverage:          ${coverage}%
  
  Report saved to:   ${reportPath}
  ==========================================
  `);

  fs.writeFileSync("hr_stats.json", JSON.stringify({ total, found, coverage, unmappedCount, reportPath }, null, 2));

}

main().catch(console.error);
