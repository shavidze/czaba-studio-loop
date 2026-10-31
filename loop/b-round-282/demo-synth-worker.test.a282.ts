import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DemoStemComposition } from '../demo-synth';

class FakeWorker {
  static instances: FakeWorker[] = [];
  static throwOnConstruct = false;
  posted: unknown[] = [];
  terminated = 0;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  constructor() {
    if (FakeWorker.throwOnConstruct) {
      throw new Error('worker unavailable');
    }
    FakeWorker.instances.push(this);
  }
  postMessage(message: unknown) {
    this.posted.push(message);
  }
  terminate() {
    this.terminated += 1;
  }
  emit(data: unknown) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }
}

function expectReleased(worker: FakeWorker) {
  expect(worker.terminated).toBe(1);
  expect(worker.onmessage).toBeNull();
  expect(worker.onerror).toBeNull();
  expect(worker.onmessageerror).toBeNull();
}

function onlyWorker(): FakeWorker {
  expect(FakeWorker.instances).toHaveLength(1);
  const worker = FakeWorker.instances[0];
  if (!worker) {
    throw new Error('worker not created');
  }
  return worker;
}

function smallComposition(): DemoStemComposition {
  return {
    mix: new Float32Array([0.1, 0.2]),
    stems: {
      pulse: new Float32Array([0.3]),
      bass: new Float32Array([0.4]),
      pad: new Float32Array([0.5]),
      lead: new Float32Array([0.6]),
    },
  };
}

async function flushMicrotasks() {
  for (let index = 0; index < 10; index += 1) {
    await Promise.resolve();
  }
}

function track<T>(promise: Promise<T>): { value: T | undefined } {
  const state: { value: T | undefined } = { value: undefined };
  promise.then((value) => {
    state.value = value;
  });
  return state;
}

async function loadClient() {
  const client = await import('../demo-synth.client');
  const synth = await import('../demo-synth');
  return { client, synth };
}

function readTransfer(options: unknown): unknown[] {
  if (typeof options !== 'object' || options === null || !('transfer' in options)) {
    return [];
  }
  return Array.isArray(options.transfer) ? options.transfer : [];
}

function expectSameSamples(actual: Float32Array, expected: Float32Array) {
  expect(actual.length).toBe(expected.length);
  let mismatches = 0;
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) {
      mismatches += 1;
    }
  }
  expect(mismatches).toBe(0);
}

