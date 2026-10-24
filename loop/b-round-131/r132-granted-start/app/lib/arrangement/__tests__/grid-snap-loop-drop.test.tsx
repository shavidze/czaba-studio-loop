import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementLoop,
  WorkspaceCollection,
  WorkspaceSource,
} from '~/types/arrangement';
import { LIBRARY_DRAG_MIME } from '../library';
import { createArrangement } from '../model';
import { studioLibraryStrings, studioLoopStrings } from '../strings';

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
const BRACE_X = 500;
const LOOP_FIXTURE: ArrangementLoop = { start: 12.3, end: 14.1, enabled: true };
const DROP_BLOCKED_STATUS = studioLibraryStrings.dropBlocked;
const LOOP_BLOCKED_STATUS = studioLoopStrings.stepBlocked;

const loopDropCollection: WorkspaceCollection = {
  id: 'loop-drop',
  label: 'loop-drop',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'loop-drop', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'loop-drop', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: source.id === 'hit' ? 200 : 4000,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
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

function loopDropArrangement(clips: ArrangementClip[], loop: ArrangementLoop | null): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'stems', kind: 'audio', name: 'სტემები' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips, loop };
}

interface LoopDropApiRef {
  current: ArrangementContextValue | null;
}

function LoopDropProbe({ api }: { api: LoopDropApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: LoopDropApiRef): ArrangementContextValue {
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

async function mountLoopDropWorkspace(
  clips: ArrangementClip[],
  loop: ArrangementLoop | null = LOOP_FIXTURE,
) {
  const api: LoopDropApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={loopDropCollection}
      initialArrangement={loopDropArrangement(clips, loop)}
    >
      <StudioWorkspace />
      <LoopDropProbe api={api} />
    </ArrangementProvider>,
  );
  for (
    let tick = 0;
    tick < 10 &&
    (live(api).sourceDurations.get('song') === undefined ||
      live(api).sourceDurations.get('hit') === undefined);
    tick++
  ) {
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
  const laneBody = (trackId: string) => {
    const body = view.container.querySelector<HTMLElement>(
      `[data-track-id="${trackId}"] [data-grid-seconds]`,
    );
    if (!body) {
      throw new Error(`lane ${trackId} not rendered`);
    }
    return body;
  };
  const brace = () => {
    const element = view.getByTestId('arrangement-loop-brace');
    stubCapture(element);
    return element;
  };
  return { api, view, laneBody, brace };
}

function snapState(view: ReturnType<typeof render>): string | undefined {
  return view.getByTestId('arrangement-grid-control').dataset.snap;
}

function statusText(view: ReturnType<typeof render>): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function undoTitle(view: ReturnType<typeof render>): string | null {
  const button = view.container.querySelector<HTMLButtonElement>('button[title^="Undo"]');
  if (!button) {
    throw new Error('undo button not rendered');
  }
  return button.getAttribute('title');
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

function xFor(time: number): number {
  return Math.round(time * PX_PER_SECOND);
}

function libraryTransfer() {
  return { types: [LIBRARY_DRAG_MIME], files: [], dropEffect: 'none' };
}

function dragLibraryOver(lane: HTMLElement, time: number, altKey = false) {
  fireEvent.dragOver(lane, { clientX: xFor(time), altKey, dataTransfer: libraryTransfer() });
}

function dropLibrary(lane: HTMLElement, time: number, altKey = false) {
  fireEvent.drop(lane, { clientX: xFor(time), altKey, dataTransfer: libraryTransfer() });
}

function dropGhost(view: ReturnType<typeof render>) {
  const ghost = view.getByTestId('arrangement-drop-ghost');
  return {
    text: ghost.textContent,
    left: ghost.style.left,
    blocked: ghost.dataset.blocked,
  };
}

function addedClips(api: LoopDropApiRef, existing: string[]): ArrangementClip[] {
  return live(api).arrangement.clips.filter((clip) => !existing.includes(clip.id));
}

function braceSpan(element: HTMLElement): string {
  const label = element.getAttribute('aria-label') ?? '';
  return label.slice(0, label.indexOf(' · '));
}

function loopOf(api: LoopDropApiRef): ArrangementLoop {
  const loop = live(api).arrangement.loop;
  if (!loop) {
    throw new Error('loop missing');
  }
  return loop;
}

const press = { button: 0, buttons: 1 };

function dragBrace(element: HTMLElement, dx: number, options: { altKey?: boolean } = {}) {
  fireEvent.pointerDown(element, { ...press, pointerId: 1, clientX: BRACE_X, clientY: 30 });
  fireEvent.pointerMove(element, {
    pointerId: 1,
    clientX: BRACE_X + dx,
    clientY: 30,
    altKey: options.altKey ?? false,
  });
  return () =>
    fireEvent.pointerUp(element, {
      pointerId: 1,
      clientX: BRACE_X + dx,
      clientY: 30,
      altKey: options.altKey ?? false,
    });
}

function dragBraceEdge(
  view: ReturnType<typeof render>,
  element: HTMLElement,
  edge: 'start' | 'end',
  dx: number,
) {
  fireEvent.pointerDown(view.getByTestId(`arrangement-loop-${edge}-edge`), {
    ...press,
    pointerId: 1,
    clientX: BRACE_X,
    clientY: 30,
  });
  fireEvent.pointerMove(element, { pointerId: 1, clientX: BRACE_X + dx, clientY: 30 });
  fireEvent.pointerUp(element, { pointerId: 1, clientX: BRACE_X + dx, clientY: 30 });
}

function pressBraceKey(element: HTMLElement, key: 'ArrowLeft' | 'ArrowRight', shiftKey = false) {
  fireEvent.keyDown(element, { key, code: key, shiftKey });
}

const DROP_FIXTURE = [clipAt('m1', 'music', 7, 16), clipAt('s1', 'sfx', 4, 2)];
const DROP_FIXTURE_IDS = ['m1', 's1'];
const DROP_EDGE_FIXTURE = [clipAt('m1', 'music', 7.3, 16), clipAt('s1', 'sfx', 4, 2.4)];

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('DragEvent', class TestDragEvent extends MouseEvent {});
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

describe('SRW-14 stage 3b library drop on the grid', { timeout: 15_000 }, () => {
  it('SD1 Snap off keeps a free drop and its ghost', async () => {
    const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_FIXTURE);
    expect(view.getByTestId('arrangement-zoom-readout').textContent).toBe('40 px/წმ');
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('sfx'), 9.4);
    expect(dropGhost(view)).toEqual({ text: '00:09.400', left: '376px', blocked: 'false' });
    dropLibrary(laneBody('sfx'), 9.4);
    const added = addedClips(api, DROP_FIXTURE_IDS);
    expect(added).toHaveLength(1);
    expect(added[0]?.trackId).toBe('sfx');
    expect(added[0]?.start).toBeCloseTo(9.4, 9);
    expect(statusText(view)).toBe(
      studioLibraryStrings.clipAdded({ title: 'Hit', track: 'SFX', time: '00:09.400', suffix: '' }),
    );
  });

  it('SD2 Snap on 1 s puts the ghost and the drop on the nearest line', async () => {
    const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_FIXTURE);
    pressG();
    expect(snapState(view)).toBe('on');
    expect(undoTitle(view)).toBe('Undo');
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('sfx'), 9.4);
    expect(dropGhost(view)).toEqual({ text: '00:09.000', left: '360px', blocked: 'false' });
    dropLibrary(laneBody('sfx'), 9.4);
    const added = addedClips(api, DROP_FIXTURE_IDS);
    expect(added).toHaveLength(1);
    expect(added[0]?.start).toBe(9);
    expect(view.container.querySelector(`[data-clip-id="${added[0]?.id}"]`)).not.toBeNull();
    expect(statusText(view)).toBe(
      studioLibraryStrings.clipAdded({ title: 'Hit', track: 'SFX', time: '00:09.000', suffix: '' }),
    );
    expect(undoTitle(view)).toBe(`Undo: ${studioLibraryStrings.historyAdd('Hit')}`);
    pressCtrl('z');
    expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(DROP_FIXTURE_IDS);
    expect(undoTitle(view)).toBe('Undo');
  });

  it('SD3 Alt bypasses Snap for the ghost and the drop', async () => {
    const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_FIXTURE);
    pressG();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('sfx'), 9.4, true);
    expect(dropGhost(view)).toEqual({ text: '00:09.400', left: '376px', blocked: 'false' });
    dropLibrary(laneBody('sfx'), 9.4, true);
    const added = addedClips(api, DROP_FIXTURE_IDS);
    expect(added).toHaveLength(1);
    expect(added[0]?.start).toBeCloseTo(9.4, 9);
    expect(snapState(view)).toBe('on');
  });

  it('SD4 Alt with Snap off uses the chosen division for the ghost and the drop', async () => {
    const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_FIXTURE);
    chooseDivision(view, '0.25');
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('sfx'), 9.4, true);
    expect(dropGhost(view)).toEqual({ text: '00:09.500', left: '380px', blocked: 'false' });
    dropLibrary(laneBody('sfx'), 9.4, true);
    const added = addedClips(api, DROP_FIXTURE_IDS);
    expect(added).toHaveLength(1);
    expect(added[0]?.start).toBe(9.5);
    expect(snapState(view)).toBe('off');
  });

  it('SD5 the drop event decides Alt, not the last dragover', async () => {
    const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_FIXTURE);
    pressG();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('sfx'), 9.4, true);
    expect(dropGhost(view).text).toBe('00:09.400');
    dropLibrary(laneBody('sfx'), 9.4, false);
    const added = addedClips(api, DROP_FIXTURE_IDS);
    expect(added).toHaveLength(1);
    expect(added[0]?.start).toBe(9);
  });

  it('SD6 a snapped start that overlaps a clip is refused; Alt drops at the free time', async () => {
    const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_FIXTURE);
    chooseDivision(view, '5');
    pressG();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('sfx'), 4.6);
    expect(dropGhost(view)).toEqual({
      text: '00:05.000 · აქ ადგილი არ არის',
      left: '200px',
      blocked: 'true',
    });
    dropLibrary(laneBody('sfx'), 4.6);
    expect(statusText(view)).toBe(DROP_BLOCKED_STATUS);
    expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(DROP_FIXTURE_IDS);
    expect(undoTitle(view)).toBe('Undo');
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('sfx'), 6.2, true);
    expect(dropGhost(view)).toEqual({ text: '00:06.200', left: '248px', blocked: 'false' });
    dropLibrary(laneBody('sfx'), 6.2, true);
    const added = addedClips(api, DROP_FIXTURE_IDS);
    expect(added).toHaveLength(1);
    expect(added[0]?.start).toBeCloseTo(6.2, 9);
    expect(undoTitle(view)).toBe(`Undo: ${studioLibraryStrings.historyAdd('Hit')}`);
  });

  it('SD7 the video-lane refusal ghost shows the snapped time and nothing is added', async () => {
    const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_FIXTURE);
    pressG();
    act(() => live(api).beginLibraryDrag('hit'));
    dragLibraryOver(laneBody('video'), 9.4);
    expect(dropGhost(view)).toEqual({
      text: '00:09.000 · აუდიო ვიდეოხაზზე არ ემატება',
      left: '360px',
      blocked: 'true',
    });
    dropLibrary(laneBody('video'), 9.4);
    expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(DROP_FIXTURE_IDS);
    expect(undoTitle(view)).toBe('Undo');
  });
});

