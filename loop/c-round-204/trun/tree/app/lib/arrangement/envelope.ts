import type {
  Arrangement,
  ArrangementClip,
  ArrangementClipEnvelopePoint,
} from '~/types/arrangement';

export const CLIP_ENVELOPE_MIN_GAP_SECONDS = 0.001;
const CLIP_ENVELOPE_WINDOW_EPS = 1e-6;
const CLIP_ENVELOPE_SAME_MS = 0.0005;

export interface ClipEnvelopeShape {
  points: readonly ArrangementClipEnvelopePoint[];
}

interface ClipEnvelopeWindow {
  first: number;
  last: number;
}

function withoutNegativeZero(value: number): number {
  return value === 0 ? 0 : value;
}

function roundEnvelopeMs(value: number): number {
  return withoutNegativeZero(Math.round(value * 1000) / 1000);
}

function roundEnvelopeGain(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function clampEnvelopeValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clipEnvelopeWindow(clip: ArrangementClip): ClipEnvelopeWindow {
  return {
    first: withoutNegativeZero(
      Math.ceil(clip.sourceOffset * 1000 - CLIP_ENVELOPE_WINDOW_EPS * 1000) / 1000,
    ),
    last:
      Math.floor((clip.sourceOffset + clip.duration) * 1000 + CLIP_ENVELOPE_WINDOW_EPS * 1000) /
      1000,
  };
}

function findEnvelopeAudioClip(arrangement: Arrangement, clipId: string): ArrangementClip | null {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  const track = clip && arrangement.tracks.find((entry) => entry.id === clip.trackId);
  return clip && track?.kind === 'audio' ? clip : null;
}

function findEnvelopePointIndex(
  points: readonly ArrangementClipEnvelopePoint[],
  pointSourceTime: number,
): number {
  return points.findIndex((point) => Math.abs(point.time - pointSourceTime) < 1e-6);
}

function withClipEnvelopePoints(
  arrangement: Arrangement,
  clip: ArrangementClip,
  points: ArrangementClipEnvelopePoint[],
): Arrangement {
  const { envelope: _previousEnvelope, ...rest } = clip;
  const next: ArrangementClip = points.length > 0 ? { ...rest, envelope: points } : rest;
  return {
    ...arrangement,
    clips: arrangement.clips.map((entry) => (entry.id === clip.id ? next : entry)),
  };
}

export function clipEnvelopeGainAtSource(
  points: readonly ArrangementClipEnvelopePoint[],
  sourceTime: number,
): number {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) {
    return 1;
  }
  if (sourceTime <= first.time) {
    return first.gain;
  }
  if (sourceTime >= last.time) {
    return last.gain;
  }
  for (let index = 1; index < points.length; index++) {
    const right = points[index];
    if (sourceTime <= right.time) {
      const left = points[index - 1];
      const segment = right.time - left.time;
      return segment <= 0
        ? right.gain
        : left.gain + ((right.gain - left.gain) * (sourceTime - left.time)) / segment;
    }
  }
  return last.gain;
}

export function clipEnvelopeGainAt(clip: ArrangementClip, time: number): number {
  return clipEnvelopeGainAtSource(clip.envelope ?? [], clip.sourceOffset + (time - clip.start));
}

export function clipEnvelopePointTimelineTime(
  clip: ArrangementClip,
  point: ArrangementClipEnvelopePoint,
): number {
  return clip.start + (point.time - clip.sourceOffset);
}

export function visibleClipEnvelopePoints(clip: ArrangementClip): ArrangementClipEnvelopePoint[] {
  const from = clip.sourceOffset - CLIP_ENVELOPE_WINDOW_EPS;
  const to = clip.sourceOffset + clip.duration + CLIP_ENVELOPE_WINDOW_EPS;
  return (clip.envelope ?? []).filter((point) => point.time >= from && point.time <= to);
}

export function formatClipEnvelopeData(clip: ArrangementClip): string {
  return visibleClipEnvelopePoints(clip)
    .map(
      (point) =>
        `${clipEnvelopePointTimelineTime(clip, point).toFixed(3)}:${point.gain.toFixed(4)}`,
    )
    .join(';');
}

