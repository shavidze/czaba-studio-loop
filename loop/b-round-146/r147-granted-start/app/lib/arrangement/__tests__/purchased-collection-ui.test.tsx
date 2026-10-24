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
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import type { AudioStem } from '~/types/audio';
import { createPurchasedWorkspaceCollection, type PurchasedStemFetch } from '../collection';
import { createArrangement } from '../model';

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

const renderWavMock = vi.mocked(renderArrangementWav);

const PURCHASED_HEADING = 'CZABA Studio · Workspace';
const PURCHASED_BADGE = 'შეძენილი კოლექცია';
const PURCHASED_LOADING = 'შეძენილი კოლექცია იტვირთება…';
const PURCHASED_READY =
  'შეძენილი კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).';
const PURCHASED_ONE_FAILED = 'შეძენილი კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.';
const DEMO_HEADING = 'CZABA Studio Lab · Workspace';
const DEMO_BADGE = 'დემო კოლექცია — ავტორიზაცია არ სჭირდება';
const DEMO_READY = 'დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).';

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

interface DeferredFetch {
  url: string;
  init: RequestInit;
  resolve: (response: Response) => void;
}

function deferredFetchAudio() {
  const calls: DeferredFetch[] = [];
  const fetchAudio = vi.fn<PurchasedStemFetch>(
    (url, init) =>
      new Promise<Response>((resolve) => {
        calls.push({ url, init, resolve });
      }),
  );
  return { calls, fetchAudio };
}

function purchasedCollection(fetchAudio: PurchasedStemFetch): WorkspaceCollection {
  return createPurchasedWorkspaceCollection({
    productId: 'middle-east',
    productTitle: 'Middle East',
    stems: PURCHASED_STEMS,
    fetchAudio,
  });
}

