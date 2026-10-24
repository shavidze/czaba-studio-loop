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
import { resolveGridTime } from '../grid';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { studioEditStrings } from '../strings';

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
const HEADER_WIDTH_PX = 224;
const RULER_Y = 10;
const MUSIC_LANE_Y = 150;
const STEMS_LANE_Y = 250;
const SFX_LANE_Y = 350;

const positionCollection: WorkspaceCollection = {
  id: 'position',
  label: 'position',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'position', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'position', kind: 'sfx', origin: 'demo' },
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

function positionArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface PositionApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function PositionProbe({ api }: { api: PositionApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: PositionApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: PositionApiRef): number {
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

async function mountPositionWorkspace(clips: ArrangementClip[]) {
  const api: PositionApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider
      collection={positionCollection}
      initialArrangement={positionArrangement(clips)}
    >
      <StudioWorkspace />
      <PositionProbe api={api} />
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
  const ruler = view.getByTestId('arrangement-ruler');
  const handle = view.getByTestId('arrangement-playhead-handle');
  stubCapture(ruler);
  stubCapture(handle);
  const laneBody = (trackId: string) => {
    const body = view.container.querySelector<HTMLElement>(
      `[data-track-id="${trackId}"] [data-grid-seconds]`,
    );
    if (!body) {
      throw new Error(`lane ${trackId} not rendered`);
    }
    return body;
  };
  const clipParts = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const header = root?.firstElementChild;
    const body = root?.querySelector<HTMLElement>('[title^="drag = დროის მონიშვნა"]');
    if (!root || !(header instanceof HTMLElement) || !body) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header, body };
  };
  return { api, view, ruler, handle, laneBody, clipParts };
}

