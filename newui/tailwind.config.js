/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#849b5c",
        background: "#fbfaf1",
        surface: "#ffffff",
        muted: "#e4e3db",
        ink: "#1b1c17",
      },
      maxWidth: {
        container: "1440px",
      },
    },
  },
  plugins: [],
};
