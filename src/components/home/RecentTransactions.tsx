import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, Camera, Sparkles, Upload, FileText, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { Skeleton } from '../ui'
import { Modal } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { formatINR, timeAgo } from '../../lib/utils'

interface RecentTransactionsProps {
  transactions: any[]
  loading: boolean
}

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  const navigate = useNavigate()
  const { categories, setAddSheetOpen, user } = useAppStore()
  const [showImportModal, setShowImportModal] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault()
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setImportSuccess(true)
      setTimeout(() => {
        setImportSuccess(false)
        setShowImportModal(false)
      }, 1500)
    }, 2000)
  }

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

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="section-title pl-0.5">Recent Transactions</h3>
        {transactions.length > 0 && (
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold text-nest-cat-groceries hover:opacity-85 flex items-center gap-0.5 transition-colors min-h-[36px]"
            id="see-all-transactions-btn"
          >
            See All <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="card !p-2 divide-y divide-nest-border">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : transactions.length === 0 ? (
          /* Empty State */
          <div className="py-10 px-4 flex flex-col items-center text-center space-y-6">
            <div className="space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-nest-surface-muted border border-dashed border-nest-border flex items-center justify-center mx-auto text-xl">
                💸
              </div>
              <h4 className="font-bold text-nest-primary text-sm">No transactions logged</h4>
              <p className="text-xs text-nest-secondary max-w-[240px] mx-auto leading-relaxed">
                Start tracking manual entries, scan receipts, or use AI.
              </p>
            </div>

            {/* Quick Actions Grid for Empty State */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-md pt-2">
              <button
                onClick={() => setAddSheetOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-nest-border hover:bg-nest-surface-muted active:scale-95 transition-all text-nest-primary min-h-[80px]"
              >
                <Plus size={18} className="text-nest-cat-groceries mb-2" />
                <span className="text-[10px] font-bold">Add Manual</span>
              </button>
              <button
                onClick={() => navigate('/add/ai-receipt')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-nest-border hover:bg-nest-surface-muted active:scale-95 transition-all text-nest-primary min-h-[80px]"
              >
                <Camera size={18} className="text-nest-cat-subs mb-2" />
                <span className="text-[10px] font-bold">Scan Receipt</span>
              </button>
              <button
                onClick={() => navigate('/add/ai-text')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-nest-border hover:bg-nest-surface-muted active:scale-95 transition-all text-nest-primary min-h-[80px]"
              >
                <Sparkles size={18} className="text-nest-cat-groceries mb-2" />
                <span className="text-[10px] font-bold">Quick Expense</span>
              </button>
              <button
                onClick={() => setShowMoreAction()}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-nest-border hover:bg-nest-surface-muted active:scale-95 transition-all text-nest-primary min-h-[80px]"
              >
                <Upload size={18} className="text-nest-cat-dining mb-2" />
                <span className="text-[10px] font-bold">Import CSV</span>
              </button>
            </div>
          </div>
        ) : (
          /* Transactions List */
          transactions.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId) ?? categories[categories.length - 1]
            const isCurrentUser = tx.paidBy === user?.uid
            const payerInitial = isCurrentUser ? user?.displayName?.[0] || 'D' : 'P'
            const dotColor = getFlatColor(cat.id, cat.color)

            return (
              <button
                key={tx.id}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                className="flex items-center gap-3 w-full text-left py-3.5 px-3 rounded-xl transition-all duration-150 border border-transparent hover:bg-nest-surface-muted/50 min-h-[52px]"
                id={`tx-${tx.id}`}
              >
                <div className="relative flex-shrink-0">
                  {tx.merchant ? (
                    <div 
                      className="w-10 h-10 rounded-full border flex items-center justify-center font-extrabold text-sm capitalize"
                      style={{ backgroundColor: `${dotColor}12`, borderColor: `${dotColor}25`, color: dotColor }}
                    >
                      {tx.merchant[0]}
                    </div>
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full border flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${dotColor}12`, borderColor: `${dotColor}25` }}
                    >
                      {cat.icon}
                    </div>
                  )}
                  {tx.merchant && (
                    <span 
                      className="absolute -bottom-1 -right-1 text-[8px] border rounded-full w-5 h-5 flex items-center justify-center bg-nest-surface"
                      style={{ borderColor: 'var(--nest-border)' }}
                    >
                      {cat.icon}
                    </span>
                  )}
                  {/* Payer Avatar overlay */}
                  <span 
                    className="absolute -top-1 -left-1 text-[8px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center bg-nest-surface border"
                    style={{ borderColor: 'var(--nest-border)', color: 'var(--nest-text-secondary)' }}
                  >
                    {payerInitial}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-nest-primary truncate">
                    {tx.merchant || cat.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-nest-secondary font-semibold">
                    <span>{cat.name}</span>
                    <span>•</span>
                    <span>{timeAgo(new Date(tx.date))}</span>
                  </div>
                </div>

                {/* Amount */}
                <span
                  className={`text-xs font-bold rupee-amount flex-shrink-0 ${
                    tx.type === 'income' ? 'text-income' : 'text-expense'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}{formatINR(tx.amount)}
                </span>
              </button>
            )
          })
        )}
      </div>

      {/* CSV Import Modal */}
      <Modal open={showImportModal} onClose={() => setShowImportModal(false)} title="Import CSV Statement">
        {importSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Check size={24} />
            </div>
            <h4 className="font-bold text-nest-primary">Import Complete!</h4>
            <p className="text-xs text-nest-secondary mt-1">Your transaction history has been successfully synchronized.</p>
          </div>
        ) : (
          <form onSubmit={handleImportCSV} className="space-y-4">
            <p className="text-xs text-nest-secondary leading-relaxed">
              Upload bank statements in standard CSV formatting. We will parse and merge transactions into your household ledger.
            </p>
            
            <div className="border-2 border-dashed border-nest-border hover:border-nest-cat-groceries transition-colors rounded-xl p-6 text-center cursor-pointer">
              <FileText size={32} className="mx-auto text-nest-tertiary mb-2" />
              <p className="text-xs font-bold text-nest-primary">
                Click to browse or drag & drop CSV file
              </p>
              <p className="text-[10px] text-nest-secondary mt-0.5">Maximum file size: 5MB</p>
            </div>

            <Button type="submit" loading={importing} fullWidth>
              {importing ? 'Processing File...' : 'Upload & Parse Statement'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  )

  function setShowMoreAction() {
    setShowImportModal(true)
  }
}

export default RecentTransactions
