import type { Arrangement, ArrangementTrack, ScheduledClip } from '~/types/arrangement';
import { type ClipEnvelopeShape, clipEnvelopeGainAtSource, clipEnvelopeShapes } from './envelope';
import { arrangementRenderSuspendFrames } from './export-progress';
import { type ExportOverloadReport, measureExportOverload } from './export-wav';
import { encodeArrangementWavOffMainThread } from './export-wav.client';
import { type ClipFadeShape, clipFadeGainAt, clipFadeShapes } from './fades';
import type { MetronomeClick } from './metronome';
import { clipLinearGains, masterLinearGain, projectEnd } from './model';
import { isTrackAudible, planSchedule, trackEffectiveGains } from './schedule';

export const ARRANGEMENT_EXPORT_SAMPLE_RATE = 48000;
const GAIN_TIME_CONSTANT = 0.015;
const MUTE_TIME_CONSTANT = 0.003;

export interface ScheduleAudioParam {
  value: number;
  setTargetAtTime(target: number, startTime: number, timeConstant: number): unknown;
  setValueAtTime?(value: number, startTime: number): unknown;
  linearRampToValueAtTime?(value: number, endTime: number): unknown;
}

export interface ScheduleAudioNode {
  connect(destination: ScheduleAudioNode): unknown;
  disconnect(): void;
}

export interface ScheduleGainNode extends ScheduleAudioNode {
  gain: ScheduleAudioParam;
}

export interface SchedulePannerNode extends ScheduleAudioNode {
  pan: ScheduleAudioParam;
}

export interface ScheduleSourceNode<TBuffer> extends ScheduleAudioNode {
  buffer: TBuffer | null;
  onended: ((event: Event) => unknown) | null;
  start(when: number, offset: number, duration: number): void;
  stop(when?: number): void;
}

export interface ScheduleAudioContext<TBuffer> {
  readonly currentTime: number;
  readonly destination: ScheduleAudioNode;
  createBufferSource(): ScheduleSourceNode<TBuffer>;
  createGain(): ScheduleGainNode;
  createStereoPanner(): SchedulePannerNode;
}

export interface ApplyScheduleOptions<TBuffer> {
  buffers: ReadonlyMap<string, TBuffer>;
  tracks: readonly ArrangementTrack[];
  from: number;
  startAt: number;
  masterGain?: number;
  tap?: ScheduleAudioNode;
  trackTaps?: ReadonlyMap<string, ScheduleAudioNode>;
  clipGains?: ReadonlyMap<string, number>;
  trackGains?: ReadonlyMap<string, number>;
  clipFades?: ReadonlyMap<string, ClipFadeShape>;
  clipEnvelopes?: ReadonlyMap<string, ClipEnvelopeShape>;
  metronome?: { accent: TBuffer; beat: TBuffer; clicks: readonly MetronomeClick[] };
}

export interface ScheduleHandle {
  appendPlan(plan: readonly ScheduledClip[], from: number, startAt: number): void;
  appendClicks(clicks: readonly MetronomeClick[], from: number, startAt: number): void;
  stop(when?: number): void;
  disconnect(): void;
  setTrackGain(trackId: string, value: number): void;
  setMasterGain(value: number): void;
  setClipGain(clipId: string, value: number): void;
  setTrackPan(trackId: string, value: number): void;
  activeSourceCount(): number;
}

export type { ExportOverloadReport };
export { measureExportOverload };

export interface ArrangementWavResult extends ExportOverloadReport {
  blob: Blob;
}

export interface ArrangementRenderWindow {
  start: number;
  end: number;
}

export interface ArrangementRenderOptions {
  onProgress?: (phase: 'render' | 'wav', fraction: number) => void;
}

function scheduleClipFadeGain(
  fadeGain: ScheduleGainNode,
  shape: ClipFadeShape,
  item: ScheduledClip,
  from: number,
  startAt: number,
) {
  const at = (time: number) => startAt + (time - from);
  const end = shape.start + shape.duration;
  const initial = clipFadeGainAt(shape, item.when);
  fadeGain.gain.value = initial;
  fadeGain.gain.setValueAtTime?.(initial, at(item.when));
  const fadeInEnd = shape.start + shape.fadeIn;
  if (shape.fadeIn > 0 && item.when < fadeInEnd) {
    fadeGain.gain.linearRampToValueAtTime?.(1, at(fadeInEnd));
  }
  if (shape.fadeOut <= 0) {
    return;
  }
  const fadeOutStart = Math.max(end - shape.fadeOut, fadeInEnd);
  if (item.when < fadeOutStart) {
    fadeGain.gain.setValueAtTime?.(1, at(fadeOutStart));
  }
  fadeGain.gain.linearRampToValueAtTime?.(0, at(end));
}

