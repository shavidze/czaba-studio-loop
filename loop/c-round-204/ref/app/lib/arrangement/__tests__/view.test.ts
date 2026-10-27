import { act, fireEvent, render } from '@testing-library/react';
import { createElement, Profiler } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementOverview } from '~/components/arrangement/ArrangementOverview';
import { ArrangementRuler } from '~/components/arrangement/ArrangementRuler';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { studioViewStrings } from '../strings';
import {
  anchoredTimelineView,
  centreTimelineView,
  clampTimelineZoom,
  dragZoomLevel,
  fitTimelineView,
  followScrollTarget,
  formatRulerLabel,
  formatZoomReadout,
  overviewDragView,
  overviewFrame,
  overviewTimeAt,
  popZoomHistory,
  pushZoomHistory,
  RULER_LABEL_CHAR_WIDTH_PX,
  RULER_LABEL_OFFSET_PX,
  RULER_TICK_LINE_PX,
  RULER_TICK_STEPS_SECONDS,
  rulerDragView,
  rulerTickMarks,
  rulerTickStep,
  sliderPositionFromZoom,
  stepTimelineZoom,
  stepZoomAnchor,
  TIMELINE_FIT_PADDING_PX,
  TIMELINE_ZOOM_MAX,
  TIMELINE_ZOOM_MIN,
  type TimelineView,
  timelineExtent,
  timelineNavigationKey,
  zoomFromSliderPosition,
  zoomTimelineAround,
  zoomToRangeView,
} from '../view';

const VIEWPORT = 1000;

function screenXOf(view: TimelineView, time: number): number {
  return time * view.pxPerSecond - view.scrollLeft;
}

