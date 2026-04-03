import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Economica",
          "Inter",
          '"Sour Gummy"',
          "system-ui",
          "sans-serif",
        ],
        economica: ["Economica", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        gummy: ['"Sour Gummy"', "sans-serif"],
        playball: ["Playball", "cursive"],
      },
      colors: {
        "custom-yellow": "#FED700",
      },
      keyframes: {
        bounceSlow: {
          "0%, 100%": {
            transform: "translateY(-10%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        brandTiragemMarquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "bounce-slow": "bounceSlow 3s infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "brand-tiragem": "brandTiragemMarquee 45s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("daisyui"),
  ],
};
export default config;
