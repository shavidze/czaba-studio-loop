import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { studioLabDemoCollection } from '~/data/studio-lab-demo';
import {
  getStudioLabPreviewHref,
  getStudioLabProductHref,
  resolveStudioLabPreviewSourceId,
  resolveStudioLabProductHandle,
} from '~/data/studio-lab-links';
import { findStudioShortcut } from '~/lib/arrangement/shortcuts';
import StudioLabRoute from '~/routes/studio-lab';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

const routeSearch = vi.hoisted(() => ({ params: new URLSearchParams() }));

vi.mock('@remix-run/react', () => ({
  useSearchParams: () => [routeSearch.params],
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/demo-synth.client', () => ({
  synthesizeDemoCompositionOffMainThread: () => new Promise(() => undefined),
}));

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const STUDIO_WIDE_QUERY = '(min-width: 900px)';
const MAPPED_SOURCE_ID = 'demo-middle-east';
const MAPPED_SOURCE_TITLE = 'Middle East — public preview';

function stubWideViewport(): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === STUDIO_WIDE_QUERY,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

function libraryOption(sourceId: string): HTMLElement {
  const option = document.querySelector<HTMLElement>(
    `[role="option"][data-source-id="${sourceId}"]`,
  );
  if (!option) {
    throw new Error(`library option ${sourceId} not rendered`);
  }
  return option;
}

function unmappedSourceId(): string {
  const source = studioLabDemoCollection.sources.find(
    (entry) => getStudioLabProductHref(entry.id) === null,
  );
  if (!source) {
    throw new Error('the demo has no unmapped source');
  }
  return source.id;
}

function libraryMenu(): HTMLElement | null {
  return screen.queryByRole('menu');
}

function viewInStoreItem(): HTMLElement {
  return screen.getByRole('menuitem', { name: 'View in store' });
}

function rightClick(element: HTMLElement): boolean {
  return fireEvent.contextMenu(element, { button: 2, clientX: 120, clientY: 160 });
}

function renderWideStudio(): void {
  stubWideViewport();
  render(<StudioLabRoute />);
}

const preventDocumentNavigation = (event: MouseEvent) => {
  if (event.target instanceof Element && event.target.closest('a')) {
    event.preventDefault();
  }
};

beforeEach(() => {
  routeSearch.params = new URLSearchParams();
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => undefined)),
  );
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  document.addEventListener('click', preventDocumentNavigation);
});

