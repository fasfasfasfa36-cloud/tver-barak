/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // или 'media', если хочешь по системным настройкам
  theme: {
    extend: {
      // Цвета под твой стиль (тёмный градиент, акценты)
      colors: {
        'market-black': '#0a0a0a',
        'market-dark': '#111111',
        'market-gray': '#1a1a1a',
        'market-green': {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        'market-blue': {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        'market-purple': {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
        'market-pink': {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        'market-yellow': {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },

      // Градиенты (уже используются в твоём коде)
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'market-dark-gradient': 'linear-gradient(to bottom right, #0f0f0f, #000000, #0f0f0f)',
        'market-green-gradient': 'linear-gradient(to right, #16a34a, #22c55e)',
        'market-purple-gradient': 'linear-gradient(to right, #9333ea, #a855f7)',
      },

      // Кастомные шрифты (если подключишь Google Fonts или локальные)
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'system-ui', 'sans-serif'],
      },

      // Анимации (для pulse, bounce и т.д. уже используются)
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fadeIn': 'fadeIn 0.4s ease-out forwards',
        'scaleIn': 'scaleIn 0.3s ease-out forwards',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // Box shadows под модалки и карточки
      boxShadow: {
        'market-card': '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        'market-glow-green': '0 0 20px 5px rgba(34, 197, 94, 0.3)',
        'market-glow-purple': '0 0 20px 5px rgba(168, 85, 247, 0.3)',
      },

      // Border radius (rounded-3xl и т.д. уже есть, но можно расширить)
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Переходы (transition-all уже много, но можно усилить)
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },

  plugins: [
    // Плагин для форм (если используешь input, select и т.д.)
    require('@tailwindcss/forms'),

    // Плагин для aspect-ratio (если нужны квадратные фото и т.д.)
    require('@tailwindcss/aspect-ratio'),

    // Плагин для typography (если будешь делать красивые описания)
    // require('@tailwindcss/typography'),
  ],
}
