import { describe, expect, it } from 'vitest';
import type { Arrangement, WorkspaceSource } from '~/types/arrangement';
import {
  buildLibraryTree,
  canPlaceLibraryClip,
  filterLibrarySources,
  LIBRARY_ALL_NODE_ID,
  libraryDropTime,
  libraryFolderNodeId,
  matchesLibraryQuery,
  moveLibrarySelection,
  resolveLibraryNode,
} from '../library';
import { createArrangement } from '../model';

const PUBLIC = 'დემო კოლექცია · საჯარო';
const SYNTH = 'სინთეზური დემო · ღამის პულსი';

function source(id: string, title: string, kind: WorkspaceSource['kind'], label: string) {
  return { id, title, kind, collectionLabel: label, origin: 'demo' as const };
}

const sources: WorkspaceSource[] = [
  source('me', 'Middle East — საჯარო preview', 'music', PUBLIC),
  source('impact', 'Soft impact', 'sfx', PUBLIC),
  source('rise', 'Slow rise', 'sfx', PUBLIC),
  source('mix', 'ღამის პულსი · სრული მიქსი', 'music', SYNTH),
  source('pulse', 'ღამის პულსი · პულსი', 'stem', SYNTH),
  source('bass', 'ღამის პულსი · ბასი', 'stem', SYNTH),
  source('pad', 'ღამის პულსი · პადი', 'stem', SYNTH),
  source('lead', 'ღამის პულსი · მელოდია', 'stem', SYNTH),
];

function ids(list: WorkspaceSource[]): string[] {
  return list.map((entry) => entry.id);
}

describe('buildLibraryTree', () => {
  it('groups by collection and hides empty folders', () => {
    const tree = buildLibraryTree(sources);
    expect(tree.total).toBe(8);
    expect(tree.collections.map((entry) => entry.label)).toEqual([PUBLIC, SYNTH]);
    expect(tree.collections[0].folders.map((folder) => [folder.label, folder.count])).toEqual([
      ['Music', 1],
      ['SFX', 2],
    ]);
    expect(tree.collections[1].folders.map((folder) => [folder.label, folder.count])).toEqual([
      ['Music', 1],
      ['Stems', 4],
    ]);
  });

  it('resolves folder, collection and the all node to filters', () => {
    const tree = buildLibraryTree(sources);
    const stems = resolveLibraryNode(tree, libraryFolderNodeId(SYNTH, 'stem'));
    expect(ids(filterLibrarySources(sources, stems, ''))).toEqual(['pulse', 'bass', 'pad', 'lead']);
    const publicNode = resolveLibraryNode(tree, tree.collections[0].id);
    expect(ids(filterLibrarySources(sources, publicNode, ''))).toEqual(['me', 'impact', 'rise']);
    expect(
      filterLibrarySources(sources, resolveLibraryNode(tree, LIBRARY_ALL_NODE_ID), ''),
    ).toHaveLength(8);
  });
});

describe('library search (LIB-03/04)', () => {
  const all = { collectionLabel: null, kind: null };

  it('ANDs words in any order across title, kind label and collection label', () => {
    expect(ids(filterLibrarySources(sources, all, 'ბასი დემო'))).toEqual(['bass']);
    expect(ids(filterLibrarySources(sources, all, 'დემო ბასი'))).toEqual(['bass']);
    expect(ids(filterLibrarySources(sources, all, 'stem პადი'))).toEqual(['pad']);
    expect(ids(filterLibrarySources(sources, all, 'music'))).toEqual(['me', 'mix']);
    expect(ids(filterLibrarySources(sources, all, 'MUSIC'))).toEqual(['me', 'mix']);
    expect(ids(filterLibrarySources(sources, all, 'stem'))).toEqual([
      'pulse',
      'bass',
      'pad',
      'lead',
    ]);
    expect(matchesLibraryQuery(sources[0], 'მუსიკა')).toBe(false);
    expect(ids(filterLibrarySources(sources, all, 'მუსიკა'))).toEqual([]);
  });

  it('is case-insensitive and ignores extra whitespace', () => {
    expect(matchesLibraryQuery(sources[1], '  SOFT   Impact ')).toBe(true);
    expect(matchesLibraryQuery(sources[1], 'soft rise')).toBe(false);
  });

  it('returns nothing for an unknown word and everything for an empty query', () => {
    expect(filterLibrarySources(sources, all, 'zzz')).toEqual([]);
    expect(filterLibrarySources(sources, all, '   ')).toHaveLength(8);
  });

  it('keeps the folder filter when the text is cleared', () => {
    const sfx = { collectionLabel: PUBLIC, kind: 'sfx' as const };
    expect(ids(filterLibrarySources(sources, sfx, 'slow'))).toEqual(['rise']);
    expect(ids(filterLibrarySources(sources, sfx, ''))).toEqual(['impact', 'rise']);
  });
});

describe('moveLibrarySelection (LIB-05)', () => {
  const list = ['a', 'b', 'c'];

  it('enters the list at the first item going down and the last going up', () => {
    expect(moveLibrarySelection(list, null, 1)).toBe('a');
    expect(moveLibrarySelection(list, null, -1)).toBe('c');
    expect(moveLibrarySelection(list, 'gone', 1)).toBe('a');
  });

  it('moves one step and stops at both bounds', () => {
    expect(moveLibrarySelection(list, 'a', 1)).toBe('b');
    expect(moveLibrarySelection(list, 'c', 1)).toBe('c');
    expect(moveLibrarySelection(list, 'a', -1)).toBe('a');
    expect(moveLibrarySelection([], 'a', 1)).toBeNull();
  });
});

describe('libraryDropTime', () => {
  it('converts the pointer to seconds from the lane origin, rounded to ms and never negative', () => {
    expect(libraryDropTime({ clientX: 700, laneLeft: 300, pxPerSecond: 40 })).toBe(10);
    expect(libraryDropTime({ clientX: 301.3, laneLeft: 300, pxPerSecond: 40 })).toBe(0.033);
    expect(libraryDropTime({ clientX: 250, laneLeft: 300, pxPerSecond: 40 })).toBe(0);
    expect(libraryDropTime({ clientX: 700, laneLeft: 300, pxPerSecond: 0 })).toBe(0);
  });
});

describe('canPlaceLibraryClip (overlap refusal)', () => {
  const arrangement: Arrangement = {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
    ]),
    clips: [
      { id: 'c1', trackId: 'stems', sourceId: 'pad', start: 4, sourceOffset: 0, duration: 4 },
    ],
  };

  it('allows free space, including touching edges', () => {
    expect(canPlaceLibraryClip(arrangement, { trackId: 'stems', start: 10, duration: 16 })).toBe(
      true,
    );
    expect(canPlaceLibraryClip(arrangement, { trackId: 'stems', start: 0, duration: 4 })).toBe(
      true,
    );
    expect(canPlaceLibraryClip(arrangement, { trackId: 'stems', start: 8, duration: 1 })).toBe(
      true,
    );
  });

  it('refuses an overlap, the video lane and an unknown lane', () => {
    expect(canPlaceLibraryClip(arrangement, { trackId: 'stems', start: 2, duration: 3 })).toBe(
      false,
    );
    expect(canPlaceLibraryClip(arrangement, { trackId: 'stems', start: 7.9, duration: 1 })).toBe(
      false,
    );
    expect(canPlaceLibraryClip(arrangement, { trackId: 'video', start: 20, duration: 1 })).toBe(
      false,
    );
    expect(canPlaceLibraryClip(arrangement, { trackId: 'nope', start: 20, duration: 1 })).toBe(
      false,
    );
  });
});
