import React from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { formatINR } from '../../lib/utils'
import type { Transaction } from '../../types'
import { useAppStore } from '../../store/useAppStore'

interface DashboardAnalyticsProps {
  transactions: Transaction[]
}

export function DashboardAnalytics({ transactions }: DashboardAnalyticsProps) {
  const { categories } = useAppStore()

  // 1. Get dates
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Filter transactions
  const thisMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const lastMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === 'expense' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  })

  const thisMonthIncome = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const totalThisMonthIncome = thisMonthIncome.reduce((s, t) => s + t.amount, 0)
  const totalThisMonthExpense = thisMonthExpenses.reduce((s, t) => s + t.amount, 0)

  // 2. Monthly Spending chart (daily spend this month)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const dailySpendData: { day: string; amount: number }[] = []
  
  for (let i = 1; i <= Math.min(now.getDate(), daysInMonth); i++) {
    const dateLabel = `${i} ${now.toLocaleString('en-IN', { month: 'short' })}`
    const dayExpense = thisMonthExpenses
      .filter(t => new Date(t.date).getDate() === i)
      .reduce((s, t) => s + t.amount, 0)
    
    dailySpendData.push({
      day: dateLabel,
      amount: dayExpense
    })
  }

  // 3. Category Breakdown (Pie Chart)
  const categorySpentMap: Record<string, number> = {}
  thisMonthExpenses.forEach(t => {
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] ?? 0) + t.amount
  })

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

  const pieData = categories
    .map(cat => ({
      name: cat.name,
      value: categorySpentMap[cat.id] ?? 0,
      color: getFlatColor(cat.id, cat.color),
      icon: cat.icon
    }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)

  // 4. Income vs Expense Bar Chart
  const incomeVsExpenseData = [
    { name: 'Income', amount: totalThisMonthIncome, fill: 'var(--income)' },
    { name: 'Expenses', amount: totalThisMonthExpense, fill: 'var(--expense)' }
  ]

  // 5. MoM Spending Trend (Cumulative spend comparison)
  const momData: { day: number; 'This Month': number; 'Last Month': number }[] = []
  let thisMonthCum = 0
  let lastMonthCum = 0

  for (let d = 1; d <= 31; d++) {
    const thisDayExp = thisMonthExpenses
      .filter(t => new Date(t.date).getDate() === d)
      .reduce((s, t) => s + t.amount, 0)

    const lastDayExp = lastMonthExpenses
      .filter(t => new Date(t.date).getDate() === d)
      .reduce((s, t) => s + t.amount, 0)

    thisMonthCum += thisDayExp
    lastMonthCum += lastDayExp

    const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate()
    const isPastToday = d > now.getDate() && currentMonth === now.getMonth()

    momData.push({
      day: d,
      'This Month': isPastToday ? null as any : thisMonthCum,
      'Last Month': d <= daysInLastMonth ? lastMonthCum : null as any
    })
  }

  const hasData = thisMonthExpenses.length > 0 || thisMonthIncome.length > 0

  if (!hasData) {
    return (
      <div className="card py-10 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold text-nest-secondary">No analytical data available for this month</p>
        <p className="text-xs text-nest-tertiary mt-1">Transactions logged this month will populate dashboard charts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3.5">
      <div className="flex justify-between items-center px-1">
        <h3 className="section-title pl-0.5">
          Spending & Cash Flow Analytics
        </h3>
        <span className="text-[10px] text-nest-tertiary font-semibold lg:hidden">
          Swipe to view charts ➔
        </span>
      </div>

      {/* Swipeable Container on Mobile, Grid on Desktop */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-4 pb-4 snap-x snap-mandatory scrollbar-none">
        
        {/* Chart 1: Monthly Daily Spending */}
        <div className="card min-w-[85vw] md:min-w-[45vw] lg:min-w-0 flex-shrink-0 snap-center space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-nest-secondary">
            Daily Spending (This Month)
          </h4>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySpendData}>
                <XAxis dataKey="day" stroke="var(--nest-text-secondary)" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [formatINR(Number(value)), 'Spent']}
                  contentStyle={{ background: 'var(--nest-surface)', borderRadius: '12px', border: '1px solid var(--nest-border)', fontSize: '11px', color: 'var(--nest-text-primary)' }}
                />
                <Bar dataKey="amount" fill="var(--nest-cat-groceries)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="card min-w-[85vw] md:min-w-[45vw] lg:min-w-0 flex-shrink-0 snap-center space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-nest-secondary">
            Category Breakdown
          </h4>
          <div className="h-[180px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="45%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(value) => <span className="text-nest-primary">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-nest-tertiary">No categories logged</p>
            )}
          </div>
        </div>

        {/* Chart 3: Income vs Expense comparison */}
        <div className="card min-w-[85vw] md:min-w-[45vw] lg:min-w-0 flex-shrink-0 snap-center space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-nest-secondary">
            Cash Flow (Income vs Expenses)
          </h4>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} barSize={40}>
                <XAxis dataKey="name" stroke="var(--nest-text-secondary)" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [formatINR(Number(value)), 'Total']}
                  contentStyle={{ background: 'var(--nest-surface)', borderRadius: '12px', border: '1px solid var(--nest-border)', fontSize: '11px', color: 'var(--nest-text-primary)' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {incomeVsExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Cumulative Spending Trend MoM */}
        <div className="card min-w-[85vw] md:min-w-[45vw] lg:min-w-0 flex-shrink-0 snap-center space-y-4">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-nest-secondary">
            MoM Cumulative Trend
          </h4>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={momData}>
                <defs>
                  <linearGradient id="currentMonthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--nest-cat-groceries)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--nest-cat-groceries)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--nest-text-secondary)" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [formatINR(Number(value))]}
                  contentStyle={{ background: 'var(--nest-surface)', borderRadius: '12px', border: '1px solid var(--nest-border)', fontSize: '11px', color: 'var(--nest-text-primary)' }}
                />
                {/* Last Month cumulative line */}
                <Area
                  type="monotone"
                  dataKey="Last Month"
                  stroke="var(--nest-text-secondary)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                />
                {/* This Month cumulative area */}
                <Area
                  type="monotone"
                  dataKey="This Month"
                  stroke="var(--nest-cat-groceries)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#currentMonthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DashboardAnalytics
