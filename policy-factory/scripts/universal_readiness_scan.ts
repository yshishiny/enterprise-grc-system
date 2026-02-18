
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

// --- CONFIGURATION ---
const BASE_DIR = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures";
const BASELINE_DIR = path.join(BASE_DIR, "_SYSTEM_BASELINE");

// Department Configurations
const DEPTS = [
  {
    code: "AUD",
    name: "Internal Audit",
    sourcePack: path.join(BASE_DIR, "AUD_pack_cross_ownership"),
    baselinePath: path.join(BASELINE_DIR, "AUD"),
    templates: [
      "AUD_Taxonomy.json",
      "AUD_Required_Documents_Matrix.xlsx",
      "AUD_Policy_Register_Template.xlsx",
      "AUD_Obligations_Mapping_Template.xlsx"
    ]
  },
  {
    code: "RISK",
    name: "Risk Management",
    sourcePack: path.join(BASE_DIR, "RISK_pack_cross_ownership"),
    baselinePath: path.join(BASELINE_DIR, "RISK"),
    templates: [
      "RISK_Taxonomy.json",
      "RISK_Required_Documents_Matrix.xlsx",
      "RISK_Policy_Register_Template.xlsx",
      "RISK_Obligations_Mapping_Template.xlsx"
    ]
  },
  {
    code: "HR",
    name: "Human Resources",
    sourcePack: path.join(BASE_DIR, "HR_pack_cross_ownership"),
    baselinePath: path.join(BASELINE_DIR, "HR"),
    templates: [
      "HR_Taxonomy.json",
      "HR_Required_Documents_Matrix.xlsx",
      "HR_Policy_Register_Template.xlsx",
      "HR_Obligations_Mapping_Template.xlsx"
    ]
  }
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
  console.log("🚀 Starting Universal Readiness Scan...");

  // 1. Setup Base Baseline Folders
  const baseDirs = [BASELINE_DIR, path.join(BASELINE_DIR, "Legal_Obligations"), path.join(BASELINE_DIR, "Evidence")];
  for (const d of baseDirs) {
    if (!fs.existsSync(d)) {
      console.log(`📁 Creating directory: ${d}`);
      fs.mkdirSync(d, { recursive: true });
    }
  }

  // 2. Scan for Files (Once for all)
  console.log("🔍 Scanning source directory...");
  const foundFiles: { path: string; name: string; tokens: Set<string> }[] = [];
  
  function scanRecursively(dir: string) {
    if (dir.includes("_SYSTEM_BASELINE") || dir.includes("_CANONICAL_POLICY_FACTORY")) return;
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scanRecursively(fullPath);
            } else if (entry.isFile() && !entry.name.startsWith("~$")) {
                foundFiles.push({
                    path: fullPath,
                    name: entry.name,
                    tokens: tokenize(entry.name)
                });
            }
        }
    } catch (e) {
        console.warn(`⚠️ Skipped access to ${dir}`);
    }
  }
  
  scanRecursively(BASE_DIR);
  console.log(`📂 Found ${foundFiles.length} source files.`);

  // 3. Process Each Department
  for (const dept of DEPTS) {
    console.log(`\n🏢 Processing ${dept.name} (${dept.code})...`);
    
    // Create Dept Folder
    if (!fs.existsSync(dept.baselinePath)) {
        fs.mkdirSync(dept.baselinePath, { recursive: true });
    }

    // Copy Templates
    for (const t of dept.templates) {
      const src = path.join(dept.sourcePack, t);
      const dest = path.join(dept.baselinePath, t);
      if (fs.existsSync(src)) {
          if (!fs.existsSync(dest)) {
              fs.copyFileSync(src, dest);
              console.log(`  ✅ Copied ${t}`);
          }
      } else {
        console.warn(`  ⚠️ Template not found: ${src}`);
      }
    }

    // Load Taxonomy
    const taxonomyFile = dept.templates.find(t => t.endsWith(".json"));
    if (!taxonomyFile) continue;

    const taxonomyPath = path.join(dept.baselinePath, taxonomyFile);
    if (!fs.existsSync(taxonomyPath)) {
        console.error(`  ❌ Taxonomy ${taxonomyFile} missing. Skipping dept.`);
        continue;
    }

    const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
    let catalog: any[] = [];
    
    if (taxonomy.catalog) {
        catalog = [
            ...(taxonomy.catalog?.POLICY || taxonomy.catalog?.Policy || []),
            ...(taxonomy.catalog?.PROCEDURE || taxonomy.catalog?.Procedure || []),
            ...(taxonomy.catalog?.SOP || []),
            ...(taxonomy.catalog?.REGISTER || taxonomy.catalog?.Standard || []),
            ...(taxonomy.catalog?.FORM || [])
        ];
    } else if (taxonomy.items) {
        catalog = taxonomy.items;
    }
    
    console.log(`  📚 Loaded ${catalog.length} taxonomy items.`);

    // Match & Score
    const results = catalog.map((item: any) => {
        const itemTokens = tokenize(item.title);
        let bestMatch: any = null;
        let maxScore = 0;

        for (const file of foundFiles) {
            if (file.name.toUpperCase().includes(item.id)) {
                bestMatch = file;
                maxScore = 1.0;
                break;
            }
            const score = jaccardIndex(itemTokens, file.tokens);
            if (score > maxScore && score > 0.3) {
                maxScore = score;
                bestMatch = file;
            }
        }

        return {
            ...item,
            status: maxScore === 1.0 ? "Existing" : (maxScore > 0.5 ? "Draft" : "Missing"),
            matchScore: maxScore,
            matchedFile: bestMatch ? bestMatch.path : null
        };
    });

    // Generate Report
    const matchedFilePaths = new Set(results.map((r: any) => r.matchedFile).filter((p: any) => p));
    const unmappedFiles = foundFiles.filter(f => !matchedFilePaths.has(f.path));

    const reportData = results.map((r: any) => ({
        "ID / المعرف": r.id,
        "Type / النوع": r.id.split('-')[1],
        "Title / العنوان": r.title,
        "Status / الحالة": r.status,
        "Coverage / التغطية": r.status === "Existing" ? 100 : 0,
        "Path / المسار": r.matchedFile || "",
        "Notes / ملاحظات": r.status === "Missing" ? "Check 'Unmapped Files' / يرجى التحقق من 'الملفات غير المعينة'" : ""
    }));

    const wb = XLSX.utils.book_new();
    
    // Matrix Sheet
    const ws = XLSX.utils.json_to_sheet(reportData);
    if(!ws['!rows']) ws['!rows'] = [];
    ws['!rows'][0] = { hpt: 20, level: 1 }; // Header height
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 60 }, { wch: 20 }, { wch: 15 }, { wch: 80 }, { wch: 50 }];
    
    // Set RTL direction if possible (SheetJS dependent, often involves setting 'views')
    if(!ws['!views']) ws['!views'] = [];
    ws['!views'].push({ rightToLeft: true });

    XLSX.utils.book_append_sheet(wb, ws, "Readiness Matrix");

    // Unmapped Sheet
    const unmappedData = unmappedFiles.map(f => ({ 
        "File Name / اسم الملف": f.name, 
        "Path / المسار": f.path 
    }));
    const wsUnmapped = XLSX.utils.json_to_sheet(unmappedData);
    wsUnmapped['!cols'] = [{ wch: 60 }, { wch: 100 }];
    if(!wsUnmapped['!views']) wsUnmapped['!views'] = [];
    wsUnmapped['!views'].push({ rightToLeft: true });

    XLSX.utils.book_append_sheet(wb, wsUnmapped, "Unmapped Files");

    const reportPath = path.join(dept.baselinePath, `${dept.code}_Readiness_Report_Generated.xlsx`);
    XLSX.writeFile(wb, reportPath);
    
    const foundCount = results.filter((r: any) => r.status !== "Missing").length;
    console.log(`  📊 Report generated: ${reportPath}`);
    console.log(`  📈 Coverage: ${Math.round((foundCount / catalog.length) * 100)}% (${foundCount}/${catalog.length})`);

    // Collect Stats
    allStats.push({
      dept: dept.code,
      total: catalog.length,
      found: foundCount,
      coverage: Math.round((foundCount / catalog.length) * 100),
      unmapped: unmappedFiles.length,
      reportPath
    });
  }

  console.log("\n✅ All Departments Processed.");
  fs.writeFileSync("universal_stats.json", JSON.stringify(allStats, null, 2));
}

const allStats: any[] = [];

main().catch(console.error);
