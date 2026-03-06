'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <div className="app-layout">
                <Sidebar />
                <Header />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </AuthProvider>
    )
}
