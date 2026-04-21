'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, Eye, MessageSquare, Briefcase, User, Calendar, Send, FileText, Pencil, Trash2, Heart, HeartOff, Loader2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useBlog } from '@/lib/hooks/useBlogs';
import { useAuth } from '@/contexts/AuthContext';
import { publishBlogPost, deleteBlogPost } from '@/lib/db/blogs';
import { getBlogComments, submitBlogComment, toggleBlogLike, checkBlogLike, incrementBlogViewsRPC, BlogComment } from '@/lib/db/blogEngagement';
import { PageContainer } from '@/components/layout/PageContainer';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { blog, loading, error } = useBlog(resolvedParams.slug);
    const { user } = useAuth();
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Engagement State
    const [likedByMe, setLikedByMe] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentInput, setCommentInput] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [viewIncremented, setViewIncremented] = useState(false);
    const initialized = useRef(false);

    // Fetch initial engagement data and increment views
    useEffect(() => {
        if (!blog || !user || initialized.current) return;
        initialized.current = true;
        
        setLikesCount(blog.likeCount);

        const initEngagement = async () => {
            if (!viewIncremented) {
                incrementBlogViewsRPC(blog.id);
                setViewIncremented(true);
            }
            
            const [isLiked, fetchedComments] = await Promise.all([
                checkBlogLike(blog.id, user.id),
                getBlogComments(blog.id)
            ]);
            
            setLikedByMe(isLiked);
            setComments(fetchedComments);
            setCommentsLoading(false);
        };
        
        initEngagement();
    }, [blog, user, viewIncremented]);

    const handleToggleLike = async () => {
        if (!user || !blog) return;
        
        // Optimistic UI update
        const newLikedState = !likedByMe;
        setLikedByMe(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
        
        // Background DB sync
        await toggleBlogLike(blog.id, user.id);
    };

    const handleNextComment = async () => {
        if (!user || !blog || !commentInput.trim()) return;
        setSubmittingComment(true);
        
        const newComment = await submitBlogComment(blog.id, user.id, commentInput.trim());
        if (newComment) {
            setComments(prev => [...prev, newComment]);
            setCommentInput('');
        }
        setSubmittingComment(false);
    };

    const handlePublish = async () => {
        if (!blog || publishing) return;
        try {
            setPublishing(true);
            await publishBlogPost(blog.id);
            window.location.reload();
        } catch (err) {
            console.error('[publishBlogPost]', err);
            alert('Failed to publish. Please try again.');
        } finally {
            setPublishing(false);
        }
    };

    const handleDelete = async () => {
        if (!blog || deleting) return;
        if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;

        try {
            setDeleting(true);
            await deleteBlogPost(blog.id);
            router.push('/blogs');
            router.refresh();
        } catch (err) {
            console.error('[deleteBlogPost]', err);
            alert('Failed to delete. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <PageContainer backHref="/blogs">
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Spinner className="w-8 h-8 text-amber-500" />
                    <p className="text-muted-foreground">Loading experience...</p>
                </div>
            </PageContainer>
        );
    }

    if (error || !blog) {
        return (
            <PageContainer backHref="/blogs">
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <span className="text-destructive font-bold text-2xl">!</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold">Blog not found</h2>
                    <p className="text-muted-foreground">{error || "The experience you're looking for doesn't exist."}</p>
                </div>
            </PageContainer>
        );
    }

    const authorName = blog.author?.fullName || 'Anonymous User';
    const authorInitials = authorName.substring(0, 2).toUpperCase();
    const isPlacement = blog.category === 'placement' || blog.category === 'internship';
    const isDraft = blog.status === 'draft';
    const isOwnPost = user?.id === blog.authorId;

    return (
        <PageContainer backHref="/blogs" className="max-w-4xl mx-auto">
            <article className="space-y-8 animate-in fade-in zoom-in-95 duration-500">

                {/* Draft Banner */}
                {isDraft && isOwnPost && (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <div>
                                <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">This post is a draft</p>
                                <p className="text-xs text-amber-700/70 dark:text-amber-400/70">Only you can see it. Publish when you're ready.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 h-9 px-3"
                                asChild
                            >
                                <Link href={`/blogs/${blog.slug}/edit`}>
                                    <Pencil size={14} />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2 h-9 px-3"
                                onClick={handleDelete}
                                isLoading={deleting}
                            >
                                <Trash2 size={14} />
                                Delete
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="gap-2 h-9 px-4"
                                onClick={handlePublish}
                                isLoading={publishing}
                            >
                                <Send className="w-4 h-4" />
                                Publish
                            </Button>
                        </div>
                    </div>
                )}

                {isDraft && !isOwnPost && (
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-border rounded-xl text-center text-sm text-muted-foreground">
                        This post is a draft and has not been published yet.
                    </div>
                )}

                {/* Header Section */}
                <header className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="capitalize text-amber-600 border-amber-500/30 bg-amber-500/10 px-3 py-1">
                            {blog.category.replace('_', ' ')}
                        </Badge>
                        {isDraft && (
                            <Badge className="bg-zinc-500 text-white border-transparent">Draft</Badge>
                        )}
                        {blog.isFeatured && (
                            <Badge className="bg-amber-500 text-white border-transparent">Featured</Badge>
                        )}
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Clock size={14} />
                            {blog.publishedAt ? formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true }) : 'Draft'}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5 ml-auto">
                            <Eye size={14} /> {(blog.viewCount + (viewIncremented ? 1 : 0)).toLocaleString()} views
                        </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight text-foreground">
                            {blog.title}
                        </h1>
                        {isOwnPost && !isDraft && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="shrink-0 mt-1">
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 z-50">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/blogs/${blog.slug}/edit`} className="w-full cursor-pointer">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} disabled={deleting} className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {blog.excerpt && (
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {blog.excerpt}
                        </p>
                    )}

                    {/* Compact Author Info */}
                    <div className="flex items-center gap-3 py-4 border-y border-border">
                        <Avatar className="w-9 h-9 border border-border">
                            <AvatarImage src={blog.author?.profilePictureUrl} alt={authorName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{authorInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                            <span className="font-semibold text-sm text-foreground">{authorName}</span>
                            <span className="hidden sm:inline text-muted-foreground">•</span>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {blog.author?.role && <span className="capitalize">{blog.author.role}</span>}
                                <span>•</span>
                                {blog.publishedAt && <span>{format(new Date(blog.publishedAt), 'MMM d, yyyy')}</span>}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Compact Featured Image */}
                {blog.featuredImageUrl && (
                    <div className="relative w-full h-[200px] md:h-[300px] rounded-xl overflow-hidden bg-muted mb-6">
                        <Image
                            src={blog.featuredImageUrl}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Compact Placement/Internship Meta Details */}
                {isPlacement && (blog.companyName || blog.roleApplied || blog.interviewRound) && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex flex-wrap gap-4 md:gap-8 items-center mb-8">
                        <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2 mr-2">
                            <Briefcase className="w-4 h-4 text-amber-500" />
                            Role Info
                        </h3>
                        {blog.companyName && (
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Company</span>
                                <span className="font-medium text-sm text-foreground">{blog.companyName}</span>
                            </div>
                        )}
                        {blog.roleApplied && (
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Role</span>
                                <span className="font-medium text-sm text-foreground">{blog.roleApplied}</span>
                            </div>
                        )}
                        {blog.interviewRound && (
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Process</span>
                                <span className="font-medium text-sm text-foreground">{blog.interviewRound}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-amber-600 dark:prose-a:text-amber-400">
                    <ReactMarkdown>{blog.content}</ReactMarkdown>
                </div>

                {/* Footer Actions */}
                <footer className="pt-10 border-t border-border mt-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                        <div className="flex gap-2">
                            {blog.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="capitalize">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button 
                                variant={likedByMe ? "default" : "outline"} 
                                className="gap-2 rounded-full"
                                onClick={handleToggleLike}
                            >
                                <Heart size={16} className={likedByMe ? "fill-current" : ""} />
                                {likedByMe ? 'Liked' : 'Like'} ({likesCount})
                            </Button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    {blog.allowComments && (
                        <div className="mt-12">
                            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                                <MessageSquare className="text-amber-500" />
                                Discussion ({comments.length})
                            </h3>
                            
                            <div className="space-y-6 mb-8">
                                {commentsLoading ? (
                                    <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                ) : comments.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border">No comments yet. Be the first to share your thoughts!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4">
                                            <Avatar className="w-10 h-10 border border-border">
                                                <AvatarImage src={comment.user?.profile_picture_url} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                    {comment.user?.full_name?.substring(0, 2).toUpperCase() || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 bg-muted/40 p-4 rounded-2xl rounded-tl-sm border border-border/50">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-sm">{comment.user?.full_name || 'Anonymous'}</span>
                                                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                                                </div>
                                                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Comment Input */}
                            <div className="flex gap-3 items-start pb-20">
                                <Avatar className="w-10 h-10 border border-border shrink-0">
                                    <AvatarImage src={user?.profilePictureUrl} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {user?.fullName?.substring(0, 2).toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 right-0">
                                    <Input
                                        placeholder="Add to the discussion..."
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleNextComment();
                                            }
                                        }}
                                        className="rounded-2xl bg-muted/40 border-border"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button 
                                            size="sm" 
                                            className="rounded-full px-5" 
                                            disabled={!commentInput.trim() || submittingComment}
                                            onClick={handleNextComment}
                                            isLoading={submittingComment}
                                        >
                                            Post Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </footer>

            </article>
        </PageContainer>
    );
}

