import type { Arrangement, ArrangementTrack, ArrangementTrackGroup } from '~/types/arrangement';

export const TRACK_GROUP_NAME_PREFIX = 'ჯგუფი';
export const TRACK_GROUP_NAME_MAX_LENGTH = 64;
export const TRACK_GROUP_INDENT_PX = 12;

const NO_TRACK_GROUPS: readonly ArrangementTrackGroup[] = [];

export type TrackGroupRow =
  | {
      kind: 'track';
      id: string;
      name: string;
      depth: number;
      parentId: string | null;
      track: ArrangementTrack;
    }
  | {
      kind: 'group';
      id: string;
      name: string;
      depth: number;
      parentId: string | null;
      group: ArrangementTrackGroup;
    };

export type GroupTracksRefusal = 'empty' | 'unknown' | 'video' | 'mixed-parents' | 'gap';

export type GroupSelectedRowsResult =
  | {
      kind: 'grouped';
      arrangement: Arrangement;
      group: ArrangementTrackGroup;
      memberNames: string[];
    }
  | { kind: 'refused'; reason: GroupTracksRefusal };

export type UngroupSelectedRowsResult =
  | {
      kind: 'ungrouped';
      arrangement: Arrangement;
      dissolved: ArrangementTrackGroup[];
      childIds: string[];
    }
  | { kind: 'refused'; reason: 'no-group' };

export function arrangementGroups(arrangement: Arrangement): readonly ArrangementTrackGroup[] {
  return arrangement.groups ?? NO_TRACK_GROUPS;
}

function groupMap(arrangement: Arrangement): Map<string, ArrangementTrackGroup> {
  return new Map(arrangementGroups(arrangement).map((group) => [group.id, group]));
}

function ancestorChain(
  groups: ReadonlyMap<string, ArrangementTrackGroup>,
  groupId: string | null | undefined,
): ArrangementTrackGroup[] {
  const chain: ArrangementTrackGroup[] = [];
  const seen = new Set<string>();
  let cursor = groupId ?? null;
  while (cursor !== null && !seen.has(cursor)) {
    const group = groups.get(cursor);
    if (!group) {
      break;
    }
    seen.add(cursor);
    chain.unshift(group);
    cursor = group.parentId;
  }
  return chain;
}

export function trackGroupRows(arrangement: Arrangement): TrackGroupRow[] {
  const groups = groupMap(arrangement);
  const emitted = new Set<string>();
  const rows: TrackGroupRow[] = [];
  for (const track of arrangement.tracks) {
    const chain = ancestorChain(groups, track.groupId);
    chain.forEach((group, depth) => {
      if (emitted.has(group.id)) {
        return;
      }
      emitted.add(group.id);
      rows.push({
        kind: 'group',
        id: group.id,
        name: group.name,
        depth,
        parentId: depth === 0 ? null : chain[depth - 1].id,
        group,
      });
    });
    rows.push({
      kind: 'track',
      id: track.id,
      name: track.name,
      depth: chain.length,
      parentId: chain.at(-1)?.id ?? null,
      track,
    });
  }
  return rows;
}

export function trackGroupRowCount(arrangement: Arrangement): number {
  return arrangement.groups === undefined
    ? 0
    : trackGroupRows(arrangement).filter((row) => row.kind === 'group').length;
}

export function rowParentId(arrangement: Arrangement, rowId: string): string | null | undefined {
  return trackGroupRows(arrangement).find((row) => row.id === rowId)?.parentId;
}

export function liveTrackSelection(
  arrangement: Arrangement,
  rowIds: readonly string[],
): readonly string[] {
  const live = new Set(trackGroupRows(arrangement).map((row) => row.id));
  const filtered = rowIds.filter((id) => live.has(id));
  return filtered.length === rowIds.length ? rowIds : filtered;
}

export function nextTrackGroupName(arrangement: Arrangement): string {
  const names = new Set(arrangementGroups(arrangement).map((group) => group.name));
  let index = 1;
  while (names.has(`${TRACK_GROUP_NAME_PREFIX} ${index}`)) {
    index += 1;
  }
  return `${TRACK_GROUP_NAME_PREFIX} ${index}`;
}

function withTrackGroups(
  arrangement: Arrangement,
  tracks: ArrangementTrack[],
  groups: ArrangementTrackGroup[],
): Arrangement {
  const { groups: _previousGroups, ...rest } = arrangement;
  return groups.length === 0 ? { ...rest, tracks } : { ...rest, tracks, groups };
}

function trackWithGroup(track: ArrangementTrack, groupId: string | null): ArrangementTrack {
  const { groupId: _previousGroupId, ...rest } = track;
  return groupId === null ? rest : { ...rest, groupId };
}

export function groupSelectedRows(
  arrangement: Arrangement,
  rowIds: readonly string[],
  groupId: string = crypto.randomUUID(),
): GroupSelectedRowsResult {
  const selected = new Set(rowIds);
  if (selected.size === 0) {
    return { kind: 'refused', reason: 'empty' };
  }
  const rows = trackGroupRows(arrangement);
  const picked = rows.filter((row) => selected.has(row.id));
  if (picked.length !== selected.size) {
    return { kind: 'refused', reason: 'unknown' };
  }
  if (picked.some((row) => row.kind === 'track' && row.track.kind === 'video')) {
    return { kind: 'refused', reason: 'video' };
  }
  const parentId = picked[0].parentId;
  if (picked.some((row) => row.parentId !== parentId)) {
    return { kind: 'refused', reason: 'mixed-parents' };
  }
  const siblings = rows.filter((row) => row.parentId === parentId);
  const indices = picked.map((row) => siblings.indexOf(row));
  if (Math.max(...indices) - Math.min(...indices) + 1 !== picked.length) {
    return { kind: 'refused', reason: 'gap' };
  }
  const group: ArrangementTrackGroup = {
    id: groupId,
    name: nextTrackGroupName(arrangement),
    parentId,
  };
  const tracks = arrangement.tracks.map((track) =>
    selected.has(track.id) ? trackWithGroup(track, group.id) : track,
  );
  const groups = [
    ...arrangementGroups(arrangement).map((entry) =>
      selected.has(entry.id) ? { ...entry, parentId: group.id } : entry,
    ),
    group,
  ];
  return {
    kind: 'grouped',
    arrangement: withTrackGroups(arrangement, tracks, groups),
    group,
    memberNames: picked.map((row) => row.name),
  };
}

