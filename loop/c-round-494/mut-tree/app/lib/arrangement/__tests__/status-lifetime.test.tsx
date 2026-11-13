import { act, cleanup, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  ArrangementProvider,
  formatArrangementTime,
  playPastEndMessage,
  useArrangementRange,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementLoop,
  TimeRange,
  WorkspaceCollection,
} from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioLibraryStrings, studioPlaybackStrings, studioViewStrings } from '../strings';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';
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
const DEMO_READY =
  'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.';

const lifetimeCollection: WorkspaceCollection = {
  id: 'status-lifetime',
  label: 'status-lifetime',
  origin: 'demo',
  sources: [{ id: 'pulse', title: 'Pulse', collectionLabel: 'lt', kind: 'stem', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

const PULSE_CLIPS: ArrangementClip[] = [
  { id: 'p1', trackId: 'music', sourceId: 'pulse', start: 0, sourceOffset: 0, duration: 16 },
];

function lifetimeArrangement(loop: ArrangementLoop | null): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: PULSE_CLIPS, loop };
}

type ArrangementRangeProbeValue = WorkspaceProbeValue & { range: TimeRange | null };

interface LifetimeApiRef {
  current: ArrangementRangeProbeValue | null;
}

function LifetimeProbe({ api }: { api: LifetimeApiRef }) {
  api.current = { ...useWorkspaceProbe(), range: useArrangementRange((state) => state.range) };
  return null;
}

function live(api: LifetimeApiRef): ArrangementRangeProbeValue {
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

async function mountLifetimeWorkspace(loop: ArrangementLoop | null = null) {
  const api: LifetimeApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={lifetimeCollection}
      initialArrangement={lifetimeArrangement(loop)}
    >
      <StudioWorkspace />
      <LifetimeProbe api={api} />
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

type LifetimeMount = Awaited<ReturnType<typeof mountLifetimeWorkspace>>;

function statusText(mounted: LifetimeMount): string | null {
  return mounted.view.getByTestId('arrangement-status').textContent;
}

function firstAddStatus(text: string): string {
  return `${text} ${studioLibraryStrings.nameBarHint}`;
}

function insertMarkerOf(mounted: LifetimeMount): string | null {
  return mounted.view.getByTestId('arrangement-insert-marker').getAttribute('data-insert-marker');
}

function followButton(mounted: LifetimeMount): HTMLElement {
  return mounted.view.getByTestId('arrangement-follow');
}

const press = { button: 0, buttons: 1 };

function clickRuler(mounted: LifetimeMount, seconds: number) {
  const clientX = seconds * PX_PER_SECOND;
  fireEvent.pointerDown(mounted.ruler, { ...press, pointerId: 1, clientX, clientY: RULER_Y });
  fireEvent.pointerUp(mounted.ruler, { pointerId: 1, clientX, clientY: RULER_Y });
}

function key(init: KeyboardEventInit) {
  fireEvent.keyDown(document.body, init);
}

const SPACE = { key: ' ', code: 'Space' };
const CTRL_LEFT = { key: 'ArrowLeft', code: 'ArrowLeft', ctrlKey: true };
const CTRL_RIGHT = { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true };

function advance(seconds: number) {
  fakeClock.base -= seconds;
}

let pendingFrames: FrameRequestCallback[] = [];

function runFrames() {
  const frames = pendingFrames;
  pendingFrames = [];
  act(() => {
    for (const frame of frames) {
      frame(performance.now());
    }
  });
}

function livePosition(mounted: LifetimeMount): number {
  return live(mounted.api).getLivePosition();
}

async function playAndAdvance(loop: ArrangementLoop | null = null) {
  const mounted = await mountLifetimeWorkspace(loop);
  expect(statusText(mounted)).toBe(DEMO_READY);
  key(SPACE);
  expect(live(mounted.api).isPlaying).toBe(true);
  const before = livePosition(mounted);
  advance(1);
  expect(livePosition(mounted)).toBeGreaterThan(before + 0.5);
  return mounted;
}

function stop(mounted: LifetimeMount) {
  key(SPACE);
  expect(live(mounted.api).isPlaying).toBe(false);
}

async function stoppedAt(seconds: number) {
  const mounted = await playAndAdvance();
  clickRuler(mounted, seconds);
  stop(mounted);
  return mounted;
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  pendingFrames = [];
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', (frame: FrameRequestCallback) => {
    pendingFrames.push(frame);
    return pendingFrames.length;
  });
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

describe(
  'SYS-6 STATUS-LIFETIME: transport and edit-result texts stay true (D-29z594, D-29z599, D-29z603)',
  {
    timeout: 15_000,
  },
  () => {
    it('LT1 a marker past the end: Stop writes the exact refusal text, and Space re-announces it', async () => {
      const mounted = await playAndAdvance();
      clickRuler(mounted, 17);
      expect(insertMarkerOf(mounted)).toBe('17.000');
      stop(mounted);
      const refusal = playPastEndMessage(17, 16, 'insert-marker');
      expect(refusal).toBe(
        'Insert marker (00:17.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.',
      );
      expect(statusText(mounted)).toBe(refusal);
      const sequence = live(mounted.api).statusSequence;
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(statusText(mounted)).toBe(refusal);
      expect(live(mounted.api).statusSequence).toBe(sequence + 1);
    });

    it('LT2 a marker at the end: Stop says Space plays from 0, and Space does', async () => {
      const mounted = await playAndAdvance();
      clickRuler(mounted, 16);
      expect(insertMarkerOf(mounted)).toBe('16.000');
      stop(mounted);
      expect(statusText(mounted)).toBe(
        studioPlaybackStrings.insertMarkerAfterStopFromStart('00:16.000'),
      );
      expect(statusText(mounted)).toBe(
        'Stopped — the insert marker (00:16.000) is at the end; Space plays from 00:00.000.',
      );
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      advance(0.5);
      expect(livePosition(mounted)).toBeGreaterThan(0.3);
      expect(livePosition(mounted)).toBeLessThan(1);
    });

    it('LT3 Ctrl+Left while playing rewrites the Follow-paused text, and Stop names the new marker', async () => {
      const mounted = await playAndAdvance();
      clickRuler(mounted, 4);
      expect(statusText(mounted)).toBe(
        studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused('00:04.000'),
      );
      key(CTRL_LEFT);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(statusText(mounted)).toBe(
        studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused('00:00.000'),
      );
      stop(mounted);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:00.000'));
    });

    it('LT4 Ctrl+Right to the end while playing, then the natural end: the from-start text', async () => {
      const mounted = await playAndAdvance();
      clickRuler(mounted, 4);
      key(CTRL_RIGHT);
      expect(insertMarkerOf(mounted)).toBe('16.000');
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(statusText(mounted)).toBe(
        studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused('00:16.000'),
      );
      advance(0.5);
      runFrames();
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(statusText(mounted)).toBe(
        studioPlaybackStrings.insertMarkerAfterStopFromStart('00:16.000'),
      );
    });

    it('LT5 a stopped marker move rewrites the stopped text: Ctrl+Right to the end, then Ctrl+Left', async () => {
      const mounted = await playAndAdvance();
      clickRuler(mounted, 4);
      stop(mounted);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:04.000'));
      key(CTRL_RIGHT);
      expect(insertMarkerOf(mounted)).toBe('16.000');
      expect(statusText(mounted)).toBe(
        studioPlaybackStrings.insertMarkerAfterStopFromStart('00:16.000'),
      );
      key(CTRL_LEFT);
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:00.000'));
    });

    it('LT6 the refusal text follows the marker: Home after a past-end stop', async () => {
      const mounted = await playAndAdvance();
      clickRuler(mounted, 17);
      stop(mounted);
      expect(statusText(mounted)).toBe(playPastEndMessage(17, 16, 'insert-marker'));
      key({ key: 'Home', code: 'Home' });
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:00.000'));
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
    });

    it('LT7 with Follow off Ctrl+Left keeps the plain playing form, and Stop names the new marker', async () => {
      const mounted = await playAndAdvance();
      fireEvent.click(followButton(mounted));
      expect(followButton(mounted).dataset.followMode).toBe('off');
      clickRuler(mounted, 6);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerWhilePlaying('00:06.000'));
      key(CTRL_LEFT);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerWhilePlaying('00:00.000'));
      stop(mounted);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:00.000'));
    });

    it('LT8 with a time selection, a marker write turns the stopped text into the selection form', async () => {
      const mounted = await playAndAdvance();
      clickRuler(mounted, 4);
      stop(mounted);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:04.000'));
      act(() => live(mounted.api).setTimeRange({ start: 5, end: 2, trackId: 'music' }));
      expect(statusText(mounted)).toBe(studioPlaybackStrings.selectionAfterStop('00:02.000'));
      act(() => live(mounted.api).seekTo(9));
      expect(statusText(mounted)).toBe(studioPlaybackStrings.selectionAfterStop('00:02.000'));
      expect(statusText(mounted)).toBe(
        'Stopped — Space plays from the time selection start at 00:02.000.',
      );
      key({ key: 'Home', code: 'Home' });
      expect(live(mounted.api).range).toBeNull();
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:00.000'));
    });

    it('LT9 texts outside the set are untouched by a marker write and the sequence does not move', async () => {
      const mounted = await playAndAdvance();
      clickRuler(mounted, 4);
      expect(followButton(mounted).dataset.followMode).toBe('paused');
      fireEvent.click(followButton(mounted));
      expect(followButton(mounted).dataset.followMode).toBe('on');
      expect(statusText(mounted)).toBe(studioViewStrings.followResumed);
      const resumedSequence = live(mounted.api).statusSequence;
      expect(insertMarkerOf(mounted)).toBe('4.000');
      key(CTRL_LEFT);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(statusText(mounted)).toBe(studioViewStrings.followResumed);
      expect(live(mounted.api).statusSequence).toBe(resumedSequence);
      stop(mounted);
      cleanup();
      const fresh = await mountLifetimeWorkspace();
      expect(statusText(fresh)).toBe(DEMO_READY);
      const readySequence = live(fresh.api).statusSequence;
      key(CTRL_RIGHT);
      expect(insertMarkerOf(fresh)).toBe('16.000');
      expect(statusText(fresh)).toBe(DEMO_READY);
      expect(live(fresh.api).statusSequence).toBe(readySequence);
    });

    it('LT10 an explicit write wins over Rule W: Ctrl+Shift+Space, then Ctrl+Left while playing', async () => {
      const mounted = await playAndAdvance();
      advance(2);
      key({ ...SPACE, ctrlKey: true, shiftKey: true });
      const marker = insertMarkerOf(mounted);
      expect(Number(marker)).toBeGreaterThan(2.5);
      const time = formatArrangementTime(Number(marker));
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerToPlayhead(time));
      expect(live(mounted.api).isPlaying).toBe(true);
      key(CTRL_LEFT);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerWhilePlaying('00:00.000'));
      stop(mounted);
      cleanup();
      const again = await playAndAdvance();
      key({ ...SPACE, ctrlKey: true, shiftKey: true });
      const againTime = formatArrangementTime(Number(insertMarkerOf(again)));
      expect(statusText(again)).toBe(studioPlaybackStrings.insertMarkerToPlayhead(againTime));
      stop(again);
      expect(statusText(again)).toBe(studioPlaybackStrings.insertMarkerAfterStop(againTime));
    });

    it('LT11 one predicate: the stopped text always matches what Space then does', async () => {
      const cases: Array<{
        marker: number;
        loop: ArrangementLoop | null;
        text: string;
        plays: boolean;
        from: number;
      }> = [
        {
          marker: 4,
          loop: null,
          text: studioPlaybackStrings.insertMarkerAfterStop('00:04.000'),
          plays: true,
          from: 4,
        },
        {
          marker: 16,
          loop: null,
          text: studioPlaybackStrings.insertMarkerAfterStopFromStart('00:16.000'),
          plays: true,
          from: 0,
        },
        {
          marker: 17,
          loop: null,
          text: playPastEndMessage(17, 16, 'insert-marker'),
          plays: false,
          from: 17,
        },
        {
          marker: 17,
          loop: { start: 16.5, end: 18, enabled: true },
          text: studioPlaybackStrings.insertMarkerAfterStop('00:17.000'),
          plays: true,
          from: 17,
        },
      ];
      for (const entry of cases) {
        const mounted = await playAndAdvance(entry.loop);
        clickRuler(mounted, entry.marker);
        stop(mounted);
        expect(statusText(mounted)).toBe(entry.text);
        key(SPACE);
        expect(live(mounted.api).isPlaying).toBe(entry.plays);
        if (entry.plays) {
          expect(Math.abs(live(mounted.api).getLivePosition() - entry.from)).toBeLessThan(0.25);
          key(SPACE);
        } else {
          expect(statusText(mounted)).toBe(entry.text);
        }
        cleanup();
      }
    });

    it('LT12 a strip click from a stopped text plays from the click and names it while playing', async () => {
      const mounted = await stoppedAt(4);
      act(() => live(mounted.api).playFrom(6));
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(insertMarkerOf(mounted)).toBe('6.000');
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerWhilePlaying('00:06.000'));
      expect(statusText(mounted)).toBe(
        'Insert marker at 00:06.000 — playback continues. Stop, then Space plays from here.',
      );
      stop(mounted);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:06.000'));
    });

    it('LT13 a marker write and a range write in one handler: the text describes the end state, in both orders', async () => {
      const mounted = await stoppedAt(4);
      act(() => {
        live(mounted.api).setInsertMarker(3);
        live(mounted.api).setTimeRange({ start: 2, end: 5, trackId: 'music' });
      });
      expect(statusText(mounted)).toBe(studioPlaybackStrings.selectionAfterStop('00:02.000'));
      act(() => {
        live(mounted.api).setTimeRange({ start: 2, end: 5, trackId: 'music' });
        live(mounted.api).setInsertMarker(7);
      });
      expect(live(mounted.api).range).toBeNull();
      expect(insertMarkerOf(mounted)).toBe('7.000');
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:07.000'));
    });

    it('LT14 Space from a stopped text says where it plays from, and Stop restores the stopped text', async () => {
      const mounted = await stoppedAt(4);
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.playingFrom('00:04.000'));
      expect(statusText(mounted)).toBe('Playing from 00:04.000.');
      stop(mounted);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:04.000'));
      cleanup();
      const withRange = await stoppedAt(4);
      act(() => live(withRange.api).setTimeRange({ start: 2, end: 5, trackId: 'music' }));
      expect(statusText(withRange)).toBe(studioPlaybackStrings.selectionAfterStop('00:02.000'));
      key(SPACE);
      expect(live(withRange.api).isPlaying).toBe(true);
      expect(Math.abs(livePosition(withRange) - 2)).toBeLessThan(0.25);
      expect(statusText(withRange)).toBe('Playing from 00:02.000.');
      stop(withRange);
      expect(statusText(withRange)).toBe(studioPlaybackStrings.selectionAfterStop('00:02.000'));
      cleanup();
      const fromStart = await stoppedAt(16);
      expect(statusText(fromStart)).toBe(
        studioPlaybackStrings.insertMarkerAfterStopFromStart('00:16.000'),
      );
      key(SPACE);
      expect(live(fromStart.api).isPlaying).toBe(true);
      expect(statusText(fromStart)).toBe('Playing from 00:00.000.');
      stop(fromStart);
      expect(statusText(fromStart)).toBe(
        studioPlaybackStrings.insertMarkerAfterStopFromStart('00:16.000'),
      );
    });

    it('LT15 Space and Stop keep a clip-added text and the Follow-resumed text, and the sequence does not move', async () => {
      const mounted = await mountLifetimeWorkspace();
      act(() => live(mounted.api).setActiveTrack('sfx'));
      act(() => live(mounted.api).addSourceToActiveTrack('pulse'));
      const added = firstAddStatus(
        studioLibraryStrings.clipAdded({
          title: 'Pulse',
          track: 'SFX',
          time: '00:00.000',
          suffix: '',
        }),
      );
      expect(statusText(mounted)).toBe(added);
      const addedSequence = live(mounted.api).statusSequence;
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(statusText(mounted)).toBe(added);
      expect(live(mounted.api).statusSequence).toBe(addedSequence);
      stop(mounted);
      expect(statusText(mounted)).toBe(added);
      expect(live(mounted.api).statusSequence).toBe(addedSequence);
      cleanup();
      const resumed = await playAndAdvance();
      clickRuler(resumed, 4);
      fireEvent.click(followButton(resumed));
      expect(statusText(resumed)).toBe(studioViewStrings.followResumed);
      const resumedSequence = live(resumed.api).statusSequence;
      stop(resumed);
      expect(statusText(resumed)).toBe(studioViewStrings.followResumed);
      expect(live(resumed.api).statusSequence).toBe(resumedSequence);
      key(SPACE);
      expect(live(resumed.api).isPlaying).toBe(true);
      expect(statusText(resumed)).toBe(studioViewStrings.followResumed);
      expect(live(resumed.api).statusSequence).toBe(resumedSequence);
      stop(resumed);
      expect(statusText(resumed)).toBe(studioViewStrings.followResumed);
      expect(live(resumed.api).statusSequence).toBe(resumedSequence);
    });

    it('LT16 the Playing-from text follows a marker move while playing and is replaced at Stop', async () => {
      const mounted = await stoppedAt(4);
      key(SPACE);
      expect(statusText(mounted)).toBe('Playing from 00:04.000.');
      key(CTRL_LEFT);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(followButton(mounted).dataset.followMode).toBe('on');
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerWhilePlaying('00:00.000'));
      stop(mounted);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:00.000'));
    });

    it('LT17 range writes under a pointer gesture leave the text alone; the release re-derives it once', async () => {
      const mounted = await stoppedAt(4);
      const before = statusText(mounted);
      expect(before).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:04.000'));
      const sequence = live(mounted.api).statusSequence;
      const releaseGesture = live(mounted.api).claimPointerGesture(1, () => {});
      expect(releaseGesture).not.toBeNull();
      for (const end of [3, 4, 5]) {
        act(() => live(mounted.api).setTimeRange({ start: 2, end, trackId: 'music' }));
        expect(statusText(mounted)).toBe(before);
        expect(live(mounted.api).statusSequence).toBe(sequence);
      }
      act(() => releaseGesture?.());
      expect(statusText(mounted)).toBe(studioPlaybackStrings.selectionAfterStop('00:02.000'));
      expect(live(mounted.api).statusSequence).toBe(sequence + 1);
    });

    it('LT18 Home after a refused selection past the end names the insert marker at 0', async () => {
      const mounted = await mountLifetimeWorkspace();
      act(() => live(mounted.api).setTimeRange({ start: 17, end: 18, trackId: 'music' }));
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(statusText(mounted)).toBe(playPastEndMessage(17, 16, 'selection'));
      key({ key: 'Home', code: 'Home' });
      expect(live(mounted.api).range).toBeNull();
      expect(insertMarkerOf(mounted)).toBe('0.000');
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:00.000'));
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
    });

    it('LT19 a range write keeps texts outside the stopped set, and playing texts', async () => {
      const mounted = await mountLifetimeWorkspace();
      act(() => live(mounted.api).setActiveTrack('sfx'));
      act(() => live(mounted.api).addSourceToActiveTrack('pulse'));
      const added = statusText(mounted);
      expect(added).toBe(
        firstAddStatus(
          studioLibraryStrings.clipAdded({
            title: 'Pulse',
            track: 'SFX',
            time: '00:00.000',
            suffix: '',
          }),
        ),
      );
      const addedSequence = live(mounted.api).statusSequence;
      act(() => live(mounted.api).setTimeRange({ start: 2, end: 5, trackId: 'music' }));
      expect(statusText(mounted)).toBe(added);
      expect(live(mounted.api).statusSequence).toBe(addedSequence);
      cleanup();
      const playing = await playAndAdvance();
      fireEvent.click(followButton(playing));
      clickRuler(playing, 6);
      expect(statusText(playing)).toBe(studioPlaybackStrings.insertMarkerWhilePlaying('00:06.000'));
      const playingSequence = live(playing.api).statusSequence;
      act(() => live(playing.api).setTimeRange({ start: 2, end: 5, trackId: 'music' }));
      expect(live(playing.api).isPlaying).toBe(true);
      expect(statusText(playing)).toBe(studioPlaybackStrings.insertMarkerWhilePlaying('00:06.000'));
      expect(live(playing.api).statusSequence).toBe(playingSequence);
    });

    it('LT20 a nudge states the new start at each step, and Undo replaces it', async () => {
      const mounted = await mountLifetimeWorkspace();
      act(() => live(mounted.api).selectClip('p1'));
      const startSequence = live(mounted.api).statusSequence;
      act(() => live(mounted.api).nudgeSelectedClip(1));
      expect(statusText(mounted)).toBe('Nudge clip: start 00:01.000.');
      expect(live(mounted.api).statusSequence).toBe(startSequence + 1);
      act(() => live(mounted.api).nudgeSelectedClip(-0.5));
      expect(statusText(mounted)).toBe('Nudge clip: start 00:00.500.');
      expect(live(mounted.api).statusSequence).toBe(startSequence + 2);
      act(() => live(mounted.api).undo());
      expect(statusText(mounted)).toBe('Undo: Nudge clip');
      expect(live(mounted.api).arrangement.clips.find((clip) => clip.id === 'p1')?.start).toBe(1);
    });

    it('LT21 a nudge replaces a stopped text, and Space and Stop keep the nudge text', async () => {
      const mounted = await stoppedAt(4);
      expect(statusText(mounted)).toBe(studioPlaybackStrings.insertMarkerAfterStop('00:04.000'));
      act(() => live(mounted.api).selectClip('p1'));
      act(() => live(mounted.api).nudgeSelectedClip(1));
      expect(statusText(mounted)).toBe('Nudge clip: start 00:01.000.');
      const nudgeSequence = live(mounted.api).statusSequence;
      key(SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(statusText(mounted)).toBe('Nudge clip: start 00:01.000.');
      expect(live(mounted.api).statusSequence).toBe(nudgeSequence);
      stop(mounted);
      expect(statusText(mounted)).toBe('Nudge clip: start 00:01.000.');
      expect(live(mounted.api).statusSequence).toBe(nudgeSequence);
    });
  },
);
