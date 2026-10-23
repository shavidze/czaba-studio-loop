import { describe, expect, it } from 'vitest';
import {
  clampDetailPanelHeight,
  clampDetailRangeToClip,
  clampFloatingVideoRect,
  clampTrackHeight,
  DETAIL_RANGE_INVALID_MESSAGE,
  detailPanelOpenHeightCap,
  detailPanelStartsOpen,
  FLOATING_VIDEO_ASPECT_RATIO,
  FLOATING_VIDEO_BODY_SHARE,
  FLOATING_VIDEO_KEY_STEP_PX,
  FLOATING_VIDEO_LIBRARY_INSET_PX,
  FLOATING_VIDEO_MAX_WIDTH_PX,
  FLOATING_VIDEO_MIN_WIDTH_PX,
  FLOATING_VIDEO_OFFSET_PX,
  type FloatingVideoRect,
  fitLaneHeights,
  floatingVideoLibraryInsetPx,
  isDetailRangeInsideClip,
  minimumLaneRowsHeight,
  placeFloatingVideoOverLibrary,
  stepDetailPanelHeight,
  stepFloatingVideoRect,
  stepTrackHeight,
  type TrackLaneFitEntry,
  trackRowHeight,
} from '../panels';

const STUDIO_LANES: TrackLaneFitEntry[] = [
  { kind: 'video', folded: false },
  { kind: 'audio', folded: false },
  { kind: 'audio', folded: false },
  { kind: 'audio', folded: false },
];

function lanesWithFolded(index: number): TrackLaneFitEntry[] {
  return STUDIO_LANES.map((lane, position) => ({ ...lane, folded: position === index }));
}

describe('track height clamp and step (D-29, TRK-05)', () => {
  it('clamps audio to 60–180 and video to 52–180, rounding and falling back to 80', () => {
    expect(clampTrackHeight('audio', 40)).toBe(60);
    expect(clampTrackHeight('audio', 60)).toBe(60);
    expect(clampTrackHeight('audio', 140.4)).toBe(140);
    expect(clampTrackHeight('audio', 400)).toBe(180);
    expect(clampTrackHeight('video', 40)).toBe(52);
    expect(clampTrackHeight('video', 52)).toBe(52);
    expect(clampTrackHeight('video', 200)).toBe(180);
    expect(clampTrackHeight('audio', Number.NaN)).toBe(80);
    expect(clampTrackHeight('video', Number.NEGATIVE_INFINITY)).toBe(80);
  });

  it('steps ±8 px and stays inside the clamp per kind', () => {
    expect(stepTrackHeight('audio', 80, 1)).toBe(88);
    expect(stepTrackHeight('audio', 80, -1)).toBe(72);
    expect(stepTrackHeight('audio', 64, -1)).toBe(60);
    expect(stepTrackHeight('audio', 60, -1)).toBe(60);
    expect(stepTrackHeight('audio', 176, 1)).toBe(180);
    expect(stepTrackHeight('video', 56, -1)).toBe(52);
    expect(stepTrackHeight('video', 52, -1)).toBe(52);
    expect(stepTrackHeight('video', 180, 1)).toBe(180);
  });

  it('adds the 1 px row border to an open lane and renders a folded row at 36 px', () => {
    expect(trackRowHeight(80, false)).toBe(81);
    expect(trackRowHeight(140, false)).toBe(141);
    expect(trackRowHeight(140, true)).toBe(36);
    expect(minimumLaneRowsHeight(STUDIO_LANES)).toBe(53 + 3 * 61);
    expect(minimumLaneRowsHeight(lanesWithFolded(1))).toBe(53 + 36 + 2 * 61);
  });
});

