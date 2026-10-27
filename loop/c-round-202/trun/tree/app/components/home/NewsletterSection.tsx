import { useFetcher } from '@remix-run/react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, Mail, Sparkles, Star, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PageContainer } from '../layout';

const PERKS = [{ label: 'Early Access' }, { label: 'Secret Tracks' }, { label: 'Exclusive Drops' }];

export function NewsletterSection() {
  const fetcher = useFetcher<{ success?: boolean; error?: string; message?: string }>();
  const formRef = useRef<HTMLFormElement>(null);

  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success === true;
  const isError = fetcher.data?.error !== undefined;

  // Reset form on success
  useEffect(() => {
    if (isSuccess && formRef.current) {
      formRef.current.reset();
    }
  }, [isSuccess]);

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-brand/5 to-background" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[100px]" />

      <PageContainer className="relative z-10">
        <div className="mx-auto max-w-xl text-center">
          {/* Icon */}
          <div className="mb-6 inline-flex rounded-lg border border-outline bg-surface p-4">
            <Users size={32} className="text-brand" />
          </div>

          {/* Title */}
          <h2 className="mb-4 font-serif text-[clamp(2rem,5vw,3rem)] font-semibold">
            Join the <span className="text-glow">Inner Circle</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mb-8 max-w-md text-lg text-muted">
            Early access to new releases, exclusive tracks, and member-only previews. No spam, ever.
          </p>

          {/* Perks */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {PERKS.map((perk) => (
              <div
                key={perk.label}
                className="flex items-center gap-2 rounded-full bg-surface/60 px-4 py-2"
              >
                <Star size={14} className="fill-brand/60 text-brand/60" />
                <span className="text-sm">{perk.label}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <fetcher.Form ref={formRef} method="post" className="flex flex-col gap-3 sm:flex-row">
            {/* Honeypot field - hidden from humans, bots fill it */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="absolute -left-[9999px] opacity-0 pointer-events-none"
            />
            <div className="relative flex-1">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className="h-14 w-full rounded-lg border-2 border-outline-strong bg-surface pl-12 pr-4 text-foreground transition-all placeholder:text-muted disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-8 font-semibold text-background transition-all hover:bg-brand-hover hover:shadow-[0_0_30px_rgba(19,217,204,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </fetcher.Form>

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-3 text-brand"
            >
              <Sparkles size={18} />
              <span>{fetcher.data?.message || 'Welcome to the Inner Circle'}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {isError && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-destructive">
              <AlertCircle size={18} />
              <span>{fetcher.data?.error}</span>
            </div>
          )}

          {/* Social proof */}
          <p className="mt-6 text-muted">Join creators worldwide</p>
        </div>
      </PageContainer>
    </section>
  );
}
