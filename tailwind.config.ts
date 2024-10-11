import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(slider|popover).js"
  ],
  theme: {
    extend: {
      backgroundColor: {
        "nav-100": "#161f2c",
        "nav-200": "#10151d",
        "card-100": "#1c2531",
        "inputs-100": "#2c3e50",
        "button-100": "#2F8AF5",
        "hover-button-100": "#5bc0be",
        "swap-card-100": "#1f242c",
        "oxi-bg-01": "#2F8AF529",
        "oxi-bg-02": "#F3F5FA",
        "oxi-bg-03": "#ECF0F9",
        "oxi-bg-04": "rgba(255, 255, 255, 0.75)",
      },
      colors: {
        "text-100": "#8f9ba7",
        "text-200": "#2F8AF5",
        "text-300": "#6C86AD",
        "text-400": "#8f9ba7",
        "text-500": "#6F7183",
        "text-600": "#060828",
        "text-700": "#6B7280",
        "nav-black": "#10151d",
        "nav-black-2": "#2a2f38",
        "oxi-text-01": "#9bAFCD",
      },
      fontFamily: {
        'basel-grotesk-book': ['var(--font-basel-grotesk-book)'],
        'basel-grotesk-medium': ['var(--font-basel-grotesk-medium)'],
      },
      screens: {
        'xs': '396px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        'xxl': '1536px',
        'xxxl': '1920px',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      animation: {
        'wiggle-zoom': 'wiggle 0.2s ease-in-out 2, scaleAndColor 0.4s ease-in-out 0.5s forwards',
      }
    }
  },
  variants: {
    extend: {
      animation: ['hover', 'focus'],
    },
  },
  plugins: [nextui()],
};

export default config;
