/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        'vintage': '#f4e4bc',
      },
      boxShadow: {
        'fuego': '0 0 20px #ff4500, inset 0 0 40px #000',
      }
    },
  },
  plugins: [],
}
