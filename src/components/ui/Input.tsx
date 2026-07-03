import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export function Input({ label, error, leftElement, rightElement, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1.5" style={{ color: '#360802' }}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftElement && (
          <span className="absolute left-3 pointer-events-none flex items-center" style={{ color: '#a86157' }}>
            {leftElement}
          </span>
        )}
        <input
          id={inputId}
          className={`input-base ${leftElement ? 'pl-9' : ''} ${rightElement ? 'pr-9' : ''} ${
            error ? '!border-[#fb2d54] focus:!border-[#fb2d54]' : ''
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 flex items-center" style={{ color: '#a86157' }}>
            {rightElement}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs" style={{ color: '#fb2d54' }}>{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1.5" style={{ color: '#360802' }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={`input-base resize-none ${error ? '!border-[#fb2d54]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs" style={{ color: '#fb2d54' }}>{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className = '', id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1.5" style={{ color: '#360802' }}>
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`input-base appearance-none ${error ? '!border-[#fb2d54]' : ''} ${className}`}
        style={{ background: '#ffffff' }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs" style={{ color: '#fb2d54' }}>{error}</p>}
    </div>
  )
}
