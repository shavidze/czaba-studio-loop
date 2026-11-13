import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkspaceSource } from '~/types/arrangement';
import type { AudioStem } from '~/types/audio';
import {
  createPurchasedWorkspaceCollection,
  loadingCollectionStatus,
  type PurchasedStemFetch,
  settledCollectionStatus,
  workspaceCollectionCopy,
} from '../collection';
import { fetchPrecomputedPeaks } from '../precomputed-peaks';
import { findStudioShortcut } from '../shortcuts';

const SECRET_URL = 'https://stems.example.test/middle-east/drums.wav?token=SECRET';

const decodeAudioDataMock = vi.fn<(data: ArrayBuffer) => Promise<AudioBuffer>>();

class FakeDecodeContext {
  decodeAudioData(data: ArrayBuffer) {
    return decodeAudioDataMock(data);
  }
}

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
  }
  get duration() {
    return this.length / this.sampleRate;
  }
  getChannelData() {
    return new Float32Array(this.length);
  }
}

function decodeContext(): BaseAudioContext {
  return new OfflineAudioContext({ numberOfChannels: 2, length: 1, sampleRate: 48000 });
}

function stems(): AudioStem[] {
  return [
    { id: 'bass', name: 'Bass', audioUrl: 'https://stems.example.test/bass?token=B', order: 2 },
    { id: 'drums', name: 'Drums', audioUrl: SECRET_URL, order: 1 },
    { id: 'pad', name: 'Pad', audioUrl: 'https://stems.example.test/pad?token=P', order: 2 },
    { id: 'lead', name: 'Lead', audioUrl: 'https://stems.example.test/lead?token=L', order: 0 },
  ];
}

function sourceOf(sources: WorkspaceSource[], id: string): WorkspaceSource {
  const source = sources.find((entry) => entry.id === id);
  if (!source) {
    throw new Error(`source ${id} missing`);
  }
  return source;
}

function okResponse(bytes = 8): Response {
  return new Response(new Uint8Array(bytes));
}

