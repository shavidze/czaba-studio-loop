import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { NavigateFunction } from 'react-router-dom';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadMagnetPopup } from '~/components/marketing/LeadMagnetPopup';
import { isLeadMagnetExcludedPath, useLeadMagnet } from '~/hooks/useLeadMagnet';
import { useScrollLock } from '~/hooks/useScrollLock';

const STORAGE_KEY = 'czaba_lead_magnet';
const SHOW_DELAY_MS = 8000;

interface LeadMagnetProbeSnapshot {
  shouldShow: boolean;
  currentStep: string;
  setStep: (step: 'offer' | 'email' | 'success') => void;
  error: string | null;
  submitEmail: (email: string) => Promise<void>;
  navigate: NavigateFunction;
}

const probe: { current: LeadMagnetProbeSnapshot | null } = { current: null };
const renderLog: Array<{ pathname: string; shouldShow: boolean }> = [];

function LeadMagnetProbe() {
  const leadMagnet = useLeadMagnet(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  renderLog.push({ pathname, shouldShow: leadMagnet.shouldShow });
  probe.current = {
    shouldShow: leadMagnet.shouldShow,
    currentStep: leadMagnet.currentStep,
    setStep: leadMagnet.setStep,
    error: leadMagnet.error,
    submitEmail: leadMagnet.submitEmail,
    navigate,
  };
  return null;
}

const navigator: { current: NavigateFunction | null } = { current: null };

function NavigateProbe() {
  navigator.current = useNavigate();
  return null;
}

function renderPopupAt(path: string) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <LeadMagnetPopup isLoggedIn={false} />
      <NavigateProbe />
    </MemoryRouter>,
  );
}

function popupNavigateTo(path: string) {
  act(() => {
    navigator.current?.(path);
  });
}

function current(): LeadMagnetProbeSnapshot {
  const snapshot = probe.current;
  if (!snapshot) throw new Error('probe not rendered');
  return snapshot;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <LeadMagnetProbe />
    </MemoryRouter>,
  );
}

function setScrollPercent(percent: number) {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: 2000,
  });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: (1000 * percent) / 100 });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

function exitIntent() {
  act(() => {
    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, clientX: 10 }));
  });
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function navigateTo(path: string) {
  act(() => {
    current().navigate(path);
  });
}

function storedState(): { viewCount: number; dismissed: boolean } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

const EXCLUDED_PATHS = [
  '/products/pulse-loop-kit',
  '/cart',
  '/checkout/success',
  '/checkout/cancel',
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-11T12:00:00Z'));
  localStorage.clear();
  probe.current = null;
  navigator.current = null;
  renderLog.length = 0;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  setScrollPercent(0);
});

