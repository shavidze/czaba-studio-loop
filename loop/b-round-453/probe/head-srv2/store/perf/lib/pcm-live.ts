import type { CDPSession, Page } from '@playwright/test';

export type PcmLiveOrigin = 'decode' | 'createBuffer' | 'ctor' | 'render';

export interface PcmLiveEntry {
  length: number;
  numberOfChannels: number;
  origin: PcmLiveOrigin;
  probe: boolean;
}

export interface PcmLiveReading {
  registryPresent: boolean;
  entries: PcmLiveEntry[];
}

export interface PcmLiveBounds {
  placed: number;
  library: number;
}

export type PcmProbeKind = 'kept' | 'dropped' | 'decode';

export interface PcmProbeShapes {
  readonly dropped: { readonly length: number; readonly numberOfChannels: number };
  readonly decode: {
    readonly length: number;
    readonly numberOfChannels: number;
    readonly sampleRate: number;
  };
}

export const pcmProbeShapes: PcmProbeShapes = {
  dropped: { length: 2, numberOfChannels: 1 },
  decode: { length: 480, numberOfChannels: 1, sampleRate: 48000 },
};

export interface PcmLiveSummary {
  count: number;
  bytes: number;
  byOrigin: Partial<Record<PcmLiveOrigin, number>>;
}

interface PcmLiveRegistry {
  read: (probe: AudioBuffer | null) => PcmLiveEntry[];
}

declare global {
  interface Window {
    __czabaPcm?: PcmLiveRegistry;
    __czabaPcmProbe?: AudioBuffer;
    __czabaPcmDecodeProbe?: AudioBuffer;
  }
}

const pcmGcGapMs = 100;

export function installPcmLiveRegistry(): void {
  if (window.__czabaPcm) return;
  const refs: { ref: WeakRef<AudioBuffer>; origin: PcmLiveOrigin }[] = [];
  const track = <T extends AudioBuffer>(buffer: T, origin: PcmLiveOrigin): T => {
    refs.push({ ref: new WeakRef(buffer), origin });
    return buffer;
  };
  const proto = BaseAudioContext.prototype;
  const nativeDecode = proto.decodeAudioData;
  const trackedDecode = function (
    this: BaseAudioContext,
    ...args: Parameters<BaseAudioContext['decodeAudioData']>
  ): Promise<AudioBuffer> {
    return nativeDecode.apply(this, args).then((buffer) => track(buffer, 'decode'));
  };
  proto.decodeAudioData = trackedDecode;
  const nativeCreateBuffer = proto.createBuffer;
  proto.createBuffer = function (
    this: BaseAudioContext,
    ...args: Parameters<BaseAudioContext['createBuffer']>
  ): AudioBuffer {
    return track(nativeCreateBuffer.apply(this, args), 'createBuffer');
  };
  const NativeAudioBuffer = window.AudioBuffer;
  class TrackedAudioBuffer extends NativeAudioBuffer {
    constructor(options: AudioBufferOptions) {
      super(options);
      track(this, 'ctor');
    }
  }
  window.AudioBuffer = TrackedAudioBuffer;
  const nativeRender = OfflineAudioContext.prototype.startRendering;
  OfflineAudioContext.prototype.startRendering = function (
    this: OfflineAudioContext,
  ): Promise<AudioBuffer> {
    return nativeRender.call(this).then((buffer) => track(buffer, 'render'));
  };
  window.__czabaPcm = {
    read: (probe) => {
      const entries: PcmLiveEntry[] = [];
      for (const { ref, origin } of refs) {
        const buffer = ref.deref();
        if (!buffer) continue;
        entries.push({
          length: buffer.length,
          numberOfChannels: buffer.numberOfChannels,
          origin,
          probe: probe !== null && buffer === probe,
        });
      }
      return entries;
    },
  };
}

export function classifyPcmProbe(entry: PcmLiveEntry): PcmProbeKind | null {
  if (entry.probe) return 'kept';
  if (entry.numberOfChannels !== 1) return null;
  if (entry.origin === 'decode' && entry.length === pcmProbeShapes.decode.length) return 'decode';
  if (entry.origin !== 'decode' && entry.length === pcmProbeShapes.dropped.length) return 'dropped';
  return null;
}

export function summarizePcmLive(entries: readonly PcmLiveEntry[]): PcmLiveSummary {
  const summary: PcmLiveSummary = { count: 0, bytes: 0, byOrigin: {} };
  for (const entry of entries) {
    if (classifyPcmProbe(entry) !== null) continue;
    const bytes = entry.length * entry.numberOfChannels * 4;
    summary.count += 1;
    summary.bytes += bytes;
    summary.byOrigin[entry.origin] = (summary.byOrigin[entry.origin] ?? 0) + bytes;
  }
  return summary;
}

export function pcmLiveProblems(reading: PcmLiveReading, bounds: PcmLiveBounds): string[] {
  if (!reading.registryPresent) return ['pcm registry missing'];
  const problems: string[] = [];
  const probes = reading.entries.map(classifyPcmProbe);
  if (!probes.includes('kept')) {
    problems.push('pcm registry did not count its probe buffer');
  }
  if (probes.filter((kind) => kind === 'decode').length !== 1) {
    problems.push('pcm registry did not count its decode probe');
  }
  if (probes.includes('dropped')) {
    problems.push('pcm registry kept a dropped probe');
  }
  const { count } = summarizePcmLive(reading.entries);
  if (count < bounds.placed || count > bounds.library) {
    problems.push(`pcm live count ${count} outside [${bounds.placed}, ${bounds.library}]`);
  }
  return problems;
}

export async function readPcmLiveAfterGc(cdp: CDPSession, page: Page): Promise<PcmLiveReading> {
  await page.evaluate(async (shapes) => {
    window.__czabaPcmProbe = new AudioBuffer({ length: 1, numberOfChannels: 1, sampleRate: 48000 });
    new AudioBuffer({ ...shapes.dropped, sampleRate: 48000 });
    const { length, sampleRate } = shapes.decode;
    const wav = new DataView(new ArrayBuffer(44 + length * 2));
    const ascii = (offset: number, text: string) => {
      for (let index = 0; index < text.length; index += 1) {
        wav.setUint8(offset + index, text.charCodeAt(index));
      }
    };
    ascii(0, 'RIFF');
    wav.setUint32(4, 36 + length * 2, true);
    ascii(8, 'WAVE');
    ascii(12, 'fmt ');
    wav.setUint32(16, 16, true);
    wav.setUint16(20, 1, true);
    wav.setUint16(22, 1, true);
    wav.setUint32(24, sampleRate, true);
    wav.setUint32(28, sampleRate * 2, true);
    wav.setUint16(32, 2, true);
    wav.setUint16(34, 16, true);
    ascii(36, 'data');
    wav.setUint32(40, length * 2, true);
    const decodeContext = new OfflineAudioContext({ numberOfChannels: 1, length: 1, sampleRate });
    window.__czabaPcmDecodeProbe = await decodeContext.decodeAudioData(wav.buffer);
  }, pcmProbeShapes);
  await cdp.send('HeapProfiler.collectGarbage');
  await page.waitForTimeout(pcmGcGapMs);
  await cdp.send('HeapProfiler.collectGarbage');
  return page.evaluate((): PcmLiveReading => {
    const registry = window.__czabaPcm;
    const probe = window.__czabaPcmProbe ?? null;
    delete window.__czabaPcmProbe;
    if (!registry) return { registryPresent: false, entries: [] };
    return { registryPresent: true, entries: registry.read(probe) };
  });
}
