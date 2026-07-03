import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useAppStore } from './store/useAppStore'

// Apply persisted dark mode on startup before first render
const darkMode = JSON.parse(localStorage.getItem('expense-tracker-store') ?? '{}')?.state?.darkMode
if (darkMode) document.documentElement.classList.add('dark')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
