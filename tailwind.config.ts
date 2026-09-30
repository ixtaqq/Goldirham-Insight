import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f7f9f6",
        surface: "#ffffff",
        line: "#e1e7e1",
        muted: "#68746d",
        mint: "#d9f3e4",
        pine: "#2e664a",
        ink: {
          950: "#18251f",
          900: "#0a0e1a",
          850: "#0e1424",
          800: "#121a2e",
          700: "#1a2440",
          600: "#243150",
        },
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd2ff",
          300: "#8eb4ff",
          400: "#598bff",
          500: "#3563ff",
          600: "#1d40f5",
          700: "#162fe1",
          800: "#1828b6",
          900: "#1a298f",
        },
        gain: "#187553",
        loss: "#bf4d54",
        gold: "#966b23",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(53,99,255,0.25), 0 8px 40px -12px rgba(53,99,255,0.45)",
        "glow-gain": "0 0 0 1px rgba(34,211,154,0.2), 0 8px 40px -12px rgba(34,211,154,0.4)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(53,99,255,0.12), transparent 60%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.85)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
