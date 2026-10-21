import { describe, expect, it } from 'vitest';
import type { Arrangement, ArrangementMarker } from '~/types/arrangement';
import {
  addMarker,
  adjacentMarkerTarget,
  arrangementMarkers,
  deleteMarker,
  MARKER_DEFAULT_NAME_PREFIX,
  MARKER_NAME_MAX_LENGTH,
  markerAtTime,
  nextDefaultMarkerName,
  normalizeMarkerName,
  remapMarkersAfterDeleteTime,
  renameMarker,
} from '../markers';
import {
  commitHistory,
  createArrangement,
  createHistory,
  deleteTime,
  isSameArrangement,
  redoHistory,
  undoHistory,
} from '../model';

function freshArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 50 },
      { id: 'm2', trackId: 'music', sourceId: 'song', start: 60, sourceOffset: 0, duration: 5 },
    ],
    loop: { start: 8, end: 30, enabled: true },
  };
}

function withMarkers(arrangement: Arrangement, markers: ArrangementMarker[]): Arrangement {
  return { ...arrangement, markers };
}

function marker(id: string, time: number, name = id): ArrangementMarker {
  return { id, time, name };
}

function addOrThrow(arrangement: Arrangement, time: number, name: string) {
  const result = addMarker(arrangement, time, name);
  if (result.arrangement === null) {
    throw new Error(`marker at ${time} already exists`);
  }
  return { arrangement: result.arrangement, marker: result.marker };
}

function times(arrangement: Arrangement): number[] {
  return arrangementMarkers(arrangement).map((entry) => entry.time);
}

describe('marker normal form (MK1)', () => {
  it('reads an absent key as empty, rounds to ms, keeps the list sorted, and add+delete restores the JSON', () => {
    const fresh = freshArrangement();
    expect('markers' in fresh).toBe(false);
    expect(arrangementMarkers(fresh)).toEqual([]);
    const first = addOrThrow(fresh, 12.0004, 'Intro');
    expect(first.marker.time).toBe(12);
    expect(first.marker.name).toBe('Intro');
    expect(typeof first.marker.id).toBe('string');
    expect(first.marker.id.length).toBeGreaterThan(0);
    expect(times(first.arrangement)).toEqual([12]);
    expect(fresh.markers).toBeUndefined();
    const sorted = addOrThrow(
      addOrThrow(addOrThrow(fresh, 30, 'a').arrangement, 5, 'b').arrangement,
      12,
      'c',
    );
    expect(times(sorted.arrangement)).toEqual([5, 12, 30]);
    const negative = addOrThrow(fresh, -3, 'neg');
    expect(negative.marker.time).toBe(0);
    const removed = deleteMarker(first.arrangement, first.marker.id);
    expect('markers' in removed).toBe(false);
    expect(isSameArrangement(fresh, removed)).toBe(true);
    expect(JSON.stringify(removed)).toBe(JSON.stringify(fresh));
  });

  it('keeps distinct ms as distinct markers and gives every marker its own id', () => {
    const fresh = freshArrangement();
    const one = addOrThrow(fresh, 12, 'a');
    const two = addOrThrow(one.arrangement, 12.0006, 'b');
    expect(times(two.arrangement)).toEqual([12, 12.001]);
    expect(one.marker.id).not.toBe(two.marker.id);
  });
});

describe('duplicates (MK2)', () => {
  it('refuses a second marker on the same ms and returns the existing one', () => {
    const first = addOrThrow(freshArrangement(), 12, 'Intro');
    const again = addMarker(first.arrangement, 12.0003, 'Other');
    expect(again.arrangement).toBeNull();
    if (again.arrangement !== null) {
      throw new Error('expected refusal');
    }
    expect(again.existing).toEqual(first.marker);
    expect(markerAtTime(first.arrangement, 12.0003)).toEqual(first.marker);
    expect(markerAtTime(first.arrangement, 12.001)).toBeNull();
  });
});