describe(
  'SRW-14 stage 4c-2 library drop snaps to clip edges (D-29z29)',
  { timeout: 15_000 },
  () => {
    it('DE1 a lane clip end captures the drop start', async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      pressG();
      act(() => live(api).beginLibraryDrag('hit'));
      dragLibraryOver(laneBody('sfx'), 6.55);
      expect(dropGhost(view)).toEqual({ text: '00:06.400', left: '256px', blocked: 'false' });
      dropLibrary(laneBody('sfx'), 6.55);
      const added = addedClips(api, DROP_FIXTURE_IDS);
      expect(added).toHaveLength(1);
      expect(added[0]?.trackId).toBe('sfx');
      expect(added[0]?.start).toBeCloseTo(6.4, 9);
      expect(statusText(view)).toBe(
        studioLibraryStrings.clipAdded({
          title: 'Hit',
          track: 'SFX',
          time: '00:06.400',
          suffix: '',
        }),
      );
      expect(undoTitle(view)).toBe(`Undo: ${studioLibraryStrings.historyAdd('Hit')}`);
      pressCtrl('z');
      expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(DROP_FIXTURE_IDS);
    });

    it('DE2 a lane clip start captures the drop end', async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      pressG();
      act(() => live(api).beginLibraryDrag('hit'));
      dragLibraryOver(laneBody('music'), 5.25);
      expect(dropGhost(view)).toEqual({ text: '00:05.300', left: '212px', blocked: 'false' });
      dropLibrary(laneBody('music'), 5.25);
      const added = addedClips(api, DROP_FIXTURE_IDS);
      expect(added).toHaveLength(1);
      expect(added[0]?.trackId).toBe('music');
      expect(added[0]?.start).toBeCloseTo(5.3, 9);
      expect(statusText(view)).toBe(
        studioLibraryStrings.clipAdded({
          title: 'Hit',
          track: 'მუსიკა',
          time: '00:05.300',
          suffix: '',
        }),
      );
    });

    it("DE3 another lane's clip end captures the drop end", async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      pressG();
      act(() => live(api).beginLibraryDrag('hit'));
      dragLibraryOver(laneBody('stems'), 4.5);
      expect(dropGhost(view)).toEqual({ text: '00:04.400', left: '176px', blocked: 'false' });
      dropLibrary(laneBody('stems'), 4.5);
      const added = addedClips(api, DROP_FIXTURE_IDS);
      expect(added).toHaveLength(1);
      expect(added[0]?.trackId).toBe('stems');
      expect(added[0]?.start).toBeCloseTo(4.4, 9);
      expect(statusText(view)).toBe(
        studioLibraryStrings.clipAdded({
          title: 'Hit',
          track: 'სტემები',
          time: '00:04.400',
          suffix: '',
        }),
      );
    });

    it('DE4 a lane clip end is not an end target on its own lane', async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      pressG();
      act(() => live(api).beginLibraryDrag('hit'));
      dragLibraryOver(laneBody('sfx'), 4.5);
      expect(dropGhost(view)).toEqual({
        text: '00:05.000 · აქ ადგილი არ არის',
        left: '200px',
        blocked: 'true',
      });
      dropLibrary(laneBody('sfx'), 4.5);
      expect(addedClips(api, DROP_FIXTURE_IDS)).toHaveLength(0);
      expect(statusText(view)).toBe(DROP_BLOCKED_STATUS);
      expect(undoTitle(view)).toBe('Undo');
    });

    it('DE5 a source that is not ready snaps to the grid only', async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      pressG();
      act(() => live(api).beginLibraryDrag('missing'));
      dragLibraryOver(laneBody('sfx'), 6.55);
      expect(dropGhost(view)).toEqual({
        text: '00:07.000 · ხმა ჯერ არ ჩატვირთულა',
        left: '280px',
        blocked: 'true',
      });
      dropLibrary(laneBody('sfx'), 6.55);
      expect(addedClips(api, DROP_FIXTURE_IDS)).toHaveLength(0);
      expect(statusText(view)).toBe(studioLibraryStrings.dropNotLoaded);
    });

    it('DE6 Alt with Snap off enables edges for the drop', async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      expect(snapState(view)).toBe('off');
      act(() => live(api).beginLibraryDrag('hit'));
      dragLibraryOver(laneBody('sfx'), 6.55, true);
      expect(dropGhost(view)).toEqual({ text: '00:06.400', left: '256px', blocked: 'false' });
      dropLibrary(laneBody('sfx'), 6.55, true);
      const added = addedClips(api, DROP_FIXTURE_IDS);
      expect(added).toHaveLength(1);
      expect(added[0]?.start).toBeCloseTo(6.4, 9);
      expect(snapState(view)).toBe('off');
    });

    it('DE7 Alt with Snap on bypasses edges', async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      pressG();
      act(() => live(api).beginLibraryDrag('hit'));
      dragLibraryOver(laneBody('sfx'), 6.55, true);
      expect(dropGhost(view).text).toBe('00:06.550');
      expect(dropGhost(view).blocked).toBe('false');
      dropLibrary(laneBody('sfx'), 6.55, true);
      const added = addedClips(api, DROP_FIXTURE_IDS);
      expect(added).toHaveLength(1);
      expect(added[0]?.start).toBeCloseTo(6.55, 9);
      expect(snapState(view)).toBe('on');
    });

    it('DE8 Snap off without Alt stays free near an edge', async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      act(() => live(api).beginLibraryDrag('hit'));
      dragLibraryOver(laneBody('sfx'), 6.55);
      expect(dropGhost(view).text).toBe('00:06.550');
      dropLibrary(laneBody('sfx'), 6.55);
      const added = addedClips(api, DROP_FIXTURE_IDS);
      expect(added).toHaveLength(1);
      expect(added[0]?.start).toBeCloseTo(6.55, 9);
    });

    it('DE9 the video lane stays grid-only', async () => {
      const { api, view, laneBody } = await mountLoopDropWorkspace(DROP_EDGE_FIXTURE);
      pressG();
      act(() => live(api).beginLibraryDrag('hit'));
      dragLibraryOver(laneBody('video'), 6.55);
      expect(dropGhost(view)).toEqual({
        text: '00:07.000 · აუდიო ვიდეოხაზზე არ ემატება',
        left: '280px',
        blocked: 'true',
      });
      dropLibrary(laneBody('video'), 6.55);
      expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(DROP_FIXTURE_IDS);
      expect(undoTitle(view)).toBe('Undo');
    });
  },
);

