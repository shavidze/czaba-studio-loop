import { Link, useLocation } from '@remix-run/react';
import { Menu, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CommandPalette } from '~/components/search';
import { useAuth } from '~/hooks';

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const prevCartCount = useRef(cartCount);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const wrapper = userMenuRef.current;
      if (wrapper && event.target instanceof Node && wrapper.contains(event.target)) return;
      setIsUserMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [isUserMenuOpen]);

  // Animate cart badge when count changes
  useEffect(() => {
    if (cartCount !== prevCartCount.current && cartCount > 0) {
      setIsCartAnimating(true);
      const timer = setTimeout(() => setIsCartAnimating(false), 300);
      prevCartCount.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);
  const location = useLocation();
  const { isAuthenticated, isInitializing, user, openModal, signOut } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) setIsUserMenuOpen(false);
  }, [isAuthenticated]);

  // Helper to check if link is active
  const isActiveLink = (path: string) => location.pathname === path;

  const getNavLinkClass = (path: string) => {
    const baseClass =
      'text-muted hover:text-foreground font-medium relative py-2 after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-brand after:transition-transform after:duration-200 hover:after:scale-x-100 cursor-pointer';
    const activeClass = isActiveLink(path)
      ? 'text-foreground after:scale-x-100'
      : 'after:scale-x-0';
    return `${baseClass} ${activeClass}`;
  };

  const getMobLinkClass = (path: string) => {
    const baseClass = 'block px-4 py-3 rounded-md transition-colors font-medium cursor-pointer';
    const activeClass = isActiveLink(path)
      ? 'text-brand bg-elevated'
      : 'text-foreground hover:text-brand';
    return `${baseClass} ${activeClass}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-outline bg-background/95 backdrop-blur-lg">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-12 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="no-underline cursor-pointer">
          <span className="block text-2xl font-extrabold tracking-tighter text-foreground">
            CZABA
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden lg:flex items-center gap-12 justify-center">
          <Link to="/store" prefetch="intent" className={getNavLinkClass('/store')}>
            Collections
          </Link>
          <Link to="/studio-lab" prefetch="intent" className={getNavLinkClass('/studio-lab')}>
            Studio
          </Link>
          <Link
            to="/free-downloads"
            prefetch="intent"
            className={getNavLinkClass('/free-downloads')}
          >
            Free Samples
          </Link>
          <Link to="/about" prefetch="intent" className={getNavLinkClass('/about')}>
            About
          </Link>
        </nav>

        {/* actions */}
        <div className="flex items-center gap-6">
          <CommandPalette />

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative btn-icon p-2.5 text-muted cursor-pointer"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                className={`absolute -right-1 -top-1 flex size-[20px] items-center justify-center rounded-full bg-brand text-xs font-bold text-background transition-transform duration-300 ${
                  isCartAnimating ? 'scale-125' : 'scale-100'
                }`}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth section - show skeleton while initializing */}
          {isInitializing ? (
            <div className="hidden lg:block w-[70px] h-[36px] bg-elevated rounded-sm animate-pulse" />
          ) : isAuthenticated ? (
            <div
              ref={userMenuRef}
              className="relative group hidden lg:block"
              onKeyDown={(event) => {
                if (event.key !== 'Escape' || !isUserMenuOpen) return;
                event.stopPropagation();
                setIsUserMenuOpen(false);
                userMenuButtonRef.current?.focus();
              }}
              onBlur={(event) => {
                const next = event.relatedTarget;
                if (next instanceof Node && event.currentTarget.contains(next)) return;
                setIsUserMenuOpen(false);
              }}
            >
              <button
                ref={userMenuButtonRef}
                type="button"
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
                aria-controls="header-user-menu"
                className="btn-icon text-muted cursor-pointer"
                onClick={() => setIsUserMenuOpen((open) => !open)}
              >
                <User size={20} />
              </button>
              <div
                id="header-user-menu"
                className={`absolute top-full right-0 mt-2 w-52 bg-surface border border-outline rounded-md shadow-xl p-4 ${isUserMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-[-10px] group-hover:translate-y-0'} transition-all duration-200`}
              >
                <div className="p-4 border-b border-outline/50 mb-4">
                  <p className="font-semibold text-foreground">Hi, {user?.firstName}!</p>
                  <p className="text-sm text-muted truncate">{user?.email}</p>
                </div>
                <Link
                  to="/account"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block w-full text-left p-4 text-foreground hover:bg-elevated hover:text-brand rounded-md transition-colors cursor-pointer"
                >
                  My Account
                </Link>
                <Link
                  to="/account/orders"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block w-full text-left p-4 text-foreground hover:bg-elevated hover:text-brand rounded-md transition-colors cursor-pointer"
                >
                  Orders
                </Link>
                <Link
                  to="/account/downloads"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block w-full text-left p-4 text-foreground hover:bg-elevated hover:text-brand rounded-md transition-colors cursor-pointer"
                >
                  Downloads
                </Link>
                <hr className="border-outline/50 my-4" />
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    signOut();
                  }}
                  className="cursor-pointer block w-full text-left p-4 text-foreground hover:bg-elevated hover:text-brand rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openModal('signin')}
              className="btn-primary cursor-pointer !rounded-sm !hidden lg:!inline-block"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="header-mobile-menu"
            className="lg:hidden p-3 text-muted cursor-pointer ml-auto"
            onClick={() => setIsOpen((s) => !s)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        id="header-mobile-menu"
        className={`lg:hidden ${isOpen ? 'max-h-[80vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible'} overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8 max-h-[calc(80vh-2rem)] overflow-y-auto">
          <nav className="border-t border-outline pt-4">
            <Link
              to="/store"
              prefetch="intent"
              className={getMobLinkClass('/store')}
              onClick={() => setIsOpen(false)}
            >
              Collections
            </Link>
            <Link
              to="/studio-lab"
              prefetch="intent"
              className={getMobLinkClass('/studio-lab')}
              onClick={() => setIsOpen(false)}
            >
              Studio
            </Link>
            <Link
              to="/free-downloads"
              prefetch="intent"
              className={getMobLinkClass('/free-downloads')}
              onClick={() => setIsOpen(false)}
            >
              Free Samples
            </Link>
            <Link
              to="/about"
              prefetch="intent"
              className={getMobLinkClass('/about')}
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <hr className="border-outline my-4" />
            {isInitializing ? (
              <div className="h-[44px] bg-elevated rounded-md animate-pulse" />
            ) : !isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openModal('signin');
                }}
                className="btn-primary w-full cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <>
                <Link
                  to="/account"
                  className="block px-4 py-3 rounded-md transition-colors font-medium text-foreground hover:text-brand cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  to="/account/downloads"
                  className="block px-4 py-3 rounded-md transition-colors font-medium text-foreground hover:text-brand cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  Downloads
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="block w-full text-left px-4 py-3 rounded-md transition-colors font-medium text-foreground hover:text-brand cursor-pointer"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
