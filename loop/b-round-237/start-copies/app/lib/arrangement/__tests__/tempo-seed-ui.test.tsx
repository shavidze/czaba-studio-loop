import { act, fireEvent, render } from '@testing-library/react';
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
import { studioLibraryStrings, studioTempoStrings } from '../strings';
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

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const MUSIC_LANE_Y = 150;
const SEED_90_GRID_SECONDS = 60 / 90;
const SNAP_ON_QUARTER = 'Snap on — grid 1/4 (G)';

const seedCollection: WorkspaceCollection = {
  id: 'seed',
  label: 'seed',
  origin: 'demo',
  sources: [
    {
      id: 'stem-90',
      title: 'Slow stem',
      collectionLabel: 'seed',
      kind: 'stem',
      origin: 'demo',
      bpm: 90,
    },
    {
      id: 'stem-140',
      title: 'Fast stem',
      collectionLabel: 'seed',
      kind: 'stem',
      origin: 'demo',
      bpm: 140,
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'seed', kind: 'sfx', origin: 'demo' },
    { id: 'song', title: 'Song', collectionLabel: 'seed', kind: 'music', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 400, numberOfChannels: 1, sampleRate: 100 }),
};

function seedArrangement(clips: ArrangementClip[] = []): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface SeedApiRef {
  current: ArrangementContextValue | null;
}

function SeedProbe({ api }: { api: SeedApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: SeedApiRef): ArrangementContextValue {
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

async function mountSeedWorkspace(clips: ArrangementClip[] = []) {
  const api: SeedApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={seedCollection} initialArrangement={seedArrangement(clips)}>
      <StudioWorkspace />
      <SeedProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  const layoutRows = () => {
    view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
      const top = index * LANE_HEIGHT_PX;
      Object.defineProperty(row, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
      });
    });
  };
  layoutRows();
  const option = (sourceId: string): HTMLElement => {
    const found = view
      .getAllByRole('option')
      .find((entry) => entry.getAttribute('data-source-id') === sourceId);
    if (!found) {
      throw new Error(`option ${sourceId} not rendered`);
    }
    return found;
  };
  const addSource = (sourceId: string) => {
    fireEvent.click(option(sourceId));
    const add = view.getByRole('button', { name: 'Add' });
    act(() => {
      fireEvent.click(add);
    });
  };
  const clipParts = (clipId: string) => {
    layoutRows();
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    const header = root?.firstElementChild;
    if (!root || !(header instanceof HTMLElement)) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    stubCapture(root);
    return { root, header };
  };
  return { api, view, option, addSource, clipParts };
}

type SeedView = Awaited<ReturnType<typeof mountSeedWorkspace>>['view'];

function tempoInput(view: SeedView): HTMLInputElement {
  const input = view.getByTestId('arrangement-tempo-input');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('tempo input missing');
  }
  return input;
}

function gridControl(view: SeedView): HTMLElement {
  return view.getByTestId('arrangement-grid-control');
}

function barsMarkCount(view: SeedView): number {
  return view.container.querySelectorAll('[data-testid="arrangement-bars-mark"]').length;
}

function statusText(view: SeedView): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function commitTempo(input: HTMLInputElement, text: string) {
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function pressG() {
  act(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  });
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
}

function placedText(title: string): string {
  return studioLibraryStrings.clipAdded({
    title,
    track: 'Music',
    time: '00:00.000',
    suffix: '',
  });
}

function expectNoSeed(view: SeedView) {
  expect(tempoInput(view).value).toBe('');
  expect(gridControl(view).dataset.gridDivision).toBe('1');
  expect(gridControl(view).dataset.snap).toBe('off');
  expect(barsMarkCount(view)).toBe(0);
}

function expectSeed90(view: SeedView) {
  expect(tempoInput(view).value).toBe('90');
  expect(gridControl(view).dataset.gridDivision).toBe('1/4');
  expect(Number(gridControl(view).dataset.gridSeconds)).toBeCloseTo(SEED_90_GRID_SECONDS, 4);
  expect(gridControl(view).dataset.snap).toBe('on');
  expect(barsMarkCount(view)).toBeGreaterThan(0);
}

const press = { button: 0, buttons: 1 };

