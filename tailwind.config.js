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
          primary: '#e5e2e3',
          primaryLight: '#ffffff',
          btn: '#201f24',
          btnHover: '#2b2a30',
          mint: '#e5e2e3',
          coral: '#e5e2e3',
          sand: '#e5e2e3',
          lavender: '#929092',
          frost: '#e5e2e3',
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
