import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Stem {
  id: string;
  name: string;
  isLoaded: boolean;
}

interface StemsLoadingAnimationProps {
  stems: Stem[];
  productTitle: string;
}

// Hook for optimistic/simulated progress
// Reaches ~70% in first 15 seconds, then slows down
function useOptimisticProgress(realLoaded: number, total: number) {
  const [displayedLoaded, setDisplayedLoaded] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const intervalTime = 300; // Update every 300ms

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      // First 15 seconds: reach 70%
      // After that: slow crawl to 85% max
      let simulatedProgress: number;

      if (elapsed < 15000) {
        // 0-15s: ease-out to 70%
        const t = elapsed / 15000;
        const eased = 1 - (1 - t) ** 2.5; // Stronger ease-out
        simulatedProgress = eased * 0.7;
      } else {
        // After 15s: very slow progress from 70% to 85%
        const extraTime = elapsed - 15000;
        const slowProgress = Math.min(0.15, extraTime / 30000); // 30 more seconds to reach 85%
        simulatedProgress = 0.7 + slowProgress;
      }

      const simulatedLoaded = Math.floor(simulatedProgress * total);

      setDisplayedLoaded((prev) => {
        const newValue = Math.max(realLoaded, Math.max(prev, simulatedLoaded));
        return Math.min(newValue, total);
      });
    }, intervalTime);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [total, realLoaded]);

  useEffect(() => {
    setDisplayedLoaded((prev) => Math.max(prev, realLoaded));
  }, [realLoaded]);

  return displayedLoaded;
}

// Generate pseudo-random waveform peaks
function generateWaveformPeaks(stemName: string, count: number = 60): number[] {
  let seed = 0;
  for (let i = 0; i < stemName.length; i++) {
    seed += stemName.charCodeAt(i);
  }

  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    const rand = Math.sin(seed * (i + 1) * 0.1) * 0.5 + 0.5;
    const envelopePos = i / count;
    const envelope = Math.sin(envelopePos * Math.PI) * 0.5 + 0.5;
    peaks.push(rand * envelope * 0.8 + 0.2);
  }
  return peaks;
}

// Single track with subtle pulse
function LoadingTrack({ stem, index }: { stem: Stem; index: number }) {
  const peaks = generateWaveformPeaks(stem.name);
  const delayBase = index * 0.08;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delayBase, duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-4 py-2.5"
    >
      {/* Track name with check */}
      <div className="w-32 shrink-0 flex items-center gap-2">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: stem.isLoaded ? 1 : 0,
            opacity: stem.isLoaded ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-4 h-4 rounded-full bg-brand/20 flex items-center justify-center shrink-0"
        >
          <Check size={10} className="text-brand" />
        </motion.div>
        <span
          className={`text-sm truncate transition-colors duration-500 ${
            stem.isLoaded ? 'text-foreground' : 'text-muted'
          }`}
        >
          {stem.name}
        </span>
      </div>

      {/* Waveform with pulse effect */}
      <div className="flex-1 h-10 flex items-end justify-center gap-[2px] overflow-hidden rounded bg-white/[0.03] px-2">
        {peaks.map((peak, i) => {
          const isRevealed = stem.isLoaded;
          const barHeight = Math.round(peak * 32); // max 32px

          return (
            <motion.div
              key={i}
              initial={{ height: 4, opacity: 0.15 }}
              animate={
                isRevealed
                  ? {
                      height: barHeight,
                      opacity: 0.9,
                    }
                  : {
                      height: 4,
                      opacity: 0.15,
                    }
              }
              transition={{
                delay: isRevealed ? i * 0.01 : 0,
                duration: 0.4,
                ease: 'easeOut',
              }}
              className={`w-[2px] rounded-full shrink-0 ${isRevealed ? 'bg-brand' : 'bg-white/10'}`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

// Progress ring with breathing glow
function ProgressRing({ loaded, total }: { loaded: number; total: number }) {
  const progress = total > 0 ? loaded / total : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-28 h-28">
      {/* Breathing glow effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-brand/15 blur-xl"
      />

      {/* SVG Ring */}
      <svg className="w-28 h-28 -rotate-90 relative z-10">
        {/* Background track */}
        <circle cx="56" cy="56" r="40" fill="none" className="stroke-white/5" strokeWidth="4" />
        {/* Progress arc */}
        <motion.circle
          cx="56"
          cy="56"
          r="40"
          fill="none"
          className="stroke-brand"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.span
          key={loaded}
          // initial={{ opacity: 0, y: 5 }}
          // animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-light text-foreground tracking-tight"
        >
          {loaded}
        </motion.span>
        <span className="text-[10px] text-muted uppercase tracking-widest">of {total}</span>
      </div>
    </div>
  );
}

export function StemsLoadingAnimation({ stems, productTitle }: StemsLoadingAnimationProps) {
  const realLoadedCount = stems.filter((s) => s.isLoaded).length;
  const totalCount = stems.length;
  const displayedCount = useOptimisticProgress(realLoadedCount, totalCount);

  const optimisticStems = stems.map((stem, index) => ({
    ...stem,
    isLoaded: index < displayedCount || stem.isLoaded,
  }));

  return (
    <div className="min-h-[420px] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-xl font-serif font-medium text-foreground mb-2 tracking-tight">
            Preparing Your Studio
          </h2>
          <p className="text-sm text-muted">
            Setting up stems for <span className="text-brand">{productTitle}</span>
          </p>
        </motion.div>

        {/* Main content */}
        <div className="flex gap-10 items-start">
          {/* Progress ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="shrink-0"
          >
            <ProgressRing loaded={displayedCount} total={totalCount} />
          </motion.div>

          {/* Tracks list - styled scrollbar */}
          <div className="stems-loader-list relative flex-1 h-[280px] overflow-y-auto pr-1">
            {optimisticStems.map((stem, index) => (
              <LoadingTrack key={stem.id} stem={stem} index={index} />
            ))}
          </div>
        </div>

        {/* Subtle tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-dim mt-10"
        >
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-muted font-mono text-[10px]">?</kbd>{' '}
          for keyboard shortcuts
        </motion.p>
      </div>
    </div>
  );
}
