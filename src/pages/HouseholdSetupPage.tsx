import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Users, Copy, Check } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useHousehold } from '../hooks/useHousehold'

type Step = 'choose' | 'create' | 'join'

export function HouseholdSetupPage() {
  const { createHousehold, joinHousehold } = useHousehold()
  const navigate = useNavigate()

  const [step, setStep]           = useState<Step>('choose')
  const [householdName, setHName] = useState('')
  const [inviteCode, setCode]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [created, setCreated]     = useState<{ name: string; code: string } | null>(null)
  const [copied, setCopied]       = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!householdName.trim()) { setError('Enter a household name'); return }
    setLoading(true)
    setError('')
    try {
      await createHousehold(householdName.trim())
      // Navigate to home — useHousehold will update state via listener
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteCode.trim()) { setError('Enter an invite code'); return }
    setLoading(true)
    setError('')
    try {
      await joinHousehold(inviteCode.trim())
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'choose') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-surface-subtle">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-fab mx-auto mb-4">
              <span className="text-white font-bold text-3xl">₹</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Set Up Your Household</h1>
            <p className="text-sm text-slate-400 mt-2">Create a new shared household or join one with an invite code</p>
          </div>

          <div className="space-y-3">
            <button
              id="create-household-btn"
              onClick={() => setStep('create')}
              className="flex items-center gap-4 w-full p-5 rounded-2xl bg-white shadow-card border border-slate-100
                         hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Home size={22} className="text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Create New Household</p>
                <p className="text-xs text-slate-400 mt-0.5">Set up a household and invite your partner</p>
              </div>
            </button>

            <button
              id="join-household-btn"
              onClick={() => setStep('join')}
              className="flex items-center gap-4 w-full p-5 rounded-2xl bg-white shadow-card border border-slate-100
                         hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Users size={22} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Join Existing Household</p>
                <p className="text-xs text-slate-400 mt-0.5">Enter the invite code from your partner</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'create') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-surface-subtle">
        <div className="w-full max-w-sm animate-slide-up">
          <button onClick={() => { setStep('choose'); setError('') }} className="btn-ghost mb-6 !pl-0">
            ← Back
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Create Household</h1>
          <p className="text-sm text-slate-400 mb-6">Give your household a name (e.g. "The Sharmas")</p>

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              id="household-name-input"
              label="Household Name"
              type="text"
              placeholder="The Sharmas"
              value={householdName}
              onChange={e => setHName(e.target.value)}
              required
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <Button type="submit" loading={loading} fullWidth size="lg">
              Create & Continue
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Join
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-surface-subtle">
      <div className="w-full max-w-sm animate-slide-up">
        <button onClick={() => { setStep('choose'); setError('') }} className="btn-ghost mb-6 !pl-0">
          ← Back
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Join Household</h1>
        <p className="text-sm text-slate-400 mb-6">Ask your partner for the 6-character invite code</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            id="invite-code-input"
            label="Invite Code"
            type="text"
            placeholder="ABC123"
            value={inviteCode}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="uppercase tracking-widest font-mono text-center text-lg"
            required
          />
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <Button type="submit" loading={loading} fullWidth size="lg">
            Join Household
          </Button>
        </form>
      </div>
    </div>
  )
}
