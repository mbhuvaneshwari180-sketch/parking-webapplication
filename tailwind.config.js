/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7', // Primary smart-city blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        slot: {
          available: '#10b981', // Emerald green
          occupied: '#ef4444',  // Rose red
          reserved: '#f59e0b',  // Amber orange
          maintenance: '#64748b', // Slate gray
        },
        master: {
          bg: '#090d16',
          card: '#0f172a',
          accent: '#8b5cf6', // Super-admin purple
          glow: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(2, 132, 199, 0.4)',
        'glow-master': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
      },
    },
  },
  plugins: [],
};