describe('lane auto-fit (D-29 fitLaneHeights)', () => {
  it('keeps every lane at its 80 px default when the defaults fit, and exactly at the limit', () => {
    expect(fitLaneHeights({ visibleRowsHeight: 472, lanes: STUDIO_LANES })).toEqual([
      80, 80, 80, 80,
    ]);
    expect(fitLaneHeights({ visibleRowsHeight: 324, lanes: STUDIO_LANES })).toEqual([
      80, 80, 80, 80,
    ]);
  });

  it('shrinks one pixel below the limit with the video share and the even audio split (1280×720, panel open)', () => {
    expect(fitLaneHeights({ visibleRowsHeight: 323, lanes: STUDIO_LANES })).toEqual([
      64, 80, 80, 80,
    ]);
    expect(fitLaneHeights({ visibleRowsHeight: 254, lanes: STUDIO_LANES })).toEqual([
      52, 66, 66, 66,
    ]);
    expect(fitLaneHeights({ visibleRowsHeight: 244, lanes: STUDIO_LANES })).toEqual([
      52, 62, 62, 62,
    ]);
  });

  it('never goes below the minimums when the area is too short', () => {
    expect(fitLaneHeights({ visibleRowsHeight: 150, lanes: STUDIO_LANES })).toEqual([
      52, 60, 60, 60,
    ]);
  });

  it('gives the video lane round(free × 0.2) when that exceeds 52, but never what the audio minimums need', () => {
    const lanes: TrackLaneFitEntry[] = [
      { kind: 'video', folded: false },
      ...Array.from({ length: 5 }, (): TrackLaneFitEntry => ({ kind: 'audio', folded: false })),
    ];
    expect(fitLaneHeights({ visibleRowsHeight: 406, lanes })).toEqual([80, 64, 64, 64, 64, 64]);
    expect(fitLaneHeights({ visibleRowsHeight: 366, lanes })).toEqual([60, 60, 60, 60, 60, 60]);
  });

  it('subtracts a folded lane as a 36 px row first and gives the freed height to the open lanes', () => {
    const folded = fitLaneHeights({ visibleRowsHeight: 254, lanes: lanesWithFolded(1) });
    expect(folded[0]).toBe(52);
    expect(folded[2]).toBe(80);
    expect(folded[3]).toBe(80);
    expect(fitLaneHeights({ visibleRowsHeight: 230, lanes: lanesWithFolded(1) })).toEqual([
      52, 80, 69, 69,
    ]);
  });

  it('never raises a lane above its 80 px default', () => {
    const lanes: TrackLaneFitEntry[] = [
      { kind: 'video', folded: false },
      { kind: 'audio', folded: false },
    ];
    expect(fitLaneHeights({ visibleRowsHeight: 161, lanes })).toEqual([52, 80]);
    for (const visible of [100, 200, 254, 300, 320, 323, 400, 900]) {
      for (const height of fitLaneHeights({ visibleRowsHeight: visible, lanes: STUDIO_LANES })) {
        expect(height).toBeLessThanOrEqual(80);
      }
    }
  });

  it('keeps the defaults when nothing could be measured', () => {
    expect(fitLaneHeights({ visibleRowsHeight: 0, lanes: STUDIO_LANES })).toEqual([80, 80, 80, 80]);
    expect(fitLaneHeights({ visibleRowsHeight: Number.NaN, lanes: STUDIO_LANES })).toEqual([
      80, 80, 80, 80,
    ]);
  });
});

describe('detail panel open-height cap (D-29b)', () => {
  const chrome = 44;

  it('returns no cap when ruler, loop strip and every lane minimum fit with a 280 px panel', () => {
    expect(
      detailPanelOpenHeightCap({
        scrollerClientHeight: 516,
        panelRenderedHeight: 144,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      }),
    ).toBeNull();
  });

  it('caps a short column at the largest panel height that keeps the minimums visible (1280×720 measured: 162)', () => {
    expect(
      detailPanelOpenHeightCap({
        scrollerClientHeight: 298,
        panelRenderedHeight: 144,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      }),
    ).toBe(162);
    expect(
      detailPanelOpenHeightCap({
        scrollerClientHeight: 266,
        panelRenderedHeight: 144,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      }),
    ).toBe(130);
  });

  it('returns 120 when even a 120 px panel leaves no room', () => {
    expect(
      detailPanelOpenHeightCap({
        scrollerClientHeight: 100,
        panelRenderedHeight: 144,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      }),
    ).toBe(120);
  });

  it('is identical whether computed with the panel collapsed (36) or open (144): invariant column frame', () => {
    for (const column of [300, 374, 400, 442, 520]) {
      const collapsed = detailPanelOpenHeightCap({
        scrollerClientHeight: column - 36,
        panelRenderedHeight: 36,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      });
      const open = detailPanelOpenHeightCap({
        scrollerClientHeight: column - 144,
        panelRenderedHeight: 144,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      });
      const midTransition = detailPanelOpenHeightCap({
        scrollerClientHeight: column - 97,
        panelRenderedHeight: 97,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      });
      expect(open).toBe(collapsed);
      expect(midTransition).toBe(collapsed);
    }
    expect(
      detailPanelOpenHeightCap({
        scrollerClientHeight: 406,
        panelRenderedHeight: 36,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      }),
    ).toBe(162);
  });

  it('counts a folded lane as a 36 px row in the minimum', () => {
    expect(
      detailPanelOpenHeightCap({
        scrollerClientHeight: 266,
        panelRenderedHeight: 144,
        timelineChromeHeight: chrome,
        lanes: lanesWithFolded(1),
      }),
    ).toBe(155);
  });

  it('returns no cap when nothing could be measured', () => {
    expect(
      detailPanelOpenHeightCap({
        scrollerClientHeight: 0,
        panelRenderedHeight: 0,
        timelineChromeHeight: 0,
        lanes: STUDIO_LANES,
      }),
    ).toBeNull();
    expect(
      detailPanelOpenHeightCap({
        scrollerClientHeight: Number.NaN,
        panelRenderedHeight: 144,
        timelineChromeHeight: chrome,
        lanes: STUDIO_LANES,
      }),
    ).toBeNull();
  });
});

