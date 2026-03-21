export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mirage-bg': 'var(--surface)',
        'mirage-border': 'var(--border)',
        'mirage-teal': 'var(--teal)',
      }
    },
  },
  plugins: [],
}