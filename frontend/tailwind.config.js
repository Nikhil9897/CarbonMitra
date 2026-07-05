/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f1f8f2',
          100: '#ddeedc',
          200: '#bedcbe',
          300: '#94c295',
          400: '#64a165',
          500: '#2E7D32', // Forest Green
          600: '#246227',
          700: '#1d4f20',
          800: '#19411b',
          900: '#153517',
          950: '#0a1d0b',
        },
        secondary: {
          50: '#f4faf4',
          100: '#e5f3e7',
          200: '#cae7cd',
          300: '#a1d4a6',
          400: '#70b977',
          500: '#4CAF50', // Leaf Green
          600: '#3b8e3f',
          700: '#317235',
          800: '#2a5b2d',
          950: '#123014',
        },
        accent: {
          50: '#f7fcf8',
          100: '#eaf7ec',
          200: '#d1edd6',
          300: '#addcb5',
          400: '#81C784', // Nature Green
          500: '#61af65',
          900: '#1a371c',
        },
        skyEco: '#DFF5FF',
        bgEco: '#F8FCF8',
        cardEco: '#FFFFFF',
        borderEco: '#E5F3E7',
        textEco: '#1C2B22',
        successEco: '#43A047',
        highlightEco: '#00C853',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
