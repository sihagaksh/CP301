'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { db } from '@/lib/db/client';
import { Organization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
    ChevronDown,
    ChevronRight,
    Loader2,
    Plus,
    ArrowLeft,
    Upload,
    Download,
    CheckCircle2,
    XCircle,
    Pencil,
} from 'lucide-react';
import { AdminOrgRoster } from './AdminOrgRoster';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getInitials } from '@/lib/utils';

export function AdminOrgManagement() {
    const { fetchAllOrganizations, createNewOrg, updateOrg, bulkUpsertOrgs, bulkUpsertMembers, bulkUpsertPORs, fetchAllMembers, fetchAllPositions, error: adminError } = useAdmin();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedBoards, setExpandedBoards] = useState<Set<string>>(new Set());
    const [managingOrg, setManagingOrg] = useState<Organization | null>(null);

    // Create Org State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [newOrgSlug, setNewOrgSlug] = useState('');
    const [newOrgType, setNewOrgType] = useState<string>('board');
    const [newOrgParentId, setNewOrgParentId] = useState<string>('none');
    const [newOrgDescription, setNewOrgDescription] = useState('');
    const [newOrgInstagram, setNewOrgInstagram] = useState('');
    const [newOrgWebsite, setNewOrgWebsite] = useState('');
    const [newOrgLogoFile, setNewOrgLogoFile] = useState<File | null>(null);
    const [newOrgLogoPreview, setNewOrgLogoPreview] = useState('');
    const [orgFormError, setOrgFormError] = useState<string | null>(null);
    const [newOrgExtraLinks, setNewOrgExtraLinks] = useState<{ key: string; value: string }[]>([]);
    const [newExtraKey, setNewExtraKey] = useState('');
    const [newExtraValue, setNewExtraValue] = useState('');

    // Edit Org State
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editOrgName, setEditOrgName] = useState('');
    const [editOrgSlug, setEditOrgSlug] = useState('');
    const [editOrgType, setEditOrgType] = useState<string>('board');
    const [editOrgParentId, setEditOrgParentId] = useState<string>('none');
    const [editOrgDescription, setEditOrgDescription] = useState('');
    const [editOrgInstagram, setEditOrgInstagram] = useState('');
    const [editOrgWebsite, setEditOrgWebsite] = useState('');
    const [editOrgLogoFile, setEditOrgLogoFile] = useState<File | null>(null);
    const [editOrgLogoPreview, setEditOrgLogoPreview] = useState('');
    const [editOrgExtraLinks, setEditOrgExtraLinks] = useState<{ key: string; value: string }[]>([]);
    const [editExtraKey, setEditExtraKey] = useState('');
    const [editExtraValue, setEditExtraValue] = useState('');

    // CSV Upload State
    type CsvResult = { succeeded: number; failed: { row: string; reason: string }[] };
    const [isCsvOpen, setIsCsvOpen] = useState(false);
    const [csvTab, setCsvTab] = useState<'orgs' | 'members' | 'pors'>('orgs');
    const [isUploading, setIsUploading] = useState(false);
    const [csvResult, setCsvResult] = useState<CsvResult | null>(null);

    const loadData = React.useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        const data = await fetchAllOrganizations();
        setOrganizations(data);
        if (!silent) setIsLoading(false);
    }, [fetchAllOrganizations]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const toggleBoard = (boardId: string) => {
        const next = new Set(expandedBoards);
        if (next.has(boardId)) {
            next.delete(boardId);
        } else {
            next.add(boardId);
        }
        setExpandedBoards(next);
    };

    const normalizeInstagramUrl = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        const handle = trimmed
            .replace(/^@/, '')
            .replace(/^instagram\.com\//i, '')
            .replace(/^www\.instagram\.com\//i, '')
            .split(/[/?#]/)[0];
        return handle ? `https://www.instagram.com/${handle}` : '';
    };

    const normalizeWebsiteUrl = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return `https://${trimmed}`;
    };

    const buildSocialLinks = (
        current: Organization['socialLinks'],
        instagramValue: string,
        websiteValue?: string,
        extraLinks?: { key: string; value: string }[]
    ) => {
        const next = { ...(current ?? {}) } as Record<string, string>;
        const instagram = normalizeInstagramUrl(instagramValue);
        if (instagram) next.instagram = instagram;
        else delete next.instagram;
        if (websiteValue !== undefined) {
            const website = normalizeWebsiteUrl(websiteValue);
            if (website) next.website = website;
            else delete next.website;
        }
        if (extraLinks && extraLinks.length) {
            for (const { key, value } of extraLinks) {
                const k = (key || '').trim();
                if (!k) continue;
                const v = normalizeWebsiteUrl(value || '');
                if (v) next[k] = v;
                else delete next[k];
            }
        }
        return next;
    };

    const uploadOrgLogo = async (file: File, slug: string) => {
        if (!file.type.startsWith('image/')) {
            throw new Error('Please upload an image file.');
        }

        const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
        const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const path = `organizations/${safeSlug}/icon-${Date.now()}.${extension}`;
        const { data: sessionData } = await db.auth.getSession();
        const accessToken = sessionData.session?.access_token;

        if (!accessToken) {
            throw new Error('Please sign in again before uploading an organization icon.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', 'org-icon');
        formData.append('context', JSON.stringify({ orgId: slug })); // Currently logic maps orgSlug to org-icons/slug anyway

        const response = await fetch('/api/media/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData,
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to upload organization icon.');
        }

        return result.publicUrl as string;
    };

    const resetCreateForm = () => {
        setNewOrgName('');
        setNewOrgSlug('');
        setNewOrgType('board');
        setNewOrgParentId('none');
        setNewOrgDescription('');
        setNewOrgInstagram('');
        setNewOrgWebsite('');
        setNewOrgExtraLinks([]);
        setNewExtraKey('');
        setNewExtraValue('');
        setNewOrgLogoFile(null);
        setNewOrgLogoPreview('');
        setOrgFormError(null);
    };

    const openEditOrg = (org: Organization) => {
        setEditingOrg(org);
        setEditOrgName(org.name);
        setEditOrgSlug(org.slug);
        setEditOrgType(org.type);
        setEditOrgParentId(org.parentId ?? 'none');
        setEditOrgDescription(org.description ?? '');
        setEditOrgInstagram(org.socialLinks?.instagram ?? '');
        setEditOrgWebsite(org.socialLinks?.website ?? '');
        // Populate extra links (any social_links keys except instagram and website)
        const extras: { key: string; value: string }[] = [];
        if (org.socialLinks) {
            for (const k of Object.keys(org.socialLinks)) {
                if (k === 'instagram' || k === 'website') continue;
                const v = org.socialLinks[k];
                if (typeof v === 'string' && v.trim()) extras.push({ key: k, value: v });
            }
        }
        setEditOrgExtraLinks(extras);
        setEditExtraKey('');
        setEditExtraValue('');
        setEditOrgLogoFile(null);
        setEditOrgLogoPreview(org.logoUrl ?? '');
        setOrgFormError(null);
    };

    const handleLogoSelect = (
        file: File | undefined,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string>>
    ) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setOrgFormError('Please upload an image file.');
            return;
        }
        setOrgFormError(null);
        setFile(file);
        setPreview(URL.createObjectURL(file));
    };

    // Extra-links helpers (create)
    const addNewExtraLink = () => {
        const key = (newExtraKey || '').trim();
        const value = (newExtraValue || '').trim();
        if (!key || !value) return;
        setNewOrgExtraLinks(prev => [...prev, { key, value }]);
        setNewExtraKey('');
        setNewExtraValue('');
    };
    const removeNewExtraLink = (idx: number) => setNewOrgExtraLinks(prev => prev.filter((_, i) => i !== idx));

    // Extra-links helpers (edit)
    const addEditExtraLink = () => {
        const key = (editExtraKey || '').trim();
        const value = (editExtraValue || '').trim();
        if (!key || !value) return;
        setEditOrgExtraLinks(prev => [...prev, { key, value }]);
        setEditExtraKey('');
        setEditExtraValue('');
    };
    const removeEditExtraLink = (idx: number) => setEditOrgExtraLinks(prev => prev.filter((_, i) => i !== idx));

    const handleCreateOrg = async () => {
        if (!newOrgName || !newOrgSlug || !newOrgType) return;
        setIsCreating(true);
        setOrgFormError(null);

        let logoUrl: string | undefined;
        try {
            if (newOrgLogoFile) {
                logoUrl = await uploadOrgLogo(newOrgLogoFile, newOrgSlug);
            }
        } catch (err) {
            setOrgFormError(err instanceof Error ? err.message : 'Failed to upload organization icon.');
            setIsCreating(false);
            return;
        }

        const newOrg = await createNewOrg({
            name: newOrgName,
            slug: newOrgSlug,
            type: newOrgType as any,
            parentId: newOrgParentId === 'none' ? undefined : newOrgParentId,
            description: newOrgDescription,
            logoUrl,
            socialLinks: buildSocialLinks(undefined, newOrgInstagram, newOrgWebsite, newOrgExtraLinks),
            isActive: true
        });

        if (newOrg) {
            setOrganizations(prev => [...prev, newOrg]);
            setIsCreateOpen(false);
            resetCreateForm();
        }
        setIsCreating(false);
    };

    const handleUpdateOrg = async () => {
        if (!editingOrg || !editOrgName || !editOrgSlug || !editOrgType) return;
        setIsSavingEdit(true);
        setOrgFormError(null);

        let logoUrl = editingOrg.logoUrl;
        try {
            if (editOrgLogoFile) {
                logoUrl = await uploadOrgLogo(editOrgLogoFile, editOrgSlug);
            }
        } catch (err) {
            setOrgFormError(err instanceof Error ? err.message : 'Failed to upload organization icon.');
            setIsSavingEdit(false);
            return;
        }

        const updated = await updateOrg(editingOrg.id, {
            name: editOrgName,
            slug: editOrgSlug,
            type: editOrgType as any,
            parentId: editOrgParentId === 'none' ? undefined : editOrgParentId,
            description: editOrgDescription,
            logoUrl,
            socialLinks: buildSocialLinks(editingOrg.socialLinks, editOrgInstagram, editOrgWebsite, editOrgExtraLinks),
            isActive: editingOrg.isActive,
        });

        if (updated) {
            setOrganizations(prev => prev.map(org => org.id === updated.id ? updated : org));
            setManagingOrg(current => current?.id === updated.id ? updated : current);
            setEditingOrg(null);
            setEditOrgLogoFile(null);
            setOrgFormError(null);
        }

        setIsSavingEdit(false);
    };

    // ------------------------------------
    // CSV helpers
    // ------------------------------------
    // Shared: parse a CSV/TSV file text into an array of {col: value} objects
    const parseCSV = (text: string): Record<string, string>[] => {
        const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return [];

        // Delimiter detection: check first line for tabs vs commas
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
                        // Escaped quote: "" inside a quoted field
                        current += '"';
                        i++; // skip next quote
                    } else {
                        // Toggle quote state
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
                // Strip wrapping quotes if the parser didn't already (for edge cases)
                if (v.startsWith('"') && v.endsWith('"')) {
                    v = v.slice(1, -1).replace(/""/g, '"');
                }
                obj[h] = v;
            });
            return obj;
        });
    };

    const triggerDownload = (csv: string, filename: string) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    const escape = (v: string | undefined | null) => {
        if (!v) return '';
        const str = String(v);
        return str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\t')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };

    // -- ORGS --
    const ORG_COLS = 'id,name,slug,type,parent_id,description,logo_url,email,social_links,founded_year,is_active';

    const handleOrgCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setCsvResult(null); setIsUploading(true);
        const text = await file.text();
        const rawRows = parseCSV(text);
        console.log('[CSV Upload] Parsed rows:', rawRows.length, 'Sample:', rawRows[0]);
        
        if (!rawRows.length) { 
            setCsvResult({ succeeded: 0, failed: [{ row: 'header', reason: 'No data rows found.' }] }); 
            setIsUploading(false); 
            return; 
        }

        if (!rawRows[0].name || !rawRows[0].slug || !rawRows[0].type) {
            setCsvResult({ 
                succeeded: 0, 
                failed: [{ 
                    row: 'header', 
                    reason: `Missing required columns: name, slug, type. Found: ${Object.keys(rawRows[0]).join(', ')}` 
                }] 
            }); 
            setIsUploading(false); 
            return;
        }

        // Topological sort: parents must be uploaded before their children
        const sortByDependency = (rows: Record<string, string>[]): Record<string, string>[] => {
            const idSet = new Set(rows.map(r => r.id).filter(Boolean));
            const sorted: Record<string, string>[] = [];
            const visited = new Set<string>();
            const visit = (row: Record<string, string>) => {
                const rowKey = row.id || row.slug;
                if (visited.has(rowKey)) return;
                visited.add(rowKey);

                if (row.parent_id) {
                    const parent = rows.find(r => r.id === row.parent_id);
                    if (parent && idSet.has(parent.id)) visit(parent);
                }
                sorted.push(row);
            };
            rows.forEach(visit);
            return sorted;
        };

        const rows = sortByDependency(rawRows);
        const rpcPayload = rows.map(r => {
            let parsedSocialLinks = undefined;
            const socialStr = (r.social_links || '').trim();
            if (socialStr !== '') {
                try {
                    // 1. Try JSON parsing (standard case)
                    parsedSocialLinks = JSON.parse(socialStr);
                } catch (err) {
                    // 2. Fallback: Check if it's a raw URL (common mistake in manual CSV edits)
                    if (socialStr.startsWith('http')) {
                        const isInsta = socialStr.includes('instagram.com');
                        parsedSocialLinks = isInsta ? { instagram: socialStr } : { website: socialStr };
                    } else {
                        console.warn(`[CSV] social_links parse failed for ${r.slug}:`, socialStr);
                    }
                }
            }
            return {
                id: r.id || undefined,
                name: r.name, 
                slug: r.slug, 
                type: r.type ? r.type.trim().toLowerCase() : '',
                parent_id: r.parent_id || undefined,
                description: r.description || undefined,
                logo_url: r.logo_url || undefined,
                email: r.email || undefined,
                social_links: parsedSocialLinks,
                founded_year: r.founded_year ? parseInt(r.founded_year, 10) : undefined,
                is_active: r.is_active !== '' ? (r.is_active.trim().toLowerCase() !== 'false' && r.is_active.trim() !== '0') : true,
            };
        });
        console.log('[CSV Upload] RPC payload sample:', rpcPayload.slice(0, 3));

        const result = await bulkUpsertOrgs(rpcPayload as any);
        console.log('[CSV Upload] Result:', result);
        setCsvResult(result);
        // Silent refresh — don't show the full-page spinner; just update data in the background
        if (result.succeeded > 0) await loadData(true);
        setIsUploading(false); e.target.value = '';
    };

    const downloadOrgTemplate = () => {
        triggerDownload(`${ORG_COLS}\nxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx,Students' Gymkhana,students-gymkhana,governance_body,,Apex student body overseeing all student activities at IIT Ropar.,,,,,true\n,Board of Science and Technology,bost,board,xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx,Governs all technical clubs.,,,,,true\n`, 'org_template.csv');
    };

    const downloadCurrentOrgs = () => {
        const slugById: Record<string, string> = {};
        organizations.forEach(o => { slugById[o.id] = o.slug; });
        const rows = organizations.map(o => {
            const hasSocials = o.socialLinks && Object.keys(o.socialLinks).length > 0;
            return [
                escape(o.id), escape(o.name), escape(o.slug), escape(o.type),
                escape(o.parentId ?? ''), escape(o.description), escape(o.logoUrl),
                escape(o.email ?? ''), escape(hasSocials ? JSON.stringify(o.socialLinks) : ''),
                o.foundedYear ?? '', String(o.isActive ?? true)
            ].join(',');
        });
        triggerDownload([ORG_COLS, ...rows].join('\n'), `college_structure_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    // -- MEMBERS --
    const MEMBER_COLS = 'entry_number,org_slug,status';

    const handleMemberCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setCsvResult(null); setIsUploading(true);
        const rows = parseCSV(await file.text());
        if (!rows.length || !rows[0].entry_number || !rows[0].org_slug) {
            setCsvResult({ succeeded: 0, failed: [{ row: 'header', reason: 'Missing required columns: entry_number, org_slug' }] }); setIsUploading(false); return;
        }
        const result = await bulkUpsertMembers(rows.map(r => ({
            entry_number: r.entry_number, org_slug: r.org_slug,
            status: r.status ? r.status.trim().toLowerCase() : 'approved',
        })));
        setCsvResult(result); setIsUploading(false); e.target.value = '';
    };

    const downloadMemberTemplate = () => {
        triggerDownload(`${MEMBER_COLS}\n2022CSB1001,coding-club,approved\n`, 'member_template.csv');
    };

    const downloadCurrentMembers = async () => {
        const members = await fetchAllMembers();
        const rows = members.map(m => [
            escape(m.user?.enrollmentNumber || m.user?.employeeId || ''), escape(m.org?.slug ?? ''), escape(m.status),
        ].join(','));
        triggerDownload([MEMBER_COLS, ...rows].join('\n'), `all_members_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    // -- PORs --
    const POR_COLS = 'entry_number,org_slug,title,por_type,valid_from,valid_until,is_active';

    const handlePORCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setCsvResult(null); setIsUploading(true);
        const rows = parseCSV(await file.text());
        if (!rows.length || !rows[0].entry_number || !rows[0].org_slug || !rows[0].title) {
            setCsvResult({ succeeded: 0, failed: [{ row: 'header', reason: 'Missing required columns: entry_number, org_slug, title' }] }); setIsUploading(false); return;
        }
        const result = await bulkUpsertPORs(rows.map(r => ({
            entry_number: r.entry_number, org_slug: r.org_slug, title: r.title,
            por_type: r.por_type ? r.por_type.trim().toLowerCase() : undefined,
            valid_from: r.valid_from || undefined,
            valid_until: r.valid_until || undefined,
            is_active: r.is_active !== '' ? (r.is_active.trim().toLowerCase() !== 'false' && r.is_active.trim() !== '0') : true,
        })));
        setCsvResult(result); setIsUploading(false); e.target.value = '';
    };

    const downloadPORTemplate = () => {
        triggerDownload(`${POR_COLS}\n2022CSB1001,coding-club,President,secretary,2024-08-01,,true\n`, 'por_template.csv');
    };

    const downloadCurrentPORs = async () => {
        const positions = await fetchAllPositions();
        const rows = positions.map(p => [
            escape(p.user?.enrollmentNumber || p.user?.employeeId || ''), escape(p.org?.slug ?? ''), escape(p.title), escape(p.porType),
            p.validFrom ? p.validFrom.slice(0, 10) : '',
            p.validUntil ? p.validUntil.slice(0, 10) : '',
            String(p.isActive ?? true)
        ].join(','));
        triggerDownload([POR_COLS, ...rows].join('\n'), `all_pors_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Process hierarchy
    const rootOrg = organizations.find(o => o.slug === 'students-gymkhana') || organizations.find(o => !o.parentId);
    const getChildren = (parentId: string) => organizations.filter(o => o.parentId === parentId);

    // Group immediate children of the root (Gymkhana)
    const rootChildren = rootOrg ? getChildren(rootOrg.id) : [];
    const boards = rootChildren.filter(o => o.type === 'board');
    const independentSocieties = rootChildren.filter(o => o.type === 'society' || o.type === 'club');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium">
                        {managingOrg ? `Managing ${managingOrg.name}` : 'College Structure'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {managingOrg
                            ? 'Manage members and assign official Positions of Responsibility.'
                            : 'Manage Boards, Clubs, Societies, and their hierarchical relationships.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {managingOrg ? (
                        <Button variant="outline" onClick={() => setManagingOrg(null)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Structure
                        </Button>
                    ) : (
                        <>
                            {/* ── CSV Bulk Upload Dialog ──────────────────── */}
                            <Dialog open={isCsvOpen} onOpenChange={(o) => { setIsCsvOpen(o); if (!o) setCsvResult(null); }}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Bulk CSV
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[580px]">
                                    <DialogHeader>
                                        <DialogTitle>Bulk Import / Export</DialogTitle>
                                        <DialogDescription>
                                            Upload CSVs to create or update Organizations, Members, and PORs. All operations are idempotent — safe to re-upload.
                                        </DialogDescription>
                                    </DialogHeader>

                                    {/* Tab bar */}
                                    <div className="flex border-b border-zinc-200 dark:border-zinc-800 -mx-6 px-6">
                                        {(['orgs', 'members', 'pors'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => { setCsvTab(tab); setCsvResult(null); }}
                                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${csvTab === tab
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {tab === 'orgs' ? '🏢 Organizations' : tab === 'members' ? '👥 Members' : '🎖️ PORs'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* --- ORGS TAB --- */}
                                    {csvTab === 'orgs' && (
                                        <div className="space-y-3">
                                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs space-y-1.5">
                                                <p className="font-semibold text-foreground">Required columns</p>
                                                <div className="font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">
                                                    id, name, slug, type, parent_id, description, logo_url, email, social_links, founded_year, is_active
                                                </div>
                                                <p className="text-muted-foreground">
                                                    <span className="font-semibold text-foreground">id:</span> leave blank for NEW orgs, use explicit UUID to UPDATE existing.
                                                </p>
                                                <p className="text-muted-foreground">
                                                    <span className="font-semibold text-foreground">type:</span> governance_body | board | club | society | fest_committee &nbsp;|&nbsp; <span className="font-semibold text-foreground">parent_id:</span> blank = top-level
                                                </p>
                                                <div className="flex gap-3 pt-1">
                                                    <button className="flex items-center gap-1.5 text-primary hover:underline" onClick={downloadOrgTemplate}><Download className="h-3.5 w-3.5" /> Template</button>
                                                    <span className="text-muted-foreground">·</span>
                                                    <button className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline" onClick={downloadCurrentOrgs} disabled={organizations.length === 0}><Download className="h-3.5 w-3.5" /> Export current ({organizations.length})</button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="csv-orgs">Upload CSV</Label>
                                                <Input id="csv-orgs" type="file" accept=".csv,text/csv" onChange={handleOrgCsvUpload} disabled={isUploading} />
                                            </div>
                                        </div>
                                    )}

                                    {/* --- MEMBERS TAB --- */}
                                    {csvTab === 'members' && (
                                        <div className="space-y-3">
                                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs space-y-1.5">
                                                <p className="font-semibold text-foreground">Required columns</p>
                                                <div className="font-mono text-muted-foreground">entry_number, org_slug, status</div>
                                                <p className="text-muted-foreground"><span className="font-semibold text-foreground">entry_number:</span> Must match an exact user Enrollment or Employee ID &nbsp;|&nbsp; <span className="font-semibold text-foreground">status:</span> approved (default) | pending | removed</p>
                                                <div className="flex gap-3 pt-1">
                                                    <button className="flex items-center gap-1.5 text-primary hover:underline" onClick={downloadMemberTemplate}><Download className="h-3.5 w-3.5" /> Template</button>
                                                    <span className="text-muted-foreground">·</span>
                                                    <button className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline" onClick={downloadCurrentMembers}><Download className="h-3.5 w-3.5" /> Export all members</button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="csv-members">Upload CSV</Label>
                                                <Input id="csv-members" type="file" accept=".csv,text/csv" onChange={handleMemberCsvUpload} disabled={isUploading} />
                                            </div>
                                        </div>
                                    )}

                                    {/* --- PORs TAB --- */}
                                    {csvTab === 'pors' && (
                                        <div className="space-y-3">
                                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs space-y-1.5">
                                                <p className="font-semibold text-foreground">Required columns</p>
                                                <div className="font-mono text-muted-foreground overflow-x-auto whitespace-nowrap">entry_number, org_slug, title, por_type, valid_from, valid_until, is_active</div>
                                                <p className="text-muted-foreground"><span className="font-semibold text-foreground">entry_number:</span> Must match an exact user Enrollment/Employee ID.</p>
                                                <p className="text-muted-foreground"><span className="font-semibold text-foreground">por_type:</span> secretary | representative | coordinator | mentor | custom &nbsp;|&nbsp; dates as <span className="font-mono">YYYY-MM-DD</span></p>
                                                <div className="flex gap-3 pt-1">
                                                    <button className="flex items-center gap-1.5 text-primary hover:underline" onClick={downloadPORTemplate}><Download className="h-3.5 w-3.5" /> Template</button>
                                                    <span className="text-muted-foreground">·</span>
                                                    <button className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline" onClick={downloadCurrentPORs}><Download className="h-3.5 w-3.5" /> Export all PORs</button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="csv-pors">Upload CSV</Label>
                                                <Input id="csv-pors" type="file" accept=".csv,text/csv" onChange={handlePORCsvUpload} disabled={isUploading} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Shared: upload status + results */}
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
                                </DialogContent>
                            </Dialog>

                            {/* ── New Organization Dialog ─────────────────── */}
                            <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetCreateForm(); }}>
                                <DialogTrigger asChild>
                                    <Button className="bg-primary text-primary-foreground">
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Organization
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Create Organization</DialogTitle>
                                        <DialogDescription>
                                            Add a new board, club, or society to the college structure.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} placeholder="e.g. Cultural Board" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="slug">Slug (URL friendly)</Label>
                                            <Input id="slug" value={newOrgSlug} onChange={e => setNewOrgSlug(e.target.value)} placeholder="e.g. cultural-board" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select value={newOrgType} onValueChange={setNewOrgType}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="governance_body">Governance Body</SelectItem>
                                                    <SelectItem value="board">Board</SelectItem>
                                                    <SelectItem value="club">Club</SelectItem>
                                                    <SelectItem value="society">Society</SelectItem>
                                                    <SelectItem value="fest_committee">Fest Committee</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="parent">Parent Organization</Label>
                                            <Select value={newOrgParentId} onValueChange={setNewOrgParentId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="None (Top Level)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Top Level)</SelectItem>
                                                    {organizations.filter(o => o.type === 'board' || o.type === 'governance_body').map(b => (
                                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea id="description" value={newOrgDescription} onChange={e => setNewOrgDescription(e.target.value)} placeholder="Brief description of the organization..." />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="instagram">Instagram URL</Label>
                                            <Input id="instagram" value={newOrgInstagram} onChange={e => setNewOrgInstagram(e.target.value)} placeholder="https://www.instagram.com/club_handle" />
                                            <p className="text-xs text-muted-foreground">Used as a public link only. The profile picture is not fetched from Instagram.</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="website">Website / Link</Label>
                                            <Input id="website" value={newOrgWebsite} onChange={e => setNewOrgWebsite(e.target.value)} placeholder="https://example.org or example.org" />
                                            <p className="text-xs text-muted-foreground">Optional public website or link for the organization.</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Additional Links</Label>
                                            <div className="flex gap-2">
                                                <Input placeholder="label (e.g., linkedin)" value={newExtraKey} onChange={e => setNewExtraKey(e.target.value)} />
                                                <Input placeholder="https://... or example.com" value={newExtraValue} onChange={e => setNewExtraValue(e.target.value)} />
                                                <Button onClick={addNewExtraLink} variant="outline"><Plus /></Button>
                                            </div>
                                            <div className="space-y-1 mt-2">
                                                {newOrgExtraLinks.map((l, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-muted p-2 rounded">
                                                        <div className="truncate text-sm"><strong>{l.key}</strong>: {l.value}</div>
                                                        <Button size="sm" variant="ghost" onClick={() => removeNewExtraLink(i)}><XCircle /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="logo">Organization icon</Label>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16 border border-border">
                                                    <AvatarImage src={newOrgLogoPreview} className="object-cover" />
                                                    <AvatarFallback className="font-bold">{getInitials(newOrgName || 'Org')}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1.5">
                                                    <Input id="logo" type="file" accept="image/*" onChange={e => handleLogoSelect(e.target.files?.[0], setNewOrgLogoFile, setNewOrgLogoPreview)} />
                                                    <p className="text-xs text-muted-foreground">Upload a square image. It will be shown as a circle in the app.</p>
                                                </div>
                                            </div>
                                        </div>
                                        {(orgFormError || adminError) && (
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
                                                {orgFormError || adminError}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                        <Button onClick={handleCreateOrg} disabled={!newOrgName || !newOrgSlug || isCreating}>
                                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Create
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={!!editingOrg} onOpenChange={(open) => { if (!open) { setEditingOrg(null); setEditOrgLogoFile(null); setOrgFormError(null); } }}>
                                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Edit Organization</DialogTitle>
                                        <DialogDescription>
                                            Update the public profile, Instagram link, and circular icon for this organization.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-name">Name</Label>
                                            <Input id="edit-name" value={editOrgName} onChange={e => setEditOrgName(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-slug">Slug (URL friendly)</Label>
                                            <Input id="edit-slug" value={editOrgSlug} onChange={e => setEditOrgSlug(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-type">Type</Label>
                                            <Select value={editOrgType} onValueChange={setEditOrgType}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="governance_body">Governance Body</SelectItem>
                                                    <SelectItem value="board">Board</SelectItem>
                                                    <SelectItem value="club">Club</SelectItem>
                                                    <SelectItem value="society">Society</SelectItem>
                                                    <SelectItem value="fest_committee">Fest Committee</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-parent">Parent Organization</Label>
                                            <Select value={editOrgParentId} onValueChange={setEditOrgParentId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="None (Top Level)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None (Top Level)</SelectItem>
                                                    {organizations.filter(o => (o.type === 'board' || o.type === 'governance_body') && o.id !== editingOrg?.id).map(b => (
                                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-description">Description</Label>
                                            <Textarea id="edit-description" value={editOrgDescription} onChange={e => setEditOrgDescription(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-instagram">Instagram URL</Label>
                                            <Input id="edit-instagram" value={editOrgInstagram} onChange={e => setEditOrgInstagram(e.target.value)} placeholder="https://www.instagram.com/club_handle" />
                                            <p className="text-xs text-muted-foreground">Used as a public link only. The profile picture is not fetched from Instagram.</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-website">Website / Link</Label>
                                            <Input id="edit-website" value={editOrgWebsite} onChange={e => setEditOrgWebsite(e.target.value)} placeholder="https://example.org or example.org" />
                                            <p className="text-xs text-muted-foreground">Optional public website or link for the organization.</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Additional Links</Label>
                                            <div className="flex gap-2">
                                                <Input placeholder="label (e.g., linkedin)" value={editExtraKey} onChange={e => setEditExtraKey(e.target.value)} />
                                                <Input placeholder="https://... or example.com" value={editExtraValue} onChange={e => setEditExtraValue(e.target.value)} />
                                                <Button onClick={addEditExtraLink} variant="outline"><Plus /></Button>
                                            </div>
                                            <div className="space-y-1 mt-2">
                                                {editOrgExtraLinks.map((l, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-muted p-2 rounded">
                                                        <div className="truncate text-sm"><strong>{l.key}</strong>: {l.value}</div>
                                                        <Button size="sm" variant="ghost" onClick={() => removeEditExtraLink(i)}><XCircle /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-logo">Organization icon</Label>
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16 border border-border">
                                                    <AvatarImage src={editOrgLogoPreview} className="object-cover" />
                                                    <AvatarFallback className="font-bold">{getInitials(editOrgName || 'Org')}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1.5">
                                                    <Input id="edit-logo" type="file" accept="image/*" onChange={e => handleLogoSelect(e.target.files?.[0], setEditOrgLogoFile, setEditOrgLogoPreview)} />
                                                    <p className="text-xs text-muted-foreground">Upload a square image. It will be shown as a circle in the app.</p>
                                                </div>
                                            </div>
                                        </div>
                                        {(orgFormError || adminError) && (
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
                                                {orgFormError || adminError}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <Button variant="outline" onClick={() => setEditingOrg(null)}>Cancel</Button>
                                        <Button onClick={handleUpdateOrg} disabled={!editOrgName || !editOrgSlug || isSavingEdit}>
                                            {isSavingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            Save
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </div>

            {managingOrg ? (
                <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <AdminOrgRoster orgId={managingOrg.id} orgName={managingOrg.name} />
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-4">
                    {!rootOrg ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No organizations found.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Root Organization Header (e.g., Students' Gymkhana) */}
                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border border-primary/10">
                                        <AvatarImage src={rootOrg.logoUrl} className="object-cover" />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(rootOrg.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">{rootOrg.name}</h3>
                                        <p className="text-sm text-muted-foreground">{rootOrg.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => openEditOrg(rootOrg)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setManagingOrg(rootOrg)}
                                    >
                                        Manage Core
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* BOARDS SECTION */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider ml-2">Boards & Councils</h4>
                                    <div className="space-y-2">
                                        {boards.map(board => {
                                            const children = getChildren(board.id);
                                            const isExpanded = expandedBoards.has(board.id);

                                            return (
                                                <div key={board.id} className="space-y-2">
                                                    <div
                                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-colors bg-white dark:bg-zinc-900 shadow-sm"
                                                        onClick={() => toggleBoard(board.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {children.length > 0 ? (
                                                                <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                                </button>
                                                            ) : (
                                                                <div className="w-[26px]" />
                                                            )}
                                                            <Avatar className="h-8 w-8 border border-blue-500/10">
                                                                <AvatarImage src={board.logoUrl} className="object-cover" />
                                                                <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xs font-bold">{getInitials(board.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="font-semibold text-sm">{board.name}</h3>
                                                                <p className="text-xs text-muted-foreground">{children.length} Clubs/Societies</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => { e.stopPropagation(); openEditOrg(board); }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => { e.stopPropagation(); setManagingOrg(board); }}
                                                            >
                                                                Manage
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Board's Clubs */}
                                                    {isExpanded && children.length > 0 && (
                                                        <div className="ml-8 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-2">
                                                            {children.map(child => (
                                                                <div
                                                                    key={child.id}
                                                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="h-6 w-6 border">
                                                                            <AvatarImage src={child.logoUrl} className="object-cover" />
                                                                            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">{getInitials(child.name)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <h4 className="font-medium text-sm">{child.name}</h4>
                                                                    </div>
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 text-xs"
                                                                            onClick={() => openEditOrg(child)}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 text-xs"
                                                                            onClick={() => setManagingOrg(child)}
                                                                        >
                                                                            Manage
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {boards.length === 0 && <div className="text-sm text-muted-foreground ml-2">No boards created yet.</div>}
                                    </div>
                                </div>

                                {/* INDEPENDENT SOCIETIES SECTION */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider ml-2">Independent Societies</h4>
                                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 space-y-1 shadow-sm">
                                        {independentSocieties.map(society => (
                                            <div
                                                key={society.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border border-emerald-500/10">
                                                        <AvatarImage src={society.logoUrl} className="object-cover" />
                                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">{getInitials(society.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-semibold text-sm">{society.name}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditOrg(society)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setManagingOrg(society)}
                                                    >
                                                        Manage
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {independentSocieties.length === 0 && <div className="p-3 text-sm text-muted-foreground text-center">No independent societies found.</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
