import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary, #0ea5e9)",
        secondary: "var(--color-secondary, #64748b)",
        accent: "var(--color-accent, #f59e0b)",
      },
    },
  },
  plugins: [],
} satisfies Config;
