'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@/lib/types'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
    session: Session | null
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, metadata: Partial<User>) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session?.user) {
                fetchUser(session.user.id)
            } else {
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session?.user) {
                fetchUser(session.user.id)
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function fetchUser(userId: string) {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        setUser(data as User | null)
        setLoading(false)
    }

    async function signIn(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error as Error | null }
    }

    async function signUp(email: string, password: string, metadata: Partial<User>) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        })
        if (!error && data.user) {
            // Create user profile in users table
            await supabase.from('users').insert({
                id: data.user.id,
                email,
                full_name: metadata.full_name || '',
                role: metadata.role || 'student',
                department: metadata.department,
                batch: metadata.batch,
                enrollment_number: metadata.enrollment_number,
                employee_id: metadata.employee_id,
                designation: metadata.designation,
            })
        }
        return { error: error as Error | null }
    }

    async function signOut() {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        window.location.href = '/login'
    }

    return (
        <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
