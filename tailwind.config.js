/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Campus Care brand tokens taken straight from the mockups
        navy: {
          DEFAULT: '#1B2A4E',
          light: '#223563',
          dark: '#16223F',
        },
        canvas: '#F8F9FA',
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#EFF4FF',
        },
        status: {
          pending: '#F59E0B',
          progress: '#8B5CF6',
          resolved: '#22C55E',
          cancelled: '#94A3B8',
        },
        priority: {
          critical: '#EF4444',
          high: '#DC2626',
          medium: '#F97316',
          low: '#22C55E',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
        'card-hover': '0 8px 24px rgba(16, 24, 40, 0.10)',
        panel: '0 20px 45px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}
