/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '2.5rem', lg: '3.75rem' },
      screens: { '2xl': '1280px' }
    },
    extend: {
      colors: {
        brand: {
          50: '#FFF7EB', 100: '#FFEBCC', 300: '#FFC266',
          500: '#FF9500', 600: '#E07E00', 700: '#B36400'
        },
        ink: {
          DEFAULT: '#111827', soft: '#374151', mute: '#6B7280',
          deep: '#1F2937', darker: '#111C2B'
        },
        sea: { 400: '#38BDF8', 500: '#0EA5E9', 600: '#0284C7', 900: '#0C2438' },
        ok: '#10B981',
        warn: '#EF4444',
        canvas: '#F9FAFB',
        border: 'hsl(var(--border, 214.3 31.8% 91.4%))',
        input: 'hsl(var(--input, 214.3 31.8% 91.4%))',
        ring: 'hsl(var(--ring, 24.6 95% 53.1%))',
        background: 'hsl(var(--background, 0 0% 100%))',
        foreground: 'hsl(var(--foreground, 222.2 84% 4.9%))',
        primary: {
          DEFAULT: 'hsl(var(--primary, 24.6 95% 53.1%))',
          foreground: 'hsl(var(--primary-foreground, 60 9.1% 97.8%))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary, 210 40% 96.1%))',
          foreground: 'hsl(var(--secondary-foreground, 222.2 47.4% 11.2%))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive, 0 84.2% 60.2%))',
          foreground: 'hsl(var(--destructive-foreground, 210 40% 98%))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted, 210 40% 96.1%))',
          foreground: 'hsl(var(--muted-foreground, 215.4 16.3% 46.9%))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent, 210 40% 96.1%))',
          foreground: 'hsl(var(--accent-foreground, 222.2 47.4% 11.2%))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover, 0 0% 100%))',
          foreground: 'hsl(var(--popover-foreground, 222.2 84% 4.9%))',
        },
        card: {
          DEFAULT: 'hsl(var(--card, 0 0% 100%))',
          foreground: 'hsl(var(--card-foreground, 222.2 84% 4.9%))',
        }
      },
      fontFamily: {
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,24,39,.04), 0 12px 32px -18px rgba(17,24,39,.35)',
        lift: '0 18px 44px -20px rgba(17,24,39,.45)'
      },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(18px)' }, '100%': { opacity: 1, transform: 'none' } },
        pop: { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'none' } },
        drift: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } }
      },
      animation: {
        rise: 'rise .6s cubic-bezier(.22,.9,.32,1) both',
        pop: 'pop .22s ease-out both',
        drift: 'drift 7s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
