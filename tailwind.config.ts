import type { Config } from "tailwindcss";

// Components style themselves from the tokens in app/globals.css; these names expose the same tokens to utilities.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        raised: "var(--paper-raised)",
        ink: "var(--ink)",
        muted: "var(--ink-2)",
        line: "var(--rule)",
        gain: "var(--gain)",
        loss: "var(--loss)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
