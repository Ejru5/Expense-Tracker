import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, History, Target, Menu, Calendar,
  PiggyBank, CreditCard, Users, UserCircle, Plus, X, ChevronRight,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

/* ── Desktop Sidebar Tabs ────────────────────────────────────────── */
const sidebarTabs = [
  { path: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: History,      label: 'Transactions' },
  { path: '/budgets',   icon: Target,          label: 'Budgets'   },
  { path: '/recurring', icon: Calendar,        label: 'Bills'     },
  { path: '/savings',   icon: PiggyBank,       label: 'Savings'   },
  { path: '/cards',     icon: CreditCard,      label: 'Accounts'  },
  { path: '/profile',   icon: UserCircle,      label: 'Profile'   },
]

interface SidebarProps {
  onAddPress: () => void
}

export function Sidebar({ onAddPress }: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-30 pt-8"
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'var(--gradient-coral-flame)',
            }}
          >
            <span className="text-white font-bold text-lg">₹</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-slate-900 dark:text-slate-100" style={{ letterSpacing: '-0.01em' }}>ExpenseTracker</p>
            <p className="text-xs text-slate-400">Household Manager</p>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="px-4 mb-6">
        <button
          onClick={onAddPress}
          className="btn-primary w-full gap-2 flex items-center justify-center font-bold text-sm min-h-[44px]"
          id="add-transaction-sidebar"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 pt-2">
        {sidebarTabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border border-transparent
               ${isActive
                 ? 'bg-slate-100/80 text-slate-900 dark:bg-slate-800/80 dark:text-white font-semibold'
                 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/40 dark:hover:bg-slate-800/40'}`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-coral' : 'text-slate-400'}
                />
                {tab.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      <div className="px-6 py-4 border-t border-border-subtle">
        <p className="text-xs text-slate-400">ExpenseTracker v1.1</p>
      </div>
    </aside>
  )
}

/* ── Mobile Bottom Navigation ────────────────────────────────────── */
interface BottomNavProps {
  onAddPress: () => void
}

export function BottomNav({ onAddPress }: BottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  // Primary tabs to display directly in the bottom navigation bar
  const mainTabs = [
    { path: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: History,      label: 'Transactions' },
    { path: '/budgets',   icon: Target,          label: 'Budgets'   },
  ]

  // Secondary items in the "More" menu
  const secondaryTabs = [
    { path: '/recurring', icon: Calendar,        label: 'Bills' },
    { path: '/savings',   icon: PiggyBank,       label: 'Savings' },
    { path: '/cards',     icon: CreditCard,      label: 'Accounts' },
    { path: '/splits',    icon: Users,           label: 'Splits' },
    { path: '/profile',   icon: UserCircle,      label: 'Profile' },
  ]

  const handleMoreClick = () => {
    setMoreOpen(!moreOpen)
  }

  // Determine if a secondary tab path is active to highlight the "More" button
  const isSecondaryActive = secondaryTabs.some(tab => location.pathname === tab.path)

  return (
    <>
      {/* Floating Action Button (FAB) on Mobile */}
      <button
        id="add-transaction-fab"
        onClick={onAddPress}
        aria-label="Add transaction"
        className="fixed bottom-20 right-4 z-45 lg:hidden flex items-center justify-center w-12.5 h-12.5 rounded-full text-white shadow-fab active:scale-95 transition-all duration-150"
        style={{
          width: '50px',
          height: '50px',
          background: 'var(--gradient-coral-flame)',
        }}
      >
        <Plus size={24} strokeWidth={2.5} color="#ffffff" />
      </button>

      {/* Sticky Bottom Navigation Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border-subtle shadow-lg lg:hidden"
        style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
      >
        <nav className="flex h-16 items-center justify-around px-2">
          {mainTabs.map(tab => {
            const isActive = location.pathname === tab.path
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all duration-150 min-h-[48px]
                  ${isActive ? 'text-coral' : 'text-slate-500 hover:text-coral'}`}
              >
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              </NavLink>
            )
          })}

          {/* More Tab Trigger */}
          <button
            onClick={handleMoreClick}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all duration-150 min-h-[48px]
              ${isSecondaryActive || moreOpen ? 'text-coral' : 'text-slate-500 hover:text-coral'}`}
          >
            <Menu size={20} strokeWidth={isSecondaryActive || moreOpen ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide">More</span>
          </button>
        </nav>
      </div>

      {/* More Menu Bottom Sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet Container */}
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl border-t border-border shadow-2xl p-6 pb-8 animate-slide-up max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Explore App</h2>
              <button 
                onClick={() => setMoreOpen(false)}
                className="p-2.5 rounded-full bg-surface-warm text-slate-550 active:bg-slate-100 dark:active:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links List */}
            <div className="space-y-2">
              {secondaryTabs.map(tab => {
                const isActive = location.pathname === tab.path
                return (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all min-h-[52px]
                      ${isActive 
                        ? 'bg-surface-warm text-coral border-border-subtle font-extrabold' 
                        : 'bg-surface border-border-subtle text-slate-700 dark:text-slate-300 hover:bg-surface-warm font-semibold'}`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={20} className={isActive ? 'text-coral' : 'text-slate-500'} />
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-coral' : 'text-slate-400'} />
                  </NavLink>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default Sidebar
