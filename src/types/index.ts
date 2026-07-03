// ─── Shared Types ────────────────────────────────────────────────────

export type TransactionType = 'expense' | 'income'
export type CardType = 'debit' | 'credit' | 'cash' | 'upi'
export type TransactionSource = 'manual' | 'ai-text' | 'ai-receipt'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food',          name: 'Food',          icon: '🍽️', color: '#d97706', bgColor: '#fef3c7' },
  { id: 'transport',     name: 'Transport',     icon: '🚗', color: '#2563eb', bgColor: '#dbeafe' },
  { id: 'rent',          name: 'Rent',          icon: '🏠', color: '#059669', bgColor: '#d1fae5' },
  { id: 'utilities',     name: 'Utilities',     icon: '⚡', color: '#4f46e5', bgColor: '#e0e7ff' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#db2777', bgColor: '#fce7f3' },
  { id: 'health',        name: 'Health',        icon: '💊', color: '#0d9488', bgColor: '#ccfbf1' },
  { id: 'shopping',      name: 'Shopping',      icon: '🛍️', color: '#9333ea', bgColor: '#fae8ff' },
  { id: 'groceries',     name: 'Groceries',     icon: '🛒', color: '#ca8a04', bgColor: '#fef9c3' },
  { id: 'travel',        name: 'Travel',        icon: '✈️', color: '#0284c7', bgColor: '#e0f2fe' },
  { id: 'education',     name: 'Education',     icon: '📚', color: '#7c3aed', bgColor: '#ede9fe' },
  { id: 'personal',      name: 'Personal Care', icon: '💆', color: '#e11d48', bgColor: '#ffe4e6' },
  { id: 'other',         name: 'Other',         icon: '📦', color: '#64748b', bgColor: '#f1f5f9' },
]

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  bgColor: string
  monthlyBudget?: number
}

export interface Household {
  id: string
  name: string
  currency: string
  members: string[]          // uids
  memberNames: Record<string, string>  // uid → display name
  inviteCode: string
  createdAt: Date
}

export interface Card {
  id: string
  householdId: string
  label: string              // "HDFC Debit", "Wife's Amex", "Cash"
  type: CardType
  last4?: string
  colorTheme: string         // hex gradient start color
  isDefault: boolean
  createdAt: Date
}

export interface ReceiptLineItem {
  name: string
  amount: number
}

export interface Transaction {
  id: string
  householdId: string
  amount: number
  type: TransactionType
  categoryId: string
  note?: string
  merchant?: string
  paidBy: string             // uid
  cardId?: string
  date: Date
  source: TransactionSource
  receiptImageUrl?: string
  receiptLineItems?: ReceiptLineItem[]
  recurringBillId?: string
  createdAt: Date
}

export interface Budget {
  id: string                 // format: yyyy-mm
  householdId: string
  totalBudget: number
  categoryBudgets: Record<string, number>   // categoryId → amount
  totalSpent: number
  updatedAt: Date
}

export interface RecurringBill {
  id: string
  householdId: string
  name: string
  amount: number
  categoryId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  nextDueDate: Date
  autoLog: boolean
  reminderDaysBefore: number
  cardId?: string
  createdAt: Date
}

export interface ReceiptScanResponse {
  merchant: string
  date: string
  lineItems: { name: string; amount: number }[]
  tax: number
  total: number
  categoryId: string
}

export interface SavingsGoal {
  id: string
  householdId: string
  name: string
  icon: string
  targetAmount: number
  currentAmount: number
  targetDate?: Date
  createdAt: Date
}

export interface SplitParticipant {
  name: string
  amount: number
  settled: boolean
  settledAt?: Date
}

export interface Split {
  id: string
  householdId: string
  totalAmount: number
  paidBy: string             // uid
  date: Date
  note?: string
  transactionId?: string     // optional link to a transaction
  participants: SplitParticipant[]
  createdAt: Date
}

export interface TransactionTemplate {
  id: string
  householdId: string
  label: string
  amount: number
  categoryId: string
  merchant?: string
  cardId?: string
  createdAt: Date
}
