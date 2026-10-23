import type { Arrangement, WorkspaceSource, WorkspaceSourceKind } from '~/types/arrangement';

export const LIBRARY_ALL_NODE_ID = 'all';
export const LIBRARY_DRAG_MIME = 'application/x-czaba-workspace-source';
export const LIBRARY_PLACEMENT_EPS = 1e-4;

export const LIBRARY_KIND_LABELS: Record<WorkspaceSourceKind, string> = {
  music: 'მუსიკა',
  stem: 'სტემი',
  sfx: 'SFX',
};

export const LIBRARY_FOLDER_LABELS: Record<WorkspaceSourceKind, string> = {
  music: 'მუსიკა',
  stem: 'სტემები',
  sfx: 'SFX',
};

const LIBRARY_FOLDER_ORDER: readonly WorkspaceSourceKind[] = ['music', 'stem', 'sfx'];

export interface LibraryFolderNode {
  id: string;
  collectionLabel: string;
  kind: WorkspaceSourceKind;
  label: string;
  count: number;
}

export interface LibraryCollectionNode {
  id: string;
  label: string;
  count: number;
  folders: LibraryFolderNode[];
}

export interface LibraryTree {
  total: number;
  collections: LibraryCollectionNode[];
}

export interface LibraryNodeSelection {
  collectionLabel: string | null;
  kind: WorkspaceSourceKind | null;
}

export interface LibraryDropTimeParams {
  clientX: number;
  laneLeft: number;
  pxPerSecond: number;
}

export interface LibraryPlacementParams {
  trackId: string;
  start: number;
  duration: number;
}

export function libraryCollectionNodeId(collectionLabel: string): string {
  return `collection:${collectionLabel}`;
}

export function libraryFolderNodeId(collectionLabel: string, kind: WorkspaceSourceKind): string {
  return `folder:${kind}:${collectionLabel}`;
}

export function buildLibraryTree(sources: readonly WorkspaceSource[]): LibraryTree {
  const labels = [...new Set(sources.map((source) => source.collectionLabel))];
  return {
    total: sources.length,
    collections: labels.map((label) => {
      const members = sources.filter((source) => source.collectionLabel === label);
      return {
        id: libraryCollectionNodeId(label),
        label,
        count: members.length,
        folders: LIBRARY_FOLDER_ORDER.map((kind) => ({
          id: libraryFolderNodeId(label, kind),
          collectionLabel: label,
          kind,
          label: LIBRARY_FOLDER_LABELS[kind],
          count: members.filter((source) => source.kind === kind).length,
        })).filter((folder) => folder.count > 0),
      };
    }),
  };
}

export function resolveLibraryNode(tree: LibraryTree, nodeId: string): LibraryNodeSelection {
  for (const collection of tree.collections) {
    if (collection.id === nodeId) {
      return { collectionLabel: collection.label, kind: null };
    }
    const folder = collection.folders.find((entry) => entry.id === nodeId);
    if (folder) {
      return { collectionLabel: folder.collectionLabel, kind: folder.kind };
    }
  }
  return { collectionLabel: null, kind: null };
}

export function libraryQueryWords(query: string): string[] {
  return query
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

export function matchesLibraryQuery(source: WorkspaceSource, query: string): boolean {
  const words = libraryQueryWords(query);
  if (words.length === 0) {
    return true;
  }
  const haystack = [source.title, LIBRARY_KIND_LABELS[source.kind], source.collectionLabel]
    .join(' ')
    .toLocaleLowerCase();
  return words.every((word) => haystack.includes(word));
}

export function filterLibrarySources(
  sources: readonly WorkspaceSource[],
  node: LibraryNodeSelection,
  query: string,
): WorkspaceSource[] {
  return sources.filter(
    (source) =>
      (node.collectionLabel === null || source.collectionLabel === node.collectionLabel) &&
      (node.kind === null || source.kind === node.kind) &&
      matchesLibraryQuery(source, query),
  );
}

export function moveLibrarySelection(
  ids: readonly string[],
  currentId: string | null,
  delta: 1 | -1,
): string | null {
  if (ids.length === 0) {
    return null;
  }
  const index = currentId === null ? -1 : ids.indexOf(currentId);
  if (index < 0) {
    return delta > 0 ? ids[0] : ids[ids.length - 1];
  }
  return ids[Math.min(ids.length - 1, Math.max(0, index + delta))];
}

export function libraryDropTime(params: LibraryDropTimeParams): number {
  if (!(params.pxPerSecond > 0)) {
    return 0;
  }
  const seconds = (params.clientX - params.laneLeft) / params.pxPerSecond;
  return Math.max(0, Math.round(seconds * 1000) / 1000);
}

export function canPlaceLibraryClip(
  arrangement: Arrangement,
  params: LibraryPlacementParams,
): boolean {
  const track = arrangement.tracks.find((entry) => entry.id === params.trackId);
  if (!track || track.kind !== 'audio' || params.start < 0 || !(params.duration > 0)) {
    return false;
  }
  const end = params.start + params.duration;
  return arrangement.clips
    .filter((clip) => clip.trackId === params.trackId)
    .every(
      (clip) =>
        end <= clip.start + LIBRARY_PLACEMENT_EPS ||
        params.start >= clip.start + clip.duration - LIBRARY_PLACEMENT_EPS,
    );
}
