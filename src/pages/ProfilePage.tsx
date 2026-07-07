import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAppStore } from '../store/useAppStore'
import { useHousehold } from '../hooks/useHousehold'
import { useTransactions } from '../hooks/useTransactions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
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
      color: '#64748b',
      bgColor: '#f1f5f9',
    }

    setCategories([...categories, newCat])
    setCatName('')
    setShowAddCat(false)
  }

  function handleDeleteCategory(id: string) {
    if (id === 'other') return
    setCategories(categories.filter(c => c.id !== id))
  }

  const getFlatColor = (catId: string, defaultColor: string) => {
    const specColors: Record<string, string> = {
      'groceries': 'var(--nest-cat-groceries)',
      'subscriptions': 'var(--nest-cat-subs)',
      'dining': 'var(--nest-cat-dining)',
      'transport': 'var(--nest-cat-transport)',
      'shopping': 'var(--nest-cat-shopping)',
      'bills': 'var(--nest-cat-bills)',
    }
    const key = Object.keys(specColors).find(k => catId.toLowerCase().includes(k))
    return key ? specColors[key] : defaultColor
  }

  return (
    <div className="page-content px-4 lg:px-8 pt-6 animate-fade-in max-w-2xl lg:max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6 text-nest-primary">Profile Settings</h1>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column - Bento Layout */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* User Info */}
            <div className="card flex items-center gap-4 hover-lift transition-card md:col-span-2">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-nest-accent-lime border border-nest-border"
              >
                <span className="text-nest-accent-lime-text text-2xl font-bold">
                  {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <p className="font-bold text-base text-nest-primary">{user?.displayName ?? 'User'}</p>
                <p className="text-sm text-nest-secondary">{user?.email}</p>
              </div>
            </div>

            {/* Preferences / Settings */}
            <div className="card space-y-4 flex flex-col justify-between">
              <h3 className="section-title">Settings & Tools</h3>
              
              {/* Dark Mode */}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-bold text-nest-secondary">Theme</span>
                <button
                  onClick={toggleDarkMode}
                  className="btn-secondary !p-2.5 !rounded-xl flex items-center gap-1.5 text-xs font-bold"
                >
                  {darkMode ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} />}
                  {darkMode ? 'Light' : 'Dark'}
                </button>
              </div>

              {/* CSV Export */}
              <div className="flex justify-between items-center py-1 border-t border-nest-border pt-3 mt-auto">
                <span className="text-sm font-bold text-nest-secondary">History</span>
                <button
                  onClick={handleExport}
                  className="btn-secondary !p-2.5 !rounded-xl flex items-center gap-1.5 text-xs font-bold"
                >
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>

            {/* Mistral AI Configuration */}
            <div className="card space-y-4">
              <h3 className="section-title">AI Assistant</h3>
              <form onSubmit={handleSaveKey} className="space-y-3">
                <Input
                  id="mistral-key"
                  label="Mistral API Key"
                  type="password"
                  placeholder="Local key..."
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
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Household Info */}
          {household && (
            <div className="card space-y-4">
              <h3 className="section-title">Household Details</h3>
              <div className="flex items-center gap-2 font-bold text-sm text-nest-primary">
                <Home size={16} className="text-nest-cat-groceries" />
                {household.name}
              </div>
              <div>
                <p className="section-title mb-1.5">Members</p>
                <div className="space-y-1.5">
                  {Object.entries(household.memberNames).map(([uid, name]) => (
                    <div key={uid} className="flex items-center gap-2 text-xs font-semibold text-nest-secondary">
                      <Users size={12} className="text-nest-tertiary" />
                      <span>{name}</span>
                      {uid === user?.uid && (
                        <span 
                          className="rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ml-1 bg-nest-accent-lime text-nest-accent-lime-text border border-nest-border"
                        >
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Invite Code */}
              <div className="pt-2 border-t border-nest-border">
                <p className="section-title mb-2">Invite Code</p>
                <div className="flex items-center gap-3">
                  <span 
                    className="font-mono font-bold text-lg tracking-widest rounded-xl px-4 py-1.5 border border-nest-border bg-nest-surface-muted text-nest-primary"
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
              <h3 className="section-title">Categories</h3>
              <button
                onClick={() => setShowAddCat(true)}
                className="text-xs font-bold hover:underline flex items-center gap-0.5 text-nest-cat-groceries"
              >
                <Plus size={12} /> Add Custom
              </button>
            </div>

            <div className="max-h-56 lg:max-h-[320px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {categories.map(cat => {
                const dotColor = getFlatColor(cat.id, cat.color)
                return (
                  <div key={cat.id} className="flex justify-between items-center text-xs py-1.5 border-b border-nest-border">
                    <span className="flex items-center gap-2 font-bold text-nest-secondary">
                      <span 
                        className="w-7 h-7 rounded-full flex items-center justify-center border" 
                        style={{ backgroundColor: `${dotColor}12`, borderColor: `${dotColor}25`, color: dotColor }}
                      >
                        {cat.icon || '💰'}
                      </span>
                      {cat.name}
                    </span>
                    
                    {cat.id !== 'other' && !DEFAULT_CATEGORIES.some(c => c.id === cat.id) && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-nest-tertiary hover:text-rose-500 transition-colors p-1"
                        title="Delete Category"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )
              })}
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
          className="text-rose-600 !border-rose-200 !bg-rose-50 hover:!bg-rose-100/50"
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
