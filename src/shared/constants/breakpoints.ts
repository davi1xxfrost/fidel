// Mobile-first responsive breakpoints
export const BREAKPOINTS = {
  // Mobile first approach
  xs: '320px',   // Extra small phones
  sm: '375px',   // Small phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Large laptops
  '2xl': '1536px', // Desktop
} as const;

// Tailwind breakpoint classes for conditional rendering
export const SCREEN_CLASSES = {
  mobile: 'sm:hidden',
  tablet: 'hidden sm:block lg:hidden',
  desktop: 'hidden lg:block',
  mobileTablet: 'lg:hidden',
  tabletDesktop: 'hidden sm:block',
} as const;

// Container max widths for different screens
export const CONTAINER_WIDTHS = {
  mobile: '100%',
  tablet: '640px',
  desktop: '1024px',
  wide: '1280px',
} as const;

// Common spacing for mobile-first design
export const SPACING = {
  // Mobile spacing (base)
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  
  // Container padding
  container: {
    mobile: '1rem',    // 16px
    tablet: '1.5rem',  // 24px
    desktop: '2rem',   // 32px
  },
  
  // Component spacing
  component: {
    mobile: '0.75rem', // 12px
    tablet: '1rem',    // 16px
    desktop: '1.25rem', // 20px
  },
} as const;

// Touch-friendly sizing for mobile
export const TOUCH_TARGETS = {
  minHeight: '44px',    // iOS minimum
  minWidth: '44px',     // iOS minimum
  recommended: '48px',  // Android recommendation
  comfortable: '56px',  // Large touch target
} as const;

// Animation durations optimized for mobile
export const ANIMATIONS = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  
  // Mobile-specific easing
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;