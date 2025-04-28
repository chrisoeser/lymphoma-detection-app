/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce': 'bounce 1s infinite',
        'progress': 'progress-fill 5s ease-out forwards'
      },
      keyframes: {
        'bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      },
      // Add support for filters
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      filter: {
        'none': 'none',
        'grayscale': 'grayscale(100%)',
        'contrast': 'contrast(140%) brightness(110%)',
        'blur': 'blur(1px) saturate(120%)',
        'hue-rotate': 'hue-rotate(40deg) saturate(150%)',
      },
      transitionProperty: {
        'filter': 'filter',
      },
    },
  },
  plugins: [],
}