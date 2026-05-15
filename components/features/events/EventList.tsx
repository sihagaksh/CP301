'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEvents } from '@/lib/hooks/useEvents';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarHeart, Search as SearchIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EventList() {
    const { events, loading, error, hasMore, loadMore, filters, updateFilters } = useEvents({ limit: 10 });
    const [searchOpen, setSearchOpen] = React.useState(false);

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
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <p>Failed to load events: {error}</p>
            </div>
        );
    }

    const categories = [
        { label: 'All Types', value: 'all' },
        { label: 'Workshop / Tech', value: 'workshop' },
        { label: 'Cultural', value: 'cultural' },
        { label: 'Seminar', value: 'seminar' },
        { label: 'Club Event', value: 'club_event' },
        { label: 'Sports', value: 'sports' },
        { label: 'Fest', value: 'fest' },
        { label: 'General / Official', value: 'general' }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Advanced Filter Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-border">
                <div className="flex-1 w-full relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search events, organizers, venues..." 
                        className="pl-9 bg-background w-full"
                        value={filters.search || ''}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Select
                        value={(filters.type as string) || 'all'}
                        onValueChange={(val) => updateFilters({ type: val as any })}
                    >
                        <SelectTrigger className="w-full sm:w-[180px] bg-background">
                            <SelectValue placeholder="Event Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto gap-2 text-muted-foreground bg-background">
                                <CalendarHeart className="w-4 h-4" /> 
                                {(filters.startDate || filters.endDate) ? 'Dates Active' : 'Advanced Dates'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm leading-none flex items-center gap-2">
                                    Filter by Event Date
                                </h4>
                                <p className="text-xs text-muted-foreground">Select a range to find events occurring between these inclusive dates.</p>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="date-from-event" className="text-xs">From (Start Date)</Label>
                                    <Input 
                                        id="date-from-event" 
                                        type="datetime-local"
                                        value={filters.startDate ? filters.startDate.slice(0, 16) : ''}
                                        onChange={(e) => updateFilters({ startDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date-to-event" className="text-xs">To (End Date)</Label>
                                    <Input 
                                        id="date-to-event" 
                                        type="datetime-local" 
                                        value={filters.endDate ? filters.endDate.slice(0, 16) : ''}
                                        onChange={(e) => updateFilters({ endDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                    />
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <Button size="sm" variant="ghost" onClick={() => updateFilters({ startDate: null, endDate: null })}>
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            {loading && events.length === 0 && (
                <div className="flex justify-center p-12 col-span-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {!loading && events.length === 0 && (
                <div className="text-center p-12 bg-white/50 dark:bg-white/5 border border-dashed rounded-xl border-black/10 dark:border-white/10 col-span-full">
                    <CalendarHeart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium text-foreground">No upcoming events</h3>
                    <p className="text-sm text-muted-foreground mt-1">There are no upcoming events matching your filters right now.</p>
                </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={loadMoreRef} className="pt-4 flex justify-center col-span-full min-h-[40px]">
                {loading && events.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading more events...</span>
                    </div>
                )}
                {!loading && !hasMore && events.length > 0 && (
                     <p className="text-sm text-muted-foreground p-4">You have reached the end.</p>
                )}
            </div>
        </div>
    );
}
