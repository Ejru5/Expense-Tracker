import { useMemo } from 'react'
import { useTransactions } from './useTransactions'
import { useBudgets } from './useBudgets'
import { useAppStore } from '../store/useAppStore'
import { budgetPercent } from '../lib/utils'

export type PeriodType = 'week' | 'month' | 'year'

export function useReports(period: PeriodType, year: number, month: number) {
  const { transactions } = useTransactions()
  const { budget } = useBudgets(year, month)
  const { categories } = useAppStore()

  const reportsData = useMemo(() => {
    // 1. Calculate boundaries of target period
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999)

    if (period === 'week') {
      // Last 7 days
      start.setTime(Date.now() - 7 * 24 * 60 * 60 * 1000)
      end.setTime(Date.now())
    } else if (period === 'year') {
      start.setMonth(0)
      start.setDate(1)
      end.setMonth(11)
      end.setDate(31)
    }

    // 2. Filter transactions
    const periodTxs = transactions.filter(t => {
      const d = new Date(t.date)
      return d >= start && d <= end
    })

    const expenses = periodTxs.filter(t => t.type === 'expense')
    const income = periodTxs.filter(t => t.type === 'income')

    const totalSpent = expenses.reduce((s, t) => s + t.amount, 0)
    const totalIncome = income.reduce((s, t) => s + t.amount, 0)

    // 3. Daily Average
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    const dailyAverage = totalSpent / diffDays

    // 4. Spent by Category
    const spentByCat: Record<string, number> = {}
    expenses.forEach(t => {
      spentByCat[t.categoryId] = (spentByCat[t.categoryId] ?? 0) + t.amount
    })

    // 5. Biggest Category
    let biggestCategory = { name: 'None', amount: 0, icon: '📦' }
    Object.entries(spentByCat).forEach(([catId, amt]) => {
      if (amt > biggestCategory.amount) {
        const cat = categories.find(c => c.id === catId)
        biggestCategory = {
          name: cat?.name ?? 'Other',
          amount: amt,
          icon: cat?.icon ?? '📦',
        }
      }
    })

    // 6. Category Breakdown Chart Data
    const categoryBreakdown = categories.map(cat => {
      const amount = spentByCat[cat.id] ?? 0
      return {
        name: cat.name,
        value: amount,
        color: cat.color,
        icon: cat.icon,
      }
    }).filter(c => c.value > 0)

    // 7. Spending Trend Line Chart Data
    // Group by day for week/month, group by month for year
    const trendMap: Record<string, number> = {}
    
    if (period === 'year') {
      // Initialize months
      for (let i = 0; i < 12; i++) {
        const mName = new Date(year, i, 1).toLocaleString('en-IN', { month: 'short' })
        trendMap[mName] = 0
      }
      expenses.forEach(t => {
        const mName = new Date(t.date).toLocaleString('en-IN', { month: 'short' })
        trendMap[mName] = (trendMap[mName] ?? 0) + t.amount
      })
    } else {
      // Group by date (DD/MM)
      expenses.forEach(t => {
        const dateStr = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        trendMap[dateStr] = (trendMap[dateStr] ?? 0) + t.amount
      })
    }

    const spendingTrend = Object.entries(trendMap).map(([name, amount]) => ({
      name,
      amount,
    }))

    // 8. Budget vs Actual list
    const budgetVsActual = categories.map(cat => {
      const spent = spentByCat[cat.id] ?? 0
      const catBudget = budget?.categoryBudgets?.[cat.id] ?? 0
      const pct = budgetPercent(spent, catBudget)
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        bgColor: cat.bgColor,
        spent,
        budget: catBudget,
        pct,
        over: spent > catBudget,
        diff: Math.abs(spent - catBudget),
      }
    }).filter(item => item.spent > 0 || item.budget > 0)

    return {
      totalSpent,
      totalIncome,
      dailyAverage,
      biggestCategory,
      categoryBreakdown,
      spendingTrend,
      budgetVsActual,
    }
  }, [transactions, budget, period, year, month, categories])

  return reportsData
}
export default useReports