describe('timeline view maths (SRW-10, R10-U)', () => {
  it('clamps zoom to 0.5–320 px/s and falls back on a non-finite value', () => {
    expect(clampTimelineZoom(0.1)).toBe(TIMELINE_ZOOM_MIN);
    expect(clampTimelineZoom(1000)).toBe(TIMELINE_ZOOM_MAX);
    expect(clampTimelineZoom(55)).toBe(55);
    expect(clampTimelineZoom(Number.NaN)).toBe(40);
  });

  it('uses the max of project end, loop end and 10 s as the extent', () => {
    expect(timelineExtent(4, null)).toBe(10);
    expect(timelineExtent(42, null)).toBe(42);
    expect(timelineExtent(42, { start: 40, end: 50, enabled: false })).toBe(50);
  });

  it.each([60, 240, 1200])('fits a %s s extent inside the viewport minus padding', (extent) => {
    const view = fitTimelineView(extent, VIEWPORT);
    expect(view.scrollLeft).toBe(0);
    expect(extent * view.pxPerSecond).toBeLessThanOrEqual(
      VIEWPORT - TIMELINE_FIT_PADDING_PX + 1e-9,
    );
    expect(view.pxPerSecond).toBeGreaterThanOrEqual(TIMELINE_ZOOM_MIN);
  });

  it('fits a 20-minute extent at the 1280×720 timeline width without going below the minimum', () => {
    const view = fitTimelineView(1200, 766);
    expect(view.pxPerSecond).toBeCloseTo(762 / 1200, 9);
    expect(view.pxPerSecond).toBeGreaterThan(TIMELINE_ZOOM_MIN);
  });

  it('keeps the anchor time at the same screen x when zooming', () => {
    const view: TimelineView = { pxPerSecond: 40, scrollLeft: 300 };
    const next = zoomTimelineAround(view, 92, 17.5);
    expect(screenXOf(next, 17.5)).toBeCloseTo(screenXOf(view, 17.5), 9);
    expect(next.pxPerSecond).toBe(92);
  });

  it('never scrolls before time 0', () => {
    expect(anchoredTimelineView(10, 1, 500).scrollLeft).toBe(0);
  });

  it('chooses the range centre, then a visible playhead, else the viewport centre', () => {
    const view: TimelineView = { pxPerSecond: 40, scrollLeft: 0 };
    const range = { start: 10, end: 12, trackId: 'music' };
    expect(
      stepZoomAnchor({ view, factor: 1.25, viewportPx: VIEWPORT, range, playhead: 3 }),
    ).toEqual({ time: 11, screenX: 440 });
    expect(
      stepZoomAnchor({ view, factor: 1.25, viewportPx: VIEWPORT, range: null, playhead: 3 }),
    ).toEqual({ time: 3, screenX: 120 });
    expect(
      stepZoomAnchor({ view, factor: 1.25, viewportPx: VIEWPORT, range: null, playhead: 100 }),
    ).toEqual({ time: 100, screenX: VIEWPORT / 2 });
    const stepped = stepTimelineZoom({
      view,
      factor: 1.25,
      viewportPx: VIEWPORT,
      range: null,
      playhead: 3,
    });
    expect(stepped.pxPerSecond).toBe(50);
    expect(screenXOf(stepped, 3)).toBeCloseTo(120, 9);
    const centred = stepTimelineZoom({
      view,
      factor: 0.8,
      viewportPx: VIEWPORT,
      range: null,
      playhead: 100,
    });
    expect(screenXOf(centred, 100)).toBeCloseTo(VIEWPORT / 2, 9);
  });

  it('zooms a range to 60 % of the viewport, centred', () => {
    const view = zoomToRangeView({ start: 10, end: 12, trackId: 'music' }, VIEWPORT);
    expect(2 * view.pxPerSecond).toBeCloseTo(0.6 * VIEWPORT, 9);
    expect(screenXOf(view, 11)).toBeCloseTo(VIEWPORT / 2, 9);
  });

  it('pushes and pops the zoom history and reports an empty history', () => {
    const first: TimelineView = { pxPerSecond: 40, scrollLeft: 0 };
    const second: TimelineView = { pxPerSecond: 80, scrollLeft: 120 };
    const history = pushZoomHistory(pushZoomHistory([], first), second);
    const popped = popZoomHistory(history);
    expect(popped?.view).toEqual(second);
    expect(popZoomHistory(popped?.history ?? [])?.view).toEqual(first);
    expect(popZoomHistory([])).toBeNull();
  });

  it('maps the overview frame to visible / extent and centres a clicked time', () => {
    const view: TimelineView = { pxPerSecond: 40, scrollLeft: 400 };
    const frame = overviewFrame(view, VIEWPORT, 100);
    expect(frame.left).toBeCloseTo(0.1, 9);
    expect(frame.width).toBeCloseTo(0.25, 9);
    expect(overviewFrame(fitTimelineView(100, VIEWPORT), VIEWPORT, 100).width).toBe(1);
    expect(overviewTimeAt(0.75, 100)).toBe(75);
    expect(overviewTimeAt(1.4, 100)).toBe(100);
    const centred = centreTimelineView(view, 75, VIEWPORT);
    expect(screenXOf(centred, 75)).toBeCloseTo(VIEWPORT / 2, 9);
  });

  it('pans with a ruler drag and zooms on a vertical drag with the anchor under the pointer', () => {
    const start: TimelineView = { pxPerSecond: 40, scrollLeft: 0 };
    const panned = rulerDragView({ start, anchorTime: 10, anchorScreenX: 400, dx: -120, dy: 0 });
    expect(panned.pxPerSecond).toBe(40);
    expect(screenXOf(panned, 10)).toBeCloseTo(280, 9);
    const zoomed = rulerDragView({ start, anchorTime: 10, anchorScreenX: 400, dx: 0, dy: -100 });
    expect(zoomed.pxPerSecond).toBeGreaterThan(40);
    expect(zoomed.pxPerSecond).toBeCloseTo(40 * Math.exp(94 / 140), 9);
    expect(screenXOf(zoomed, 10)).toBeCloseTo(400, 9);
    expect(dragZoomLevel(40, 5)).toBe(40);
  });

  it('pans the overview by extent-scaled pointer movement', () => {
    const start: TimelineView = { pxPerSecond: 40, scrollLeft: 0 };
    const view = overviewDragView({
      start,
      anchorTime: 12.5,
      anchorScreenX: 500,
      dx: 20,
      dy: 0,
      overviewWidthPx: 200,
      extent: 100,
    });
    expect(screenXOf(view, 22.5)).toBeCloseTo(500, 9);
  });

  it('decides Follow scrolling only when the playhead leaves the view', () => {
    const view: TimelineView = { pxPerSecond: 40, scrollLeft: 400 };
    expect(followScrollTarget({ position: 20, view, viewportPx: VIEWPORT })).toBeNull();
    expect(followScrollTarget({ position: 34.5, view, viewportPx: VIEWPORT })).toBeCloseTo(
      34.5 * 40 - VIEWPORT / 3,
      9,
    );
    expect(followScrollTarget({ position: 5, view, viewportPx: VIEWPORT })).toBe(0);
    expect(followScrollTarget({ position: 33.9, view, viewportPx: VIEWPORT })).toBeNull();
  });

  it.each([
    0.5, 1, 7, 40, 100, 320,
  ])('keeps ruler labels at least 40 px apart at %s px/s', (zoom) => {
    const step = rulerTickStep(zoom);
    expect(RULER_TICK_STEPS_SECONDS).toContain(step);
    expect(step * zoom).toBeGreaterThanOrEqual(40);
  });

  it('formats ruler labels with tenths only for fractional ticks', () => {
    expect(formatRulerLabel(0)).toBe('0:00');
    expect(formatRulerLabel(90)).toBe('1:30');
    expect(formatRulerLabel(10.5)).toBe('0:10.5');
    expect(formatRulerLabel(600)).toBe('10:00');
  });

  it('drops the label of a tick whose text would hang past the ruler end (C-R6-03, R10-N5-U)', () => {
    const empty = rulerTickMarks(30, 40);
    expect(empty).toHaveLength(30);
    expect(empty.at(-1)).toEqual({ time: 29, label: '0:29' });
    expect(empty.filter((mark) => mark.label !== null)).toHaveLength(30);
    const fit = rulerTickMarks(335, 2.48);
    expect(fit.at(-1)).toEqual({ time: 330, label: null });
    expect(fit.at(-2)).toEqual({ time: 300, label: '5:00' });
  });

  it.each([
    [30, 40],
    [335, 2.48],
    [62, 13.7],
    [1230, 0.5],
    [45, 320],
    [301, 57.3],
  ])('keeps every visible ruler label inside %s s at %s px/s and 40 px apart', (seconds, zoom) => {
    const width = seconds * zoom;
    const marks = rulerTickMarks(seconds, zoom);
    expect(marks.at(-1)?.time).toBeLessThanOrEqual(seconds);
    const labelled = marks.filter((mark) => mark.label !== null);
    expect(labelled.length).toBeGreaterThan(0);
    for (const mark of labelled) {
      const end =
        mark.time * zoom +
        RULER_LABEL_OFFSET_PX +
        (mark.label?.length ?? 0) * RULER_LABEL_CHAR_WIDTH_PX;
      expect(end).toBeLessThanOrEqual(width);
    }
    for (let index = 1; index < labelled.length; index++) {
      expect((labelled[index].time - labelled[index - 1].time) * zoom).toBeGreaterThanOrEqual(40);
    }
  });

  it.each([
    [30, 40, 30],
    [1652, 186.4894, 3304],
    [1652, 206.796, 3304],
  ])('keeps the last ruler tick line and label inside %s s at %s px/s (C-R7-02, R10-R2)', (seconds, zoom, labels) => {
    const width = seconds * zoom;
    const marks = rulerTickMarks(seconds, zoom);
    const last = marks.at(-1);
    expect(last).toBeDefined();
    expect((last?.time ?? 0) * zoom + RULER_TICK_LINE_PX).toBeLessThanOrEqual(width);
    expect(marks.every((mark) => mark.time * zoom + RULER_TICK_LINE_PX <= width)).toBe(true);
    const labelled = marks.filter((mark) => mark.label !== null);
    expect(labelled).toHaveLength(labels);
    const lastLabel = labelled.at(-1);
    const lastLabelEnd =
      (lastLabel?.time ?? 0) * zoom +
      RULER_LABEL_OFFSET_PX +
      (lastLabel?.label?.length ?? 0) * RULER_LABEL_CHAR_WIDTH_PX;
    expect(lastLabelEnd).toBeLessThanOrEqual(width);
  });

  it('maps the zoom slider logarithmically and formats the readout with one decimal', () => {
    expect(zoomFromSliderPosition(0)).toBeCloseTo(TIMELINE_ZOOM_MIN, 9);
    expect(zoomFromSliderPosition(1000)).toBeCloseTo(TIMELINE_ZOOM_MAX, 9);
    expect(zoomFromSliderPosition(sliderPositionFromZoom(40))).toBeCloseTo(40, 0);
    expect(sliderPositionFromZoom(TIMELINE_ZOOM_MIN)).toBe(0);
    expect(formatZoomReadout(0.5)).toBe(studioViewStrings.zoomReadout(0.5));
    expect(formatZoomReadout(40)).toBe(studioViewStrings.zoomReadout(40));
    expect(formatZoomReadout(35.26)).toBe(studioViewStrings.zoomReadout(35.3));
  });
});

