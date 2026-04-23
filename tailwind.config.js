/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        canvas: '#F4F5F7',
        surface: '#FFFFFF',
        border: '#E2E4E9',
        muted: '#8B8FA8',
        primary: {
          DEFAULT: '#4F6EF7',
          light: '#EEF1FE',
          dark: '#3554D1',
        },
        success: { DEFAULT: '#22C55E', light: '#DCFCE7' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7' },
        danger: { DEFAULT: '#EF4444', light: '#FEE2E2' },
        info: { DEFAULT: '#06B6D4', light: '#CFFAFE' },
        purple: { DEFAULT: '#8B5CF6', light: '#EDE9FE' },
        node: {
          start: '#22C55E',
          task: '#4F6EF7',
          approval: '#F59E0B',
          auto: '#8B5CF6',
          end: '#EF4444',
        },
      },
      boxShadow: {
        node: '0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)',
        'node-selected': '0 0 0 2px #4F6EF7, 0 4px 12px rgba(79,110,247,0.2)',
        panel: '0 4px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
