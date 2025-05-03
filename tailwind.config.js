/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ghibli: {
          blue: '#8ecae6',
          green: '#8db48e',
          yellow: '#ffb703',
          orange: '#fb8500',
          brown: '#a47551',
          beige: '#f9f7f3',
          gray: '#4d5057',
          lightblue: '#c7e5f6',
          darkgreen: '#5c9b72',
          dustyrose: '#e6b9b8',
          earthbrown: '#9b7653',
          skyteal: '#a4d4d1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        'xiaowei': ['"ZCOOL XiaoWei"', 'serif'],
        'kuaile': ['"ZCOOL KuaiLe"', 'sans-serif'],
        'wenkai': ['"LXGW WenKai"', 'serif'],
        'sourcehans': ['"Noto Serif SC"', 'serif']
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'wave': 'wave 6s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'pulse-fast': 'pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideUp': 'slideUp 0.5s ease-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        sway: {
          '0%, 100%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
        },
        shimmer: {
          '0%': { opacity: 0.4, transform: 'scale(0.95)' },
          '50%': { opacity: 0.7, transform: 'scale(1)' },
          '100%': { opacity: 0.4, transform: 'scale(0.95)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      },
      zIndex: {
        '-1': '-1',
        '-2': '-2',
        '-3': '-3',
        '-4': '-4',
        '-5': '-5',
      },
      backdropBlur: {
        xs: '2px',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(8px)',
      },
      mixBlendMode: {
        'screen': 'screen',
        'overlay': 'overlay',
        'lighten': 'lighten',
      },
      backgroundImage: {
        'forest': "url('/assets/background-forest.jpg')",
      },
    },
  },
  plugins: [],
} 