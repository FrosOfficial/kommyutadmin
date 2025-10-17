/** @type {import('tailwindcss').Config} */
import { theme } from './src/theme/index.ts';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: theme.primary,
          dark: theme.primaryDark,
          light: theme.primaryLight,
        },
        secondary: theme.secondary,
        accent: theme.accent,
        success: theme.success,
        warning: theme.warning,
        danger: theme.danger,
        gray: theme.gray,
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
