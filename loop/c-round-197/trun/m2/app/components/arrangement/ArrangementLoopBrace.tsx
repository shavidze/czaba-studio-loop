import { type KeyboardEvent, type PointerEvent, useEffect, useRef } from 'react';
import { formatArrangementTime, useArrangement } from '~/contexts/ArrangementContext';
import {
  adjacentGridLine,
  resolveGridTimeWithTargets,
  resolveSnapStep,
  snapMoveStartToGridOrEdges,
} from '~/lib/arrangement/grid';
import { type LoopEdge, moveLoop, resizeLoop } from '~/lib/arrangement/loop';
import { markerSnapTimes } from '~/lib/arrangement/markers';
import { studioLoopStrings } from '~/lib/arrangement/strings';
import { cn } from '~/lib/utils';
import type { Arrangement, ArrangementLoop } from '~/types/arrangement';
import { watchUncapturedPointerGesture } from './ArrangementClip';

const LOOP_DRAG_THRESHOLD_PX = 3;
const LOOP_KEY_STEP_SECONDS = 0.1;
const LOOP_HINT = studioLoopStrings.braceHint;
const LOOP_KEYBOARD_HINT = studioLoopStrings.braceKeyboardHint;

type LoopGestureKind = 'move' | LoopEdge;

interface LoopGesture {
  kind: LoopGestureKind;
  pointerId: number;
  startX: number;
  before: Arrangement;
  original: ArrangementLoop;
  moved: boolean;
  release: () => void;
}

interface ArrangementLoopBraceProps {
  seconds: number;
  pxPerSecond: number;
  snapSeconds?: number | null;
  gridSeconds?: number;
}

