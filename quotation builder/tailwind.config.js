/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Segoe UI', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: '#60a5fa', // Lighter, brighter blue for dark backgrounds
                'background-light': '#f6f6f8',
                'background-dark': '#0f172a',
                brand: {
                    DEFAULT: '#a78bfa', // Bright violet
                    hover: '#c4b5fd',
                    light: '#ddd6fe',
                    subtle: 'rgba(167, 139, 250, 0.15)',
                },
                neutral: {
                    bg1: '#09090b', // Zinc 950
                    bg2: '#18181b', // Zinc 900
                    bg3: '#27272a', // Zinc 800
                    bg4: '#3f3f46', // Zinc 700
                    bg5: '#52525b', // Zinc 600
                    bg6: '#71717a', // Zinc 500
                },
                text: {
                    primary: '#f4f4f5', // Zinc 50
                    secondary: '#a1a1aa', // Zinc 400
                    muted: '#71717a', // Zinc 500
                },
                border: {
                    subtle: 'rgba(255, 255, 255, 0.05)',
                    DEFAULT: 'rgba(255, 255, 255, 0.1)',
                    strong: 'rgba(255, 255, 255, 0.2)',
                },
                status: {
                    success: '#34d399', // Emerald 400
                    warning: '#fbbf24', // Amber 400
                    error: '#f87171', // Red 400
                    info: '#60a5fa', // Blue 400
                },
            },
            borderRadius: {
                DEFAULT: '0.125rem',
                lg: '0.25rem',
                xl: '0.5rem',
                full: '0.75rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
