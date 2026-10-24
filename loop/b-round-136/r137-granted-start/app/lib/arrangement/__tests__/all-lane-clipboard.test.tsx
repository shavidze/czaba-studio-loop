import { act, fireEvent, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { copyRangeToClipboard, planClipboardPaste } from '../clipboard';
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

const laneCollection: WorkspaceCollection = {
  id: 'lanes',
  label: 'lanes',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'lanes', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'lanes', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

function laneArrangement(extra: ArrangementClip[] = []): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 16 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
      ...extra,
    ],
    loop: null,
  };
}

function pureArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 6 },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 16 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
    ],
    loop: null,
  };
}

const anySource = () => true;

async function flushLoads() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountLaneProvider(extra: ArrangementClip[] = []) {
  const initial = laneArrangement(extra);
  const view = renderHook(() => useArrangement(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ArrangementProvider collection={laneCollection} initialArrangement={initial}>
        {children}
      </ArrangementProvider>
    ),
  });
  await flushLoads();
  return view.result;
}

interface LaneApiRef {
  current: ArrangementContextValue | null;
}

function LaneProbe({ api }: { api: LaneApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: LaneApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountLaneWorkspace() {
  const api: LaneApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={laneCollection} initialArrangement={laneArrangement()}>
      <StudioWorkspace />
      <LaneProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads();
  return { api, view };
}

function selectedParts(value: ArrangementContextValue) {
  return value.arrangement.clips
    .filter((clip) => value.selectedClipIds.includes(clip.id))
    .map((clip) => ({
      trackId: clip.trackId,
      start: Math.round(clip.start * 1e6) / 1e6,
      sourceOffset: Math.round(clip.sourceOffset * 1e6) / 1e6,
      duration: Math.round(clip.duration * 1e6) / 1e6,
    }));
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('all-lane clipboard provenance in the pure helpers (SRW-24, C-R28-01)', () => {
  it('an all-lane range on music only is flagged and pastes back on music, not the active lane', () => {
    const arrangement = pureArrangement();
    const clipboard = copyRangeToClipboard(arrangement, {
      start: 20,
      end: 22,
      trackId: 'music',
      allTracks: true,
    });
    expect(clipboard?.allTracks).toBe(true);
    expect(clipboard?.items).toEqual([
      { trackId: 'music', sourceId: 'song', offset: 0, sourceOffset: 13, duration: 2 },
    ]);
    const plan = planClipboardPaste(arrangement, clipboard, {
      at: 30,
      activeTrackId: 'sfx',
      isSourceAvailable: anySource,
    });
    expect(plan.refusal).toBeNull();
    expect(plan.trackId).toBeNull();
    const pasted = plan.arrangement?.clips.filter((clip) => plan.clipIds.includes(clip.id));
    expect(pasted).toHaveLength(1);
    expect(pasted?.[0]).toMatchObject({ trackId: 'music', start: 30, sourceOffset: 13 });
  });

  it('the same material from a single-lane range still goes to the active audio lane (D-25)', () => {
    const arrangement = pureArrangement();
    const clipboard = copyRangeToClipboard(arrangement, { start: 20, end: 22, trackId: 'music' });
    const plan = planClipboardPaste(arrangement, clipboard, {
      at: 30,
      activeTrackId: 'sfx',
      isSourceAvailable: anySource,
    });
    expect(plan.trackId).toBe('sfx');
    const pasted = plan.arrangement?.clips.filter((clip) => plan.clipIds.includes(clip.id));
    expect(pasted?.[0]).toMatchObject({ trackId: 'sfx', start: 30, sourceOffset: 13 });
  });

  it('a single-lane range clipboard has no own provenance property at all', () => {
    const clipboard = copyRangeToClipboard(pureArrangement(), {
      start: 20,
      end: 22,
      trackId: 'music',
    });
    expect(clipboard).not.toBeNull();
    expect(Object.hasOwn(clipboard ?? {}, 'allTracks')).toBe(false);
  });

  it('a flagged video part stays on video, and overlap and a missing lane still refuse', () => {
    const arrangement = pureArrangement();
    const clipboard = copyRangeToClipboard(arrangement, {
      start: 1,
      end: 3,
      trackId: 'music',
      allTracks: true,
    });
    expect(clipboard?.allTracks).toBe(true);
    expect(clipboard?.items.map((item) => item.trackId)).toEqual(['video']);
    const plan = planClipboardPaste(arrangement, clipboard, {
      at: 30,
      activeTrackId: 'sfx',
      isSourceAvailable: anySource,
    });
    expect(plan.refusal).toBeNull();
    const pasted = plan.arrangement?.clips.filter((clip) => plan.clipIds.includes(clip.id));
    expect(pasted?.[0]).toMatchObject({ trackId: 'video', start: 30, sourceOffset: 1 });

    const musicClipboard = copyRangeToClipboard(arrangement, {
      start: 20,
      end: 22,
      trackId: 'music',
      allTracks: true,
    });
    const overlap = planClipboardPaste(arrangement, musicClipboard, {
      at: 10,
      activeTrackId: 'sfx',
      isSourceAvailable: anySource,
    });
    expect(overlap.arrangement).toBeNull();
    expect(overlap.refusal).toBe('overlap');
    expect(overlap.conflict).toMatchObject({ trackId: 'music', occupantId: 'm1' });

    const withoutMusic: Arrangement = {
      ...arrangement,
      tracks: arrangement.tracks.filter((track) => track.id !== 'music'),
      clips: arrangement.clips.filter((clip) => clip.trackId !== 'music'),
    };
    expect(
      planClipboardPaste(withoutMusic, musicClipboard, {
        at: 30,
        activeTrackId: 'sfx',
        isSourceAvailable: anySource,
      }).refusal,
    ).toBe('missing');
  });
});

describe('the provider keeps all-lane material on its lanes (SRW-24, C-R28-01)', () => {
  it('all-lane Ctrl+X then Ctrl+V with SFX active puts the part back on music (C repro)', async () => {
    const result = await mountLaneProvider();
    act(() => result.current.setTimeRange({ start: 20, end: 22, trackId: 'music' }));
    act(() => result.current.extendRangeToAllTracks());
    act(() => result.current.cutSelection());
    expect(result.current.undoLabel).toBe('Cut');
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.seekTo(20));
    act(() => result.current.pasteClipboard());
    expect(result.current.undoLabel).toBe(studioEditStrings.historyPaste(1));
    expect(selectedParts(result.current)).toEqual([
      { trackId: 'music', start: 20, sourceOffset: 13, duration: 2 },
    ]);
    expect(result.current.arrangement.clips.filter((clip) => clip.trackId === 'sfx')).toHaveLength(
      1,
    );
    expect(result.current.status).toBe(
      studioEditStrings.pasteDone({ count: 1, at: '00:20.000', trackSuffix: '' }),
    );
    expect(result.current.status).not.toContain(studioEditStrings.onTrack('SFX'));
  });

  it('all-lane Ctrl+C then Ctrl+V with SFX active pastes on music', async () => {
    const result = await mountLaneProvider();
    act(() => result.current.setTimeRange({ start: 20, end: 22, trackId: 'music' }));
    act(() => result.current.extendRangeToAllTracks());
    act(() => result.current.copySelection());
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.seekTo(26));
    act(() => result.current.pasteClipboard());
    expect(result.current.undoLabel).toBe(studioEditStrings.historyPaste(1));
    expect(selectedParts(result.current)).toEqual([
      { trackId: 'music', start: 26, sourceOffset: 13, duration: 2 },
    ]);
    expect(result.current.status).not.toContain(studioEditStrings.onTrack('SFX'));
  });

  it('Cut Time on a window with material on music only pastes back on music', async () => {
    const result = await mountLaneProvider();
    act(() => result.current.setTimeRange({ start: 14, end: 16, trackId: 'music' }));
    act(() => result.current.cutTimeSelection());
    expect(result.current.undoLabel).toBe('Cut Time');
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.seekTo(30));
    act(() => result.current.pasteClipboard());
    expect(result.current.undoLabel).toBe(studioEditStrings.historyPaste(1));
    expect(selectedParts(result.current)).toEqual([
      { trackId: 'music', start: 30, sourceOffset: 7, duration: 2 },
    ]);
  });

  it('a single-lane Ctrl+X on music still pastes onto the active SFX lane (D-25)', async () => {
    const result = await mountLaneProvider();
    act(() => result.current.setTimeRange({ start: 20, end: 22, trackId: 'music' }));
    act(() => result.current.cutSelection());
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.seekTo(20));
    act(() => result.current.pasteClipboard());
    expect(selectedParts(result.current)).toEqual([
      { trackId: 'sfx', start: 20, sourceOffset: 13, duration: 2 },
    ]);
    expect(result.current.status).toBe(
      studioEditStrings.pasteDone({
        count: 1,
        at: '00:20.000',
        trackSuffix: studioEditStrings.pasteTrackSuffix('SFX'),
      }),
    );
  });
});

