import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Users, Check, Trash2, HelpCircle } from 'lucide-react'
import { useSplits } from '../hooks/useSplits'
import { useAppStore } from '../store/useAppStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/BottomSheet'
import { Skeleton } from '../components/ui'
import { formatINR, formatDate } from '../lib/utils'

export function SplitsPage() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const { splits, loading, addSplit, deleteSplit, settleParticipant, unsettledTotal, balancesByName } = useSplits()

  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)

  // Add split state
  const [form, setForm] = useState({
    totalAmount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [friends, setFriends] = useState<{ name: string; amount: string }[]>([
    { name: '', amount: '' }
  ])

  function handleAddFriendRow() {
    setFriends([...friends, { name: '', amount: '' }])
  }

  function handleFriendChange(index: number, field: 'name' | 'amount', value: string) {
    const updated = friends.map((f, i) => {
      if (i === index) {
        return { ...f, [field]: value }
      }
      return f
    })
    setFriends(updated)
  }

  function handleRemoveFriendRow(index: number) {
    setFriends(friends.filter((_, i) => i !== index))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.totalAmount || friends.length === 0 || !user) return

    // Validate friends
    const validFriends = friends.filter(f => f.name.trim() && f.amount && !isNaN(parseFloat(f.amount)))
    if (validFriends.length === 0) return

    setSaving(true)
    try {
      await addSplit({
        totalAmount: parseFloat(form.totalAmount),
        paidBy: user.uid,
        date: new Date(form.date),
        note: form.note.trim() || undefined,
        participants: validFriends.map(f => ({
          name: f.name.trim(),
          amount: parseFloat(f.amount),
          settled: false,
        })),
      })
      setShowAdd(false)
      setForm({ totalAmount: '', note: '', date: new Date().toISOString().split('T')[0] })
      setFriends([{ name: '', amount: '' }])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-4 animate-fade-in max-w-2xl lg:max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost !p-2 !rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold flex-1 text-nest-primary">Bill Splits</h1>
        <Button leftIcon={<Plus size={16} />} size="sm" onClick={() => setShowAdd(true)}>
          Add Split
        </Button>
      </div>

      {unsettledTotal > 0 && (
        <div 
          className="card mb-6"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-nest-accent-lime-text" 
              style={{ background: 'rgba(139, 197, 63, 0.15)' }}
            >
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-nest-text-secondary">Owed to you</p>
              <p className="text-2xl font-extrabold rupee-amount mt-0.5 text-nest-cat-groceries">{formatINR(unsettledTotal)}</p>
            </div>
          </div>

          {/* Breakdown per friend */}
          <div className="border-t mt-4 pt-3 space-y-2.5 border-nest-border">
            {Object.entries(balancesByName).map(([name, bal]) => (
              <div key={name} className="flex justify-between items-center text-xs font-bold">
                <span className="text-nest-text-secondary">{name}</span>
                <span className="text-nest-cat-groceries">{formatINR(bal)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lists */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : splits.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-nest-surface-muted flex items-center justify-center mb-4 border border-dashed border-nest-border">
            <Users size={28} className="text-nest-cat-shopping" />
          </div>
          <p className="font-bold text-sm text-nest-primary">No split bills yet</p>
          <p className="text-xs mt-1 max-w-xs text-nest-text-secondary">Split group dinners, trips, bills with friends easily</p>
          <Button className="mt-5" onClick={() => setShowAdd(true)}>Split a Bill</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {splits.map(split => {
            return (
              <div key={split.id} className="card hover-lift transition-card relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h4 className="font-bold text-sm text-nest-primary">
                      {split.note || 'Shared expense'}
                    </h4>
                    <p className="text-[10px] text-nest-text-tertiary">
                      Paid: {formatINR(split.totalAmount)} on {formatDate(split.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => confirm('Delete this split record?') && deleteSplit(split.id)}
                    className="p-1.5 rounded-lg text-nest-text-tertiary hover:text-rose-500 hover:bg-[rgba(242,135,154,0.1)] transition-all"
                    title="Delete split"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Participants list */}
                <div className="space-y-2.5 rounded-xl p-3 border bg-nest-surface-muted border-nest-border">
                  {split.participants.map(p => (
                    <div key={p.name} className="flex justify-between items-center text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-nest-text-secondary">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: p.settled ? 'var(--nest-cat-groceries)' : 'var(--nest-cat-dining)' }}
                        />
                        {p.name}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <span 
                          className="font-bold rupee-amount"
                          style={{
                            color: p.settled ? 'var(--nest-text-tertiary)' : 'var(--nest-text-primary)',
                            textDecoration: p.settled ? 'line-through' : 'none'
                          }}
                        >
                          {formatINR(p.amount)}
                        </span>
                        {!p.settled && (
                          <button
                            onClick={() => settleParticipant(split.id, p.name)}
                            className="bg-nest-surface hover:bg-emerald-50 border border-nest-border rounded-lg p-1 text-nest-text-secondary hover:text-emerald-600 transition-all shadow-sm"
                            title="Mark as settled"
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Split Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Split a Bill">
        <form onSubmit={handleAdd} className="flex flex-col max-h-[70vh]">
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 pb-4 scrollbar-thin">
            <Input
              id="split-amount"
              label="Total Amount"
              type="number"
              placeholder="0"
              value={form.totalAmount}
              onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))}
              leftElement={<span className="font-semibold text-slate-400">₹</span>}
              required
            />
            <Input
              id="split-note"
              label="Note"
              placeholder="e.g. Dinner with teammates, Trip tickets..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              required
            />
            <Input
              id="split-date"
              label="Date"
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />

            {/* Friends list */}
            <div className="space-y-3 pt-2 border-t border-nest-border">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-nest-text-secondary">Share Breakdown</label>
                <button
                  type="button"
                  onClick={handleAddFriendRow}
                  className="text-xs font-bold text-nest-cat-groceries hover:underline flex items-center gap-0.5"
                >
                  <Plus size={12} /> Add Person
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                {friends.map((friend, idx) => (
                  <div key={idx} className="flex gap-2 items-center animate-slide-down">
                    <input
                      type="text"
                      placeholder="Friend's Name"
                      className="input-base !py-2 text-xs flex-1"
                      value={friend.name}
                      onChange={e => handleFriendChange(idx, 'name', e.target.value)}
                      required
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        placeholder="Share"
                        className="input-base !py-2 pl-6 text-xs"
                        value={friend.amount}
                        onChange={e => handleFriendChange(idx, 'amount', e.target.value)}
                        required
                      />
                    </div>
                    {friends.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFriendRow(idx)}
                        className="text-slate-350 hover:text-rose-500 transition-colors p-1"
                      >
                        <Plus size={16} className="rotate-45" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-nest-border flex-shrink-0">
            <Button type="submit" loading={saving} fullWidth>Add Split Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default SplitsPage
