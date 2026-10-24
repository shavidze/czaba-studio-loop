import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkspaceSource } from '~/types/arrangement';
import type { AudioStem } from '~/types/audio';
import {
  createPurchasedWorkspaceCollection,
  type PurchasedStemFetch,
  workspaceCollectionCopy,
} from '../collection';

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
    ).toThrow(Error);
    expect(() =>
      createPurchasedWorkspaceCollection({
        productId: 'p',
        productTitle: 'P',
        stems: [
          { id: 'same', name: 'A', audioUrl: 'https://a.test', order: 0 },
          { id: 'same', name: 'B', audioUrl: 'https://b.test', order: 1 },
        ],
      }),
    ).toThrow(Error);
    expect(() =>
      createPurchasedWorkspaceCollection({ productId: '', productTitle: 'P', stems: stems() }),
    ).toThrow(Error);
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
      heading: 'CZABA Studio Lab',
      badge: 'დემო კოლექცია — ავტორიზაცია არ სჭირდება',
      loading: 'დემო კოლექცია იტვირთება…',
      ready: 'დემო კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).',
      empty: 'დემო კოლექციაში წყარო არ არის — ბიბლიოთეკა ცარიელია.',
      failed: 'დემო კოლექციიდან 2 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.',
      fileStem: 'czaba-studio-lab',
    });
    const purchased = workspaceCollectionCopy('purchased');
    expect({ ...purchased, failed: purchased.failed(2) }).toStrictEqual({
      heading: 'CZABA Studio',
      badge: 'შეძენილი კოლექცია',
      loading: 'შეძენილი კოლექცია იტვირთება…',
      ready: 'შეძენილი კოლექცია მზადაა. აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება).',
      empty: 'შეძენილ კოლექციაში წყარო არ არის — ბიბლიოთეკა ცარიელია.',
      failed: 'შეძენილი კოლექციიდან 2 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.',
      fileStem: 'czaba-studio',
    });
    expect(demo.loading.codePointAt(demo.loading.length - 1)).toBe(0x2026);
    expect(demo.ready).toContain('＋');
  });
});