describe('default names (MK3)', () => {
  it('numbers after the largest Marker N', () => {
    const fresh = freshArrangement();
    expect(MARKER_DEFAULT_NAME_PREFIX).toBe('Marker');
    expect(nextDefaultMarkerName(fresh)).toBe('Marker 1');
    const named = withMarkers(fresh, [
      marker('a', 1, 'Marker 1'),
      marker('b', 2, 'Marker 3'),
      marker('c', 3, 'Intro'),
    ]);
    expect(nextDefaultMarkerName(named)).toBe('Marker 4');
    expect(nextDefaultMarkerName(withMarkers(fresh, [marker('a', 1, 'Marker 07')]))).toBe(
      'Marker 8',
    );
    expect(
      nextDefaultMarkerName(
        withMarkers(fresh, [marker('a', 1, 'Marker 2x'), marker('b', 2, 'marker 9')]),
      ),
    ).toBe('Marker 1');
  });
});

describe('normalizeMarkerName (MK4)', () => {
  it('trims, cuts to 64 code points and falls back on empty', () => {
    expect(MARKER_NAME_MAX_LENGTH).toBe(64);
    expect(normalizeMarkerName('  აქ შედის მუსიკა  ', 'Marker 1')).toBe('აქ შედის მუსიკა');
    const long = 'ა'.repeat(70);
    const cut = normalizeMarkerName(long, 'Marker 1');
    expect(Array.from(cut)).toHaveLength(64);
    expect(cut).toBe('ა'.repeat(64));
    expect(normalizeMarkerName('   ', 'Marker 2')).toBe('Marker 2');
    expect(normalizeMarkerName('', 'Marker 3')).toBe('Marker 3');
    const emoji = '🎬'.repeat(70);
    expect(Array.from(normalizeMarkerName(emoji, 'x'))).toHaveLength(64);
  });

  it('stores the normalized name when adding', () => {
    const added = addOrThrow(freshArrangement(), 4, '   ');
    expect(added.marker.name).toBe('Marker 1');
  });
});

describe('renameMarker (MK5)', () => {
  it('returns the same object for an unknown id or an unchanged name, and a new one otherwise', () => {
    const base = withMarkers(freshArrangement(), [marker('a', 5, 'Intro'), marker('b', 9, 'Drop')]);
    expect(renameMarker(base, 'missing', 'X')).toBe(base);
    expect(renameMarker(base, 'a', 'Intro')).toBe(base);
    expect(renameMarker(base, 'a', '  Intro  ')).toBe(base);
    expect(renameMarker(base, 'a', '   ')).toBe(base);
    const renamed = renameMarker(base, 'a', '  რეკლამა ');
    expect(renamed).not.toBe(base);
    expect(arrangementMarkers(renamed)).toEqual([
      marker('a', 5, 'რეკლამა'),
      marker('b', 9, 'Drop'),
    ]);
    expect(arrangementMarkers(base)[0].name).toBe('Intro');
  });
});

describe('deleteMarker (MK6)', () => {
  it('returns the same object for an unknown id and deletes the key with the last marker', () => {
    const base = withMarkers(freshArrangement(), [marker('a', 5), marker('b', 9)]);
    expect(deleteMarker(base, 'missing')).toBe(base);
    const one = deleteMarker(base, 'a');
    expect(arrangementMarkers(one)).toEqual([marker('b', 9)]);
    const none = deleteMarker(one, 'b');
    expect('markers' in none).toBe(false);
    expect(none.markers).toBeUndefined();
  });
});

describe('adjacentMarkerTarget (MK7)', () => {
  const base = withMarkers(freshArrangement(), [marker('a', 5), marker('b', 12), marker('c', 30)]);
  const cases: Array<[1 | -1, number, number | null, string | null]> = [
    [1, 0, 5, 'a'],
    [1, 5, 12, 'b'],
    [1, 12.0004, 30, 'c'],
    [1, 30, 40, null],
    [-1, 12, 5, 'a'],
    [-1, 5, 0, null],
    [-1, 45, 30, 'c'],
    [-1, 11.9996, 5, 'a'],
    [1, 4.9996, 12, 'b'],
  ];
  it.each(cases)('direction %i from %f', (direction, from, time, id) => {
    const target = adjacentMarkerTarget(base, from, direction, 40);
    expect(target).not.toBeNull();
    expect(target?.time).toBe(time);
    expect(target?.marker?.id ?? null).toBe(id);
  });

  it('returns null when there is nothing further', () => {
    expect(adjacentMarkerTarget(base, 40, 1, 40)).toBeNull();
    expect(adjacentMarkerTarget(base, 45, 1, 40)).toBeNull();
    expect(adjacentMarkerTarget(base, 39.9996, 1, 40)).toBeNull();
    expect(adjacentMarkerTarget(base, 0, -1, 40)).toBeNull();
    expect(adjacentMarkerTarget(base, 0.0004, -1, 40)).toBeNull();
  });

  it('falls back to the project start and end without markers', () => {
    const empty = freshArrangement();
    expect(adjacentMarkerTarget(empty, 3, 1, 40)).toEqual({ time: 40, marker: null });
    expect(adjacentMarkerTarget(empty, 3, -1, 40)).toEqual({ time: 0, marker: null });
  });
});

