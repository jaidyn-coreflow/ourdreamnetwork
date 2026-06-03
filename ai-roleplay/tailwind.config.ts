import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* deep cinematic backgrounds */
        night: {
          950: "#06060c",
          900: "#0a0a14",
          800: "#12121f",
          700: "#1a1a2e",
        },
        /* gold / amber accent */
        gold: {
          400: "#f0c987",
          500: "#d4a574",
          600: "#b8864f",
        },
        /* deep rose */
        rose: {
          700: "#8b2252",
          600: "#a62d65",
          500: "#c2185b",
        },
        /* plum / purple */
        plum: {
          900: "#1e0a2e",
          800: "#2d1347",
          700: "#4a1942",
          600: "#6b3fa0",
        },
        /* warm whites for text */
        parchment: {
          100: "#f5f0eb",
          200: "#e8e0d8",
          300: "#d4c9bc",
        },
      },
      fontFamily: {
        display: [
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "Times",
          "serif",
        ],
        body: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at 30% 20%, rgba(75,25,66,0.45) 0%, transparent 50%), " +
          "radial-gradient(ellipse at 70% 80%, rgba(212,165,116,0.18) 0%, transparent 50%), " +
          "linear-gradient(180deg, #06060c 0%, #12121f 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(30,10,46,0.6) 0%, rgba(18,18,31,0.8) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
