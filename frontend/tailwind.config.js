/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        priority: {
          low: '#6b7280',
          medium: '#3b82f6',
          high: '#f59e0b',
          critical: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
