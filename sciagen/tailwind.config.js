/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sciagen Core Palette
        void: {
          950: '#040608',
          900: '#070d12',
          800: '#0c1520',
          700: '#111f2e',
          600: '#172840',
        },
        ion: {
          50:  '#f0fdff',
          100: '#ccfbff',
          200: '#99f4ff',
          300: '#55e8ff',
          400: '#06d0f5',
          500: '#00b4d8',
          600: '#0090ad',
          700: '#00728c',
          800: '#005c72',
          900: '#004d60',
        },
        ember: {
          50:  '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc070',
          400: '#ff9a32',
          500: '#ff7c0a',
          600: '#f05d00',
          700: '#c74300',
          800: '#9e3600',
          900: '#7f2e05',
        },
        signal: {
          green:  '#00ff87',
          red:    '#ff3d57',
          yellow: '#ffd166',
          blue:   '#4cc9f0',
        },
        // Reading modes
        sepia: {
          bg:   '#f4ead5',
          text: '#3d2b1f',
        },
      },

      fontFamily: {
        display:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:     ['"Source Serif 4"', 'Georgia', 'serif'],
        sans:     ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:     ['"JetBrains Mono"', 'monospace'],
        reading:  ['"Literata"', '"Source Serif 4"', 'Georgia', 'serif'],
      },

      fontSize: {
        '2xs': ['0.65rem',  { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1.125rem' }],
        sm:    ['0.875rem', { lineHeight: '1.375rem' }],
        base:  ['1rem',     { lineHeight: '1.625rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl': ['3rem',     { lineHeight: '1.1' }],
        '6xl': ['3.75rem',  { lineHeight: '1.05' }],
        '7xl': ['4.5rem',   { lineHeight: '1' }],
        '8xl': ['6rem',     { lineHeight: '1' }],
        '9xl': ['8rem',     { lineHeight: '1' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '50': '12.5rem',
        '54': '13.5rem',
        '58': '14.5rem',
        '62': '15.5rem',
        '66': '16.5rem',
        '68': '17rem',
        '76': '19rem',
        '84': '21rem',
        '88': '22rem',
        '92': '23rem',
        '96': '24rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '120': '30rem',
        '128': '32rem',
        '144': '36rem',
      },

      animation: {
        'fade-in':        'fadeIn 0.6s ease-out forwards',
        'fade-up':        'fadeUp 0.7s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'slide-in-left':  'slideInLeft 0.5s ease-out forwards',
        'scale-in':       'scaleIn 0.4s ease-out forwards',
        'ticker':         'ticker 40s linear infinite',
        'pulse-ion':      'pulseIon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':        'shimmer 1.5s infinite',
        'logo-intro':     'logoIntro 2s ease-out forwards',
        'scan-line':      'scanLine 3s linear infinite',
        'float':          'float 6s ease-in-out infinite',
        'glow':           'glow 2s ease-in-out infinite alternate',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(32px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-32px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        ticker: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(-100%)' },
        },
        pulseIon: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        logoIntro: {
          '0%':   { opacity: '0', letterSpacing: '0.5em', transform: 'scale(0.8)' },
          '60%':  { opacity: '1', letterSpacing: '0.12em' },
          '100%': { opacity: '1', letterSpacing: '0.05em', transform: 'scale(1)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glow: {
          from: { textShadow: '0 0 8px rgba(6,208,245,0.4)' },
          to:   { textShadow: '0 0 24px rgba(6,208,245,0.9), 0 0 48px rgba(6,208,245,0.4)' },
        },
      },

      backgroundImage: {
        'gradient-radial':      'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':       'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh':        'radial-gradient(at 40% 20%, hsla(197,100%,47%,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.03) 0px, transparent 50%)',
        'grid-pattern':         "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300b4d8' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'shimmer-gradient':     'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },

      boxShadow: {
        'ion':      '0 0 0 1px rgba(6,208,245,0.2), 0 4px 24px rgba(6,208,245,0.08)',
        'ion-lg':   '0 0 0 1px rgba(6,208,245,0.3), 0 8px 48px rgba(6,208,245,0.15)',
        'card':     '0 1px 3px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)',
        'card-lg':  '0 4px 6px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.4)',
        'inset-ion': 'inset 0 1px 0 rgba(6,208,245,0.1)',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      backdropBlur: {
        xs: '2px',
      },

      screens: {
        xs: '480px',
      },

      typography: ({ theme }) => ({
        sciagen: {
          css: {
            '--tw-prose-body':          theme('colors.zinc[300]'),
            '--tw-prose-headings':      theme('colors.zinc[50]'),
            '--tw-prose-lead':          theme('colors.zinc[300]'),
            '--tw-prose-links':         theme('colors.ion[400]'),
            '--tw-prose-bold':          theme('colors.zinc[100]'),
            '--tw-prose-counters':      theme('colors.zinc[500]'),
            '--tw-prose-bullets':       theme('colors.zinc[600]'),
            '--tw-prose-hr':            theme('colors.zinc[700]'),
            '--tw-prose-quotes':        theme('colors.zinc[200]'),
            '--tw-prose-quote-borders': theme('colors.ion[500]'),
            '--tw-prose-captions':      theme('colors.zinc[500]'),
            '--tw-prose-code':          theme('colors.ion[300]'),
            '--tw-prose-pre-code':      theme('colors.zinc[300]'),
            '--tw-prose-pre-bg':        theme('colors.void[800]'),
            '--tw-prose-th-borders':    theme('colors.zinc[700]'),
            '--tw-prose-td-borders':    theme('colors.zinc[800]'),
            fontSize: '1.125rem',
            lineHeight: '1.85',
            fontFamily: theme('fontFamily.reading').join(', '),
            'h1, h2, h3, h4': {
              fontFamily: theme('fontFamily.display').join(', '),
              fontWeight: '700',
              letterSpacing: '-0.02em',
            },
            p: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            'blockquote p:first-of-type::before': { content: '""' },
            'blockquote p:last-of-type::after':   { content: '""' },
            blockquote: {
              borderLeftWidth: '3px',
              paddingLeft: '1.5em',
              fontStyle: 'italic',
              fontSize: '1.2em',
            },
          },
        },
      }),

      zIndex: {
        '60':  '60',
        '70':  '70',
        '80':  '80',
        '90':  '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
