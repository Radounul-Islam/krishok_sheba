/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f3f7ee",
          100: "#e5efdd",
          500: "#639343",
          600: "#4d7832",
          700: "#315923",
          800: "#1e4020",
        },
        ink: "#26332b",
      },
      fontFamily: { sans: ["DM Sans", "Hind Siliguri", "sans-serif"] },
      boxShadow: { soft: "0 12px 36px rgba(36, 56, 34, .07)" },
    },
  },
  plugins: [],
};
