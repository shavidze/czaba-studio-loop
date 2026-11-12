import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementMarker } from '~/types/arrangement';
import { clipEdgeTimesOnTracks, edgeNavigationTrackIds, isApplePlatform } from '../edge-navigation';
import { adjacentMarkerTarget } from '../markers';
import { createArrangement } from '../model';

const MARKERS: ArrangementMarker[] = [
  { id: 'a', time: 6.3, name: 'A' },
  { id: 'b', time: 12, name: 'B' },
];

function edgeArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      {
        id: 'v1',
        trackId: 'video',
        sourceId: 'film',
        start: 1.75,
        sourceOffset: 0,
        duration: 28.25,
      },
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 2.25, sourceOffset: 0, duration: 5.5 },
      { id: 's1', trackId: 'sfx', sourceId: 'hit', start: 4.1, sourceOffset: 0, duration: 1.8 },
      { id: 's2', trackId: 'sfx', sourceId: 'hit', start: 5.9, sourceOffset: 0, duration: 0.4 },
    ],
    markers: MARKERS,
  };
}

const NOTHING = { activeTrackId: null, selectedClipIds: [], range: null };

describe('edgeNavigationTrackIds (EU1)', () => {
  it('returns the active track only when nothing else is selected', () => {
    expect(
      edgeNavigationTrackIds(edgeArrangement(), { ...NOTHING, activeTrackId: 'music' }),
    ).toEqual(['music']);
  });

  it('adds the tracks of selected clips once, in track order', () => {
    expect(
      edgeNavigationTrackIds(edgeArrangement(), {
        ...NOTHING,
        activeTrackId: 'sfx',
        selectedClipIds: ['s1', 's2', 'm1'],
      }),
    ).toEqual(['music', 'sfx']);
  });

  it('adds the range track, and every track for an all-tracks range', () => {
    const arrangement = edgeArrangement();
    expect(
      edgeNavigationTrackIds(arrangement, {
        ...NOTHING,
        activeTrackId: 'music',
        range: { start: 1, end: 3, trackId: 'sfx' },
      }),
    ).toEqual(['music', 'sfx']);
    expect(
      edgeNavigationTrackIds(arrangement, {
        ...NOTHING,
        range: { start: 1, end: 3, trackId: 'sfx', allTracks: true },
      }),
    ).toEqual(['video', 'music', 'sfx']);
  });

  it('ignores unknown track and clip ids and returns [] when nothing is selected', () => {
    const arrangement = edgeArrangement();
    expect(
      edgeNavigationTrackIds(arrangement, {
        activeTrackId: 'ghost',
        selectedClipIds: ['missing'],
        range: { start: 0, end: 1, trackId: 'nowhere' },
      }),
    ).toEqual([]);
    expect(edgeNavigationTrackIds(arrangement, NOTHING)).toEqual([]);
  });
});

describe('clipEdgeTimesOnTracks (EU2)', () => {
  it('returns sorted unique starts and ends of clips on the given tracks only', () => {
    const arrangement = edgeArrangement();
    expect(clipEdgeTimesOnTracks(arrangement, ['sfx'])).toEqual([4.1, 5.9, 6.3]);
    expect(clipEdgeTimesOnTracks(arrangement, ['sfx', 'music'])).toEqual([
      2.25, 4.1, 5.9, 6.3, 7.75,
    ]);
    expect(clipEdgeTimesOnTracks(arrangement, ['video'])).toEqual([1.75, 30]);
  });

  it('returns [] for no tracks or a track without clips', () => {
    const arrangement = edgeArrangement();
    expect(clipEdgeTimesOnTracks(arrangement, [])).toEqual([]);
    expect(clipEdgeTimesOnTracks({ ...arrangement, clips: [] }, ['music'])).toEqual([]);
  });
});

type Step = [number, -1 | 1, number | null, string | null];