function snapState(view: ReturnType<typeof render>): string | undefined {
  return view.getByTestId('arrangement-grid-control').dataset.snap;
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function chooseDivision(view: ReturnType<typeof render>, value: string) {
  fireEvent.change(view.getByTestId('arrangement-grid-division'), { target: { value } });
}

function pressG() {
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
}

function pressCtrl(key: string) {
  fireEvent.keyDown(document.body, { key, code: `Key${key.toUpperCase()}`, ctrlKey: true });
}

const press = { button: 0, buttons: 1 };

function xFor(time: number): number {
  return Math.round(time * PX_PER_SECOND);
}

function clickRuler(ruler: HTMLElement, x: number, options: { altUp?: boolean } = {}) {
  fireEvent.pointerDown(ruler, { ...press, pointerId: 1, clientX: x, clientY: RULER_Y });
  fireEvent.pointerUp(ruler, {
    pointerId: 1,
    clientX: x,
    clientY: RULER_Y,
    altKey: options.altUp ?? false,
  });
}

function handleValue(handle: HTMLElement): number {
  return Number(handle.getAttribute('aria-valuenow'));
}

function clickLane(lane: HTMLElement, x: number, y: number, options: { altUp?: boolean } = {}) {
  fireEvent.pointerDown(lane, { ...press, pointerId: 1, clientX: x, clientY: y });
  fireEvent.pointerUp(window, {
    pointerId: 1,
    clientX: x,
    clientY: y,
    altKey: options.altUp ?? false,
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

describe('SRW-14 stage 3a resolveGridTime', () => {
  it('SP1 resolves a time on the grid from Snap state, division and Alt', () => {
    expect(resolveGridTime(7.3, 1, 1, false)).toBe(7);
    expect(resolveGridTime(7.3, 1, 1, true)).toBe(7.3);
    expect(resolveGridTime(7.3, null, 1, false)).toBe(7.3);
    expect(resolveGridTime(7.3, null, 0.25, true)).toBe(7.25);
    expect(resolveGridTime(7.3, null, undefined, true)).toBe(7.3);
    expect(resolveGridTime(7.3456, null, 1, false)).toBe(7.3456);
  });
});

describe('SRW-14 stage 3a ruler click on the grid', () => {
  it('SP2 Snap off keeps a free ruler click', async () => {
    const { api, view, ruler } = await mountPositionWorkspace([]);
    expect(view.getByTestId('arrangement-zoom-readout').textContent).toBe('40 px/წმ');
    clickRuler(ruler, xFor(7.3));
    expect(positionOf(api)).toBeCloseTo(7.3, 9);
  });

  it('SP3 Snap on 1 s puts a ruler click on the nearest line', async () => {
    const { api, ruler, handle } = await mountPositionWorkspace([]);
    pressG();
    clickRuler(ruler, xFor(7.3));
    expect(positionOf(api)).toBe(7);
    expect(handle.getAttribute('aria-valuetext')).toBe('00:07.000');
    clickRuler(ruler, xFor(7.6));
    expect(positionOf(api)).toBe(8);
  });

  it('SP4 Alt on the pointerup bypasses Snap on a ruler click', async () => {
    const { api, view, ruler } = await mountPositionWorkspace([]);
    pressG();
    clickRuler(ruler, xFor(7.3), { altUp: true });
    expect(positionOf(api)).toBeCloseTo(7.3, 9);
    expect(snapState(view)).toBe('on');
  });

  it('SP5 Alt with Snap off uses the chosen division for a ruler click', async () => {
    const { api, view, ruler } = await mountPositionWorkspace([]);
    clickRuler(ruler, xFor(7.3), { altUp: true });
    expect(positionOf(api)).toBe(7);
    expect(snapState(view)).toBe('off');
    chooseDivision(view, '0.25');
    clickRuler(ruler, xFor(7.3), { altUp: true });
    expect(positionOf(api)).toBe(7.25);
    expect(snapState(view)).toBe('off');
  });

  it('SP6 a ruler drag navigates and does not seek', async () => {
    const { api, view, ruler } = await mountPositionWorkspace([]);
    pressG();
    const x = xFor(7.3);
    fireEvent.pointerDown(ruler, { ...press, pointerId: 1, clientX: x, clientY: RULER_Y });
    fireEvent.pointerMove(ruler, { pointerId: 1, clientX: x, clientY: RULER_Y + 60 });
    fireEvent.pointerUp(ruler, { pointerId: 1, clientX: x, clientY: RULER_Y + 60 });
    expect(view.getByTestId('arrangement-zoom-readout').textContent).not.toBe('40 px/წმ');
    expect(positionOf(api)).toBe(0);
  });

  it('SP15 Snap on 10 s puts a click at 4.9 on line 0', async () => {
    const { api, view, ruler } = await mountPositionWorkspace([]);
    clickRuler(ruler, xFor(10));
    expect(positionOf(api)).toBeCloseTo(10, 9);
    chooseDivision(view, '10');
    pressG();
    clickRuler(ruler, xFor(4.9));
    expect(positionOf(api)).toBe(0);
  });
});

describe('SRW-14 stage 3a playhead handle on the grid', () => {
  it('SP7 Snap on 1 s snaps every drag sample and the release', async () => {
    const { api, handle } = await mountPositionWorkspace([]);
    pressG();
    fireEvent.pointerDown(handle, { ...press, pointerId: 1, clientX: 0, clientY: RULER_Y });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: xFor(5.4), clientY: RULER_Y });
    expect(handleValue(handle)).toBe(5);
    expect(positionOf(api)).toBe(5);
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: xFor(5.6), clientY: RULER_Y });
    expect(positionOf(api)).toBe(6);
    expect(handleValue(handle)).toBe(6);
  });

  it('SP8 Alt held through a playhead drag keeps free values with Snap on', async () => {
    const { api, handle } = await mountPositionWorkspace([]);
    pressG();
    fireEvent.pointerDown(handle, { ...press, pointerId: 1, clientX: 0, clientY: RULER_Y });
    fireEvent.pointerMove(handle, {
      pointerId: 1,
      clientX: xFor(5.4),
      clientY: RULER_Y,
      altKey: true,
    });
    expect(handleValue(handle)).toBe(5.4);
    fireEvent.pointerUp(handle, {
      pointerId: 1,
      clientX: xFor(5.4),
      clientY: RULER_Y,
      altKey: true,
    });
    expect(positionOf(api)).toBeCloseTo(5.4, 9);
  });

  it('SP9 Snap off keeps a free playhead drag', async () => {
    const { api, handle } = await mountPositionWorkspace([]);
    fireEvent.pointerDown(handle, { ...press, pointerId: 1, clientX: 0, clientY: RULER_Y });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: xFor(5.4), clientY: RULER_Y });
    expect(handleValue(handle)).toBe(5.4);
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: xFor(5.4), clientY: RULER_Y });
    expect(positionOf(api)).toBeCloseTo(5.4, 9);
  });

  it('SP10 playhead arrow keys keep the 0.1 s step with Snap on', async () => {
    const { api, ruler, handle } = await mountPositionWorkspace([]);
    pressG();
    clickRuler(ruler, xFor(7));
    expect(positionOf(api)).toBe(7);
    act(() => handle.focus());
    fireEvent.keyDown(handle, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(positionOf(api)).toBe(7.1);
  });

  it('SP17 a cancelled playhead drag keeps the last snapped sample', async () => {
    const { api, handle } = await mountPositionWorkspace([]);
    pressG();
    fireEvent.pointerDown(handle, { ...press, pointerId: 1, clientX: 0, clientY: RULER_Y });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: xFor(5.4), clientY: RULER_Y });
    fireEvent.pointerCancel(handle, { pointerId: 1, clientX: xFor(5.6), clientY: RULER_Y });
    expect(positionOf(api)).toBe(5);
    expect(handleValue(handle)).toBe(5);
  });
});

