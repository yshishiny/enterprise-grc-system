import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuration
const SOURCE_ROOT = 'C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures';
const CANONICAL_ROOT = path.join(SOURCE_ROOT, '_CANONICAL_POLICY_FACTORY');
const INBOX_DIR = path.join(CANONICAL_ROOT, '02_INBOX_UPLOADS');
const STAGING_DIR = path.join(CANONICAL_ROOT, '03_CLASSIFIED_STAGING');
const REVIEW_DIR = path.join(STAGING_DIR, 'To_Review');

// Current Month Inbox
const date = new Date();
const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const CURRENT_INBOX = path.join(INBOX_DIR, monthStr);

// Valid Extensions
const VALID_EXTS = ['.pdf', '.docx', '.doc', '.xlsx', '.pptx'];

// Interfaces
interface DocMetadata {
  originalPath: string;
  filename: string;
  type: string;
  department: string;
  likelyDocId: string;
  status: string;
  hash: string;
}

// Ensure directories exist
[CURRENT_INBOX, REVIEW_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper: Calculate SHA256
function getFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Helper: Normalize String
function normalize(str: string): string {
  return str.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Logic: Guess Department from Path or Filename
function guessDepartment(filePath: string): string {
  const normalized = normalize(filePath);
  if (normalized.includes('IT') || normalized.includes('INFOSEC') || normalized.includes('SECURITY')) return 'IT';
  if (normalized.includes('HR') || normalized.includes('HUMAN')) return 'HR';
  if (normalized.includes('FINANCE') || normalized.includes('ACCOUNTING')) return 'FIN';
  if (normalized.includes('RISK')) return 'RISK';
  if (normalized.includes('OPERATION')) return 'OPS';
  if (normalized.includes('CREDIT')) return 'CREDIT';
  if (normalized.includes('LEGAL')) return 'LEGAL';
  return 'GEN'; // Generic
}

// Logic: Guess Type
function guessType(filename: string): string {
  const normalized = normalize(filename);
  if (normalized.includes('POLICY') || normalized.includes('POL')) return 'POL';
  if (normalized.includes('PROCEDURE') || normalized.includes('PRO')) return 'PRO';
  if (normalized.includes('STANDARD') || normalized.includes('STD')) return 'STD';
  if (normalized.includes('FORM')) return 'FRM';
  if (normalized.includes('PLAN')) return 'PLN';
  return 'DOC';
}

// Logic: Main Ingestion
function ingest() {
  console.log(`Starting Ingestion from ${SOURCE_ROOT}...`);
  console.log(`Target Inbox: ${CURRENT_INBOX}`);

  let copiedCount = 0;
  let skippedCount = 0;

  // Recursive scan, excluding CANONICAL_ROOT itself
  function scan(dir: string) {
    if (dir.startsWith(CANONICAL_ROOT)) return; // Skip our own output

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // Strict exclusion of the destination folder to prevent recursion
      if (fullPath.startsWith(CANONICAL_ROOT)) continue;

      if (item.isDirectory()) {
         // Skip legacy system baseline folders if desired, or scan them too.
         // For now, allow scanning everything except the new root.
         if (fullPath !== CANONICAL_ROOT && !item.name.startsWith('.')) {
            scan(fullPath);
         }
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (VALID_EXTS.includes(ext)) {
          // Copy to Inbox
          // We prepend a hash slice to filename to avoid collisions in flat inbox
          const hash = getFileHash(fullPath);
          const hashPrefix = hash.substring(0, 8);
          const destName = `${hashPrefix}__${item.name}`;
          const destPath = path.join(CURRENT_INBOX, destName);

          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(fullPath, destPath);
            // console.log(`Copied: ${item.name}`);
            copiedCount++;
            
            // Trigger Classification for this file
            classify(destPath, fullPath);
          } else {
            skippedCount++;
          }
        }
      }
    }
  }

  scan(SOURCE_ROOT);
  console.log(`Ingestion Complete. Copied: ${copiedCount}, Skipped (Exists): ${skippedCount}`);
}

// Logic: Classification & Staging
function classify(inboxPath: string, originalSourcePath: string) {
  const filename = path.basename(inboxPath);
  // Remove the hash prefix we added for the staging name
  const originalName = filename.substring(10); // 8 chars hash + 2 underscores
  
  const type = guessType(originalName);
  const dept = guessDepartment(originalSourcePath);
  
  // Generate Suggested Canonical Name
  // Format: <DOC>-<DEPT>-000__<Title>__v1.0__DRAFT__YYYY-MM-DD.ext
  // CRITICAL: Sanitize title to avoid '__' (double underscore) as it is our delimiter
  let title = originalName.replace(path.extname(originalName), '');
  title = title.replace(/_/g, '-'); // Replace existing underscores with hyphens
  title = title.replace(/[^a-zA-Z0-9-]/g, '-'); // Replace special chars with hyphens
  title = title.replace(/-+/g, '-'); // Collapse multiple hyphens
  title = title.replace(/^-|-$/g, ''); // Trim leading/trailing hyphens

  const dateStr = new Date().toISOString().slice(0, 10);
  
  const suggestedName = `${type}-${dept}-000__${title}__v1.0__DRAFT__${dateStr}${path.extname(filename)}`;
  const stagingPath = path.join(REVIEW_DIR, suggestedName);

  // Copy to Staging (To_Review)
  if (!fs.existsSync(stagingPath)) {
    fs.copyFileSync(inboxPath, stagingPath);
  }
}

// Run
ingest();
