import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { ArrangementClip, WorkspaceCollection, WorkspaceSource } from '~/types/arrangement';
import { createArrangement } from '../model';
import { findAssetTempoSeed } from '../tempo-seed';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('../tempo-seed', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../tempo-seed')>();
  return { ...actual, findAssetTempoSeed: vi.fn(actual.findAssetTempoSeed) };
});

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.mocked(findAssetTempoSeed).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function searchCollection(sources: WorkspaceSource[]): WorkspaceCollection {
  return {
    id: 'search',
    label: 'search',
    origin: 'demo',
    sources,
    loadSource: async () => new AudioBuffer({ length: 400, numberOfChannels: 1, sampleRate: 100 }),
  };
}

const NO_BPM_SOURCES: WorkspaceSource[] = [
  { id: 'hit', title: 'Hit', collectionLabel: 'search', kind: 'sfx', origin: 'demo', bpm: 120 },
  { id: 'song', title: 'Song', collectionLabel: 'search', kind: 'music', origin: 'demo' },
];

const BPM_SOURCES: WorkspaceSource[] = [
  ...NO_BPM_SOURCES,
  {
    id: 'stem-90',
    title: 'Slow stem',
    collectionLabel: 'search',
    kind: 'stem',
    origin: 'demo',
    bpm: 90,
  },
];

interface SearchApiRef {
  current: ArrangementContextValue | null;
}

function SearchProbe({ api }: { api: SearchApiRef }) {
  api.current = useArrangement();
  return null;
}

async function mountSearch(sources: WorkspaceSource[]) {
  const api: SearchApiRef = { current: null };
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
  ]);
  render(
    <ArrangementProvider collection={searchCollection(sources)} initialArrangement={base}>
      <StudioWorkspace />
      <SearchProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const addClip = (id: string, sourceId: string, start: number) => {
    const live = api.current;
    if (!live) {
      throw new Error('provider not mounted');
    }
    const before = live.getArrangement();
    const clip: ArrangementClip = {
      id,
      trackId: 'music',
      sourceId,
      start,
      sourceOffset: 0,
      duration: 2,
    };
    act(() => {
      live.commitArrangement({ ...before, clips: [...before.clips, clip] }, 'Add clip', before);
    });
  };
  return { addClip };
}

describe(
  'SABA-B-11a-FIX-2 the seed search closes when no source can seed',
  { timeout: 15_000 },
  () => {
    it('TQ1 a collection with no music or stem BPM never runs the seed search, across three clip changes', async () => {
      const { addClip } = await mountSearch(NO_BPM_SOURCES);
      addClip('a', 'hit', 0);
      addClip('b', 'song', 3);
      addClip('c', 'hit', 6);
      expect(vi.mocked(findAssetTempoSeed)).not.toHaveBeenCalled();
    });

    it('TQ2 control: with a BPM stem in the collection the search runs on clip changes until it seeds', async () => {
      const { addClip } = await mountSearch(BPM_SOURCES);
      const atMount = vi.mocked(findAssetTempoSeed).mock.calls.length;
      expect(atMount).toBeGreaterThan(0);
      addClip('a', 'hit', 0);
      expect(vi.mocked(findAssetTempoSeed).mock.calls.length).toBeGreaterThan(atMount);
      addClip('b', 'stem-90', 3);
      const afterSeed = vi.mocked(findAssetTempoSeed).mock.calls.length;
      addClip('c', 'hit', 6);
      expect(vi.mocked(findAssetTempoSeed).mock.calls.length).toBe(afterSeed);
    });
  },
);
