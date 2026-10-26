/**
 * Debug logging utility
 * Logs only in development mode
 */

const isDev =
  typeof process !== 'undefined'
    ? process.env.NODE_ENV === 'development'
    : typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const debug = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  // Grouped logging for related operations
  group: (label: string) => {
    if (isDev) {
      console.group(label);
    }
  },
  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },
};
