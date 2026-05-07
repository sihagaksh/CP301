// ============================================================
// lib/hooks/useProfile.ts
// Hook for fetching and updating user profiles
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { getUserById, updateUserProfile, getAlumniRequestByUserId } from '@/lib/db/users';
import type { User, UpdateProfileRequest, AlumniRequest } from '@/lib/types';

interface UseProfileReturn {
    profile: User | null;
    alumniRequest: AlumniRequest | null;
    loading: boolean;
    error: string | null;
    updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
    refreshProfile: () => Promise<void>;
    submitAlumniRequest: (personalEmail: string, otp: string) => Promise<boolean>;
}

export function useProfile(userId?: string): UseProfileReturn {
    const { user: authUser } = useAuth();

    // If no userId provided, default to the logged in user
    const targetUserId = userId || authUser?.id;

    const [profile, setProfile] = useState<User | null>(null);
    const [alumniRequest, setAlumniRequest] = useState<AlumniRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userProfile = await getUserById(targetUserId);
            setProfile(userProfile);
            
            // Also fetch alumni request if user is student
            if (userProfile && (userProfile.role === 'student' || userProfile.role === 'alumni')) {
                const req = await getAlumniRequestByUserId(targetUserId);
                setAlumniRequest(req);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [targetUserId]);

    const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
        if (!targetUserId) return false;

        try {
            setLoading(true);
            setError(null);
            const updatedUser = await updateUserProfile(targetUserId, data);
            setProfile(updatedUser);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            return false;
        } finally {
            setLoading(false);
        }
    }, [targetUserId]);

    const submitAlumniRequest = useCallback(async (personalEmail: string, otp: string) => {
        if (!targetUserId) return false;
        try {
            setLoading(true);
            setError(null);
            
            const { data: { session } } = await db.auth.getSession();
            
            const res = await fetch('/api/profile/alumni-request/verify', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                },
                body: JSON.stringify({ email: personalEmail, otp, userId: targetUserId })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit alumni request');
            
            setAlumniRequest(data.data);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to submit alumni request');
            return false;
        } finally {
            setLoading(false);
        }
    }, [targetUserId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, alumniRequest, loading, error, updateProfile, refreshProfile: fetchProfile, submitAlumniRequest };
}
