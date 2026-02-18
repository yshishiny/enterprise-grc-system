import fs from 'fs';
import path from 'path';

// Root directory for the canonical structure
const ROOT_DIR = 'C:\\Users\\YasserElshishiny\\Nextcloud\\Policies & Procedures\\_CANONICAL_POLICY_FACTORY';

const FOLDERS = [
  '00_GOVERNANCE',
  '00_GOVERNANCE\\Approvals_Minutes_Resolutions',
  '00_GOVERNANCE\\Document_Control_Rules',
  '00_GOVERNANCE\\Master_Taxonomy_Frameworks',
  
  '01_TEMPLATES_BASELINE',
  '01_TEMPLATES_BASELINE\\Policy',
  '01_TEMPLATES_BASELINE\\Procedure',
  '01_TEMPLATES_BASELINE\\Standard',
  '01_TEMPLATES_BASELINE\\SOP',
  '01_TEMPLATES_BASELINE\\Control_Narratives',
  '01_TEMPLATES_BASELINE\\Forms_Checklists',
  '01_TEMPLATES_BASELINE\\Mapping_Sheets',

  '02_INBOX_UPLOADS',
  '02_INBOX_UPLOADS\\2026-02',
  '02_INBOX_UPLOADS\\2026-03',

  '03_CLASSIFIED_STAGING',
  '03_CLASSIFIED_STAGING\\To_Review',
  '03_CLASSIFIED_STAGING\\Needs_Metadata',
  '03_CLASSIFIED_STAGING\\Needs_Scans_Fix',
  '03_CLASSIFIED_STAGING\\Needs_Dedup',

  '04_CANONICAL_LIBRARY',
  '04_CANONICAL_LIBRARY\\01_BOD_APPROVED',
  '04_CANONICAL_LIBRARY\\01_BOD_APPROVED\\Policies',
  '04_CANONICAL_LIBRARY\\01_BOD_APPROVED\\Procedures',
  '04_CANONICAL_LIBRARY\\01_BOD_APPROVED\\Standards',
  '04_CANONICAL_LIBRARY\\01_BOD_APPROVED\\SOPs',
  '04_CANONICAL_LIBRARY\\02_EXEC_APPROVED',
  '04_CANONICAL_LIBRARY\\03_DRAFT_IN_PROGRESS',
  '04_CANONICAL_LIBRARY\\04_SUPERSEDED_ARCHIVE',

  '05_CONTROLS_AND_MAPPINGS',
  '05_CONTROLS_AND_MAPPINGS\\Controls_Library',
  '05_CONTROLS_AND_MAPPINGS\\FRA_Mapping',
  '05_CONTROLS_AND_MAPPINGS\\CBE_Mapping',
  '05_CONTROLS_AND_MAPPINGS\\ISO27001_Mapping',
  '05_CONTROLS_AND_MAPPINGS\\NIST_Mapping',
  '05_CONTROLS_AND_MAPPINGS\\CIS_Mapping',
  '05_CONTROLS_AND_MAPPINGS\\Evidence_Index',

  '06_REPORTS_DASHBOARDS',
  '06_REPORTS_DASHBOARDS\\Coverage_By_Department',
  '06_REPORTS_DASHBOARDS\\Coverage_By_Framework',
  '06_REPORTS_DASHBOARDS\\Exceptions_Register',
  '06_REPORTS_DASHBOARDS\\Review_Calendar',

  '07_EXPORTS_FOR_PORTAL',
  '07_EXPORTS_FOR_PORTAL\\PDFs',
  '07_EXPORTS_FOR_PORTAL\\Portal_Packs'
];

function scaffold() {
  console.log(`Scaffolding canonical structure at: ${ROOT_DIR}`);
  
  if (!fs.existsSync(ROOT_DIR)) {
    fs.mkdirSync(ROOT_DIR, { recursive: true });
    console.log(`Created root: ${ROOT_DIR}`);
  }

  FOLDERS.forEach(folder => {
    const fullPath = path.join(ROOT_DIR, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created: ${folder}`);
    } else {
      console.log(`Exists: ${folder}`);
    }
  });

  console.log('Scaffolding complete.');
}

scaffold();
