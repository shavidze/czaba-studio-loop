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
import {
  decodeVideoAudio,
  probeVideoFile,
  type VideoProbeResult,
} from '~/lib/arrangement/video.client';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { LIBRARY_DRAG_MIME } from '../library';
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

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const PX_PER_SECOND = 40;
const LANE_HEIGHT_PX = 100;
const HINT = 'Drag a clip by its name bar to move it.';
const SNAP_ON_QUARTER = 'Snap on — grid 1/4 (G)';

const hintCollection: WorkspaceCollection = {
  id: 'hint',
  label: 'hint',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'hint', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'hint', kind: 'sfx', origin: 'demo' },
    {
      id: 'stem-90',
      title: 'Slow stem',
      collectionLabel: 'hint',
      kind: 'stem',
      origin: 'demo',
      bpm: 90,
    },
    { id: 'slow', title: 'Slow load', collectionLabel: 'hint', kind: 'music', origin: 'demo' },
    { id: 'bad', title: 'Broken load', collectionLabel: 'hint', kind: 'music', origin: 'demo' },
  ],
  loadSource: (source) => {
    if (source.id === 'bad') {
      return Promise.reject(new Error('File failed to load (network)'));
    }
    if (source.id === 'slow') {
      return new Promise<AudioBuffer>(() => undefined);
    }
    return Promise.resolve(new AudioBuffer({ length: 400, numberOfChannels: 1, sampleRate: 100 }));
  },
};

function hintArrangement(clips: ArrangementClip[] = []): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface HintApiRef {
  current: ArrangementContextValue | null;
}

function HintProbe({ api }: { api: HintApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: HintApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flushLoads(api: HintApiRef) {
  for (
    let tick = 0;
    tick < 10 &&
    (live(api).sourceDurations.get('song') === undefined ||
      live(api).sourceDurations.get('hit') === undefined ||
      live(api).sourceDurations.get('stem-90') === undefined);
    tick++
  ) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
}

async function mountHintWorkspace(clips: ArrangementClip[] = []) {
  const api: HintApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={hintCollection} initialArrangement={hintArrangement(clips)}>
      <StudioWorkspace />
      <HintProbe api={api} />
    </ArrangementProvider>,
  );
  await flushLoads(api);
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const option = (sourceId: string): HTMLElement => {
    const found = view
      .getAllByRole('option')
      .find((entry) => entry.getAttribute('data-source-id') === sourceId);
    if (!found) {
      throw new Error(`option ${sourceId} not rendered`);
    }
    return found;
  };
  const enterOn = (sourceId: string) => {
    const row = option(sourceId);
    fireEvent.click(row);
    act(() => row.focus());
    expect(document.activeElement).toBe(row);
    act(() => {
      fireEvent.keyDown(row, { key: 'Enter', code: 'Enter' });
    });
  };
  const laneBody = (trackId: string): HTMLElement => {
    const body = view.container.querySelector<HTMLElement>(
      `[data-track-id="${trackId}"] [data-grid-seconds]`,
    );
    if (!body) {
      throw new Error(`lane ${trackId} not rendered`);
    }
    return body;
  };
  return { api, view, enterOn, laneBody };
}

type HintView = Awaited<ReturnType<typeof mountHintWorkspace>>['view'];

function statusText(view: HintView): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function addedText(title: string, track: string, time: string, suffix = ''): string {
  return studioLibraryStrings.clipAdded({ title, track, time, suffix });
}

function libraryTransfer() {
  return { types: [LIBRARY_DRAG_MIME], files: [], dropEffect: 'none' };
}

function dropOnLane(api: HintApiRef, lane: HTMLElement, time: number, sourceId = 'hit') {
  act(() => live(api).beginLibraryDrag(sourceId));
  const clientX = Math.round(time * PX_PER_SECOND);
  fireEvent.dragOver(lane, { clientX, dataTransfer: libraryTransfer() });
  fireEvent.drop(lane, { clientX, dataTransfer: libraryTransfer() });
}

function pressUndo() {
  act(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  });
  fireEvent.keyDown(document.body, { key: 'z', code: 'KeyZ', ctrlKey: true });
}

