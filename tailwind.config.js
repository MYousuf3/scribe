/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          light: '#D4B896',
          medium: '#B8956A', 
          dark: '#8B6F3A',
        },
        terracotta: {
          500: '#E8845C',
        },
        ink: {
          dark: '#2C1810',
          medium: '#4A3023',
          light: '#6B4434',
        },
        stone: {
          light: '#F5F1E8',
          medium: '#E8E0D3',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        orange: {
          100: '#FFEDD5',
          200: '#FED7AA',
          600: '#EA580C',
          700: '#C2410C',
        }
      },
    },
  },
  plugins: [],
} 