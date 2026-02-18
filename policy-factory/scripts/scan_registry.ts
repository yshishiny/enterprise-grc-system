import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

// Configuration
const NEXTCLOUD_ROOT = 'C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures';
const CANONICAL_ROOT = path.join(NEXTCLOUD_ROOT, '_CANONICAL_POLICY_FACTORY');
const APP_DATA_DIR = path.join(process.cwd(), 'data');

// Target Folders to Scan
const TARGET_DIRS = [
  path.join(CANONICAL_ROOT, '03_CLASSIFIED_STAGING'),
  path.join(CANONICAL_ROOT, '04_CANONICAL_LIBRARY')
];

// Scoring Weights
const SCORE_MISSING = 0;
const SCORE_DRAFT = 25;
const SCORE_REVIEWED = 50;
const SCORE_APPROVED = 75;
const SCORE_BOD = 100;

interface DocEntry {
  id: string; // DocID
  filename: string;
  path: string;
  type: string;
  department: string;
  title: string;
  version: string;
  status: string;
  score: number;
  lastModified: Date;
  effectiveDate?: string;
  canonical: boolean; // True if follows naming convention
  requiredDocId?: string; // Linked Required Document ID
}

function getScore(status: string): number {
  const s = status.toLowerCase();
  if (s.includes('bod') || s.includes('board')) return SCORE_BOD;
  if (s.includes('exec') || s.includes('approved')) return SCORE_APPROVED;
  if (s.includes('review')) return SCORE_REVIEWED;
  if (s.includes('draft')) return SCORE_DRAFT;
  return SCORE_DRAFT;
}

function parseFilename(filename: string): Partial<DocEntry> {
  // New Canonical Format: <DocID>__<Title>__v<Major.Minor>__<Status>__<YYYY-MM-DD>.<ext>
  // Example: POL-IT-001__InfoSec-Policy__v1.0__BOD-APPROVED__2025-12-20.docx
  
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  
  const parts = name.split('__');
  
  if (parts.length >= 4) {
    // High confidence canonical
    return {
      id: parts[0],
      title: parts[1].replace(/-/g, ' '),
      version: parts[2],
      status: parts[3].replace(/-/g, ' '),
      effectiveDate: parts[4] || undefined,
      canonical: true
    };
  }

  // Fallback: Legacy Parsing
  // [DEPT-TYPE-001] Title v1.0.docx OR Policy - Title.docx
  let type = 'Doc';
  let department = 'GEN';
  let status = 'Draft';
  
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('policy')) type = 'Policy';
  else if (lowerName.includes('procedure')) type = 'Procedure';
  
  if (lowerName.includes('hr') || lowerName.includes('human')) department = 'HR';
  else if (lowerName.includes('it') || lowerName.includes('security')) department = 'IT';
  
  if (lowerName.includes('approved')) status = 'Approved';
  
  return {
    id: 'LEGACY-' + name.substring(0, 10).replace(/[^a-zA-Z0-9]/g, ''),
    type,
    department,
    title: name,
    version: '0.0',
    status,
    canonical: false
  };
}

// Load Required Register for Title Matching
const REQUIRED_REG_PATH = path.join(process.cwd(), 'data', 'required_register.json');
let requiredMap: Record<string, string> = {}; // Title -> REQ-ID

if (fs.existsSync(REQUIRED_REG_PATH)) {
  const reqData = JSON.parse(fs.readFileSync(REQUIRED_REG_PATH, 'utf-8'));
  reqData.domains?.forEach((d: any) => {
    d.requiredDocuments?.forEach((rd: any) => {
      if (rd.title && rd.docId) {
        requiredMap[rd.title.toLowerCase().trim()] = rd.docId;
      }
    });
  });
}

