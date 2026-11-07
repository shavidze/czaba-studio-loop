import { describe, expect, it } from 'vitest';
import type { ArrangementClip } from '~/types/arrangement';
import {
  clipEdgeTargets,
  clipEdgeTimes,
  snapGroupMoveDelta,
  snapMoveStartToGridOrEdges,
  snapRelativeMoveStartToGridOrEdges,
  snapTimeToGridOrEdges,
} from '../grid';

function edgeClip(id: string, trackId: string, start: number, duration: number): ArrangementClip {
  return { id, trackId, sourceId: trackId, start, sourceOffset: 0, duration };
}

describe('SRW-14 stage 4a snapTimeToGridOrEdges', () => {
  it('CE1 picks the nearest of the grid line and the clip edges; a tie goes to the grid', () => {
    expect(snapTimeToGridOrEdges(9.3, 1, [9.35])).toBe(9.35);
    expect(snapTimeToGridOrEdges(9.3, 1, [9.8])).toBe(9);
    expect(snapTimeToGridOrEdges(9.25, 0.5, [9])).toBe(9.5);
    expect(snapTimeToGridOrEdges(9.3, 1, [])).toBe(9);
  });
});

describe('SRW-14 stage 4a snapMoveStartToGridOrEdges', () => {
  it('CE2 lets the start or the end touch an edge, drops negative starts and prefers the earlier edge on a tie', () => {
    expect(snapMoveStartToGridOrEdges(6.35, 2, 1, [8.4])).toBe(6.4);
    expect(snapMoveStartToGridOrEdges(6.35, 2, 1, [6.4])).toBe(6.4);
    expect(snapMoveStartToGridOrEdges(-0.5, 2, 1, [1.6])).toBe(0);
    expect(snapMoveStartToGridOrEdges(6.5, 2, 10, [6.4, 8.6])).toBe(6.4);
    expect(snapMoveStartToGridOrEdges(6.5, 2, 10, [6.6, 8.4])).toBe(6.4);
  });
});

describe('SRW-14 stage 4a clipEdgeTimes', () => {
  it('CE3 lists unique ascending edges of every other clip, the video clip included', () => {
    const clips = [
      edgeClip('video-1', 'video', 0, 6.008),
      edgeClip('music-1', 'music', 7, 16),
      edgeClip('sfx-1', 'sfx', 4, 2),
      edgeClip('music-2', 'music', 23, 2),
    ];
    expect(clipEdgeTimes(clips, 'sfx-1')).toEqual([0, 6.008, 7, 23, 25]);
  });
});

describe('SRW-14 stage 4a exact sub-millisecond edges (D-29z18)', () => {
  it('CE4 compares in whole microseconds and returns the exact winning candidate', () => {
    expect(snapMoveStartToGridOrEdges(8.35, 2.0004, 1, [10.4])).toBeCloseTo(8.3996, 9);
    expect(snapMoveStartToGridOrEdges(6.05, 2, 1, [6.0004])).toBeCloseTo(6.0004, 9);
    expect(snapTimeToGridOrEdges(9.7, 1, [9.6004])).toBeCloseTo(9.6004, 9);
    expect(snapTimeToGridOrEdges(9.25, 0.5, [9])).toBe(9.5);
  });

  it('CE5 offers only start-to-end and end-to-start pairs on the placement lane', () => {
    const clips = [
      edgeClip('m0', 'music', 2, 2),
      edgeClip('m2', 'music', 6, 1),
      edgeClip('s1', 'sfx', 3, 2),
      edgeClip('v', 'video', 0, 6.008),
    ];
    expect(clipEdgeTargets(clips, 'm0', 'music')).toEqual({
      startEdges: [0, 3, 5, 6.008, 7],
      endEdges: [0, 3, 5, 6, 6.008],
    });
    expect(clipEdgeTargets(clips, 'm0', 'sfx')).toEqual({
      startEdges: [0, 5, 6, 6.008, 7],
      endEdges: [0, 3, 6, 6.008, 7],
    });
  });

  it('CE6 keeps exact edges and merges values with the same microsecond, keeping the smallest', () => {
    const edges = clipEdgeTimes(
      [edgeClip('a', 'music', 2, 2.0004), edgeClip('b', 'sfx', 4.000400001, 1)],
      'x',
    );
    expect(edges).toHaveLength(3);
    expect(edges[0]).toBeCloseTo(2, 6);
    expect(edges[1]).toBeCloseTo(4.0004, 6);
    expect(edges[2]).toBeCloseTo(5.0004, 6);
    expect(edges.find((edge) => edge >= 4)).toBe(2 + 2.0004);
  });
});