function roundLoopTime(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function ArrangementLoopBrace({
  seconds,
  pxPerSecond,
  snapSeconds = null,
  gridSeconds,
}: ArrangementLoopBraceProps) {
  const {
    arrangement,
    getArrangement,
    previewLoopArrangement,
    commitLoopRange,
    stepLoopRange,
    claimPointerGesture,
  } = useArrangement();
  const braceRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<LoopGesture | null>(null);
  const loop = arrangement.loop;

  useEffect(
    () => () => {
      const gesture = gestureRef.current;
      gestureRef.current = null;
      gesture?.release();
    },
    [],
  );

  const endStaleLoopGesture = (gesture: LoopGesture) => {
    gestureRef.current = null;
    if (gesture.moved) {
      previewLoopArrangement(gesture.before);
    }
    gesture.release();
  };

  const beginLoopGesture = (kind: LoopGestureKind, event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || event.buttons === 0 || !getArrangement().loop) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    let claimed: LoopGesture | null = null;
    const releaseClaim = claimPointerGesture(event.pointerId, () => {
      const stale = claimed;
      if (stale && gestureRef.current === stale) {
        endStaleLoopGesture(stale);
        return;
      }
      stale?.release();
    });
    if (!releaseClaim) {
      return;
    }
    const leftover = gestureRef.current;
    if (leftover) {
      endStaleLoopGesture(leftover);
    }
    const before = getArrangement();
    if (!before.loop) {
      releaseClaim();
      return;
    }
    braceRef.current?.focus({ preventScroll: true });
    claimed = {
      kind,
      pointerId: event.pointerId,
      startX: event.clientX,
      before,
      original: before.loop,
      moved: false,
      release: releaseClaim,
    };
    gestureRef.current = claimed;
    try {
      braceRef.current?.setPointerCapture(event.pointerId);
    } catch {
      const gesture = gestureRef.current;
      if (gesture) {
        watchUncapturedPointerGesture(gesture, () => {
          if (gestureRef.current === gesture) {
            endStaleLoopGesture(gesture);
            return;
          }
          gesture.release();
        });
      }
    }
  };

  const handleLoopPointerMove = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - gesture.startX;
    if (!gesture.moved && Math.abs(dx) < LOOP_DRAG_THRESHOLD_PX) {
      return;
    }
    gesture.moved = true;
    const delta = dx / pxPerSecond;
    const { original, before, kind } = gesture;
    const step = resolveSnapStep(snapSeconds, gridSeconds, event.altKey);
    const markers = markerSnapTimes(before);
    const rawStart = roundLoopTime(original.start + delta);
    const next =
      kind === 'move'
        ? moveLoop(
            before,
            step === null
              ? rawStart
              : Math.round(
                  snapMoveStartToGridOrEdges(
                    rawStart,
                    original.end - original.start,
                    step,
                    markers,
                    markers,
                  ) * 1e6,
                ) / 1e6,
            step,
          )
        : resizeLoop(
            before,
            kind,
            resolveGridTimeWithTargets(
              roundLoopTime(original[kind] + delta),
              snapSeconds,
              gridSeconds,
              event.altKey,
              markers,
            ),
          );
    previewLoopArrangement(next);
  };

  const finishLoopGesture = (event: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    gestureRef.current = null;
    gesture.release();
    if (braceRef.current?.hasPointerCapture(event.pointerId)) {
      braceRef.current.releasePointerCapture(event.pointerId);
    }
    if (gesture.moved) {
      commitLoopRange(gesture.before);
    }
  };

  const handleLoopKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const kind = event.shiftKey ? 'end' : 'move';
    const current = getArrangement().loop;
    if (snapSeconds === null || !current) {
      const delta = event.key === 'ArrowLeft' ? -LOOP_KEY_STEP_SECONDS : LOOP_KEY_STEP_SECONDS;
      stepLoopRange(kind, delta, null, { keyRepeat: event.repeat });
      return;
    }
    const from = kind === 'end' ? current.end : current.start;
    const target = adjacentGridLine(from, snapSeconds, event.key === 'ArrowLeft' ? -1 : 1);
    stepLoopRange(
      kind,
      target === null ? -LOOP_KEY_STEP_SECONDS : target - from,
      kind === 'move' ? snapSeconds : null,
      { keyRepeat: event.repeat },
    );
  };

  const span = loop
    ? `Loop ${formatArrangementTime(loop.start)} — ${formatArrangementTime(loop.end)}${loop.enabled ? '' : ' · off'}`
    : '';

  return (
    <div
      className="relative h-4 shrink-0 border-b border-outline bg-surface"
      style={{ width: seconds * pxPerSecond }}
      data-testid="arrangement-loop-strip"
    >
      {loop ? (
        // biome-ignore lint/a11y/useSemanticElements: B task 4.3 requires role=group on the positioned brace
        <div
          ref={braceRef}
          role="group"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: B task 4.3 requires a keyboard-focusable brace
          tabIndex={0}
          aria-label={`${span} · ${LOOP_KEYBOARD_HINT}`}
          title={studioLoopStrings.braceTitle(span)}
          className={cn(
            'absolute inset-y-0 flex cursor-grab touch-none items-center overflow-hidden rounded-sm border-2 active:cursor-grabbing',
            loop.enabled
              ? 'border-foreground bg-foreground/20'
              : 'border-dashed border-muted bg-transparent',
          )}
          style={{
            left: loop.start * pxPerSecond,
            width: Math.max(2, (loop.end - loop.start) * pxPerSecond),
          }}
          onPointerDown={(event) => beginLoopGesture('move', event)}
          onPointerMove={handleLoopPointerMove}
          onPointerUp={finishLoopGesture}
          onPointerCancel={finishLoopGesture}
          onKeyDown={handleLoopKeyDown}
          data-testid="arrangement-loop-brace"
          data-loop-enabled={loop.enabled ? 'true' : 'false'}
        >
          <span
            className={cn(
              'pointer-events-none truncate px-2 text-xs font-medium leading-none',
              loop.enabled ? 'text-foreground' : 'text-muted',
            )}
          >
            {loop.enabled ? 'Loop' : 'Loop off'}
          </span>
          <div
            className="absolute inset-y-0 left-0 w-2 cursor-ew-resize hover:bg-foreground/50"
            title={studioLoopStrings.braceStartTitle}
            onPointerDown={(event) => beginLoopGesture('start', event)}
            data-testid="arrangement-loop-start-edge"
          />
          <div
            className="absolute inset-y-0 right-0 w-2 cursor-ew-resize hover:bg-foreground/50"
            title={studioLoopStrings.braceEndTitle}
            onPointerDown={(event) => beginLoopGesture('end', event)}
            data-testid="arrangement-loop-end-edge"
          />
        </div>
      ) : (
        <span className="pointer-events-none sticky left-56 inline-block whitespace-nowrap px-2 text-xs leading-4 text-muted">
          {LOOP_HINT}
        </span>
      )}
    </div>
  );
}
