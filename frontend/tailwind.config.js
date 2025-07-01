/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        golden: "#FFD700",
        silver: "#C0C0C0",
        "dark-gray": "#1e1e1e",
        "darker-gray": "#2a2a2a",
        "green-indicator": "#00FF00",
        "red-indicator": "#FF0000",
      },
    },
  },
  plugins: [],
}
