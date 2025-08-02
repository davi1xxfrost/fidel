import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants/breakpoints';
import type { DeviceInfo } from '../types';

interface UseResponsiveReturn extends DeviceInfo {
  screenWidth: number;
  screenHeight: number;
  isPortrait: boolean;
  isLandscape: boolean;
  breakpoint: keyof typeof BREAKPOINTS;
}

export const useResponsive = (): UseResponsiveReturn => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    // Initial setup
    handleResize();
    handleOrientationChange();

    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Device detection
  const isMobile = screenSize.width < parseInt(BREAKPOINTS.md);
  const isTablet = screenSize.width >= parseInt(BREAKPOINTS.md) && screenSize.width < parseInt(BREAKPOINTS.lg);
  const isDesktop = screenSize.width >= parseInt(BREAKPOINTS.lg);

  // Breakpoint detection
  const getBreakpoint = (): keyof typeof BREAKPOINTS => {
    if (screenSize.width < parseInt(BREAKPOINTS.sm)) return 'xs';
    if (screenSize.width < parseInt(BREAKPOINTS.md)) return 'sm';
    if (screenSize.width < parseInt(BREAKPOINTS.lg)) return 'md';
    if (screenSize.width < parseInt(BREAKPOINTS.xl)) return 'lg';
    if (screenSize.width < parseInt(BREAKPOINTS['2xl'])) return 'xl';
    return '2xl';
  };

  // Platform detection
  const getPlatform = (): string => {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('win')) return 'windows';
    if (userAgent.includes('linux')) return 'linux';
    return 'unknown';
  };

  return {
    screenWidth: screenSize.width,
    screenHeight: screenSize.height,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    breakpoint: getBreakpoint(),
    platform: getPlatform(),
  };
};

// Hook for checking specific breakpoints
export const useBreakpoint = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  const { screenWidth } = useResponsive();
  return screenWidth >= parseInt(BREAKPOINTS[breakpoint]);
};

// Hook for mobile-specific behavior
export const useMobile = () => {
  const responsive = useResponsive();
  
  return {
    ...responsive,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isStandalone: typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
    canInstall: 'serviceWorker' in navigator && 'PushManager' in window,
  };
};