import { Link } from '@remix-run/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '../layout';

// Hero background media - supports both images and videos
// When videos are ready, just change the array and type
const HERO_MEDIA = [
  { src: '/studio-slide-1.jpg', type: 'image' as const },
  { src: '/studio-slide-2.jpg', type: 'image' as const },
  { src: '/studio-slide-3.jpg', type: 'image' as const },
  { src: '/studio-slide-4.jpg', type: 'image' as const },
  { src: '/studio-slide-5.jpg', type: 'image' as const },
  { src: '/studio-slide-6.jpg', type: 'image' as const },
  { src: '/studio-slide-7.jpg', type: 'image' as const },
  { src: '/studio-slide-8.jpg', type: 'image' as const },
  { src: '/studio-slide-9.jpg', type: 'image' as const },
  { src: '/studio-slide-10.jpg', type: 'image' as const },
];

// Time per slide: 6s × 10 photos = 60s per loop, 3 loops = 3 min (matches song)
const SLIDE_DURATION = 6;

const HERO_MUSIC = '/videos/hero/hero-music.mp3';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function HeroSection() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_MEDIA.length);
    }, SLIDE_DURATION * 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(() => {});
        audioRef.current.muted = false;
      } else {
        audioRef.current.pause();
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };

  const currentMedia = HERO_MEDIA[currentIndex];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Audio */}
      <audio ref={audioRef} src={HERO_MUSIC} loop />

      {/* Background Media Slideshow */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="sync">
          {currentMedia.type === 'image' ? (
            <motion.img
              key={currentIndex}
              src={currentMedia.src}
              alt=""
              className="absolute inset-0 size-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5, ease: 'easeInOut' },
                scale: { duration: SLIDE_DURATION, ease: 'linear' },
              }}
            />
          ) : (
            <motion.video
              key={currentIndex}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 size-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
              <source src={currentMedia.src} type="video/mp4" />
            </motion.video>
          )}
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,transparent_20%,transparent_80%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Sound Toggle Button - Top right, visible on load */}
      <button
        onClick={toggleMute}
        className="absolute top-24 right-6 z-20 flex items-center gap-2 rounded-full bg-surface-glass px-4 py-2 text-sm text-foreground/80 backdrop-blur-sm transition-all hover:bg-muted-bg hover:text-foreground"
        aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        <span className="hidden sm:inline">{isMuted ? 'Sound On' : 'Sound Off'}</span>
      </button>

      {/* Content */}
      <PageContainer className="relative z-10 pt-20 text-center">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Badge */}
          <motion.div
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-surface/60 px-4 py-2 backdrop-blur-md"
            variants={itemVariants}
          >
            <span className="size-2 rounded-full bg-brand" />
            <span>Limited Collection</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="mb-6 font-serif text-[clamp(3rem,12vw,8rem)] font-bold tracking-tight"
            variants={titleVariants}
          >
            <span className="hero-title-glow">CZABA</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto mb-4 max-w-2xl text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-muted"
            variants={itemVariants}
          >
            Create cinematic masterpieces that leave audiences breathless.
          </motion.p>

          {/* Description */}
          <motion.p className="mx-auto mb-8 max-w-3xl text-lg text-muted" variants={itemVariants}>
            Complete creative freedom. Buy once, use forever.
          </motion.p>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Link
              to="/store"
              className="btn-primary group inline-flex items-center gap-2 px-8 py-4"
            >
              <span>Discover the Collection</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
