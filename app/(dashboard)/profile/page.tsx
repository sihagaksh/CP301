'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // Redirect user to their unified public profile page
                router.replace(`/users/${user.id}`);
            } else {
                router.replace('/login');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
}
