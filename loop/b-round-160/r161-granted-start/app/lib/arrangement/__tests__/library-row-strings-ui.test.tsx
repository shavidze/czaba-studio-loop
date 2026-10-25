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
  'Preview waveform — click = play from here · ← → 1 s · Home/End · Space = ▶/■';
const DEMO_BADGE = 'Demo collection — no sign-in required';
const DEMO_ONE_FAILED =
  '1 sound in the demo collection failed to load — details are in the library.';
const DEMO_READY = 'Demo collection ready. Choose a track and add a sound (Enter or ＋ Add).';

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

  it('LRS1: a playing library preview marks its row with ▶ Playing and stopping it removes the mark', async () => {
    const { api, view } = mountRows();
    await flushAsync();
    expect(api.current?.sourceStates.song?.status).toBe('ready');
    expect(libraryRow(view, 'song').textContent).not.toContain('▶ Playing');
    fireEvent.click(libraryRow(view, 'song'));
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    expect(api.current?.libraryPreviewSourceId).toBe('song');
    expect(libraryRow(view, 'song').textContent).toContain('▶ Playing');
    fireEvent.click(view.getByTestId('arrangement-library-preview-toggle'));
    expect(api.current?.libraryPreviewSourceId).toBeNull();
    expect(libraryRow(view, 'song').textContent).not.toContain('▶ Playing');
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

  it('LRS3: the ▶ Playing marker is its own line, a direct child of the option button after a two-child meta row', async () => {
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
    expect(marker.textContent).toBe('▶ Playing');
    expect(marker.className).toBe('whitespace-nowrap text-xs text-brand');
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
    expect(toggle.textContent).toBe('▶ Preview');
    fireEvent.click(libraryRow(view, 'song'));
    fireEvent.click(toggle);
    expect(failing.api.current?.libraryPreviewSourceId).toBe('song');
    expect(toggle.textContent).toBe('■ Stop');
    fireEvent.click(toggle);
    expect(failing.api.current?.libraryPreviewSourceId).toBeNull();
    expect(toggle.textContent).toBe('▶ Preview');
    expect(within(preview).getByRole('button', { name: '＋ Add' }).textContent).toBe('＋ Add');
    view.unmount();

    const ready = mountRows(readyRowCollection);
    await flushAsync();
    expect(ready.api.current?.sourceStates.song?.status).toBe('ready');
    const readyStatus = ready.view.getByTestId('arrangement-status').textContent?.trim();
    expect(readyStatus).toBe(DEMO_READY);
    const addText = ready.view.getByRole('button', { name: '＋ Add' }).textContent ?? '';
    expect(addText).toBe('＋ Add');
    expect(readyStatus).toContain(addText);
    ready.view.unmount();
  });
});
