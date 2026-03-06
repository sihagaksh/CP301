'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    BookOpen,
    ShoppingBag,
    Search,
    Users,
    Bell,
    Calendar,
    MapPin,
    Link2,
    Megaphone,
    Award,
    Menu,
    X,
    LogOut,
    User,
    ChevronLeft,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
    { label: 'Feed', href: '/', icon: Home },
    { label: 'Blogs', href: '/blogs', icon: BookOpen },
    { label: 'Buy & Sell', href: '/marketplace', icon: ShoppingBag },
    { label: 'Lost & Found', href: '/lost-found', icon: Search },
    { label: 'Communities', href: '/communities', icon: Users },
    { label: 'Notices', href: '/notices', icon: Megaphone },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'Clubs', href: '/clubs', icon: Award },
    { label: 'Campus Map', href: '/map', icon: MapPin },
    { label: 'Quick Links', href: '/quick-links', icon: Link2 },
    { label: 'Notifications', href: '/notifications', icon: Bell },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { user, signOut } = useAuth()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    // Sync collapsed state with layout via CSS custom property
    useEffect(() => {
        document.documentElement.style.setProperty(
            '--sidebar-current-width',
            collapsed ? '68px' : 'var(--sidebar-width)'
        )
    }, [collapsed])

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="sidebar-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <span>IR</span>
                    </div>
                    {!collapsed && (
                        <div className="sidebar-logo-text">
                            <span className="sidebar-logo-title">IIT Ropar</span>
                            <span className="sidebar-logo-sub">Community</span>
                        </div>
                    )}
                    <button
                        className="sidebar-collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {navItems.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
                            title={collapsed ? label : undefined}
                        >
                            <Icon size={20} />
                            {!collapsed && <span>{label}</span>}
                            {isActive(href) && <div className="sidebar-link-indicator" />}
                        </Link>
                    ))}
                </nav>

                {/* User section */}
                <div className="sidebar-footer">
                    <Link href="/profile" className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}>
                        <User size={20} />
                        {!collapsed && <span>{user?.full_name || 'Profile'}</span>}
                    </Link>
                    <button className="sidebar-link" onClick={signOut}>
                        <LogOut size={20} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            <style jsx global>{`
        .sidebar-mobile-toggle {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 1002;
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          padding: 8px;
          cursor: pointer;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          z-index: 999;
          transition: width var(--transition-base);
          overflow-x: hidden;
        }

        .sidebar.collapsed {
          width: 68px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 16px;
          border-bottom: 1px solid var(--glass-border);
          min-height: var(--header-height);
          position: relative;
        }

        .sidebar-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--gradient-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          color: #000;
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .sidebar-logo-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .sidebar-logo-sub {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .sidebar-collapse-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          transition: all var(--transition-fast);
        }

        .sidebar-collapse-btn:hover {
          color: var(--text-primary);
          background: var(--glass-hover);
        }

        .sidebar.collapsed .sidebar-logo {
          justify-content: center;
          padding: 18px 10px;
        }

        .sidebar.collapsed .sidebar-collapse-btn {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          margin: 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 2px;
          scrollbar-width: thin;
          scrollbar-color: var(--glass-border) transparent;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--glass-border);
          border-radius: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          position: relative;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          font-family: inherit;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
        }

        .sidebar-link:hover {
          background: var(--glass-hover);
          color: var(--text-primary);
        }

        .sidebar-link.active {
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent-primary);
        }

        .sidebar-link-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--accent-primary);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }

        .sidebar.collapsed .sidebar-link {
          justify-content: center;
          padding: 10px;
        }

        .sidebar-footer {
          padding: 8px;
          border-top: 1px solid var(--glass-border);
        }

        @media (max-width: 768px) {
          .sidebar-mobile-toggle {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
          }

          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .sidebar-collapse-btn {
            display: none;
          }
        }
      `}</style>
        </>
    )
}
