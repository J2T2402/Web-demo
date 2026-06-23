/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Be Vietnam Pro"',
          '"Segoe UI"',
          'system-ui',
          '-apple-system',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        avail: '#10b981',
        owned: '#94a3b8',
        mine: '#f59e0b',
        vietnam: {
          red: '#da251d',      // Đỏ cờ Tổ quốc chuẩn
          redLight: '#ff4d4d', // Đỏ sáng trẻ trung
          yellow: '#ffff00',   // Vàng ngôi sao chuẩn
          gold: '#ffb300',     // Vàng hoàng kim ấm áp
          goldLight: '#ffe082',
        },
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 23, 42, 0.25)',
        panel: '0 24px 60px -20px rgba(15, 23, 42, 0.35)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