function scheduleClipEnvelopeGain(
  envelopeGain: ScheduleGainNode,
  shape: ClipEnvelopeShape,
  item: ScheduledClip,
  from: number,
  startAt: number,
) {
  const at = (time: number) => startAt + (time - from);
  const firstSource = item.sourceOffset;
  const lastSource = item.sourceOffset + item.duration;
  const initial = clipEnvelopeGainAtSource(shape.points, firstSource);
  envelopeGain.gain.value = initial;
  envelopeGain.gain.setValueAtTime?.(initial, at(item.when));
  for (const point of shape.points) {
    if (point.time > firstSource && point.time < lastSource) {
      envelopeGain.gain.linearRampToValueAtTime?.(
        point.gain,
        at(item.when + (point.time - firstSource)),
      );
    }
  }
  envelopeGain.gain.linearRampToValueAtTime?.(
    clipEnvelopeGainAtSource(shape.points, lastSource),
    at(item.when + item.duration),
  );
}

function clampPan(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(-1, value)) : 0;
}

interface ScheduledSourceState<TBuffer> {
  clipId: string;
  source: ScheduleSourceNode<TBuffer>;
  clipGain: ScheduleGainNode;
  fadeGain: ScheduleGainNode | null;
  envelopeGain: ScheduleGainNode | null;
  ended: boolean;
  stopAt: number | null;
}

interface ScheduledClickState<TBuffer> {
  source: ScheduleSourceNode<TBuffer>;
  ended: boolean;
  stopAt: number | null;
}

