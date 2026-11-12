import { AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { PageTransition } from './PageTransition';

interface RouteTransitionProps {
  pathname: string;
  isStudioPage: boolean;
  children: ReactNode;
}

export function RouteTransition({ pathname, isStudioPage, children }: RouteTransitionProps) {
  if (isStudioPage) {
    return (
      <div key={pathname} className="page-transition-wrapper">
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={pathname}>{children}</PageTransition>
    </AnimatePresence>
  );
}
