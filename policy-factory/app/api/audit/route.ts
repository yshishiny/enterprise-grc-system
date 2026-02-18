import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const auditDir = path.join(process.cwd(), 'data', 'audit');

    // Find latest CSV file
    const files = fs.readdirSync(auditDir).filter(f => f.startsWith('policy_audit_') && f.endsWith('.csv'));
    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No audit data found. Run the audit script first.' }, { status: 404 });
    }

    files.sort().reverse();
    const latestCsv = path.join(auditDir, files[0]);
    const csvContent = fs.readFileSync(latestCsv, 'utf-8');

    // Parse CSV
    const lines = csvContent.split('\n').filter(l => l.trim());
    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    }).filter(r => r.Status);

    // Build summary
    const total = rows.length;
    const statusCounts: Record<string, number> = {};
    rows.forEach(r => {
      statusCounts[r.Status] = (statusCounts[r.Status] || 0) + 1;
    });

    const statusSummary = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percent: Math.round((count / total) * 10000) / 100
    })).sort((a, b) => a.status.localeCompare(b.status));

    // Folder breakdown
    const folderData: Record<string, Record<string, number>> = {};
    rows.forEach(r => {
      const parts = r.RelativePath?.split('\\') || [];
      const topFolder = parts.length > 1 ? parts[0] : '(root)';
      if (!folderData[topFolder]) folderData[topFolder] = {};
      folderData[topFolder][r.Status] = (folderData[topFolder][r.Status] || 0) + 1;
    });

    const folderSummary = Object.entries(folderData).map(([folder, statuses]) => ({
      folder,
      total: Object.values(statuses).reduce((a, b) => a + b, 0),
      ...statuses
    })).sort((a, b) => b.total - a.total);

    // Extension breakdown
    const extCounts: Record<string, number> = {};
    rows.forEach(r => {
      const ext = r.Extension || 'unknown';
      extCounts[ext] = (extCounts[ext] || 0) + 1;
    });

    // Timestamp from filename
    const tsMatch = files[0].match(/(\d{8}-\d{6})/);
    const scanDate = tsMatch ? tsMatch[1].replace(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5:$6') : 'Unknown';

    return NextResponse.json({
      success: true,
      scanDate,
      total,
      statusSummary,
      folderSummary,
      extensionBreakdown: Object.entries(extCounts).map(([ext, count]) => ({ ext, count })),
      documents: rows.map(r => ({
        status: r.Status,
        name: r.Name,
        extension: r.Extension,
        sizeKB: parseFloat(r.SizeKB) || 0,
        lastModified: r.LastWriteTime,
        relativePath: r.RelativePath
      }))
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