describe('remapMarkersAfterDeleteTime (MK8)', () => {
  it('keeps, removes inside, shifts after, and drops a same-ms collision keeping the earlier marker', () => {
    const markers = [
      marker('m2', 2),
      marker('m5', 5),
      marker('m7', 7),
      marker('m10', 10),
      marker('m15', 15),
    ];
    const remapped = remapMarkersAfterDeleteTime(markers, 5, 10);
    expect(remapped).toEqual([marker('m2', 2), marker('m5', 5), marker('m15', 10)]);
    expect(markers.map((entry) => entry.time)).toEqual([2, 5, 7, 10, 15]);
  });

  it('returns an empty list when everything inside is removed', () => {
    expect(remapMarkersAfterDeleteTime([marker('x', 0.5)], 0, 1)).toEqual([]);
  });

  it('keeps a marker exactly at a and rounds the shifted times to ms', () => {
    const remapped = remapMarkersAfterDeleteTime([marker('a', 1), marker('b', 3.3333)], 1, 2.1111);
    expect(remapped).toEqual([marker('a', 1), marker('b', 2.222)]);
  });
});

describe('deleteTime with markers (MK9)', () => {
  it('remaps markers and leaves clips and the loop exactly as without markers', () => {
    const plain = freshArrangement();
    const marked = withMarkers(plain, [
      marker('m2', 2),
      marker('m5', 5),
      marker('m7', 7),
      marker('m10', 10),
      marker('m15', 15),
    ]);
    const expected = deleteTime(plain, 5, 10);
    const actual = deleteTime(marked, 5, 10);
    expect(actual.clips.map(({ id: _id, ...rest }) => rest)).toEqual(
      expected.clips.map(({ id: _id, ...rest }) => rest),
    );
    expect(actual.loop).toEqual(expected.loop);
    expect(actual.markers).toEqual([marker('m2', 2), marker('m5', 5), marker('m15', 10)]);
    expect('markers' in expected).toBe(false);
  });

  it('deletes the key when every marker is removed and returns the input for an empty window', () => {
    const marked = withMarkers(freshArrangement(), [marker('x', 0.5)]);
    const cut = deleteTime(marked, 0, 1);
    expect('markers' in cut).toBe(false);
    expect(deleteTime(marked, 3, 3)).toBe(marked);
  });
});

describe('history covers markers (MK10)', () => {
  it('undo removes an added marker key, redo restores it, and the labels survive', () => {
    const fresh = freshArrangement();
    const added = addOrThrow(fresh, 12, 'Intro');
    let history = commitHistory(createHistory(fresh), added.arrangement, 'Add Marker');
    const renamed = renameMarker(history.present, added.marker.id, 'Drop');
    history = commitHistory(history, renamed, 'Rename Marker');
    const deleted = deleteMarker(history.present, added.marker.id);
    history = commitHistory(history, deleted, 'Delete Marker');
    expect(history.past.map((entry) => entry.label)).toEqual([
      'Add Marker',
      'Rename Marker',
      'Delete Marker',
    ]);
    history = undoHistory(undoHistory(undoHistory(history)));
    expect('markers' in history.present).toBe(false);
    expect(isSameArrangement(history.present, fresh)).toBe(true);
    history = redoHistory(history);
    expect(arrangementMarkers(history.present)).toEqual([added.marker]);
    expect(history.past.at(-1)?.label).toBe('Add Marker');
  });

  it('a rename that changes nothing commits no history entry', () => {
    const added = addOrThrow(freshArrangement(), 12, 'Intro');
    const history = createHistory(added.arrangement);
    expect(
      commitHistory(
        history,
        renameMarker(history.present, added.marker.id, 'Intro'),
        'Rename Marker',
      ),
    ).toBe(history);
  });
});
