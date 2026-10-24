import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';

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
const STEMS_LANE_Y = 250;
const SFX_LANE_Y = 350;
const FADE_IN_HANDLE = 'arrangement-clip-fade-in-handle';
const FADE_OUT_HANDLE = 'arrangement-clip-fade-out-handle';
const NO_CHANGE = 'ცვლილება არ მოხდა — ისტორია არ შეიცვალა.';
const OVERLAP_TEXT = 'No room here';
const MOVE_LABEL = 'კლიპის გადატანა';

const fadeCollection: WorkspaceCollection = {
  id: 'fade',
  label: 'fade',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'fade', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'fade', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

function clipAt(
  id: string,
  trackId: string,
  start: number,
  duration: number,
  fades: Pick<ArrangementClip, 'fadeIn' | 'fadeOut'> = {},
): ArrangementClip {
  return {
    id,
    trackId,
    sourceId: trackId === 'video' ? 'film' : trackId === 'sfx' ? 'hit' : 'song',
    start,
    sourceOffset: 0,
    duration,
    ...fades,
  };
}

function fadeArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface FadeApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function FadeProbe({ api }: { api: FadeApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: FadeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: FadeApiRef): number {
  if (!api.position) {
    throw new Error('position store not mounted');
  }
  return api.position.getPosition();
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountFadeWorkspace(clips: ArrangementClip[]) {
  const api: FadeApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider collection={fadeCollection} initialArrangement={fadeArrangement(clips)}>
      <StudioWorkspace />
      <FadeProbe api={api} />
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
  const clipRoot = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    if (!root) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return root;
  };
  const handleOf = (clipId: string, testId: string) => {
    const handle = clipRoot(clipId).querySelector<HTMLElement>(`[data-testid="${testId}"]`);
    if (!handle) {
      throw new Error(`${testId} missing on ${clipId}`);
    }
    stubCapture(handle);
    return handle;
  };
  return { api, view, clipRoot, handleOf };
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function undoAll(api: FadeApiRef): number {
  let steps = 0;
  while (live(api).undoLabel !== null && steps < 20) {
    act(() => live(api).undo());
    steps++;
  }
  return steps;
}

function pressUndo() {
  fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
}

function pressRedo() {
  fireEvent.keyDown(document.body, { key: 'y', code: 'KeyY', ctrlKey: true });
}

const press = { button: 0, buttons: 1 };

interface PointerStep {
  dx: number;
  y?: number;
}

function dragFrom(
  handle: HTMLElement,
  root: HTMLElement,
  moves: PointerStep[],
  options: { pointerId?: number; startY?: number; release?: boolean } = {},
) {
  const pointerId = options.pointerId ?? 1;
  const startX = 100;
  const startY = options.startY ?? MUSIC_LANE_Y;
  fireEvent.pointerDown(handle, { ...press, pointerId, clientX: startX, clientY: startY });
  for (const move of moves) {
    fireEvent.pointerMove(root, {
      pointerId,
      clientX: startX + move.dx,
      clientY: move.y ?? startY,
    });
  }
  if (options.release === false) {
    return;
  }
  const last = moves.at(-1);
  fireEvent.pointerUp(root, {
    pointerId,
    clientX: startX + (last?.dx ?? 0),
    clientY: last?.y ?? startY,
  });
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

describe('SRW-18 stage 1 fade handles (FU1)', () => {
  it('FU1 an audio clip renders both handles; a video, a narrow and a folded-lane clip none', async () => {
    const { view, clipRoot } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0, 10),
      clipAt('s1', 'stems', 2, 16),
      clipAt('x1', 'sfx', 0, 0.5),
      clipAt('v1', 'video', 0, 6),
    ]);
    const music = clipRoot('m1');
    expect(music.dataset.fadeIn).toBe('0.000');
    expect(music.dataset.fadeOut).toBe('0.000');
    const fadeIn = music.querySelector<HTMLElement>(`[data-testid="${FADE_IN_HANDLE}"]`);
    const fadeOut = music.querySelector<HTMLElement>(`[data-testid="${FADE_OUT_HANDLE}"]`);
    expect(fadeIn?.title).toBe('Fade In — drag · double-click = 0');
    expect(fadeOut?.title).toBe('Fade Out — drag · double-click = 0');
    expect(fadeIn?.style.left).toBe('0px');
    expect(fadeOut?.style.right).toBe('0px');
    expect(fadeOut?.style.left).toBe('');
    expect(fadeIn?.className).toContain('group-hover:opacity-100');
    expect(clipRoot('v1').dataset.clipKind).toBe('video');
    expect(clipRoot('v1').querySelector('[data-testid^="arrangement-clip-fade-"]')).toBeNull();
    expect(clipRoot('x1').querySelector('[data-testid^="arrangement-clip-fade-"]')).toBeNull();
    expect(clipRoot('s1').querySelector(`[data-testid="${FADE_IN_HANDLE}"]`)).not.toBeNull();
    const stemsRow = view.container.querySelector<HTMLElement>('[data-track-id="stems"]');
    const fold = stemsRow?.querySelector<HTMLElement>('[data-testid="arrangement-track-fold"]');
    if (!fold) {
      throw new Error('stems fold button missing');
    }
    fireEvent.click(fold);
    expect(clipRoot('s1').querySelector('[data-testid^="arrangement-clip-fade-"]')).toBeNull();
    expect(clipRoot('s1').dataset.fadeIn).toBe('0.000');
  });

  it('FU1 a clip with a fade shows its handle at the fade length and a ramp overlay', async () => {
    const { clipRoot } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0, 10, { fadeIn: 1.5, fadeOut: 2 }),
    ]);
    const root = clipRoot('m1');
    expect(root.dataset.fadeIn).toBe('1.500');
    expect(root.dataset.fadeOut).toBe('2.000');
    const fadeIn = root.querySelector<HTMLElement>(`[data-testid="${FADE_IN_HANDLE}"]`);
    const fadeOut = root.querySelector<HTMLElement>(`[data-testid="${FADE_OUT_HANDLE}"]`);
    expect(fadeIn?.style.left).toBe('60px');
    expect(fadeOut?.style.right).toBe('80px');
    expect(fadeIn?.className).toContain('z-40');
    expect(fadeOut?.className).toContain('z-40');
    expect(fadeIn?.className).toContain('opacity-100');
    expect(fadeIn?.className).not.toContain('opacity-0');
    expect(root.querySelector('[data-testid="arrangement-clip-fade-ramps"]')).not.toBeNull();
  });
});

