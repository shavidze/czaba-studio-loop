import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SPOTLIGHT_ENTRANCE_TOTAL_MS, SpotlightLoader } from '~/components/loading/SpotlightLoader';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SESSION_KEY = 'czaba_entrance_seen';
const OLD_LOCAL_KEY = 'czaba_spotlight_last_shown';
const TOTAL = SPOTLIGHT_ENTRANCE_TOTAL_MS;

function stubMatchMedia(prefersReducedMotion: boolean) {
  const matchMedia = vi.fn(
    (query: string): MediaQueryList => ({
      matches: prefersReducedMotion && query === REDUCED_MOTION_QUERY,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  );
  vi.stubGlobal('matchMedia', matchMedia);
  return matchMedia;
}

function mountEntranceLoader() {
  const view = render(<SpotlightLoader />);
  act(() => {
    vi.advanceTimersByTime(0);
  });
  return view;
}

function findOverlay(_container?: HTMLElement) {
  return document.querySelector('[data-testid="entrance-loader"]');
}

function advanceTo(current: { ms: number }, target: number) {
  act(() => {
    vi.advanceTimersByTime(target - current.ms);
  });
  current.ms = target;
}

describe('SpotlightLoader entrance (STORE-1d D10)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    window.localStorage.clear();
    stubMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it('L1 renders nothing on the server', () => {
    expect(renderToString(<SpotlightLoader />)).toBe('');
  });

  it('L2 shows a decorative overlay with no heading on first mount', () => {
    const { container } = mountEntranceLoader();
    const overlay = findOverlay(container);

    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute('aria-hidden')).toBe('true');
    expect(overlay?.getAttribute('data-testid')).toBe('entrance-loader');
    expect(overlay?.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]')).toHaveLength(0);
    expect(overlay?.textContent).toContain('CZABA');
  });

  it('L3 stays on screen at most 1200 ms, exit fade included', () => {
    expect(TOTAL).toBeLessThanOrEqual(1200);
    const clock = { ms: 0 };
    const { container } = mountEntranceLoader();

    advanceTo(clock, 600);
    expect(findOverlay(container)).not.toBeNull();
    advanceTo(clock, TOTAL - 1);
    expect(findOverlay(container)).not.toBeNull();
    advanceTo(clock, TOTAL);
    expect(findOverlay(container)).toBeNull();
    advanceTo(clock, 1200 + 5000);
    expect(findOverlay(container)).toBeNull();
  });

  it('L4 lets pointer events through during the exit fade only', () => {
    const clock = { ms: 0 };
    const { container } = mountEntranceLoader();

    advanceTo(clock, 100);
    expect(findOverlay(container)?.classList.contains('pointer-events-none')).toBe(false);
    advanceTo(clock, TOTAL - 1);
    expect(findOverlay(container)?.classList.contains('pointer-events-none')).toBe(true);
  });

  it('L5 a click on the overlay ends it immediately and for good', () => {
    const clock = { ms: 0 };
    const { container } = mountEntranceLoader();
    advanceTo(clock, 300);
    const overlay = findOverlay(container);
    expect(overlay).not.toBeNull();

    act(() => {
      if (overlay) fireEvent.pointerDown(overlay);
    });
    expect(findOverlay(container)).not.toBeNull();

    act(() => {
      if (overlay) fireEvent.click(overlay);
    });
    expect(findOverlay(container)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);

    advanceTo(clock, 300 + 5000);
    expect(findOverlay(container)).toBeNull();
  });

  describe('L6 Escape skip and keydown listener hygiene', () => {
    function trackKeydownListeners() {
      const added = new Set<EventListenerOrEventListenerObject>();
      const removed = new Set<EventListenerOrEventListenerObject>();
      const realAdd = document.addEventListener.bind(document);
      const realRemove = document.removeEventListener.bind(document);
      vi.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
        if (type === 'keydown' && listener) added.add(listener);
        realAdd(type, listener, options);
      });
      vi.spyOn(document, 'removeEventListener').mockImplementation((type, listener, options) => {
        if (type === 'keydown' && listener) removed.add(listener);
        realRemove(type, listener, options);
      });
      return {
        added,
        expectAllRemoved: () => {
          expect(added.size).toBeGreaterThan(0);
          for (const listener of added) expect(removed.has(listener)).toBe(true);
        },
      };
    }

    it('Escape at 300 ms removes the overlay and its keydown listener', () => {
      const listeners = trackKeydownListeners();
      const clock = { ms: 0 };
      const { container } = mountEntranceLoader();
      advanceTo(clock, 300);
      expect(findOverlay(container)).not.toBeNull();

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });
      expect(findOverlay(container)).toBeNull();
      listeners.expectAllRemoved();
    });

    it.each([
      ['Tab', { key: 'Tab' }],
      ['Shift+Tab', { key: 'Tab', shiftKey: true }],
    ])('%s ends it like Escape without preventing the focus move', (_label, keyInit) => {
      const listeners = trackKeydownListeners();
      const clock = { ms: 0 };
      const { container } = mountEntranceLoader();
      advanceTo(clock, 300);
      expect(findOverlay(container)).not.toBeNull();

      let notDefaultPrevented = false;
      act(() => {
        notDefaultPrevented = fireEvent.keyDown(document, keyInit);
      });
      expect(notDefaultPrevented).toBe(true);
      expect(findOverlay(container)).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
      listeners.expectAllRemoved();
    });

    it('other keys do not skip', () => {
      const clock = { ms: 0 };
      const { container } = mountEntranceLoader();
      advanceTo(clock, 300);

      for (const key of ['a', 'ArrowDown', 'Shift']) {
        act(() => {
          fireEvent.keyDown(document, { key });
        });
        expect(findOverlay(container)).not.toBeNull();
      }
    });

    it('removes the keydown listener after the natural finish', () => {
      const listeners = trackKeydownListeners();
      const clock = { ms: 0 };
      const { container } = mountEntranceLoader();
      advanceTo(clock, TOTAL);
      expect(findOverlay(container)).toBeNull();
      listeners.expectAllRemoved();
    });

    it('removes the keydown listener on unmount mid-animation', () => {
      const listeners = trackKeydownListeners();
      const clock = { ms: 0 };
      const { unmount } = mountEntranceLoader();
      advanceTo(clock, 400);
      unmount();
      listeners.expectAllRemoved();
    });
  });

  it('L7 shows once per session and never writes the old localStorage key', () => {
    const first = mountEntranceLoader();
    expect(findOverlay(first.container)).not.toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('1');
    expect(window.localStorage.getItem(OLD_LOCAL_KEY)).toBeNull();
    first.unmount();

    const second = mountEntranceLoader();
    expect(findOverlay(second.container)).toBeNull();
  });

  it('L8 ignores the old localStorage key and honours the session key', () => {
    window.localStorage.setItem(OLD_LOCAL_KEY, String(Date.now()));
    const withOldKey = mountEntranceLoader();
    expect(findOverlay(withOldKey.container)).not.toBeNull();
    withOldKey.unmount();

    window.sessionStorage.clear();
    window.localStorage.clear();
    window.sessionStorage.setItem(SESSION_KEY, '1');
    const seen = mountEntranceLoader();
    expect(findOverlay(seen.container)).toBeNull();
  });

  it('L9 never renders under prefers-reduced-motion and does not claim the session', () => {
    stubMatchMedia(true);
    const clock = { ms: 0 };
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).toBeNull();

    for (const step of [0, 100, 1200]) {
      advanceTo(clock, step);
      expect(findOverlay(container)).toBeNull();
    }
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('L10 blocked storage renders nothing and does not throw', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    let container: HTMLElement | null = null;
    expect(() => {
      container = mountEntranceLoader().container;
    }).not.toThrow();
    expect(container && findOverlay(container)).toBeNull();
  });

  it('L10b a sessionStorage write failure renders nothing and does not throw', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });

    let container: HTMLElement | null = null;
    expect(() => {
      container = mountEntranceLoader().container;
    }).not.toThrow();
    expect(container && findOverlay(container)).toBeNull();
  });

  it('L11 leaves no stray timers or state updates after unmount', () => {
    const consoleError = vi.spyOn(console, 'error');
    const clock = { ms: 0 };
    const { unmount } = mountEntranceLoader();
    advanceTo(clock, 500);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(5000);
      });
    }).not.toThrow();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
