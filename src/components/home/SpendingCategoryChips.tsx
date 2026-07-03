import React from 'react'
import { useBudgets } from '../../hooks/useBudgets'
import { useAppStore } from '../../store/useAppStore'
import { formatINR } from '../../lib/utils'

export function SpendingCategoryChips() {
  const { categories } = useAppStore()
  const { spentByCategory } = useBudgets()

  // Filter categories with positive spent
  const activeChips = categories
    .map(cat => ({
      ...cat,
      spent: spentByCategory[cat.id] ?? 0,
    }))
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)

  if (activeChips.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="section-title px-1">Spending by Category</h3>
      
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
        {activeChips.map(chip => (
          <div
            key={chip.id}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60
                       rounded-full px-3.5 py-2 shadow-sm flex-shrink-0 snap-start select-none"
          >
            <span className="text-sm">{chip.icon}</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{chip.name}</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 rupee-amount">
                {formatINR(chip.spent)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default SpendingCategoryChips
