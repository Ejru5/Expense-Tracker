import React from 'react'
import { TrendingUp, Flame, Activity, CalendarDays } from 'lucide-react'
import { formatINR } from '../../lib/utils'
import type { Transaction } from '../../types'

interface InsightChipsRowProps {
  transactions: Transaction[]
}

export function InsightChipsRow({ transactions }: InsightChipsRowProps) {
  const now = new Date()
  const daysElapsed = now.getDate()

  // ── Income & Expense (this month) ────────────────────────────────
  const thisMonthTxs = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const income  = thisMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = thisMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net     = income - expense
  const avgPerDay = daysElapsed > 0 ? Math.round(expense / daysElapsed) : 0

  const incomeSub = income === 0 ? 'NONE YET' : 'THIS MONTH'

  // ── Burn Rate subtitle ────────────────────────────────────────────
  const lastMonthIdx  = now.getMonth() === 0 ? 11 : now.getMonth() - 1
  const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const lastMonthExp  = transactions
    .filter(t => {
      const d = new Date(t.date)
      return t.type === 'expense' && d.getMonth() === lastMonthIdx && d.getFullYear() === lastMonthYear
    })
    .reduce((s, t) => s + t.amount, 0)

  let burnSub = 'NEW MONTH'
  if (lastMonthExp > 0) {
    const diff = ((expense - lastMonthExp) / lastMonthExp) * 100
    burnSub = diff >= 0
      ? `↑ ${Math.abs(diff).toFixed(0)}% VS LAST MO`
      : `↓ ${Math.abs(diff).toFixed(0)}% VS LAST MO`
  }

  // ── Mobile chips (2) ─────────────────────────────────────────────
  const mobileChips = [
    { icon: TrendingUp, label: 'Income', value: formatINR(income), sub: incomeSub,
      gradient: 'var(--nest-gradient-healthy)', color: 'var(--nest-accent-lime-text)' },
    { icon: Flame,      label: 'Spend',  value: formatINR(expense), sub: burnSub,
      gradient: 'var(--nest-gradient-warning)', color: '#431a00' },
  ]

  // ── Desktop stat chips (4) ────────────────────────────────────────
  const desktopChips = [
    { icon: TrendingUp,   label: 'Income',   value: formatINR(income),   sub: incomeSub,
      gradient: 'var(--nest-gradient-healthy)', color: 'var(--nest-accent-lime-text)' },
    { icon: Flame,        label: 'Spend',    value: formatINR(expense),  sub: burnSub,
      gradient: 'var(--nest-gradient-warning)', color: '#431a00' },
    {
      icon: Activity,
      label: 'Net',
      value: formatINR(Math.abs(net)),
      sub: net >= 0 ? 'SURPLUS' : 'DEFICIT',
      gradient: net >= 0
        ? 'var(--nest-gradient-healthy)'
        : 'linear-gradient(135deg, #ffd6d6 0%, #f9b3b3 100%)',
      color: net >= 0 ? 'var(--nest-accent-lime-text)' : '#7a0020',
    },
    {
      icon: CalendarDays,
      label: 'Avg / Day',
      value: formatINR(avgPerDay),
      sub: `DAY ${daysElapsed} OF MONTH`,
      gradient: 'linear-gradient(135deg, #e8e8f4 0%, #d8d8ef 100%)',
      color: '#2d2d5a',
    },
  ]

  return (
    <>
      {/* ── Mobile: 2 full cards ─────────────────────────────────── */}
      <div className="flex gap-3 lg:hidden">
        {mobileChips.map(chip => (
          <div
            key={chip.label}
            className="flex-1 rounded-[20px] p-4 flex flex-col gap-2.5"
            style={{ background: chip.gradient, color: chip.color }}
          >
            <div className="flex items-center justify-between opacity-75">
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none">{chip.label}</p>
              <chip.icon size={14} strokeWidth={2.5} />
            </div>
            <p className="text-[28px] font-light font-mono leading-none tracking-tight truncate">
              {chip.value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none">
              {chip.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Desktop: 4 compact stat cards ────────────────────────── */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {desktopChips.map(chip => (
          <div
            key={chip.label}
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: chip.gradient, color: chip.color }}
          >
            <div className="flex items-center justify-between opacity-70">
              <p className="text-[9px] font-bold uppercase tracking-widest leading-none">{chip.label}</p>
              <chip.icon size={13} strokeWidth={2.5} />
            </div>
            <p className="text-[22px] font-light font-mono leading-none tracking-tight truncate">
              {chip.value}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-60 leading-none">
              {chip.sub}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

export default InsightChipsRow