describe('SRW-14 stage 3b loop brace drag on the grid', { timeout: 15_000 }, () => {
  it('SL1 Snap off keeps a free brace move', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    const element = brace();
    expect(braceSpan(element)).toBe('Loop 00:12.300 — 00:14.100');
    const release = dragBrace(element, 10);
    expect(braceSpan(element)).toBe('Loop 00:12.550 — 00:14.350');
    release();
    expect(loopOf(api).start).toBeCloseTo(12.55, 9);
    expect(loopOf(api).end).toBeCloseTo(14.35, 9);
    expect(undoTitle(view)).toBe(`Undo: ${studioLoopStrings.historyRange}`);
  });

  it('SL2 Snap on 1 s moves the brace start to the nearest line and keeps the length', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    pressG();
    const element = brace();
    const release = dragBrace(element, 10);
    expect(braceSpan(element)).toBe('Loop 00:13.000 — 00:14.800');
    expect(loopOf(api)).toEqual({ start: 13, end: 14.8, enabled: true });
    release();
    expect(braceSpan(element)).toBe('Loop 00:13.000 — 00:14.800');
    expect(loopOf(api)).toEqual({ start: 13, end: 14.8, enabled: true });
    expect(statusText(view)).toBe('Loop: 00:13.000 — 00:14.800.');
    expect(undoTitle(view)).toBe(`Undo: ${studioLoopStrings.historyRange}`);
    pressCtrl('z');
    expect(loopOf(api)).toEqual(LOOP_FIXTURE);
    expect(undoTitle(view)).toBe('Undo');
  });

  it('SL3 Alt on the moves bypasses Snap for a brace move', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    pressG();
    const element = brace();
    const release = dragBrace(element, 10, { altKey: true });
    expect(braceSpan(element)).toBe('Loop 00:12.550 — 00:14.350');
    release();
    expect(loopOf(api).start).toBeCloseTo(12.55, 9);
    expect(loopOf(api).end).toBeCloseTo(14.35, 9);
    expect(snapState(view)).toBe('on');
  });

  it('SL4 Alt with Snap off moves the brace start to the chosen division', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    chooseDivision(view, '0.25');
    const element = brace();
    const release = dragBrace(element, 10, { altKey: true });
    release();
    expect(loopOf(api).start).toBe(12.5);
    expect(loopOf(api).end).toBeCloseTo(14.3, 9);
    expect(braceSpan(element)).toBe('Loop 00:12.500 — 00:14.300');
    expect(snapState(view)).toBe('off');
  });

  it('SL5 Snap on puts a dragged end edge on the nearest line', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    pressG();
    const element = brace();
    dragBraceEdge(view, element, 'end', 22);
    expect(loopOf(api)).toEqual({ start: 12.3, end: 15, enabled: true });
    expect(braceSpan(element)).toBe('Loop 00:12.300 — 00:15.000');
  });

  it('SL6 Snap on snaps the end edge first, then clamps to the minimum length', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    pressG();
    const element = brace();
    dragBraceEdge(view, element, 'end', -66);
    expect(loopOf(api).start).toBe(12.3);
    expect(loopOf(api).end).toBeCloseTo(12.4, 9);
    expect(statusText(view)).toBe('Loop: 00:12.300 — 00:12.400.');
  });

  it('SL7 Snap on keeps a brace moved below time 0 at 0', async () => {
    const { api, brace } = await mountLoopDropWorkspace([], {
      start: 0.3,
      end: 1.5,
      enabled: true,
    });
    pressG();
    const element = brace();
    const release = dragBrace(element, -30);
    release();
    expect(loopOf(api).start).toBe(0);
    expect(loopOf(api).end).toBeCloseTo(1.2, 9);
  });

  it('SL8 Snap on: a brace drag that snaps back to its line changes nothing', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([], {
      start: 12,
      end: 14,
      enabled: true,
    });
    pressG();
    const element = brace();
    const release = dragBrace(element, 8);
    expect(braceSpan(element)).toBe('Loop 00:12.000 — 00:14.000');
    release();
    expect(loopOf(api)).toEqual({ start: 12, end: 14, enabled: true });
    expect(undoTitle(view)).toBe('Undo');
  });

  it('SL9 Snap on puts a dragged start edge on the nearest line', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    pressG();
    const element = brace();
    dragBraceEdge(view, element, 'start', -22);
    expect(loopOf(api)).toEqual({ start: 12, end: 14.1, enabled: true });
    expect(statusText(view)).toBe('Loop: 00:12.000 — 00:14.100.');
  });
});

