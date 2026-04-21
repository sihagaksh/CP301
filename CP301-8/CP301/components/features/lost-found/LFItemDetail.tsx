'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLostFound, useLostFoundItem } from '@/lib/hooks/useLostFound';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Calendar, MapPin, Search, Phone, CheckCircle2, MessageCircle, Send, X, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';

export function LFItemDetail() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params?.id === 'string' ? params.id : null;

    const { item, loading, error } = useLostFoundItem(id);
    const { resolveItem } = useLostFound();
    const { user } = useAuth();

    const [showInquiry, setShowInquiry] = useState(false);
    const [inquiryText, setInquiryText] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center">
                <GlassSurface className="p-8">
                    <h2 className="text-xl font-bold mb-2">Item Not Found</h2>
                    <p className="text-muted-foreground mb-6"> {error || "This report may have been deleted or doesn't exist."}</p>
                    <Button onClick={() => router.push('/lost-found')}>Back to List</Button>
                </GlassSurface>
            </div>
        );
    }

    const isResolved = item.status === 'claimed' || item.status === 'returned';
    const isOwner = user?.id === item.reporterId;
    const imageUrl = item.images && item.images.length > 0 ? item.images[0] : null;

    const handleResolve = async () => {
        if (!isOwner) return;
        const finalStatus = item.status === 'lost' ? 'claimed' : 'returned';
        if (confirm(`Are you sure you want to mark this item as ${finalStatus}?`)) {
            await resolveItem(item.id, finalStatus);
            window.location.reload();
        }
    };

    const handleSendInquiry = async () => {
        if (!inquiryText.trim() || !user || !item.reporterId) return;
        setSending(true);
        try {
            // Find or create conversation tagged AS lost_found exclusively
            const { data: existing } = await db
                .from('conversations')
                .select('id')
                .eq('context_type', 'lost_found')
                .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${item.reporterId}),and(participant1_id.eq.${item.reporterId},participant2_id.eq.${user.id})`)
                .maybeSingle();

            let convId: string;
            if (existing) {
                convId = existing.id;
            } else {
                const { data: created } = await db
                    .from('conversations')
                    .insert({ participant1_id: user.id, participant2_id: item.reporterId, context_type: 'lost_found' })
                    .select('id')
                    .single();
                convId = created!.id;
            }

            const content = inquiryText.trim();
            await db.from('messages').insert({
                conversation_id: convId,
                sender_id: user.id,
                receiver_id: item.reporterId,
                content,
            });
            await db.from('conversations').update({
                last_message: content,
                last_message_at: new Date().toISOString(),
                last_message_sender_id: user.id,
            }).eq('id', convId);

            setSent(true);
            setInquiryText('');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 animate-fade-in space-y-6">
            <Button variant="ghost" size="sm" asChild className="-ml-4 mb-2 text-muted-foreground hover:text-foreground">
                <Link href="/lost-found"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Lost &amp; Found</Link>
            </Button>

            {isResolved && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center justify-center gap-2 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">This item has been {item.status}.</span>
                    {item.claimedAt && <span className="text-sm opacity-80 ml-2">({format(new Date(item.claimedAt), 'MMM do, yyyy')})</span>}
                    {item.returnedAt && <span className="text-sm opacity-80 ml-2">({format(new Date(item.returnedAt), 'MMM do, yyyy')})</span>}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <GlassSurface className={cn("overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 min-h-[300px]", isResolved && "opacity-80 grayscale-[0.5]")}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={item.itemName} className="w-full h-auto max-h-[500px] object-contain" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 py-32">
                            <Search className="w-20 h-20 mb-4 opacity-50" />
                            <p className="font-medium uppercase tracking-widest text-xs opacity-70">No Image Provided</p>
                        </div>
                    )}
                </GlassSurface>

                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={cn(
                                'text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full border',
                                item.status === 'lost' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300' :
                                    item.status === 'found' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300' :
                                        'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                            )}>
                                {item.status.toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-2 py-1 rounded-md">
                                {item.category.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                                Posted {format(new Date(item.createdAt), 'MMM do, yyyy')}
                            </span>
                        </div>

                        <h1 className="text-3xl font-serif font-bold tracking-tight mb-4 text-foreground">{item.itemName}</h1>

                        {item.description && (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                <p>{item.description}</p>
                            </div>
                        )}
                    </div>

                    <GlassSurface className="p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">Key Details</h3>

                        {item.dateLostFound && (
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Date {item.status === 'lost' ? 'Lost' : 'Found'}</p>
                                    <p className="text-muted-foreground text-sm">{format(new Date(item.dateLostFound), 'EEEE, MMMM do, yyyy')}</p>
                                </div>
                            </div>
                        )}

                        {item.locationLostFound && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Location</p>
                                    <p className="text-muted-foreground text-sm">{item.locationLostFound}</p>
                                </div>
                            </div>
                        )}
                    </GlassSurface>

                    {/* Reporter Card */}
                    <GlassSurface className="p-5 space-y-4 border-accent-gold/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border border-border">
                                    <AvatarImage src={item.reporter?.profilePictureUrl} />
                                    <AvatarFallback className="bg-zinc-200 font-bold text-lg">{getInitials(item.reporter?.fullName || '?')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Reported By</p>
                                    <p className="font-bold text-foreground">{item.reporter?.fullName}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-2">
                                {item.contactInfo && !isResolved && (
                                    <div className="sm:text-right">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1 flex sm:justify-end items-center gap-1">
                                            <Phone className="w-3 h-3" /> Contact Info
                                        </p>
                                        <p className="text-sm font-medium text-foreground bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-md border shadow-sm">
                                            {item.contactInfo}
                                        </p>
                                    </div>
                                )}
                                {!isOwner && !isResolved && item.reporterId && !sent && (
                                    <Button
                                        onClick={() => setShowInquiry(prev => !prev)}
                                        className={cn("gap-2 shadow-md transition-all", showInquiry ? "bg-zinc-700 hover:bg-zinc-800 text-white" : "bg-amber-500 hover:bg-amber-600 text-white")}
                                    >
                                        {showInquiry ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                                        {showInquiry ? 'Cancel' : 'Send Inquiry'}
                                    </Button>
                                )}
                                {sent && (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                                        <CheckCheck className="w-4 h-4" />
                                        Inquiry sent! Check your <button onClick={() => router.push('/messages')} className="underline font-semibold">messages</button>.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Inline Inquiry Form */}
                        {showInquiry && !isOwner && !isResolved && !sent && (
                            <div className="border-t border-border pt-4 space-y-3 animate-fade-in">
                                <p className="text-sm font-medium text-foreground">
                                    Send a message to <span className="font-bold">{item.reporter?.fullName}</span> about this item:
                                </p>
                                <textarea
                                    autoFocus
                                    rows={3}
                                    placeholder={`Hi! I think I found your ${item.itemName}...`}
                                    value={inquiryText}
                                    onChange={e => setInquiryText(e.target.value)}
                                    className="w-full resize-none rounded-xl border border-border bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => { setShowInquiry(false); setInquiryText(''); }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSendInquiry}
                                        disabled={!inquiryText.trim() || sending}
                                        className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                                    >
                                        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        {sending ? 'Sending...' : 'Send'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </GlassSurface>

                    {isOwner && !isResolved && (
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleResolve} variant="default" className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as {item.status === 'lost' ? 'Claimed' : 'Returned'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
