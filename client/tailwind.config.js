/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f97316",   // warm orange - "adoption" brand color
        dark: "#1f2937",
      },
    },
  },
  plugins: [],
};
