import React, { useState } from 'react'
import { Plus, CreditCard, Trash2, Star } from 'lucide-react'
import { useCards } from '../hooks/useCards'
import { useTransactions } from '../hooks/useTransactions'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/BottomSheet'
import { Skeleton } from '../components/ui'
import { formatINR } from '../lib/utils'
import type { CardType } from '../types'

const cardTypeOptions = [
  { value: 'debit',  label: '💳 Debit Card' },
  { value: 'credit', label: '💳 Credit Card' },
  { value: 'upi',    label: '📱 UPI / Wallet' },
  { value: 'cash',   label: '💵 Cash' },
]

export function CardsPage() {
  const { cards, loading, addCard, deleteCard, setDefaultCard, CARD_COLORS } = useCards()
  const { transactions } = useTransactions()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    label: '', type: 'debit' as CardType, last4: '', colorTheme: CARD_COLORS[0], isDefault: false,
  })
  const [saving, setSaving] = useState(false)

  // Per-card spend this month
  const now = new Date()
  const monthTxs = transactions.filter(t =>
    t.type === 'expense' &&
    t.date.getMonth() === now.getMonth() &&
    t.date.getFullYear() === now.getFullYear()
  )

  function cardSpend(cardId: string) {
    return monthTxs.filter(t => t.cardId === cardId).reduce((s, t) => s + t.amount, 0)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.label) return
    setSaving(true)
    try {
      await addCard(form)
      setShowAdd(false)
      setForm({ label: '', type: 'debit', last4: '', colorTheme: CARD_COLORS[0], isDefault: false })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-6 animate-fade-in max-w-2xl lg:max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: '#360802' }}>Cards & Accounts</h1>
        <Button leftIcon={<Plus size={16} />} size="sm" onClick={() => setShowAdd(true)} id="add-card-btn">
          Add
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1].map(i => <Skeleton key={i} className="h-44 w-full" rounded="rounded-2xl" />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CreditCard size={48} className="text-slate-200 mb-4" />
          <p className="font-semibold text-slate-500">No cards yet</p>
          <p className="text-sm text-slate-300 mt-1">Add your first card or account</p>
          <Button className="mt-4" onClick={() => setShowAdd(true)}>Add Card</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cards.map(card => (
            <div
              key={card.id}
              className="rounded-2xl p-6 text-white relative overflow-hidden transition-card hover-lift cursor-default"
              style={{
                background: `linear-gradient(135deg, ${card.colorTheme} 0%, ${card.colorTheme}cc 100%)`,
                boxShadow: `0 8px 24px 0 ${card.colorTheme}55`,
              }}
            >
              {/* Circles */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 right-8 w-20 h-20 rounded-full bg-white/5" />

              {/* Top row */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-sm font-medium opacity-80">{card.type.toUpperCase()}</p>
                  <p className="font-bold text-lg">{card.label}</p>
                  {card.last4 && <p className="text-sm opacity-70 font-mono">···· {card.last4}</p>}
                </div>
                <div className="flex gap-2">
                  {card.isDefault && (
                    <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-medium">Default</span>
                  )}
                  <button
                    onClick={() => setDefaultCard(card.id)}
                    title="Set as default"
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Star size={14} fill={card.isDefault ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => deleteCard(card.id)}
                    title="Delete card"
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Spend */}
              <div>
                <p className="text-xs opacity-70 font-medium mb-0.5">This month's spend</p>
                <p className="text-2xl font-extrabold rupee-amount">{formatINR(cardSpend(card.id))}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Card / Account">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            id="card-label"
            label="Label"
            placeholder="HDFC Debit, Wife's Amex, Cash..."
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            required
          />
          <Select
            id="card-type"
            label="Type"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as CardType }))}
            options={cardTypeOptions}
          />
          <Input
            id="card-last4"
            label="Last 4 digits (optional)"
            placeholder="1234"
            maxLength={4}
            value={form.last4}
            onChange={e => setForm(f => ({ ...f, last4: e.target.value.replace(/\D/g, '') }))}
          />

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Card Color</label>
            <div className="flex gap-2 flex-wrap">
              {CARD_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, colorTheme: color }))}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.colorTheme === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="card-default"
              type="checkbox"
              checked={form.isDefault}
              onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="card-default" className="text-sm text-slate-700">Set as default card</label>
          </div>

          <Button type="submit" loading={saving} fullWidth>Save Card</Button>
        </form>
      </Modal>
    </div>
  )
}
