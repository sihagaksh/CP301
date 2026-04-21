'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Organization } from '@/lib/types';
import { getOrganizations } from '@/lib/db/organizations';
import { db } from '@/lib/db/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Loader2, Send, ImagePlus, X } from 'lucide-react';

interface OrgAdminComposeProps {
    org: Organization;
}

interface RecentPost {
    id: string;
    content: string;
    created_at: string;
    media_urls?: string[];
}

export function OrgAdminCompose({ org }: OrgAdminComposeProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

    const loadRecentPosts = useCallback(async () => {
        const { data } = await db
            .from('feed_posts')
            .select('id, content, created_at, media_urls')
            .eq('acting_as_org_id', org.id)
            .order('created_at', { ascending: false })
            .limit(5);
        setRecentPosts(data ?? []);
    }, [org.id]);

    useEffect(() => {
        loadRecentPosts();
    }, [loadRecentPosts]);

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        setMediaFiles(prev => [...prev, ...files].slice(0, 4)); // max 4 images
        const urls = files.map(f => URL.createObjectURL(f));
        setMediaPreviews(prev => [...prev, ...urls].slice(0, 4));
    };

    const removeMedia = (idx: number) => {
        URL.revokeObjectURL(mediaPreviews[idx]);
        setMediaFiles(prev => prev.filter((_, i) => i !== idx));
        setMediaPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handlePost = async () => {
        if (!content.trim() || !user) return;
        setIsPosting(true);
        setError(null);

        try {
            let mediaUrls: string[] = [];

            // Upload media files if any
            if (mediaFiles.length > 0) {
                const { data: sessionData } = await db.auth.getSession();
                const token = sessionData.session?.access_token;
                for (const file of mediaFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('kind', 'feed-media');
                    const res = await fetch('/api/media/upload', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    const result = await res.json();
                    if (res.ok && result.publicUrl) mediaUrls.push(result.publicUrl);
                }
            }

            const { error: insertError } = await db.from('feed_posts').insert({
                author_id: user.id,
                acting_as_org_id: org.id,
                content: content.trim(),
                media_urls: mediaUrls,
                source_type: 'post',
                is_public: true,
                target_roles: [],
                view_count: 0,
                like_count: 0,
                comment_count: 0,
            });

            if (insertError) throw new Error(insertError.message);

            setContent('');
            setMediaFiles([]);
            setMediaPreviews(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return []; });
            await loadRecentPosts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to post. Please try again.');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Compose Panel */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-900/50 space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={org.logoUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(org.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-sm">{org.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{org.type.replace('_', ' ')} · Official Account</p>
                    </div>
                </div>

                <Textarea
                    placeholder={`Post as ${org.name}…`}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={4}
                    className="resize-none"
                />

                {/* Media previews */}
                {mediaPreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {mediaPreviews.map((url, i) => (
                            <div key={i} className="relative group">
                                <img src={url} className="h-20 w-20 object-cover rounded-lg border" alt="" />
                                <button
                                    onClick={() => removeMedia(i)}
                                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex items-center justify-between">
                    <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleMediaSelect}
                            disabled={mediaPreviews.length >= 4}
                        />
                        <ImagePlus className="h-5 w-5" />
                    </label>
                    <Button onClick={handlePost} disabled={!content.trim() || isPosting} size="sm">
                        {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Post as {org.name}
                    </Button>
                </div>
            </div>

            {/* Recent Posts */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Recent Posts</h3>
                {recentPosts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-xl">
                        No posts yet. Compose one above.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {recentPosts.map(post => (
                            <div key={post.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50">
                                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                                {post.media_urls && post.media_urls.length > 0 && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {post.media_urls.map((url, i) => (
                                            <img key={i} src={url} className="h-16 w-16 object-cover rounded-lg border" alt="" />
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(post.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
