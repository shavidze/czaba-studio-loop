import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateSlowRiseSamples, generateSoftImpactSamples } from '~/lib/arrangement/demo-synth';
import type { WorkspaceSource } from '~/types/arrangement';
import { studioLabDemoCollection } from '../studio-lab-demo';

const composition = vi.hoisted(() => {
  const ramp = (offset: number) => Float32Array.from({ length: 8 }, (_, i) => offset + i / 100);
  return {
    mix: ramp(0.1),
    stems: { pulse: ramp(0.2), bass: ramp(0.3), pad: ramp(0.4), lead: ramp(0.5) },
  };
});

vi.mock('~/lib/arrangement/demo-synth.client', () => ({
  synthesizeDemoCompositionOffMainThread: () => Promise.resolve(composition),
}));

interface CopyCall {
  source: Float32Array;
  channel: number;
}

const built: FakeAudioBuffer[] = [];

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  readonly copies: CopyCall[] = [];
  readonly channels: Float32Array[];
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
    this.channels = Array.from(
      { length: options.numberOfChannels },
      () => new Float32Array(options.length),
    );
    built.push(this);
  }
  get duration() {
    return this.length / this.sampleRate;
  }
  copyToChannel(source: Float32Array, channel: number) {
    this.copies.push({ source, channel });
    this.channels[channel].set(source);
  }
  getChannelData(channel: number) {
    return this.channels[channel];
  }
}

const WORKER_SOURCES: ReadonlyArray<readonly [string, Float32Array]> = [
  ['demo-synth-mix', composition.mix],
  ['demo-stem-pulse', composition.stems.pulse],
  ['demo-stem-bass', composition.stems.bass],
  ['demo-stem-pad', composition.stems.pad],
  ['demo-stem-lead', composition.stems.lead],
];

const GENERATED_SOURCES: ReadonlyArray<readonly [string, () => Float32Array]> = [
  ['demo-soft-impact', generateSoftImpactSamples],
  ['demo-slow-rise', generateSlowRiseSamples],
];

function demoSource(id: string): WorkspaceSource {
  const source = studioLabDemoCollection.sources.find((entry) => entry.id === id);
  if (!source) {
    throw new Error(`source ${id} missing`);
  }
  return source;
}

function decodeContext(): BaseAudioContext {
  return new OfflineAudioContext({ numberOfChannels: 2, length: 1, sampleRate: 48000 });
}

function loadDemo(id: string, signal = new AbortController().signal): Promise<AudioBuffer> {
  return studioLabDemoCollection.loadSource(demoSource(id), decodeContext(), signal);
}

function onlyBuffer(): FakeAudioBuffer {
  expect(built).toHaveLength(1);
  return built[0];
}

async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

class FakeDecodeContext {}

describe('PERF-13d demo synth buffers: one shared source array, one build per task (D-29z1356)', () => {
  beforeEach(() => {
    built.length = 0;
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('OfflineAudioContext', FakeDecodeContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(
    WORKER_SOURCES,
  )('SB1 %s builds one stereo 48 kHz buffer and copies the worker array itself into both channels', async (id, samples) => {
    await loadDemo(id);
    const buffer = onlyBuffer();
    expect(buffer.numberOfChannels).toBe(2);
    expect(buffer.length).toBe(samples.length);
    expect(buffer.sampleRate).toBe(48000);
    expect(buffer.copies.map((call) => call.channel)).toEqual([0, 1]);
    expect(buffer.copies[0].source).toBe(samples);
    expect(buffer.copies[1].source).toBe(samples);
  });

  it.each(
    GENERATED_SOURCES,
  )('SB2 %s copies one generated array into both channels and keeps the generated samples', async (id, generate) => {
    await loadDemo(id);
    const buffer = onlyBuffer();
    const expected = generate();
    expect(buffer.numberOfChannels).toBe(2);
    expect(buffer.length).toBe(expected.length);
    expect(buffer.copies.map((call) => call.channel)).toEqual([0, 1]);
    expect(buffer.copies[1].source).toBe(buffer.copies[0].source);
    expect(Array.from(buffer.getChannelData(0))).toEqual(Array.from(expected));
  });

  it.each(
    WORKER_SOURCES,
  )('SB3 %s both channels hold the source samples value for value', async (id, samples) => {
    await loadDemo(id);
    const buffer = onlyBuffer();
    expect(Array.from(buffer.getChannelData(0))).toEqual(Array.from(samples));
    expect(Array.from(buffer.getChannelData(1))).toEqual(Array.from(samples));
  });

  it('SB4 five concurrent worker-source loads build their buffers in five separate timer tasks', async () => {
    const queued: Array<() => void> = [];
    vi.stubGlobal('setTimeout', (handler: () => void) => {
      queued.push(handler);
      return 0;
    });
    const loads = WORKER_SOURCES.map(([id]) => loadDemo(id));
    await flushMicrotasks();
    expect(built).toHaveLength(0);
    expect(queued).toHaveLength(WORKER_SOURCES.length);
    for (const [task, run] of queued.entries()) {
      run();
      await flushMicrotasks();
      expect(built).toHaveLength(task + 1);
    }
    const buffers = await Promise.all(loads);
    expect(buffers).toHaveLength(WORKER_SOURCES.length);
  });

  it('SB6 the two generated sources build without waiting for a timer task', async () => {
    const queued: Array<() => void> = [];
    vi.stubGlobal('setTimeout', (handler: () => void) => {
      queued.push(handler);
      return 0;
    });
    const loads = GENERATED_SOURCES.map(([id]) => loadDemo(id));
    await flushMicrotasks();
    expect(queued).toHaveLength(0);
    expect(built).toHaveLength(GENERATED_SOURCES.length);
    expect(await Promise.all(loads)).toHaveLength(GENERATED_SOURCES.length);
  });

  it('SB5 an abort while the build waits for its task rejects with the abort reason and builds nothing', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const load = loadDemo('demo-stem-bass', controller.signal);
    const outcome = load.then(
      () => 'resolved',
      (error: unknown) => error,
    );
    await flushMicrotasks();
    controller.abort();
    vi.advanceTimersToNextTimer();
    await flushMicrotasks();
    expect(await outcome).toBe(controller.signal.reason);
    expect(built).toHaveLength(0);
  });
});
