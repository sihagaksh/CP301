import React from 'react';
import { getQuickLinks } from '@/lib/db/quick-links';
import QuickLinksManager from '@/components/features/quick-links/QuickLinksManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Phone, BookOpen, MapPin, Calendar, HelpCircle, Briefcase, ChevronRight, School, Library } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';

// Icon mapping based on section names
const getSectionIcon = (section: string) => {
    const s = section.toLowerCase();
    if (s.includes('official') || s.includes('website')) return <School className="w-5 h-5" />;
    if (s.includes('department')) return <BookOpen className="w-5 h-5" />;
    if (s.includes('transportation')) return <MapPin className="w-5 h-5" />;
    if (s.includes('library')) return <Library className="w-5 h-5" />;
    if (s.includes('calendar')) return <Calendar className="w-5 h-5" />;
    if (s.includes('help')) return <HelpCircle className="w-5 h-5" />;
    if (s.includes('placement')) return <Briefcase className="w-5 h-5" />;
    return <ChevronRight className="w-5 h-5" />;
};

export default async function QuickLinksPage() {
    console.log('[QuickLinksPage] Running async page render...');
    const links = await getQuickLinks();
    console.log(`[QuickLinksPage] getQuickLinks returned ${links.length} items`);

    // Group by section, then sub_section
    const groupedData: Record<string, Record<string, typeof links>> = {};
    
    links.forEach(link => {
        const sec = link.section || 'General';
        const sub = link.subSection || 'General';
        
        if (!groupedData[sec]) groupedData[sec] = {};
        if (!groupedData[sec][sub]) groupedData[sec][sub] = [];
        
        groupedData[sec][sub].push(link);
    });

    // Smart greedy distribution for perfectly balanced masonry aesthetics
    const sectionsWithWeights = Object.keys(groupedData).map(section => {
        let weight = 10; // base CardHeader padding weight
        Object.keys(groupedData[section]).forEach(sub => {
            if (sub !== 'General') weight += 4; // Sub-section header padding
            weight += groupedData[section][sub].length * 5; // Each link takes roughly 5 units of vertical space
        });
        return { section, weight };
    });

    // Sort descending by weight to distribute largest items first
    sectionsWithWeights.sort((a, b) => b.weight - a.weight);

    // We will build 3 logical columns (renders naturally on desktop, scales down organically)
    const columnsToRender: string[][] = [[], [], []];
    const columnWeights = [0, 0, 0];

    sectionsWithWeights.forEach(({ section, weight }) => {
        let minIndex = 0;
        let minW = columnWeights[0];
        for (let i = 1; i < 3; i++) {
            if (columnWeights[i] < minW) {
                minW = columnWeights[i];
                minIndex = i;
            }
        }
        columnsToRender[minIndex].push(section);
        columnWeights[minIndex] += weight;
    });

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Quick Links</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Essential resources, contact numbers, and portals at IIT Ropar.
                    </p>
                </div>
                <QuickLinksManager initialLinks={links} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {columnsToRender.map((columnSections, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-6">
                        {columnSections.map((section) => (
                            <Card key={section} className="flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
                                <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="p-2 rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            {getSectionIcon(section)}
                                        </div>
                                        {section}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 flex flex-col">
                                    {Object.keys(groupedData[section]).map((sub, index) => (
                                        <div key={sub} className={`p-4 ${index > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}>
                                            {sub !== 'General' && (
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{sub}</h3>
                                            )}
                                            <ul className="space-y-3">
                                                {groupedData[section][sub].map((link) => {
                                                    const isPhone = link.url.startsWith('tel:');
                                                    return (
                                                        <li key={link.id}>
                                                            <Link 
                                                                href={link.url} 
                                                                target={isPhone ? "_self" : "_blank"}
                                                                rel="noopener noreferrer"
                                                                className="group flex flex-col items-start gap-1 p-2 -mx-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2 w-full text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
                                                                    {isPhone ? <Phone className="w-4 h-4 text-emerald-500" /> : <ExternalLink className="w-4 h-4 text-indigo-400 opacity-70 group-hover:opacity-100" />}
                                                                    <span className="truncate">{link.title}</span>
                                                                </div>
                                                                {link.description && (
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-6">
                                                                        {link.description}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
