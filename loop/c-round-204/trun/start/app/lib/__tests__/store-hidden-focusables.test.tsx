import { act, fireEvent, render, waitFor, within } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioShowcase } from '~/components/home/StudioShowcase';
import { Header } from '~/components/layout/Header';
import type { AuthModalView, User } from '~/types/auth';

interface MockAuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: User | null;
}

const authMock = vi.hoisted(() => {
  const state: MockAuthState = {
    isAuthenticated: false,
    isInitializing: false,
    user: null,
  };
  return {
    state,
    openModal: vi.fn((_view?: AuthModalView) => undefined),
    signOut: vi.fn(async () => undefined),
  };
});

vi.mock('~/hooks', () => ({
  useAuth: () => ({
    ...authMock.state,
    openModal: authMock.openModal,
    signOut: authMock.signOut,
  }),
}));
vi.mock('~/components/search', () => ({
  CommandPalette: () => <button type="button">Search</button>,
}));

const signedInUser: User = {
  id: 7,
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Test',
  name: 'Ana Test',
  accessToken: 'test-access',
  refreshToken: 'test-refresh',
  accessTokenExpires: '2099-01-01T00:00:00Z',
  registrationSource: 'email',
};

interface FakeObserverEntry {
  isIntersecting: boolean;
}

type FakeObserverCallback = (entries: FakeObserverEntry[]) => void;

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly callback: FakeObserverCallback;
  readonly options: IntersectionObserverInit | undefined;
  readonly observe = vi.fn((_target: Element) => undefined);
  readonly unobserve = vi.fn((_target: Element) => undefined);
  readonly disconnect = vi.fn(() => undefined);
  readonly takeRecords = vi.fn(() => []);

  constructor(callback: FakeObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    FakeIntersectionObserver.instances.push(this);
  }
}

function renderHeaderAt(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

function getHeaderElement(container: HTMLElement): HTMLElement {
  const header = container.querySelector('header');
  if (!header) throw new Error('header not rendered');
  return header;
}

function renderSignedInHeader() {
  authMock.state.isAuthenticated = true;
  authMock.state.user = signedInUser;
  const { container } = renderHeaderAt('/');
  const header = getHeaderElement(container);
  const userMenuButton = within(header).getByRole('button', { name: 'User menu' });
  const panelId = userMenuButton.getAttribute('aria-controls') ?? '';
  const panel = header.querySelector(`#${panelId}`);
  if (!(panel instanceof HTMLElement)) throw new Error('user menu panel missing');
  return { header, userMenuButton, panel };
}

function renderShowcase() {
  const { container } = render(
    <MemoryRouter initialEntries={['/']}>
      <StudioShowcase />
    </MemoryRouter>,
  );
  const section = container.querySelector('section');
  if (!section) throw new Error('showcase section not rendered');
  return section;
}

function getLatestObserver(): FakeIntersectionObserver {
  const observer = FakeIntersectionObserver.instances.at(-1);
  if (!observer) throw new Error('IntersectionObserver was not created');
  return observer;
}

const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]';

