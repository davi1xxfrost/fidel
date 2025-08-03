import React from 'react';
import PageTransition, { PageTransitionProps } from './PageTransition';

// Higher-order component for easy page wrapping
export const withPageTransition = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<PageTransitionProps, 'children'>
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <PageTransition {...options}>
      <Component {...props} />
    </PageTransition>
  );

  WrappedComponent.displayName = `withPageTransition(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default withPageTransition;