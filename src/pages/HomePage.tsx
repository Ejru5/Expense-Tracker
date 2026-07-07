import React from 'react'
import { BalanceCard } from '../components/home/BalanceCard'
import { FinancialHealthCard } from '../components/home/FinancialHealthCard'
import { BurnRateCard } from '../components/home/BurnRateCard'
import { CategoryBreakdownStrip } from '../components/home/CategoryBreakdownStrip'
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
  const { transactions, loading } = useTransactions()

  const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Dhruv'
  const partnerName = displayName === 'Dhruv' ? 'Dhruvi' : 'Dhruv'
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const recentTransactionsList = transactions.slice(0, 5)

  return (
    <div className="page-content px-4 lg:px-8 pt-6 animate-fade-in max-w-7xl mx-auto space-y-6">
      
      {/* Header Greeting */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-[10px] text-nest-tertiary font-bold uppercase tracking-widest">{month}</p>
          <h1 className="text-xl font-bold text-nest-primary mt-0.5">
            {displayName} & {partnerName}
          </h1>
        </div>
        {/* Tiny avatar pair */}
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-nest-cat-groceries flex items-center justify-center text-[10px] font-bold text-nest-accent-lime-text border-2 border-nest-bg">{displayName[0]}</div>
          <div className="w-8 h-8 rounded-full bg-nest-cat-subs flex items-center justify-center text-[10px] font-bold text-white border-2 border-nest-bg">{partnerName[0]}</div>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ROW 1: Hero Bento Cards (approx 2:2:1 ratio) */}
        <div className="col-span-12 lg:col-span-5">
          <FinancialHealthCard transactions={transactions} />
        </div>
        
        <div className="col-span-12 lg:col-span-4">
          <BurnRateCard transactions={transactions} />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <BalanceCard />
        </div>

        {/* ROW 2: Category Breakdown Tiles */}
        <div className="col-span-12">
          <CategoryBreakdownStrip transactions={transactions} />
        </div>

        {/* ROW 3: Spending Analytics & Quick Actions */}
        <div className="col-span-12 lg:col-span-8">
          <DashboardAnalytics transactions={transactions} />
        </div>
        
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <QuickActions />
          <UpcomingBillsWidget />
        </div>

        {/* ROW 4: Budget Card & AI Insights */}
        <div className="col-span-12 lg:col-span-6">
          <BudgetSummaryCard />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <AISpendingInsight />
        </div>

        {/* ROW 5: Recent Transactions & Splits / Goals */}
        <div className="col-span-12 lg:col-span-7">
          <RecentTransactions transactions={recentTransactionsList} loading={loading} />
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <NetBalanceSummary />
          <SavingsGoalsWidget />
        </div>

      </div>
    </div>
  )
}

export default HomePage
