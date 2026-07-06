import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:  "hsl(240,10%,2%)",
        surface:     "hsl(240,10%,4%)",
        elevated:    "hsl(240,10%,8%)",
        border:      "hsl(240,4%,10%)",
        foreground:  "hsl(0,0%,98%)",
        muted:       { DEFAULT:"hsl(240,4%,12%)", foreground:"hsl(240,4%,60%)" },
        accent:      { DEFAULT:"#5E6AD2", soft:"#B4C6FC", vibrant:"#8b8ce6" },
        primary:     { DEFAULT:"#5E6AD2", foreground:"#FFFFFF" },
        secondary:   { DEFAULT:"hsl(240,10%,14%)", foreground:"hsl(240,4%,80%)" },
        success:     "#38C964",
        error:       "#E13737",
      },
      fontFamily: {
        sans:  ["Quicksand", "Inter", "Noto Sans JP", "system-ui", "sans-serif"],
        display: ["BespokeStencil", "sans-serif"],
        serif: ["Lora", "serif"],
        jp:    ["Noto Sans JP", "Hiragino Sans", "sans-serif"],
      },
      maxWidth: { content: "960px" },
      width:    { sidebar: "260px" },
      keyframes: {
        "fade-in": {
          from: { opacity:"0", transform:"translateY(4px)" },
          to:   { opacity:"1", transform:"translateY(0)" },
        },
        "fade-up": {
          from: { opacity:"0", transform:"translateY(10px)" },
          to:   { opacity:"1", transform:"translateY(0)" },
        },
        shake: {
          "0%,100%": { transform:"translateX(0)" },
          "25%":     { transform:"translateX(-4px)" },
          "75%":     { transform:"translateX(4px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        "fade-up": "fade-up 200ms ease-in-out both",
        shake:     "shake 300ms ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