const demoCollection: WorkspaceCollection = {
  id: 'demo-lock',
  label: 'demo-lock',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'demo-lock', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function purchasedArrangement(clips: ArrangementClip[] = []): Arrangement {
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

function mountWorkspace(collection: WorkspaceCollection, clips: ArrangementClip[] = []) {
  const api: WorkspaceApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={collection} initialArrangement={purchasedArrangement(clips)}>
      <StudioWorkspace />
      <WorkspaceProbe api={api} />
    </ArrangementProvider>,
  );
  return { api, view };
}

function headerOf(view: ReturnType<typeof render>): HTMLElement {
  const header = view.container.querySelector('header');
  if (!header) {
    throw new Error('workspace header missing');
  }
  return header;
}

function headingText(view: ReturnType<typeof render>): string | null {
  return headerOf(view).querySelector('h1')?.textContent ?? null;
}

function badgeText(view: ReturnType<typeof render>): string | null {
  return headerOf(view).querySelector('span.border-accent')?.textContent?.trim() ?? null;
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

describe('SRW-21 stage 1 purchased collection in the shared workspace (D-29z57) — unit only, the purchased route is not mounted', () => {
  const downloads: string[] = [];

  beforeEach(() => {
    downloads.length = 0;
    decodeAudioDataMock.mockReset();
    decodeAudioDataMock.mockImplementation(
      async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
    );
    renderWavMock.mockReset();
    renderWavMock.mockResolvedValue({
      blob: new Blob(['rendered-wav']),
      peak: 0.5,
      clippedSamples: 0,
    });
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
      value: () => 'blob:purchased-test',
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

  it('PW1 header: the purchased heading and badge are exact and the header has no demo or no-sign-in copy', async () => {
    const { fetchAudio } = deferredFetchAudio();
    const { view } = mountWorkspace(purchasedCollection(fetchAudio));
    await flushAsync(2);
    expect(headingText(view)).toBe(PURCHASED_HEADING);
    expect(badgeText(view)).toBe(PURCHASED_BADGE);
    const header = headerOf(view).textContent ?? '';
    expect(header).not.toContain('დემო');
    expect(header).not.toContain('ავტორიზაცია არ სჭირდება');
    view.unmount();
  });

  it('PW2 status: the purchased loading text while every fetch is pending, then exactly the purchased ready text', async () => {
    const { calls, fetchAudio } = deferredFetchAudio();
    const { view } = mountWorkspace(purchasedCollection(fetchAudio));
    await flushAsync(2);
    expect(calls.map((call) => call.url)).toEqual(PURCHASED_STEMS.map((stem) => stem.audioUrl));
    expect(statusText(view)).toBe(PURCHASED_LOADING);
    calls[0]?.resolve(new Response(new Uint8Array(8)));
    await flushAsync();
    expect(statusText(view)).toBe(PURCHASED_LOADING);
    calls[1]?.resolve(new Response(new Uint8Array(8)));
    await flushAsync();
    expect(statusText(view)).toBe(PURCHASED_READY);
    expect(decodeAudioDataMock).toHaveBeenCalledTimes(2);
    view.unmount();
  });

  it('PW3 failure: one stem answers 403; the status counts it, the row shows the status-only error, and no rendered text contains the token', async () => {
    const { calls, fetchAudio } = deferredFetchAudio();
    const { view } = mountWorkspace(purchasedCollection(fetchAudio));
    await flushAsync(2);
    calls[0]?.resolve(new Response(null, { status: 403 }));
    calls[1]?.resolve(new Response(new Uint8Array(8)));
    await flushAsync();
    expect(statusText(view)).toBe(PURCHASED_ONE_FAILED);
    expect(libraryRow(view, 'drums').textContent).toContain('Error: File failed to load (403)');
    expect(libraryRow(view, 'bass').textContent).not.toContain('Error');
    const rendered = document.body.textContent ?? '';
    expect(rendered).not.toContain('SECRET');
    expect(rendered).not.toContain('token=');
    expect(rendered).not.toContain('stems.example.test');
    expect(document.body.innerHTML).not.toContain('SECRET');
    view.unmount();
  });

  it('PW4 abort on unmount: every fetch signal is aborted and late responses cause no console.error or throw', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { calls, fetchAudio } = deferredFetchAudio();
    const { view } = mountWorkspace(purchasedCollection(fetchAudio));
    await flushAsync(2);
    expect(calls).toHaveLength(2);
    for (const call of calls) {
      expect(call.init.signal?.aborted).toBe(false);
    }
    view.unmount();
    for (const call of calls) {
      expect(call.init.signal).toBeInstanceOf(AbortSignal);
      expect(call.init.signal?.aborted).toBe(true);
    }
    calls[0]?.resolve(new Response(new Uint8Array(8)));
    calls[1]?.resolve(new Response(null, { status: 403 }));
    await flushAsync();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('PW5 file names: purchased WAV exports download czaba-studio.wav and czaba-studio-range.wav', async () => {
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => new Response(new Uint8Array(8)));
    const { api, view } = mountWorkspace(purchasedCollection(fetchAudio), [
      { id: 'm1', trackId: 'music', sourceId: 'drums', start: 0, sourceOffset: 0, duration: 4 },
    ]);
    await flushAsync();
    expect(statusText(view)).toBe(PURCHASED_READY);
    await act(async () => {
      await live(api).exportWav();
    });
    expect(live(api).exportState.phase).toBe('done');
    await act(async () => {
      await live(api).exportWav({ start: 1, end: 3 });
    });
    expect(live(api).exportState.phase).toBe('done');
    expect(renderWavMock).toHaveBeenCalledTimes(2);
    expect(downloads).toEqual(['czaba-studio.wav', 'czaba-studio-range.wav']);
    view.unmount();
  });

  it('PW6 demo lock: the same harness with an origin demo collection shows the published demo heading, badge, ready text and file names', async () => {
    const { api, view } = mountWorkspace(demoCollection, [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 4 },
    ]);
    expect(statusText(view)).toBe('დემო კოლექცია იტვირთება…');
    await flushAsync();
    expect(headingText(view)).toBe(DEMO_HEADING);
    expect(badgeText(view)).toBe(DEMO_BADGE);
    expect(statusText(view)).toBe(DEMO_READY);
    await act(async () => {
      await live(api).exportWav();
    });
    await act(async () => {
      await live(api).exportWav({ start: 1, end: 3 });
    });
    expect(downloads).toEqual(['czaba-studio-lab.wav', 'czaba-studio-lab-range.wav']);
    view.unmount();
  });
});
