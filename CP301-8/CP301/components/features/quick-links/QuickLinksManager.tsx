"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Link as LinkIcon, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addQuickLink, updateQuickLink, deleteQuickLink } from '@/lib/db/quick-links';
import type { QuickLink } from '@/lib/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function QuickLinksManager({ initialLinks }: { initialLinks: QuickLink[] }) {
    const { user } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [links, setLinks] = useState(initialLinks);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<QuickLink>>({
        section: 'Official College Website',
        subSection: '',
        title: '',
        url: '',
        description: '',
        displayOrder: 100
    });

    const resetForm = () => {
        setFormData({
            section: 'Official College Website',
            subSection: '',
            title: '',
            url: '',
            description: '',
            displayOrder: 100
        });
        setEditingId(null);
    };

    const handleEdit = (link: QuickLink) => {
        setFormData({
            section: link.section,
            subSection: link.subSection || '',
            title: link.title,
            url: link.url,
            description: link.description || '',
            displayOrder: link.displayOrder
        });
        setEditingId(link.id);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this link?')) return;
        try {
            await deleteQuickLink(id);
            setLinks(links.filter(l => l.id !== id));
            toast.success("Link deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete link");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.url || !formData.section) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                const updated = await updateQuickLink(editingId, formData as any);
                if (updated) {
                    setLinks(links.map(l => l.id === editingId ? updated : l));
                    toast.success("Link updated successfully");
                }
            } else {
                const added = await addQuickLink(formData as any);
                if (added) {
                    setLinks([...links, added]);
                    toast.success("Link added successfully");
                }
            }
            resetForm();
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to save link");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user?.isAdmin) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    Manage Links
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-[1400px] w-full min-h-[80vh] max-h-[90vh] overflow-hidden flex flex-col p-0">
                <div className="p-6 pb-2">
                    <DialogHeader>
                        <DialogTitle>Manage Quick Links</DialogTitle>
                        <DialogDescription>
                            Add new sections, subsections, and links to populate the public directory.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 pt-2 flex flex-col lg:flex-row gap-8">
                    {/* Form Section */}
                    <div className="w-full lg:w-1/3 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 self-start">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            {editingId ? <><Edit2 className="w-4 h-4"/> Edit Link</> : <><Plus className="w-4 h-4"/> Add New Link</>}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="section">Section <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="section" 
                                    placeholder="e.g. DEPARTMENTS & CENTRES" 
                                    value={formData.section}
                                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="subSection">Sub-Section</Label>
                                <Input 
                                    id="subSection" 
                                    placeholder="e.g. Engineering" 
                                    value={formData.subSection}
                                    onChange={(e) => setFormData({...formData, subSection: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="title" 
                                    placeholder="e.g. Chemical Engineering" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input 
                                    id="description" 
                                    placeholder="e.g. Phone: +91 00000 00000" 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="url">URL <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="url" 
                                    placeholder="https://... or tel:+91..." 
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                />
                            </div>
                            
                            <div className="pt-2 flex gap-2">
                                <Button type="submit" disabled={isSubmitting} className="flex-1">
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingId ? "Save Changes" : "Create Link"}
                                </Button>
                                {editingId && (
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="w-full lg:w-2/3 border rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 font-semibold text-sm grid grid-cols-12 gap-2 text-slate-600 dark:text-slate-300">
                            <div className="col-span-3">Section</div>
                            <div className="col-span-4">Title</div>
                            <div className="col-span-3">URL</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                        <div className="divide-y overflow-y-auto flex-1 max-h-[calc(90vh-180px)]">
                            {links.map(link => (
                                <div key={link.id} className="p-3 text-sm grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <div className="col-span-3">
                                        <div className="font-medium truncate">{link.section}</div>
                                        <div className="text-xs text-slate-500 truncate">{link.subSection}</div>
                                    </div>
                                    <div className="col-span-4">
                                        <div className="font-medium truncate">{link.title}</div>
                                        <div className="text-xs text-slate-500 truncate">{link.description}</div>
                                    </div>
                                    <div className="col-span-3 truncate text-xs font-mono bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">
                                        {link.url}
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(link)}>
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(link.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
