import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, MinusCircle, Camera, ArrowLeftRight, Users, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Modal } from '../ui/BottomSheet'
import { Button } from '../ui/Button'

export function QuickActions() {
  const navigate = useNavigate()
  const { setAddSheetOpen } = useAppStore()
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferSuccess, setTransferSuccess] = useState(false)

  const handleAddExpense = () => {
    // Open the global add transaction sheet
    setAddSheetOpen(true)
  }

  const handleAddIncome = () => {
    // Open the global add transaction sheet
    setAddSheetOpen(true)
  }

  const handleScanReceipt = () => {
    navigate('/add/ai-receipt')
  }

  const handleTransfer = () => {
    setShowTransferModal(true)
  }

  const handleSplit = () => {
    navigate('/splits')
  }

  const handleMockTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTransferSuccess(true)
    setTimeout(() => {
      setTransferSuccess(false)
      setShowTransferModal(false)
    }, 1500)
  }

  const actions = [
    { label: 'Add Expense', icon: MinusCircle, color: '#fb2d54', bg: 'rgba(251, 45, 84, 0.06)', onClick: handleAddExpense },
    { label: 'Add Income', icon: PlusCircle, color: '#34c771', bg: 'rgba(52, 199, 113, 0.06)', onClick: handleAddIncome },
    { label: 'Scan Receipt', icon: Camera, color: '#477ee9', bg: 'rgba(71, 126, 233, 0.06)', onClick: handleScanReceipt },
    { label: 'Transfer', icon: ArrowLeftRight, color: '#0066cc', bg: 'rgba(0, 102, 204, 0.06)', onClick: handleTransfer },
    { label: 'Split Expense', icon: Users, color: '#9333ea', bg: 'rgba(147, 51, 234, 0.06)', onClick: handleSplit },
  ]

  return (
    <>
      <div className="card !p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3.5 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {actions.map(action => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-2 rounded-2xl border border-transparent hover:border-border-subtle hover:bg-surface-warm/50 transition-all duration-150 group active:scale-95 min-h-[76px]"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: action.bg, color: action.color }}
              >
                <action.icon size={20} strokeWidth={2.2} />
              </div>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-350 text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
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
export default QuickActions
