import React from 'react'
import { DotProgress } from '../ui/DotProgress'
import { budgetPercent, formatINR } from '../../lib/utils'

interface BudgetProgressBarProps {
  spent: number
  budget: number
  showLabels?: boolean
  showPercent?: boolean
  height?: number
}

export function BudgetProgressBar({
  spent,
  budget,
  showLabels = false,
  showPercent = false,
}: BudgetProgressBarProps) {
  if (!budget) {
    return (
      <div className="flex items-center gap-1.5 text-nest-text-tertiary py-0.5 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-nest-border" />
        <span className="text-[10px] font-bold uppercase tracking-wider">No budget set</span>
      </div>
    )
  }

  const pct = budgetPercent(spent, budget)
  const isOver = spent > budget

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-xs mb-1.5 text-nest-text-secondary">
          <span>Spent: <span className="font-semibold text-nest-text-primary rupee-amount">{formatINR(spent)}</span></span>
          <span>Budget: <span className="font-semibold text-nest-text-primary rupee-amount">{formatINR(budget)}</span></span>
        </div>
      )}

      <DotProgress value={pct} totalDots={15} variant={pct >= 100 ? 'alert' : pct >= 80 ? 'warning' : 'healthy'} />

      {showPercent && (
        <div className="flex justify-between mt-1.5">
          <span className={`text-[10px] font-bold ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
            {pct.toFixed(0)}% used
          </span>
          {isOver ? (
            <span className="text-[10px] font-bold text-rose-500">
              Over by {formatINR(spent - budget)}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-nest-text-secondary">
              {formatINR(budget - spent)} left
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function MiniProgressBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = budgetPercent(spent, budget)
  return (
    <DotProgress 
      value={pct} 
      totalDots={10} 
      variant={pct >= 100 ? 'alert' : pct >= 80 ? 'warning' : 'healthy'} 
    />
  )
}

export default BudgetProgressBar

