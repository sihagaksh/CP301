'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getOrganizations } from '@/lib/db/organizations';
import type { Organization } from '@/lib/types';
import { getInitials } from '@/lib/utils';

interface OrgAccount {
    id: string;
    email: string;
    full_name: string;
    linked_org_id: string;
    created_at: string;
    org?: { id: string; name: string; slug: string; type: string; logo_url: string | null };
}

export function AdminOrgAccounts() {
    const [accounts, setAccounts] = useState<OrgAccount[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);

    // Form state
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [accountsRes, orgsData] = await Promise.all([
                fetch('/api/admin/org-accounts').then(r => r.json()),
                getOrganizations(),
            ]);
            setAccounts(accountsRes.accounts ?? []);
            setAllOrgs(orgsData);
        } catch (err) {
            console.error('[AdminOrgAccounts] load error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const resetForm = () => {
        setSelectedOrgId('');
        setEmail('');
        setDisplayName('');
        setPassword('');
        setCreateError(null);
        setCreateSuccess(null);
    };

    const handleCreate = async () => {
        if (!selectedOrgId || !email || !displayName || !password) {
            setCreateError('All fields are required.');
            return;
        }
        setIsCreating(true);
        setCreateError(null);
        setCreateSuccess(null);

        try {
            const res = await fetch('/api/admin/org-accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    org_id: selectedOrgId,
                    email,
                    display_name: displayName,
                    password,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setCreateError(data.error ?? 'Failed to create org account.');
            } else {
                setCreateSuccess(`Org account created for ${data.org_name} (${data.email})`);
                await loadData();
                setTimeout(() => {
                    setIsCreateOpen(false);
                    resetForm();
                }, 1500);
            }
        } catch {
            setCreateError('Network error. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    // Orgs that don't already have an account
    const availableOrgs = allOrgs.filter(
        o => !accounts.find(a => a.linked_org_id === o.id)
    );

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium">Organization Accounts</h2>
                    <p className="text-sm text-muted-foreground">
                        Official email accounts for clubs and bodies. Each org can have one dedicated login.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(o) => { setIsCreateOpen(o); if (!o) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Org Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[460px]">
                        <DialogHeader>
                            <DialogTitle>Create Org Account</DialogTitle>
                            <DialogDescription>
                                Create a dedicated login account for an organization. Only one account per org is allowed.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label>Organization</Label>
                                <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an organization…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableOrgs.map(o => (
                                            <SelectItem key={o.id} value={o.id}>
                                                {o.name}
                                                <span className="ml-2 text-xs text-muted-foreground capitalize">
                                                    {o.type.replace('_', ' ')}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Display Name</Label>
                                <Input
                                    placeholder="e.g. BOST Official"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Official Email</Label>
                                <Input
                                    type="email"
                                    placeholder="e.g. bost@iitrpr.ac.in"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    minLength={8}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Share this securely with the org's responsible person.
                                </p>
                            </div>

                            {createError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    {createError}
                                </div>
                            )}
                            {createSuccess && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                    {createSuccess}
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={handleCreate}
                                disabled={isCreating || !selectedOrgId || !email || !displayName || !password}
                            >
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {accounts.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">
                    <Building2 className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No org accounts yet</p>
                    <p className="text-sm mt-1">Create the first one using the button above.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {accounts.map(account => (
                        <div
                            key={account.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={account.org?.logo_url ?? undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                        {getInitials(account.org?.name ?? account.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {account.org?.name ?? account.full_name}
                                        <Badge variant="secondary" className="text-xs capitalize">
                                            {account.org?.type?.replace('_', ' ') ?? 'org'}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{account.email}</div>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Created {new Date(account.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
