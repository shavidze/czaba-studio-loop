import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const countCollection: WorkspaceCollection = {
  id: 'count',
  label: 'count',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'count', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'count', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 4000, numberOfChannels: 1, sampleRate: 100 }),
};

const CLIPS: ArrangementClip[] = [
  { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 2 },
  { id: 'm1', trackId: 'music', sourceId: 'song', start: 7, sourceOffset: 0, duration: 4 },
  { id: 'm2', trackId: 'music', sourceId: 'song', start: 12.5, sourceOffset: 0, duration: 2 },
];

function countArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface CountApiRef {
  current: ArrangementContextValue | null;
}

function CountProbe({ api }: { api: CountApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: CountApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountCountWorkspace() {
  const api: CountApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={countCollection} initialArrangement={countArrangement(CLIPS)}>
      <StudioWorkspace />
      <CountProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const laneCount = (trackId: string): string | null =>
    view.container
      .querySelector<HTMLElement>(`[data-track-id="${trackId}"]`)
      ?.getAttribute('data-clip-count') ?? null;
  const modelCount = (trackId: string): string =>
    String(
      live(api)
        .getArrangement()
        .clips.filter((clip) => clip.trackId === trackId).length,
    );
  return { api, view, laneCount, modelCount };
}

beforeEach(() => {
  fakeClock.base = 0;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('lane data-clip-count (PERF-14a model clip count)', () => {
  it('LC1: each lane carries the number of its own clips', async () => {
    const { laneCount } = await mountCountWorkspace();
    expect([laneCount('video'), laneCount('music'), laneCount('sfx')]).toEqual(['1', '2', '0']);
  });

  it('LC2: duplicate, undo and delete update the lane count', async () => {
    const { api, laneCount } = await mountCountWorkspace();
    act(() => live(api).selectClip('m2'));
    act(() => live(api).duplicateSelection());
    expect(laneCount('music')).toBe('3');
    act(() => live(api).undo());
    expect(laneCount('music')).toBe('2');
    act(() => live(api).selectClip('m1'));
    act(() => live(api).deleteSelection());
    expect([laneCount('music'), laneCount('video'), laneCount('sfx')]).toEqual(['1', '1', '0']);
  });

  it('LC3: every lane count equals the model after each step', async () => {
    const { api, laneCount, modelCount } = await mountCountWorkspace();
    const lanes = ['video', 'music', 'sfx'];
    const check = () =>
      expect(lanes.map((trackId) => laneCount(trackId))).toEqual(
        lanes.map((trackId) => modelCount(trackId)),
      );
    check();
    act(() => live(api).selectClips(['m1', 'm2']));
    act(() => live(api).duplicateSelection());
    check();
    expect(laneCount('music')).toBe('4');
  });

  it('LC4: a cross-lane drag preview moves the count; clearing the preview restores it', async () => {
    const { api, laneCount } = await mountCountWorkspace();
    const before = live(api).getArrangement();
    const moved: Arrangement = {
      ...before,
      clips: before.clips.map((clip) => (clip.id === 'm1' ? { ...clip, trackId: 'sfx' } : clip)),
    };
    act(() => live(api).previewClipGeometry(moved));
    expect([laneCount('music'), laneCount('sfx')]).toEqual(['1', '1']);
    act(() => live(api).previewClipGeometry(before));
    expect([laneCount('music'), laneCount('sfx')]).toEqual(['2', '0']);
  });

  it('LC5: folding a lane keeps its count', async () => {
    const { view, laneCount } = await mountCountWorkspace();
    const lane = view.container.querySelector<HTMLElement>('[data-track-id="music"]');
    act(() => {
      view.getByRole('button', { name: 'Fold or unfold — Music' }).click();
    });
    expect([lane?.getAttribute('data-track-folded'), laneCount('music')]).toEqual(['true', '2']);
  });
});
