import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { useEffect } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ENTRANCE_BOOT_SCRIPT,
  ENTRANCE_COVER_ID,
  ENTRANCE_FAILSAFE_MS,
  ENTRANCE_MAX_TOTAL_MS,
  ENTRANCE_MIN_TOTAL_MS,
  ENTRANCE_TAKEOVER_EVENT,
  EntranceCoverHead,
} from '~/components/loading/EntranceCover';
import { entranceTimeline, SpotlightLoader } from '~/components/loading/SpotlightLoader';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SESSION_KEY = 'czaba_entrance_seen';
const OLD_LOCAL_KEY = 'czaba_spotlight_last_shown';
const TOTAL = ENTRANCE_MIN_TOTAL_MS;

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

describe('SpotlightLoader entrance (STORE-1d D10, SABA-B-13 minimum)', () => {
  beforeEach(() => {
    window.__czabaEntrance = undefined;
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

  it('L1 renders nothing on the server and logs nothing', () => {
    const consoleError = vi.spyOn(console, 'error');
    expect(renderToString(<SpotlightLoader />)).toBe('');
    expect(consoleError).not.toHaveBeenCalled();
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

  it('L3 stays on screen for the 1450 ms minimum, exit fade included, never past 1900 ms', () => {
    expect(TOTAL).toBe(1450);
    expect(ENTRANCE_MAX_TOTAL_MS).toBe(1900);
    const clock = { ms: 0 };
    const { container } = mountEntranceLoader();

    advanceTo(clock, 600);
    expect(findOverlay(container)).not.toBeNull();
    advanceTo(clock, TOTAL - 1);
    expect(findOverlay(container)).not.toBeNull();
    advanceTo(clock, TOTAL);
    expect(findOverlay(container)).toBeNull();
    advanceTo(clock, ENTRANCE_MAX_TOTAL_MS + 5000);
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

    for (const step of [0, 100, 1200, TOTAL]) {
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

function installHeadCover() {
  document.head.innerHTML = renderToString(<EntranceCoverHead />);
  const cover = document.getElementById(ENTRANCE_COVER_ID);
  if (!(cover instanceof HTMLStyleElement)) throw new Error('cover style missing');
  return cover;
}

function runBootScript() {
  new Function(ENTRANCE_BOOT_SCRIPT)();
}

function reinsertCoverHeadHtml() {
  return installHeadCover();
}

function watchOverlayMounts() {
  const observer = new MutationObserver(() => {});
  observer.observe(document.body, { childList: true, subtree: true });
  return () => {
    const records = observer.takeRecords();
    observer.disconnect();
    return records.some((record) =>
      [...record.addedNodes].some(
        (node) =>
          node instanceof HTMLElement &&
          (node.matches('[data-testid="entrance-loader"]') ||
            node.querySelector('[data-testid="entrance-loader"]') !== null),
      ),
    );
  };
}

function trackBootCaptureListeners() {
  const added = new Set<EventListenerOrEventListenerObject>();
  const addSpy = vi.spyOn(document, 'addEventListener');
  const removeSpy = vi.spyOn(document, 'removeEventListener');
  return () => {
    for (const call of addSpy.mock.calls) if (call[2] === true) added.add(call[1]);
    for (const call of removeSpy.mock.calls) if (call[2] === true) added.delete(call[1]);
    return added.size;
  };
}

function trackTakeoverListeners() {
  const added = new Set<EventListenerOrEventListenerObject>();
  const addSpy = vi.spyOn(window, 'addEventListener');
  const removeSpy = vi.spyOn(window, 'removeEventListener');
  return () => {
    for (const call of addSpy.mock.calls)
      if (call[0] === ENTRANCE_TAKEOVER_EVENT) added.add(call[1]);
    for (const call of removeSpy.mock.calls)
      if (call[0] === ENTRANCE_TAKEOVER_EVENT) added.delete(call[1]);
    return added.size;
  };
}

let hydratedHeadRoot: Root | null = null;

function unmountHydratedHead() {
  const root = hydratedHeadRoot;
  hydratedHeadRoot = null;
  if (root) act(() => root.unmount());
}

function hydrateHeadCover(options: { foreignNode: boolean; elapsedMs: number }) {
  const serverCover = installHeadCover();
  runBootScript();
  vi.advanceTimersByTime(options.elapsedMs);
  if (options.foreignNode) {
    document.head.insertBefore(document.createElement('div'), document.head.firstChild);
  }
  const recoverableErrors: unknown[] = [];
  const silenceReportedError = (event: ErrorEvent) => event.preventDefault();
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  window.addEventListener('error', silenceReportedError);
  try {
    act(() => {
      hydratedHeadRoot = hydrateRoot(document.head, <EntranceCoverHead />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });
  } finally {
    window.removeEventListener('error', silenceReportedError);
  }
  const consoleErrors = consoleError.mock.calls.length;
  consoleError.mockRestore();
  const hydratedCover = document.getElementById(ENTRANCE_COVER_ID);
  if (!(hydratedCover instanceof HTMLStyleElement)) throw new Error('hydrated cover missing');
  const hydrationMismatches = recoverableErrors.filter(
    (error) => error instanceof Error && /hydrat/i.test(error.message),
  ).length;
  return { serverCover, hydratedCover, recoverableErrors, hydrationMismatches, consoleErrors };
}

describe('SABA-B-13 static head cover and takeover', () => {
  beforeEach(() => {
    window.__czabaEntrance = undefined;
    vi.useFakeTimers();
    window.sessionStorage.clear();
    stubMatchMedia(false);
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    unmountHydratedHead();
    cleanup();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.head.innerHTML = '';
    window.__czabaEntrance = undefined;
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('E1 the server renders a disabled cover style and the boot script', () => {
    const html = renderToString(<EntranceCoverHead />);
    expect(html).toContain(`<style id="${ENTRANCE_COVER_ID}" media="not all">`);
    expect(html).toContain('body::before');
    expect(html).toContain('z-index:60');
    expect(html).toContain('background:var(--color-black)');
    expect(html).toContain(`250ms ease-in-out ${ENTRANCE_FAILSAFE_MS}ms forwards`);
    expect(html).toContain('prefers-reduced-motion: no-preference');
    expect(html).toContain('<script>');
    expect(ENTRANCE_FAILSAFE_MS).toBe(1000);
  });

  it('E1b the server render keeps the cover off even when a pending handshake exists', () => {
    window.__czabaEntrance = { start: performance.now(), state: 'pending' };
    expect(renderToString(<EntranceCoverHead />)).toContain('media="all"');
    vi.stubGlobal('window', undefined);
    try {
      expect(typeof window).toBe('undefined');
      expect(renderToString(<EntranceCoverHead />)).toContain(
        `<style id="${ENTRANCE_COVER_ID}" media="not all">`,
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('E2 on a fresh tab at / the boot script turns the cover on and claims the session', () => {
    const cover = installHeadCover();
    runBootScript();
    expect(cover.media).toBe('all');
    expect(Number.isFinite(Number(cover.getAttribute('data-start')))).toBe(true);
    expect(cover.getAttribute('data-start')).not.toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('1');
  });

  it.each([
    ['a seen tab', () => window.sessionStorage.setItem(SESSION_KEY, '1')],
    ['reduced motion', () => stubMatchMedia(true)],
    ['another path', () => window.history.replaceState(null, '', '/store')],
  ])('E3 %s keeps the cover off', (_label, arrange) => {
    arrange();
    const before = window.sessionStorage.getItem(SESSION_KEY);
    const cover = installHeadCover();
    runBootScript();
    expect(cover.media).toBe('not all');
    expect(cover.getAttribute('data-start')).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe(before);
  });

  it('E4 blocked storage keeps the cover off and does not throw', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const cover = installHeadCover();
    expect(runBootScript).not.toThrow();
    expect(cover.media).toBe('not all');
  });

  it('E5 the animated overlay takes over in the same commit and turns the cover off', () => {
    const cover = installHeadCover();
    runBootScript();
    vi.advanceTimersByTime(160);
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).not.toBeNull();
    expect(cover.media).toBe('not all');
    expect(cover.getAttribute('data-state')).toBe('live');
    act(() => {
      vi.advanceTimersByTime(entranceTimeline(160).endInMs - 1);
    });
    expect(findOverlay(container)).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(findOverlay(container)).toBeNull();
  });

  it('E6 the timeline counts from the first cover frame: 1450 ms minimum, 1900 ms cap', () => {
    expect(entranceTimeline(0)).toEqual({
      logoInMs: 120,
      holdInMs: 300,
      exitInMs: 1200,
      endInMs: 1450,
    });
    expect(entranceTimeline(160)).toEqual({
      logoInMs: 120,
      holdInMs: 300,
      exitInMs: 1050,
      endInMs: 1300,
    });
    expect(160 + entranceTimeline(160).endInMs).toBe(1460);
    expect(900 + entranceTimeline(900).endInMs).toBe(ENTRANCE_MAX_TOTAL_MS);
    expect(999 + entranceTimeline(999).endInMs).toBe(ENTRANCE_MAX_TOTAL_MS);
    expect(entranceTimeline(-50)).toEqual(entranceTimeline(0));
  });

  it('E7 a takeover after the failsafe never replays the entrance', () => {
    const cover = installHeadCover();
    runBootScript();
    vi.advanceTimersByTime(ENTRANCE_FAILSAFE_MS);
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).toBeNull();
    expect(cover.getAttribute('data-state')).toBe('expired');
    expect(cover.media).toBe('not all');
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('1');
  });

  it.each([
    ['Escape', () => fireEvent.keyDown(document, { key: 'Escape' })],
    ['Tab', () => fireEvent.keyDown(document, { key: 'Tab' })],
    ['click', () => fireEvent.click(document.body)],
  ])('E8 %s before hydration skips the cover and the entrance', (_label, skip) => {
    const cover = installHeadCover();
    runBootScript();
    const notPrevented = skip();
    expect(notPrevented).toBe(true);
    expect(cover.media).toBe('not all');
    expect(cover.getAttribute('data-state')).toBe('skipped');
    const overlayMounted = watchOverlayMounts();
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).toBeNull();
    expect(overlayMounted()).toBe(false);
  });

  it('E8b other keys before hydration keep the cover', () => {
    const cover = installHeadCover();
    runBootScript();
    for (const key of ['a', 'ArrowDown', 'Shift', 'Enter']) fireEvent.keyDown(document, { key });
    expect(cover.media).toBe('all');
    expect(cover.getAttribute('data-state')).toBeNull();
  });

  it('E9 after the takeover the boot listeners are gone and the overlay owns the skip', () => {
    const bootListenersLeft = trackBootCaptureListeners();
    const takeoverListenersLeft = trackTakeoverListeners();
    const cover = installHeadCover();
    runBootScript();
    expect(bootListenersLeft()).toBe(2);
    expect(takeoverListenersLeft()).toBe(1);
    const { container } = render(<SpotlightLoader />);
    expect(cover.getAttribute('data-state')).toBe('live');
    expect(bootListenersLeft()).toBe(0);
    expect(takeoverListenersLeft()).toBe(0);
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(cover.getAttribute('data-state')).toBe('live');
    expect(findOverlay(container)).toBeNull();
  });

  it('E10 a client navigation to / after a seen entrance shows nothing', () => {
    const cover = installHeadCover();
    window.sessionStorage.setItem(SESSION_KEY, '1');
    const { container } = render(<SpotlightLoader />);
    act(() => {
      vi.advanceTimersByTime(TOTAL);
    });
    expect(findOverlay(container)).toBeNull();
    expect(cover.media).toBe('not all');
  });

  it('E11 the root layout renders the cover right after the stylesheet links', () => {
    const root = readFileSync(resolve(__dirname, '../../root.tsx'), 'utf8');
    expect(root).toMatch(/<Links \/>\s*<EntranceCoverHead \/>/);
    expect(root.match(/<EntranceCoverHead \/>/g)).toHaveLength(1);
  });

  it('E12 a client navigation to / on a fresh tab still plays, as at HEAD', () => {
    const cover = installHeadCover();
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).not.toBeNull();
    expect(cover.media).toBe('not all');
    expect(cover.getAttribute('data-state')).toBeNull();
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe('1');
  });

  it('E13 a cover that is on without a start time is retired, not animated', () => {
    const cover = installHeadCover();
    cover.media = 'all';
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).toBeNull();
    expect(cover.getAttribute('data-state')).toBe('expired');
    expect(cover.media).toBe('not all');
  });

  it('E14 a click between the claim and the hand-off skips the animated overlay too', () => {
    function ClickDuringMount() {
      useEffect(() => {
        document.body.click();
      }, []);
      return null;
    }
    const cover = installHeadCover();
    runBootScript();
    const { container } = render(
      <>
        <SpotlightLoader />
        <ClickDuringMount />
      </>,
    );
    expect(cover.getAttribute('data-state')).toBe('skipped');
    expect(cover.media).toBe('not all');
    expect(findOverlay(container)).toBeNull();
  });

  it('E15 a client re-render that replaces the cover style still plays the entrance and frees the boot listeners', () => {
    const bootListenersLeft = trackBootCaptureListeners();
    vi.advanceTimersByTime(500);
    installHeadCover();
    runBootScript();
    expect(bootListenersLeft()).toBe(2);
    vi.advanceTimersByTime(160);
    const replaced = reinsertCoverHeadHtml();
    expect(replaced.media).toBe('all');
    expect(replaced.getAttribute('data-start')).toBeNull();
    const { container } = render(<SpotlightLoader />);
    expect(replaced.media).toBe('not all');
    expect(findOverlay(container)).not.toBeNull();
    expect(window.__czabaEntrance?.state).toBe('live');
    expect(replaced.getAttribute('data-state')).toBe('live');
    expect(bootListenersLeft()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(entranceTimeline(160).endInMs - 1);
    });
    expect(findOverlay(container)).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(findOverlay(container)).toBeNull();
  });

  it('E16 a skip after the style was replaced turns the new style off and skips the entrance', () => {
    installHeadCover();
    runBootScript();
    const replaced = reinsertCoverHeadHtml();
    expect(replaced.media).toBe('all');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(window.__czabaEntrance?.state).toBe('skipped');
    expect(replaced.getAttribute('data-state')).toBe('skipped');
    expect(replaced.media).toBe('not all');
    const overlayMounted = watchOverlayMounts();
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).toBeNull();
    expect(overlayMounted()).toBe(false);
  });

  it('E17 a takeover after the failsafe frees the boot listeners', () => {
    const bootListenersLeft = trackBootCaptureListeners();
    installHeadCover();
    runBootScript();
    vi.advanceTimersByTime(ENTRANCE_FAILSAFE_MS - 1);
    expect(bootListenersLeft()).toBe(2);
    vi.advanceTimersByTime(1);
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).toBeNull();
    expect(window.__czabaEntrance?.state).toBe('expired');
    expect(bootListenersLeft()).toBe(0);
  });

  it('E18 with no takeover the boot listeners remove themselves after the failsafe fade', () => {
    const bootListenersLeft = trackBootCaptureListeners();
    const cover = installHeadCover();
    runBootScript();
    vi.advanceTimersByTime(ENTRANCE_FAILSAFE_MS + 250 - 1);
    expect(bootListenersLeft()).toBe(2);
    vi.advanceTimersByTime(1);
    expect(bootListenersLeft()).toBe(0);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(window.__czabaEntrance?.state).toBe('pending');
    expect(cover.getAttribute('data-state')).toBeNull();
  });

  it('E19 a re-render after the failsafe keeps the cover off on a visible page', () => {
    installHeadCover();
    runBootScript();
    vi.advanceTimersByTime(ENTRANCE_FAILSAFE_MS - 1);
    expect(reinsertCoverHeadHtml().media).toBe('all');
    vi.advanceTimersByTime(1);
    const replaced = reinsertCoverHeadHtml();
    expect(window.__czabaEntrance?.state).toBe('pending');
    expect(replaced.media).toBe('not all');
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).toBeNull();
    expect(window.__czabaEntrance?.state).toBe('expired');
    expect(replaced.media).toBe('not all');
  });

  // React-ის dev build hydration-ის გაფრთხილებას მოდულზე ერთხელ ბეჭდავს: სუფთა hydration-ის რიგები mismatch-ის რიგებამდე უნდა იყოს (M5)
  it('E21 a clean hydration keeps the boot-script cover node, its media and its start time', () => {
    vi.advanceTimersByTime(500);
    const { serverCover, hydratedCover, recoverableErrors, consoleErrors } = hydrateHeadCover({
      foreignNode: false,
      elapsedMs: 160,
    });
    expect(recoverableErrors).toHaveLength(0);
    expect(consoleErrors).toBe(0);
    expect(hydratedCover).toBe(serverCover);
    expect(hydratedCover.media).toBe('all');
    expect(hydratedCover.getAttribute('data-start')).toBe(String(window.__czabaEntrance?.start));
  });

  it('E21b a clean hydration after the failsafe leaves the boot-script media in place (React keeps hydrated attributes)', () => {
    vi.advanceTimersByTime(500);
    const { serverCover, hydratedCover, recoverableErrors, consoleErrors } = hydrateHeadCover({
      foreignNode: false,
      elapsedMs: ENTRANCE_FAILSAFE_MS,
    });
    expect(recoverableErrors).toHaveLength(0);
    expect(consoleErrors).toBe(0);
    expect(hydratedCover).toBe(serverCover);
    expect(hydratedCover.media).toBe('all');
  });

  it('E20 a real hydration mismatch replaces the cover style, which takes the pending media and is handed over', () => {
    vi.advanceTimersByTime(500);
    const { serverCover, hydratedCover, hydrationMismatches } = hydrateHeadCover({
      foreignNode: true,
      elapsedMs: 160,
    });
    expect(hydrationMismatches).toBeGreaterThan(0);
    expect(hydratedCover).not.toBe(serverCover);
    expect(serverCover.isConnected).toBe(false);
    expect(hydratedCover.getAttribute('data-start')).toBeNull();
    expect(hydratedCover.media).toBe('all');
    expect(window.__czabaEntrance?.state).toBe('pending');
    const { container } = render(<SpotlightLoader />);
    expect(findOverlay(container)).not.toBeNull();
    expect(window.__czabaEntrance?.state).toBe('live');
    expect(hydratedCover.getAttribute('data-state')).toBe('live');
    expect(hydratedCover.media).toBe('not all');
  });

  it('E20b a real hydration mismatch after the failsafe renders the cover off', () => {
    vi.advanceTimersByTime(500);
    const { serverCover, hydratedCover, hydrationMismatches } = hydrateHeadCover({
      foreignNode: true,
      elapsedMs: ENTRANCE_FAILSAFE_MS,
    });
    expect(hydratedCover).not.toBe(serverCover);
    expect(hydrationMismatches).toBeGreaterThan(0);
    expect(window.__czabaEntrance?.state).toBe('pending');
    expect(hydratedCover.media).toBe('not all');
  });
});