export function ungroupSelectedRows(
  arrangement: Arrangement,
  rowIds: readonly string[],
): UngroupSelectedRowsResult {
  const selected = new Set(rowIds);
  const rows = trackGroupRows(arrangement);
  const derivedParents = new Map(rows.map((row) => [row.id, row.parentId]));
  const dissolved = rows.flatMap((row) =>
    row.kind === 'group' && selected.has(row.id) ? [row.group] : [],
  );
  if (dissolved.length === 0) {
    return { kind: 'refused', reason: 'no-group' };
  }
  const dissolvedIds = new Set(dissolved.map((group) => group.id));
  const survivingParent = (parentId: string | null): string | null => {
    let cursor = parentId;
    const seen = new Set<string>();
    while (cursor !== null && dissolvedIds.has(cursor) && !seen.has(cursor)) {
      seen.add(cursor);
      cursor = derivedParents.get(cursor) ?? null;
    }
    return cursor;
  };
  const tracks = arrangement.tracks.map((track) => {
    const parentId = derivedParents.get(track.id) ?? null;
    return parentId !== null && dissolvedIds.has(parentId)
      ? trackWithGroup(track, survivingParent(parentId))
      : track;
  });
  const remaining = arrangementGroups(arrangement)
    .filter((group) => !dissolvedIds.has(group.id))
    .map((group) => {
      const parentId = derivedParents.get(group.id);
      return parentId !== undefined && parentId !== null && dissolvedIds.has(parentId)
        ? { ...group, parentId: survivingParent(parentId) }
        : group;
    });
  const childIds = rows
    .filter(
      (row) => !dissolvedIds.has(row.id) && row.parentId !== null && dissolvedIds.has(row.parentId),
    )
    .map((row) => row.id);
  return {
    kind: 'ungrouped',
    arrangement: withTrackGroups(arrangement, tracks, remaining),
    dissolved,
    childIds,
  };
}

export function normalizeTrackGroupName(raw: string): string {
  return Array.from(raw.trim()).slice(0, TRACK_GROUP_NAME_MAX_LENGTH).join('').trimEnd();
}

export function renameTrackGroup(
  arrangement: Arrangement,
  groupId: string,
  raw: string,
): Arrangement {
  const name = normalizeTrackGroupName(raw);
  const current = arrangementGroups(arrangement).find((group) => group.id === groupId);
  if (!current || name.length === 0 || name === current.name) {
    return arrangement;
  }
  return {
    ...arrangement,
    groups: arrangementGroups(arrangement).map((group) =>
      group.id === groupId ? { ...group, name } : group,
    ),
  };
}

export function expandShiftSelection(
  arrangement: Arrangement,
  anchorId: string | null,
  targetId: string,
): string[] {
  const rows = trackGroupRows(arrangement);
  const anchor = rows.find((row) => row.id === anchorId);
  const target = rows.find((row) => row.id === targetId);
  if (!target) {
    return [];
  }
  if (!anchor || anchor.parentId !== target.parentId) {
    return [target.id];
  }
  const siblings = rows.filter((row) => row.parentId === target.parentId);
  const from = siblings.indexOf(anchor);
  const to = siblings.indexOf(target);
  return siblings.slice(Math.min(from, to), Math.max(from, to) + 1).map((row) => row.id);
}

const GROUP_TRACKS_REFUSAL_MESSAGES: Record<GroupTracksRefusal | 'no-group', string> = {
  empty: 'დასაჯგუფებლად ჯერ მონიშნე ხაზები — Ctrl+click ან Shift+click ხაზის სახელზე.',
  unknown: 'მონიშნული ხაზი აღარ არსებობს — მონიშნე ხელახლა.',
  video: 'ვიდეო ხაზი ჯგუფში ვერ შევა.',
  'mixed-parents': 'ერთად ჯგუფდება მხოლოდ ერთი დონის ხაზები — მონიშნულები სხვადასხვა ჯგუფშია.',
  gap: 'ერთად ჯგუფდება მხოლოდ მეზობელი ხაზები — მონიშვნაში გამოტოვებული ხაზია.',
  'no-group': 'დასაშლელად მონიშნე ჯგუფი — დააწკაპუნე ჯგუფის სახელზე.',
};

export function trackGroupRefusalMessage(reason: GroupTracksRefusal | 'no-group'): string {
  return GROUP_TRACKS_REFUSAL_MESSAGES[reason];
}

export function trackGroupCreatedMessage(
  groupName: string,
  memberNames: readonly string[],
): string {
  return `ჯგუფი «${groupName}» შეიქმნა: ${memberNames.join(', ')}.`;
}

export function trackGroupDissolvedMessage(groups: readonly ArrangementTrackGroup[]): string {
  const names = groups.map((group) => `«${group.name}»`).join(', ');
  return groups.length === 1 ? `ჯგუფი ${names} დაიშალა.` : `ჯგუფები ${names} დაიშალა.`;
}
