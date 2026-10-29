import { act, fireEvent, render, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
  useArrangementInsertMarkerStore,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { studioShortcutAria } from '../shortcuts';
import { studioPlaybackStrings } from '../strings';
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

const centreCollection: WorkspaceCollection = {
  id: 'transport-centre',
  label: 'transport-centre',
  origin: 'demo',
  sources: [{ id: 'hit', title: 'Hit', collectionLabel: 'tc', kind: 'sfx', origin: 'demo' }],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

const CENTRE_CLIPS: ArrangementClip[] = [
  { id: 'h1', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 16 },
];

function centreArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips: CENTRE_CLIPS };
}

interface CentreApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
  insertMarker: ArrangementPositionStore | null;
}

function CentreProbe({ api }: { api: CentreApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  api.insertMarker = useArrangementInsertMarkerStore();
  return null;
}

function live(api: CentreApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: CentreApiRef): number {
  if (!api.position) {
    throw new Error('position store not mounted');
  }
  return api.position.getPosition();
}

const SPACE = { key: ' ', code: 'Space' };

function advance(seconds: number) {
  fakeClock.base -= seconds;
}

let sourceStarts = 0;

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  sourceStarts = 0;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.stubGlobal('innerWidth', 1440);
  vi.stubGlobal('innerHeight', 900);
  const createBufferSource = FakeAudioContext.prototype.createBufferSource;
  vi.spyOn(FakeAudioContext.prototype, 'createBufferSource').mockImplementation(function (
    this: InstanceType<typeof FakeAudioContext>,
  ) {
    sourceStarts += 1;
    return createBufferSource.call(this);
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function mountCentreWorkspace() {
  const api: CentreApiRef = { current: null, position: null, insertMarker: null };
  const view = render(
    <ArrangementProvider collection={centreCollection} initialArrangement={centreArrangement()}>
      <StudioWorkspace />
      <CentreProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  act(() => live(api).setInsertMarker(2));
  const play = () => view.getByRole('button', { name: 'Play' });
  const stop = () => view.getByRole('button', { name: 'Stop' });
  const marker = () =>
    view.getByTestId('arrangement-insert-marker').getAttribute('data-insert-marker');
  const status = () => view.getByTestId('arrangement-status').textContent;
  return { api, view, play, stop, marker, status };
}

type CentreMount = Awaited<ReturnType<typeof mountCentreWorkspace>>;

function moveStoreToLivePosition(mounted: CentreMount, atLeast: number) {
  act(() => mounted.api.position?.setPosition(live(mounted.api).getLivePosition()));
  expect(positionOf(mounted.api)).toBeGreaterThan(atLeast);
}

async function mountStoppedAtPlayhead() {
  const mounted = await mountCentreWorkspace();
  fireEvent.click(mounted.play());
  advance(1.4);
  fireEvent.click(mounted.stop());
  expect(live(mounted.api).isPlaying).toBe(false);
  expect(positionOf(mounted.api)).toBeGreaterThan(3.3);
  expect(mounted.marker()).toBe('2.000');
  return mounted;
}

function doubleClickStop(stop: HTMLElement) {
  fireEvent.click(stop, { detail: 1 });
  fireEvent.click(stop, { detail: 2 });
  fireEvent.doubleClick(stop, { detail: 2 });
}

function pressEnter(button: HTMLElement, repeat: boolean): boolean {
  const notPrevented = fireEvent.keyDown(button, { key: 'Enter', code: 'Enter', repeat });
  if (notPrevented) {
    fireEvent.click(button);
  }
  return notPrevented;
}

function buttonName(element: Element): string {
  return element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '';
}

describe(
  'SABA-B-9 stage 1 centre transport, Stop and an honest Play (D-29z481)',
  {
    timeout: 15_000,
  },
  () => {
    it('TC1 the three groups are edit, centre and view in DOM order, with the clock between Follow and Play', async () => {
      const { view } = await mountCentreWorkspace();
      const root = view.getByTestId('arrangement-transport');
      const edit = view.getByTestId('arrangement-transport-edit');
      const centre = view.getByTestId('arrangement-transport-centre');
      const viewGroup = view.getByTestId('arrangement-transport-view');
      expect(Array.from(root.children)).toEqual([edit, centre, viewGroup]);
      expect(Array.from(edit.querySelectorAll('button')).map(buttonName)).toEqual([
        'Undo',
        'Redo',
        'Split',
        'Delete — the selected clip; leaves a gap',
      ]);
      expect(Array.from(centre.querySelectorAll('button')).map(buttonName)).toEqual([
        'Follow',
        'Play',
        'Stop',
        'Back to start',
        'Loop',
      ]);
      expect(Array.from(viewGroup.querySelectorAll('button, input')).map(buttonName)).toEqual([
        'Zoom (px/s)',
        'Zoom to selection (Z)',
        'Zoom',
        'Fit',
        'Export',
      ]);
      const position = view.getByTestId('arrangement-position');
      expect(centre.contains(position)).toBe(true);
      expect(centre.contains(view.getByTestId('arrangement-project-end'))).toBe(true);
      const follow = view.getByTestId('arrangement-follow');
      const play = view.getByRole('button', { name: 'Play' });
      expect(
        follow.compareDocumentPosition(position) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        position.compareDocumentPosition(play) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(viewGroup.contains(view.getByTestId('arrangement-zoom-readout'))).toBe(true);
    });

    it('TC2 Play while stopped plays from the insert marker; Play while playing neither stops nor restarts', async () => {
      const mounted = await mountCentreWorkspace();
      const play = mounted.play();
      expect(play.dataset.playing).toBe('false');
      fireEvent.click(play);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(positionOf(mounted.api)).toBe(2);
      expect(play.dataset.playing).toBe('true');
      const startsAfterPlay = sourceStarts;
      expect(startsAfterPlay).toBeGreaterThan(0);
      const statusAfterPlay = mounted.status();
      const undoAfterPlay = live(mounted.api).undoLabel;
      advance(0.5);
      fireEvent.click(play);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(sourceStarts).toBe(startsAfterPlay);
      expect(play.dataset.playing).toBe('true');
      expect(mounted.status()).toBe(statusAfterPlay);
      expect(live(mounted.api).undoLabel).toBe(undoAfterPlay);
      expect(live(mounted.api).getLivePosition()).toBeGreaterThan(2.4);
      expect(mounted.marker()).toBe('2.000');
    });

    it('TC3 Stop while playing stops at the stop point and keeps the insert marker; Space then plays from it', async () => {
      const mounted = await mountCentreWorkspace();
      fireEvent.click(mounted.play());
      advance(1.5);
      moveStoreToLivePosition(mounted, 3);
      fireEvent.click(mounted.stop());
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(mounted.play().dataset.playing).toBe('false');
      const stopPoint = positionOf(mounted.api);
      expect(stopPoint).toBeGreaterThan(3);
      advance(1);
      expect(positionOf(mounted.api)).toBe(stopPoint);
      expect(live(mounted.api).getLivePosition()).toBe(stopPoint);
      expect(mounted.marker()).toBe('2.000');
      fireEvent.keyDown(document.body, SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(positionOf(mounted.api)).toBe(2);
    });

    it('TC4 a single Stop click while stopped changes nothing', async () => {
      const mounted = await mountStoppedAtPlayhead();
      const position = positionOf(mounted.api);
      const status = mounted.status();
      const undoLabel = live(mounted.api).undoLabel;
      const starts = sourceStarts;
      fireEvent.click(mounted.stop());
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(positionOf(mounted.api)).toBe(position);
      expect(mounted.marker()).toBe('2.000');
      expect(mounted.status()).toBe(status);
      expect(live(mounted.api).undoLabel).toBe(undoLabel);
      expect(sourceStarts).toBe(starts);
    });

    it('TC5 a Stop double-click returns marker and playhead to 0, stopped and while playing, never restarting', async () => {
      const stopped = await mountStoppedAtPlayhead();
      const undoStopped = live(stopped.api).undoLabel;
      doubleClickStop(stopped.stop());
      expect(live(stopped.api).isPlaying).toBe(false);
      expect(stopped.marker()).toBe('0.000');
      expect(positionOf(stopped.api)).toBe(0);
      expect(stopped.view.getByTestId('arrangement-position').textContent).toBe('00:00.000');
      expect(live(stopped.api).undoLabel).toBe(undoStopped);
      stopped.view.unmount();

      const playing = await mountCentreWorkspace();
      fireEvent.click(playing.play());
      advance(1.2);
      expect(live(playing.api).isPlaying).toBe(true);
      const undoPlaying = live(playing.api).undoLabel;
      const startsBefore = sourceStarts;
      doubleClickStop(playing.stop());
      expect(live(playing.api).isPlaying).toBe(false);
      expect(playing.play().dataset.playing).toBe('false');
      expect(playing.marker()).toBe('0.000');
      expect(positionOf(playing.api)).toBe(0);
      expect(sourceStarts).toBe(startsBefore);
      advance(1);
      expect(live(playing.api).isPlaying).toBe(false);
      expect(live(playing.api).getLivePosition()).toBe(0);
      expect(live(playing.api).undoLabel).toBe(undoPlaying);
    });

    it('TC6 Play and Stop keep constant names, titles and Space shortcuts; no Pause button exists', async () => {
      const mounted = await mountCentreWorkspace();
      const expectConstant = () => {
        const play = mounted.play();
        expect(play.getAttribute('aria-label')).toBe('Play');
        expect(play.title).toBe('Play (Space)');
        expect(play.getAttribute('aria-keyshortcuts')).toBe('Space');
        expect(play.getAttribute('aria-keyshortcuts')).toBe(studioShortcutAria('play-stop'));
        const stop = mounted.stop();
        expect(stop.getAttribute('aria-label')).toBe('Stop');
        expect(stop.title).toBe('Stop (Space)');
        expect(stop.title).toBe(studioPlaybackStrings.stopTitle);
        expect(stop.getAttribute('aria-keyshortcuts')).toBe('Space');
        expect(stop.hasAttribute('disabled')).toBe(false);
        expect(stop.textContent).toBe('');
        expect(mounted.view.queryByRole('button', { name: 'Pause' })).toBeNull();
        expect(mounted.view.queryByTitle(/Pause/)).toBeNull();
      };
      expectConstant();
      fireEvent.click(mounted.play());
      expect(live(mounted.api).isPlaying).toBe(true);
      expectConstant();
      fireEvent.click(mounted.stop());
      expect(live(mounted.api).isPlaying).toBe(false);
      expectConstant();
    });

    it('TC7 Space on a focused Play or Stop toggles once per press and ignores key repeat', async () => {
      const mounted = await mountCentreWorkspace();
      const play = mounted.play();
      play.focus();
      expect(document.activeElement).toBe(play);
      fireEvent.keyDown(play, SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      const starts = sourceStarts;
      fireEvent.keyDown(play, { ...SPACE, repeat: true });
      fireEvent.keyDown(play, { ...SPACE, repeat: true });
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(sourceStarts).toBe(starts);
      fireEvent.keyUp(play, SPACE);
      expect(live(mounted.api).isPlaying).toBe(true);
      const stop = mounted.stop();
      stop.focus();
      fireEvent.keyDown(stop, SPACE);
      expect(live(mounted.api).isPlaying).toBe(false);
      fireEvent.keyDown(stop, { ...SPACE, repeat: true });
      expect(live(mounted.api).isPlaying).toBe(false);
      fireEvent.keyUp(stop, SPACE);
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(mounted.marker()).toBe('2.000');
    });

    it('TC8 Enter on Stop while playing stops once; held Enter on Stop and on Play adds nothing', async () => {
      const mounted = await mountCentreWorkspace();
      fireEvent.click(mounted.play());
      advance(1);
      const stop = mounted.stop();
      stop.focus();
      expect(pressEnter(stop, false)).toBe(true);
      expect(live(mounted.api).isPlaying).toBe(false);
      const stopPoint = positionOf(mounted.api);
      for (let held = 0; held < 3; held++) {
        expect(pressEnter(stop, true)).toBe(false);
      }
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(positionOf(mounted.api)).toBe(stopPoint);
      expect(mounted.marker()).toBe('2.000');
      const play = mounted.play();
      play.focus();
      expect(pressEnter(play, false)).toBe(true);
      expect(live(mounted.api).isPlaying).toBe(true);
      const starts = sourceStarts;
      for (let held = 0; held < 3; held++) {
        expect(pressEnter(play, true)).toBe(false);
      }
      expect(live(mounted.api).isPlaying).toBe(true);
      expect(sourceStarts).toBe(starts);
    });

    it('TC9 focus stays on Stop after its double-click, and the Undo → Redo handoff still works', async () => {
      const mounted = await mountCentreWorkspace();
      fireEvent.click(mounted.play());
      advance(0.5);
      const stop = mounted.stop();
      stop.focus();
      doubleClickStop(stop);
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(document.activeElement).toBe(stop);
      act(() => live(mounted.api).setTimeRange({ start: 3, end: 5, trackId: 'sfx' }));
      act(() => live(mounted.api).toggleLoopSelection());
      expect(live(mounted.api).undoLabel).not.toBeNull();
      const undo = mounted.view.getByRole('button', { name: /^Undo/ });
      undo.focus();
      fireEvent.click(undo);
      const redo = mounted.view.getByRole('button', { name: /^Redo/ });
      expect(undo).toHaveProperty('disabled', true);
      expect(document.activeElement).toBe(redo);
    });
    it('B256 probe: hidden described-by state in jsdom', async () => {
      const mounted = await mountCentreWorkspace();
      const { getByRole } = within(document.body);
      expect(getByRole('button', { name: 'Play', description: 'Stopped' })).toBe(mounted.play());
      expect(getByRole('button', { name: 'Stop', description: 'Stopped' })).toBe(mounted.stop());
      fireEvent.click(mounted.play());
      expect(getByRole('button', { name: 'Play', description: 'Playing' })).toBe(mounted.play());
      expect(getByRole('button', { name: 'Stop', description: 'Playing' })).toBe(mounted.stop());
      fireEvent.click(mounted.stop());
      expect(getByRole('button', { name: 'Play', description: 'Stopped' })).toBe(mounted.play());
    });
  },
);
