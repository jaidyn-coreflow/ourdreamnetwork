import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Near-black neutrals, tinted a hair toward the brand magenta so the
        // page reads as intentional rather than flat black. 800 (card bg) left
        // as-is to keep the character card unchanged.
        night: { 950: "#080609", 900: "#0c090c", 800: "#141414", 700: "#1a1a1a" },
        // index pink accent maps onto the components' "gold" token
        gold: { 400: "#F17BB6", 500: "#e85aa0", 600: "#db2777" },
        rose: { 700: "#8b2252", 600: "#a62d65", 500: "#c2185b" },
        // plum surfaces → deep magenta-tinted darks
        plum: { 900: "#1a0e15", 800: "#2a121f", 700: "#3a1830", 600: "#db2777" },
        // parchment text → white / neutral grays
        parchment: { 100: "#ffffff", 200: "#f5f5f5", 300: "#d4d4d4" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at 30% 20%, rgba(219,39,119,0.18) 0%, transparent 50%), " +
          "radial-gradient(ellipse at 70% 80%, rgba(241,123,182,0.12) 0%, transparent 50%), " +
          "linear-gradient(180deg, #060606 0%, #141414 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(42,18,31,0.6) 0%, rgba(20,20,20,0.85) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
