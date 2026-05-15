import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marine: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#1e3a8a",
          600: "#1e40af",
          700: "#1d4ed8",
          900: "#0b1d4f",
        },
        accent: {
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
