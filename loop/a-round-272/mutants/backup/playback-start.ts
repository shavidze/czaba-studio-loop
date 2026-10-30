import { resolveActiveLoop } from '~/lib/arrangement/loop';
import { ARRANGEMENT_EPS, projectEnd } from '~/lib/arrangement/model';
import { studioPlaybackStrings } from '~/lib/arrangement/strings';
import type { Arrangement } from '~/types/arrangement';

export type PlaybackStartOrigin = 'insert-marker' | 'selection' | 'playhead';

export type PlaybackStartPlan =
  | { readonly kind: 'empty' }
  | { readonly kind: 'past-end'; readonly requested: number; readonly end: number }
  | { readonly kind: 'play'; readonly requested: number; readonly from: number };

export function resolvePlaybackStart(input: {
  readonly requested: number;
  readonly arrangement: Arrangement;
  readonly playbackEndedAt: number | null;
}): PlaybackStartPlan {
  const { requested, arrangement, playbackEndedAt } = input;
  const end = projectEnd(arrangement);
  if (end <= 0) {
    return { kind: 'empty' };
  }
  const loopActive = resolveActiveLoop(arrangement.loop, requested) !== null;
  const endedHere =
    playbackEndedAt !== null && Math.abs(playbackEndedAt - requested) < ARRANGEMENT_EPS;
  if (!loopActive && !endedHere && requested > end + ARRANGEMENT_EPS) {
    return { kind: 'past-end', requested, end };
  }
  const from = requested >= end - ARRANGEMENT_EPS && !loopActive ? 0 : requested;
  return { kind: 'play', requested, from };
}

export function resolveSpaceStartPoint(input: {
  readonly insertMarker: number;
  readonly range: { readonly start: number; readonly end: number } | null;
}): { readonly origin: PlaybackStartOrigin; readonly requested: number } {
  if (input.range) {
    return { origin: 'selection', requested: Math.min(input.range.start, input.range.end) };
  }
  return { origin: 'insert-marker', requested: input.insertMarker };
}

const TIME_TOKEN = /\d{2,}:\d{2}\.\d{3}/g;

export type InsertMarkerStatusKind = 'playing' | 'playing-follow-paused' | 'stopped';

export function insertMarkerStatusKind(text: string): InsertMarkerStatusKind | null {
  const times = text.match(TIME_TOKEN) ?? [];
  const [first, second] = times;
  if (first === undefined) {
    return null;
  }
  if (text === studioPlaybackStrings.insertMarkerWhilePlaying(first)) {
    return 'playing';
  }
  if (text === studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused(first)) {
    return 'playing-follow-paused';
  }
  if (
    text === studioPlaybackStrings.insertMarkerAfterStop(first) ||
    text === studioPlaybackStrings.insertMarkerAfterStopFromStart(first) ||
    text === studioPlaybackStrings.selectionAfterStop(first) ||
    text === studioPlaybackStrings.insertMarkerToPlayhead(first)
  ) {
    return 'stopped';
  }
  if (
    second !== undefined &&
    text ===
      studioPlaybackStrings.playPastEnd({
        subject: studioPlaybackStrings.startPointInsertMarker,
        position: first,
        end: second,
      })
  ) {
    return 'stopped';
  }
  if (
    text ===
    studioPlaybackStrings.playPastEnd({
      subject: studioPlaybackStrings.startPointInsertMarker,
      position: first,
      end: first,
    })
  ) {
    return 'stopped';
  }
  return null;
}
