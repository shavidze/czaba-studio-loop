import { act, cleanup, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  playPastEndMessage,
  useArrangement,
  useArrangementPositionStore,
} from '~/contexts/ArrangementContext';
import type { Arrangement, ArrangementClip, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import type { ArrangementPositionStore } from '../position-store';
import { studioPlaybackStrings, studioTempoStrings, studioViewStrings } from '../strings';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

const barsMarksCalls = vi.hoisted(() => ({ count: 0 }));

vi.mock('~/lib/arrangement/tempo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/tempo')>();
  return {
    ...actual,
    barsRulerMarks: (...args: Parameters<typeof actual.barsRulerMarks>) => {
      barsMarksCalls.count += 1;
      return actual.barsRulerMarks(...args);
    },
  };
});

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
const STRIP_Y = 4;
const LOWER_Y = 15;
const SECONDS_RULER_Y = 10;

const barsCollection: WorkspaceCollection = {
  id: 'bars',
  label: 'bars',
  origin: 'demo',
  sources: [
    {
      id: 'slow-stem',
      title: 'Slow stem',
      collectionLabel: 'bars',
      kind: 'stem',
      origin: 'demo',
      bpm: 90,
    },
    { id: 'hit', title: 'Hit', collectionLabel: 'bars', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 1600, numberOfChannels: 1, sampleRate: 100 }),
};

const SFX_CLIPS: ArrangementClip[] = [
  { id: 'h1', trackId: 'sfx', sourceId: 'hit', start: 0, sourceOffset: 0, duration: 16 },
];

function barsArrangement(clips: ArrangementClip[]): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return { ...base, clips };
}

interface BarsApiRef {
  current: ArrangementContextValue | null;
  position: ArrangementPositionStore | null;
}

function BarsProbe({ api }: { api: BarsApiRef }) {
  api.current = useArrangement();
  api.position = useArrangementPositionStore();
  return null;
}

