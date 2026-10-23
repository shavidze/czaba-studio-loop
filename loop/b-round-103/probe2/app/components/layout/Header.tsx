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
  const prevCartCount = useRef(cartCount);

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
          <h1 className="text-2xl font-extrabold text-glow tracking-tighter">CZABA</h1>
        </Link>

        {/* desktop nav */}
        <nav className="hidden lg:flex items-center gap-12 justify-center">
          <Link to="/store" prefetch="intent" className={getNavLinkClass('/store')}>
            Store
          </Link>
          <Link to="/gift-cards" prefetch="intent" className={getNavLinkClass('/gift-cards')}>
            Gift Cards
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
          <Link to="/hire-us" prefetch="intent" className={getNavLinkClass('/hire-us')}>
            Hire Us
          </Link>
          <Link
            to="/studio-lab"
            prefetch="intent"
            className={`${getNavLinkClass('/studio-lab')} whitespace-nowrap`}
          >
            Studio Lab
            <span className="ml-1.5 rounded-sm border border-accent/40 px-1.5 align-middle text-xs font-semibold uppercase leading-none tracking-wider text-accent">
              Demo
            </span>
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
            <div className="relative group hidden lg:block">
              <button aria-label="User menu" className="btn-icon text-muted cursor-pointer">
                <User size={20} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-52 bg-surface border border-outline rounded-md shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-[-10px] group-hover:translate-y-0">
                <div className="p-4 border-b border-outline/50 mb-4">
                  <p className="font-semibold text-foreground">Hi, {user?.firstName}!</p>
                  <p className="text-sm text-muted truncate">{user?.email}</p>
                </div>
                <Link
                  to="/account"
                  className="block w-full text-left p-4 text-foreground hover:bg-elevated hover:text-brand rounded-md transition-colors cursor-pointer"
                >
                  My Account
                </Link>
                <Link
                  to="/account/orders"
                  className="block w-full text-left p-4 text-foreground hover:bg-elevated hover:text-brand rounded-md transition-colors cursor-pointer"
                >
                  Orders
                </Link>
                <Link
                  to="/account/downloads"
                  className="block w-full text-left p-4 text-foreground hover:bg-elevated hover:text-brand rounded-md transition-colors cursor-pointer"
                >
                  Downloads
                </Link>
                <hr className="border-outline/50 my-4" />
                <button
                  onClick={() => signOut()}
                  className="cursor-pointer block w-full text-left p-4 text-foreground hover:bg-elevated hover:text-brand rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openModal('signin')}
              className="btn-primary cursor-pointer !rounded-sm !hidden lg:!inline-block"
            >
              Sign In
            </button>
          )}

          <button
            aria-label="Toggle menu"
            className="lg:hidden p-3 text-muted cursor-pointer ml-auto"
            onClick={() => setIsOpen((s) => !s)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`lg:hidden ${isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8 max-h-[calc(80vh-2rem)] overflow-y-auto">
          <nav className="border-t border-outline pt-4">
            <Link
              to="/store"
              prefetch="intent"
              className={getMobLinkClass('/store')}
              onClick={() => setIsOpen(false)}
            >
              Store
            </Link>
            <Link
              to="/gift-cards"
              prefetch="intent"
              className={getMobLinkClass('/gift-cards')}
              onClick={() => setIsOpen(false)}
            >
              Gift Cards
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
            <Link
              to="/hire-us"
              prefetch="intent"
              className={getMobLinkClass('/hire-us')}
              onClick={() => setIsOpen(false)}
            >
              Hire Us
            </Link>
            <Link
              to="/studio-lab"
              prefetch="intent"
              className={getMobLinkClass('/studio-lab')}
              onClick={() => setIsOpen(false)}
            >
              Studio Lab
              <span className="ml-1.5 rounded-sm border border-accent/40 px-1.5 align-middle text-xs font-semibold uppercase leading-none tracking-wider text-accent">
                Demo
              </span>
            </Link>
            <hr className="border-outline my-4" />
            {isInitializing ? (
              <div className="h-[44px] bg-elevated rounded-md animate-pulse" />
            ) : !isAuthenticated ? (
              <button
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
