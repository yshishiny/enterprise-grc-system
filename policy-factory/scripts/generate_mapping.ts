import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

// Paths
const DATA_DIR = path.join(process.cwd(), 'data');
const SYSTEM_ROOT = 'C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\_POLICY_FACTORY_SYSTEM';
// Fix path spaces if needed, but assuming consistency with scan_registry
const NEXTCLOUD_SYSTEM = 'C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\_POLICY_FACTORY_SYSTEM';

const REG_UNIVERSE_PATH = path.join(DATA_DIR, 'regulatory_universe.json');
const REQ_REGISTER_PATH = path.join(DATA_DIR, 'required_register.json');
const ACTUAL_REGISTRY_PATH = path.join(NEXTCLOUD_SYSTEM, '02_NORMALIZED', 'registry.json');
const OUTPUT_DIR = path.join(NEXTCLOUD_SYSTEM, '05_REPORTS');

// Load Data
function loadJSON(filepath: string) {
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

const regUniverse = loadJSON(REG_UNIVERSE_PATH);
const reqRegister = loadJSON(REQ_REGISTER_PATH);
const actualRegistry = loadJSON(ACTUAL_REGISTRY_PATH);

if (!regUniverse || !reqRegister || !actualRegistry) {
  console.error('Missing input files. Please ensure scan-registry has run and data/ files exist.');
  process.exit(1);
}

console.log('Loaded inputs. generating mapping...');

console.log('Loaded inputs. generating mapping...');

try {
  // 1. Map Actual Docs to Required IDs using Fuzzy Matching
  // This is a simplified heuristic since we don't have ID metadata in filenames yet
  const docMapping: Record<string, any> = {}; // reqId -> actualDoc
  
  reqRegister.domains.forEach((domain: any) => {
    domain.requiredDocuments.forEach((req: any) => {
       // Find match in actualRegistry
      const match = actualRegistry.find((doc: any) => {
        if (!doc || !doc.title) return false;
        // strict check if filename contains ID? No, IDs are 'POL-01' etc.
        // Normalized check: if doc title (from filename) is similar to req title
        const docTitle = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const reqTitle = req.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return docTitle.includes(reqTitle) || reqTitle.includes(docTitle);
      });
      
      if (match) {
        docMapping[req.docId] = match;
      }
    });
  });

  // 2. Generate Gap Report
  const gaps: any[] = [];
  reqRegister.domains.forEach((domain: any) => {
    domain.requiredDocuments.forEach((req: any) => {
      const isFound = !!docMapping[req.docId];
      gaps.push({
        ID: req.docId,
        Domain: domain.name,
        Title: req.title,
        Priority: req.priority,
        Status: isFound ? (docMapping[req.docId].status || 'Draft') : 'Missing',
        ActualFile: isFound ? docMapping[req.docId].filename : 'N/A'
      });
    });
  });

  // 3. Generate Compliance Matrix (Law -> Article -> Policy)
  const matrixRows: any[] = [];

  if (regUniverse.laws) {
    regUniverse.laws.forEach((law: any) => {
      law.articles.forEach((art: any) => {
        // Find related docs
        const relatedIds = art.relatedDocIds || [];
        const fulfillingDocs = relatedIds.map((id: string) => {
          const found = docMapping[id];
          return found ? found.filename : null;
        }).filter(Boolean);

        const status = fulfillingDocs.length > 0 ? "Implemented" : "Gap";
        
        matrixRows.push({
          Law: law.title,
          Article: art.article,
          Requirement: art.text,
          Status: status,
          RelatedPolices: relatedIds.join(', '),
          FulfillingFiles: fulfillingDocs.join('; ')
        });
      });
    });
  }

  // Write Excel
  const wb = XLSX.utils.book_new();

  // Sheet 1: Gap Analysis
  const wsGaps = XLSX.utils.json_to_sheet(gaps);
  XLSX.utils.book_append_sheet(wb, wsGaps, "Gap Analysis");

  // Sheet 2: Compliance Matrix
  const wsMatrix = XLSX.utils.json_to_sheet(matrixRows);
  XLSX.utils.book_append_sheet(wb, wsMatrix, "Compliance Matrix");

  const outFile = path.join(OUTPUT_DIR, 'GAP_REPORT.xlsx');
  XLSX.writeFile(wb, outFile);

  console.log(`Gap Report generated at: ${outFile}`);

} catch (error) {
  console.error("An error occurred during mapping generation:", error);
  process.exit(1);
}
