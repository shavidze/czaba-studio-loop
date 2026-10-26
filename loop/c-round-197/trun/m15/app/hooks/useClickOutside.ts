import { type RefObject, useEffect } from 'react';

/**
 * Hook that handles clicks outside of the passed ref
 * @param ref - React ref object
 * @param handler - Callback function to execute when click outside is detected
 */
export function useClickOutside(ref: RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, handler]);
}
