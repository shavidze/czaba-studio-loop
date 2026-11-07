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

export function summarizePcmLive(entries: readonly PcmLiveEntry[]): PcmLiveSummary {
  const summary: PcmLiveSummary = { count: 0, bytes: 0, byOrigin: {} };
  for (const entry of entries) {
    if (entry.probe) continue;
    const bytes = entry.length * entry.numberOfChannels * 4;
    summary.count += 1;
    summary.bytes += bytes;
    summary.byOrigin[entry.origin] = (summary.byOrigin[entry.origin] ?? 0) + bytes;
  }
  return summary;
}

export function pcmLiveProblems(reading: PcmLiveReading, expectedCount: number): string[] {
  if (!reading.registryPresent) return ['pcm registry missing'];
  const problems: string[] = [];
  if (!reading.entries.some((entry) => entry.probe)) {
    problems.push('pcm registry did not count its probe buffer');
  }
  const { count } = summarizePcmLive(reading.entries);
  if (count !== expectedCount) {
    problems.push(`pcm live count ${count} ≠ ${expectedCount} library sources`);
  }
  return problems;
}

export async function readPcmLiveAfterGc(cdp: CDPSession, page: Page): Promise<PcmLiveReading> {
  await page.evaluate(() => {
    window.__czabaPcmProbe = new AudioBuffer({ length: 1, numberOfChannels: 1, sampleRate: 48000 });
  });
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
