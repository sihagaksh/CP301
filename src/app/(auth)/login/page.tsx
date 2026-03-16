'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle auth callback code if present (e.g. email confirmation redirect)
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      const supabase = createClient()
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          router.replace('/')
        } else {
          setError('Email verification failed. Please try signing up again.')
        }
      })
    }
  }, [searchParams, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh()
      router.replace('/')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-container animate-fade-in-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <span>IR</span>
          </div>
          <h1>IIT Ropar</h1>
          <p>Institute Community Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue to your community</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-input-group">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <Lock size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link href="/signup">Create one</Link>
          </p>
        </form>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .auth-bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%);
          top: -200px;
          right: -100px;
          pointer-events: none;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
        }

        .auth-logo {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: var(--gradient-gold);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          color: #000;
          margin-bottom: 14px;
        }

        .auth-logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .auth-logo p {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          margin-top: 2px;
        }

        .auth-form {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 32px;
          backdrop-filter: blur(12px);
        }

        .auth-form h2 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          margin-bottom: 24px;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--accent-danger);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .auth-input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          margin-bottom: 14px;
          transition: all var(--transition-fast);
        }

        .auth-input-group:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.08);
        }

        .auth-input-group :global(svg) {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .auth-input-group input {
          flex: 1;
          padding: 12px 0;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-family: inherit;
          outline: none;
        }

        .auth-input-group input::placeholder {
          color: var(--text-tertiary);
        }

        .auth-eye-btn {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          display: flex;
        }

        .auth-eye-btn:hover {
          color: var(--text-secondary);
        }

        .auth-form .btn {
          margin-top: 6px;
        }

        .auth-switch {
          text-align: center;
          margin-top: 18px;
          font-size: 0.85rem;
          color: var(--text-tertiary);
        }

        .auth-switch a,
        .auth-switch :global(a) {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .auth-switch a:hover,
        .auth-switch :global(a:hover) {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
