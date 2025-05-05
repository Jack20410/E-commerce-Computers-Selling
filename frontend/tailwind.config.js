/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tech-blue': {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bbd8fd',
          300: '#84bbfa',
          400: '#4596f5',
          500: '#1976ef',
          600: '#0c58e0',
          700: '#0c45bc',
          800: '#113a8f',
          900: '#143471',
          950: '#0f2249',
        },
        'tech-dark': {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#afb9c8',
          400: '#8392aa',
          500: '#63738f',
          600: '#4e5b75',
          700: '#404a60',
          800: '#374051',
          900: '#1f2333',
          950: '#111827',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'tech': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'tech-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
} 