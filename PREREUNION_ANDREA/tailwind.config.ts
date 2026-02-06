import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Refined luxury palette based on color theory
        'nuclea': {
          // Deep blue-black (not pure black - easier on eyes, more sophisticated)
          'bg': '#0D0D12',
          'bg-elevated': '#14141A',
          // Glass/card backgrounds
          'card': 'rgba(255, 255, 255, 0.02)',
          'card-hover': 'rgba(255, 255, 255, 0.04)',
          // Classic gold palette (timeless, not too bright)
          'gold': '#D4AF37',           // Classic gold
          'gold-light': '#F4E4BA',     // Champagne
          'gold-muted': '#B8956B',     // Antique gold
          // Borders
          'border': 'rgba(255, 255, 255, 0.06)',
          'border-gold': 'rgba(212, 175, 55, 0.25)',
        },
        // Semantic text colors
        'text': {
          'primary': '#FAFAFA',
          'secondary': 'rgba(250, 250, 250, 0.7)',
          'muted': 'rgba(250, 250, 250, 0.4)',
        }
      },
      fontFamily: {
        // Cormorant Garamond - elegant, refined serif for headlines
        'display': ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        // DM Sans - clean, modern sans-serif for body
        'sans': ['var(--font-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-gold': 'pulseGold 3s ease-in-out infinite',
        'float': 'float 20s infinite ease-in-out',
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'translateY(-30px) rotate(5deg)', opacity: '0.5' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
