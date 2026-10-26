import { useRef, useState } from 'react';
import { useAuth, useClickOutside } from '~/hooks';

export function UserDropdown() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  if (!user) return null;

  // Get user initials
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-brand-surface-elevated border border-brand-border flex items-center justify-center text-sm font-medium text-text hover:border-brand-border-hover transition cursor-pointer"
        aria-label="User menu"
      >
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-brand-surface-elevated rounded-lg border border-brand-border shadow-xl overflow-hidden animate-fade-in">
          {/* User Info Section */}
          <div className="p-4 border-b border-brand-border">
            <p className="font-semibold text-text">{user.name}</p>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <a
              href="/account"
              className="block px-4 py-2 text-text-muted hover:text-text hover:bg-brand-surface transition cursor-pointer"
            >
              My Account
            </a>
            <button className="w-full flex items-center justify-between px-4 py-2 text-text-muted hover:text-text hover:bg-brand-surface transition cursor-pointer">
              Help
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-text-muted hover:text-text hover:bg-brand-surface transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
