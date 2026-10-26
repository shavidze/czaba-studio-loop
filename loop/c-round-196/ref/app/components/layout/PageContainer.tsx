import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Maximum width variant */
  size?: 'default' | 'narrow' | 'wide' | 'full';
}

const sizeClasses = {
  narrow: 'max-w-4xl', // 896px - for text-heavy content
  default: 'max-w-7xl', // 1280px - standard
  wide: 'max-w-[1400px]', // 1400px - for galleries
  full: 'max-w-none', // full width
};

/**
 * PageContainer - Consistent horizontal padding and max-width
 *
 * Usage:
 * ```tsx
 * <PageContainer>Content here</PageContainer>
 * <PageContainer size="narrow">Narrow content</PageContainer>
 * ```
 */
export function PageContainer({ children, className = '', size = 'default' }: PageContainerProps) {
  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}
