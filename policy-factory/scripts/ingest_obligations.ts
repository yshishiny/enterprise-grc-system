
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const BASELINE_DIR = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\_SYSTEM_BASELINE";
const OBLIGATIONS_REGISTRY_PATH = "C:\\Users\\YasserElshishiny\\Dropbox\\Projects\\Enterprise Policy factory\\policy-factory\\data\\obligations_registry.json";
const DOC_REGISTRY_PATH = "C:\\Users\\YasserElshishiny\\Dropbox\\Projects\\Enterprise Policy factory\\policy-factory\\data\\document_registry.json";

// Define Departments
const DEPTS = ["HR", "AUD", "RISK"];

function loadJson(p: string, defaultVal: any) {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
    return defaultVal;
}

function saveJson(p: string, data: any) {
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

// Main Logic
async function main() {
    console.log("🚀 Starting Obligations Ingestion...");
    
    let obligationsRegistry = loadJson(OBLIGATIONS_REGISTRY_PATH, { lastUpdated: "", obligations: [] });
    let docRegistry = loadJson(DOC_REGISTRY_PATH, { documents: [] });
    
    let newObligations: any[] = [];
    let docLinksCount = 0;

    for (const dept of DEPTS) {
        const filePath = path.join(BASELINE_DIR, dept, `${dept}_Obligations_Mapping_Template.xlsx`);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Missing mapping file for ${dept}: ${filePath}`);
            continue;
        }

        console.log(`📂 Processing ${dept} Obligations...`);
        const wb = XLSX.readFile(filePath);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        for (const row of rows) {
            const obId = row["ObligationID"];
            if (!obId) continue;

            // 1. Add to Obligations Registry
            const obligation = {
                id: obId,
                department: dept,
                law: row["RegulatorOrLaw"] || "Internal",
                summary: row["ObligationSummary"] || "",
                riskRating: row["RiskRating"] || "Low",
                complianceStatus: row["ComplianceStatus"] || "Not Started",
                requiredArtifacts: row["RequiredArtifacts"] ? row["RequiredArtifacts"].split(/[,;]/).map((s: string) => s.trim()) : []
            };
            newObligations.push(obligation);

            // 2. LinkDocs
            if (obligation.requiredArtifacts.length > 0) {
                for (const reqId of obligation.requiredArtifacts) {
                    const doc = docRegistry.documents.find((d: any) => d.requiredDocId === reqId || d.id === reqId);
                    if (doc) {
                       if (!doc.obligations) doc.obligations = [];
                       if (!doc.obligations.includes(obId)) {
                           doc.obligations.push(obId);
                           docLinksCount++;
                       }
                    }
                }
            }
        }
    }

    // Update Registries
    obligationsRegistry.obligations = newObligations; // Full replace for baseline sync? Or append? Let's full replace to avoid stale data from previous runs if templates change.
    obligationsRegistry.lastUpdated = new Date().toISOString();
    
    saveJson(OBLIGATIONS_REGISTRY_PATH, obligationsRegistry);
    saveJson(DOC_REGISTRY_PATH, docRegistry);

    console.log(`✅ Ingested ${newObligations.length} obligations.`);
    console.log(`🔗 Established ${docLinksCount} links to documents.`);
}

main();
