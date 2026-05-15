'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';
import { OrgAdminStructure } from '@/components/features/org-admin/OrgAdminStructure';
import { OrgAdminRoster } from '@/components/features/org-admin/OrgAdminRoster';
import { OrgAdminCsvTools } from '@/components/features/org-admin/OrgAdminCsvTools';
import { useEffect } from 'react';

type OrgAdminTab = 'structure' | 'roster' | 'csv';

const TABS: { id: OrgAdminTab; label: string; desc: string }[] = [
    { id: 'structure', label: 'Our Structure', desc: 'Manage child clubs and org details' },
    { id: 'roster', label: 'Members & PORs', desc: 'Manage members and positions of responsibility' },
    { id: 'csv', label: 'CSV Tools', desc: 'Bulk import and export' },
];

export default function OrgAdminPage() {
    const { user, isOrgAccount, linkedOrg, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<OrgAdminTab>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('orgAdminActiveTab');
            if (saved && TABS.some(t => t.id === saved)) {
                return saved as OrgAdminTab;
            }
        }
        return 'structure';
    });

    useEffect(() => {
        if (!loading && (!user || !isOrgAccount)) {
            router.replace('/');
        }
    }, [user, isOrgAccount, loading, router]);

    const handleTabChange = (id: OrgAdminTab) => {
        setActiveTab(id);
        if (typeof window !== 'undefined') {
            localStorage.setItem('orgAdminActiveTab', id);
        }
    };

    if (loading || !linkedOrg) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <header className="mb-6">
                <div className="flex items-center gap-3 text-primary mb-2">
                    {linkedOrg.logoUrl ? (
                        <img src={linkedOrg.logoUrl} className="h-7 w-7 rounded-full object-cover" alt="" />
                    ) : (
                        <Building2 className="h-6 w-6" />
                    )}
                    <span className="font-medium tracking-wider uppercase text-sm">
                        {linkedOrg.type.replace('_', ' ')}
                    </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-serif text-foreground">
                    {linkedOrg.name}
                </h1>
                <p className="text-muted-foreground text-lg mt-3 max-w-2xl">
                    Organization admin panel.
                </p>
            </header>

            {/* Tab Bar */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl overflow-x-auto w-max">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`shrink-0 text-sm font-medium px-6 py-2.5 rounded-lg transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm dark:bg-zinc-800 dark:text-primary'
                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="pt-2">
                {activeTab === 'structure' && <OrgAdminStructure org={linkedOrg} />}
                {activeTab === 'roster'    && <OrgAdminRoster    org={linkedOrg} />}
                {activeTab === 'csv'       && <OrgAdminCsvTools  org={linkedOrg} />}
            </div>
        </div>
    );
}