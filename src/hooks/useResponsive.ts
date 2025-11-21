import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide-desktop';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideDesktop: boolean;
  breakpoint: Breakpoint;
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function useResponsive(): ResponsiveState {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'mobile';
    
    const width = window.innerWidth;
    if (width >= 1440) return 'wide-desktop';
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      const width = window.innerWidth;
      let newBreakpoint: Breakpoint;
      
      if (width >= 1440) {
        newBreakpoint = 'wide-desktop';
      } else if (width >= 1024) {
        newBreakpoint = 'desktop';
      } else if (width >= 768) {
        newBreakpoint = 'tablet';
      } else {
        newBreakpoint = 'mobile';
      }
      
      setBreakpoint(newBreakpoint);
    }, 150);

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide-desktop',
    isWideDesktop: breakpoint === 'wide-desktop',
    breakpoint,
  };
}
