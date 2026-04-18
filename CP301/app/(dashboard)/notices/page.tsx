'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NoticeList } from '@/components/features/notices/NoticeList';
import { Button } from '@/components/ui/button';
import { Plus, BellRing, Filter, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import type { NoticeCategory, NoticePriority } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, CalendarIcon } from 'lucide-react';

export default function NoticesPage() {
    const { user, activePositions, selectedIdentityId } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'all'>('all');
    const [selectedPriority, setSelectedPriority] = useState<NoticePriority | 'all'>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Only faculty/staff OR students posting as an official POR identity can see the create button
    const canPostNotice = !!user && (
        user.role === 'faculty' ||
        user.role === 'staff' ||
        (selectedIdentityId !== null && activePositions !== null && activePositions.some(p => p.id === selectedIdentityId))
    );

    const categories: { label: string; value: NoticeCategory | 'all' }[] = [
        { label: 'All Categories', value: 'all' },
        { label: 'Academic', value: 'academic' },
        { label: 'Admin', value: 'administrative' },
        { label: 'Placement', value: 'placement' },
        { label: 'Hostel', value: 'hostel' },
    ];

    const priorities: { label: string; value: NoticePriority | 'all' }[] = [
        { label: 'All Priorities', value: 'all' },
        { label: 'Urgent', value: 'urgent' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
    ];

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black font-serif tracking-tight text-foreground flex items-center gap-3">
                        <BellRing className="w-8 h-8 text-accent-gold" />
                        Official Notices
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-xl">
                        Official announcements, deadlines, and communications from the institute administration and students' gymkhana.
                    </p>
                </div>

                {isMounted && canPostNotice && (
                    <Button asChild className="shrink-0 font-semibold px-6 rounded-full">
                        <Link href="/notices/create">
                            <Plus className="w-4 h-4 mr-2" /> Publish Notice
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-4 mb-8 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Status Tabs (Only visible to authors) */}
                    {isMounted && canPostNotice ? (
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'published' | 'draft')} className="w-full md:w-auto shrink-0">
                            <TabsList className="bg-black/5 dark:bg-black/20 p-1">
                                <TabsTrigger value="published" className="rounded-md px-6">Published</TabsTrigger>
                                <TabsTrigger value="draft" className="rounded-md px-6">My Drafts</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    ) : (
                        <div className="hidden md:block"></div>
                    )}
                    
                    <div className="flex-1 w-full md:max-w-xs relative ml-0 md:ml-4">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search notices, posters..." 
                            className="pl-9 bg-background w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
                        {isMounted ? (
                            <>
                                <Select
                                    value={selectedCategory}
                                    onValueChange={(val) => setSelectedCategory(val as NoticeCategory | 'all')}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px] bg-background">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedPriority}
                                    onValueChange={(val) => setSelectedPriority(val as NoticePriority | 'all')}
                                >
                                    <SelectTrigger className="w-full sm:w-[140px] bg-background">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map((prio) => (
                                            <SelectItem key={prio.value} value={prio.value}>
                                                {prio.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full sm:w-auto gap-2 text-muted-foreground bg-background">
                                            <CalendarIcon className="w-4 h-4" /> 
                                            {(startDate || endDate) ? 'Dates Active' : 'Advanced Dates'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-4" align="end">
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm leading-none flex items-center gap-2">
                                                Filter by Datetime
                                            </h4>
                                            <p className="text-xs text-muted-foreground">Select a range to find notices published between these inclusive dates.</p>
                                            
                                            <div className="grid gap-2">
                                                <Label htmlFor="date-from" className="text-xs">From (Start Date)</Label>
                                                <Input 
                                                    id="date-from" 
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="date-to" className="text-xs">To (End Date)</Label>
                                                <Input 
                                                    id="date-to" 
                                                    type="date" 
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="pt-2 flex justify-end">
                                                <Button size="sm" variant="ghost" onClick={() => { setStartDate(''); setEndDate(''); }}>
                                                    Clear All
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </>
                        ) : (
                            <div className="w-full sm:w-[200px] h-10 rounded-md bg-muted animate-pulse"></div>
                        )}
                    </div>
                </div>
            </div>

            <NoticeList 
                category={selectedCategory} 
                status={activeTab} 
                priority={selectedPriority} 
                startDate={startDate ? new Date(startDate).toISOString() : null}
                endDate={endDate ? new Date(endDate).toISOString() : null}
                search={debouncedSearch}
            />
        </div>
    );
}
