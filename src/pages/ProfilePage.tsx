import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAppStore } from '../store/useAppStore'
import { useHousehold } from '../hooks/useHousehold'
import { useTransactions } from '../hooks/useTransactions'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Copy, LogOut, Users, Home, Moon, Sun, Key, Download, Plus, Trash2, Check } from 'lucide-react'
import { exportToCSV } from '../lib/export'
import { DEFAULT_CATEGORIES, type Category } from '../types'
import { Modal } from '../components/ui/BottomSheet'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { household, darkMode, toggleDarkMode, categories, setCategories } = useAppStore()
  const { transactions } = useTransactions()

  const [copied, setCopied] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('mistral_api_key') || '')
  const [keySaved, setKeySaved] = useState(false)
  
  // Custom Category State
  const [showAddCat, setShowAddCat] = useState(false)
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('📦')

  function copyCode() {
    if (!household?.inviteCode) return
    navigator.clipboard.writeText(household.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSaveKey(e: React.FormEvent) {
    e.preventDefault()
    if (apiKey.trim()) {
      localStorage.setItem('mistral_api_key', apiKey.trim())
    } else {
      localStorage.removeItem('mistral_api_key')
    }
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  function handleExport() {
    exportToCSV(transactions, categories)
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!catName.trim()) return

    const newId = `custom-${Date.now()}`
    const newCat: Category = {
      id: newId,
      name: catName.trim(),
      icon: catIcon,
      color: '#64748b', // standard slate for custom
      bgColor: '#f1f5f9',
    }

    setCategories([...categories, newCat])
    setCatName('')
    setShowAddCat(false)
  }

  function handleDeleteCategory(id: string) {
    // Don't let users delete base 'other' category
    if (id === 'other') return
    setCategories(categories.filter(c => c.id !== id))
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-6 animate-fade-in max-w-2xl lg:max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column (Details & Configurations) */}
        <div className="lg:col-span-3 space-y-5">
          {/* User Info */}
          <div className="card flex items-center gap-4 hover-lift transition-card">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ 
                background: 'linear-gradient(135deg, #f8a4a4 0%, #f73b20 100%)', 
                boxShadow: 'var(--shadow-coral)' 
              }}
            >
              <span className="text-white text-2xl font-bold">
                {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{user?.displayName ?? 'User'}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>

          {/* Preferences / Settings */}
          <div className="card space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Settings & Tools</h3>
            
            {/* Dark Mode */}
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Theme Preference</span>
              <button
                onClick={toggleDarkMode}
                className="btn-secondary !p-2.5 !rounded-xl flex items-center gap-1.5 text-xs font-bold"
              >
                {darkMode ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} />}
                {darkMode ? 'Light Theme' : 'Dark Theme'}
              </button>
            </div>

            {/* CSV Export */}
            <div className="flex justify-between items-center py-1 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>Export History</span>
              <button
                onClick={handleExport}
                className="btn-secondary !p-2.5 !rounded-xl flex items-center gap-1.5 text-xs font-bold"
              >
                <Download size={14} /> Download CSV
              </button>
            </div>
          </div>

          {/* Mistral AI Configuration */}
          <div className="card space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>AI Configuration</h3>
            <form onSubmit={handleSaveKey} className="space-y-3">
              <Input
                id="mistral-key"
                label="Mistral API Key"
                type="password"
                placeholder="Paste your key here (stored locally)"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                leftElement={<Key size={14} />}
              />
              <Button type="submit" size="sm" fullWidth>
                {keySaved ? 'Saved! ✓' : 'Save Key'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column (Household & Categories) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Household Info */}
          {household && (
            <div className="card space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Household Details</h3>
              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                <Home size={16} style={{ color: 'var(--color-coral-flame)' }} />
                {household.name}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Members</p>
                <div className="space-y-1.5">
                  {Object.entries(household.memberNames).map(([uid, name]) => (
                    <div key={uid} className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      <Users size={12} className="text-slate-400" />
                      <span>{name}</span>
                      {uid === user?.uid && (
                        <span 
                          className="rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ml-1"
                          style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)', color: 'var(--color-coral-flame)' }}
                        >
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Invite Code */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Invite Code</p>
                <div className="flex items-center gap-3">
                  <span 
                    className="font-mono font-bold text-lg tracking-widest rounded-xl px-4 py-1.5 border"
                    style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {household.inviteCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="btn-secondary !py-2 !px-3 flex items-center gap-1.5 text-xs font-bold"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Category Management */}
          <div className="card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Categories</h3>
              <button
                onClick={() => setShowAddCat(true)}
                className="text-xs font-bold hover:underline flex items-center gap-0.5"
                style={{ color: 'var(--color-coral-flame)' }}
              >
                <Plus size={12} /> Add Custom
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center text-xs py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-secondary)' }}>
                    <span 
                      className="w-7 h-7 rounded-lg flex items-center justify-center border" 
                      style={{ backgroundColor: cat.bgColor, borderColor: 'rgba(54, 8, 2, 0.05)' }}
                    >
                      {cat.icon}
                    </span>
                    {cat.name}
                  </span>
                  
                  {cat.id !== 'other' && !DEFAULT_CATEGORIES.some(c => c.id === cat.id) && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Sign Out Action Button */}
      <div className="pt-6">
        <Button
          id="signout-btn"
          variant="secondary"
          fullWidth
          leftIcon={<LogOut size={16} />}
          onClick={logout}
          className="text-rose-500 !border-rose-200 !bg-rose-50 dark:!bg-rose-950/20 dark:!border-rose-900/50 hover:!bg-rose-100/50"
        >
          Sign Out
        </Button>
      </div>

      {/* Add Custom Category Modal */}
      <Modal open={showAddCat} onClose={() => setShowAddCat(false)} title="Add Custom Category">
        <form onSubmit={handleAddCategory} className="space-y-4 py-2">
          <Input
            id="cat-name"
            label="Category Name"
            placeholder="e.g. Pet Care, Subscriptions..."
            value={catName}
            onChange={e => setCatName(e.target.value)}
            required
          />
          <Input
            id="cat-icon"
            label="Emoji Icon"
            placeholder="🐕"
            value={catIcon}
            onChange={e => setCatIcon(e.target.value)}
            maxLength={2}
            required
          />
          <Button type="submit" fullWidth leftIcon={<Check size={16} />}>Add Category</Button>
        </form>
      </Modal>
    </div>
  )
}
export default ProfilePage
