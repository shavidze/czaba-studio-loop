import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CURTAIN_DELAY = 500; // დაყოვნება დაწყებამდე
const CURTAIN_DURATION = 1.8; // ფარდის გახსნა
const LOGO_HOLD = 2000; // ლოგოს ჩვენება
const FADE_DURATION = 0.8; // საბოლოო fade

// ანიმაციის ინტერვალი (5-7 საათი)
const MIN_INTERVAL = 5 * 60 * 60 * 1000;
const MAX_INTERVAL = 7 * 60 * 60 * 1000;
const STORAGE_KEY = 'czaba_curtain_last_shown';

function shouldShowAnimation(): boolean {
  if (typeof window === 'undefined') return false;
  const lastShown = localStorage.getItem(STORAGE_KEY);
  if (!lastShown) return true;
  const lastShownTime = parseInt(lastShown, 10);
  const randomInterval = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
  return Date.now() - lastShownTime >= randomInterval;
}

function markAnimationShown(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

type Phase = 'waiting' | 'opening' | 'holding' | 'fading' | 'done';

export function CinemaCurtainLoader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [phase, setPhase] = useState<Phase>('waiting');

  useEffect(() => {
    const show = shouldShowAnimation();
    setShouldShow(show);
    if (show) markAnimationShown();
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    const timers: NodeJS.Timeout[] = [];
    let elapsed = CURTAIN_DELAY;

    // Start opening
    timers.push(setTimeout(() => setPhase('opening'), elapsed));
    elapsed += CURTAIN_DURATION * 1000;

    // Hold with logo visible
    timers.push(setTimeout(() => setPhase('holding'), elapsed));
    elapsed += LOGO_HOLD;

    // Fade out
    timers.push(setTimeout(() => setPhase('fading'), elapsed));
    elapsed += FADE_DURATION * 1000;

    // Done
    timers.push(setTimeout(() => setPhase('done'), elapsed));

    return () => timers.forEach(clearTimeout);
  }, [shouldShow]);

  if (!shouldShow || phase === 'done') return null;

  const isOpening = phase === 'opening' || phase === 'holding' || phase === 'fading';
  const isFading = phase === 'fading';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isFading ? 0 : 1 }}
        transition={{ duration: FADE_DURATION }}
        className="fixed inset-0 z-50 overflow-hidden"
        style={{ backgroundColor: '#000' }}
      >
        {/* Background - dark stage */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #000 70%)',
          }}
        />

        {/* Subtle spotlight glow behind curtains */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isOpening ? 0.4 : 0,
            scale: isOpening ? 1.2 : 0.8,
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(19, 217, 204, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Left Curtain */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isOpening ? '-100%' : 0 }}
          transition={{
            duration: CURTAIN_DURATION,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute top-0 left-0 w-1/2 h-full"
          style={{
            background: 'linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            boxShadow: '10px 0 60px rgba(0,0,0,0.8)',
          }}
        >
          {/* Curtain folds */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-[2px]"
                style={{
                  left: `${12 + i * 12}%`,
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 80%, transparent 100%)',
                }}
              />
            ))}
          </div>

          {/* Curtain edge highlight */}
          <div
            className="absolute top-0 right-0 bottom-0 w-[3px]"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgba(19, 217, 204, 0.3), transparent)',
            }}
          />
        </motion.div>

        {/* Right Curtain */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isOpening ? '100%' : 0 }}
          transition={{
            duration: CURTAIN_DURATION,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute top-0 right-0 w-1/2 h-full"
          style={{
            background: 'linear-gradient(270deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            boxShadow: '-10px 0 60px rgba(0,0,0,0.8)',
          }}
        >
          {/* Curtain folds */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-[2px]"
                style={{
                  right: `${12 + i * 12}%`,
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 80%, transparent 100%)',
                }}
              />
            ))}
          </div>

          {/* Curtain edge highlight */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[3px]"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgba(19, 217, 204, 0.3), transparent)',
            }}
          />
        </motion.div>

        {/* Center seam line (visible when closed) */}
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: isOpening ? 0 : 0.6 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full"
          style={{
            background:
              'linear-gradient(180deg, transparent 5%, rgba(19, 217, 204, 0.4) 50%, transparent 95%)',
          }}
        />

        {/* CZABA Logo - revealed behind curtains */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: phase === 'holding' || phase === 'fading' ? 1 : phase === 'opening' ? 0.5 : 0,
            scale: phase === 'holding' ? 1 : 0.95,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <h1
            className="text-5xl md:text-7xl font-bold tracking-[0.2em]"
            style={{
              background: 'linear-gradient(135deg, hsl(220, 10%, 94%) 0%, hsl(175, 85%, 50%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter:
                'drop-shadow(0 0 60px rgba(19, 217, 204, 0.5)) drop-shadow(0 0 120px rgba(19, 217, 204, 0.2))',
            }}
          >
            CZABA
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'holding' ? 1 : 0,
              y: phase === 'holding' ? 0 : 10,
            }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center text-sm text-muted mt-4 tracking-widest uppercase"
          >
            Cinematic Sound Design
          </motion.p>
        </motion.div>

        {/* Film grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