describe('SRW-14 stage 4c group move snaps the anchor to edges (D-29z27)', () => {
  it('CE7 a grid win keeps the whole-millisecond group delta of a sub-millisecond anchor', () => {
    expect(snapGroupMoveDelta(6.0004, 2, 1.9, 1, -6.0004, Infinity, [], [])).toEqual({
      requested: 2,
      allowed: 2,
    });
  });

  it('CE8 a start touch keeps the exact microsecond delta and a tie goes to the grid', () => {
    const touch = snapGroupMoveDelta(2, 2, 4.05, 1, -2, Infinity, [6.0004], []);
    expect(touch.requested).toBeCloseTo(4.0004, 9);
    expect(touch.allowed).toBeCloseTo(4.0004, 9);
    expect(snapGroupMoveDelta(2, 2, 4.375, 1, -2, Infinity, [6.75], [])).toEqual({
      requested: 4,
      allowed: 4,
    });
  });

  it('CE9 an end touch past the bounds falls back to the in-bounds grid line', () => {
    const result = snapGroupMoveDelta(2, 2, 6.35, 1, -2, 5, [], [10.4]);
    expect(result.requested).toBe(6);
    expect(result.allowed).toBe(5);
    expect(snapGroupMoveDelta(2, 2, 6.35, 1, -2, 5.3, [], [10.4]).allowed).toBe(5);
  });

  it('CE10 an out-of-bounds edge with an in-bounds grid line returns an unblocked grid delta', () => {
    expect(snapGroupMoveDelta(2, 2, 6.35, 1, -2, 6.2, [], [10.4])).toEqual({
      requested: 6,
      allowed: 6,
    });
  });

  it('CE11 an edge within 1e-6 of a bound still butts', () => {
    expect(snapGroupMoveDelta(0, 1, 2.45, 1, 0, 2.4999995, [2.5], [])).toEqual({
      requested: 2.5,
      allowed: 2.5,
    });
    expect(snapGroupMoveDelta(3, 1, -0.45, 1, -0.4999995, Infinity, [2.5], [])).toEqual({
      requested: -0.5,
      allowed: -0.5,
    });
  });
});

