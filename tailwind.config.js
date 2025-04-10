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
          primary: 'var(--background-primary)',      /* Default background */
          light: 'var(--background-light)',          /* White background */
          lighter: 'var(--background-lighter)',      /* Light gray background */
          'light-alt': 'var(--background-light-alt)',/* Light gray with transparency */
          accent: 'var(--background-accent)',        /* Green accent background */
          warning: 'var(--background-warning)',      /* Orange warning background */
          muted: 'var(--background-muted)',         /* Muted gray background */
          dark: 'var(--background-dark)',           /* Dark background */
          darker: 'var(--background-darker)'        /* Darker background */
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
        },
        border: {
          light: 'var(--border-light)',
          medium: 'var(--border-medium)',
          dark: 'var(--border-dark)',
          warning: 'var(--border-warning)',
          success: 'var(--border-success)',
          info: 'var(--border-info)',
          purple: 'var(--border-purple)'
        }
      }
    },
  },
  plugins: []
}