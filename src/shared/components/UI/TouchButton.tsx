import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { TOUCH_TARGETS, ANIMATIONS } from '../../constants/breakpoints';
import { useMobile } from '../../hooks/useResponsive';

interface TouchButtonProps extends Omit<ButtonProps, 'size'> {
  size?: 'sm' | 'md' | 'lg' | 'touch';
  haptic?: boolean;
  longPress?: boolean;
  onLongPress?: () => void;
  loading?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  className,
  size = 'md',
  haptic = true,
  longPress = false,
  onLongPress,
  loading = false,
  onClick,
  disabled,
  ...props
}) => {
  const { isTouchDevice } = useMobile();
  const [isPressed, setIsPressed] = React.useState(false);
  const longPressTimer = React.useRef<NodeJS.Timeout>();

  // Handle touch interactions
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    // Haptic feedback for touch devices
    if (haptic && isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // Long press handling
    if (longPress && onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        if (haptic && isTouchDevice && 'vibrate' in navigator) {
          navigator.vibrate([10, 50, 10]);
        }
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Clear long press timer if still active
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    onClick?.(e);
  };

  // Size mappings optimized for touch
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-10 px-3 text-sm';
      case 'md':
        return 'h-12 px-4 text-base';
      case 'lg':
        return 'h-14 px-6 text-lg';
      case 'touch':
        return `min-h-[${TOUCH_TARGETS.recommended}] px-6 text-base`;
      default:
        return 'h-12 px-4 text-base';
    }
  };

  // Touch-specific styles
  const getTouchStyles = () => {
    if (!isTouchDevice) return '';
    
    return cn(
      'touch-manipulation', // Disables double-tap zoom
      'select-none',        // Prevents text selection
      'active:scale-95',    // Touch feedback
      'transition-transform duration-150',
      isPressed && 'scale-95',
    );
  };

  return (
    <Button
      className={cn(
        getSizeClasses(),
        getTouchStyles(),
        // Loading state
        loading && 'pointer-events-none opacity-60',
        // Enhanced focus for accessibility
        'focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
      style={{
        minHeight: size === 'touch' ? TOUCH_TARGETS.recommended : undefined,
        transition: `all ${ANIMATIONS.fast} ${ANIMATIONS.easing.ease}`,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

// Floating Action Button for mobile
export const TouchFAB: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}> = ({
  children,
  onClick,
  className,
  position = 'bottom-right'
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6';
      case 'bottom-left':
        return 'fixed bottom-6 left-6';
      case 'bottom-center':
        return 'fixed bottom-6 left-1/2 transform -translate-x-1/2';
      default:
        return 'fixed bottom-6 right-6';
    }
  };

  return (
    <TouchButton
      size="touch"
      className={cn(
        getPositionClasses(),
        'rounded-full w-14 h-14 shadow-lg',
        'bg-primary hover:bg-primary/90',
        'text-primary-foreground',
        'z-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </TouchButton>
  );
};