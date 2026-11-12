import { useLocation } from '@remix-run/react';
import { motion, type Variants } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Cinematic fade transition - elegant, not flashy
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className="page-transition-wrapper"
    >
      {children}
    </motion.div>
  );
}

// For wrapping entire page content with transition
export function PageWrapper({ children }: PageTransitionProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.main>
  );
}
