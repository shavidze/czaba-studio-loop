import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Arrangement } from '~/types/arrangement';
import {
  ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE,
  ARRANGEMENT_EXPORT_CANCELLED_MESSAGE,
  ArrangementExportCancelledError,
  isArrangementExportCancelledError,
  raceArrangementExportAbort,
} from '../export-cancel';
import { encodeArrangementWavOffMainThread } from '../export-wav.client';
import { renderArrangementWav } from '../graph.client';
import { createArrangement } from '../model';

async function settleMicrotasks(rounds = 10) {
  for (let i = 0; i < rounds; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

async function outcomeOf<T>(work: Promise<T>): Promise<unknown> {
  return work.then(
    (value) => ({ resolved: value }),
    (error: unknown) => error,
  );
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: Error) => void = () => undefined;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

class FakeWorker {
  static instances: FakeWorker[] = [];
  posted: unknown = null;
  transfer: Transferable[] = [];
  terminated = 0;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  constructor() {
    FakeWorker.instances.push(this);
  }
  postMessage(message: unknown, transfer: Transferable[] = []) {
    this.posted = message;
    this.transfer = transfer;
  }
  terminate() {
    this.terminated += 1;
  }
  emit(data: unknown) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }
}

function lastWorker(): FakeWorker {
  const worker = FakeWorker.instances.at(-1);
  if (!worker) {
    throw new Error('worker not created');
  }
  return worker;
}

interface SuspendCall {
  time: number;
  resolve: () => void;
}

const renderLog: {
  constructed: number;
  events: string[];
  suspends: SuspendCall[];
  resumes: number;
  finishRender: (() => void) | null;
} = { constructed: 0, events: [], suspends: [], resumes: 0, finishRender: null };

class FakeRenderNode {
  connect(destination: FakeRenderNode) {
    return destination;
  }
  disconnect() {}
}

class FakeRenderGain extends FakeRenderNode {
  gain = {
    value: 1,
    setTargetAtTime(target: number) {
      this.value = target;
    },
  };
}

class FakeRenderPanner extends FakeRenderNode {
  pan = {
    value: 0,
    setTargetAtTime(target: number) {
      this.value = target;
    },
  };
}

class FakeRenderSource extends FakeRenderNode {
  buffer: unknown = null;
  onended: (() => void) | null = null;
  start() {}
  stop() {}
}

function renderedChannels() {
  const channels = [Float32Array.of(0.25, 0.5, -0.25), Float32Array.of(-0.5, 0, 0.75)];
  return {
    sampleRate: 48000,
    getChannelData: (index: number) => channels[index] ?? new Float32Array(3),
  };
}

class PlainOfflineContext {
  currentTime = 0;
  destination = new FakeRenderNode();
  constructor() {
    renderLog.constructed += 1;
  }
  createGain() {
    return new FakeRenderGain();
  }
  createStereoPanner() {
    return new FakeRenderPanner();
  }
  createBufferSource() {
    return new FakeRenderSource();
  }
  startRendering() {
    renderLog.events.push('startRendering');
    return Promise.resolve(renderedChannels());
  }
}

class StepOfflineContext extends PlainOfflineContext {
  suspend(time: number) {
    renderLog.events.push(`suspend:${time}`);
    return new Promise<void>((resolve) => {
      renderLog.suspends.push({ time, resolve });
    });
  }
  resume() {
    renderLog.resumes += 1;
    renderLog.events.push('resume');
    return Promise.resolve();
  }
  startRendering() {
    renderLog.events.push('startRendering');
    return new Promise<ReturnType<typeof renderedChannels>>((resolve) => {
      renderLog.finishRender = () => resolve(renderedChannels());
    });
  }
}

class RejectingResumeContext extends PlainOfflineContext {
  suspend(time: number) {
    renderLog.events.push(`suspend:${time}`);
    return Promise.resolve();
  }
  resume() {
    renderLog.resumes += 1;
    return Promise.reject(new Error('resume failed'));
  }
  startRendering() {
    renderLog.events.push('startRendering');
    return new Promise<ReturnType<typeof renderedChannels>>(() => undefined);
  }
}

class RejectingSuspendContext extends PlainOfflineContext {
  suspend() {
    renderLog.events.push('suspend');
    return Promise.reject(new Error('suspend refused'));
  }
  resume() {
    renderLog.resumes += 1;
    return Promise.resolve();
  }
}

function cancelTestArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
    ]),
    clips: [
      { id: 'm1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
    ],
  };
}