export function applySchedule<TBuffer>(
  ctx: ScheduleAudioContext<TBuffer>,
  plan: readonly ScheduledClip[],
  options: ApplyScheduleOptions<TBuffer>,
): ScheduleHandle {
  const master = ctx.createGain();
  let lastMasterTarget = options.masterGain ?? 1;
  master.gain.value = lastMasterTarget;
  master.connect(ctx.destination);
  if (options.tap) {
    master.connect(options.tap);
  }
  const trackGains = new Map<string, ScheduleGainNode>();
  const lastGainTargets = new Map<string, number>();
  const panners = new Map<string, SchedulePannerNode>();
  const lastPanTargets = new Map<string, number>();
  for (const track of options.tracks) {
    const trackGain = ctx.createGain();
    const initialGain =
      options.trackGains?.get(track.id) ??
      (isTrackAudible(track, options.tracks) ? track.volume : 0);
    trackGain.gain.value = initialGain;
    lastGainTargets.set(track.id, initialGain);
    const panner = ctx.createStereoPanner();
    const initialPan = clampPan(track.pan ?? 0);
    panner.pan.value = initialPan;
    lastPanTargets.set(track.id, initialPan);
    trackGain.connect(panner);
    panner.connect(master);
    const trackTap = options.trackTaps?.get(track.id);
    if (trackTap) {
      panner.connect(trackTap);
    }
    trackGains.set(track.id, trackGain);
    panners.set(track.id, panner);
  }
  const clipGainTargets = new Map<string, number>(options.clipGains ?? []);
  let sources: ScheduledSourceState<TBuffer>[] = [];
  let disconnected = false;
  const startPlan = (items: readonly ScheduledClip[], from: number, startAt: number) => {
    for (const item of items) {
      const buffer = options.buffers.get(item.sourceId);
      const trackGain = trackGains.get(item.trackId);
      if (buffer === undefined || !trackGain || item.duration <= 0) {
        continue;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const clipGain = ctx.createGain();
      clipGain.gain.value = clipGainTargets.get(item.clipId) ?? 1;
      const fadeShape = options.clipFades?.get(item.clipId);
      const fadeGain = fadeShape ? ctx.createGain() : null;
      let head: ScheduleAudioNode = source;
      if (fadeGain && fadeShape) {
        scheduleClipFadeGain(fadeGain, fadeShape, item, from, startAt);
        source.connect(fadeGain);
        head = fadeGain;
      }
      const envelopeShape = options.clipEnvelopes?.get(item.clipId);
      const envelopeGain = envelopeShape ? ctx.createGain() : null;
      if (envelopeGain && envelopeShape) {
        scheduleClipEnvelopeGain(envelopeGain, envelopeShape, item, from, startAt);
        head.connect(envelopeGain);
        head = envelopeGain;
      }
      head.connect(clipGain);
      clipGain.connect(trackGain);
      const state: ScheduledSourceState<TBuffer> = {
        clipId: item.clipId,
        source,
        clipGain,
        fadeGain,
        envelopeGain,
        ended: false,
        stopAt: null,
      };
      source.onended = () => {
        state.ended = true;
      };
      source.start(startAt + (item.when - from), item.sourceOffset, item.duration);
      sources.push(state);
    }
  };
  startPlan(plan, options.from, options.startAt);
  const metronome = options.metronome;
  const metronomeGain = metronome ? ctx.createGain() : null;
  if (metronomeGain) {
    metronomeGain.gain.value = 1;
    metronomeGain.connect(master);
  }
  let clickSources: ScheduledClickState<TBuffer>[] = [];
  const startClicks = (clicks: readonly MetronomeClick[], from: number, startAt: number) => {
    if (!metronome || !metronomeGain) {
      return;
    }
    for (const click of clicks) {
      const source = ctx.createBufferSource();
      source.buffer = click.accent ? metronome.accent : metronome.beat;
      source.connect(metronomeGain);
      const state: ScheduledClickState<TBuffer> = { source, ended: false, stopAt: null };
      source.onended = () => {
        state.ended = true;
      };
      source.start(startAt + (click.when - from), click.offset, click.duration);
      clickSources.push(state);
    }
  };
  startClicks(metronome?.clicks ?? [], options.from, options.startAt);
  return {
    appendClicks(clicks, from, startAt) {
      if (disconnected || !metronome) {
        return;
      }
      clickSources = clickSources.filter((state) => {
        if (state.ended) {
          state.source.disconnect();
          return false;
        }
        return true;
      });
      startClicks(clicks, from, startAt);
    },
    appendPlan(items, from, startAt) {
      if (disconnected) {
        return;
      }
      sources = sources.filter((state) => {
        if (state.ended) {
          state.source.disconnect();
          state.fadeGain?.disconnect();
          state.envelopeGain?.disconnect();
          state.clipGain.disconnect();
          return false;
        }
        return true;
      });
      startPlan(items, from, startAt);
    },
    stop(when) {
      for (const state of sources) {
        if (state.ended || (state.stopAt !== null && state.stopAt <= ctx.currentTime)) {
          continue;
        }
        state.stopAt = when ?? ctx.currentTime;
        try {
          state.source.stop(when);
        } catch {
          state.ended = true;
        }
        if (when === undefined) {
          state.ended = true;
        }
      }
      for (const state of clickSources) {
        if (state.ended || (state.stopAt !== null && state.stopAt <= ctx.currentTime)) {
          continue;
        }
        state.stopAt = when ?? ctx.currentTime;
        try {
          state.source.stop(when);
        } catch {
          state.ended = true;
        }
        if (when === undefined) {
          state.ended = true;
        }
      }
    },
    disconnect() {
      if (disconnected) {
        return;
      }
      disconnected = true;
      for (const state of sources) {
        state.source.disconnect();
        state.fadeGain?.disconnect();
        state.envelopeGain?.disconnect();
        state.clipGain.disconnect();
      }
      for (const trackGain of trackGains.values()) {
        trackGain.disconnect();
      }
      for (const panner of panners.values()) {
        panner.disconnect();
      }
      for (const state of clickSources) {
        state.source.disconnect();
      }
      metronomeGain?.disconnect();
      master.disconnect();
    },
    setTrackGain(trackId, value) {
      const trackGain = trackGains.get(trackId);
      if (!trackGain) {
        return;
      }
      const previous = lastGainTargets.get(trackId);
      const timeConstant = value === 0 || previous === 0 ? MUTE_TIME_CONSTANT : GAIN_TIME_CONSTANT;
      trackGain.gain.setTargetAtTime(value, ctx.currentTime, timeConstant);
      lastGainTargets.set(trackId, value);
    },
    setMasterGain(value) {
      if (disconnected) {
        return;
      }
      const timeConstant =
        value === 0 || lastMasterTarget === 0 ? MUTE_TIME_CONSTANT : GAIN_TIME_CONSTANT;
      master.gain.setTargetAtTime(value, ctx.currentTime, timeConstant);
      lastMasterTarget = value;
    },
    setClipGain(clipId, value) {
      if (disconnected || value === (clipGainTargets.get(clipId) ?? 1)) {
        return;
      }
      clipGainTargets.set(clipId, value);
      for (const state of sources) {
        if (state.clipId === clipId && !state.ended) {
          state.clipGain.gain.setTargetAtTime(value, ctx.currentTime, GAIN_TIME_CONSTANT);
        }
      }
    },
    setTrackPan(trackId, value) {
      const panner = panners.get(trackId);
      if (disconnected || !panner || value === lastPanTargets.get(trackId)) {
        return;
      }
      lastPanTargets.set(trackId, value);
      panner.pan.setTargetAtTime(value, ctx.currentTime, GAIN_TIME_CONSTANT);
    },
    activeSourceCount() {
      return sources.filter(
        (state) => !state.ended && (state.stopAt === null || state.stopAt > ctx.currentTime),
      ).length;
    },
  };
}

export function formatExportOverloadWarning(peak: number, clippedSamples: number): string | null {
  if (clippedSamples <= 0) {
    return null;
  }
  const peakDb = Math.max(0, 20 * Math.log10(peak));
  const shownPeak = (Math.round(peakDb * 10) / 10).toFixed(1);
  const reduction = Math.max(0.1, Math.ceil(peakDb * 10) / 10).toFixed(1);
  return `გადატვირთვა: პიკი +${shownPeak} dBFS — ${clippedSamples} sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ ${reduction} dB-ით და გაიმეორე ექსპორტი.`;
}

function scheduleArrangementRenderProgress(
  ctx: OfflineAudioContext,
  length: number,
  onRenderProgress: (fraction: number) => void,
): boolean {
  if (typeof ctx.suspend !== 'function') {
    return false;
  }
  for (const frame of arrangementRenderSuspendFrames(length)) {
    Promise.resolve()
      .then(() => ctx.suspend(frame / ARRANGEMENT_EXPORT_SAMPLE_RATE))
      .then(() => {
        Promise.resolve()
          .then(() => onRenderProgress(frame / length))
          .catch(() => undefined);
        return ctx.resume();
      })
      .catch(() => undefined);
  }
  return true;
}

export async function renderArrangementWav(
  arrangement: Arrangement,
  buffers: ReadonlyMap<string, AudioBuffer>,
  renderWindow?: ArrangementRenderWindow,
  renderOptions?: ArrangementRenderOptions,
): Promise<ArrangementWavResult> {
  const end = projectEnd(arrangement);
  if (end <= 0) {
    throw new Error('პროექტი ცარიელია — ექსპორტისთვის საჭიროა მინიმუმ ერთი კლიპი.');
  }
  const length = renderWindow
    ? Math.round((renderWindow.end - renderWindow.start) * ARRANGEMENT_EXPORT_SAMPLE_RATE)
    : Math.ceil(end * ARRANGEMENT_EXPORT_SAMPLE_RATE);
  const ctx = new OfflineAudioContext({
    numberOfChannels: 2,
    length,
    sampleRate: ARRANGEMENT_EXPORT_SAMPLE_RATE,
  });
  const options: ApplyScheduleOptions<AudioBuffer> = {
    buffers,
    tracks: arrangement.tracks,
    from: 0,
    startAt: 0,
    masterGain: masterLinearGain(arrangement.master),
    clipGains: clipLinearGains(arrangement),
    clipFades: clipFadeShapes(arrangement),
    clipEnvelopes: clipEnvelopeShapes(arrangement),
    trackGains: trackEffectiveGains(arrangement),
  };
  if (renderWindow) {
    applySchedule(ctx, planSchedule(arrangement, renderWindow.start, renderWindow.end), {
      ...options,
      from: renderWindow.start,
    });
  } else {
    applySchedule(ctx, planSchedule(arrangement, 0), options);
  }
  const onProgress = renderOptions?.onProgress;
  if (
    onProgress &&
    scheduleArrangementRenderProgress(ctx, length, (fraction) => onProgress('render', fraction))
  ) {
    await Promise.resolve();
  }
  const rendered = await ctx.startRendering();
  onProgress?.('render', 1);
  const copies = [0, 1].map((index) => rendered.getChannelData(index).slice());
  const { bytes, ...report } = await encodeArrangementWavOffMainThread(
    copies,
    rendered.sampleRate,
    (fraction) => onProgress?.('wav', fraction),
  );
  return { blob: new Blob([bytes], { type: 'audio/wav' }), ...report };
}
