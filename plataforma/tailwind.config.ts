import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "var(--color-primary)", hover: "var(--color-primary-hover)" },
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        "streaming-bg": "var(--color-bg)",
        "streaming-bg-elevated": "var(--color-bg-elevated)",
        "streaming-bg-card": "var(--color-bg-card)",
        "streaming-text": "var(--color-text)",
        "streaming-muted": "var(--color-text-muted)",
        "streaming-border": "var(--color-border)",
        rua: {
          dark: "var(--rua-dark)", slate: "var(--rua-slate)", cream: "var(--rua-cream)",
          sky: "var(--rua-sky)", red: "var(--rua-red)", pale: "var(--rua-pale)",
          green: "var(--rua-green)", orange: "var(--rua-orange)", "bg-guide": "var(--rua-bg-guide)",
        },
        "kids-yellow": "var(--kids-yellow)", "kids-lime": "var(--kids-lime)", "kids-green": "var(--kids-green)",
        "kids-orange": "var(--kids-orange)", "kids-pink": "var(--kids-pink)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        kalitha: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
