import type { WorkspaceCollection, WorkspaceOrigin, WorkspaceSource } from '~/types/arrangement';
import type { AudioStem } from '~/types/audio';
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
  heading: 'CZABA Studio Lab',
  badge: 'დემო კოლექცია — ავტორიზაცია არ სჭირდება',
  loading: 'დემო კოლექცია იტვირთება…',
  ready: 'დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).',
  empty: 'დემო კოლექციაში წყარო არ არის — ბიბლიოთეკა ცარიელია.',
  failed: (count) => `დემო კოლექციიდან ${count} წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`,
  fileStem: 'czaba-studio-lab',
};

const purchasedWorkspaceCollectionCopy: WorkspaceCollectionCopy = {
  heading: 'CZABA Studio',
  badge: 'შეძენილი კოლექცია',
  loading: 'შეძენილი კოლექცია იტვირთება…',
  ready: 'შეძენილი კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).',
  empty: 'შეძენილ კოლექციაში წყარო არ არის — ბიბლიოთეკა ცარიელია.',
  failed: (count) => `შეძენილი კოლექციიდან ${count} წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`,
  fileStem: 'czaba-studio',
};

export function workspaceCollectionCopy(origin: WorkspaceOrigin): WorkspaceCollectionCopy {
  return origin === 'purchased' ? purchasedWorkspaceCollectionCopy : demoWorkspaceCollectionCopy;
}

export type PurchasedStemFetch = (url: string, init: RequestInit) => Promise<Response>;

export interface PurchasedWorkspaceCollectionInput {
  productId: string;
  productTitle: string;
  stems: readonly AudioStem[];
  fetchAudio?: PurchasedStemFetch;
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
  for (const stem of sortedStems) {
    if (stemUrls.has(stem.id)) {
      throw new Error(studioSourceLoadStrings.purchasedDuplicateStemId);
    }
    stemUrls.set(stem.id, stem.audioUrl);
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
    let response: Response;
    try {
      response = await fetchAudio(url, { credentials: 'omit', signal });
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      throw new Error(studioSourceLoadStrings.networkFailed);
    }
    if (!response.ok) {
      throw new Error(studioSourceLoadStrings.httpFailed(response.status));
    }
    let audioData: ArrayBuffer;
    try {
      audioData = await response.arrayBuffer();
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      throw new Error(studioSourceLoadStrings.networkFailed);
    }
    try {
      return await ctx.decodeAudioData(audioData);
    } catch {
      throw new Error(studioSourceLoadStrings.decodeFailed);
    }
  };

  return {
    id: `purchased-${productId}`,
    label,
    origin: 'purchased',
    sources,
    loadSource,
  };
}
