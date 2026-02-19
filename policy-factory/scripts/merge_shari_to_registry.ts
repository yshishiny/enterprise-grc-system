import fs from 'fs';
import path from 'path';

// Define paths relative to project root (assuming script run from root)
const REGISTRY_PATH = path.join(process.cwd(), 'data', 'document_registry.json');
const SHARI_PACKS_PATH = path.join(process.cwd(), 'data', 'shari_packs.json');

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

interface ShariDoc {
  DocumentID: string;
  Title: string;
  Type: string;
  PackID: string;
  Status: string;
  Version: string;
  LastUpdated: string;
  ObligationMappingPlaceholders: string;
  FilePath: string;
  Notes: string;
  [key: string]: any;
}

function loadJson(p: string) {
  if (!fs.existsSync(p)) {
      console.error(`Missing file: ${p}`);
      return null;
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function normalizeStatus(s: string): string {
    const status = s.toUpperCase();
    if (status.includes("APPROVED")) return "Approved";
    if (status.includes("REVIEW")) return "Under Review";
    if (status.includes("DRAFT")) return "Draft";
    return "Draft";
}

function normalizeType(t: string): string {
    const type = t.toLowerCase();
    if (type.includes("policy")) return "policy";
    if (type.includes("procedure")) return "procedure";
    if (type.includes("sop")) return "sop";
    if (type.includes("template")) return "template";
    if (type.includes("register")) return "register";
    return "doc";
}

function main() {
  console.log("🔄 Merging Shari Packs into Document Registry...");

  const registry = loadJson(REGISTRY_PATH);
  const shariPacks = loadJson(SHARI_PACKS_PATH);

  if (!registry || !shariPacks) {
    console.error("❌ Failed to load source files.");
    return;
  }

  const existingIds = new Set(registry.documents.map((d: any) => d.id));
  let addedCount = 0;
  let skippedCount = 0;

  console.log(`📊 Current Registry Size: ${registry.documents.length}`);
  console.log(`📦 Shari Packs Size: ${shariPacks.documents.length}`);

  for (const sDoc of shariPacks.documents) {
    const doc = sDoc as ShariDoc;
    if (existingIds.has(doc.DocumentID)) {
      skippedCount++;
      continue;
    }

    // Extract filename and folder relative to system root
    const filePath = doc.FilePath || "";
    const filename = path.basename(filePath);
    let folder = "";
    
    // Attempt to extract relative path from SHARI directory structure
    const shariIndex = filePath.indexOf("SHARI");
    if (shariIndex !== -1) {
        folder = filePath.substring(shariIndex).replace(/\\/g, "/");
        folder = path.dirname(folder);
    } else {
        folder = "(root)";
    }

    const today = new Date().toISOString().split('T')[0];

    const newDoc: RegistryDoc = {
      id: doc.DocumentID,
      title: doc.Title,
      type: normalizeType(doc.Type),
      department: doc.PackID,
      status: normalizeStatus(doc.Status),
      version: doc.Version || "1.0",
      lastUpdated: doc.LastUpdated || today,
      requiredDocId: `${doc.PackID}-REQ-000`, 
      frameworks: [],
      controls: [], 
      obligations: doc.ObligationMappingPlaceholders ? 
          doc.ObligationMappingPlaceholders.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      filename: filename,
      folder: folder,
      systemNotes: doc.Notes,
      validatedBy: "System Import",
      validatedAt: today
    };

    registry.documents.push(newDoc);
    existingIds.add(newDoc.id);
    addedCount++;
  }

  if (addedCount > 0) {
    registry.lastUpdated = new Date().toISOString();
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
    console.log(`✅ Successfully added ${addedCount} documents.`);
  } else {
    console.log("ℹ️ No new documents to add.");
  }
  
  console.log(`⏭️ Skipped ${skippedCount} existing documents.`);
  console.log(`📊 New Registry Size: ${registry.documents.length}`);
}

main();