function live(api: BarsApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function positionOf(api: BarsApiRef): number {
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

async function mountBarsWorkspace(clips: ArrangementClip[] = SFX_CLIPS) {
  const api: BarsApiRef = { current: null, position: null };
  const view = render(
    <ArrangementProvider collection={barsCollection} initialArrangement={barsArrangement(clips)}>
      <StudioWorkspace />
      <BarsProbe api={api} />
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
  const secondsRuler = view.getByTestId('arrangement-ruler');
  stubCapture(secondsRuler);
  const bars = () => {
    const element = view.getByTestId('arrangement-bars-ruler');
    stubCapture(element);
    return element;
  };
  const strip = () => view.getByTestId('arrangement-bars-scrub-strip');
  const scroller = () => view.getByTestId('arrangement-timeline-scroller');
  return { api, view, secondsRuler, bars, strip, scroller };
}

type BarsView = Awaited<ReturnType<typeof mountBarsWorkspace>>['view'];

function commitTempo(view: BarsView, text: string) {
  const input = view.getByTestId('arrangement-tempo-input');
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
}

function chooseDivision(view: BarsView, value: string) {
  fireEvent.change(view.getByTestId('arrangement-grid-division'), { target: { value } });
}

function pressG() {
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG' });
}

function statusText(view: BarsView): string | null {
  return view.getByTestId('arrangement-status').textContent;
}

function transportLabel(view: BarsView): string {
  const pause = view.queryByRole('button', { name: studioPlaybackStrings.pauseLabel });
  return pause ? studioPlaybackStrings.pauseLabel : studioPlaybackStrings.playLabel;
}

async function mountTempo90SnapOn() {
  const mounted = await mountBarsWorkspace();
  commitTempo(mounted.view, '90');
  chooseDivision(mounted.view, '1/4');
  pressG();
  expect(mounted.view.getByTestId('arrangement-snap-toggle').getAttribute('aria-pressed')).toBe(
    'true',
  );
  return mounted;
}

const press = { button: 0, buttons: 1 };

function clickAt(
  target: HTMLElement,
  root: HTMLElement,
  seconds: number,
  clientY: number,
  altKey = false,
  pointerId = 1,
) {
  const clientX = seconds * PX_PER_SECOND;
  fireEvent.pointerDown(target, { ...press, pointerId, clientX, clientY, altKey });
  fireEvent.pointerUp(root, { pointerId, clientX, clientY, altKey });
}

function clickStrip(mounted: { bars: () => HTMLElement; strip: () => HTMLElement }, t: number) {
  clickAt(mounted.strip(), mounted.bars(), t, STRIP_Y);
}

function clickLower(mounted: { bars: () => HTMLElement }, t: number) {
  const root = mounted.bars();
  clickAt(root, root, t, LOWER_Y);
}

function dragFrom(target: HTMLElement, root: HTMLElement, y: number, dx: number, dy: number) {
  fireEvent.pointerDown(target, { ...press, pointerId: 2, clientX: 400, clientY: y });
  fireEvent.pointerMove(root, { pointerId: 2, clientX: 400 + dx, clientY: y + dy });
  fireEvent.pointerUp(root, { pointerId: 2, clientX: 400 + dx, clientY: y + dy });
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

describe('SABA-B-11a stage 2 interactive bars ruler (D-29z327)', { timeout: 15_000 }, () => {
  it('BR1 without a tempo the bars ruler stays display-only', async () => {
    const mounted = await mountBarsWorkspace();
    const root = mounted.bars();
    expect(root.hasAttribute('title')).toBe(false);
    expect(mounted.view.queryByTestId('arrangement-bars-scrub-strip')).toBeNull();
    expect(root.textContent).toBe('');
    clickAt(root, root, 4.1, STRIP_Y);
    clickAt(root, root, 6.3, LOWER_Y);
    expect(positionOf(mounted.api)).toBe(0);
    expect(live(mounted.api).isPlaying).toBe(false);
    dragFrom(root, root, LOWER_Y, -200, 0);
    expect(mounted.scroller().scrollLeft).toBe(0);
    expect(live(mounted.api).pxPerSecond).toBe(PX_PER_SECOND);
    expect(live(mounted.api).isPointerGestureActive()).toBe(false);
  });

  it('BR2 a strip click while stopped starts playback from the nearest 1/4 line', async () => {
    const mounted = await mountTempo90SnapOn();
    expect(mounted.strip().title).toBe(studioTempoStrings.scrubStripTitle);
    expect(mounted.bars().title).toBe(studioViewStrings.rulerTitle);
    clickStrip(mounted, 4.1);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(transportLabel(mounted.view)).toBe(studioPlaybackStrings.pauseLabel);
    expect(positionOf(mounted.api)).toBeCloseTo(4, 3);
  });

  it('BR3 a strip click while playing jumps to the nearest 1/4 line and keeps playing', async () => {
    const mounted = await mountTempo90SnapOn();
    clickStrip(mounted, 4.1);
    expect(live(mounted.api).isPlaying).toBe(true);
    clickStrip(mounted, 8.2);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(transportLabel(mounted.view)).toBe(studioPlaybackStrings.pauseLabel);
    expect(positionOf(mounted.api)).toBeCloseTo(8, 3);
  });

  it('BR4 a lower-zone click while stopped moves the position on the grid and does not play', async () => {
    const mounted = await mountTempo90SnapOn();
    clickLower(mounted, 6.3);
    expect(positionOf(mounted.api)).toBeCloseTo(6, 3);
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(transportLabel(mounted.view)).toBe(studioPlaybackStrings.playLabel);
  });

  it('BR4b a lower-zone click while playing moves only the insert marker and keeps playing (D-29z430)', async () => {
    const mounted = await mountTempo90SnapOn();
    clickStrip(mounted, 2.1);
    expect(live(mounted.api).isPlaying).toBe(true);
    clickLower(mounted, 6.3);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeCloseTo(2, 1);
    expect(
      mounted.view.getByTestId('arrangement-insert-marker').getAttribute('data-insert-marker'),
    ).toBe('6.000');
    act(() => live(mounted.api).togglePlayback());
    act(() => live(mounted.api).togglePlayback());
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeCloseTo(6, 3);
  });

  it('BR5 Alt bypasses the grid on both zones; Snap off lands free as well', async () => {
    const mounted = await mountTempo90SnapOn();
    const root = mounted.bars();
    clickAt(root, root, 6.3, LOWER_Y, true);
    expect(positionOf(mounted.api)).toBeCloseTo(6.3, 3);
    expect(live(mounted.api).isPlaying).toBe(false);
    clickAt(mounted.strip(), root, 4.3, STRIP_Y, true);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeCloseTo(4.3, 3);
    act(() => live(mounted.api).togglePlayback());
    expect(live(mounted.api).isPlaying).toBe(false);
    pressG();
    expect(mounted.view.getByTestId('arrangement-snap-toggle').getAttribute('aria-pressed')).toBe(
      'false',
    );
    clickLower(mounted, 7.3);
    expect(positionOf(mounted.api)).toBeCloseTo(7.3, 3);
    clickStrip(mounted, 5.1);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeCloseTo(5.1, 3);
  });

  it('BR6 a drag from either zone scrolls or zooms; a cancelled press never seeks or plays', async () => {
    const mounted = await mountTempo90SnapOn();
    const root = mounted.bars();
    dragFrom(root, root, LOWER_Y, -200, 0);
    expect(mounted.scroller().scrollLeft).toBeCloseTo(200, 6);
    dragFrom(mounted.strip(), root, STRIP_Y, -200, 0);
    expect(mounted.scroller().scrollLeft).toBeCloseTo(400, 6);
    expect(live(mounted.api).pxPerSecond).toBe(PX_PER_SECOND);
    dragFrom(root, root, LOWER_Y, 0, -60);
    expect(live(mounted.api).pxPerSecond).toBeGreaterThan(PX_PER_SECOND);
    const zoomed = live(mounted.api).pxPerSecond;
    dragFrom(mounted.strip(), root, STRIP_Y, 0, 60);
    expect(live(mounted.api).pxPerSecond).toBeLessThan(zoomed);
    expect(positionOf(mounted.api)).toBe(0);
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(live(mounted.api).isPointerGestureActive()).toBe(false);
    for (const type of ['pointerCancel', 'lostPointerCapture'] as const) {
      fireEvent.pointerDown(mounted.strip(), { ...press, pointerId: 4, clientX: 160, clientY: 4 });
      fireEvent[type](root, { pointerId: 4, clientX: 160, clientY: 4 });
      expect(live(mounted.api).isPlaying).toBe(false);
      expect(positionOf(mounted.api)).toBe(0);
      expect(live(mounted.api).isPointerGestureActive()).toBe(false);
    }
  });

  it('BR7 a double-click fits the project; a double-click right after a drag does nothing', async () => {
    const mounted = await mountTempo90SnapOn();
    const root = mounted.bars();
    fireEvent.doubleClick(root);
    const barsFit = statusText(mounted.view);
    expect(barsFit).toMatch(/^Fit: the entire project is visible \(/);
    act(() => live(mounted.api).setStatus('marker'));
    fireEvent.doubleClick(mounted.secondsRuler);
    expect(statusText(mounted.view)).toBe(barsFit);
    act(() => live(mounted.api).setStatus('marker'));
    dragFrom(root, root, LOWER_Y, -200, 0);
    fireEvent.doubleClick(root);
    expect(statusText(mounted.view)).toBe('marker');
  });

  it('BR8 a strip click past the end or in an empty project reports and does not play', async () => {
    const mounted = await mountTempo90SnapOn();
    clickStrip(mounted, 20.1);
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(positionOf(mounted.api)).toBeCloseTo(20, 3);
    expect(statusText(mounted.view)).toBe(
      playPastEndMessage(positionOf(mounted.api), 16, 'insert-marker'),
    );
    cleanup();
    const empty = await mountBarsWorkspace([]);
    commitTempo(empty.view, '90');
    clickStrip(empty, 4.1);
    expect(live(empty.api).isPlaying).toBe(false);
    expect(statusText(empty.view)).toBe(studioPlaybackStrings.nothingToPlay);
  });

  it('BR9 the seconds ruler click is unchanged with a tempo', async () => {
    const mounted = await mountTempo90SnapOn();
    expect(mounted.secondsRuler.title).toBe(studioViewStrings.rulerTitle);
    clickAt(mounted.secondsRuler, mounted.secondsRuler, 3.1, SECONDS_RULER_Y);
    expect(positionOf(mounted.api)).toBeCloseTo(10 / 3, 3);
    expect(live(mounted.api).isPlaying).toBe(false);
  });

  it('BR10 a press while another gesture holds the claim is refused', async () => {
    const mounted = await mountTempo90SnapOn();
    const claim: { release: (() => void) | null } = { release: null };
    act(() => {
      claim.release = live(mounted.api).claimPointerGesture(7, () => undefined);
    });
    expect(claim.release).not.toBeNull();
    clickStrip(mounted, 4.1);
    clickLower(mounted, 6.3);
    const root = mounted.bars();
    dragFrom(root, root, LOWER_Y, -200, 0);
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(positionOf(mounted.api)).toBe(0);
    expect(mounted.scroller().scrollLeft).toBe(0);
    act(() => claim.release?.());
    clickLower(mounted, 6.3);
    expect(positionOf(mounted.api)).toBeCloseTo(6, 3);
  });

  it('BR11 a workspace re-render with unchanged gestures does not re-render the bars ruler', async () => {
    const mounted = await mountTempo90SnapOn();
    const calls = barsMarksCalls.count;
    expect(calls).toBeGreaterThan(0);
    act(() => live(mounted.api).setStatus('first'));
    act(() => live(mounted.api).setStatus('second'));
    expect(statusText(mounted.view)).toBe('second');
    expect(barsMarksCalls.count).toBe(calls);
    pressG();
    expect(barsMarksCalls.count).toBeGreaterThan(calls);
  });

  it('BR12 a double-click on the strip plays from the point and does not fit; the lower zone still fits', async () => {
    const mounted = await mountTempo90SnapOn();
    const root = mounted.bars();
    act(() => live(mounted.api).setStatus('marker'));
    clickStrip(mounted, 4.1);
    clickStrip(mounted, 4.1);
    fireEvent.doubleClick(root);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeCloseTo(4, 3);
    expect(statusText(mounted.view)).toBe('marker');
    act(() => live(mounted.api).togglePlayback());
    clickLower(mounted, 6.3);
    clickLower(mounted, 6.3);
    fireEvent.doubleClick(root);
    expect(statusText(mounted.view)).toMatch(/^Fit: the entire project is visible \(/);
  });

  it('BR13 a strip click that snaps to the project end reports past-end and does not play from 0', async () => {
    const mounted = await mountTempo90SnapOn();
    clickStrip(mounted, 15.95);
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(positionOf(mounted.api)).toBeCloseTo(16, 3);
    expect(statusText(mounted.view)).toBe(playPastEndMessage(16, 16, 'insert-marker'));
    act(() => live(mounted.api).togglePlayback());
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBe(0);
    act(() => live(mounted.api).togglePlayback());
    const setLoop = (start: number, end: number) => {
      const before = live(mounted.api).getArrangement();
      act(() => {
        live(mounted.api).commitArrangement(
          { ...before, loop: { start, end, enabled: true } },
          'loop',
          before,
        );
      });
    };
    setLoop(14, 18);
    clickStrip(mounted, 15.95);
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeCloseTo(16, 3);
    act(() => live(mounted.api).togglePlayback());
    setLoop(2, 6);
    act(() => live(mounted.api).startLibraryPreview('slow-stem', 0));
    expect(live(mounted.api).libraryPreviewSourceId).toBe('slow-stem');
    clickStrip(mounted, 15.95);
    expect(live(mounted.api).isPlaying).toBe(false);
    expect(live(mounted.api).libraryPreviewSourceId).toBe(null);
    expect(statusText(mounted.view)).toBe(playPastEndMessage(16, 16, 'insert-marker'));
  });

  it('BR14 a strip click in the same task as a playback start keeps playing (reads the playing ref)', async () => {
    const mounted = await mountTempo90SnapOn();
    act(() => {
      live(mounted.api).togglePlayback();
      clickStrip(mounted, 8.2);
    });
    expect(live(mounted.api).isPlaying).toBe(true);
    expect(positionOf(mounted.api)).toBeCloseTo(8, 3);
  });
});
