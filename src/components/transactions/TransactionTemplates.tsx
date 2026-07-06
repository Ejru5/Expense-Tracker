import React, { useState } from 'react'
import { Plus, Target, Sparkles, Check, Trash2 } from 'lucide-react'
import { useTemplates } from '../../hooks/useTemplates'
import { useAppStore } from '../../store/useAppStore'
import { formatINR } from '../../lib/utils'
import type { TransactionTemplate } from '../../types'

interface TransactionTemplatesProps {
  onSelect: (tpl: TransactionTemplate) => void
  currentFormState?: {
    amount: string
    categoryId: string
    merchant: string
    note: string
    cardId: string
  }
}

export function TransactionTemplates({ onSelect, currentFormState }: TransactionTemplatesProps) {
  const { categories } = useAppStore()
  const { templates, loading, addTemplate, deleteTemplate } = useTemplates()
  const [showSaveTpl, setShowSaveTpl] = useState(false)
  const [label, setLabel] = useState('')

  async function handleSaveTemplate() {
    if (!label.trim() || !currentFormState || !currentFormState.amount) return
    
    await addTemplate({
      label: label.trim(),
      amount: parseFloat(currentFormState.amount),
      categoryId: currentFormState.categoryId,
      merchant: currentFormState.merchant.trim() || undefined,
      cardId: currentFormState.cardId || undefined,
    })
    setLabel('')
    setShowSaveTpl(false)
  }

  if (loading) return null

  return (
    <div className="space-y-2">
      {/* Templates Row */}
      {templates.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x">
          {templates.map(tpl => {
            const cat = categories.find(c => c.id === tpl.categoryId)
            return (
              <div
                key={tpl.id}
                className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                           rounded-xl px-3 py-1.5 flex-shrink-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80
                           snap-start select-none group transition-all"
              >
                <div onClick={() => onSelect(tpl)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <span>{cat?.icon ?? '📦'}</span>
                  <span>{tpl.label}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-bold rupee-amount">
                    ({formatINR(tpl.amount, true)})
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl.id) }}
                  className="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-0.5 rounded"
                  title="Delete template"
                >
                  <Plus size={10} className="rotate-45" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Save Template Action */}
      {currentFormState && currentFormState.amount && !isNaN(parseFloat(currentFormState.amount)) && (
        <div>
          {!showSaveTpl ? (
            <button
              type="button"
              onClick={() => setShowSaveTpl(true)}
              className="text-[10px] font-bold text-coral hover:underline flex items-center gap-0.5"
            >
              <Plus size={10} /> Save these details as template
            </button>
          ) : (
            <div className="flex gap-2 items-center animate-slide-down">
              <input
                type="text"
                placeholder="Template name (e.g. CCDay Coffee)"
                className="input-base !py-1.5 !px-2.5 text-xs flex-1"
                value={label}
                onChange={e => setLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
              />
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="btn-primary !p-1.5 !rounded-lg text-xs"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowSaveTpl(false)}
                className="btn-secondary !p-1.5 !rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default TransactionTemplates
