/**
 * setup_baseline.ts
 * Creates _SYSTEM_WORKSPACE folder structure and copies pack templates as read-only references.
 */
import fs from 'fs';
import path from 'path';

const NEXTCLOUD = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures";
const WORKSPACE = path.join(NEXTCLOUD, "_SYSTEM_WORKSPACE");
const PACK_DIR = path.join(NEXTCLOUD, "Departmental_pack_cross_ownership_folder");

const DEPARTMENTS = ["HR", "AML", "AUDIT", "FINANCE", "OPERATIONS", "RISK"];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  📁 Created: ${dir}`);
  } else {
    console.log(`  ✅ Exists:  ${dir}`);
  }
}

function copyIfMissing(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠️ Source missing: ${path.basename(src)}`);
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`  📄 Copied: ${path.basename(dest)}`);
  } else {
    console.log(`  ✅ Already present: ${path.basename(dest)}`);
  }
}

function main() {
  console.log("🔧 Setting up _SYSTEM_WORKSPACE\n");

  // 1. Create workspace root
  ensureDir(WORKSPACE);

  // 2. Create department subfolders
  console.log("\n📂 Department Folders:");
  for (const dept of DEPARTMENTS) {
    const deptDir = path.join(WORKSPACE, dept);
    ensureDir(deptDir);

    // Copy pack templates into each dept folder
    const packNames = [
      `${dept}_pack_cross_ownership`,
      // AUDIT has a different name than AUD
    ];
    
    for (const packName of packNames) {
      const packDir = path.join(PACK_DIR, packName);
      if (!fs.existsSync(packDir)) continue;
      
      // For HR pack (flat structure)
      if (dept === "HR") {
        const hrFiles = fs.readdirSync(packDir).filter(f => f.endsWith('.json') || f.endsWith('.xlsx'));
        for (const file of hrFiles) {
          copyIfMissing(path.join(packDir, file), path.join(deptDir, file));
        }
      } else {
        // For structured packs, copy key files
        const regFile = path.join(packDir, "04_Registers_Trackers", "Document_Register.xlsx");
        const oblFile = path.join(packDir, "05_Mappings", "Obligations_Map.xlsx");
        const raciFile = path.join(packDir, "05_Mappings", "RACI.xlsx");
        const readmeFile = path.join(packDir, "00_README.md");
        
        copyIfMissing(regFile, path.join(deptDir, `${dept}_Document_Register.xlsx`));
        copyIfMissing(oblFile, path.join(deptDir, `${dept}_Obligations_Map.xlsx`));
        copyIfMissing(raciFile, path.join(deptDir, `${dept}_RACI.xlsx`));
        copyIfMissing(readmeFile, path.join(deptDir, `${dept}_README.md`));
      }
    }
  }

  // 3. Also copy the Master Obligations Register Template
  console.log("\n📋 Master Templates:");
  copyIfMissing(
    path.join(PACK_DIR, "Master_Obligations_Register_Template.xlsx"),
    path.join(WORKSPACE, "Master_Obligations_Register_Template.xlsx")
  );

  // 4. Create Indices folder
  ensureDir(path.join(WORKSPACE, "_Indices"));

  console.log("\n✅ Workspace setup complete!");
  console.log(`   Location: ${WORKSPACE}`);
}

main();
