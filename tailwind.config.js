/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#21183D',
        grape: '#7655D9',
        sky: '#5EC8ED',
        sun: '#FFD45C',
        rosa: '#F38BBF',
        mist: '#F4F1FF',
        ink: '#2A2148',
      },
      fontFamily: {
        display: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 20px rgba(33, 24, 61, 0.10)',
        pop: '0 10px 30px rgba(118, 85, 217, 0.35)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.7) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        coinFly: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.5)' },
          '60%': { opacity: '1', transform: 'translateY(-6px) scale(1.15)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        popIn: 'popIn 0.35s cubic-bezier(0.22, 1.2, 0.36, 1) both',
        coinFly: 'coinFly 0.5s ease-out both',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
