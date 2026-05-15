'use client';

import React, { useEffect, useState } from 'react';
import { getMessMenu } from '@/lib/db/mess-menu';
import type { MessMenu } from '@/lib/types';
import { Coffee, FileText, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

interface TableData {
    headers: string[];
    rows: string[][];
}

function parseMarkdownTable(markdown: string): TableData | null {
    const lines = markdown.split('\n');
    const tableLines = lines.filter(line => line.trim().startsWith('|'));
    if (tableLines.length < 3) return null;

    const headers = tableLines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = tableLines.slice(2).map(line =>
        line.split('|').map((cell: string) => cell.trim()).filter(Boolean)
    );

    return { headers, rows };
}

export default function MessMenuPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [menu, setMenu] = useState<MessMenu | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'text' | 'document'>('text');

    useEffect(() => {
        setViewMode('text'); // reset to text when month changes
        async function loadMenu() {
            setIsLoading(true);
            const data = await getMessMenu(month, year);
            setMenu(data);
            setIsLoading(false);
        }
        loadMenu();
    }, [month, year]);

    const tableData = menu?.markdownContent ? parseMarkdownTable(menu.markdownContent) : null;

    const isCurrentMonth = month === (now.getMonth() + 1) && year === now.getFullYear();

    const goToPrev = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const goToNext = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const scheduleTabClass = viewMode === 'text'
        ? 'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all bg-white dark:bg-zinc-700 shadow-sm text-rose-600 dark:text-rose-400'
        : 'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200';

    const documentTabClass = [
        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
        viewMode === 'document'
            ? 'bg-white dark:bg-zinc-700 shadow-sm text-rose-600 dark:text-rose-400'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200',
        !menu?.documentUrl ? 'opacity-40 cursor-not-allowed' : '',
    ].join(' ');

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative pt-4 pb-20">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                        <Coffee className="w-6 h-6" />
                        <span className="font-medium tracking-wider uppercase text-sm">Dining</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-serif text-foreground">
                        Mess Menu
                    </h1>

                    {/* Month navigator */}
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={goToPrev}
                            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="w-5 h-5 text-zinc-500" />
                        </button>

                        <div className="text-center min-w-[160px]">
                            <span className="text-xl font-semibold text-foreground">
                                {MONTH_NAMES[month - 1]} {year}
                            </span>
                            {isCurrentMonth && (
                                <span className="ml-2 text-xs font-medium bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                                    Current
                                </span>
                            )}
                        </div>

                        <button
                            onClick={goToNext}
                            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            aria-label="Next month"
                        >
                            <ChevronRight className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <button onClick={() => setViewMode('text')} className={scheduleTabClass}>
                            <CalendarDays className="w-4 h-4" /> Schedule
                        </button>
                        <button
                            onClick={() => menu?.documentUrl && setViewMode('document')}
                            className={documentTabClass}
                            title={!menu?.documentUrl ? 'No document uploaded for this month' : undefined}
                        >
                            <FileText className="w-4 h-4" /> Document
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────── */}
            {isLoading ? (
                <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-[500px] rounded-2xl" />
            ) : !menu ? (
                <div className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <Coffee className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                        No menu for {MONTH_NAMES[month - 1]} {year}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto">
                        {isCurrentMonth
                            ? "The mess menu for this month hasn't been uploaded yet. Check back soon."
                            : 'No menu was uploaded for this month. Try navigating to a different month.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">

                    {/* Schedule View */}
                    {viewMode === 'text' && tableData && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-300">
                                    <tr>
                                        {tableData.headers.map((header, i) => (
                                            <th key={i} className="px-6 py-4 font-semibold border-b border-rose-100 dark:border-rose-500/20 whitespace-nowrap">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.rows.map((row, i) => (
                                        <tr
                                            key={i}
                                            className={[
                                                'border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors',
                                                i % 2 === 0 ? 'bg-white dark:bg-zinc-950' : 'bg-zinc-50/50 dark:bg-zinc-900/20',
                                            ].join(' ')}
                                        >
                                            <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 border-r border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/50 sticky left-0 z-10 whitespace-nowrap">
                                                {row[0]}
                                            </td>
                                            {row.slice(1).map((cell: string, j: number) => (
                                                <td key={j} className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {viewMode === 'text' && !tableData && (
                        <div className="p-8 text-center text-zinc-500">
                            <p className="font-medium mb-1">The menu content could not be parsed as a table.</p>
                            <p className="text-sm">Please ask the admin to re-upload the menu using the correct markdown format.</p>
                        </div>
                    )}

                    {/* Document View */}
                    {viewMode === 'document' && menu.documentUrl && (
                        <div className="bg-zinc-100 dark:bg-zinc-900 w-full min-h-[800px] flex items-center justify-center p-4">
                            {menu.documentUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={menu.documentUrl}
                                    className="w-full h-[800px] rounded-lg shadow-sm bg-white"
                                    title={'Mess Menu PDF — ' + MONTH_NAMES[month - 1] + ' ' + year}
                                />
                            ) : (
                                <img
                                    src={menu.documentUrl}
                                    alt={'Mess Menu — ' + MONTH_NAMES[month - 1] + ' ' + year}
                                    className="max-w-full max-h-[800px] object-contain rounded-lg shadow-sm bg-white"
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
