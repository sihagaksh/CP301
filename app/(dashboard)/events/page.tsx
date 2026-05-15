'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EventList } from '@/components/features/events/EventList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function EventsPage() {
    const { user, activePositions, selectedIdentityId } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Only faculty/staff OR students posting as an official POR identity can see the create button
    const canPostEvent = !!user && (
        user.role === 'faculty' ||
        user.role === 'staff' ||
        (selectedIdentityId !== null && activePositions !== null && activePositions.some(p => p.id === selectedIdentityId))
    );

    return (
        <div className="max-w-7xl mx-auto py-6 md:py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold font-serif tracking-tight">Campus Events</h1>
                    <p className="text-muted-foreground text-sm max-w-lg">
                        Find out what's happening around campus, from tech workshops to cultural fests.
                    </p>
                </div>

                {isMounted && canPostEvent && (
                    <Button asChild className="shrink-0 font-semibold px-6 rounded-full animate-fade-in">
                        <Link href="/events/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                )}
            </div>

            <EventList />
        </div>
    );
}
