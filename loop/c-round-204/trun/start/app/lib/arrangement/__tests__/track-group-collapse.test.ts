import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import {
  groupSelectedRows,
  trackGroupCollapseTargets,
  trackGroupDescendantTrackIds,
  trackGroupOverviewClips,
  trackGroupRows,
  visibleTrackGroupRows,
} from '../groups';
import { createArrangement } from '../model';

const CLIPS: ArrangementClip[] = [
  { id: 'cv', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 12 },
  { id: 'cm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
  { id: 'cs', trackId: 'stems', sourceId: 'stem', start: 2, sourceOffset: 0, duration: 6 },
  { id: 'cx', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function labArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips: CLIPS,
  };
}

function grouped(arrangement: Arrangement, rowIds: string[], groupId: string): Arrangement {
  const result = groupSelectedRows(arrangement, rowIds, groupId);
  if (result.kind !== 'grouped') {
    throw new Error(`grouping refused: ${result.reason}`);
  }
  return result.arrangement;
}

function g1(): Arrangement {
  return grouped(labArrangement(), ['stems', 'sfx'], 'g1');
}

function nested(): Arrangement {
  return grouped(g1(), ['music', 'g1'], 'g2');
}

function visibleIds(arrangement: Arrangement, collapsed: Record<string, boolean>): string[] {
  return visibleTrackGroupRows(trackGroupRows(arrangement), collapsed).map((row) => row.id);
}

describe('SRW-17 stage 2 track group collapse helpers', () => {
  it('GC1 a collapsed group keeps its header and hides its members', () => {
    expect(visibleIds(g1(), {})).toEqual(['video', 'music', 'g1', 'stems', 'sfx']);
    expect(visibleIds(g1(), { g1: true })).toEqual(['video', 'music', 'g1']);
    expect(visibleIds(g1(), { g1: false })).toEqual(['video', 'music', 'g1', 'stems', 'sfx']);
  });

  it('GC1 nesting hides every descendant and keeps the inner collapse state', () => {
    const arrangement = nested();
    expect(visibleIds(arrangement, {})).toEqual(['video', 'g2', 'music', 'g1', 'stems', 'sfx']);
    expect(visibleIds(arrangement, { g2: true })).toEqual(['video', 'g2']);
    expect(visibleIds(arrangement, { g1: true })).toEqual(['video', 'g2', 'music', 'g1']);
    expect(visibleIds(arrangement, { g1: true, g2: true })).toEqual(['video', 'g2']);
    expect(visibleIds(arrangement, { g1: true, g2: false })).toEqual([
      'video',
      'g2',
      'music',
      'g1',
    ]);
  });

  it('GC1 stale ids have no effect and nothing hidden keeps the same array', () => {
    const rows = trackGroupRows(g1());
    expect(visibleTrackGroupRows(rows, { gone: true })).toBe(rows);
    expect(visibleTrackGroupRows(rows, {})).toBe(rows);
    const plain = trackGroupRows(labArrangement());
    expect(visibleTrackGroupRows(plain, { g1: true })).toBe(plain);
  });

  it('GC2 overview blocks list the clips on every descendant track with exact times', () => {
    expect(trackGroupOverviewClips(g1(), 'g1')).toEqual([
      { clipId: 'cs', trackId: 'stems', start: 2, duration: 6 },
      { clipId: 'cx', trackId: 'sfx', start: 4, duration: 2 },
    ]);
    const outer = trackGroupOverviewClips(nested(), 'g2');
    expect(outer.map((block) => [block.clipId, block.start, block.start + block.duration])).toEqual(
      [
        ['cm', 0, 10],
        ['cs', 2, 8],
        ['cx', 4, 6],
      ],
    );
    expect(outer.some((block) => block.trackId === 'video')).toBe(false);
    expect(trackGroupDescendantTrackIds(nested(), 'g2')).toEqual(['music', 'stems', 'sfx']);
  });

  it('GC2 an empty group lane or an unknown group gives no blocks', () => {
    const arrangement = { ...g1(), clips: CLIPS.filter((clip) => clip.trackId === 'music') };
    expect(trackGroupOverviewClips(arrangement, 'g1')).toEqual([]);
    expect(trackGroupOverviewClips(g1(), 'missing')).toEqual([]);
    expect(trackGroupDescendantTrackIds(g1(), 'missing')).toEqual([]);
  });

  it('GC3 any expanded group in the selection collapses all; all collapsed expands all', () => {
    const rows = trackGroupRows(nested());
    expect(trackGroupCollapseTargets(rows, ['g1', 'g2'], { g1: true })).toEqual({
      kind: 'collapse',
      groupIds: ['g2', 'g1'],
    });
    expect(trackGroupCollapseTargets(rows, ['g2', 'g1'], { g1: true, g2: true })).toEqual({
      kind: 'expand',
      groupIds: ['g2', 'g1'],
    });
    expect(trackGroupCollapseTargets(rows, ['g1'], {})).toEqual({
      kind: 'collapse',
      groupIds: ['g1'],
    });
  });

  it('GC3 a selection without a rendered group is refused', () => {
    const rows = trackGroupRows(nested());
    expect(trackGroupCollapseTargets(rows, [], {})).toEqual({ kind: 'refused' });
    expect(trackGroupCollapseTargets(rows, ['music', 'stems'], {})).toEqual({ kind: 'refused' });
    const visible = visibleTrackGroupRows(rows, { g2: true });
    expect(trackGroupCollapseTargets(visible, ['g1'], { g2: true })).toEqual({ kind: 'refused' });
    expect(trackGroupCollapseTargets(visible, ['g1', 'g2'], { g2: true })).toEqual({
      kind: 'expand',
      groupIds: ['g2'],
    });
  });
});
