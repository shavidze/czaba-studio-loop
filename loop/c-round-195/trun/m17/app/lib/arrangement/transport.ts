export const SCRUB_RESCHEDULE_INTERVAL = 0.1;

export interface PlaybackAnchor {
  startAt: number;
  position: number;
  holdUntil: number;
}

export function createPlaybackAnchor(from: number, startAt: number): PlaybackAnchor {
  return { startAt, position: Math.max(0, from), holdUntil: startAt };
}

export function positionAt(anchor: PlaybackAnchor, ctxTime: number): number {
  return Math.max(0, anchor.position + (Math.max(ctxTime, anchor.holdUntil) - anchor.startAt));
}

export function isPlaybackAnchorHolding(anchor: PlaybackAnchor, ctxTime: number): boolean {
  return ctxTime < anchor.holdUntil;
}

export function reschedulePlaybackAnchor(
  previous: PlaybackAnchor,
  startAt: number,
  mapPosition: (position: number) => number = (position) => position,
  now?: number,
): PlaybackAnchor {
  if (now !== undefined && isPlaybackAnchorHolding(previous, now)) {
    return {
      startAt,
      position: Math.max(0, mapPosition(previous.position)),
      holdUntil: startAt,
    };
  }
  const handoff = positionAt(previous, startAt);
  return {
    startAt,
    position: Math.max(0, mapPosition(handoff)),
    holdUntil: Math.min(previous.holdUntil, startAt),
  };
}

export function shouldRescheduleScrub(lastRescheduleCtxTime: number | null, now: number): boolean {
  return (
    lastRescheduleCtxTime === null ||
    now - lastRescheduleCtxTime >= SCRUB_RESCHEDULE_INTERVAL - 1e-9
  );
}
