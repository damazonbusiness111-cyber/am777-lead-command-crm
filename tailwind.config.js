/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // AM777 CRM revamp — light, professional SaaS palette (source of truth doc, 2026-07-19).
        navy: {
          DEFAULT: '#071A3D',
          soft: '#102A56'
        },
        brand: {
          DEFAULT: '#1F5EFF',
          light: '#EEF4FF',
          dark: '#17439E'
        },
        surface: {
          page: '#F7F9FC',
          card: '#FFFFFF'
        },
        ink: {
          DEFAULT: '#0B1739',
          soft: '#63708A'
        },
        line: '#E3E8F0',
        success: '#159B65',
        warning: '#D97706',
        danger: '#D14343',
        // Legacy dark-theme tokens kept only for any not-yet-migrated surface.
        charcoal: {
          950: '#0a0e16',
          900: '#0d1220',
          800: '#101626',
          700: '#1a2236',
          600: '#242e45'
        }
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 23, 57, 0.04), 0 1px 3px rgba(11, 23, 57, 0.06)',
        popover: '0 12px 32px rgba(11, 23, 57, 0.12)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        brand: '0 0 0 1px rgba(31, 94, 255, 0.25), 0 8px 24px rgba(31, 94, 255, 0.10)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      transitionTimingFunction: {
        // iOS's standard sheet/navigation curve.
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)'
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)'
      }
    }
  },
  plugins: []
};
