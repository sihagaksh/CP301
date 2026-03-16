'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
    const { postingIdentities, activeIdentity, setActiveIdentity } = useAuth()
    const [searchFocused, setSearchFocused] = useState(false)
    const [showIdentityMenu, setShowIdentityMenu] = useState(false)

    return (
        <header className="app-header">
            <div className="header-search" data-focused={searchFocused}>
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search blogs, events, communities..."
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                />
            </div>

            <div className="header-actions">
                {/* Posting Identity Selector */}
                {postingIdentities.length > 1 && (
                    <div style={{ position: 'relative' }}>
                        <button className="identity-selector" onClick={() => setShowIdentityMenu(!showIdentityMenu)}>
                            <span className="identity-label">{activeIdentity?.label}</span>
                            <ChevronDown size={14} />
                        </button>
                        {showIdentityMenu && (
                            <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 149 }} onClick={() => setShowIdentityMenu(false)} />
                                <div className="identity-dropdown">
                                    <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Post as</div>
                                    {postingIdentities.map((identity, i) => (
                                        <button
                                            key={i}
                                            className={`identity-option ${activeIdentity?.id === identity.id ? 'active' : ''}`}
                                            onClick={() => { setActiveIdentity(identity); setShowIdentityMenu(false) }}
                                        >
                                            <span>{identity.label}</span>
                                            {identity.org_name && <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{identity.org_name}</span>}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>

            <style jsx>{`
        .app-header {
          position: fixed;
          top: 0;
          left: var(--sidebar-current-width, var(--sidebar-width));
          right: 0;
          height: var(--header-height);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          z-index: 100;
          transition: left var(--transition-base);
        }

        .header-search {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          max-width: 480px;
          flex: 1;
          transition: all var(--transition-fast);
        }

        .header-search[data-focused='true'] {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.08);
        }

        .header-search :global(svg) {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .header-search input {
          flex: 1;
          padding: 9px 0;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
        }

        .header-search input::placeholder {
          color: var(--text-tertiary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 20px;
        }

        @media (max-width: 768px) {
          .app-header {
            left: 0;
            padding: 0 16px 0 56px;
          }

          .header-search {
            max-width: 100%;
          }

          .identity-selector {
            display: none;
          }
        }

        .identity-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: inherit;
          white-space: nowrap;
        }

        .identity-selector:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .identity-label {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .identity-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          min-width: 220px;
          z-index: 150;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .identity-option {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          padding: 10px 14px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          font-family: inherit;
          transition: all var(--transition-fast);
          gap: 2px;
        }

        .identity-option:hover {
          background: var(--glass-hover);
          color: var(--text-primary);
        }

        .identity-option.active {
          color: var(--accent-primary);
          background: rgba(245,158,11,0.06);
        }
      `}</style>
        </header>
    )
}
