/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Base colors
                background: "var(--bg-canvas)",
                surface: "var(--bg-surface)",
                elevated: "var(--bg-elevated)",
                border: "var(--border-default)",

                // Brand
                primary: {
                    DEFAULT: "#ff6d5a",
                    hover: "#ff8573",
                    muted: "rgba(255, 109, 90, 0.2)"
                },

                // Canvas
                canvas: "#0a0a0b",

                // Category colors
                core: {
                    DEFAULT: "#10b981",
                    muted: "rgba(16, 185, 129, 0.2)"
                },
                module: {
                    DEFAULT: "#8b5cf6",
                    muted: "rgba(139, 92, 246, 0.2)"
                },
                client: {
                    DEFAULT: "#f59e0b",
                    muted: "rgba(245, 158, 11, 0.2)"
                }
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace']
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-in': 'slideIn 0.2s ease-out'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                }
            },
            boxShadow: {
                'node': '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
                'node-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.4)',
                'glow-primary': '0 0 20px -5px rgba(255, 109, 90, 0.4)',
                'glow-core': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
                'glow-module': '0 0 20px -5px rgba(139, 92, 246, 0.4)',
                'glow-client': '0 0 20px -5px rgba(245, 158, 11, 0.4)'
            }
        },
    },
    plugins: [],
}
