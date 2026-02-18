param(
  [string]$Root = "C:\Users\YasserElshishiny\Nextcloud\Policies & Procedures",
  [int]$OldDays = 365,
  [string]$OutDir = "C:\Users\YasserElshishiny\Nextcloud\GRC-PolicyFactory-System\reports"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$now = Get-Date
$oldCutoff = $now.AddDays(-$OldDays)

# Keywords (edit if your naming conventions differ)
$approvedKW = @("approved","bod","board","signed","final","issued")
$draftKW    = @("draft","wip","review","pending","inprogress","in progress","for review")
$oldKW      = @("old","archive","archived","deprecated","obsolete","superseded")

function Get-Status($fullPath, $name, $lastWrite) {
  $hay = ($fullPath + " " + $name).ToLowerInvariant()

  if ($approvedKW | Where-Object { $hay -match [regex]::Escape($_) }) { return "Approved" }
  if ($draftKW    | Where-Object { $hay -match [regex]::Escape($_) }) { return "Draft" }
  if ($oldKW      | Where-Object { $hay -match [regex]::Escape($_) }) { return "Old" }
  if ($lastWrite -lt $oldCutoff) { return "Old" }
  return "Unknown"
}

# Choose what you consider "documents"
$docExt = @(".pdf",".docx",".doc",".xlsx",".xls",".pptx",".ppt",".txt",".md")

$files = Get-ChildItem -Path $Root -Recurse -File |
  Where-Object { $docExt -contains $_.Extension.ToLowerInvariant() }

if (-not $files) {
  Write-Host "No documents found under: $Root"
  exit 0
}

$rows = foreach ($f in $files) {
  $status = Get-Status $f.FullName $f.Name $f.LastWriteTime
  [pscustomobject]@{
    Status        = $status
    Name          = $f.Name
    Extension     = $f.Extension
    SizeKB        = [math]::Round($f.Length / 1KB, 2)
    LastWriteTime = $f.LastWriteTime
    RelativePath  = $f.FullName.Substring($Root.Length).TrimStart("\")
    FullPath      = $f.FullName
  }
}

# File-level report
$timestamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
$csvPath = Join-Path $OutDir "policy_audit_$timestamp.csv"
$rows | Sort-Object Status, RelativePath | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $csvPath

# Summary with exact percentages
$total = $rows.Count
$summary = $rows | Group-Object Status | ForEach-Object {
  $count = $_.Count
  $pct = [math]::Round(($count * 100.0) / $total, 2)
  [pscustomobject]@{
    Status = $_.Name
    Count  = $count
    Percent = "$pct`%"
  }
} | Sort-Object Status

# Folder breakdown (top-level folders)
$folderSummary = $rows | ForEach-Object {
  $top = ($_."RelativePath" -split "\\")[0]
  if ([string]::IsNullOrWhiteSpace($top)) { $top = "(root)" }
  [pscustomobject]@{ TopFolder = $top; Status = $_.Status }
} | Group-Object TopFolder, Status | ForEach-Object {
  $parts = $_.Name -split ", "
  [pscustomobject]@{
    TopFolder = $parts[0]
    Status    = $parts[1]
    Count     = $_.Count
  }
} | Sort-Object TopFolder, Status

# Save summary to text
$summaryPath = Join-Path $OutDir "policy_audit_summary_$timestamp.txt"
@(
  "Root: $Root"
  "OldDays threshold: $OldDays (Older than $oldCutoff considered Old if not otherwise classified)"
  "Total documents: $total"
  ""
  "=== Overall Status Summary ==="
  ($summary | Format-Table -AutoSize | Out-String)
  ""
  "=== Top Folder Breakdown (Counts) ==="
  ($folderSummary | Format-Table -AutoSize | Out-String)
  ""
  "CSV Report: $csvPath"
) | Set-Content -Encoding UTF8 -Path $summaryPath

Write-Host ""
Write-Host "DONE ✅"
Write-Host "Summary: $summaryPath"
Write-Host "CSV:     $csvPath"
Write-Host ""
Write-Host "Overall:"
$summary | Format-Table -AutoSize
