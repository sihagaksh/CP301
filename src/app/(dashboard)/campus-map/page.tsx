'use client'

import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export default function CampusMapPage() {
    const [fullscreen, setFullscreen] = useState(false)

    return (
        <div className="page-container" style={fullscreen ? { padding: 0, maxWidth: '100%', position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-primary)' } : undefined}>
            {!fullscreen && (
                <div className="page-header">
                    <div>
                        <h1 className="page-title">🏛️ 3D Campus Map</h1>
                        <p className="page-subtitle">Interactive 3D model of IIT Ropar campus — explore buildings, hostels & facilities</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setFullscreen(true)}>
                        <Maximize2 size={16} /> Fullscreen
                    </button>
                </div>
            )}

            <div style={{
                position: 'relative',
                width: '100%',
                height: fullscreen ? '100vh' : 'calc(100vh - 180px)',
                borderRadius: fullscreen ? 0 : 'var(--radius-lg)',
                overflow: 'hidden',
                border: fullscreen ? 'none' : '1px solid var(--glass-border)',
            }}>
                <iframe
                    src="/3d-campus/index.html"
                    title="IIT Ropar 3D Campus Map"
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block',
                    }}
                    allow="accelerometer; fullscreen"
                />

                {fullscreen && (
                    <button
                        onClick={() => setFullscreen(false)}
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 210,
                            background: 'rgba(255,255,255,.9)',
                            border: '1px solid rgba(0,0,0,.1)',
                            borderRadius: 8,
                            padding: '8px 14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: '#1a1a2e',
                            boxShadow: '0 2px 10px rgba(0,0,0,.1)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <Minimize2 size={16} /> Exit Fullscreen
                    </button>
                )}
            </div>
        </div>
    )
}
