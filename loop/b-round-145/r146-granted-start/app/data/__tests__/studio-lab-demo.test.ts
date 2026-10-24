import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createPurchasedWorkspaceCollection,
  type PurchasedStemFetch,
} from '~/lib/arrangement/collection';
import type { WorkspaceSource } from '~/types/arrangement';
import { studioLabDemoCollection } from '../studio-lab-demo';

const NETWORK_TEXT = 'File failed to load (network)';
const DECODE_TEXT = 'File could not be decoded';

const decodeAudioDataMock = vi.fn<(data: ArrayBuffer) => Promise<AudioBuffer>>();
const fetchMock = vi.fn<typeof fetch>();

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

function decodedBuffer(): AudioBuffer {
  return new AudioBuffer({ numberOfChannels: 2, length: 480, sampleRate: 48000 });
}

function demoSource(id: string): WorkspaceSource {
  const source = studioLabDemoCollection.sources.find((entry) => entry.id === id);
  if (!source) {
    throw new Error(`source ${id} missing`);
  }
  return source;
}

function responseWithBody(body: ArrayBuffer): Response {
  const response = new Response(new Uint8Array(8));
  vi.spyOn(response, 'arrayBuffer').mockResolvedValue(body);
  return response;
}

function responseWithBodyFailure(failure: unknown): Response {
  const response = new Response(new Uint8Array(8));
  vi.spyOn(response, 'arrayBuffer').mockRejectedValue(failure);
  return response;
}

async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('expected rejection');
}

async function messageOf(promise: Promise<unknown>): Promise<string> {
  const error = await rejectionOf(promise);
  if (!(error instanceof Error)) {
    throw new Error('expected Error instance');
  }
  return error.message;
}

function loadDemo(id: string, signal = new AbortController().signal): Promise<AudioBuffer> {
  return studioLabDemoCollection.loadSource(demoSource(id), decodeContext(), signal);
}

function loadPurchased(fetchAudio: PurchasedStemFetch): Promise<AudioBuffer> {
  const collection = createPurchasedWorkspaceCollection({
    productId: 'middle-east',
    productTitle: 'Middle East',
    stems: [{ id: 'drums', name: 'Drums', audioUrl: 'https://stems.example.test/drums', order: 0 }],
    fetchAudio,
  });
  return collection.loadSource(
    collection.sources[0],
    decodeContext(),
    new AbortController().signal,
  );
}

