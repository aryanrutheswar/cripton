/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Serene Botanical Education Palette
        botanical: {
          ivory: '#FAFAF4',      // Warm ivory background
          pastel: '#B7E4A5',     // Pastel green
          sage: '#DCE8D5',       // Soft sage
          olive: '#89966A',      // Muted olive
          deep: '#596B3D',       // Deep olive
          forest: '#344536',     // Dark natural green for text
          border: '#DCE8D5',     // Soft sage border
          surface: '#FFFFFF',    // Pure surface
        },
        // Updated Crypton palette mapped to serene botanical tones
        crypton: {
          50: '#F7F9F5',
          100: '#EBF1E8',
          200: '#DCE8D5',
          300: '#C7DCBF',
          400: '#B7E4A5',
          500: '#89966A',
          600: '#596B3D',
          700: '#475631',
          800: '#344536',
          900: '#253327',
          950: '#172118',
        },
        navy: {
          800: '#344536',
          900: '#253327',
          950: '#172118',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'botanical': '0 8px 30px -4px rgba(52, 69, 54, 0.06)',
        'botanical-hover': '0 14px 36px -4px rgba(89, 107, 61, 0.12)',
        'glass': '0 8px 32px 0 rgba(89, 107, 61, 0.06)',
        'subtle': '0 1px 3px 0 rgba(52, 69, 54, 0.04), 0 1px 2px -1px rgba(52, 69, 54, 0.04)',
      },
      animation: {
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-reverse': 'floatReverse 9s ease-in-out infinite',
        'breeze': 'breeze 7s ease-in-out infinite',
        'sunlight': 'sunlightPulse 6s ease-in-out infinite',
        'leaf-drift': 'leafDrift 14s linear infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1.5deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(8px) rotate(-1.5deg)' },
        },
        breeze: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(2deg) skewX(1deg)' },
        },
        sunlightPulse: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.75' },
        },
        leafDrift: {
          '0%': { transform: 'translateY(-20px) translateX(0px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(110vh) translateX(60px) rotate(180deg)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
