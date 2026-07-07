import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError('')
    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/onboarding')
    } catch (err: any) {
      setError(
        err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/onboarding')
    } catch {
      setError('Google sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-nest-bg text-nest-primary">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Nest Logo" className="w-16 h-16 rounded-full border border-nest-border object-cover mb-4" />
          <h1 className="text-2xl font-bold text-nest-primary">Create Account</h1>
          <p className="text-sm text-nest-secondary mt-1">Start tracking your household expenses</p>
        </div>

        <button
          id="google-register-btn"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl
                     border border-slate-200 bg-white hover:bg-slate-50
                     text-sm font-semibold text-slate-700 shadow-card
                     transition-all duration-150 active:scale-95 disabled:opacity-50 mb-5"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <Input
            id="register-name"
            label="Your name"
            type="text"
            placeholder="Dhruv"
            value={name}
            onChange={e => setName(e.target.value)}
            leftElement={<User size={16} />}
            required
          />
          <Input
            id="register-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            leftElement={<Mail size={16} />}
            required
            autoComplete="email"
          />
          <Input
            id="register-password"
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Min 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftElement={<Lock size={16} />}
            rightElement={
              <button type="button" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
            autoComplete="new-password"
          />

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-600">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-nest-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-nest-accent-lime-text font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
