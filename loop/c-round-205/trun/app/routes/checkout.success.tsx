import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Download, Home, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Footer } from '~/components/layout/Footer';
import { PageContainer } from '~/components/layout/PageContainer';

export const meta: MetaFunction = () => {
  return [
    { title: 'Payment Successful | CZABA' },
    { name: 'description', content: 'Your payment has been processed successfully.' },
  ];
};

const CINEMATIC_EASE = [0.16, 1, 0.3, 1] as const;

function SuccessRing() {
  return (
    <motion.div
      className="relative w-24 h-24"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: CINEMATIC_EASE }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-brand/20"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ duration: 0.8, ease: CINEMATIC_EASE, delay: 0.2 }}
      />

      <motion.svg
        viewBox="0 0 96 96"
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.circle
          cx="48"
          cy="48"
          r="44"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: CINEMATIC_EASE, delay: 0.3 }}
        />
      </motion.svg>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: CINEMATIC_EASE, delay: 0.6 }}
      >
        <CheckCircle className="w-10 h-10 text-brand" />
      </motion.div>

      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ boxShadow: '0 0 0 0 rgba(19, 217, 204, 0)' }}
        animate={{
          boxShadow: ['0 0 0 0 rgba(19, 217, 204, 0.3)', '0 0 0 20px rgba(19, 217, 204, 0)'],
        }}
        transition={{ duration: 1.2, delay: 0.8 }}
      />
    </motion.div>
  );
}

function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: '50%', top: '50%' }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x,
        y,
        opacity: [0, 1, 0],
        scale: [0, 1, 0.5],
      }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
    >
      <Sparkles className="w-3 h-3 text-brand/60" />
    </motion.div>
  );
}

const PARTICLES = [
  { delay: 0.5, x: -60, y: -40 },
  { delay: 0.6, x: 50, y: -50 },
  { delay: 0.7, x: -40, y: 30 },
  { delay: 0.8, x: 60, y: 20 },
  { delay: 0.65, x: 0, y: -60 },
  { delay: 0.75, x: -50, y: -10 },
];

const STEPS = [
  'A confirmation email is on its way',
  'Your downloads are ready in your account',
  'Access your Personal Mixdown Studio anytime',
];

export default function CheckoutSuccess() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-background pt-32 pb-20 overflow-hidden">
        <PageContainer>
          <div className="max-w-xl mx-auto text-center">
            <div className="relative mb-10 flex justify-center">
              <SuccessRing />
              {PARTICLES.map((p, i) => (
                <FloatingParticle key={i} {...p} />
              ))}
            </div>

            <AnimatePresence>
              {showContent && (
                <>
                  <motion.h1
                    className="font-serif text-3xl md:text-4xl font-semibold mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: CINEMATIC_EASE }}
                  >
                    Your Collection Awaits
                  </motion.h1>

                  <motion.p
                    className="text-muted text-lg mb-10"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: CINEMATIC_EASE, delay: 0.1 }}
                  >
                    Thank you for choosing CZABA. Your purchase is confirmed.
                  </motion.p>

                  <motion.div
                    className="bg-elevated border border-outline rounded-xl p-6 mb-10 text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: CINEMATIC_EASE, delay: 0.2 }}
                  >
                    <h2 className="font-medium text-foreground mb-4">What happens next</h2>
                    <ul className="text-muted space-y-3 text-sm">
                      {STEPS.map((step, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: CINEMATIC_EASE,
                            delay: 0.4 + index * 0.15,
                          }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 15,
                              delay: 0.5 + index * 0.15,
                            }}
                          >
                            <CheckCircle className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                          </motion.div>
                          <span>{step}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: CINEMATIC_EASE, delay: 0.6 }}
                  >
                    <Link
                      to="/account/downloads"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-background font-semibold rounded-lg hover:bg-brand-hover transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Access Your Downloads
                    </Link>
                    <Link
                      to="/store"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-muted font-semibold rounded-lg hover:bg-elevated hover:text-foreground transition-all"
                    >
                      <Home className="w-5 h-5" />
                      Discover More
                    </Link>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </>
  );
}
