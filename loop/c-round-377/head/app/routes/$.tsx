import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: '404 - Page Not Found | CZABA' },
    { name: 'description', content: 'The page you are looking for does not exist.' },
  ];
};

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-bg">
        <div className="not-found-grid" />
      </div>

      <motion.div
        className="not-found-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          className="not-found-code"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="code-4">4</span>
          <span className="code-0">
            <span className="code-0-inner" />
          </span>
          <span className="code-4">4</span>
        </motion.div>

        <motion.h1
          className="not-found-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Lost in the <span className="text-glow">Sound</span>
        </motion.h1>

        <motion.p
          className="not-found-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          The page you're looking for has faded into silence.
          <br />
          Let's get you back to the music.
        </motion.p>

        <motion.div
          className="not-found-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home size={18} />
            <span>Back Home</span>
          </Link>
          <Link to="/store" className="btn-secondary inline-flex items-center gap-2">
            <Search size={18} />
            <span>Browse Store</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Floating sound wave decoration */}
      <div className="not-found-waves">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="wave-bar"
            animate={{
              height: ['20%', '80%', '40%', '90%', '20%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
