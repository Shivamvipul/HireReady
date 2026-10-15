/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#f4f7f3',
        surface: '#ffffff',
        raised: '#eef4ef',
        line: '#dbe4de',
        fg: '#17342e',
        dim: '#62736d',
        accent: { DEFAULT: '#176c5d', strong: '#176c5d', dark: '#123e36', soft: '#e2eee7' },
        good: '#15803d',
        warn: '#b45309',
        bad: '#dc2626',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(23,108,93,0.35), 0 8px 24px -8px rgba(23,108,93,0.3)',
      },
    },
  },
  plugins: [],
};
