import React, { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "./shared/contexts/AppContext";
import { LazyWrapper } from "./shared/components/Performance/LazyWrapper";
import { ErrorBoundary } from "react-error-boundary";

// Lazy load routes for better performance
const AppRoutes = React.lazy(() => import("./routes"));

// Enhanced QueryClient configuration for mobile optimization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        const errorObj = error as { status?: number };
        if (errorObj?.status && errorObj.status >= 400 && errorObj.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Mobile-specific optimizations
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

// Global error fallback
const ErrorFallback: React.FC<{ 
  error: Error; 
  resetErrorBoundary: () => void 
}> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
    <div className="max-w-md w-full text-center space-y-4">
      <div className="text-6xl">⚠️</div>
      <h1 className="text-2xl font-bold text-destructive">
        Algo deu errado
      </h1>
      <p className="text-muted-foreground">
        Ocorreu um erro inesperado. Por favor, tente novamente.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Tentar Novamente
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="text-left text-sm text-muted-foreground mt-4">
          <summary className="cursor-pointer">Detalhes do erro</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Loading component
const AppLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground">Carregando aplicação...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  // Register service worker
  React.useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          if (process.env.NODE_ENV === 'development') {
            console.log('SW registered: ', registration);
          }
        })
        .catch(registrationError => {
          if (process.env.NODE_ENV === 'development') {
            console.log('SW registration failed: ', registrationError);
          }
        });
    }
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('App Error:', error, errorInfo);
        }
        // Here you could send error to monitoring service
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <TooltipProvider>
            <BrowserRouter 
              future={{ 
                v7_startTransition: true, 
                v7_relativeSplatPath: true 
              }}
            >
              <LazyWrapper fallback={<AppLoading />}>
                <Suspense fallback={<AppLoading />}>
                  <AppRoutes />
                </Suspense>
              </LazyWrapper>
              
              {/* Toast notifications optimized for mobile */}
              <Toaster 
                position="top-center"
                richColors
                closeButton
                duration={4000}
                toastOptions={{
                  style: {
                    minHeight: '48px', // Touch-friendly height
                  },
                  className: 'touch-manipulation',
                }}
                // Mobile-specific positioning
                className="sm:top-4 top-2"
              />
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
