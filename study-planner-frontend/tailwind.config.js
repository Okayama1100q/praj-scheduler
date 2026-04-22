/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fafafa",
        foreground: "#1a1a1a",
        card: "#ffffff",
        border: "#e5e5e5",
        accent: {
          light: "#e0e7ff", // soft blue/lavender
          DEFAULT: "#6366f1",
        },
        warning: "#f59e0b", // soft amber
        lock: "#ef4444", // muted red
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'Satoshi', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'subtle-pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
