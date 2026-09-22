import React from 'react'
import { RecentTransactions } from '../components/home/RecentTransactions'
import { UpcomingBillsWidget } from '../components/recurring/UpcomingBillsWidget'
import { NetBalanceSummary } from '../components/splits/NetBalanceSummary'
import { SavingsGoalsWidget } from '../components/home/SavingsGoalsWidget'
import { QuickActionsStrip } from '../components/home/QuickActionsStrip'
import { InsightChipsRow } from '../components/home/InsightChipsRow'
import { CategoryPillsRow } from '../components/home/CategoryPillsRow'
import { BudgetProgressRow } from '../components/home/BudgetProgressRow'
import { AIConfigBanner } from '../components/home/AIConfigBanner'
import { useTransactions } from '../hooks/useTransactions'
import { useAppStore } from '../store/useAppStore'

export function HomePage() {
  const { user } = useAppStore()
  const { transactions, loading } = useTransactions()

  const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Dhruv'
  const partnerName = displayName === 'Dhruv' ? 'Dhruvi' : 'Dhruv'
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  // Mobile: last 5 | Desktop: last 25 so the filter tabs have data to work with
  const mobileTxs  = transactions.slice(0, 5)
  const desktopTxs = transactions.slice(0, 25)

  return (
    <div className="page-content px-4 lg:px-8 pt-6 animate-fade-in max-w-[1400px] mx-auto">

      {/* ── Header Greeting (shared) ────────────────────────────────── */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-[10px] text-nest-tertiary font-bold uppercase tracking-widest">{month}</p>
          <h1 className="text-xl font-bold text-nest-primary mt-0.5">
            {displayName} &amp; {partnerName}
          </h1>
        </div>
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-nest-cat-groceries flex items-center justify-center text-[10px] font-bold text-nest-accent-lime-text border-2 border-nest-bg">{displayName[0]}</div>
          <div className="w-8 h-8 rounded-full bg-nest-cat-subs flex items-center justify-center text-[10px] font-bold text-white border-2 border-nest-bg">{partnerName[0]}</div>
        </div>
      </div>

      {/* ── AI config nudge (shared) ────────────────────────────────── */}
      <div className="mb-5">
        <AIConfigBanner />
      </div>

      {/* ── Stat cards (shared, 2 on mobile / 4 on desktop) ─────────── */}
      <div className="mb-5">
        <InsightChipsRow transactions={transactions} />
      </div>

      {/* ════════════════════════════════════════════════════════════
          MOBILE LAYOUT  (hidden on lg+)
          ════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden space-y-5">
        <QuickActionsStrip />
        <RecentTransactions transactions={mobileTxs} loading={loading} />
        <CategoryPillsRow transactions={transactions} />
        <BudgetProgressRow />
        <UpcomingBillsWidget />
        <NetBalanceSummary />
        <SavingsGoalsWidget />
      </div>

      {/* ════════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (hidden below lg)
          Two-column: 65 % left content + 35 % sticky right rail
          ════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">

        {/* Quick Actions toolbar — full width above the columns */}
        <div className="mb-6">
          <QuickActionsStrip />
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* ── Left column (65 %) ── */}
          <div className="col-span-8 space-y-6">
            {/* Transactions with filter tabs + date col + hover edit */}
            <RecentTransactions transactions={desktopTxs} loading={loading} />

            {/* Category pills — horizontal scroll strip */}
            <CategoryPillsRow transactions={transactions} />
          </div>

          {/* ── Right column (35 %) — sticky rail ── */}
          <div className="col-span-4 space-y-5 sticky top-6">
            {/* Budget progress — compact collapsible */}
            <BudgetProgressRow />

            {/* Upcoming bills */}
            <UpcomingBillsWidget />

            {/* Splits & Goals */}
            <NetBalanceSummary />
            <SavingsGoalsWidget />
          </div>

        </div>
      </div>

    </div>
  )
}

export default HomePage
