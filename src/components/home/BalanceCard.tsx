import React from 'react'
import { TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'
import { formatINR } from '../../lib/utils'
import type { Transaction } from '../../types'

interface BalanceCardProps {
  transactions: Transaction[]
}

export function BalanceCard({ transactions }: BalanceCardProps) {
  // 1. All-time Total Balance
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalBalance = totalIncome - totalExpense

  // 2. Current Month vs Last Month calculations
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Filter transactions for this month and last month
  const thisMonthTxs = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const lastMonthTxs = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  })

  // This month metrics
  const thisMonthIncome = thisMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const thisMonthExpense = thisMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const thisMonthSavings = thisMonthIncome - thisMonthExpense

  // Last month metrics
  const lastMonthIncome = lastMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const lastMonthExpense = lastMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const lastMonthSavings = lastMonthIncome - lastMonthExpense

  // Percentage Change calculations
  let savingsChangePercent = 0
  let isPositiveChange = true

  if (lastMonthSavings !== 0) {
    savingsChangePercent = ((thisMonthSavings - lastMonthSavings) / Math.abs(lastMonthSavings)) * 100
    isPositiveChange = savingsChangePercent >= 0
  } else if (thisMonthSavings !== 0) {
    savingsChangePercent = 100
    isPositiveChange = thisMonthSavings >= 0
  }

  // Formatting percentage output
  const percentText = lastMonthSavings === 0 && thisMonthSavings === 0
    ? '0% change'
    : `${isPositiveChange ? '+' : ''}${savingsChangePercent.toFixed(1)}%`

  return (
    <div className="card space-y-6">
      {/* Top Section - Balance Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Balance
          </p>
          <p className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 rupee-amount">
            {formatINR(totalBalance)}
          </p>
        </div>

        {/* Monthly Cash Flow badge */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-2xl flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isPositiveChange ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'}`}>
            {isPositiveChange ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cash Flow Trend
            </p>
            <p className={`text-xs font-bold ${isPositiveChange ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {percentText} <span className="text-[10px] text-slate-400 font-medium font-sans">vs last month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 dark:bg-slate-800/60" />

      {/* Grid Section - Monthly Metrics */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5 pl-0.5">
          This Month's Cash Flow
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Income Info */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-50 dark:border-transparent">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <TrendingUp size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Income</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 rupee-amount truncate">
              {formatINR(thisMonthIncome)}
            </p>
          </div>

          {/* Expense Info */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-50 dark:border-transparent">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
              <TrendingDown size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expenses</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 rupee-amount truncate">
              {formatINR(thisMonthExpense)}
            </p>
          </div>

          {/* Savings Info */}
          <div className="col-span-2 md:col-span-1 p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-50 dark:border-transparent">
            <div className="flex items-center gap-2 text-coral mb-2">
              <PiggyBank size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Savings</span>
            </div>
            <p className={`text-lg font-extrabold rupee-amount truncate ${thisMonthSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatINR(thisMonthSavings)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default BalanceCard
