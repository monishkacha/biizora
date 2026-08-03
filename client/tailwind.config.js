/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F172A',
          'navy-light': '#1E293B',
          primary: '#1D4ED8', // Executive Royal Navy Blue
          'primary-hover': '#1E40AF',
          accent: '#059669', // Financial Emerald Green
          'accent-hover': '#047857',
          success: '#10B981', // Profit & Income Green
          warning: '#D97706', // Corporate Amber Gold
          danger: '#DC2626', // Executive Crimson
          bg: '#F8FAFC',
          card: '#FFFFFF',
          darkBg: '#090D16',
          darkCard: '#1E293B',
          darkBorder: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
        'glow': '0 0 20px rgba(29, 78, 216, 0.2)'
      }
    },
  },
  plugins: [],
}