describe('detail panel height (D-29)', () => {
  it('clamps the height to 120–280 and falls back to 144 for non-finite input', () => {
    expect(clampDetailPanelHeight(100)).toBe(120);
    expect(clampDetailPanelHeight(120)).toBe(120);
    expect(clampDetailPanelHeight(200)).toBe(200);
    expect(clampDetailPanelHeight(280)).toBe(280);
    expect(clampDetailPanelHeight(400)).toBe(280);
    expect(clampDetailPanelHeight(Number.NaN)).toBe(144);
    expect(clampDetailPanelHeight(Number.POSITIVE_INFINITY)).toBe(144);
  });

  it('steps ±16 px and stays inside the clamp', () => {
    expect(stepDetailPanelHeight(144, 1)).toBe(160);
    expect(stepDetailPanelHeight(144, -1)).toBe(128);
    expect(stepDetailPanelHeight(128, -1)).toBe(120);
    expect(stepDetailPanelHeight(120, -1)).toBe(120);
    expect(stepDetailPanelHeight(272, 1)).toBe(280);
    expect(stepDetailPanelHeight(280, 1)).toBe(280);
  });
});

describe('detail panel default open state (D-29a)', () => {
  it('opens at 1440×900: the 650 px scroller still holds 368 px of ruler, loop strip and 4 lanes', () => {
    expect(detailPanelStartsOpen({ scrollerClientHeight: 650, timelineContentHeight: 368 })).toBe(
      true,
    );
  });

  it('stays collapsed at 1280×720: 412 − 108 = 304 px is less than 368 px', () => {
    expect(detailPanelStartsOpen({ scrollerClientHeight: 412, timelineContentHeight: 368 })).toBe(
      false,
    );
  });

  it('opens exactly at the limit and not one pixel below it', () => {
    expect(detailPanelStartsOpen({ scrollerClientHeight: 476, timelineContentHeight: 368 })).toBe(
      true,
    );
    expect(detailPanelStartsOpen({ scrollerClientHeight: 475, timelineContentHeight: 368 })).toBe(
      false,
    );
  });

  it('stays collapsed when nothing could be measured', () => {
    expect(detailPanelStartsOpen({ scrollerClientHeight: 0, timelineContentHeight: 0 })).toBe(
      false,
    );
    expect(
      detailPanelStartsOpen({ scrollerClientHeight: Number.NaN, timelineContentHeight: 368 }),
    ).toBe(false);
  });
});

