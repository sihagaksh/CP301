'use client';

import React, { useEffect, useRef } from 'react';
import { useNotices } from '@/lib/hooks/useNotices';
import { NoticeCard } from './NoticeCard';
import { Loader2, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoticeCategory, NoticeStatus, NoticePriority } from '@/lib/types';

interface NoticeListProps {
    category?: NoticeCategory | 'all';
    status?: NoticeStatus | 'all';
    priority?: NoticePriority | 'all';
    startDate?: string | null;
    endDate?: string | null;
    search?: string;
    compact?: boolean;
}

export function NoticeList({ category = 'all', status = 'published', priority = 'all', startDate = null, endDate = null, search = '', compact = false }: NoticeListProps) {
    const { notices, loading, error, hasMore, loadMore } = useNotices({ category, status, priority, startDate, endDate, search });

    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = loadMoreRef.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, loadMore]);

    if (error) {
        return (
            <div className="p-8 text-center bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                <p>Error loading notices: {error}</p>
            </div>
        );
    }

    if (!loading && notices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-black/5 dark:bg-white/5 rounded-2xl border border-border border-dashed">
                <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold font-serif mb-1">No Notices Found</h3>
                <p className="text-muted-foreground max-w-sm">
                    {category === 'all'
                        ? "There are currently no active official notices for your profile."
                        : `There are no active notices in the ${category.replace('_', ' ')} category.`}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.map(notice => (
                    <NoticeCard key={notice.id} notice={notice} compact={compact} />
                ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={loadMoreRef} className="flex flex-col justify-center items-center min-h-[80px] mt-6">
                {loading && notices.length > 0 && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        <span className="text-sm font-medium">Loading more notices...</span>
                    </div>
                )}
                {!loading && !hasMore && notices.length > 0 && (
                    <p className="text-sm text-muted-foreground">You have reached the end.</p>
                )}
            </div>
        </div>
    );
}