afterEach(() => {
  document.removeEventListener('click', preventDocumentNavigation);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('STUDIO-LINK-b View in store (round 300)', { timeout: 15_000 }, () => {
  it.each([
    [MAPPED_SOURCE_ID, 'middle-east', '/products/middle-east'],
    ['demo-hero-music', null, null],
    ['', null, null],
    ['DEMO-MIDDLE-EAST', null, null],
    ['__proto__', null, null],
    ['constructor', null, null],
  ])('VS1: the source %j maps to the handle %j and the store href %j', (sourceId, handle, href) => {
    expect(resolveStudioLabProductHandle(sourceId)).toBe(handle);
    expect(getStudioLabProductHref(sourceId)).toBe(href);
  });

  it('VS1b: the two maps agree in both directions for every demo source', () => {
    let mapped = 0;
    for (const source of studioLabDemoCollection.sources) {
      const handle = resolveStudioLabProductHandle(source.id);
      if (handle === null) {
        continue;
      }
      mapped += 1;
      expect(resolveStudioLabPreviewSourceId(handle)).toBe(source.id);
      expect(getStudioLabPreviewHref(handle)).not.toBeNull();
    }
    expect(mapped).toBe(1);
    expect(
      resolveStudioLabProductHandle(resolveStudioLabPreviewSourceId('middle-east') ?? ''),
    ).toBe('middle-east');
  });

  it('VS2: a right-click on the mapped option opens one menu with one store link that opens a new tab', () => {
    renderWideStudio();
    const other = libraryOption(unmappedSourceId());
    fireEvent.click(other);
    expect(other.getAttribute('aria-selected')).toBe('true');
    const option = libraryOption(MAPPED_SOURCE_ID);
    expect(option.getAttribute('aria-selected')).toBe('false');

    expect(rightClick(option)).toBe(false);

    const menu = libraryMenu();
    expect(menu?.getAttribute('aria-label')).toBe(`${MAPPED_SOURCE_TITLE} options`);
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    const item = viewInStoreItem();
    expect(item.tagName).toBe('A');
    expect(item.getAttribute('href')).toBe('/products/middle-east');
    expect(item.getAttribute('target')).toBe('_blank');
    expect(item.getAttribute('rel')?.split(' ')).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer']),
    );
    expect(document.activeElement).toBe(item);
    expect(option.getAttribute('aria-selected')).toBe('true');
    expect(option.getAttribute('aria-haspopup')).toBeNull();
  });

  it('VS3: an unmapped option keeps the native menu (no custom menu, default not prevented)', () => {
    renderWideStudio();
    const option = libraryOption(unmappedSourceId());

    expect(rightClick(option)).toBe(true);
    expect(libraryMenu()).toBeNull();
    expect(fireEvent.keyDown(option, { key: 'F10', shiftKey: true })).toBe(true);
    expect(fireEvent.keyDown(option, { key: 'ContextMenu' })).toBe(true);
    expect(libraryMenu()).toBeNull();
  });

  it.each([
    ['Shift+F10', { key: 'F10', shiftKey: true }],
    ['ContextMenu', { key: 'ContextMenu' }],
  ])('VS4: %s on the mapped option opens the menu below the option', (_label, init) => {
    renderWideStudio();
    const option = libraryOption(MAPPED_SOURCE_ID);
    option.focus();

    expect(fireEvent.keyDown(option, init)).toBe(false);

    expect(libraryMenu()).not.toBeNull();
    expect(document.activeElement).toBe(viewInStoreItem());
  });

  it('VS4b: a held Shift+F10 (repeat) does not open the menu', () => {
    renderWideStudio();
    const option = libraryOption(MAPPED_SOURCE_ID);

    fireEvent.keyDown(option, { key: 'F10', shiftKey: true, repeat: true });

    expect(libraryMenu()).toBeNull();
  });

  it.each([
    ['Escape', { key: 'Escape' }],
    ['Tab', { key: 'Tab' }],
  ])('VS5: %s closes the menu and returns focus to the option', (_label, init) => {
    renderWideStudio();
    const option = libraryOption(MAPPED_SOURCE_ID);
    rightClick(option);

    fireEvent.keyDown(viewInStoreItem(), init);

    expect(libraryMenu()).toBeNull();
    expect(document.activeElement).toBe(option);
  });

  it.each([
    ['an outside pointer press', () => fireEvent.pointerDown(document.body)],
    ['a window blur (the new tab opens)', () => fireEvent.blur(window)],
    ['a window resize', () => fireEvent(window, new Event('resize'))],
  ])('VS5b: %s closes the menu and returns focus to the option', (_label, act) => {
    renderWideStudio();
    const option = libraryOption(MAPPED_SOURCE_ID);
    rightClick(option);

    act();

    expect(libraryMenu()).toBeNull();
    expect(document.activeElement).toBe(option);
  });

  it('VS6: activating the link closes the menu and refocuses the option in the same event', () => {
    renderWideStudio();
    const option = libraryOption(MAPPED_SOURCE_ID);
    rightClick(option);
    const item = viewInStoreItem();
    let focusAtDocumentClick: Element | null = null;
    const readFocus = () => {
      focusAtDocumentClick = document.activeElement;
    };
    document.addEventListener('click', readFocus);

    fireEvent.click(item);

    document.removeEventListener('click', readFocus);
    expect(focusAtDocumentClick).toBe(option);
    expect(libraryMenu()).toBeNull();
    expect(document.activeElement).toBe(option);
  });

  it('VS7: Enter on the link keeps its native activation and does not reach the Studio shortcuts', () => {
    renderWideStudio();
    rightClick(libraryOption(MAPPED_SOURCE_ID));
    const windowKeyDown = vi.fn();
    window.addEventListener('keydown', windowKeyDown);

    const notPrevented = fireEvent.keyDown(viewInStoreItem(), { key: 'Enter' });

    window.removeEventListener('keydown', windowKeyDown);
    expect(notPrevented).toBe(true);
    expect(windowKeyDown).not.toHaveBeenCalled();
  });

  it('VS7b: Space activates the link once and does not reach the Studio shortcuts', () => {
    renderWideStudio();
    const option = libraryOption(MAPPED_SOURCE_ID);
    rightClick(option);
    const item = viewInStoreItem();
    const linkClick = vi.fn();
    item.addEventListener('click', linkClick);
    const windowKeyDown = vi.fn();
    window.addEventListener('keydown', windowKeyDown);

    const notPrevented = fireEvent.keyDown(item, { key: ' ' });

    window.removeEventListener('keydown', windowKeyDown);
    expect(notPrevented).toBe(false);
    expect(linkClick).toHaveBeenCalledTimes(1);
    expect(windowKeyDown).not.toHaveBeenCalled();
    expect(libraryMenu()).toBeNull();
    expect(document.activeElement).toBe(option);
  });

  it('VS8: the shortcut sheet lists the library row with mouse and keyboard keys', () => {
    expect(findStudioShortcut('library-view-in-store')).toEqual({
      id: 'library-view-in-store',
      action: 'View in store (new tab)',
      keys: ['Right-click', 'Shift+F10'],
    });
  });
});
