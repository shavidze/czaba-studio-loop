import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ARRANGEMENT_MP3_CORE_BASE_URL,
  loadArrangementMp3Encoder,
  resetArrangementMp3Encoder,
} from '../mp3-encoder.client';

type ProgressHandler = (event: { progress: number; time: number }) => void;

const ffmpegFake = vi.hoisted(() => {
  interface Deferred {
    resolve: () => void;
    reject: (reason: Error) => void;
  }
  class ControlledFFmpeg {
    static instances: ControlledFFmpeg[] = [];
    static loadMode: 'resolve' | 'reject' | 'manual' = 'resolve';
    static exitCode = 0;
    static output: Uint8Array | string = Uint8Array.of(1, 2, 3);
    loadCalls: Array<{ coreURL?: string; wasmURL?: string }> = [];
    pendingLoad: Deferred | null = null;
    terminated = 0;
    written: Array<{ path: string; data: unknown }> = [];
    execArgs: string[][] = [];
    deleted: string[] = [];
    onCalls: Array<[string, ProgressHandler]> = [];
    offCalls: Array<[string, ProgressHandler]> = [];
    listeners = new Set<ProgressHandler>();
    progressDuringExec: number[] = [];
    constructor() {
      ControlledFFmpeg.instances.push(this);
    }
    load(config: { coreURL?: string; wasmURL?: string }) {
      this.loadCalls.push(config);
      if (ControlledFFmpeg.loadMode === 'reject') {
        return Promise.reject(new Error('core fetch failed'));
      }
      if (ControlledFFmpeg.loadMode === 'manual') {
        return new Promise<boolean>((resolve, reject) => {
          this.pendingLoad = { resolve: () => resolve(true), reject };
        });
      }
      return Promise.resolve(true);
    }
    terminate() {
      this.terminated += 1;
    }
    on(event: string, handler: ProgressHandler) {
      this.onCalls.push([event, handler]);
      this.listeners.add(handler);
    }
    off(event: string, handler: ProgressHandler) {
      this.offCalls.push([event, handler]);
      this.listeners.delete(handler);
    }
    writeFile(path: string, data: unknown) {
      this.written.push({ path, data });
      return Promise.resolve(true);
    }
    exec(args: string[]) {
      this.execArgs.push(args);
      for (const progress of this.progressDuringExec) {
        for (const listener of this.listeners) {
          listener({ progress, time: 0 });
        }
      }
      return Promise.resolve(ControlledFFmpeg.exitCode);
    }
    readFile() {
      return Promise.resolve(ControlledFFmpeg.output);
    }
    deleteFile(path: string) {
      this.deleted.push(path);
      return path === 'output.mp3' ? Promise.reject(new Error('missing')) : Promise.resolve(true);
    }
  }
  return { ControlledFFmpeg, toBlobURL: vi.fn() };
});

vi.mock('@ffmpeg/ffmpeg', () => ({ FFmpeg: ffmpegFake.ControlledFFmpeg }));
vi.mock('@ffmpeg/util', () => ({ toBlobURL: ffmpegFake.toBlobURL }));

const { ControlledFFmpeg } = ffmpegFake;

function instanceAt(index: number) {
  const instance = ControlledFFmpeg.instances[index];
  if (!instance) {
    throw new Error(`FFmpeg instance ${index} missing`);
  }
  return instance;
}

function readBlobBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer
        ? resolve(reader.result)
        : reject(new Error('blob bytes missing'));
    reader.onerror = () => reject(new Error('blob read failed'));
    reader.readAsArrayBuffer(blob);
  });
}

