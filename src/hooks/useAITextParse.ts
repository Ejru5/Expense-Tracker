import { useState } from 'react'
import { parseExpenseText } from '../lib/mistral'
import type { TransactionType } from '../types'

interface ParsedTransaction {
  amount: number
  type: TransactionType
  categoryId: string
  merchant?: string
  note?: string
  date?: string
}

export function useAITextParse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedTransaction | null>(null)

  async function parseText(text: string) {
    if (!text.trim()) {
      setError('Please enter a description.')
      return null
    }

    setLoading(true)
    setError(null)
    setParsedData(null)

    try {
      const data = await parseExpenseText(text)
      
      const result: ParsedTransaction = {
        amount: data.amount || 0,
        type: data.type || 'expense',
        categoryId: data.categoryId || 'other',
        merchant: data.merchant,
        note: data.note,
        date: data.date,
      }

      setParsedData(result)
      return result
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to parse text. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setParsedData(null)
    setError(null)
    setLoading(false)
  }

  return { parseText, loading, error, parsedData, reset }
}
