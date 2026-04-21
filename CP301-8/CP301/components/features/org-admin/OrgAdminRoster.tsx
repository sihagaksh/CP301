'use client';

import React, { useState, useEffect } from 'react';
import { Organization } from '@/lib/types';
import { getOrganizations } from '@/lib/db/organizations';
import { AdminOrgRoster } from '@/components/features/admin/AdminOrgRoster';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface OrgAdminRosterProps {
    org: Organization;
}

export function OrgAdminRoster({ org }: OrgAdminRosterProps) {
    const [scopeOrgs, setScopeOrgs] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState(org.id);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const all = await getOrganizations();
            // Scope: own org + direct children only
            const inScope = all.filter(o => o.id === org.id || o.parentId === org.id);
            setScopeOrgs(inScope);
            setSelectedOrgId(org.id);
            setIsLoading(false);
        };
        load();
    }, [org.id]);

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    const selectedOrg = scopeOrgs.find(o => o.id === selectedOrgId);

    return (
        <div className="space-y-6">
            {/* Org selector */}
            {scopeOrgs.length > 1 && (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground shrink-0">Managing:</span>
                    <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {scopeOrgs.map(o => (
                                <SelectItem key={o.id} value={o.id}>
                                    {o.name}
                                    {o.id === org.id && (
                                        <span className="ml-2 text-xs text-muted-foreground">(Your org)</span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Reuse AdminOrgRoster exactly — just pass the selected orgId */}
            {selectedOrg && (
                <AdminOrgRoster orgId={selectedOrg.id} orgName={selectedOrg.name} />
            )}
        </div>
    );
}
