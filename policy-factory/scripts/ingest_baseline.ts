
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const BASELINE_DIR = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\_SYSTEM_BASELINE";
const REGISTRY_PATH = "C:\\Users\\YasserElshishiny\\Dropbox\\Projects\\Enterprise Policy factory\\policy-factory\\data\\document_registry.json";

function loadRegistry() {
    if (fs.existsSync(REGISTRY_PATH)) {
        return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    }
    return { lastUpdated: new Date().toISOString(), documents: [] };
}

function saveRegistry(data: any) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2));
    console.log(`✅ Registry saved with ${data.documents.length} documents.`);
}

function processDept(deptCode: string) {
    const reportPath = path.join(BASELINE_DIR, deptCode, `${deptCode}_Readiness_Report_Generated.xlsx`);
    if (!fs.existsSync(reportPath)) {
        console.warn(`⚠️ Report not found for ${deptCode}: ${reportPath}`);
        return [];
    }

    console.log(`📂 Processing ${deptCode} from ${reportPath}...`);
    const wb = XLSX.readFile(reportPath);
    const sheetName = "Readiness Matrix"; // Or check for localized name if needed
    const sh = wb.Sheets[sheetName] || wb.Sheets[wb.SheetNames[0]]; // Fallback to first sheet
    
    // Convert to JSON with raw headers
    const rawData: any[] = XLSX.utils.sheet_to_json(sh);

    // Map to Registry Format
    return rawData.map(row => {
        // Handle bilingual headers safely
        // "ID / المعرف", "Title / العنوان", "Status / الحالة"
        const id = row["ID / المعرف"] || row["DocID"] || `DOC-${deptCode}-UNK`;
        const title = row["Title / العنوان"] || row["Title"] || "Untitled";
        const status = row["Status / الحالة"] || row["Status"] || "Missing";
        const path = row["Path / المسار"] || row["Path"] || "";

        return {
            id: id,
            title: title,
            type: id.includes("-POL") ? "policy" : id.includes("-PRO") ? "procedure" : "doc",
            department: deptCode,
            status: status === "Existing" ? "Approved" : "Missing", // Map for app
            version: "v1.0",
            lastUpdated: new Date().toISOString().split('T')[0],
            requiredDocId: id,
            frameworks: [],
            controls: [],
            filename: path ? path.split('\\').pop() : "(Pending Mapping)",
            folder: path ? path.split('\\').slice(-2,-1)[0] : "(root)",
            systemNotes: `Imported from Baseline Scan. Status: ${status}`
        };
    });
}

// Main
const registry = loadRegistry();
let newDocs: any[] = [];

// Remove old entries for target departments to avoid duplicates? 
// Or just append/update. Let's filter out old generic stuff if needed, but for now just add/replace.
// We will Filter out existing docs for these depts to do a clean refresh from baseline
const targetDepts = ["HR", "AUD", "RISK"];
registry.documents = registry.documents.filter((d: any) => !targetDepts.includes(d.department));

for (const dept of targetDepts) {
    const docs = processDept(dept);
    if (docs.length > 0) {
        newDocs = [...newDocs, ...docs];
        console.log(`  + Added ${docs.length} docs for ${dept}`);
    }
}

registry.documents = [...registry.documents, ...newDocs];
registry.lastUpdated = new Date().toISOString();
saveRegistry(registry);