describe('C-R92-N1 studio-lab demo loader error text (D-29z60)', () => {
  beforeEach(() => {
    decodeAudioDataMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('OfflineAudioContext', FakeDecodeContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('DL1 network failure maps to the Georgian network text without browser text or URL', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await rejectionOf(loadDemo('demo-middle-east'));
    expect(error).toBeInstanceOf(Error);
    const message = error instanceof Error ? error.message : '';
    expect(message).toBe(NETWORK_TEXT);
    expect(message.includes('Failed to fetch')).toBe(false);
    expect(message.includes('/middle-east.mp3')).toBe(false);
    expect(decodeAudioDataMock).not.toHaveBeenCalled();
  });

  it('DL2 body read failure maps to the Georgian network text', async () => {
    fetchMock.mockResolvedValue(responseWithBodyFailure(new TypeError('network error')));
    expect(await messageOf(loadDemo('demo-middle-east'))).toBe(NETWORK_TEXT);
    expect(decodeAudioDataMock).not.toHaveBeenCalled();
  });

  it('DL3 decode failure maps to the Georgian decode text', async () => {
    fetchMock.mockResolvedValue(responseWithBody(new ArrayBuffer(8)));
    decodeAudioDataMock.mockRejectedValue(
      new DOMException('Unable to decode audio data', 'EncodingError'),
    );
    const message = await messageOf(loadDemo('demo-middle-east'));
    expect(message).toBe(DECODE_TEXT);
    expect(message.includes('Unable to decode')).toBe(false);
  });

  it('DL4 HTTP 404 keeps the status text and never decodes', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    expect(await messageOf(loadDemo('demo-middle-east'))).toBe('File failed to load (404)');
    expect(decodeAudioDataMock).not.toHaveBeenCalled();
  });

  it('DL5 aborted fetch rethrows the same error object', async () => {
    const controller = new AbortController();
    controller.abort();
    const abortError = new DOMException('aborted', 'AbortError');
    fetchMock.mockRejectedValue(abortError);
    await expect(loadDemo('demo-middle-east', controller.signal)).rejects.toBe(abortError);
  });

  it('DL5 aborted body read rethrows the same error object', async () => {
    const controller = new AbortController();
    controller.abort();
    const abortError = new DOMException('aborted', 'AbortError');
    fetchMock.mockResolvedValue(responseWithBodyFailure(abortError));
    await expect(loadDemo('demo-middle-east', controller.signal)).rejects.toBe(abortError);
    expect(decodeAudioDataMock).not.toHaveBeenCalled();
  });

  it('DL5 any fetch error after abort is rethrown unchanged, not mapped', async () => {
    const controller = new AbortController();
    controller.abort();
    const rawError = new TypeError('Failed to fetch');
    fetchMock.mockRejectedValue(rawError);
    await expect(loadDemo('demo-middle-east', controller.signal)).rejects.toBe(rawError);
  });

  it('DL5 decode failure after abort still maps to the Georgian decode text, like the purchased adapter', async () => {
    const controller = new AbortController();
    controller.abort();
    fetchMock.mockResolvedValue(responseWithBody(new ArrayBuffer(8)));
    decodeAudioDataMock.mockRejectedValue(new DOMException('aborted', 'AbortError'));
    expect(await messageOf(loadDemo('demo-middle-east', controller.signal))).toBe(DECODE_TEXT);
  });

  it.each([
    ['demo-middle-east', '/middle-east.mp3'],
    ['demo-hero-music', '/videos/hero/hero-music.mp3'],
  ])('DL6 success for %s fetches %s once with omitted credentials and returns the decoded buffer', async (id, url) => {
    const controller = new AbortController();
    const data = new ArrayBuffer(16);
    const decoded = decodedBuffer();
    fetchMock.mockResolvedValue(responseWithBody(data));
    decodeAudioDataMock.mockResolvedValue(decoded);
    const result = await loadDemo(id, controller.signal);
    expect(result).toBe(decoded);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(url);
    expect(init).toStrictEqual({ credentials: 'omit', signal: controller.signal });
    expect(init?.signal).toBe(controller.signal);
    expect(decodeAudioDataMock).toHaveBeenCalledTimes(1);
    expect(decodeAudioDataMock.mock.calls[0][0]).toBe(data);
  });

  it('DL7 unknown source rejects with the unknown-demo text and never fetches', async () => {
    const unknown: WorkspaceSource = {
      id: 'demo-not-in-any-table',
      title: 'Unknown',
      collectionLabel: 'Unknown',
      kind: 'sfx',
      origin: 'demo',
    };
    const message = await messageOf(
      studioLabDemoCollection.loadSource(unknown, decodeContext(), new AbortController().signal),
    );
    expect(message).toBe('Unknown demo source');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('DL8 network and decode texts equal the purchased adapter texts for the same failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const demoNetwork = await messageOf(loadDemo('demo-middle-east'));
    const purchasedNetwork = await messageOf(
      loadPurchased(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    expect(demoNetwork).toBe(purchasedNetwork);

    decodeAudioDataMock.mockRejectedValue(
      new DOMException('Unable to decode audio data', 'EncodingError'),
    );
    fetchMock.mockResolvedValue(responseWithBody(new ArrayBuffer(8)));
    const demoDecode = await messageOf(loadDemo('demo-middle-east'));
    const purchasedDecode = await messageOf(
      loadPurchased(async () => new Response(new Uint8Array(8))),
    );
    expect(demoDecode).toBe(purchasedDecode);
  });
});