describe('SRW-18 stage 1 fade drag, undo and limits (FU2-FU4)', () => {
  it('FU2 dragging the fade-in handle +40 px writes one Fade In entry, undo and redo restore it', async () => {
    const { api, view, clipRoot, handleOf } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0, 10),
    ]);
    dragFrom(handleOf('m1', FADE_IN_HANDLE), clipRoot('m1'), [{ dx: 20 }, { dx: 40 }], {
      release: false,
    });
    expect(statusText(view)).toBe('Fade In: 1.000 წმ');
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerUp(clipRoot('m1'), { pointerId: 1, clientX: 140, clientY: MUSIC_LANE_Y });
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    expect(live(api).undoLabel).toBe('Fade In');
    expect(statusText(view)).toBe('Fade In: 1.000 წმ.');
    pressUndo();
    expect(clipRoot('m1').dataset.fadeIn).toBe('0.000');
    expect(live(api).arrangement.clips[0]).toStrictEqual(clipAt('m1', 'music', 0, 10));
    pressRedo();
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    expect(undoAll(api)).toBe(1);
  });

  it('FU2 dragging the fade-out handle left writes one Fade Out entry', async () => {
    const { api, view, clipRoot, handleOf } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0, 10),
    ]);
    dragFrom(handleOf('m1', FADE_OUT_HANDLE), clipRoot('m1'), [{ dx: -80 }]);
    expect(clipRoot('m1').dataset.fadeOut).toBe('2.000');
    expect(clipRoot('m1').dataset.fadeIn).toBe('0.000');
    expect(live(api).undoLabel).toBe('Fade Out');
    expect(statusText(view)).toBe('Fade Out: 2.000 წმ.');
    pressUndo();
    expect(clipRoot('m1').dataset.fadeOut).toBe('0.000');
    pressRedo();
    expect(clipRoot('m1').dataset.fadeOut).toBe('2.000');
    expect(undoAll(api)).toBe(1);
  });

  it('FU3 a drag past the other fade clamps to duration minus that fade and never below 0', async () => {
    const { api, clipRoot, handleOf } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0, 10, { fadeOut: 2 }),
    ]);
    dragFrom(handleOf('m1', FADE_IN_HANDLE), clipRoot('m1'), [{ dx: 1000 }]);
    expect(clipRoot('m1').dataset.fadeIn).toBe('8.000');
    expect(clipRoot('m1').dataset.fadeOut).toBe('2.000');
    expect(live(api).undoLabel).toBe('Fade In');
    const handleLeft = Number.parseFloat(handleOf('m1', FADE_IN_HANDLE).style.left);
    expect(handleLeft).toBe(320);
    dragFrom(handleOf('m1', FADE_IN_HANDLE), clipRoot('m1'), [{ dx: -2000 }], { pointerId: 2 });
    expect(clipRoot('m1').dataset.fadeIn).toBe('0.000');
    expect(undoAll(api)).toBe(2);
  });

  it('FU3 a press without movement writes nothing and pointercancel reverts with no entry', async () => {
    const { api, view, clipRoot, handleOf } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0, 10),
    ]);
    const before = statusText(view);
    dragFrom(handleOf('m1', FADE_IN_HANDLE), clipRoot('m1'), []);
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe(before);
    dragFrom(handleOf('m1', FADE_OUT_HANDLE), clipRoot('m1'), [{ dx: -80 }], {
      release: false,
      pointerId: 3,
    });
    expect(clipRoot('m1').dataset.fadeOut).toBe('2.000');
    fireEvent.pointerCancel(clipRoot('m1'), { pointerId: 3, clientX: 20, clientY: MUSIC_LANE_Y });
    expect(clipRoot('m1').dataset.fadeOut).toBe('0.000');
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isArrangementPreviewActive()).toBe(false);
  });

  it('FU3 a drag that ends at its start value writes the no-change status', async () => {
    const { api, view, clipRoot, handleOf } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0, 10, { fadeIn: 1 }),
    ]);
    dragFrom(handleOf('m1', FADE_IN_HANDLE), clipRoot('m1'), [{ dx: 40 }, { dx: 0 }]);
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe(`Fade In: ${NO_CHANGE}`);
  });

  it('FU4 a double-click resets a fade to 0 with one entry and does nothing on a zero fade', async () => {
    const { api, view, clipRoot, handleOf } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0, 10, { fadeIn: 1.5 }),
    ]);
    const outer = vi.fn();
    document.addEventListener('dblclick', outer);
    fireEvent.doubleClick(handleOf('m1', FADE_IN_HANDLE));
    expect(clipRoot('m1').dataset.fadeIn).toBe('0.000');
    expect(live(api).undoLabel).toBe('Fade In');
    expect(statusText(view)).toBe('Fade In: 0.000 წმ.');
    fireEvent.doubleClick(handleOf('m1', FADE_OUT_HANDLE));
    fireEvent.doubleClick(handleOf('m1', FADE_IN_HANDLE));
    document.removeEventListener('dblclick', outer);
    expect(outer).not.toHaveBeenCalled();
    expect(undoAll(api)).toBe(1);
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.500');
  });

  it('FU4 a handle press or drag never starts the body range or a seek', async () => {
    const { api, clipRoot, handleOf } = await mountFadeWorkspace([clipAt('m1', 'music', 2, 10)]);
    dragFrom(handleOf('m1', FADE_IN_HANDLE), clipRoot('m1'), []);
    expect(positionOf(api)).toBe(0);
    expect(live(api).range).toBeNull();
    dragFrom(handleOf('m1', FADE_IN_HANDLE), clipRoot('m1'), [{ dx: 40 }], { pointerId: 2 });
    expect(positionOf(api)).toBe(0);
    expect(live(api).range).toBeNull();
    expect(live(api).selectedClipId).toBe('m1');
    expect(clipRoot('m1').dataset.clipStart).toBe('2.000');
  });
});

