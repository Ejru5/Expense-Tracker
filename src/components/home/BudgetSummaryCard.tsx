import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react'
import { useBudgets } from '../../hooks/useBudgets'
import { useAppStore } from '../../store/useAppStore'
import { BudgetProgressBar } from '../budgets/BudgetProgressBar'
import { formatINR, budgetPercent } from '../../lib/utils'

export function BudgetSummaryCard() {
  const navigate = useNavigate()
  const { categories, household } = useAppStore()
  const { budget, totalSpent, spentByCategory } = useBudgets()

  const totalBudget = budget?.totalBudget ?? 0
  const pctUsed = budgetPercent(totalSpent, totalBudget)
  const remainingAmount = totalBudget - totalSpent
  const isOverBudget = totalSpent > totalBudget

  // Filter categories that have a budget set
  const budgetedCats = categories
    .filter(cat => (budget?.categoryBudgets?.[cat.id] ?? 0) > 0)
    .map(cat => {
      const spent = spentByCategory[cat.id] ?? 0
      const catBudget = budget?.categoryBudgets?.[cat.id] ?? 0
      const pct = budgetPercent(spent, catBudget)
      return {
        ...cat,
        spent,
        budget: catBudget,
        pct,
        remaining: catBudget - spent,
        isOver: spent > catBudget
      }
    })

  const alerts = budgetedCats.filter(cat => cat.pct >= 80)

  return (
    <div className="card space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-coral" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Monthly Budget Progress
          </h3>
        </div>
        <button
          onClick={() => navigate('/budgets')}
          className="text-xs font-bold text-coral hover:opacity-85 flex items-center gap-1 transition-colors min-h-[44px]"
          id="manage-budgets-btn"
        >
          Manage Budgets <ArrowRight size={14} />
        </button>
      </div>

      {totalBudget === 0 && budgetedCats.length === 0 ? (
        /* Empty State */
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-surface-warm border border-dashed border-border flex items-center justify-center mx-auto">
            <Target size={20} className="text-slate-400" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No monthly budget set</h4>
            <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1">
              Create a budget to track your spending limits and save money.
            </p>
          </div>
          <Button onClick={() => navigate('/budgets')} size="sm">
            Set Monthly Budget
          </Button>
        </div>
      ) : (
        <>
          {/* Main Budget Card */}
          <div className="p-4 bg-surface-warm/50 dark:bg-slate-800/20 rounded-2xl border border-border-subtle dark:border-transparent space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {household?.name || 'Household'} Budget
                </p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {pctUsed.toFixed(0)}% Used
                </p>
              </div>
              <div className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-bold ${
                isOverBudget 
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
              }`}>
                {isOverBudget ? (
                  <>
                    <AlertTriangle size={12} /> Over Limit
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} /> On Track
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <BudgetProgressBar spent={totalSpent} budget={totalBudget} height={6} />

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1.5">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Spent</p>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 rupee-amount truncate">
                  {formatINR(totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Budget</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 rupee-amount truncate">
                  {formatINR(totalBudget)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {isOverBudget ? 'Over Budget' : 'Remaining'}
                </p>
                <p className={`text-xs font-extrabold rupee-amount truncate ${
                  isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {formatINR(Math.abs(remainingAmount))}
                </p>
              </div>
            </div>
          </div>

          {/* Category Budgets */}
          {budgetedCats.length > 0 && (
            <div className="space-y-4 pt-1.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">
                Category Budgets ({budgetedCats.length})
              </h4>
              <div className="space-y-3.5">
                {budgetedCats.slice(0, 4).map(cat => (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="text-sm">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        <span className="text-slate-700 dark:text-slate-300 rupee-amount">{formatINR(cat.spent)}</span>
                        <span> of </span>
                        <span className="rupee-amount">{formatINR(cat.budget)}</span>
                      </span>
                    </div>
                    
                    <BudgetProgressBar spent={cat.spent} budget={cat.budget} height={4} />

                    <div className="flex justify-between text-[9px] font-bold">
                      <span className={cat.isOver ? 'text-rose-500' : 'text-emerald-500'}>
                        {cat.pct.toFixed(0)}% used
                      </span>
                      <span className={cat.isOver ? 'text-rose-500' : 'text-slate-400'}>
                        {cat.isOver ? `Over by ${formatINR(Math.abs(cat.remaining))}` : `${formatINR(cat.remaining)} remaining`}
                      </span>
                    </div>
                  </div>
                ))}

                {budgetedCats.length > 4 && (
                  <button
                    onClick={() => navigate('/budgets')}
                    className="text-xs font-bold text-coral hover:underline"
                  >
                    +{budgetedCats.length - 4} more budgeted categories →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Warnings Banner */}
          {alerts.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-3 flex gap-2.5 items-start">
              <span className="text-sm mt-0.5">⚠️</span>
              <div>
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  Budget Warning
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-500 font-semibold leading-relaxed mt-0.5">
                  {alerts.length === 1
                    ? `${alerts[0].name} is near or over budget.`
                    : `${alerts.length} categories are near or over their budget caps.`}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Button({ children, onClick, size }: { children: React.ReactNode; onClick: () => void; size?: string }) {
  return (
    <button
      onClick={onClick}
      className={`btn-primary px-4 py-2 font-bold text-xs flex items-center justify-center gap-1.5 rounded-xl shadow-sm min-h-[44px]`}
    >
      {children}
    </button>
  )
}
export default BudgetSummaryCard
