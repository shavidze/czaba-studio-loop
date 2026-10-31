import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { studioLibraryMenuStrings } from '~/lib/arrangement/strings';
import { armGridMenuDismissClickSwallow } from './ArrangementGridMenu';

const LIBRARY_MENU_VIEWPORT_MARGIN_PX = 4;
const LIBRARY_MENU_ITEM_CLASS =
  'flex h-7 w-full items-center gap-2 whitespace-nowrap rounded-sm px-2 text-left text-xs text-foreground hover:bg-elevated';

export type LibraryMenuCloseReason = 'escape' | 'tab' | 'outside' | 'window' | 'activate';

interface ArrangementLibraryMenuProps {
  x: number;
  y: number;
  sourceTitle: string;
  productHref: string;
  onClose: (reason: LibraryMenuCloseReason) => void;
}

function clampLibraryMenuAxis(value: number, size: number, viewport: number): number {
  const max = viewport - size - LIBRARY_MENU_VIEWPORT_MARGIN_PX;
  return Math.max(LIBRARY_MENU_VIEWPORT_MARGIN_PX, Math.min(value, max));
}

export function ArrangementLibraryMenu({
  x,
  y,
  sourceTitle,
  productHref,
  onClose,
}: ArrangementLibraryMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useIsomorphicLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }
    setPosition({
      left: clampLibraryMenuAxis(x, menu.offsetWidth, window.innerWidth),
      top: clampLibraryMenuAxis(y, menu.offsetHeight, window.innerHeight),
    });
  }, [x, y]);

  useEffect(() => {
    itemRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const menu = menuRef.current;
      if (menu && event.target instanceof Node && menu.contains(event.target)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      armGridMenuDismissClickSwallow(window);
      onCloseRef.current('outside');
    };
    const closeOnWindowChange = () => onCloseRef.current('window');
    window.addEventListener('pointerdown', handleOutsidePointerDown, true);
    window.addEventListener('resize', closeOnWindowChange);
    window.addEventListener('blur', closeOnWindowChange);
    return () => {
      window.removeEventListener('pointerdown', handleOutsidePointerDown, true);
      window.removeEventListener('resize', closeOnWindowChange);
      window.removeEventListener('blur', closeOnWindowChange);
    };
  }, []);

  const handleLibraryMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose('escape');
      return;
    }
    if (event.key === 'Tab') {
      onClose('tab');
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      itemRef.current?.focus({ preventScroll: true });
      return;
    }
    if (event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) {
        itemRef.current?.click();
      }
      return;
    }
    if (event.key === 'Enter' && event.repeat) {
      event.preventDefault();
    }
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={studioLibraryMenuStrings.menuLabel(sourceTitle)}
      className="fixed z-50 min-w-40 rounded-panel border border-outline bg-surface p-1 shadow-lg"
      style={position}
      onKeyDown={handleLibraryMenuKeyDown}
      onMouseDown={(event) => {
        if (!(event.target instanceof Element && event.target.closest('a'))) {
          event.preventDefault();
        }
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyUp={(event) => event.stopPropagation()}
      data-testid="arrangement-library-menu"
    >
      <a
        ref={itemRef}
        role="menuitem"
        href={productHref}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={0}
        onClick={() => onClose('activate')}
        className={LIBRARY_MENU_ITEM_CLASS}
        data-library-menu-action="view-in-store"
      >
        {studioLibraryMenuStrings.viewInStore}
      </a>
    </div>
  );
}
