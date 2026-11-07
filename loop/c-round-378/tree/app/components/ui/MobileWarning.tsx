import { AnimatePresence, motion } from 'framer-motion';
import { Monitor, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MobileWarningProps {
  title?: string;
  description?: string;
  breakpoint?: number;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function MobileWarning({
  title = 'Best on Desktop',
  description = 'This experience is optimized for larger screens. For the best experience, please use a desktop or laptop computer.',
  breakpoint = 1024,
  dismissible = true,
  onDismiss,
}: MobileWarningProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (!isMobile || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-x-0 bottom-0 z-50 p-4 md:hidden"
      >
        <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 border border-outline rounded-2xl p-5 shadow-2xl backdrop-blur-md">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand/10 via-transparent to-accent/10 rounded-2xl" />

          {/* Close button */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-2 text-dim hover:text-foreground transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          )}

          <div className="relative flex items-start gap-4">
            {/* Icons */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-brand" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-elevated rounded-full flex items-center justify-center border border-outline">
                <Smartphone size={12} className="text-muted" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pr-6">
              <h3 className="text-foreground font-semibold mb-1">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Full-screen overlay version for truly desktop-only features
export function MobileBlocker({
  title = 'Desktop Only',
  description = 'This feature requires a desktop browser for the full experience.',
  showContinueAnyway = false,
  onContinue,
}: {
  title?: string;
  description?: string;
  showContinueAnyway?: boolean;
  onContinue?: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [showAnyway, setShowAnyway] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || showAnyway) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-sm">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl flex items-center justify-center border border-outline"
        >
          <Monitor className="w-10 h-10 text-brand" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-2xl font-bold text-foreground mb-3"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-muted mb-8 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Continue anyway button */}
        {showContinueAnyway && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onClick={() => {
              setShowAnyway(true);
              onContinue?.();
            }}
            className="px-6 py-3 bg-elevated border border-outline text-foreground rounded-lg font-medium hover:bg-muted-bg transition-colors cursor-pointer"
          >
            Continue Anyway
          </motion.button>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-dim text-xs">
        <Smartphone size={14} />
        <span>Mobile detected</span>
      </div>
    </div>
  );
}
