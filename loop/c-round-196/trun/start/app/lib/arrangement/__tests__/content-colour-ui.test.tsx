import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const fakeClock = { base: 0 };

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
  get currentTime() {
    return Date.now() / 1000 - fakeClock.base;
  }
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

class FakeWaveAudioBuffer {
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
  getChannelData(channel: number) {
    const data = new Float32Array(this.length);
    for (let i = 0; i < this.length; i++) {
      data[i] = 0.2 + 0.6 * Math.abs(Math.sin((i + channel) / 13));
    }
    return data;
  }
}

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

const APP_ROOT = resolve(__dirname, '../../..');
const CLIP_PATH = 'components/arrangement/ArrangementClip.tsx';
const OVERVIEW_PATH = 'components/arrangement/ArrangementOverview.tsx';
const DETAIL_PATH = 'components/arrangement/ArrangementDetailPanel.tsx';
const LIBRARY_PREVIEW_PATH = 'components/arrangement/ArrangementLibraryPreview.tsx';

const RETIRED_CONTENT_TOKENS = [
  'text-brand/70',
  'text-accent/70',
  'bg-accent/10',
  'bg-accent/30',
  "'bg-brand/50'",
  "'bg-brand'",
] as const;

const KEPT_BRASS_SITES: ReadonlyArray<[string, string]> = [
  [CLIP_PATH, "'z-10 border-brand ring-2 ring-brand'"],
  [CLIP_PATH, "'bg-brand text-brand-foreground'"],
  [OVERVIEW_PATH, 'bg-accent ring-1 ring-background'],
  [DETAIL_PATH, 'w-px bg-accent'],
  [LIBRARY_PREVIEW_PATH, 'fill-brand'],
];

const contentCollection: WorkspaceCollection = {
  id: 'content-colour',
  label: 'content-colour',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'content-colour', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 1, sampleRate: 100 }),
};

function contentArrangement(videoClip: ArrangementClip): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
    { id: 'ambience', kind: 'audio', name: 'Ambience' },
  ]);
  return {
    ...base,
    clips: [
      videoClip,
      { id: 'a1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
      { id: 'a2', trackId: 'sfx', sourceId: 'song', start: 2, sourceOffset: 0, duration: 4 },
      { id: 'a3', trackId: 'ambience', sourceId: 'song', start: 4, sourceOffset: 0, duration: 6 },
    ],
  };
}

const PLAIN_VIDEO_CLIP: ArrangementClip = {
  id: 'v1',
  trackId: 'video',
  sourceId: 'film',
  start: 0,
  sourceOffset: 0,
  duration: 6,
};

interface ContentApiRef {
  current: ArrangementContextValue | null;
}

function ContentProbe({ api }: { api: ContentApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: ContentApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function tokensOf(element: Element | null | undefined, label: string): string[] {
  if (!element) {
    throw new Error(`${label} missing`);
  }
  return (element.getAttribute('class') ?? '').split(/\s+/).filter((token) => token.length > 0);
}

function readAppSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

async function mountContentWorkspace(videoClip: ArrangementClip = PLAIN_VIDEO_CLIP) {
  const api: ContentApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={contentCollection}
      initialArrangement={contentArrangement(videoClip)}
    >
      <StudioWorkspace />
      <ContentProbe api={api} />
    </ArrangementProvider>,
  );
  for (let tick = 0; tick < 10 && live(api).sourcePeaks.get('song') === undefined; tick++) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  const clipRoot = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    if (!root) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    return root;
  };
  const waveformBody = (clipId: string) => {
    const svg = clipRoot(clipId).querySelector('[data-testid="arrangement-clip-waveform"]');
    if (!svg) {
      throw new Error(`waveform of ${clipId} not rendered`);
    }
    return svg.parentElement;
  };
  return { api, view, clipRoot, waveformBody };
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeWaveAudioBuffer);
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

