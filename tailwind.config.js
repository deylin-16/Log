/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'quemado': '#2c1a12',
        'vintage': '#f4e4bc',
      },
      boxShadow: {
        'fuego': '0 0 20px #ff4500, inset 0 0 40px #000',
      }
    },
  },
  plugins: [],
}