describe('detail range validation (D-29)', () => {
  const clip = { clipStart: 2, clipEnd: 10 };

  it('accepts a range inside the clip and within ±0.01 s of its edges', () => {
    expect(isDetailRangeInsideClip({ start: 3.5, end: 7.25, ...clip })).toBe(true);
    expect(isDetailRangeInsideClip({ start: 1.99, end: 10.01, ...clip })).toBe(true);
    expect(isDetailRangeInsideClip({ start: 2, end: 10, ...clip })).toBe(true);
  });

  it('refuses end ≤ start', () => {
    expect(isDetailRangeInsideClip({ start: 5, end: 5, ...clip })).toBe(false);
    expect(isDetailRangeInsideClip({ start: 6, end: 5, ...clip })).toBe(false);
  });

  it('refuses NaN and infinite values', () => {
    expect(isDetailRangeInsideClip({ start: Number.NaN, end: 5, ...clip })).toBe(false);
    expect(isDetailRangeInsideClip({ start: 3, end: Number.POSITIVE_INFINITY, ...clip })).toBe(
      false,
    );
    expect(isDetailRangeInsideClip({ start: Number.NEGATIVE_INFINITY, end: 5, ...clip })).toBe(
      false,
    );
  });

  it('refuses values outside the clip beyond the tolerance', () => {
    expect(isDetailRangeInsideClip({ start: 1.98, end: 5, ...clip })).toBe(false);
    expect(isDetailRangeInsideClip({ start: 3, end: 10.02, ...clip })).toBe(false);
    expect(isDetailRangeInsideClip({ start: 11, end: 12, ...clip })).toBe(false);
  });

  it('clamps a tolerated range into the clip and refuses one that collapses at an edge', () => {
    expect(clampDetailRangeToClip({ start: 1.995, end: 10.005, ...clip })).toEqual({
      start: 2,
      end: 10,
    });
    expect(clampDetailRangeToClip({ start: 3.5, end: 7.25, ...clip })).toEqual({
      start: 3.5,
      end: 7.25,
    });
    expect(clampDetailRangeToClip({ start: 10.005, end: 10.01, ...clip })).toBeNull();
    expect(clampDetailRangeToClip({ start: 1.99, end: 1.995, ...clip })).toBeNull();
    expect(clampDetailRangeToClip({ start: 1, end: 5, ...clip })).toBeNull();
  });

  it('uses the exact refusal text', () => {
    expect(DETAIL_RANGE_INVALID_MESSAGE).toBe(
      'მონაკვეთი კლიპის საზღვრებში უნდა იყოს; დასასრული დასაწყისზე მეტი უნდა იყოს.',
    );
  });
});

