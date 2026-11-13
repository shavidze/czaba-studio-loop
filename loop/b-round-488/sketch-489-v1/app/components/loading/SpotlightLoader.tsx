import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '~/lib/utils';
import {
  ENTRANCE_COVER_ID,
  ENTRANCE_FAILSAFE_MS,
  ENTRANCE_MAX_TOTAL_MS,
  ENTRANCE_MIN_TOTAL_MS,
  ENTRANCE_OVERLAY_EXIT_MS,
  ENTRANCE_REDUCED_MOTION_QUERY,
  ENTRANCE_SCROLL_SKIP_EVENTS,
  ENTRANCE_SESSION_KEY,
  ENTRANCE_TAKEOVER_EVENT,
  type EntranceHandshake,
  type EntranceHandshakeState,
} from './EntranceCover';

const LOGO_AFTER_TAKEOVER_MS = 400;
const HOLD_AFTER_TAKEOVER_MS = 1100;
export const EXIT_AFTER_TAKEOVER_MIN_MS = 2500;
const SPOTLIGHT_DURATION = 0.8;
const LOGO_FADE_DURATION = 0.7;
const LOGO_TRACKING_DURATION = 0.9;
const TAGLINE_FADE_DURATION = 0.5;
const EXIT_DURATION = ENTRANCE_OVERLAY_EXIT_MS / 1000;

export interface EntranceTimeline {
  logoInMs: number;
  holdInMs: number;
  exitInMs: number;
  endInMs: number;
}

// დრო ითვლება claimEntranceStart-ის performance.now()-დან: მოცილება >= 3500 ms, <= 5000 ms (SABA-B-17)
export function entranceTimeline(elapsedAtTakeoverMs: number): EntranceTimeline {
  const elapsed = Math.max(0, elapsedAtTakeoverMs);
  const exitAt = Math.min(
    Math.max(
      ENTRANCE_MIN_TOTAL_MS - ENTRANCE_OVERLAY_EXIT_MS,
      elapsed + EXIT_AFTER_TAKEOVER_MIN_MS,
    ),
    ENTRANCE_MAX_TOTAL_MS - ENTRANCE_OVERLAY_EXIT_MS,
  );
  const exitInMs = exitAt - elapsed;
  return {
    logoInMs: Math.min(LOGO_AFTER_TAKEOVER_MS, exitInMs),
    holdInMs: Math.min(HOLD_AFTER_TAKEOVER_MS, exitInMs),
    exitInMs,
    endInMs: exitInMs + ENTRANCE_OVERLAY_EXIT_MS,
  };
}

function findEntranceCover(): HTMLStyleElement | null {
  const cover = document.getElementById(ENTRANCE_COVER_ID);
  return cover instanceof HTMLStyleElement ? cover : null;
}

