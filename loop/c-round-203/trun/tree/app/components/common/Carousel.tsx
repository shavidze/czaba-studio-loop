import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '~/components/icons';

interface CarouselProps {
  children: ReactNode[];
  itemWidth?: number; // Width of each item in pixels (default: 340)
  gap?: number; // Gap between items in pixels (default: 24)
  className?: string;
}

export function Carousel({ children, itemWidth = 340, gap = 24, className = '' }: CarouselProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const checkScrollability = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 100);
      // Track if user has scrolled (to hide swipe hint)
      if (scrollLeft > 20 && !hasScrolled) {
        setHasScrolled(true);
      }
    }
  };

  useEffect(() => {
    const checkMultipleTimes = () => {
      checkScrollability();
      requestAnimationFrame(() => {
        checkScrollability();
        setTimeout(checkScrollability, 100);
        setTimeout(checkScrollability, 300);
      });
    };

    checkMultipleTimes();

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        slider.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = itemWidth + gap;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="
            hidden lg:flex cursor-pointer
            absolute top-1/2 -translate-y-1/2 -left-5 z-20
            h-9 w-9 2xl:h-12 2xl:w-12 3xl:h-14 3xl:w-14
            rounded-full
            border-2 border-brand
            bg-surface
            text-brand text-xl 2xl:text-2xl
            items-center justify-center
            hover:bg-brand hover:text-black
            transition-all duration-150
          "
          aria-label="Scroll left"
        >
          <ChevronLeftIcon size={18} />
        </button>
      )}

      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="
          flex gap-6
          overflow-x-auto overflow-y-hidden
          scroll-smooth
          snap-x snap-mandatory
          [-webkit-overflow-scrolling:touch]
          py-2 pb-8 -mb-4
          scrollbar-hide
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {children.map((child, index) => (
          <div key={index} className="flex-none snap-start" style={{ width: `${itemWidth}px` }}>
            <div className="h-full">{child}</div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="
            hidden lg:flex cursor-pointer
            absolute top-1/2 -translate-y-1/2 -right-5 z-20
            h-9 w-9 2xl:h-12 2xl:w-12 3xl:h-14 3xl:w-14
            rounded-full
            border-2 border-brand
            bg-surface
            text-brand text-xl 2xl:text-2xl
            items-center justify-center
            hover:bg-brand hover:text-black
            transition-all duration-150
          "
          aria-label="Scroll right"
        >
          <ChevronRightIcon size={18} />
        </button>
      )}

      {/* Edge Gradients (fade effect) - Desktop */}
      <div className="hidden lg:block absolute top-0 left-0 bottom-8 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="hidden lg:block absolute top-0 right-0 bottom-8 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

      {/* Mobile: Right edge gradient + Swipe hint */}
      {canScrollRight && (
        <div className="lg:hidden absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-background/90 to-transparent pointer-events-none z-10" />
      )}

      {/* Mobile: Swipe Hint (fades after first scroll) */}
      {canScrollRight && !hasScrolled && (
        <div className="lg:hidden absolute top-1/2 right-2 -translate-y-1/2 z-20 flex items-center gap-1 animate-pulse pointer-events-none">
          <span className="text-xs text-muted">Swipe</span>
          <ChevronRightIcon size={14} className="text-muted" />
        </div>
      )}
    </div>
  );
}
