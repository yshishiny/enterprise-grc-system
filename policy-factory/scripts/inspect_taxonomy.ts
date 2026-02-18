
import fs from 'fs';
import path from 'path';

const BASE_DIR = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures";
const AUD_TAXONOMY = path.join(BASE_DIR, "AUD_pack_cross_ownership", "AUD_Taxonomy.json");
const RISK_TAXONOMY = path.join(BASE_DIR, "RISK_pack_cross_ownership", "RISK_Taxonomy.json");

function inspect(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing: ${filePath}`);
    return;
  }
  console.log(`\n🔍 Inspecting: ${filePath}`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    console.log("Keys:", Object.keys(json));
    if (json.catalog) {
       console.log("Catalog Keys:", Object.keys(json.catalog));
       console.log("Sample Item:", JSON.stringify(Object.values(json.catalog)[0]?.[0], null, 2));
    } else {
       console.log("❌ No 'catalog' key found.");
       console.log("Top-level sample:", JSON.stringify(json, null, 2).slice(0, 500));
    }
  } catch (e) {
    console.error("Error parsing JSON:", e);
  }
}

inspect(AUD_TAXONOMY);
inspect(RISK_TAXONOMY);
