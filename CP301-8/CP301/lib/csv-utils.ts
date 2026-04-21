// ============================================================
// lib/csv-utils.ts
// Shared CSV parsing and download utilities.
// Used by both AdminOrgManagement (super-admin) and OrgAdminCsvTools (org-admin).
// Extracted from AdminOrgManagement.tsx as part of org-accounts implementation.
// ============================================================

/**
 * Parse a CSV or TSV text string into an array of row objects.
 * Auto-detects comma vs tab delimiter from the header row.
 * Handles quoted fields (including escaped double-quotes inside quotes).
 */
export function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    const parseRow = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
        const vals = parseRow(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
            let v = (vals[i] ?? '').trim();
            if (v.startsWith('"') && v.endsWith('"')) {
                v = v.slice(1, -1).replace(/""/g, '"');
            }
            obj[h] = v;
        });
        return obj;
    });
}

/**
 * Trigger a browser download of a CSV string as a file.
 */
export function triggerDownload(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Escape a value for safe inclusion in a CSV cell.
 * Wraps in quotes if the value contains commas, quotes, newlines, or tabs.
 */
export function escape(v: string | undefined | null): string {
    if (!v) return '';
    const str = String(v);
    return str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\t')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
}