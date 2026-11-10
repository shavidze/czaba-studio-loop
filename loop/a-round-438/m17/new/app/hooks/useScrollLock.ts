import { useEffect } from 'react';

/**
 * Custom hook to lock/unlock body scroll
 * Useful for modals, popups, and overlays
 *
 * @param isLocked - Whether the scroll should be locked
 *
 * @example
 * ```tsx
 * function Modal({ isOpen }) {
 *   useScrollLock(isOpen);
 *   return <div>...</div>;
 * }
 * ```
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // Save current scroll position
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const lockedScrollY = window.scrollY;

      // Lock scroll on body only
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('position', 'fixed', 'important');
      document.body.style.setProperty('width', '100%', 'important');
      document.body.style.top = `-${lockedScrollY}px`;

      // Prevent layout shift by adding padding equal to scrollbar width
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      // Get scroll position before unlocking
      const scrollY = document.body.style.top;

      // Unlock scroll
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('width');
      document.body.style.removeProperty('top');
      document.body.style.paddingRight = '';

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    // Cleanup on unmount
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('width');
      document.body.style.removeProperty('top');
      document.body.style.paddingRight = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    };
  }, [isLocked]);
}
