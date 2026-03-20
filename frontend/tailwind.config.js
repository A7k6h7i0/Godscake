/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./context/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff4ed",
          100: "#ffe6da",
          200: "#ffd0bd",
          300: "#ffb299",
          400: "#ff8a6a",
          500: "#f05a3d",
          600: "#de442b",
          700: "#b53420",
          800: "#8d2a1d",
          900: "#6f231b",
        },
        ink: "#2a1d16",
        cocoa: "#4b3429",
        muted: "#6f5a4d",
        cream: "#fff6ef",
        almond: "#f6e8de",
        forest: "#2d7a5d",
        'z-red': '#e23744',
        'z-red-dark': '#c62835',
        'z-bg': '#fff8f6',
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 20px 60px -35px rgba(42, 29, 22, 0.5)",
        lift: "0 16px 40px -24px rgba(42, 29, 22, 0.45)",
        glow: "0 12px 30px -12px rgba(240, 90, 61, 0.45)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at 10% 20%, rgba(240, 90, 61, 0.18) 0, transparent 45%), radial-gradient(circle at 85% 10%, rgba(255, 178, 153, 0.35) 0, transparent 40%), radial-gradient(circle at 85% 90%, rgba(45, 122, 93, 0.16) 0, transparent 45%)",
      },
    },
  },
  plugins: [],
};