async function flushMicrotasks() {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

describe('SRW-20 stage 3a lab-owned MP3 encoder (D-29z52 R3)', () => {
  const hadArrayBuffer = 'arrayBuffer' in Blob.prototype;

  beforeAll(() => {
    if (!hadArrayBuffer) {
      Object.defineProperty(Blob.prototype, 'arrayBuffer', {
        configurable: true,
        value(this: Blob) {
          return readBlobBuffer(this);
        },
      });
    }
  });

  afterAll(() => {
    if (!hadArrayBuffer) {
      Reflect.deleteProperty(Blob.prototype, 'arrayBuffer');
    }
  });

  beforeEach(() => {
    ControlledFFmpeg.instances = [];
    ControlledFFmpeg.loadMode = 'resolve';
    ControlledFFmpeg.exitCode = 0;
    ControlledFFmpeg.output = Uint8Array.of(1, 2, 3);
    ffmpegFake.toBlobURL.mockReset();
    ffmpegFake.toBlobURL.mockImplementation((url: string) => Promise.resolve(`blob:${url}`));
  });

  afterEach(() => {
    resetArrangementMp3Encoder();
  });

  it('ME1 loads the unpkg core through toBlobURL once for concurrent callers and reuses the cached instance', async () => {
    const [first, second] = await Promise.all([
      loadArrangementMp3Encoder(),
      loadArrangementMp3Encoder(),
    ]);
    expect(ARRANGEMENT_MP3_CORE_BASE_URL).toBe('https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm');
    expect(ffmpegFake.toBlobURL.mock.calls).toEqual([
      ['https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js', 'text/javascript'],
      ['https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm', 'application/wasm'],
    ]);
    expect(ControlledFFmpeg.instances).toHaveLength(1);
    expect(instanceAt(0).loadCalls).toEqual([
      {
        coreURL: 'blob:https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'blob:https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      },
    ]);
    expect(typeof first.encode).toBe('function');
    expect(typeof second.encode).toBe('function');
    await loadArrangementMp3Encoder();
    expect(ControlledFFmpeg.instances).toHaveLength(1);
    expect(instanceAt(0).loadCalls).toHaveLength(1);
  });

  it('ME2 a rejected load terminates the instance and the next call builds a new FFmpeg', async () => {
    ControlledFFmpeg.loadMode = 'reject';
    await expect(loadArrangementMp3Encoder()).rejects.toThrow('core fetch failed');
    expect(instanceAt(0).terminated).toBe(1);
    ControlledFFmpeg.loadMode = 'resolve';
    await loadArrangementMp3Encoder();
    expect(ControlledFFmpeg.instances).toHaveLength(2);
    expect(instanceAt(1).loadCalls).toHaveLength(1);
    expect(instanceAt(1).terminated).toBe(0);
  });

  it('ME2 a rejected core download also terminates and clears the in-flight load', async () => {
    ffmpegFake.toBlobURL.mockRejectedValueOnce(new Error('unpkg aborted'));
    await expect(loadArrangementMp3Encoder()).rejects.toThrow('unpkg aborted');
    expect(instanceAt(0).terminated).toBe(1);
    expect(instanceAt(0).loadCalls).toHaveLength(0);
    await loadArrangementMp3Encoder();
    expect(ControlledFFmpeg.instances).toHaveLength(2);
  });

  it('ME3 reset during a pending load terminates it, the late resolution does not repopulate the cache, and the next call loads fresh', async () => {
    ControlledFFmpeg.loadMode = 'manual';
    const stale = loadArrangementMp3Encoder();
    const staleSettled = stale.then(
      () => 'resolved',
      () => 'rejected',
    );
    await flushMicrotasks();
    const pending = instanceAt(0).pendingLoad;
    expect(pending).not.toBeNull();
    resetArrangementMp3Encoder();
    expect(instanceAt(0).terminated).toBe(1);
    pending?.resolve();
    expect(await staleSettled).toBe('rejected');
    ControlledFFmpeg.loadMode = 'resolve';
    await loadArrangementMp3Encoder();
    expect(ControlledFFmpeg.instances).toHaveLength(2);
    expect(instanceAt(1).loadCalls).toHaveLength(1);
    await loadArrangementMp3Encoder();
    expect(ControlledFFmpeg.instances).toHaveLength(2);
  });

  it('ME3 reset while the core is still downloading never calls load on the stale instance', async () => {
    let finishDownload: (url: string) => void = () => undefined;
    ffmpegFake.toBlobURL.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          finishDownload = resolve;
        }),
    );
    const stale = loadArrangementMp3Encoder().catch(() => 'rejected');
    resetArrangementMp3Encoder();
    finishDownload('blob:core');
    expect(await stale).toBe('rejected');
    expect(instanceAt(0).loadCalls).toHaveLength(0);
    expect(instanceAt(0).terminated).toBe(1);
    expect(ffmpegFake.toBlobURL).toHaveBeenCalledTimes(1);
  });

  it('ME1 revokes both core blob URLs once the load settles', async () => {
    const revoke = vi.fn();
    vi.stubGlobal('URL', Object.assign(Object.create(URL), { revokeObjectURL: revoke }));
    try {
      await loadArrangementMp3Encoder();
    } finally {
      vi.unstubAllGlobals();
    }
    expect(revoke.mock.calls).toEqual([
      ['blob:https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js'],
      ['blob:https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm'],
    ]);
  });

  it('ME3 reset of a loaded encoder terminates it and the next call builds a new instance', async () => {
    await loadArrangementMp3Encoder();
    resetArrangementMp3Encoder();
    expect(instanceAt(0).terminated).toBe(1);
    await loadArrangementMp3Encoder();
    expect(ControlledFFmpeg.instances).toHaveLength(2);
  });

  it('ME4 encode runs the exact 9-argument command, returns an audio/mpeg Blob and deletes both files', async () => {
    const encoder = await loadArrangementMp3Encoder();
    const wav = new Blob([Uint8Array.of(82, 73, 70, 70)], { type: 'audio/wav' });
    const mp3 = await encoder.encode(wav);
    const ffmpeg = instanceAt(0);
    expect(ffmpeg.execArgs).toEqual([
      ['-i', 'input.wav', '-codec:a', 'libmp3lame', '-b:a', '320k', '-q:a', '0', 'output.mp3'],
    ]);
    expect(ffmpeg.written).toHaveLength(1);
    expect(ffmpeg.written[0]?.path).toBe('input.wav');
    expect(Array.from(new Uint8Array(await readBlobBuffer(wav)))).toEqual(
      Array.from(ffmpeg.written[0]?.data instanceof Uint8Array ? ffmpeg.written[0].data : []),
    );
    expect(mp3.type).toBe('audio/mpeg');
    expect(Array.from(new Uint8Array(await readBlobBuffer(mp3)))).toEqual([1, 2, 3]);
    expect(ffmpeg.deleted).toEqual(['input.wav', 'output.mp3']);
  });

  it('ME5 progress is forwarded clamped, non-finite values are ignored, and off removes the same handler on success and failure', async () => {
    const encoder = await loadArrangementMp3Encoder();
    const ffmpeg = instanceAt(0);
    ffmpeg.progressDuringExec = [0.25, Number.NaN, 1.5, -0.2, Number.POSITIVE_INFINITY, 0.5];
    const fractions: number[] = [];
    await encoder.encode(new Blob(['wav']), (fraction) => fractions.push(fraction));
    expect(fractions).toEqual([0.25, 1, 0, 0.5]);
    expect(ffmpeg.onCalls).toHaveLength(1);
    expect(ffmpeg.offCalls).toEqual([ffmpeg.onCalls[0]]);
    expect(ffmpeg.onCalls[0]?.[0]).toBe('progress');
    expect(ffmpeg.listeners.size).toBe(0);
    ControlledFFmpeg.exitCode = 1;
    await expect(encoder.encode(new Blob(['wav']), () => undefined)).rejects.toThrow();
    expect(ffmpeg.onCalls).toHaveLength(2);
    expect(ffmpeg.offCalls).toHaveLength(2);
    expect(ffmpeg.offCalls[1]).toEqual(ffmpeg.onCalls[1]);
    expect(ffmpeg.listeners.size).toBe(0);
  });

  it('ME6 a non-zero exit code rejects with the exit code and still cleans up', async () => {
    const encoder = await loadArrangementMp3Encoder();
    ControlledFFmpeg.exitCode = 3;
    await expect(encoder.encode(new Blob(['wav']))).rejects.toThrow('ffmpeg exit code 3');
    expect(instanceAt(0).deleted).toEqual(['input.wav', 'output.mp3']);
  });
});
