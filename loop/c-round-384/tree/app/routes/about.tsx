import type { MetaFunction } from '@remix-run/node';
import { motion } from 'framer-motion';
import { Award, Film, Globe, Headphones, Users } from 'lucide-react';
import { Footer } from '~/components/layout/Footer';

export const meta: MetaFunction = () => {
  return [
    { title: 'About CZABA | Our Story' },
    {
      name: 'description',
      content:
        'Learn about CZABA - premium sound design for producers, artists, and creators worldwide.',
    },
    // Open Graph
    { property: 'og:title', content: 'About CZABA | Our Story' },
    {
      property: 'og:description',
      content:
        'Learn about CZABA - premium sound design for producers, artists, and creators worldwide.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og-image.jpg' },
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'About CZABA | Our Story' },
    { name: 'twitter:description', content: 'Learn about CZABA - premium cinematic sound design.' },
  ];
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[60vh] py-24 md:py-32">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="font-serif text-5xl md:text-7xl font-semibold text-foreground tracking-tight mb-6">
              Crafting Sound for <span className="text-glow">Cinema</span>
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
              We believe every frame deserves a soundtrack that moves audiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                Our Story
              </h2>
              <p className="text-secondary leading-relaxed">
                CZABA was born from a simple frustration: finding high-quality, truly cinematic
                sounds that don&apos;t break the bank or come with complicated licensing.
              </p>
              <p className="text-secondary leading-relaxed">
                As composers and sound designers ourselves, we spent years building sample libraries
                for our own projects. Friends started asking where we got our sounds. That&apos;s
                when we realized we had something special.
              </p>
              <p className="text-secondary leading-relaxed">
                Today, CZABA serves thousands of producers, artists, and creators worldwide. Every
                sound in our library is crafted with the same attention to detail we bring to our
                own cinematic work.
              </p>
            </motion.div>
            <motion.div
              className="relative aspect-[4/3] rounded-xl overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src="/studio-about.webp"
                alt="CZABA Studio"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 border-t border-outline/50">
        <div className="container">
          <motion.h2
            className="font-serif text-3xl md:text-4xl font-semibold text-foreground text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What We <span className="text-glow">Stand For</span>
          </motion.h2>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-surface border border-outline rounded-xl p-8 text-center transition-colors hover:border-outline-hover"
              variants={fadeInUp}
            >
              <Film className="w-8 h-8 text-brand mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Cinematic Quality</h3>
              <p className="text-muted text-sm leading-relaxed">
                Every sound is designed for the big screen. No compromise on quality.
              </p>
            </motion.div>

            <motion.div
              className="bg-surface border border-outline rounded-xl p-8 text-center transition-colors hover:border-outline-hover"
              variants={fadeInUp}
            >
              <Headphones className="w-8 h-8 text-brand mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Producer-First</h3>
              <p className="text-muted text-sm leading-relaxed">
                Built by producers, for producers. We know what you need.
              </p>
            </motion.div>

            <motion.div
              className="bg-surface border border-outline rounded-xl p-8 text-center transition-colors hover:border-outline-hover"
              variants={fadeInUp}
            >
              <Award className="w-8 h-8 text-brand mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Yours Forever</h3>
              <p className="text-muted text-sm leading-relaxed">
                One purchase, unlimited use. No hidden fees or recurring costs.
              </p>
            </motion.div>

            <motion.div
              className="bg-surface border border-outline rounded-xl p-8 text-center transition-colors hover:border-outline-hover"
              variants={fadeInUp}
            >
              <Users className="w-8 h-8 text-brand mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Community Driven</h3>
              <p className="text-muted text-sm leading-relaxed">
                Your feedback shapes our releases. We build what you need.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-28 border-t border-outline/50">
        <div className="container">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <span className="block font-serif text-4xl md:text-5xl font-semibold text-foreground mb-2">
                2,500+
              </span>
              <span className="text-sm text-muted tracking-wide uppercase">Happy Customers</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-4xl md:text-5xl font-semibold text-foreground mb-2">
                50+
              </span>
              <span className="text-sm text-muted tracking-wide uppercase">Premium Packs</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-4xl md:text-5xl font-semibold text-foreground mb-2">
                100K+
              </span>
              <span className="text-sm text-muted tracking-wide uppercase">Sounds Delivered</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-4xl md:text-5xl font-semibold text-foreground mb-2">
                40+
              </span>
              <span className="text-sm text-muted tracking-wide uppercase">Countries</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-28 border-t border-outline/50">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Globe className="w-12 h-12 text-brand mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-secondary leading-relaxed">
              To democratize cinematic sound design. We believe every creator, regardless of budget,
              deserves access to professional-grade sounds that elevate their work to the next
              level.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
