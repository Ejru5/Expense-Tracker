import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, History, Target, Menu, Calendar,
  PiggyBank, CreditCard, Users, UserCircle, Plus, X, ChevronRight, BarChart3
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

/* ── Desktop Sidebar Groups ──────────────────────────────────────── */
const sidebarGroups = [
  {
    label: 'Core',
    tabs: [
      { path: '/',             icon: LayoutDashboard, label: 'Overview' },
      { path: '/transactions', icon: History,         label: 'Spending' },
      { path: '/budgets',      icon: Target,          label: 'Budgets' },
    ],
  },
  {
    label: 'Planning',
    tabs: [
      { path: '/recurring', icon: Calendar,  label: 'Subs' },
      { path: '/savings',   icon: PiggyBank, label: 'Goals' },
      { path: '/splits',    icon: Users,     label: 'Splits' },
    ],
  },
  {
    label: 'Insights',
    tabs: [
      { path: '/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
  {
    label: 'Account',
    tabs: [
      { path: '/profile', icon: UserCircle, label: 'Profile' },
    ],
  },
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
      <div className="px-4 mb-4">
        <button
          onClick={onAddPress}
          className="btn-primary w-full gap-2 flex items-center justify-center font-bold text-sm min-h-[44px]"
          id="add-transaction-sidebar"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* Grouped Nav Links */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {sidebarGroups.map((group, gi) => (
          <div key={group.label}>
            {/* Section label */}
            <p className="text-[9px] font-bold uppercase tracking-widest text-nest-tertiary px-3 pt-4 pb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.tabs.map(tab => (
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
            </div>
            {/* Divider between groups (not after last) */}
            {gi < sidebarGroups.length - 1 && (
              <div className="mx-3 mt-3 border-t border-nest-border/40" />
            )}
          </div>
        ))}
      </nav>

      {/* Version footer */}
      <div className="px-4 py-4 border-t border-nest-border flex flex-col gap-2.5">
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

  // Left two tabs
  const leftTabs = [
    { path: '/',             icon: LayoutDashboard, label: 'Overview' },
    { path: '/transactions', icon: History,         label: 'Spending' },
  ]

  // Right two tabs
  const rightTabs = [
    { path: '/budgets', icon: Target,  label: 'Budgets' },
    { path: '/more',    icon: Menu,    label: 'More',   isMore: true },
  ]

  // Secondary items in the "More" menu
  const secondaryTabs = [
    { path: '/recurring', icon: Calendar,        label: 'Subs' },
    { path: '/savings',   icon: PiggyBank,       label: 'Goals' },
    { path: '/reports',   icon: BarChart3,       label: 'Reports' },
    { path: '/splits',    icon: Users,           label: 'Splits' },
    { path: '/profile',   icon: UserCircle,      label: 'Profile' },
  ]

  const isSecondaryActive = secondaryTabs.some(tab => location.pathname === tab.path)

  return (
    <>
      {/* Sticky Bottom Navigation Bar — 5-column with raised Add bubble */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 lg:hidden"
        style={{
          background: 'var(--nest-surface)',
          borderTop: '1px solid var(--nest-border)',
          boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
          paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))',
          /* Give nav its own stacking context so the Add bubble can pop up inside it */
          position: 'fixed',
        }}
      >
        <nav
          className="relative flex h-16 items-center"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}
        >
          {/* Left tabs */}
          {leftTabs.map(tab => {
            const isActive = location.pathname === tab.path
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-150 min-h-[48px]
                  ${isActive ? 'text-nest-accent-lime-text' : 'text-nest-secondary'}`}
              >
                <div className={`p-1.5 rounded-full transition-all duration-150 ${isActive ? 'bg-nest-accent-lime/20' : ''}`}>
                  <tab.icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
                </div>
                <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              </NavLink>
            )
          })}

          {/* Centre Add column — the circle pops up out of the bar */}
          <div className="relative flex flex-col items-center justify-end pb-1">
            {/* The raised circle — positioned absolutely within the nav's stacking context */}
            <button
              id="add-transaction-fab"
              onClick={onAddPress}
              aria-label="Add transaction"
              className="absolute active:scale-90 transition-transform duration-150"
              style={{
                /* Pull it 28px above the nav's top edge */
                top: '-28px',
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'var(--nest-accent-lime)',
                /* Border in the bar's background color — creates the "cut-out" effect */
                border: '4px solid var(--nest-surface)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--nest-accent-lime-text)',
              }}
            >
              <Plus size={26} strokeWidth={2.5} />
            </button>
            {/* Label sits at normal nav height */}
            <span
              className="text-[10px] font-bold tracking-wide"
              style={{ color: 'var(--nest-secondary, #888)', marginTop: '2px' }}
            >
              Add
            </span>
          </div>

          {/* Right tabs */}
          {rightTabs.map(tab => {
            const isActive = tab.isMore
              ? isSecondaryActive || moreOpen
              : location.pathname === tab.path

            if (tab.isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-150 min-h-[48px] w-full
                    ${isActive ? 'text-nest-accent-lime-text' : 'text-nest-secondary'}`}
                >
                  <div className={`p-1.5 rounded-full transition-all duration-150 ${isActive ? 'bg-nest-accent-lime/20' : ''}`}>
                    <Menu size={20} strokeWidth={isActive ? 2.2 : 1.5} />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide">More</span>
                </button>
              )
            }

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-150 min-h-[48px]
                  ${isActive ? 'text-nest-accent-lime-text' : 'text-nest-secondary'}`}
              >
                <div className={`p-1.5 rounded-full transition-all duration-150 ${isActive ? 'bg-nest-accent-lime/20' : ''}`}>
                  <tab.icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
                </div>
                <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              </NavLink>
            )
          })}
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