function scanRecursively(dir: string, entries: DocEntry[] = []) {
  if (!fs.existsSync(dir)) return entries;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Logic to ignore known non-staging folders if scanning root
      if (item.startsWith('.')) continue; // Ignore .git etc
      scanRecursively(fullPath, entries);
    } else {
      if (item.startsWith('~$') || item.startsWith('.')) continue;
      const ext = path.extname(item).toLowerCase();
      if (!['.docx', '.pdf', '.xlsx', '.pptx', '.doc'].includes(ext)) continue;
      
      const parsed = parseFilename(item);
      const isCanonical = parsed.canonical || false;
      
      // If canonical, derive Dept/Type from ID if possible
      let dept = parsed.department || 'GEN';
      let type = parsed.type || 'Doc';
      
      if (parsed.id && parsed.id.includes('-')) {
        const idParts = parsed.id.split('-');
        if (idParts.length >= 2) {
          type = idParts[0]; // e.g., POL
          dept = idParts[1]; // e.g., IT
        }
      }

      // MATCHING LOGIC: Try to find the Required Doc ID based on Title
      const normalizedTitle = (parsed.title || '').toLowerCase().replace(/[-_]/g, ' ').trim();
      
      // Exact match first
      let reqId = requiredMap[normalizedTitle];
      
      // If no match, try fuzzy (contains)
      if (!reqId) {
          const match = Object.keys(requiredMap).find(k => normalizedTitle.includes(k) || k.includes(normalizedTitle));
          if (match) reqId = requiredMap[match];
      }

      entries.push({
        id: parsed.id || 'UNK',
        filename: item,
        path: fullPath,
        type: type,
        department: dept,
        title: parsed.title || item,
        version: parsed.version || '0.1',
        status: parsed.status || 'Draft',
        effectiveDate: parsed.effectiveDate,
        score: getScore(parsed.status || 'Draft'),
        lastModified: stat.mtime,
        canonical: isCanonical,
        requiredDocId: reqId // New Field
      });
    }
  }
  return entries;
}

// Main execution
console.log(`Scanning Canonical Root: ${CANONICAL_ROOT}`);
let allDocs: DocEntry[] = [];

TARGET_DIRS.forEach(dir => {
    console.log(`Scanning: ${dir}`);
    scanRecursively(dir, allDocs);
});

console.log(`Found ${allDocs.length} documents.`);

// Generate Excel Report
const wb = XLSX.utils.book_new();
const wsDetail = XLSX.utils.json_to_sheet(allDocs.map((d: any) => ({
  ID: d.id,
  RequiredLink: d.requiredDocId || 'Unlinked',
  Title: d.title,
  Type: d.type,
  Dept: d.department,
  Status: d.status,
  Version: d.version,
  Date: d.effectiveDate,
  Canonical: d.canonical,
  Path: d.path
})));
XLSX.utils.book_append_sheet(wb, wsDetail, "Canonical Register");
const reportPath = path.join(CANONICAL_ROOT, '06_REPORTS_DASHBOARDS', 'CANONICAL_REGISTRY.xlsx');
try {
    XLSX.writeFile(wb, reportPath);
    console.log(`Excel Report: ${reportPath}`);
} catch (e) {
    console.error("Could not write Excel report (file might be open):", e);
}

// Write to App Data for Dashboard using the expected schema
const dashboardData = {
  lastUpdated: new Date().toISOString(),
  documents: allDocs.map((d: any) => ({
    id: d.id,
    title: d.title,
    type: d.type.toLowerCase(), // Normalize for API
    department: d.department,
    status: d.status,
    version: d.version,
    lastUpdated: d.lastModified.toISOString().split('T')[0],
    requiredDocId: d.requiredDocId || d.id, // Fallback to self ID if no link
    frameworks: [], // To be populated by API mapping logic
    controls: []
  }))
};

const jsonPath = path.join(APP_DATA_DIR, 'document_registry.json');
fs.writeFileSync(jsonPath, JSON.stringify(dashboardData, null, 2));
console.log(`Dashboard Data Updated: ${jsonPath}`);