describe('SRW-21 stage 1 purchased WorkspaceCollection adapter (D-29z57)', () => {
  beforeEach(() => {
    decodeAudioDataMock.mockReset();
    vi.stubGlobal('OfflineAudioContext', FakeDecodeContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PC1 shape: id, label, origin, no notice, sources sorted by order (stable) with exact titles; later input changes do not reach the collection', async () => {
    const input = stems();
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => okResponse());
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: input,
      fetchAudio,
    });
    expect(collection.id).toBe('purchased-middle-east');
    expect(collection.label).toBe('Middle East · purchased stems');
    expect(collection.origin).toBe('purchased');
    expect('notice' in collection).toBe(false);
    expect(collection.sources).toStrictEqual([
      {
        id: 'lead',
        title: 'Middle East · Lead',
        shortTitle: 'Lead',
        collectionLabel: 'Middle East · purchased stems',
        kind: 'stem',
        origin: 'purchased',
      },
      {
        id: 'drums',
        title: 'Middle East · Drums',
        shortTitle: 'Drums',
        collectionLabel: 'Middle East · purchased stems',
        kind: 'stem',
        origin: 'purchased',
      },
      {
        id: 'bass',
        title: 'Middle East · Bass',
        shortTitle: 'Bass',
        collectionLabel: 'Middle East · purchased stems',
        kind: 'stem',
        origin: 'purchased',
      },
      {
        id: 'pad',
        title: 'Middle East · Pad',
        shortTitle: 'Pad',
        collectionLabel: 'Middle East · purchased stems',
        kind: 'stem',
        origin: 'purchased',
      },
    ]);

    input[1].audioUrl = 'https://evil.example.test/changed';
    input.push({ id: 'late', name: 'Late', audioUrl: 'https://late.example.test', order: -1 });
    input.reverse();
    expect(collection.sources.map((source) => source.id)).toEqual(['lead', 'drums', 'bass', 'pad']);

    decodeAudioDataMock.mockResolvedValue(
      new AudioBuffer({ length: 10, numberOfChannels: 1, sampleRate: 10 }),
    );
    const controller = new AbortController();
    await collection.loadSource(
      sourceOf(collection.sources, 'drums'),
      decodeContext(),
      controller.signal,
    );
    expect(fetchAudio).toHaveBeenCalledTimes(1);
    expect(fetchAudio.mock.calls[0]?.[0]).toBe(SECRET_URL);
  });

  it('PC2 validation: an empty stems array, a duplicate stem id and an empty productId each throw', () => {
    expect(() =>
      createPurchasedWorkspaceCollection({ productId: 'p', productTitle: 'P', stems: [] }),
    ).toThrow('The purchased collection has no stems');
    expect(() =>
      createPurchasedWorkspaceCollection({
        productId: 'p',
        productTitle: 'P',
        stems: [
          { id: 'same', name: 'A', audioUrl: 'https://a.test', order: 0 },
          { id: 'same', name: 'B', audioUrl: 'https://b.test', order: 1 },
        ],
      }),
    ).toThrow('A stem id repeats in the purchased collection');
    expect(() =>
      createPurchasedWorkspaceCollection({ productId: '', productTitle: 'P', stems: stems() }),
    ).toThrow('The purchased collection has no productId');
  });

  it('PC3 request: fetchAudio is called once with the stem URL and exactly { credentials: "omit", signal } (no headers, no method)', async () => {
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => okResponse());
    decodeAudioDataMock.mockResolvedValue(
      new AudioBuffer({ length: 10, numberOfChannels: 1, sampleRate: 10 }),
    );
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
      fetchAudio,
    });
    const controller = new AbortController();
    await collection.loadSource(
      sourceOf(collection.sources, 'drums'),
      decodeContext(),
      controller.signal,
    );
    expect(fetchAudio).toHaveBeenCalledTimes(1);
    const [url, init] = fetchAudio.mock.calls[0] ?? [];
    expect(url).toBe(SECRET_URL);
    expect(init).toStrictEqual({ credentials: 'omit', signal: controller.signal });
    expect(init?.signal).toBe(controller.signal);
    expect(Object.keys(init ?? {}).sort()).toEqual(['credentials', 'signal']);
  });

  it('PC3 the default fetchAudio uses the global fetch at call time, not at module load', async () => {
    const globalFetch = vi.fn<typeof fetch>(async () => okResponse());
    decodeAudioDataMock.mockResolvedValue(
      new AudioBuffer({ length: 10, numberOfChannels: 1, sampleRate: 10 }),
    );
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
    });
    vi.stubGlobal('fetch', globalFetch);
    const controller = new AbortController();
    await collection.loadSource(
      sourceOf(collection.sources, 'drums'),
      decodeContext(),
      controller.signal,
    );
    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch.mock.calls[0]?.[0]).toBe(SECRET_URL);
    expect(globalFetch.mock.calls[0]?.[1]).toStrictEqual({
      credentials: 'omit',
      signal: controller.signal,
    });
  });

  it('PC4 decode: resolves to the decodeAudioData result, called with the response ArrayBuffer', async () => {
    const decoded = new AudioBuffer({ length: 48, numberOfChannels: 2, sampleRate: 48 });
    decodeAudioDataMock.mockResolvedValue(decoded);
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => okResponse(16));
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
      fetchAudio,
    });
    const result = await collection.loadSource(
      sourceOf(collection.sources, 'bass'),
      decodeContext(),
      new AbortController().signal,
    );
    expect(result).toBe(decoded);
    expect(decodeAudioDataMock).toHaveBeenCalledTimes(1);
    const data = decodeAudioDataMock.mock.calls[0]?.[0];
    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(data?.byteLength).toBe(16);
  });

  it.each([
    401, 403, 404, 500,
  ])('PC5 HTTP %i rejects with the status only; the message never contains the URL or the token', async (status) => {
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => new Response(null, { status }));
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
      fetchAudio,
    });
    const error = await collection
      .loadSource(
        sourceOf(collection.sources, 'drums'),
        decodeContext(),
        new AbortController().signal,
      )
      .then(
        () => null,
        (reason: unknown) => reason,
      );
    expect(error).toBeInstanceOf(Error);
    const message = error instanceof Error ? error.message : '';
    expect(message).toBe(`File failed to load (${status})`);
    expect(message).not.toContain(SECRET_URL);
    expect(message).not.toContain('stems.example.test');
    expect(message).not.toContain('token');
    expect(message).not.toContain('SECRET');
    expect(decodeAudioDataMock).not.toHaveBeenCalled();
  });

  it('PC6 network: a non-aborted rejection becomes the network text; with an aborted signal the original error is rethrown', async () => {
    const networkError = new TypeError(`Failed to fetch ${SECRET_URL}`);
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => {
      throw networkError;
    });
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
      fetchAudio,
    });
    const source = sourceOf(collection.sources, 'drums');
    const live = await collection
      .loadSource(source, decodeContext(), new AbortController().signal)
      .then(
        () => null,
        (reason: unknown) => reason,
      );
    expect(live).toBeInstanceOf(Error);
    expect(live instanceof Error ? live.message : '').toBe('File failed to load (network)');
    expect(live).not.toBe(networkError);

    const controller = new AbortController();
    controller.abort();
    const aborted = await collection.loadSource(source, decodeContext(), controller.signal).then(
      () => null,
      (reason: unknown) => reason,
    );
    expect(aborted).toBe(networkError);
  });

  it('PC7 decode error: a decodeAudioData rejection becomes exactly the decode text', async () => {
    decodeAudioDataMock.mockRejectedValue(new Error(`EncodingError ${SECRET_URL}`));
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => okResponse());
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
      fetchAudio,
    });
    await expect(
      collection.loadSource(
        sourceOf(collection.sources, 'drums'),
        decodeContext(),
        new AbortController().signal,
      ),
    ).rejects.toThrow(/^File could not be decoded$/);
  });

  it('PC8 unknown source id rejects with Unknown source and never calls fetchAudio', async () => {
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => okResponse());
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
      fetchAudio,
    });
    const stranger: WorkspaceSource = {
      id: 'demo-middle-east',
      title: 'Stranger',
      collectionLabel: 'x',
      kind: 'stem',
      origin: 'purchased',
    };
    await expect(
      collection.loadSource(stranger, decodeContext(), new AbortController().signal),
    ).rejects.toThrow(/^Unknown source$/);
    expect(fetchAudio).not.toHaveBeenCalled();
  });

  it('PC10 body read failure: a non-aborted arrayBuffer rejection becomes the network text without the URL; when aborted the original error is rethrown and decode never runs', async () => {
    const bodyError = new TypeError(`body stream failed ${SECRET_URL}`);
    const brokenBody = () => {
      const response = new Response(new Uint8Array(8));
      vi.spyOn(response, 'arrayBuffer').mockRejectedValue(bodyError);
      return response;
    };
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => brokenBody());
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
      fetchAudio,
    });
    const source = sourceOf(collection.sources, 'drums');
    const live = await collection
      .loadSource(source, decodeContext(), new AbortController().signal)
      .then(
        () => null,
        (reason: unknown) => reason,
      );
    expect(live).toBeInstanceOf(Error);
    const message = live instanceof Error ? live.message : '';
    expect(message).toBe('File failed to load (network)');
    expect(message).not.toContain('SECRET');
    expect(message).not.toContain('stems.example.test');

    const controller = new AbortController();
    fetchAudio.mockImplementationOnce(async () => {
      controller.abort();
      return brokenBody();
    });
    const aborted = await collection.loadSource(source, decodeContext(), controller.signal).then(
      () => null,
      (reason: unknown) => reason,
    );
    expect(aborted).toBe(bodyError);
    expect(decodeAudioDataMock).not.toHaveBeenCalled();
  });

  it('PC9 copy: demo returns the published demo texts; purchased returns the purchased texts', () => {
    const demo = workspaceCollectionCopy('demo');
    expect({ ...demo, failed: demo.failed(2) }).toStrictEqual({
      heading: 'CZABA Studio',
      badge: 'Demo collection — no sign-in required',
      loading: 'Loading the demo collection…',
      ready:
        'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.',
      empty: 'The demo collection has no sounds — the library is empty.',
      failed: '2 sounds in the demo collection failed to load — details are in the library.',
      fileStem: 'czaba-studio-lab',
    });
    expect(demo.failed(1)).toBe(
      '1 sound in the demo collection failed to load — details are in the library.',
    );
    const purchased = workspaceCollectionCopy('purchased');
    expect({ ...purchased, failed: purchased.failed(2) }).toStrictEqual({
      heading: 'CZABA Studio',
      badge: 'Purchased collection',
      loading: 'Loading the purchased collection…',
      ready:
        'Purchased collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.',
      empty: 'The purchased collection has no sounds — the library is empty.',
      failed: '2 sounds in the purchased collection failed to load — details are in the library.',
      fileStem: 'czaba-studio',
    });
    expect(purchased.failed(1)).toBe(
      '1 sound in the purchased collection failed to load — details are in the library.',
    );
    expect(demo.loading.codePointAt(demo.loading.length - 1)).toBe(0x2026);
    expect(demo.ready).toContain('press Enter to add it. Press ? for shortcuts.');
  });

  it('PC10 copy: both ready texts teach drag and Enter and end with the shortcut-sheet key', () => {
    const sheetKey = findStudioShortcut('shortcuts')?.keys[0];
    if (!sheetKey) {
      throw new Error('the shortcut sheet row is missing');
    }
    const origins: Array<Parameters<typeof workspaceCollectionCopy>[0]> = ['demo', 'purchased'];
    for (const origin of origins) {
      const { ready } = workspaceCollectionCopy(origin);
      expect(ready.endsWith(`Press ${sheetKey} for shortcuts.`)).toBe(true);
      expect(ready).toContain('Drag a sound onto a track');
      expect(ready).toContain('press Enter to add it');
      expect(ready).not.toContain('(Enter or Add)');
    }
  });
});

