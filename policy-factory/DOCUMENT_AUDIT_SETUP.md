# GRC System - Folder Structure & Document Audit Setup

## Folder Separation Strategy

### Documents (Existing - READ ONLY for system)

```
C:\Users\YasserElshishiny\Nextcloud\Policies & Procedures\
```

**Rule:** Documents only. No code, repos, node_modules, or Next.js projects.

### GRC System (New - System files)

```
C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\
├── repo/           # Git clone lives here
├── exports/        # Generated outputs (PDFs, DOCX)
├── reports/        # Validation & audit reports
├── mappings/       # Framework mapping files
└── inbox/          # New incoming docs to process
```

---

## System Rules

1. **Read from Documents:**
   - System reads from `Policies & Procedures`
   - Never writes automatically to that folder

2. **Write to System:**
   - Generated policies → `exports/`
   - Audit reports → `reports/`
   - Framework mappings → `mappings/`

3. **No Mixing:**
   - Code stays in `GRC-PolicyFactory-System/repo/`
   - Documents stay in `Policies & Procedures/`

---

## Document Audit Script

### Location

```
.\scripts\policy_audit.ps1
```

### Usage

**Basic (365-day threshold):**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\policy_audit.ps1
```

**Custom threshold (e.g., 180 days):**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\policy_audit.ps1 -OldDays 180
```

### What It Does

1. **Scans** all documents in `Nextcloud\Policies & Procedures`
2. **Classifies** each document:
   - **Approved**: Contains "approved", "bod", "board", "signed", "final", "issued"
   - **Draft**: Contains "draft", "wip", "review", "pending", "in progress"
   - **Old**: Contains "old", "archive", "deprecated" OR modified >X days ago
   - **Unknown**: Everything else

3. **Outputs**:
   - CSV report with file-by-file details
   - Summary with exact percentages
   - Folder-by-folder breakdown

### Output Location

```
C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\reports\
├── policy_audit_YYYYMMDD-HHMMSS.csv
└── policy_audit_summary_YYYYMMDD-HHMMSS.txt
```

---

## Next Steps Based on Audit Results

### If Approved % is High (>60%)

- Start framework mapping on approved set
- Validate against compliance requirements
- Begin controls library mapping

### If Draft/Unknown is High (>40%)

- Enforce naming conventions
- Implement folder structure rules
- Set up approval pipeline
- Bulk reclassification

### If Old % is High (>30%)

- Create archive folder
- Bulk move old docs
- Mark for review/retirement

---

## Setup Instructions

### 1. Create Folder Structure

```powershell
New-Item -ItemType Directory -Force -Path `
  "C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\repo", `
  "C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\exports", `
  "C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\reports", `
  "C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\mappings", `
  "C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\inbox"
```

### 2. Run Initial Audit

```powershell
cd "C:\Users\YasserElshishiny\Dropbox\Projects\Enterprise Policy factory\policy-factory"
powershell -ExecutionPolicy Bypass -File .\scripts\policy_audit.ps1
```

### 3. Review Summary

```powershell
# Open the summary file
notepad "C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\reports\policy_audit_summary_*.txt"
```

---

## Classification Keywords

### Approved

- `approved`, `bod`, `board`, `signed`, `final`, `issued`

### Draft

- `draft`, `wip`, `review`, `pending`, `inprogress`, `in progress`, `for review`

### Old

- `old`, `archive`, `archived`, `deprecated`, `obsolete`, `superseded`
- OR: Last modified > threshold days

**Customize these keywords in the script if needed.**

---

## Example Report Output

```
Root: C:\Users\YasserElshishiny\Nextcloud\Policies & Procedures
Total documents: 145

=== Overall Status Summary ===
Status    Count  Percent
------    -----  -------
Approved     87   60.00%
Draft        32   22.07%
Old          18   12.41%
Unknown       8    5.52%

=== Top Folder Breakdown ===
TopFolder           Status    Count
---------           ------    -----
Governance          Approved     24
Governance          Draft         8
Risk Management     Approved     18
Risk Management     Unknown       3
...
```

---

## Integration with GRC System

### Future Enhancements

1. **Auto-Import Approved Docs**
   - Scan for new approved documents
   - Import to system library
   - Link to framework controls

2. **Validation Rules**
   - Check required sections
   - Verify policy code format
   - Validate framework references

3. **Approval Workflow**
   - Draft → Review → Approved flow
   - Automatic naming enforcement
   - Version control integration

---

**Status:** Script ready to run - awaiting initial audit results
