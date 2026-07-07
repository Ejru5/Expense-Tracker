import React from 'react'
import { DotProgress } from '../ui'
import { Activity } from 'lucide-react'
import type { Transaction } from '../../types'

interface FinancialHealthCardProps {
  transactions: Transaction[]
}

export function FinancialHealthCard({ transactions }: FinancialHealthCardProps) {
  const now = new Date()
  const thisMonthTxs = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  
  const income = thisMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = thisMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  
  let score = 75 // default starting score
  
  if (income > 0) {
    const savingsRate = (income - expense) / income
    if (savingsRate > 0.4) score = 92
    else if (savingsRate > 0.2) score = 84
    else if (savingsRate > 0.1) score = 78
    else if (savingsRate > 0) score = 68
    else score = 45
  } else if (expense > 0) {
    score = 35 // expenses but no income
  }

  const subLabel = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'IN RANGE' : 'NEEDS WORK'
  
  return (
    <div className="hero-card hero-card-healthy flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex items-center justify-between opacity-80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-nest-accent-lime-text">Financial Health</p>
          <Activity size={16} className="text-nest-accent-lime-text" />
        </div>
        <p className="text-[56px] font-light leading-none mt-4 tracking-tight font-mono text-nest-accent-lime-text">
          {score}
        </p>
      </div>

      <div className="space-y-3.5">
        <DotProgress value={score} totalDots={20} className="opacity-90" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-nest-accent-lime-text uppercase">{subLabel}</span>
          <span className="text-[10px] font-medium text-nest-accent-lime-text opacity-70">Savings & budget adherence</span>
        </div>
      </div>
    </div>
  )
}

export default FinancialHealthCard
