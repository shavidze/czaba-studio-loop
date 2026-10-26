import type { Arrangement, ArrangementClip, ArrangementLoop } from '~/types/arrangement';

export const VIDEO_CONTINUITY_SECONDS = 0.03;
export const VIDEO_DISCONTINUITY_SECONDS = 0.08;
export const VIDEO_TIMELINE_ADJACENCY_SECONDS = 0.001;
export const VIDEO_SOFT_SYNC_DEADBAND_SECONDS = 0.02;
export const VIDEO_SOFT_SYNC_LIMIT_SECONDS = 1;
export const VIDEO_RATE_GAIN = 4;
export const VIDEO_RATE_STEP = 0.05;
export const VIDEO_RATE_MIN = 0.5;
export const VIDEO_RATE_MAX = 2;
export const VIDEO_HOLD_SEEK_LEAD_SECONDS = 0.3;
export const VIDEO_STANDBY_HORIZON_SECONDS = 1;
export const VIDEO_SEEK_PENDING_TIMEOUT_MS = 1500;
export const VIDEO_HARD_SEEK_INTERVAL_MS = 250;
export const VIDEO_START_EARLY_CAP_SECONDS = 0.02;
export const VIDEO_DEFAULT_FRAME_SECONDS = 1 / 60;
export const VIDEO_STALL_WINDOW_SECONDS = 0.3;
export const VIDEO_STALL_DRIFT_SECONDS = 0.12;
export const VIDEO_STALL_SHRINK_SECONDS = 0.02;
export const VIDEO_STALL_LAG_RATE = 1.5;
export const VIDEO_STALL_LEAD_RATE = 0.5;
export const VIDEO_STALL_ESCALATION_INTERVAL_MS = 600;
export const VIDEO_SETTLE_BAND_SECONDS = 0.008;
export const VIDEO_SETTLE_GAIN = 9;
export const VIDEO_SETTLE_RATE_MAX = 1.45;
export const VIDEO_SETTLE_RATE_MIN = 0.55;
export const VIDEO_SETTLE_MAX_SECONDS = 1;
const VIDEO_STALL_HISTORY_SECONDS = 2;

export interface VideoStallSample {
  ctxTime: number;
  drift: number;
  rate: number;
}

export interface VideoStallWindow {
  pushStallSample: (sample: VideoStallSample) => void;
  resetStallWindow: () => void;
  shouldEscalateStall: () => boolean;
}

export interface VideoSettleRate {
  rate: number;
  settling: boolean;
}

export interface VideoSettleState {
  armSettle: (ctxTime: number) => void;
  settleRate: (ctxTime: number, drift: number) => VideoSettleRate;
  endSettle: () => void;
}

export type VideoDiscontinuityKind = 'wrap' | 'boundary' | 'gap-entry';

export interface VideoDiscontinuity {
  kind: VideoDiscontinuityKind;
  delay: number;
  atPosition: number;
  clipId: string;
  sourceId: string;
  mediaTime: number;
}

export type VideoHoldDecision = 'hold' | 'play';

export interface VideoSeekDecisionInput {
  clipChanged: boolean;
  continuous: boolean;
  mappingJump: number;
  drift: number;
}

function sortedVideoClips(arrangement: Arrangement): ArrangementClip[] {
  const videoTrack = arrangement.tracks.find((track) => track.kind === 'video');
  if (!videoTrack) {
    return [];
  }
  return arrangement.clips
    .filter((clip) => clip.trackId === videoTrack.id)
    .sort((a, b) => a.start - b.start);
}

function clipMediaAt(clip: ArrangementClip, position: number): number {
  return clip.sourceOffset + (position - clip.start);
}

function clipCovering(clips: readonly ArrangementClip[], position: number): ArrangementClip | null {
  return (
    clips.find((clip) => clip.start <= position && position < clip.start + clip.duration) ?? null
  );
}

export function videoClipEndingAt(
  clips: readonly ArrangementClip[],
  clip: ArrangementClip,
): ArrangementClip | null {
  return (
    clips.find(
      (entry) =>
        entry.id !== clip.id &&
        Math.abs(entry.start + entry.duration - clip.start) <= VIDEO_TIMELINE_ADJACENCY_SECONDS,
    ) ?? null
  );
}

