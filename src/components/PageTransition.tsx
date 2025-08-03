import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/shared/contexts/AppContext';

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transition?: 'fade' | 'slide' | 'scale';
  duration?: number;
  showLoadingBar?: boolean;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  transition = 'fade',
  duration = 300,
  showLoadingBar = true,
}) => {
  const location = useLocation();
  const { state } = useApp();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      setLoadingProgress(0);

      // Start loading progress animation
      if (showLoadingBar) {
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 30;
          });
        }, 50);

        // Clear interval on cleanup
        transitionTimeoutRef.current = setTimeout(() => {
          clearInterval(progressInterval);
        }, duration);
      }

      // Wait for transition to complete
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
        setLoadingProgress(100);
        
        // Hide progress bar after completing
        setTimeout(() => {
          setLoadingProgress(0);
        }, 200);
      }, duration / 2);

      return () => {
        clearTimeout(timeout);
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
      };
    }
  }, [location, displayLocation, duration, showLoadingBar]);

  // If app is loading, show loading state
  if (state.isLoading) {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center bg-background',
        className
      )}>
        <LoadingSpinner />
      </div>
    );
  }

  const getTransitionClasses = () => {
    const baseClasses = 'transition-all ease-in-out';
    
    switch (transition) {
      case 'slide':
        return cn(
          baseClasses,
          isTransitioning ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        );
      case 'scale':
        return cn(
          baseClasses,
          isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        );
      case 'fade':
      default:
        return cn(
          baseClasses,
          isTransitioning ? 'opacity-0' : 'opacity-100'
        );
    }
  };

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Loading progress bar */}
      {showLoadingBar && loadingProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* Page content with transition */}
      <div
        className={getTransitionClasses()}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {children}
      </div>

      {/* Navigation indicator for screen readers */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {isTransitioning ? 'Navegando...' : `Página atual: ${displayLocation.pathname}`}
      </div>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-muted rounded-full" />
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
    <div className="text-center">
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);



export default PageTransition;