describe('SABA-B-11c stage 2 relative move snap (RU)', () => {
  const quarterAt90 = 60 / 90;

  it('RU1 an off-grid start keeps its offset and moves in whole divisions', () => {
    expect(snapRelativeMoveStartToGridOrEdges(4.3, 0.9, 1, 1, [])).toBe(5.3);
    expect(snapRelativeMoveStartToGridOrEdges(4.3, 1.6, 1, 1, [])).toBe(6.3);
    expect(snapRelativeMoveStartToGridOrEdges(4.3, 0.49, 1, 1, [])).toBe(4.3);
    expect(snapRelativeMoveStartToGridOrEdges(4.3, 0.5, 1, 1, [])).toBe(5.3);
    expect(snapRelativeMoveStartToGridOrEdges(4.3, -0.4, 1, 1, [])).toBe(4.3);
    expect(snapRelativeMoveStartToGridOrEdges(4.3, -0.6, 1, 1, [])).toBe(3.3);
  });

  it('RU2 an on-grid start gives exactly the absolute result', () => {
    const cases: [number, number][] = [
      [0, 1],
      [2, 1],
      [7, 0.25],
      [6.0004, 1],
      [0.667, quarterAt90],
      [1.333, quarterAt90],
    ];
    for (const [anchor, step] of cases) {
      for (let twentieth = -40; twentieth <= 40; twentieth++) {
        const delta = twentieth / 20;
        expect(snapRelativeMoveStartToGridOrEdges(anchor, delta, 1, step, [])).toBe(
          snapMoveStartToGridOrEdges(anchor + delta, 1, step, []),
        );
      }
    }
  });

  it('RU3 the lowest start is the offset itself, never below zero', () => {
    expect(snapRelativeMoveStartToGridOrEdges(4.3, -10, 1, 1, [])).toBe(0.3);
    expect(snapRelativeMoveStartToGridOrEdges(0.3, -0.6, 1, 1, [])).toBe(0.3);
  });

  it('RU4 a nearer edge still wins and a tie goes to the grid step', () => {
    expect(snapRelativeMoveStartToGridOrEdges(4.3, 0.95, 1, 1, [5.22])).toBe(5.22);
    expect(snapRelativeMoveStartToGridOrEdges(4.3, 0.95, 1, 1, [5.2])).toBe(5.3);
    expect(snapRelativeMoveStartToGridOrEdges(4.3, 0.95, 1, 1, [], [6.27])).toBeCloseTo(5.27, 9);
  });

  it('RU5 a musical step keeps the offset in whole beats', () => {
    expect(snapRelativeMoveStartToGridOrEdges(1, 0.7, 1, quarterAt90, [])).toBe(1.666);
    expect(snapRelativeMoveStartToGridOrEdges(1, -0.3, 1, quarterAt90, [])).toBe(1);
  });

  it('RU6 a start within half a millisecond of a line counts as on the grid', () => {
    expect(snapRelativeMoveStartToGridOrEdges(6.0004, 1.9, 2, 1, [])).toBe(8);
    expect(snapRelativeMoveStartToGridOrEdges(6.0006, 1.9, 2, 1, [])).toBe(8.001);
  });

  it('RU7 twenty one-beat drags on a musical step keep the same offset from the stored line', () => {
    let start = 1;
    for (let drag = 0; drag < 20; drag++) {
      start = snapRelativeMoveStartToGridOrEdges(start, quarterAt90, 1, quarterAt90, []);
    }
    expect(start).toBe(14.333);
  });

  it('RU8 jitter on an off-grid clip with a neighbour edge 0.6 s away does not move it', () => {
    expect(snapRelativeMoveStartToGridOrEdges(4.3, 0.1, 1, 1, [4.9])).toBe(4.3);
    expect(snapRelativeMoveStartToGridOrEdges(4.3, -0.1, 1, 1, [4.9])).toBe(4.3);
  });

  it('RG1 a group delta from an off-grid anchor is a whole number of divisions inside the bounds', () => {
    expect(snapGroupMoveDelta(4.3, 1, 0.9, 1, -4.3, 10, [], [])).toEqual({
      requested: 1,
      allowed: 1,
    });
    expect(snapGroupMoveDelta(4.3, 1, 2.6, 1, -4.3, 1.5, [], [])).toEqual({
      requested: 3,
      allowed: 1,
    });
    expect(snapGroupMoveDelta(4.3, 1, -2.6, 1, -1.5, 10, [], [])).toEqual({
      requested: -3,
      allowed: -1,
    });
    expect(snapGroupMoveDelta(4.3, 1, 0.9, 1, -4.3, 0.7, [], [])).toEqual({
      requested: 1,
      allowed: 0,
    });
    expect(snapGroupMoveDelta(4.3, 1, -10, 1, -4.3, 10, [], [])).toEqual({
      requested: -4,
      allowed: -4,
    });
  });

  it('RG2 a blocked off-grid group on a musical step never passes the bound by the stored-line rounding', () => {
    const blocked = snapGroupMoveDelta(0.2, 1, 2, quarterAt90, -0.2, 0.6667, [], []);
    expect(blocked.requested).toBe(2);
    expect(blocked.allowed).toBeLessThanOrEqual(0.6667);
    expect(blocked.allowed).toBe(0);
    expect(snapGroupMoveDelta(0.2, 1, 2, quarterAt90, -0.2, 0.667, [], [])).toEqual({
      requested: 2,
      allowed: 0.667,
    });
  });
});
