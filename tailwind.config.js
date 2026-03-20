/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "cream-bg": "#FDFBF7",
        "mint-clay": "#B2F2BB",
        "pink-clay": "#FFD1DC",
        "lilac-clay": "#E0C3FC",
      },
      borderRadius: {
        card: "32px",
      },
      boxShadow: {
        // Claymorphism presets (soft highlight top-left + soft shadow bottom-right)
        "clay-xs":
          "-4px -4px 10px rgba(255, 255, 255, 0.95), 6px 10px 18px rgba(17, 24, 39, 0.10)",
        "clay-sm":
          "-6px -6px 14px rgba(255, 255, 255, 0.95), 10px 14px 26px rgba(17, 24, 39, 0.10)",
        clay:
          "-10px -10px 24px rgba(255, 255, 255, 0.95), 16px 20px 40px rgba(17, 24, 39, 0.12)",
        "clay-lg":
          "-14px -14px 34px rgba(255, 255, 255, 0.96), 22px 28px 56px rgba(17, 24, 39, 0.14)",

        // Inner “surface” sheen used on cards in the design
        "clay-inset":
          "inset 2px 2px 6px rgba(255, 255, 255, 0.80), inset -2px -3px 8px rgba(17, 24, 39, 0.06)",

        // Combined: raised clay card with subtle inner sheen
        "clay-card":
          "-10px -10px 24px rgba(255, 255, 255, 0.95), 16px 20px 40px rgba(17, 24, 39, 0.12), inset 1px 1px 0 rgba(255, 255, 255, 0.70), inset -1px -2px 0 rgba(17, 24, 39, 0.04)",

        // Pressed state (looks slightly “pushed in”)
        "clay-press":
          "inset 8px 10px 18px rgba(17, 24, 39, 0.10), inset -8px -10px 18px rgba(255, 255, 255, 0.85)",

        // Pill / button style used in the UI (a bit tighter)
        "clay-pill":
          "-8px -8px 18px rgba(255, 255, 255, 0.95), 14px 18px 36px rgba(17, 24, 39, 0.14)",
      },
    },
  },
  plugins: [],
};

