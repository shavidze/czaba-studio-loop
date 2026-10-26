/**
 * Studio Showcase
 * Displays the Personal Mixdown Studio with CSS-rendered mockup
 * No images needed - fully responsive, always matches real UI
 */

import { Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Layers, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '../layout';
import { StudioMockup } from './StudioMockup';

const springConfig = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
  mass: 1,
};

const springFast = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

const STUDIO_FEATURES = [
  {
    icon: Layers,
    title: 'Stem Isolation',
    description: 'Mix each instrument separately',
  },
  {
    icon: Wand2,
    title: 'Real-Time Control',
    description: 'Solo, mute, and adjust levels',
  },
  {
    icon: Download,
    title: 'Custom Mixdown',
    description: 'Export exactly what you need',
  },
];

export function StudioShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-b from-background via-brand/5 to-background py-16 md:py-24"
    >
      {/* Ambient glow effect */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]" />

      <PageContainer className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ ...springConfig, delay: 0 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ ...springFast, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2"
          >
            <span className="size-2 rounded-full bg-brand" />
            <span className="text-sm font-medium text-brand">Only at CZABA</span>
          </motion.div>

          <h2 className="mb-4 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Personal Mixdown <span className="text-glow">Studio</span>
          </h2>
          <p className="mx-auto mb-4 max-w-4xl text-lg text-muted">
            More than just files. A complete production toolkit.
          </p>
          <p className="mx-auto max-w-4xl text-dim">
            Explore supported music packs in our browser-based studio. Isolate available stems,
            create custom mixes, and export exactly what your project needs. No DAW required.
          </p>
        </motion.div>

        {/* Studio Mockup - CSS-rendered DAW interface */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.95 }}
          transition={{ ...springConfig, delay: 0.2 }}
          className="relative mx-auto mb-16 max-w-5xl"
        >
          {/* Studio Mockup Component */}
          <StudioMockup />

          {/* Reflection glow */}
          <div className="pointer-events-none absolute -bottom-16 left-1/2 h-16 w-[90%] -translate-x-1/2 bg-brand/30 blur-[40px]" />
        </motion.div>

        {/* Features */}
        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {STUDIO_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={
                  isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }
                }
                transition={{ ...springConfig, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, transition: springFast }}
                className="cursor-default rounded-2xl border border-outline bg-surface/60 p-6 text-center"
              >
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon size={24} />
                </div>
                <h3 className="mb-1 font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm text-dim">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ ...springConfig, delay: 0.7 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={springFast}
          >
            <Link
              to="/store"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-background transition-colors duration-200 hover:bg-brand-hover"
            >
              <span>Browse the Collection</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
