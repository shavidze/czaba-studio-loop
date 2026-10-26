import type { Arrangement, ArrangementClip } from '~/types/arrangement';

export type ClipFadeEdge = 'in' | 'out';

export type ClipTrimEdge = 'start' | 'end';

export type ClipFadeFields = Pick<ArrangementClip, 'start' | 'duration' | 'fadeIn' | 'fadeOut'>;

export interface ClipFadeShape {
  start: number;
  duration: number;
  fadeIn: number;
  fadeOut: number;
}

export interface ClipCutEdges {
  start: boolean;
  end: boolean;
}

function roundFadeSeconds(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function floorFadeSeconds(value: number): number {
  return Math.max(0, Math.floor(value * 1000 + 1e-6) / 1000);
}

function storedFadeSeconds(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : 0;
}

function hasStoredFades(clip: ArrangementClip): boolean {
  return clip.fadeIn !== undefined || clip.fadeOut !== undefined;
}

function withClipFadeLengths(
  clip: ArrangementClip,
  fadeIn: number,
  fadeOut: number,
): ArrangementClip {
  const { fadeIn: _previousFadeIn, fadeOut: _previousFadeOut, ...rest } = clip;
  return {
    ...rest,
    ...(fadeIn > 0 ? { fadeIn } : {}),
    ...(fadeOut > 0 ? { fadeOut } : {}),
  };
}

export function clipFadeOut(clip: ClipFadeFields): number {
  return Math.min(storedFadeSeconds(clip.fadeOut), Math.max(0, clip.duration));
}

export function clipFadeIn(clip: ClipFadeFields): number {
  return Math.min(storedFadeSeconds(clip.fadeIn), Math.max(0, clip.duration - clipFadeOut(clip)));
}

export function setClipFade(
  arrangement: Arrangement,
  clipId: string,
  edge: ClipFadeEdge,
  seconds: number,
): Arrangement {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  const track = clip && arrangement.tracks.find((entry) => entry.id === clip.trackId);
  if (!clip || track?.kind !== 'audio' || !Number.isFinite(seconds)) {
    return arrangement;
  }
  const other = edge === 'in' ? clipFadeOut(clip) : clipFadeIn(clip);
  const limit = floorFadeSeconds(clip.duration - other);
  const value = Math.min(limit, Math.max(0, roundFadeSeconds(seconds)));
  const fadeIn = edge === 'in' ? value : other;
  const fadeOut = edge === 'out' ? value : other;
  if (fadeIn === (clip.fadeIn ?? 0) && fadeOut === (clip.fadeOut ?? 0)) {
    return arrangement;
  }
  const next = withClipFadeLengths(clip, fadeIn, fadeOut);
  return {
    ...arrangement,
    clips: arrangement.clips.map((entry) => (entry.id === clipId ? next : entry)),
  };
}

export function withCutEdges(clip: ArrangementClip, cut: ClipCutEdges): ArrangementClip {
  if (!hasStoredFades(clip)) {
    return clip;
  }
  const fadeOut = cut.end
    ? 0
    : Math.min(storedFadeSeconds(clip.fadeOut), floorFadeSeconds(clip.duration));
  const fadeIn = cut.start
    ? 0
    : Math.min(storedFadeSeconds(clip.fadeIn), floorFadeSeconds(clip.duration - fadeOut));
  return withClipFadeLengths(clip, fadeIn, fadeOut);
}

export function clampClipFadesAfterTrim(
  clip: ArrangementClip,
  edge: ClipTrimEdge,
): ArrangementClip {
  if (!hasStoredFades(clip)) {
    return clip;
  }
  const storedIn = storedFadeSeconds(clip.fadeIn);
  const storedOut = storedFadeSeconds(clip.fadeOut);
  if (edge === 'start') {
    const fadeIn = Math.min(storedIn, floorFadeSeconds(clip.duration - storedOut));
    const fadeOut = Math.min(storedOut, floorFadeSeconds(clip.duration - fadeIn));
    return withClipFadeLengths(clip, fadeIn, fadeOut);
  }
  const fadeOut = Math.min(storedOut, floorFadeSeconds(clip.duration - storedIn));
  const fadeIn = Math.min(storedIn, floorFadeSeconds(clip.duration - fadeOut));
  return withClipFadeLengths(clip, fadeIn, fadeOut);
}

export function clipFadeGainAt(clip: ClipFadeFields, time: number): number {
  const offset = time - clip.start;
  if (offset < 0 || offset > clip.duration) {
    return 1;
  }
  const fadeIn = clipFadeIn(clip);
  const fadeOut = clipFadeOut(clip);
  let gain = 1;
  if (fadeIn > 0 && offset < fadeIn) {
    gain *= offset / fadeIn;
  }
  if (fadeOut > 0 && offset > clip.duration - fadeOut) {
    gain *= (clip.duration - offset) / fadeOut;
  }
  return Math.min(1, Math.max(0, gain));
}

export function clipFadeShapes(arrangement: Arrangement): Map<string, ClipFadeShape> {
  const audioTrackIds = new Set(
    arrangement.tracks.filter((track) => track.kind === 'audio').map((track) => track.id),
  );
  const shapes = new Map<string, ClipFadeShape>();
  for (const clip of arrangement.clips) {
    if (!audioTrackIds.has(clip.trackId)) {
      continue;
    }
    const fadeIn = clipFadeIn(clip);
    const fadeOut = clipFadeOut(clip);
    if (fadeIn > 0 || fadeOut > 0) {
      shapes.set(clip.id, { start: clip.start, duration: clip.duration, fadeIn, fadeOut });
    }
  }
  return shapes;
}
