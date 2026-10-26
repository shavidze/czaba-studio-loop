import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
}

class FakeNode {
  connect(destination: FakeNode) {
    return destination;
  }
  disconnect() {}
}

class FakeGain extends FakeNode {
  gain = new FakeParam();
}

class FakePanner extends FakeNode {
  pan = new FakeParam();
}

class FakeSource extends FakeNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start() {}
  stop() {}
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  currentTime = 0;
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    return new FakeGain();
  }
  createStereoPanner() {
    return new FakePanner();
  }
  createBufferSource() {
    return new FakeSource();
  }
}

class FakeOfflineAudioContext {}

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
  get duration() {
    return this.length / this.sampleRate;
  }
  getChannelData() {
    return new Float32Array(this.length);
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

function readyBuffer(): Promise<AudioBuffer> {
  return Promise.resolve(new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }));
}

const rowCollection: WorkspaceCollection = {
  id: 'row-strings',
  label: 'row-strings',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'row-strings', kind: 'music', origin: 'demo' },
    { id: 'broken', title: 'Broken', collectionLabel: 'row-strings', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: (source) =>
    source.id === 'broken' ? Promise.reject('not an Error value') : readyBuffer(),
};

const readyRowCollection: WorkspaceCollection = {
  id: 'row-strings-ready',
  label: 'row-strings-ready',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'row-strings-ready',
      kind: 'music',
      origin: 'demo',
    },
  ],
  loadSource: () => readyBuffer(),
};

const PREVIEW_WAVE_NAME =
  'Preview waveform — click = play from here · ← → 1 s · Home/End · Space = play/stop';
const DEMO_BADGE = 'Demo collection — no sign-in required';
const DEMO_ONE_FAILED =
  '1 sound in the demo collection failed to load — details are in the library.';
const DEMO_READY = 'Demo collection ready. Choose a track and add a sound (Enter or Add).';

function rowArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
}

interface RowApiRef {
  current: ArrangementContextValue | null;
}

function RowApiProbe({ api }: { api: RowApiRef }) {
  api.current = useArrangement();
  return null;
}

async function flushAsync(rounds = 10) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

function mountRows(collection: WorkspaceCollection = rowCollection) {
  const api: RowApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={collection} initialArrangement={rowArrangement()}>
      <StudioWorkspace />
      <RowApiProbe api={api} />
    </ArrangementProvider>,
  );
  return { api, view };
}

function libraryRow(view: ReturnType<typeof render>, sourceId: string): HTMLElement {
  const row = view.container.querySelector<HTMLElement>(`[data-source-id="${sourceId}"]`);
  if (!row) {
    throw new Error(`library row ${sourceId} missing`);
  }
  return row;
}

