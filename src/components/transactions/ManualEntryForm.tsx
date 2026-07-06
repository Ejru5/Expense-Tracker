import React, { useState, useEffect } from 'react'
import { ChevronLeft, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Input'
import { useTransactions } from '../../hooks/useTransactions'
import { useCards } from '../../hooks/useCards'
import { useAppStore } from '../../store/useAppStore'
import type { TransactionType, TransactionTemplate } from '../../types'
import { TransactionTemplates } from './TransactionTemplates'
import { RupeeKeyboard } from '../ui/RupeeKeyboard'

interface ManualEntryFormProps {
  onSuccess: () => void
  onCancel?: () => void
  /** Pre-fill values (e.g. from AI parse confirmation) */
  prefill?: {
    amount?: number
    categoryId?: string
    merchant?: string
    note?: string
    cardId?: string
    source?: 'manual' | 'ai-text' | 'ai-receipt'
    receiptImageUrl?: string
    receiptLineItems?: { name: string; amount: number }[]
    type?: TransactionType
    date?: string
  }
}

export function ManualEntryForm({ onSuccess, onCancel, prefill }: ManualEntryFormProps) {
  const { user, categories, household } = useAppStore()
  const { transactions, addTransaction } = useTransactions()
  const { cards, defaultCard } = useCards()

  const [type, setType]         = useState<TransactionType>(prefill?.type ?? 'expense')
  const [amount, setAmount]     = useState(prefill?.amount?.toString() ?? '')
  const [categoryId, setCat]    = useState(prefill?.categoryId ?? categories[0]?.id ?? '')
  const [merchant, setMerchant] = useState(prefill?.merchant ?? '')
  const [note, setNote]         = useState(prefill?.note ?? '')
  const [cardId, setCardId]     = useState(prefill?.cardId ?? defaultCard?.id ?? '')
  const [date, setDate]         = useState(prefill?.date ?? new Date().toISOString().split('T')[0])
  const [error, setError]       = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showKb, setShowKb]     = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : true)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAmountChange = (val: string) => {
    // Only allow numbers, at most one dot, and at most two decimal digits
    const clean = val.replace(/[^0-9.]/g, '')
    const parts = clean.split('.')
    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 2) return
    setAmount(clean)
  }

  const catOptions = categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))
  const cardOptions = cards.map(c => ({ value: c.id, label: `${c.label}${c.last4 ? ' ···' + c.last4 : ''}` }))

  function handleSelectTemplate(tpl: TransactionTemplate) {
    setAmount(tpl.amount.toString())
    setCat(tpl.categoryId)
    if (tpl.merchant) setMerchant(tpl.merchant)
    if (tpl.cardId) setCardId(tpl.cardId)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) { setError('Enter a valid amount'); return }
    if (!categoryId) { setError('Select a category'); return }
    if (!household || !user) return

    setError('')

    const parsedAmount = parseFloat(amount)

    // Check for duplicate transaction within the last hour
    const isDuplicate = transactions.some(t => {
      const diffMs = Math.abs(new Date(t.date).getTime() - new Date(date).getTime())
      const diffHours = diffMs / (1000 * 60 * 60)
      return (
        t.merchant && merchant &&
        t.merchant.toLowerCase() === merchant.trim().toLowerCase() &&
        t.amount === parsedAmount &&
        diffHours < 1
      )
    })

    if (isDuplicate) {
      const proceed = window.confirm(`A transaction of ₹${parsedAmount} at ${merchant} was logged less than an hour ago. Do you want to save this as a duplicate?`)
      if (!proceed) return
    }

    setIsSaving(true)
    try {
      await addTransaction({
        householdId: household.id,
        amount: parseFloat(amount),
        type,
        categoryId,
        merchant: merchant.trim() || undefined,
        note: note.trim() || undefined,
        paidBy: user.uid,
        cardId: cardId || undefined,
        date: new Date(date),
        source: prefill?.source ?? 'manual',
        receiptImageUrl: prefill?.receiptImageUrl,
        receiptLineItems: prefill?.receiptLineItems,
      })
      onSuccess()
    } catch (err: any) {
      console.error('Failed to save transaction:', err)
      setError('Failed to save. Please check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
      {/* Templates */}
      <TransactionTemplates
        onSelect={handleSelectTemplate}
        currentFormState={{ amount, categoryId, merchant, note, cardId }}
      />

      {/* Type Toggle — Jeton functional color vocabulary */}
      <div className="flex overflow-hidden" style={{ borderRadius: '16px', border: '1.5px solid #f3c5bb' }}>
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all duration-150"
            style={
              type === t
                ? t === 'expense'
                  ? { background: '#fb2d54', color: '#ffffff' }  // Magenta Spark — expense
                  : { background: '#34c771', color: '#ffffff' }  // Mint Action — income
                : { background: '#fef5f3', color: '#a86157' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="relative">
        <Input
          label="Amount"
          id="tx-amount"
          type="text"
          inputMode={isMobile ? 'none' : undefined}
          placeholder="0"
          value={amount}
          onFocus={() => isMobile && setShowKb(true)}
          onChange={e => handleAmountChange(e.target.value)}
          readOnly={isMobile}
          leftElement={<span className="font-semibold text-slate-500">₹</span>}
          required
        />
        {isMobile && showKb && (
          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850">
            <RupeeKeyboard
              value={amount}
              onChange={setAmount}
              onClose={() => setShowKb(false)}
            />
          </div>
        )}
      </div>

      {/* Category */}
      <Select
        label="Category"
        id="tx-category"
        value={categoryId}
        onChange={e => setCat(e.target.value)}
        options={catOptions}
        placeholder="Select category"
      />

      {/* Merchant */}
      <Input
        label="Merchant / Place"
        id="tx-merchant"
        type="text"
        placeholder="e.g. DMart, Zomato"
        value={merchant}
        onChange={e => setMerchant(e.target.value)}
      />

      {/* Date */}
      <Input
        label="Date"
        id="tx-date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      {/* Card */}
      {cards.length > 0 && (
        <Select
          label="Paid with"
          id="tx-card"
          value={cardId}
          onChange={e => setCardId(e.target.value)}
          options={cardOptions}
          placeholder="No card selected"
        />
      )}

      {/* Note */}
      <Textarea
        label="Note (optional)"
        id="tx-note"
        placeholder="Any extra detail..."
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      {error && <p className="text-xs text-rose-500 text-center">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            Back
          </Button>
        )}
        <Button
          type="submit"
          fullWidth={!onCancel}
          className="flex-1"
          leftIcon={<Check size={16} />}
          loading={isSaving}
          disabled={isSaving}
        >
          Save Transaction
        </Button>
      </div>
    </form>
  )
}
