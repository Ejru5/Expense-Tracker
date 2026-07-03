import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import { useTransactions } from './useTransactions'
import type { RecurringBill } from '../types'

export function useRecurringBills() {
  const { household } = useAppStore()
  const { addTransaction } = useTransactions()
  const [bills, setBills] = useState<RecurringBill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!household) { setLoading(false); return }

    const q = query(
      collection(db, `households/${household.id}/recurringBills`),
      orderBy('nextDueDate', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const fetchedBills = snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          householdId: data.householdId,
          name: data.name,
          amount: data.amount,
          categoryId: data.categoryId,
          frequency: data.frequency,
          nextDueDate: data.nextDueDate?.toDate() ?? new Date(),
          autoLog: data.autoLog ?? false,
          reminderDaysBefore: data.reminderDaysBefore ?? 0,
          cardId: data.cardId,
          createdAt: data.createdAt?.toDate() ?? new Date(),
        } as RecurringBill
      })
      setBills(fetchedBills)
      setLoading(false)

      // Auto-log bills that are due
      const today = new Date()
      fetchedBills.forEach(async (bill) => {
        if (bill.autoLog && bill.nextDueDate <= today) {
          try {
            // Log transaction
            await addTransaction({
              householdId: household.id,
              amount: bill.amount,
              type: 'expense',
              categoryId: bill.categoryId,
              merchant: bill.name,
              note: 'Auto-logged recurring bill',
              paidBy: 'system', // or household default/first member
              cardId: bill.cardId,
              date: bill.nextDueDate,
              source: 'manual',
              recurringBillId: bill.id,
            })

            // Calculate next due date
            const next = new Date(bill.nextDueDate)
            if (bill.frequency === 'daily') next.setDate(next.getDate() + 1)
            else if (bill.frequency === 'weekly') next.setDate(next.getDate() + 7)
            else if (bill.frequency === 'monthly') next.setMonth(next.getMonth() + 1)
            else if (bill.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1)

            // Update nextDueDate
            await updateDoc(doc(db, `households/${household.id}/recurringBills`, bill.id), {
              nextDueDate: next,
            })
          } catch (err) {
            console.error('Failed to auto-log bill:', bill.name, err)
          }
        }
      })
    })

    return unsub
  }, [household])

  async function addBill(bill: Omit<RecurringBill, 'id' | 'householdId' | 'createdAt'>) {
    if (!household) return
    addDoc(collection(db, `households/${household.id}/recurringBills`), {
      ...bill,
      householdId: household.id,
      createdAt: serverTimestamp(),
    })
  }

  async function updateBill(id: string, data: Partial<RecurringBill>) {
    if (!household) return
    updateDoc(doc(db, `households/${household.id}/recurringBills`, id), data)
  }

  async function deleteBill(id: string) {
    if (!household) return
    deleteDoc(doc(db, `households/${household.id}/recurringBills`, id))
  }

  async function markAsPaid(bill: RecurringBill) {
    if (!household) return
    // Log manual transaction
    addTransaction({
      householdId: household.id,
      amount: bill.amount,
      type: 'expense',
      categoryId: bill.categoryId,
      merchant: bill.name,
      note: 'Paid recurring bill',
      paidBy: 'manual',
      cardId: bill.cardId,
      date: new Date(),
      source: 'manual',
      recurringBillId: bill.id,
    })

    // Calculate next due date
    const next = new Date(bill.nextDueDate)
    if (bill.frequency === 'daily') next.setDate(next.getDate() + 1)
    else if (bill.frequency === 'weekly') next.setDate(next.getDate() + 7)
    else if (bill.frequency === 'monthly') next.setMonth(next.getMonth() + 1)
    else if (bill.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1)

    // Update due date
    updateBill(bill.id, { nextDueDate: next })
  }

  return { bills, loading, addBill, updateBill, deleteBill, markAsPaid }
}
