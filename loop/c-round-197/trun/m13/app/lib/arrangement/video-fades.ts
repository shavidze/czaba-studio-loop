import type { Arrangement, ArrangementClip } from '~/types/arrangement';
import { type ClipFadeEdge, clipFadeGainAt, clipFadeIn, clipFadeOut } from './fades';
import { findVideoClipAt } from './video';

function roundVideoFadeSeconds(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function floorVideoFadeSeconds(value: number): number {
  return Math.max(0, Math.floor(value * 1000 + 1e-6) / 1000);
}

function withVideoFadeLengths(
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

export function setVideoClipFade(
  arrangement: Arrangement,
  clipId: string,
  edge: ClipFadeEdge,
  seconds: number,
): Arrangement {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  const track = clip && arrangement.tracks.find((entry) => entry.id === clip.trackId);
  if (!clip || track?.kind !== 'video' || !Number.isFinite(seconds)) {
    return arrangement;
  }
  const other = edge === 'in' ? clipFadeOut(clip) : clipFadeIn(clip);
  const limit = floorVideoFadeSeconds(clip.duration - other);
  const value = Math.min(limit, Math.max(0, roundVideoFadeSeconds(seconds)));
  const fadeIn = edge === 'in' ? value : other;
  const fadeOut = edge === 'out' ? value : other;
  if (fadeIn === (clip.fadeIn ?? 0) && fadeOut === (clip.fadeOut ?? 0)) {
    return arrangement;
  }
  const next = withVideoFadeLengths(clip, fadeIn, fadeOut);
  return {
    ...arrangement,
    clips: arrangement.clips.map((entry) => (entry.id === clipId ? next : entry)),
  };
}

export function videoFadeOpacityAt(arrangement: Arrangement, position: number): number {
  const located = findVideoClipAt(arrangement, position);
  return located ? clipFadeGainAt(located.clip, position) : 1;
}

export function arrangementHasVideoFades(arrangement: Arrangement): boolean {
  const videoTrackIds = new Set(
    arrangement.tracks.filter((track) => track.kind === 'video').map((track) => track.id),
  );
  return arrangement.clips.some(
    (clip) => videoTrackIds.has(clip.trackId) && (clipFadeIn(clip) > 0 || clipFadeOut(clip) > 0),
  );
}