describe('SRW-14 stage 3b loop brace keys on the grid', { timeout: 15_000 }, () => {
  it('SK1 Snap off keeps the 0.1 s brace step', async () => {
    const { api, brace } = await mountLoopDropWorkspace([]);
    const element = brace();
    act(() => element.focus());
    pressBraceKey(element, 'ArrowRight');
    expect(loopOf(api).start).toBeCloseTo(12.4, 9);
    expect(loopOf(api).end).toBeCloseTo(14.2, 9);
    expect(braceSpan(element)).toBe('Loop 00:12.400 — 00:14.200');
  });

  it('SK2 Snap on moves the brace start line to line, one Undo entry per key', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    pressG();
    const element = brace();
    act(() => element.focus());
    pressBraceKey(element, 'ArrowRight');
    expect(loopOf(api)).toEqual({ start: 13, end: 14.8, enabled: true });
    expect(statusText(view)).toBe('Loop: 00:13.000 — 00:14.800.');
    pressBraceKey(element, 'ArrowLeft');
    expect(loopOf(api)).toEqual({ start: 12, end: 13.8, enabled: true });
    pressBraceKey(element, 'ArrowLeft');
    expect(loopOf(api)).toEqual({ start: 11, end: 12.8, enabled: true });
    expect(undoTitle(view)).toBe(`Undo: ${studioLoopStrings.historyRange}`);
    pressCtrl('z');
    expect(loopOf(api)).toEqual({ start: 12, end: 13.8, enabled: true });
    pressCtrl('z');
    expect(loopOf(api)).toEqual({ start: 13, end: 14.8, enabled: true });
    pressCtrl('z');
    expect(loopOf(api)).toEqual(LOOP_FIXTURE);
    expect(undoTitle(view)).toBe('Undo');
  });

  it('SK3 Snap on moves the brace end line to line with Shift', async () => {
    const { api, brace } = await mountLoopDropWorkspace([]);
    pressG();
    const element = brace();
    act(() => element.focus());
    pressBraceKey(element, 'ArrowRight', true);
    expect(loopOf(api)).toEqual({ start: 12.3, end: 15, enabled: true });
    pressBraceKey(element, 'ArrowLeft', true);
    expect(loopOf(api)).toEqual({ start: 12.3, end: 14, enabled: true });
  });

  it('SK4 Snap on: ArrowLeft at time 0 is blocked with the existing status', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([], {
      start: 0,
      end: 1.2,
      enabled: true,
    });
    pressG();
    const element = brace();
    act(() => element.focus());
    pressBraceKey(element, 'ArrowLeft');
    expect(loopOf(api)).toEqual({ start: 0, end: 1.2, enabled: true });
    expect(statusText(view)).toBe(LOOP_BLOCKED_STATUS);
    expect(undoTitle(view)).toBe('Undo');
  });

  it('SK5 Snap on: Shift+ArrowLeft clamps the end to the minimum length, then is blocked', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([], {
      start: 12.3,
      end: 12.9,
      enabled: true,
    });
    pressG();
    const element = brace();
    act(() => element.focus());
    pressBraceKey(element, 'ArrowLeft', true);
    expect(loopOf(api).start).toBe(12.3);
    expect(loopOf(api).end).toBeCloseTo(12.4, 9);
    expect(statusText(view)).toBe('Loop: 00:12.300 — 00:12.400.');
    const clamped = loopOf(api);
    pressBraceKey(element, 'ArrowLeft', true);
    expect(loopOf(api)).toBe(clamped);
    expect(statusText(view)).toBe(LOOP_BLOCKED_STATUS);
  });

  it('SK6 Snap on with a 0.25 s division moves the brace start to the next 0.25 line', async () => {
    const { api, view, brace } = await mountLoopDropWorkspace([]);
    chooseDivision(view, '0.25');
    pressG();
    const element = brace();
    act(() => element.focus());
    pressBraceKey(element, 'ArrowRight');
    expect(loopOf(api).start).toBe(12.5);
    expect(loopOf(api).end).toBeCloseTo(14.3, 9);
  });

  it('SK7 brace keys move the brace, not the selected clip', async () => {
    const { api, brace } = await mountLoopDropWorkspace([clipAt('s1', 'sfx', 4, 2)]);
    pressG();
    act(() => live(api).selectClip('s1'));
    expect(live(api).selectedClipIds).toEqual(['s1']);
    const element = brace();
    act(() => element.focus());
    pressBraceKey(element, 'ArrowRight');
    expect(loopOf(api)).toEqual({ start: 13, end: 14.8, enabled: true });
    expect(live(api).arrangement.clips.find((clip) => clip.id === 's1')?.start).toBe(4);
  });
});