describe('Cut Time that changes nothing is an honest no-op (SRW-24, C-R28-02)', () => {
  it('a zero-width range keeps history, playhead, range, selection and clipboard', async () => {
    const result = await mountLaneProvider();
    act(() => result.current.selectClip('s1'));
    act(() => result.current.copySelection());
    act(() => result.current.seekTo(20));
    const point = { start: 15, end: 15, trackId: 'music' };
    act(() => result.current.setTimeRange(point));
    const before = result.current.arrangement;
    const selection = result.current.selectedClipIds;
    act(() => result.current.cutTimeSelection());
    expect(result.current.undoLabel).toBeNull();
    expect(result.current.getLivePosition()).toBe(20);
    expect(result.current.range).toEqual(point);
    expect(result.current.selectedClipIds).toEqual(selection);
    expect(result.current.arrangement).toBe(before);
    expect(result.current.status).toContain('the clipboard did not change');
    expect(result.current.status).not.toContain('the gap was closed');
    expect(result.current.status).toBe(
      studioEditStrings.cutTimeNothing({ start: '00:15.000', end: '00:15.000' }),
    );
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.pasteClipboard());
    expect(result.current.undoLabel).toBe(studioEditStrings.historyPaste(1));
    expect(selectedParts(result.current)).toEqual([
      { trackId: 'sfx', start: 20, sourceOffset: 0, duration: 2 },
    ]);
  });

  it('a window with nothing at or after it keeps a stopped playhead after the window', async () => {
    const result = await mountLaneProvider();
    act(() => result.current.selectClip('s1'));
    act(() => result.current.copySelection());
    act(() => result.current.seekTo(45));
    const empty = { start: 40, end: 41, trackId: 'music' };
    act(() => result.current.setTimeRange(empty));
    const before = result.current.arrangement;
    const selection = result.current.selectedClipIds;
    act(() => result.current.cutTimeSelection());
    expect(result.current.undoLabel).toBeNull();
    expect(result.current.getLivePosition()).toBe(45);
    expect(result.current.range).toEqual(empty);
    expect(result.current.selectedClipIds).toEqual(selection);
    expect(result.current.arrangement).toBe(before);
    expect(result.current.status).toContain('the clipboard did not change');
    expect(result.current.status).not.toContain('the gap was closed');
    act(() => result.current.setActiveTrack('sfx'));
    act(() => result.current.pasteClipboard());
    expect(selectedParts(result.current)).toEqual([
      { trackId: 'sfx', start: 45, sourceOffset: 0, duration: 2 },
    ]);
  });

  it('Undo right after a no-op Cut Time undoes the previous edit', async () => {
    const result = await mountLaneProvider();
    const initial = result.current.arrangement;
    act(() => result.current.setTimeRange({ start: 20, end: 22, trackId: 'music' }));
    act(() => result.current.cutSelection());
    expect(result.current.undoLabel).toBe('Cut');
    const afterCut = result.current.arrangement;
    act(() => result.current.setTimeRange({ start: 40, end: 41, trackId: 'music' }));
    act(() => result.current.cutTimeSelection());
    expect(result.current.undoLabel).toBe('Cut');
    expect(result.current.arrangement).toBe(afterCut);
    act(() => result.current.undo());
    expect(result.current.arrangement).toEqual(initial);
    expect(result.current.undoLabel).toBeNull();
  });

  it('a silent window with a later clip still closes time and remaps a stopped playhead', async () => {
    const result = await mountLaneProvider([
      { id: 'm2', trackId: 'music', sourceId: 'song', start: 28, sourceOffset: 0, duration: 2 },
    ]);
    act(() => result.current.seekTo(35));
    act(() => result.current.setTimeRange({ start: 24, end: 26, trackId: 'music' }));
    act(() => result.current.cutTimeSelection());
    expect(result.current.undoLabel).toBe('Cut Time');
    expect(result.current.arrangement.clips.find((clip) => clip.id === 'm2')?.start).toBe(26);
    expect(result.current.getLivePosition()).toBe(33);
    expect(result.current.range).toBeNull();
    expect(result.current.status).toBe(
      studioEditStrings.cutTimeDone({
        start: '00:24.000',
        end: '00:26.000',
        clipboard: studioEditStrings.cutTimeNoSound,
        suffix: '',
      }),
    );
    act(() => result.current.undo());
    expect(result.current.arrangement.clips.find((clip) => clip.id === 'm2')?.start).toBe(28);
    expect(result.current.undoLabel).toBeNull();
  });
});

