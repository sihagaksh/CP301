'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BlogCategory, BlogPost } from '@/lib/types';
import { BlogCard } from './BlogCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { MessageSquareOff, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { db } from '@/lib/db';

interface BlogListProps {
    blogs: BlogPost[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    category: BlogCategory | undefined;
    setCategory: (cat: BlogCategory | undefined) => void;
    sort?: 'newest' | 'popular';
    setSort?: (s: 'newest' | 'popular') => void;
    tag?: string | null;
    setTag?: (t: string | null) => void;
    authorId?: string | null;
    setAuthorId?: (id: string | null) => void;
    keyword?: string | null;
    setKeyword?: (k: string | null) => void;
    startDate?: string | null;
    setStartDate?: (d: string | null) => void;
    endDate?: string | null;
    setEndDate?: (d: string | null) => void;
    hiringType?: string | null;
    setHiringType?: (t: string | null) => void;
}

const CATEGORIES: { label: string; value: BlogCategory | undefined }[] = [
    { label: 'All', value: undefined },
    { label: 'Placement', value: 'placement' },
    { label: 'Internship', value: 'internship' },
    { label: 'Faculty Insight', value: 'faculty_insight' },
    { label: 'Alumni Exp', value: 'alumni_experience' },
    { label: 'Research', value: 'research' },
    { label: 'General', value: 'general' },
];

export function BlogList({
    blogs, loading, hasMore, loadMore,
    category, setCategory,
    sort = 'newest', setSort,
    tag, setTag,
    authorId, setAuthorId,
    keyword, setKeyword,
    startDate, setStartDate,
    endDate, setEndDate,
    hiringType, setHiringType
}: BlogListProps) {
    const [localKeyword, setLocalKeyword] = useState(keyword || '');
    const [authorQuery, setAuthorQuery] = useState('');
    const [authorResults, setAuthorResults] = useState<{ id: string; full_name: string; profile_picture_url?: string }[]>([]);
    const [authorSearching, setAuthorSearching] = useState(false);
    const authorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isCustomDate, setIsCustomDate] = useState(!!(startDate || endDate));

    useEffect(() => {
        setLocalKeyword(keyword || '');
    }, [keyword]);

