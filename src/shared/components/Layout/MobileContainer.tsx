import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '../../hooks/useResponsive';
import { SPACING } from '../../constants/breakpoints';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'mobile' | 'tablet' | 'desktop' | 'full';
  centerContent?: boolean;
  safeArea?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  padding = 'md',
  maxWidth = 'full',
  centerContent = false,
  safeArea = true,
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getPaddingClass = () => {
    if (padding === 'none') return '';
    
    const mobileSpacing = SPACING.container.mobile;
    const tabletSpacing = SPACING.container.tablet;
    const desktopSpacing = SPACING.container.desktop;

    switch (padding) {
      case 'sm':
        return `px-2 sm:px-3 lg:px-4`;
      case 'md':
        return `px-4 sm:px-6 lg:px-8`;
      case 'lg':
        return `px-6 sm:px-8 lg:px-12`;
      default:
        return `px-4 sm:px-6 lg:px-8`;
    }
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      case 'desktop':
        return 'max-w-4xl';
      case 'full':
      default:
        return 'max-w-full';
    }
  };

  return (
    <div
      className={cn(
        'w-full',
        getPaddingClass(),
        getMaxWidthClass(),
        centerContent && 'mx-auto',
        safeArea && [
          'pb-safe-bottom', // For iOS safe area
          'pt-safe-top',    // For iOS safe area
        ],
        // Mobile-specific optimizations
        isMobile && [
          'min-h-screen',
          'touch-manipulation', // Optimizes touch interactions
        ],
        className
      )}
      style={{
        // CSS custom properties for safe area
        paddingBottom: safeArea ? 'max(1rem, env(safe-area-inset-bottom))' : undefined,
        paddingTop: safeArea ? 'max(0.5rem, env(safe-area-inset-top))' : undefined,
      }}
    >
      {children}
    </div>
  );
};

// Specialized containers for different use cases
export const MobilePageContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <MobileContainer
    className={cn('min-h-screen bg-background', className)}
    padding="md"
    centerContent={false}
    safeArea={true}
  >
    {children}
  </MobileContainer>
);

export const MobileCardContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <MobileContainer
    className={cn(
      'bg-card rounded-lg border shadow-sm',
      'p-4 sm:p-6',
      className
    )}
    padding="none"
    maxWidth="tablet"
    centerContent={true}
  >
    {children}
  </MobileContainer>
);

export const MobileFormContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <MobileContainer
    className={cn(
      'space-y-4',
      className
    )}
    padding="md"
    maxWidth="mobile"
    centerContent={true}
  >
    {children}
  </MobileContainer>
);