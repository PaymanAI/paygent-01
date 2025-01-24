import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        payman: {
          primary: '#FF7D61',
          secondary: '#FFD4A6',
          neutral: '#E6E6E6',
          dark: '#121212',
        }
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
