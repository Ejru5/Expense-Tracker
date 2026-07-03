import React, { useState } from 'react'
import { ChevronLeft, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBudgets } from '../hooks/useBudgets'
import { useAppStore } from '../store/useAppStore'
import { CategoryBudgetCard } from '../components/budgets/CategoryBudgetCard'
import { Skeleton } from '../components/ui'
import { formatINR, budgetPercent } from '../lib/utils'
import { Modal } from '../components/ui/BottomSheet'

export function BudgetsPage() {
  const navigate = useNavigate()
  const { categories } = useAppStore()

  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const {
    budget, loading, totalSpent,
    spentByCategory, setCategoryBudget, setTotalBudget,
  } = useBudgets(year, month)

  const [editingTotal, setEditingTotal]   = useState(false)
  const [totalValue, setTotalValue]       = useState('')
  const [savingTotal, setSavingTotal]     = useState(false)

  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [categoryValue, setCategoryValue]     = useState('')
  const [savingCategory, setSavingCategory]   = useState(false)

  const displayDate = new Date(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
    if (isCurrentMonth) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function handleSaveTotal() {
    const amount = parseFloat(totalValue)
    if (isNaN(amount) || amount < 0) return
    setTotalBudget(amount)
    setEditingTotal(false)
  }

  const totalBudget = budget?.totalBudget ?? 0
  const pct = budgetPercent(totalSpent, totalBudget)

  // Only show categories that have some spend or a budget set
  const activeCategories = categories.filter(cat =>
    (spentByCategory[cat.id] ?? 0) > 0 ||
    (budget?.categoryBudgets?.[cat.id] ?? 0) > 0
  )
  const otherCategories = categories.filter(cat =>
    (spentByCategory[cat.id] ?? 0) === 0 &&
    (budget?.categoryBudgets?.[cat.id] ?? 0) === 0
  )

  return (
    <div className="page-content px-4 lg:px-8 pt-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 rounded-xl border border-border bg-surface dark:bg-surface-subtle flex items-center justify-center min-h-[40px] min-w-[40px] hover:bg-surface-warm transition-colors active:scale-[0.97]"
          aria-label="Go Back"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex-1">Budgets</h1>
      </div>

      {/* Centered Capsule Month Selector */}
      <div className="flex items-center justify-between bg-surface-warm/40 dark:bg-slate-900/20 border border-border-subtle p-1 rounded-xl mb-4 max-w-sm mx-auto select-none">
        <button onClick={prevMonth} className="btn-ghost !px-3 !py-1 text-xs font-bold">← Prev</button>
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest animate-fade-in">
          {displayDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={nextMonth}
          disabled={year === now.getFullYear() && month === now.getMonth()}
          className="btn-ghost !px-3 !py-1 text-xs font-bold disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      {/* Overall monthly budget card */}
      <div
        className="rounded-2xl p-5 text-white mb-6 relative overflow-hidden"
        style={{
          background: 'var(--gradient-coral-flame)',
          boxShadow: '0 8px 24px rgba(0, 102, 204, 0.15)',
          borderRadius: '16px',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-0.5">Overall Monthly Limit</p>
            <p className="text-3xl font-extrabold tracking-tight rupee-amount">
              {totalBudget > 0 ? formatINR(totalBudget) : 'Not set'}
            </p>
            <p className="text-xs text-blue-100/80 font-semibold mt-1">
              <span className="text-white font-extrabold">{formatINR(totalSpent)}</span> spent
              {totalBudget > 0 && (
                <>
                  <span className="mx-1.5 opacity-60">·</span>
                  <span>{formatINR(Math.max(0, totalBudget - totalSpent))} remaining</span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => { setEditingTotal(e => !e); setTotalValue(totalBudget > 0 ? totalBudget.toString() : '') }}
            className="bg-white/25 hover:bg-white/35 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 select-none"
          >
            {editingTotal ? 'Cancel' : 'Edit Limit'}
          </button>
        </div>

        {/* Edit total input box */}
        {editingTotal && (
          <div className="flex gap-2 mb-3.5 animate-slide-down">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                inputMode="numeric"
                className="input-base pl-8 !py-2 !bg-white text-slate-900 !rounded-xl"
                placeholder="Total monthly budget"
                value={totalValue}
                onChange={e => setTotalValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveTotal()}
                autoFocus
              />
            </div>
            <button
              onClick={handleSaveTotal}
              disabled={savingTotal}
              className="flex items-center gap-1.5 bg-white text-coral font-bold rounded-xl px-4 py-2 text-xs hover:bg-slate-50 transition-colors select-none active:scale-95"
            >
              <Check size={14} />
              {savingTotal ? '...' : 'Save'}
            </button>
          </div>
        )}

        {/* Modern Thicker Progress bar */}
        {totalBudget > 0 && (
          <div className="pt-1">
            <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  pct >= 100 ? 'bg-rose-400' : pct >= 80 ? 'bg-amber-300' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-blue-100/90 mt-1.5">
              <span>{pct.toFixed(0)}% of limit used</span>
              {pct >= 100 && (
                <span className="text-rose-200">
                  Over by {formatINR(totalSpent - totalBudget)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category budgets grid layout */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active categories first */}
          {activeCategories.map(cat => (
            <CategoryBudgetCard
              key={cat.id}
              category={cat}
              spent={spentByCategory[cat.id] ?? 0}
              budget={budget?.categoryBudgets?.[cat.id] ?? 0}
              onEdit={() => {
                setEditingCategory(cat)
                setCategoryValue(budget?.categoryBudgets?.[cat.id] ? budget.categoryBudgets[cat.id].toString() : '')
              }}
            />
          ))}

          {/* Clean section divider for inactive categories */}
          {activeCategories.length > 0 && otherCategories.length > 0 && (
            <div className="flex items-center gap-3 py-2 col-span-full select-none">
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Activity This Month</span>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>
          )}

          {/* Other categories */}
          {otherCategories.map(cat => (
            <CategoryBudgetCard
              key={cat.id}
              category={cat}
              spent={0}
              budget={0}
              onEdit={() => {
                setEditingCategory(cat)
                setCategoryValue('')
              }}
            />
          ))}
        </div>
      )}

      {/* Category Budget Edit Modal */}
      <Modal
        open={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
        title={`Set Budget: ${editingCategory?.icon} ${editingCategory?.name}`}
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-400 font-medium">
            Configure the monthly limit for {editingCategory?.name}.
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
            <input
              type="number"
              inputMode="numeric"
              className="input-base pl-8 !rounded-xl"
              placeholder="Enter monthly budget amount"
              value={categoryValue}
              onChange={e => setCategoryValue(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary flex-1 py-2 px-4 text-xs font-semibold h-9 rounded-xl border border-border"
              onClick={() => setEditingCategory(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary flex-1 py-2 px-4 text-xs font-semibold h-9 rounded-xl active:scale-95 select-none"
              onClick={() => {
                const val = parseFloat(categoryValue)
                if (isNaN(val) || val < 0) return
                setCategoryBudget(editingCategory.id, val)
                setEditingCategory(null)
              }}
            >
              Save Budget
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default BudgetsPage
