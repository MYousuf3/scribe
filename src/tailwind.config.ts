const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        cuneiform: ['Papyrus', 'fantasy'], // Fallback font for cuneiform-like appearance
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Ancient clay color palette
        clay: {
          light: '#D4B896',  // Light clay/sand color
          medium: '#B8956A', // Medium clay/terracotta
          dark: '#8B6F3A',   // Dark clay/brown
        },
        terracotta: {
          50: '#FEF7F0',
          100: '#FDEEE0',
          200: '#FAD5B8',
          300: '#F7BC90',
          400: '#F1A368',
          500: '#E8845C',  // Main terracotta
          600: '#D4704A',
          700: '#B85D38',
          800: '#9C4A26',
          900: '#7D3A1C',
        },
        ink: {
          dark: '#2C1810',   // Dark ink for text
          medium: '#4A3023', // Medium ink
          light: '#6B4434',  // Light ink
        },
        // Stone/parchment background colors
        stone: {
          light: '#F5F1E8',  // Light stone/parchment
          medium: '#E8E0D3', // Medium stone
          dark: '#DDD4C4',   // Dark stone
        },
        // Accent colors for highlights
        gold: {
          light: '#F4D03F',  // Light gold
          medium: '#F1C40F', // Medium gold
          dark: '#D4AC0D',   // Dark gold
        },
      },
      boxShadow: {
        // Clay tablet shadows for depth
        'clay-inset': 'inset 0 2px 4px rgba(139, 111, 58, 0.3), inset 0 -2px 4px rgba(139, 111, 58, 0.1)',
        'clay-outset': '0 4px 8px rgba(139, 111, 58, 0.3), 0 2px 4px rgba(139, 111, 58, 0.2)',
        'clay-deep': '0 6px 16px rgba(139, 111, 58, 0.4), 0 3px 8px rgba(139, 111, 58, 0.3)',
        'clay-raised': '0 1px 3px rgba(139, 111, 58, 0.2), 0 4px 12px rgba(139, 111, 58, 0.15)',
        // Engraved text effects
        'text-engraved': '0 1px 0 rgba(255, 255, 255, 0.3), 0 -1px 0 rgba(139, 111, 58, 0.5)',
        'text-raised': '0 1px 0 rgba(139, 111, 58, 0.3), 0 -1px 0 rgba(255, 255, 255, 0.5)',
      },
      backgroundImage: {
        'clay-texture': 'linear-gradient(45deg, #D4B896 25%, transparent 25%), linear-gradient(-45deg, #D4B896 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #D4B896 75%), linear-gradient(-45deg, transparent 75%, #D4B896 75%)',
        'stone-texture': 'radial-gradient(circle at 20% 50%, rgba(139, 111, 58, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 111, 58, 0.1) 0%, transparent 50%)',
      },
      backgroundSize: {
        'clay-texture': '4px 4px',
        'stone-texture': '60px 60px',
      },
      typography: {
        'cuneiform': {
          css: {
            '--tw-prose-body': '#2C1810',
            '--tw-prose-headings': '#2C1810',
            '--tw-prose-links': '#E8845C',
            '--tw-prose-bold': '#2C1810',
            '--tw-prose-counters': '#E8845C',
            '--tw-prose-bullets': '#E8845C',
            '--tw-prose-hr': '#DDD4C4',
            '--tw-prose-quotes': '#4A3023',
            '--tw-prose-quote-borders': '#E8845C',
            '--tw-prose-captions': '#6B4434',
            '--tw-prose-code': '#2C1810',
            '--tw-prose-pre-code': '#F5F1E8',
            '--tw-prose-pre-bg': '#2C1810',
            '--tw-prose-th-borders': '#DDD4C4',
            '--tw-prose-td-borders': '#E8E0D3',
            letterSpacing: '0.025em',
            lineHeight: '1.7',
          },
        },
      },
      animation: {
        'clay-pulse': 'clay-pulse 2s ease-in-out infinite',
        'engrave': 'engrave 0.3s ease-out',
      },
      keyframes: {
        'clay-pulse': {
          '0%, 100%': { 
            boxShadow: '0 4px 8px rgba(139, 111, 58, 0.3), 0 2px 4px rgba(139, 111, 58, 0.2)',
            transform: 'translateY(0px)',
          },
          '50%': { 
            boxShadow: '0 6px 16px rgba(139, 111, 58, 0.4), 0 3px 8px rgba(139, 111, 58, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        'engrave': {
          '0%': { textShadow: '0 0 0 rgba(139, 111, 58, 0.5)' },
          '100%': { textShadow: '0 1px 0 rgba(255, 255, 255, 0.3), 0 -1px 0 rgba(139, 111, 58, 0.5)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'clay': '0.375rem',
        'tablet': '0.5rem',
      },
    },
  },
  plugins: [],
};

export default config; 