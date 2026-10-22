import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementClipEnvelopePoint,
  WorkspaceCollection,
} from '~/types/arrangement';
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
const BODY_HEIGHT_PX = 80;
const STEMS_LANE_Y = 250;
const EDITOR = 'arrangement-clip-envelope-editor';
const POINT = 'arrangement-clip-envelope-point';
const LINE = 'arrangement-clip-envelope-line';
const TOGGLE = 'arrangement-envelope-toggle';
const FADE_IN_HANDLE = 'arrangement-clip-fade-in-handle';
const ADD_LABEL = 'Envelope: წერტილის დამატება';
const MOVE_LABEL = 'Envelope: წერტილის გადატანა';
const REMOVE_LABEL = 'Envelope: წერტილის წაშლა';
const MODE_ON = 'Envelope რეჟიმი: ჩართულია.';
const MODE_OFF = 'Envelope რეჟიმი: გამორთულია.';
const V_ENVELOPE: ArrangementClipEnvelopePoint[] = [
  { time: 4, gain: 1 },
  { time: 8, gain: 0.2512 },
  { time: 12, gain: 1 },
];
const V_DATA = '6.000:1.0000;10.000:0.2512;14.000:1.0000';

const envelopeCollection: WorkspaceCollection = {
  id: 'envelope',
  label: 'envelope',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'envelope', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'envelope', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

function clipAt(
  id: string,
  trackId: string,
  start: number,
  duration: number,
  extra: Partial<ArrangementClip> = {},
): ArrangementClip {
  return {
    id,
    trackId,
    sourceId: trackId === 'video' ? 'film' : trackId === 'sfx' ? 'hit' : 'song',
    start,
    sourceOffset: 0,
    duration,
    ...extra,
  };
}

function envelopeArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface EnvelopeApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function EnvelopeProbe({ api }: { api: EnvelopeApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: EnvelopeApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: EnvelopeApiRef): number {
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

function stubBodyRect(body: HTMLElement) {
  Object.defineProperty(body, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(0, 0, 640, BODY_HEIGHT_PX),
  });
}

async function mountEnvelopeWorkspace(clips: ArrangementClip[]) {
  const api: EnvelopeApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider
      collection={envelopeCollection}
      initialArrangement={envelopeArrangement(clips)}
    >
      <StudioWorkspace />
      <EnvelopeProbe api={api} />
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
  const editorOf = (clipId: string) => {
    const editor = clipRoot(clipId).querySelector<HTMLElement>(`[data-testid="${EDITOR}"]`);
    const body = editor?.parentElement;
    if (!editor || !body) {
      throw new Error(`envelope editor missing on ${clipId}`);
    }
    stubBodyRect(body);
    return editor;
  };
  const pointsOf = (clipId: string) =>
    Array.from(clipRoot(clipId).querySelectorAll<HTMLElement>(`[data-testid="${POINT}"]`));
  const pointOf = (clipId: string, index: number) => {
    const point = pointsOf(clipId)[index];
    const body = point?.parentElement;
    if (!point || !body) {
      throw new Error(`envelope point ${index} missing on ${clipId}`);
    }
    stubCapture(point);
    stubBodyRect(body);
    return point;
  };
  const toggle = () => view.getByTestId(TOGGLE);
  const gridControl = () => view.getByTestId('arrangement-grid-control');
  return { api, view, clipRoot, editorOf, pointsOf, pointOf, toggle, gridControl };
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function undoAll(api: EnvelopeApiRef): number {
  let steps = 0;
  while (live(api).undoLabel !== null && steps < 20) {
    act(() => live(api).undo());
    steps++;
  }
  return steps;
}

function pressKey(
  key: string,
  options: Partial<KeyboardEventInit> = {},
  target: Element = document.body,
) {
  fireEvent.keyDown(target, { key, code: `Key${key.toUpperCase()}`, ...options });
}

function pressUndo() {
  fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
}

function pressRedo() {
  fireEvent.keyDown(document.body, { key: 'y', code: 'KeyY', ctrlKey: true });
}

const press = { button: 0, buttons: 1 };

function dragPoint(
  point: HTMLElement,
  moves: { dx: number; dy?: number }[],
  options: { pointerId?: number; release?: boolean } = {},
) {
  const pointerId = options.pointerId ?? 1;
  const startX = 300;
  const startY = 100;
  fireEvent.pointerDown(point, { ...press, pointerId, clientX: startX, clientY: startY });
  for (const move of moves) {
    fireEvent.pointerMove(point, {
      pointerId,
      clientX: startX + move.dx,
      clientY: startY + (move.dy ?? 0),
    });
  }
  if (options.release === false) {
    return;
  }
  const last = moves.at(-1);
  fireEvent.pointerUp(point, {
    pointerId,
    clientX: startX + (last?.dx ?? 0),
    clientY: startY + (last?.dy ?? 0),
  });
}

let performanceNow = 1000;

beforeEach(() => {
  performanceNow = 1000;
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(performance, 'now').mockImplementation(() => performanceNow);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SRW-18 stage 2 envelope mode (EU1)', () => {
  it('EU1 the Env button and the A key toggle the mode and write the status', async () => {
    const { view, toggle, gridControl } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16),
    ]);
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    expect(toggle().getAttribute('aria-keyshortcuts')).toBe('A');
    expect(toggle().title).toBe('Envelope გამორთულია — კლიპის volume envelope-ის რედაქტირება (A)');
    expect(gridControl().dataset.envelopeMode).toBe('off');
    fireEvent.click(toggle());
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    expect(toggle().title).toBe('Envelope ჩართულია — კლიპზე double-click = წერტილი (A)');
    expect(toggle().className).toContain('text-accent');
    expect(gridControl().dataset.envelopeMode).toBe('on');
    expect(statusText(view)).toBe(MODE_ON);
    pressKey('a');
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    expect(gridControl().dataset.envelopeMode).toBe('off');
    expect(statusText(view)).toBe(MODE_OFF);
    pressKey('a');
    expect(gridControl().dataset.envelopeMode).toBe('on');
    expect(statusText(view)).toBe(MODE_ON);
  });

  it('EU1 A with a modifier, a repeat or in a text field does nothing', async () => {
    const { gridControl } = await mountEnvelopeWorkspace([clipAt('s1', 'stems', 2, 16)]);
    pressKey('a', { ctrlKey: true });
    pressKey('a', { metaKey: true });
    pressKey('a', { altKey: true });
    pressKey('a', { shiftKey: true });
    pressKey('a', { repeat: true });
    const input = document.createElement('input');
    document.body.append(input);
    pressKey('a', {}, input);
    input.remove();
    expect(gridControl().dataset.envelopeMode).toBe('off');
  });

  it('EU1 mode off shows no editor and no points; mode on hides the fade handles', async () => {
    const { clipRoot, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    const stems = clipRoot('s1');
    expect(stems.dataset.envelope).toBe(V_DATA);
    expect(stems.querySelector(`[data-testid="${EDITOR}"]`)).toBeNull();
    expect(stems.querySelector(`[data-testid="${POINT}"]`)).toBeNull();
    expect(stems.querySelector(`[data-testid="${LINE}"]`)).not.toBeNull();
    expect(stems.querySelector(`[data-testid="${FADE_IN_HANDLE}"]`)).not.toBeNull();
    fireEvent.click(toggle());
    expect(clipRoot('s1').querySelector(`[data-testid="${EDITOR}"]`)).not.toBeNull();
    expect(clipRoot('s1').querySelectorAll(`[data-testid="${POINT}"]`)).toHaveLength(3);
    expect(clipRoot('s1').querySelector('[data-testid^="arrangement-clip-fade-"]')).toBeNull();
  });

  it('EU1 a video clip, a narrow clip and a folded lane never render an editor', async () => {
    const { view, clipRoot, toggle } = await mountEnvelopeWorkspace([
      clipAt('v1', 'video', 0, 6),
      clipAt('x1', 'sfx', 0, 0.5),
      clipAt('s1', 'stems', 2, 16),
    ]);
    fireEvent.click(toggle());
    expect(clipRoot('v1').querySelector(`[data-testid="${EDITOR}"]`)).toBeNull();
    expect(clipRoot('v1').querySelector(`[data-testid="${LINE}"]`)).toBeNull();
    expect(clipRoot('v1').dataset.envelope).toBe('');
    expect(clipRoot('x1').querySelector(`[data-testid="${EDITOR}"]`)).toBeNull();
    expect(clipRoot('s1').querySelector(`[data-testid="${EDITOR}"]`)).not.toBeNull();
    expect(clipRoot('s1').querySelector(`[data-testid="${LINE}"]`)).not.toBeNull();
    const fold = view.container
      .querySelector<HTMLElement>('[data-track-id="stems"]')
      ?.querySelector<HTMLElement>('[data-testid="arrangement-track-fold"]');
    if (!fold) {
      throw new Error('stems fold button missing');
    }
    fireEvent.click(fold);
    expect(clipRoot('s1').querySelector(`[data-testid="${EDITOR}"]`)).toBeNull();
  });
});

describe('SRW-18 stage 2 add a point (EU2)', () => {
  it('EU2 a double-click adds a point at the line value with one entry; undo and redo restore it', async () => {
    const { api, view, clipRoot, editorOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16),
    ]);
    fireEvent.click(toggle());
    const editor = editorOf('s1');
    fireEvent.doubleClick(editor, { clientX: 160, clientY: 60 });
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:1.0000');
    expect(live(api).undoLabel).toBe(ADD_LABEL);
    expect(statusText(view)).toBe('Envelope: წერტილი დაემატა — 6.000 წმ · 0.0 dB.');
    expect(positionOf(api)).toBe(0);
    expect(live(api).range).toBeNull();
    fireEvent.doubleClick(editorOf('s1'), { clientX: 160, clientY: 10 });
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:1.0000');
    pressUndo();
    expect(clipRoot('s1').dataset.envelope).toBe('');
    expect(live(api).arrangement.clips[0]).toStrictEqual(clipAt('s1', 'stems', 2, 16));
    pressRedo();
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:1.0000');
    expect(undoAll(api)).toBe(1);
  });

  it('EU2 a point added between two points takes their interpolated value, not the pointer height', async () => {
    const { clipRoot, editorOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, {
        envelope: [
          { time: 4, gain: 1 },
          { time: 12, gain: 0.5 },
        ],
      }),
    ]);
    fireEvent.click(toggle());
    fireEvent.doubleClick(editorOf('s1'), { clientX: 320, clientY: 5 });
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:1.0000;10.000:0.7500;14.000:0.5000');
  });
});

