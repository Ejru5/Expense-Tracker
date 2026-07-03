import type { Transaction, Category } from '../types'
import { formatINR, formatDate } from './utils'

/** Export transaction list to CSV format and trigger download */
export function exportToCSV(transactions: Transaction[], categories: Category[]): void {
  const headers = ['Merchant', 'Amount', 'Type', 'Category', 'Date', 'Note', 'Source']
  
  const rows = transactions.map(tx => {
    const cat = categories.find(c => c.id === tx.categoryId)
    return [
      `"${tx.merchant || ''}"`,
      tx.amount,
      tx.type,
      `"${cat?.name ?? 'Other'}"`,
      `"${formatDate(new Date(tx.date))}"`,
      `"${tx.note || ''}"`,
      tx.source
    ]
  })

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `expense_tracker_export_${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
