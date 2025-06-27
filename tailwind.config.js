/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeOut: 'fadeOut 1s ease-out forwards',
      },
      keyframes: {
        fadeOut: {
          '0%': {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '100%': {
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(1.3)',
          },
        },
      },
    },
  },
  plugins: [],
}

