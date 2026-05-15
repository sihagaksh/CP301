'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Organization } from '@/lib/types';
import { parseCSV, triggerDownload, escape } from '@/lib/csv-utils';
import { getAllOrgMembers, getAllOrgPositions, getOrganizations, upsertMemberByEntry, upsertPORByEntry } from '@/lib/db/organizations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface OrgAdminCsvToolsProps {
    org: Organization;
}

type CsvTab = 'members' | 'pors';
type CsvResult = { succeeded: number; failed: { row: string; reason: string }[] };

const ORG_TYPE_LABEL: Record<string, string> = {
    governance_body: 'Governance',
    board: 'Board',
    club: 'Club',
    society: 'Society',
    fest_committee: 'Fest Committee',
};

export function OrgAdminCsvTools({ org }: OrgAdminCsvToolsProps) {
    const [csvTab, setCsvTab] = useState<CsvTab>('members');
    const [isUploading, setIsUploading] = useState(false);
    const [csvResult, setCsvResult] = useState<CsvResult | null>(null);
    const [scopeOrgs, setScopeOrgs] = useState<Organization[]>([]);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    const loadScope = useCallback(async () => {
        const all = await getOrganizations();
        const inScope = all.filter(o => o.id === org.id || o.parentId === org.id);
        setScopeOrgs(inScope);
    }, [org.id]);

    useEffect(() => { loadScope(); }, [loadScope]);

    const scopeIds = scopeOrgs.map(o => o.id);
    const scopeSlugs = new Set(scopeOrgs.map(o => o.slug));

    const copySlug = (slug: string) => {
        navigator.clipboard.writeText(slug).then(() => {
            setCopiedSlug(slug);
            setTimeout(() => setCopiedSlug(null), 1500);
        });
    };

    // ── COLUMN HEADERS ───────────────────────────────────────────────────────────
    const MEMBER_COLS = 'entry_number,org_slug,status';
    const POR_COLS    = 'entry_number,org_slug,title,por_type,valid_from,valid_until,is_active';

    // ── DOWNLOAD — current data ──────────────────────────────────────────────────
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

    // ── DOWNLOAD — enriched templates ────────────────────────────────────────────
    const downloadMemberTemplate = () => {
        const lines: string[] = [];
        lines.push('# MEMBER IMPORT TEMPLATE — ' + org.name);
        lines.push('# ─────────────────────────────────────────────────────────────────────────');
        lines.push('# COLUMN REFERENCE');
        lines.push('#   entry_number  Enrollment no. (students) or Employee ID (faculty/staff)');
        lines.push('#                 Examples:  2022CSB1001  |  EMP-042');
        lines.push('#   org_slug      Unique org identifier — use EXACTLY as shown in the table below');
        lines.push('#   status        approved (default) | pending | removed');
        lines.push('#');
        lines.push('# VALID ORG SLUGS FOR YOUR ACCOUNT (scope: ' + org.name + ')');
        lines.push('#   SLUG' + ' '.repeat(34) + 'NAME');
        lines.push('#   ' + '─'.repeat(70));
        scopeOrgs.forEach(o => {
            const indent = o.parentId ? '  └─ ' : '     ';
            lines.push(`#   ${indent}${o.slug.padEnd(32)} ${o.name}`);
        });
        lines.push('# ─────────────────────────────────────────────────────────────────────────');
        lines.push('# TIP: Lines starting with "#" are comments and are ignored on upload.');
        lines.push('# ─────────────────────────────────────────────────────────────────────────');
        lines.push(MEMBER_COLS);
        // One placeholder row per scoped org so the admin sees both the slug and context
        scopeOrgs.forEach(o => {
            lines.push(`2022CSB1001,${o.slug},approved`);
        });
        triggerDownload(lines.join('\n'), 'member_template.csv');
    };

    const downloadPORTemplate = () => {
        const lines: string[] = [];
        lines.push('# POR (Position of Responsibility) IMPORT TEMPLATE — ' + org.name);
        lines.push('# ─────────────────────────────────────────────────────────────────────────');
        lines.push('# COLUMN REFERENCE');
        lines.push('#   entry_number  Enrollment no. or Employee ID');
        lines.push('#   org_slug      Use EXACTLY as shown in the table below');
        lines.push('#   title         Free-text role title, e.g. President | Joint Secretary');
        lines.push('#   por_type      secretary | representative | coordinator | mentor | custom');
        lines.push('#   valid_from    Start date: YYYY-MM-DD  (e.g. 2024-08-01)');
        lines.push('#   valid_until   End date: YYYY-MM-DD  (leave blank = ongoing)');
        lines.push('#   is_active     true | false');
        lines.push('#');
        lines.push('# VALID ORG SLUGS FOR YOUR ACCOUNT (scope: ' + org.name + ')');
        lines.push('#   SLUG' + ' '.repeat(34) + 'NAME');
        lines.push('#   ' + '─'.repeat(70));
        scopeOrgs.forEach(o => {
            const indent = o.parentId ? '  └─ ' : '     ';
            lines.push(`#   ${indent}${o.slug.padEnd(32)} ${o.name}`);
        });
        lines.push('# ─────────────────────────────────────────────────────────────────────────');
        lines.push('# TIP: Lines starting with "#" are comments and are ignored on upload.');
        lines.push('# ─────────────────────────────────────────────────────────────────────────');
        lines.push(POR_COLS);
        scopeOrgs.forEach(o => {
            lines.push(`2022CSB1001,${o.slug},Secretary,secretary,2024-08-01,,true`);
        });
        triggerDownload(lines.join('\n'), 'por_template.csv');
    };

    // ── UPLOAD — strip comment lines before parsing ──────────────────────────────
    const stripComments = (raw: string) =>
        raw.split('\n').filter(l => !l.trimStart().startsWith('#')).join('\n');

    const handleMemberUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setCsvResult(null); setIsUploading(true);
        const rows = parseCSV(stripComments(await file.text()));

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
        const rows = parseCSV(stripComments(await file.text()));

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
                    is_active: row.is_active !== ''
                        ? (row.is_active.trim().toLowerCase() !== 'false' && row.is_active.trim() !== '0')
                        : true,
                });
                succeeded++;
            } catch (err) {
                failed.push({ row: `${row.entry_number}@${row.org_slug}`, reason: err instanceof Error ? err.message : 'Unknown' });
            }
        }
        setCsvResult({ succeeded, failed });
        setIsUploading(false); e.target.value = '';
    };

    // ── RENDER ───────────────────────────────────────────────────────────────────
    const tabs: { id: CsvTab; label: string }[] = [
        { id: 'members', label: '👥 Members' },
        { id: 'pors',    label: '🎖️ PORs'   },
    ];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h3 className="text-base font-medium">CSV Import / Export</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Bulk manage members and PORs. All operations are idempotent — safe to re-upload.
                </p>
            </div>

            {/* ── Org slug reference table ───────────────────────────────────── */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">

                {/* Header strip */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 flex flex-wrap items-start gap-x-2 gap-y-1">
                    <span className="text-amber-700 dark:text-amber-300 text-sm font-semibold shrink-0">
                        📋 Org Slug Reference
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                        Use the exact slug shown here in the{' '}
                        <code className="font-mono bg-amber-100 dark:bg-amber-900/40 rounded px-1 text-[11px]">org_slug</code>{' '}
                        column. All CSVs are restricted to this scope. Click any slug to copy it.
                    </span>
                </div>

                {/* Table column headings */}
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Organisation</span>
                    <span>Type</span>
                    <span>Slug (click to copy)</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {scopeOrgs.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">Loading scope…</p>
                    )}
                    {scopeOrgs.map(o => (
                        <div
                            key={o.id}
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                            {/* Name + indent */}
                            <div className="flex items-center gap-1.5 min-w-0">
                                {o.parentId && (
                                    <span className="text-zinc-300 dark:text-zinc-600 text-xs shrink-0">└─</span>
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium leading-tight truncate">{o.name}</p>
                                    {o.parentId && (
                                        <p className="text-[11px] text-muted-foreground">child of {org.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Type badge */}
                            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 whitespace-nowrap">
                                {ORG_TYPE_LABEL[o.type] ?? o.type}
                            </span>

                            {/* Slug copy button */}
                            <button
                                onClick={() => copySlug(o.slug)}
                                title="Click to copy"
                                className="flex items-center gap-1.5 font-mono text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 transition-colors whitespace-nowrap"
                            >
                                {copiedSlug === o.slug ? (
                                    <>
                                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                        <span className="text-green-600 dark:text-green-400">copied!</span>
                                    </>
                                ) : (
                                    o.slug
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setCsvTab(tab.id); setCsvResult(null); }}
                        className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            csvTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Members tab ───────────────────────────────────────────────── */}
            {csvTab === 'members' && (
                <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs space-y-2">
                        <p className="font-semibold text-foreground">Columns</p>
                        <div className="font-mono text-muted-foreground">{MEMBER_COLS}</div>
                        <div className="space-y-1 text-muted-foreground leading-relaxed">
                            <p>
                                <span className="font-semibold text-foreground">entry_number</span>
                                {' — '}Enrollment no. (e.g.{' '}
                                <code className="font-mono">2022CSB1001</code>) or Employee ID
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">org_slug</span>
                                {' — '}Must exactly match one of the slugs in the reference table above
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">status</span>
                                {' — '}
                                <code className="font-mono">approved</code> (default) ·{' '}
                                <code className="font-mono">pending</code> ·{' '}
                                <code className="font-mono">removed</code>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-1">
                            <button
                                className="flex items-center gap-1.5 text-primary hover:underline"
                                onClick={downloadMemberTemplate}
                            >
                                <Download className="h-3.5 w-3.5" />
                                Template <span className="text-muted-foreground">(includes slug guide)</span>
                            </button>
                            <span className="text-muted-foreground">·</span>
                            <button
                                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
                                onClick={downloadMembers}
                            >
                                <Download className="h-3.5 w-3.5" />
                                Export current members
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="csv-members-org">Upload CSV</Label>
                        <Input
                            id="csv-members-org"
                            type="file"
                            accept=".csv,text/csv"
                            onChange={handleMemberUpload}
                            disabled={isUploading}
                        />
                    </div>
                </div>
            )}

            {/* ── PORs tab ──────────────────────────────────────────────────── */}
            {csvTab === 'pors' && (
                <div className="space-y-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs space-y-2">
                        <p className="font-semibold text-foreground">Columns</p>
                        <div className="font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
                            {POR_COLS}
                        </div>
                        <div className="space-y-1 text-muted-foreground leading-relaxed">
                            <p>
                                <span className="font-semibold text-foreground">entry_number</span>
                                {' — '}Enrollment no. or Employee ID
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">org_slug</span>
                                {' — '}Must exactly match one of the slugs in the reference table above
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">title</span>
                                {' — '}Free-text role, e.g.{' '}
                                <code className="font-mono">President</code>,{' '}
                                <code className="font-mono">Joint Secretary</code>
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">por_type</span>
                                {' — '}
                                <code className="font-mono">secretary</code> ·{' '}
                                <code className="font-mono">representative</code> ·{' '}
                                <code className="font-mono">coordinator</code> ·{' '}
                                <code className="font-mono">mentor</code> ·{' '}
                                <code className="font-mono">custom</code>
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">valid_from / valid_until</span>
                                {' — '}Dates as{' '}
                                <code className="font-mono">YYYY-MM-DD</code> · leave valid_until blank = ongoing
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">is_active</span>
                                {' — '}
                                <code className="font-mono">true</code> or{' '}
                                <code className="font-mono">false</code>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-1">
                            <button
                                className="flex items-center gap-1.5 text-primary hover:underline"
                                onClick={downloadPORTemplate}
                            >
                                <Download className="h-3.5 w-3.5" />
                                Template <span className="text-muted-foreground">(includes slug guide)</span>
                            </button>
                            <span className="text-muted-foreground">·</span>
                            <button
                                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
                                onClick={downloadPORs}
                            >
                                <Download className="h-3.5 w-3.5" />
                                Export current PORs
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="csv-pors-org">Upload CSV</Label>
                        <Input
                            id="csv-pors-org"
                            type="file"
                            accept=".csv,text/csv"
                            onChange={handlePORUpload}
                            disabled={isUploading}
                        />
                    </div>
                </div>
            )}

            {/* ── Status ────────────────────────────────────────────────────── */}
            {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing rows…
                </div>
            )}
            {csvResult && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-600 dark:text-green-400">
                            {csvResult.succeeded} row{csvResult.succeeded !== 1 ? 's' : ''} succeeded
                        </span>
                        {csvResult.failed.length > 0 && (
                            <span className="text-muted-foreground">
                                · {csvResult.failed.length} failed
                            </span>
                        )}
                    </div>
                    {csvResult.failed.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto text-xs">
                            {csvResult.failed.map((f, i) => (
                                <div key={i} className="flex gap-2">
                                    <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <code className="font-mono">{f.row}</code>: {f.reason}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}