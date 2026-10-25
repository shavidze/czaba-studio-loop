import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { decodeVideoAudio, probeVideoFile } from '~/lib/arrangement/video.client';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

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

const laneStringsCollection: WorkspaceCollection = {
  id: 'lane-strings',
  label: 'lane-strings',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'lane-strings', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

function clipAt(id: string, trackId: string, start: number, duration: number): ArrangementClip {
  return { id, trackId, sourceId: 'song', start, sourceOffset: 1, duration };
}

function laneStringsArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface LaneStringsApiRef {
  current: ArrangementContextValue | null;
}

function LaneStringsProbe({ api }: { api: LaneStringsApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: LaneStringsApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushLaneStrings() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function mountLaneStringsWorkspace(clips: ArrangementClip[]) {
  const api: LaneStringsApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={laneStringsCollection}
      initialArrangement={laneStringsArrangement(clips)}
    >
      <StudioWorkspace />
      <LaneStringsProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLaneStrings();
  const row = (trackId: string) => {
    const element = view.container.querySelector<HTMLElement>(`[data-track-id="${trackId}"]`);
    if (!element) {
      throw new Error(`row ${trackId} missing`);
    }
    return element;
  };
  const laneBody = (trackId: string) => {
    const fold = row(trackId).querySelector<HTMLElement>('[data-testid="arrangement-track-fold"]');
    const bodyId = fold?.getAttribute('aria-controls');
    const body = bodyId ? document.getElementById(bodyId) : null;
    if (!body) {
      throw new Error(`lane body ${trackId} missing`);
    }
    return body;
  };
  return { api, view, row, laneBody };
}

async function importVideo(api: LaneStringsApiRef, name: string) {
  await act(async () => {
    live(api).importVideoFiles([new File(['x'], name, { type: 'video/mp4' })]);
  });
  await flushLaneStrings();
}

function videoClipElement(view: ReturnType<typeof render>): HTMLElement {
  const clip = view.container.querySelector<HTMLElement>('[data-track-id="video"] [data-clip-id]');
  if (!clip) {
    throw new Error('video clip not rendered');
  }
  return clip;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  probeVideoMock.mockReset();
  decodeVideoMock.mockReset();
  probeVideoMock.mockResolvedValue({ url: 'blob:film', duration: 4, width: 640, height: 360 });
  decodeVideoMock.mockImplementation(() => new Promise(() => undefined));
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: () => undefined,
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('V-0.4b track lane and header strings in the real workspace', () => {
  it('LSU1 the active track shows · active and the folded video lane keeps a titled compact import button', async () => {
    const { view, row } = await mountLaneStringsWorkspace([]);
    const music = view.getByRole('button', { name: 'მუსიკა — set as the active track' });
    fireEvent.click(music);
    expect(music.getAttribute('aria-pressed')).toBe('true');
    expect(music.textContent).toBe('მუსიკა· active');
    const fold = row('video').querySelector<HTMLElement>('[data-testid="arrangement-track-fold"]');
    if (!fold) {
      throw new Error('video fold missing');
    }
    fireEvent.click(fold);
    const compact = view.getByRole('button', { name: 'Your own video' });
    expect(compact.querySelectorAll('svg.lucide-plus')).toHaveLength(1);
    expect(compact.textContent).toBe('');
    expect(compact.getAttribute('title')).toBe('Your own video');
  });

  it('LSU2 the Pan reset button names its track in English', async () => {
    const { row } = await mountLaneStringsWorkspace([]);
    const reset = row('music').querySelector('[data-testid="arrangement-track-pan-reset"]');
    expect(reset?.getAttribute('aria-label')).toBe('Reset Pan to centre — მუსიკა');
  });

  it('LSU3 an empty video lane shows the English placeholder', async () => {
    const { laneBody } = await mountLaneStringsWorkspace([]);
    const placeholder = laneBody('video').querySelector('p');
    expect(placeholder?.textContent).toBe('No video — use “Your own video” or drop a file here');
  });

  it('LSU4 a file drag shows the video drop hint on the video lane and the refusal on an audio lane', async () => {
    const { view, laneBody } = await mountLaneStringsWorkspace([]);
    const files = { dataTransfer: { types: ['Files'], dropEffect: 'none', files: [] } };
    fireEvent.dragEnter(laneBody('video'), files);
    fireEvent.dragOver(laneBody('video'), files);
    expect(view.getByTestId('arrangement-video-drop-hint').textContent).toBe('Drop the video here');
    fireEvent.dragLeave(laneBody('video'), { relatedTarget: null });
    expect(view.queryByTestId('arrangement-video-drop-hint')).toBeNull();
    fireEvent.dragEnter(laneBody('music'), files);
    fireEvent.dragOver(laneBody('music'), files);
    const hints = Array.from(laneBody('music').querySelectorAll('p')).map(
      (hint) => hint.textContent,
    );
    expect(hints).toEqual(['Video is not added here — drop it on the video track']);
  });

  it('LSU5a a video clip shows the English sound note while decoding', async () => {
    const { api, view } = await mountLaneStringsWorkspace([]);
    await importVideo(api, 'film.mp4');
    expect([...live(api).videoSources.values()][0]?.audio).toBe('decoding');
    expect(within(videoClipElement(view)).getByText('Sound is decoding…').textContent).toBe(
      'Sound is decoding…',
    );
  });

  it('LSU5b a video clip shows the English sound note when the sound cannot be read', async () => {
    decodeVideoMock.mockResolvedValue({ buffer: null, reason: 'decode-failed' });
    const { api, view } = await mountLaneStringsWorkspace([]);
    await importVideo(api, 'broken.mp4');
    expect([...live(api).videoSources.values()][0]?.audio).toBe('error');
    expect(within(videoClipElement(view)).getByText('Sound could not be read').textContent).toBe(
      'Sound could not be read',
    );
  });

  it('LSU5c a video clip shows the English sound note when the file has no sound', async () => {
    decodeVideoMock.mockResolvedValue({ buffer: null, reason: 'no-audio' });
    const { api, view } = await mountLaneStringsWorkspace([]);
    await importVideo(api, 'quiet.mp4');
    expect([...live(api).videoSources.values()][0]?.audio).toBe('none');
    expect(within(videoClipElement(view)).getByText('No sound').textContent).toBe('No sound');
  });

  it('LSU6 the selected-clip line text equals its title and lists start, length and source offset', async () => {
    const { api, view } = await mountLaneStringsWorkspace([clipAt('m1', 'music', 2, 8)]);
    act(() => live(api).selectClip('m1'));
    const line = view.getByTestId('arrangement-selected-clip');
    const expected = 'Clip: Song · start 00:02.000 · length 00:08.000 · source offset 00:01.000';
    expect(line.getAttribute('title')).toBe(expected);
    expect(line.textContent).toBe(expected);
  });
});

const V3C2_GLYPHS = /[▶◀×▾▸■＋⌫▣⠿]/u;

function expectLaneLucideIcon(
  host: Element,
  lucideClass: string,
  sizeClass: string,
  strokeWidth: string,
): SVGSVGElement {
  const icons = host.querySelectorAll('svg');
  expect(icons).toHaveLength(1);
  const icon = icons[0];
  expect(icon.getAttribute('aria-hidden')).toBe('true');
  expect(icon.classList.contains(lucideClass)).toBe(true);
  expect(icon.classList.contains(sizeClass)).toBe(true);
  expect(icon.classList.contains('shrink-0')).toBe(true);
  expect(icon.getAttribute('stroke-width')).toBe(strokeWidth);
  return icon;
}

describe('V-3c-2 lane and clip glyphs are lucide icons (D-29z127)', () => {
  it('LV1 lane folds, the full and compact video import and the track headers carry icons, not glyphs', async () => {
    const { view, row } = await mountLaneStringsWorkspace([]);
    const folds = view.container.querySelectorAll<HTMLElement>(
      '[data-testid="arrangement-track-fold"]',
    );
    expect(folds.length).toBeGreaterThan(0);
    for (const fold of folds) {
      expectLaneLucideIcon(fold, 'lucide-chevron-down', 'size-3', '2');
      expect(fold.textContent).toBe('');
    }
    const musicFold = row('music').querySelector<HTMLElement>(
      '[data-testid="arrangement-track-fold"]',
    );
    if (!musicFold) {
      throw new Error('music fold missing');
    }
    const musicChevron = musicFold.querySelector('svg');
    if (!musicChevron) {
      throw new Error('music fold icon missing');
    }
    fireEvent.click(musicChevron);
    expect(musicFold.getAttribute('aria-expanded')).toBe('false');
    expectLaneLucideIcon(musicFold, 'lucide-chevron-right', 'size-3', '2');
    expect(musicFold.querySelector('svg.lucide-chevron-down')).toBeNull();
    expect(musicFold.textContent).toBe('');

    const full = view.getByRole('button', { name: 'Your own video' });
    const plus = expectLaneLucideIcon(full, 'lucide-plus', 'size-2.5', '2.4');
    expect(full.firstElementChild).toBe(plus);
    expect(plus.nextElementSibling?.tagName).toBe('SPAN');
    expect(plus.nextElementSibling?.textContent).toBe('Your own video');
    expect(full.textContent).toBe('Your own video');
    const fullClasses = full.className.split(/\s+/);
    expect(fullClasses).toEqual(expect.arrayContaining(['flex', 'items-center', 'gap-1']));
    expect(fullClasses).not.toContain('gap-0.5');

    const videoFold = row('video').querySelector<HTMLElement>(
      '[data-testid="arrangement-track-fold"]',
    );
    if (!videoFold) {
      throw new Error('video fold missing');
    }
    fireEvent.click(videoFold);
    const compact = view.getByRole('button', { name: 'Your own video' });
    expectLaneLucideIcon(compact, 'lucide-plus', 'size-2.5', '2.4');
    expect(compact.textContent).toBe('');
    expect(compact.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['flex', 'h-5', 'w-5', 'items-center', 'justify-center']),
    );
    expect(compact.getAttribute('title')).toBe('Your own video');

    const headers = view.container.querySelectorAll<HTMLElement>(
      '[data-testid="arrangement-track-header"]',
    );
    expect(headers.length).toBeGreaterThan(0);
    for (const header of headers) {
      expect(header.textContent ?? '').not.toMatch(V3C2_GLYPHS);
    }
  });

  it('LC1 video half: the video clip header starts with the Film icon, uses gap-0.75 and has no ▶', async () => {
    const { api, view } = await mountLaneStringsWorkspace([]);
    await importVideo(api, 'film.mp4');
    const clip = videoClipElement(view);
    const header = clip.firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('video clip header missing');
    }
    const film = expectLaneLucideIcon(header, 'lucide-film', 'size-2.5', '2.4');
    expect(header.firstElementChild).toBe(film);
    expect(film.classList.contains('lucide-play')).toBe(false);
    const classes = header.className.split(/\s+/);
    expect(classes).toContain('gap-0.75');
    expect(classes).not.toContain('gap-1');
    expect(clip.textContent ?? '').not.toMatch(/[▶⠿]/u);
  });
});
