'use client';

import React, { useState, useEffect } from 'react';
import { Organization } from '@/lib/types';
import { getOrganizations, createOrganization, updateOrganization } from '@/lib/db/organizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Building2 } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { db } from '@/lib/db/client';

interface OrgAdminStructureProps {
    org: Organization;
}

export function OrgAdminStructure({ org }: OrgAdminStructureProps) {
    const [children, setChildren] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);

    // ── Edit dialog (controlled — lives outside OrgCard so state won't unmount it) ──
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
    const [editLogoPreview, setEditLogoPreview] = useState('');

    // ── Create child dialog ──────────────────────────────────────────────────
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [newType, setNewType] = useState('club');
    const [newDescription, setNewDescription] = useState('');
    const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
    const [newLogoPreview, setNewLogoPreview] = useState('');

    const load = async () => {
        setIsLoading(true);
        const all = await getOrganizations();
        setChildren(all.filter(o => o.parentId === org.id));
        setIsLoading(false);
    };

    useEffect(() => { load(); }, [org.id]);

    // ── Upload helper ────────────────────────────────────────────────────────
    const uploadLogo = async (file: File, slug: string): Promise<string> => {
        const { data: sessionData } = await db.auth.getSession();
        const token = sessionData.session?.access_token;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', 'org-icon');
        formData.append('context', JSON.stringify({ orgId: slug }));
        const res = await fetch('/api/media/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error ?? 'Logo upload failed');
        return result.publicUrl as string;
    };

    // ── Create handlers ──────────────────────────────────────────────────────
    const resetCreateForm = () => {
        setNewName(''); setNewSlug(''); setNewType('club');
        setNewDescription(''); setNewLogoFile(null); setNewLogoPreview(''); setFormError(null);
    };

    const handleCreate = async () => {
        if (!newName || !newSlug) { setFormError('Name and slug are required.'); return; }
        setIsCreating(true);
        setFormError(null);
        try {
            let logoUrl: string | undefined;
            if (newLogoFile) logoUrl = await uploadLogo(newLogoFile, newSlug);
            const created = await createOrganization({
                name: newName,
                slug: newSlug,
                type: newType as Organization['type'],
                parentId: org.id,
                description: newDescription || undefined,
                logoUrl,
                isActive: true,
            });
            if (created) {
                setChildren(prev => [...prev, created]);
                setIsCreateOpen(false);
                resetCreateForm();
            }
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to create organization.');
        } finally {
            setIsCreating(false);
        }
    };

    // ── Edit handlers ────────────────────────────────────────────────────────
    const openEdit = (target: Organization) => {
        setEditingOrg(target);
        setEditName(target.name);
        setEditDescription(target.description ?? '');
        setEditLogoFile(null);
        setEditLogoPreview(target.logoUrl ?? '');
        setFormError(null);
    };

    const closeEdit = () => {
        setEditingOrg(null);
        setFormError(null);
    };

    const handleEdit = async () => {
        if (!editingOrg || !editName) return;
        setIsSaving(true);
        setFormError(null);
        try {
            let logoUrl = editingOrg.logoUrl;
            if (editLogoFile) logoUrl = await uploadLogo(editLogoFile, editingOrg.slug);
            const updated = await updateOrganization(editingOrg.id, {
                name: editName,
                description: editDescription || undefined,
                logoUrl,
            });
            if (updated) {
                await load();
                closeEdit();
            }
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-base font-medium">Your Organization + Children</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Edit details or create new clubs under {org.name}.
                    </p>
                </div>
                <Button size="sm" onClick={() => { resetCreateForm(); setIsCreateOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Child Org
                </Button>
            </div>

            {/* ── Org list ── */}
            <div className="space-y-2">
                {/* Own org card */}
                <OrgCard target={org} isRoot onEdit={openEdit} />
                {/* Children */}
                {children.length > 0 ? (
                    <div className="ml-6 space-y-2 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4">
                        {children.map(child => (
                            <OrgCard key={child.id} target={child} onEdit={openEdit} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground ml-6 py-3 pl-4 border-l-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        No child organizations yet. Create one above.
                    </p>
                )}
            </div>

            {/* ── Edit dialog — rendered ONCE here, not inside OrgCard ── */}
            <Dialog open={!!editingOrg} onOpenChange={(open) => { if (!open) closeEdit(); }}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Edit {editingOrg?.name}</DialogTitle>
                        <DialogDescription>Update details for this organization.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Organization name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={editDescription}
                                onChange={e => setEditDescription(e.target.value)}
                                rows={3}
                                placeholder="What does this org do?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            {editLogoPreview && (
                                <img src={editLogoPreview} className="h-12 w-12 object-cover rounded-lg border mb-2" alt="" />
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) { setEditLogoFile(f); setEditLogoPreview(URL.createObjectURL(f)); }
                                }}
                            />
                        </div>
                        {formError && <p className="text-sm text-red-500">{formError}</p>}
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={closeEdit} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={handleEdit} disabled={isSaving || !editName}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Create child dialog ── */}
            <Dialog open={isCreateOpen} onOpenChange={o => { setIsCreateOpen(o); if (!o) resetCreateForm(); }}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle>Create Child Organization</DialogTitle>
                        <DialogDescription>
                            Create a new club or society under <strong>{org.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="e.g. Programming Club"
                                value={newName}
                                onChange={e => {
                                    setNewName(e.target.value);
                                    if (!newSlug) setNewSlug(
                                        e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                    );
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug (URL identifier)</Label>
                            <Input
                                placeholder="e.g. programming-club"
                                value={newSlug}
                                onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={newType} onValueChange={setNewType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="club">Club</SelectItem>
                                    <SelectItem value="society">Society</SelectItem>
                                    <SelectItem value="fest_committee">Fest Committee</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Textarea
                                placeholder="What does this org do?"
                                value={newDescription}
                                onChange={e => setNewDescription(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo (optional)</Label>
                            {newLogoPreview && (
                                <img src={newLogoPreview} className="h-12 w-12 rounded-lg border object-cover mb-2" alt="" />
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) { setNewLogoFile(f); setNewLogoPreview(URL.createObjectURL(f)); }
                                }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            Parent will be locked to: <strong>{org.name}</strong>
                        </p>
                        {formError && <p className="text-sm text-red-500">{formError}</p>}
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => { setIsCreateOpen(false); resetCreateForm(); }} disabled={isCreating}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={handleCreate} disabled={isCreating || !newName || !newSlug}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Organization
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ── OrgCard — defined OUTSIDE OrgAdminStructure so it has a stable reference ──
// Receives onEdit as a prop; never owns dialog state itself.
function OrgCard({
    target,
    isRoot,
    onEdit,
}: {
    target: Organization;
    isRoot?: boolean;
    onEdit: (org: Organization) => void;
}) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-zinc-900/50
            ${isRoot ? 'border-primary/40 dark:border-primary/30' : 'border-zinc-200 dark:border-zinc-800'}`}>
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={target.logoUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(target.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2 font-medium">
                        {target.name}
                        {isRoot && <Badge variant="secondary" className="text-xs">Your Org</Badge>}
                        <Badge variant="outline" className="text-xs capitalize">
                            {target.type.replace('_', ' ')}
                        </Badge>
                    </div>
                    {target.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-sm line-clamp-1">
                            {target.description}
                        </p>
                    )}
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(target)}
            >
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
    );
}
