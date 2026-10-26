import { fireEvent, render, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Footer } from '~/components/layout/Footer';
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

const EXPECTED_NAV = [
  ['Collections', '/store'],
  ['Studio', '/studio-lab'],
  ['Free Samples', '/free-downloads'],
  ['About', '/about'],
];

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

function getNavInventory(nav: Element | undefined) {
  if (!nav) return [];
  return Array.from(nav.querySelectorAll('a')).map((anchor) => [
    anchor.textContent?.trim() ?? '',
    anchor.getAttribute('href') ?? '',
  ]);
}

describe('Store Header (STORE-1c)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.state.isAuthenticated = false;
    authMock.state.isInitializing = false;
    authMock.state.user = null;
  });

  it('N1 desktop nav lists exactly Collections, Studio, Free Samples, About in order', () => {
    const { container } = renderHeaderAt('/');
    const navs = getHeaderElement(container).querySelectorAll('nav');

    expect(navs).toHaveLength(2);
    expect(getNavInventory(navs[0])).toEqual(EXPECTED_NAV);
  });

  it('N2 mobile nav lists the same four links and closes after the Studio link click', () => {
    const { container } = renderHeaderAt('/');
    const header = getHeaderElement(container);
    const mobileNav = header.querySelectorAll('nav')[1];

    expect(getNavInventory(mobileNav)).toEqual(EXPECTED_NAV);

    const menuWrapper = mobileNav?.parentElement?.parentElement;
    if (!menuWrapper || !mobileNav) throw new Error('mobile menu wrapper missing');
    expect(menuWrapper.className).toContain('max-h-0 opacity-0');

    fireEvent.click(within(header).getByRole('button', { name: 'Toggle menu' }));
    expect(menuWrapper.className).toContain('opacity-100');
    expect(menuWrapper.className).not.toContain('max-h-0');

    fireEvent.click(within(mobileNav).getByRole('link', { name: 'Studio' }));
    expect(menuWrapper.className).toContain('max-h-0 opacity-0');
  });

  it('N3 header has no heading, no removed links, no Demo badge and no gradient wordmark', () => {
    const { container } = renderHeaderAt('/');
    const header = getHeaderElement(container);
    const text = header.textContent ?? '';

    expect(header.querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0);
    for (const removed of ['Gift Cards', 'Hire Us', 'Demo', 'Studio Lab']) {
      expect(text).not.toContain(removed);
    }
    expect(header.querySelectorAll('.text-glow')).toHaveLength(0);
    expect(header.querySelectorAll('a[href="/gift-cards"], a[href="/hire-us"]')).toHaveLength(0);

    const homeLink = header.querySelector('a[href="/"]');
    expect(homeLink).not.toBeNull();
    expect(within(header).getByRole('link', { name: 'CZABA' })).toBe(homeLink);
  });

  it('N4 Collections carries the active underline on /store and the others do not', () => {
    const { container } = renderHeaderAt('/store');
    const desktopNav = getHeaderElement(container).querySelector('nav');
    if (!desktopNav) throw new Error('desktop nav missing');

    const collections = within(desktopNav).getByRole('link', { name: 'Collections' });
    expect(collections.classList.contains('after:scale-x-100')).toBe(true);
    expect(collections.classList.contains('text-foreground')).toBe(true);

    for (const name of ['Studio', 'Free Samples', 'About']) {
      const link = within(desktopNav).getByRole('link', { name });
      expect(link.classList.contains('after:scale-x-0')).toBe(true);
      expect(link.classList.contains('after:scale-x-100')).toBe(false);
      expect(link.classList.contains('text-foreground')).toBe(false);
    }
  });

  describe('N5 auth block preserved', () => {
    it('anonymous visitor sees Sign In and a click opens the signin modal once', () => {
      const { container } = renderHeaderAt('/');
      const header = getHeaderElement(container);
      const signInButtons = within(header).getAllByRole('button', { name: 'Sign In' });

      expect(signInButtons).toHaveLength(2);
      fireEvent.click(signInButtons[0]);
      expect(authMock.openModal).toHaveBeenCalledTimes(1);
      expect(authMock.openModal).toHaveBeenCalledWith('signin');
    });

    it('authenticated user sees the user menu greeting and Logout calls signOut', () => {
      authMock.state.isAuthenticated = true;
      authMock.state.user = signedInUser;
      const { container } = renderHeaderAt('/');
      const header = getHeaderElement(container);

      expect(within(header).getByRole('button', { name: 'User menu' })).toBeTruthy();
      expect(within(header).getByText('Hi, Ana!')).toBeTruthy();
      expect(within(header).queryAllByRole('button', { name: 'Sign In' })).toHaveLength(0);

      const logoutButtons = within(header).getAllByRole('button', { name: 'Logout' });
      expect(logoutButtons).toHaveLength(2);
      fireEvent.click(logoutButtons[0]);
      expect(authMock.signOut).toHaveBeenCalledTimes(1);
    });

    it('initializing auth renders the skeleton and no Sign In button', () => {
      authMock.state.isInitializing = true;
      const { container } = renderHeaderAt('/');
      const header = getHeaderElement(container);

      expect(header.querySelectorAll('.animate-pulse')).toHaveLength(2);
      expect(within(header).queryAllByRole('button', { name: 'Sign In' })).toHaveLength(0);
    });
  });

  it('S1 server-rendered header has no h1 and no text-glow', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );

    expect(html).toContain('CZABA');
    expect(html).not.toContain('<h1');
    expect(html).not.toContain('text-glow');
  });
});

describe('Store Footer (STORE-1c)', () => {
  it('F1 copyright uses the CZABA name and keeps Gift Cards and Hire Us links', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    if (!footer) throw new Error('footer not rendered');
    const year = new Date().getFullYear();

    expect(within(footer).getByText(`© ${year} CZABA. All rights reserved.`)).toBeTruthy();
    expect(footer.textContent).not.toContain('Czaba Music');
    expect(within(footer).getByRole('link', { name: 'Gift Cards' }).getAttribute('href')).toBe(
      '/gift-cards',
    );
    expect(within(footer).getByRole('link', { name: 'Hire Us' }).getAttribute('href')).toBe(
      '/hire-us',
    );
  });
});
