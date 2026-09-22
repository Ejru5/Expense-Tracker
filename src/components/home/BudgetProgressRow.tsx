import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, ChevronDown, ChevronUp, AlertTriangle, ArrowRight } from 'lucide-react'
import { useBudgets } from '../../hooks/useBudgets'
import { useAppStore } from '../../store/useAppStore'
import { formatINR, budgetPercent } from '../../lib/utils'

/**
 * Compact single-line budget row for mobile home.
 * Tapping the row expands to show per-category breakdown.
 * Fixes the 0%-Used / Over-Limit contradiction: if totalBudget === 0,
 * always shows the "no budget set" state regardless of category spend.
 */
export function BudgetProgressRow() {
  const navigate = useNavigate()
  const { categories } = useAppStore()
  const { budget, totalSpent, spentByCategory } = useBudgets()
  const [expanded, setExpanded] = useState(false)

  const totalBudget = budget?.totalBudget ?? 0

  // ── Guard: no total budget set → simple CTA ───────────────────────
  if (totalBudget === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-dashed border-nest-border bg-nest-surface-muted">
        <div className="flex items-center gap-2.5">
          <Target size={15} className="text-nest-text-tertiary flex-shrink-0" />
          <span className="text-xs font-semibold text-nest-secondary">No budget set yet</span>
        </div>
        <button
          onClick={() => navigate('/budgets')}
          className="text-[11px] font-bold text-nest-cat-groceries flex items-center gap-0.5 min-h-[36px]"
        >
          Set Budget <ArrowRight size={12} />
        </button>
      </div>
    )
  }

  const pctUsed        = budgetPercent(totalSpent, totalBudget)
  const remaining      = totalBudget - totalSpent
  const isOverBudget   = totalSpent > totalBudget
  const barColor       = pctUsed >= 100 ? '#F2879A' : pctUsed >= 80 ? '#F2A65A' : '#8BC53F'
  const barWidth       = Math.min(pctUsed, 100)

  // Category-level breakdowns (only those with a budget set)
  const budgetedCats = categories
    .filter(cat => (budget?.categoryBudgets?.[cat.id] ?? 0) > 0)
    .map(cat => {
      const spent    = spentByCategory[cat.id] ?? 0
      const catBudget = budget!.categoryBudgets![cat.id]
      const pct      = budgetPercent(spent, catBudget)
      return { ...cat, spent, budget: catBudget, pct, isOver: spent > catBudget }
    })

  return (
    <div className="rounded-2xl border border-nest-border bg-nest-surface overflow-hidden">
      {/* ── Collapsed header row ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <Target size={14} className="text-nest-cat-groceries flex-shrink-0" />
        <span className="text-xs font-bold text-nest-primary flex-shrink-0">Budget</span>

        {/* Progress bar */}
        <div className="flex-1 h-1.5 rounded-full bg-nest-surface-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${barWidth}%`, backgroundColor: barColor }}
          />
        </div>

        {/* Status */}
        <span
          className="text-[10px] font-bold flex-shrink-0"
          style={{ color: isOverBudget ? '#F2879A' : barColor }}
        >
          {isOverBudget
            ? `₹${formatINR(Math.abs(remaining))} over`
            : `${pctUsed.toFixed(0)}%`}
        </span>

        {expanded
          ? <ChevronUp  size={13} className="text-nest-text-tertiary flex-shrink-0" />
          : <ChevronDown size={13} className="text-nest-text-tertiary flex-shrink-0" />}
      </button>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-nest-border px-4 py-3 space-y-3 animate-fade-in">
          {/* Totals row */}
          <div className="flex justify-between text-[10px] font-semibold text-nest-secondary">
            <span>Spent: <span className="text-nest-primary font-bold rupee-amount">{formatINR(totalSpent)}</span></span>
            <span>Budget: <span className="text-nest-primary font-bold rupee-amount">{formatINR(totalBudget)}</span></span>
            <span className={isOverBudget ? 'text-rose-500 font-bold' : ''}>
              {isOverBudget ? `Over by ${formatINR(Math.abs(remaining))}` : `${formatINR(remaining)} left`}
            </span>
          </div>

          {/* Per-category mini rows */}
          {budgetedCats.length > 0 && (
            <div className="space-y-2.5">
              {budgetedCats.map(cat => {
                const cBarColor = cat.pct >= 100 ? '#F2879A' : cat.pct >= 80 ? '#F2A65A' : '#8BC53F'
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-nest-primary flex items-center gap-1.5">
                        <span>{cat.icon}</span>{cat.name}
                      </span>
                      <span className="text-[10px] font-bold text-nest-secondary rupee-amount">
                        {formatINR(cat.spent)}/{formatINR(cat.budget)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-nest-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(cat.pct, 100)}%`, backgroundColor: cBarColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Over-budget alert */}
          {isOverBudget && (
            <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20">
              <AlertTriangle size={11} className="text-rose-500 flex-shrink-0" />
              <p className="text-[10px] font-semibold text-rose-600">
                Total spending exceeds your monthly budget.
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/budgets')}
            className="text-[10px] font-bold text-nest-cat-groceries flex items-center gap-0.5 min-h-[32px]"
          >
            Manage Budgets <ArrowRight size={11} />
          </button>
        </div>
      )}
    </div>
  )
}

export default BudgetProgressRow
