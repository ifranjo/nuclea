import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'sm': '375px',
      'md': '428px',
      'lg': '768px',
      'xl': '1024px',
      '2xl': '1280px',
    },
    extend: {
      colors: {
        'nuclea-bg': '#FFFFFF',
        'nuclea-secondary': '#FAFAFA',
        'nuclea-text': '#1A1A1A',
        'nuclea-text-secondary': '#6B6B6B',
        'nuclea-text-muted': '#9A9A9A',
        'nuclea-gold': '#D4AF37',
        'nuclea-border': '#E5E5E5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config
