import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementMarker, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioEditStrings } from '../strings';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const fakeClock = { base: 0 };
const sourceCounter = { created: 0 };

function fakeNow(): number {
  return Date.now() / 1000 - fakeClock.base;
}

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
    return fakeNow();
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
    sourceCounter.created += 1;
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

const markerCollection: WorkspaceCollection = {
  id: 'markers',
  label: 'markers',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'markers', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 6000, numberOfChannels: 1, sampleRate: 100 }),
};

const PROJECT_END = 50;

function markerArrangement(markers?: ArrangementMarker[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  const arrangement: Arrangement = {
    ...base,
    clips: [
      {
        id: 'm1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: PROJECT_END,
      },
    ],
  };
  return markers ? { ...arrangement, markers } : arrangement;
}

const THREE_MARKERS: ArrangementMarker[] = [
  { id: 'k12', time: 12, name: 'Intro' },
  { id: 'k20', time: 20, name: 'Drop' },
  { id: 'k40', time: 40, name: 'Outro' },
];

interface MarkerApiRef {
  current: ArrangementContextValue | null;
}

function MarkerProbe({ api }: { api: MarkerApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: MarkerApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountMarkerWorkspace(initial: Arrangement = markerArrangement()) {
  const api: MarkerApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={markerCollection} initialArrangement={initial}>
      <StudioWorkspace />
      <MarkerProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  return { api, view };
}

type MarkerView = ReturnType<typeof render>;

function markerFlags(view: MarkerView): HTMLElement[] {
  return view.queryAllByTestId('arrangement-marker');
}

function markerTimes(view: MarkerView): string[] {
  return markerFlags(view).map((flag) => flag.dataset.markerTime ?? '');
}

function flagAt(view: MarkerView, time: string): HTMLElement {
  const flag = markerFlags(view).find((entry) => entry.dataset.markerTime === time);
  if (!flag) {
    throw new Error(`no marker at ${time}`);
  }
  return flag;
}

function nameInput(view: MarkerView): HTMLInputElement {
  const input = view.getByTestId('arrangement-marker-name-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('name input missing');
  }
  return input;
}

function stubPointerCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

function clickClipBody(view: MarkerView, clipId: string, pointerId: number) {
  const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
  const body = root?.querySelector<HTMLElement>('[title^="drag = time selection"]');
  if (!root || !body) {
    throw new Error(`clip ${clipId} not rendered`);
  }
  stubPointerCapture(root);
  stubPointerCapture(body);
  fireEvent.pointerDown(body, { button: 0, buttons: 1, pointerId, clientX: 120, clientY: 10 });
  fireEvent.pointerUp(body, { button: 0, buttons: 0, pointerId, clientX: 120, clientY: 10 });
}

function statusText(view: MarkerView): string {
  return view.getByTestId('arrangement-status').textContent ?? '';
}

function pressM(target: Element = document.body) {
  fireEvent.keyDown(target, { key: 'm', code: 'KeyM' });
}

function pressCtrlArrow(direction: 'ArrowLeft' | 'ArrowRight', target: Element = document.body) {
  fireEvent.keyDown(target, { key: direction, code: direction, ctrlKey: true });
}

function pressCtrlKey(
  key: 'z' | 'y',
  target: Element = document.body,
  options: { readonly shiftKey?: boolean } = {},
) {
  fireEvent.keyDown(target, {
    key: options.shiftKey ? key.toUpperCase() : key,
    code: key === 'z' ? 'KeyZ' : 'KeyY',
    ctrlKey: true,
    shiftKey: options.shiftKey === true,
  });
}

function addNamedMarker(view: MarkerView, name: string) {
  pressM();
  const input = nameInput(view);
  fireEvent.change(input, { target: { value: name } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  sourceCounter.created = 0;
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('marker row: add, cancel and duplicates (SRW-16 stage 1)', { timeout: 15000 }, () => {
  it('MU1: M opens a selected default name, Enter commits one Add Marker entry, Undo/Redo work', async () => {
    const { api, view } = await mountMarkerWorkspace();
    act(() => live(api).seekTo(12));
    expect(view.getByTestId('arrangement-marker-add').getAttribute('aria-keyshortcuts')).toBe('M');
    pressM();
    const input = nameInput(view);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('Marker 1');
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('Marker 1'.length);
    expect(input.maxLength).toBe(64);
    expect(input.getAttribute('aria-label')).toBe('Marker name');
    expect(live(api).arrangement.markers).toBeUndefined();
    expect(live(api).undoLabel).toBeNull();
    fireEvent.change(input, { target: { value: 'აქ შედის მუსიკა' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(markerTimes(view)).toEqual(['12.000']);
    const flag = flagAt(view, '12.000');
    expect(flag.getAttribute('aria-label')).toContain('აქ შედის მუსიკა');
    expect(flag.getAttribute('aria-label')).toContain('00:12.000');
    expect(flag.getAttribute('aria-current')).toBe('true');
    expect(flag.title).toContain('აქ შედის მუსიკა');
    expect(document.activeElement).toBe(flag);
    expect(statusText(view)).not.toContain('already exists');
    expect(live(api).undoLabel).toBe('Add Marker');
    const undoButton = view.getByTitle(studioEditStrings.undoTitle('Add Marker'));
    expect(undoButton).toBeTruthy();
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(markerFlags(view)).toHaveLength(0);
    expect('markers' in live(api).arrangement).toBe(false);
    fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
    fireEvent.keyDown(document.body, { key: 'y', code: 'KeyY', ctrlKey: true });
    expect(markerTimes(view)).toEqual(['12.000']);
    expect(live(api).undoLabel).toBe('Add Marker');
    expect(live(api).arrangement.markers?.map((entry) => entry.name)).toEqual(['აქ შედის მუსიკა']);
  });

  it('MU2: Escape adds nothing even after the input unmounts; a blur after typing commits exactly once', async () => {
    const { api, view } = await mountMarkerWorkspace();
    act(() => live(api).seekTo(7));
    const snap = view.getByTestId('arrangement-snap-toggle');
    snap.focus();
    pressM(snap);
    const input = nameInput(view);
    fireEvent.change(input, { target: { value: 'typed' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    fireEvent.blur(input);
    expect(document.activeElement).toBe(snap);
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(markerFlags(view)).toHaveLength(0);
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe('Marker not added');
    pressM();
    const second = nameInput(view);
    fireEvent.change(second, { target: { value: 'ბლური' } });
    fireEvent.blur(second);
    fireEvent.blur(second);
    expect(markerTimes(view)).toEqual(['7.000']);
    expect(live(api).undoLabel).toBe('Add Marker');
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(markerFlags(view)).toHaveLength(0);
  });

  it('MU2b: Enter followed by the unmount blur commits once and shows no duplicate refusal', async () => {
    const { api, view } = await mountMarkerWorkspace();
    act(() => live(api).seekTo(3));
    pressM();
    const input = nameInput(view);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.blur(input);
    expect(markerTimes(view)).toEqual(['3.000']);
    expect(live(api).undoLabel).toBe('Add Marker');
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).not.toContain('already exists');
  });

  it('MU3: with a time range the Add button uses the range start and keeps the range', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement([THREE_MARKERS[0]]));
    act(() => live(api).seekTo(33));
    act(() => live(api).setTimeRange({ start: 20, end: 25, trackId: 'music' }));
    fireEvent.click(view.getByTestId('arrangement-marker-add'));
    const input = nameInput(view);
    expect(input.value).toBe('Marker 1');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(markerTimes(view)).toEqual(['12.000', '20.000']);
    expect(flagAt(view, '20.000').getAttribute('aria-label')).toContain('Marker 1');
    expect(live(api).range).toEqual({ start: 20, end: 25, trackId: 'music' });
  });

  it('MU4: M on an existing marker time opens no editor and focuses the existing flag', async () => {
    const { api, view } = await mountMarkerWorkspace();
    act(() => live(api).seekTo(12));
    addNamedMarker(view, 'აქ შედის მუსიკა');
    act(() => live(api).seekTo(0));
    act(() => live(api).seekTo(12.0003));
    const undoBefore = live(api).undoLabel;
    const arrangementBefore = live(api).arrangement;
    (document.activeElement instanceof HTMLElement ? document.activeElement : document.body).blur();
    pressM();
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(statusText(view)).toBe('A marker already exists at this time: “აქ შედის მუსიკა”');
    expect(document.activeElement).toBe(flagAt(view, '12.000'));
    expect(flagAt(view, '12.000').getAttribute('aria-current')).toBe('true');
    expect(live(api).arrangement).toBe(arrangementBefore);
    expect(live(api).undoLabel).toBe(undoBefore);
  });
});

describe('marker row: jump, play from and navigation', { timeout: 15000 }, () => {
  it('MU5: click jumps, double-click while stopped plays from the marker, double-click while playing keeps playing', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    const flag = flagAt(view, '12.000');
    fireEvent.click(flag);
    expect(live(api).getLivePosition()).toBe(12);
    expect(live(api).isPlaying).toBe(false);
    expect(flag.getAttribute('aria-current')).toBe('true');
    act(() => live(api).seekTo(0));
    fireEvent.click(flag);
    fireEvent.click(flag);
    fireEvent.doubleClick(flag);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThanOrEqual(12);
    expect(live(api).getLivePosition()).toBeLessThan(12.5);
    const drop = flagAt(view, '20.000');
    fireEvent.click(drop);
    fireEvent.click(drop);
    fireEvent.doubleClick(drop);
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThanOrEqual(20);
    expect(live(api).getLivePosition()).toBeLessThan(20.5);
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(false);
  });

  it('MU6: Ctrl+arrows and the buttons visit markers, the end and the start, then refuse', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    expect(live(api).projectEnd).toBe(PROJECT_END);
    act(() => live(api).seekTo(0));
    const forward: number[] = [];
    for (let step = 0; step < 4; step += 1) {
      pressCtrlArrow('ArrowRight');
      forward.push(live(api).getLivePosition());
    }
    expect(forward).toEqual([12, 20, 40, PROJECT_END]);
    expect(flagAt(view, '40.000').getAttribute('aria-current')).toBe('true');
    pressCtrlArrow('ArrowRight');
    expect(live(api).getLivePosition()).toBe(PROJECT_END);
    expect(statusText(view)).toBe('No more markers after the playhead');
    const backward: number[] = [];
    for (let step = 0; step < 4; step += 1) {
      pressCtrlArrow('ArrowLeft');
      backward.push(live(api).getLivePosition());
    }
    expect(backward).toEqual([40, 20, 12, 0]);
    pressCtrlArrow('ArrowLeft');
    expect(live(api).getLivePosition()).toBe(0);
    expect(statusText(view)).toBe('No more markers before the playhead');
    const next = view.getByTestId('arrangement-marker-next');
    const prev = view.getByTestId('arrangement-marker-prev');
    expect(next.getAttribute('aria-keyshortcuts')).toBe('Control+ArrowRight');
    expect(prev.getAttribute('aria-keyshortcuts')).toBe('Control+ArrowLeft');
    const buttons: number[] = [];
    for (let step = 0; step < 4; step += 1) {
      fireEvent.click(next);
      buttons.push(live(api).getLivePosition());
    }
    fireEvent.click(next);
    expect(statusText(view)).toBe('No more markers after the playhead');
    for (let step = 0; step < 4; step += 1) {
      fireEvent.click(prev);
      buttons.push(live(api).getLivePosition());
    }
    fireEvent.click(prev);
    expect(statusText(view)).toBe('No more markers before the playhead');
    expect(buttons).toEqual([12, 20, 40, PROJECT_END, 40, 20, 12, 0]);
    const tempo = view.getByTestId('arrangement-tempo-input');
    tempo.focus();
    pressCtrlArrow('ArrowRight', tempo);
    expect(live(api).getLivePosition()).toBe(0);
    tempo.blur();
    const fader = view.container.querySelector('input[type="range"]');
    if (!(fader instanceof HTMLInputElement)) {
      throw new Error('fader missing');
    }
    fader.focus();
    pressCtrlArrow('ArrowRight', fader);
    expect(live(api).getLivePosition()).toBe(0);
  });

  it('MU6b: Ctrl+Right while playing jumps to the next marker and keeps playing', async () => {
    const { api } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    act(() => live(api).seekTo(0));
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    pressCtrlArrow('ArrowRight');
    expect(live(api).isPlaying).toBe(true);
    expect(live(api).getLivePosition()).toBeGreaterThanOrEqual(12);
    expect(live(api).getLivePosition()).toBeLessThan(12.5);
    act(() => live(api).togglePlayback());
  });
});

describe('marker row: rename and delete', { timeout: 15000 }, () => {
  it('MU7: F2 renames, Escape cancels without a later commit, and Delete inside the input never deletes the marker', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    const drop = flagAt(view, '20.000');
    drop.focus();
    fireEvent.keyDown(drop, { key: 'F2', code: 'F2' });
    let input = nameInput(view);
    expect(input.value).toBe('Drop');
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: 'რეკლამა' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.blur(input);
    expect(live(api).undoLabel).toBe('Rename Marker');
    expect(flagAt(view, '20.000').getAttribute('aria-label')).toContain('რეკლამა');
    expect(document.activeElement).toBe(flagAt(view, '20.000'));
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).redo());
    expect(live(api).undoLabel).toBe('Rename Marker');
    act(() => live(api).undo());
    act(() => live(api).redo());
    const renamedArrangement = live(api).arrangement;
    const flag = flagAt(view, '20.000');
    flag.focus();
    fireEvent.keyDown(flag, { key: 'F2', code: 'F2' });
    input = nameInput(view);
    fireEvent.change(input, { target: { value: 'თითქმის' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    fireEvent.blur(input);
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(live(api).arrangement).toBe(renamedArrangement);
    expect(live(api).undoLabel).toBe('Rename Marker');
    const again = flagAt(view, '20.000');
    again.focus();
    fireEvent.keyDown(again, { key: 'F2', code: 'F2' });
    input = nameInput(view);
    input.select();
    fireEvent.keyDown(input, { key: 'Delete', code: 'Delete' });
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(live(api).arrangement).toBe(renamedArrangement);
    expect(statusText(view)).toBe('The name is empty — “რეკლამა” is kept');
  });

  it('MU8: Delete on a focused marker removes only the marker; Delete elsewhere keeps SRW-24; plain arrows on a focused marker move the marker and never nudge the selected clip', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    act(() => live(api).selectClip('m1'));
    const outro = flagAt(view, '40.000');
    outro.focus();
    fireEvent.keyDown(outro, { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(outro, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(live(api).arrangement.clips[0].start).toBe(0);
    expect(live(api).undoLabel).toBe('Move Marker');
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    fireEvent.keyDown(outro, { key: 'Delete', code: 'Delete' });
    expect(markerTimes(view)).toEqual(['12.000', '20.000']);
    expect(live(api).undoLabel).toBe('Delete Marker');
    expect(live(api).arrangement.clips).toHaveLength(1);
    expect(live(api).arrangement.clips[0]).toMatchObject({ id: 'm1', start: 0, duration: 50 });
    expect(live(api).selectedClipIds).toEqual(['m1']);
    expect(document.activeElement).toBe(flagAt(view, '20.000'));
    const drop = flagAt(view, '20.000');
    fireEvent.keyDown(drop, { key: 'Backspace', code: 'Backspace' });
    expect(markerTimes(view)).toEqual(['12.000']);
    expect(document.activeElement).toBe(flagAt(view, '12.000'));
    act(() => live(api).undo());
    act(() => live(api).undo());
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    const markersBefore = live(api).arrangement.markers;
    (document.activeElement instanceof HTMLElement ? document.activeElement : document.body).blur();
    act(() => live(api).selectClip('m1'));
    fireEvent.keyDown(document.body, { key: 'Delete', code: 'Delete' });
    expect(live(api).arrangement.clips).toHaveLength(0);
    expect(live(api).arrangement.markers).toEqual(markersBefore);
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
  });

  it('MU8b: deleting the only marker moves focus to the Add button', async () => {
    const { view } = await mountMarkerWorkspace(markerArrangement([THREE_MARKERS[0]]));
    const intro = flagAt(view, '12.000');
    intro.focus();
    fireEvent.keyDown(intro, { key: 'Delete', code: 'Delete' });
    expect(markerFlags(view)).toHaveLength(0);
    expect(document.activeElement).toBe(view.getByTestId('arrangement-marker-add'));
  });

  it('MU8c: a clip click after a marker add releases the flag, so Delete and plain arrows act on the clip (C-R72-01)', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    pressM();
    fireEvent.keyDown(nameInput(view), { key: 'Enter', code: 'Enter' });
    const added = flagAt(view, '0.000');
    expect(document.activeElement).toBe(added);
    const markersBefore = live(api).arrangement.markers;
    expect(markersBefore).toHaveLength(4);
    clickClipBody(view, 'm1', 70);
    expect(document.activeElement).not.toBe(added);
    expect(live(api).selectedClipIds).toEqual(['m1']);
    const released =
      document.activeElement instanceof HTMLElement ? document.activeElement : document.body;
    fireEvent.keyDown(released, { key: 'Delete', code: 'Delete' });
    fireEvent.keyDown(document.body, { key: 'Delete', code: 'Delete' });
    expect(live(api).arrangement.clips).toHaveLength(0);
    expect(live(api).arrangement.markers).toEqual(markersBefore);
    expect(markerTimes(view)).toEqual(['0.000', '12.000', '20.000', '40.000']);
    expect(live(api).undoLabel).toBe(studioEditStrings.historyDeleteClip);
    act(() => live(api).undo());
    expect(live(api).arrangement.clips).toHaveLength(1);
    expect(live(api).arrangement.clips[0]).toMatchObject({ id: 'm1', start: 0, duration: 50 });

    flagAt(view, '20.000').focus();
    clickClipBody(view, 'm1', 71);
    expect(document.activeElement).not.toBe(flagAt(view, '20.000'));
    expect(live(api).selectedClipIds).toEqual(['m1']);
    const active =
      document.activeElement instanceof HTMLElement ? document.activeElement : document.body;
    fireEvent.keyDown(active, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(live(api).arrangement.clips[0].start).toBeGreaterThan(0);
    expect(live(api).arrangement.markers).toEqual(markersBefore);
    act(() => live(api).undo());
    expect(live(api).arrangement.clips[0].start).toBe(0);

    flagAt(view, '40.000').focus();
    clickClipBody(view, 'm1', 72);
    const afterClick =
      document.activeElement instanceof HTMLElement ? document.activeElement : document.body;
    fireEvent.keyDown(afterClick, { key: 'Delete', code: 'Delete' });
    expect(live(api).arrangement.clips).toHaveLength(0);
    expect(live(api).arrangement.markers).toEqual(markersBefore);
  });

  it('MU8d: a press on a lane background, the ruler or a Markers header button releases a focused flag', async () => {
    const { view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    const intro = flagAt(view, '12.000');
    intro.focus();
    const lane = view.getByTestId('arrangement-video-dropzone');
    fireEvent.pointerDown(lane, { button: 0, buttons: 1, pointerId: 73, clientX: 300 });
    fireEvent.pointerUp(window, { pointerId: 73, clientX: 300 });
    expect(document.activeElement).not.toBe(intro);

    intro.focus();
    const ruler = view.getByTestId('arrangement-ruler');
    stubPointerCapture(ruler);
    fireEvent.pointerDown(ruler, { button: 0, buttons: 1, pointerId: 74, clientX: 300 });
    fireEvent.pointerUp(ruler, { pointerId: 74, clientX: 300 });
    expect(document.activeElement).not.toBe(intro);

    intro.focus();
    fireEvent.pointerDown(view.getByTestId('arrangement-marker-next'), {
      button: 0,
      buttons: 1,
      pointerId: 78,
    });
    expect(document.activeElement).not.toBe(intro);
  });

  it('MU8e: a press on another flag or inside the open name editor keeps marker focus', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    const intro = flagAt(view, '12.000');
    intro.focus();
    const drop = flagAt(view, '20.000');
    fireEvent.pointerDown(drop, { button: 0, buttons: 1, pointerId: 75 });
    expect(document.activeElement).toBe(drop);
    fireEvent.pointerUp(window, { pointerId: 75 });
    const label = drop.querySelector('[data-marker-label]');
    if (!(label instanceof HTMLElement)) {
      throw new Error('marker label missing');
    }
    fireEvent.pointerDown(label, { button: 0, buttons: 1, pointerId: 76 });
    expect(document.activeElement).toBe(drop);
    fireEvent.pointerUp(window, { pointerId: 76 });
    expect(live(api).isPointerGestureActive()).toBe(false);

    fireEvent.keyDown(intro, { key: 'F2', code: 'F2' });
    const input = nameInput(view);
    expect(document.activeElement).toBe(input);
    fireEvent.pointerDown(input, { button: 0, buttons: 1, pointerId: 77 });
    expect(document.activeElement).toBe(input);
    expect(view.queryByTestId('arrangement-marker-name-input')).not.toBeNull();
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    expect(live(api).undoLabel).toBeNull();
  });

  it('MU8f: Delete or a plain arrow dispatched from inside a flag (not the flag itself) touches neither the clip nor the marker', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    act(() => live(api).selectClip('m1'));
    const markersBefore = live(api).arrangement.markers;
    const label = flagAt(view, '20.000').querySelector('[data-marker-label]');
    if (!(label instanceof HTMLElement)) {
      throw new Error('marker label missing');
    }
    fireEvent.keyDown(label, { key: 'Delete', code: 'Delete' });
    fireEvent.keyDown(label, { key: 'Backspace', code: 'Backspace' });
    fireEvent.keyDown(label, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(live(api).arrangement.clips).toHaveLength(1);
    expect(live(api).arrangement.clips[0].start).toBe(0);
    expect(live(api).arrangement.markers).toEqual(markersBefore);
    expect(live(api).undoLabel).toBeNull();
  });

  it('MU9: Cut Time removes markers inside, shifts later ones, reports the count, and Undo restores them', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    act(() => live(api).setTimeRange({ start: 15, end: 25, trackId: 'music' }));
    fireEvent.keyDown(document.body, { key: 'X', code: 'KeyX', ctrlKey: true, shiftKey: true });
    expect(live(api).undoLabel).toBe('Cut Time');
    expect(markerTimes(view)).toEqual(['12.000', '30.000']);
    expect(statusText(view).endsWith(studioEditStrings.markersRemoved(1))).toBe(true);
    expect(live(api).arrangement.clips.map((clip) => [clip.start, clip.duration])).toEqual([
      [0, 15],
      [15, 25],
    ]);
    act(() => live(api).undo());
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(live(api).arrangement.clips).toHaveLength(1);
    act(() => live(api).setTimeRange({ start: 42, end: 45, trackId: 'music' }));
    fireEvent.keyDown(document.body, { key: 'X', code: 'KeyX', ctrlKey: true, shiftKey: true });
    expect(statusText(view)).not.toContain('marker');
  });

  it('MU18: Ctrl+Z of a marker add with its flag focused moves focus to the Add button (B-R243-UNDO-MARKER-FOCUS)', async () => {
    const { api, view } = await mountMarkerWorkspace();
    addNamedMarker(view, 'Hit');
    const flag = flagAt(view, '0.000');
    expect(document.activeElement).toBe(flag);
    pressCtrlKey('z', flag);
    expect(markerFlags(view)).toHaveLength(0);
    expect(live(api).redoLabel).toBe('Add Marker');
    expect(statusText(view)).toBe('Undo: Add Marker');
    expect(document.activeElement).toBe(view.getByTestId('arrangement-marker-add'));
  });

  it('MU19: Ctrl+Z of a marker add between or after markers moves focus to the next flag, else the previous one', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    act(() => live(api).seekTo(30));
    addNamedMarker(view, 'Mid');
    const mid = flagAt(view, '30.000');
    expect(document.activeElement).toBe(mid);
    pressCtrlKey('z', mid);
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(document.activeElement).toBe(flagAt(view, '40.000'));
    act(() => live(api).seekTo(45));
    addNamedMarker(view, 'Tail');
    const tail = flagAt(view, '45.000');
    expect(document.activeElement).toBe(tail);
    pressCtrlKey('z', tail);
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(document.activeElement).toBe(flagAt(view, '40.000'));
  });

  it('MU20: Redo of a marker delete (Ctrl+Shift+Z and Ctrl+Y) with the restored flag focused moves focus to the next flag', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    const drop = flagAt(view, '20.000');
    drop.focus();
    fireEvent.keyDown(drop, { key: 'Delete', code: 'Delete' });
    expect(document.activeElement).toBe(flagAt(view, '40.000'));
    pressCtrlKey('z', flagAt(view, '40.000'));
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(document.activeElement).toBe(flagAt(view, '40.000'));
    flagAt(view, '20.000').focus();
    pressCtrlKey('z', flagAt(view, '20.000'), { shiftKey: true });
    expect(markerTimes(view)).toEqual(['12.000', '40.000']);
    expect(statusText(view)).toBe('Redo: Delete Marker');
    expect(document.activeElement).toBe(flagAt(view, '40.000'));
    pressCtrlKey('z', flagAt(view, '40.000'));
    flagAt(view, '20.000').focus();
    pressCtrlKey('y', flagAt(view, '20.000'));
    expect(markerTimes(view)).toEqual(['12.000', '40.000']);
    expect(live(api).undoLabel).toBe('Delete Marker');
    expect(document.activeElement).toBe(flagAt(view, '40.000'));
  });

  it('MU21: Ctrl+Z of a marker add leaves focus alone when the removed flag was not focused', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    act(() => live(api).seekTo(30));
    addNamedMarker(view, 'Mid');
    const intro = flagAt(view, '12.000');
    intro.focus();
    pressCtrlKey('z', intro);
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(document.activeElement).toBe(flagAt(view, '12.000'));
    act(() => live(api).redo());
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '30.000', '40.000']);
    (document.activeElement instanceof HTMLElement ? document.activeElement : document.body).blur();
    expect(document.activeElement).toBe(document.body);
    pressCtrlKey('z');
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(document.activeElement).toBe(document.body);
  });

  it('MU22: Undo that keeps the focused flag (Move Marker) leaves focus on that flag', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    const drop = flagAt(view, '20.000');
    drop.focus();
    fireEvent.keyDown(drop, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(live(api).undoLabel).toBe('Move Marker');
    const moved = markerFlags(view).find(
      (flag) => flag.dataset.markerTime !== '12.000' && flag.dataset.markerTime !== '40.000',
    );
    if (!moved) {
      throw new Error('moved flag missing');
    }
    expect(document.activeElement).toBe(moved);
    pressCtrlKey('z', moved);
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(document.activeElement).toBe(flagAt(view, '20.000'));
  });

  it('MU23: Cut Time that removes the focused flag moves focus to the next surviving flag', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    act(() => live(api).setTimeRange({ start: 15, end: 25, trackId: 'music' }));
    const drop = flagAt(view, '20.000');
    drop.focus();
    fireEvent.keyDown(drop, { key: 'X', code: 'KeyX', ctrlKey: true, shiftKey: true });
    expect(live(api).undoLabel).toBe('Cut Time');
    expect(markerTimes(view)).toEqual(['12.000', '30.000']);
    expect(document.activeElement).toBe(flagAt(view, '30.000'));
    pressCtrlKey('z', flagAt(view, '30.000'));
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    act(() => live(api).setTimeRange({ start: 15, end: 45, trackId: 'music' }));
    const dropAgain = flagAt(view, '20.000');
    dropAgain.focus();
    fireEvent.keyDown(dropAgain, { key: 'X', code: 'KeyX', ctrlKey: true, shiftKey: true });
    expect(markerTimes(view)).toEqual(['12.000']);
    expect(document.activeElement).toBe(flagAt(view, '12.000'));
  });
});

describe('marker row: playback continuity, gestures and typing', { timeout: 15000 }, () => {
  it('MU10: add, rename and delete while playing create no new buffer sources', async () => {
    vi.useFakeTimers();
    fakeClock.base = Date.now() / 1000;
    const { api, view } = await mountMarkerWorkspace(markerArrangement([THREE_MARKERS[2]]));
    act(() => live(api).seekTo(5));
    act(() => live(api).togglePlayback());
    expect(live(api).isPlaying).toBe(true);
    const before = sourceCounter.created;
    expect(before).toBeGreaterThan(0);
    addNamedMarker(view, 'live');
    expect(live(api).undoLabel).toBe('Add Marker');
    const added = markerFlags(view).find((flag) => flag.dataset.markerTime !== '40.000');
    if (!added) {
      throw new Error('added marker missing');
    }
    fireEvent.keyDown(added, { key: 'F2', code: 'F2' });
    const input = nameInput(view);
    fireEvent.change(input, { target: { value: 'renamed' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(live(api).undoLabel).toBe('Rename Marker');
    const renamed = markerFlags(view).find((flag) => flag.dataset.markerTime !== '40.000');
    if (!renamed) {
      throw new Error('renamed marker missing');
    }
    fireEvent.keyDown(renamed, { key: 'Delete', code: 'Delete' });
    expect(live(api).undoLabel).toBe('Delete Marker');
    expect(live(api).isPlaying).toBe(true);
    expect(sourceCounter.created).toBe(before);
    act(() => live(api).togglePlayback());
  });

  it('MU11: during a pointer gesture M and Ctrl+Right are refused', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    act(() => live(api).seekTo(1));
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(4, () => undefined);
    });
    pressM();
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => live(api).setStatus('ready'));
    pressCtrlArrow('ArrowRight');
    expect(live(api).getLivePosition()).toBe(1);
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => live(api).setStatus('ready'));
    fireEvent.click(view.getByTestId('arrangement-marker-add'));
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => live(api).setStatus('ready'));
    fireEvent.click(view.getByTestId('arrangement-marker-next'));
    expect(live(api).getLivePosition()).toBe(1);
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    const intro = flagAt(view, '12.000');
    intro.focus();
    fireEvent.keyDown(intro, { key: 'Delete', code: 'Delete' });
    expect(markerTimes(view)).toEqual(['12.000', '20.000', '40.000']);
    expect(live(api).undoLabel).toBeNull();
    act(() => {
      const releaseGesture: (() => void) | null = release;
      releaseGesture?.();
    });
    pressM();
    expect(view.queryByTestId('arrangement-marker-name-input')).not.toBeNull();
  });

  it('MU13: a blur during a pointer gesture commits nothing and reports the refusal', async () => {
    const { api, view } = await mountMarkerWorkspace();
    act(() => live(api).seekTo(7));
    pressM();
    const input = nameInput(view);
    fireEvent.change(input, { target: { value: 'drag' } });
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(5, () => undefined);
    });
    fireEvent.blur(input);
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(markerFlags(view)).toHaveLength(0);
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    act(() => {
      const releaseGesture: (() => void) | null = release;
      releaseGesture?.();
    });
  });

  it('MU14: committing by moving focus elsewhere keeps focus where the user put it', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement([THREE_MARKERS[1]]));
    act(() => live(api).seekTo(9));
    pressM();
    fireEvent.change(nameInput(view), { target: { value: 'ფოკუსი' } });
    const search = view.getByTestId('arrangement-library-search');
    act(() => search.focus());
    expect(markerTimes(view)).toEqual(['9.000', '20.000']);
    expect(live(api).undoLabel).toBe('Add Marker');
    expect(document.activeElement).toBe(search);
    const drop = flagAt(view, '20.000');
    drop.focus();
    fireEvent.keyDown(drop, { key: 'F2', code: 'F2' });
    fireEvent.change(nameInput(view), { target: { value: 'გადარქმეული' } });
    act(() => search.focus());
    expect(live(api).undoLabel).toBe('Rename Marker');
    expect(document.activeElement).toBe(search);
  });

  it('MU15: Enter in the add editor during a pointer gesture keeps the draft open; after release it commits once', async () => {
    const { api, view } = await mountMarkerWorkspace();
    act(() => live(api).seekTo(7));
    pressM();
    const input = nameInput(view);
    fireEvent.change(input, { target: { value: 'held' } });
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(6, () => undefined);
    });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(markerFlags(view)).toHaveLength(0);
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(nameInput(view)).toBe(input);
    expect(input.value).toBe('held');
    expect(document.activeElement).toBe(input);
    act(() => {
      const releaseGesture: (() => void) | null = release;
      releaseGesture?.();
    });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(markerTimes(view)).toEqual(['7.000']);
    expect(flagAt(view, '7.000').getAttribute('aria-label')).toContain('held');
    expect(live(api).undoLabel).toBe('Add Marker');
    const addedStatus = statusText(view);
    expect(addedStatus).not.toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    fireEvent.blur(input);
    expect(markerTimes(view)).toEqual(['7.000']);
    expect(statusText(view)).toBe(addedStatus);
    act(() => live(api).undo());
    expect(live(api).undoLabel).toBeNull();
  });

  it('MU16: Enter in the rename editor during a pointer gesture keeps the old name and the draft; Escape still cancels', async () => {
    const initial = markerArrangement(THREE_MARKERS);
    const { api, view } = await mountMarkerWorkspace(initial);
    const mounted = live(api).arrangement;
    const drop = flagAt(view, '20.000');
    drop.focus();
    fireEvent.keyDown(drop, { key: 'F2', code: 'F2' });
    const input = nameInput(view);
    fireEvent.change(input, { target: { value: 'held' } });
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(6, () => undefined);
    });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(flagAt(view, '20.000').getAttribute('aria-label')).toContain('Drop');
    expect(live(api).arrangement).toBe(mounted);
    expect(live(api).undoLabel).toBeNull();
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(nameInput(view)).toBe(input);
    expect(input.value).toBe('held');
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(flagAt(view, '20.000').getAttribute('aria-label')).toContain('Drop');
    expect(live(api).arrangement).toBe(mounted);
    expect(live(api).undoLabel).toBeNull();
    act(() => {
      const releaseGesture: (() => void) | null = release;
      releaseGesture?.();
    });
    const again = flagAt(view, '20.000');
    again.focus();
    fireEvent.keyDown(again, { key: 'F2', code: 'F2' });
    const second = nameInput(view);
    fireEvent.change(second, { target: { value: 'held' } });
    fireEvent.keyDown(second, { key: 'Enter', code: 'Enter' });
    expect(flagAt(view, '20.000').getAttribute('aria-label')).toContain('held');
    expect(live(api).undoLabel).toBe('Rename Marker');
    act(() => live(api).undo());
    expect(flagAt(view, '20.000').getAttribute('aria-label')).toContain('Drop');
    expect(live(api).undoLabel).toBeNull();
  });

  it('MU17: F2 on a focused flag during a pointer gesture opens no editor and keeps focus on the flag', async () => {
    const { api, view } = await mountMarkerWorkspace(markerArrangement(THREE_MARKERS));
    let release: (() => void) | null = null;
    act(() => {
      release = live(api).claimPointerGesture(6, () => undefined);
    });
    const drop = flagAt(view, '20.000');
    drop.focus();
    fireEvent.keyDown(drop, { key: 'F2', code: 'F2' });
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(document.activeElement).toBe(drop);
    expect(live(api).undoLabel).toBeNull();
    act(() => {
      const releaseGesture: (() => void) | null = release;
      releaseGesture?.();
    });
    fireEvent.keyDown(drop, { key: 'F2', code: 'F2' });
    expect(nameInput(view).value).toBe('Drop');
  });

  it('MU12: m typed into the library search stays text and opens no editor', async () => {
    const { api, view } = await mountMarkerWorkspace();
    const search = view.getByTestId('arrangement-library-search');
    search.focus();
    fireEvent.keyDown(search, { key: 'm', code: 'KeyM' });
    fireEvent.change(search, { target: { value: 'm' } });
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(live(api).arrangement.markers).toBeUndefined();
    expect(search instanceof HTMLInputElement ? search.value : '').toBe('m');
    const tempo = view.getByTestId('arrangement-tempo-input');
    tempo.focus();
    fireEvent.keyDown(tempo, { key: 'm', code: 'KeyM' });
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
  });

  it('lays labels out without overlap and keeps the flag position in the marker row', async () => {
    const longName = 'გ'.repeat(60);
    const { api, view } = await mountMarkerWorkspace(
      markerArrangement([
        { id: 'a', time: 30, name: longName },
        { id: 'b', time: 31, name: `${longName}b` },
      ]),
    );
    const pxPerSecond = live(api).pxPerSecond;
    const [first, second] = markerFlags(view);
    expect(first.style.left).toBe(`${30 * pxPerSecond}px`);
    expect(second.style.left).toBe(`${31 * pxPerSecond}px`);
    const label = first.querySelector<HTMLElement>('[data-marker-label]');
    if (!label) {
      throw new Error('label missing');
    }
    const width = Number.parseFloat(label.style.maxWidth);
    expect(width).toBeLessThanOrEqual(Math.max(0, pxPerSecond - 4));
    expect(width).toBeGreaterThanOrEqual(0);
    expect(first.title).toContain(longName);
    expect(view.getByTestId('arrangement-marker-row').className).toContain('h-5');
  });
});
