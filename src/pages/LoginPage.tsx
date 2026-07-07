import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-nest-bg text-nest-primary">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Nest Logo" className="w-16 h-16 rounded-full border border-nest-border object-cover mb-4" />
          <h1 className="text-2xl font-bold text-nest-primary">Nest</h1>
          <p className="text-sm text-nest-secondary mt-1">Sign in to your household</p>
        </div>

        {/* Google Sign In */}
        <button
          id="google-signin-btn"
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

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <Input
            id="login-email"
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
            id="login-password"
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            leftElement={<Lock size={16} />}
            rightElement={
              <button type="button" onClick={() => setShowPw(p => !p)} className="text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-600">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-nest-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-nest-accent-lime-text font-bold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

function friendlyError(code: string) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for sign-in. Please contact support.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
