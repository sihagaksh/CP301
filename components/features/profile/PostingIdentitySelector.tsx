'use client';

import React from 'react';
import { Check, ChevronsUpDown, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface PostingIdentitySelectorProps {
    className?: string;
    triggerClassName?: string;
    allowPersonal?: boolean;
}

export function PostingIdentitySelector({
    className,
    triggerClassName,
    allowPersonal = true,
}: PostingIdentitySelectorProps) {
    const { user, activePositions, selectedIdentityId, setSelectedIdentityId } = useAuth();

    if (!user) return null;

    // Only active PORs can be used for posting
    const activePORs = (activePositions ?? []).filter((p) => p.isActive);

    // — No PORs: show static badge ————————————————————————————
    if (activePORs.length === 0) {
        if (!allowPersonal) {
            return (
                <div className={cn('flex items-center gap-2', className)}>
                    <span className="text-xs font-medium text-red-500 whitespace-nowrap hidden sm:inline-block">
                        Posting Error:
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 h-8">
                        <span className="text-xs font-medium text-red-700 dark:text-red-400">
                            No Official Identity available
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className={cn('flex items-center gap-2', className)}>
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                    Posting as:
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-black/8 dark:border-white/8 h-8">
                    <div className="h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground">
                        {user.fullName?.split(' ')[0] || 'Personal'}
                    </span>
                </div>
            </div>
        );
    }

    // — Resolve selected position details ————————————————————————
    const selectedPos = selectedIdentityId
        ? activePORs.find((p) => p.id === selectedIdentityId)
        : null;

    const triggerLabel = selectedPos
        ? `${selectedPos.title}${selectedPos.org?.name ? `, ${selectedPos.org.name}` : ''}`
        : `Personal (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})`;

    const isOfficial = !!selectedPos;

    return (
        <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                Posting as:
            </span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        role="combobox"
                        className={cn(
                            'w-[130px] sm:w-[220px] justify-between h-8 px-2 transition-colors',
                            isOfficial
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                                : 'bg-surface border-black/8 dark:border-white/8',
                            triggerClassName
                        )}
                    >
                        <div className="flex items-center gap-2 truncate min-w-0">
                            {isOfficial ? (
                                <Shield className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            ) : (
                                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate text-xs font-medium">{triggerLabel}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-[280px] p-1">

                    {/* Personal Option */}
                    {allowPersonal && (
                        <button
                            onClick={() => setSelectedIdentityId(null)}
                            className={cn(
                                'w-full flex items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                                selectedIdentityId === null
                                    ? 'bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-600'
                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            )}
                        >
                            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0">
                                <User className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">Personal Identity</p>
                                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                                    Post as a regular {user.role}
                                </p>
                            </div>
                            {selectedIdentityId === null && (
                                <Check className="h-4 w-4 text-zinc-500 shrink-0 mt-1" />
                            )}
                        </button>
                    )}

                    {/* Official Positions */}
                    {activePORs.length > 0 && (
                        <>
                            <DropdownMenuSeparator className="my-1" />
                            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Official Positions
                            </p>

                            {activePORs.map((position) => {
                                const isSelected = selectedIdentityId === position.id;
                                return (
                                    <button
                                        key={position.id}
                                        onClick={() => setSelectedIdentityId(position.id)}
                                        className={cn(
                                            'w-full flex items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                                            isSelected
                                                ? 'bg-amber-50 dark:bg-amber-900/25 ring-1 ring-amber-300 dark:ring-amber-700'
                                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                                        )}
                                    >
                                        <div className={cn(
                                            'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full shrink-0',
                                            isSelected
                                                ? 'bg-amber-100 dark:bg-amber-900/40'
                                                : 'bg-zinc-100 dark:bg-zinc-800'
                                        )}>
                                            <Shield className={cn(
                                                'h-4 w-4',
                                                isSelected
                                                    ? 'text-amber-600 dark:text-amber-400'
                                                    : 'text-zinc-400 dark:text-zinc-500'
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                'text-sm font-semibold leading-tight truncate',
                                                isSelected
                                                    ? 'text-amber-800 dark:text-amber-200'
                                                    : 'text-foreground'
                                            )}>
                                                {position.title}
                                            </p>
                                            {position.org?.name && (
                                                <p className={cn(
                                                    'text-xs mt-0.5 truncate',
                                                    isSelected
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-muted-foreground'
                                                )}>
                                                    {position.org.name}
                                                </p>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
                                        )}
                                    </button>
                                );
                            })}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
