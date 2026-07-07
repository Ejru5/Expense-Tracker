import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, History, Target, Menu, Calendar,
  PiggyBank, CreditCard, Users, UserCircle, Plus, X, ChevronRight, BarChart3
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

/* ── Desktop Sidebar Tabs ────────────────────────────────────────── */
const sidebarTabs = [
  { path: '/',             icon: LayoutDashboard, label: 'Overview' },
  { path: '/transactions', icon: History,         label: 'Spending' },
  { path: '/budgets',      icon: Target,          label: 'Budgets' },
  { path: '/recurring',    icon: Calendar,        label: 'Subs' },
  { path: '/savings',      icon: PiggyBank,       label: 'Goals' },
  { path: '/reports',      icon: BarChart3,       label: 'Reports' },
  { path: '/splits',       icon: Users,           label: 'Splits' },
  { path: '/profile',      icon: UserCircle,      label: 'Profile' },
]

interface SidebarProps {
  onAddPress: () => void
}

export function Sidebar({ onAddPress }: SidebarProps) {
  const { user } = useAppStore()
  const displayName = user?.displayName ? user.displayName.split(' ')[0] : 'Dhruv'
  const partnerName = displayName === 'Dhruv' ? 'Dhruvi' : 'Dhruv'

  return (
    <aside
      className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-30 pt-8"
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--nest-surface)',
        borderRight: '1px solid var(--nest-border)',
      }}
    >
      {/* Logo / Profile info */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img src="/logo.png" alt="Nest Logo" className="w-9 h-9 rounded-full object-cover border border-nest-border" />
            <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-nest-accent-lime rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-nest-accent-lime-text">2</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-nest-primary">Nest</p>
            <p className="text-[10px] text-nest-secondary font-bold uppercase tracking-wider">
              {displayName} & {partnerName}
            </p>
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
      <nav className="flex-1 px-3 space-y-1 pt-2 overflow-y-auto">
        {sidebarTabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="icon-badge">
                  <tab.icon
                    size={14}
                    strokeWidth={isActive ? 2 : 1.5}
                    className={isActive ? 'text-nest-primary' : 'text-nest-secondary'}
                  />
                </div>
                <span className="text-sm font-semibold">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Promo & Version */}
      <div className="px-4 py-4 border-t border-nest-border flex flex-col gap-2.5">
        <div className="bg-nest-surface-muted p-3.5 rounded-lg border border-nest-border flex flex-col gap-1.5 text-xs">
          <p className="font-bold text-nest-primary">Invite Partner</p>
          <p className="text-[10px] text-nest-secondary">Unlock biometric syncing & real-time notifications.</p>
          <button className="nest-pill text-center justify-center mt-1 py-1 text-[9px] w-full font-bold">Invite Now</button>
        </div>
        <p className="text-[10px] text-nest-tertiary font-bold tracking-widest uppercase pl-2">Nest v1.1</p>
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
    { path: '/',             icon: LayoutDashboard, label: 'Overview' },
    { path: '/transactions', icon: History,         label: 'Spending' },
    { path: '/budgets',      icon: Target,          label: 'Budgets' },
  ]

  // Secondary items in the "More" menu
  const secondaryTabs = [
    { path: '/recurring', icon: Calendar,        label: 'Subs' },
    { path: '/savings',   icon: PiggyBank,       label: 'Goals' },
    { path: '/reports',   icon: BarChart3,       label: 'Reports' },
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
        className="fixed bottom-20 right-4 z-40 lg:hidden flex items-center justify-center rounded-full text-nest-accent-lime-text shadow-fab active:scale-95 transition-all duration-150 border border-nest-border/10"
        style={{
          width: '50px',
          height: '50px',
          background: 'var(--nest-accent-lime)',
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Sticky Bottom Navigation Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-30 bg-nest-surface border-t border-nest-border shadow-card lg:hidden"
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
                  ${isActive ? 'text-nest-accent-lime-text' : 'text-nest-secondary'}`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-nest-accent-lime/40' : ''}`}>
                  <tab.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              </NavLink>
            )
          })}

          {/* More Tab Trigger */}
          <button
            onClick={handleMoreClick}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all duration-150 min-h-[48px]
              ${isSecondaryActive || moreOpen ? 'text-nest-accent-lime-text' : 'text-nest-secondary'}`}
          >
            <div className={`p-1 rounded-full ${isSecondaryActive || moreOpen ? 'bg-nest-accent-lime/40' : ''}`}>
              <Menu size={20} strokeWidth={isSecondaryActive || moreOpen ? 2 : 1.5} />
            </div>
            <span className="text-[10px] font-bold tracking-wide">More</span>
          </button>
        </nav>
      </div>

      {/* More Menu Bottom Sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" 
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet Container */}
          <div className="absolute bottom-0 left-0 right-0 bg-nest-surface rounded-t-3xl border-t border-nest-border shadow-modal p-6 pb-8 animate-slide-up max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-nest-primary uppercase tracking-wider">Explore App</h2>
              <button 
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-full bg-nest-surface-muted text-nest-secondary active:bg-nest-border min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all min-h-[52px]
                      ${isActive 
                        ? 'bg-nest-surface-muted text-nest-primary border-nest-border font-bold' 
                        : 'bg-nest-surface border-nest-border text-nest-secondary hover:bg-nest-surface-muted font-semibold'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="icon-badge">
                        <tab.icon size={18} className={isActive ? 'text-nest-primary' : 'text-nest-secondary'} />
                      </div>
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-nest-primary' : 'text-nest-secondary'} />
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