async function flushVideo() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  probeVideoMock.mockReset();
  decodeVideoMock.mockReset();
  decodeVideoMock.mockImplementation(() => new Promise(() => undefined));
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('DragEvent', class TestDragEvent extends MouseEvent {});
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: () => undefined,
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe(
  'NAME-AND-HINT-b one-time name bar hint after the first add (Saba Q5)',
  {
    timeout: 15_000,
  },
  () => {
    it('NB1 Enter on a ready no-BPM source appends the hint to the first clip-added text', async () => {
      const { view, enterOn } = await mountHintWorkspace();
      enterOn('song');
      expect(view.container.querySelectorAll('[data-clip-id]')).toHaveLength(1);
      expect(statusText(view)).toBe(
        `${addedText('Song', 'Music', '00:00.000')} ${studioLibraryStrings.nameBarHint}`,
      );
      expect(statusText(view)).toBe(
        '“Song” added to the Music track at 00:00.000. Drag a clip by its name bar to move it.',
      );
      expect(view.getAllByTestId('arrangement-status')).toHaveLength(1);
    });

    it('NB2 a second add shows the plain clip-added text', async () => {
      const { api, view, enterOn } = await mountHintWorkspace();
      enterOn('song');
      expect(statusText(view)).toContain(HINT);
      act(() => live(api).setActiveTrack('sfx'));
      enterOn('hit');
      expect(view.container.querySelectorAll('[data-clip-id]')).toHaveLength(2);
      expect(statusText(view)).toBe(addedText('Hit', 'SFX', '00:00.000'));
    });

    it('NB3 a library drop as the first add appends the hint', async () => {
      const { api, view, laneBody } = await mountHintWorkspace();
      dropOnLane(api, laneBody('sfx'), 2);
      const clips = live(api).arrangement.clips;
      expect(clips).toHaveLength(1);
      expect(clips[0]?.trackId).toBe('sfx');
      expect(clips[0]?.start).toBeCloseTo(2, 9);
      expect(statusText(view)).toBe(`${addedText('Hit', 'SFX', '00:02.000')} ${HINT}`);
      expect(statusText(view)?.endsWith(`. ${HINT}`)).toBe(true);
    });

    it('NB4 refused adds show no hint and do not use it up; the next success has it', async () => {
      const { api, view, enterOn } = await mountHintWorkspace();
      enterOn('slow');
      expect(statusText(view)).toBe(studioLibraryStrings.sourceNotLoaded('Slow load'));
      act(() => live(api).addSourceToActiveTrack('missing'));
      expect(statusText(view)).toBe(studioLibraryStrings.selectSoundFirst);
      act(() => live(api).setActiveTrack('video'));
      act(() => live(api).addSourceToActiveTrack('song'));
      expect(statusText(view)).toBe(studioLibraryStrings.audioOnVideoTrack);
      expect(live(api).arrangement.clips).toHaveLength(0);
      act(() => live(api).setActiveTrack('music'));
      act(() => live(api).addSourceToActiveTrack('song'));
      expect(statusText(view)).toBe(`${addedText('Song', 'Music', '00:00.000')} ${HINT}`);
    });

    it('NB4b a failed source, a not-loaded drop, a blocked drop and an edit during a gesture neither show nor use up the hint', async () => {
      const occupied: ArrangementClip = {
        id: 'pre-hit',
        trackId: 'sfx',
        sourceId: 'hit',
        start: 0,
        sourceOffset: 0,
        duration: 4,
      };
      const { api, view, laneBody } = await mountHintWorkspace([occupied]);
      act(() => live(api).addSourceToActiveTrack('bad'));
      expect(statusText(view)).toBe(studioLibraryStrings.sourceFailed('Broken load'));
      dropOnLane(api, laneBody('sfx'), 6, 'slow');
      expect(statusText(view)).toBe(studioLibraryStrings.dropNotLoaded);
      dropOnLane(api, laneBody('sfx'), 1);
      expect(statusText(view)).toBe(studioLibraryStrings.dropBlocked);
      let release: () => void = () => undefined;
      act(() => {
        release = live(api).beginPointerGesture();
      });
      act(() => live(api).addSourceToActiveTrack('song'));
      expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
      act(() => release());
      expect(live(api).arrangement.clips.map((clip) => clip.id)).toEqual(['pre-hit']);
      act(() => live(api).addSourceToActiveTrack('song'));
      expect(statusText(view)).toBe(`${addedText('Song', 'Music', '00:00.000')} ${HINT}`);
    });

    it('NB5 Undo of the first add does not re-arm the hint', async () => {
      const { api, view, enterOn } = await mountHintWorkspace();
      enterOn('song');
      expect(statusText(view)).toBe(`${addedText('Song', 'Music', '00:00.000')} ${HINT}`);
      pressUndo();
      expect(live(api).arrangement.clips).toHaveLength(0);
      expect(statusText(view)).toBe(`Undo: ${studioLibraryStrings.historyAdd('Song')}`);
      enterOn('song');
      expect(live(api).arrangement.clips).toHaveLength(1);
      expect(statusText(view)).toBe(addedText('Song', 'Music', '00:00.000'));
    });

    it('NB6 a BPM first add puts the hint between the add sentence and the tempo seed text', async () => {
      const { view, enterOn } = await mountHintWorkspace();
      enterOn('stem-90');
      expect(view.getByTestId('arrangement-tempo-input')).toHaveProperty('value', '90');
      expect(statusText(view)).toBe(
        `${addedText('Slow stem', 'Music', '00:00.000')} ${HINT} ${studioTempoStrings.seeded({ bpm: '90', title: 'Slow stem' })} ${SNAP_ON_QUARTER}`,
      );
    });

    it('NB7 a first add at the nearest free spot keeps the suffix before the hint', async () => {
      const existing: ArrangementClip = {
        id: 'pre-song',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: 4,
      };
      const { api, view, enterOn } = await mountHintWorkspace([existing]);
      enterOn('song');
      const added = live(api).arrangement.clips.filter((clip) => clip.id !== 'pre-song');
      expect(added).toHaveLength(1);
      expect(added[0]?.start).toBeCloseTo(4, 9);
      expect(statusText(view)).toBe(
        `${addedText('Song', 'Music', '00:04.000', studioLibraryStrings.nearestFreeSpot)} ${HINT}`,
      );
      expect(statusText(view)).toBe(
        '“Song” added to the Music track at 00:04.000 (nearest free spot). Drag a clip by its name bar to move it.',
      );
    });

    it('NB8 a video import neither shows nor uses up the hint; the next library add has it', async () => {
      probeVideoMock.mockResolvedValue({
        url: 'blob:film',
        duration: 4,
        width: 640,
        height: 360,
      } satisfies VideoProbeResult);
      const { api, view } = await mountHintWorkspace();
      const seen: (string | null)[] = [];
      await act(async () => {
        live(api).importVideoFiles([new File(['x'], 'film.mp4', { type: 'video/mp4' })]);
      });
      seen.push(statusText(view));
      await flushVideo();
      seen.push(statusText(view));
      expect(live(api).arrangement.clips.filter((clip) => clip.trackId === 'video')).toHaveLength(
        1,
      );
      expect(seen.at(-1)).toBe('“film.mp4” added to the video track: 00:00.000 — 00:04.000');
      expect(seen.filter((text) => text?.includes('name bar'))).toHaveLength(0);
      act(() => live(api).setActiveTrack('music'));
      act(() => live(api).addSourceToActiveTrack('song'));
      expect(statusText(view)).toBe(`${addedText('Song', 'Music', '00:00.000')} ${HINT}`);
    });

    it('NB9 the hint string is the exact approved sentence', () => {
      expect(studioLibraryStrings.nameBarHint).toBe(HINT);
      expect(studioLibraryStrings.nameBarHint).toBe('Drag a clip by its name bar to move it.');
    });
  },
);
