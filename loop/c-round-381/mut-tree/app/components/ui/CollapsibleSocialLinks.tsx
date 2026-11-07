import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FacebookIcon, InstagramIcon, SocialIcon, YouTubeIcon } from '~/components/icons';
import { SOCIAL_LINKS } from '~/lib/constants';

export function CollapsibleSocialLinks() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div
      className="relative flex items-center gap-1"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Main trigger button */}
      <button
        type="button"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 text-muted hover:text-brand hover:bg-surface transition-all duration-300"
        aria-label="Social links"
        aria-expanded={isExpanded}
      >
        <SocialIcon className="w-5 h-5" />
      </button>

      {/* Expanding social icons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="flex items-center gap-1"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          >
            {/* Instagram - with gradient on hover */}
            <motion.a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 text-muted hover:bg-surface transition-colors"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0, ease: [0.33, 1, 0.68, 1] }}
              aria-label="Instagram"
              onMouseEnter={() => setHoveredItem('instagram')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <InstagramIcon className="w-5 h-5" gradient={hoveredItem === 'instagram'} />
            </motion.a>

            {/* YouTube */}
            <motion.a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 text-muted hover:text-destructive hover:bg-surface transition-colors"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.05, ease: [0.33, 1, 0.68, 1] }}
              aria-label="YouTube"
            >
              <YouTubeIcon className="w-5 h-5" />
            </motion.a>

            {/* Facebook */}
            <motion.a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 text-muted hover:text-social-facebook hover:bg-surface transition-colors"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
              aria-label="Facebook"
            >
              <FacebookIcon className="w-5 h-5" />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
