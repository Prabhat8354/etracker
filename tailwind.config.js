module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 90px rgba(15, 23, 42, 0.08)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        glow: '0 0 25px rgba(99, 102, 241, 0.25)',
        'glow-hover': '0 0 35px rgba(99, 102, 241, 0.4)',
        'premium': '0 12px 40px -10px rgba(0, 0, 0, 0.08)',
        'premium-dark': '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(99, 102, 241, 0.12), transparent 50%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.08), transparent 50%)',
        'premium-gradient': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.2) 100%)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          light: '#fcfcfd',
          dark: '#030712',
          card: '#ffffff',
          'card-dark': 'rgba(17, 24, 39, 0.7)',
        },
      },
      keyframes: {
        ring: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(8deg)' },
          '75%': { transform: 'rotate(-8deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        ring: 'ring 0.5s ease-in-out',
        float: 'float 20s infinite alternate ease-in-out',
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [],
}