function claimEntranceForSession(): boolean {
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia(ENTRANCE_REDUCED_MOTION_QUERY).matches
  ) {
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

function syncEntranceCover(state: EntranceHandshakeState) {
  const cover = findEntranceCover();
  if (!cover) return;
  cover.setAttribute('data-state', state);
  cover.media = 'not all';
}

function retireEntrance(handshake: EntranceHandshake | null) {
  if (handshake) handshake.state = 'expired';
  syncEntranceCover('expired');
  window.dispatchEvent(new Event(ENTRANCE_TAKEOVER_EVENT));
}

function claimEntranceStart(): number | null {
  const handshake = window.__czabaEntrance ?? null;
  if (handshake) {
    if (handshake.state !== 'pending') return null;
    const elapsed = performance.now() - handshake.start;
    if (Number.isFinite(elapsed) && elapsed < ENTRANCE_FAILSAFE_MS) return handshake.start;
    retireEntrance(handshake);
    return null;
  }
  const cover = findEntranceCover();
  if (cover && cover.media === 'all') {
    retireEntrance(null);
    return null;
  }
  return claimEntranceForSession() ? performance.now() : null;
}

type Phase = 'spotlight' | 'reveal' | 'holding' | 'exit';

const DUST_PARTICLE_COUNT = 15;

interface DustParticle {
  id: number;
  x: number;
  duration: number;
  delay: number;
}

function createDustParticles(): DustParticle[] {
  return Array.from({ length: DUST_PARTICLE_COUNT }, (_, id) => ({
    id,
    x: 40 + Math.random() * 20,
    duration: 1 + Math.random() * 0.8,
    delay: Math.random() * 0.3,
  }));
}

export function SpotlightLoader() {
  const [startMs, setStartMs] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>('spotlight');
  const [dustParticles] = useState(createDustParticles);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const claimed = claimEntranceStart();
    if (claimed === null) return;
    setStartMs(claimed);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isVisible || startMs === null) return;

    const timeline = entranceTimeline(performance.now() - startMs);
    const hideEntrance = () => setIsVisible(false);
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase('reveal'), timeline.logoInMs),
      setTimeout(() => setPhase('holding'), timeline.holdInMs),
      setTimeout(() => setPhase('exit'), timeline.exitInMs),
      setTimeout(hideEntrance, timeline.endInMs),
    ];
    const handleEntranceSkipKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Tab') hideEntrance();
    };
    const handleEntranceSkipScroll = (event: Event) => {
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      hideEntrance();
    };
    const overlay = overlayRef.current;
    document.addEventListener('keydown', handleEntranceSkipKey);
    overlay?.addEventListener('click', hideEntrance);
    for (const type of ENTRANCE_SCROLL_SKIP_EVENTS) {
      window.addEventListener(type, handleEntranceSkipScroll, { capture: true, passive: false });
    }
    const handshake = window.__czabaEntrance;
    if (handshake?.state === 'skipped') {
      hideEntrance();
    } else if (handshake?.state === 'pending') {
      handshake.state = 'live';
      syncEntranceCover('live');
    }
    window.dispatchEvent(new Event(ENTRANCE_TAKEOVER_EVENT));

    return () => {
      for (const timer of timers) clearTimeout(timer);
      document.removeEventListener('keydown', handleEntranceSkipKey);
      overlay?.removeEventListener('click', hideEntrance);
      for (const type of ENTRANCE_SCROLL_SKIP_EVENTS) {
        window.removeEventListener(type, handleEntranceSkipScroll, { capture: true });
      }
    };
  }, [isVisible, startMs]);

  if (!isVisible) return null;

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
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="absolute inset-0 bg-background" />

        {/* Spotlight cone from top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
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
                rgba(var(--color-brand-rgb),0.04) 85deg,
                rgba(var(--color-brand-rgb),0.1) 90deg,
                rgba(var(--color-brand-rgb),0.04) 95deg,
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
            opacity: 0.8,
            scale: 1,
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
              'radial-gradient(ellipse, rgba(var(--color-brand-rgb),0.18) 0%, rgba(var(--color-brand-rgb),0.06) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Floor reflection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.3,
          }}
          transition={{
            duration: SPOTLIGHT_DURATION,
            delay: 0.1,
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px]"
          style={{
            background:
              'radial-gradient(ellipse at center top, rgba(var(--color-brand-rgb),0.12) 0%, transparent 70%)',
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
            transition={{ duration: LOGO_TRACKING_DURATION, ease: 'easeOut' }}
            className="block text-5xl md:text-7xl font-bold text-brand"
          >
            CZABA
          </motion.span>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{
              opacity: phase === 'holding' || phase === 'exit' ? 1 : 0,
              width: phase === 'holding' || phase === 'exit' ? '100%' : 0,
            }}
            transition={{ duration: TAGLINE_FADE_DURATION, delay: 0.05 }}
            className="h-[1px] mx-auto mt-4 mb-4 bg-brand/50"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'holding' || phase === 'exit' ? 1 : 0,
              y: phase === 'holding' || phase === 'exit' ? 0 : 10,
            }}
            transition={{ duration: TAGLINE_FADE_DURATION, delay: 0.1 }}
            className="text-sm text-muted tracking-[0.3em] uppercase"
          >
            Cinematic Sound Design
          </motion.p>
        </motion.div>

        {/* Dust particles in spotlight */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {dustParticles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                opacity: 0,
                x: `${particle.x}%`,
                y: '-10%',
              }}
              animate={{
                opacity: [0, 0.6, 0],
                y: '110%',
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute w-[2px] h-[2px] rounded-full bg-foreground/50"
            />
          ))}
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, color-mix(in srgb, var(--color-background) 80%, transparent) 100%)',
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