export function formatClipEnvelopeGain(gain: number): string {
  if (!(gain > 0)) {
    return '−∞ dB';
  }
  const decibels = Math.round(20 * Math.log10(gain) * 10) / 10;
  if (decibels === 0) {
    return '0.0 dB';
  }
  return `${decibels < 0 ? '−' : '+'}${Math.abs(decibels).toFixed(1)} dB`;
}

export function addClipEnvelopePoint(
  arrangement: Arrangement,
  clipId: string,
  timelineTime: number,
): Arrangement {
  const clip = findEnvelopeAudioClip(arrangement, clipId);
  if (
    !clip ||
    !Number.isFinite(timelineTime) ||
    timelineTime < clip.start - CLIP_ENVELOPE_WINDOW_EPS ||
    timelineTime > clip.start + clip.duration + CLIP_ENVELOPE_WINDOW_EPS
  ) {
    return arrangement;
  }
  const bounds = clipEnvelopeWindow(clip);
  if (bounds.first > bounds.last) {
    return arrangement;
  }
  const time = clampEnvelopeValue(
    roundEnvelopeMs(clip.sourceOffset + (timelineTime - clip.start)),
    bounds.first,
    bounds.last,
  );
  const points = clip.envelope ?? [];
  if (points.some((point) => Math.abs(point.time - time) < CLIP_ENVELOPE_SAME_MS)) {
    return arrangement;
  }
  const gain = roundEnvelopeGain(clipEnvelopeGainAtSource(points, time));
  const next = [...points, { time, gain }].sort((left, right) => left.time - right.time);
  return withClipEnvelopePoints(arrangement, clip, next);
}

export function moveClipEnvelopePoint(
  arrangement: Arrangement,
  clipId: string,
  pointSourceTime: number,
  nextTimelineTime: number,
  nextGain: number,
): Arrangement {
  const clip = findEnvelopeAudioClip(arrangement, clipId);
  const points = clip?.envelope ?? [];
  const index = findEnvelopePointIndex(points, pointSourceTime);
  const point = points[index];
  if (!clip || !point || !Number.isFinite(nextTimelineTime) || !Number.isFinite(nextGain)) {
    return arrangement;
  }
  const bounds = clipEnvelopeWindow(clip);
  const previous = points[index - 1];
  const following = points[index + 1];
  const lowest = Math.max(
    bounds.first,
    previous ? roundEnvelopeMs(previous.time + CLIP_ENVELOPE_MIN_GAP_SECONDS) : bounds.first,
  );
  const highest = Math.min(
    bounds.last,
    following ? roundEnvelopeMs(following.time - CLIP_ENVELOPE_MIN_GAP_SECONDS) : bounds.last,
  );
  const requested = roundEnvelopeMs(clip.sourceOffset + (nextTimelineTime - clip.start));
  const time = lowest <= highest ? clampEnvelopeValue(requested, lowest, highest) : point.time;
  const gain = roundEnvelopeGain(clampEnvelopeValue(nextGain, 0, 1));
  if (time === point.time && gain === point.gain) {
    return arrangement;
  }
  const next = points.map((entry, entryIndex) => (entryIndex === index ? { time, gain } : entry));
  return withClipEnvelopePoints(arrangement, clip, next);
}

export function removeClipEnvelopePoint(
  arrangement: Arrangement,
  clipId: string,
  pointSourceTime: number,
): Arrangement {
  const clip = findEnvelopeAudioClip(arrangement, clipId);
  const points = clip?.envelope ?? [];
  const index = findEnvelopePointIndex(points, pointSourceTime);
  if (!clip || index < 0) {
    return arrangement;
  }
  return withClipEnvelopePoints(
    arrangement,
    clip,
    points.filter((_point, pointIndex) => pointIndex !== index),
  );
}

export function clipEnvelopeShapes(arrangement: Arrangement): Map<string, ClipEnvelopeShape> {
  const audioTrackIds = new Set(
    arrangement.tracks.filter((track) => track.kind === 'audio').map((track) => track.id),
  );
  const shapes = new Map<string, ClipEnvelopeShape>();
  for (const clip of arrangement.clips) {
    if (audioTrackIds.has(clip.trackId) && clip.envelope && clip.envelope.length > 0) {
      shapes.set(clip.id, { points: clip.envelope });
    }
  }
  return shapes;
}
