'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Organization } from '@/lib/types';
import { parseCSV, triggerDownload, escape } from '@/lib/csv-utils';
import { getAllOrgMembers, getAllOrgPositions, getOrganizations, upsertMemberByEntry, upsertPORByEntry } from '@/lib/db/organizations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface OrgAdminCsvToolsProps {
    org: Organization;
}

type CsvTab = 'members' | 'pors';
type CsvResult = { succeeded: number; failed: { row: string; reason: string }[] };

export function OrgAdminCsvTools({ org }: OrgAdminCsvToolsProps) {
    const [csvTab, setCsvTab] = useState<CsvTab>('members');
    const [isUploading, setIsUploading] = useState(false);
    const [csvResult, setCsvResult] = useState<CsvResult | null>(null);
    const [scopeOrgs, setScopeOrgs] = useState<Organization[]>([]);

    const loadScope = useCallback(async () => {
        const all = await getOrganizations();
        const inScope = all.filter(o => o.id === org.id || o.parentId === org.id);
        setScopeOrgs(inScope);
    }, [org.id]);

    useEffect(() => { loadScope(); }, [loadScope]);

    const scopeIds = scopeOrgs.map(o => o.id);
    const scopeSlugs = new Set(scopeOrgs.map(o => o.slug));

    // ── DOWNLOAD ──────────────────────────────────────────────

    const MEMBER_COLS = 'entry_number,org_slug,status';
    const POR_COLS = 'entry_number,org_slug,title,por_type,valid_from,valid_until,is_active';

    const downloadMembers = async () => {
        const members = await getAllOrgMembers(scopeIds);
        const rows = members.map(m => [
            escape(m.user?.enrollmentNumber || m.user?.employeeId || ''),
            escape(m.org?.slug ?? ''),
            escape(m.status),
        ].join(','));
        const filename = `${org.slug}_members_${new Date().toISOString().slice(0, 10)}.csv`;
        triggerDownload([MEMBER_COLS, ...rows].join('\n'), filename);
    };

    const downloadMemberTemplate = () => {
        triggerDownload(`${MEMBER_COLS}\n2022CSB1001,${org.slug},approved\n`, 'member_template.csv');
    };

    const downloadPORs = async () => {
        const positions = await getAllOrgPositions(scopeIds);
        const rows = positions.map(p => [
            escape(p.user?.enrollmentNumber || p.user?.employeeId || ''),
            escape(p.org?.slug ?? ''),
            escape(p.title),
            escape(p.porType),
            p.validFrom ? p.validFrom.slice(0, 10) : '',
            p.validUntil ? p.validUntil.slice(0, 10) : '',
            String(p.isActive ?? true),
        ].join(','));
        const filename = `${org.slug}_pors_${new Date().toISOString().slice(0, 10)}.csv`;
        triggerDownload([POR_COLS, ...rows].join('\n'), filename);
    };

    const downloadPORTemplate = () => {
        triggerDownload(`${POR_COLS}\n2022CSB1001,${org.slug},President,secretary,2024-08-01,,true\n`, 'por_template.csv');
    };

    // ── UPLOAD ───────────────────────────────────────────────

    const handleMemberUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setCsvResult(null); setIsUploading(true);
        const rows = parseCSV(await file.text());

        if (!rows.length || !rows[0].entry_number || !rows[0].org_slug) {
            setCsvResult({ succeeded: 0, failed: [{ row: 'header', reason: 'Missing required columns: entry_number, org_slug' }] });
            setIsUploading(false); e.target.value = ''; return;
        }

        // Scope enforcement: reject rows for orgs outside this org's subtree
        const outOfScope = rows.filter(r => !scopeSlugs.has(r.org_slug));
        if (outOfScope.length > 0) {
            const badSlugs = [...new Set(outOfScope.map(r => r.org_slug))].join(', ');
            setCsvResult({ succeeded: 0, failed: [{ row: 'scope-check', reason: `These org slugs are outside your permitted scope: ${badSlugs}` }] });
            setIsUploading(false); e.target.value = ''; return;
        }

        let succeeded = 0;
        const failed: CsvResult['failed'] = [];
        for (const row of rows) {
            try {
                await upsertMemberByEntry({
                    entry_number: row.entry_number,
                    org_slug: row.org_slug,
                    status: row.status ? row.status.trim().toLowerCase() : 'approved',
                });
                succeeded++;
            } catch (err) {
                failed.push({ row: `${row.entry_number}@${row.org_slug}`, reason: err instanceof Error ? err.message : 'Unknown' });
            }
        }
        setCsvResult({ succeeded, failed });
        setIsUploading(false); e.target.value = '';
    };

    const handlePORUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setCsvResult(null); setIsUploading(true);
        const rows = parseCSV(await file.text());

        if (!rows.length || !rows[0].entry_number || !rows[0].org_slug || !rows[0].title) {
            setCsvResult({ succeeded: 0, failed: [{ row: 'header', reason: 'Missing required columns: entry_number, org_slug, title' }] });
            setIsUploading(false); e.target.value = ''; return;
        }

        // Scope enforcement
        const outOfScope = rows.filter(r => !scopeSlugs.has(r.org_slug));
        if (outOfScope.length > 0) {
            const badSlugs = [...new Set(outOfScope.map(r => r.org_slug))].join(', ');
            setCsvResult({ succeeded: 0, failed: [{ row: 'scope-check', reason: `These org slugs are outside your permitted scope: ${badSlugs}` }] });
            setIsUploading(false); e.target.value = ''; return;
        }

        let succeeded = 0;
        const failed: CsvResult['failed'] = [];
        for (const row of rows) {
            try {
                await upsertPORByEntry({
                    entry_number: row.entry_number,
                    org_slug: row.org_slug,
                    title: row.title,
                    por_type: row.por_type ? row.por_type.trim().toLowerCase() : undefined,
                    valid_from: row.valid_from || undefined,
                    valid_until: row.valid_until || undefined,
                    is_active: row.is_active !== '' ? (row.is_active.trim().toLowerCase() !== 'false' && row.is_active.trim() !== '0') : true,
                });
                succeeded++;
            } catch (err) {
                failed.push({ row: `${row.entry_number}@${row.org_slug}`, reason: err instanceof Error ? err.message : 'Unknown' });
            }
        }
        setCsvResult({ succeeded, failed });
        setIsUploading(false); e.target.value = '';
    };

    const tabs: { id: CsvTab; label: string }[] = [
        { id: 'members', label: '👥 Members' },
        { id: 'pors', label: '🎖️ PORs' },
    ];

    const scopeNote = (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            <strong>Scope:</strong> All CSVs are restricted to <strong>{org.name}</strong>
            {scopeOrgs.length > 1 && <> and its {scopeOrgs.length - 1} child org{scopeOrgs.length - 1 !== 1 ? 's' : ''}</>}.
            Rows with org slugs outside this scope will be rejected.
        </p>
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-medium">CSV Import / Export</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Bulk manage members and PORs. All operations are idempotent — safe to re-upload.
                </p>
            </div>

            {scopeNote}

            {/* Tab bar */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setCsvTab(tab.id); setCsvResult(null); }}
                        className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${csvTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Members tab */}
            {csvTab === 'members' && (
                <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs space-y-1.5">
                        <p className="font-semibold text-foreground">Columns</p>
                        <div className="font-mono text-muted-foreground">{MEMBER_COLS}</div>
                        <p className="text-muted-foreground">
                            <span className="font-semibold text-foreground">entry_number:</span> Enrollment or Employee ID ·{' '}
                            <span className="font-semibold text-foreground">status:</span> approved (default) | pending | removed
                        </p>
                        <div className="flex gap-3 pt-1">
                            <button className="flex items-center gap-1.5 text-primary hover:underline" onClick={downloadMemberTemplate}>
                                <Download className="h-3.5 w-3.5" /> Template
                            </button>
                            <span className="text-muted-foreground">·</span>
                            <button className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline" onClick={downloadMembers}>
                                <Download className="h-3.5 w-3.5" /> Export (scoped)
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="csv-members-org">Upload CSV</Label>
                        <Input id="csv-members-org" type="file" accept=".csv,text/csv" onChange={handleMemberUpload} disabled={isUploading} />
                    </div>
                </div>
            )}

            {/* PORs tab */}
            {csvTab === 'pors' && (
                <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs space-y-1.5">
                        <p className="font-semibold text-foreground">Columns</p>
                        <div className="font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">{POR_COLS}</div>
                        <p className="text-muted-foreground">
                            <span className="font-semibold text-foreground">por_type:</span> secretary | representative | coordinator | mentor | custom ·{' '}
                            dates as <span className="font-mono">YYYY-MM-DD</span>
                        </p>
                        <div className="flex gap-3 pt-1">
                            <button className="flex items-center gap-1.5 text-primary hover:underline" onClick={downloadPORTemplate}>
                                <Download className="h-3.5 w-3.5" /> Template
                            </button>
                            <span className="text-muted-foreground">·</span>
                            <button className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline" onClick={downloadPORs}>
                                <Download className="h-3.5 w-3.5" /> Export (scoped)
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="csv-pors-org">Upload CSV</Label>
                        <Input id="csv-pors-org" type="file" accept=".csv,text/csv" onChange={handlePORUpload} disabled={isUploading} />
                    </div>
                </div>
            )}

            {/* Status */}
            {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing rows…
                </div>
            )}
            {csvResult && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-600 dark:text-green-400">{csvResult.succeeded} rows succeeded</span>
                        {csvResult.failed.length > 0 && <span className="text-muted-foreground">· {csvResult.failed.length} failed</span>}
                    </div>
                    {csvResult.failed.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto text-xs">
                            {csvResult.failed.map((f, i) => (
                                <div key={i} className="flex gap-2">
                                    <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span><code className="font-mono">{f.row}</code>: {f.reason}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
