// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    950: "#0f172a",
                },
                // Bạn có thể thêm màu xanh thương hiệu cho "Elite Blog" ở đây
                brand: {
                    primary: "#3b82f6", // Blue-500
                    dark: "#1e40af",    // Blue-800
                }
            },
            backdropBlur: {
                "xl": "24px",
            },
            keyframes: {
                "slide-down": {
                    "0%": { transform: "translateY(-10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "slide-in-left": {
                    "0%": { transform: "translateX(-20px)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
            },
            animation: {
                "slide-down": "slide-down 0.3s ease-out",
                "slide-in-left": "slide-in-left 0.3s ease-out",
            },
        },
    },
    plugins: [],
} satisfies Config;