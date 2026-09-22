import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, MinusCircle, Camera, ArrowLeftRight, Users, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Modal } from '../ui/BottomSheet'
import { Button } from '../ui/Button'

/**
 * QuickActions strip.
 * Mobile  → circular icon-over-label buttons, spread across full width.
 * Desktop → compact inline icon+label pill buttons, left-aligned cluster.
 */
export function QuickActionsStrip() {
  const navigate = useNavigate()
  const { setAddSheetOpen } = useAppStore()
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)

  const handleMockTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTransferSuccess(true)
    setTimeout(() => {
      setTransferSuccess(false)
      setShowTransferModal(false)
    }, 1500)
  }

  const actions = [
    { label: 'Expense',  icon: MinusCircle,    color: '#fb2d54', bg: 'rgba(251,45,84,0.09)',   onClick: () => setAddSheetOpen(true)       },
    { label: 'Income',   icon: PlusCircle,     color: '#34c771', bg: 'rgba(52,199,113,0.09)',  onClick: () => setAddSheetOpen(true)       },
    { label: 'Scan',     icon: Camera,         color: '#477ee9', bg: 'rgba(71,126,233,0.09)',  onClick: () => navigate('/add/ai-receipt') },
    { label: 'Transfer', icon: ArrowLeftRight, color: '#0066cc', bg: 'rgba(0,102,204,0.09)',   onClick: () => setShowTransferModal(true)  },
    { label: 'Split',    icon: Users,          color: '#9333ea', bg: 'rgba(147,51,234,0.09)',  onClick: () => navigate('/splits')         },
  ]

  return (
    <>
      {/* ── Mobile: full-width circles ─────────────────────────────── */}
      <div className="flex lg:hidden justify-between items-start px-1">
        {actions.map(action => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform duration-150 group"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: action.bg, color: action.color }}
            >
              <action.icon size={20} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-semibold text-nest-secondary text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Desktop: compact inline pill toolbar ──────────────────── */}
      <div className="hidden lg:flex items-center gap-2 flex-wrap">
        {actions.map(action => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-150 hover:brightness-95 active:scale-95"
            style={{ backgroundColor: action.bg, color: action.color }}
          >
            <action.icon size={14} strokeWidth={2.4} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Transfer Modal */}
      <Modal open={showTransferModal} onClose={() => setShowTransferModal(false)} title="Record Account Transfer">
        {transferSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center mb-4">
              <Check size={28} />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100">Transfer Logged!</h3>
            <p className="text-xs text-slate-400 mt-1">Your internal account transfer has been logged successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleMockTransferSubmit} className="space-y-4">
            <p className="text-xs text-slate-400">Log money moved between your own accounts or wallets (e.g. Bank to Cash).</p>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From Account</label>
              <select className="w-full rounded-2xl border border-border p-3 bg-surface dark:bg-surface-subtle text-sm text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-coral focus:outline-none min-h-[44px]">
                <option>HDFC Savings Account</option>
                <option>ICICI Credit Card</option>
                <option>Cash Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To Account</label>
              <select className="w-full rounded-2xl border border-border p-3 bg-surface dark:bg-surface-subtle text-sm text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-coral focus:outline-none min-h-[44px]">
                <option>Cash Wallet</option>
                <option>HDFC Savings Account</option>
                <option>Paytm Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
              <input
                type="number"
                placeholder="2000"
                required
                className="w-full rounded-2xl border border-border p-3 bg-surface dark:bg-surface-subtle text-sm text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-coral focus:outline-none min-h-[44px]"
              />
            </div>
            <Button type="submit" fullWidth>Confirm Transfer</Button>
          </form>
        )}
      </Modal>
    </>
  )
}

export default QuickActionsStrip
