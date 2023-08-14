/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      black: {
        50: '#c8cfd5',
        100: '#b3bac2',
        200: '#9e9e9e',
        300: '#7a7a7a',
        400: '#595959',
        500: '#3d3d3d',
        600: '#292929',
        700: '#1a1a1a',
        800: '#0f0f0f',
        900: '#080808',
        950: '#030303'
      }
    }
  },
  plugins: []
}
