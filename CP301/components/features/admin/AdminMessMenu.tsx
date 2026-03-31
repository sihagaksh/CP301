'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertCircle, Save } from 'lucide-react';
import { upsertMessMenu, getMessMenu } from '@/lib/db/mess-menu';
import { db } from '@/lib/db';
import { toast } from 'sonner';

const SAMPLE_MARKDOWN = [
  '# Mess Menu',
  '',
  '| Day | Breakfast (7:30 - 9:30 AM) | Lunch (12:30 - 2:30 PM) | Dinner (7:30 - 9:30 PM) |',
  '|---|---|---|---|',
  '| Monday | Poha, Jalebi, Tea/Coffee/Milk | Rajma, Rice, Roti, Salad | Dal Tadka, Paneer, Roti, Rice |',
  '| Tuesday | Idli, Sambar, Chutney | Chole Bhature, Rice | Kadhi Pakora, Roti, Rice |',
  '| Wednesday | Paratha, Curd, Pickle | Dal Makhani, Mix Veg, Roti | Egg Curry/Paneer, Roti, Rice |',
  '| Thursday | Dosa, Sambar | Kadhi, Chawal | Dal Fry, Aloo Gobi, Roti |',
  '| Friday | Uttapam, Coconut Chutney | Rajma, Rice, Roti | Dal Tadka, Matar Paneer, Roti |',
  '| Saturday | Puri Sabji, Tea | Dal, Rice, Roti, Salad | Khichdi, Papad, Pickle |',
  '| Sunday | Chole Kulche, Tea | Special Veg Thali | Biryani, Raita |',
].join('\n');


export function AdminMessMenu() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [markdownContent, setMarkdownContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentUrl, setDocumentUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load existing menu when month/year changes
    useEffect(() => {
        async function fetchMenu() {
            setIsLoading(true);
            const menu = await getMessMenu(month, year);
            if (menu) {
                setMarkdownContent(menu.markdownContent);
                setDocumentUrl(menu.documentUrl || '');
            } else {
                setMarkdownContent(SAMPLE_MARKDOWN);
                setDocumentUrl('');
            }
            setSelectedFile(null);
            setIsLoading(false);
        }
        fetchMenu();
    }, [month, year]);

    const handleDownloadSample = () => {
        const anchor = document.createElement('a');
        const blob = new Blob([SAMPLE_MARKDOWN], { type: 'text/markdown' });
        anchor.href = URL.createObjectURL(blob);
        anchor.download = 'sample_mess_menu.md';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(anchor.href);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setSelectedFile(e.target.files[0]);
    };

    const handleSave = async () => {
        if (!markdownContent.trim()) {
            toast.error('Markdown content cannot be empty.');
            return;
        }

        setIsSaving(true);
        try {
            let finalDocumentUrl = documentUrl;

            // Upload new Image/PDF if admin selected one
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop() ?? 'bin';
                const fileName = 'mess_menus/' + year + '_' + month + '_' + Date.now() + '.' + fileExt;

                const { error: uploadError } = await db.storage
                    .from('mess-menus')
                    .upload(fileName, selectedFile, { cacheControl: '3600', upsert: true });

                if (uploadError) {
                    toast.error('Failed to upload document: ' + uploadError.message);
                    setIsSaving(false);
                    return;
                }

                const { data: urlData } = db.storage
                    .from('mess-menus')
                    .getPublicUrl(fileName);

                finalDocumentUrl = urlData.publicUrl;
                setDocumentUrl(finalDocumentUrl);
                setSelectedFile(null);
            }

            await upsertMessMenu({
                month,
                year,
                markdownContent,
                documentUrl: finalDocumentUrl || undefined,
            });

            toast.success('Mess menu saved successfully!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            toast.error('Failed to save mess menu: ' + message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-fade-in relative">
            <h2 className="text-2xl font-bold mb-6 font-serif">Manage Mess Menu</h2>

            {/* Month / Year selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2">Month</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>
                                {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                    >
                        {[year - 1, year, year + 1].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-64 rounded-xl" />
            ) : (
                <div className="space-y-6">

                    {/* Markdown textarea */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium">Markdown Menu Data</label>
                            <Button variant="outline" size="sm" onClick={handleDownloadSample}>
                                <Download className="w-4 h-4 mr-2" />
                                Download Sample
                            </Button>
                        </div>
                        <textarea
                            value={markdownContent}
                            onChange={(e) => setMarkdownContent(e.target.value)}
                            rows={15}
                            className="w-full font-mono text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4 resize-y"
                            placeholder="Paste the Markdown table here..."
                        />
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Ensure the format matches the sample download exactly for correct rendering.
                        </p>
                    </div>

                    {/* Document upload (Image / PDF) */}
                    <div className="p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-900/30">
                        <label className="block text-sm font-medium mb-3">
                            Original Document (Image / PDF) — optional
                        </label>
                        <div className="flex flex-wrap items-center gap-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => document.getElementById('doc-upload')?.click()}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {selectedFile
                                    ? selectedFile.name
                                    : documentUrl
                                        ? 'Replace Document'
                                        : 'Upload Document'}
                            </Button>
                            <input
                                id="doc-upload"
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileSelect}
                            />
                            {documentUrl && !selectedFile && (
                                <a
                                    href={documentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-rose-500 hover:underline"
                                >
                                    View current document
                                </a>
                            )}
                            {selectedFile && (
                                <span className="text-xs text-zinc-500">
                                    Ready to upload — will save when you click Save below.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Mess Menu'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
