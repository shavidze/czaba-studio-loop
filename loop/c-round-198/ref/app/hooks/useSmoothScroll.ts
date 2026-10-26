import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

/**
 * Smooth Scroll Hook using Lenis
 *
 * Provides a premium, cinematic scrolling experience.
 * Automatically handles cleanup on unmount.
 *
 * @see https://lenis.studiofreight.com/
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2, // Scroll animation duration
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), // Smooth easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
