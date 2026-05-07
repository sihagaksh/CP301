'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { useProfile } from '@/lib/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';

export function AlumniRequestModal() {
    const { submitAlumniRequest, alumniRequest } = useProfile();
    const { user } = useAuth();
    
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // If user is already alumni or has a request, we might handle it outside, but let's be safe
    if (!user || user.role === 'alumni') return null;

    if (alumniRequest) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm">
                <GraduationCap className="h-4 w-4 text-accent-gold" />
                <span className="font-medium">Alumni Request:</span>
                <span className={`capitalize ${
                    alumniRequest.status === 'approved' ? 'text-emerald-500' : 
                    alumniRequest.status === 'rejected' ? 'text-rose-500' : 
                    'text-amber-500'
                }`}>
                    {alumniRequest.status}
                </span>
            </div>
        );
    }

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setError('Please enter a valid personal email.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { data: { session } } = await db.auth.getSession();
            
            const res = await fetch('/api/profile/alumni-request/otp', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit OTP.');
            return;
        }

        setIsLoading(true);
        setError('');

        const success = await submitAlumniRequest(email, otp);
        if (success) {
            setStep(3);
        } else {
            setError('Verification failed. Invalid or expired OTP.');
        }
        setIsLoading(false);
    };

    const resetForm = (open: boolean) => {
        if (!open) {
            setTimeout(() => {
                setStep(1);
                setEmail('');
                setOtp('');
                setError('');
            }, 300);
        }
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={resetForm}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-accent-gold text-accent-gold hover:bg-accent-gold/10">
                    <GraduationCap className="h-4 w-4" />
                    Apply for Alumni Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md z-[100]" overlayClassName="z-[100]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-accent-gold" />
                        Alumni Account Request
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Provide your personal email address to use after graduation. We will send a verification code to it."}
                        {step === 2 && "Enter the 6-digit verification code sent to your personal email."}
                        {step === 3 && "Request submitted successfully!"}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="personalEmail">Personal Email Address</Label>
                            <Input 
                                id="personalEmail" 
                                type="email" 
                                placeholder="name@gmail.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 w-full sm:w-auto">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                Send Verification Code
                            </Button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyAndSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Verification Code</Label>
                            <Input 
                                placeholder="123456" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                maxLength={6}
                                required 
                                className="text-center tracking-widest font-mono text-lg"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Sent to: <span className="font-medium text-foreground">{email}</span>
                            </p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-sm text-amber-800 dark:text-amber-200 mt-4 border border-amber-200 dark:border-amber-800/30">
                            <strong>Important:</strong> Once approved by the admin, your account email will be permanently changed to this personal email.
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isLoading}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Verify & Submit
                            </Button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">Request Received</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Your alumni request has been submitted to the administration. You can track its status here on your profile page.
                        </p>
                        <Button onClick={() => setIsOpen(false)} className="mt-4 w-full sm:w-auto">
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
