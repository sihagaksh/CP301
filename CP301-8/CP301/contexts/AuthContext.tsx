// ============================================================
// contexts/AuthContext.tsx
// Authentication context for managing user session and auth state
// ============================================================

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { User, SignInRequest, SignUpRequest, UserPosition, Organization } from '@/lib/types';
import { getUserById } from '@/lib/db/users';
import { getUserPositions, getOrganizationById } from '@/lib/db/organizations';

export interface PostingIdentity {
  id: string | null;
  label: string;
  org_name?: string;
  org_slug?: string;
  org_id?: string;  // set for org-account identities; used to write acting_as_org_id
}

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isGuestChecked: boolean;
  activePositions: UserPosition[] | null;
  positions: UserPosition[];  // alias for activePositions (compat with Folder 1 pages)
  selectedIdentityId: string | null;
  setSelectedIdentityId: (id: string | null) => void;
  // Posting identity (used by feed post creation)
  postingIdentities: PostingIdentity[];
  activeIdentity: PostingIdentity | null;
  setActiveIdentity: (identity: PostingIdentity) => void;
  // Org account fields
  isOrgAccount: boolean;
  linkedOrg: Organization | null;
  loading: boolean;
  error: string | null;
  signUp: (data: SignUpRequest) => Promise<void>;
  signIn: (data: SignInRequest) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
  signOutGuest: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Start as false for SSR consistency, sync from cookie in useEffect to avoid hydration mismatch
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isGuestChecked, setIsGuestChecked] = useState<boolean>(false);
  const [activePositions, setActivePositions] = useState<UserPosition[] | null>(null);
  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null);
  const [postingIdentities, setPostingIdentities] = useState<PostingIdentity[]>([]);
  const [activeIdentity, setActiveIdentity] = useState<PostingIdentity | null>(null);
  const [linkedOrg, setLinkedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = React.useRef(false);
  const fetchingUserRef = React.useRef(false);

  // Sync guest state from cookie synchronously before any auth check
  // This runs before checkAuth so isGuest is correct before loading finishes
  React.useLayoutEffect(() => {
    const hasGuestCookie = document.cookie.split(';').some(c => c.trim().startsWith('guest-mode=1'));
    setIsGuest(hasGuestCookie);
    setIsGuestChecked(true);
  }, []);

  // Concurrency lock for syncCookie — prevents overlapping requests
  const syncingRef = React.useRef(false);
  const lastTokenRef = React.useRef<string | null>(undefined);

  // ── Cookie sync (concurrency-safe) ──────────────────────────
  const syncCookie = async (accessToken: string | null) => {
    // Skip if same token
    if (lastTokenRef.current === accessToken) return;
    // Skip if already syncing
    if (syncingRef.current) return;
    syncingRef.current = true;
    lastTokenRef.current = accessToken;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      if (accessToken) {
        await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken }),
          signal: controller.signal,
        });
      } else {
        await fetch('/api/auth/clear-cookie', {
          method: 'POST',
          signal: controller.signal,
        });
      }

      clearTimeout(timeout);
    } catch (err) {
      // Silently handle aborts and network errors — cookie sync is best-effort
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.warn('[AuthContext] syncCookie timed out after 5s');
      } else {
        console.error('[AuthContext] syncCookie error:', err);
      }
    } finally {
      syncingRef.current = false;
    }
  };

  // ── Initialize: getSession + listen for changes ─────────────
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Step 1: Get session on mount (no refreshSession — Supabase handles refresh automatically)
    async function checkAuth() {
      try {
        // Check guest mode cookie first
        if (typeof document !== 'undefined' && document.cookie.includes('guest-mode=1')) {
          setIsGuest(true);
          setLoading(false);
          return;
        }
        const {
          data: { session },
        } = await db.auth.getSession();

        if (session) {
          const userData = await getUserById(session.user.id);
          if (userData) {
            setUser(userData);

            if (userData.isOrgAccount && userData.linkedOrgId) {
              // ── Org account path ──────────────────────────────────
              const org = await getOrganizationById(userData.linkedOrgId);
              setLinkedOrg(org);
              // Use the org's logo as the account avatar everywhere
              if (org?.logoUrl) {
                userData.profilePictureUrl = org.logoUrl;
              }
              setUser(userData);
              setActivePositions([]);
              const orgIdentity: PostingIdentity = {
                id: null,
                label: org?.name ?? 'Organization',
                org_name: org?.name,
                org_slug: org?.slug,
                org_id: org?.id,   // ← used by feed/events/etc to set acting_as_org_id
              };
              setPostingIdentities([orgIdentity]);
              setActiveIdentity(orgIdentity);
              // Org accounts stay on the normal dashboard — no redirect.
              // /org-admin is accessible via the sidebar link for structural management.
            } else {
              // ── Human user path (unchanged) ────────────────────────
              setLinkedOrg(null);
              const positions = await getUserPositions(session.user.id);
              setActivePositions(positions);
              buildPostingIdentities(userData, positions);
              // Org accounts see the normal dashboard.
              // Block /org-admin for non-org-account users.
              if (typeof window !== 'undefined' && window.location.pathname.startsWith('/org-admin')) {
                window.location.replace('/');
              }
            }
          } else {
            // They have a Supabase session but no profile in the DB.
            // This is a broken user state — force sign out.
            document.cookie = 'sb-auth-token=; path=/; max-age=0';
            await db.auth.signOut().catch(() => { });
            if (typeof window !== 'undefined') window.location.replace('/login');
          }
        } else {
          // DESYNC DETECTION: Supabase client has no session (localStorage empty),
          // BUT we are on a protected route like the dashboard.
          if (typeof window !== 'undefined' && !isPublicPath(window.location.pathname)) {
            const hash = window.location.hash;
            // If they got bounced to `/` because of misconfigured Supabase Redirect URLs
            // but the hash contains a recovery token or an error that might be from recovery:
            if (hash.includes('type=recovery') || (hash.includes('error=') && hash.includes('otp_expired'))) {
               window.location.replace('/reset-password' + hash);
               return;
            }
            
            // Otherwise, normal unauthenticated user -> force to login
            document.cookie = 'sb-auth-token=; path=/; max-age=0';
            window.location.replace('/login');
          }
        }
      } catch (err) {
        console.error('[AuthContext] checkAuth error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Step 2: Listen for auth changes — THIS is the single source of truth for cookie sync
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Full user load only on actual sign-in (not token refresh)
        if (session) {
          if (!fetchingUserRef.current) {
            fetchingUserRef.current = true;
            void (async () => {
              try {
                const userData = await getUserById(session.user.id);
                if (userData) {
                  setUser(userData);
                  if (userData.isOrgAccount && userData.linkedOrgId) {
                    const org = await getOrganizationById(userData.linkedOrgId);
                    setLinkedOrg(org);
                    // Use org logo as the account avatar everywhere
                    if (org?.logoUrl) {
                      userData.profilePictureUrl = org.logoUrl;
                    }
                    setUser(userData);
                    setActivePositions([]);
                    const orgIdentity: PostingIdentity = {
                      id: null,
                      label: org?.name ?? 'Organization',
                      org_name: org?.name,
                      org_slug: org?.slug,
                      org_id: org?.id,
                    };
                    setPostingIdentities([orgIdentity]);
                    setActiveIdentity(orgIdentity);
                  } else {
                    setLinkedOrg(null);
                    const positions = await getUserPositions(session.user.id);
                    setActivePositions(positions);
                    buildPostingIdentities(userData, positions);
                  }
                }
              } finally {
                fetchingUserRef.current = false;
              }
            })();
          }
          void syncCookie(session.access_token);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Token rotated (e.g. tab regained focus) — only sync the cookie.
        // Do NOT re-fetch user from DB; user data hasn't changed.
        if (session) {
          void syncCookie(session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        document.cookie = 'sb-auth-token=; path=/; max-age=0';
        setUser(null);
        setLinkedOrg(null);
        setActivePositions(null);
        setSelectedIdentityId(null);
        setPostingIdentities([]);
        setActiveIdentity(null);
      }
      // INITIAL_SESSION is handled by checkAuth above — no action needed here
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ── Build posting identities from user + positions ───────────
  function buildPostingIdentities(userData: User, positions: UserPosition[]) {
    const roleLabel = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    const baseIdentity: PostingIdentity = { id: null, label: roleLabel };
    const porIdentities: PostingIdentity[] = positions.map((p) => ({
      id: p.id,
      label: p.title,
      org_name: p.org?.name,
      org_slug: p.org?.slug,
    }));
    const all = [baseIdentity, ...porIdentities];
    setPostingIdentities(all);
    setActiveIdentity((prev) => prev ?? baseIdentity);
  }

  // ── Sign Up ─────────────────────────────────────────────────
  const signUp = async (data: SignUpRequest) => {
    try {
      setError(null);
      setLoading(true);

      const { data: authData, error: signUpError } = await db.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Sign up failed');

      // Create user profile using service_role (SECURITY DEFINER function)
      const { error: profileError } = await db.rpc('create_user_profile', {
        p_id: authData.user.id,
        p_email: data.email,
        p_full_name: data.fullName,
        p_role: data.role,
        p_department: data.department || null,
        p_branch: data.branch || null,
        p_batch: data.batch || null,
      });

      if (profileError) {
        await db.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Load the created user
      const userData = await getUserById(authData.user.id);
      if (userData) {
        setUser(userData);
        const positions = await getUserPositions(authData.user.id);
        setActivePositions(positions);
        buildPostingIdentities(userData, positions);
      }

      await syncCookie(authData.session?.access_token || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Sign In ─────────────────────────────────────────────────
  const signIn = async (data: SignInRequest) => {
    try {
      setError(null);
      setLoading(true);

      const { data: authData, error: signInError } = await db.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;
      if (!authData.user) throw new Error('Sign in failed');

      // Load user profile
      const userData = await getUserById(authData.user.id);
      if (userData) {
        setUser(userData);
        const positions = await getUserPositions(authData.user.id);
        setActivePositions(positions);
        buildPostingIdentities(userData, positions);
      }

      await syncCookie(authData.session?.access_token || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Guest Mode ──────────────────────────────────────────────
  const signInAsGuest = () => {
    document.cookie = 'guest-mode=1; path=/; max-age=86400; SameSite=Lax';
    setIsGuest(true);
    window.location.href = '/notices';
  };

  const signOutGuest = () => {
    document.cookie = 'guest-mode=; path=/; max-age=0';
    setIsGuest(false);
    window.location.href = '/login';
  };

  // ── Sign Out ────────────────────────────────────────────────
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await db.auth.signOut();
      if (error) throw error;
      // Cookie clear + user null handled by onAuthStateChange(SIGNED_OUT)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  };

  // ── Update Profile ──────────────────────────────────────────
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      setError(null);

      const { error } = await db
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      const userData = await getUserById(user.id);
      if (userData) {
        setUser(userData);
        if (activePositions) buildPostingIdentities(userData, activePositions);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isGuestChecked,
        activePositions,
        positions: activePositions ?? [],
        selectedIdentityId,
        setSelectedIdentityId,
        postingIdentities,
        activeIdentity,
        setActiveIdentity,
        isOrgAccount: user?.isOrgAccount ?? false,
        linkedOrg,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        signInAsGuest,
        signOutGuest,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}