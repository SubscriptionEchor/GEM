/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)'
        },
        accent: {
          primary: 'var(--accent-primary)',
          success: 'var(--accent-success)',
          warning: 'var(--accent-warning)',
          info: 'var(--accent-info)',
          purple: 'var(--accent-purple)'
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)'
        }
      }
    },
  },
  plugins: []
}