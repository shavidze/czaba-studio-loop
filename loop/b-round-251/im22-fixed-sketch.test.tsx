import { act, cleanup, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  formatArrangementTime,
  playPastEndMessage,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { studioEditStrings, studioPlaybackStrings } from '../strings';
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
const RULER_Y = 10;

const markerCollection: WorkspaceCollection = {
  id: 'insert-marker',
  label: 'insert-marker',
  origin: 'demo',
  sources: [{ id: 'hit', title: 'Hit', collectionLabel: 'im', kind: 'sfx', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

const SFX_CLIPS: ArrangementClip[] = [
  { id: 'h1', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 16 },
];

function markerArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: SFX_CLIPS, markers: [{ id: 'm1', name: 'Hit point', time: 10 }] };
}

interface MarkerApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function MarkerProbe({ api }: { api: MarkerApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: MarkerApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: MarkerApiRef): number {
  if (!api.position) {
    throw new Error('position store not mounted');
  }
  return api.position.getPosition();
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountMarkerWorkspace() {
  const api: MarkerApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider collection={markerCollection} initialArrangement={markerArrangement()}>
      <StudioWorkspace />
      <MarkerProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  view.container.querySelectorAll<HTMLElement>('[data-track-id]').forEach((row, index) => {
    const top = index * LANE_HEIGHT_PX;
    Object.defineProperty(row, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, top, 800, LANE_HEIGHT_PX),
    });
  });
  const ruler = view.getByTestId('arrangement-ruler');
  stubCapture(ruler);
  return { api, view, ruler };
}

type MarkerMount = Awaited<ReturnType<typeof mountMarkerWorkspace>>;

function insertMarkerOf(mounted: MarkerMount): string | null {
  return mounted.view.getByTestId('arrangement-insert-marker').getAttribute('data-insert-marker');
}

function statusText(mounted: MarkerMount): string | null {
  return mounted.view.getByTestId('arrangement-status').textContent;
}

const press = { button: 0, buttons: 1 };

function clickRuler(mounted: MarkerMount, seconds: number) {
  const clientX = seconds * PX_PER_SECOND;
  fireEvent.pointerDown(mounted.ruler, { ...press, pointerId: 1, clientX, clientY: RULER_Y });
  fireEvent.pointerUp(mounted.ruler, { pointerId: 1, clientX, clientY: RULER_Y });
}

function key(init: KeyboardEventInit) {
  fireEvent.keyDown(document.body, init);
}

const SPACE = { key: ' ', code: 'Space' };

function advance(seconds: number) {
  fakeClock.base -= seconds;
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
  cleanup();
  fireEvent.pointerDown(window);
  fireEvent.click(document.body);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function playStopFrom(seconds: number) {
  const mounted = await mountMarkerWorkspace();
  clickRuler(mounted, seconds);
  key(SPACE);
  expect(live(mounted.api).isPlaying).toBe(true);
  advance(1.5);
  key(SPACE);
  expect(live(mounted.api).isPlaying).toBe(false);
  return mounted;
}

describe('SABA-B-10a stage 1 Insert Marker and playhead (D-29z430)', { timeout: 15_000 }, () => {
  it('IM1 Space stops, and Space again plays from the insert marker, not the stop point', async () => {
    const mounted = await playStopFrom(2);
    const stopPoint = positionOf(mounted.api);
    expect(stopPoint).toBeGreaterThan(3);
    expect(insertMarkerOf(mounted)).toBe('2.000');
    key(SPACE);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBe(2);
  });

  it('IM2 Shift+Space continues from the stop point and leaves the insert marker', async () => {
    const mounted = await playStopFrom(2);
    const stopPoint = positionOf(mounted.api);
    key({ ...SPACE, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeCloseTo(stopPoint, 6);
    expect(insertMarkerOf(mounted)).toBe('2.000');
    key({ ...SPACE, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
  });

  it('IM3 Ctrl+Shift+Space and Cmd+Shift+Space move the insert marker to the playhead', async () => {
    const mounted = await playStopFrom(2);
    const stopPoint = Math.round(positionOf(mounted.api) * 1000) / 1000;
    key({ ...SPACE, ctrlKey: true, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(insertMarkerOf(mounted)).toBe(stopPoint.toFixed(3));
    expect(statusText(mounted)).toBe(
      studioPlaybackStrings.insertMarkerToPlayhead(formatArrangementTime(stopPoint)),
    );
    clickRuler(mounted, 1);
    expect(insertMarkerOf(mounted)).toBe('1.000');
    key(SPACE);
    advance(1.5);
    key(SPACE);
    const secondStop = Math.round(positionOf(mounted.api) * 1000) / 1000;
    expect(secondStop).toBeGreaterThan(2);
    expect(insertMarkerOf(mounted)).toBe('1.000');
    key({ ...SPACE, metaKey: true, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(insertMarkerOf(mounted)).toBe(secondStop.toFixed(3));
    expect(statusText(mounted)).toBe(
      studioPlaybackStrings.insertMarkerToPlayhead(formatArrangementTime(secondStop)),
    );
    key(SPACE);
    expect(positionOf(mounted.api)).toBe(secondStop);
    advance(2);
    key({ ...SPACE, ctrlKey: true, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(Number(insertMarkerOf(mounted))).toBeGreaterThan(secondStop + 1.5);
  });

  it('IM4 a ruler click while playing moves only the insert marker; playback continues', async () => {
    const mounted = await mountMarkerWorkspace();
    clickRuler(mounted, 1);
    key(SPACE);
    advance(0.5);
    clickRuler(mounted, 8);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(insertMarkerOf(mounted)).toBe('8.000');
    expect(positionOf(mounted.api)).toBeLessThan(2);
    expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerWhilePlaying('00:08.000'));
    key(SPACE);
    expect(positionOf(mounted.api)).toBeLessThan(2);
    key(SPACE);
    expect(positionOf(mounted.api)).toBe(8);
  });

  it('IM5 Space with a time selection plays from its start, again after a stop', async () => {
    const mounted = await mountMarkerWorkspace();
    clickRuler(mounted, 1);
    act(() => live(mounted.api).setTimeRange({ start: 7, end: 5, trackId: 'sfx' }));
    expect(insertMarkerOf(mounted)).toBe('1.000');
    key(SPACE);
    expect(positionOf(mounted.api)).toBe(5);
    advance(1);
    key(SPACE);
    key(SPACE);
    expect(positionOf(mounted.api)).toBe(5);
    expect(live(mounted.api).range).not.toBeNull();
  });

  it('IM6 placing the insert marker replaces a time selection', async () => {
    const mounted = await mountMarkerWorkspace();
    act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
    clickRuler(mounted, 9);
    expect(live(mounted.api).range).toBeNull();
    expect(insertMarkerOf(mounted)).toBe('9.000');
    key(SPACE);
    expect(positionOf(mounted.api)).toBe(9);
    key(SPACE);
    act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
    key({ key: 'Home', code: 'Home' });
    expect(live(mounted.api).range).toBeNull();
    expect(insertMarkerOf(mounted)).toBe('0.000');
    expect(positionOf(mounted.api)).toBe(0);
    act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
    key({ ...SPACE, ctrlKey: true, shiftKey: true });
    expect(live(mounted.api).range).toBeNull();
  });

  it('IM7 Home and Back to start during playback return playback and the insert marker to 0', async () => {
    const mounted = await mountMarkerWorkspace();
    clickRuler(mounted, 4);
    key(SPACE);
    advance(1);
    key({ key: 'Home', code: 'Home' });
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBe(0);
    expect(insertMarkerOf(mounted)).toBe('0.000');
    clickRuler(mounted, 6);
    fireEvent.click(
      mounted.view.getByRole('button', { name: studioPlaybackStrings.backToStartLabel }),
    );
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(insertMarkerOf(mounted)).toBe('0.000');
  });

  it('IM8 the playhead handle keys move the playhead; stopped they move the insert marker too', async () => {
    const mounted = await mountMarkerWorkspace();
    clickRuler(mounted, 3);
    const handle = mounted.view.getByTestId('arrangement-playhead-handle');
    fireEvent.keyDown(handle, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(positionOf(mounted.api)).toBeCloseTo(3.1, 6);
    expect(insertMarkerOf(mounted)).toBe('3.100');
    key(SPACE);
    advance(1);
    fireEvent.keyDown(handle, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeGreaterThan(3.15);
    expect(insertMarkerOf(mounted)).toBe('3.100');
  });

  it('IM9 seekTo jumps move the insert marker and keep a time selection', async () => {
    const mounted = await mountMarkerWorkspace();
    act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
    act(() => live(mounted.api).seekTo(4));
    expect(insertMarkerOf(mounted)).toBe('4.000');
    expect(live(mounted.api).range).not.toBeNull();
  });

  it('IM10 Cut Time remaps the insert marker', async () => {
    const mounted = await mountMarkerWorkspace();
    clickRuler(mounted, 6);
    act(() =>
      live(mounted.api).setTimeRange({ start: 2, end: 4, trackId: 'sfx', allTracks: true }),
    );
    act(() => live(mounted.api).cutTimeSelection());
    expect(insertMarkerOf(mounted)).toBe('4.000');
    expect(positionOf(mounted.api)).toBe(4);
  });

  it('IM11 D-27 on the insert marker: past the end refuses, at the end plays from 0', async () => {
    const mounted = await mountMarkerWorkspace();
    clickRuler(mounted, 18);
    key(SPACE);
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(statusText(mounted)).toBe(playPastEndMessage(18, 16, 'insert-marker'));
    clickRuler(mounted, 16);
    key(SPACE);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBe(0);
  });

  it('IM12 a marker flag double-click plays from the flag and clears a time selection', async () => {
    const mounted = await mountMarkerWorkspace();
    act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
    fireEvent.doubleClick(mounted.view.getByTestId('arrangement-marker'));
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBe(10);
    expect(insertMarkerOf(mounted)).toBe('10.000');
    expect(live(mounted.api).range).toBeNull();
  });

  it('IM13 Alt+Space toggles as before; Ctrl+Space alone and keys in text fields do nothing', async () => {
    const mounted = await playStopFrom(2);
    const stopPoint = positionOf(mounted.api);
    expect(stopPoint).toBeGreaterThan(3);
    key({ ...SPACE, ctrlKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    const tempo = mounted.view.getByTestId('arrangement-tempo-input');
    act(() => tempo.focus());
    fireEvent.keyDown(tempo, { ...SPACE, shiftKey: true });
    fireEvent.keyDown(tempo, { ...SPACE, ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(tempo, { ...SPACE, metaKey: true, shiftKey: true });
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(insertMarkerOf(mounted)).toBe('2.000');
    expect(positionOf(mounted.api)).toBe(stopPoint);
    act(() => tempo.blur());
    key({ ...SPACE, altKey: true });
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBe(2);
  });

  it('IM14 Ctrl+Shift+Space on a focused button does not activate it on key up', async () => {
    const mounted = await mountMarkerWorkspace();
    const play = mounted.view.getByRole('button', { name: studioPlaybackStrings.playLabel });
    act(() => play.focus());
    fireEvent.keyDown(play, { ...SPACE, ctrlKey: true, shiftKey: true });
    const notPrevented = fireEvent.keyUp(play, { ...SPACE, ctrlKey: true, shiftKey: true });
    expect(notPrevented).toBe(false);
    expect(live(mounted.api).isPlaying).toBe(false);
  });
});

describe(
  'SABA-B-10a stage 2a edit commands at the insert marker (D-29z436)',
  { timeout: 15_000 },
  () => {
    it('IM15 Paste lands at the insert marker, not at the stop point', async () => {
      const mounted = await mountMarkerWorkspace();
      act(() => live(mounted.api).selectClip('h1'));
      act(() => live(mounted.api).copySelection());
      clickRuler(mounted, 2);
      key(SPACE);
      advance(1.5);
      key(SPACE);
      expect(positionOf(mounted.api)).toBeGreaterThan(3);
      act(() => live(mounted.api).setActiveTrack('music'));
      act(() => live(mounted.api).pasteClipboard());
      const pasted = live(mounted.api).arrangement.clips.find(
        (clip) => clip.id === live(mounted.api).selectedClipId,
      );
      expect(pasted).toMatchObject({ trackId: 'music', start: 2 });
      expect(statusText(mounted)).toContain('00:02.000');
      act(() => live(mounted.api).undo());
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(live(mounted.api).getLivePosition()).toBeGreaterThan(2.5);
      act(() => live(mounted.api).pasteClipboard());
      const pastedPlaying = live(mounted.api).arrangement.clips.find(
        (clip) => clip.id === live(mounted.api).selectedClipId,
      );
      expect(pastedPlaying).toMatchObject({ trackId: 'music', start: 2 });
      expect(statusText(mounted)).toContain('00:02.000');
      expect(live(mounted.api).isPlaying).toBe(true);
    });

    it('IM16 Add from the library lands at the insert marker, stopped and while playing', async () => {
      const mounted = await playStopFrom(3);
      expect(positionOf(mounted.api)).toBeGreaterThan(4);
      act(() => live(mounted.api).setActiveTrack('music'));
      act(() => live(mounted.api).addSourceToActiveTrack('hit'));
      const first = live(mounted.api).arrangement.clips.find(
        (clip) => clip.id === live(mounted.api).selectedClipId,
      );
      expect(first).toMatchObject({ trackId: 'music', start: 3 });
      act(() => live(mounted.api).undo());
      expect(
        live(mounted.api).arrangement.clips.filter((clip) => clip.trackId === 'music'),
      ).toEqual([]);
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(live(mounted.api).getLivePosition()).toBeGreaterThan(3.5);
      act(() => live(mounted.api).addSourceToActiveTrack('hit'));
      const second = live(mounted.api).arrangement.clips.find(
        (clip) => clip.id === live(mounted.api).selectedClipId,
      );
      expect(second).toMatchObject({ trackId: 'music', start: 3 });
    });

    it('IM17 Ctrl+E without a time selection splits at the insert marker (one clip and several)', async () => {
      const mounted = await mountMarkerWorkspace();
      act(() => live(mounted.api).selectClip('h1'));
      act(() => live(mounted.api).copySelection());
      clickRuler(mounted, 0);
      act(() => live(mounted.api).setActiveTrack('music'));
      act(() => live(mounted.api).pasteClipboard());
      const copyId = live(mounted.api).selectedClipId;
      expect(copyId).not.toBeNull();
      clickRuler(mounted, 5);
      key(SPACE);
      advance(1.5);
      key(SPACE);
      expect(positionOf(mounted.api)).toBeGreaterThan(6);
      act(() => live(mounted.api).selectClip('h1'));
      key({ key: 'e', code: 'KeyE', ctrlKey: true });
      expect(statusText(mounted)).toBe(studioEditStrings.splitDone('00:05.000'));
      expect(
        live(mounted.api)
          .arrangement.clips.filter((clip) => clip.trackId === 'sfx')
          .map((clip) => clip.start)
          .sort((a, b) => a - b),
      ).toEqual([0, 5]);
      act(() => live(mounted.api).undo());
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(live(mounted.api).getLivePosition()).toBeGreaterThan(5.5);
      act(() => live(mounted.api).selectClip('h1'));
      key({ key: 'e', code: 'KeyE', ctrlKey: true });
      expect(statusText(mounted)).toBe(studioEditStrings.splitDone('00:05.000'));
      expect(
        live(mounted.api)
          .arrangement.clips.filter((clip) => clip.trackId === 'sfx')
          .map((clip) => clip.start)
          .sort((a, b) => a - b),
      ).toEqual([0, 5]);
      expect(live(mounted.api).isPlaying).toBe(true);
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(false);
      act(() => live(mounted.api).undo());
      act(() => live(mounted.api).selectClips(['h1', copyId ?? '']));
      key({ key: 'e', code: 'KeyE', ctrlKey: true });
      expect(statusText(mounted)).toBe(
        studioEditStrings.splitClipsDone({ count: 2, time: '00:05.000' }),
      );
      clickRuler(mounted, 18);
      act(() => live(mounted.api).selectClip('h1'));
      key({ key: 'e', code: 'KeyE', ctrlKey: true });
      expect(statusText(mounted)).toBe(studioEditStrings.splitInsertMarkerOutside);
    });

    it('IM18 M stopped adds at the insert marker; M while playing adds at the playback position', async () => {
      const mounted = await playStopFrom(2);
      expect(positionOf(mounted.api)).toBeGreaterThan(3);
      key({ key: 'm', code: 'KeyM' });
      const input = mounted.view.getByTestId('arrangement-marker-name-input');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      expect(live(mounted.api).arrangement.markers?.map((marker) => marker.time)).toContain(2);
      act(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
      key(SPACE);
      advance(2);
      expect(live(mounted.api).isPlaying).toBe(true);
      key({ key: 'm', code: 'KeyM' });
      const playingInput = mounted.view.getByTestId('arrangement-marker-name-input');
      fireEvent.keyDown(playingInput, { key: 'Enter', code: 'Enter' });
      const times = live(mounted.api).arrangement.markers?.map((marker) => marker.time) ?? [];
      expect(times.some((time) => time > 3.5 && time < 4.5)).toBe(true);
    });

    it('IM19 the past-end refusal names the start point: insert marker, time selection start or playhead', async () => {
      const mounted = await mountMarkerWorkspace();
      act(() => live(mounted.api).setTimeRange({ start: 17, end: 18, trackId: 'sfx' }));
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(statusText(mounted)).toBe(playPastEndMessage(17, 16, 'selection'));
      clickRuler(mounted, 18);
      key({ ...SPACE, shiftKey: true });
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(statusText(mounted)).toBe(playPastEndMessage(18, 16, 'playhead'));
      key(SPACE);
      expect(statusText(mounted)).toBe(playPastEndMessage(18, 16, 'insert-marker'));
    });

    it('IM20 Ctrl+Shift+Space and Home do nothing during a pointer gesture', async () => {
      const mounted = await playStopFrom(2);
      const stopPoint = positionOf(mounted.api);
      act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
      let release: () => void = () => undefined;
      act(() => {
        release = live(mounted.api).beginPointerGesture();
      });
      expect(fireEvent.keyDown(document.body, { ...SPACE, ctrlKey: true, shiftKey: true })).toBe(
        false,
      );
      expect(fireEvent.keyDown(document.body, { ...SPACE, metaKey: true, shiftKey: true })).toBe(
        false,
      );
      expect(fireEvent.keyDown(document.body, { key: 'Home', code: 'Home' })).toBe(false);
      expect(insertMarkerOf(mounted)).toBe('2.000');
      expect(positionOf(mounted.api)).toBe(stopPoint);
      expect(live(mounted.api).range).not.toBeNull();
      act(() => release());
      key({ key: 'Home', code: 'Home' });
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(live(mounted.api).range).toBeNull();
    });

    it('IM22 the library line names the insert marker, after a stop and while playing (C-R250-01)', async () => {
      const mounted = await playStopFrom(3);
      const caption = mounted.view.getByTestId('arrangement-library-insert-marker');
      expect(positionOf(mounted.api)).toBeGreaterThan(4);
      expect(caption.textContent).toBe('00:03.000');
      expect(caption.closest('p')?.textContent).toContain('· insert marker 00:03.000');
      expect(caption.closest('p')?.textContent).not.toContain('playhead');
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(live(mounted.api).getLivePosition()).toBeGreaterThan(3.5);
      act(() => mounted.api.position?.setPosition(live(mounted.api).getLivePosition()));
      expect(positionOf(mounted.api)).toBeGreaterThan(3.5);
      expect(caption.textContent).toBe('00:03.000');
      key(SPACE);
      clickRuler(mounted, 6);
      expect(caption.textContent).toBe('00:06.000');
      act(() => live(mounted.api).setActiveTrack('music'));
      act(() => live(mounted.api).addSourceToActiveTrack('hit'));
      const added = live(mounted.api).arrangement.clips.find(
        (clip) => clip.id === live(mounted.api).selectedClipId,
      );
      expect(added?.start).toBe(6);
    });

    it('IM23 M prefers the time selection start, stopped and while playing', async () => {
      const mounted = await playStopFrom(2);
      act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
      key({ key: 'm', code: 'KeyM' });
      fireEvent.keyDown(mounted.view.getByTestId('arrangement-marker-name-input'), {
        key: 'Enter',
        code: 'Enter',
      });
      const stoppedTimes =
        live(mounted.api).arrangement.markers?.map((marker) => marker.time) ?? [];
      expect(stoppedTimes).toContain(5);
      expect(stoppedTimes).not.toContain(2);
      act(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
      act(() => live(mounted.api).setTimeRange({ start: 9, end: 10, trackId: 'sfx' }));
      key(SPACE);
      advance(1);
      expect(live(mounted.api).isPlaying).toBe(true);
      key({ key: 'm', code: 'KeyM' });
      fireEvent.keyDown(mounted.view.getByTestId('arrangement-marker-name-input'), {
        key: 'Enter',
        code: 'Enter',
      });
      const playingTimes =
        live(mounted.api).arrangement.markers?.map((marker) => marker.time) ?? [];
      expect(playingTimes).toContain(9);
      expect(playingTimes).toHaveLength(stoppedTimes.length + 1);
      expect(playingTimes.filter((time) => time === 9)).toHaveLength(1);
    });

    it('IM21 a stopped playhead-handle step clears a time selection and moves the insert marker', async () => {
      const mounted = await mountMarkerWorkspace();
      clickRuler(mounted, 3);
      act(() => live(mounted.api).setTimeRange({ start: 5, end: 7, trackId: 'sfx' }));
      const handle = mounted.view.getByTestId('arrangement-playhead-handle');
      fireEvent.keyDown(handle, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(live(mounted.api).range).toBeNull();
      expect(insertMarkerOf(mounted)).toBe('3.100');
    });
  },
);
