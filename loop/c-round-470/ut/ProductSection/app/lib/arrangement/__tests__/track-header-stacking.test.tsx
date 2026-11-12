import { act, fireEvent, render } from '@testing-library/react';
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
const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const MUSIC_LANE_Y = 150;
const SFX_LANE_Y = 250;
const HEADER_CLASSES = ['sticky', 'left-0', 'z-20'];

const stackingCollection: WorkspaceCollection = {
  id: 'stacking',
  label: 'stacking',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'stacking', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'stacking', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const STACKING_CLIPS: ArrangementClip[] = [
  {
    id: 'v1',
    trackId: 'video',
    sourceId: 'film',
    start: 0,
    sourceOffset: 0,
    duration: 4,
    fadeIn: 1,
  },
  {
    id: 'm1',
    trackId: 'music',
    sourceId: 'song',
    start: 0,
    sourceOffset: 0,
    duration: 6,
    fadeIn: 1,
  },
  { id: 'm2', trackId: 'music', sourceId: 'song', start: 8, sourceOffset: 0, duration: 4 },
  {
    id: 's1',
    trackId: 'sfx',
    sourceId: 'hit',
    start: 1,
    sourceOffset: 0,
    duration: 3,
    envelope: [
      { time: 0, gain: 0.5 },
      { time: 2, gain: 1 },
    ],
  },
];

function stackingArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: STACKING_CLIPS };
}

interface StackingApiRef {
  current: ArrangementContextValue | null;
}

function StackingProbe({ api }: { api: StackingApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: StackingApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountStackingWorkspace() {
  const api: StackingApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={stackingCollection} initialArrangement={stackingArrangement()}>
      <StudioWorkspace />
      <StackingProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  return { api, view };
}

function clipRoot(view: ReturnType<typeof render>, clipId: string): HTMLElement {
  const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
  if (!root) {
    throw new Error(`clip ${clipId} not rendered`);
  }
  return root;
}

function laneRowOf(element: HTMLElement): HTMLElement {
  const row = element.closest<HTMLElement>('[data-track-id]');
  if (!row) {
    throw new Error('lane row missing');
  }
  return row;
}

function headerOf(row: HTMLElement): HTMLElement {
  const header = row.firstElementChild;
  if (!(header instanceof HTMLElement)) {
    throw new Error('track header missing');
  }
  return header;
}

function laneBodyOf(row: HTMLElement): HTMLElement {
  const body = row.querySelector<HTMLElement>(':scope > [data-grid-lines]');
  if (!body) {
    throw new Error('lane body missing');
  }
  return body;
}

function classesOf(element: Element): string[] {
  return element.className.split(/\s+/).filter(Boolean);
}

function expectCappedBelowHeader(element: HTMLElement) {
  const row = laneRowOf(element);
  const header = headerOf(row);
  const body = laneBodyOf(row);
  expect(header.contains(element)).toBe(false);
  expect(body.contains(element)).toBe(true);
  expect(body.parentElement).toBe(row);
  expect(classesOf(body)).toContain('isolate');
  expect(classesOf(body).some((name) => /^z-\d+$/.test(name))).toBe(false);
  for (const name of HEADER_CLASSES) {
    expect(classesOf(header)).toContain(name);
  }
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('X1 C-R84-M1 track header stacking guard (structural lock, not a paint or hit-test proof)', () => {
  it('every lane body is an isolated stacking context next to the sticky z-20 header', async () => {
    const { view } = await mountStackingWorkspace();
    const rows = Array.from(view.container.querySelectorAll<HTMLElement>('[data-track-id]'));
    expect(rows.map((row) => row.dataset.trackId)).toEqual(['video', 'music', 'sfx']);
    for (const row of rows) {
      const header = headerOf(row);
      const body = laneBodyOf(row);
      for (const name of HEADER_CLASSES) {
        expect(classesOf(header)).toContain(name);
      }
      expect(classesOf(body)).toContain('isolate');
      expect(header.nextElementSibling).toBe(body);
    }
  });

  it('fade handles of unselected audio and video clips and every trim strip stay inside the isolated body', async () => {
    const { api, view } = await mountStackingWorkspace();
    act(() => live(api).selectClip('m2'));
    expect(clipRoot(view, 'm2').className).toContain('z-10');
    expect(clipRoot(view, 'm1').className).not.toContain('z-10');
    const audioHandle = clipRoot(view, 'm1').querySelector<HTMLElement>(
      '[data-testid="arrangement-clip-fade-in-handle"]',
    );
    const videoHandle = clipRoot(view, 'v1').querySelector<HTMLElement>(
      '[data-testid="arrangement-video-fade-in-handle"]',
    );
    if (!audioHandle || !videoHandle) {
      throw new Error('fade handles missing');
    }
    expect(classesOf(audioHandle).some((name) => /^z-(30|40)$/.test(name))).toBe(true);
    expect(classesOf(videoHandle).some((name) => /^z-(30|40)$/.test(name))).toBe(true);
    expectCappedBelowHeader(audioHandle);
    expectCappedBelowHeader(videoHandle);
    for (const clipId of ['v1', 'm1', 'm2', 's1']) {
      const root = clipRoot(view, clipId);
      const strips = Array.from(root.querySelectorAll<HTMLElement>('[title^="Trim — "]'));
      expect(strips).toHaveLength(2);
      for (const strip of strips) {
        expect(classesOf(strip)).toContain('z-20');
        expectCappedBelowHeader(strip);
      }
      expectCappedBelowHeader(root);
    }
  });

  it('a lane-move ghost stays inside the isolated body of its target lane', async () => {
    const { view } = await mountStackingWorkspace();
    const root = clipRoot(view, 's1');
    const header = root.firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('clip header missing');
    }
    stubCapture(root);
    fireEvent.pointerDown(header, {
      button: 0,
      buttons: 1,
      pointerId: 3,
      clientX: 100,
      clientY: SFX_LANE_Y,
    });
    fireEvent.pointerMove(root, { pointerId: 3, clientX: 60, clientY: MUSIC_LANE_Y });
    const ghosts = view.getAllByTestId('arrangement-lane-move-ghost');
    expect(ghosts.length).toBeGreaterThan(0);
    for (const ghost of ghosts) {
      expect(classesOf(ghost)).toContain('z-30');
      expectCappedBelowHeader(ghost);
    }
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.pointerUp(root, { pointerId: 3, clientX: 60, clientY: MUSIC_LANE_Y });
  });

  it('envelope points in Env mode stay inside the isolated body', async () => {
    const { view } = await mountStackingWorkspace();
    fireEvent.click(view.getByTestId('arrangement-envelope-toggle'));
    const points = view.getAllByTestId('arrangement-clip-envelope-point');
    expect(points.length).toBeGreaterThan(0);
    for (const point of points) {
      expectCappedBelowHeader(point);
    }
  });
});
