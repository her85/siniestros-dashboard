/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js}',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#12181f',
        inksoft: '#1b232d',
        paper: '#f3efe6',
        paperdim: '#e7e1d3',
        rust: '#c1622d',
        teal: '#2e6e62',
        alert: '#b33f3f',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