function resetRenderLog() {
  renderLog.constructed = 0;
  renderLog.events = [];
  renderLog.suspends = [];
  renderLog.resumes = 0;
  renderLog.finishRender = null;
}

describe('SRW-20 stage 3b-1 export cancel messages and error (D-29z55)', () => {
  it('exports the exact Georgian messages and a named cancel error', () => {
    expect(ARRANGEMENT_EXPORT_CANCELLED_MESSAGE).toBe('ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.');
    expect(ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE).toBe(
      'ექსპორტი გაუქმდა — ფაილი არ შეიქმნა. MP3 encoder შემდეგ MP3 ექსპორტზე თავიდან ჩაიტვირთება.',
    );
    const error = new ArrangementExportCancelledError();
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ArrangementExportCancelledError');
    expect(error.message).toBe('Export cancelled');
    expect(isArrangementExportCancelledError(error)).toBe(true);
    expect(isArrangementExportCancelledError(new Error('Export cancelled'))).toBe(false);
    expect(isArrangementExportCancelledError(null)).toBe(false);
  });
});

describe('EC1 raceArrangementExportAbort', () => {
  it('without a signal returns the same promise and its result', async () => {
    const work = Promise.resolve(7);
    const raced = raceArrangementExportAbort(work);
    expect(raced).toBe(work);
    expect(await raced).toBe(7);
  });

  it('with a pre-aborted signal rejects with the cancel error', async () => {
    const controller = new AbortController();
    controller.abort();
    const result = await outcomeOf(
      raceArrangementExportAbort(Promise.resolve(1), controller.signal),
    );
    expect(isArrangementExportCancelledError(result)).toBe(true);
  });

  it('an abort mid-flight rejects with the cancel error even though the work resolves later', async () => {
    const controller = new AbortController();
    const work = deferred<string>();
    const raced = outcomeOf(raceArrangementExportAbort(work.promise, controller.signal));
    controller.abort();
    work.resolve('late');
    expect(isArrangementExportCancelledError(await raced)).toBe(true);
  });

  it('a work rejection before any abort passes that error through', async () => {
    const controller = new AbortController();
    const result = await outcomeOf(
      raceArrangementExportAbort(Promise.reject(new Error('work broke')), controller.signal),
    );
    expect(result instanceof Error ? result.message : result).toBe('work broke');
    expect(isArrangementExportCancelledError(result)).toBe(false);
  });

  it('removes its abort listener once the work settles', async () => {
    const controller = new AbortController();
    const add = vi.spyOn(controller.signal, 'addEventListener');
    const remove = vi.spyOn(controller.signal, 'removeEventListener');
    await raceArrangementExportAbort(Promise.resolve('ok'), controller.signal);
    expect(add).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove.mock.calls[0]?.[1]).toBe(add.mock.calls[0]?.[1]);
    await outcomeOf(raceArrangementExportAbort(Promise.reject(new Error('x')), controller.signal));
    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove.mock.calls[1]?.[1]).toBe(add.mock.calls[1]?.[1]);
  });

  it('a pre-aborted signal with a work that rejects later raises no unhandled rejection', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      const controller = new AbortController();
      controller.abort();
      const work = deferred<string>();
      const raced = outcomeOf(raceArrangementExportAbort(work.promise, controller.signal));
      work.reject(new Error('late failure after a pre-abort'));
      expect(isArrangementExportCancelledError(await raced)).toBe(true);
      await settleMicrotasks();
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });

  it('a late work rejection after an abort raises no unhandled rejection', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      const controller = new AbortController();
      const work = deferred<string>();
      const raced = outcomeOf(raceArrangementExportAbort(work.promise, controller.signal));
      controller.abort();
      work.reject(new Error('late failure'));
      expect(isArrangementExportCancelledError(await raced)).toBe(true);
      await settleMicrotasks();
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });
});