describe('floating video placement and clamp (D-29d)', () => {
  const viewport1440 = { viewportWidth: 1440, viewportHeight: 900 };
  const viewport1280 = { viewportWidth: 1280, viewportHeight: 720 };

  it('exports the contract constants', () => {
    expect(FLOATING_VIDEO_OFFSET_PX).toBe(8);
    expect(FLOATING_VIDEO_MAX_WIDTH_PX).toBe(640);
    expect(FLOATING_VIDEO_LIBRARY_INSET_PX).toBe(16);
    expect(FLOATING_VIDEO_KEY_STEP_PX).toBe(16);
    expect(FLOATING_VIDEO_ASPECT_RATIO).toBe(16 / 9);
  });

  it('places a narrow library box at left + 8 on the body bottom with width − 16 and a 16:9 height', () => {
    expect(
      placeFloatingVideoOverLibrary(
        { left: 0, width: 288, bodyTop: 233, bodyBottom: 684 },
        viewport1440,
      ),
    ).toEqual({
      left: 8,
      top: 684 - 8 - 153,
      width: 272,
      height: 153,
    });
    const wide = placeFloatingVideoOverLibrary(
      { left: 0, width: 480, bodyTop: 217, bodyBottom: 700 },
      viewport1280,
    );
    expect(wide.left).toBe(8);
    expect(wide.height).toBeCloseTo(241.5, 10);
    expect(wide.width).toBeCloseTo((241.5 * 16) / 9, 10);
    expect(wide.top).toBeCloseTo(700 - 8 - 241.5, 10);
  });

  it('caps a wide library at 640 px and keeps 16:9', () => {
    const rect = placeFloatingVideoOverLibrary(
      { left: 20, width: 900, bodyTop: 40, bodyBottom: 860 },
      viewport1440,
    );
    expect(rect.width).toBe(640);
    expect(rect.height).toBe(360);
    expect(rect.width / rect.height).toBeCloseTo(16 / 9, 10);
    expect(rect.left).toBe(28);
    expect(rect.top).toBe(860 - 8 - 360);
  });

  it('clamps the initial placement into the viewport and falls back to 0 for a non-finite library', () => {
    expect(
      placeFloatingVideoOverLibrary(
        { left: 0, width: 480, bodyTop: 300, bodyBottom: 1000 },
        viewport1280,
      ),
    ).toEqual({ left: 8, top: 720 - 261, width: 464, height: 261 });
    expect(
      placeFloatingVideoOverLibrary(
        { left: 0, width: Number.NaN, bodyTop: 0, bodyBottom: 0 },
        viewport1440,
      ),
    ).toEqual({ left: 8, top: 8, width: 0, height: 0 });
    expect(
      placeFloatingVideoOverLibrary(
        { left: 0, width: 10, bodyTop: 0, bodyBottom: 700 },
        viewport1440,
      ).width,
    ).toBe(FLOATING_VIDEO_MIN_WIDTH_PX);
  });

  const box: FloatingVideoRect = { left: 100, top: 100, width: 640, height: 360 };

  it('clamps each edge: left/top to 0, right/bottom to viewport − size', () => {
    expect(clampFloatingVideoRect({ ...box, left: -50 }, viewport1440).left).toBe(0);
    expect(clampFloatingVideoRect({ ...box, top: -1 }, viewport1440).top).toBe(0);
    expect(clampFloatingVideoRect({ ...box, left: 2000 }, viewport1440).left).toBe(800);
    expect(clampFloatingVideoRect({ ...box, top: 2000 }, viewport1440).top).toBe(540);
    expect(clampFloatingVideoRect(box, viewport1440)).toEqual(box);
    expect(clampFloatingVideoRect({ ...box, left: 800, top: 540 }, viewport1440)).toEqual({
      ...box,
      left: 800,
      top: 540,
    });
  });

  it('uses 0 when the viewport is smaller than the box', () => {
    expect(
      clampFloatingVideoRect(
        { ...box, left: 300, top: 300 },
        { viewportWidth: 500, viewportHeight: 200 },
      ),
    ).toEqual({ ...box, left: 0, top: 0 });
  });

  it('uses 0 for non-finite input', () => {
    expect(clampFloatingVideoRect({ ...box, left: Number.NaN }, viewport1440).left).toBe(0);
    expect(
      clampFloatingVideoRect({ ...box, top: Number.POSITIVE_INFINITY }, viewport1440).top,
    ).toBe(0);
    expect(
      clampFloatingVideoRect(box, { viewportWidth: Number.NaN, viewportHeight: 900 }).left,
    ).toBe(0);
    expect(clampFloatingVideoRect({ ...box, height: Number.NaN }, viewport1440).top).toBe(0);
  });

  it('steps 16 px for each arrow and returns null for other keys', () => {
    expect(stepFloatingVideoRect(box, 'ArrowLeft', viewport1440)).toEqual({ ...box, left: 84 });
    expect(stepFloatingVideoRect(box, 'ArrowRight', viewport1440)).toEqual({ ...box, left: 116 });
    expect(stepFloatingVideoRect(box, 'ArrowUp', viewport1440)).toEqual({ ...box, top: 84 });
    expect(stepFloatingVideoRect(box, 'ArrowDown', viewport1440)).toEqual({ ...box, top: 116 });
    expect(stepFloatingVideoRect(box, 'Enter', viewport1440)).toBeNull();
    expect(stepFloatingVideoRect(box, 'constructor', viewport1440)).toBeNull();
  });

  it('clamps an arrow step at every edge', () => {
    expect(stepFloatingVideoRect({ ...box, left: 8 }, 'ArrowLeft', viewport1440)?.left).toBe(0);
    expect(stepFloatingVideoRect({ ...box, top: 0 }, 'ArrowUp', viewport1440)?.top).toBe(0);
    expect(stepFloatingVideoRect({ ...box, left: 795 }, 'ArrowRight', viewport1440)?.left).toBe(
      800,
    );
    expect(stepFloatingVideoRect({ ...box, top: 540 }, 'ArrowDown', viewport1440)?.top).toBe(540);
  });
});

