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
        ivory: '#FAF9F5',
        cream: '#F5F3EC',
        stone: '#E6E2D9',
        charcoal: '#232323',
        'warm-gray': '#6E6E6E',
        green: {
          bottle: '#2F5D50',
          forest: '#5F7D67',
          olive: '#7E9B63',
          moss: '#6FAF76',
          sage: '#A7C4A0',
        },
        yellow: {
          butter: '#F6D97A',
          honey: '#F2C75C',
          champagne: '#F8E8B5',
        },
        mustard: '#D6A437',
        terracotta: '#D97A64',
        // Semantic aliases used across the app
        bg: {
          DEFAULT: '#FAF9F5',
          secondary: '#F5F3EC',
          hover: '#F0EEE6',
        },
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#E6E2D9',
          soft: '#EFEBE3',
        },
        text: {
          DEFAULT: '#232323',
          secondary: '#6E6E6E',
          muted: '#8A8A8A',
          disabled: '#B8B5AD',
        },
        accent: {
          DEFAULT: '#2F5D50',
          soft: '#5F7D67',
        },
        // Legacy aliases (map old mono tokens → new palette)
        ink: {
          DEFAULT: '#232323',
          soft: '#2F5D50',
          muted: '#6E6E6E',
          faint: '#8A8A8A',
        },
        canvas: '#FAF9F5',
        line: '#E6E2D9',
        danger: '#D97A64',
        brand: {
          navy: '#232323',
          'navy-light': '#2F5D50',
          primary: '#2F5D50',
          'primary-hover': '#264A41',
          accent: '#F6D97A',
          'accent-hover': '#F2C75C',
          success: '#6FAF76',
          warning: '#D6A437',
          danger: '#D97A64',
          bg: '#FAF9F5',
          card: '#FFFFFF',
          darkBg: '#1F2A26',
          darkCard: '#2A3833',
          darkBorder: '#3A4A44',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Sans"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(35, 35, 35, 0.04)',
        card: '0 1px 2px rgba(35, 35, 35, 0.03), 0 10px 28px -14px rgba(47, 93, 80, 0.12)',
        elev: '0 16px 40px -20px rgba(47, 93, 80, 0.18)',
        glass: '0 18px 48px -22px rgba(35, 35, 35, 0.14)',
        glow: '0 0 0 1px rgba(47, 93, 80, 0.06)',
        focus: '0 0 0 3px rgba(47, 93, 80, 0.14)',
        yellow: '0 8px 24px -10px rgba(246, 217, 122, 0.55)',
      },
      transitionDuration: {
        DEFAULT: '220ms',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(248, 232, 181, 0.55), transparent 60%)',
        'green-soft': 'linear-gradient(135deg, #2F5D50 0%, #5F7D67 100%)',
        'yellow-soft': 'linear-gradient(135deg, #F6D97A 0%, #F8E8B5 100%)',
        'ivory-cream': 'linear-gradient(180deg, #FAF9F5 0%, #F5F3EC 100%)',
      },
    },
  },
  plugins: [],
}
