/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // For projects using Expo Router
    "./components/**/*.{js,jsx,ts,tsx}",
    // Add other paths here if you have different folder structures (e.g., "./src/**/*.{js,jsx,ts,tsx}")
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
