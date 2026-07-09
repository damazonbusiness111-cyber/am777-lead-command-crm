/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Matched to the AM777 brand tokens live on the onboarding gateway
        // and product knowledge hub, for cross-property consistency.
        charcoal: {
          950: '#0a0e16',
          900: '#0d1220',
          800: '#101626',
          700: '#1a2236',
          600: '#242e45'
        },
        brand: {
          DEFAULT: '#459dfb',
          light: '#74b4fb',
          dark: '#1461c7'
        }
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        brand: '0 0 0 1px rgba(69, 157, 251, 0.25), 0 8px 24px rgba(69, 157, 251, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