describe('demo synth off the main thread', () => {
  beforeEach(() => {
    vi.resetModules();
    FakeWorker.instances = [];
    FakeWorker.throwOnConstruct = false;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    FakeWorker.instances = [];
    FakeWorker.throwOnConstruct = false;
  });

  it('DW1: without a Worker global it resolves to the synchronous composition object', async () => {
    expect(typeof Worker).toBe('undefined');
    const { client, synth } = await loadClient();
    await expect(client.synthesizeDemoCompositionOffMainThread()).resolves.toBe(
      synth.getDemoStemComposition(),
    );
  });

  it('DW2: five concurrent calls share one worker and one synthesize message', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('Worker', FakeWorker);
    const { client } = await loadClient();
    for (let index = 0; index < 5; index += 1) {
      void client.synthesizeDemoCompositionOffMainThread();
    }
    const worker = onlyWorker();
    expect(worker.posted).toEqual([{ type: 'synthesize' }]);
  });

  it('DW3: a valid complete message resolves every caller and releases the worker', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const { client } = await loadClient();
    const calls = Array.from({ length: 5 }, () => client.synthesizeDemoCompositionOffMainThread());
    const worker = onlyWorker();
    const composition = smallComposition();
    worker.emit({ type: 'complete', composition });
    const results = await Promise.all(calls);
    for (const result of results) {
      expect(result).toBe(composition);
    }
    expect(worker.terminated).toBe(1);
    expect(worker.onmessage).toBeNull();
    expect(worker.onerror).toBeNull();
    expect(worker.onmessageerror).toBeNull();
  });

  it('DW4: onerror falls back to the synchronous composition without waiting for the stall timer', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('Worker', FakeWorker);
    const { client, synth } = await loadClient();
    const state = track(client.synthesizeDemoCompositionOffMainThread());
    const worker = onlyWorker();
    worker.onerror?.(new Event('error'));
    await flushMicrotasks();
    expect(state.value).toBe(synth.getDemoStemComposition());
    expectReleased(worker);
  });

  it('DW5: onmessageerror falls back to the synchronous composition without waiting for the stall timer', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('Worker', FakeWorker);
    const { client, synth } = await loadClient();
    const state = track(client.synthesizeDemoCompositionOffMainThread());
    const worker = onlyWorker();
    worker.onmessageerror?.(new MessageEvent('messageerror'));
    await flushMicrotasks();
    expect(state.value).toBe(synth.getDemoStemComposition());
    expectReleased(worker);
  });

  it.each([
    ['(a) a complete message without a composition', { type: 'complete' }],
    [
      '(b) a pulse stem that is a plain array',
      {
        type: 'complete',
        composition: {
          ...smallComposition(),
          stems: { ...smallComposition().stems, pulse: [0.3] },
        },
      },
    ],
  ])('DW6: a malformed message falls back: %s', async (_label, data) => {
    vi.useFakeTimers();
    vi.stubGlobal('Worker', FakeWorker);
    const { client, synth } = await loadClient();
    const state = track(client.synthesizeDemoCompositionOffMainThread());
    const worker = onlyWorker();
    worker.emit(data);
    await flushMicrotasks();
    expect(state.value).toBe(synth.getDemoStemComposition());
    expectReleased(worker);
  });

  it('DW7: a throwing Worker constructor falls back to the synchronous composition', async () => {
    FakeWorker.throwOnConstruct = true;
    vi.stubGlobal('Worker', FakeWorker);
    const { client, synth } = await loadClient();
    await expect(client.synthesizeDemoCompositionOffMainThread()).resolves.toBe(
      synth.getDemoStemComposition(),
    );
    expect(FakeWorker.instances).toHaveLength(0);
  });

  it('DW8: the stall timer falls back only once the full timeout has passed', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('Worker', FakeWorker);
    const { client, synth } = await loadClient();
    const state = track(client.synthesizeDemoCompositionOffMainThread());
    const worker = onlyWorker();
    await vi.advanceTimersByTimeAsync(client.DEMO_SYNTH_WORKER_STALL_TIMEOUT_MS - 1);
    expect(state.value).toBeUndefined();
    expect(worker.terminated).toBe(0);
    await vi.advanceTimersByTimeAsync(1);
    await flushMicrotasks();
    expect(state.value).toBe(synth.getDemoStemComposition());
    expectReleased(worker);
  });

  it('DW9: a later call reuses the completed job without a new worker', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const { client } = await loadClient();
    const first = client.synthesizeDemoCompositionOffMainThread();
    const worker = onlyWorker();
    const composition = smallComposition();
    worker.emit({ type: 'complete', composition });
    await expect(first).resolves.toBe(composition);
    await expect(client.synthesizeDemoCompositionOffMainThread()).resolves.toBe(composition);
    expect(FakeWorker.instances).toHaveLength(1);
  });

  it('DW10: the worker module posts the full composition and transfers its five buffers', async () => {
    const postMessage = vi.spyOn(window, 'postMessage').mockImplementation(() => undefined);
    await import('../demo-synth.worker');
    const { client, synth } = await loadClient();
    const handler = self.onmessage;
    self.onmessage = null;
    expect(handler).toBeTypeOf('function');
    handler?.call(window, new MessageEvent('message', { data: { type: 'synthesize' } }));
    expect(postMessage).toHaveBeenCalledTimes(1);
    const [message, options] = postMessage.mock.calls[0] ?? [];
    expect(message).toMatchObject({ type: 'complete' });
    const composition = client.readDemoSynthWorkerComposition(message);
    if (!composition) {
      throw new Error('worker message is not a complete composition');
    }
    const expected = synth.getDemoStemComposition();
    expectSameSamples(composition.mix, expected.mix);
    for (const part of synth.DEMO_STEM_PARTS) {
      expectSameSamples(composition.stems[part], expected.stems[part]);
    }
    const transfer = readTransfer(options);
    expect(transfer).toHaveLength(5);
    expect(transfer[0]).toBe(composition.mix.buffer);
    synth.DEMO_STEM_PARTS.forEach((part, index) => {
      expect(transfer[index + 1]).toBe(composition.stems[part].buffer);
    });
  });
});
