import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ArrangementActions,
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementActions,
  useArrangementIsPlayingReader,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { addMarker } from '../markers';
import { createArrangement } from '../model';

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
  currentTime = 0;
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

const actionsCollection: WorkspaceCollection = {
  id: 'actions',
  label: 'actions',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'actions', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

const twoSourceCollection: WorkspaceCollection = {
  ...actionsCollection,
  id: 'actions-two',
  sources: [
    ...actionsCollection.sources,
    { id: 'hit', title: 'Hit', collectionLabel: 'actions', kind: 'sfx', origin: 'demo' },
  ],
};

const CONTEXT_SOURCE = resolve(__dirname, '../../../contexts/ArrangementContext.tsx');
const ACTIONS_PICK = /type ArrangementActions = Pick<\s*ArrangementContextValue,([^>]*)>;/;

function declaredActionKeys(): string[] {
  const match = ACTIONS_PICK.exec(readFileSync(CONTEXT_SOURCE, 'utf8'));
  if (match === null) {
    throw new Error('ArrangementActions Pick not found');
  }
  return [...match[1].matchAll(/'([A-Za-z]+)'/g)].map((key) => key[1]).sort();
}

function actionsArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
  return {
    ...base,
    clips: [
      {
        id: 'music-1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: 20,
      },
    ],
    loop: { start: 2, end: 8, enabled: true },
    markers: [{ id: 'marker-0', time: 1, name: 'Intro' }],
  };
}

interface ActionsProbeRef {
  actions: ArrangementActions | null;
  value: ArrangementContextValue | null;
  isPlaying: (() => boolean) | null;
}

function ActionsProbe({ probe }: { probe: ActionsProbeRef }) {
  probe.actions = useArrangementActions();
  probe.value = useArrangement();
  probe.isPlaying = useArrangementIsPlayingReader();
  return null;
}

function playing(probe: ActionsProbeRef): boolean {
  if (probe.isPlaying === null) {
    throw new Error('playing probe did not render');
  }
  return probe.isPlaying();
}

function OutsideProbe() {
  useArrangementActions();
  return null;
}

function currentActions(probe: ActionsProbeRef): ArrangementActions {
  if (probe.actions === null) {
    throw new Error('actions probe did not render');
  }
  return probe.actions;
}

function markerCount(arrangement: Arrangement): number {
  return arrangement.markers?.length ?? 0;
}

function currentValue(probe: ActionsProbeRef): ArrangementContextValue {
  if (probe.value === null) {
    throw new Error('value probe did not render');
  }
  return probe.value;
}

const SCANNED_ROOTS = ['components/arrangement', 'contexts'];
const TRANSITION_API = /\b(startTransition|useTransition|useDeferredValue)\b/;
const APP_ROOT = resolve(__dirname, '../../..');

function withoutComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe('Arrangement actions context (SYS-R385-LEAF-ACTIONS-CONTEXT)', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function mountProbe() {
    const probe: ActionsProbeRef = { actions: null, value: null, isPlaying: null };
    render(
      <ArrangementProvider collection={actionsCollection} initialArrangement={actionsArrangement()}>
        <ActionsProbe probe={probe} />
      </ArrangementProvider>,
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    return probe;
  }

  it('AC1 keeps one actions object across a lane mute, a zoom step, a marker commit and an undo while the context value changes', async () => {
    const probe = await mountProbe();
    const actions = currentActions(probe);
    const before = currentValue(probe);
    act(() => before.toggleTrackMute('music'));
    expect(currentValue(probe)).not.toBe(before);
    expect(currentActions(probe)).toBe(actions);
    const zoomBefore = currentValue(probe).pxPerSecond;
    act(() => currentValue(probe).setPxPerSecond(zoomBefore * 2));
    expect(currentValue(probe).pxPerSecond).not.toBe(zoomBefore);
    expect(currentActions(probe)).toBe(actions);
    const present = actions.getArrangement();
    const markersBefore = markerCount(present);
    const added = addMarker(present, 4, 'Cue');
    if (added.arrangement === null) {
      throw new Error('marker was not added');
    }
    const next = added.arrangement;
    act(() => {
      actions.commitArrangement(next, 'Add marker', present);
    });
    expect(markerCount(currentValue(probe).arrangement)).toBe(markersBefore + 1);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.undo());
    expect(markerCount(currentValue(probe).arrangement)).toBe(markersBefore);
    expect(currentActions(probe)).toBe(actions);
  });

  it('AC2 hands out the provider callbacks themselves, and they keep their identity across a lane mute and a zoom step', async () => {
    const probe = await mountProbe();
    const actions = currentActions(probe);
    const first = currentValue(probe);
    const pinned = {
      toggleMasterMute: first.toggleMasterMute,
      commitArrangement: first.commitArrangement,
      undo: first.undo,
      togglePlayback: first.togglePlayback,
      getArrangement: first.getArrangement,
    };
    expect(actions.toggleMasterMute).toBe(pinned.toggleMasterMute);
    expect(actions.commitArrangement).toBe(pinned.commitArrangement);
    expect(actions.undo).toBe(pinned.undo);
    expect(actions.togglePlayback).toBe(pinned.togglePlayback);
    act(() => first.toggleTrackMute('music'));
    act(() => currentValue(probe).setPxPerSecond(currentValue(probe).pxPerSecond * 2));
    const later = currentValue(probe);
    expect(later).not.toBe(first);
    expect(later.toggleMasterMute).toBe(pinned.toggleMasterMute);
    expect(later.commitArrangement).toBe(pinned.commitArrangement);
    expect(later.undo).toBe(pinned.undo);
    expect(later.togglePlayback).toBe(pinned.togglePlayback);
    expect(later.getArrangement).toBe(pinned.getArrangement);
  });

  it('AC3 reads the latest arrangement through the stable actions after a commit and after its undo', async () => {
    const probe = await mountProbe();
    const actions = currentActions(probe);
    act(() => currentValue(probe).toggleTrackMute('music'));
    const muted = actions.getArrangement();
    expect(muted).toBe(currentValue(probe).arrangement);
    expect(muted.tracks.find((track) => track.id === 'music')?.mute).toBe(true);
    act(() => actions.undo());
    const restored = actions.getArrangement();
    expect(restored).toBe(currentValue(probe).arrangement);
    expect(restored.tracks.find((track) => track.id === 'music')?.mute).toBe(false);
  });

  it('AC4 keeps the loop and markers frozen and identical across commits that do not touch the loop (GATE378-L2)', async () => {
    const probe = await mountProbe();
    const start = currentActions(probe).getArrangement();
    const loop = Object.freeze(start.loop);
    const markers = Object.freeze(start.markers);
    for (const marker of markers ?? []) {
      Object.freeze(marker);
    }
    expect(markerCount(start)).toBe(1);
    act(() => currentValue(probe).toggleTrackMute('music'));
    expect(currentValue(probe).arrangement.loop).toBe(loop);
    act(() => currentValue(probe).toggleMasterMute());
    expect(currentValue(probe).arrangement.loop).toBe(loop);
    expect(currentValue(probe).arrangement.markers).toBe(markers);
    const present = currentActions(probe).getArrangement();
    const added = addMarker(present, 6, 'Hit');
    if (added.arrangement === null) {
      throw new Error('marker was not added');
    }
    const next = added.arrangement;
    act(() => {
      currentActions(probe).commitArrangement(next, 'Add marker', present);
    });
    expect(currentValue(probe).arrangement.loop).toBe(loop);
    expect(currentValue(probe).arrangement.loop).toEqual({ start: 2, end: 8, enabled: true });
    expect(markerCount(currentValue(probe).arrangement)).toBe(2);
  });

  it('AC5 the Arrangement components and contexts use no React transition API (GATE377-L1)', () => {
    const files = SCANNED_ROOTS.flatMap((root) => sourceFiles(resolve(APP_ROOT, root)));
    expect(files.length).toBeGreaterThan(20);
    const hits = files.filter((file) =>
      TRANSITION_API.test(withoutComments(readFileSync(file, 'utf8'))),
    );
    expect(hits).toEqual([]);
  });

  it('AC7 keeps one actions object across a source selection, a library preview, Play/Stop and a Master mute and gain step, and hands out every provider callback the ArrangementActions Pick declares (C-R404-A-AC1-COVERAGE, TL-R406-SK-L1)', async () => {
    const probe: ActionsProbeRef = { actions: null, value: null, isPlaying: null };
    render(
      <ArrangementProvider
        collection={twoSourceCollection}
        initialArrangement={actionsArrangement()}
      >
        <ActionsProbe probe={probe} />
      </ArrangementProvider>,
    );
    const actions = currentActions(probe);
    const statesBefore = currentValue(probe).sourceStates;
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(currentValue(probe).sourceStates).not.toBe(statesBefore);
    expect(currentValue(probe).sourceStates.song?.status).toBe('ready');
    expect(currentActions(probe)).toBe(actions);
    expect(currentValue(probe).selectedSourceId).toBe('song');
    act(() => actions.selectSource('hit'));
    expect(currentValue(probe).selectedSourceId).toBe('hit');
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.startLibraryPreview('hit'));
    await waitFor(() => expect(currentValue(probe).libraryPreviewSourceId).toBe('hit'));
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.stopLibraryPreview());
    expect(currentValue(probe).libraryPreviewSourceId).toBeNull();
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.togglePlayback());
    expect(playing(probe)).toBe(true);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.togglePlayback());
    expect(playing(probe)).toBe(false);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.toggleMasterMute());
    expect(currentValue(probe).arrangement.master.mute).toBe(true);
    expect(currentActions(probe)).toBe(actions);
    const gainBefore = currentValue(probe).arrangement.master.gainDb;
    act(() => actions.previewMasterGain(gainBefore - 6));
    act(() => actions.commitMasterGain());
    expect(currentValue(probe).arrangement.master.gainDb).toBe(gainBefore - 6);
    expect(currentValue(probe).undoLabel).toBe('Master Volume');
    expect(currentActions(probe)).toBe(actions);
    const provided = new Map(Object.entries(currentValue(probe)));
    const entries = Object.entries(currentActions(probe));
    const declared = declaredActionKeys();
    expect(declared.length).toBeGreaterThan(0);
    expect(entries.map(([key]) => key).sort()).toEqual(declared);
    for (const [key, callback] of entries) {
      expect(typeof callback, key).toBe('function');
      expect(provided.get(key), key).toBe(callback);
    }
  });

  it('AC8 keeps one actions object across the lane paths: solo, a volume and a pan commit, a clip selection, a time range, the active track and the insert marker (PERF-11c-iii-e-i)', async () => {
    const probe = await mountProbe();
    const actions = currentActions(probe);
    const music = () =>
      currentValue(probe).arrangement.tracks.find((track) => track.id === 'music');
    act(() => actions.toggleTrackSolo('music', false));
    expect(music()?.solo).toBe(true);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.previewTrackVolume('music', 0.5));
    act(() => actions.commitTrackVolume('music'));
    expect(music()?.volume).toBe(0.5);
    expect(currentActions(probe)).toBe(actions);
    act(() => {
      actions.setTrackPan('music', 0.5);
    });
    expect(music()?.pan).toBe(0.5);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.selectClip('music-1'));
    expect(actions.getSelectedClipIds()).toEqual(['music-1']);
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.setTimeRange({ start: 1, end: 3, trackId: 'music' }));
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.setActiveTrack('video'));
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.setInsertMarker(4));
    expect(currentActions(probe)).toBe(actions);
    act(() => actions.undo());
    expect(music()?.pan ?? 0).toBe(0);
    expect(currentActions(probe)).toBe(actions);
  });

  it('AC6 throws a named error outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => render(<OutsideProbe />)).toThrow(
        'useArrangementActions must be used within an ArrangementProvider',
      );
    } finally {
      spy.mockRestore();
    }
  });
});
