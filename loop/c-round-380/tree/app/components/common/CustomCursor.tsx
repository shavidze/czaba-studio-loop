import { useEffect, useRef, useState } from 'react';

/**
 * Custom Cursor - Cinematic, Premium Feel
 *
 * Features:
 * - Smooth following motion
 * - Scale up on interactive elements
 * - Blend mode for visual interest
 * - Hidden on touch devices
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    if (isTouch) return;

    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);
    };

    // Mouse leave handler (when leaving viewport)
    const onMouseLeave = () => {
      setIsVisible(false);
    };

    // Check for interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor-hover]',
      );
      setIsHovering(!!interactive);
    };

    // Smooth animation loop
    const animate = () => {
      // Smooth interpolation
      const ease = 0.15;
      cursorX += (mouseX - cursorX) * ease;
      cursorY += (mouseY - cursorY) * ease;

      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver);

    const animationId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animationId);
    };
  }, [isTouch]);

  // Don't render on touch devices or SSR
  if (isTouch || typeof window === 'undefined') return null;

  return (
    <>
      {/* Outer ring - follows with lag */}
      <div
        ref={cursorRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[10000]
          w-10 h-10 -ml-5 -mt-5
          rounded-full border border-foreground/30
          transition-all duration-300 ease-out
          ${isHovering ? 'scale-150 border-brand/50' : 'scale-100'}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ mixBlendMode: 'difference' }}
      />

      {/* Inner dot - follows immediately */}
      <div
        ref={cursorDotRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[10000]
          w-1.5 h-1.5 -ml-[3px] -mt-[3px]
          rounded-full bg-foreground
          transition-all duration-150
          ${isHovering ? 'scale-0' : 'scale-100'}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Hide default cursor globally */}
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
