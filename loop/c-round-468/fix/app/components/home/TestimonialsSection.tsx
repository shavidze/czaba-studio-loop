import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { PageContainer } from '../layout';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  project: string;
  avatar?: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Marcus Chen',
    role: 'Film Composer',
    project: 'Sundance 2026 Selection',
    content:
      "CZABA's tension risers saved three days of scoring on our latest short. The Mixdown Studio let me customize every stem on set.",
  },
  {
    id: '2',
    name: 'Sarah Williams',
    role: 'Music Producer',
    project: 'HBO Documentary Series',
    content:
      'The only sample library where I can isolate stems and create a custom mix in minutes. Nothing else comes close to this workflow.',
  },
  {
    id: '3',
    name: 'David Park',
    role: 'Sound Designer',
    project: 'Netflix Original Score',
    content:
      "I've used these across multiple productions. The 24-bit quality and stem flexibility mean I never have to compromise.",
  },
];

const _stats = [
  { number: '2,500+', label: 'Happy Customers' },
  { number: '50+', label: 'Premium Packs' },
  { number: '100K+', label: 'Sounds Delivered' },
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <motion.div
      className="relative rounded-xl border border-outline bg-surface/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-brand/30 hover:bg-elevated/70"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Quote className="absolute right-6 top-6 text-accent opacity-20" size={32} />
      <p className="mb-6 italic leading-relaxed text-muted">{testimonial.content}</p>
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent font-bold text-background">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <span>{testimonial.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-sm text-muted">{testimonial.role}</p>
        </div>
        <span className="text-xs text-brand/70">{testimonial.project}</span>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <PageContainer>
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">
            Heard In <span className="text-glow">Productions</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Trusted by composers, producers, and sound designers worldwide
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Stats
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 rounded-xl border border-outline bg-surface/50 p-8 md:gap-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-brand md:text-4xl">{stat.number}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
              {index < stats.length - 1 && (
                <div className="hidden h-12 w-px bg-outline md:block" />
              )}
            </div>
          ))}
        </motion.div> */}
      </PageContainer>
    </section>
  );
}
