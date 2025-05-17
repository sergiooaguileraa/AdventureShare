// tailwind.config.js
module.exports = {
  content: [
    "./public/index.html",           // ← Añádelo
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#F97316",
        accent: "#10B981",
        surface: "#F3F4F6",
      },
      fontFamily: {
        heading: ["Raleway", "sans-serif"],
        body:    ["Inter",   "sans-serif"],
      },
      backgroundImage: {
        hero: "url('/images/hero-adventure.png')",
      },
    },
  },
  plugins: [],
}

