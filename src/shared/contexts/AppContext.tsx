import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { usePWA } from '../hooks/usePWA';
import { useResponsive } from '../hooks/useResponsive';
import type { User, Barbearia, DeviceInfo, PWAInstallPrompt } from '../types';

// State interfaces
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  userRole: 'admin' | 'barbearia' | 'cliente' | null;
  
  // Barbearia state
  currentBarbearia: Barbearia | null;
  barbeariaSlug: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  
  // Mobile/PWA state
  deviceInfo: DeviceInfo;
  pwaState: PWAInstallPrompt & {
    isOnline: boolean;
    isStandalone: boolean;
    updateAvailable: boolean;
  };
  
  // Theme state
  theme: 'light' | 'dark' | 'system';
  
  // Performance state
  preloadedRoutes: Set<string>;
  optimizedImages: Map<string, string>;
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_BARBEARIA'; payload: Barbearia | null }
  | { type: 'SET_BARBEARIA_SLUG'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'UPDATE_DEVICE_INFO'; payload: DeviceInfo }
  | { type: 'UPDATE_PWA_STATE'; payload: Partial<AppState['pwaState']> }
  | { type: 'ADD_PRELOADED_ROUTE'; payload: string }
  | { type: 'CACHE_OPTIMIZED_IMAGE'; payload: { src: string; optimized: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        userRole: action.payload?.role || null,
      };
      
    case 'SET_BARBEARIA':
      return {
        ...state,
        currentBarbearia: action.payload,
      };
      
    case 'SET_BARBEARIA_SLUG':
      return {
        ...state,
        barbeariaSlug: action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
      
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
      
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
      
    case 'UPDATE_DEVICE_INFO':
      return {
        ...state,
        deviceInfo: action.payload,
      };
      
    case 'UPDATE_PWA_STATE':
      return {
        ...state,
        pwaState: {
          ...state.pwaState,
          ...action.payload,
        },
      };
      
    case 'ADD_PRELOADED_ROUTE':
      return {
        ...state,
        preloadedRoutes: new Set([...state.preloadedRoutes, action.payload]),
      };
      
    case 'CACHE_OPTIMIZED_IMAGE':
      return {
        ...state,
        optimizedImages: new Map([
          ...state.optimizedImages,
          [action.payload.src, action.payload.optimized],
        ]),
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
      
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        userRole: null,
        currentBarbearia: null,
        barbeariaSlug: null,
        error: null,
      };
      
    default:
      return state;
  }
};

// Context interface
interface AppContextType {
  // State
  state: AppState;
  
  // User actions
  setUser: (user: User | null) => void;
  logout: () => void;
  
  // Barbearia actions
  setBarbearia: (barbearia: Barbearia | null) => void;
  setBarbeariaSlug: (slug: string | null) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  toggleSidebar: () => void;
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Performance actions
  preloadRoute: (route: string) => void;
  cacheOptimizedImage: (src: string, optimized: string) => void;
  
  // PWA actions
  installPWA: () => Promise<void>;
  updateApp: () => void;
  
  // Computed values
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  canInstallPWA: boolean;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook to use context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const responsive = useResponsive();
  const pwa = usePWA();
  
  // Initial state
  const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    userRole: null,
    currentBarbearia: null,
    barbeariaSlug: null,
    isLoading: false,
    error: null,
    sidebarOpen: false,
    deviceInfo: responsive,
    pwaState: {
      ...pwa,
    },
    theme: 'system',
    preloadedRoutes: new Set(),
    optimizedImages: new Map(),
  };
  
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // User actions
  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);
  
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    // Clear localStorage/sessionStorage if needed
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
  }, []);
  
  // Barbearia actions
  const setBarbearia = useCallback((barbearia: Barbearia | null) => {
    dispatch({ type: 'SET_BARBEARIA', payload: barbearia });
  }, []);
  
  const setBarbeariaSlug = useCallback((slug: string | null) => {
    dispatch({ type: 'SET_BARBEARIA_SLUG', payload: slug });
  }, []);
  
  // UI actions
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);
  
  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);
  
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);
  
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);
  
  // Theme actions
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    localStorage.setItem('theme', theme);
  }, []);
  
  // Performance actions
  const preloadRoute = useCallback((route: string) => {
    if (!state.preloadedRoutes.has(route)) {
      dispatch({ type: 'ADD_PRELOADED_ROUTE', payload: route });
      // Route preloading would be implemented with specific imports
      // For now, just mark as preloaded for caching strategy
    }
  }, [state.preloadedRoutes]);
  
  const cacheOptimizedImage = useCallback((src: string, optimized: string) => {
    dispatch({ type: 'CACHE_OPTIMIZED_IMAGE', payload: { src, optimized } });
  }, []);
  
  // PWA actions
  const installPWA = useCallback(async () => {
    await pwa.install();
  }, [pwa]);
  
  const updateApp = useCallback(() => {
    pwa.reloadApp();
  }, [pwa]);
  
  // Update device info when responsive changes
  React.useEffect(() => {
    dispatch({ type: 'UPDATE_DEVICE_INFO', payload: responsive });
  }, [responsive]);
  
  // Update PWA state when PWA hook changes
  React.useEffect(() => {
    dispatch({ type: 'UPDATE_PWA_STATE', payload: pwa });
  }, [pwa]);
  
  // Initialize theme from localStorage (only once)
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []); // Remove setTheme dependency to avoid infinite loop
  
  // Auto-clear errors after 5 seconds
  React.useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]); // Remove clearError dependency
  
  // Memoized context value
  const contextValue = useMemo<AppContextType>(() => ({
    state,
    setUser,
    logout,
    setBarbearia,
    setBarbeariaSlug,
    setLoading,
    setError,
    clearError,
    toggleSidebar,
    setTheme,
    preloadRoute,
    cacheOptimizedImage,
    installPWA,
    updateApp,
    isMobile: responsive.isMobile,
    isTablet: responsive.isTablet,
    isDesktop: responsive.isDesktop,
    canInstallPWA: pwa.isInstallable,
  }), [
    state,
    setUser,
    logout,
    setBarbearia,
    setBarbeariaSlug,
    setLoading,
    setError,
    clearError,
    toggleSidebar,
    setTheme,
    preloadRoute,
    cacheOptimizedImage,
    installPWA,
    updateApp,
    responsive.isMobile,
    responsive.isTablet,
    responsive.isDesktop,
    pwa.isInstallable,
  ]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};