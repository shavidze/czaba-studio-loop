import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductSidebar } from '~/components/product/ProductSidebar';
import { ArrangementProvider, useArrangement } from '~/contexts/ArrangementContext';
import { studioLabDemoCollection } from '~/data/studio-lab-demo';
import {
  getStudioLabPreviewHref,
  resolveStudioLabPreviewSourceId,
  STUDIO_LAB_PREVIEW_PARAM,
} from '~/data/studio-lab-links';
import StudioLabRoute from '~/routes/studio-lab';
import type { Product } from '~/services/api/client';
import type { WorkspaceCollection, WorkspaceSource } from '~/types/arrangement';
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

vi.mock('~/components/audio', () => ({
  AudioPreviewButton: () => <button type="button">Play preview</button>,
}));

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const STUDIO_WIDE_QUERY = '(min-width: 900px)';

function stubViewport(wide: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === STUDIO_WIDE_QUERY ? wide : false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Middle East',
    category: 'Track',
    handle: 'middle-east',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-31T00:00:00Z',
    ...overrides,
  };
}

function focusedSourceId(): string | null {
  const active = document.activeElement;
  return active instanceof HTMLElement && active.getAttribute('role') === 'option'
    ? (active.dataset.sourceId ?? null)
    : null;
}

function testSource(id: string): WorkspaceSource {
  return { id, title: id, collectionLabel: 'Test', kind: 'music', origin: 'demo' };
}

const threeSourceCollection: WorkspaceCollection = {
  id: 'test-collection',
  label: 'Test',
  origin: 'demo',
  sources: [testSource('first'), testSource('second'), testSource('third')],
  loadSource: () => new Promise<AudioBuffer>(() => undefined),
};

function SelectedSourceProbe() {
  return <span data-testid="selected-source">{useArrangement().selectedSourceId ?? 'none'}</span>;
}

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
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('STUDIO-LINK product page to Studio deep link (round 296)', { timeout: 15_000 }, () => {
  it.each([
    ['middle-east', 'demo-middle-east'],
    ['harbour-lights', null],
    ['', null],
    ['MIDDLE-EAST', null],
    ['__proto__', null],
    ['constructor', null],
    ['toString', null],
  ])('LK1: the handle %j resolves to the Studio source %j', (handle, expected) => {
    expect(resolveStudioLabPreviewSourceId(handle)).toBe(expected);
  });

  it('LK1b: a missing parameter resolves to no source', () => {
    expect(resolveStudioLabPreviewSourceId(null)).toBeNull();
  });

  it('LK2: only a mapped handle gets a Studio href, and every mapped source exists in the demo', () => {
    expect(STUDIO_LAB_PREVIEW_PARAM).toBe('preview');
    expect(getStudioLabPreviewHref('middle-east')).toBe('/studio-lab?preview=middle-east');
    expect(getStudioLabPreviewHref('harbour-lights')).toBeNull();
    const ids = studioLabDemoCollection.sources.map((source) => source.id);
    expect(ids).toContain(resolveStudioLabPreviewSourceId('middle-east'));
  });

  it('LK3: the product sidebar links a mapped product to the Studio and leaves others without it', () => {
    const { unmount } = render(<ProductSidebar product={createProduct()} />);
    const link = screen.getByRole('link', { name: 'Try it in the Studio' });
    expect(link.getAttribute('href')).toBe('/studio-lab?preview=middle-east');
    expect(link.getAttribute('target')).toBeNull();
    unmount();

    render(
      <ProductSidebar
        product={createProduct({ id: 2, title: 'Harbour Lights', handle: 'harbour-lights' })}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Try it in the Studio' })).toBeNull();
  });

  it.each([
    ['second', 'second'],
    ['third', 'third'],
    ['missing', 'first'],
    [null, 'first'],
    [undefined, 'first'],
  ])('LK4: initialSelectedSourceId %j selects %j', (initial, expected) => {
    render(
      <ArrangementProvider collection={threeSourceCollection} initialSelectedSourceId={initial}>
        <SelectedSourceProbe />
      </ArrangementProvider>,
    );
    expect(screen.getByTestId('selected-source').textContent).toBe(expected);
  });

  it('LK5: a wide /studio-lab?preview=middle-east selects and focuses the Middle East option', () => {
    stubViewport(true);
    routeSearch.params = new URLSearchParams({ preview: 'middle-east' });
    render(<StudioLabRoute />);

    expect(focusedSourceId()).toBe('demo-middle-east');
    const option = document.activeElement;
    expect(option?.getAttribute('aria-selected')).toBe('true');
    expect(option?.getAttribute('tabindex')).toBe('0');
  });

  it.each([
    ['no parameter', ''],
    ['an unmapped handle', 'preview=harbour-lights'],
    ['a prototype key', 'preview=__proto__'],
  ])('LK6: a wide /studio-lab with %s moves no focus into the library', (_label, search) => {
    stubViewport(true);
    routeSearch.params = new URLSearchParams(search);
    render(<StudioLabRoute />);

    expect(focusedSourceId()).toBeNull();
    expect(document.activeElement).toBe(document.body);
    const selected = document.querySelector('[role="option"][aria-selected="true"]');
    expect(selected?.getAttribute('data-source-id')).toBe(studioLabDemoCollection.sources[0]?.id);
  });

  it('LK7: a narrow /studio-lab?preview=middle-east shows the narrow state and focuses no option', () => {
    stubViewport(false);
    routeSearch.params = new URLSearchParams({ preview: 'middle-east' });
    render(<StudioLabRoute />);

    expect(document.querySelector('[data-testid="studio-narrow-heading"]')).not.toBeNull();
    expect(focusedSourceId()).toBeNull();
  });
});
