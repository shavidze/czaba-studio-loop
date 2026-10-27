import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';

interface ProductAccordionProps {
  title: string;
  children: ReactNode;
}

export function ProductAccordion({ title, children }: ProductAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.52;

  return (
    <section className="bg-surface/50 border border-outline rounded-xl [overflow-anchor:none]">
      <h2>
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-h-14 w-full items-center justify-between gap-4 rounded-xl p-5 text-left text-sm uppercase tracking-[0.15em] text-foreground transition-colors duration-300 hover:text-brand motion-reduce:transition-none"
        >
          {title}
          <motion.span
            aria-hidden="true"
            className="shrink-0"
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChevronDown size={20} />
          </motion.span>
        </button>
      </h2>
      <motion.div
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        aria-hidden={!isOpen}
        className="overflow-hidden"
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          visibility: 'visible',
          transitionEnd: { visibility: isOpen ? 'visible' : 'hidden' },
        }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen || reduceMotion ? 0 : -4 }}
          transition={{
            duration: reduceMotion ? 0 : isOpen ? 0.4 : 0.2,
            delay: isOpen && !reduceMotion ? 0.08 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