describe('library row status strings (V-0.5a)', () => {
  beforeEach(() => {
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
  });

  it('LRS1: a playing library preview marks its row with Playing and stopping it removes the mark', async () => {
    const { api, view } = mountRows();
    await flushAsync();
    expect(api.current?.sourceStates.song?.status).toBe('ready');
    expect(libraryRow(view, 'song').textContent).not.toContain('Playing');
    fireEvent.click(libraryRow(view, 'song'));
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    expect(api.current?.libraryPreviewSourceId).toBe('song');
    expect(libraryRow(view, 'song').textContent).toContain('Playing');
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    expect(api.current?.libraryPreviewSourceId).toBeNull();
    expect(libraryRow(view, 'song').textContent).not.toContain('Playing');
    view.unmount();
  });

  it('LRS2: a loader that rejects with a non-Error value shows Error: Loading failed on its row only', async () => {
    const { api, view } = mountRows();
    await flushAsync();
    expect(api.current?.sourceStates.broken?.status).toBe('error');
    expect(libraryRow(view, 'broken').textContent).toContain('Error: Loading failed');
    expect(libraryRow(view, 'song').textContent).not.toContain('Error');
    view.unmount();
  });

  it('LRS3: the Playing marker is its own line, a direct child of the option button after a two-child meta row', async () => {
    const { api, view } = mountRows();
    await flushAsync();
    expect(api.current?.sourceStates.song?.status).toBe('ready');
    const markerSelector = '[data-testid="arrangement-library-option-previewing"]';
    const songRow = libraryRow(view, 'song');
    expect(songRow.getAttribute('role')).toBe('option');
    expect(songRow.querySelectorAll(markerSelector)).toHaveLength(0);
    fireEvent.click(songRow);
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    expect(api.current?.libraryPreviewSourceId).toBe('song');
    const markers = libraryRow(view, 'song').querySelectorAll(markerSelector);
    expect(markers).toHaveLength(1);
    const marker = markers[0];
    expect(marker.textContent).toBe('Playing');
    expect(marker.className).toBe(
      'flex items-center gap-0.5 whitespace-nowrap text-xs text-foreground',
    );
    expect(marker.parentElement).toBe(libraryRow(view, 'song'));
    expect(libraryRow(view, 'song').lastElementChild).toBe(marker);
    expect(libraryRow(view, 'broken').querySelectorAll(markerSelector)).toHaveLength(0);
    const metaRow = Array.from(libraryRow(view, 'song').children).find((child) =>
      (child.textContent ?? '').includes('00:20.000'),
    );
    expect(metaRow).toBeDefined();
    expect(metaRow?.contains(marker)).toBe(false);
    expect(metaRow?.children).toHaveLength(2);
    const metaClasses = (metaRow?.className ?? '').split(/\s+/);
    expect(metaClasses).toContain('flex');
    expect(metaClasses).not.toContain('flex-wrap');
    expect(metaRow?.className).toBe('flex gap-2 text-xs tabular-nums text-muted');
    const durationMonoSpans = metaRow?.children[1]?.querySelectorAll('span.font-mono');
    expect(durationMonoSpans).toHaveLength(1);
    expect(durationMonoSpans?.[0]?.textContent).toBe('00:20.000');
    expect(metaRow?.children[0]?.classList.contains('font-mono')).toBe(false);
    expect(metaRow?.nextElementSibling).toBe(marker);
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    expect(api.current?.libraryPreviewSourceId).toBeNull();
    expect(libraryRow(view, 'song').querySelectorAll(markerSelector)).toHaveLength(0);
    view.unmount();
  });

  it('LRS4: the library panel names, fold toggle, search, filter and collapse read in English', async () => {
    const { view } = mountRows();
    await flushAsync();
    expect(view.getByRole('complementary', { name: 'Library' })).toBeDefined();
    expect(view.getByRole('heading', { name: 'Library' }).tagName).toBe('H2');
    const collapse = view.getByRole('button', { name: 'Collapse library' });
    expect(collapse.getAttribute('title')).toBe('Collapse library');
    const search = view.getByRole('searchbox', { name: 'Search the library' });
    expect(search.getAttribute('placeholder')).toBe('Search: name, type, collection…');
    const sidebar = view.getByRole('navigation', { name: 'Library sidebar' });
    const allButton = within(sidebar).getByRole('button', { name: /^All\s*2$/ });
    expect(allButton.textContent).toBe('All2');
    expect(view.getByRole('listbox', { name: 'Sounds' })).toBeDefined();
    expect(view.getByRole('separator', { name: 'Library width' })).toBeDefined();

    const folders = () =>
      view.container.querySelectorAll('[data-testid="arrangement-library-folder"]');
    expect(folders()).toHaveLength(2);
    const foldArrow = within(sidebar).getByRole('button', { name: 'row-strings — Fold' });
    expect(foldArrow.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(foldArrow);
    const unfoldArrow = within(sidebar).getByRole('button', { name: 'row-strings — Unfold' });
    expect(unfoldArrow.getAttribute('aria-expanded')).toBe('false');
    expect(within(sidebar).queryByRole('button', { name: 'row-strings — Fold' })).toBeNull();
    expect(folders()).toHaveLength(0);
    fireEvent.click(unfoldArrow);
    expect(
      within(sidebar)
        .getByRole('button', { name: 'row-strings — Fold' })
        .getAttribute('aria-expanded'),
    ).toBe('true');
    expect(folders()).toHaveLength(2);

    expect(view.queryByRole('button', { name: 'Clear search' })).toBeNull();
    fireEvent.change(search, { target: { value: 'zzqx' } });
    expect(view.getByRole('button', { name: 'Clear search' })).toBeDefined();
    expect(view.getByTestId('arrangement-library-empty').textContent).toBe('No sounds found.');
    expect(
      within(view.getByRole('region', { name: 'Preview' })).getByText('Select a sound in the list')
        .tagName,
    ).toBe('P');
    fireEvent.keyDown(search, { key: 'Escape' });
    expect(search).toHaveProperty('value', '');
    expect(view.queryByTestId('arrangement-library-empty')).toBeNull();
    expect(view.queryByRole('button', { name: 'Clear search' })).toBeNull();
    expect(
      within(view.getByRole('listbox', { name: 'Sounds' })).getAllByRole('option'),
    ).toHaveLength(2);

    expect(view.queryByTestId('arrangement-library-filter')).toBeNull();
    fireEvent.click(within(sidebar).getByRole('button', { name: 'row-strings' }));
    expect(view.getByTestId('arrangement-library-filter').textContent).toBe('Filter: row-strings');

    fireEvent.click(collapse);
    const expand = view.getByRole('button', { name: 'Expand library' });
    expect(expand.getAttribute('title')).toBe('Expand library');
    expect(view.queryByRole('heading', { name: 'Library' })).toBeNull();
    fireEvent.click(expand);
    expect(view.getByRole('heading', { name: 'Library' })).toBeDefined();
    expect(view.getByRole('button', { name: 'Collapse library' })).toBeDefined();
    view.unmount();
  });

  it('LRS5: the preview, the header badge and the collection status read in English', async () => {
    const failing = mountRows();
    await flushAsync();
    const { view } = failing;
    const header = view.container.querySelector('header');
    expect(header?.querySelector('span.border-accent')?.textContent?.trim()).toBe(DEMO_BADGE);
    expect(view.getByTestId('arrangement-status').textContent?.trim()).toBe(DEMO_ONE_FAILED);
    const preview = view.getByRole('region', { name: 'Preview' });
    expect(within(preview).getByRole('slider', { name: PREVIEW_WAVE_NAME })).toBeDefined();
    const toggle = view.getByTestId('arrangement-library-preview-toggle');
    expect(toggle.textContent).toBe('Preview');
    fireEvent.click(libraryRow(view, 'song'));
    fireEvent.click(toggle);
    expect(failing.api.current?.libraryPreviewSourceId).toBe('song');
    expect(toggle.textContent).toBe('Stop');
    fireEvent.click(toggle);
    expect(failing.api.current?.libraryPreviewSourceId).toBeNull();
    expect(toggle.textContent).toBe('Preview');
    expect(within(preview).getByRole('button', { name: 'Add' }).textContent).toBe('Add');
    view.unmount();

    const ready = mountRows(readyRowCollection);
    await flushAsync();
    expect(ready.api.current?.sourceStates.song?.status).toBe('ready');
    const readyStatus = ready.view.getByTestId('arrangement-status').textContent?.trim();
    expect(readyStatus).toBe(DEMO_READY);
    const addText = ready.view.getByRole('button', { name: 'Add' }).textContent ?? '';
    expect(addText).toBe('Add');
    expect(readyStatus).toContain('(Enter or Add)');
    ready.view.unmount();
  });

  it('LI1: the expanded panel collapse, search clear and collection fold buttons each hold one lucide icon and no glyph', async () => {
    const { view } = mountRows();
    await flushAsync();
    const sidebar = view.getByRole('navigation', { name: 'Library sidebar' });
    const collapse = view.getByTestId('arrangement-library-collapse');
    expectIconOnlyButton(collapse, 'lucide-chevron-left', 'size-3', '2');
    const search = view.getByRole('searchbox', { name: 'Search the library' });
    fireEvent.change(search, { target: { value: 'so' } });
    expectIconOnlyButton(
      view.getByTestId('arrangement-library-search-clear'),
      'lucide-x',
      'size-3',
      '2',
    );
    fireEvent.change(search, { target: { value: '' } });
    const foldButtons = within(sidebar).getAllByRole('button', { name: / — Fold$/ });
    expect(foldButtons).toHaveLength(1);
    for (const fold of foldButtons) {
      expectIconOnlyButton(fold, 'lucide-chevron-down', 'size-2.5', '2.4');
    }
    fireEvent.click(foldButtons[0]);
    const unfold = within(sidebar).getByRole('button', { name: 'row-strings — Unfold' });
    expectIconOnlyButton(unfold, 'lucide-chevron-right', 'size-2.5', '2.4');
    expect(unfold.querySelector('svg')?.classList.contains('lucide-chevron-down')).toBe(false);
    view.unmount();
  });

  it('LI2: the preview toggle, Add and the playing row marker pair one lucide icon with their word', async () => {
    const { api, view } = mountRows();
    await flushAsync();
    const preview = view.getByRole('region', { name: 'Preview' });
    const toggle = view.getByTestId('arrangement-library-preview-toggle');
    expectIconLabelHost(toggle, 'lucide-play', 'size-3', '2', 'gap-0.75', 'Preview');
    const add = within(preview).getByRole('button', { name: 'Add' });
    expectIconLabelHost(add, 'lucide-plus', 'size-3', '2', 'gap-0.75', 'Add');
    expect(toggle.classList.contains('justify-center')).toBe(true);
    expect(add.classList.contains('justify-center')).toBe(true);
    fireEvent.click(libraryRow(view, 'song'));
    fireEvent.click(toggle);
    expect(api.current?.libraryPreviewSourceId).toBe('song');
    expectIconLabelHost(toggle, 'lucide-square', 'size-3', '2', 'gap-0.75', 'Stop');
    expect(toggle.querySelector('svg')?.classList.contains('lucide-play')).toBe(false);
    const marker = view.getByTestId('arrangement-library-option-previewing');
    expectIconLabelHost(marker, 'lucide-play', 'size-2.5', '2.4', 'gap-0.5', 'Playing');
    fireEvent.click(toggle);
    expectIconLabelHost(toggle, 'lucide-play', 'size-3', '2', 'gap-0.75', 'Preview');
    view.unmount();
  });

  it('LI3: the collapsed rail expand holds a chevron-right icon and no library state shows a glyph', async () => {
    const { api, view } = mountRows();
    await flushAsync();
    const library = () => view.getByTestId('arrangement-library');
    expect(library().textContent ?? '').not.toMatch(LIBRARY_GLYPHS);
    fireEvent.click(libraryRow(view, 'song'));
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    expect(api.current?.libraryPreviewSourceId).toBe('song');
    expect(library().textContent ?? '').toContain('Playing');
    expect(library().textContent ?? '').not.toMatch(LIBRARY_GLYPHS);
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    expect(library().getAttribute('data-collapsed')).toBe('true');
    expectIconOnlyButton(
      view.getByTestId('arrangement-library-expand'),
      'lucide-chevron-right',
      'size-3',
      '2',
    );
    expect(library().textContent ?? '').not.toMatch(LIBRARY_GLYPHS);
    view.unmount();
  });
});

const LIBRARY_GLYPHS = /[▶◀×▾▸■＋]/u;

function expectSingleLucideIcon(
  host: HTMLElement,
  lucideClass: string,
  sizeClass: string,
  strokeWidth: string,
) {
  const icons = host.querySelectorAll('svg');
  expect(icons).toHaveLength(1);
  const icon = icons[0];
  expect(icon.getAttribute('aria-hidden')).toBe('true');
  expect(icon.classList.contains(lucideClass)).toBe(true);
  expect(icon.classList.contains(sizeClass)).toBe(true);
  expect(icon.classList.contains('shrink-0')).toBe(true);
  expect(icon.getAttribute('stroke-width')).toBe(strokeWidth);
}

function expectIconOnlyButton(
  button: HTMLElement,
  lucideClass: string,
  sizeClass: string,
  strokeWidth: string,
) {
  expectSingleLucideIcon(button, lucideClass, sizeClass, strokeWidth);
  expect(button.textContent).toBe('');
  const classes = button.className.split(/\s+/);
  expect(classes).toEqual(expect.arrayContaining(['flex', 'items-center', 'justify-center']));
}

function expectIconLabelHost(
  host: HTMLElement,
  lucideClass: string,
  sizeClass: string,
  strokeWidth: string,
  gapClass: string,
  label: string,
) {
  expectSingleLucideIcon(host, lucideClass, sizeClass, strokeWidth);
  expect(host.textContent).toBe(label);
  const classes = host.className.split(/\s+/);
  expect(classes).toEqual(expect.arrayContaining(['flex', 'items-center', gapClass]));
  expect(classes).not.toContain('gap-1');
}

const LIBRARY_SURFACE_MOTION = [
  'motion-safe:transition-[background-color,color]!',
  'motion-safe:duration-180!',
  'motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]!',
  'motion-reduce:transition-none!',
];

const LIBRARY_SURFACE_FILL = [
  'bg-foreground/5',
  'enabled:hover:bg-foreground/8',
  'enabled:active:bg-foreground/12',
];

function libraryClassTokens(element: HTMLElement): string[] {
  return element.className.split(/\s+/).filter(Boolean);
}

function expectLibraryTokens(element: HTMLElement, included: string[], excluded: string[]) {
  const tokens = libraryClassTokens(element);
  expect(tokens).toEqual(expect.arrayContaining(included));
  for (const token of excluded) {
    expect(tokens).not.toContain(token);
  }
}

function expectRadiusOnlyButton(element: HTMLElement) {
  expectLibraryTokens(
    element,
    ['rounded-md'],
    ['rounded-sm', 'bg-foreground/5', 'border-transparent'],
  );
}

describe('library button surfaces (V-3c-4c-1)', () => {
  beforeEach(() => {
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
  });

  it('LPS1: the preview toggle takes the borderless fill (Stop keeps its accent border) and Add takes the brand-outline fill', async () => {
    const { api, view } = mountRows();
    await flushAsync();
    const toggle = view.getByTestId('arrangement-library-preview-toggle');
    const toggleOffIncluded = [
      'border',
      'border-transparent',
      ...LIBRARY_SURFACE_FILL,
      'rounded-md',
      ...LIBRARY_SURFACE_MOTION,
      'text-foreground',
      'font-medium',
      'gap-0.75',
      'disabled:opacity-40',
    ];
    const toggleOffExcluded = ['border-outline', 'hover:border-brand', 'rounded-sm'];
    expect(toggle.textContent).toBe('Preview');
    expectLibraryTokens(toggle, toggleOffIncluded, toggleOffExcluded);

    fireEvent.click(libraryRow(view, 'song'));
    fireEvent.click(toggle);
    expect(api.current?.libraryPreviewSourceId).toBe('song');
    expect(toggle.textContent).toBe('Stop');
    expectLibraryTokens(
      toggle,
      [
        'border-foreground',
        'text-foreground',
        ...LIBRARY_SURFACE_FILL,
        'rounded-md',
        ...LIBRARY_SURFACE_MOTION,
      ],
      ['border-transparent', 'hover:bg-accent/10', 'border-outline', 'rounded-sm'],
    );

    fireEvent.click(toggle);
    expect(api.current?.libraryPreviewSourceId).toBeNull();
    expect(toggle.textContent).toBe('Preview');
    expectLibraryTokens(toggle, toggleOffIncluded, toggleOffExcluded);

    const add = within(view.getByRole('region', { name: 'Preview' })).getByRole('button', {
      name: 'Add',
    });
    expectLibraryTokens(
      add,
      [
        'border',
        'border-brand',
        'text-brand',
        'font-medium',
        ...LIBRARY_SURFACE_FILL,
        'rounded-md',
        ...LIBRARY_SURFACE_MOTION,
        'disabled:opacity-40',
      ],
      ['bg-brand/10', 'hover:bg-brand/20', 'border-transparent', 'rounded-sm'],
    );
    view.unmount();
  });

  it('LBS1: library option rows, collapse, search clear, expand and the search field round to 8 px without a fill', async () => {
    const { view } = mountRows();
    await flushAsync();
    const songRow = libraryRow(view, 'song');
    expectRadiusOnlyButton(songRow);
    fireEvent.click(songRow);
    expect(libraryRow(view, 'song').getAttribute('aria-selected')).toBe('true');
    expectRadiusOnlyButton(libraryRow(view, 'song'));
    expect(libraryClassTokens(libraryRow(view, 'song'))).toContain('bg-brand/10');

    expectRadiusOnlyButton(view.getByTestId('arrangement-library-collapse'));

    const search = view.getByTestId('arrangement-library-search');
    expectLibraryTokens(search, ['rounded-md', 'border-outline-strong'], ['rounded-sm']);
    fireEvent.change(search, { target: { value: 'so' } });
    expectRadiusOnlyButton(view.getByTestId('arrangement-library-search-clear'));
    fireEvent.change(search, { target: { value: '' } });

    fireEvent.click(view.getByTestId('arrangement-library-collapse'));
    expect(view.getByTestId('arrangement-library').getAttribute('data-collapsed')).toBe('true');
    expectRadiusOnlyButton(view.getByTestId('arrangement-library-expand'));
    view.unmount();
  });
});
