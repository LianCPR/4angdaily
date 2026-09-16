import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F4EEE3",
          soft: "#FAF6EC",
          deep: "#E9E0CE",
        },
        ink: {
          DEFAULT: "#2A2420",
          soft: "#57493D",
          faint: "#8B7C6B",
        },
        accent: {
          rust: "#B5502E",
          moss: "#5C6B4E",
          gold: "#B08C3E",
        },
        line: "#D9CDB6",
      },
      fontFamily: {
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "URW Palladio L",
          "P052",
          "serif",
        ],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        paper: "0 1px 2px rgba(42,36,32,0.06), 0 8px 24px -12px rgba(42,36,32,0.18)",
        lift: "0 20px 40px -20px rgba(42,36,32,0.35)",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>\")",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        reveal: {
          "0%": { clipPath: "inset(0 0 100% 0)" },
          "100%": { clipPath: "inset(0 0 0% 0)" },
        },
        kenburns: {
          "0%": { transform: "scale(1.02) translate(0, 0)" },
          "100%": { transform: "scale(1.1) translate(-1%, -1%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.6s ease both",
        reveal: "reveal 0.9s cubic-bezier(0.22,1,0.36,1) both",
        kenburns: "kenburns 22s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