describe('SABA-B-11a-FIX-2 settledCollectionStatus', () => {
  const demo = workspaceCollectionCopy('demo');
  const purchased = workspaceCollectionCopy('purchased');
  it('CR1 the bare loading text becomes ready, or failed(n) when sources failed', () => {
    expect(settledCollectionStatus(demo.loading, demo, 0)).toBe(demo.ready);
    expect(settledCollectionStatus(demo.loading, demo, 1)).toBe(demo.failed(1));
    expect(settledCollectionStatus(purchased.loading, purchased, 2)).toBe(purchased.failed(2));
  });
  it('CR2 a loading prefix is swapped and the rest is kept', () => {
    expect(settledCollectionStatus(`${demo.loading} Tempo 90.`, demo, 0)).toBe(
      `${demo.ready} Tempo 90.`,
    );
    expect(settledCollectionStatus(`${demo.loading} Tempo 90.`, demo, 1)).toBe(
      `${demo.failed(1)} Tempo 90.`,
    );
  });
  it('CR3 any other status is kept when all sources loaded, and is replaced by failed(n) otherwise', () => {
    expect(settledCollectionStatus('Clip added.', demo, 0)).toBe('Clip added.');
    expect(settledCollectionStatus('Clip added.', demo, 1)).toBe(demo.failed(1));
    expect(settledCollectionStatus(`${demo.loading}x`, demo, 0)).toBe(`${demo.loading}x`);
  });
});

