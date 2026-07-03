import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Camera, PenLine } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { ManualEntryForm } from './ManualEntryForm'

interface AddTransactionSheetProps {
  open: boolean
  onClose: () => void
}

type Mode = 'choose' | 'manual' | 'ai-text' | 'ai-receipt'

export function AddTransactionSheet({ open, onClose }: AddTransactionSheetProps) {
  const [mode, setMode] = useState<Mode>('choose')
  const navigate = useNavigate()

  function handleClose() {
    setMode('choose')
    onClose()
  }

  function handleOpenAIText() {
    handleClose()
    navigate('/add/ai-text')
  }

  function handleOpenAIReceipt() {
    handleClose()
    navigate('/add/ai-receipt')
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={mode === 'choose' ? 'Add Transaction' : undefined}>
      {mode === 'choose' && (
        <div className="space-y-3 py-2">
          {/* Manual Entry — Apple style flat outline card */}
          <button
            id="add-manual-btn"
            onClick={() => setMode('manual')}
            className="flex items-center gap-4 w-full p-4 text-left rounded-2xl border border-border bg-surface-warm/50 hover:bg-surface-warm transition-colors duration-150"
          >
            {/* Action tile — outlined coral (Action Blue) */}
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-coral-50 border border-coral/30 text-coral rounded-xl">
              <PenLine size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Manual Entry</p>
              <p className="text-xs text-slate-400 mt-0.5">Fill in the details yourself</p>
            </div>
          </button>

          {/* AI Text — Mint Action tint */}
          <button
            id="add-ai-text-btn"
            onClick={handleOpenAIText}
            className="flex items-center gap-4 w-full p-4 text-left rounded-2xl border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/20 hover:bg-emerald-50/50 transition-colors duration-150"
          >
            {/* Mint action tile */}
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-emerald-500 text-white rounded-xl">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Type a Message{' '}
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ml-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">AI</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">"spent 450 on groceries at DMart"</p>
            </div>
          </button>

          {/* AI Receipt — Cobalt Pulse tint */}
          <button
            id="add-ai-receipt-btn"
            onClick={handleOpenAIReceipt}
            className="flex items-center gap-4 w-full p-4 text-left rounded-2xl border border-blue-100 dark:border-blue-950/20 bg-blue-50/20 hover:bg-blue-50/50 transition-colors duration-150"
          >
            {/* Cobalt action tile */}
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-blue-500 text-white rounded-xl">
              <Camera size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Scan Receipt{' '}
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ml-1 bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400">AI</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Snap a photo, we'll extract the details</p>
            </div>
          </button>
        </div>
      )}

      {mode === 'manual' && (
        <ManualEntryForm onSuccess={handleClose} onCancel={() => setMode('choose')} />
      )}
    </BottomSheet>
  )
}
export default AddTransactionSheet
