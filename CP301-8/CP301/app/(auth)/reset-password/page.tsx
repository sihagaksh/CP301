'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Supabase sends a PASSWORD_RECOVERY event once the hash in the URL
  // is validated client-side. We wait for it before showing the form.
  useEffect(() => {
    const { data: { subscription } } = db.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true);
      }
    });

    // Also handle the case where the user loaded the page after Supabase
    // already picked up the hash (race condition), by checking session.
    db.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError('Please fill in both fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);

      const { error: updateError } = await db.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Sign out so the user logs in fresh with the new password
      await db.auth.signOut();
      setIsDone(true);

      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────
  if (isDone) {
    return (
      <Card className="w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-xl font-serif font-semibold text-foreground">Password Updated!</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been changed successfully. Redirecting you to login…
          </p>
          <Button asChild variant="primary" size="md" className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Loading / waiting for recovery event ─────────────────────
  if (!isReady) {
    return (
      <Card className="w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
          <p className="text-xs text-muted-foreground/60">
            If this takes too long, your link may have expired.{' '}
            <Link href="/forgot-password" className="text-amber-600 dark:text-amber-500 hover:underline">
              Request a new one
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Main form ─────────────────────────────────────────────────
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-center text-foreground">
          Set New Password
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Choose a strong password for your account
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-input focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
              <Lock size={18} className="text-muted-foreground flex-shrink-0" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground min-w-0"
                disabled={isSubmitting}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-input focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all">
              <Lock size={18} className="text-muted-foreground flex-shrink-0" />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground min-w-0"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Password strength hint */}
          {password && (
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                {password.length >= 8 ? '✓' : '○'} At least 8 characters
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
                {/[0-9]/.test(password) ? '✓' : '○'} One number
              </li>
            </ul>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Reset Password
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