describe('timelineNavigationKey (R10-N2 keys)', () => {
  const base = {
    key: '',
    code: '',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    inTextField: false,
    onSlider: false,
  };

  it('maps + / = / numpad +, − / numpad −, Z and X', () => {
    expect(timelineNavigationKey({ ...base, key: '+', code: 'Equal', shiftKey: true })).toBe(
      'zoom-in',
    );
    expect(timelineNavigationKey({ ...base, key: '=', code: 'Equal' })).toBe('zoom-in');
    expect(timelineNavigationKey({ ...base, key: '+', code: 'NumpadAdd' })).toBe('zoom-in');
    expect(timelineNavigationKey({ ...base, key: '-', code: 'Minus' })).toBe('zoom-out');
    expect(timelineNavigationKey({ ...base, key: '-', code: 'NumpadSubtract' })).toBe('zoom-out');
    expect(timelineNavigationKey({ ...base, key: 'z', code: 'KeyZ' })).toBe('zoom-range');
    expect(timelineNavigationKey({ ...base, key: 'ზ', code: 'KeyZ' })).toBe('zoom-range');
    expect(timelineNavigationKey({ ...base, key: 'x', code: 'KeyX' })).toBe('zoom-back');
  });

  it('ignores text fields, focused sliders, Ctrl/Cmd/Alt and Shift+Z/X', () => {
    expect(
      timelineNavigationKey({ ...base, key: 'z', code: 'KeyZ', inTextField: true }),
    ).toBeNull();
    expect(
      timelineNavigationKey({ ...base, key: '+', code: 'Equal', inTextField: true }),
    ).toBeNull();
    expect(timelineNavigationKey({ ...base, key: '-', code: 'Minus', onSlider: true })).toBeNull();
    expect(timelineNavigationKey({ ...base, key: 'x', code: 'KeyX', ctrlKey: true })).toBeNull();
    expect(timelineNavigationKey({ ...base, key: 'z', code: 'KeyZ', metaKey: true })).toBeNull();
    expect(timelineNavigationKey({ ...base, key: 'z', code: 'KeyZ', altKey: true })).toBeNull();
    expect(timelineNavigationKey({ ...base, key: 'Z', code: 'KeyZ', shiftKey: true })).toBeNull();
  });
});

