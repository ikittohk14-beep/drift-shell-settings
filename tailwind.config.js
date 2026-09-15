/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        drift: {
          bg: '#131315',
          sidebar: '#161518',
          card: '#1c1b1f',
          cardHover: '#242329',
          cardActive: '#2d2c33',
          border: '#2a282d',
          borderHover: '#38363d',
          text: '#e5e2e3',
          subtext: '#929092',
          faint: '#636265',
          coral: '#ffb4ab',
          red: '#ffb4ab',
          green: '#a3d4a0',
          mint: '#a3d4a0',
          amber: '#e8cf8d',
          gold: '#e8cf8d',
          blue: '#859aea',
          steel: '#859aea',
          lavender: '#c0c6dc',
          purple: '#c0c6dc',
          cyan: '#88c0d0',
          teal: '#88c0d0',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace', 'ui-monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.45)',
        glow: '0 0 16px rgba(133, 154, 234, 0.25)',
      },
    },
  },
  plugins: [],
};
