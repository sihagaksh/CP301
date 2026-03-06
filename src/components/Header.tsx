'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Bell, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
    const { user } = useAuth()
    const [searchFocused, setSearchFocused] = useState(false)

    const initials = user?.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?'

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
                <Link href="/notifications" className="header-icon-btn" title="Notifications">
                    <Bell size={20} />
                    <span className="notification-dot" />
                </Link>

                <Link href="/profile" className="header-avatar" title="Profile">
                    {user?.profile_picture_url ? (
                        <img src={user.profile_picture_url} alt={user.full_name} />
                    ) : (
                        <span>{initials}</span>
                    )}
                </Link>
            </div>

            <style jsx>{`
        .app-header {
          position: fixed;
          top: 0;
          left: var(--sidebar-current-width, var(--sidebar-width));
          right: 0;
          height: var(--header-height);
          background: rgba(10, 10, 15, 0.8);
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

        .header-icon-btn {
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          text-decoration: none;
        }

        .header-icon-btn:hover {
          background: var(--glass-hover);
          color: var(--text-primary);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--accent-danger);
          border-radius: 50%;
          border: 2px solid var(--bg-primary);
        }

        .header-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--gradient-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
          color: white;
          overflow: hidden;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .header-avatar:hover {
          box-shadow: 0 0 0 2px var(--accent-primary);
        }

        .header-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .app-header {
            left: 0;
            padding: 0 16px 0 56px;
          }

          .header-search {
            max-width: 100%;
          }
        }
      `}</style>
        </header>
    )
}
