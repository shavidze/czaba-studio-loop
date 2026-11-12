import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const analyticsMock = vi.hoisted(() => ({
  hasDecision: false,
  setConsent: vi.fn<(granted: boolean) => void>(),
}));

const locationMock = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('~/lib/analytics', () => ({
  GA4_MEASUREMENT_ID: 'G-CC183TEST',
  hasConsentDecision: () => analyticsMock.hasDecision,
  setAnalyticsConsent: (granted: boolean) => analyticsMock.setConsent(granted),
}));

vi.mock('@remix-run/react', () => ({
  useLocation: () => ({
    pathname: locationMock.pathname,
    search: '',
    hash: '',
    state: null,
    key: 'cookie-consent-test',
  }),
}));

import { CookieConsent } from '../CookieConsent';

const BANNER_ROOT_CLASS = 'fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up';

function advanceBannerTimer(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function renderCookieConsentAt(pathname: string) {
  locationMock.pathname = pathname;
  return render(<CookieConsent />);
}

describe('CookieConsent (M4)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    analyticsMock.hasDecision = false;
    analyticsMock.setConsent.mockClear();
    locationMock.pathname = '/';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('CC1: shows the banner on a Store route after 1500 ms with the unchanged root class', () => {
    const { container } = renderCookieConsentAt('/');

    advanceBannerTimer(1499);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();

    advanceBannerTimer(1);
    expect(screen.getByRole('button', { name: 'Accept' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Decline' })).not.toBeNull();
    expect(container.firstElementChild?.className).toBe(BANNER_ROOT_CLASS);
  });

  it('CC2: renders nothing on /studio-lab after 1500 ms and after 5000 ms', () => {
    const { container } = renderCookieConsentAt('/studio-lab');

    advanceBannerTimer(1500);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();

    advanceBannerTimer(3500);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('button', { name: 'Decline' })).toBeNull();
  });

  it('CC3: renders nothing on /studio/:productId after 1500 ms', () => {
    const { container } = renderCookieConsentAt('/studio/middle-east');

    advanceBannerTimer(1500);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
  });

  it('CC4: asks on the next Store route without another timer advance (R45)', () => {
    const { container, rerender } = renderCookieConsentAt('/studio-lab');

    advanceBannerTimer(1500);
    expect(container.innerHTML).toBe('');

    locationMock.pathname = '/products';
    rerender(<CookieConsent />);

    expect(screen.getByRole('button', { name: 'Accept' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Decline' })).not.toBeNull();
    expect(analyticsMock.setConsent).not.toHaveBeenCalled();
  });

  it('CC4b: hides a visible Store banner after navigating into the Studio', () => {
    const { container, rerender } = renderCookieConsentAt('/');

    advanceBannerTimer(1500);
    expect(screen.getByRole('button', { name: 'Accept' })).not.toBeNull();

    locationMock.pathname = '/studio-lab';
    rerender(<CookieConsent />);

    expect(container.innerHTML).toBe('');
    expect(analyticsMock.setConsent).not.toHaveBeenCalled();
  });

  describe('CC5: consent decisions on a Store route', () => {
    it('Accept grants consent once and hides the banner', () => {
      const { container } = renderCookieConsentAt('/');
      advanceBannerTimer(1500);

      fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

      expect(analyticsMock.setConsent).toHaveBeenCalledTimes(1);
      expect(analyticsMock.setConsent).toHaveBeenCalledWith(true);
      expect(container.innerHTML).toBe('');
    });

    it('Decline denies consent once and hides the banner', () => {
      const { container } = renderCookieConsentAt('/');
      advanceBannerTimer(1500);

      fireEvent.click(screen.getByRole('button', { name: 'Decline' }));

      expect(analyticsMock.setConsent).toHaveBeenCalledTimes(1);
      expect(analyticsMock.setConsent).toHaveBeenCalledWith(false);
      expect(container.innerHTML).toBe('');
    });

    it('renders nothing on / when a decision already exists', () => {
      analyticsMock.hasDecision = true;
      const { container } = renderCookieConsentAt('/');

      advanceBannerTimer(5000);

      expect(container.innerHTML).toBe('');
      expect(screen.queryByRole('button', { name: 'Accept' })).toBeNull();
    });
  });
});
