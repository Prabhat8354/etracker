module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 90px rgba(15, 23, 42, 0.12)',
        glass: '0 12px 40px rgba(15, 23, 42, 0.12)',
        glow: '0 24px 80px rgba(99, 102, 241, 0.16)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(56,189,248,0.22), transparent 40%), linear-gradient(135deg, rgba(163, 63, 247, 0.15), transparent 45%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          light: '#f7f8fb',
          dark: '#10121c',
        },
      },
    },
  },
  plugins: [],
}