describe('SRW-18 stage 1 fade pointer capture and lost pointer (FU6)', () => {
  it('FU6 a fade gesture captures the pointer on the handle so a real double-click lands there', async () => {
    const { clipRoot, handleOf } = await mountFadeWorkspace([clipAt('m1', 'music', 0, 10)]);
    const handle = handleOf('m1', FADE_IN_HANDLE);
    const root = clipRoot('m1');
    const handleCapture = vi.fn();
    const rootCapture = vi.fn();
    Object.defineProperty(handle, 'setPointerCapture', {
      configurable: true,
      value: handleCapture,
    });
    Object.defineProperty(root, 'setPointerCapture', { configurable: true, value: rootCapture });
    dragFrom(handle, root, [{ dx: 40 }]);
    expect(handleCapture).toHaveBeenCalledWith(1);
    expect(rootCapture).not.toHaveBeenCalled();
    const header = root.firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('header missing');
    }
    dragFrom(header, root, [{ dx: 40 }], { pointerId: 2 });
    expect(rootCapture).toHaveBeenCalledWith(2);
  });

  it('FU6 a lost pointer during a fade drag reverts with no entry', async () => {
    const { api, clipRoot, handleOf } = await mountFadeWorkspace([clipAt('m1', 'music', 0, 10)]);
    const handle = handleOf('m1', FADE_OUT_HANDLE);
    Object.defineProperty(handle, 'setPointerCapture', {
      configurable: true,
      value: () => {
        throw new Error('capture refused');
      },
    });
    dragFrom(handle, clipRoot('m1'), [{ dx: -80 }], { release: false, pointerId: 4 });
    expect(clipRoot('m1').dataset.fadeOut).toBe('2.000');
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 4 }));
    });
    expect(clipRoot('m1').dataset.fadeOut).toBe('0.000');
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isArrangementPreviewActive()).toBe(false);
  });
});

