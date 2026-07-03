import React from 'react'
import { BalanceCard } from '../components/home/BalanceCard'
import { QuickActions } from '../components/home/QuickActions'
import { DashboardAnalytics } from '../components/home/DashboardAnalytics'
import { BudgetSummaryCard } from '../components/home/BudgetSummaryCard'
import { AISpendingInsight } from '../components/home/AISpendingInsight'
import { RecentTransactions } from '../components/home/RecentTransactions'
import { UpcomingBillsWidget } from '../components/recurring/UpcomingBillsWidget'
import { NetBalanceSummary } from '../components/splits/NetBalanceSummary'
import { SavingsGoalsWidget } from '../components/home/SavingsGoalsWidget'
import { useTransactions } from '../hooks/useTransactions'
import { useAppStore } from '../store/useAppStore'

export function HomePage() {
  const { user } = useAppStore()
  // Fetch all transactions to ensure statistics and charts calculate accurately
  const { transactions, loading } = useTransactions()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  // Slice transactions for the Recent Transactions widget list (shows up to 5 on home page)
  const recentTransactionsList = transactions.slice(0, 5)

  return (
    <div className="page-content px-4 lg:px-8 pt-6 animate-fade-in max-w-7xl mx-auto space-y-6">
      
      {/* Header Greeting */}
      <div className="mb-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{month}</p>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
          {greeting()}, {firstName} 👋
        </h1>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ROW 1: Balance Card (8 cols) & Quick Actions (4 cols) */}
        <div className="col-span-12 lg:col-span-8">
          <BalanceCard transactions={transactions} />
        </div>
        
        <div className="col-span-12 lg:col-span-4">
          <QuickActions />
        </div>

        {/* ROW 2: Spending Analytics (12 cols - full width grid) */}
        <div className="col-span-12">
          <DashboardAnalytics transactions={transactions} />
        </div>

        {/* ROW 3: Budget Card (6 cols) & AI Insights (6 cols) */}
        <div className="col-span-12 lg:col-span-6">
          <BudgetSummaryCard />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <AISpendingInsight />
        </div>

        {/* ROW 4: Recent Transactions (7 cols) & Upcoming Bills / Goals (5 cols) */}
        <div className="col-span-12 lg:col-span-7">
          <RecentTransactions transactions={recentTransactionsList} loading={loading} />
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Grouped Right Column widgets */}
          <UpcomingBillsWidget />
          <NetBalanceSummary />
          <SavingsGoalsWidget />
        </div>

      </div>
    </div>
  )
}
export default HomePage
