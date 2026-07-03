import React from 'react'
import { Delete, X } from 'lucide-react'

interface RupeeKeyboardProps {
  value: string
  onChange: (val: string) => void
  onClose?: () => void
}

export function RupeeKeyboard({ value, onChange, onClose }: RupeeKeyboardProps) {
  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      onChange(value.slice(0, -1))
    } else if (key === 'clear') {
      onChange('')
    } else if (key === '.') {
      if (!value.includes('.')) {
        onChange(value + '.')
      }
    } else {
      // Limit to 2 decimal places
      if (value.includes('.')) {
        const parts = value.split('.')
        if (parts[1] && parts[1].length >= 2) return
      }
      onChange(value + key)
    }
  }

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '.', '0', 'delete'
  ]

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 w-full select-none">
      {onClose && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleKeyPress(btn)}
            className={`flex items-center justify-center py-4 rounded-xl text-lg font-bold transition-all active:scale-95 ${
              btn === 'delete'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700/50'
            }`}
          >
            {btn === 'delete' ? <Delete size={20} /> : btn}
          </button>
        ))}
      </div>
    </div>
  )
}
export default RupeeKeyboard