describe('LeadMagnet route exclusion (STORE-2b-1)', () => {
  it.each([
    ['/products/pulse-loop-kit', true],
    ['/products/a/b', true],
    ['/cart', true],
    ['/cart/', true],
    ['/checkout', true],
    ['/checkout/success', true],
    ['/checkout/cancel', true],
    ['/', false],
    ['/store', false],
    ['/products', false],
    ['/cartography', false],
    ['/checkouts', false],
    ['/free-downloads', false],
    ['/gift-cards', false],
    ['/account/downloads', false],
    ['/recordings/7', false],
    ['/scenes/7', false],
  ])('LMR1 isLeadMagnetExcludedPath(%s) is %s', (path, expected) => {
    expect(isLeadMagnetExcludedPath(path)).toBe(expected);
  });

  it('LMR2 control: on home a 40 % scroll and 8 s show the popup and count one view', () => {
    renderAt('/');
    setScrollPercent(55);
    advance(SHOW_DELAY_MS);
    expect(current().shouldShow).toBe(true);
    expect(storedState()?.viewCount).toBe(1);
  });

  it.each(
    EXCLUDED_PATHS,
  )('LMR3 %s: a 40 percent scroll and 8 s show nothing and count no view', (path) => {
    renderAt(path);
    setScrollPercent(55);
    advance(SHOW_DELAY_MS * 2);
    expect(current().shouldShow).toBe(false);
    expect(storedState()?.viewCount ?? 0).toBe(0);
  });

  it('LMR4 exit intent on a product page shows nothing; on home after a fresh scroll it shows once', () => {
    renderAt('/products/pulse-loop-kit');
    setScrollPercent(55);
    exitIntent();
    expect(current().shouldShow).toBe(false);
    expect(storedState()?.viewCount ?? 0).toBe(0);
    navigateTo('/');
    exitIntent();
    expect(current().shouldShow).toBe(false);
    setScrollPercent(56);
    exitIntent();
    expect(current().shouldShow).toBe(true);
    expect(storedState()?.viewCount).toBe(1);
  });

  it('LMR5 scroll on a product page does not carry over: home needs its own scroll', () => {
    renderAt('/products/pulse-loop-kit');
    setScrollPercent(55);
    advance(5000);
    navigateTo('/');
    advance(SHOW_DELAY_MS);
    expect(current().shouldShow).toBe(false);
    exitIntent();
    expect(current().shouldShow).toBe(false);
    setScrollPercent(56);
    exitIntent();
    expect(current().shouldShow).toBe(true);
    expect(storedState()?.viewCount).toBe(1);
  });

  it('LMR6 an open popup hides on an excluded route without a dismissal, back to the offer step', () => {
    renderAt('/');
    setScrollPercent(55);
    advance(SHOW_DELAY_MS);
    act(() => {
      current().setStep('email');
    });
    expect(current().shouldShow).toBe(true);
    navigateTo('/products/pulse-loop-kit');
    expect(current().shouldShow).toBe(false);
    expect(current().currentStep).toBe('offer');
    expect(storedState()).toEqual(expect.objectContaining({ viewCount: 1, dismissed: false }));
    navigateTo('/');
    setScrollPercent(57);
    advance(SHOW_DELAY_MS - 1);
    expect(current().shouldShow).toBe(false);
    advance(1);
    expect(current().shouldShow).toBe(true);
    expect(current().currentStep).toBe('offer');
    expect(storedState()?.viewCount).toBe(2);
  });

  it('LMR11 no render on an excluded route reports the popup as shown', () => {
    renderAt('/');
    setScrollPercent(55);
    advance(SHOW_DELAY_MS);
    expect(current().shouldShow).toBe(true);
    navigateTo('/cart');
    const excludedRenders = renderLog.filter((entry) => entry.pathname === '/cart');
    expect(excludedRenders.length).toBeGreaterThan(0);
    expect(excludedRenders.filter((entry) => entry.shouldShow)).toEqual([]);
  });

  it('LMR12 a route hide clears the last submit error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Subscribe failed' }), { status: 500 }),
    );
    renderAt('/');
    setScrollPercent(55);
    advance(SHOW_DELAY_MS);
    await act(async () => {
      await current()
        .submitEmail('a@b.co')
        .catch(() => undefined);
    });
    expect(current().error).toBe('Subscribe failed');
    navigateTo('/checkout/success');
    expect(current().error).toBeNull();
  });

  it('LMR13 keep-list: the 8 s check is one-shot; after it passes unscrolled, scroll plus 8 s shows nothing', () => {
    renderAt('/');
    advance(SHOW_DELAY_MS);
    setScrollPercent(55);
    advance(SHOW_DELAY_MS * 2);
    expect(current().shouldShow).toBe(false);
    expect(storedState()?.viewCount ?? 0).toBe(0);
  });

  it('LMR7 journey: scroll on home, go to a product before 8 s, the popup never opens there', () => {
    renderAt('/');
    setScrollPercent(55);
    advance(3000);
    navigateTo('/products/pulse-loop-kit');
    advance(SHOW_DELAY_MS * 2);
    expect(current().shouldShow).toBe(false);
    expect(storedState()?.viewCount ?? 0).toBe(0);
  });

  it('LMR8 between two allowed pages the armed window carries over as before', () => {
    renderAt('/');
    setScrollPercent(55);
    advance(3000);
    navigateTo('/store');
    advance(SHOW_DELAY_MS - 3000);
    expect(current().shouldShow).toBe(true);
    expect(storedState()?.viewCount).toBe(1);
  });
});

describe('LeadMagnet route hide keeps the new page scroll (STORE-2b-1)', () => {
  it('LMR9 an open popup hidden by a route change unlocks the body and does not restore the old scroll', () => {
    renderPopupAt('/');
    setScrollPercent(55);
    advance(SHOW_DELAY_MS);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.body.style.top).toBe('-550px');
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    popupNavigateTo('/products/pulse-loop-kit');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('LMR10 control: closing the popup on an allowed page still restores the scroll', () => {
    renderPopupAt('/');
    setScrollPercent(55);
    advance(SHOW_DELAY_MS);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(scrollTo).toHaveBeenCalledWith(0, 550);
  });
});

describe('useScrollLock restore option (STORE-2b-1)', () => {
  function lockAt(y: number, restoreScrollOnUnlock?: boolean) {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
    return renderHook(
      ({ isLocked }) =>
        useScrollLock(
          isLocked,
          restoreScrollOnUnlock === undefined ? undefined : { restoreScrollOnUnlock },
        ),
      { initialProps: { isLocked: true } },
    );
  }

  it('SL1 without options an unlock restores the locked scroll (as before)', () => {
    const { rerender } = lockAt(300);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    rerender({ isLocked: false });
    expect(scrollTo).toHaveBeenCalledWith(0, 300);
  });

  it('SL2 restoreScrollOnUnlock false: unlock and unmount clear the lock without scrolling', () => {
    const { rerender, unmount } = lockAt(300, false);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    rerender({ isLocked: false });
    expect(document.body.style.position).toBe('');
    rerender({ isLocked: true });
    unmount();
    expect(document.body.style.position).toBe('');
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
