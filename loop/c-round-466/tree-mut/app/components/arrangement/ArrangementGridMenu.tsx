import { Check } from 'lucide-react';
import { Fragment, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import {
  GRID_ADAPTIVE_WIDTH_OPTIONS,
  GRID_TRIPLET_MENU_LABEL,
  type GridDivisionOption,
  type GridMode,
} from '~/lib/arrangement/grid-divisions';
import { studioGridStrings } from '~/lib/arrangement/strings';

const GRID_MENU_VIEWPORT_MARGIN_PX = 4;
const GRID_MENU_LABEL = studioGridStrings.menuLabel;
const GRID_MENU_SNAP_LABEL = 'Snap (G)';
const GRID_MENU_GROUP_LABEL_CLASS = 'px-2 pt-1 pb-0.5 text-xs text-muted';
const GRID_MENU_ITEM_CLASS =
  'flex h-7 w-full items-center gap-2 rounded-sm px-2 text-left font-mono text-xs tabular-nums text-foreground hover:bg-elevated';

interface ArrangementGridMenuProps {
  x: number;
  y: number;
  divisions: readonly GridDivisionOption[];
  checkedId: string;
  gridMode: GridMode;
  adaptiveDensity: number;
  snapEnabled: boolean;
  onChooseDivision: (id: string) => void;
  onChooseAdaptiveDensity: (density: number) => void;
  onToggleSnap: () => void;
  tripletChecked?: boolean | null;
  onToggleTriplet?: () => void;
  onClose: () => void;
}

function clampGridMenuAxis(value: number, size: number, viewport: number): number {
  const max = viewport - size - GRID_MENU_VIEWPORT_MARGIN_PX;
  return Math.max(GRID_MENU_VIEWPORT_MARGIN_PX, Math.min(value, max));
}

export function armGridMenuDismissClickSwallow(view: Window) {
  let releaseTimer: number | null = null;
  const releaseClickSwallow = () => {
    if (releaseTimer !== null) {
      view.clearTimeout(releaseTimer);
      releaseTimer = null;
    }
    view.removeEventListener('click', swallowDismissClick, true);
    view.removeEventListener('pointerup', scheduleClickSwallowRelease, true);
    view.removeEventListener('pointercancel', scheduleClickSwallowRelease, true);
    view.removeEventListener('pointerdown', releaseClickSwallow, true);
    view.removeEventListener('keydown', releaseOnFreshKey, true);
    view.removeEventListener('blur', releaseClickSwallow);
  };
  const swallowDismissClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    releaseClickSwallow();
  };
  const releaseOnFreshKey = (event: WindowEventMap['keydown']) => {
    if (!event.repeat) {
      releaseClickSwallow();
    }
  };
  const scheduleClickSwallowRelease = () => {
    if (releaseTimer === null) {
      releaseTimer = view.setTimeout(releaseClickSwallow, 0);
    }
  };
  view.addEventListener('click', swallowDismissClick, true);
  view.addEventListener('pointerup', scheduleClickSwallowRelease, true);
  view.addEventListener('pointercancel', scheduleClickSwallowRelease, true);
  view.addEventListener('pointerdown', releaseClickSwallow, true);
  view.addEventListener('keydown', releaseOnFreshKey, true);
  view.addEventListener('blur', releaseClickSwallow);
}

