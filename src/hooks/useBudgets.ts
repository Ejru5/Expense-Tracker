import { useEffect, useState } from 'react'
import {
  doc, onSnapshot, setDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import { useTransactions } from './useTransactions'
import { toMonthKey, monthBounds } from '../lib/utils'
import type { Budget } from '../types'

export function useBudgets(year?: number, month?: number) {
  const { household } = useAppStore()
  const { transactions } = useTransactions()

  const now = new Date()
  const y = year  ?? now.getFullYear()
  const m = month ?? now.getMonth()       // 0-indexed
  const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`

  const [budget, setBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) { setLoading(false); return }

    const ref = doc(db, `households/${household.id}/budgets`, monthKey)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data()
        setBudget({
          id: snap.id,
          householdId: household.id,
          totalBudget: d.totalBudget ?? 0,
          categoryBudgets: d.categoryBudgets ?? {},
          totalSpent: d.totalSpent ?? 0,
          updatedAt: d.updatedAt?.toDate() ?? new Date(),
        })
      } else {
        setBudget(null)
      }
      setLoading(false)
    })
    return unsub
  }, [household, monthKey])

  // Compute actual spending per category for this month from transactions
  const { start, end } = monthBounds(y, m)
  const monthTransactions = transactions.filter(t =>
    t.type === 'expense' &&
    new Date(t.date) >= start &&
    new Date(t.date) <= end
  )

  const spentByCategory: Record<string, number> = {}
  for (const tx of monthTransactions) {
    spentByCategory[tx.categoryId] = (spentByCategory[tx.categoryId] ?? 0) + tx.amount
  }

  const totalSpent = monthTransactions.reduce((s, t) => s + t.amount, 0)

  async function saveBudget(totalBudget: number, categoryBudgets: Record<string, number>) {
    if (!household) return
    const ref = doc(db, `households/${household.id}/budgets`, monthKey)
    await setDoc(ref, {
      householdId: household.id,
      totalBudget,
      categoryBudgets,
      totalSpent,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  async function setCategoryBudget(categoryId: string, amount: number) {
    if (!budget && !household) return
    const current = budget?.categoryBudgets ?? {}
    const updated = { ...current, [categoryId]: amount }
    const total = budget?.totalBudget ?? 0
    saveBudget(total, updated)
  }

  async function setTotalBudget(amount: number) {
    const current = budget?.categoryBudgets ?? {}
    saveBudget(amount, current)
  }

  return {
    budget,
    loading,
    monthKey,
    spentByCategory,
    totalSpent,
    monthTransactions,
    saveBudget,
    setCategoryBudget,
    setTotalBudget,
  }
}
