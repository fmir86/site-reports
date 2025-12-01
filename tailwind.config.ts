import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{scss,css}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#0070f3",
          600: "#0070f3",
          700: "#0051a2",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Next.js inspired dark palette
        dark: {
          bg: "#000000",
          "bg-secondary": "#0a0a0a",
          "bg-tertiary": "#111111",
          "bg-elevated": "#1a1a1a",
          border: "#222222",
          "border-light": "#333333",
          text: "#ededed",
          "text-muted": "#888888",
          "text-dimmed": "#666666",
        },
      },
      backgroundColor: {
        card: "#111111",
        "card-hover": "#1a1a1a",
      },
      borderColor: {
        DEFAULT: "#222222",
      },
    },
  },
  plugins: [],
};

export default config;
