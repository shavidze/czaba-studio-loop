import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind CSS classes
 * - clsx: conditional class joining
 * - twMerge: intelligently merges Tailwind classes (avoids conflicts)
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-brand', className)
 * cn('text-sm text-muted', 'text-lg') // → 'text-lg text-muted' (twMerge resolves conflict)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