describe('floating video placement inside the library body (D-29e, C-R13-01)', () => {
  const viewport1440 = { viewportWidth: 1440, viewportHeight: 900 };
  const viewport1280 = { viewportWidth: 1280, viewportHeight: 720 };

  it('exports the 160 px minimum width (the D-22 compact size)', () => {
    expect(FLOATING_VIDEO_MIN_WIDTH_PX).toBe(160);
  });

  it('caps a tall body by 640 px and by the library width − 16', () => {
    const wide = placeFloatingVideoOverLibrary(
      { left: 0, width: 1000, bodyTop: 100, bodyBottom: 880 },
      viewport1440,
    );
    expect(wide).toEqual({ left: 8, top: 880 - 8 - 360, width: 640, height: 360 });
    const narrow = placeFloatingVideoOverLibrary(
      { left: 0, width: 288, bodyTop: 100, bodyBottom: 880 },
      viewport1440,
    );
    expect(narrow).toEqual({ left: 8, top: 880 - 8 - 153, width: 272, height: 153 });
  });

  it('caps a short body by its height so the box fits between body.top + 8 and body.bottom − 8', () => {
    const rect = placeFloatingVideoOverLibrary(
      { left: 0, width: 480, bodyTop: 255, bodyBottom: 520 },
      viewport1280,
    );
    expect(rect.height).toBeCloseTo(132.5, 10);
    expect(rect.width).toBeCloseTo((132.5 * 16) / 9, 10);
    expect(rect.top).toBeCloseTo(379.5, 10);
    expect(rect.top + rect.height).toBeCloseTo(520 - 8, 10);
    expect(rect.left).toBe(8);
  });

  it('keeps the 160 px minimum in the degenerate case and then sits at body.top + 8', () => {
    const rect = placeFloatingVideoOverLibrary(
      { left: 0, width: 288, bodyTop: 400, bodyBottom: 500 },
      viewport1440,
    );
    expect(rect).toEqual({ left: 8, top: 408, width: 160, height: 90 });
    expect(rect.top + rect.height).toBeGreaterThan(500 - 8);
  });

  it('anchors the box to the body bottom, not to the body top', () => {
    const rect = placeFloatingVideoOverLibrary(
      { left: 0, width: 288, bodyTop: 233, bodyBottom: 684 },
      viewport1440,
    );
    expect(rect.top + rect.height).toBe(684 - 8);
    expect(rect.top).toBeGreaterThan(233 + 8);
  });

  it('applies the viewport clamp after the body rule', () => {
    expect(
      placeFloatingVideoOverLibrary(
        { left: 1400, width: 288, bodyTop: 233, bodyBottom: 684 },
        viewport1440,
      ),
    ).toEqual({ left: 1440 - 272, top: 523, width: 272, height: 153 });
    expect(
      placeFloatingVideoOverLibrary(
        { left: 0, width: 288, bodyTop: -500, bodyBottom: -100 },
        viewport1440,
      ),
    ).toEqual({ left: 8, top: 0, width: 272, height: 153 });
  });

  it('gives width 0 for a non-finite body extent and coordinate 0 for a non-finite left', () => {
    expect(
      placeFloatingVideoOverLibrary(
        { left: 0, width: 288, bodyTop: Number.NaN, bodyBottom: 684 },
        viewport1440,
      ),
    ).toEqual({ left: 8, top: 0, width: 0, height: 0 });
    expect(
      placeFloatingVideoOverLibrary(
        { left: 0, width: 288, bodyTop: 233, bodyBottom: Number.POSITIVE_INFINITY },
        viewport1440,
      ),
    ).toEqual({ left: 8, top: 0, width: 0, height: 0 });
    expect(
      placeFloatingVideoOverLibrary(
        { left: Number.NaN, width: 288, bodyTop: 233, bodyBottom: 684 },
        viewport1440,
      ),
    ).toEqual({ left: 0, top: 523, width: 272, height: 153 });
  });
});

