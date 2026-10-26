import { act, fireEvent, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioEditStrings } from '../strings';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

interface RecordedStart {
  when: number;
  offset: number;
}

const fakeClock = { base: 0 };
const recordedStarts: RecordedStart[] = [];

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
  start(when: number, offset: number) {
    recordedStarts.push({ when, offset });
  }
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

const gapCollection: WorkspaceCollection = {
  id: 'gap',
  label: 'gap',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'gap', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'gap', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function gapArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 2 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
      { id: 'm2', trackId: 'music', sourceId: 'song', start: 12, sourceOffset: 0, duration: 4 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 1, duration: 2 },
    ],
    loop: { start: 6, end: 8, enabled: false },
  };
}

const SINGLE_LANE_DELETE_HINT =
  'Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X';
const ALL_LANE_DELETE_HINT =
  'Delete time selection on all tracks — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X';

function laneTable(arrangement: Arrangement) {
  return arrangement.clips
    .map(
      (clip) =>
        [
          clip.trackId,
          Math.round(clip.start * 1e6) / 1e6,
          Math.round(clip.sourceOffset * 1e6) / 1e6,
          Math.round(clip.duration * 1e6) / 1e6,
        ] as const,
    )
    .sort((left, right) =>
      left[0] === right[0] ? left[1] - right[1] : left[0].localeCompare(right[0]),
    );
}

function providerWrapper({ children }: { children: ReactNode }) {
  return (
    <ArrangementProvider collection={gapCollection} initialArrangement={gapArrangement()}>
      {children}
    </ArrangementProvider>
  );
}

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountGapProvider() {
  const view = renderHook(() => useArrangement(), { wrapper: providerWrapper });
  await flushLoads();
  return view.result;
}

interface GapApiRef {
  current: ArrangementContextValue | null;
}

