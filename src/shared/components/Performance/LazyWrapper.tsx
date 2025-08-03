import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { cn } from '@/lib/utils';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  minHeight?: string;
}

// Default loading skeleton
const DefaultSkeleton: React.FC<{ minHeight?: string }> = ({ minHeight = '200px' }) => (
  <div 
    className={cn(
      'animate-pulse bg-muted rounded-lg w-full',
      'flex items-center justify-center'
    )}
    style={{ minHeight }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  </div>
);

// Default error fallback
const DefaultErrorFallback: React.FC<{ 
  error: Error; 
  resetErrorBoundary: () => void 
}> = ({ error, resetErrorBoundary }) => (
  <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
    <h3 className="text-lg font-semibold text-destructive mb-2">
      Erro ao carregar componente
    </h3>
    <p className="text-sm text-muted-foreground mb-4">
      {error.message || 'Ocorreu um erro inesperado'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
    >
      Tentar novamente
    </button>
  </div>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  className,
  errorFallback: ErrorFallback = DefaultErrorFallback,
  minHeight,
}) => {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('LazyWrapper error:', error, errorInfo);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={handleError}
        onReset={() => window.location.reload()}
      >
        <Suspense fallback={fallback || <DefaultSkeleton minHeight={minHeight} />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

// HOC for lazy loading pages
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
    preload?: boolean;
  }
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));

  const WrappedComponent: React.FC<P> = (props) => (
    <LazyWrapper
      fallback={options?.fallback}
      errorFallback={options?.errorFallback}
    >
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  // Optional preloading
  if (options?.preload) {
    // Preload component after a short delay
    setTimeout(() => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'prefetch';
      preloadLink.as = 'script';
      document.head.appendChild(preloadLink);
    }, 100);
  }

  return WrappedComponent;
};

// Component for lazy loading images
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}> = ({ src, alt, className, width, height, placeholder }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={imgRef}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
        decoding="async"
      />
      
      {!isLoaded && !hasError && (
        <div 
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            'flex items-center justify-center'
          )}
          style={{ width, height }}
        >
          {placeholder && (
            <span className="text-xs text-muted-foreground">{placeholder}</span>
          )}
        </div>
      )}
      
      {hasError && (
        <div 
          className={cn(
            'absolute inset-0 bg-muted',
            'flex items-center justify-center flex-col gap-2'
          )}
          style={{ width, height }}
        >
          <span className="text-xs text-muted-foreground">Erro ao carregar</span>
          <span className="text-xs text-muted-foreground">imagem</span>
        </div>
      )}
    </div>
  );
};