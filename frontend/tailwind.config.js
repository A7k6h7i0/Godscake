/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./context/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f5",
          100: "#ffe7dc",
          500: "#ef5d36",
          700: "#b83d1d",
        },
      },
    },
  },
  plugins: [],
};
