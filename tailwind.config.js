/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Inter",
                    "ui-sans-serif",
                    "system-ui",
                    "-apple-system",
                    "Segoe UI",
                    "sans-serif",
                ],
            },
            keyframes: {
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "dot-bounce": {
                    "0%, 80%, 100%": {
                        transform: "translateY(0)",
                        opacity: "0.4",
                    },
                    "40%": { transform: "translateY(-4px)", opacity: "1" },
                },
            },
            animation: {
                "fade-up": "fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
                "fade-in": "fade-in 0.4s ease-out both",
                "dot-bounce": "dot-bounce 1.2s infinite ease-in-out",
            },
        },
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],

    daisyui: {
        themes: [
            {
                mytheme: {
                    primary: "#10b981",
                    secondary: "#14b8a6",
                    accent: "#37cdbe",
                    neutral: "#1e293b",
                    "base-100": "#020617",
                    "base-200": "#0f172a",
                    "base-300": "#1e293b",
                },
            },
        ],
    },
};