function moveBraceThenRelease(
  element: HTMLElement,
  moveDx: number,
  release: { dx: number; altKey?: boolean },
) {
  fireEvent.pointerDown(element, { ...press, pointerId: 1, clientX: BRACE_X, clientY: 30 });
  fireEvent.pointerMove(element, { pointerId: 1, clientX: BRACE_X + moveDx, clientY: 30 });
  const preview = braceSpan(element);
  fireEvent.pointerUp(element, {
    pointerId: 1,
    clientX: BRACE_X + release.dx,
    clientY: 30,
    altKey: release.altKey ?? false,
  });
  return preview;
}

describe(
  'SRW-14 stage 4a loop brace release keeps the last move sample',
  { timeout: 15_000 },
  () => {
    it('SL10 a release further along does not re-snap the brace', async () => {
      const { api, view, brace } = await mountLoopDropWorkspace([]);
      pressG();
      const element = brace();
      const preview = moveBraceThenRelease(element, 10, { dx: 50 });
      expect(preview).toBe('Loop 00:13.000 — 00:14.800');
      expect(loopOf(api)).toEqual({ start: 13, end: 14.8, enabled: true });
      expect(braceSpan(element)).toBe('Loop 00:13.000 — 00:14.800');
      expect(statusText(view)).toBe('Loop: 00:13.000 — 00:14.800.');
      expect(undoTitle(view)).toBe(`Undo: ${studioLoopStrings.historyRange}`);
      pressCtrl('z');
      expect(loopOf(api)).toEqual(LOOP_FIXTURE);
      expect(undoTitle(view)).toBe('Undo');
    });

    it('SL11 Alt on the release alone does not free the brace', async () => {
      const { api, view, brace } = await mountLoopDropWorkspace([]);
      pressG();
      const element = brace();
      const preview = moveBraceThenRelease(element, 10, { dx: 10, altKey: true });
      expect(preview).toBe('Loop 00:13.000 — 00:14.800');
      expect(loopOf(api)).toEqual({ start: 13, end: 14.8, enabled: true });
      expect(statusText(view)).toBe('Loop: 00:13.000 — 00:14.800.');
    });

    it('SL7b Snap on puts a brace moved to raw 0.35 on line 0', async () => {
      const { api, brace } = await mountLoopDropWorkspace([], {
        start: 0.6,
        end: 1.8,
        enabled: true,
      });
      pressG();
      const element = brace();
      const release = dragBrace(element, -10);
      release();
      expect(loopOf(api).start).toBe(0);
      expect(loopOf(api).end).toBeCloseTo(1.2, 9);
    });

    it('SL7c Snap off keeps a brace moved to raw 0.35 at 0.35', async () => {
      const { api, view, brace } = await mountLoopDropWorkspace([], {
        start: 0.6,
        end: 1.8,
        enabled: true,
      });
      expect(snapState(view)).toBe('off');
      const element = brace();
      const release = dragBrace(element, -10);
      release();
      expect(loopOf(api).start).toBeCloseTo(0.35, 9);
      expect(loopOf(api).end).toBeCloseTo(1.55, 9);
    });
  },
);
