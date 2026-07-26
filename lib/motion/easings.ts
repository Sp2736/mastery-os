import { useEffect, useState } from 'react';

/**
 * Standardized easing curves for Framer Motion or CSS transitions.
 */
export const easings = {
  easeOutExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOutCubic: [0.65, 0, 0.35, 1] as [number, number, number, number],
  springPlayful: { type: 'spring', stiffness: 300, damping: 20 },
};

/**
 * Hook to detect prefers-reduced-motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns accessible motion variants. If prefers-reduced-motion is true,
 * it strips out transforms and uses simple opacity fades.
 */
export function useMotionSafe(variants: any) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!prefersReducedMotion) return variants;

  // Simple downgrade: strip everything but opacity
  const safeVariants: any = {};
  for (const key in variants) {
    if (Object.prototype.hasOwnProperty.call(variants, key)) {
      safeVariants[key] = {
        opacity: variants[key].opacity ?? (key === 'hidden' || key === 'exit' ? 0 : 1),
        transition: { duration: 0.2 },
      };
    }
  }

  return safeVariants;
}
