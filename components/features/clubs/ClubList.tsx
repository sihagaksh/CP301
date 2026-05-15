'use client';

import React, { useState } from 'react';
import { useOrganizations } from '@/lib/hooks/useOrganizations';
import { ClubCard } from './ClubCard';
import { Loader2, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import type { OrgType, Organization } from '@/lib/types';

const ORG_TYPES: { value: OrgType | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: 'club', label: 'Clubs' },
    { value: 'board', label: 'Boards' },
    { value: 'society', label: 'Societies' },
    { value: 'governance_body', label: 'Governance' },
    { value: 'fest_committee', label: 'Fest Committees' },
];

export function ClubList() {
    const { orgs, loading, error, filterType, setFilterType } = useOrganizations();
    const [expandedBoards, setExpandedBoards] = useState<Set<string>>(new Set());

    const toggleBoard = (boardId: string) => {
        const next = new Set(expandedBoards);
        if (next.has(boardId)) {
            next.delete(boardId);
        } else {
            next.add(boardId);
        }
        setExpandedBoards(next);
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p>Failed to load organizations: {error}</p>
            </div>
        );
    }

    // Flat-list Tree Rendering Component
    const renderTree = () => {
        const rootOrg = orgs.find(o => o.slug === 'students-gymkhana') || orgs.find(o => !o.parentId);
        
        if (!rootOrg) {
            return (
                <div className="text-center p-16 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-1">No hierarchy available</h3>
                    <p className="text-sm text-muted-foreground">The organizations are scattered.</p>
                </div>
            );
        }

        const getChildren = (parentId: string) => orgs.filter(o => o.parentId === parentId);
        const rootChildren = getChildren(rootOrg.id);
        const boards = rootChildren.filter(o => o.type === 'board');
        const independentSocieties = rootChildren.filter(o => o.type === 'society' || o.type === 'club');

        return (
            <div className="space-y-6 animate-fade-in max-w-4xl pt-4">
                {/* Root Organization Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 bg-accent-gold/5 rounded-2xl border border-accent-gold/10 gap-6">
                    {rootOrg.logoUrl ? (
                         <img src={rootOrg.logoUrl} alt={rootOrg.name} className="h-20 w-20 rounded-full border-2 border-accent-gold/20 object-cover" />
                    ) : (
                        <div className="h-20 w-20 rounded-full bg-accent-gold/10 text-accent-gold font-bold flex items-center justify-center text-2xl">
                            {rootOrg.name.charAt(0)}
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="font-bold text-2xl font-serif text-accent-gold mb-1">{rootOrg.name}</h3>
                        <p className="text-sm text-muted-foreground max-w-lg">{rootOrg.description}</p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* BOARDS SECTION */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-2">
                            <div className="w-4 h-[1px] bg-border"></div> Councils & Boards
                        </h4>
                        <div className="space-y-3">
                            {boards.map(board => {
                                const children = getChildren(board.id);
                                const isExpanded = expandedBoards.has(board.id);

                                return (
                                    <div key={board.id} className="space-y-2">
                                        <div
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-colors bg-white dark:bg-zinc-900 shadow-sm"
                                            onClick={() => toggleBoard(board.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {children.length > 0 ? (
                                                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1" onClick={(e) => { e.stopPropagation(); toggleBoard(board.id); }}>
                                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </button>
                                                ) : (
                                                    <div className="w-[26px]" />
                                                )}
                                                {board.logoUrl ? (
                                                    <img src={board.logoUrl} className="h-10 w-10 rounded-full object-cover border" alt={board.name} />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold flex flex-col justify-center items-center">
                                                        {board.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-[15px]">{board.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{children.length} Clubs/Societies</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 pr-2">
                                                <a href={`/clubs/${board.slug}`} className="text-xs font-medium text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                                    View
                                                </a>
                                            </div>
                                        </div>

                                        {/* Board's Clubs */}
                                        {isExpanded && children.length > 0 && (
                                            <div className="ml-8 pl-4 border-l-[1.5px] border-zinc-200 dark:border-zinc-800 space-y-2 py-1">
                                                {children.map(child => (
                                                    <a
                                                        href={`/clubs/${child.slug}`}
                                                        key={child.id}
                                                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                           {child.logoUrl ? (
                                                                <img src={child.logoUrl} className="h-8 w-8 rounded-md object-cover border border-black/5" alt={child.name} />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold flex flex-col justify-center items-center border border-black/5 text-muted-foreground">
                                                                    {child.name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <h4 className="font-semibold text-sm">{child.name}</h4>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-1 rounded-sm transition-opacity">
                                                            {child.memberCount || 0} Members
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* INDEPENDENT SOCIETIES SECTION */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-2">
                             <div className="w-4 h-[1px] bg-border"></div> Independent Societies
                        </h4>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2 shadow-sm">
                            {independentSocieties.map(society => (
                                <a
                                    href={`/clubs/${society.slug}`}
                                    key={society.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group transition-colors flex-1"
                                >
                                    <div className="flex items-center gap-3">
                                        {society.logoUrl ? (
                                             <img src={society.logoUrl} className="h-10 w-10 rounded-full object-cover border border-black/5" alt={society.name} />
                                        ) : (
                                             <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold flex flex-col justify-center items-center border border-black/5 text-muted-foreground">
                                                 {society.name.charAt(0)}
                                             </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-[15px]">{society.name}</h3>
                                            <p className="text-xs text-muted-foreground">{society.memberCount || 0} Members</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        View
                                    </span>
                                </a>
                            ))}
                            {independentSocieties.length === 0 && <div className="p-4 text-sm text-muted-foreground text-center">No independent societies found.</div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filter Tabs */}
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl overflow-x-auto">
                {ORG_TYPES.map(type => (
                    <button
                        key={type.label}
                        onClick={() => setFilterType(type.value)}
                        className={`shrink-0 text-sm font-medium px-5 py-2 rounded-lg transition-all ${filterType === type.value
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && filterType === undefined ? (
                renderTree()
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {!loading && orgs.map(org => (
                            <ClubCard key={org.id} org={org} />
                        ))}
                    </div>

                    {!loading && orgs.length === 0 && (
                        <div className="text-center p-16 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground mb-1">No organizations found</h3>
                            <p className="text-sm text-muted-foreground">Try a different filter.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
