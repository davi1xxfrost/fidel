import { useState, useEffect, useCallback } from 'react';
import type { PWAInstallPrompt } from '../types';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn extends PWAInstallPrompt {
  isOnline: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  install: () => Promise<void>;
  updateAvailable: boolean;
  reloadApp: () => void;
}

export const usePWA = (): UsePWAReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Check if app is running in standalone mode
  const [isStandalone] = useState(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as { standalone?: boolean }).standalone === true;
  });

  // Check if PWA can be installed
  const canInstall = 'serviceWorker' in navigator && 'PushManager' in window;

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });

      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  // Install PWA
  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to install PWA:', error);
      }
    }
  }, [deferredPrompt]);

  // Reload app to apply updates
  const reloadApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    window.location.reload();
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    deferredPrompt,
    isOnline,
    isStandalone,
    canInstall,
    install,
    updateAvailable,
    reloadApp,
  };
};

// Hook for managing app updates
export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const updateApp = useCallback(async () => {
    if (!updateAvailable) return;
    
    setIsUpdating(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
      
      // Wait a bit for the service worker to take control
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update app:', error);
      }
      setIsUpdating(false);
    }
  }, [updateAvailable]);

  return {
    updateAvailable,
    isUpdating,
    updateApp,
  };
};