describe('Store hidden focusables: Header mobile menu (R105)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.state.isAuthenticated = false;
    authMock.state.isInitializing = false;
    authMock.state.user = null;
  });

  it('HF1 Toggle menu reports and controls the mobile menu state', () => {
    const { container } = renderHeaderAt('/');
    const header = getHeaderElement(container);
    const toggle = within(header).getByRole('button', { name: 'Toggle menu' });

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('header-mobile-menu');

    const mobileMenu = header.querySelector('#header-mobile-menu');
    if (!(mobileMenu instanceof HTMLElement)) throw new Error('mobile menu missing');
    const mobileNav = within(mobileMenu).getByRole('navigation');
    expect(within(mobileNav).getByRole('link', { name: 'Collections' })).toBeTruthy();
    expect(within(mobileMenu).getByRole('button', { name: 'Sign In' })).toBeTruthy();

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(within(mobileNav).getByRole('link', { name: 'About' }));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Store hidden focusables: Header user menu disclosure (R106)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.state.isAuthenticated = false;
    authMock.state.isInitializing = false;
    authMock.state.user = null;
  });

  it('HF2 User menu is a button that toggles the panel holding the account links', () => {
    const { userMenuButton, panel } = renderSignedInHeader();

    expect(userMenuButton.getAttribute('type')).toBe('button');
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('false');
    expect(userMenuButton.getAttribute('aria-controls')).toBe('header-user-menu');
    expect(panel.id).toBe('header-user-menu');
    for (const name of ['My Account', 'Orders', 'Downloads']) {
      expect(within(panel).getByRole('link', { name })).toBeTruthy();
    }
    expect(within(panel).getByRole('button', { name: 'Logout' })).toBeTruthy();

    fireEvent.click(userMenuButton);
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(userMenuButton);
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('HF3 Escape inside the menu closes it, refocuses the button and stops propagation', () => {
    const { userMenuButton, panel } = renderSignedInHeader();
    const documentKeydown = vi.fn();
    document.addEventListener('keydown', documentKeydown);

    try {
      fireEvent.click(userMenuButton);
      const myAccount = within(panel).getByRole('link', { name: 'My Account' });
      act(() => myAccount.focus());
      expect(document.activeElement).toBe(myAccount);

      fireEvent.keyDown(myAccount, { key: 'Escape' });

      expect(userMenuButton.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(userMenuButton);
      expect(documentKeydown).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('keydown', documentKeydown);
    }
  });

  it('HF4 focus moving inside keeps the menu open; focus leaving closes it', () => {
    const { header, userMenuButton, panel } = renderSignedInHeader();
    const myAccount = within(panel).getByRole('link', { name: 'My Account' });
    const orders = within(panel).getByRole('link', { name: 'Orders' });
    const logout = within(panel).getByRole('button', { name: 'Logout' });
    const outsideButton = within(header).getByRole('button', { name: 'Toggle menu' });

    fireEvent.click(userMenuButton);
    fireEvent.focusOut(myAccount, { relatedTarget: orders });
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('true');

    fireEvent.focusOut(logout, { relatedTarget: outsideButton });
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(userMenuButton);
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('true');
    fireEvent.focusOut(logout, { relatedTarget: null });
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('HF5 pointerdown outside closes the menu; pointerdown inside keeps it open', () => {
    const { userMenuButton, panel } = renderSignedInHeader();
    const removeListenerSpy = vi.spyOn(document, 'removeEventListener');

    fireEvent.click(userMenuButton);
    fireEvent.pointerDown(document.body);
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('false');
    expect(removeListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    removeListenerSpy.mockRestore();

    fireEvent.click(userMenuButton);
    fireEvent.pointerDown(within(panel).getByRole('link', { name: 'Orders' }));
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('HF6 an account link click or Logout closes the menu; Logout signs out once', () => {
    const { userMenuButton, panel } = renderSignedInHeader();

    fireEvent.click(userMenuButton);
    fireEvent.click(within(panel).getByRole('link', { name: 'Downloads' }));
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(userMenuButton);
    fireEvent.click(within(panel).getByRole('button', { name: 'Logout' }));
    expect(userMenuButton.getAttribute('aria-expanded')).toBe('false');
    expect(authMock.signOut).toHaveBeenCalledTimes(1);
  });

  it('HF7 every header button declares type="button" (anonymous and signed in)', () => {
    const anonymous = renderHeaderAt('/');
    const anonymousButtons = getHeaderElement(anonymous.container).querySelectorAll('button');
    expect(anonymousButtons.length).toBeGreaterThan(0);
    for (const button of anonymousButtons) {
      expect(button.getAttribute('type')).toBe('button');
    }
    anonymous.unmount();

    const { header } = renderSignedInHeader();
    const signedInButtons = header.querySelectorAll('button');
    expect(signedInButtons.length).toBeGreaterThan(0);
    for (const button of signedInButtons) {
      expect(button.getAttribute('type')).toBe('button');
    }
  });
});

describe('Store hidden focusables: StudioShowcase reveal (R107)', () => {
  const initialSkipAnimations = MotionGlobalConfig.skipAnimations;

  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });

  afterAll(() => {
    MotionGlobalConfig.skipAnimations = initialSkipAnimations;
  });

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('HF8 the section has one CTA stop, no tabindex, threshold 0.3 and reveals once', () => {
    const section = renderShowcase();

    expect(section.querySelectorAll('[tabindex]')).toHaveLength(0);
    const ctaStops = Array.from(section.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (element) => element.textContent?.trim() === 'Browse the Collection',
    );
    expect(ctaStops).toHaveLength(1);
    const cta = within(section).getByRole('link', { name: 'Browse the Collection' });
    expect(ctaStops[0]).toBe(cta);
    expect(cta.getAttribute('href')).toBe('/store');

    const observer = getLatestObserver();
    expect(observer.options?.threshold).toBe(0.3);
    expect(observer.observe).toHaveBeenCalledWith(section);

    act(() => observer.callback([{ isIntersecting: false }]));
    expect(observer.disconnect).not.toHaveBeenCalled();

    act(() => observer.callback([{ isIntersecting: true }]));
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('HF8b an intersecting entry reveals the CTA and a later non-intersecting entry keeps it', async () => {
    const section = renderShowcase();
    const ctaReveal = within(section).getByRole('link', {
      name: 'Browse the Collection',
    }).parentElement;
    if (!ctaReveal) throw new Error('CTA reveal wrapper missing');
    const observer = getLatestObserver();

    act(() => observer.callback([{ isIntersecting: true }]));
    await waitFor(() => expect(ctaReveal.style.opacity).toBe('1'));

    act(() => observer.callback([{ isIntersecting: false }]));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(ctaReveal.style.opacity).toBe('1');
  });

  it('HF9 focus inside the section reveals the CTA without any intersection', async () => {
    const section = renderShowcase();
    const cta = within(section).getByRole('link', { name: 'Browse the Collection' });
    const ctaReveal = cta.parentElement;
    if (!ctaReveal) throw new Error('CTA reveal wrapper missing');

    expect(ctaReveal.style.opacity).toBe('0');

    fireEvent.focus(cta);

    await waitFor(() => expect(ctaReveal.style.opacity).toBe('1'));
    expect(getLatestObserver().disconnect).not.toHaveBeenCalled();
  });
});
