import React from 'react'
import { Flame } from 'lucide-react'
import { formatINR } from '../../lib/utils'
import type { Transaction } from '../../types'

interface BurnRateCardProps {
  transactions: Transaction[]
}

export function BurnRateCard({ transactions }: BurnRateCardProps) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const thisMonthExpenses = transactions
    .filter(t => {
      const d = new Date(t.date)
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((s, t) => s + t.amount, 0)

  const lastMonthExpenses = transactions
    .filter(t => {
      const d = new Date(t.date)
      return t.type === 'expense' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
    })
    .reduce((s, t) => s + t.amount, 0)

  let diffPercent = 0
  if (lastMonthExpenses > 0) {
    diffPercent = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
  }

  const isUp = diffPercent >= 0
  const diffText = lastMonthExpenses === 0
    ? 'New card'
    : `${isUp ? '↑' : '↓'} ${Math.abs(diffPercent).toFixed(0)}% vs last month`

  // Simple sparkline data (generate 6 SVG coordinate points based on daily transactions)
  const dailyBreakdown = Array.from({ length: 6 }).map((_, i) => {
    const segmentDays = Math.ceil(now.getDate() / 6) || 5
    const startDay = i * segmentDays
    const endDay = (i + 1) * segmentDays
    return transactions
      .filter(t => {
        const d = new Date(t.date)
        return (
          t.type === 'expense' &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear &&
          d.getDate() >= startDay &&
          d.getDate() < endDay
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)
  })

  const maxVal = Math.max(...dailyBreakdown, 1)
  const svgPoints = dailyBreakdown
    .map((val, i) => {
      const x = (i * 20) + 5
      const y = 30 - (val / maxVal) * 20
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="hero-card hero-card-warning flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex items-center justify-between opacity-80 text-orange-950">
          <p className="text-[11px] font-bold uppercase tracking-wider">Monthly Burn Rate</p>
          <Flame size={16} />
        </div>
        <p className="text-[32px] font-light leading-none mt-5 tracking-tight font-mono text-orange-950">
          {formatINR(thisMonthExpenses)}
        </p>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-orange-950 uppercase">{diffText}</span>
          <p className="text-[10px] text-orange-950/70 mt-1">Expenses logging speed</p>
        </div>
        
        {/* Simple Sparkline */}
        <svg className="w-16 h-8 opacity-70" viewBox="0 0 110 35">
          <polyline
            fill="none"
            stroke="rgba(67, 26, 0, 0.7)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={svgPoints}
          />
        </svg>
      </div>
    </div>
  )
}

export default BurnRateCard
