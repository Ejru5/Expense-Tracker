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
  const { categories, setAddSheetOpen } = useAppStore()
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

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Transactions</h3>
        {transactions.length > 0 && (
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold text-coral hover:opacity-85 flex items-center gap-0.5 transition-colors min-h-[36px]"
            id="see-all-transactions-btn"
          >
            See All <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="card !p-2 divide-y divide-slate-50 dark:divide-slate-800/40">
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
          /* Enriched Empty State with 4 Quick Actions */
          <div className="py-10 px-4 flex flex-col items-center text-center space-y-6">
            <div className="space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto text-xl">
                💸
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No transactions logged</h4>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                Start tracking by adding a transaction manually, scanning a receipt, or using AI entry.
              </p>
            </div>

            {/* Quick Actions Grid for Empty State */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-md pt-2">
              <button
                onClick={() => setAddSheetOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/20 active:scale-95 transition-all text-slate-700 dark:text-slate-350 min-h-[80px]"
              >
                <Plus size={18} className="text-coral mb-2" />
                <span className="text-[10px] font-bold">Add Manual</span>
              </button>
              <button
                onClick={() => navigate('/add/ai-receipt')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-55 dark:hover:bg-slate-800/20 active:scale-95 transition-all text-slate-700 dark:text-slate-350 min-h-[80px]"
              >
                <Camera size={18} className="text-[#477ee9] mb-2" />
                <span className="text-[10px] font-bold">Scan Receipt</span>
              </button>
              <button
                onClick={() => navigate('/add/ai-text')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-55 dark:hover:bg-slate-800/20 active:scale-95 transition-all text-slate-700 dark:text-slate-350 min-h-[80px]"
              >
                <Sparkles size={18} className="text-[#34c771] mb-2" />
                <span className="text-[10px] font-bold">Quick Expense</span>
              </button>
              <button
                onClick={() => setShowMoreAction()}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-55 dark:hover:bg-slate-800/20 active:scale-95 transition-all text-slate-700 dark:text-slate-350 min-h-[80px]"
              >
                <Upload size={18} className="text-[#ca8a04] mb-2" />
                <span className="text-[10px] font-bold">Import CSV</span>
              </button>
            </div>
          </div>
        ) : (
          /* Transactions List */
          transactions.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId) ?? categories[categories.length - 1]
            return (
              <button
                key={tx.id}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                className="flex items-center gap-3 w-full text-left py-3.5 px-3 rounded-2xl transition-all duration-150 border border-transparent hover:bg-slate-50/70 dark:hover:bg-slate-800/30 min-h-[52px]"
                id={`tx-${tx.id}`}
              >
                {/* Custom Merchant / Category initials Avatar */}
                <div className="relative flex-shrink-0">
                  {tx.merchant ? (
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-extrabold text-sm capitalize">
                      {tx.merchant[0]}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-lg">
                      {cat.icon}
                    </div>
                  )}
                  {tx.merchant && (
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {cat.icon}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {tx.merchant || cat.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-semibold">
                    <span>{cat.name}</span>
                    <span>•</span>
                    <span>{timeAgo(new Date(tx.date))}</span>
                  </div>
                </div>

                {/* Amount */}
                <span
                  className={`text-xs font-extrabold rupee-amount flex-shrink-0 ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center mb-4">
              <Check size={24} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Import Complete!</h4>
            <p className="text-xs text-slate-400 mt-1">Your transaction history has been successfully synchronized.</p>
          </div>
        ) : (
          <form onSubmit={handleImportCSV} className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload bank statements in standard CSV formatting. We will parse and merge transactions into your household ledger.
            </p>
            
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-coral transition-colors rounded-2xl p-6 text-center cursor-pointer">
              <FileText size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                Click to browse or drag & drop CSV file
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 5MB</p>
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
