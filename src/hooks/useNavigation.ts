import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/shared/contexts/AppContext';

interface NavigationState {
  isNavigating: boolean;
  previousPath: string | null;
  error: string | null;
}

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { state: appState, setLoading, setError } = useApp();
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    previousPath: null,
    error: null,
  });

  // Enhanced navigation function with loading states and error handling
  const navigateWithLoading = useCallback(
    async (to: string, options: { replace?: boolean; state?: any } = {}) => {
      try {
        setNavigationState(prev => ({
          ...prev,
          isNavigating: true,
          error: null,
        }));
        
        setLoading(true);
        
        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        navigate(to, options);
        
        // Track previous path
        setNavigationState(prev => ({
          ...prev,
          previousPath: location.pathname,
        }));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro de navegação';
        setNavigationState(prev => ({
          ...prev,
          error: errorMessage,
        }));
        setError(errorMessage);
        console.error('Navigation error:', error);
      } finally {
        setNavigationState(prev => ({
          ...prev,
          isNavigating: false,
        }));
        setLoading(false);
      }
    },
    [navigate, location.pathname, setLoading, setError]
  );

  // Smart back navigation
  const goBack = useCallback(() => {
    if (navigationState.previousPath) {
      navigateWithLoading(navigationState.previousPath);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home page
      navigateWithLoading('/');
    }
  }, [navigationState.previousPath, navigateWithLoading]);

  // Role-based navigation helpers
  const navigateToUserHome = useCallback(() => {
    const { userRole } = appState;
    switch (userRole) {
      case 'admin':
        navigateWithLoading('/admin-dashboard');
        break;
      case 'barbearia':
        if (appState.barbeariaSlug) {
          navigateWithLoading(`/${appState.barbeariaSlug}/dashboard`);
        } else {
          navigateWithLoading('/login');
        }
        break;
      case 'cliente':
        navigateWithLoading('/cliente-meu-cartao');
        break;
      default:
        navigateWithLoading('/');
    }
  }, [appState, navigateWithLoading]);

  // Barbearia-specific navigation helpers
  const navigateToBarbeariaPage = useCallback(
    (page: string) => {
      const { slug } = params;
      if (!slug) {
        setError('Slug da barbearia não encontrado');
        return;
      }
      navigateWithLoading(`/${slug}/${page}`);
    },
    [params, navigateWithLoading, setError]
  );

  // Client-specific navigation helpers
  const navigateToClientePage = useCallback(
    (page: string) => {
      navigateWithLoading(`/cliente-${page}`);
    },
    [navigateWithLoading]
  );

  // Admin-specific navigation helpers
  const navigateToAdminPage = useCallback(
    (page: string) => {
      navigateWithLoading(`/admin-${page}`);
    },
    [navigateWithLoading]
  );

  // Preload route function
  const preloadRoute = useCallback(
    (routePath: string) => {
      if (!appState.preloadedRoutes.has(routePath)) {
        // Mark route as preloaded
        appState.preloadedRoutes.add(routePath);
        
        // Create invisible link for prefetch
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = routePath;
        document.head.appendChild(link);
        
        // Remove after 5 seconds to avoid memory bloat
        setTimeout(() => {
          document.head.removeChild(link);
        }, 5000);
      }
    },
    [appState.preloadedRoutes]
  );

  // Auto-preload related routes based on current page
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Preload logic based on current page
    if (currentPath.includes('dashboard')) {
      if (currentPath.includes('admin')) {
        preloadRoute('/admin-gestao-clientes');
        preloadRoute('/admin-relatorios');
      } else if (params.slug) {
        preloadRoute(`/${params.slug}/clientes`);
        preloadRoute(`/${params.slug}/scan-qrcode`);
      }
    } else if (currentPath.includes('cliente-meu-cartao')) {
      preloadRoute('/cliente-recompensas');
      preloadRoute('/cliente-historico');
    }
  }, [location.pathname, params.slug, preloadRoute]);

  // Clear navigation error when location changes
  useEffect(() => {
    if (navigationState.error) {
      setNavigationState(prev => ({
        ...prev,
        error: null,
      }));
    }
  }, [location.pathname, navigationState.error]);

  return {
    // Basic navigation
    navigate: navigateWithLoading,
    goBack,
    location,
    params,
    
    // State
    isNavigating: navigationState.isNavigating,
    navigationError: navigationState.error,
    previousPath: navigationState.previousPath,
    
    // Smart navigation helpers
    navigateToUserHome,
    navigateToBarbeariaPage,
    navigateToClientePage,
    navigateToAdminPage,
    
    // Performance helpers
    preloadRoute,
    
    // Current route info
    currentPath: location.pathname,
    currentSlug: params.slug,
    searchParams: new URLSearchParams(location.search),
  };
};