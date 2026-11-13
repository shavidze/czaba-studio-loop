import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ArrangementProvider,
  useArrangementRange,
  useArrangementRangeStore,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  TimeRange,
  WorkspaceCollection,
} from '~/types/arrangement';
import { createArrangement } from '../model';
import { createArrangementRangeStore, selectArrangementClipRange } from '../range-store';
import { studioEditStrings, studioPlaybackStrings } from '../strings';
import { useWorkspaceStatusProbe, type WorkspaceStatusProbeValue } from './helpers/workspace-probe';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const rangeCollection: WorkspaceCollection = {
  id: 'range-store',
  label: 'range-store',
  origin: 'demo',
  sources: [{ id: 'pulse', title: 'Pulse', collectionLabel: 'rs', kind: 'stem', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

const MUSIC_CLIP: ArrangementClip = {
  id: 'm1',
  trackId: 'music',
  sourceId: 'pulse',
  start: 0,
  sourceOffset: 0,
  duration: 16,
};

const SFX_CLIP: ArrangementClip = {
  id: 's1',
  trackId: 'sfx',
  sourceId: 'pulse',
  start: 0,
  sourceOffset: 0,
  duration: 16,
};

function rangeArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: [MUSIC_CLIP, SFX_CLIP] };
}

interface RenderCount {
  renders: number;
}

interface RangeApiRef {
  current: WorkspaceStatusProbeValue | null;
}

function liveApi(api: RangeApiRef): WorkspaceStatusProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function ContextOnlyProbe({ api, count }: { api: RangeApiRef; count: RenderCount }) {
  api.current = useWorkspaceStatusProbe();
  count.renders += 1;
  return null;
}

function RangeProbe({ seen, count }: { seen: { range: TimeRange | null }; count: RenderCount }) {
  seen.range = useArrangementRange((state) => state.range);
  count.renders += 1;
  return null;
}

function ClipRangeProbe({ clip, count }: { clip: ArrangementClip; count: RenderCount }) {
  useArrangementRange((state) => selectArrangementClipRange(state.range, clip));
  count.renders += 1;
  return null;
}

function StoreProbe({ stores }: { stores: ReturnType<typeof useArrangementRangeStore>[] }) {
  stores.push(useArrangementRangeStore());
  return null;
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createArrangementRangeStore', () => {
  it('RS1: starts empty and stores the exact range reference', () => {
    const store = createArrangementRangeStore();
    expect(store.getState().range).toBeNull();
    const next: TimeRange = { start: 1, end: 2, trackId: 'music' };
    store.getState().setRange(next);
    expect(store.getState().range).toBe(next);
  });

  it('RS2: notifies once per new value and not for the same reference', () => {
    const store = createArrangementRangeStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const next: TimeRange = { start: 1, end: 2, trackId: 'music' };
    store.getState().setRange(next);
    expect(listener).toHaveBeenCalledTimes(1);
    store.getState().setRange(next);
    expect(listener).toHaveBeenCalledTimes(1);
    store.getState().setRange(null);
    expect(listener).toHaveBeenCalledTimes(2);
    store.getState().setRange(null);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('RS3: two stores and two providers hold independent ranges', async () => {
    const first = createArrangementRangeStore();
    const second = createArrangementRangeStore();
    first.getState().setRange({ start: 1, end: 2, trackId: 'music' });
    expect(second.getState().range).toBeNull();

    const stores: ReturnType<typeof useArrangementRangeStore>[] = [];
    const firstApi: RangeApiRef = { current: null };
    const firstSeen: { range: TimeRange | null } = { range: null };
    const secondSeen: { range: TimeRange | null } = { range: null };
    render(
      <>
        <ArrangementProvider collection={rangeCollection} initialArrangement={rangeArrangement()}>
          <StoreProbe stores={stores} />
          <ContextOnlyProbe api={firstApi} count={{ renders: 0 }} />
          <RangeProbe seen={firstSeen} count={{ renders: 0 }} />
        </ArrangementProvider>
        <ArrangementProvider collection={rangeCollection} initialArrangement={rangeArrangement()}>
          <StoreProbe stores={stores} />
          <RangeProbe seen={secondSeen} count={{ renders: 0 }} />
        </ArrangementProvider>
      </>,
    );
    await settle();
    expect(new Set(stores).size).toBe(2);
    const next: TimeRange = { start: 3, end: 5, trackId: 'music' };
    act(() => liveApi(firstApi).setTimeRange(next));
    expect(firstSeen.range).toBe(next);
    expect(secondSeen.range).toBeNull();
  });
});

describe('ArrangementProvider range store', () => {
  async function mountProbes() {
    const api: RangeApiRef = { current: null };
    const contextCount: RenderCount = { renders: 0 };
    const rangeCount: RenderCount = { renders: 0 };
    const musicCount: RenderCount = { renders: 0 };
    const sfxCount: RenderCount = { renders: 0 };
    const seen: { range: TimeRange | null } = { range: null };
    render(
      <ArrangementProvider collection={rangeCollection} initialArrangement={rangeArrangement()}>
        <ContextOnlyProbe api={api} count={contextCount} />
        <RangeProbe seen={seen} count={rangeCount} />
        <ClipRangeProbe clip={MUSIC_CLIP} count={musicCount} />
        <ClipRangeProbe clip={SFX_CLIP} count={sfxCount} />
      </ArrangementProvider>,
    );
    await settle();
    return { api, contextCount, rangeCount, musicCount, sfxCount, seen };
  }

  it('RS4: during a pointer gesture setTimeRange does not re-render useArrangement() consumers', async () => {
    const probes = await mountProbes();
    let release: (() => void) | null = null;
    act(() => {
      release = liveApi(probes.api).beginPointerGesture();
    });
    const contextBefore = probes.contextCount.renders;
    const rangeBefore = probes.rangeCount.renders;
    const first: TimeRange = { start: 1, end: 2, trackId: 'music' };
    act(() => liveApi(probes.api).setTimeRange(first));
    expect(probes.contextCount.renders).toBe(contextBefore);
    expect(probes.rangeCount.renders).toBe(rangeBefore + 1);
    expect(probes.seen.range).toBe(first);
    const second: TimeRange = { start: 1, end: 3, trackId: 'music' };
    act(() => liveApi(probes.api).setTimeRange(second));
    expect(probes.contextCount.renders).toBe(contextBefore);
    expect(probes.rangeCount.renders).toBe(rangeBefore + 2);
    expect(probes.seen.range).toBe(second);
    act(() => release?.());
  });

  it('RS5: a clip subscriber re-renders only when the range overlaps its clip', async () => {
    const probes = await mountProbes();
    const sfxBefore = probes.sfxCount.renders;
    const musicBefore = probes.musicCount.renders;
    act(() => liveApi(probes.api).setTimeRange({ start: 1, end: 2, trackId: 'music' }));
    act(() => liveApi(probes.api).setTimeRange({ start: 1, end: 3, trackId: 'music' }));
    act(() => liveApi(probes.api).setTimeRange({ start: 1, end: 4, trackId: 'music' }));
    expect(probes.sfxCount.renders).toBe(sfxBefore);
    expect(probes.musicCount.renders).toBe(musicBefore + 3);
  });

  it('RS6: setTimeRange rewrites a stopped Insert Marker status only outside a pointer gesture', async () => {
    const probes = await mountProbes();
    const stopped = studioPlaybackStrings.insertMarkerAfterStop('00:00.000');
    act(() => liveApi(probes.api).setStatus(stopped));
    expect(liveApi(probes.api).status).toBe(stopped);

    let release: (() => void) | null = null;
    act(() => {
      release = liveApi(probes.api).beginPointerGesture();
    });
    act(() => liveApi(probes.api).setTimeRange({ start: 2, end: 4, trackId: 'music' }));
    expect(liveApi(probes.api).status).toBe(stopped);
    act(() => release?.());

    act(() => liveApi(probes.api).setTimeRange({ start: 3, end: 5, trackId: 'music' }));
    expect(liveApi(probes.api).status).toBe(studioPlaybackStrings.selectionAfterStop('00:03.000'));
  });

  it('RS7: an event-time action reads the range written just before it, with no render between', async () => {
    const probes = await mountProbes();
    const api = liveApi(probes.api);
    act(() => {
      api.setTimeRange({ start: 4, end: 6, trackId: 'music' });
      api.splitSelection();
    });
    const clips = liveApi(probes.api).arrangement.clips.filter((clip) => clip.trackId === 'music');
    expect(clips.map((clip) => [clip.start, clip.duration])).toEqual([
      [0, 4],
      [4, 2],
      [6, 10],
    ]);
    expect(liveApi(probes.api).status).toBe(studioEditStrings.splitRangeDone);
    expect(probes.seen.range).toBeNull();
  });
});
