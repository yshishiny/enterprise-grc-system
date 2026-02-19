import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.join(process.cwd(), 'data', 'document_registry.json');

// Mock Data Configuration
const TARGET_DEPTS = ["RISK", "AML", "AUDIT", "OPS", "OPERATIONS"];
const DOC_COUNT_PER_DEPT = 25;

const TOPICS = {
  RISK: ["Risk Appetite", "Enterprise Risk Management", "Operational Risk", "Market Risk", "Credit Risk", "Liquidity Risk", "Reputational Risk", "Strategic Risk", "Risk Reporting", "Incident Management"],
  AML: ["AML Policy", "KYC Procedure", "Transaction Monitoring", "Sanctions Screening", "Suspicious Activity Reporting", "Customer Due Diligence", "Enhanced Due Diligence", "Record Keeping", "AML Training", "Risk Assessment"],
  AUDIT: ["Internal Audit Charter", "Audit Manual", "Annual Audit Plan", "Audit Reporting", "Follow-up Procedure", "Quality Assurance", "External Audit Coordination", "Audit Committee", "Whistleblowing", "Fraud Investigation"],
  OPS: ["Facility Management", "Procurement Policy", "Vendor Management", "Travel Policy", "Health and Safety", "Asset Management", "Inventory Control", "Fleet Management", "Mailroom Procedures", "Visitor Management"],
  OPERATIONS: ["Loan Origination", "Credit Analysis", "Disbursement Procedure", "Collection Policy", "Customer Service", "Branch Operations", "Cash Handling", "ATM Management", "Account Opening", "Complaint Handling"]
};

// ... existing code ...
interface RegistryDoc {
    id: string;
    title: string;
    type: string;
    department: string;
    status: string;
    version: string;
    lastUpdated: string;
    requiredDocId?: string;
    frameworks: string[];
    controls: string[];
    validatedBy: string;
    validatedAt: string;
    filename?: string;
    folder?: string;
    systemNotes?: string;
    obligations?: string[];
    [key: string]: any;
}

function loadJson(p: string) {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function main() {
    console.log("🌱 Seeding Mock Data for Dashboard Completion...");
    const registry = loadJson(REGISTRY_PATH);
    if (!registry) {
        console.error("❌ Failed to load registry.");
        return;
    }

    const existingIds = new Set(registry.documents.map((d: any) => d.id));
    let addedCount = 0;

    TARGET_DEPTS.forEach(dept => {
        const topics = TOPICS[dept as keyof typeof TOPICS] || ["General Policy"];
        
        // check if dept already has docs
        const hasDocs = registry.documents.some((d: any) => d.department === dept);
        if (hasDocs) {
            console.log(`ℹ️ Skipping ${dept} (already has documents)`);
            return;
        }

        console.log(`✨ Generating data for ${dept}...`);

        for (let i = 1; i <= DOC_COUNT_PER_DEPT; i++) {
            const topic = topics[getRandomInt(topics.length)];
            const type = Math.random() > 0.4 ? "policy" : "procedure";
            const id = `${dept}-${type === 'policy' ? 'POL' : 'PRO'}-${String(i).padStart(3, '0')}`;
            
            if (existingIds.has(id)) continue;

            const newDoc: RegistryDoc = {
                id: id,
                title: `${topic} ${type === 'policy' ? 'Policy' : 'Procedure'}`,
                type: type,
                department: dept,
                status: Math.random() > 0.3 ? "Approved" : (Math.random() > 0.5 ? "Draft" : "Under Review"),
                version: "v1.0",
                lastUpdated: new Date().toISOString().split('T')[0],
                requiredDocId: `${dept}-REQ-${String(i).padStart(3, '0')}`,
                frameworks: Math.random() > 0.7 ? ["NIST 800-53", "ISO 27001"] : [],
                controls: [],
                validatedBy: "System Mock",
                validatedAt: new Date().toISOString().split('T')[0],
                filename: `${id}_${topic.replace(/\s+/g, '_')}_${type.toUpperCase()}.docx`,
                folder: "MOCK_DATA_GENERATED",
                systemNotes: "Generated for dashboard preview",
                obligations: Math.random() > 0.6 ? ["CBA-101", "REG-202"] : []
            };

             registry.documents.push(newDoc);
             existingIds.add(id);
             addedCount++;
        }
    });

    if (addedCount > 0) {
        registry.lastUpdated = new Date().toISOString();
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
        console.log(`✅ Successfully seeded ${addedCount} mock documents.`);
    } else {
        console.log("ℹ️ No new mock data needed.");
    }
}

main();