describe('SABA-B-11a-FIX-2 loadingCollectionStatus', () => {
  const demo = workspaceCollectionCopy('demo');
  const purchased = workspaceCollectionCopy('purchased');
  it('CR4 a status that already starts with this loading text is kept; anything else becomes loading', () => {
    expect(loadingCollectionStatus(demo.loading, demo)).toBe(demo.loading);
    expect(loadingCollectionStatus(`${demo.loading} Tempo 90.`, demo)).toBe(
      `${demo.loading} Tempo 90.`,
    );
    expect(loadingCollectionStatus(demo.ready, demo)).toBe(demo.loading);
    expect(loadingCollectionStatus(`${demo.loading} Tempo 90.`, purchased)).toBe(purchased.loading);
    expect(loadingCollectionStatus('Clip added.', demo)).toBe(demo.loading);
  });
});

describe('PERF-13c-ii-b purchased adapter previewUrl (D-29z1352)', () => {
  it('PV1 previewUrl returns the stem URL of each known source without fetching, and null for an unknown source', () => {
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => okResponse());
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: stems(),
      fetchAudio,
    });
    expect(typeof collection.previewUrl).toBe('function');
    expect(collection.sources.map((source) => collection.previewUrl?.(source))).toEqual([
      'https://stems.example.test/lead?token=L',
      SECRET_URL,
      'https://stems.example.test/bass?token=B',
      'https://stems.example.test/pad?token=P',
    ]);
    const unknown: WorkspaceSource = {
      id: 'unknown',
      title: 'Middle East · Unknown',
      collectionLabel: 'Middle East · purchased stems',
      kind: 'stem',
      origin: 'purchased',
    };
    expect(collection.previewUrl?.(unknown)).toBeNull();
    expect(fetchAudio).not.toHaveBeenCalled();
  });

  it('PV2 previewUrl is stable: repeated calls return the same string and later input changes do not reach it', () => {
    const input = stems();
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: input,
    });
    const drums = sourceOf(collection.sources, 'drums');
    const first = collection.previewUrl?.(drums);
    input[1].audioUrl = 'https://evil.example.test/changed';
    expect(first).toBe(SECRET_URL);
    expect(collection.previewUrl?.(drums)).toBe(first);
  });
});

