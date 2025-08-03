import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/hooks/useNavigation';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/shared/contexts/AppContext';

const NavigationTest: React.FC = () => {
  const { 
    navigate, 
    goBack, 
    isNavigating, 
    navigationError, 
    currentPath, 
    preloadRoute,
    navigateToUserHome,
    navigateToBarbeariaPage,
    navigateToClientePage,
    navigateToAdminPage 
  } = useNavigation();
  
  const { state } = useApp();

  const testRoutes = [
    { path: '/', label: 'Home', type: 'public' },
    { path: '/login', label: 'Login', type: 'public' },
    { path: '/cadastro-cliente', label: 'Cadastro Cliente', type: 'public' },
    { path: '/admin', label: 'Admin Login', type: 'admin' },
    { path: '/admin-dashboard', label: 'Admin Dashboard', type: 'admin' },
    { path: '/cliente-meu-cartao', label: 'Cliente Cartão', type: 'cliente' },
    { path: '/cliente-recompensas', label: 'Cliente Recompensas', type: 'cliente' },
  ];

  const handleTestNavigation = async (path: string) => {
    try {
      await navigate(path);
    } catch (error) {
      console.error('Navigation test failed:', error);
    }
  };

  const handlePreloadTest = (path: string) => {
    preloadRoute(path);
    console.log(`Preloaded route: ${path}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-background/95 backdrop-blur border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            Navigation Test
            <Badge variant={isNavigating ? "destructive" : "default"}>
              {isNavigating ? "Navigating..." : "Ready"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current State */}
          <div className="text-xs space-y-1">
            <div><strong>Current Path:</strong> {currentPath}</div>
            <div><strong>User Role:</strong> {state.userRole || 'none'}</div>
            <div><strong>Is Loading:</strong> {state.isLoading ? 'Yes' : 'No'}</div>
            {navigationError && (
              <div className="text-destructive">
                <strong>Error:</strong> {navigationError}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={goBack}
              disabled={isNavigating}
              className="w-full"
            >
              ← Go Back
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={navigateToUserHome}
              disabled={isNavigating}
              className="w-full"
            >
              🏠 User Home
            </Button>
          </div>

          {/* Test Routes */}
          <div className="space-y-1">
            <div className="text-xs font-medium">Test Routes:</div>
            <div className="grid grid-cols-2 gap-1">
              {testRoutes.map((route) => (
                <div key={route.path} className="space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTestNavigation(route.path)}
                    disabled={isNavigating}
                    className="w-full text-xs p-1 h-auto"
                    title={route.path}
                  >
                    {route.label}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreloadTest(route.path)}
                    className="w-full text-xs p-1 h-auto"
                    title={`Preload ${route.path}`}
                  >
                    📱 Preload
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Role-based Navigation */}
          <div className="space-y-1">
            <div className="text-xs font-medium">Role Navigation:</div>
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigateToAdminPage('dashboard')}
                disabled={isNavigating}
                className="text-xs p-1 h-auto"
              >
                Admin
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigateToClientePage('meu-cartao')}
                disabled={isNavigating}
                className="text-xs p-1 h-auto"
              >
                Cliente
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigateToBarbeariaPage('dashboard')}
                disabled={isNavigating}
                className="text-xs p-1 h-auto col-span-2"
              >
                Barbearia
              </Button>
            </div>
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs">
              <summary className="cursor-pointer">Debug Info</summary>
              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify({
                  isAuthenticated: state.isAuthenticated,
                  userRole: state.userRole,
                  barbeariaSlug: state.barbeariaSlug,
                  isLoading: state.isLoading,
                  error: state.error,
                  preloadedRoutesCount: state.preloadedRoutes.size,
                }, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationTest;