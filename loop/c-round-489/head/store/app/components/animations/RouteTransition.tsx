import { AnimatePresence } from 'framer-motion';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { readRouteName } from '~/lib/route-name';
import { PageTransition } from './PageTransition';
import { RouteAnnouncer } from './RouteAnnouncer';

const REPEAT_MARK = String.fromCharCode(160);

interface RouteTransitionProps {
  pathname: string;
  isStudioPage: boolean;
  children: ReactNode;
}

export function RouteTransition({ pathname, isStudioPage, children }: RouteTransitionProps) {
  const [announcement, setAnnouncement] = useState('');
  const announcedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (announcedPathRef.current === null) {
      announcedPathRef.current = pathname;
      return;
    }
    if (announcedPathRef.current === pathname) return;
    announcedPathRef.current = pathname;
    const frame = requestAnimationFrame(() => {
      const name = readRouteName(document);
      setAnnouncement((previous) =>
        name !== '' && previous === name ? `${name}${REPEAT_MARK}` : name,
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  if (isStudioPage) {
    return (
      <>
        <RouteAnnouncer message={announcement} />
        <div key={pathname} className="page-transition-wrapper">
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <RouteAnnouncer message={announcement} />
      <AnimatePresence mode="wait">
        <PageTransition key={pathname}>{children}</PageTransition>
      </AnimatePresence>
    </>
  );
}
