'use client';

import React, { useState, useEffect } from 'react';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Search, Mail, GraduationCap, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { AlumniRequest } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db';

export function AdminAlumniManagement() {
    const [requests, setRequests] = useState<AlumniRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<AlumniRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isResolving, setIsResolving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error: dbError } = await db
                .from('alumni_requests')
                .select(`
                    id,
                    user_id,
                    personal_email,
                    status,
                    created_at,
                    resolved_at,
                    user:users!alumni_requests_user_id_fkey(id, email, full_name, role, department, batch)
                `)
                .order('created_at', { ascending: false });

            if (dbError) throw dbError;

            // Map snake_case → camelCase
            const mapped: AlumniRequest[] = (data || []).map((row: any) => {
                const rawUser = Array.isArray(row.user) ? row.user[0] : row.user;
                return {
                    id: row.id,
                    userId: row.user_id,
                    personalEmail: row.personal_email,
                    status: row.status,
                    createdAt: row.created_at,
                    updatedAt: row.created_at,
                    resolvedAt: row.resolved_at,
                    user: rawUser ? {
                        id: rawUser.id,
                        email: rawUser.email,
                        fullName: rawUser.full_name,
                        role: rawUser.role,
                        department: rawUser.department,
                        batch: rawUser.batch,
                    } as any : undefined,
                };
            });

            setRequests(mapped);
        } catch (err: any) {
            console.error('[AdminAlumniManagement] load error:', err);
            setError(err?.message || 'Failed to load requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadRequests(); }, []);

    useEffect(() => {
        let filtered = requests;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                (r.user as any)?.fullName?.toLowerCase().includes(q) ||
                r.personalEmail.toLowerCase().includes(q) ||
                (r.user as any)?.email?.toLowerCase().includes(q)
            );
        }
        setFilteredRequests(filtered);
    }, [requests, statusFilter, searchQuery]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? new Set(filteredRequests.map(r => r.id)) : new Set());
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const s = new Set(selectedIds);
        checked ? s.add(id) : s.delete(id);
        setSelectedIds(s);
    };

    const handleBulkAction = async (status: 'approved' | 'rejected') => {
        if (selectedIds.size === 0) return;
        const msg = status === 'approved'
            ? `Approve ${selectedIds.size} request(s)? This immediately converts their accounts to Alumni.`
            : `Reject ${selectedIds.size} request(s)?`;
        if (!confirm(msg)) return;

        setIsResolving(true);
        setError('');
        try {
            const { data: { session } } = await db.auth.getSession();
            const res = await fetch('/api/admin/alumni-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : '',
                },
                body: JSON.stringify({ requestIds: Array.from(selectedIds), status }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed');
            setSelectedIds(new Set());
            await loadRequests();
        } catch (err: any) {
            setError(err?.message || `Failed to ${status} requests.`);
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold font-serif">Alumni Requests</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review and approve student requests to convert their accounts to Alumni status.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadRequests} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
                    {error}
                </div>
            )}

            <GlassSurface className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 w-full sm:w-auto flex-1">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name or email..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {statusFilter === 'pending' && selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm font-medium mr-2">{selectedIds.size} selected</span>
                        <Button
                            variant="outline" size="sm"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={() => handleBulkAction('approved')}
                            disabled={isResolving}
                        >
                            {isResolving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Approve
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            onClick={() => handleBulkAction('rejected')}
                            disabled={isResolving}
                        >
                            {isResolving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Reject
                        </Button>
                    </div>
                )}
            </GlassSurface>

            <div className="bg-background border rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-xs">
                        <tr>
                            {statusFilter === 'pending' && (
                                <th className="px-4 py-3 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-zinc-300 dark:border-zinc-700"
                                        checked={filteredRequests.length > 0 && selectedIds.size === filteredRequests.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Current Email</th>
                            <th className="px-4 py-3">Personal Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Date Applied</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    Loading requests...
                                </td>
                            </tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No {statusFilter !== 'all' ? statusFilter : ''} requests found.
                                </td>
                            </tr>
                        ) : filteredRequests.map(req => (
                            <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                {statusFilter === 'pending' && (
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-zinc-300 dark:border-zinc-700"
                                            checked={selectedIds.has(req.id)}
                                            onChange={(e) => handleSelectRow(req.id, e.target.checked)}
                                        />
                                    </td>
                                )}
                                <td className="px-4 py-3 font-medium">
                                    <div>{(req.user as any)?.fullName || 'Unknown User'}</div>
                                    {(req.user as any)?.department && (
                                        <div className="text-xs text-muted-foreground">
                                            {(req.user as any).department} · {(req.user as any).batch}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {(req.user as any)?.email}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium text-foreground">{req.personalEmail}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}
                                        className={req.status === 'approved' ? 'bg-emerald-500' : 'capitalize'}
                                    >
                                        {req.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right text-muted-foreground">
                                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
