import type { WorkspaceCollection, WorkspaceOrigin, WorkspaceSource } from '~/types/arrangement';
import type { AudioStem } from '~/types/audio';
import { fetchAndDecodeSource, type SourceFetch } from './source-fetch';
import { studioSourceLoadStrings } from './strings';

export interface WorkspaceCollectionCopy {
  heading: string;
  badge: string;
  loading: string;
  ready: string;
  empty: string;
  failed: (count: number) => string;
  fileStem: string;
}

const demoWorkspaceCollectionCopy: WorkspaceCollectionCopy = {
  heading: 'CZABA Studio',
  badge: 'Demo collection — no sign-in required',
  loading: 'Loading the demo collection…',
  ready:
    'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.',
  empty: 'The demo collection has no sounds — the library is empty.',
  failed: (count) =>
    count === 1
      ? '1 sound in the demo collection failed to load — details are in the library.'
      : `${count} sounds in the demo collection failed to load — details are in the library.`,
  fileStem: 'czaba-studio-lab',
};

const purchasedWorkspaceCollectionCopy: WorkspaceCollectionCopy = {
  heading: 'CZABA Studio',
  badge: 'Purchased collection',
  loading: 'Loading the purchased collection…',
  ready:
    'Purchased collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.',
  empty: 'The purchased collection has no sounds — the library is empty.',
  failed: (count) =>
    count === 1
      ? '1 sound in the purchased collection failed to load — details are in the library.'
      : `${count} sounds in the purchased collection failed to load — details are in the library.`,
  fileStem: 'czaba-studio',
};

export function loadingCollectionStatus(current: string, copy: WorkspaceCollectionCopy): string {
  return current === copy.loading || current.startsWith(`${copy.loading} `)
    ? current
    : copy.loading;
}

export function settledCollectionStatus(
  current: string,
  copy: WorkspaceCollectionCopy,
  failed: number,
): string {
  const settled = failed === 0 ? copy.ready : copy.failed(failed);
  if (current === copy.loading) {
    return settled;
  }
  const loadingPrefix = `${copy.loading} `;
  if (current.startsWith(loadingPrefix)) {
    return `${settled} ${current.slice(loadingPrefix.length)}`;
  }
  return failed === 0 ? current : settled;
}

export function workspaceCollectionCopy(origin: WorkspaceOrigin): WorkspaceCollectionCopy {
  return origin === 'purchased' ? purchasedWorkspaceCollectionCopy : demoWorkspaceCollectionCopy;
}

export type PurchasedStemFetch = SourceFetch;

export interface PurchasedWorkspaceCollectionInput {
  productId: string;
  productTitle: string;
  stems: readonly AudioStem[];
  fetchAudio?: PurchasedStemFetch;
}

const URL_BASE = 'https://base.invalid';

function sameOrigin(candidate: string, reference: string): boolean {
  if (candidate.length === 0) {
    return false;
  }
  try {
    return new URL(candidate, URL_BASE).origin === new URL(reference, URL_BASE).origin;
  } catch {
    return false;
  }
}

export function createPurchasedWorkspaceCollection({
  productId,
  productTitle,
  stems,
  fetchAudio = (url, init) => fetch(url, init),
}: PurchasedWorkspaceCollectionInput): WorkspaceCollection {
  if (productId.length === 0) {
    throw new Error(studioSourceLoadStrings.purchasedNoProductId);
  }
  if (stems.length === 0) {
    throw new Error(studioSourceLoadStrings.purchasedNoStems);
  }
  const sortedStems = [...stems].sort((first, second) => first.order - second.order);
  const stemUrls = new Map<string, string>();
  const stemPeaksUrls = new Map<string, string>();
  for (const stem of sortedStems) {
    if (stemUrls.has(stem.id)) {
      throw new Error(studioSourceLoadStrings.purchasedDuplicateStemId);
    }
    stemUrls.set(stem.id, stem.audioUrl);
    if (stem.peaksUrl !== undefined && sameOrigin(stem.peaksUrl, stem.audioUrl)) {
      stemPeaksUrls.set(stem.id, stem.peaksUrl);
    }
  }
  const label = studioSourceLoadStrings.purchasedCollectionLabel(productTitle);
  const sources: WorkspaceSource[] = sortedStems.map((stem) => ({
    id: stem.id,
    title: `${productTitle} · ${stem.name}`,
    shortTitle: stem.name,
    collectionLabel: label,
    kind: 'stem',
    origin: 'purchased',
  }));

  const loadSource = async (
    source: WorkspaceSource,
    ctx: BaseAudioContext,
    signal: AbortSignal,
  ): Promise<AudioBuffer> => {
    const url = stemUrls.get(source.id);
    if (url === undefined) {
      throw new Error(studioSourceLoadStrings.unknownSource);
    }
    return fetchAndDecodeSource(url, ctx, signal, fetchAudio);
  };

  return {
    id: `purchased-${productId}`,
    label,
    origin: 'purchased',
    sources,
    loadSource,
    previewUrl: (source) => stemUrls.get(source.id) ?? null,
    peaksUrl: (source) => stemPeaksUrls.get(source.id) ?? null,
    fetchPeaks: fetchAudio,
  };
}
