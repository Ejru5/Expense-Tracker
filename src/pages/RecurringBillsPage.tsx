import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Calendar, Bell, Sparkles, Check, CheckSquare } from 'lucide-react'
import { useRecurringBills } from '../hooks/useRecurringBills'
import { useCards } from '../hooks/useCards'
import { useAppStore } from '../store/useAppStore'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/BottomSheet'
import { Skeleton } from '../components/ui'
import { formatINR, formatDate } from '../lib/utils'
import type { RecurringBill } from '../types'

const frequencyOptions = [
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly',  label: 'Yearly' },
]

export function RecurringBillsPage() {
  const navigate = useNavigate()
  const { categories } = useAppStore()
  const { bills, loading, addBill, markAsPaid, deleteBill } = useRecurringBills()
  const { cards } = useCards()

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    amount: '',
    categoryId: categories[0]?.id ?? '',
    frequency: 'monthly' as const,
    nextDueDate: '',
    autoLog: false,
    reminderDaysBefore: 1,
    cardId: '',
  })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.amount || !form.nextDueDate) return

    addBill({
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      frequency: form.frequency,
      nextDueDate: new Date(form.nextDueDate),
      autoLog: form.autoLog,
      reminderDaysBefore: form.reminderDaysBefore,
      cardId: form.cardId || undefined,
    })
    setShowAdd(false)
    setForm({
      name: '',
      amount: '',
      categoryId: categories[0]?.id ?? '',
      frequency: 'monthly',
      nextDueDate: '',
      autoLog: false,
      reminderDaysBefore: 1,
      cardId: '',
    })
  }

  const activeBills = bills.filter(b => new Date(b.nextDueDate) >= new Date())
  const overdueBills = bills.filter(b => new Date(b.nextDueDate) < new Date())

  return (
    <div className="page-content px-4 lg:px-8 pt-4 animate-fade-in max-w-2xl lg:max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost !p-2 !rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold flex-1" style={{ color: '#360802' }}>Recurring Bills</h1>
        <Button leftIcon={<Plus size={16} />} size="sm" onClick={() => setShowAdd(true)}>
          Add
        </Button>
      </div>

      {/* Bill Lists */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : bills.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <Calendar size={48} className="text-slate-200 mb-4" />
          <p className="font-semibold" style={{ color: '#a86157' }}>No recurring bills</p>
          <p className="text-xs mt-1" style={{ color: '#c4877a' }}>Keep track of your rent, subscription, utilities...</p>
          <Button className="mt-4 animate-scale-in" onClick={() => setShowAdd(true)}>Add Bill</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue */}
          {overdueBills.length > 0 && (
            <div>
              <h3 className="section-title mb-3" style={{ color: '#fb2d54' }}>Overdue</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {overdueBills.map(bill => (
                  <BillCard key={bill.id} bill={bill} onPay={markAsPaid} onDelete={deleteBill} overdue />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {activeBills.length > 0 && (
            <div>
              <h3 className="section-title mb-3">Upcoming Bills</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {activeBills.map(bill => (
                  <BillCard key={bill.id} bill={bill} onPay={markAsPaid} onDelete={deleteBill} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Bill Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Recurring Bill">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            id="bill-name"
            label="Bill Name"
            placeholder="Netflix, Rent, Jio Fiber..."
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            id="bill-amount"
            label="Amount"
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            leftElement={<span className="font-semibold text-slate-400">₹</span>}
            required
          />
          <Select
            id="bill-category"
            label="Category"
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            options={categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
          />
          <Select
            id="bill-frequency"
            label="Frequency"
            value={form.frequency}
            onChange={e => setForm(f => ({ ...f, frequency: e.target.value as any }))}
            options={frequencyOptions}
          />
          <Input
            id="bill-next-due"
            label="Next Due Date"
            type="date"
            value={form.nextDueDate}
            onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))}
            required
          />
          {cards.length > 0 && (
            <Select
              id="bill-card"
              label="Pay with Card (optional)"
              value={form.cardId}
              onChange={e => setForm(f => ({ ...f, cardId: e.target.value }))}
              options={cards.map(c => ({ value: c.id, label: c.label }))}
              placeholder="Select account"
            />
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                id="bill-autolog"
                type="checkbox"
                checked={form.autoLog}
                onChange={e => setForm(f => ({ ...f, autoLog: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="bill-autolog" className="text-sm font-semibold text-slate-700">Auto-log on due date</label>
            </div>
          </div>

          <Button type="submit" fullWidth>Add Bill</Button>
        </form>
      </Modal>
    </div>
  )
}

function BillCard({
  bill,
  onPay,
  onDelete,
  overdue,
}: {
  bill: RecurringBill
  onPay: (b: RecurringBill) => void
  onDelete: (id: string) => void
  overdue?: boolean
}) {
  const { categories } = useAppStore()
  const cat = categories.find(c => c.id === bill.categoryId) ?? categories[categories.length - 1]

  function handlePay() {
    onPay(bill)
  }

  return (
    <div className={`card flex items-center justify-between gap-4 !py-3.5 !px-4 hover-lift transition-card ${
      overdue ? 'border-rose-100 bg-rose-50/20' : ''
    }`}>
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: cat.bgColor }}
      >
        {cat.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{bill.name}</p>
          {bill.autoLog && (
            <span className="badge bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 text-[10px]">Auto</span>
          )}
        </div>
        <p className={`text-xs ${overdue ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
          {overdue ? 'Due ' : 'Next: '}
          {formatDate(bill.nextDueDate)} ({bill.frequency})
        </p>
      </div>

      {/* Right details */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 rupee-amount flex-shrink-0">
          {formatINR(bill.amount)}
        </p>
        <button
          onClick={handlePay}
          className="btn-primary !p-2 !rounded-lg text-xs active:scale-95 select-none"
          title="Mark as paid"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => confirm('Delete this recurring bill?') && onDelete(bill.id)}
          className="btn-ghost !p-2 !rounded-lg text-slate-400 hover:text-rose-500"
          title="Delete"
        >
          <Plus size={14} className="rotate-45" />
        </button>
      </div>
    </div>
  )
}