describe('PERF-15b-ii purchased adapter peaksUrl and fetchPeaks (D-29z1434)', () => {
  const PEAKS_SECRET = 'https://stems.example.test/middle-east/drums.peaks.json?token=SECRET';

  function peaksStems(): AudioStem[] {
    const input = stems();
    input[1].peaksUrl = PEAKS_SECRET;
    input[0].peaksUrl = '';
    return input;
  }

  function peaksBody() {
    return {
      version: 2,
      channels: 1,
      sample_rate: 48000,
      samples_per_pixel: 480,
      bits: 16,
      length: 1,
      data: [-16384, 0],
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('PK1 peaksUrl returns a stem peaks URL only when the stem has a non-empty one, null otherwise; nothing is fetched and later input changes do not reach it', () => {
    const input = peaksStems();
    const fetchAudio = vi.fn<PurchasedStemFetch>(async () => okResponse());
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: input,
      fetchAudio,
    });
    expect(collection.sources.map((source) => collection.peaksUrl?.(source) ?? null)).toEqual([
      null,
      PEAKS_SECRET,
      null,
      null,
    ]);
    const unknown: WorkspaceSource = {
      id: 'unknown',
      title: 'Middle East · Unknown',
      collectionLabel: 'Middle East · purchased stems',
      kind: 'stem',
      origin: 'purchased',
    };
    expect(collection.peaksUrl?.(unknown)).toBeNull();
    input[1].peaksUrl = 'https://evil.example.test/changed.json';
    expect(collection.peaksUrl?.(sourceOf(collection.sources, 'drums'))).toBe(PEAKS_SECRET);
    expect(fetchAudio).not.toHaveBeenCalled();
  });

  it('PK4 a peaks URL on another origin than its stem audio, one that does not parse, or an empty one beside a relative audio URL is dropped; a relative URL beside a relative audio URL is kept', () => {
    const input = stems();
    input.push({
      id: 'fx',
      name: 'FX',
      audioUrl: 'https://stems.example.test/fx?token=F',
      peaksUrl: 'https://other.example.test/fx.peaks.json',
      order: 3,
    });
    const byId = (id: string): AudioStem => {
      const stem = input.find((entry) => entry.id === id);
      if (!stem) {
        throw new Error(`stem ${id} missing`);
      }
      return stem;
    };
    byId('lead').peaksUrl = 'http://[bad';
    byId('drums').audioUrl = '/api/stems/drums.mp3';
    byId('drums').peaksUrl = '';
    byId('bass').audioUrl = '/api/stems/bass.mp3';
    byId('bass').peaksUrl = '/api/stems/bass.peaks.json';
    byId('pad').peaksUrl = 'https://stems.example.test/pad.peaks.json';
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: input,
    });
    const peaksOf = (id: string) => collection.peaksUrl?.(sourceOf(collection.sources, id)) ?? null;
    expect(peaksOf('fx')).toBeNull();
    expect(peaksOf('lead')).toBeNull();
    expect(peaksOf('drums')).toBeNull();
    expect(peaksOf('bass')).toBe('/api/stems/bass.peaks.json');
    expect(peaksOf('pad')).toBe('https://stems.example.test/pad.peaks.json');
  });

  it('PK2 the peaks request goes through the injected fetchAudio, so a bearer header it adds is kept; credentials stay omit and the global fetch is not used', async () => {
    const globalFetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>();
    vi.stubGlobal('fetch', globalFetch);
    const seen: { url: string; init: RequestInit }[] = [];
    const fetchAudio: PurchasedStemFetch = async (url, init) => {
      const headers = new Headers(init.headers);
      headers.set('Authorization', 'Bearer TOKEN');
      seen.push({ url, init: { ...init, headers } });
      return new Response(JSON.stringify(peaksBody()), { status: 200 });
    };
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: peaksStems(),
      fetchAudio,
    });
    const drums = sourceOf(collection.sources, 'drums');
    const url = collection.peaksUrl?.(drums) ?? '';
    const parsed = await fetchPrecomputedPeaks(
      url,
      new AbortController().signal,
      collection.fetchPeaks,
    );
    expect(parsed?.bits).toBe(16);
    expect(seen).toHaveLength(1);
    expect(seen[0].url).toBe(PEAKS_SECRET);
    expect(seen[0].init.credentials).toBe('omit');
    expect(new Headers(seen[0].init.headers).get('Authorization')).toBe('Bearer TOKEN');
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it('PK3 without fetchAudio, fetchPeaks uses the global fetch at call time', async () => {
    const collection = createPurchasedWorkspaceCollection({
      productId: 'middle-east',
      productTitle: 'Middle East',
      stems: peaksStems(),
    });
    const globalFetch = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(
      async () => new Response(JSON.stringify(peaksBody()), { status: 200 }),
    );
    vi.stubGlobal('fetch', globalFetch);
    const parsed = await fetchPrecomputedPeaks(
      PEAKS_SECRET,
      new AbortController().signal,
      collection.fetchPeaks,
    );
    expect(parsed?.bits).toBe(16);
    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch.mock.calls[0][0]).toBe(PEAKS_SECRET);
  });
});
