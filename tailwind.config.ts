import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5fbff",
          100: "#e1f1ff",
          200: "#b9dfff",
          300: "#7ec0ff",
          400: "#4fa2ff",
          500: "#1f79ff",
          600: "#135fee",
          700: "#0e47c2",
          800: "#0f3a96",
          900: "#0f326f"
        }
      }
    }
  },
  plugins: []
};

export default config;
