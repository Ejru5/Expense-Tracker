import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'

function docToTransaction(d: any): Transaction {
  const data = d.data()
  return {
    id: d.id,
    householdId: data.householdId,
    amount: data.amount,
    type: data.type,
    categoryId: data.categoryId,
    note: data.note,
    merchant: data.merchant,
    paidBy: data.paidBy,
    cardId: data.cardId,
    date: data.date?.toDate() ?? new Date(),
    source: data.source ?? 'manual',
    receiptImageUrl: data.receiptImageUrl,
    receiptLineItems: data.receiptLineItems ?? [],
    recurringBillId: data.recurringBillId,
    createdAt: data.createdAt?.toDate() ?? new Date(),
  }
}

export function useTransactions(limit?: number) {
  const { household, filterMemberId, filterCardId } = useAppStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) { setLoading(false); return }

    let q = query(
      collection(db, `households/${household.id}/transactions`),
      orderBy('date', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      let txs = snap.docs.map(docToTransaction)

      // Client-side filters (avoids complex compound indexes)
      if (filterMemberId) txs = txs.filter(t => t.paidBy === filterMemberId)
      if (filterCardId)   txs = txs.filter(t => t.cardId === filterCardId)
      if (limit)          txs = txs.slice(0, limit)

      setTransactions(txs)
      setLoading(false)
    })

    return unsub
  }, [household, filterMemberId, filterCardId, limit])

  async function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    if (!household) return
    addDoc(collection(db, `households/${household.id}/transactions`), {
      ...tx,
      date: tx.date,
      createdAt: serverTimestamp(),
    })
  }

  async function updateTransaction(id: string, data: Partial<Transaction>) {
    if (!household) return
    updateDoc(doc(db, `households/${household.id}/transactions`, id), data)
  }

  async function deleteTransaction(id: string) {
    if (!household) return
    deleteDoc(doc(db, `households/${household.id}/transactions`, id))
  }

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction }
}
