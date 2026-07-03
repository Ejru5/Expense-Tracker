import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, ArrowLeft, ChevronDown, Check, X } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useAppStore } from '../store/useAppStore'
import { TransactionItem } from '../components/transactions/TransactionItem'
import { formatINR } from '../lib/utils'

export function TransactionsPage() {
  const navigate = useNavigate()
  const { transactions, loading, deleteTransaction } = useTransactions()
  const { categories, setAddSheetOpen } = useAppStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all')

  // Custom Dropdown Open States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isTypeOpen, setIsTypeOpen] = useState(false)

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      (tx.merchant?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (tx.note?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || tx.categoryId === selectedCategory
    const matchesType = selectedType === 'all' || tx.type === selectedType

    return matchesSearch && matchesCategory && matchesType
  })

  // Group by Date for display
  const groupTransactionsByDate = () => {
    const groups: { [key: string]: typeof transactions } = {}
    filteredTransactions.forEach(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      if (!groups[dateStr]) groups[dateStr] = []
      groups[dateStr].push(tx)
    })
    return groups
  }

  const grouped = groupTransactionsByDate()

  const categoryOptions = [
    { value: 'all', name: 'All Categories', icon: '📁' },
    ...categories.map(c => ({ value: c.id, name: c.name, icon: c.icon }))
  ]

  const typeOptions = [
    { value: 'all', name: 'All Types', icon: '⚖️' },
    { value: 'income', name: 'Income', icon: '📥' },
    { value: 'expense', name: 'Expense', icon: '📤' }
  ]

  return (
    <div className="page-content px-4 lg:px-8 pt-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="lg:hidden p-2.5 rounded-xl border border-border bg-surface dark:bg-surface-subtle flex items-center justify-center min-h-[40px] min-w-[40px] hover:bg-surface-warm transition-colors active:scale-[0.97]"
            aria-label="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Transactions</h1>
            <p className="text-xs text-slate-400 dark:text-slate-505 font-medium mt-0.5">View and manage all household records</p>
          </div>
        </div>
        <button
          onClick={() => setAddSheetOpen(true)}
          className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 h-9 rounded-xl shadow-sm self-start sm:self-auto select-none"
        >
          <Plus size={15} />
          Add Transaction
        </button>
      </div>

      {/* Filters Cohesive Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-2 mb-5 p-1.5 bg-surface-warm/40 dark:bg-slate-900/20 border border-border-subtle rounded-xl shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchant, notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-transparent border-transparent placeholder-slate-400 focus:outline-none focus:ring-0 transition-all min-h-[38px] text-slate-800 dark:text-slate-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 min-h-[32px] min-w-[32px] flex items-center justify-center"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Vertical divider on larger screens */}
        <div className="hidden md:block h-5 w-px bg-border-subtle flex-shrink-0" />

        {/* Dropdowns wrapper */}
        <div className="flex flex-row items-center gap-2 w-full md:w-auto flex-shrink-0">
          
          {/* Custom Category Dropdown */}
          <div className="relative flex-1 md:flex-initial md:w-44">
            <button
              type="button"
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen)
                setIsTypeOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-surface dark:bg-surface-subtle border border-border-subtle rounded-xl hover:bg-surface-warm/50 transition-all min-h-[38px] focus:ring-1 focus:ring-coral/25 focus:border-coral select-none"
            >
              <span className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-200">
                <span className="text-sm">{categoryOptions.find(o => o.value === selectedCategory)?.icon}</span>
                <span className="font-semibold truncate">{categoryOptions.find(o => o.value === selectedCategory)?.name}</span>
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-205 flex-shrink-0 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCategoryOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsCategoryOpen(false)} />
                <div className="absolute top-full mt-1.5 left-0 right-0 z-40 bg-surface dark:bg-surface-muted rounded-xl border border-border shadow-lg p-1 animate-scale-in max-h-60 overflow-y-auto">
                  {categoryOptions.map(opt => {
                    const isSelected = selectedCategory === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(opt.value)
                          setIsCategoryOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold rounded-lg transition-colors text-left min-h-[34px]
                          ${isSelected 
                            ? 'bg-coral-50/50 text-coral dark:bg-coral-950/20' 
                            : 'text-slate-700 dark:text-slate-350 hover:bg-surface-warm dark:hover:bg-slate-800/40'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.name}</span>
                        </span>
                        {isSelected && <Check size={12} className="text-coral flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Custom Type Dropdown */}
          <div className="relative flex-1 md:flex-initial md:w-36">
            <button
              type="button"
              onClick={() => {
                setIsTypeOpen(!isTypeOpen)
                setIsCategoryOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-surface dark:bg-surface-subtle border border-border-subtle rounded-xl hover:bg-surface-warm/50 transition-all min-h-[38px] focus:ring-1 focus:ring-coral/25 focus:border-coral select-none"
            >
              <span className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-200">
                <span className="text-sm">{typeOptions.find(o => o.value === selectedType)?.icon}</span>
                <span className="font-semibold truncate">{typeOptions.find(o => o.value === selectedType)?.name}</span>
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-205 flex-shrink-0 ${isTypeOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isTypeOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsTypeOpen(false)} />
                <div className="absolute top-full mt-1.5 left-0 right-0 z-40 bg-surface dark:bg-surface-muted rounded-xl border border-border shadow-lg p-1 animate-scale-in max-h-60 overflow-y-auto">
                  {typeOptions.map(opt => {
                    const isSelected = selectedType === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedType(opt.value as any)
                          setIsTypeOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold rounded-lg transition-colors text-left min-h-[34px]
                          ${isSelected 
                            ? 'bg-coral-50/50 text-coral dark:bg-coral-950/20' 
                            : 'text-slate-700 dark:text-slate-350 hover:bg-surface-warm dark:hover:bg-slate-800/40'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.name}</span>
                        </span>
                        {isSelected && <Check size={12} className="text-coral flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Transactions List Row */}
      <div className="space-y-4">
        {loading ? (
          <div className="card !rounded-xl border border-border-subtle shadow-sm space-y-4 !p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-32 bg-slate-150 dark:bg-slate-800 rounded" />
                    <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="card !rounded-xl border border-border-subtle shadow-sm py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-surface-warm border border-dashed border-border flex items-center justify-center mb-4">
              <Search size={22} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No transactions found</h3>
            <p className="text-xs text-slate-400 max-w-[280px] mt-1 leading-relaxed">
              Try adjusting your filters, searching for something else, or add a new transaction.
            </p>
            <div className="flex gap-2 mt-5">
              <button 
                onClick={() => setAddSheetOpen(true)} 
                className="btn-primary py-2 px-4 text-xs font-semibold h-9 rounded-xl shadow-sm select-none"
              >
                Add Transaction
              </button>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedType('all')
                }} 
                className="btn-secondary py-2 px-4 text-xs font-semibold h-9 rounded-xl border border-border shadow-sm select-none"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          Object.keys(grouped).map(dateStr => (
            <div key={dateStr} className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                {dateStr}
              </h3>
              <div className="card !rounded-xl border border-border-subtle shadow-sm !p-1 divide-y divide-border-subtle/50">
                {grouped[dateStr].map(tx => (
                  <div key={tx.id} className="flex items-center justify-between group rounded-xl" style={{ contentVisibility: 'auto' }}>
                    <div className="flex-1">
                      <TransactionItem tx={tx} />
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this transaction?')) {
                          await deleteTransaction(tx.id)
                        }
                      }}
                      className="p-3 mr-1 text-slate-400 hover:text-rose-500 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 select-none"
                      title="Delete transaction"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default TransactionsPage
