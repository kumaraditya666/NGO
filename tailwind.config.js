/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FDF8F1",
        parchment: "#F7EFE3",
        forest: {
          DEFAULT: "#1A2E1F",
          deep: "#122117",
          soft: "#2E4A35",
          muted: "#5B7261",
        },
        terracotta: {
          DEFAULT: "#C65D3B",
          deep: "#A34A2E",
          soft: "#EAD0C2",
        },
        gold: {
          DEFAULT: "#C9A86A",
          soft: "#EDE0C6",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 24px 60px -30px rgba(26,46,31,0.35)",
      },
    },
  },
  plugins: [],
};
