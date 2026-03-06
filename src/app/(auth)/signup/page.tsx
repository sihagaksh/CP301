'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Building, Hash, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/types'

export default function SignupPage() {
    const router = useRouter()
    const { signUp } = useAuth()
    const [form, setForm] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'student' as UserRole,
        department: '',
        batch: '',
        enrollment_number: '',
        employee_id: '',
        designation: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function update(field: string, value: string) {
        setForm((p) => ({ ...p, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error } = await signUp(form.email, form.password, {
            full_name: form.full_name,
            role: form.role,
            department: form.department || undefined,
            batch: form.batch || undefined,
            enrollment_number: form.enrollment_number || undefined,
            employee_id: form.employee_id || undefined,
            designation: form.designation || undefined,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.refresh()
            router.replace('/')
        }
    }

    const isStudent = form.role === 'student'
    const isFacultyStaff = form.role === 'faculty' || form.role === 'staff'

    return (
        <div className="auth-page">
            <div className="auth-bg-glow" />
            <div className="auth-container animate-fade-in-up" style={{ maxWidth: 460 }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon"><span>IR</span></div>
                    <h1>IIT Ropar</h1>
                    <p>Institute Community Platform</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Join the IIT Ropar community</p>

                    {error && <div className="auth-error">{error}</div>}

                    <div className="auth-input-group">
                        <User size={18} />
                        <input type="text" placeholder="Full Name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
                    </div>

                    <div className="auth-input-group">
                        <Mail size={18} />
                        <input type="email" placeholder="Email address" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                    </div>

                    <div className="auth-input-group">
                        <Lock size={18} />
                        <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
                        <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Role</label>
                        <select className="select-field" value={form.role} onChange={(e) => update('role', e.target.value)}>
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="staff">Staff</option>
                            <option value="alumni">Alumni</option>
                            <option value="guest">Guest / Visitor</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <div className="auth-input-group">
                            <Building size={18} />
                            <input type="text" placeholder="Department (e.g. CSE, ECE)" value={form.department} onChange={(e) => update('department', e.target.value)} />
                        </div>
                    </div>

                    {isStudent && (
                        <>
                            <div className="form-row" style={{ marginBottom: 14 }}>
                                <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                    <Hash size={18} />
                                    <input type="text" placeholder="Enrollment No." value={form.enrollment_number} onChange={(e) => update('enrollment_number', e.target.value)} />
                                </div>
                                <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                    <input type="text" placeholder="Batch (e.g. 2022)" value={form.batch} onChange={(e) => update('batch', e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    {isFacultyStaff && (
                        <div className="form-row" style={{ marginBottom: 14 }}>
                            <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                <Hash size={18} />
                                <input type="text" placeholder="Employee ID" value={form.employee_id} onChange={(e) => update('employee_id', e.target.value)} />
                            </div>
                            <div className="auth-input-group" style={{ marginBottom: 0 }}>
                                <input type="text" placeholder="Designation" value={form.designation} onChange={(e) => update('designation', e.target.value)} />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                    <p className="auth-switch">
                        Already have an account? <Link href="/login">Sign in</Link>
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
          background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
          bottom: -200px;
          left: -100px;
          pointer-events: none;
        }
        .auth-container { width: 100%; }
        .auth-logo { text-align: center; margin-bottom: 28px; }
        .auth-logo-icon {
          width: 56px; height: 56px;
          border-radius: var(--radius-lg);
          background: var(--gradient-gold);
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.1rem; color: #000;
          margin-bottom: 14px;
        }
        .auth-logo h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .auth-logo p { font-size: 0.85rem; color: var(--text-tertiary); margin-top: 2px; }
        .auth-form {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: 32px;
          backdrop-filter: blur(12px);
        }
        .auth-form h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 4px; }
        .auth-subtitle { font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: 24px; }
        .auth-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: var(--accent-danger);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 16px;
        }
        .auth-input-group {
          display: flex; align-items: center; gap: 10px; padding: 0 14px;
          background: var(--bg-tertiary); border: 1px solid var(--glass-border);
          border-radius: var(--radius-md); margin-bottom: 14px;
          transition: all var(--transition-fast);
        }
        .auth-input-group:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
        }
        .auth-input-group :global(svg) { color: var(--text-tertiary); flex-shrink: 0; }
        .auth-input-group input {
          flex: 1; padding: 12px 0; background: transparent; border: none;
          color: var(--text-primary); font-size: 0.9rem; font-family: inherit; outline: none;
        }
        .auth-input-group input::placeholder { color: var(--text-tertiary); }
        .auth-eye-btn {
          background: none; border: none; color: var(--text-tertiary);
          cursor: pointer; padding: 4px; display: flex;
        }
        .auth-switch { text-align: center; margin-top: 18px; font-size: 0.85rem; color: var(--text-tertiary); }
        .auth-switch :global(a) { color: var(--accent-primary); text-decoration: none; font-weight: 500; }
      `}</style>
        </div>
    )
}
