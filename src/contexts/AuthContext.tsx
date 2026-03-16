'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { User, UserPosition, PostingIdentity } from '@/lib/types'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
    session: Session | null
    user: User | null
    positions: UserPosition[]
    postingIdentities: PostingIdentity[]
    activeIdentity: PostingIdentity | null
    setActiveIdentity: (identity: PostingIdentity) => void
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, metadata: Partial<User>) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    positions: [],
    postingIdentities: [],
    activeIdentity: null,
    setActiveIdentity: () => { },
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [positions, setPositions] = useState<UserPosition[]>([])
    const [postingIdentities, setPostingIdentities] = useState<PostingIdentity[]>([])
    const [activeIdentity, setActiveIdentity] = useState<PostingIdentity | null>(null)
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
                setPositions([])
                setPostingIdentities([])
                setActiveIdentity(null)
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

        let userData = data as User | null

        // Auto-create profile row if it's missing (e.g. after schema recreation)
        if (!userData) {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const meta = authUser.user_metadata || {}
                const profile = {
                    id: authUser.id,
                    email: authUser.email!,
                    full_name: meta.full_name || authUser.email?.split('@')[0] || 'User',
                    role: meta.role || 'student',
                    department: meta.department || null,
                    branch: meta.branch || null,
                    batch: meta.batch || null,
                    enrollment_number: meta.enrollment_number || null,
                    employee_id: meta.employee_id || null,
                    designation: meta.designation || null,
                    current_organization: meta.current_organization || null,
                    current_position: meta.current_position || null,
                    guest_purpose: meta.guest_purpose || null,
                    guest_valid_until: meta.guest_valid_until || null,
                }
                const { data: newUser } = await supabase
                    .from('users')
                    .insert(profile)
                    .select('*')
                    .single()
                userData = newUser as User | null
            }
        }

        setUser(userData)

        if (userData) {
            await fetchPositions(userId, userData)
        }

        setLoading(false)
    }

    async function fetchPositions(userId: string, userData: User) {
        const { data: posData } = await supabase
            .from('user_positions')
            .select('*, organization:organizations(id, name, slug, type)')
            .eq('user_id', userId)
            .eq('is_active', true)

        const userPositions = (posData || []) as UserPosition[]
        setPositions(userPositions)

        // Build posting identities: base role + active PORs
        const roleLabel = userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
        const baseIdentity: PostingIdentity = { id: null, label: roleLabel }
        const porIdentities: PostingIdentity[] = userPositions.map(p => ({
            id: p.id,
            label: p.title,
            org_name: (p.organization as unknown as { name: string })?.name,
            org_slug: (p.organization as unknown as { slug: string })?.slug,
        }))

        const allIdentities = [baseIdentity, ...porIdentities]
        setPostingIdentities(allIdentities)
        setActiveIdentity(baseIdentity)
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
                emailRedirectTo: `${window.location.origin}/auth/callback`,
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
                branch: metadata.branch,
                batch: metadata.batch,
                enrollment_number: metadata.enrollment_number,
                employee_id: metadata.employee_id,
                designation: metadata.designation,
                current_organization: metadata.current_organization,
                current_position: metadata.current_position,
                guest_purpose: metadata.guest_purpose,
                guest_valid_until: metadata.guest_valid_until,
            })
        }
        return { error: error as Error | null }
    }

    async function signOut() {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setPositions([])
        setPostingIdentities([])
        setActiveIdentity(null)
        window.location.href = '/login'
    }

    return (
        <AuthContext.Provider value={{
            session, user, positions, postingIdentities, activeIdentity,
            setActiveIdentity, loading, signIn, signUp, signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}
