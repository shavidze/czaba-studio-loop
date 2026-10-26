import type { Arrangement, ArrangementLoop, ScheduledClip } from '~/types/arrangement';
import { snapTimeToGrid } from './grid';
import { ARRANGEMENT_EPS, MIN_LOOP_LENGTH } from './model';

export { MIN_LOOP_LENGTH } from './model';

export type LoopEdge = 'start' | 'end';

export interface LoopScheduleParams {
  loop: ArrangementLoop;
  from: number;
  startAt: number;
}

export interface LoopIterationTiming {
  from: number;
  until: number;
  startAt: number;
  endAt: number;
}

function withLoop(arrangement: Arrangement, loop: ArrangementLoop | null): Arrangement {
  const current = arrangement.loop;
  if (
    current === loop ||
    (current &&
      loop &&
      current.start === loop.start &&
      current.end === loop.end &&
      current.enabled === loop.enabled)
  ) {
    return arrangement;
  }
  return { ...arrangement, loop };
}

export function setLoopFromRange(
  arrangement: Arrangement,
  range: { start: number; end: number },
): Arrangement | null {
  const start = Math.max(0, Math.min(range.start, range.end));
  const end = Math.max(range.start, range.end);
  if (end - start < MIN_LOOP_LENGTH - 1e-9) {
    return null;
  }
  return withLoop(arrangement, { start, end, enabled: true });
}

export function toggleLoop(arrangement: Arrangement): Arrangement {
  const loop = arrangement.loop;
  if (!loop) {
    return arrangement;
  }
  return withLoop(arrangement, { ...loop, enabled: !loop.enabled });
}

function isOnGridLine(time: number, step: number): boolean {
  return Math.abs(snapTimeToGrid(time, step) - time) < 1e-6;
}

export function moveLoop(
  arrangement: Arrangement,
  start: number,
  gridStep: number | null = null,
): Arrangement {
  const loop = arrangement.loop;
  if (!loop) {
    return arrangement;
  }
  const length = loop.end - loop.start;
  const nextStart = Math.max(0, start);
  const msEnd = Math.round((nextStart + length) * 1e6) / 1e6;
  let end = msEnd;
  if (
    gridStep !== null &&
    isOnGridLine(loop.start, gridStep) &&
    isOnGridLine(loop.end, gridStep) &&
    isOnGridLine(nextStart, gridStep)
  ) {
    const gridEnd = snapTimeToGrid(loop.end + (nextStart - loop.start), gridStep);
    end = gridEnd - nextStart < MIN_LOOP_LENGTH - 1e-9 ? msEnd : gridEnd;
  }
  return withLoop(arrangement, { ...loop, start: nextStart, end });
}

export function resizeLoop(arrangement: Arrangement, edge: LoopEdge, time: number): Arrangement {
  const loop = arrangement.loop;
  if (!loop) {
    return arrangement;
  }
  if (edge === 'start') {
    const start = Math.max(0, Math.min(time, loop.end - MIN_LOOP_LENGTH));
    return withLoop(arrangement, { ...loop, start });
  }
  const end = Math.max(time, loop.start + MIN_LOOP_LENGTH);
  return withLoop(arrangement, { ...loop, end });
}

export function resolveActiveLoop(
  loop: ArrangementLoop | null,
  scheduledFrom: number,
): ArrangementLoop | null {
  if (!loop || !loop.enabled || loop.end - loop.start < MIN_LOOP_LENGTH - 1e-9) {
    return null;
  }
  return scheduledFrom < loop.end - ARRANGEMENT_EPS ? loop : null;
}

export function loopTimelinePosition(
  unwrapped: number,
  loop: ArrangementLoop | null,
  scheduledFrom: number,
): number {
  const active = resolveActiveLoop(loop, scheduledFrom);
  if (!active || unwrapped < active.end) {
    return unwrapped;
  }
  const length = active.end - active.start;
  return active.start + ((unwrapped - active.end) % length);
}

export function loopIterationTiming(
  params: LoopScheduleParams,
  iteration: number,
): LoopIterationTiming {
  const { loop, from, startAt } = params;
  if (iteration === 0) {
    return { from, until: loop.end, startAt, endAt: startAt + (loop.end - from) };
  }
  const length = loop.end - loop.start;
  const iterationStart = startAt + (loop.end - from) + (iteration - 1) * length;
  return {
    from: loop.start,
    until: loop.end,
    startAt: iterationStart,
    endAt: iterationStart + length,
  };
}

export interface LoopRefillState {
  params: LoopScheduleParams;
  nextIteration: number;
}

export type LoopRefillResult = 'idle' | 'late';

export function refillLoopIterations(
  state: LoopRefillState,
  now: number,
  horizon: number,
  lateMargin: number,
  append: (iteration: number, timing: LoopIterationTiming) => void,
): LoopRefillResult {
  for (;;) {
    const timing = loopIterationTiming(state.params, state.nextIteration);
    if (timing.startAt > now + horizon) {
      return 'idle';
    }
    if (timing.startAt < now + lateMargin) {
      return 'late';
    }
    append(state.nextIteration, timing);
    state.nextIteration += 1;
  }
}

export function planLoopIteration(
  arrangement: Arrangement,
  params: LoopScheduleParams,
  iteration: number,
): ScheduledClip[] {
  const { from, until } = loopIterationTiming(params, iteration);
  const trackIds = new Set(arrangement.tracks.map((track) => track.id));
  return arrangement.clips
    .filter((clip) => trackIds.has(clip.trackId))
    .filter(
      (clip) =>
        clip.start < until - ARRANGEMENT_EPS && clip.start + clip.duration > from + ARRANGEMENT_EPS,
    )
    .map((clip) => {
      const when = Math.max(clip.start, from);
      return {
        clipId: clip.id,
        trackId: clip.trackId,
        sourceId: clip.sourceId,
        when,
        sourceOffset: clip.sourceOffset + (when - clip.start),
        duration: Math.min(clip.start + clip.duration, until) - when,
      };
    })
    .sort((a, b) => a.when - b.when);
}
