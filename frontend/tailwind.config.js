/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#000000",
          light: "#1a1a1a",
          dark: "#000000",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F4E5B5",
          dark: "#B8941E",
        },
        glass: {
          dark: "rgba(0, 0, 0, 0.7)",
          darker: "rgba(0, 0, 0, 0.85)",
          light: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans Condensed'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
