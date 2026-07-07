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

  const getFlatColor = (catId: string, defaultColor: string) => {
    const specColors: Record<string, string> = {
      'groceries': 'var(--nest-cat-groceries)',
      'subscriptions': 'var(--nest-cat-subs)',
      'dining': 'var(--nest-cat-dining)',
      'transport': 'var(--nest-cat-transport)',
      'shopping': 'var(--nest-cat-shopping)',
      'bills': 'var(--nest-cat-bills)',
    }
    const key = Object.keys(specColors).find(k => catId.toLowerCase().includes(k))
    return key ? specColors[key] : defaultColor
  }

  const dotColor = getFlatColor(category.id, category.color)

  return (
    <div className="card border border-nest-border shadow-card hover:border-nest-text-secondary transition-all duration-200 group flex flex-col justify-between p-4.5 min-h-[128px]">
      <div className="flex items-start gap-4 mb-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0 border border-nest-border"
          style={{ backgroundColor: `${dotColor}12`, color: dotColor }}
        >
          {category.icon || '💰'}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center flex-wrap gap-2">
            <p className="font-bold text-nest-primary text-sm leading-snug">{category.name}</p>
            {statusBadge}
          </div>
          <p className="text-xs text-nest-secondary font-medium mt-1">
            <span className="font-bold text-nest-primary rupee-amount">{formatINR(spent)}</span> spent
            {budget > 0 && (
              <>
                <span className="text-nest-border mx-1">·</span>
                <span className="rupee-amount">{formatINR(budget)} budget</span>
              </>
            )}
          </p>
        </div>

        <button
          onClick={onEdit}
          className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2 rounded-sm hover:bg-nest-surface-muted text-nest-secondary hover:text-nest-primary transition-all duration-150 flex items-center justify-center min-w-[36px] min-h-[36px]"
          aria-label="Edit budget"
        >
          <Pencil size={13} />
        </button>
      </div>

      <div className="mt-auto pt-1">
        <BudgetProgressBar spent={spent} budget={budget} showPercent={!!budget} />
      </div>
    </div>
  )
}

export default CategoryBudgetCard
