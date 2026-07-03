import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav, Sidebar } from './Navigation'
import { AddTransactionSheet } from '../transactions/AddTransactionSheet'
import { useAppStore } from '../../store/useAppStore'
import { WifiOff } from 'lucide-react'

export function AppShell() {
  const { addSheetOpen, setAddSheetOpen } = useAppStore()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOnline  = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <div className="min-h-dvh bg-white dark:bg-[var(--surface)]">
      {/* Offline banner */}
      {isOffline && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 sticky top-0 z-50 animate-fade-in"
          style={{ background: 'var(--color-coral-flame)', boxShadow: 'var(--shadow-fab)' }}
        >
          <WifiOff size={14} />
          <span>You are currently offline. Changes will sync once connected.</span>
        </div>
      )}

      {/* Desktop sidebar */}
      <Sidebar onAddPress={() => setAddSheetOpen(true)} />

      {/* Main content area */}
      <main
        className="lg:pl-[var(--sidebar-w)] min-h-dvh"
      >
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav onAddPress={() => setAddSheetOpen(true)} />

      {/* Global Add Transaction Bottom Sheet */}
      <AddTransactionSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
      />
    </div>
  )
}
