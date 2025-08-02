import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    // Mobile-first breakpoints
    screens: {
      'xs': '320px',   // Extra small phones
      'sm': '375px',   // Small phones
      'md': '768px',   // Tablets
      'lg': '1024px',  // Small laptops
      'xl': '1280px',  // Large laptops
      '2xl': '1536px', // Desktop
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        'pure-white': 'hsl(var(--pure-white))',
        'pure-black': 'hsl(var(--pure-black))',
        'gray-dark': 'hsl(var(--gray-dark))',
        'gray-medium': 'hsl(var(--gray-medium))',
        'gray-light': 'hsl(var(--gray-light))',
        'gray-very-light': 'hsl(var(--gray-very-light))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'DEFAULT': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      // Mobile-optimized spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      // Touch-friendly minimum sizes
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      // Mobile-optimized shadows
      boxShadow: {
        'touch': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'floating': '0 8px 32px rgba(0, 0, 0, 0.18)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'slideInUp': {
          '0%': {
            transform: 'translateY(100px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        'slideInRight': {
          '0%': {
            transform: 'translateX(100px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'slideInLeft': {
          '0%': {
            transform: 'translateX(-100px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'bounceIn': {
          '0%': {
            transform: 'scale(0.3)',
            opacity: '0'
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '1'
          },
          '70%': {
            transform: 'scale(0.9)'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-20px)'
          }
        },
        'fadeInDelayed': {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        },
        'fade-in-slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'subtle-gradient': {
          '0%': {
            background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 25%, #fdfdfd 50%, #fefefe 75%, #ffffff 100%)'
          },
          '50%': {
            background: 'linear-gradient(135deg, #fefefe 0%, #fdfdfd 25%, #fefefe 50%, #ffffff 75%, #fefefe 100%)'
          },
          '100%': {
            background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 25%, #fdfdfd 50%, #fefefe 75%, #ffffff 100%)'
          }
        },
        'pulse-subtle': {
          '0%, 100%': {
            opacity: '1'
          },
          '50%': {
            opacity: '0.8'
          }
        },
        'bounce-subtle': {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-5px)'
          }
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.9)',
            opacity: '0'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        'rotate-slow': {
          '0%': {
            transform: 'rotate(0deg)'
          },
          '100%': {
            transform: 'rotate(360deg)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-up': 'slideInUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-delayed': 'fadeInDelayed 0.8s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-slide-up': 'fade-in-slide-up 0.3s ease-out',
        'subtle-gradient': 'subtle-gradient 30s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s ease-out',
        'rotate-slow': 'rotate-slow 20s linear infinite'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [animate],
} satisfies Config;
