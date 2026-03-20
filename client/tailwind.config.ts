import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['Fredoka', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'cream-bg': '#FDFBF7',
        'mint-clay': '#B2F2BB',
        'pink-clay': '#FFD1DC',
        'lilac-clay': '#E0C3FC',
        'sky-clay': '#BAE6FD',
        'peach-clay': '#FFDAB9',
      },
      boxShadow: {
        // Claymorphism dual-shadow card - Inflated / Pumped look
        'clay-card': [
          '-10px -10px 24px rgba(255,255,255,0.95)',
          '16px 20px 40px rgba(17,24,39,0.12)',
          'inset 0px 1px 0px rgba(255,255,255,0.90)',
          'inset 0px -1px 0px rgba(17,24,39,0.05)',
        ].join(', '),

        // Larger premium card
        'clay-card-lg': [
          '-14px -14px 34px rgba(255,255,255,0.96)',
          '22px 28px 56px rgba(17,24,39,0.13)',
          'inset 0px 1px 0px rgba(255,255,255,0.92)',
          'inset 0px -2px 2px rgba(17,24,39,0.05)',
        ].join(', '),

        // Small/pill shadow
        'clay-pill': [
          '-6px -6px 14px rgba(255,255,255,0.95)',
          '10px 14px 28px rgba(17,24,39,0.12)',
          'inset 0px 1px 0px rgba(255,255,255,0.80)',
        ].join(', '),

        // Inset "pressed" or concave surface
        'clay-inset': [
          'inset 3px 3px 8px rgba(17,24,39,0.07)',
          'inset -3px -3px 8px rgba(255,255,255,0.80)',
        ].join(', '),

        // Pressed state (click)
        'clay-press': [
          'inset 6px 8px 16px rgba(17,24,39,0.10)',
          'inset -6px -8px 16px rgba(255,255,255,0.85)',
        ].join(', '),

        // Extra small quick utility
        'clay-xs': [
          '-4px -4px 10px rgba(255,255,255,0.95)',
          '6px 8px 16px rgba(17,24,39,0.09)',
        ].join(', '),
      },
      borderRadius: {
        card: '40px',
        card2: '32px',
      },
    },
  },
  plugins: [],
}

export default config
