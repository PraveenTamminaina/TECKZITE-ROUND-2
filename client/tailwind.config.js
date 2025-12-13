/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teckzite: {
          dark: '#0f172a',
          primary: '#3b82f6',
          accent: '#8b5cf6',
          danger: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b'
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