describe('EC2–EC3 renderArrangementWav honours the signal and a resume error', () => {
  afterEach(() => {
    resetRenderLog();
    FakeWorker.instances = [];
    vi.unstubAllGlobals();
  });

  it('EC2 a pre-aborted signal rejects cancelled and never constructs an OfflineAudioContext', async () => {
    vi.stubGlobal('OfflineAudioContext', StepOfflineContext);
    const controller = new AbortController();
    controller.abort();
    const result = await outcomeOf(
      renderArrangementWav(cancelTestArrangement(), new Map(), undefined, {
        signal: controller.signal,
      }),
    );
    expect(isArrangementExportCancelledError(result)).toBe(true);
    expect(renderLog.constructed).toBe(0);
  });

  it('EC2 a signal alone schedules suspend points, and an abort before the first suspend resolves never resumes', async () => {
    vi.stubGlobal('OfflineAudioContext', StepOfflineContext);
    vi.stubGlobal('Worker', FakeWorker);
    const controller = new AbortController();
    const outcome = outcomeOf(
      renderArrangementWav(cancelTestArrangement(), new Map(), undefined, {
        signal: controller.signal,
      }),
    );
    await settleMicrotasks(2);
    expect(renderLog.suspends).toHaveLength(19);
    expect(renderLog.events.at(-1)).toBe('startRendering');
    controller.abort();
    for (const call of renderLog.suspends) {
      call.resolve();
    }
    await settleMicrotasks();
    expect(isArrangementExportCancelledError(await outcome)).toBe(true);
    expect(renderLog.resumes).toBe(0);
    expect(renderLog.events).not.toContain('resume');
    expect(FakeWorker.instances).toHaveLength(0);
  });

  it('EC2 an abort after one resumed suspend stops resuming at the next suspend point', async () => {
    vi.stubGlobal('OfflineAudioContext', StepOfflineContext);
    const controller = new AbortController();
    const progress: number[] = [];
    const outcome = outcomeOf(
      renderArrangementWav(cancelTestArrangement(), new Map(), undefined, {
        signal: controller.signal,
        onProgress: (_phase, fraction) => progress.push(fraction),
      }),
    );
    await settleMicrotasks(2);
    renderLog.suspends[0]?.resolve();
    await settleMicrotasks();
    expect(renderLog.resumes).toBe(1);
    expect(progress).toHaveLength(1);
    controller.abort();
    renderLog.suspends[1]?.resolve();
    await settleMicrotasks();
    expect(renderLog.resumes).toBe(1);
    expect(progress).toHaveLength(1);
    expect(isArrangementExportCancelledError(await outcome)).toBe(true);
  });

  it('EC2 an abort after startRendering resolved but before the worker constructs no Worker', async () => {
    vi.stubGlobal('OfflineAudioContext', StepOfflineContext);
    vi.stubGlobal('Worker', FakeWorker);
    const controller = new AbortController();
    const outcome = outcomeOf(
      renderArrangementWav(cancelTestArrangement(), new Map(), undefined, {
        signal: controller.signal,
        onProgress: (phase, fraction) => {
          if (phase === 'render' && fraction === 1) {
            controller.abort();
          }
        },
      }),
    );
    await settleMicrotasks(2);
    renderLog.finishRender?.();
    expect(isArrangementExportCancelledError(await outcome)).toBe(true);
    expect(controller.signal.aborted).toBe(true);
    expect(FakeWorker.instances).toHaveLength(0);
  });

  it('EC3 GATE89-S1 a rejected resume() rejects the render with that error instead of hanging', async () => {
    vi.stubGlobal('OfflineAudioContext', RejectingResumeContext);
    const result = await outcomeOf(
      renderArrangementWav(cancelTestArrangement(), new Map(), undefined, {
        onProgress: () => undefined,
      }),
    );
    expect(result instanceof Error ? result.message : result).toBe('resume failed');
    expect(renderLog.resumes).toBeGreaterThan(0);
  });

  it('EC3 a rejected suspend() alone still renders', async () => {
    vi.stubGlobal('OfflineAudioContext', RejectingSuspendContext);
    const controller = new AbortController();
    const result = await renderArrangementWav(cancelTestArrangement(), new Map(), undefined, {
      onProgress: () => undefined,
      signal: controller.signal,
    });
    expect(result.blob.type).toBe('audio/wav');
    expect(renderLog.events.filter((event) => event === 'suspend')).toHaveLength(19);
    expect(renderLog.resumes).toBe(0);
  });
});

