/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        popcorn: {
          DEFAULT: '#fbbf24',
        },
        ink: {
          100: '#f8fafc',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
      },
      fontFamily: {
        sans: ['Funnel Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
