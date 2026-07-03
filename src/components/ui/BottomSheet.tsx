import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Overlay — warm dark brandwood tint */}
      <div
        className="bottom-sheet-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bottom-sheet-panel"
      >
        <div className="sheet-handle" />
        {title && (
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="text-base font-semibold" style={{ color: '#360802' }}>{title}</h2>
            <button
              onClick={onClose}
              className="btn-ghost !p-2 !rounded-full"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 pb-8 pb-safe-bottom">
          {children}
        </div>
      </div>
    </>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Warm brandwood overlay */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(54, 8, 2, 0.35)' }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} max-h-[85vh] flex flex-col rounded-2xl p-6 animate-scale-in`}
        style={{
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border)',
        }}
      >
        {title && (
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <button onClick={onClose} className="btn-ghost !p-2 !rounded-full"><X size={18} /></button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  )
}
