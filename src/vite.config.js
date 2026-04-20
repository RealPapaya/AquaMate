/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#020d1a',
          900: '#0a1628',
          800: '#0f2340',
          700: '#163258',
          600: '#1d4270',
          500: '#2454a0',
          400: '#3b82c4',
        },
        aqua: {
          400: '#22d3ee',
          300: '#67e8f9',
          200: '#a5f3fc',
          100: '#cffafe',
        },
        wave: {
          deep:    '#0099b8',
          mid:     '#00c4d8',
          surface: '#00e5f0',
        },
      },
      fontFamily: {
        sans:    ['Nunito', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'wave-slow':   'wave 6s linear infinite',
        'wave-fast':   'wave 4s linear infinite',
        'float':       'float 3s ease-in-out infinite',
        'nudge-flash': 'nudgeFlash 0.4s ease-in-out 3',
        'badge-pop':   'badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'count-up':    'countUp 0.4s ease-out',
      },
      keyframes: {
        wave: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        nudgeFlash: {
          '0%, 100%': { opacity: 1 },
          '50%':       { opacity: 0.1 },
        },
        badgePop: {
          '0%':   { transform: 'scale(0) rotate(-10deg)', opacity: 0 },
          '100%': { transform: 'scale(1) rotate(0deg)',   opacity: 1 },
        },
        countUp: {
          '0%':   { transform: 'translateY(12px)', opacity: 0 },
          '100%': { transform: 'translateY(0)',    opacity: 1 },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'wave-glow': '0 0 40px rgba(0, 196, 216, 0.35)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
        'inner-wave':'inset 0 -8px 20px rgba(0,196,216,0.15)',
      },
    },
  },
  plugins: [],
}