function GapProbe({ api }: { api: GapApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: GapApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountGapWorkspace() {
  const api: GapApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={gapCollection} initialArrangement={gapArrangement()}>
      <StudioWorkspace />
      <GapProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  return { api, view };
}

function deleteButton(view: ReturnType<typeof render>): HTMLButtonElement {
  const matches = view
    .getAllByRole('button')
    .filter((entry) => entry.textContent === studioEditStrings.deleteButton);
  expect(matches).toHaveLength(1);
  const button = matches[0];
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('delete button missing');
  }
  return button;
}

const MUSIC_RANGE = { start: 3, end: 5, trackId: 'music' };

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  recordedStarts.length = 0;
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

describe('deleteSelection on a range keeps the gap (SRW-24, R24-1)', () => {
  it('cuts only the window, keeps the playhead and the loop, and is one exact Undo/Redo step', async () => {
    const result = await mountGapProvider();
    const initial = result.current.arrangement;
    act(() => result.current.seekTo(7));
    act(() => result.current.setTimeRange(MUSIC_RANGE));
    act(() => result.current.deleteSelection());
    const deleted = result.current.arrangement;
    expect(result.current.undoLabel).toBe(studioEditStrings.historyDeleteRange);
    expect(laneTable(deleted)).toEqual([
      ['music', 0, 0, 3],
      ['music', 5, 5, 5],
      ['music', 12, 0, 4],
      ['sfx', 4, 1, 2],
      ['video', 0, 0, 2],
    ]);
    expect(result.current.getLivePosition()).toBe(7);
    expect(deleted.loop).toEqual({ start: 6, end: 8, enabled: false });
    expect(result.current.range).toBeNull();
    expect(result.current.selectedClipIds).toEqual([]);
    expect(result.current.status).toBe(
      studioEditStrings.deleteRangeDone({
        start: '00:03.000',
        end: '00:05.000',
        lanes: studioEditStrings.onTrack('მუსიკა'),
      }),
    );
    act(() => result.current.undo());
    expect(result.current.arrangement).toEqual(initial);
    expect(result.current.undoLabel).toBeNull();
    expect(result.current.getLivePosition()).toBe(7);
    act(() => result.current.redo());
    expect(result.current.arrangement).toEqual(deleted);
    expect(result.current.getLivePosition()).toBe(7);
  });

  it('does not jump or stop the playhead while playing and reschedules the right part once', async () => {
    vi.useFakeTimers();
    fakeClock.base = Date.now() / 1000;
    const result = await mountGapProvider();
    act(() => result.current.seekTo(7));
    act(() => result.current.togglePlayback());
    expect(result.current.isPlaying).toBe(true);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    const beforeEdit = result.current.getLivePosition();
    const startsBefore = recordedStarts.length;
    act(() => result.current.setTimeRange(MUSIC_RANGE));
    act(() => result.current.deleteSelection());
    const afterEdit = result.current.getLivePosition();
    expect(result.current.isPlaying).toBe(true);
    expect(afterEdit).toBeGreaterThanOrEqual(beforeEdit - 1e-6);
    expect(afterEdit - beforeEdit).toBeLessThan(0.05);
    const rescheduled = recordedStarts
      .slice(startsBefore)
      .filter((start) => Math.abs(start.offset - afterEdit) < 0.1);
    expect(rescheduled).toHaveLength(1);
    act(() => result.current.togglePlayback());
  });

  it('refuses a window without material: no history entry, the range stays', async () => {
    const result = await mountGapProvider();
    const initial = result.current.arrangement;
    const empty = { start: 10.5, end: 11.5, trackId: 'music' };
    act(() => result.current.setTimeRange(empty));
    act(() => result.current.deleteSelection());
    expect(result.current.arrangement).toBe(initial);
    expect(result.current.undoLabel).toBeNull();
    expect(result.current.range).toEqual(empty);
    expect(result.current.status).toBe(studioEditStrings.deleteRangeEmpty);
    const point = { start: 4.5, end: 4.5, trackId: 'music' };
    act(() => result.current.setTimeRange(point));
    act(() => result.current.deleteSelection());
    expect(result.current.arrangement).toBe(initial);
    expect(result.current.undoLabel).toBeNull();
    expect(result.current.range).toEqual(point);
  });
});

describe('extendRangeToAllTracks (SRW-24, R24-2)', () => {
  it('sets the flag without an edit, is idempotent, and refuses without a range or during a gesture', async () => {
    const result = await mountGapProvider();
    const initial = result.current.arrangement;
    act(() => result.current.extendRangeToAllTracks());
    expect(result.current.range).toBeNull();
    expect(result.current.status).toBe(studioEditStrings.extendNeedsRange);
    act(() => result.current.setTimeRange(MUSIC_RANGE));
    const release = result.current.claimPointerGesture(4, () => undefined);
    act(() => result.current.extendRangeToAllTracks());
    expect(result.current.status).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
    expect(result.current.range).toEqual(MUSIC_RANGE);
    act(() => release?.());
    act(() => result.current.extendRangeToAllTracks());
    expect(result.current.range).toEqual({ ...MUSIC_RANGE, allTracks: true });
    expect(result.current.status).toBe(
      studioEditStrings.extendDone({ start: '00:03.000', end: '00:05.000' }),
    );
    act(() => result.current.setStatus('ready'));
    act(() => result.current.extendRangeToAllTracks());
    expect(result.current.range).toEqual({ ...MUSIC_RANGE, allTracks: true });
    expect(result.current.status).toBe(
      studioEditStrings.extendDone({ start: '00:03.000', end: '00:05.000' }),
    );
    expect(result.current.arrangement).toBe(initial);
    expect(result.current.undoLabel).toBeNull();
  });

  it('deletes the window on every lane, keeps later starts and restores every lane with one Undo', async () => {
    const result = await mountGapProvider();
    const initial = result.current.arrangement;
    act(() => result.current.setTimeRange({ start: 1, end: 5, trackId: 'music' }));
    act(() => result.current.extendRangeToAllTracks());
    act(() => result.current.deleteSelection());
    expect(result.current.undoLabel).toBe(studioEditStrings.historyDeleteRangeAllTracks);
    expect(laneTable(result.current.arrangement)).toEqual([
      ['music', 0, 0, 1],
      ['music', 5, 5, 5],
      ['music', 12, 0, 4],
      ['sfx', 5, 2, 1],
      ['video', 0, 0, 1],
    ]);
    expect(result.current.status).toBe(
      studioEditStrings.deleteRangeDone({
        start: '00:01.000',
        end: '00:05.000',
        lanes: studioEditStrings.onAllTracks,
      }),
    );
    act(() => result.current.undo());
    expect(result.current.arrangement).toEqual(initial);
  });

  it('refuses Split on an all-lane range and keeps the range', async () => {
    const result = await mountGapProvider();
    const initial = result.current.arrangement;
    act(() => result.current.setTimeRange(MUSIC_RANGE));
    act(() => result.current.extendRangeToAllTracks());
    act(() => result.current.splitSelection());
    expect(result.current.status).toBe(studioEditStrings.splitAllTracksRefused);
    expect(result.current.arrangement).toBe(initial);
    expect(result.current.undoLabel).toBeNull();
    expect(result.current.range).toEqual({ ...MUSIC_RANGE, allTracks: true });
  });

  it('Ctrl+X on an all-lane range leaves gaps on every lane and pastes back on the original lanes', async () => {
    const result = await mountGapProvider();
    act(() => result.current.setTimeRange(MUSIC_RANGE));
    act(() => result.current.extendRangeToAllTracks());
    act(() => result.current.cutSelection());
    expect(result.current.undoLabel).toBe('Cut');
    expect(laneTable(result.current.arrangement)).toEqual([
      ['music', 0, 0, 3],
      ['music', 5, 5, 5],
      ['music', 12, 0, 4],
      ['sfx', 5, 2, 1],
      ['video', 0, 0, 2],
    ]);
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.seekTo(30));
    act(() => result.current.pasteClipboard());
    expect(result.current.undoLabel).toBe(studioEditStrings.historyPaste(2));
    const pasted = result.current.arrangement.clips
      .filter((clip) => result.current.selectedClipIds.includes(clip.id))
      .map((clip) => [clip.trackId, clip.start, clip.sourceOffset, clip.duration])
      .sort((left, right) => String(left[0]).localeCompare(String(right[0])));
    expect(pasted).toEqual([
      ['music', 30, 3, 2],
      ['sfx', 31, 1, 1],
    ]);
  });
});

