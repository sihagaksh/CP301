'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Send, Target, ShieldCheck, Tag, Save, Paperclip, X, UploadCloud, Loader2 } from 'lucide-react';
import type { Notice, NoticeCategory, NoticePriority, NoticeStatus } from '@/lib/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface NoticeFormProps {
    initialData?: Notice;
    onSubmit: (data: Partial<Notice> & { status: NoticeStatus }) => Promise<boolean>;
    isEdit?: boolean;
}

export function NoticeForm({ initialData, onSubmit, isEdit = false }: NoticeFormProps) {
    const router = useRouter();
    const { user, activePositions, selectedIdentityId, setSelectedIdentityId } = useAuth();

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [category, setCategory] = useState<NoticeCategory>(initialData?.category || 'general');
    const [priority, setPriority] = useState<NoticePriority>(initialData?.priority || 'medium');

    const [targetRoles, setTargetRoles] = useState(initialData?.targetRoles?.join(', ') || '');
    const [targetDepartments, setTargetDepartments] = useState(initialData?.targetDepartments?.join(', ') || '');
    const [targetBatches, setTargetBatches] = useState(initialData?.targetBatches?.join(', ') || '');
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

    const canPostPersonal = user?.role === 'faculty' || user?.role === 'staff';

    // Attachments State
    const [existingAttachments, setExistingAttachments] = useState<string[]>(initialData?.attachments || []);
    const [newAttachments, setNewAttachments] = useState<File[]>([]);
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const incoming = Array.from(e.target.files);
        const totalCount = existingAttachments.length + newAttachments.length + incoming.length;
        if (totalCount > 5) {
            alert('A notice can have a maximum of 5 attachments total.');
            const diff = 5 - (existingAttachments.length + newAttachments.length);
            if (diff > 0) {
               setNewAttachments([...newAttachments, ...incoming.slice(0, diff)]);
            }
            return;
        }
        setNewAttachments(prev => [...prev, ...incoming]);
        // Reset input so picking the same file again works
        e.target.value = '';
    };

    const removeNewAttachment = (indexToRemove: number) => {
        setNewAttachments(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const removeExistingAttachment = (indexToRemove: number) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== indexToRemove));
    };
    
    const uploadAttachment = async (file: File): Promise<string> => {
        const { data: sessionData } = await (await import('@/lib/db/client')).db.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated properly.');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', 'notice-attachment');
        // Notice ID might not exist yet if it's a draft
        formData.append('context', JSON.stringify({ noticeId: initialData?.id }));

        const res = await fetch('/api/media/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to upload attachment');
        return json.publicUrl;
    };

    useEffect(() => {
        if (!user) return;
        if (!canPostPersonal && selectedIdentityId === null && !isEdit) {
            router.replace('/notices');
        }
    }, [user, selectedIdentityId, router, canPostPersonal, isEdit]);

    useEffect(() => {
        if (initialData?.postingIdentityId) {
            setSelectedIdentityId(initialData.postingIdentityId);
        }
    }, [initialData, setSelectedIdentityId]);

    const submitAction = async (status: NoticeStatus) => {
        if (!canPostPersonal && selectedIdentityId === null) return;

        setLoading(true);
        const parseCommaList = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

        let finalAttachments = [...existingAttachments];
        if (newAttachments.length > 0) {
            try {
                 const uploadedUrls = await Promise.all(newAttachments.map(uploadAttachment));
                 finalAttachments = [...finalAttachments, ...uploadedUrls];
            } catch (err: any) {
                 alert(err.message || 'Failed to upload attachments. Please verify your connection and try again.');
                 setLoading(false);
                 return;
            }
        }

        const success = await onSubmit({
            title,
            content,
            category,
            priority,
            postingIdentityId: selectedIdentityId || undefined,
            tags: parseCommaList(tags),
            targetRoles: parseCommaList(targetRoles),
            targetDepartments: parseCommaList(targetDepartments),
            targetBatches: parseCommaList(targetBatches),
            attachments: finalAttachments,
            isActive: initialData?.isActive ?? true,
            isPinned: initialData?.isPinned ?? false,
            status,
        });

        setLoading(false);
        if (success) {
            router.push('/notices');
        }
    };

    return (
        <div className="space-y-8">
            <GlassSurface className="p-6 sm:p-8">
                <div className="space-y-6">
                    {/* Title & Content */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Notice Title <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            placeholder="e.g., Extension of Library Hours During Exams"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="text-lg py-6 bg-black/5 dark:bg-white/5 border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Detailed Content <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="content"
                            placeholder="Write the full notice content here... (Markdown supported)"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="min-h-[200px] resize-y bg-black/5 dark:bg-white/5 border-border leading-relaxed"
                        />
                    </div>

                    {/* Classification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Category
                            </Label>
                            <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                                <SelectTrigger className="bg-black/5 dark:bg-white/5 border-border">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="administrative">Administrative</SelectItem>
                                    <SelectItem value="placement">Placement</SelectItem>
                                    <SelectItem value="hostel">Hostel</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="wellness">Wellness</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Priority Level
                            </Label>
                            <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                                <SelectTrigger className="bg-black/5 dark:bg-white/5 border-border">
                                    <SelectValue placeholder="Select Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urgent"><span className="text-red-500 font-bold">Urgent</span></SelectItem>
                                    <SelectItem value="high"><span className="text-amber-500 font-bold">High</span></SelectItem>
                                    <SelectItem value="medium"><span className="text-blue-500 font-medium">Medium</span></SelectItem>
                                    <SelectItem value="low"><span className="text-green-500 font-medium">Low</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border/50">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent-gold" /> Post As (Identity)
                        </Label>
                        <Select
                            value={selectedIdentityId || 'base_role'}
                            onValueChange={(val) => setSelectedIdentityId(val === 'base_role' ? null : val)}
                        >
                            <SelectTrigger className="bg-black/5 dark:bg-white/5 border-border">
                                <SelectValue placeholder="Select Identity" />
                            </SelectTrigger>
                            <SelectContent>
                                {canPostPersonal && (
                                    <SelectItem value="base_role">Personal Identity ({user?.role})</SelectItem>
                                )}
                                    {activePositions && activePositions.map(pos => (
                                        <SelectItem key={pos.id} value={pos.id}>
                                            <span className="font-semibold text-accent-gold">{pos.title}</span>
                                            <span className="text-muted-foreground ml-2">({pos.org?.name})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">If you have an official organization position, you can post this notice under that authoritative identity.</p>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="pt-4 border-t border-border/50 space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Paperclip className="w-4 h-4" /> Attachments (Max 5)
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* Existing ones */}
                            {existingAttachments.map((url, i) => {
                                const filename = url.split('/').pop()?.split('?')[0] || `attachment-${i + 1}`;
                                return (
                                    <div key={url} className="px-3 py-2 bg-black/5 dark:bg-white/5 border border-border rounded-lg flex items-center justify-between gap-3">
                                        <span className="text-xs font-medium truncate flex-1" title={filename}>{filename}</span>
                                        <button type="button" onClick={() => removeExistingAttachment(i)} className="text-red-500 hover:text-red-600 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            })}
                            {/* New pending ones */}
                            {newAttachments.map((file, i) => (
                                <div key={i} className="px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium truncate flex-1 text-emerald-800 dark:text-emerald-300" title={file.name}>{file.name}</span>
                                    <button type="button" onClick={() => removeNewAttachment(i)} className="text-red-500 hover:text-red-600 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            
                            {/* Upload button */}
                            {existingAttachments.length + newAttachments.length < 5 && (
                                <div className="relative border border-dashed border-border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center p-2 min-h-[42px] cursor-pointer">
                                    <UploadCloud className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium">Add File</span>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*,application/pdf,.doc,.docx"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </GlassSurface>

            <GlassSurface className="p-6 sm:p-8 bg-black/10 dark:bg-white/5 border-dashed border-border/60">
                <div className="space-y-4">
                    <div className="flex flex-col gap-1 mb-4">
                        <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                            <Target className="w-5 h-5 text-accent-cyan" />
                            Audience Targeting (Optional)
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Leave these fields blank to make the notice globally visible. Separate multiple values with commas (e.g., "2024, 2025").
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="targetRoles" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Roles</Label>
                            <Input
                                id="targetRoles"
                                placeholder="student, faculty, staff"
                                value={targetRoles}
                                onChange={e => setTargetRoles(e.target.value)}
                                className="bg-black/10 dark:bg-black/20 border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="targetBatches" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Batches</Label>
                            <Input
                                id="targetBatches"
                                placeholder="2024, 2025, 2026"
                                value={targetBatches}
                                onChange={e => setTargetBatches(e.target.value)}
                                className="bg-black/10 dark:bg-black/20 border-border"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="targetDepartments" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Departments</Label>
                            <Input
                                id="targetDepartments"
                                placeholder="Computer Science & Engineering, Electrical Engineering"
                                value={targetDepartments}
                                onChange={e => setTargetDepartments(e.target.value)}
                                className="bg-black/10 dark:bg-black/20 border-border"
                            />
                        </div>
                    </div>
                </div>
            </GlassSurface>

            <div className="flex justify-end gap-3 pt-4 pb-20">
                <Button
                    type="button"
                    variant="outline"
                    disabled={loading || !title || !content}
                    onClick={() => submitAction('draft')}
                    className="px-6 py-6 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/50 transition-colors"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Draft
                </Button>
                <Button
                    type="button"
                    disabled={loading || !title || !content}
                    onClick={() => submitAction('published')}
                    className="px-8 py-6 rounded-xl font-bold text-lg flex items-center gap-2"
                >
                    {loading ? 'Publishing...' : (
                        <>
                            <Send className="w-5 h-5" /> Publish Notice
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
