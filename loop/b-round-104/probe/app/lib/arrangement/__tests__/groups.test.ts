import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import { cutRangeFromArrangement, cutTimeToClipboard } from '../clipboard';
import {
  arrangementGroups,
  expandShiftSelection,
  groupSelectedRows,
  liveTrackSelection,
  nextTrackGroupName,
  renameTrackGroup,
  rowParentId,
  trackGroupRowCount,
  trackGroupRows,
  ungroupSelectedRows,
} from '../groups';
import { addMarker } from '../markers';
import {
  createArrangement,
  deleteTime,
  duplicateClips,
  isSameArrangement,
  moveClip,
  setArrangementTrackPan,
  setTrackMix,
  toggleSolo,
} from '../model';

const CLIPS: ArrangementClip[] = [
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

function ungrouped(arrangement: Arrangement, rowIds: string[]): Arrangement {
  const result = ungroupSelectedRows(arrangement, rowIds);
  if (result.kind !== 'ungrouped') {
    throw new Error('ungroup refused');
  }
  return result.arrangement;
}

function rowSummary(arrangement: Arrangement): string[] {
  return trackGroupRows(arrangement).map((row) => `${row.id}:${row.depth}`);
}

function expectNormalForm(arrangement: Arrangement) {
  expect(Object.hasOwn(arrangement, 'groups')).toBe(false);
  for (const track of arrangement.tracks) {
    expect(Object.hasOwn(track, 'groupId')).toBe(false);
  }
}

describe('SRW-17 stage 1 track group model', () => {
  it('GU1 group then ungroup returns the exact normal form without groups or groupId keys', () => {
    const original = labArrangement();
    const withGroup = grouped(original, ['music', 'stems'], 'g1');
    expect(arrangementGroups(withGroup)).toEqual([{ id: 'g1', name: 'ჯგუფი 1', parentId: null }]);
    expect(withGroup.tracks.map((track) => track.groupId ?? null)).toEqual([
      null,
      'g1',
      'g1',
      null,
    ]);
    expect(Object.hasOwn(withGroup.tracks[0], 'groupId')).toBe(false);
    const restored = ungrouped(withGroup, ['g1']);
    expect(isSameArrangement(restored, original)).toBe(true);
    expectNormalForm(restored);
    expect(restored.tracks).toEqual(original.tracks);
    expect(original.groups).toBeUndefined();
  });

  it('GU1 grouping leaves the input arrangement untouched (undo restores the original reference)', () => {
    const original = labArrangement();
    const snapshot = JSON.stringify(original);
    grouped(original, ['music', 'stems'], 'g1');
    expect(JSON.stringify(original)).toBe(snapshot);
    expectNormalForm(original);
  });

  it('GU2 refusals return typed reasons and accept a one-track group', () => {
    const base = labArrangement();
    expect(groupSelectedRows(base, [])).toEqual({ kind: 'refused', reason: 'empty' });
    expect(groupSelectedRows(base, ['video', 'music'])).toEqual({
      kind: 'refused',
      reason: 'video',
    });
    expect(groupSelectedRows(base, ['music', 'sfx'])).toEqual({ kind: 'refused', reason: 'gap' });
    expect(groupSelectedRows(base, ['music', 'ghost'])).toEqual({
      kind: 'refused',
      reason: 'unknown',
    });
    const inner = grouped(base, ['stems', 'sfx'], 'g1');
    expect(groupSelectedRows(inner, ['music', 'stems'])).toEqual({
      kind: 'refused',
      reason: 'mixed-parents',
    });
    const single = groupSelectedRows(base, ['sfx'], 'solo');
    expect(single.kind).toBe('grouped');
    if (single.kind === 'grouped') {
      expect(single.memberNames).toEqual(['SFX']);
      expect(rowSummary(single.arrangement)).toEqual([
        'video:0',
        'music:0',
        'stems:0',
        'solo:0',
        'sfx:1',
      ]);
    }
  });

  it('GU2 a gap inside a group is refused too, siblings are judged under their own parent', () => {
    const base = grouped(labArrangement(), ['music', 'stems', 'sfx'], 'g1');
    expect(groupSelectedRows(base, ['music', 'sfx'])).toEqual({ kind: 'refused', reason: 'gap' });
    const nested = groupSelectedRows(base, ['stems', 'sfx'], 'g2');
    expect(nested.kind).toBe('grouped');
    if (nested.kind === 'grouped') {
      expect(nested.group.parentId).toBe('g1');
    }
  });

  it('GU3 nesting: grouping a group with a sibling track sets the inner parent and the row order', () => {
    const inner = grouped(labArrangement(), ['stems', 'sfx'], 'g1');
    const outerResult = groupSelectedRows(inner, ['music', 'g1'], 'g2');
    expect(outerResult.kind).toBe('grouped');
    if (outerResult.kind !== 'grouped') {
      return;
    }
    expect(outerResult.group).toEqual({ id: 'g2', name: 'ჯგუფი 2', parentId: null });
    expect(outerResult.memberNames).toEqual(['მუსიკა', 'ჯგუფი 1']);
    const outer = outerResult.arrangement;
    expect(arrangementGroups(outer).find((group) => group.id === 'g1')?.parentId).toBe('g2');
    expect(rowSummary(outer)).toEqual(['video:0', 'g2:0', 'music:1', 'g1:1', 'stems:2', 'sfx:2']);
    expect(rowParentId(outer, 'stems')).toBe('g1');
    expect(rowParentId(outer, 'g1')).toBe('g2');
    expect(rowParentId(outer, 'ghost')).toBeUndefined();
    const dissolved = ungroupSelectedRows(outer, ['g2']);
    expect(dissolved.kind).toBe('ungrouped');
    if (dissolved.kind !== 'ungrouped') {
      return;
    }
    expect(dissolved.childIds).toEqual(['music', 'g1']);
    expect(rowSummary(dissolved.arrangement)).toEqual([
      'video:0',
      'music:0',
      'g1:0',
      'stems:1',
      'sfx:1',
    ]);
    expect(isSameArrangement(dissolved.arrangement, inner)).toBe(true);
  });

  it('GU3 dissolving an outer and an inner group together lifts all children to the top level', () => {
    const inner = grouped(labArrangement(), ['stems', 'sfx'], 'g1');
    const outer = grouped(inner, ['music', 'g1'], 'g2');
    const result = ungroupSelectedRows(outer, ['g1', 'g2']);
    expect(result.kind).toBe('ungrouped');
    if (result.kind === 'ungrouped') {
      expect(result.childIds).toEqual(['music', 'stems', 'sfx']);
      expect(isSameArrangement(result.arrangement, labArrangement())).toBe(true);
      expectNormalForm(result.arrangement);
    }
    expect(ungroupSelectedRows(outer, ['music'])).toEqual({ kind: 'refused', reason: 'no-group' });
  });

  it('GU3 ungroup over corrupt parents (cycle, dangling) never leaves a self or unknown parent', () => {
    const base = labArrangement();
    const corrupt: Arrangement = {
      ...base,
      tracks: base.tracks.map((track) =>
        track.id === 'stems' || track.id === 'sfx' ? { ...track, groupId: 'g1' } : track,
      ),
      groups: [
        { id: 'g1', name: 'A', parentId: 'g2' },
        { id: 'g2', name: 'B', parentId: 'g1' },
        { id: 'g3', name: 'C', parentId: 'ghost' },
      ],
    };
    expect(trackGroupRowCount(corrupt)).toBe(2);
    expect(trackGroupRowCount(base)).toBe(0);
    const result = ungroupSelectedRows(corrupt, ['g2']);
    expect(result.kind).toBe('ungrouped');
    if (result.kind !== 'ungrouped') {
      return;
    }
    const ids = new Set(arrangementGroups(result.arrangement).map((group) => group.id));
    for (const group of arrangementGroups(result.arrangement)) {
      expect(group.parentId).not.toBe(group.id);
      if (group.parentId !== null && group.id !== 'g3') {
        expect(ids.has(group.parentId)).toBe(true);
      }
    }
    expect(rowSummary(result.arrangement)).toEqual([
      'video:0',
      'music:0',
      'g1:0',
      'stems:1',
      'sfx:1',
    ]);
  });

  it('GU4 naming reuses the smallest free number and rename trims or keeps the reference', () => {
    const first = grouped(labArrangement(), ['music'], 'g1');
    const second = grouped(first, ['stems', 'sfx'], 'g2');
    expect(arrangementGroups(second).map((group) => group.name)).toEqual(['ჯგუფი 1', 'ჯგუფი 2']);
    const reopened = ungrouped(second, ['g1']);
    expect(nextTrackGroupName(reopened)).toBe('ჯგუფი 1');
    const renamed = renameTrackGroup(second, 'g2', '  SFX ქუჩა  ');
    expect(arrangementGroups(renamed).find((group) => group.id === 'g2')?.name).toBe('SFX ქუჩა');
    expect(renameTrackGroup(second, 'g2', '   ')).toBe(second);
    expect(renameTrackGroup(second, 'g2', 'ჯგუფი 2')).toBe(second);
    expect(renameTrackGroup(second, 'ghost', 'X')).toBe(second);
    expect(nextTrackGroupName(renameTrackGroup(second, 'g1', 'A'))).toBe('ჯგუფი 1');
  });

  it('GU5 Shift range selects siblings between anchor and target under one parent only', () => {
    const base = labArrangement();
    expect(expandShiftSelection(base, 'music', 'sfx')).toEqual(['music', 'stems', 'sfx']);
    expect(expandShiftSelection(base, 'sfx', 'music')).toEqual(['music', 'stems', 'sfx']);
    expect(expandShiftSelection(base, null, 'stems')).toEqual(['stems']);
    const inner = grouped(base, ['stems', 'sfx'], 'g1');
    expect(expandShiftSelection(inner, 'music', 'sfx')).toEqual(['sfx']);
    expect(expandShiftSelection(inner, 'music', 'g1')).toEqual(['music', 'g1']);
    expect(expandShiftSelection(inner, 'stems', 'sfx')).toEqual(['stems', 'sfx']);
    expect(expandShiftSelection(inner, 'music', 'ghost')).toEqual([]);
  });

  it('GU5 live selection drops ids that no longer exist after an undo', () => {
    const inner = grouped(labArrangement(), ['stems', 'sfx'], 'g1');
    const ids = ['g1', 'music'];
    expect(liveTrackSelection(inner, ids)).toBe(ids);
    expect(liveTrackSelection(labArrangement(), ids)).toEqual(['music']);
  });

  it('GU6 other edits keep groups and every groupId', () => {
    const base = grouped(grouped(labArrangement(), ['stems', 'sfx'], 'g1'), ['music', 'g1'], 'g2');
    const groupsOf = (arrangement: Arrangement) => ({
      groups: arrangement.groups,
      ids: arrangement.tracks.map((track) => [track.id, track.groupId ?? null]),
    });
    const expected = groupsOf(base);
    const duplicated = duplicateClips(base, ['cx']);
    const marker = addMarker(base, 3, 'A');
    const moved = moveClip(base, 'cx', 12);
    const edits: Array<[string, Arrangement | null]> = [
      ['deleteTime', deleteTime(base, 1, 2)],
      ['cutTime', cutTimeToClipboard(base, 1, 2).arrangement],
      ['cutRange', cutRangeFromArrangement(base, { start: 1, end: 2, trackId: 'music' })],
      ['setTrackMix', setTrackMix(base, 'stems', { volume: 0.5, mute: true })],
      ['toggleSolo', toggleSolo(base, 'sfx', false)],
      ['toggleSoloAdditive', toggleSolo(base, 'music', true)],
      ['pan', setArrangementTrackPan(base, 'stems', 0.5)],
      ['panReset', setArrangementTrackPan(setArrangementTrackPan(base, 'stems', 0.5), 'stems', 0)],
      ['duplicate', duplicated?.arrangement ?? null],
      ['marker', marker.arrangement],
      ['move', moved],
    ];
    for (const [label, next] of edits) {
      expect(next, label).not.toBeNull();
      if (next) {
        expect(groupsOf(next), label).toEqual(expected);
        expect(next, label).not.toBe(base);
      }
    }
  });
});
