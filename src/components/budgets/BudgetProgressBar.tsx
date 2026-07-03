import React from 'react'
import { clamp, budgetPercent, formatINR } from '../../lib/utils'

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
  height = 10, // Modern thicker height default
}: BudgetProgressBarProps) {
  if (!budget) {
    return (
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 py-0.5 select-none">
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="text-[10px] font-bold uppercase tracking-wider">No budget set</span>
      </div>
    )
  }

  const pct = budgetPercent(spent, budget)

  // Color mappings
  const barStyle =
    pct >= 100 ? { backgroundColor: 'var(--color-magenta-spark)' } :
    pct >= 80  ? { backgroundColor: 'var(--warning)' } :
    { backgroundColor: 'var(--color-mint-action)' }

  const textStyle =
    pct >= 100 ? { color: 'var(--color-magenta-spark)' } :
    pct >= 80  ? { color: 'var(--warning)' } :
    { color: 'var(--color-mint-action)' }

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">Spent: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(spent)}</span></span>
          <span className="text-slate-400">Budget: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(budget)}</span></span>
        </div>
      )}

      {/* Track */}
      <div
        className="w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clamp(pct, 0, 100)}%`, ...barStyle }}
        />
      </div>

      {showPercent && (
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] font-bold" style={textStyle}>{pct.toFixed(0)}% used</span>
          {pct >= 100 && (
            <span className="text-[10px] font-bold" style={{ color: 'var(--color-magenta-spark)' }}>
              Over by {formatINR(spent - budget)}
            </span>
          )}
          {pct >= 80 && pct < 100 && (
            <span className="text-[10px] font-bold" style={{ color: 'var(--warning)' }}>
              {formatINR(budget - spent)} left
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** Compact inline version for home screen chips */
export function MiniProgressBar({ spent, budget }: { spent: number; budget: number }) {
  const pct = budgetPercent(spent, budget)
  const color = pct >= 100 ? '#f43f5e' : pct >= 80 ? '#f59e0b' : '#10b981'
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${clamp(pct, 0, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}
export default BudgetProgressBar
