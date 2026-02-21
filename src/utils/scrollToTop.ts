/**
 * Utility to scroll to top of page smoothly
 */

export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};

export const scrollToTopInstant = () => {
  window.scrollTo(0, 0);
};

// Hook for scroll to top on mount
export const useScrollToTop = () => {
  scrollToTopInstant();
};
