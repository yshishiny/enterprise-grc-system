
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const FILE_PATH = "C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\_SYSTEM_BASELINE\\HR\\HR_Obligations_Mapping_Template.xlsx";

function inspect() {
    if (!fs.existsSync(FILE_PATH)) {
        console.error(`❌ File not found: ${FILE_PATH}`);
        return;
    }
    console.log(`🔍 Inspecting: ${FILE_PATH}`);
    const wb = XLSX.readFile(FILE_PATH);
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const headers = XLSX.utils.sheet_to_json(ws, { header: 1 })[0];
    console.log("Headers:", headers);
}

inspect();
