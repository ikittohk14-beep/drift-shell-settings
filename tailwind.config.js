/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          bg: '#131315',
          card: '#1a191d',
          cardHeader: '#161518',
          border: '#262529',
          borderLight: '#36353b',
          dim: '#474648',
          muted: '#929092',
          text: '#e5e2e3',
          primary: '#859aea',
          primaryLight: '#a4b5f5',
          mint: '#a3d4a0',
          coral: '#ffb4ab',
          sand: '#e8cf8d',
          lavender: '#c0c6dc',
          frost: '#88c0d0',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