export function ArrangementGridMenu({
  x,
  y,
  divisions,
  checkedId,
  gridMode,
  adaptiveDensity,
  snapEnabled,
  onChooseDivision,
  onChooseAdaptiveDensity,
  onToggleSnap,
  tripletChecked = null,
  onToggleTriplet,
  onClose,
}: ArrangementGridMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const widthCount = GRID_ADAPTIVE_WIDTH_OPTIONS.length;
  const snapIndex = widthCount + divisions.length;
  const checkedWidthIndex = GRID_ADAPTIVE_WIDTH_OPTIONS.findIndex(
    (option) => option.density === adaptiveDensity,
  );
  const checkedDivisionIndex = divisions.findIndex((option) => option.id === checkedId);
  const checkedIndex =
    gridMode === 'adaptive'
      ? Math.max(0, checkedWidthIndex)
      : checkedDivisionIndex < 0
        ? 0
        : widthCount + checkedDivisionIndex;
  const initialIndexRef = useRef(checkedIndex);
  const [activeIndex, setActiveIndex] = useState(checkedIndex);
  const [position, setPosition] = useState({ left: x, top: y });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const tripletIndex =
    tripletChecked === null || onToggleTriplet === undefined ? null : snapIndex + 1;
  const itemCount = snapIndex + 1 + (tripletIndex === null ? 0 : 1);

  useIsomorphicLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      return;
    }
    setPosition({
      left: clampGridMenuAxis(x, menu.offsetWidth, window.innerWidth),
      top: clampGridMenuAxis(y, menu.offsetHeight, window.innerHeight),
    });
  }, [x, y]);

  useEffect(() => {
    itemRefs.current[initialIndexRef.current]?.focus({ preventScroll: true });
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
      onCloseRef.current();
    };
    window.addEventListener('pointerdown', handleOutsidePointerDown, true);
    return () => window.removeEventListener('pointerdown', handleOutsidePointerDown, true);
  }, []);

  const focusGridMenuItem = (index: number) => {
    const next = (index + itemCount) % itemCount;
    setActiveIndex(next);
    itemRefs.current[next]?.focus({ preventScroll: true });
  };

  const chooseGridMenuItem = (index: number) => {
    if (index === tripletIndex) {
      onToggleTriplet?.();
      return;
    }
    if (index === snapIndex) {
      onToggleSnap();
      return;
    }
    const width = GRID_ADAPTIVE_WIDTH_OPTIONS[index];
    if (width !== undefined) {
      onChooseAdaptiveDensity(width.density);
      return;
    }
    const division = divisions[index - widthCount];
    if (division !== undefined) {
      onChooseDivision(division.id);
    }
  };

  const handleGridMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === 'Tab' || event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusGridMenuItem(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusGridMenuItem(activeIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusGridMenuItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusGridMenuItem(itemCount - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) {
        chooseGridMenuItem(activeIndex);
      }
    }
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={GRID_MENU_LABEL}
      className="fixed z-50 min-w-36 rounded-panel border border-outline bg-surface p-1 shadow-lg"
      style={position}
      onKeyDown={handleGridMenuKeyDown}
      onMouseDown={(event) => {
        if (!(event.target instanceof Element && event.target.closest('button'))) {
          event.preventDefault();
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      onKeyUp={(event) => event.stopPropagation()}
      data-testid="arrangement-grid-menu"
    >
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={GRID_MENU_GROUP_LABEL_CLASS}>
          {studioGridStrings.menuAdaptiveGroup}
        </legend>
        {GRID_ADAPTIVE_WIDTH_OPTIONS.map((option, index) => {
          const checked = gridMode === 'adaptive' && option.density === adaptiveDensity;
          return (
            <button
              key={option.label}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={checked}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => chooseGridMenuItem(index)}
              onFocus={() => setActiveIndex(index)}
              className={GRID_MENU_ITEM_CLASS}
            >
              <span aria-hidden="true" className="flex w-3 justify-center text-foreground">
                {checked ? (
                  <Check className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                ) : null}
              </span>
              {option.label}
            </button>
          );
        })}
      </fieldset>
      <hr className="my-1 border-outline" />
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={GRID_MENU_GROUP_LABEL_CLASS}>{studioGridStrings.menuFixedGroup}</legend>
        {divisions.map((option, divisionIndex) => {
          const index = widthCount + divisionIndex;
          const checked = gridMode === 'fixed' && option.id === checkedId;
          return (
            <Fragment key={option.id}>
              {option.family === 'musical' && divisions[divisionIndex - 1]?.family !== 'musical' ? (
                <hr className="my-1 border-outline" />
              ) : null}
              <button
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => chooseGridMenuItem(index)}
                onFocus={() => setActiveIndex(index)}
                className={GRID_MENU_ITEM_CLASS}
              >
                <span aria-hidden="true" className="flex w-3 justify-center text-foreground">
                  {checked ? (
                    <Check className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                  ) : null}
                </span>
                {option.label}
              </button>
            </Fragment>
          );
        })}
      </fieldset>
      <hr className="my-1 border-outline" />
      <button
        ref={(element) => {
          itemRefs.current[snapIndex] = element;
        }}
        type="button"
        role="menuitemcheckbox"
        aria-checked={snapEnabled}
        tabIndex={activeIndex === snapIndex ? 0 : -1}
        onClick={() => chooseGridMenuItem(snapIndex)}
        onFocus={() => setActiveIndex(snapIndex)}
        className={GRID_MENU_ITEM_CLASS}
      >
        <span aria-hidden="true" className="flex w-3 justify-center text-foreground">
          {snapEnabled ? (
            <Check className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
          ) : null}
        </span>
        {GRID_MENU_SNAP_LABEL}
      </button>
      {tripletIndex === null ? null : (
        <button
          ref={(element) => {
            itemRefs.current[tripletIndex] = element;
          }}
          type="button"
          role="menuitemcheckbox"
          aria-checked={tripletChecked === true}
          tabIndex={activeIndex === tripletIndex ? 0 : -1}
          onClick={() => chooseGridMenuItem(tripletIndex)}
          onFocus={() => setActiveIndex(tripletIndex)}
          className={GRID_MENU_ITEM_CLASS}
        >
          <span aria-hidden="true" className="flex w-3 justify-center text-foreground">
            {tripletChecked === true ? (
              <Check className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            ) : null}
          </span>
          {GRID_TRIPLET_MENU_LABEL}
        </button>
      )}
    </div>
  );
}
