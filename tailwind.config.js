/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'urban-blue': '#003399',
        'urban-dark': '#0f172a',
      }
    },
  },
  plugins: [],
}