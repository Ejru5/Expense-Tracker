import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X } from 'lucide-react'

const SESSION_KEY = 'ai-banner-dismissed'

/**
 * Dismissible session banner shown when no AI key is configured.
 * Lives at the top of the mobile feed — a slim stripe, not a card.
 * Dismissed state is stored in sessionStorage (clears on tab close).
 */
export function AIConfigBanner() {
  const navigate   = useNavigate()
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  )

  const apiKey       = localStorage.getItem('mistral_api_key') || (import.meta as any).env?.VITE_MISTRAL_API_KEY
  const useFunctions = (import.meta as any).env?.VITE_USE_FUNCTIONS === 'true'

  // Don't show if AI is already configured or user dismissed this session
  if (apiKey || useFunctions || dismissed) return null

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-nest-cat-subs/20 bg-nest-cat-subs/5">
      <Sparkles size={13} className="text-nest-cat-subs flex-shrink-0" />
      <p className="flex-1 text-[11px] font-semibold text-nest-secondary leading-snug">
        Add an AI key for smart spending insights
      </p>
      <button
        onClick={() => navigate('/profile')}
        className="text-[11px] font-bold text-nest-cat-subs flex-shrink-0 min-h-[36px] flex items-center"
      >
        Configure&nbsp;→
      </button>
      <button
        onClick={dismiss}
        className="text-nest-text-tertiary hover:text-nest-text-secondary transition-colors flex-shrink-0 min-h-[36px] flex items-center"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  )
}

export default AIConfigBanner