describe('SRW-14 stage 3a empty-lane click on the grid', () => {
  it('SP11 Snap on 1 s puts an empty-lane click on the nearest line', async () => {
    const { api, laneBody } = await mountPositionWorkspace([clipAt('m1', 'music', 7, 16)]);
    act(() => live(api).selectClip('m1'));
    expect(live(api).selectedClipIds).toEqual(['m1']);
    pressG();
    clickLane(laneBody('stems'), xFor(4.6), STEMS_LANE_Y);
    expect(positionOf(api)).toBe(5);
    expect(live(api).activeTrackId).toBe('stems');
    expect(live(api).selectedClipIds).toEqual([]);
    expect(live(api).range).toBeNull();
  });

  it('SP12 Alt on the pointerup of an empty-lane click keeps the free time', async () => {
    const { api, laneBody } = await mountPositionWorkspace([]);
    pressG();
    clickLane(laneBody('stems'), xFor(4.6), STEMS_LANE_Y, { altUp: true });
    expect(positionOf(api)).toBeCloseTo(4.6, 9);
  });

  it('SP13 a marquee drag from an empty lane selects and does not seek', async () => {
    const { api, laneBody } = await mountPositionWorkspace([clipAt('m1', 'music', 7, 16)]);
    pressG();
    const startX = HEADER_WIDTH_PX + xFor(6);
    const endX = HEADER_WIDTH_PX + xFor(10);
    fireEvent.pointerDown(laneBody('stems'), {
      ...press,
      pointerId: 1,
      clientX: startX,
      clientY: STEMS_LANE_Y,
    });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: endX, clientY: MUSIC_LANE_Y });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: endX, clientY: MUSIC_LANE_Y });
    expect(live(api).selectedClipIds).toEqual(['m1']);
    expect(positionOf(api)).toBe(0);
  });
});

describe('SRW-14 stage 3a paste and clip-body click follow the position', () => {
  it('SP14 paste after a snapped ruler click lands on the grid; Alt keeps it free', async () => {
    const { api, view, ruler, clipParts } = await mountPositionWorkspace([
      clipAt('s1', 'sfx', 4, 2),
    ]);
    const parts = clipParts('s1');
    fireEvent.pointerDown(parts.header, {
      ...press,
      pointerId: 1,
      clientX: 20,
      clientY: SFX_LANE_Y,
    });
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: 20, clientY: SFX_LANE_Y });
    expect(live(api).selectedClipIds).toEqual(['s1']);
    expect(live(api).activeTrackId).toBe('sfx');
    pressCtrl('c');
    pressG();
    clickRuler(ruler, xFor(9.3));
    pressCtrl('v');
    const pasted = live(api).arrangement.clips.filter((clip) => clip.id !== 's1');
    expect(pasted).toHaveLength(1);
    expect(pasted[0]?.trackId).toBe('sfx');
    expect(pasted[0]?.start).toBe(9);
    expect(statusText(view)).toBe(
      studioEditStrings.pasteDone({
        count: 1,
        at: '00:09.000',
        trackSuffix: studioEditStrings.pasteTrackSuffix('SFX'),
      }),
    );
    expect(live(api).undoLabel).toBe(studioEditStrings.historyPaste(1));
    pressCtrl('z');
    expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(['s1']);
    clickRuler(ruler, xFor(9.3), { altUp: true });
    pressCtrl('v');
    const free = live(api).arrangement.clips.filter((clip) => clip.id !== 's1');
    expect(free).toHaveLength(1);
    expect(free[0]?.start).toBeCloseTo(9.3, 9);
  });

  it('SP16 a snapped clip-body click is not clamped to the clip', async () => {
    const { api, clipParts } = await mountPositionWorkspace([clipAt('m1', 'music', 7.2, 1.8)]);
    pressG();
    const parts = clipParts('m1');
    const x = xFor(0.1);
    fireEvent.pointerDown(parts.body, {
      ...press,
      pointerId: 1,
      clientX: x,
      clientY: MUSIC_LANE_Y,
    });
    fireEvent.pointerUp(parts.root, { pointerId: 1, clientX: x, clientY: MUSIC_LANE_Y });
    expect(live(api).range).toBeNull();
    expect(positionOf(api)).toBe(7);
  });
});