class FakeOfflineAudioContext {}

const navigationCollection: WorkspaceCollection = {
  id: 'navigation',
  label: 'navigation',
  origin: 'demo',
  sources: [],
  loadSource: () => Promise.reject(new Error('no sources')),
};

function navigationArrangement() {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 60 },
    ],
  };
}

interface NavigationApiRef {
  current: ArrangementContextValue | null;
}

function NavigationProbe({ api }: { api: NavigationApiRef }) {
  api.current = useArrangement();
  return null;
}

function liveNavigation(api: NavigationApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

describe('ruler navigation and overview components (R10-U)', () => {
  beforeEach(() => {
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mountRuler() {
    const api: NavigationApiRef = { current: null };
    const applied: TimelineView[] = [];
    const navigationMoves = { count: 0 };
    function RulerHarness() {
      const workspace = useArrangement();
      api.current = workspace;
      return createElement(ArrangementRuler, {
        seconds: 90,
        pxPerSecond: 40,
        onSeek: workspace.seekTo,
        onScrub: workspace.scrubPlayhead,
        onScrubEnd: workspace.endPlayheadScrub,
        onGestureClaim: workspace.claimPointerGesture,
        getTimelineView: () => ({ pxPerSecond: 40, scrollLeft: 0 }),
        applyTimelineView: (view: TimelineView) => {
          applied.push(view);
        },
        onNavigationMove: () => {
          navigationMoves.count += 1;
        },
        onRulerDoubleClick: () => undefined,
      });
    }
    const view = render(
      createElement(
        ArrangementProvider,
        { collection: navigationCollection, initialArrangement: navigationArrangement() },
        createElement(RulerHarness),
      ),
    );
    return { api, applied, navigationMoves, ruler: view.getByTestId('arrangement-ruler') };
  }

  it('seeks only on release of a click shorter than 4 px (TRN-05)', () => {
    const { api, ruler, applied } = mountRuler();
    fireEvent.pointerDown(ruler, { button: 0, buttons: 1, pointerId: 3, clientX: 800, clientY: 5 });
    expect(liveNavigation(api).getLivePosition()).toBe(0);
    fireEvent.pointerMove(ruler, { pointerId: 3, clientX: 802, clientY: 6 });
    fireEvent.pointerUp(ruler, { pointerId: 3, clientX: 802, clientY: 6 });
    expect(liveNavigation(api).getLivePosition()).toBe(20);
    expect(applied).toHaveLength(0);
    expect(liveNavigation(api).undoLabel).toBeNull();
    expect(liveNavigation(api).isPointerGestureActive()).toBe(false);
  });

  it('pans and zooms on a drag without seeking or writing history', () => {
    const { api, ruler, applied, navigationMoves } = mountRuler();
    fireEvent.pointerDown(ruler, { button: 0, buttons: 1, pointerId: 3, clientX: 400, clientY: 5 });
    expect(liveNavigation(api).isPointerGestureActive()).toBe(true);
    fireEvent.pointerMove(ruler, { pointerId: 3, clientX: 400, clientY: -95 });
    fireEvent.pointerUp(ruler, { pointerId: 3, clientX: 400, clientY: -95 });
    expect(navigationMoves.count).toBe(1);
    const last = applied.at(-1);
    expect(last?.pxPerSecond).toBeGreaterThan(40);
    expect(last ? 10 * last.pxPerSecond - last.scrollLeft : 0).toBeCloseTo(400, 6);
    expect(liveNavigation(api).getLivePosition()).toBe(0);
    expect(liveNavigation(api).undoLabel).toBeNull();
    expect(liveNavigation(api).isPointerGestureActive()).toBe(false);
  });

  it('ignores a ruler pointerdown from a second pointer during another gesture (D-26)', () => {
    const { api, ruler } = mountRuler();
    const claim: { release: (() => void) | null } = { release: null };
    act(() => {
      claim.release = liveNavigation(api).claimPointerGesture(7, () => undefined);
    });
    fireEvent.pointerDown(ruler, {
      button: 0,
      buttons: 1,
      pointerId: 21,
      clientX: 800,
      clientY: 5,
    });
    fireEvent.pointerUp(ruler, { pointerId: 21, clientX: 800, clientY: 5 });
    expect(liveNavigation(api).getLivePosition()).toBe(0);
    act(() => claim.release?.());
    expect(liveNavigation(api).isPointerGestureActive()).toBe(false);
  });

  it('does not re-render the overview on position updates but moves its playhead', () => {
    const api: NavigationApiRef = { current: null };
    const commits = { overview: 0 };
    const view = render(
      createElement(
        ArrangementProvider,
        { collection: navigationCollection, initialArrangement: navigationArrangement() },
        createElement(
          Profiler,
          {
            id: 'overview',
            onRender: () => {
              commits.overview += 1;
            },
          },
          createElement(ArrangementOverview, {
            arrangement: navigationArrangement(),
            extent: 60,
            pxPerSecond: 40,
            getTimelineView: () => ({ pxPerSecond: 40, scrollLeft: 0 }),
            getTimelineViewportPx: () => 600,
            subscribeTimelineScroll: () => () => undefined,
            applyTimelineView: () => undefined,
            onNavigationMove: () => undefined,
            onFit: () => undefined,
            claimPointerGesture: () => null,
          }),
        ),
        createElement(NavigationProbe, { api }),
      ),
    );
    const before = commits.overview;
    for (let step = 1; step <= 10; step++) {
      act(() => liveNavigation(api).seekTo(step * 3));
    }
    expect(commits.overview - before).toBe(0);
    expect(view.getByTestId('arrangement-overview-playhead').style.left).toBe('50%');
    const frame = view.getByTestId('arrangement-overview-frame');
    expect(Number.parseFloat(frame.style.width)).toBeCloseTo(25, 6);
    expect(view.getByTestId('arrangement-overview').getAttribute('aria-valuemax')).toBe('60');
  });

  it('ends a ruler navigation without seeking when pointer capture is lost', () => {
    const { api, ruler } = mountRuler();
    fireEvent.pointerDown(ruler, { button: 0, buttons: 1, pointerId: 9, clientX: 800, clientY: 5 });
    expect(liveNavigation(api).isPointerGestureActive()).toBe(true);
    fireEvent(ruler, new Event('lostpointercapture', { bubbles: true }));
    expect(liveNavigation(api).isPointerGestureActive()).toBe(true);
    const lost = new Event('lostpointercapture', { bubbles: true });
    Object.defineProperty(lost, 'pointerId', { value: 9 });
    fireEvent(ruler, lost);
    expect(liveNavigation(api).isPointerGestureActive()).toBe(false);
    expect(liveNavigation(api).getLivePosition()).toBe(0);
  });

  it('ends an overview drag on lost capture and ignores a double-click right after a drag', () => {
    const api: NavigationApiRef = { current: null };
    const fits = { count: 0 };
    function OverviewHarness() {
      const workspace = useArrangement();
      api.current = workspace;
      return createElement(ArrangementOverview, {
        arrangement: navigationArrangement(),
        extent: 60,
        pxPerSecond: 40,
        getTimelineView: () => ({ pxPerSecond: 40, scrollLeft: 0 }),
        getTimelineViewportPx: () => 600,
        subscribeTimelineScroll: () => () => undefined,
        applyTimelineView: () => undefined,
        onNavigationMove: () => undefined,
        onFit: () => {
          fits.count += 1;
        },
        claimPointerGesture: workspace.claimPointerGesture,
      });
    }
    const view = render(
      createElement(
        ArrangementProvider,
        { collection: navigationCollection, initialArrangement: navigationArrangement() },
        createElement(OverviewHarness),
      ),
    );
    const overview = view.getByTestId('arrangement-overview');
    Object.defineProperty(overview, 'setPointerCapture', { configurable: true, value: () => {} });
    fireEvent.doubleClick(overview);
    expect(fits.count).toBe(1);
    fireEvent.pointerDown(overview, {
      button: 0,
      buttons: 1,
      pointerId: 5,
      clientX: 10,
      clientY: 5,
    });
    fireEvent.pointerMove(overview, { pointerId: 5, clientX: 60, clientY: 5 });
    expect(liveNavigation(api).isPointerGestureActive()).toBe(true);
    const lost = new Event('lostpointercapture', { bubbles: true });
    Object.defineProperty(lost, 'pointerId', { value: 5 });
    fireEvent(overview, lost);
    expect(liveNavigation(api).isPointerGestureActive()).toBe(false);
    fireEvent.doubleClick(overview);
    expect(fits.count).toBe(1);
  });
});