    useEffect(() => {
        if (startDate || endDate) setIsCustomDate(true);
    }, [startDate, endDate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localKeyword !== (keyword || '')) {
                setKeyword?.(localKeyword || null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localKeyword, keyword, setKeyword]);

    function onAuthorQueryChange(val: string) {
        setAuthorQuery(val);
        if (authorTimer.current) clearTimeout(authorTimer.current);
        authorTimer.current = setTimeout(() => searchAuthors(val), 300);
    }

    async function searchAuthors(q: string) {
        if (!q.trim()) { setAuthorResults([]); return; }
        setAuthorSearching(true);
        const { data } = await db.from('users').select('id, full_name, profile_picture_url').ilike('full_name', `%${q}%`).limit(8);
        setAuthorResults(data || []);
        setAuthorSearching(false);
    }

    const hasActiveFilters = !!(category || tag || authorId || keyword || startDate || endDate || (sort && sort !== 'newest'));

    function clearAll() {
        if (setCategory) setCategory(undefined);
        if (setTag) setTag(null);
        if (setAuthorId) setAuthorId(null);
        if (setKeyword) setKeyword(null);
        if (setSort) setSort('newest');
        if (setStartDate) setStartDate(null);
        if (setEndDate) setEndDate(null);
        if (setHiringType) setHiringType(null);
        setAuthorQuery('');
        setLocalKeyword('');
        setIsCustomDate(false);
    }

    // Skeleton loader for initial or sequential loading
    const renderSkeletons = () => (
        Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-card border border-border overflow-hidden ring-1 ring-border/50">
                <div className="h-36 sm:h-48 bg-muted/50" />
                <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                        <div className="h-4 w-16 bg-muted/50 rounded" />
                        <div className="h-4 w-20 bg-muted/50 rounded" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-5 w-full bg-muted/50 rounded" />
                        <div className="h-5 w-3/4 bg-muted/50 rounded" />
                    </div>
                </div>
            </div>
        ))
    );

    return (
        <div className="space-y-10 min-h-[800px]">
            {/* Filter Section - Stable Layout */}
            <div className="space-y-6">
                <div className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 gap-4 items-start transition-all duration-300",
                    (category === 'placement' || category === 'internship') ? "lg:grid-cols-5" : "lg:grid-cols-4"
                )}>
                    {/* 1. Category Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest opacity-70">Category</label>
                        <Select value={category || 'all'} onValueChange={(val) => setCategory(val === 'all' ? undefined : val as BlogCategory)}>
                            <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-card h-12 focus:ring-amber-500/20 transition-all hover:border-amber-500/30">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.label} value={cat.value || 'all'}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* 1.5 Hiring Context (Conditional) */}
                    {(category === 'placement' || category === 'internship') && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                           <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 ml-1 uppercase tracking-widest opacity-70">Hiring Context</label>
                           <Select value={hiringType || 'all'} onValueChange={(val) => setHiringType?.(val === 'all' ? null : val)}>
                               <SelectTrigger className="rounded-xl border-amber-200 dark:border-amber-900/30 bg-amber-500/5 h-12 focus:ring-amber-500/20 transition-all hover:border-amber-500/50">
                                   <SelectValue placeholder="All Contexts" />
                               </SelectTrigger>
                               <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                   <SelectItem value="all">All Contexts</SelectItem>
                                   <SelectItem value="on_campus">On-Campus</SelectItem>
                                   <SelectItem value="off_campus">Off-Campus</SelectItem>
                               </SelectContent>
                           </Select>
                        </div>
                    )}

                    {/* 2. Sort Selection + Advanced Date Option */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest opacity-70">Sort & Time</label>
                        <div className="space-y-3">
                            <Select
                                value={isCustomDate ? 'custom' : sort}
                                onValueChange={(val) => {
                                    if (val === 'custom') {
                                        setIsCustomDate(true);
                                    } else {
                                        setIsCustomDate(false);
                                        setSort?.(val as 'newest' | 'popular');
                                        setStartDate?.(null);
                                        setEndDate?.(null);
                                    }
                                }}
                            >
                                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-card h-12 focus:ring-amber-500/20 transition-all hover:border-amber-500/30 font-medium">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="popular">Most Popular</SelectItem>
                                    <SelectItem value="custom">Advanced: Date Range</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Advanced Date Inputs (Revealed when 'custom' or dates set) */}
                            {isCustomDate && (
                                <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <Input
                                        type="date"
                                        value={startDate || ''}
                                        onChange={(e) => setStartDate?.(e.target.value || null)}
                                        className="h-9 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-card/50"
                                    />
                                    <Input
                                        type="date"
                                        value={endDate || ''}
                                        onChange={(e) => setEndDate?.(e.target.value || null)}
                                        className="h-9 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-card/50"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Keyword Search */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest opacity-70">Keyword</label>
                        <div className="relative">
                            <Input
                                value={localKeyword}
                                onChange={(e) => setLocalKeyword(e.target.value)}
                                placeholder="Title or Company..."
                                className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-card h-12 pr-10 focus-visible:ring-amber-500/20 transition-all hover:border-amber-500/30"
                            />
                            {localKeyword && (
                                <button
                                    onClick={() => setLocalKeyword('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                                >
                                    <MessageSquareOff size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 4. Author Search */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-muted-foreground ml-1 uppercase tracking-widest opacity-70">Author</label>
                        <div className="relative">
                            <Input
                                value={authorId ? (blogs.find(b => b.authorId === authorId)?.author?.fullName || 'Selected Author') : authorQuery}
                                onChange={(e) => !authorId && onAuthorQueryChange(e.target.value)}
                                onFocus={() => authorId && setAuthorId?.(null)}
                                placeholder={authorId ? 'Click to change author' : "Search authors..."}
                                className={cn(
                                    "rounded-xl border-zinc-200 dark:border-zinc-800 bg-card h-12 transition-all hover:border-amber-500/30",
                                    authorId ? "text-amber-600 dark:text-amber-400 font-medium cursor-pointer" : ""
                                )}
                            />
                            {authorSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Spinner className="h-3 w-3" />
                                </div>
                            )}
                        </div>

                        {authorResults.length > 0 && !authorId && (
                            <div className="absolute left-0 right-0 z-50 top-[100%] mt-2 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card shadow-2xl p-1 animate-in fade-in zoom-in duration-200 backdrop-blur-md">
                                {authorResults.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => {
                                            setAuthorId?.(a.id);
                                            setAuthorQuery('');
                                            setAuthorResults([]);
                                        }}
                                        className="w-full text-left flex items-center gap-2.5 p-2.5 hover:bg-muted rounded-lg transition-colors"
                                    >
                                        <Avatar className="h-7 w-7 flex-shrink-0 border border-border">
                                            <AvatarImage src={a.profile_picture_url} />
                                            <AvatarFallback className="text-[10px] bg-amber-500/10 text-amber-600">
                                                {(a.full_name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm font-medium truncate text-foreground">{a.full_name}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid of Blog Cards - Min Height to prevent shaking */}
            <div className="min-h-[600px] relative">
                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
                        {blogs.map((blog) => (
                            <BlogCard key={blog.id || blog.slug} blog={blog} />
                        ))}
                        {loading && renderSkeletons()}
                    </div>
                ) : (
                    !loading && (
                        <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in scale-95 duration-500">
                            <div className="w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-6 ring-1 ring-border">
                                <MessageSquareOff size={40} className="text-muted-foreground opacity-30" />
                            </div>
                            <h3 className="font-serif font-bold text-2xl text-foreground mb-3">No blogs matching your filters</h3>
                            <p className="text-muted-foreground max-w-sm text-sm">
                                Try adjusting your search keyword or date range to find more interview experiences and insights.
                            </p>
                            <Button variant="outline" size="sm" onClick={clearAll} className="mt-8 rounded-full">
                                Clear all filters
                            </Button>
                        </div>
                    )
                )}

                {/* Initial Loading Page State */}
                {loading && blogs.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        {renderSkeletons()}
                    </div>
                )}

                {/* Load More Button */}
                {blogs.length > 0 && hasMore && (
                    <div className="flex justify-center pt-16">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={loadMore}
                            disabled={loading}
                            className="min-w-[240px] rounded-full border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                        >
                            {loading ? <Spinner className="mr-2" /> : (
                                <>
                                    <span>Load More Experiences</span>
                                    <ChevronDown className="ml-2 w-4 h-4 transition-transform group-hover:translate-y-1" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
