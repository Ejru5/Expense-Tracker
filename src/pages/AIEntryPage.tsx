import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Sparkles, AlertCircle } from 'lucide-react'
import { useAITextParse } from '../hooks/useAITextParse'
import { AIConfirmCard } from '../components/ai/AIConfirmCard'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'

const SUGGESTIONS = [
  "spent 450 on groceries at DMart",
  "paid 12000 rent to landlord",
  "got 50000 cash salary today",
  "spent 80 for milk at dairy shop",
  "paid 1500 electricity bill using HDFC",
  "bought movie tickets for 500 on Amex"
]

export function AIEntryPage() {
  const navigate = useNavigate()
  const { parseText, loading, error, parsedData, reset } = useAITextParse()
  const [text, setText] = useState('')

  async function handleParse(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await parseText(text)
  }

  function handleSuggestion(s: string) {
    setText(s)
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-4 animate-fade-in max-w-lg lg:max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost !pl-0 mb-4 flex items-center gap-1"
      >
        <ChevronLeft size={20} /> Back
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-violet-500 animate-pulse" size={24} />
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">AI Quick Add</h1>
      </div>

      {!parsedData ? (
        /* Input Flow */
        <div className="space-y-6">
          <div className="card space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Describe your transaction in natural language. We'll automatically identify the amount, category, merchant, and payment method.
            </p>

            <form onSubmit={handleParse} className="space-y-3">
              <Textarea
                label="What did you spend or earn?"
                placeholder="e.g. spent 850 on dinner at Barbeque Nation using Amex"
                value={text}
                onChange={e => setText(e.target.value)}
                disabled={loading}
                className="text-base"
                required
              />

              {error && (
                <div 
                  className="flex items-center gap-2 text-xs p-3.5 rounded-xl border animate-scale-in"
                  style={{
                    background: 'rgba(251, 45, 84, 0.06)',
                    borderColor: 'rgba(251, 45, 84, 0.2)',
                    color: 'var(--color-magenta-spark)',
                  }}
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                fullWidth
                leftIcon={<Send size={16} />}
              >
                Analyze Transaction
              </Button>
            </form>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Try these examples</h3>
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs font-bold px-3 py-2 rounded-xl transition-all duration-150 border text-left active:scale-95"
                  style={{
                    background: 'var(--surface-subtle)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-coral-flame)'
                    e.currentTarget.style.background = 'var(--color-sunset-fade)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                    e.currentTarget.style.background = 'var(--surface-subtle)'
                  }}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Confirmation Flow */
        <AIConfirmCard
          prefill={parsedData}
          onSuccess={() => {
            reset()
            navigate('/')
          }}
          onCancel={reset}
        />
      )}
    </div>
  )
}
export default AIEntryPage
