import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '~/lib/utils';

// შესასვლელი ანიმაცია: სრული ხანგრძლივობა mount-იდან unmount-მდე, exit fade-ის ჩათვლით
export const SPOTLIGHT_ENTRANCE_TOTAL_MS = 1150;
const SPOTLIGHT_AT_MS = 100;
const REVEAL_AT_MS = 250;
const HOLD_AT_MS = 450;
const EXIT_AT_MS = 900;
const SPOTLIGHT_DURATION = 0.3;
const LOGO_FADE_DURATION = 0.25;
const EXIT_DURATION = (SPOTLIGHT_ENTRANCE_TOTAL_MS - EXIT_AT_MS) / 1000;

const ENTRANCE_SESSION_KEY = 'czaba_entrance_seen';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function claimEntranceForSession(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches) {
    return false;
  }
  try {
    if (window.sessionStorage.getItem(ENTRANCE_SESSION_KEY) === '1') return false;
    window.sessionStorage.setItem(ENTRANCE_SESSION_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

type Phase = 'dark' | 'spotlight' | 'reveal' | 'holding' | 'exit';

export function SpotlightLoader() {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>('dark');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (claimEntranceForSession()) setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const hideEntrance = () => setIsVisible(false);
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase('spotlight'), SPOTLIGHT_AT_MS),
      setTimeout(() => setPhase('reveal'), REVEAL_AT_MS),
      setTimeout(() => setPhase('holding'), HOLD_AT_MS),
      setTimeout(() => setPhase('exit'), EXIT_AT_MS),
      setTimeout(hideEntrance, SPOTLIGHT_ENTRANCE_TOTAL_MS),
    ];
    const handleEntranceSkipKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Tab') hideEntrance();
    };
    const overlay = overlayRef.current;
    document.addEventListener('keydown', handleEntranceSkipKey);
    overlay?.addEventListener('click', hideEntrance);

    return () => {
      for (const timer of timers) clearTimeout(timer);
      document.removeEventListener('keydown', handleEntranceSkipKey);
      overlay?.removeEventListener('click', hideEntrance);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const showSpotlight = phase !== 'dark';
  const showLogo = phase === 'reveal' || phase === 'holding' || phase === 'exit';
  const isExit = phase === 'exit';

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        data-testid="entrance-loader"
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExit ? 0 : 1 }}
        transition={{ duration: EXIT_DURATION, ease: 'easeInOut' }}
        className={cn('fixed inset-0 z-50 overflow-hidden', isExit && 'pointer-events-none')}
        style={{ backgroundColor: '#000' }}
      >
        {/* Deep black background */}
        <div className="absolute inset-0 bg-black" />

        {/* Spotlight cone from top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: showSpotlight ? 1 : 0,
            scale: showSpotlight ? 1 : 0.5,
          }}
          transition={{
            duration: SPOTLIGHT_DURATION,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: '200%',
            height: '120%',
            background: `
              conic-gradient(
                from 270deg at 50% 0%,
                transparent 0deg,
                transparent 70deg,
                rgba(255,255,255,0.03) 85deg,
                rgba(255,255,255,0.08) 90deg,
                rgba(255,255,255,0.03) 95deg,
                transparent 110deg,
                transparent 360deg
              )
            `,
          }}
        />

        {/* Main spotlight glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: showSpotlight ? 0.8 : 0,
            scale: showSpotlight ? 1 : 0.3,
          }}
          transition={{
            duration: SPOTLIGHT_DURATION * 0.8,
            ease: 'easeOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '500px',
            height: '500px',
            background:
              'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Secondary glow - brand color */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: showLogo ? 0.4 : 0,
          }}
          transition={{
            duration: LOGO_FADE_DURATION,
            ease: 'easeOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '400px',
            height: '200px',
            background: 'radial-gradient(ellipse, rgba(19, 217, 204, 0.2) 0%, transparent 60%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Floor reflection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: showSpotlight ? 0.3 : 0,
          }}
          transition={{
            duration: SPOTLIGHT_DURATION,
            delay: 0.1,
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px]"
          style={{
            background:
              'radial-gradient(ellipse at center top, rgba(255,255,255,0.1) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        {/* CZABA Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{
            opacity: showLogo ? 1 : 0,
            y: showLogo ? 0 : 30,
            scale: showLogo ? 1 : 0.9,
          }}
          transition={{
            duration: LOGO_FADE_DURATION,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10"
        >
          <motion.span
            initial={{ letterSpacing: '0.3em' }}
            animate={{
              letterSpacing: showLogo ? '0.2em' : '0.3em',
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="block text-5xl md:text-7xl font-bold"
            style={{
              background: 'linear-gradient(135deg, hsl(220, 10%, 94%) 0%, hsl(175, 85%, 50%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter:
                'drop-shadow(0 0 40px rgba(19, 217, 204, 0.5)) drop-shadow(0 0 80px rgba(19, 217, 204, 0.3))',
            }}
          >
            CZABA
          </motion.span>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: phase === 'holding' || phase === 'exit' ? 1 : 0,
              width: phase === 'holding' || phase === 'exit' ? '100%' : 0,
            }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="h-[1px] mx-auto mt-4 mb-4"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(19, 217, 204, 0.5), transparent)',
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'holding' || phase === 'exit' ? 1 : 0,
              y: phase === 'holding' || phase === 'exit' ? 0 : 10,
            }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-sm text-muted tracking-[0.3em] uppercase"
          >
            Cinematic Sound Design
          </motion.p>
        </motion.div>

        {/* Dust particles in spotlight */}
        {showSpotlight && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: `${40 + Math.random() * 20}%`,
                  y: '-10%',
                }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: '110%',
                }}
                transition={{
                  duration: 1 + Math.random() * 0.8,
                  delay: Math.random() * 0.3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute w-[2px] h-[2px] rounded-full bg-white/50"
              />
            ))}
          </div>
        )}

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
          }}
        />

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
