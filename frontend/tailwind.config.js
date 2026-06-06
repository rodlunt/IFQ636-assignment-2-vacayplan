module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          subtle: '#94a3b8',
          inverse: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          subtle: '#f1f5f9',
          border: '#e2e8f0',
        },
        brand: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          dark: '#172554',
          accent: '#fbbf24',
        },
        danger: {
          DEFAULT: '#dc2626',
          soft: '#fca5a5',
          bg: '#fef2f2',
        },
        success: {
          DEFAULT: '#16a34a',
          bg: '#f0fdf4',
        },
        info: {
          DEFAULT: '#0284c7',
          bg: '#f0f9ff',
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
          'sans-serif',
        ],
      },
      fontSize: {
        micro: '11px',
        mini: '13px',
      },
    },
  },
  plugins: [],
};
