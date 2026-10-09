/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base surfaces
        base: {
          bg:            "var(--color-bg)",
          surface:       "var(--color-surface)",
          "surface-hover": "var(--color-surface-hover)",
          border:        "var(--color-border)",
          muted:         "var(--color-muted)",
        },
        // Professional teal primary brand
        teal: {
          DEFAULT: "var(--color-teal)",
          light:   "var(--color-teal-light)",
          dark:    "var(--color-teal-dark)",
          glow:    "var(--color-teal-glow)",
          subtle:  "var(--color-teal-subtle)",
        },
        // Warm amber accent
        amber: {
          DEFAULT: "var(--color-amber)",
          light:   "var(--color-amber-light)",
          dark:    "var(--color-amber-dark)",
          glow:    "var(--color-amber-glow)",
          subtle:  "var(--color-amber-subtle)",
        },
        // Deep navy/charcoal secondary neutral
        navy: {
          DEFAULT: "var(--color-navy)",
          light:   "var(--color-navy-light)",
          dark:    "var(--color-navy-dark)",
        },
        // Legacy alias so existing steel utility classes gracefully map to teal/navy
        steel: {
          DEFAULT: "var(--color-teal)",
          light:   "var(--color-teal-light)",
          dark:    "var(--color-teal-dark)",
          glow:    "var(--color-teal-glow)",
        },
        // Status colors
        status: {
          green: "var(--color-status-green)",
          blue:  "var(--color-status-blue)",
          amber: "var(--color-status-amber)",
          red:   "var(--color-status-red)",
        },
        // Ink / text scale
        ink: {
          primary:   "var(--color-ink-primary)",
          secondary: "var(--color-ink-secondary)",
          muted:     "var(--color-ink-muted)",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      fontSize: {
        base: ["1rem", { lineHeight: "1.6" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        teal: "var(--shadow-teal)",
        amber: "var(--shadow-amber)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};
