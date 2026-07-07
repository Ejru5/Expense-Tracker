import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react'
import { useBudgets } from '../../hooks/useBudgets'
import { useAppStore } from '../../store/useAppStore'
import { DotProgress, Button } from '../ui'
import { formatINR, budgetPercent } from '../../lib/utils'

export function BudgetSummaryCard() {
  const navigate = useNavigate()
  const { categories, household } = useAppStore()
  const { budget, totalSpent, spentByCategory } = useBudgets()

  const totalBudget = budget?.totalBudget ?? 0
  const pctUsed = budgetPercent(totalSpent, totalBudget)
  const remainingAmount = totalBudget - totalSpent
  const isOverBudget = totalSpent > totalBudget

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
      <div className="flex items-center justify-between border-b border-nest-border pb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-nest-cat-groceries" />
          <h3 className="section-title pl-0.5">
            Budget Progress
          </h3>
        </div>
        <button
          onClick={() => navigate('/budgets')}
          className="text-xs font-bold text-nest-cat-groceries hover:opacity-85 flex items-center gap-1 transition-colors min-h-[44px]"
          id="manage-budgets-btn"
        >
          Manage Budgets <ArrowRight size={14} />
        </button>
      </div>

      {totalBudget === 0 && budgetedCats.length === 0 ? (
        /* Empty State */
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-nest-surface-muted border border-dashed border-nest-border flex items-center justify-center mx-auto">
            <Target size={20} className="text-nest-text-tertiary" />
          </div>
          <div>
            <h4 className="font-bold text-nest-primary text-sm">No monthly budget set</h4>
            <p className="text-xs text-nest-secondary max-w-[240px] mx-auto mt-1">
              Create a budget to track co-spending limits.
            </p>
          </div>
          <Button onClick={() => navigate('/budgets')} size="sm">
            Set Monthly Budget
          </Button>
        </div>
      ) : (
        <>
          {/* Main Budget Card */}
          <div className="p-4 bg-nest-surface-muted rounded-xl border border-nest-border space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-nest-secondary uppercase tracking-wider mb-0.5">
                  {household?.name || 'Household'} Budget
                </p>
                <p className="text-xl font-extrabold text-nest-primary">
                  {pctUsed.toFixed(0)}% Used
                </p>
              </div>
              <div className={`px-2.5 py-1.5 rounded-sm flex items-center gap-1.5 text-[10px] font-bold ${
                isOverBudget 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-emerald-100 text-emerald-800'
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

            {/* Dot Progress bar */}
            <DotProgress 
              value={pctUsed} 
              totalDots={20} 
              variant={pctUsed >= 100 ? 'alert' : pctUsed >= 80 ? 'warning' : 'healthy'} 
            />

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1.5 border-t border-nest-border">
              <div>
                <p className="text-[9px] font-bold text-nest-secondary uppercase tracking-wider mb-0.5">Spent</p>
                <p className="text-xs font-bold text-nest-primary rupee-amount truncate">
                  {formatINR(totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-nest-secondary uppercase tracking-wider mb-0.5">Budget</p>
                <p className="text-xs font-semibold text-nest-secondary rupee-amount truncate">
                  {formatINR(totalBudget)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-nest-secondary uppercase tracking-wider mb-0.5">
                  {isOverBudget ? 'Over Budget' : 'Remaining'}
                </p>
                <p className={`text-xs font-bold rupee-amount truncate ${
                  isOverBudget ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {formatINR(Math.abs(remainingAmount))}
                </p>
              </div>
            </div>
          </div>

          {/* Category Budgets */}
          {budgetedCats.length > 0 && (
            <div className="space-y-4 pt-1.5">
              <h4 className="section-title pl-0.5">
                Category Budgets ({budgetedCats.length})
              </h4>
              <div className="space-y-3.5">
                {budgetedCats.slice(0, 4).map(cat => {
                  const catVariant = cat.pct >= 100 ? 'alert' : cat.pct >= 80 ? 'warning' : 'healthy'
                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-2 font-semibold text-nest-primary">
                          <span className="text-sm">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                        <span className="text-[10px] font-bold text-nest-secondary">
                          <span className="text-nest-primary rupee-amount">{formatINR(cat.spent)}</span>
                          <span> of </span>
                          <span className="rupee-amount">{formatINR(cat.budget)}</span>
                        </span>
                      </div>
                      
                      <DotProgress value={cat.pct} totalDots={20} variant={catVariant} />

                      <div className="flex justify-between text-[9px] font-bold">
                        <span className={cat.isOver ? 'text-rose-500' : 'text-emerald-500'}>
                          {cat.pct.toFixed(0)}% used
                        </span>
                        <span className={cat.isOver ? 'text-rose-500' : 'text-nest-secondary'}>
                          {cat.isOver ? `Over by ${formatINR(Math.abs(cat.remaining))}` : `${formatINR(cat.remaining)} remaining`}
                        </span>
                      </div>
                    </div>
                  )
                })}

                {budgetedCats.length > 4 && (
                  <button
                    onClick={() => navigate('/budgets')}
                    className="text-xs font-bold text-nest-cat-groceries hover:underline"
                  >
                    +{budgetedCats.length - 4} more categories →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Warnings Banner */}
          {alerts.length > 0 && (
            <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 flex gap-2.5 items-start">
              <span className="text-sm mt-0.5">⚠️</span>
              <div>
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Budget Warning
                </p>
                <p className="text-[11px] text-amber-700 font-semibold leading-relaxed mt-0.5">
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

export default BudgetSummaryCard