export function isContinuousVideoBoundary(
  previous: ArrangementClip | null,
  next: ArrangementClip,
): boolean {
  if (!previous) {
    return false;
  }
  const previousEnd = previous.start + previous.duration;
  return (
    previous.sourceId === next.sourceId &&
    Math.abs(previousEnd - next.start) <= VIDEO_TIMELINE_ADJACENCY_SECONDS &&
    Math.abs(previous.sourceOffset + previous.duration - next.sourceOffset) <=
      VIDEO_CONTINUITY_SECONDS
  );
}

export function nextPredictableDiscontinuity(
  arrangement: Arrangement,
  loop: ArrangementLoop | null,
  livePosition: number,
  horizon: number,
): VideoDiscontinuity | null {
  const clips = sortedVideoClips(arrangement);
  if (clips.length === 0 || !(horizon > 0)) {
    return null;
  }
  const activeLoop = loop && livePosition < loop.end ? loop : null;
  let position = livePosition;
  let elapsed = 0;
  for (let pass = 0; pass < 8; pass++) {
    const remaining = horizon - elapsed;
    const segmentEnd = activeLoop ? activeLoop.end : Number.POSITIVE_INFINITY;
    const limit = Math.min(segmentEnd, position + remaining);
    for (const clip of clips) {
      if (clip.start <= position + 1e-6 || clip.start > limit) {
        continue;
      }
      if (activeLoop && clip.start >= activeLoop.end - 1e-9) {
        continue;
      }
      const previous = videoClipEndingAt(clips, clip);
      if (isContinuousVideoBoundary(previous, clip)) {
        continue;
      }
      return {
        kind: previous ? 'boundary' : 'gap-entry',
        delay: elapsed + (clip.start - position),
        atPosition: clip.start,
        clipId: clip.id,
        sourceId: clip.sourceId,
        mediaTime: clip.sourceOffset,
      };
    }
    if (!activeLoop || activeLoop.end - position > remaining) {
      return null;
    }
    elapsed += activeLoop.end - position;
    const target = clipCovering(clips, activeLoop.start);
    if (target) {
      const before = clips.find(
        (clip) => clip.start < activeLoop.end && activeLoop.end <= clip.start + clip.duration,
      );
      const continuous =
        before !== undefined &&
        before.sourceId === target.sourceId &&
        Math.abs(clipMediaAt(before, activeLoop.end) - clipMediaAt(target, activeLoop.start)) <=
          VIDEO_CONTINUITY_SECONDS;
      if (!continuous) {
        return {
          kind: 'wrap',
          delay: elapsed,
          atPosition: activeLoop.start,
          clipId: target.id,
          sourceId: target.sourceId,
          mediaTime: clipMediaAt(target, activeLoop.start),
        };
      }
    }
    position = activeLoop.start;
  }
  return null;
}

export function videoRateCorrection(drift: number): number {
  if (!Number.isFinite(drift) || Math.abs(drift) <= VIDEO_SOFT_SYNC_DEADBAND_SECONDS) {
    return 1;
  }
  const scaled = (VIDEO_RATE_GAIN * drift) / VIDEO_RATE_STEP;
  const steps = Math.sign(scaled) * Math.max(1, Math.round(Math.abs(scaled)));
  const rate = Math.round((1 - steps * VIDEO_RATE_STEP) * 100) / 100;
  return Math.min(VIDEO_RATE_MAX, Math.max(VIDEO_RATE_MIN, rate));
}

export function shouldHardSeek(input: VideoSeekDecisionInput): boolean {
  if (input.clipChanged && !input.continuous) {
    return true;
  }
  if (input.mappingJump > VIDEO_DISCONTINUITY_SECONDS) {
    return true;
  }
  return Math.abs(input.drift) > VIDEO_SOFT_SYNC_LIMIT_SECONDS;
}

export function isVideoRateAtStallEdge(sample: VideoStallSample): boolean {
  if (sample.drift < 0) {
    return sample.rate >= VIDEO_STALL_LAG_RATE;
  }
  if (sample.drift > 0) {
    return sample.rate <= VIDEO_STALL_LEAD_RATE;
  }
  return false;
}