describe('floating video body-share cap and library inset (D-29f, C-R14-01)', () => {
  const viewport1440 = { viewportWidth: 1440, viewportHeight: 900 };
  const viewport1280 = { viewportWidth: 1280, viewportHeight: 720 };

  it('exports the half-body share', () => {
    expect(FLOATING_VIDEO_BODY_SHARE).toBe(0.5);
  });

  const measuredCases: ReadonlyArray<
    [
      string,
      { left: number; width: number; bodyTop: number; bodyBottom: number },
      typeof viewport1440,
      FloatingVideoRect,
    ]
  > = [
    [
      '1440/288',
      { left: 0, width: 288, bodyTop: 233, bodyBottom: 684 },
      viewport1440,
      { left: 8, top: 523, width: 272, height: 153 },
    ],
    [
      '1440/480',
      { left: 0, width: 480, bodyTop: 217, bodyBottom: 700 },
      viewport1440,
      { left: 8, top: 450.5, width: 429.33, height: 241.5 },
    ],
    [
      '1280/288',
      { left: 0, width: 288, bodyTop: 271, bodyBottom: 504 },
      viewport1280,
      { left: 8, top: 379.5, width: 207.11, height: 116.5 },
    ],
    [
      '1280/480',
      { left: 0, width: 480, bodyTop: 255, bodyBottom: 520 },
      viewport1280,
      { left: 8, top: 379.5, width: 235.56, height: 132.5 },
    ],
  ];

  it.each(
    measuredCases,
  )('places the %s box at the measured D-29f rect and keeps the upper half of the body free', (_label, library, viewport, expected) => {
    const rect = placeFloatingVideoOverLibrary(library, viewport);
    expect(rect.left).toBeCloseTo(expected.left, 2);
    expect(rect.top).toBeCloseTo(expected.top, 2);
    expect(rect.width).toBeCloseTo(expected.width, 2);
    expect(rect.height).toBeCloseTo(expected.height, 2);
    expect(rect.width / rect.height).toBeCloseTo(16 / 9, 10);
    const bodyHeight = library.bodyBottom - library.bodyTop;
    expect(rect.height).toBeLessThanOrEqual(bodyHeight * FLOATING_VIDEO_BODY_SHARE + 1e-9);
    expect(rect.top + rect.height).toBeCloseTo(library.bodyBottom - 8, 10);
    expect(rect.top - library.bodyTop).toBeGreaterThanOrEqual(bodyHeight / 2 - 8 - 1e-9);
  });

  it('still caps a tall body by 640 px or by the library width − 16', () => {
    const tall = { viewportWidth: 2400, viewportHeight: 2400 };
    expect(
      placeFloatingVideoOverLibrary({ left: 0, width: 1000, bodyTop: 100, bodyBottom: 1300 }, tall),
    ).toEqual({ left: 8, top: 1300 - 8 - 360, width: 640, height: 360 });
    expect(
      placeFloatingVideoOverLibrary({ left: 0, width: 288, bodyTop: 100, bodyBottom: 1300 }, tall),
    ).toEqual({ left: 8, top: 1300 - 8 - 153, width: 272, height: 153 });
  });

  it('keeps the 160 px minimum when half the body is shorter than 90 px', () => {
    const rect = placeFloatingVideoOverLibrary(
      { left: 0, width: 480, bodyTop: 400, bodyBottom: 520 },
      viewport1440,
    );
    expect(rect).toEqual({ left: 8, top: 520 - 8 - 90, width: 160, height: 90 });
    expect(rect.height).toBeGreaterThan(120 * FLOATING_VIDEO_BODY_SHARE);
  });

  it('returns the box height + 16 as the library inset for a placed box', () => {
    expect(floatingVideoLibraryInsetPx({ left: 8, top: 523, width: 272, height: 153 })).toBe(169);
    expect(floatingVideoLibraryInsetPx({ left: 8, top: 379.5, width: 235.56, height: 132.5 })).toBe(
      148.5,
    );
    expect(floatingVideoLibraryInsetPx({ left: 8, top: 450.5, width: 429.33, height: 241.5 })).toBe(
      257.5,
    );
  });

  it('returns 0 for no box, a non-finite height, a zero or a negative height', () => {
    expect(floatingVideoLibraryInsetPx(null)).toBe(0);
    const base = { left: 8, top: 8, width: 160 };
    expect(floatingVideoLibraryInsetPx({ ...base, height: Number.NaN })).toBe(0);
    expect(floatingVideoLibraryInsetPx({ ...base, height: Number.POSITIVE_INFINITY })).toBe(0);
    expect(floatingVideoLibraryInsetPx({ ...base, height: 0 })).toBe(0);
    expect(floatingVideoLibraryInsetPx({ ...base, height: -10 })).toBe(0);
  });
});
