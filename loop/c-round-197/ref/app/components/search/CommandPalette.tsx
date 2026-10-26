import { useNavigate } from '@remix-run/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Command, FileText, Gift, Music, Package, Search, User, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'page' | 'action';
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
}

// Quick navigation items
const quickLinks: SearchResult[] = [
  { id: 'store', title: 'Browse Store', type: 'page', icon: <Package size={18} />, href: '/store' },
  {
    id: 'gift-cards',
    title: 'Gift Cards',
    type: 'page',
    icon: <Gift size={18} />,
    href: '/gift-cards',
  },
  {
    id: 'free',
    title: 'Free Downloads',
    type: 'page',
    icon: <Music size={18} />,
    href: '/free-downloads',
  },
  { id: 'about', title: 'About CZABA', type: 'page', icon: <FileText size={18} />, href: '/about' },
  { id: 'account', title: 'My Account', type: 'page', icon: <User size={18} />, href: '/account' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter results based on query
  const results = query
    ? quickLinks.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : quickLinks;

  // Keyboard shortcut to open (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Navigate through results with arrow keys
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const result = results[selectedIndex];
        if (result.href) {
          navigate(result.href);
          setIsOpen(false);
        } else if (result.action) {
          result.action();
          setIsOpen(false);
        }
      }
    },
    [results, selectedIndex, navigate],
  );

  const handleSelect = (result: SearchResult) => {
    if (result.href) {
      navigate(result.href);
    } else if (result.action) {
      result.action();
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger button for header */}
      <button
        onClick={() => setIsOpen(true)}
        className="command-palette-trigger"
        aria-label="Search (⌘K)"
      >
        <Search size={18} />
        <span className="command-palette-hint">
          <Command size={12} />
          <span>K</span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="command-palette-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="command-palette"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Search input */}
              <div className="command-palette-header">
                <Search size={20} className="command-palette-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or jump to..."
                  className="command-palette-input"
                />
                <button onClick={() => setIsOpen(false)} className="command-palette-close">
                  <X size={18} />
                </button>
              </div>

              {/* Results */}
              <div className="command-palette-results">
                {results.length > 0 ? (
                  <div className="command-palette-group">
                    <div className="command-palette-group-title">
                      {query ? 'Results' : 'Quick Navigation'}
                    </div>
                    {results.map((result, index) => (
                      <button
                        key={result.id}
                        className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <span className="command-palette-item-icon">{result.icon}</span>
                        <span className="command-palette-item-title">{result.title}</span>
                        <ArrowRight size={14} className="command-palette-item-arrow" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="command-palette-empty">No results found for "{query}"</div>
                )}
              </div>

              {/* Footer hint */}
              <div className="command-palette-footer">
                <span>
                  <kbd>↑↓</kbd> Navigate
                </span>
                <span>
                  <kbd>↵</kbd> Select
                </span>
                <span>
                  <kbd>Esc</kbd> Close
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