describe('SRW-18 stage 2 drag a point (EU3)', () => {
  it('EU3 dragging a point down by a quarter of the body gives 0.75 with one entry', async () => {
    const { api, view, clipRoot, pointOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    dragPoint(
      pointOf('s1', 0),
      [
        { dx: 0, dy: 10 },
        { dx: 0, dy: BODY_HEIGHT_PX / 4 },
      ],
      {
        release: false,
      },
    );
    expect(statusText(view)).toBe('Envelope: 6.000 წმ · −2.5 dB');
    expect(live(api).undoLabel).toBeNull();
    fireEvent.pointerUp(pointOf('s1', 0), { pointerId: 1, clientX: 300, clientY: 120 });
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:0.7500;10.000:0.2512;14.000:1.0000');
    expect(pointOf('s1', 0).dataset.gain).toBe('0.7500');
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
    expect(statusText(view)).toBe('Envelope: 6.000 წმ · −2.5 dB.');
    expect(positionOf(api)).toBe(0);
    expect(undoAll(api)).toBe(1);
    expect(clipRoot('s1').dataset.envelope).toBe(V_DATA);
  });

  it('EU3 a horizontal drag past a neighbour stops 1 ms short of it', async () => {
    const { api, clipRoot, pointOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    dragPoint(pointOf('s1', 1), [{ dx: 400 }]);
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:1.0000;13.999:0.2512;14.000:1.0000');
    dragPoint(pointOf('s1', 1), [{ dx: -800 }], { pointerId: 2 });
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:1.0000;6.001:0.2512;14.000:1.0000');
    expect(undoAll(api)).toBe(2);
  });

  it('EU3 a press without movement writes nothing; pointercancel reverts with no entry', async () => {
    const { api, view, clipRoot, pointOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    const before = statusText(view);
    dragPoint(pointOf('s1', 1), []);
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe(before);
    dragPoint(pointOf('s1', 1), [{ dx: 0, dy: 20 }], { release: false, pointerId: 3 });
    expect(pointOf('s1', 1).dataset.gain).toBe('0.0012');
    fireEvent.pointerCancel(pointOf('s1', 1), { pointerId: 3 });
    expect(clipRoot('s1').dataset.envelope).toBe(V_DATA);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isArrangementPreviewActive()).toBe(false);
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('EU3 a drag that ends at its start value writes the no-change status', async () => {
    const { api, view, pointOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    dragPoint(pointOf('s1', 1), [{ dx: 40 }, { dx: 0 }]);
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe('Envelope: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.');
  });

  it('EU3 the editor unmounting mid-drag reverts with no entry and releases the gesture', async () => {
    const { api, clipRoot, pointOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    dragPoint(pointOf('s1', 1), [{ dx: 0, dy: 20 }], { release: false });
    expect(clipRoot('s1').dataset.envelope).not.toBe(V_DATA);
    act(() => live(api).setPxPerSecond(1));
    expect(clipRoot('s1').querySelector(`[data-testid="${EDITOR}"]`)).toBeNull();
    expect(clipRoot('s1').dataset.envelope).toBe(V_DATA);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isArrangementPreviewActive()).toBe(false);
    expect(live(api).isPointerGestureActive()).toBe(false);
  });

  it('EU3 the A key and the Env button are refused mid-drag', async () => {
    const { api, view, clipRoot, pointOf, toggle, gridControl } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    dragPoint(pointOf('s1', 0), [{ dx: 0, dy: 20 }], { release: false });
    pressKey('a');
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(gridControl().dataset.envelopeMode).toBe('on');
    fireEvent.click(toggle());
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(gridControl().dataset.envelopeMode).toBe('on');
    fireEvent.pointerUp(pointOf('s1', 0), { pointerId: 1, clientX: 300, clientY: 120 });
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:0.7500;10.000:0.2512;14.000:1.0000');
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
  });

  it('EU3 a lost pointer during an uncaptured drag reverts with no entry', async () => {
    const { api, clipRoot, pointOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    const point = pointOf('s1', 1);
    Object.defineProperty(point, 'setPointerCapture', {
      configurable: true,
      value: () => {
        throw new Error('capture refused');
      },
    });
    dragPoint(point, [{ dx: 0, dy: 20 }], { release: false, pointerId: 4 });
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 4 }));
    });
    expect(clipRoot('s1').dataset.envelope).toBe(V_DATA);
    expect(live(api).undoLabel).toBeNull();
    expect(live(api).isArrangementPreviewActive()).toBe(false);
  });
});

describe('SRW-18 stage 2 review follow-ups (EU7)', () => {
  it('EU7 a trimmed clip with a hidden point before the window drags the right point', async () => {
    const { api, view, clipRoot, pointOf, pointsOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 8, 10, { sourceOffset: 6, envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    expect(clipRoot('s1').dataset.envelope).toBe('10.000:0.2512;14.000:1.0000');
    expect(pointsOf('s1')).toHaveLength(2);
    dragPoint(pointOf('s1', 0), [{ dx: 40 }]);
    expect(clipRoot('s1').dataset.envelope).toBe('11.000:0.2512;14.000:1.0000');
    expect(statusText(view)).toBe('Envelope: 11.000 წმ · −12.0 dB.');
    expect(live(api).arrangement.clips[0].envelope).toStrictEqual([
      { time: 4, gain: 1 },
      { time: 9, gain: 0.2512 },
      { time: 12, gain: 1 },
    ]);
  });

  it('EU7 the line stays drawn with the mode off when every point is outside the window', async () => {
    const { clipRoot } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 2, {
        sourceOffset: 14,
        envelope: [
          { time: 4, gain: 1 },
          { time: 8, gain: 0.2512 },
        ],
      }),
    ]);
    expect(clipRoot('s1').dataset.envelope).toBe('');
    const line = clipRoot('s1').querySelector(`[data-testid="${LINE}"] polyline`);
    expect(line?.getAttribute('points')).toBe('0,0.7488 80,0.7488');
  });

  it('EU7 Ctrl and Shift on the editor toggle the selection; a double-click on a trim strip adds nothing', async () => {
    const { api, clipRoot, editorOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('m1', 'music', 0, 1),
      clipAt('s1', 'stems', 2, 16),
    ]);
    fireEvent.click(toggle());
    act(() => live(api).selectClip('m1'));
    fireEvent.pointerDown(editorOf('s1'), { ...press, ctrlKey: true, clientX: 200 });
    expect(live(api).selectedClipIds).toEqual(['m1', 's1']);
    fireEvent.pointerDown(editorOf('s1'), { ...press, ctrlKey: true, clientX: 200 });
    expect(live(api).selectedClipIds).toEqual(['m1']);
    fireEvent.pointerDown(editorOf('s1'), { ...press, shiftKey: true, clientX: 200 });
    expect(live(api).selectedClipIds).toEqual(['m1', 's1']);
    const trim = clipRoot('s1').querySelector<HTMLElement>('[title="Trim — მარცხენა კიდე"]');
    if (!trim) {
      throw new Error('trim strip missing');
    }
    fireEvent.doubleClick(trim, { clientX: 4, clientY: 40 });
    expect(clipRoot('s1').dataset.envelope).toBe('');
    expect(live(api).undoLabel).toBeNull();
  });
});

