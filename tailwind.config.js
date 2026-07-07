/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          '"JetBrains Mono"',
          '"IBM Plex Mono"',
          'monospace'
        ]
      },
      colors: {
        // Nest Design System Palette
        nest: {
          bg: 'var(--nest-bg)',
          surface: 'var(--nest-surface)',
          muted: 'var(--nest-surface-muted)',
          border: 'var(--nest-border)',
          primary: 'var(--nest-text-primary)',
          secondary: 'var(--nest-text-secondary)',
          tertiary: 'var(--nest-text-tertiary)',
          lime: {
            DEFAULT: 'var(--nest-accent-lime)',
            text: 'var(--nest-accent-lime-text)',
          }
        },

        // Semantic and Interactive colors
        income: 'var(--income)',
        expense: 'var(--expense)',
        warning: 'var(--warning)',

        // Re-map old theme color names to avoid breaks where they're hardcoded
        coral: {
          DEFAULT: 'var(--nest-accent-lime)', // map default interactive color to lime
          text: 'var(--nest-accent-lime-text)',
          500: 'var(--nest-accent-lime)',
        },

        // Category colors
        cat: {
          groceries: 'var(--nest-cat-groceries)',
          subs: 'var(--nest-cat-subs)',
          dining: 'var(--nest-cat-dining)',
          transport: 'var(--nest-cat-transport)',
          shopping: 'var(--nest-cat-shopping)',
          bills: 'var(--nest-cat-bills)',
          // Fallback configs for older files
          food: { bg: 'rgba(242,166,90,0.12)', icon: 'var(--nest-cat-dining)' },
          rent: { bg: 'rgba(124,140,245,0.12)', icon: 'var(--nest-cat-subs)' },
          utilities: { bg: 'rgba(199,165,242,0.12)', icon: 'var(--nest-cat-bills)' },
          entertainment: { bg: 'rgba(242,135,154,0.12)', icon: 'var(--nest-cat-shopping)' },
          health: { bg: 'rgba(139,197,63,0.12)', icon: 'var(--nest-cat-groceries)' },
          travel: { bg: 'rgba(90,200,216,0.12)', icon: 'var(--nest-cat-transport)' },
          personal: { bg: 'rgba(242,135,154,0.12)', icon: 'var(--nest-cat-shopping)' },
          other: { bg: 'var(--nest-surface-muted)', icon: 'var(--nest-text-secondary)' },
        }
      },

      // Nest spacing variables
      spacing: {
        space1: 'var(--space-1)',
        space2: 'var(--space-2)',
        space3: 'var(--space-3)',
        space4: 'var(--space-4)',
        space6: 'var(--space-6)',
        space8: 'var(--space-8)',
        sidebar: 'var(--sidebar-w)',
      },

      // Nest border radii
      borderRadius: {
        xs: '4px',
        sm: 'var(--radius-sm)',   // 12px
        md: 'var(--radius-md)',   // 20px
        lg: 'var(--radius-lg)',   // 24px
        pill: 'var(--radius-pill)', // 999px
        card: 'var(--radius-lg)',
        input: 'var(--radius-sm)',
        btn: 'var(--radius-sm)',
      },

      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        fab: 'var(--shadow-fab)',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
