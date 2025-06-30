import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ★★★ アプリの基本フォントを 'DotGothic16' に変更 ★★★
        sans: [
          'DotGothic16',
          ...defaultTheme.fontFamily.sans,
        ],
      },
    },
  },
  plugins: [],
}