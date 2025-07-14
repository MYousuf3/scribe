/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        cuneiform: ['Papyrus', 'fantasy'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        dark_brown: {
          DEFAULT: '#6c2e0f', // Dark reddish-brown for headers and titles
        },
        light_beige: {
          DEFAULT: '#e9d6b1', // Light beige background
        },
        golden_brown: {
          DEFAULT: '#d9a860', // Golden brown for buttons and accents
        },
        clay_brown: {
          DEFAULT: '#b08150', // Clay-brown for project cards
        },
        cream: {
          DEFAULT: '#f3e4c7', // Very light cream for highlights
        },
        accent_red: {
          DEFAULT: '#ac4c29', // Accent orange-red for progress/hover
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}; 