'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Map, Box, Expand, Shrink } from 'lucide-react';
import { cn } from '@/lib/utils';

type MapView = '2d' | '3d';

export default function CampusMapPage() {
    const [view, setView] = useState<MapView>('2d');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCSSFullscreen, setIsCSSFullscreen] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const mapSrc = view === '2d' ? '/maps/2d/index.html' : '/maps/3d/index.html';

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull || isCSSFullscreen);
            iframeRef.current?.contentWindow?.postMessage({ type: 'fullscreenChange', isFullscreen: isFull }, '*');
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isCSSFullscreen]);

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data?.type === 'exitFullscreen') {
                if (document.fullscreenElement) document.exitFullscreen().catch(console.error);
                if (isCSSFullscreen) {
                    setIsCSSFullscreen(false);
                    setIsFullscreen(false);
                    iframeRef.current?.contentWindow?.postMessage({ type: 'fullscreenChange', isFullscreen: false }, '*');
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isCSSFullscreen]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement && !isCSSFullscreen) {
            // Enter Fullscreen
            if (iframeRef.current && iframeRef.current.requestFullscreen) {
                iframeRef.current.requestFullscreen().then(() => {
                    // native success handled by event listener
                }).catch(() => {
                    setIsCSSFullscreen(true);
                    setIsFullscreen(true);
                    iframeRef.current?.contentWindow?.postMessage({ type: 'fullscreenChange', isFullscreen: true }, '*');
                });
            } else {
                setIsCSSFullscreen(true);
                setIsFullscreen(true);
                iframeRef.current?.contentWindow?.postMessage({ type: 'fullscreenChange', isFullscreen: true }, '*');
            }
        } else {
            // Exit Fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(console.error);
            }
            if (isCSSFullscreen) {
                setIsCSSFullscreen(false);
                setIsFullscreen(false);
                iframeRef.current?.contentWindow?.postMessage({ type: 'fullscreenChange', isFullscreen: false }, '*');
            }
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif">Campus Map</h1>
                    <p className="text-muted-foreground mt-1">
                        Explore the IIT Ropar campus in 2D or 3D.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* 2D / 3D Toggle */}
                    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => setView('2d')}
                            className={cn(
                                'flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all',
                                view === '2d'
                                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                            )}
                        >
                            <Map className="w-4 h-4" /> 2D Map
                        </button>
                        <button
                            onClick={() => setView('3d')}
                            className={cn(
                                'flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all',
                                view === '3d'
                                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                            )}
                        >
                            <Box className="w-4 h-4" /> 3D Map
                        </button>
                    </div>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Shrink className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Map Iframe */}
            <GlassSurface className={cn(
                "overflow-hidden flex-1 min-h-0",
                isCSSFullscreen && "fixed inset-0 z-[9999] bg-background rounded-none border-0"
            )}>
                <iframe
                    ref={iframeRef}
                    key={view}
                    src={mapSrc}
                    title={`${view.toUpperCase()} Campus Map`}
                    className="w-full h-full border-0 bg-background"
                    allow="fullscreen"
                />
            </GlassSurface>
        </div>
    );
}