describe('EC4 encodeArrangementWavOffMainThread honours the signal', () => {
  const channels = () => [Float32Array.of(0.1, 0.2), Float32Array.of(-0.1, -0.2)];

  afterEach(() => {
    FakeWorker.instances = [];
    vi.unstubAllGlobals();
  });

  it('a pre-aborted signal rejects cancelled and constructs no Worker', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const controller = new AbortController();
    controller.abort();
    const result = await outcomeOf(
      encodeArrangementWavOffMainThread(channels(), 48000, undefined, controller.signal),
    );
    expect(isArrangementExportCancelledError(result)).toBe(true);
    expect(FakeWorker.instances).toHaveLength(0);
  });

  it('the no-Worker fallback checks the signal before it encodes', async () => {
    expect(typeof Worker).toBe('undefined');
    const controller = new AbortController();
    controller.abort();
    const progress = vi.fn();
    const result = await outcomeOf(
      encodeArrangementWavOffMainThread(channels(), 48000, progress, controller.signal),
    );
    expect(isArrangementExportCancelledError(result)).toBe(true);
    expect(progress).not.toHaveBeenCalled();
  });

  it('an abort mid-encode terminates once, rejects cancelled, and a later complete changes nothing', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const controller = new AbortController();
    const progress = vi.fn();
    const outcome = outcomeOf(
      encodeArrangementWavOffMainThread(channels(), 48000, progress, controller.signal),
    );
    const worker = lastWorker();
    worker.emit({ type: 'progress', fraction: 0.5 });
    controller.abort();
    expect(worker.terminated).toBe(1);
    worker.emit({ type: 'progress', fraction: 0.75 });
    worker.emit({ type: 'complete', bytes: new ArrayBuffer(4), peak: 0.2, clippedSamples: 0 });
    expect(isArrangementExportCancelledError(await outcome)).toBe(true);
    expect(worker.terminated).toBe(1);
    expect(progress.mock.calls).toEqual([[0.5]]);
  });

  it('removes the abort listener on complete and on a worker failure', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const controller = new AbortController();
    const add = vi.spyOn(controller.signal, 'addEventListener');
    const remove = vi.spyOn(controller.signal, 'removeEventListener');
    const done = encodeArrangementWavOffMainThread(channels(), 48000, undefined, controller.signal);
    lastWorker().emit({
      type: 'complete',
      bytes: new ArrayBuffer(4),
      peak: 0.2,
      clippedSamples: 0,
    });
    expect((await done).peak).toBe(0.2);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove.mock.calls[0]?.[1]).toBe(add.mock.calls[0]?.[1]);
    const failed = outcomeOf(
      encodeArrangementWavOffMainThread(channels(), 48000, undefined, controller.signal),
    );
    lastWorker().emit({ type: 'error', message: 'boom' });
    await failed;
    expect(remove).toHaveBeenCalledTimes(2);
    controller.abort();
    expect(FakeWorker.instances.map((worker) => worker.terminated)).toEqual([1, 1]);
  });

  it('a 3-argument call behaves as before: posts transferred channels, forwards progress, resolves on complete', async () => {
    vi.stubGlobal('Worker', FakeWorker);
    const input = channels();
    const progress = vi.fn();
    const done = encodeArrangementWavOffMainThread(input, 48000, progress);
    const worker = lastWorker();
    expect(worker.posted).toEqual({ channels: input, sampleRate: 48000 });
    expect(worker.transfer).toEqual(input.map((channel) => channel.buffer));
    worker.emit({ type: 'progress', fraction: 0.25 });
    const bytes = new ArrayBuffer(8);
    worker.emit({ type: 'complete', bytes, peak: 1.2, clippedSamples: 3 });
    expect(await done).toEqual({ bytes, peak: 1.2, clippedSamples: 3 });
    expect(progress.mock.calls).toEqual([[0.25]]);
    expect(worker.terminated).toBe(1);
  });
});
