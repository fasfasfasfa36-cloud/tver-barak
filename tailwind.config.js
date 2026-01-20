/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  // <-- Добавь эту строку (или 'media' если хочешь по системной теме)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}