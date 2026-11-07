import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import { decodeVideoAudio, probeVideoFile } from '~/lib/arrangement/video.client';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import {
  handlePeaksWorkerRequest,
  type PeaksWorkerRequest,
  type PeaksWorkerState,
} from '../peaks.worker-protocol';
import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

vi.mock('~/lib/arrangement/graph.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/graph.client')>();
  return { ...actual, renderArrangementWav: vi.fn() };
});

vi.mock('~/lib/arrangement/video.client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/lib/arrangement/video.client')>();
  return { ...actual, probeVideoFile: vi.fn(), decodeVideoAudio: vi.fn() };
});

vi.mock('~/lib/arrangement/mp3-encoder.client', () => ({
  loadArrangementMp3Encoder: vi.fn(),
  resetArrangementMp3Encoder: vi.fn(),
}));

const probeVideoMock = vi.mocked(probeVideoFile);
const decodeVideoMock = vi.mocked(decodeVideoAudio);

class FakeAudioBuffer implements AudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly duration: number;
  constructor(
    private readonly channels: Float32Array<ArrayBuffer>[],
    readonly sampleRate: number,
  ) {
    this.length = channels[0]?.length ?? 0;
    this.numberOfChannels = channels.length;
    this.duration = this.length / sampleRate;
  }
  getChannelData(channel: number): Float32Array<ArrayBuffer> {
    return this.channels[channel];
  }
  copyFromChannel(destination: Float32Array<ArrayBuffer>, channel: number, start = 0): void {
    destination.set(this.channels[channel].subarray(start, start + destination.length));
  }
  copyToChannel(): void {}
}

function tone(length: number): Float32Array<ArrayBuffer> {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = Math.sin(i / 7) * 0.5;
  }
  return data;
}

class ManualPeaksWorker {
  static instances: ManualPeaksWorker[] = [];
  posted: PeaksWorkerRequest[] = [];
  state: PeaksWorkerState = { job: null };
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  constructor() {
    ManualPeaksWorker.instances.push(this);
  }
  postMessage(message: PeaksWorkerRequest) {
    this.posted.push(message);
  }
  run(message: PeaksWorkerRequest) {
    handlePeaksWorkerRequest(this.state, message, (response) => {
      this.onmessage?.(new MessageEvent('message', { data: response }));
    });
  }
  terminate() {}
}

class RecordingSource {
  static started: unknown[] = [];
  buffer: unknown = null;
  onended: (() => void) | null = null;
  connect(destination: unknown) {
    return destination;
  }
  disconnect() {}
  start() {
    RecordingSource.started.push(this.buffer);
  }
  stop() {}
}

class RecordingAudioContext {
  state = 'running';
  sampleRate = 48000;
  currentTime = 0;
  destination = { connect: () => undefined, disconnect: () => undefined };
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  createGain() {
    return {
      gain: { value: 0, setTargetAtTime() {} },
      connect: (d: unknown) => d,
      disconnect() {},
    };
  }
  createStereoPanner() {
    return { pan: { value: 0, setTargetAtTime() {} }, connect: (d: unknown) => d, disconnect() {} };
  }
  createBufferSource() {
    return new RecordingSource();
  }
}

class FakeOfflineAudioContext {}

const emptyCollection: WorkspaceCollection = {
  id: 'peaks-video',
  label: 'peaks-video',
  origin: 'demo',
  sources: [],
  loadSource: async () => {
    throw new Error('no sources');
  },
};

function emptyVideoArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'Video' },
      { id: 'music', kind: 'audio', name: 'Music' },
    ]),
    clips: [],
  };
}

interface PeaksVideoApiRef {
  current: WorkspaceProbeValue | null;
}

function PeaksVideoProbe({ api }: { api: PeaksVideoApiRef }) {
  api.current = useWorkspaceProbe();
  return null;
}

function live(api: PeaksVideoApiRef): WorkspaceProbeValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function flush() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

describe('PW19 a video sound buffer reaches playback only together with "ready"', () => {
  const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
  let mountedView: ReturnType<typeof render> | null = null;

  beforeEach(() => {
    ManualPeaksWorker.instances = [];
    RecordingSource.started = [];
    probeVideoMock.mockReset();
    decodeVideoMock.mockReset();
    vi.stubGlobal('Worker', ManualPeaksWorker);
    vi.stubGlobal('AudioContext', RecordingAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: () => undefined,
    });
  });

  afterEach(() => {
    try {
      mountedView?.unmount();
    } finally {
      mountedView = null;
      if (originalRevokeObjectUrl) {
        Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectUrl);
      } else {
        Reflect.deleteProperty(URL, 'revokeObjectURL');
      }
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    }
  });

  it('PW19 playback started while the video sound computes peaks leaves it out, then re-syncs it in when the sound is ready', async () => {
    const buffer = new FakeAudioBuffer([tone(1500)], 1000);
    probeVideoMock.mockResolvedValue({ url: 'blob:film', duration: 1.5, width: 640, height: 360 });
    decodeVideoMock.mockResolvedValue({ buffer, reason: null });
    const api: PeaksVideoApiRef = { current: null };
    mountedView = render(
      <ArrangementProvider
        collection={emptyCollection}
        initialArrangement={emptyVideoArrangement()}
      >
        <PeaksVideoProbe api={api} />
      </ArrangementProvider>,
    );
    await flush();
    await act(async () => {
      live(api).importVideoFiles([new File(['x'], 'film.mp4', { type: 'video/mp4' })]);
    });
    await flush();
    expect(decodeVideoMock).toHaveBeenCalledTimes(1);
    const sources = [...live(api).videoSources.values()];
    expect(sources).toHaveLength(1);
    const sourceId = sources[0]?.id ?? '';
    expect(sources[0]?.audio).toBe('decoding');
    expect(live(api).sourcePeaks.has(sourceId)).toBe(false);
    const videoClips = live(api).arrangement.clips.filter((clip) => clip.sourceId === sourceId);
    expect(videoClips).toHaveLength(1);
    expect(ManualPeaksWorker.instances).toHaveLength(1);
    await act(async () => {
      live(api).togglePlayback();
    });
    await flush();
    expect(live(api).isPlaying).toBe(true);
    expect(RecordingSource.started).not.toContain(buffer);
    const worker = ManualPeaksWorker.instances[0];
    await act(async () => {
      for (let index = 0; index < worker.posted.length; index++) {
        worker.run(worker.posted[index]);
      }
    });
    await flush();
    expect(worker.posted.map((message) => message.type)).toEqual(['begin', 'chunk', 'end']);
    expect(live(api).videoSources.get(sourceId)?.audio).toBe('ready');
    expect(live(api).sourcePeaks.has(sourceId)).toBe(true);
    expect(RecordingSource.started).toContain(buffer);
  });
});
