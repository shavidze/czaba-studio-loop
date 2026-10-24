import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { renderArrangementWav } from '~/lib/arrangement/graph.client';
import {
  type ArrangementMp3Encoder,
  loadArrangementMp3Encoder,
  resetArrangementMp3Encoder,
} from '~/lib/arrangement/mp3-encoder.client';
import type {
  Arrangement,
  ArrangementClip,
  WorkspaceCollection,
  WorkspaceOrigin,
} from '~/types/arrangement';
import type { AudioStem } from '~/types/audio';
import { createPurchasedWorkspaceCollection, type PurchasedStemFetch } from '../collection';
import { createArrangement } from '../model';
import { studioPlaybackStrings } from '../strings';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

vi.mock('~/lib/arrangement/mp3-encoder.client', () => ({
  loadArrangementMp3Encoder: vi.fn(),
  resetArrangementMp3Encoder: vi.fn(),
}));

const renderWavMock = vi.mocked(renderArrangementWav);
const loadEncoderMock = vi.mocked(loadArrangementMp3Encoder);
const resetEncoderMock = vi.mocked(resetArrangementMp3Encoder);
const encodeMock = vi.fn<ArrangementMp3Encoder['encode']>();

const DEMO_LOADING = 'დემო კოლექცია იტვირთება…';
const DEMO_READY = 'დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).';
const DEMO_EMPTY = 'დემო კოლექციაში წყარო არ არის — ბიბლიოთეკა ცარიელია.';
const DEMO_ONE_FAILED = 'დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.';
const PURCHASED_LOADING = 'შეძენილი კოლექცია იტვირთება…';
const PURCHASED_READY =
  'შეძენილი კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).';
const PURCHASED_EMPTY = 'შეძენილ კოლექციაში წყარო არ არის — ბიბლიოთეკა ცარიელია.';
const NOTHING_TO_PLAY = studioPlaybackStrings.nothingToPlay;
const ROW_LOADING = 'იტვირთება…';

const PURCHASED_STEMS: AudioStem[] = [
  {
    id: 'drums',
    name: 'Drums',
    audioUrl: 'https://stems.example.test/drums.wav?token=SECRET',
    order: 1,
  },
  {
    id: 'bass',
    name: 'Bass',
    audioUrl: 'https://stems.example.test/bass.wav?token=SECRET',
    order: 2,
  },
];

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

const decodeAudioDataMock = vi.fn<(data: ArrayBuffer) => Promise<AudioBuffer>>();

class FakeOfflineAudioContext {
  decodeAudioData(data: ArrayBuffer) {
    return decodeAudioDataMock(data);
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

function testBuffer(): AudioBuffer {
  return new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 });
}

interface DeferredLoad {
  sourceId: string;
  signal: AbortSignal;
  resolve: (buffer: AudioBuffer) => void;
  reject: (error: Error) => void;
}

function deferredCollection(id: string, origin: WorkspaceOrigin, sourceIds: readonly string[]) {
  const loads: DeferredLoad[] = [];
  const loadSource = vi.fn<WorkspaceCollection['loadSource']>(
    (source, _ctx, signal) =>
      new Promise<AudioBuffer>((resolve, reject) => {
        loads.push({ sourceId: source.id, signal, resolve, reject });
      }),
  );
  const collection: WorkspaceCollection = {
    id,
    label: id,
    origin,
    sources: sourceIds.map((sourceId) => ({
      id: sourceId,
      title: sourceId,
      collectionLabel: id,
      kind: 'music',
      origin,
    })),
    loadSource,
  };
  return { collection, loads, loadSource };
}

function emptyCollection(origin: WorkspaceOrigin) {
  const loadSource = vi.fn<WorkspaceCollection['loadSource']>(async () => testBuffer());
  const collection: WorkspaceCollection = {
    id: `empty-${origin}`,
    label: `empty-${origin}`,
    origin,
    sources: [],
    loadSource,
  };
  return { collection, loadSource };
}

