import React from 'react'
import { Pencil } from 'lucide-react'
import { BudgetProgressBar } from './BudgetProgressBar'
import { formatINR, budgetPercent } from '../../lib/utils'
import type { Category } from '../../types'

interface CategoryBudgetCardProps {
  category: Category
  spent: number
  budget: number
  onEdit: () => void
}

export function CategoryBudgetCard({ category, spent, budget, onEdit }: CategoryBudgetCardProps) {
  const pct = budgetPercent(spent, budget)

  const statusBadge =
    !budget    ? null :
    pct >= 100 ? <span className="badge badge-expense text-[9px] py-0.5 px-2 font-bold tracking-wide">Over Budget</span> :
    pct >= 80  ? <span className="badge badge-warning text-[9px] py-0.5 px-2 font-bold tracking-wide">Near Limit</span> :
                 <span className="badge badge-income text-[9px] py-0.5 px-2 font-bold tracking-wide">On Track</span>

  return (
    <div className="card !rounded-2xl border border-border-subtle shadow-sm hover:shadow-md hover:border-border transition-all duration-250 group flex flex-col justify-between p-4.5 min-h-[128px]">
      <div className="flex items-start gap-4 mb-3">
        {/* Icon Chip Container */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border border-border-subtle shadow-xs"
          style={{ backgroundColor: category.bgColor }}
        >
          {category.icon}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center flex-wrap gap-2">
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">{category.name}</p>
            {statusBadge}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">{formatINR(spent)}</span> spent
            {budget > 0 && (
              <>
                <span className="text-slate-300 mx-1">·</span>
                <span>{formatINR(budget)} budget</span>
              </>
            )}
          </p>
        </div>

        {/* Edit Button - hover visible on desktop, always visible on mobile */}
        <button
          onClick={onEdit}
          className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-150 flex items-center justify-center min-w-[36px] min-h-[36px]"
          aria-label="Edit budget"
        >
          <Pencil size={13} />
        </button>
      </div>

      {/* Progress Bar Container */}
      <div className="mt-auto pt-1">
        <BudgetProgressBar spent={spent} budget={budget} showPercent={!!budget} />
      </div>
    </div>
  )
}
export default CategoryBudgetCard