describe('Delete keys, Ctrl+Shift+L and the all-lane overlay in the workspace (SRW-24)', () => {
  it('Delete, Backspace, Shift+Delete and Shift+Backspace each leave a gap', async () => {
    const { api } = await mountGapWorkspace();
    const initial = live(api).arrangement;
    for (const keys of [
      { key: 'Delete', code: 'Delete', shiftKey: false },
      { key: 'Backspace', code: 'Backspace', shiftKey: false },
      { key: 'Delete', code: 'Delete', shiftKey: true },
      { key: 'Backspace', code: 'Backspace', shiftKey: true },
    ]) {
      act(() => live(api).setTimeRange(MUSIC_RANGE));
      fireEvent.keyDown(document.body, keys);
      expect(live(api).undoLabel).toBe(studioEditStrings.historyDeleteRange);
      expect(laneTable(live(api).arrangement)).toEqual([
        ['music', 0, 0, 3],
        ['music', 5, 5, 5],
        ['music', 12, 0, 4],
        ['sfx', 4, 1, 2],
        ['video', 0, 0, 2],
      ]);
      act(() => live(api).undo());
      expect(live(api).arrangement).toEqual(initial);
    }
  });

  it('Ctrl+Shift+L sets the flag without toggling the loop; Ctrl+L still toggles the loop', async () => {
    const { api } = await mountGapWorkspace();
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    fireEvent.keyDown(document.body, { key: 'L', code: 'KeyL', ctrlKey: true, shiftKey: true });
    expect(live(api).range).toEqual({ ...MUSIC_RANGE, allTracks: true });
    expect(live(api).arrangement.loop).toEqual({ start: 6, end: 8, enabled: false });
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    fireEvent.keyDown(document.body, { key: 'l', code: 'KeyL', ctrlKey: true });
    expect(live(api).arrangement.loop).toEqual({ start: 3, end: 5, enabled: true });
    expect(live(api).range?.allTracks).toBeUndefined();
  });

  it('Ctrl+Shift+X still closes the gap on every lane', async () => {
    const { api } = await mountGapWorkspace();
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    fireEvent.keyDown(document.body, { key: 'X', code: 'KeyX', ctrlKey: true, shiftKey: true });
    expect(live(api).undoLabel).toBe('Cut Time');
    const starts = Object.fromEntries(
      live(api).arrangement.clips.map((clip) => [clip.id, clip.start]),
    );
    expect(starts.m2).toBe(10);
    expect(live(api).arrangement.loop).toEqual({ start: 4, end: 6, enabled: false });
    const singleLaneResult = laneTable(live(api).arrangement);
    act(() => live(api).undo());
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    fireEvent.keyDown(document.body, { key: 'L', code: 'KeyL', ctrlKey: true, shiftKey: true });
    expect(live(api).range?.allTracks).toBe(true);
    fireEvent.keyDown(document.body, { key: 'X', code: 'KeyX', ctrlKey: true, shiftKey: true });
    expect(live(api).undoLabel).toBe('Cut Time');
    expect(laneTable(live(api).arrangement)).toEqual(singleLaneResult);
  });

  it('Backspace in the detail number input or the library search and Delete without a selection change no clip', async () => {
    const { api, view } = await mountGapWorkspace();
    const initial = live(api).arrangement;
    act(() => live(api).selectClip('m1'));
    fireEvent.click(view.getByTestId('arrangement-detail-toggle'));
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    const start = view.getByTestId('arrangement-detail-start');
    start.focus();
    fireEvent.keyDown(start, { key: 'Backspace', code: 'Backspace' });
    const search = view.getByTestId('arrangement-library-search');
    search.focus();
    fireEvent.keyDown(search, { key: 'Backspace', code: 'Backspace' });
    fireEvent.keyDown(search, { key: 'Delete', code: 'Delete' });
    expect(live(api).arrangement).toBe(initial);
    expect(live(api).undoLabel).toBeNull();
    act(() => live(api).setTimeRange(null));
    act(() => live(api).selectClip(null));
    search.blur();
    fireEvent.keyDown(document.body, { key: 'Delete', code: 'Delete' });
    expect(live(api).arrangement).toBe(initial);
    expect(live(api).undoLabel).toBeNull();
    expect(view.getByTestId('arrangement-status').textContent).toBe(
      studioEditStrings.deleteNeedsTarget,
    );
  });

  it('after Ctrl+Shift+L every lane shows one overlay, the label once, and no clip-level overlay', async () => {
    const { api, view } = await mountGapWorkspace();
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    const clipOverlays = () => view.container.querySelectorAll('[data-clip-id] .border-x-2');
    expect(clipOverlays()).toHaveLength(1);
    expect(view.queryAllByTestId('arrangement-lane-range')).toHaveLength(0);
    fireEvent.keyDown(document.body, { key: 'L', code: 'KeyL', ctrlKey: true, shiftKey: true });
    const rows = Array.from(view.container.querySelectorAll<HTMLElement>('[data-track-id]'));
    expect(rows.map((row) => row.dataset.trackId)).toEqual(['video', 'music', 'sfx']);
    for (const row of rows) {
      const overlays = row.querySelectorAll<HTMLElement>('[data-testid="arrangement-lane-range"]');
      expect(overlays).toHaveLength(1);
      expect(overlays[0].dataset.rangeStart).toBe('3.000');
      expect(overlays[0].dataset.rangeEnd).toBe('5.000');
      expect(overlays[0].getAttribute('aria-hidden')).toBe('true');
      expect(overlays[0].className).toContain('pointer-events-none');
    }
    const labels = view.getAllByText(/all tracks$/);
    expect(labels).toHaveLength(1);
    expect(labels[0].closest('[data-track-id]')?.getAttribute('data-track-id')).toBe('music');
    expect(labels[0].textContent).toBe('00:03.000 – 00:05.000 · 2.000 s · all tracks');
    expect(clipOverlays()).toHaveLength(0);
  });

  it('titles the transport delete button for a clip, a range and an all-lane range', async () => {
    const { api, view } = await mountGapWorkspace();
    act(() => live(api).selectClip('m1'));
    expect(deleteButton(view).title).toBe('Delete clip — leaves a gap (Delete)');
    act(() => live(api).setTimeRange(MUSIC_RANGE));
    expect(deleteButton(view).title).toBe(SINGLE_LANE_DELETE_HINT);
    expect(deleteButton(view).getAttribute('aria-label')).toBe(SINGLE_LANE_DELETE_HINT);
    fireEvent.keyDown(document.body, { key: 'L', code: 'KeyL', ctrlKey: true, shiftKey: true });
    expect(deleteButton(view).title).toBe(ALL_LANE_DELETE_HINT);
    expect(deleteButton(view).getAttribute('aria-label')).toBe(ALL_LANE_DELETE_HINT);
    fireEvent.click(deleteButton(view));
    expect(live(api).undoLabel).toBe(studioEditStrings.historyDeleteRangeAllTracks);
    expect(live(api).arrangement.clips.find((clip) => clip.id === 'm2')?.start).toBe(12);
  });
});
