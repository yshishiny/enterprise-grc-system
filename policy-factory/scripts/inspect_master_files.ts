import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const PACK_DIR = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\Departmental_pack_cross_ownership_folder";

// 1. Inspect Master Obligations Register Template
const oblFile = path.join(PACK_DIR, "Master_Obligations_Register_Template.xlsx");
if (fs.existsSync(oblFile)) {
  console.log("=== Master_Obligations_Register_Template.xlsx ===");
  const wb = XLSX.readFile(oblFile);
  console.log("Sheets:", wb.SheetNames);
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    console.log(`\n--- Sheet: ${sheetName} (${rows.length} rows) ---`);
    // Show first 5 rows
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      console.log(`  Row ${i}:`, JSON.stringify(rows[i]));
    }
  }
} else {
  console.log("❌ Master_Obligations_Register_Template.xlsx not found");
}

// 2. Look for Master_Index_All_Packs_UPDATED.xlsx
const possibles = [
  path.join(PACK_DIR, "Master_Index_All_Packs_UPDATED.xlsx"),
  "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\Master_Index_All_Packs_UPDATED.xlsx",
  "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\_SYSTEM_BASELINE\\Master_Index_All_Packs_UPDATED.xlsx",
];
let masterFound = false;
for (const p of possibles) {
  if (fs.existsSync(p)) {
    masterFound = true;
    console.log(`\n=== Master_Index_All_Packs_UPDATED.xlsx found at: ${p} ===`);
    const wb = XLSX.readFile(p);
    console.log("Sheets:", wb.SheetNames);
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      console.log(`\n--- Sheet: ${sheetName} (${rows.length} rows) ---`);
      for (let i = 0; i < Math.min(5, rows.length); i++) {
        console.log(`  Row ${i}:`, JSON.stringify(rows[i]));
      }
    }
    break;
  }
}
if (!masterFound) {
  // Search more broadly
  console.log("\n⚠️ Master_Index_All_Packs_UPDATED.xlsx not found in expected locations.");
  console.log("Searching recursively...");
  function findFile(dir: string, name: string): string | null {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name === name) return path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const r = findFile(path.join(dir, entry.name), name);
          if (r) return r;
        }
      }
    } catch { }
    return null;
  }
  const found = findFile("C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures", "Master_Index_All_Packs_UPDATED.xlsx");
  if (found) console.log("Found at:", found);
  else console.log("Not found anywhere in Nextcloud.");
}

// 3. Inspect a Document_Register.xlsx from one of the structured packs
const amlReg = path.join(PACK_DIR, "AML_pack_cross_ownership", "04_Registers_Trackers", "Document_Register.xlsx");
if (fs.existsSync(amlReg)) {
  console.log("\n=== AML Document_Register.xlsx ===");
  const wb = XLSX.readFile(amlReg);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`Sheets: ${wb.SheetNames}, Rows: ${rows.length}`);
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    console.log(`  Row ${i}:`, JSON.stringify(rows[i]));
  }
}

// 4. Inspect an Obligations_Map.xlsx
const amlObl = path.join(PACK_DIR, "AML_pack_cross_ownership", "05_Mappings", "Obligations_Map.xlsx");
if (fs.existsSync(amlObl)) {
  console.log("\n=== AML Obligations_Map.xlsx ===");
  const wb = XLSX.readFile(amlObl);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`Sheets: ${wb.SheetNames}, Rows: ${rows.length}`);
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    console.log(`  Row ${i}:`, JSON.stringify(rows[i]));
  }
}
