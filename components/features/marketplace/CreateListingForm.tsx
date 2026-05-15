'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { useMarketplace } from '@/lib/hooks/useMarketplace';
import { Loader2, ArrowLeft, AlertCircle, MapPin, IndianRupee, Image as ImageIcon } from 'lucide-react';
import type { ItemCategory, ItemCondition } from '@/lib/types';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function CreateListingForm() {
    const router = useRouter();
    const { user } = useAuth();
    const { createListing } = useMarketplace();
    const { toast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ItemCategory>('electronics');
    const [price, setPrice] = useState('');
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [condition, setCondition] = useState<ItemCondition>('good');
    const [pickupLocation, setPickupLocation] = useState('');
    const [deliveryAvailable, setDeliveryAvailable] = useState(false);
    
    // Image Upload State
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 5); // Max 5 images
        setSelectedFiles(files);
        setPreviewUrls(files.map(f => URL.createObjectURL(f)));
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<{ urls: string[], error: boolean }> => {
        if (selectedFiles.length === 0 || !user) return { urls: [], error: false };
        
        const uploadedUrls: string[] = [];
        let anyFailed = false;

        for (const file of selectedFiles) {
            const ext = file.name.split('.').pop();
            const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { data, error } = await db.storage
                .from('market-media')
                .upload(path, file, { cacheControl: '3600', upsert: false });
                
            if (error) {
                anyFailed = true;
            } else {
                const { data: { publicUrl } } = db.storage.from('market-media').getPublicUrl(path);
                uploadedUrls.push(publicUrl);
            }
        }
        
        return { urls: uploadedUrls, error: anyFailed };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !price) {
            setError('Title and Price are required.');
            return;
        }
        if (!user) {
            setError('You must be logged in to create a listing.');
            return;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            setError('Please enter a valid price.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setUploadError(null);

        const { urls: uploadedImageUrls, error: imgUploadError } = await uploadImages();
        
        if (imgUploadError && uploadedImageUrls.length === 0) {
            setError('Image upload failed. Make sure the "market-media" bucket exists.');
            setIsSubmitting(false);
            return;
        } else if (imgUploadError) {
            setUploadError('Some images failed to upload, but proceeding with successful ones.');
        }

        try {

            const success = await createListing({
                title,
                description,
                category,
                price: parsedPrice,
                isNegotiable,
                condition,
                images: uploadedImageUrls,
                pickupLocation,
                deliveryAvailable,
            });

            if (success) {
                toast({
                    title: '✅ Listing posted!',
                    description: 'Your item is now live on the Marketplace.',
                });
                router.push('/marketplace');
            } else {
                setError('Failed to create listing. Please try again.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create listing. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/marketplace"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-serif tracking-tight">Create Listing</h1>
                    <p className="text-sm text-muted-foreground">List an item for sale on the campus marketplace.</p>
                </div>
            </div>

            <GlassSurface className="p-6 sm:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}
                {uploadError && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-2 text-sm dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="title" className="text-base">What are you selling? <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Hero Lectro C5i Electric Cycle"
                                className="font-medium"
                                maxLength={120}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-base">Category</Label>
                            <select
                                id="category"
                                value={category}
                                onChange={e => setCategory(e.target.value as ItemCategory)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="cycle">Cycles</option>
                                <option value="electronics">Electronics</option>
                                <option value="books">Books & Academics</option>
                                <option value="furniture">Furniture</option>
                                <option value="clothing">Clothing</option>
                                <option value="sports">Sports Equipment</option>
                                <option value="stationery">Stationery</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="condition" className="text-base">Condition</Label>
                            <select
                                id="condition"
                                value={condition}
                                onChange={e => setCondition(e.target.value as ItemCondition)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="new">Brand New</option>
                                <option value="like_new">Like New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-base">Price (₹) <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    placeholder="0"
                                    className="pl-9 font-medium text-lg"
                                    min={0}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pickup" className="text-base">Pickup Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="pickup"
                                    value={pickupLocation}
                                    onChange={e => setPickupLocation(e.target.value)}
                                    placeholder="e.g. Kameng Hostel Wing 3"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                            <input
                                type="checkbox"
                                checked={isNegotiable}
                                onChange={e => setIsNegotiable(e.target.checked)}
                                className="rounded border-border w-5 h-5 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Price is negotiable</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                            <input
                                type="checkbox"
                                checked={deliveryAvailable}
                                onChange={e => setDeliveryAvailable(e.target.checked)}
                                className="rounded border-border w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Delivery available within campus</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Detailed Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe your item: brand, model, age, any issues, why you're selling..."
                            rows={5}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Photos of Item (Max 5)</Label>
                        
                        {previewUrls.length > 0 && (
                            <div className="flex gap-3 flex-wrap mb-4">
                                {previewUrls.map((url, i) => (
                                    <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
                                        <img src={url} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" onClick={() => removeSelectedFile(i)} className="bg-red-500 text-white p-1 rounded-full">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {previewUrls.length < 5 && (
                            <div className="relative">
                                <Label 
                                    htmlFor="imagesUpload" 
                                    className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/60 transition-colors py-8"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                                        <div className="rounded-full bg-muted p-3"><ImageIcon className="h-6 w-6" /></div>
                                        <div className="text-center font-medium">Click to upload photos</div>
                                        <div className="text-xs">PNG, JPG or WEBP (max. 5MB each)</div>
                                    </div>
                                    <input 
                                        id="imagesUpload" 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/webp" 
                                        multiple
                                        className="hidden" 
                                        onChange={handleFileSelect}
                                    />
                                </Label>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white min-w-[150px] font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Post Listing
                        </Button>
                    </div>
                </form>
            </GlassSurface>
        </div>
    );
}