function dragClip(
  parts: { root: HTMLElement; header: HTMLElement },
  dx: number,
  altKey = false,
  pointerId = 1,
) {
  fireEvent.pointerDown(parts.header, { ...press, pointerId, clientX: 100, clientY: MUSIC_LANE_Y });
  fireEvent.pointerMove(parts.root, {
    pointerId,
    clientX: 100 + dx,
    clientY: MUSIC_LANE_Y,
    altKey,
  });
  fireEvent.pointerUp(parts.root, { pointerId, clientX: 100 + dx, clientY: MUSIC_LANE_Y, altKey });
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

describe('SABA-B-11a stage 1 tempo seed from the asset BPM', { timeout: 15_000 }, () => {
  it('TU1 the mount state is unchanged: empty tempo, seconds 1, Snap off, no bars marks', async () => {
    const { view } = await mountSeedWorkspace();
    expectNoSeed(view);
  });

  it('TU2 adding the bpm-90 stem seeds 90, 1/4 and Snap on, and appends to the placement status', async () => {
    const { view, addSource } = await mountSeedWorkspace();
    addSource('stem-90');
    expectSeed90(view);
    expect(statusText(view)).toBe(
      `${placedText('Slow stem')} ${studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' })} ${SNAP_ON_QUARTER}`,
    );
    expect(statusText(view)).toBe(
      '“Slow stem” added to the Music track at 00:00.000. Tempo 90 BPM from “Slow stem” — bars ruler on. Grid only: audio is not stretched. Snap on — grid 1/4 (G)',
    );
  });

  it('TU3 an sfx and a bpm-less music clip change nothing; the bpm-90 stem afterwards seeds 90', async () => {
    const { view, addSource } = await mountSeedWorkspace();
    addSource('hit');
    expectNoSeed(view);
    addSource('song');
    expectNoSeed(view);
    expect(view.container.querySelectorAll('[data-clip-id]')).toHaveLength(2);
    addSource('stem-90');
    expectSeed90(view);
    expect(statusText(view)).toContain(
      studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' }),
    );
  });

  it('TU4 a typed tempo wins, a cleared tempo stays empty, an untouched empty field still seeds', async () => {
    const typed = await mountSeedWorkspace();
    commitTempo(tempoInput(typed.view), '100');
    typed.addSource('stem-90');
    expect(tempoInput(typed.view).value).toBe('100');
    expect(gridControl(typed.view).dataset.gridDivision).toBe('1');
    expect(gridControl(typed.view).dataset.snap).toBe('off');
    expect(statusText(typed.view)).not.toContain(
      studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' }),
    );
    expect(statusText(typed.view)).not.toContain('from “');
    typed.view.unmount();

    const cleared = await mountSeedWorkspace();
    commitTempo(tempoInput(cleared.view), '100');
    commitTempo(tempoInput(cleared.view), '');
    expect(tempoInput(cleared.view).value).toBe('');
    cleared.addSource('stem-90');
    expect(tempoInput(cleared.view).value).toBe('');
    expect(gridControl(cleared.view).dataset.gridDivision).toBe('1');
    expect(statusText(cleared.view)).not.toContain('from “');
    cleared.view.unmount();

    const emptyEnter = await mountSeedWorkspace();
    commitTempo(tempoInput(emptyEnter.view), '');
    const input = tempoInput(emptyEnter.view);
    act(() => input.focus());
    act(() => input.blur());
    emptyEnter.addSource('stem-90');
    expectSeed90(emptyEnter.view);
  });

  it('TU5 a hand-chosen division is kept; a hand-toggled Snap stays off', async () => {
    const division = await mountSeedWorkspace();
    const select = division.view.getByTestId('arrangement-grid-division');
    fireEvent.change(select, { target: { value: '0.5' } });
    expect(gridControl(division.view).dataset.gridDivision).toBe('0.5');
    division.addSource('stem-90');
    expect(tempoInput(division.view).value).toBe('90');
    expect(gridControl(division.view).dataset.gridDivision).toBe('0.5');
    expect(gridControl(division.view).dataset.snap).toBe('on');
    division.view.unmount();

    const snap = await mountSeedWorkspace();
    pressG();
    pressG();
    expect(gridControl(snap.view).dataset.snap).toBe('off');
    snap.addSource('stem-90');
    expect(tempoInput(snap.view).value).toBe('90');
    expect(gridControl(snap.view).dataset.gridDivision).toBe('1/4');
    expect(gridControl(snap.view).dataset.snap).toBe('off');
    expect(statusText(snap.view)).not.toContain('Snap on');
    expect(statusText(snap.view)).toContain(
      studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' }),
    );
    snap.view.unmount();

    const snapOn = await mountSeedWorkspace();
    pressG();
    expect(gridControl(snapOn.view).dataset.snap).toBe('on');
    snapOn.addSource('stem-90');
    expect(tempoInput(snapOn.view).value).toBe('90');
    expect(gridControl(snapOn.view).dataset.gridDivision).toBe('1/4');
    expect(gridControl(snapOn.view).dataset.snap).toBe('on');
    expect(statusText(snapOn.view)).toBe(
      `${placedText('Slow stem')} ${studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' })}`,
    );
  });

  it('TU6 the seed is one-shot: a second BPM and Undo of both placements keep 90, 1/4 and Snap on', async () => {
    const { api, view, addSource } = await mountSeedWorkspace();
    addSource('stem-90');
    expectSeed90(view);
    addSource('stem-140');
    expect(view.container.querySelectorAll('[data-clip-id]')).toHaveLength(2);
    expectSeed90(view);
    act(() => live(api).undo());
    act(() => live(api).undo());
    expect(live(api).arrangement.clips).toHaveLength(0);
    expectSeed90(view);
  });

  it('TU7 after the seed a clip drag snaps to multiples of 60/90 s; Alt still bypasses the grid', async () => {
    const { api, addSource, clipParts } = await mountSeedWorkspace();
    addSource('stem-90');
    const clipId = live(api).arrangement.clips[0]?.id;
    if (clipId === undefined) {
      throw new Error('seeded clip missing');
    }
    dragClip(clipParts(clipId), 0.7 * PX_PER_SECOND);
    const snapped = live(api).arrangement.clips[0]?.start ?? Number.NaN;
    expect(snapped).toBeCloseTo(SEED_90_GRID_SECONDS, 3);
    dragClip(clipParts(clipId), 0.3 * PX_PER_SECOND, true, 2);
    const free = live(api).arrangement.clips[0]?.start ?? Number.NaN;
    expect(free).toBeCloseTo(SEED_90_GRID_SECONDS + 0.3, 3);
    expect(free % SEED_90_GRID_SECONDS).not.toBeCloseTo(0, 3);
  });

  it('TU8 an initial arrangement that already holds the bpm-90 stem seeds at mount', async () => {
    const { view } = await mountSeedWorkspace([
      { id: 'c1', trackId: 'music', sourceId: 'stem-90', start: 2, sourceOffset: 0, duration: 4 },
    ]);
    expectSeed90(view);
  });
});

const DEMO_LOADING = 'Loading the demo collection…';
const DEMO_READY =
  'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.';

function deferredSeedCollection(): { collection: WorkspaceCollection; release: () => void } {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const buffer = () => new AudioBuffer({ length: 400, numberOfChannels: 1, sampleRate: 100 });
  const collection: WorkspaceCollection = {
    ...seedCollection,
    id: 'seed-deferred',
    loadSource: async (source) => {
      if (source.id !== 'stem-90') {
        await gate;
      }
      return buffer();
    },
  };
  return { collection, release: () => release() };
}

async function mountDeferredSeedWorkspace(clips: ArrangementClip[] = []) {
  const api: SeedApiRef = { current: null };
  const { collection, release } = deferredSeedCollection();
  const view = render(
    <ArrangementProvider collection={collection} initialArrangement={seedArrangement(clips)}>
      <StudioWorkspace />
      <SeedProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const addSource = (sourceId: string) => {
    const option = view
      .getAllByRole('option')
      .find((entry) => entry.getAttribute('data-source-id') === sourceId);
    if (!option) {
      throw new Error(`option ${sourceId} not rendered`);
    }
    fireEvent.click(option);
    act(() => {
      fireEvent.click(view.getByRole('button', { name: 'Add' }));
    });
  };
  const settle = async () => {
    await act(async () => {
      release();
      for (let index = 0; index < 6; index += 1) {
        await Promise.resolve();
      }
    });
  };
  return { api, view, addSource, settle };
}

describe(
  'SABA-B-11a-FIX-2 the seed status survives the collection ready write',
  { timeout: 15_000 },
  () => {
    it('TU9 a seed placed before every source settles keeps placement + seed; the bare ready text never replaces it', async () => {
      const { view, addSource, settle } = await mountDeferredSeedWorkspace();
      expect(statusText(view)).toBe(DEMO_LOADING);
      addSource('stem-90');
      const seeded = `${placedText('Slow stem')} ${studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' })} ${SNAP_ON_QUARTER}`;
      expect(statusText(view)).toBe(seeded);
      await settle();
      expect(statusText(view)).toBe(seeded);
      expectSeed90(view);
    });

    it('TU10 a mount seed composes with the loading text, and ready replaces only that prefix', async () => {
      const { view, settle } = await mountDeferredSeedWorkspace([
        { id: 'c1', trackId: 'music', sourceId: 'stem-90', start: 2, sourceOffset: 0, duration: 4 },
      ]);
      const tail = `${studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' })} ${SNAP_ON_QUARTER}`;
      expect(statusText(view)).toBe(`${DEMO_LOADING} ${tail}`);
      await settle();
      expect(statusText(view)).toBe(`${DEMO_READY} ${tail}`);
      expectSeed90(view);
    });

    it('TU11 an empty status before the seed gives no leading space', async () => {
      const { api, view } = await mountSeedWorkspace();
      act(() => live(api).setStatus(''));
      const before = live(api).getArrangement();
      const clip: ArrangementClip = {
        id: 'c-empty',
        trackId: 'music',
        sourceId: 'stem-90',
        start: 0,
        sourceOffset: 0,
        duration: 4,
      };
      act(() => {
        live(api).commitArrangement(
          { ...before, clips: [...before.clips, clip] },
          'Add clip',
          before,
        );
      });
      expect(statusText(view)).toBe(
        `${studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' })} ${SNAP_ON_QUARTER}`,
      );
    });
  },
);