describe('the footer names the all-lane range (SRW-24, A-R28-REVIEW-4)', () => {
  it('after Ctrl+Shift+L the range line says ყველა ხაზი', async () => {
    const { api, view } = await mountLaneWorkspace();
    act(() => live(api).setTimeRange({ start: 3, end: 5, trackId: 'music' }));
    fireEvent.keyDown(document.body, { key: 'L', code: 'KeyL', ctrlKey: true, shiftKey: true });
    expect(live(api).range?.allTracks).toBe(true);
    expect(view.getByTestId('arrangement-range-all-lanes')).toBeTruthy();
    const line = view.getByTestId('arrangement-range').textContent ?? '';
    expect(line).toContain('ყველა ხაზი');
    expect(line).toContain(
      'სიგრძე 00:02.000 · ყველა ხაზი · Delete = წაშლა, სიცარიელე რჩება · Ctrl+Shift+X = Cut Time',
    );
  });

  it('a single-lane range line has no all-lane label', async () => {
    const { api, view } = await mountLaneWorkspace();
    act(() => live(api).setTimeRange({ start: 3, end: 5, trackId: 'music' }));
    expect(view.queryByTestId('arrangement-range-all-lanes')).toBeNull();
    const line = view.getByTestId('arrangement-range').textContent ?? '';
    expect(line).not.toContain('ყველა ხაზი');
    expect(line).toBe(
      'მონიშვნა: 00:03.000 — 00:05.000 · სიგრძე 00:02.000 · Delete = წაშლა, სიცარიელე რჩება · Ctrl+Shift+X = Cut Time',
    );
  });
});