export function shouldEscalateVideoStall(samples: readonly VideoStallSample[]): boolean {
  const latest = samples.at(-1);
  if (
    !latest ||
    Math.abs(latest.drift) <= VIDEO_STALL_DRIFT_SECONDS ||
    !isVideoRateAtStallEdge(latest)
  ) {
    return false;
  }
  const direction = Math.sign(latest.drift);
  for (let index = samples.length - 1; index >= 0; index--) {
    const sample = samples[index];
    if (Math.sign(sample.drift) !== direction || !isVideoRateAtStallEdge(sample)) {
      return false;
    }
    if (latest.ctxTime - sample.ctxTime >= VIDEO_STALL_WINDOW_SECONDS - 1e-9) {
      return Math.abs(sample.drift) - Math.abs(latest.drift) < VIDEO_STALL_SHRINK_SECONDS;
    }
  }
  return false;
}

export interface VideoEscalationTiming {
  escalatedAt: number | null;
  seekedAt: number;
  now: number;
}

export function canEscalateAfterSeeked({
  escalatedAt,
  seekedAt,
  now,
}: VideoEscalationTiming): boolean {
  if (escalatedAt === null) {
    return true;
  }
  const settledAt =
    seekedAt >= escalatedAt
      ? seekedAt
      : now - escalatedAt >= VIDEO_SEEK_PENDING_TIMEOUT_MS
        ? escalatedAt + VIDEO_SEEK_PENDING_TIMEOUT_MS
        : null;
  return settledAt !== null && now - settledAt >= VIDEO_STALL_ESCALATION_INTERVAL_MS;
}

export function createVideoStallWindow(): VideoStallWindow {
  let samples: VideoStallSample[] = [];
  return {
    pushStallSample(sample) {
      const last = samples.at(-1);
      if (last && sample.ctxTime < last.ctxTime) {
        samples = [];
      }
      samples.push(sample);
      const horizon = sample.ctxTime - VIDEO_STALL_HISTORY_SECONDS;
      if (samples[0].ctxTime < horizon) {
        samples = samples.filter((entry) => entry.ctxTime >= horizon);
      }
    },
    resetStallWindow() {
      samples = [];
    },
    shouldEscalateStall() {
      return shouldEscalateVideoStall(samples);
    },
  };
}

export function videoSettleRateCorrection(drift: number): number {
  if (!Number.isFinite(drift) || Math.abs(drift) <= VIDEO_SETTLE_BAND_SECONDS) {
    return 1;
  }
  const scaled = (VIDEO_SETTLE_GAIN * drift) / VIDEO_RATE_STEP;
  const steps = Math.sign(scaled) * Math.max(1, Math.round(Math.abs(scaled)));
  const rate = Math.round((1 - steps * VIDEO_RATE_STEP) * 100) / 100;
  return Math.min(VIDEO_SETTLE_RATE_MAX, Math.max(VIDEO_SETTLE_RATE_MIN, rate));
}

export function createVideoSettleState(): VideoSettleState {
  let armedAt: number | null = null;
  let exceededBand = false;
  const endSettle = () => {
    armedAt = null;
    exceededBand = false;
  };
  return {
    armSettle(ctxTime) {
      armedAt = ctxTime;
      exceededBand = false;
    },
    settleRate(ctxTime, drift) {
      const steady = videoRateCorrection(drift);
      if (armedAt === null) {
        return { rate: steady, settling: false };
      }
      if (ctxTime < armedAt || ctxTime - armedAt >= VIDEO_SETTLE_MAX_SECONDS - 1e-9) {
        endSettle();
        return { rate: steady, settling: false };
      }
      if (Math.abs(drift) > VIDEO_SETTLE_BAND_SECONDS) {
        exceededBand = true;
      } else if (exceededBand && Math.abs(drift) <= VIDEO_SETTLE_BAND_SECONDS) {
        endSettle();
        return { rate: steady, settling: false };
      }
      if (isVideoRateAtStallEdge({ ctxTime, drift, rate: steady })) {
        return { rate: steady, settling: true };
      }
      return { rate: videoSettleRateCorrection(drift), settling: true };
    },
    endSettle,
  };
}

export function holdRelease(
  frameMediaTime: number,
  liveTarget: number,
  frameInterval: number,
): VideoHoldDecision {
  const frame =
    Number.isFinite(frameInterval) && frameInterval > 0
      ? frameInterval
      : VIDEO_DEFAULT_FRAME_SECONDS;
  const tolerance = Math.min(frame, VIDEO_START_EARLY_CAP_SECONDS);
  return frameMediaTime - liveTarget > tolerance ? 'hold' : 'play';
}
