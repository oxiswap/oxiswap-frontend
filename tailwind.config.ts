import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        backgroundImage: {
            'custom-radial': "radial-gradient(circle at 2px 2px, rgba(132, 134, 134, 0.5) 2px, transparent 2px)"
        },
        backgroundSize: {
            "custom-size": "128px 128px"
        },
        backgroundPosition: {
            "custom-position": "0 0, 50px 50px"
        },
        backgroundColor: {
            "nav-100": "#161f2c",
            "nav-200": "#10151d",
            "nav-300": "#A87FFB"
        },
        colors: {
            "text-100": "#BFC7D2",
            "text-200": "#A87FFB",
            "text-300": "#10151d"
        },
        keyframes: {
            moveUp: {
                "0%": { backgroundPosition: "0 0, 64px 64px" },
                "100%": { backgroundPosition: "0 -128px, 64px -64px" }
            }
        },
        animation: {
            "move-up": "moveUp 5s linear infinite"
        },
    }
  },
  plugins: [],
};
export default config;
