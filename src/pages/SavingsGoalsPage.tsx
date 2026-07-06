import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Target, Trash2, ArrowUpRight, DollarSign } from 'lucide-react'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/BottomSheet'
import { Skeleton } from '../components/ui'
import { formatINR, budgetPercent } from '../lib/utils'

const iconsList = ['🎯', '🚗', '🏠', '✈️', '🎓', '💍', '💻', '💰']

export function SavingsGoalsPage() {
  const navigate = useNavigate()
  const { goals, loading, addGoal, deleteGoal, addContribution } = useSavingsGoals()

  const [showAdd, setShowAdd] = useState(false)
  const [showDeposit, setShowDeposit] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')

  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    icon: '🎯',
    targetDate: '',
  })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.targetAmount) return

    addGoal({
      name: form.name.trim(),
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount || '0'),
      icon: form.icon,
      targetDate: form.targetDate ? new Date(form.targetDate) : undefined,
    })
    setShowAdd(false)
    setForm({ name: '', targetAmount: '', currentAmount: '0', icon: '🎯', targetDate: '' })
  }

  function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    if (!showDeposit || !depositAmount || isNaN(parseFloat(depositAmount))) return

    addContribution(showDeposit, parseFloat(depositAmount))
    setShowDeposit(null)
    setDepositAmount('')
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-4 animate-fade-in max-w-2xl lg:max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost !p-2 !rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold flex-1" style={{ color: '#360802' }}>Savings Goals</h1>
        <Button leftIcon={<Plus size={16} />} size="sm" onClick={() => setShowAdd(true)}>
          Add
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <Target size={48} className="text-slate-200 mb-4" />
          <p className="font-semibold" style={{ color: '#a86157' }}>No savings goals</p>
          <p className="text-xs mt-1" style={{ color: '#c4877a' }}>Start setting aside money for your future milestones</p>
          <Button className="mt-4" onClick={() => setShowAdd(true)}>Create Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = budgetPercent(goal.currentAmount, goal.targetAmount)
            return (
              <div key={goal.id} className="card hover-lift transition-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    {goal.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate" style={{ color: '#360802' }}>{goal.name}</h4>
                    {goal.targetDate && (
                      <p className="text-[10px] text-slate-400">
                        Target Date: {new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeposit(goal.id)}
                      className="btn-primary !py-1.5 !px-3 !rounded-lg text-xs flex items-center gap-1"
                    >
                      <ArrowUpRight size={12} /> Add
                    </button>
                    <button
                      onClick={() => confirm('Delete this savings goal?') && deleteGoal(goal.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">
                      Saved: <span className="font-bold text-slate-800 dark:text-slate-100">{formatINR(goal.currentAmount)}</span>
                    </span>
                    <span className="text-slate-400">Target: {formatINR(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-600 mt-1">{pct}% achieved</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Savings Goal">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            id="goal-name"
            label="Goal Name"
            placeholder="Goa Trip, New Laptop, Car Downpayment..."
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            id="goal-target"
            label="Target Amount"
            type="number"
            placeholder="0"
            value={form.targetAmount}
            onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
            leftElement={<span className="font-semibold text-slate-400">₹</span>}
            required
          />
          <Input
            id="goal-current"
            label="Starting Amount"
            type="number"
            placeholder="0"
            value={form.currentAmount}
            onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
            leftElement={<span className="font-semibold text-slate-400">₹</span>}
          />
          <Input
            id="goal-date"
            label="Target Date (optional)"
            type="date"
            value={form.targetDate}
            onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
            <div className="flex gap-2.5 flex-wrap">
              {iconsList.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all ${
                    form.icon === icon ? 'ring-2 ring-coral scale-105 bg-coral-50' : ''
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth>Create Goal</Button>
        </form>
      </Modal>

      {/* Contribution Deposit Modal */}
      <Modal open={!!showDeposit} onClose={() => setShowDeposit(null)} title="Contribute to Goal">
        <form onSubmit={handleDeposit} className="space-y-4">
          <Input
            id="deposit-amount"
            label="Contribution Amount"
            type="number"
            placeholder="0"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
            leftElement={<span className="font-semibold text-slate-400">₹</span>}
            required
            autoFocus
          />
          <Button type="submit" fullWidth>Confirm Contribution</Button>
        </form>
      </Modal>
    </div>
  )
}
export default SavingsGoalsPage