describe('DUX-R-5a content colour (D-29z139, R30-R33, K1-K6)', () => {
  it('DXC1: the audio clip waveform is neutral text-muted/70, unselected and selected', async () => {
    const { api, waveformBody } = await mountContentWorkspace();
    const brassTokens = ['text-brand/70', 'text-accent/70', 'text-brand', 'text-accent'];
    const unselected = tokensOf(waveformBody('a1'), 'audio waveform body');
    expect(unselected).toContain('text-muted/70');
    for (const token of brassTokens) {
      expect(unselected).not.toContain(token);
    }
    act(() => live(api).selectClip('a1'));
    const selected = tokensOf(waveformBody('a1'), 'selected audio waveform body');
    expect(selected).toContain('text-muted/70');
    for (const token of brassTokens) {
      expect(selected).not.toContain(token);
    }
  });

  it('DXC2: the video clip body, header, waveform colour and fade ramps are neutral', async () => {
    const { clipRoot } = await mountContentWorkspace({ ...PLAIN_VIDEO_CLIP, fadeIn: 1 });
    const root = clipRoot('v1');
    expect(root.dataset.clipKind).toBe('video');
    const rootTokens = tokensOf(root, 'video root');
    expect(rootTokens).toContain('bg-muted-bg');
    expect(rootTokens.filter((token) => token.startsWith('bg-accent'))).toStrictEqual([]);
    const header = tokensOf(root.children[0], 'video header');
    expect(header).toContain('bg-foreground/15');
    expect(header.filter((token) => token.startsWith('bg-accent'))).toStrictEqual([]);
    const body = tokensOf(root.children[1], 'video body');
    expect(body).toContain('text-muted/70');
    expect(body).not.toContain('text-accent/70');
    const ramps = tokensOf(
      root.querySelector('[data-testid="arrangement-video-fade-ramps"]'),
      'video fade ramps',
    );
    expect(ramps).toContain('text-foreground');
    expect(ramps).not.toContain('text-accent');
  });

  it('DXC3: a selected audio clip and a selected video clip keep the brass selection (K1)', async () => {
    const { api, clipRoot } = await mountContentWorkspace();
    for (const clipId of ['a1', 'v1']) {
      act(() => live(api).selectClip(clipId));
      const rootTokens = tokensOf(clipRoot(clipId), `${clipId} root`);
      expect(rootTokens).toEqual(expect.arrayContaining(['border-brand', 'ring-2', 'ring-brand']));
      const header = tokensOf(clipRoot(clipId).children[0], `${clipId} header`);
      expect(header).toEqual(expect.arrayContaining(['bg-brand', 'text-brand-foreground']));
      expect(header).not.toContain('bg-foreground/15');
      expect(header).not.toContain('bg-muted-bg');
    }
  });

  it('DXC4: Overview bars use the neutral ladder and the playhead keeps bg-accent (R33, K2)', async () => {
    const { view } = await mountContentWorkspace();
    const overview = view.container.querySelector('[data-timeline-overview]');
    const rows = Array.from(overview?.children[1]?.children ?? []);
    expect(rows).toHaveLength(4);
    const barTokens = rows.map((row) =>
      Array.from(row.querySelectorAll(':scope > div')).map((bar) => tokensOf(bar, 'overview bar')),
    );
    expect(barTokens.map((bars) => bars.length)).toStrictEqual([1, 1, 1, 1]);
    const expected = ['bg-foreground/25', 'bg-foreground/80', 'bg-muted/60', 'bg-dim'];
    barTokens.forEach((bars, index) => {
      expect(bars[0]).toContain(expected[index]);
      expect(bars[0]?.filter((token) => token.startsWith('bg-brand'))).toStrictEqual([]);
    });
    expect(tokensOf(view.getByTestId('arrangement-overview-playhead'), 'playhead')).toContain(
      'bg-accent',
    );
  });

  it('DXC5: the detail waveform box is neutral text-muted/70', async () => {
    const { api, view } = await mountContentWorkspace();
    act(() => live(api).selectClip('a1'));
    const detail = tokensOf(view.getByTestId('arrangement-detail-waveform'), 'detail waveform');
    expect(detail).toContain('text-muted/70');
    expect(detail).not.toContain('text-brand/70');
  });

  it('DXC6: retired content tokens are gone and the reserved brass sites stay exactly once', () => {
    for (const path of [CLIP_PATH, OVERVIEW_PATH, DETAIL_PATH]) {
      const source = readAppSource(path);
      for (const token of RETIRED_CONTENT_TOKENS) {
        expect(countOccurrences(source, token), `${token} in ${path}`).toBe(0);
      }
    }
    for (const [path, site] of KEPT_BRASS_SITES) {
      expect(countOccurrences(readAppSource(path), site), `${site} in ${path}`).toBe(1);
    }
  });
});
