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
        obsidian: {
          950: '#07090E', // deepest void
          900: '#0B0F17', // canvas background
          850: '#101623', // elevated cards
          800: '#161F30', // borders / card hover
          700: '#222F46', // subtle accents
          600: '#324463', // muted elements
        },
        slate: {
          850: '#151E2E',
          900: '#0F172A',
          950: '#020617',
        },
        shield: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981', // emerald green shield
          600: '#059669',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        rose: {
          500: '#F43F5E',
          600: '#E11D48',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'shield-glow': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'danger-glow': '0 0 25px -5px rgba(244, 63, 94, 0.25)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
