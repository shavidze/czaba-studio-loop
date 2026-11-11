import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementActiveTrackId,
  useArrangementSelection,
  useArrangementSelectionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import {
  type ArrangementSelectionStore,
  createArrangementSelectionStore,
  NO_SELECTION,
} from '../selection-store';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const selectionCollection: WorkspaceCollection = {
  id: 'selection-store',
  label: 'selection-store',
  origin: 'demo',
  sources: [{ id: 'pulse', title: 'Pulse', collectionLabel: 'ss', kind: 'stem', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

const FIRST_CLIP: ArrangementClip = {
  id: 'm1',
  trackId: 'music',
  sourceId: 'pulse',
  start: 0,
  sourceOffset: 0,
  duration: 4,
};

const SECOND_CLIP: ArrangementClip = {
  id: 'm2',
  trackId: 'music',
  sourceId: 'pulse',
  start: 8,
  sourceOffset: 0,
  duration: 4,
};

function selectionArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: [FIRST_CLIP, SECOND_CLIP] };
}

interface RenderCount {
  renders: number;
}

interface SelectionApiRef {
  current: ArrangementContextValue | null;
}

function liveApi(api: SelectionApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function ContextOnlyProbe({ api, count }: { api: SelectionApiRef; count: RenderCount }) {
  api.current = useArrangement();
  count.renders += 1;
  return null;
}

function SelectionProbe({ seen, count }: { seen: { ids: readonly string[] }; count: RenderCount }) {
  seen.ids = useArrangementSelection((state) => state.selectedClipIds);
  count.renders += 1;
  return null;
}

function SelectionStoreProbe({ stores }: { stores: ArrangementSelectionStore[] }) {
  stores.push(useArrangementSelectionStore());
  return null;
}

function ActiveTrackProbe({ seen, count }: { seen: { id: string | null }; count: RenderCount }) {
  seen.id = useArrangementActiveTrackId();
  count.renders += 1;
  return null;
}

async function settle() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function mountSelectionProbes() {
  const api: SelectionApiRef = { current: null };
  const contextCount: RenderCount = { renders: 0 };
  const selectionCount: RenderCount = { renders: 0 };
  const seen: { ids: readonly string[] } = { ids: NO_SELECTION };
  render(
    <ArrangementProvider
      collection={selectionCollection}
      initialArrangement={selectionArrangement()}
    >
      <ContextOnlyProbe api={api} count={contextCount} />
      <SelectionProbe seen={seen} count={selectionCount} />
    </ArrangementProvider>,
  );
  await settle();
  return { api, contextCount, selectionCount, seen };
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

describe('createArrangementSelectionStore', () => {
  it('SS1: starts at NO_SELECTION and stores new content by reference', () => {
    const store = createArrangementSelectionStore();
    expect(store.getState().selectedClipIds).toBe(NO_SELECTION);
    const next = ['a', 'b'];
    store.getState().setSelectedClipIds(next);
    expect(store.getState().selectedClipIds).toBe(next);
  });

  it('SS2: keeps the old reference for the same ordered ids and notifies on a new order', () => {
    const store = createArrangementSelectionStore();
    const first = ['a', 'b'];
    store.getState().setSelectedClipIds(first);
    const listener = vi.fn();
    store.subscribe(listener);
    store.getState().setSelectedClipIds(['a', 'b']);
    expect(store.getState().selectedClipIds).toBe(first);
    expect(listener).toHaveBeenCalledTimes(0);
    const reordered = ['b', 'a'];
    store.getState().setSelectedClipIds(reordered);
    expect(store.getState().selectedClipIds).toBe(reordered);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('SS3: two stores and two providers hold independent selections', async () => {
    const first = createArrangementSelectionStore();
    const second = createArrangementSelectionStore();
    first.getState().setSelectedClipIds(['a']);
    expect(second.getState().selectedClipIds).toBe(NO_SELECTION);

    const stores: ArrangementSelectionStore[] = [];
    const firstApi: SelectionApiRef = { current: null };
    const firstSeen: { ids: readonly string[] } = { ids: NO_SELECTION };
    const secondSeen: { ids: readonly string[] } = { ids: NO_SELECTION };
    render(
      <>
        <ArrangementProvider
          collection={selectionCollection}
          initialArrangement={selectionArrangement()}
        >
          <SelectionStoreProbe stores={stores} />
          <ContextOnlyProbe api={firstApi} count={{ renders: 0 }} />
          <SelectionProbe seen={firstSeen} count={{ renders: 0 }} />
        </ArrangementProvider>
        <ArrangementProvider
          collection={selectionCollection}
          initialArrangement={selectionArrangement()}
        >
          <SelectionStoreProbe stores={stores} />
          <SelectionProbe seen={secondSeen} count={{ renders: 0 }} />
        </ArrangementProvider>
      </>,
    );
    await settle();
    expect(new Set(stores).size).toBe(2);
    act(() => liveApi(firstApi).selectClip('m1'));
    expect(firstSeen.ids).toEqual(['m1']);
    expect(secondSeen.ids).toEqual([]);
  });
});

describe('ArrangementProvider selection store', () => {
  it('SS4: moving the selection between two clips on one track re-renders only the selection subscriber', async () => {
    const probes = await mountSelectionProbes();
    act(() => liveApi(probes.api).selectClip('m1'));
    expect(probes.seen.ids).toEqual(['m1']);
    const contextBefore = probes.contextCount.renders;
    const selectionBefore = probes.selectionCount.renders;
    act(() => liveApi(probes.api).selectClip('m2'));
    expect(probes.seen.ids).toEqual(['m2']);
    expect(probes.contextCount.renders).toBe(contextBefore);
    expect(probes.selectionCount.renders).toBe(selectionBefore + 1);
  });

  it('SS5: selecting the already-selected clip renders neither probe', async () => {
    const probes = await mountSelectionProbes();
    act(() => liveApi(probes.api).selectClip('m1'));
    const selectedIds = probes.seen.ids;
    const contextBefore = probes.contextCount.renders;
    const selectionBefore = probes.selectionCount.renders;
    act(() => liveApi(probes.api).selectClip('m1'));
    expect(probes.seen.ids).toBe(selectedIds);
    expect(probes.contextCount.renders).toBe(contextBefore);
    expect(probes.selectionCount.renders).toBe(selectionBefore);
  });

  it('SS6: an event-time delete right after a selection change uses the new selection', async () => {
    const probes = await mountSelectionProbes();
    act(() => {
      liveApi(probes.api).selectClip('m2');
      liveApi(probes.api).deleteSelection();
    });
    expect(liveApi(probes.api).arrangement.clips.map((clip) => clip.id)).toEqual(['m1']);
  });

  it('SS7: the primary clip is the last one added, and re-adding a clip moves it to the end', async () => {
    const probes = await mountSelectionProbes();
    act(() => liveApi(probes.api).toggleClipSelection('m1', 'add'));
    act(() => liveApi(probes.api).toggleClipSelection('m2', 'add'));
    expect(liveApi(probes.api).getSelectedClipIds()).toEqual(['m1', 'm2']);
    expect(liveApi(probes.api).getSelectedClipIds().at(-1)).toBe('m2');
    act(() => liveApi(probes.api).toggleClipSelection('m1', 'add'));
    expect(liveApi(probes.api).getSelectedClipIds()).toEqual(['m2', 'm1']);
    expect(liveApi(probes.api).getSelectedClipIds().at(-1)).toBe('m1');
    expect(probes.seen.ids).toEqual(['m2', 'm1']);
  });
});

describe('PERF-10b-i active track in the selection store', () => {
  async function mountActiveTrackProbes() {
    const api: SelectionApiRef = { current: null };
    const contextCount: RenderCount = { renders: 0 };
    const activeCount: RenderCount = { renders: 0 };
    const seen: { id: string | null } = { id: null };
    render(
      <ArrangementProvider
        collection={selectionCollection}
        initialArrangement={selectionArrangement()}
      >
        <ContextOnlyProbe api={api} count={contextCount} />
        <ActiveTrackProbe seen={seen} count={activeCount} />
      </ArrangementProvider>,
    );
    await settle();
    return { api, contextCount, activeCount, seen };
  }

  it('SS8: changing the active track re-renders its subscriber once and not the context consumer', async () => {
    const probes = await mountActiveTrackProbes();
    const contextBefore = probes.contextCount.renders;
    const activeBefore = probes.activeCount.renders;
    act(() => liveApi(probes.api).setActiveTrack('sfx'));
    expect(probes.seen.id).toBe('sfx');
    expect(probes.activeCount.renders).toBe(activeBefore + 1);
    expect(probes.contextCount.renders).toBe(contextBefore);
  });

  it('SS9: setting the same active track does not notify store listeners', () => {
    const store = createArrangementSelectionStore(NO_SELECTION, 'music');
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.getState().setActiveTrackId('music');
    expect(listener).not.toHaveBeenCalled();
    store.getState().setActiveTrackId('sfx');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().activeTrackId).toBe('sfx');
    unsubscribe();
  });

  it('SS10: the initial active track is the first audio track, not the first track', async () => {
    const probes = await mountActiveTrackProbes();
    expect(probes.seen.id).toBe('music');
  });

  it('SS11: a paste right after an active-track change in the same event lands on the new track', async () => {
    const probes = await mountActiveTrackProbes();
    act(() => liveApi(probes.api).selectClip('m1'));
    act(() => liveApi(probes.api).copySelection());
    act(() => {
      liveApi(probes.api).setActiveTrack('sfx');
      liveApi(probes.api).pasteClipboard();
    });
    const pasted = liveApi(probes.api)
      .getArrangement()
      .clips.filter((clip) => clip.id !== 'm1' && clip.id !== 'm2');
    expect(pasted.map((clip) => clip.trackId)).toEqual(['sfx']);
  });
});
