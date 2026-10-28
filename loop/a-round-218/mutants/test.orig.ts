import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ProgressHandler = (progress: number, processedTime: number) => unknown;

const mediabunnyFake = vi.hoisted(() => {
  const WAVE = { name: 'WAVE' };
  const registerMp3Encoder = vi.fn();

  class FakeBlobSource {
    static instances: FakeBlobSource[] = [];
    blob: Blob;
    constructor(blob: Blob) {
      this.blob = blob;
      FakeBlobSource.instances.push(this);
    }
  }

  class FakeInput {
    static instances: FakeInput[] = [];
    options: { formats: unknown[]; source: unknown };
    disposed = 0;
    constructor(options: { formats: unknown[]; source: unknown }) {
      this.options = options;
      FakeInput.instances.push(this);
    }
    dispose() {
      this.disposed += 1;
    }
  }

  class FakeBufferTarget {
    buffer: ArrayBuffer | null = null;
  }

  class FakeMp3OutputFormat {}

  class FakeOutput {
    options: { format: unknown; target: FakeBufferTarget };
    constructor(options: { format: unknown; target: FakeBufferTarget }) {
      this.options = options;
    }
  }

  class FakeQuality {
    options: unknown;
    constructor(options: unknown) {
      this.options = options;
    }
  }

  interface FakeConversionOptions {
    input: FakeInput;
    output: FakeOutput;
    audio: Record<string, unknown>;
  }

  class FakeConversion {
    static instances: FakeConversion[] = [];
    static nextIsValid = true;
    static nextDiscardedReasons: string[] = [];
    static executeMode: 'resolve' | 'reject' | 'manual' = 'resolve';
    static output: Uint8Array | null = Uint8Array.of(1, 2, 3);
    static progressDuringExecute: number[] = [];
    static initMode: 'resolve' | 'reject' | 'manual' = 'resolve';
    static releasePendingInit: (() => void) | null = null;
    options: FakeConversionOptions;
    onProgress?: ProgressHandler;
    isValid: boolean;
    discardedTracks: Array<{ reason: string }>;
    executeCalls = 0;
    cancelCalls = 0;
    hadProgressAtExecute: boolean | null = null;
    rejectPendingExecute: ((reason: Error) => void) | null = null;
    constructor(options: FakeConversionOptions) {
      this.options = options;
      this.isValid = FakeConversion.nextIsValid;
      this.discardedTracks = FakeConversion.nextDiscardedReasons.map((reason) => ({ reason }));
      FakeConversion.instances.push(this);
    }
    static init(options: FakeConversionOptions) {
      if (FakeConversion.initMode === 'reject') {
        return Promise.reject(new Error('bad WAV header'));
      }
      if (FakeConversion.initMode === 'manual') {
        return new Promise<FakeConversion>((resolveInit) => {
          FakeConversion.releasePendingInit = () => resolveInit(new FakeConversion(options));
        });
      }
      return Promise.resolve(new FakeConversion(options));
    }
    execute() {
      this.executeCalls += 1;
      this.hadProgressAtExecute = typeof this.onProgress === 'function';
      for (const progress of FakeConversion.progressDuringExecute) {
        this.onProgress?.(progress, 0);
      }
      if (FakeConversion.executeMode === 'reject') {
        return Promise.reject(new Error('lame crashed'));
      }
      if (FakeConversion.executeMode === 'manual') {
        return new Promise<void>((_resolve, reject) => {
          this.rejectPendingExecute = reject;
        });
      }
      const bytes = FakeConversion.output;
      this.options.output.options.target.buffer = bytes ? bytes.slice().buffer : null;
      return Promise.resolve();
    }
    cancel() {
      this.cancelCalls += 1;
      this.rejectPendingExecute?.(new Error('Conversion was canceled.'));
      return Promise.resolve();
    }
  }

  return {
    WAVE,
    registerMp3Encoder,
    FakeBlobSource,
    FakeInput,
    FakeBufferTarget,
    FakeMp3OutputFormat,
    FakeOutput,
    FakeQuality,
    FakeConversion,
  };
});

vi.mock('mediabunny', () => ({
  WAVE: mediabunnyFake.WAVE,
  BlobSource: mediabunnyFake.FakeBlobSource,
  Input: mediabunnyFake.FakeInput,
  BufferTarget: mediabunnyFake.FakeBufferTarget,
  Mp3OutputFormat: mediabunnyFake.FakeMp3OutputFormat,
  Output: mediabunnyFake.FakeOutput,
  Quality: mediabunnyFake.FakeQuality,
  Conversion: mediabunnyFake.FakeConversion,
}));
vi.mock('@mediabunny/mp3-encoder', () => ({
  registerMp3Encoder: mediabunnyFake.registerMp3Encoder,
}));

