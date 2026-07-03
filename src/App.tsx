import React from 'react'
import {
  BrowserRouter, Routes, Route, Navigate,
} from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HouseholdSetupPage } from './pages/HouseholdSetupPage'
import { HomePage } from './pages/HomePage'
import { ReportsPage } from './pages/ReportsPage'
import { CardsPage } from './pages/CardsPage'
import { ProfilePage } from './pages/ProfilePage'
import { TransactionDetailPage } from './pages/TransactionDetailPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { AIEntryPage } from './pages/AIEntryPage'
import { ReceiptScanFlow } from './pages/ReceiptScanFlow'
import { RecurringBillsPage } from './pages/RecurringBillsPage'
import { SavingsGoalsPage } from './pages/SavingsGoalsPage'
import { SplitsPage } from './pages/SplitsPage'
import { ShareHandlerPage } from './pages/ShareHandlerPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { PageLoader } from './components/ui'
import { useAuth } from './hooks/useAuth'
import { useHousehold } from './hooks/useHousehold'
import { useAppStore } from './store/useAppStore'

function AppRouter() {
  useAuth()  // sets up auth listener
  const { user } = useAppStore()
  const { household, loading } = useHousehold()

  if (loading) return <PageLoader />

  if (!user) {
    return (
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (!household) {
    return (
      <Routes>
        <Route path="/onboarding" element={<HouseholdSetupPage />} />
        <Route path="*"           element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/"                      element={<HomePage />} />
        <Route path="/transactions"          element={<TransactionsPage />} />
        <Route path="/reports"               element={<ReportsPage />} />
        <Route path="/budgets"               element={<BudgetsPage />} />
        <Route path="/cards"                 element={<CardsPage />} />
        <Route path="/profile"               element={<ProfilePage />} />
        <Route path="/transactions/:id"      element={<TransactionDetailPage />} />
        <Route path="/splits"                element={<SplitsPage />} />
        <Route path="/recurring"             element={<RecurringBillsPage />} />
        <Route path="/savings"               element={<SavingsGoalsPage />} />
        <Route path="/share-handler"         element={<ShareHandlerPage />} />
        <Route path="/add/ai-text"           element={<AIEntryPage />} />
        <Route path="/add/ai-receipt"        element={<ReceiptScanFlow />} />
        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
