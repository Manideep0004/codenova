/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0d1117',
        darker: '#010409',
        primary: '#58a6ff'
      }
    },
  },
  plugins: [],
}