function loadFor(loads: readonly DeferredLoad[], sourceId: string): DeferredLoad {
  const load = loads.find((entry) => entry.sourceId === sourceId);
  if (!load) {
    throw new Error(`no load for ${sourceId}`);
  }
  return load;
}

function workspaceArrangement(clips: ArrangementClip[] = []): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return { ...base, clips };
}

interface WorkspaceApiRef {
  current: ArrangementContextValue | null;
}

function WorkspaceProbe({ api }: { api: WorkspaceApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: WorkspaceApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushAsync(rounds = 10) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function settleExport(api: WorkspaceApiRef) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (live(api).exportState.phase !== 'rendering') {
      return;
    }
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  throw new Error('export did not settle');
}

function workspaceTree(
  collection: WorkspaceCollection,
  arrangement: Arrangement,
  api: WorkspaceApiRef,
  extra?: ReactNode,
) {
  return (
    <ArrangementProvider collection={collection} initialArrangement={arrangement}>
      <StudioWorkspace />
      <WorkspaceProbe api={api} />
      {extra}
    </ArrangementProvider>
  );
}

interface MountedWorkspace {
  api: WorkspaceApiRef;
  arrangement: Arrangement;
  view: ReturnType<typeof render>;
}

function mountWorkspace(
  collection: WorkspaceCollection,
  clips: ArrangementClip[] = [],
): MountedWorkspace {
  const api: WorkspaceApiRef = { current: null };
  const arrangement = workspaceArrangement(clips);
  const view = render(workspaceTree(collection, arrangement, api));
  return { api, arrangement, view };
}

function swapCollection(
  mounted: MountedWorkspace,
  collection: WorkspaceCollection,
  extra?: ReactNode,
) {
  mounted.view.rerender(workspaceTree(collection, mounted.arrangement, mounted.api, extra));
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent?.trim() ?? null;
}

function libraryRow(view: ReturnType<typeof render>, sourceId: string): HTMLElement {
  const row = view.container.querySelector<HTMLElement>(`[data-source-id="${sourceId}"]`);
  if (!row) {
    throw new Error(`library row ${sourceId} missing`);
  }
  return row;
}

function sourceStatus(api: WorkspaceApiRef, sourceId: string): string | undefined {
  return live(api).sourceStates[sourceId]?.status;
}

describe('COLLECTION-EMPTY-STATUS and GATE92-S1/S2 collection load status (D-29z59) — unit only, the purchased route is not mounted', () => {
  const downloads: string[] = [];
  const mp3Blob = new Blob(['encoded-mp3']);

  beforeEach(() => {
    downloads.length = 0;
    decodeAudioDataMock.mockReset();
    decodeAudioDataMock.mockImplementation(async () => testBuffer());
    renderWavMock.mockReset();
    renderWavMock.mockResolvedValue({
      blob: new Blob(['rendered-wav']),
      peak: 0.5,
      clippedSamples: 0,
    });
    loadEncoderMock.mockReset();
    loadEncoderMock.mockResolvedValue({ encode: encodeMock });
    resetEncoderMock.mockReset();
    encodeMock.mockReset();
    encodeMock.mockResolvedValue(mp3Blob);
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download);
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: () => 'blob:load-status-test',
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: () => undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('LS1 empty demo collection: the status is exactly the demo empty text, loadSource is never called and nothing logs an error', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { collection, loadSource } = emptyCollection('demo');
    const { view } = mountWorkspace(collection);
    await flushAsync();
    expect(statusText(view)).toBe(DEMO_EMPTY);
    expect(loadSource).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    view.unmount();
  });

  it('LS2 empty purchased-origin collection: the status is exactly the purchased empty text and loadSource is never called', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { collection, loadSource } = emptyCollection('purchased');
    const { view } = mountWorkspace(collection);
    await flushAsync();
    expect(statusText(view)).toBe(PURCHASED_EMPTY);
    expect(loadSource).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    view.unmount();
  });

  it('LS3 a collection swap resets the status to the new origin loading text until the new load settles', async () => {
    const a = deferredCollection('demo-a', 'demo', ['song-a']);
    const mounted = mountWorkspace(a.collection);
    await flushAsync(2);
    loadFor(a.loads, 'song-a').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(DEMO_READY);

    const b = deferredCollection('purchased-b', 'purchased', ['stem-b']);
    swapCollection(mounted, b.collection);
    await flushAsync(1);
    expect(statusText(mounted.view)).toBe(PURCHASED_LOADING);
    expect(b.loadSource).toHaveBeenCalledTimes(1);
    expect(libraryRow(mounted.view, 'stem-b').textContent).toContain(ROW_LOADING);
    expect(sourceStatus(mounted.api, 'stem-b')).toBe('loading');

    loadFor(b.loads, 'stem-b').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(PURCHASED_READY);
    expect(sourceStatus(mounted.api, 'stem-b')).toBe('ready');
    expect(libraryRow(mounted.view, 'stem-b').textContent).not.toContain(ROW_LOADING);
    mounted.view.unmount();
  });

  it('LS3b a swap to a new collection object with the same origin also resets the status to loading', async () => {
    const a = deferredCollection('demo-a', 'demo', ['song-a']);
    const mounted = mountWorkspace(a.collection);
    await flushAsync(2);
    loadFor(a.loads, 'song-a').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(DEMO_READY);

    const c = deferredCollection('demo-c', 'demo', ['song-c']);
    swapCollection(mounted, c.collection);
    await flushAsync(1);
    expect(statusText(mounted.view)).toBe(DEMO_LOADING);
    expect(c.loadSource).toHaveBeenCalledTimes(1);
    loadFor(c.loads, 'song-c').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(DEMO_READY);
    mounted.view.unmount();
  });

  it.each([
    'resolve',
    'reject',
  ] as const)('LS4 a stale settle from the replaced collection (%s) is ignored after the swap', async (lateOutcome) => {
    const a = deferredCollection('demo-a', 'demo', ['song-a']);
    const mounted = mountWorkspace(a.collection);
    await flushAsync(2);
    const staleLoad = loadFor(a.loads, 'song-a');
    expect(staleLoad.signal.aborted).toBe(false);

    const b = deferredCollection('purchased-b', 'purchased', ['stem-b']);
    swapCollection(mounted, b.collection);
    await flushAsync(1);
    expect(staleLoad.signal.aborted).toBe(true);
    expect(statusText(mounted.view)).toBe(PURCHASED_LOADING);

    if (lateOutcome === 'resolve') {
      staleLoad.resolve(testBuffer());
    } else {
      staleLoad.reject(new Error('late failure'));
    }
    await flushAsync();
    expect(statusText(mounted.view)).toBe(PURCHASED_LOADING);
    expect(['ready', 'error']).not.toContain(sourceStatus(mounted.api, 'song-a'));

    loadFor(b.loads, 'stem-b').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(PURCHASED_READY);
    expect(['ready', 'error']).not.toContain(sourceStatus(mounted.api, 'song-a'));
    mounted.view.unmount();
  });

  it('LS5 swap to an empty collection and back: purchased empty, then demo loading, then demo ready', async () => {
    const a = deferredCollection('demo-a', 'demo', ['song-a']);
    const mounted = mountWorkspace(a.collection);
    await flushAsync(2);
    loadFor(a.loads, 'song-a').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(DEMO_READY);

    const empty = emptyCollection('purchased');
    swapCollection(mounted, empty.collection);
    await flushAsync();
    expect(statusText(mounted.view)).toBe(PURCHASED_EMPTY);
    expect(empty.loadSource).not.toHaveBeenCalled();

    const c = deferredCollection('demo-c', 'demo', ['song-c']);
    swapCollection(mounted, c.collection);
    await flushAsync(1);
    expect(statusText(mounted.view)).toBe(DEMO_LOADING);
    loadFor(c.loads, 'song-c').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(DEMO_READY);
    mounted.view.unmount();
  });

  it('LS6 a rerender with the same collection object keeps a user status and does not reload', async () => {
    const a = deferredCollection('demo-a', 'demo', ['song-a']);
    const mounted = mountWorkspace(a.collection);
    await flushAsync(2);
    loadFor(a.loads, 'song-a').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(DEMO_READY);

    act(() => live(mounted.api).togglePlayback());
    expect(statusText(mounted.view)).toBe(NOTHING_TO_PLAY);
    expect(a.loadSource).toHaveBeenCalledTimes(1);

    swapCollection(mounted, a.collection, <span data-testid="ls6-extra-child" />);
    await flushAsync();
    expect(mounted.view.getByTestId('ls6-extra-child')).toBeTruthy();
    expect(statusText(mounted.view)).toBe(NOTHING_TO_PLAY);
    expect(a.loadSource).toHaveBeenCalledTimes(1);
    mounted.view.unmount();
  });

  it('LS7 mount lock: right after the mount commit the status is the demo loading text, then ready; one failure out of two shows the failed(1) text', async () => {
    const a = deferredCollection('demo-a', 'demo', ['song-a']);
    const mounted = mountWorkspace(a.collection);
    expect(statusText(mounted.view)).toBe(DEMO_LOADING);
    await flushAsync(2);
    expect(statusText(mounted.view)).toBe(DEMO_LOADING);
    loadFor(a.loads, 'song-a').resolve(testBuffer());
    await flushAsync();
    expect(statusText(mounted.view)).toBe(DEMO_READY);
    mounted.view.unmount();

    const pair = deferredCollection('demo-pair', 'demo', ['song-ok', 'song-bad']);
    const pairMount = mountWorkspace(pair.collection);
    await flushAsync(2);
    loadFor(pair.loads, 'song-ok').resolve(testBuffer());
    loadFor(pair.loads, 'song-bad').reject(new Error('demo fetch failed'));
    await flushAsync();
    expect(statusText(pairMount.view)).toBe(DEMO_ONE_FAILED);
    expect(sourceStatus(pairMount.api, 'song-ok')).toBe('ready');
    expect(sourceStatus(pairMount.api, 'song-bad')).toBe('error');
    pairMount.view.unmount();
  });

  it('PM1 purchased MP3 file names: czaba-studio.mp3, czaba-studio-range.mp3 and WAV + MP3 czaba-studio.wav, czaba-studio.mp3', async () => {
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => new Response(new Uint8Array(8)));
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: PURCHASED_STEMS,
      fetchAudio,
    });
    const { api, view } = mountWorkspace(collection, [
      { id: 'm1', trackId: 'music', sourceId: 'drums', start: 0, sourceOffset: 0, duration: 4 },
    ]);
    await flushAsync();
    expect(statusText(view)).toBe(PURCHASED_READY);

    await act(async () => {
      await live(api).exportMp3();
    });
    await settleExport(api);
    expect(live(api).exportState.phase).toBe('done');
    expect(downloads).toEqual(['czaba-studio.mp3']);

    downloads.length = 0;
    await act(async () => {
      await live(api).exportMp3({ start: 1, end: 3 });
    });
    await settleExport(api);
    expect(live(api).exportState.phase).toBe('done');
    expect(downloads).toEqual(['czaba-studio-range.mp3']);

    downloads.length = 0;
    await act(async () => {
      await live(api).exportMp3(undefined, { includeWav: true });
    });
    await settleExport(api);
    expect(live(api).exportState.phase).toBe('done');
    expect(downloads).toEqual(['czaba-studio.wav', 'czaba-studio.mp3']);
    expect(encodeMock).toHaveBeenCalledTimes(3);
    view.unmount();
  });
});
