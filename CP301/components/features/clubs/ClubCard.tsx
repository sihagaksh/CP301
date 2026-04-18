import React from 'react';
import Link from 'next/link';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import type { Organization } from '@/lib/types';

interface ClubCardProps {
    org: Organization;
}

const orgTypeLabels: Record<string, string> = {
    club: 'Club',
    board: 'Board',
    society: 'Society',
    governance_body: 'Governance',
    fest_committee: 'Fest Committee',
};

export function ClubCard({ org }: ClubCardProps) {
    return (
        <Link href={`/clubs/${org.slug}`} className="block group h-full">
            <GlassSurface className="h-full flex flex-col items-center text-center p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-white/5 hover:-translate-y-1">
                <Avatar className="h-20 w-20 border-2 border-border mb-4 transition-transform duration-300 group-hover:scale-110">
                    <AvatarImage src={org.logoUrl} className="object-cover" />
                    <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-2xl font-bold">{getInitials(org.name)}</AvatarFallback>
                </Avatar>

                <div className="flex flex-wrap justify-center items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                        {orgTypeLabels[org.type] || org.type}
                    </Badge>
                    {org.type === 'board' || org.type === 'governance_body' ? (
                        <Badge variant="outline" className="text-[10px] font-semibold tracking-wider border-primary/50 text-primary bg-primary/5">
                            {org.childCount ?? 0} {org.type === 'board' ? 'Clubs' : 'Entities'}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-[10px] font-semibold tracking-wider border-accent-gold/50 text-accent-gold bg-accent-gold/5">
                            {org.memberCount ?? 0} {org.memberCount === 1 ? 'Member' : 'Members'}
                        </Badge>
                    )}
                </div>

                <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-accent-gold transition-colors line-clamp-2 mb-1">
                    {org.name}
                </h3>

                {org.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {org.description}
                    </p>
                )}

                {org.foundedYear && (
                    <div className="mt-auto pt-4 text-xs font-medium text-muted-foreground">
                        <span>Est. {org.foundedYear}</span>
                    </div>
                )}
            </GlassSurface>
        </Link>
    );
}
