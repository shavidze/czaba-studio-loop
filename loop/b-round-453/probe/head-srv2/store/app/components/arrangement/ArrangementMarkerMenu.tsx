import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { studioMarkerStrings } from '~/lib/arrangement/strings';
import { armGridMenuDismissClickSwallow } from './ArrangementGridMenu';

const MARKER_MENU_VIEWPORT_MARGIN_PX = 4;
const MARKER_MENU_ITEM_CLASS =
  'flex h-7 w-full items-center gap-2 whitespace-nowrap rounded-sm px-2 text-left text-xs text-foreground hover:bg-elevated';

export type MarkerMenuAction = 'rename' | 'play' | 'delete';
export type MarkerMenuCloseReason = 'escape' | 'tab' | 'outside' | 'window';

const MARKER_MENU_ITEMS: readonly { action: MarkerMenuAction; label: string }[] = [
  { action: 'rename', label: studioMarkerStrings.menuRename },
  { action: 'play', label: studioMarkerStrings.menuPlay },
  { action: 'delete', label: studioMarkerStrings.menuDelete },
];

interface ArrangementMarkerMenuProps {
  x: number;
  y: number;
  markerName: string;
  onChooseAction: (action: MarkerMenuAction) => void;
  onClose: (reason: MarkerMenuCloseReason) => void;
}

function clampMarkerMenuAxis(value: number, size: number, viewport: number): number {
  const max = viewport - size - MARKER_MENU_VIEWPORT_MARGIN_PX;
  return Math.max(MARKER_MENU_VIEWPORT_MARGIN_PX, Math.min(value, max));
}

export function ArrangementMarkerMenu({
  x,
  y,
  markerName,
  onChooseAction,
  onClose,
}: ArrangementMarkerMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState({ left: x, top: y });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const itemCount = MARKER_MENU_ITEMS.length;

  useIsomorphicLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }
    setPosition({
      left: clampMarkerMenuAxis(x, menu.offsetWidth, window.innerWidth),
      top: clampMarkerMenuAxis(y, menu.offsetHeight, window.innerHeight),
    });
  }, [x, y]);

  useEffect(() => {
    itemRefs.current[0]?.focus({ preventScroll: true });
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

  const focusMarkerMenuItem = (index: number) => {
    const next = (index + itemCount) % itemCount;
    setActiveIndex(next);
    itemRefs.current[next]?.focus({ preventScroll: true });
  };

  const handleMarkerMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusMarkerMenuItem(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusMarkerMenuItem(activeIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusMarkerMenuItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusMarkerMenuItem(itemCount - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) {
        onChooseAction(MARKER_MENU_ITEMS[activeIndex].action);
      }
    }
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={studioMarkerStrings.menuLabel(markerName)}
      className="fixed z-50 min-w-40 rounded-panel border border-outline bg-surface p-1 shadow-lg"
      style={position}
      onKeyDown={handleMarkerMenuKeyDown}
      onMouseDown={(event) => {
        if (!(event.target instanceof Element && event.target.closest('button'))) {
          event.preventDefault();
        }
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onKeyUp={(event) => event.stopPropagation()}
      data-testid="arrangement-marker-menu"
    >
      {MARKER_MENU_ITEMS.map((item, index) => (
        <button
          key={item.action}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          type="button"
          role="menuitem"
          tabIndex={index === activeIndex ? 0 : -1}
          onClick={() => onChooseAction(item.action)}
          onFocus={() => setActiveIndex(index)}
          className={MARKER_MENU_ITEM_CLASS}
          data-marker-menu-action={item.action}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