const { FakeBlobSource, FakeConversion, FakeInput, registerMp3Encoder } = mediabunnyFake;

const STORE_ROOT = resolve(__dirname, '../../../..');
const APP_ROOT = join(STORE_ROOT, 'app');
const ENCODER_MODULE_PATH = join(APP_ROOT, 'lib/arrangement/mp3-encoder.client.ts');
const MEDIABUNNY_STATIC_IMPORT =
  /^\s*(import|export)\s+(type\s+)?[^;'"]*?from\s+['"](mediabunny|@mediabunny\/[^'"]+)['"]/gm;
const MEDIABUNNY_BARE_IMPORT = /import\s+['"](mediabunny|@mediabunny\/[^'"]+)['"]/;
const MEDIABUNNY_DYNAMIC_IMPORT = /import\(\s*['"](mediabunny|@mediabunny\/)/;
const ENCODER_MODULE_REFERENCE = /mp3-encoder\.client/g;
const ENCODER_RUNTIME_IMPORT =
  /(?<!typeof\s)import\(\s*['"]~\/lib\/arrangement\/mp3-encoder\.client['"]\s*\)/g;
const ENCODER_DYNAMIC_IMPORT = /import\(\s*['"]~\/lib\/arrangement\/mp3-encoder\.client['"]\s*\)/g;

function listAppSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : listAppSourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function hasMediabunnyValueImport(source: string): boolean {
  const staticValueImport = Array.from(source.matchAll(MEDIABUNNY_STATIC_IMPORT)).some(
    (match) => !match[2],
  );
  return (
    staticValueImport ||
    MEDIABUNNY_BARE_IMPORT.test(source) ||
    MEDIABUNNY_DYNAMIC_IMPORT.test(source)
  );
}

function scanMp3EncoderImportBoundary(files: string[]): string[] {
  const violations: string[] = [];
  for (const file of files) {
    const source = readFileSync(file, 'utf-8');
    const label = relative(STORE_ROOT, file);
    if (file !== ENCODER_MODULE_PATH && hasMediabunnyValueImport(source)) {
      violations.push(`${label}: value import of mediabunny`);
    }
    const references = source.match(ENCODER_MODULE_REFERENCE)?.length ?? 0;
    const dynamicImports = source.match(ENCODER_DYNAMIC_IMPORT)?.length ?? 0;
    if (file !== ENCODER_MODULE_PATH && references !== dynamicImports) {
      violations.push(`${label}: non-dynamic reference to mp3-encoder.client`);
    }
  }
  return violations;
}

function readBlobBytes(blob: Blob): Promise<number[]> {
  return new Promise<number[]>((resolveBytes, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer
        ? resolveBytes(Array.from(new Uint8Array(reader.result)))
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

function conversionAt(index: number) {
  const conversion = FakeConversion.instances[index];
  if (!conversion) {
    throw new Error(`Conversion ${index} missing`);
  }
  return conversion;
}

function inputAt(index: number) {
  const input = FakeInput.instances[index];
  if (!input) {
    throw new Error(`Input ${index} missing`);
  }
  return input;
}

async function importEncoderModule() {
  vi.resetModules();
  return import('../mp3-encoder.client');
}

describe('SRW-20 stage 3a + PERF-16a lab-owned MP3 encoder (mediabunny + LAME)', () => {
  let encoderModule: Awaited<ReturnType<typeof importEncoderModule>> | null = null;

  beforeEach(async () => {
    registerMp3Encoder.mockReset();
    FakeBlobSource.instances = [];
    FakeInput.instances = [];
    FakeConversion.instances = [];
    FakeConversion.nextIsValid = true;
    FakeConversion.nextDiscardedReasons = [];
    FakeConversion.executeMode = 'resolve';
    FakeConversion.output = Uint8Array.of(1, 2, 3);
    FakeConversion.progressDuringExecute = [];
    FakeConversion.initMode = 'resolve';
    FakeConversion.releasePendingInit = null;
    encoderModule = await importEncoderModule();
  });

  afterEach(() => {
    encoderModule?.resetArrangementMp3Encoder();
    encoderModule = null;
  });

  function loadedModule() {
    if (!encoderModule) {
      throw new Error('encoder module not imported');
    }
    return encoderModule;
  }

  it('ME1 registers nothing at import, shares one load across concurrent callers and registers exactly once', async () => {
    const { loadArrangementMp3Encoder } = loadedModule();
    expect(registerMp3Encoder).toHaveBeenCalledTimes(0);
    const [first, second] = await Promise.all([
      loadArrangementMp3Encoder(),
      loadArrangementMp3Encoder(),
    ]);
    expect(registerMp3Encoder).toHaveBeenCalledTimes(1);
    await first.encode(new Blob(['wav']));
    await second.encode(new Blob(['wav']));
    await loadArrangementMp3Encoder();
    expect(registerMp3Encoder).toHaveBeenCalledTimes(1);
    expect(FakeConversion.instances).toHaveLength(2);
  });

  it('ME2 a load whose registration throws clears the in-flight load and the next call registers again', async () => {
    const { loadArrangementMp3Encoder } = loadedModule();
    registerMp3Encoder.mockImplementationOnce(() => {
      throw new Error('register failed');
    });
    await expect(loadArrangementMp3Encoder()).rejects.toThrow('register failed');
    const encoder = await loadArrangementMp3Encoder();
    expect(registerMp3Encoder).toHaveBeenCalledTimes(2);
    expect(typeof encoder.encode).toBe('function');
  });

  it('ME3(a) reset during a pending load: the late resolution does not populate the newer generation and the next call loads fresh', async () => {
    const { loadArrangementMp3Encoder, resetArrangementMp3Encoder } = loadedModule();
    const stale = loadArrangementMp3Encoder();
    resetArrangementMp3Encoder();
    await expect(stale).rejects.toThrow('MP3 encoder reset during load');
    expect(registerMp3Encoder).toHaveBeenCalledTimes(0);
    await loadArrangementMp3Encoder();
    expect(registerMp3Encoder).toHaveBeenCalledTimes(1);
    await loadArrangementMp3Encoder();
    expect(registerMp3Encoder).toHaveBeenCalledTimes(1);
  });

  it('ME3(b) reset during an encode cancels that Conversion exactly once, rejects the encode and drops later progress', async () => {
    const { loadArrangementMp3Encoder, resetArrangementMp3Encoder } = loadedModule();
    const encoder = await loadArrangementMp3Encoder();
    FakeConversion.executeMode = 'manual';
    const fractions: number[] = [];
    const encoding = encoder.encode(new Blob(['wav']), (fraction) => fractions.push(fraction));
    const settled = encoding.then(
      () => 'resolved',
      (reason: unknown) => (reason instanceof Error ? reason.message : 'rejected'),
    );
    await flushMicrotasks();
    const conversion = conversionAt(0);
    expect(conversion.executeCalls).toBe(1);
    conversion.onProgress?.(0.3, 0);
    resetArrangementMp3Encoder();
    expect(conversion.cancelCalls).toBe(1);
    conversion.onProgress?.(0.7, 0);
    expect(await settled).toBe('Conversion was canceled.');
    resetArrangementMp3Encoder();
    expect(conversion.cancelCalls).toBe(1);
    expect(fractions).toEqual([0.3]);
    expect(inputAt(0).disposed).toBe(1);
  });

  it('ME3(b) reset while Conversion.init is pending rejects the encode and never executes or cancels the late Conversion', async () => {
    const { loadArrangementMp3Encoder, resetArrangementMp3Encoder } = loadedModule();
    const encoder = await loadArrangementMp3Encoder();
    FakeConversion.initMode = 'manual';
    const encoding = encoder.encode(new Blob(['wav']));
    const settled = encoding.then(
      () => 'resolved',
      (reason: unknown) => (reason instanceof Error ? reason.message : 'rejected'),
    );
    await flushMicrotasks();
    expect(FakeConversion.releasePendingInit).not.toBeNull();
    resetArrangementMp3Encoder();
    FakeConversion.releasePendingInit?.();
    expect(await settled).toBe('MP3 encoder reset during encode');
    const lateConversion = conversionAt(0);
    expect(lateConversion.executeCalls).toBe(0);
    expect(lateConversion.cancelCalls).toBe(0);
    expect(inputAt(0).disposed).toBe(1);
  });

  it('ME3(c) an encoder obtained before a reset rejects a new encode and constructs no Conversion', async () => {
    const { loadArrangementMp3Encoder, resetArrangementMp3Encoder } = loadedModule();
    const stale = await loadArrangementMp3Encoder();
    resetArrangementMp3Encoder();
    await expect(stale.encode(new Blob(['wav']))).rejects.toThrow('MP3 encoder was reset');
    expect(FakeConversion.instances).toHaveLength(0);
    expect(FakeInput.instances).toHaveLength(0);
    const fresh = await loadArrangementMp3Encoder();
    expect(registerMp3Encoder).toHaveBeenCalledTimes(2);
    const mp3 = await fresh.encode(new Blob(['wav']));
    expect(mp3.type).toBe('audio/mpeg');
  });

  it('ME3(d) a reset with nothing in flight is a no-op and does not throw', async () => {
    const { loadArrangementMp3Encoder, resetArrangementMp3Encoder } = loadedModule();
    expect(() => resetArrangementMp3Encoder()).not.toThrow();
    expect(() => resetArrangementMp3Encoder()).not.toThrow();
    const encoder = await loadArrangementMp3Encoder();
    await encoder.encode(new Blob(['wav']));
    expect(() => resetArrangementMp3Encoder()).not.toThrow();
    expect(conversionAt(0).cancelCalls).toBe(0);
  });

  it('ME4 builds the exact Conversion config: WAVE input over the same Blob, MP3 output to a BufferTarget, 320 kbps Quality', async () => {
    const { loadArrangementMp3Encoder } = loadedModule();
    const encoder = await loadArrangementMp3Encoder();
    const wav = new Blob([Uint8Array.of(82, 73, 70, 70)], { type: 'audio/wav' });
    const mp3 = await encoder.encode(wav);
    const input = inputAt(0);
    expect(input.options.formats).toHaveLength(1);
    expect(input.options.formats[0]).toBe(mediabunnyFake.WAVE);
    expect(FakeBlobSource.instances).toHaveLength(1);
    expect(FakeBlobSource.instances[0]?.blob).toBe(wav);
    expect(input.options.source).toBe(FakeBlobSource.instances[0]);
    const conversion = conversionAt(0);
    expect(conversion.options.input).toBe(input);
    expect(conversion.options.output.options.format).toBeInstanceOf(
      mediabunnyFake.FakeMp3OutputFormat,
    );
    expect(conversion.options.output.options.target).toBeInstanceOf(
      mediabunnyFake.FakeBufferTarget,
    );
    expect(Object.keys(conversion.options.audio).sort()).toEqual(['codec', 'quality']);
    expect(conversion.options.audio.codec).toBe('mp3');
    const quality = conversion.options.audio.quality;
    expect(quality).toBeInstanceOf(mediabunnyFake.FakeQuality);
    expect(quality instanceof mediabunnyFake.FakeQuality ? quality.options : null).toEqual({
      bitrate: 320000,
    });
    expect(mp3.type).toBe('audio/mpeg');
    expect(await readBlobBytes(mp3)).toEqual([1, 2, 3]);
    expect(input.disposed).toBe(1);
  });

  it('ME5 progress is forwarded clamped to [0, 1], non-finite values are ignored, and onProgress is set before execute', async () => {
    const { loadArrangementMp3Encoder } = loadedModule();
    const encoder = await loadArrangementMp3Encoder();
    FakeConversion.progressDuringExecute = [
      0.25,
      Number.NaN,
      1.5,
      -0.2,
      Number.POSITIVE_INFINITY,
      0.5,
    ];
    const fractions: number[] = [];
    await encoder.encode(new Blob(['wav']), (fraction) => fractions.push(fraction));
    expect(fractions).toEqual([0.25, 1, 0, 0.5]);
    expect(conversionAt(0).hadProgressAtExecute).toBe(true);
    await expect(encoder.encode(new Blob(['wav']))).resolves.toBeInstanceOf(Blob);
  });

  it('ME6 an invalid Conversion rejects with the discard reason and execute is never called', async () => {
    const { loadArrangementMp3Encoder } = loadedModule();
    const encoder = await loadArrangementMp3Encoder();
    FakeConversion.nextIsValid = false;
    FakeConversion.nextDiscardedReasons = ['no_encodable_target_codec'];
    await expect(encoder.encode(new Blob(['wav']))).rejects.toThrow('no_encodable_target_codec');
    expect(conversionAt(0).executeCalls).toBe(0);
    expect(inputAt(0).disposed).toBe(1);
  });

  it('ME7 an execute or init rejection propagates and dispose still runs; a null target buffer rejects', async () => {
    const { loadArrangementMp3Encoder } = loadedModule();
    const encoder = await loadArrangementMp3Encoder();
    FakeConversion.executeMode = 'reject';
    await expect(encoder.encode(new Blob(['wav']))).rejects.toThrow('lame crashed');
    expect(inputAt(0).disposed).toBe(1);
    FakeConversion.executeMode = 'resolve';
    FakeConversion.output = null;
    await expect(encoder.encode(new Blob(['wav']))).rejects.toThrow('MP3 encoder produced no data');
    expect(inputAt(1).disposed).toBe(1);
    FakeConversion.initMode = 'reject';
    await expect(encoder.encode(new Blob(['wav']))).rejects.toThrow('bad WAV header');
    expect(inputAt(2).disposed).toBe(1);
  });

  it('ME8 our encode code never reads the whole WAV Blob itself (no arrayBuffer, bytes, stream or text call; the fake BlobSource does not read)', async () => {
    const { loadArrangementMp3Encoder } = loadedModule();
    const encoder = await loadArrangementMp3Encoder();
    const wav = new Blob(['RIFF....WAVE'], { type: 'audio/wav' });
    const readers = {
      arrayBuffer: vi.fn(),
      bytes: vi.fn(),
      stream: vi.fn(),
      text: vi.fn(),
    };
    for (const [name, spy] of Object.entries(readers)) {
      Object.defineProperty(wav, name, { configurable: true, value: spy });
    }
    await encoder.encode(wav);
    expect(readers.arrayBuffer).not.toHaveBeenCalled();
    expect(readers.bytes).not.toHaveBeenCalled();
    expect(readers.stream).not.toHaveBeenCalled();
    expect(readers.text).not.toHaveBeenCalled();
    expect(FakeBlobSource.instances[0]?.blob).toBe(wav);
  });

  it('ME9 only mp3-encoder.client imports mediabunny, it is reached only through dynamic import(), and it has no ffmpeg or unpkg', () => {
    const files = listAppSourceFiles(APP_ROOT);
    expect(files).toContain(ENCODER_MODULE_PATH);
    expect(scanMp3EncoderImportBoundary(files)).toEqual([]);
    const encoderSource = readFileSync(ENCODER_MODULE_PATH, 'utf-8');
    expect(hasMediabunnyValueImport(encoderSource)).toBe(true);
    expect(encoderSource).not.toContain('@ffmpeg');
    expect(encoderSource).not.toContain('unpkg');
    const contextSource = readFileSync(join(APP_ROOT, 'contexts/ArrangementContext.tsx'), 'utf-8');
    expect(contextSource.match(ENCODER_RUNTIME_IMPORT)?.length ?? 0).toBeGreaterThan(0);
  });

  it('ME9 named mutant: a scratch copy of a real app file with a static mediabunny import is flagged', () => {
    const scratchDirectory = mkdtempSync(join(tmpdir(), 'me9-'));
    try {
      const realSource = readFileSync(join(APP_ROOT, 'lib/arrangement/strings.ts'), 'utf-8');
      const bareMutant = join(scratchDirectory, 'strings-bare.ts');
      const namedMutant = join(scratchDirectory, 'strings-named.ts');
      const staticClientMutant = join(scratchDirectory, 'strings-client.ts');
      writeFileSync(bareMutant, `import 'mediabunny';\n${realSource}`);
      writeFileSync(
        namedMutant,
        `import { Conversion } from '@mediabunny/mp3-encoder';\n${realSource}`,
      );
      writeFileSync(
        staticClientMutant,
        `import { loadArrangementMp3Encoder } from '~/lib/arrangement/mp3-encoder.client';\n${realSource}`,
      );
      const typeOnly = join(scratchDirectory, 'strings-type.ts');
      writeFileSync(typeOnly, `import type { Conversion } from 'mediabunny';\n${realSource}`);
      expect(scanMp3EncoderImportBoundary([bareMutant])).toHaveLength(1);
      expect(scanMp3EncoderImportBoundary([namedMutant])).toHaveLength(1);
      expect(scanMp3EncoderImportBoundary([staticClientMutant])).toHaveLength(1);
      expect(scanMp3EncoderImportBoundary([typeOnly])).toEqual([]);
    } finally {
      rmSync(scratchDirectory, { recursive: true, force: true });
    }
  });
});
