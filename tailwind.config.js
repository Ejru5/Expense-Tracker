/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Inter',
          'sans-serif'
        ],
      },
      colors: {
        // ── Apple Action Blue Interactive Palette ──────────────────────
        coral: {
          DEFAULT: 'var(--color-coral-flame)',
          50:  '#f5faff',
          100: '#e0f0ff',
          200: '#bce2ff',
          300: '#84c5ff',
          400: '#40a2ff',
          500: '#0066cc',   // Action Blue primary
          600: '#0055b3',
          700: '#004099',
          800: '#003080',
          900: '#002566',
        },
        brandwood: {
          DEFAULT: 'var(--color-brandwood)',
          light:   '#333333',
        },

        // ── Functional accent colors ──────────────────────────────────
        mint:    '#34c771',   // Emerald
        cobalt:  '#477ee9',   // Cobalt
        magenta: '#fb2d54',   // Crimson

        // ── Apple Surface system ───────────────────────────────────────
        surface: {
          DEFAULT:    'var(--surface)',
          warm:       'var(--surface-subtle)', // Canvas Parchment
          blush:      'var(--surface-muted)',  // Pearl Button bg
          hero:       'var(--color-coral-flame)',
        },

        // ── Apple Text system ──────────────────────────────────────────
        ink: {
          DEFAULT:   'var(--text-primary)',   // Near-black Ink
          secondary: 'var(--text-secondary)', // Soft Ink
          muted:     'var(--text-muted)',     // Hairline Muted
          inverse:   '#ffffff',
        },

        // ── Semantic amounts ──────────────────────────────────────────
        income:  '#34c771',
        expense: '#fb2d54',
        warning: '#f59e0b',

        // Category pastel chips
        cat: {
          food:      { bg: '#fef3c7', icon: '#d97706' },
          transport: { bg: '#dbeafe', icon: '#2563eb' },
          rent:      { bg: '#d1fae5', icon: '#059669' },
          utilities: { bg: '#e0e7ff', icon: '#4f46e5' },
          entertainment: { bg: '#fce7f3', icon: '#db2777' },
          health:    { bg: '#ccfbf1', icon: '#0d9488' },
          shopping:  { bg: '#fae8ff', icon: '#9333ea' },
          groceries: { bg: '#fef9c3', icon: '#ca8a04' },
          travel:    { bg: '#e0f2fe', icon: '#0284c7' },
          education: { bg: '#ede9fe', icon: '#7c3aed' },
          personal:  { bg: '#ffe4e6', icon: '#e11d48' },
          other:     { bg: '#f1f5f9', icon: '#64748b' },
        },
      },

      // ── Apple Spacing System ────────────────────────────────────────
      spacing: {
        xxs:     'var(--space-xxs)',     // 4px
        xs:      'var(--space-xs)',      // 8px
        sm:      'var(--space-sm)',      // 12px
        md:      'var(--space-md)',      // 17px
        lg:      'var(--space-lg)',      // 24px
        xl:      'var(--space-xl)',      // 32px
        xxl:     'var(--space-xxl)',     // 48px
        section: 'var(--space-section)', // 80px
      },

      // ── Apple Border Radius Scale ──────────────────────────────────
      borderRadius: {
        xs:   'var(--radius-xs)',        // 5px
        sm:   'var(--radius-sm)',        // 8px
        md:   'var(--radius-md)',        // 11px
        lg:   'var(--radius-lg)',        // 18px
        pill: 'var(--radius-pill)',      // 9999px
        
        // Match old definitions to preserve code compat
        'card':        'var(--radius-lg)',
        'card-lg':     'var(--radius-lg)',
        'action-tile': 'var(--radius-md)',
        'link':        'var(--radius-sm)',
        'input':       'var(--radius-md)',
        'btn':         'var(--radius-pill)',
        'pill-lg':     'var(--radius-pill)',
      },

      boxShadow: {
        // Soften shadows under Apple's minimal aesthetic
        'coral-lg':  'none',
        'coral-pill':'none',
        'card':      'none',
        'card-hover':'none',
        'modal':     'var(--shadow-modal)',
        'fab':       'var(--shadow-fab)',
      },

      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        slideDown: { from: { transform: 'translateY(-10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn:   { from: { transform: 'scale(0.95)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
}
