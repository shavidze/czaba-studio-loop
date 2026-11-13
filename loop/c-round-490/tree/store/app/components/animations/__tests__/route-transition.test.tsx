import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import {
  createMemoryRouter,
  MemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { RouteTransition } from '../RouteTransition';

function Page({ label }: { label: string }) {
  return <p data-testid="page">{label}</p>;
}

describe('RouteTransition', () => {
  it('RT1: a studio path renders the wrapper with no inline opacity on the server', () => {
    const html = renderToString(
      <RouteTransition pathname="/studio-lab" isStudioPage>
        <Page label="studio" />
      </RouteTransition>,
    );
    expect(html).toContain('class="page-transition-wrapper"');
    expect(html).not.toMatch(/opacity:\s*0/);
  });

  it('RT2: a store path keeps the motion fade (inline opacity 0 on the server)', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <RouteTransition pathname="/" isStudioPage={false}>
          <Page label="home" />
        </RouteTransition>
      </MemoryRouter>,
    );
    expect(html).toContain('class="page-transition-wrapper"');
    expect(html).toMatch(/opacity:\s*0/);
  });

  it('RT3: a studio path change remounts the page', () => {
    const { rerender, getByTestId } = render(
      <RouteTransition pathname="/studio/a" isStudioPage>
        <Page label="a" />
      </RouteTransition>,
    );
    const first = getByTestId('page');
    rerender(
      <RouteTransition pathname="/studio/b" isStudioPage>
        <Page label="b" />
      </RouteTransition>,
    );
    expect(getByTestId('page')).not.toBe(first);
  });

  it('RT4: the same studio path keeps the page mounted', () => {
    const { rerender, getByTestId } = render(
      <RouteTransition pathname="/studio-lab" isStudioPage>
        <Page label="x" />
      </RouteTransition>,
    );
    const first = getByTestId('page');
    rerender(
      <RouteTransition pathname="/studio-lab" isStudioPage>
        <Page label="y" />
      </RouteTransition>,
    );
    expect(getByTestId('page')).toBe(first);
  });
});

