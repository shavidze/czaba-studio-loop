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
const RANGE_BODY_TITLE = 'drag = time selection · click = playhead';

const clipStringsCollection: WorkspaceCollection = {
  id: 'clip-strings',
  label: 'clip-strings',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'clip-strings', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'clip-strings', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

function clipAt(id: string, trackId: string, start: number, duration: number): ArrangementClip {
  return {
    id,
    trackId,
    sourceId: trackId === 'sfx' ? 'hit' : 'song',
    start,
    sourceOffset: 0,
    duration,
  };
}

function clipStringsArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface ClipStringsApiRef {
  current: ArrangementContextValue | null;
}

function ClipStringsProbe({ api }: { api: ClipStringsApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: ClipStringsApiRef): ArrangementContextValue {
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

async function mountClipStringsWorkspace(clips: ArrangementClip[]) {
  const api: ClipStringsApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={clipStringsCollection}
      initialArrangement={clipStringsArrangement(clips)}
    >
      <StudioWorkspace />
      <ClipStringsProbe api={api} />
    </ArrangementProvider>,
  );
  for (let tick = 0; tick < 10 && live(api).sourceDurations.get('song') === undefined; tick++) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const clipParts = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const header = root?.firstElementChild;
    const body = root?.querySelector<HTMLElement>(`[title="${RANGE_BODY_TITLE}"]`);
    if (!root || !(header instanceof HTMLElement) || !body) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header, body };
  };
  return { api, view, clipParts };
}

function clipOf(api: ClipStringsApiRef, clipId: string): ArrangementClip {
  const clip = live(api).arrangement.clips.find((entry) => entry.id === clipId);
  if (!clip) {
    throw new Error(`clip ${clipId} missing`);
  }
  return clip;
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

const press = { button: 0, buttons: 1 };

function dragFrom(handle: HTMLElement, root: HTMLElement, startX: number, dx: number) {
  fireEvent.pointerDown(handle, {
    ...press,
    pointerId: 1,
    clientX: startX,
    clientY: MUSIC_LANE_Y,
  });
  fireEvent.pointerMove(root, { pointerId: 1, clientX: startX + dx, clientY: MUSIC_LANE_Y });
  fireEvent.pointerUp(root, { pointerId: 1, clientX: startX + dx, clientY: MUSIC_LANE_Y });
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
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('V-0.4a clip gesture strings in the real workspace', () => {
  it('CSU1 a clip-body drag from 3 s to 5 s shows the English range badge and body title', async () => {
    const { api, clipParts } = await mountClipStringsWorkspace([clipAt('m1', 'music', 2, 8)]);
    const parts = clipParts('m1');
    expect(parts.body.title).toBe('drag = time selection · click = playhead');
    dragFrom(parts.body, parts.root, 40, 80);
    expect(live(api).range).toEqual({ start: 3, end: 5, trackId: 'music' });
    const badge = Array.from(clipParts('m1').body.querySelectorAll('span')).find((span) =>
      span.textContent?.includes(' – '),
    );
    expect(badge?.textContent).toBe('00:03.000 – 00:05.000 · 2.000 s');
    const monoSpans = Array.from(badge?.querySelectorAll('span') ?? []).filter(
      (span) => span.className === 'font-mono font-normal tabular-nums',
    );
    expect(monoSpans.map((span) => span.textContent)).toEqual(['00:03.000', '00:05.000']);
  });

  it('CSU2 a group dragged to the left reports the exact distance and the Move (2) Undo label', async () => {
    const { api, view, clipParts } = await mountClipStringsWorkspace([
      clipAt('m1', 'music', 6, 2),
      clipAt('s2', 'sfx', 6, 2),
    ]);
    act(() => live(api).selectClip('s2'));
    act(() => live(api).toggleClipSelection('m1', 'toggle'));
    expect([...live(api).selectedClipIds].sort()).toEqual(['m1', 's2']);
    const parts = clipParts('m1');
    dragFrom(parts.header, parts.root, 40, -80);
    expect(clipOf(api, 'm1').start).toBe(4);
    expect(clipOf(api, 's2').start).toBe(4);
    expect(statusText(view)).toBe('Move (2): 2 clips moved 00:02.000 to the left.');
    expect(live(api).undoLabel).toBe('Move (2)');
  });

  it('CSU3 ArrowRight with two clips selected nudges both and stores the Move (2) label', async () => {
    const { api } = await mountClipStringsWorkspace([
      clipAt('m1', 'music', 6, 2),
      clipAt('s2', 'sfx', 6, 2),
    ]);
    act(() => live(api).selectClip('s2'));
    act(() => live(api).toggleClipSelection('m1', 'toggle'));
    fireEvent.keyDown(document.body, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(clipOf(api, 'm1').start).toBe(6.1);
    expect(clipOf(api, 's2').start).toBe(6.1);
    expect(live(api).undoLabel).toBe('Move (2)');
  });
});

describe('V-3c-2 clip header mark is a lucide icon (D-29z127)', () => {
  it('LC1 audio half: each audio clip header starts with GripVertical, uses gap-0.75 and has no ⠿ or ▶', async () => {
    const { api, view, clipParts } = await mountClipStringsWorkspace([
      clipAt('m1', 'music', 2, 4),
      clipAt('s2', 'sfx', 6, 2),
    ]);
    for (const clipId of ['m1', 's2']) {
      const { header } = clipParts(clipId);
      const icons = header.querySelectorAll('svg');
      expect(icons).toHaveLength(1);
      const grip = icons[0];
      expect(header.firstElementChild).toBe(grip);
      expect(grip.classList.contains('lucide-grip-vertical')).toBe(true);
      expect(grip.classList.contains('size-2.5')).toBe(true);
      expect(grip.classList.contains('shrink-0')).toBe(true);
      expect(grip.getAttribute('stroke-width')).toBe('2.4');
      expect(grip.getAttribute('aria-hidden')).toBe('true');
      const classes = header.className.split(/\s+/);
      expect(classes).toContain('gap-0.75');
      expect(classes).not.toContain('gap-1');
    }
    const m1 = clipParts('m1');
    const grip = m1.header.querySelector('svg');
    if (!grip) {
      throw new Error('m1 grip icon missing');
    }
    fireEvent.pointerDown(grip, { ...press, pointerId: 1, clientX: 100, clientY: MUSIC_LANE_Y });
    fireEvent.pointerMove(m1.root, { pointerId: 1, clientX: 180, clientY: MUSIC_LANE_Y });
    fireEvent.pointerUp(m1.root, { pointerId: 1, clientX: 180, clientY: MUSIC_LANE_Y });
    expect(clipOf(api, 'm1').start).toBe(4);
    const clips = view.container.querySelectorAll<HTMLElement>('[data-clip-id]');
    expect(clips.length).toBeGreaterThanOrEqual(2);
    for (const clip of clips) {
      expect(clip.textContent ?? '').not.toMatch(/[▶⠿]/u);
    }
  });
});