describe('SRW-18 stage 2 delete a point (EU4)', () => {
  it('EU4 a double-click on a point removes it with one entry and adds nothing', async () => {
    const { api, view, clipRoot, pointOf, pointsOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    fireEvent.doubleClick(pointOf('s1', 1), { clientX: 320, clientY: 60 });
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:1.0000;14.000:1.0000');
    expect(pointsOf('s1')).toHaveLength(2);
    expect(live(api).undoLabel).toBe(REMOVE_LABEL);
    expect(statusText(view)).toBe('Envelope: წერტილი წაიშალა — 10.000 წმ.');
    pressUndo();
    expect(clipRoot('s1').dataset.envelope).toBe(V_DATA);
    expect(undoAll(api)).toBe(0);
  });

  it('EU4 a double-click within 500 ms after a moved drag of that point is ignored', async () => {
    const { api, clipRoot, pointOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    dragPoint(pointOf('s1', 1), [{ dx: 40 }]);
    const moved = '6.000:1.0000;11.000:0.2512;14.000:1.0000';
    expect(clipRoot('s1').dataset.envelope).toBe(moved);
    performanceNow += 300;
    fireEvent.doubleClick(pointOf('s1', 1));
    expect(clipRoot('s1').dataset.envelope).toBe(moved);
    expect(live(api).undoLabel).toBe(MOVE_LABEL);
    performanceNow += 300;
    fireEvent.doubleClick(pointOf('s1', 1));
    expect(clipRoot('s1').dataset.envelope).toBe('6.000:1.0000;14.000:1.0000');
    expect(live(api).undoLabel).toBe(REMOVE_LABEL);
  });
});

describe('SRW-18 stage 2 neighbours (EU5)', () => {
  it('EU5 in mode an editor press selects without seeking or a range; header move and trim still work', async () => {
    const { api, clipRoot, editorOf, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    fireEvent.click(toggle());
    const editor = editorOf('s1');
    fireEvent.pointerDown(editor, { ...press, pointerId: 1, clientX: 200, clientY: STEMS_LANE_Y });
    fireEvent.pointerMove(clipRoot('s1'), { pointerId: 1, clientX: 300, clientY: STEMS_LANE_Y });
    fireEvent.pointerUp(clipRoot('s1'), { pointerId: 1, clientX: 300, clientY: STEMS_LANE_Y });
    expect(positionOf(api)).toBe(0);
    expect(live(api).range).toBeNull();
    expect(live(api).selectedClipId).toBe('s1');
    expect(live(api).undoLabel).toBeNull();
    const header = clipRoot('s1').firstElementChild;
    if (!(header instanceof HTMLElement)) {
      throw new Error('header missing');
    }
    fireEvent.pointerDown(header, { ...press, pointerId: 2, clientX: 100, clientY: STEMS_LANE_Y });
    fireEvent.pointerMove(clipRoot('s1'), { pointerId: 2, clientX: 140, clientY: STEMS_LANE_Y });
    fireEvent.pointerUp(clipRoot('s1'), { pointerId: 2, clientX: 140, clientY: STEMS_LANE_Y });
    expect(clipRoot('s1').dataset.clipStart).toBe('3.000');
    expect(clipRoot('s1').dataset.envelope).toBe('7.000:1.0000;11.000:0.2512;15.000:1.0000');
    expect(live(api).undoLabel).toBe('კლიპის გადატანა');
    const trim = clipRoot('s1').querySelector<HTMLElement>('[title="Trim — მარცხენა კიდე"]');
    if (!trim) {
      throw new Error('trim strip missing');
    }
    fireEvent.pointerDown(trim, { ...press, pointerId: 3, clientX: 0, clientY: STEMS_LANE_Y });
    fireEvent.pointerMove(clipRoot('s1'), { pointerId: 3, clientX: 240, clientY: STEMS_LANE_Y });
    fireEvent.pointerUp(clipRoot('s1'), { pointerId: 3, clientX: 240, clientY: STEMS_LANE_Y });
    expect(clipRoot('s1').dataset.clipStart).toBe('9.000');
    expect(clipRoot('s1').dataset.envelope).toBe('11.000:0.2512;15.000:1.0000');
    expect(live(api).undoLabel).toBe('Trim — მარცხენა კიდე');
  });

  it('EU5 mode off: the body still seeks on click, the line is drawn and there are no points', async () => {
    const { api, clipRoot } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
    ]);
    const body = clipRoot('s1').querySelector<HTMLElement>(
      `[data-testid="${LINE}"]`,
    )?.parentElement;
    if (!body) {
      throw new Error('clip body missing');
    }
    fireEvent.pointerDown(body, { ...press, pointerId: 1, clientX: 160, clientY: STEMS_LANE_Y });
    fireEvent.pointerUp(clipRoot('s1'), { pointerId: 1, clientX: 160, clientY: STEMS_LANE_Y });
    expect(positionOf(api)).toBe(6);
    expect(clipRoot('s1').querySelector(`[data-testid="${POINT}"]`)).toBeNull();
    fireEvent.pointerDown(body, { ...press, pointerId: 2, clientX: 160, clientY: STEMS_LANE_Y });
    fireEvent.pointerMove(clipRoot('s1'), { pointerId: 2, clientX: 240, clientY: STEMS_LANE_Y });
    fireEvent.pointerUp(clipRoot('s1'), { pointerId: 2, clientX: 240, clientY: STEMS_LANE_Y });
    expect(live(api).range).toStrictEqual({ start: 6, end: 8, trackId: 'stems' });
    expect(live(api).undoLabel).toBeNull();
  });

  it('EU5 the line passes through every visible point at y = 1 − gain', async () => {
    const { clipRoot, toggle } = await mountEnvelopeWorkspace([
      clipAt('s1', 'stems', 2, 16, { envelope: V_ENVELOPE }),
      clipAt('m1', 'music', 0, 1),
    ]);
    const line = clipRoot('s1').querySelector(`[data-testid="${LINE}"] polyline`);
    expect(line?.getAttribute('points')).toBe('0,0 160,0 320,0.7488 480,0 640,0');
    expect(clipRoot('m1').querySelector(`[data-testid="${LINE}"]`)).toBeNull();
    fireEvent.click(toggle());
    expect(
      clipRoot('m1').querySelector(`[data-testid="${LINE}"] polyline`)?.getAttribute('points'),
    ).toBe('0,0 40,0');
  });
});

describe('SRW-18 stage 2 X1 fade double-click guard (EU6)', () => {
  it('EU6 a double-click right after a fade drag keeps the fade; after 600 ms it resets it', async () => {
    const { api, clipRoot, view } = await mountEnvelopeWorkspace([clipAt('m1', 'music', 0, 10)]);
    const root = clipRoot('m1');
    const handle = root.querySelector<HTMLElement>(`[data-testid="${FADE_IN_HANDLE}"]`);
    if (!handle) {
      throw new Error('fade handle missing');
    }
    stubCapture(handle);
    fireEvent.pointerDown(handle, { ...press, pointerId: 1, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 140, clientY: 150 });
    fireEvent.pointerUp(root, { pointerId: 1, clientX: 140, clientY: 150 });
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    performanceNow += 200;
    fireEvent.doubleClick(handle);
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    expect(live(api).undoLabel).toBe('Fade In');
    expect(statusText(view)).toBe('Fade In: 1.000 წმ.');
    performanceNow += 400;
    fireEvent.doubleClick(handle);
    expect(clipRoot('m1').dataset.fadeIn).toBe('0.000');
    expect(statusText(view)).toBe('Fade In: 0.000 წმ.');
    expect(undoAll(api)).toBe(2);
  });

  it('EU6 a cancelled drag also arms the guard, and the guard is per edge', async () => {
    const { api, clipRoot } = await mountEnvelopeWorkspace([
      clipAt('m1', 'music', 0, 10, { fadeIn: 1, fadeOut: 2 }),
    ]);
    const root = clipRoot('m1');
    const fadeIn = root.querySelector<HTMLElement>(`[data-testid="${FADE_IN_HANDLE}"]`);
    const fadeOut = root.querySelector<HTMLElement>(
      '[data-testid="arrangement-clip-fade-out-handle"]',
    );
    if (!fadeIn || !fadeOut) {
      throw new Error('fade handles missing');
    }
    stubCapture(fadeIn);
    fireEvent.pointerDown(fadeIn, { ...press, pointerId: 1, clientX: 100, clientY: 150 });
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 140, clientY: 150 });
    fireEvent.pointerCancel(root, { pointerId: 1, clientX: 140, clientY: 150 });
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    expect(live(api).undoLabel).toBeNull();
    performanceNow += 200;
    fireEvent.doubleClick(fadeIn);
    expect(clipRoot('m1').dataset.fadeIn).toBe('1.000');
    fireEvent.doubleClick(fadeOut);
    expect(clipRoot('m1').dataset.fadeOut).toBe('0.000');
    performanceNow += 400;
    fireEvent.doubleClick(fadeIn);
    expect(clipRoot('m1').dataset.fadeIn).toBe('0.000');
  });
});
