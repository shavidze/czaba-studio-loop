import type { ElementType, ReactNode } from 'react';
import { PageContainer } from './PageContainer';

interface SectionProps {
  children: ReactNode;
  /** Vertical padding size */
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Background color */
  background?: 'default' | 'surface' | 'elevated' | 'transparent';
  /** Container max-width */
  containerSize?: 'narrow' | 'default' | 'wide' | 'full';
  /** Skip container wrapper (for full-bleed content) */
  fullBleed?: boolean;
  /** Additional section classes */
  className?: string;
  /** Additional container classes */
  containerClassName?: string;
  /** HTML element to render */
  as?: ElementType;
  /** Section id for anchor links */
  id?: string;
}

const spacingClasses = {
  none: '',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-20',
  lg: 'py-16 md:py-24',
  xl: 'py-20 md:py-32',
};

const bgClasses = {
  default: 'bg-background',
  surface: 'bg-surface',
  elevated: 'bg-elevated',
  transparent: 'bg-transparent',
};

/**
 * Section - Consistent section layout with spacing and container
 *
 * Usage:
 * ```tsx
 * <Section>Default section content</Section>
 *
 * <Section spacing="lg" background="surface">
 *   Large spacing with surface background
 * </Section>
 *
 * <Section fullBleed>
 *   Full-width content (no container)
 * </Section>
 * ```
 */
export function Section({
  children,
  spacing = 'md',
  background = 'default',
  containerSize = 'default',
  fullBleed = false,
  className = '',
  containerClassName = '',
  as: Component = 'section',
  id,
}: SectionProps) {
  return (
    <Component
      id={id}
      className={`relative ${spacingClasses[spacing]} ${bgClasses[background]} ${className}`}
    >
      {fullBleed ? (
        children
      ) : (
        <PageContainer size={containerSize} className={containerClassName}>
          {children}
        </PageContainer>
      )}
    </Component>
  );
}
