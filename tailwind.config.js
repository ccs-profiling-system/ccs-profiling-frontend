/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(234 88 12)',
          dark: 'rgb(194 65 12)',
        },
        secondary: 'rgb(239 68 68)',
      },
    },
  },
  plugins: [],
}
