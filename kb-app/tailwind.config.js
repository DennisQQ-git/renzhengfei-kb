/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FEFCF8',
          100: '#FAF6EF',
          200: '#F0E8D9',
          300: '#E4D8C0',
          400: '#D4C4A3',
          500: '#C4AE85',
          600: '#B0986A',
          700: '#8B7A52',
        },
        ink: {
          50: '#F5F4F2',
          100: '#E8E6E0',
          200: '#D1CDC2',
          300: '#B3ADA0',
          400: '#958E7E',
          500: '#7A7365',
          600: '#5C564B',
          700: '#3D3932',
          800: '#2C2A25',
          900: '#1A1916',
        },
        gold: {
          400: '#C9A84C',
          500: '#B8942E',
          600: '#9E7A22',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
