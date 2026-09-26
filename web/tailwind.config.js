/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1F3864",
        teal: "#0F766E",
      },
      fontFamily: {
        // Tipografía corporativa y formal
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        display: ['Arial Black', 'Impact', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};