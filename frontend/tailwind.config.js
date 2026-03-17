/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        neural: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5bafc",
          400: "#8193f8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        danger: {
          400: "#f87171",
          500: "#ef4444",
        },
        surface: {
          900: "#0a0a0f",
          800: "#111118",
          700: "#1a1a27",
          600: "#222233",
          500: "#2d2d44",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":  "spin 2s linear infinite",
        "fade-in":    "fadeIn 0.4s ease-out forwards",
        "slide-up":   "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "glow":       "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(24px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        glow:    { "0%": { boxShadow: "0 0 5px #6366f1, 0 0 10px #6366f1" }, "100%": { boxShadow: "0 0 20px #6366f1, 0 0 40px #4f46e5" } },
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(99,102,241,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.06) 1px,transparent 1px)",
        "radial-neural": "radial-gradient(ellipse at 50% 0%,rgba(99,102,241,.15) 0%,transparent 60%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