describe('SRW-18 stage 1 X1 refused lane release status (FU5)', () => {
  const x1Clips = () => [clipAt('m1', 'music', 0.35, 10), clipAt('s1', 'stems', 2, 16)];

  it('FU5 a refused lane release keeps the last free place and says where the clip stayed', async () => {
    const { api, view, clipRoot } = await mountFadeWorkspace(x1Clips());
    const header = clipRoot('m1').firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('header missing');
    }
    dragFrom(header, clipRoot('m1'), [{ dx: 41 }, { dx: 41, y: STEMS_LANE_Y }], {
      release: false,
    });
    expect(statusText(view)).toBe(OVERLAP_TEXT);
    fireEvent.pointerUp(clipRoot('m1'), { pointerId: 1, clientX: 141, clientY: STEMS_LANE_Y });
    const moved = live(api).arrangement.clips.find((clip) => clip.id === 'm1');
    expect(moved?.trackId).toBe('music');
    expect(clipRoot('m1').dataset.clipStart).toBe('1.375');
    expect(statusText(view)).toBe(
      `${OVERLAP_TEXT} — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:01.375.`,
    );
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
    expect(undoAll(api)).toBe(1);
  });

  it('FU5 a refused hover followed by a return to its own lane writes the normal move status', async () => {
    const { api, view, clipRoot } = await mountFadeWorkspace(x1Clips());
    const header = clipRoot('m1').firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('header missing');
    }
    dragFrom(header, clipRoot('m1'), [
      { dx: 41 },
      { dx: 41, y: STEMS_LANE_Y },
      { dx: 41, y: MUSIC_LANE_Y },
    ]);
    expect(clipRoot('m1').dataset.clipStart).toBe('1.375');
    expect(statusText(view)).toBe(
      `${MOVE_LABEL}: start 00:01.375, length 00:10.000, source offset 00:00.000.`,
    );
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
  });

  it('FU5 a first move that lands in the refused lane writes no entry and the no-change status', async () => {
    const { api, view, clipRoot } = await mountFadeWorkspace(x1Clips());
    const header = clipRoot('m1').firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('header missing');
    }
    dragFrom(header, clipRoot('m1'), [{ dx: 0, y: STEMS_LANE_Y }]);
    expect(clipRoot('m1').dataset.clipStart).toBe('0.350');
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe(`${MOVE_LABEL}: ${NO_CHANGE}`);
  });

  it('FU5 a drag onto a free lane still writes the lane move status', async () => {
    const { api, view, clipRoot } = await mountFadeWorkspace(x1Clips());
    const header = clipRoot('m1').firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('header missing');
    }
    dragFrom(header, clipRoot('m1'), [{ dx: 41, y: SFX_LANE_Y }]);
    expect(live(api).arrangement.clips.find((clip) => clip.id === 'm1')?.trackId).toBe('sfx');
    expect(statusText(view)).toBe('გადატანა ხაზზე — SFX: start 00:01.375.');
  });

  it('FU5 fades travel unchanged with a lane move', async () => {
    const { api, clipRoot } = await mountFadeWorkspace([
      clipAt('m1', 'music', 0.35, 10, { fadeIn: 1, fadeOut: 2 }),
    ]);
    const header = clipRoot('m1').firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('header missing');
    }
    dragFrom(header, clipRoot('m1'), [{ dx: 41, y: SFX_LANE_Y }]);
    const moved = live(api).arrangement.clips.find((clip) => clip.id === 'm1');
    expect(moved).toMatchObject({ trackId: 'sfx', fadeIn: 1, fadeOut: 2 });
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    expect(clipRoot('m1').dataset.fadeOut).toBe('2.000');
  });
});
