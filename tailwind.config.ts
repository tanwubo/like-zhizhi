import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fff6f7",
          100: "#ffe7eb",
          500: "#f45d7a",
          700: "#c73155"
        },
        ink: "#251f24"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(199, 49, 85, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
