'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordSentPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
            <MailCheck size={32} className="text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-serif text-center text-foreground">
          Check Your Email
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground mt-2 px-4 leading-relaxed">
          We&apos;ve sent a password reset link to your email address. Click the link in the email to reset your password.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-sm text-center">
          The link will expire in <strong>60 minutes</strong>. Check your spam folder if you don&apos;t see it.
        </div>

        <Button asChild variant="primary" size="md" className="w-full">
          <Link href="/login">
            Back to Login
          </Link>
        </Button>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Try a different email
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
