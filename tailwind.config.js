/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                saira: ['Saira', 'sans-serif'],
            },
            colors: {
                emerald: {
                    500: '#10b981',
                    700: '#047857',
                    900: '#064e3b',
                    950: '#022c22',
                }
            }
        },
    },
    plugins: [],
}