function stepTable(arrangement: Arrangement, steps: Step[], edges?: readonly number[]) {
  for (const [from, direction, time, markerId] of steps) {
    const target =
      edges === undefined
        ? adjacentMarkerTarget(arrangement, from, direction, 30)
        : adjacentMarkerTarget(arrangement, from, direction, 30, edges);
    expect({
      from,
      direction,
      time: target?.time ?? null,
      marker: target?.marker?.id ?? null,
    }).toEqual({ from, direction, time, marker: markerId });
  }
}

describe('adjacentMarkerTarget with clip edges (EU3)', () => {
  const MARKERS_ONLY: Step[] = [
    [0, 1, 6.3, 'a'],
    [3, 1, 6.3, 'a'],
    [6.3, 1, 12, 'b'],
    [6.3003, 1, 12, 'b'],
    [9, 1, 12, 'b'],
    [12, 1, 30, null],
    [20, 1, 30, null],
    [30, 1, null, null],
    [0, -1, null, null],
    [3, -1, 0, null],
    [6.3, -1, 0, null],
    [6.3003, -1, 0, null],
    [9, -1, 6.3, 'a'],
    [12, -1, 6.3, 'a'],
    [20, -1, 12, 'b'],
    [30, -1, 12, 'b'],
  ];

  it('gives the round-76 results when edges are omitted or empty', () => {
    stepTable(edgeArrangement(), MARKERS_ONLY);
    stepTable(edgeArrangement(), MARKERS_ONLY, []);
  });

  it('stops at the nearest of marker and edge in both directions', () => {
    stepTable(
      edgeArrangement(),
      [
        [0, 1, 2.25, null],
        [2.25, 1, 6.3, 'a'],
        [6.3, 1, 7.75, null],
        [7.75, 1, 12, 'b'],
        [12, 1, 30, null],
        [30, -1, 12, 'b'],
        [12, -1, 7.75, null],
        [7.75, -1, 6.3, 'a'],
        [6.3, -1, 2.25, null],
        [2.25, -1, 0, null],
      ],
      [2.25, 7.75],
    );
  });

  it('treats an edge within MARKER_TIME_EPS of a marker as that marker (N3)', () => {
    stepTable(
      edgeArrangement(),
      [
        [7.75, 1, 12, 'b'],
        [20, -1, 12, 'b'],
        [6.3, 1, 12, 'b'],
        [12.2, -1, 12, 'b'],
      ],
      [11.9996, 12.0004],
    );
  });

  it('skips an edge within MARKER_TIME_EPS of the position and accepts unsorted edges', () => {
    const steps: Step[] = [
      [2.2503, 1, 6.3, 'a'],
      [2.2503, -1, 0, null],
      [7.7503, -1, 6.3, 'a'],
      [7.7497, 1, 12, 'b'],
      [0, 1, 2.25, null],
      [12, -1, 7.75, null],
    ];
    stepTable(edgeArrangement(), steps, [2.25, 7.75]);
    stepTable(edgeArrangement(), steps, [7.75, 2.25]);
  });

  it('never stops past the project end when a rounded edge exceeds it', () => {
    const target = adjacentMarkerTarget(edgeArrangement(), 12, 1, 29.9996, [30]);
    expect(target).toEqual({ time: 29.9996, marker: null });
    expect(adjacentMarkerTarget(edgeArrangement(), 29.9996, 1, 29.9996, [30])).toBeNull();
  });

  it('keeps the end/0 fallback and the refusal with edges', () => {
    stepTable(
      edgeArrangement(),
      [
        [12, 1, 30, null],
        [30, 1, null, null],
        [0, -1, null, null],
        [1, -1, 0, null],
      ],
      [0, 30],
    );
  });
});

describe('isApplePlatform (EU4)', () => {
  it.each([
    ['MacIntel', '', true],
    ['iPhone', '', true],
    ['iPad', '', true],
    ['Win32', '', false],
    ['Linux x86_64', '', false],
    ['', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', true],
    ['', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0', false],
    ['Win32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', false],
    ['', '', false],
  ])('platform %j with user agent %j → %s', (platform, userAgent, expected) => {
    expect(isApplePlatform(platform, userAgent)).toBe(expected);
  });
});
