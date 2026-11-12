import { act, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { WorkspaceCollection } from '~/types/arrangement';

class ZeroAudioBuffer implements AudioBuffer {
  readonly numberOfChannels = 1;
  readonly duration: number;
  private readonly channel: Float32Array<ArrayBuffer>;
  constructor(
    readonly length: number,
    readonly sampleRate: number,
  ) {
    this.duration = length / sampleRate;
    this.channel = new Float32Array(length);
  }
  getChannelData(): Float32Array<ArrayBuffer> {
    return this.channel;
  }
  copyFromChannel(destination: Float32Array<ArrayBuffer>, _channel: number, start = 0): void {
    destination.set(this.channel.subarray(start, start + destination.length));
  }
  copyToChannel(): void {}
}

class FakeOfflineAudioContext {}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

const SAMPLE_RATE = 48000;
const BUCKETS = 4;

function peaksBody(bits: 8 | 16, buckets = BUCKETS) {
  const scale = bits === 8 ? 128 : 32768;
  const data: number[] = [];
  for (let bucket = 0; bucket < buckets; bucket++) {
    data.push(-scale / 2, scale / 4);
  }
  return {
    version: 2,
    channels: 1,
    sample_rate: SAMPLE_RATE,
    samples_per_pixel: SAMPLE_RATE / 100,
    bits,
    length: buckets,
    data,
  };
}

function peaksResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

interface ProbeRef {
  current: ArrangementContextValue | null;
}

function Probe({ api }: { api: ProbeRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: ProbeRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flush(rounds = 20) {
  await act(async () => {
    for (let i = 0; i < rounds; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  });
}

function toneCollection(id: string, peaksUrl?: WorkspaceCollection['peaksUrl']) {
  const decode = deferred<AudioBuffer>();
  const collection: WorkspaceCollection = {
    id,
    label: id,
    origin: 'demo',
    sources: [{ id: 'tone', title: 'Tone', collectionLabel: id, kind: 'music', origin: 'demo' }],
    loadSource: () => decode.promise,
    ...(peaksUrl ? { peaksUrl } : {}),
  };
  return { collection, decode };
}

function setup(peaksUrl?: WorkspaceCollection['peaksUrl']) {
  const { collection, decode } = toneCollection('precomputed', peaksUrl);
  const api: ProbeRef = { current: null };
  const view = render(
    createElement(ArrangementProvider, { collection }, createElement(Probe, { api })),
  );
  const swap = (next: WorkspaceCollection) => {
    view.rerender(
      createElement(ArrangementProvider, { collection: next }, createElement(Probe, { api })),
    );
  };
  return { api, view, decode, swap };
}

function peaksOf(api: ProbeRef): number[] | null {
  const peaks = live(api).sourcePeaks.get('tone');
  return peaks ? Array.from(peaks) : null;
}

const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>();

describe('PPC1-PPC11 precomputed peaks in the collection load (PERF-15a)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('Worker', undefined);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('PPC1 16-bit peaks show while the source is loading and are kept at ready without a recompute', async () => {
    fetchMock.mockResolvedValue(peaksResponse(peaksBody(16)));
    const { api, view, decode } = setup(() => '/peaks/tone.json');
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/peaks/tone.json');
    expect(live(api).sourceStates.tone?.status).toBe('loading');
    expect(peaksOf(api)).toEqual([0.5, 0.5, 0.5, 0.5]);
    const early = live(api).sourcePeaks.get('tone');
    await act(async () => {
      decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('ready');
    expect(live(api).sourcePeaks.get('tone')).toBe(early);
    view.unmount();
  });

  it('PPC2 8-bit peaks are a placeholder: shown while loading, replaced by the decoded peaks at ready', async () => {
    fetchMock.mockResolvedValue(peaksResponse(peaksBody(8)));
    const { api, view, decode } = setup(() => '/peaks/tone.json');
    await flush();
    expect(peaksOf(api)).toEqual([0.5, 0.5, 0.5, 0.5]);
    await act(async () => {
      decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('ready');
    expect(peaksOf(api)).toEqual([0, 0, 0, 0]);
    view.unmount();
  });

  it('PPC3 16-bit peaks two buckets off the decoded length are replaced by the decoded peaks', async () => {
    fetchMock.mockResolvedValue(peaksResponse(peaksBody(16, BUCKETS + 2)));
    const { api, view, decode } = setup(() => '/peaks/tone.json');
    await flush();
    expect(peaksOf(api)).toHaveLength(BUCKETS + 2);
    await act(async () => {
      decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
    });
    await flush();
    expect(peaksOf(api)).toEqual([0, 0, 0, 0]);
    view.unmount();
  });

  it('PPC4 peaks that arrive after the decode never replace the decoded peaks', async () => {
    const late = deferred<Response>();
    fetchMock.mockReturnValue(late.promise);
    const { api, view, decode } = setup(() => '/peaks/tone.json');
    await act(async () => {
      decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('ready');
    const decoded = live(api).sourcePeaks.get('tone');
    expect(peaksOf(api)).toEqual([0, 0, 0, 0]);
    await act(async () => {
      late.resolve(peaksResponse(peaksBody(16)));
    });
    await flush();
    expect(live(api).sourcePeaks.get('tone')).toBe(decoded);
    view.unmount();
  });

  it('PPC5 a failed decode removes the precomputed peaks, so no waveform is shown for an error source', async () => {
    fetchMock.mockResolvedValue(peaksResponse(peaksBody(16)));
    const { api, view, decode } = setup(() => '/peaks/tone.json');
    await flush();
    expect(peaksOf(api)).not.toBeNull();
    await act(async () => {
      decode.reject(new Error('decode failed'));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('error');
    expect(live(api).sourcePeaks.has('tone')).toBe(false);
    view.unmount();
  });

  it('PPC6 without peaksUrl, or with a null url, nothing is fetched and the decoded peaks are used', async () => {
    for (const peaksUrl of [undefined, () => null]) {
      fetchMock.mockClear();
      const { api, view, decode } = setup(peaksUrl);
      await flush();
      expect(peaksOf(api)).toBeNull();
      await act(async () => {
        decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
      });
      await flush();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(peaksOf(api)).toEqual([0, 0, 0, 0]);
      view.unmount();
    }
  });

  it('PPC7 a 404 peaks file shows nothing early and the decoded peaks arrive at ready', async () => {
    fetchMock.mockResolvedValue(peaksResponse({}, 404));
    const { api, view, decode } = setup(() => '/peaks/tone.json');
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(peaksOf(api)).toBeNull();
    await act(async () => {
      decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('ready');
    expect(peaksOf(api)).toEqual([0, 0, 0, 0]);
    view.unmount();
  });

  it('PPC8 unmounting aborts the peaks fetch; the late reply is dropped without an error', async () => {
    const late = deferred<Response>();
    fetchMock.mockReturnValue(late.promise);
    const errors = vi.spyOn(console, 'error');
    const { view } = setup(() => '/peaks/tone.json');
    await flush();
    const signal = fetchMock.mock.calls[0][1].signal;
    expect(signal?.aborted).toBe(false);
    view.unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      late.resolve(peaksResponse(peaksBody(16)));
    });
    await flush();
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('PPC9 a decode that fails before the peaks arrive keeps the error source without a waveform', async () => {
    const late = deferred<Response>();
    fetchMock.mockReturnValue(late.promise);
    const { api, view, decode } = setup(() => '/peaks/tone.json');
    await act(async () => {
      decode.reject(new Error('decode failed'));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('error');
    await act(async () => {
      late.resolve(peaksResponse(peaksBody(16)));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('error');
    expect(live(api).sourcePeaks.has('tone')).toBe(false);
    view.unmount();
  });

  it('PPC10 a collection swap while loading removes the early peaks of sources that never became ready', async () => {
    fetchMock.mockResolvedValue(peaksResponse(peaksBody(16)));
    const { api, view, swap } = setup(() => '/peaks/tone.json');
    await flush();
    expect(peaksOf(api)).toEqual([0.5, 0.5, 0.5, 0.5]);
    const next = toneCollection('swapped');
    await act(async () => {
      swap(next.collection);
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('loading');
    expect(live(api).sourcePeaks.has('tone')).toBe(false);
    await act(async () => {
      next.decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
    });
    await flush();
    expect(peaksOf(api)).toEqual([0, 0, 0, 0]);
    view.unmount();
  });

  it('PPC11 a source that became ready on its precomputed peaks keeps them across a collection swap, as decoded peaks do', async () => {
    fetchMock.mockResolvedValue(peaksResponse(peaksBody(16)));
    const { api, view, decode, swap } = setup(() => '/peaks/tone.json');
    await flush();
    await act(async () => {
      decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('ready');
    const ready = live(api).sourcePeaks.get('tone');
    await act(async () => {
      swap(toneCollection('swapped').collection);
    });
    await flush();
    expect(live(api).sourcePeaks.get('tone')).toBe(ready);
    view.unmount();
  });
});

describe('PPC12 the collection fetchPeaks carries the peaks request (PERF-15b-ii)', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('Worker', undefined);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('PPC12 a collection fetchPeaks receives the peaks url with credentials omit; the global fetch is not used and the peaks show while loading', async () => {
    const fetchPeaks = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () =>
      peaksResponse(peaksBody(16)),
    );
    const { collection, decode } = toneCollection('carried', () => '/peaks/signed.json');
    const api: ProbeRef = { current: null };
    const view = render(
      createElement(
        ArrangementProvider,
        { collection: { ...collection, fetchPeaks } },
        createElement(Probe, { api }),
      ),
    );
    await flush();
    expect(fetchPeaks).toHaveBeenCalledTimes(1);
    expect(fetchPeaks.mock.calls[0][0]).toBe('/peaks/signed.json');
    expect(fetchPeaks.mock.calls[0][1].credentials).toBe('omit');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(live(api).sourceStates.tone?.status).toBe('loading');
    expect(peaksOf(api)).toEqual([0.5, 0.5, 0.5, 0.5]);
    await act(async () => {
      decode.resolve(new ZeroAudioBuffer(BUCKETS * 480, SAMPLE_RATE));
    });
    await flush();
    expect(live(api).sourceStates.tone?.status).toBe('ready');
    view.unmount();
  });
});