function announcerText(container: HTMLElement): string | null {
  return container.ownerDocument.querySelector('[data-route-announcer]')?.textContent ?? null;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

describe('RouteTransition route announcement (CLIENT-NAV-CONTRACT)', () => {
  afterEach(() => {
    document.title = '';
  });

  function StudioPage({ heading }: { heading: string }) {
    return <h1>{heading}</h1>;
  }

  it('RA1 renders one polite, atomic, visually hidden region that stays silent on the first render', async () => {
    document.title = 'CZABA Studio — Demo collection';
    const { container } = render(
      <RouteTransition pathname="/studio-lab" isStudioPage>
        <StudioPage heading="CZABA Studio" />
      </RouteTransition>,
    );
    await act(nextFrame);
    const regions = document.querySelectorAll('[data-route-announcer]');
    expect(regions).toHaveLength(1);
    const region = regions[0];
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.getAttribute('aria-atomic')).toBe('true');
    expect(region.hasAttribute('role')).toBe(false);
    expect(region.className).toBe('sr-only');
    expect(announcerText(container)).toBe('');
  });

  it('RA2 a path change announces the new document title after the next frame', async () => {
    document.title = 'CZABA Studio — Demo collection';
    const { container, rerender } = render(
      <RouteTransition pathname="/studio-lab" isStudioPage>
        <StudioPage heading="CZABA Studio" />
      </RouteTransition>,
    );
    await act(nextFrame);
    document.title = 'Middle East | CZABA';
    rerender(
      <RouteTransition pathname="/studio/middle-east" isStudioPage>
        <StudioPage heading="Middle East" />
      </RouteTransition>,
    );
    expect(announcerText(container)).toBe('');
    await act(nextFrame);
    expect(announcerText(container)).toBe('Middle East | CZABA');
  });

  it('RA3 an empty title falls back to the new page heading', async () => {
    document.title = 'FAQ | CZABA';
    const { container, rerender } = render(
      <RouteTransition pathname="/studio/a" isStudioPage>
        <StudioPage heading="Old heading" />
      </RouteTransition>,
    );
    await act(nextFrame);
    document.title = '';
    rerender(
      <RouteTransition pathname="/studio/b" isStudioPage>
        <StudioPage heading="Your Collection" />
      </RouteTransition>,
    );
    await act(nextFrame);
    expect(announcerText(container)).toBe('Your Collection');
  });

  it('RA4 two paths with the same name still change the region text', async () => {
    document.title = '';
    const { container, rerender } = render(
      <RouteTransition pathname="/studio/a" isStudioPage>
        <StudioPage heading="Start" />
      </RouteTransition>,
    );
    await act(nextFrame);
    rerender(
      <RouteTransition pathname="/studio/b" isStudioPage>
        <StudioPage heading="Sign in required" />
      </RouteTransition>,
    );
    await act(nextFrame);
    const first = announcerText(container);
    rerender(
      <RouteTransition pathname="/studio/c" isStudioPage>
        <StudioPage heading="Sign in required" />
      </RouteTransition>,
    );
    await act(nextFrame);
    const second = announcerText(container);
    rerender(
      <RouteTransition pathname="/studio/d" isStudioPage>
        <StudioPage heading="Sign in required" />
      </RouteTransition>,
    );
    await act(nextFrame);
    const third = announcerText(container);
    expect(first).toBe('Sign in required');
    expect(second).toBe(`Sign in required${String.fromCharCode(160)}`);
    expect(third).toBe('Sign in required');
  });

  it('RA5 a re-render on the same path announces nothing', async () => {
    document.title = 'Support | CZABA';
    const { container, rerender } = render(
      <RouteTransition pathname="/studio/a" isStudioPage>
        <StudioPage heading="A" />
      </RouteTransition>,
    );
    await act(nextFrame);
    rerender(
      <RouteTransition pathname="/studio/a" isStudioPage>
        <StudioPage heading="A again" />
      </RouteTransition>,
    );
    await act(nextFrame);
    expect(announcerText(container)).toBe('');
  });

  it('RA6 Studio to Store and back keeps one region and announces both arrivals', async () => {
    document.title = 'CZABA Studio — Demo collection';
    const { container, rerender } = render(
      <MemoryRouter initialEntries={['/studio-lab']}>
        <RouteTransition pathname="/studio-lab" isStudioPage>
          <StudioPage heading="CZABA Studio" />
        </RouteTransition>
      </MemoryRouter>,
    );
    await act(nextFrame);
    const regionBefore = document.querySelector('[data-route-announcer]');
    document.title = 'CZABA | Premium Cinematic Sound Design';
    rerender(
      <MemoryRouter initialEntries={['/studio-lab']}>
        <RouteTransition pathname="/" isStudioPage={false}>
          <StudioPage heading="CZABA" />
        </RouteTransition>
      </MemoryRouter>,
    );
    await act(nextFrame);
    expect(document.querySelectorAll('[data-route-announcer]')).toHaveLength(1);
    expect(document.querySelector('[data-route-announcer]')).toBe(regionBefore);
    expect(announcerText(container)).toBe('CZABA | Premium Cinematic Sound Design');
    document.title = 'CZABA Studio — Demo collection';
    rerender(
      <MemoryRouter initialEntries={['/studio-lab']}>
        <RouteTransition pathname="/studio-lab" isStudioPage>
          <StudioPage heading="CZABA Studio" />
        </RouteTransition>
      </MemoryRouter>,
    );
    await act(nextFrame);
    expect(document.querySelector('[data-route-announcer]')).toBe(regionBefore);
    expect(announcerText(container)).toBe('CZABA Studio — Demo collection');
  });

  it('RA7 two path changes inside one frame announce only the last page', async () => {
    document.title = 'Start';
    const { container, rerender } = render(
      <RouteTransition pathname="/studio/a" isStudioPage>
        <StudioPage heading="A" />
      </RouteTransition>,
    );
    await act(nextFrame);
    const writes: string[] = [];
    const observer = new MutationObserver(() => {
      writes.push(announcerText(container) ?? '');
    });
    const region = document.querySelector('[data-route-announcer]');
    if (region) observer.observe(region, { childList: true, characterData: true, subtree: true });
    document.title = 'B page';
    rerender(
      <RouteTransition pathname="/studio/b" isStudioPage>
        <StudioPage heading="B" />
      </RouteTransition>,
    );
    document.title = 'C page';
    rerender(
      <RouteTransition pathname="/studio/c" isStudioPage>
        <StudioPage heading="C" />
      </RouteTransition>,
    );
    await act(nextFrame);
    await act(nextFrame);
    observer.disconnect();
    expect(writes).toEqual(['C page']);
  });

  it('RA8 the first render stays silent under StrictMode (effects run twice)', async () => {
    document.title = 'FAQ | CZABA';
    const { container } = render(
      <StrictMode>
        <RouteTransition pathname="/studio/a" isStudioPage>
          <StudioPage heading="A" />
        </RouteTransition>
      </StrictMode>,
    );
    await act(nextFrame);
    expect(announcerText(container)).toBe('');
  });

  it('RA9 a Store navigation through the router with an empty title announces the new page heading', async () => {
    function Shell() {
      const location = useLocation();
      return (
        <RouteTransition pathname={location.pathname} isStudioPage={false}>
          <Outlet />
        </RouteTransition>
      );
    }
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <Shell />,
          children: [
            { path: 'faq', element: <h1>Frequently Asked Questions</h1> },
            { path: 'cart', element: <h1>Your Collection</h1> },
          ],
        },
      ],
      { initialEntries: ['/faq'] },
    );
    document.title = '';
    const { container } = render(<RouterProvider router={router} />);
    await act(nextFrame);
    expect(announcerText(container)).toBe('');
    await act(async () => {
      await router.navigate('/cart');
    });
    await act(nextFrame);
    expect(announcerText(container)).toBe('Your Collection');
  });
});
