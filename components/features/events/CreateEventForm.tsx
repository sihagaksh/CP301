'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { useEvents } from '@/lib/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, AlertCircle, MapPin, Link as LinkIcon, Calendar, UploadCloud, X, FileText, Image as ImageIcon, ShieldCheck, Shield, User, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EventType } from '@/lib/types';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CreateEventForm() {
    const router = useRouter();
    const { addEvent } = useEvents();
    const { user, activePositions, selectedIdentityId, setSelectedIdentityId } = useAuth();

    const canPostPersonal = user?.role === 'faculty' || user?.role === 'staff';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (!user) return;
        const canPostEvent = user.role === 'faculty' || 
                             user.role === 'staff' || 
                             (selectedIdentityId !== null && activePositions !== null && activePositions.some(p => p.id === selectedIdentityId));
                             
        if (!canPostEvent) {
            router.replace('/events');
        }
    }, [user, selectedIdentityId, activePositions, router]);

    // Form payload
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<EventType>('club_event');
    const [startDateStr, setStartDateStr] = useState('');
    const [startTimeStr, setStartTimeStr] = useState('');
    const [venueName, setVenueName] = useState('');
    const [registrationUrl, setRegistrationUrl] = useState('');
    const [tagsStr, setTagsStr] = useState('');

    // Media
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [venueMapFile, setVenueMapFile] = useState<File | null>(null);

    const uploadMedia = async (file: File, kind: 'event-cover' | 'event-poster' | 'event-venue-map', eventIdOrUndefined?: string): Promise<string> => {
         const { data: sessionData } = await (await import('@/lib/db/client')).db.auth.getSession();
         const accessToken = sessionData.session?.access_token;
         if (!accessToken) throw new Error('Not authenticated properly.');

         const formData = new FormData();
         formData.append('file', file);
         formData.append('kind', kind);
         // If creating a new event, we don't have the event ID yet, leave it empty to trigger 'draft' prefixing
         formData.append('context', JSON.stringify({ eventId: eventIdOrUndefined })); 

         const res = await fetch('/api/media/upload', {
             method: 'POST',
             headers: { Authorization: `Bearer ${accessToken}` },
             body: formData
         });

         const json = await res.json();
         if (!res.ok) throw new Error(json.error || `Failed to upload ${kind}`);
         return json.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !startDateStr || !startTimeStr || !venueName.trim()) {
            setError('Title, description, date, time, and venue are required.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        // Construct full ISO string for start time
        const startDateTimeStr = `${startDateStr}T${startTimeStr}:00`;
        let startTime;
        try {
            startTime = new Date(startDateTimeStr).toISOString();
        } catch (e) {
            setError('Invalid date or time format.');
            setIsSubmitting(false);
            return;
        }

        const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

        // The event must be linked to the currently selected official organization
        // For events, a selected POR org is mandatory for students.
        const organizerId = activePositions?.find(p => p.id === selectedIdentityId)?.orgId;

        if (!canPostPersonal && !organizerId) {
            setError('You must select an official organization position to publish an event.');
            return;
        }

        try {
            let coverImageUrl: string | undefined = undefined;
            let posterUrl: string | undefined = undefined;
            let venueMapUrl: string | undefined = undefined;

            if (coverImageFile) {
                coverImageUrl = await uploadMedia(coverImageFile, 'event-cover');
            }
            if (posterFile) {
                posterUrl = await uploadMedia(posterFile, 'event-poster');
            }
            if (venueMapFile) {
                venueMapUrl = await uploadMedia(venueMapFile, 'event-venue-map');
            }

            const success = await addEvent({
                title,
                description,
                type,
                startTime,
                venueName,
                registrationUrl: registrationUrl || undefined,
                tags,
                organizerId, // Will be null if posting as personal
                coverImageUrl,
                posterUrl,
                venueMapUrl
            });

            if (success) {
                router.push('/events');
            } else {
                setError('Failed to publish event. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to publish event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/events"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-serif tracking-tight">Create an Event</h1>
                        <p className="text-sm text-muted-foreground">List a new event on the campus calendar.</p>
                    </div>
                </div>
            </div>

            <GlassSurface className="p-6 sm:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex flex-col gap-1">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-accent-gold" /> Organizing Identity <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Select the official Club/Board position you are organizing this event for.
                            </p>
                        </div>

                        {(() => {
                            const selectedPos = selectedIdentityId ? activePositions?.find(p => p.id === selectedIdentityId) : null;
                            const triggerLabel = selectedPos
                                ? `${selectedPos.title}${selectedPos.org?.name ? `, ${selectedPos.org.name}` : ''}`
                                : canPostPersonal ? `Personal (${user?.role})` : 'Select identity';
                            const isOfficial = !!selectedPos;
                            return (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className={cn(
                                                'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                                                isOfficial
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                                                    : 'bg-black/5 dark:bg-white/5 border-border text-foreground'
                                            )}
                                        >
                                            <span className="flex items-center gap-2 truncate">
                                                {isOfficial
                                                    ? <Shield className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                    : <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                                                <span className="truncate font-medium">{triggerLabel}</span>
                                            </span>
                                            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[280px] p-1">
                                        {canPostPersonal && (
                                            <DropdownMenuItem
                                                className={cn(
                                                    'flex items-center gap-2.5 rounded-md px-3 py-2 cursor-pointer',
                                                    selectedIdentityId === null && 'bg-zinc-100 dark:bg-zinc-800'
                                                )}
                                                onClick={() => setSelectedIdentityId(null)}
                                            >
                                                <User className="h-4 w-4 text-zinc-500 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium capitalize">Personal ({user?.role})</p>
                                                    <p className="text-xs text-muted-foreground">Post as yourself</p>
                                                </div>
                                                {selectedIdentityId === null && <Check className="h-4 w-4 text-zinc-500 shrink-0" />}
                                            </DropdownMenuItem>
                                        )}
                                        {activePositions && activePositions.length > 0 && <DropdownMenuSeparator />}
                                        {activePositions?.map(pos => {
                                            const isSel = selectedIdentityId === pos.id;
                                            return (
                                                <DropdownMenuItem
                                                    key={pos.id}
                                                    className={cn(
                                                        'flex items-center gap-2.5 rounded-md px-3 py-2 cursor-pointer',
                                                        isSel && 'bg-amber-50 dark:bg-amber-900/25'
                                                    )}
                                                    onClick={() => setSelectedIdentityId(pos.id)}
                                                >
                                                    <Shield className={cn('h-4 w-4 shrink-0', isSel ? 'text-amber-500' : 'text-zinc-400')} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn('text-sm font-semibold truncate', isSel ? 'text-amber-800 dark:text-amber-200' : '')}>{pos.title}</p>
                                                        {pos.org?.name && <p className={cn('text-xs truncate', isSel ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>{pos.org.name}</p>}
                                                    </div>
                                                    {isSel && <Check className="h-4 w-4 text-amber-500 shrink-0" />}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        })()}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-base">Event Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Intro to Machine Learning Workshop"
                            className="font-medium text-lg py-6"
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="type">Event Type</Label>
                            <select
                                id="type"
                                value={type}
                                onChange={e => setType(e.target.value as EventType)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="club_event">Club Event</option>
                                <option value="workshop">Workshop</option>
                                <option value="seminar">Seminar / Guest Lecture</option>
                                <option value="fest">Fest / Department Day</option>
                                <option value="sports">Sports Match</option>
                                <option value="music">Music / Cultural</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Event Date <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    id="startDate"
                                    value={startDateStr}
                                    onChange={e => setStartDateStr(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                            <Input
                                type="time"
                                id="startTime"
                                value={startTimeStr}
                                onChange={e => setStartTimeStr(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="venueName">Venue / Location <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="venueName"
                                value={venueName}
                                onChange={e => setVenueName(e.target.value)}
                                placeholder="e.g. L1, Lecture Hall Complex"
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Event Description <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What is this event about? What should attendees bring?"
                            rows={5}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="registrationUrl">Registration Link (Optional)</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="url"
                                id="registrationUrl"
                                value={registrationUrl}
                                onChange={e => setRegistrationUrl(e.target.value)}
                                placeholder="https://forms.gle/..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (Optional)</Label>
                        <Input
                            id="tags"
                            value={tagsStr}
                            onChange={e => setTagsStr(e.target.value)}
                            placeholder="e.g. coding, pizza, ai (comma separated)"
                        />
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <h3 className="text-base font-bold font-serif mb-4 flex items-center gap-2">
                             <ImageIcon className="w-5 h-5 text-muted-foreground" /> Media & Attachments
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {/* Cover Image */}
                             <div className="space-y-2">
                                <Label className="text-sm">Cover Image</Label>
                                <div className="border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative h-32">
                                    {coverImagePreview ? (
                                        <>
                                            <img src={coverImagePreview} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                                            <button type="button" onClick={() => { setCoverImageFile(null); setCoverImagePreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                           <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                           <span className="text-xs text-muted-foreground">Main banner (Image)</span>
                                           <Input 
                                               type="file" 
                                               accept="image/*" 
                                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                               onChange={e => {
                                                   if (e.target.files?.[0]) {
                                                       setCoverImageFile(e.target.files[0]);
                                                       setCoverImagePreview(URL.createObjectURL(e.target.files[0]));
                                                   }
                                               }}
                                            />
                                        </>
                                    )}
                                </div>
                             </div>

                             {/* Event Poster */}
                             <div className="space-y-2">
                                <Label className="text-sm">Event Poster</Label>
                                <div className="border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative h-32">
                                    {posterFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-6 h-6 text-blue-500" />
                                            <span className="text-xs font-medium truncate max-w-[150px]">{posterFile.name}</span>
                                            <button type="button" onClick={() => setPosterFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                                        </div>
                                    ) : (
                                        <>
                                           <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                           <span className="text-xs text-muted-foreground">Brochure/Poster (PDF or Image)</span>
                                           <Input 
                                               type="file" 
                                               accept="image/*,application/pdf" 
                                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                               onChange={e => e.target.files?.[0] && setPosterFile(e.target.files[0])}
                                            />
                                        </>
                                    )}
                                </div>
                             </div>

                             {/* Venue Map */}
                             <div className="space-y-2">
                                <Label className="text-sm">Venue Map</Label>
                                <div className="border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative h-32">
                                    {venueMapFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-6 h-6 text-emerald-500" />
                                            <span className="text-xs font-medium truncate max-w-[150px]">{venueMapFile.name}</span>
                                            <button type="button" onClick={() => setVenueMapFile(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                                        </div>
                                    ) : (
                                        <>
                                           <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                           <span className="text-xs text-muted-foreground">Directions map (PDF or Image)</span>
                                           <Input 
                                               type="file" 
                                               accept="image/*,application/pdf" 
                                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                               onChange={e => e.target.files?.[0] && setVenueMapFile(e.target.files[0])}
                                            />
                                        </>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-accent-gold hover:bg-accent-gold/90 text-white min-w-[120px]" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Publish Event
                        </Button>
                    </div>
                </form>
            </GlassSurface>
        </div>
    );
}
