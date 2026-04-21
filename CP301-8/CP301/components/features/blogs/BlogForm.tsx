'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createBlogPost, updateBlogPost } from '@/lib/db/blogs';
import { db } from '@/lib/db';
import { BlogCategory, BlogPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send, Image as ImageIcon, X } from 'lucide-react';

const CATEGORIES: { label: string; value: BlogCategory }[] = [
    { label: 'Placement', value: 'placement' },
    { label: 'Internship', value: 'internship' },
    { label: 'Faculty Insight', value: 'faculty_insight' },
    { label: 'Alumni Experience', value: 'alumni_experience' },
    { label: 'Research', value: 'research' },
    { label: 'General', value: 'general' },
];

const HIRING_TYPES = [
    { label: 'On-Campus', value: 'on_campus' },
    { label: 'Off-Campus', value: 'off_campus' },
];

interface BlogFormProps {
    initialData?: BlogPost;
}

export function BlogForm({ initialData }: BlogFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [category, setCategory] = useState<BlogCategory>(initialData?.category || 'general');
    const [content, setContent] = useState(initialData?.content || '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');

    // Image Upload State
    const [featuredImageUrl, setFeaturedImageUrl] = useState(initialData?.featuredImageUrl || '');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialData?.featuredImageUrl || null);

    // Placement/Internship specific fields
    const [companyName, setCompanyName] = useState(initialData?.companyName || '');
    const [roleApplied, setRoleApplied] = useState(initialData?.roleApplied || '');
    const [interviewRound, setInterviewRound] = useState(initialData?.interviewRound || '');
    const [hiringType, setHiringType] = useState(initialData?.hiringType || 'on_campus');

    const isPlacement = category === 'placement' || category === 'internship';

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-6);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        setFeaturedImageUrl('');
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!selectedImageFile || !user) return featuredImageUrl || null;

        const ext = selectedImageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { data, error } = await db.storage
            .from('blogs-media')
            .upload(path, selectedImageFile, { cacheControl: '3600', upsert: false });

        if (error) {
            console.error('Upload Error:', error);
            throw new Error('Failed to upload image. Make sure the blogs-media bucket exists.');
        }

        const { data: { publicUrl } } = db.storage.from('blogs-media').getPublicUrl(path);
        return publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent, publishNow: boolean) => {
        e.preventDefault();
        if (loading) return;
        if (!user) {
            setError('You must be logged in to create or edit a post.');
            return;
        }
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const uploadedImageUrl = await uploadImage();
            let updatedBlog;

            if (initialData) {
                // Update existing post
                updatedBlog = await updateBlogPost(
                    initialData.id,
                    {
                        title,
                        content,
                        category,
                        excerpt: excerpt || undefined,
                        featuredImageUrl: uploadedImageUrl || undefined,
                        companyName: isPlacement ? companyName || undefined : undefined,
                        roleApplied: isPlacement ? roleApplied || undefined : undefined,
                        interviewRound: isPlacement ? interviewRound || undefined : undefined,
                        hiringType: isPlacement ? hiringType || undefined : undefined,
                        status: publishNow ? 'published' : initialData.status,
                    }
                );
            } else {
                // Create new post
                const slug = generateSlug(title);
                updatedBlog = await createBlogPost(
                    user.id,
                    title,
                    slug,
                    content,
                    category,
                    excerpt || undefined,
                    uploadedImageUrl || undefined,
                    isPlacement ? companyName || undefined : undefined,
                    isPlacement ? roleApplied || undefined : undefined,
                    isPlacement ? interviewRound || undefined : undefined,
                    isPlacement ? hiringType || undefined : undefined,
                    publishNow
                );
            }

            router.push(`/blogs/${updatedBlog.slug}`);
            router.refresh();
        } catch (err) {
            console.error('[BlogForm submit]', err);
            if (err instanceof DOMException && err.name === 'AbortError') {
                setError('Request timed out. Please check your internet connection and try again.');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to save blog post. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-3xl mx-auto shadow-sm">
            <CardHeader>
                <CardTitle className="font-serif text-2xl">
                    {initialData ? 'Edit Post' : 'Create New Post'}
                </CardTitle>
                <CardDescription>
                    {initialData
                        ? 'Update your experience and keep the community informed.'
                        : 'Share your experiences, insights, and stories with the community.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="E.g., My Google SWE Internship Experience"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                        <Select value={category} onValueChange={(val: BlogCategory) => setCategory(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dynamic Fields for Placement & Internship */}
                    {isPlacement && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g., Microsoft"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roleApplied">Role</Label>
                                <Input
                                    id="roleApplied"
                                    value={roleApplied}
                                    onChange={(e) => setRoleApplied(e.target.value)}
                                    placeholder="e.g., SDE Intern"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hiringType">Hiring Context</Label>
                                <Select value={hiringType} onValueChange={setHiringType}>
                                    <SelectTrigger id="hiringType">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {HIRING_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-1 md:col-span-3">
                                <Label htmlFor="interviewRound">Details/Round</Label>
                                <Input
                                    id="interviewRound"
                                    value={interviewRound}
                                    onChange={(e) => setInterviewRound(e.target.value)}
                                    placeholder="e.g., Technical Interview 2, HR Round..."
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Label>Cover Image</Label>

                        {imagePreviewUrl ? (
                            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border group">
                                <img src={imagePreviewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="gap-2">
                                        <X className="w-4 h-4" /> Remove Image
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <Label
                                    htmlFor="featuredImageUpload"
                                    className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/60 transition-colors py-10"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                                        <div className="rounded-full bg-muted p-3"><ImageIcon className="h-6 w-6" /></div>
                                        <div className="text-center font-medium">Click to upload a cover image</div>
                                        <div className="text-xs">PNG, JPG or WEBP (max. 5MB)</div>
                                    </div>
                                    <input
                                        id="featuredImageUpload"
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </Label>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Short Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="A brief summary of your post..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your full story here..."
                            className="min-h-[300px]"
                            required
                        />
                    </div>

                    <div className="pt-6 border-t flex flex-col sm:flex-row justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/blogs')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            disabled={loading}
                            isLoading={loading}
                            onClick={(e) => handleSubmit(e, false)}
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Update Draft' : 'Save as Draft'}
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className="gap-2"
                            disabled={loading}
                            isLoading={loading}
                            onClick={(e) => handleSubmit(e, true)}
                        >
                            <Send className="w-4 h-4" />
                            {initialData?.status === 'published' ? 'Update Post' : 'Publish Now'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
