import { type MouseEvent, type PointerEvent, useEffect, useRef } from 'react';
import {
  addClipEnvelopePoint,
  clipEnvelopeGainAtSource,
  clipEnvelopePointTimelineTime,
  formatClipEnvelopeGain,
  moveClipEnvelopePoint,
  removeClipEnvelopePoint,
  visibleClipEnvelopePoints,
} from '~/lib/arrangement/envelope';
import type { SelectionToggleMode } from '~/lib/arrangement/selection';
import { studioClipEnvelopeStrings, studioClipStrings } from '~/lib/arrangement/strings';
import type {
  Arrangement,
  ArrangementClip,
  ArrangementClipEnvelopePoint,
} from '~/types/arrangement';

export const CLIP_DRAG_DOUBLE_CLICK_GUARD_MS = 500;

const ENVELOPE_DRAG_THRESHOLD_PX = 3;
const CLIP_ENVELOPE_ROOT_BORDER_PX = 1;
const ENVELOPE_ADD_LABEL = studioClipEnvelopeStrings.addPointLabel;
const ENVELOPE_MOVE_LABEL = studioClipEnvelopeStrings.movePointLabel;
const ENVELOPE_REMOVE_LABEL = studioClipEnvelopeStrings.deletePointLabel;
const ENVELOPE_NO_CHANGE = studioClipStrings.historyUnchanged('Envelope');

export interface ClipEnvelopePointerGesture {
  pointerId: number;
  release: () => void;
}

export interface ArrangementClipEnvelopeProps {
  clip: ArrangementClip;
  pxPerSecond: number;
  width: number;
  editing: boolean;
  getArrangement: () => Arrangement;
  previewArrangement: (next: Arrangement) => void;
  commitArrangement: (next: Arrangement, label: string, before: Arrangement) => boolean;
  selectClip: (clipId: string | null) => void;
  toggleClipSelection: (clipId: string, mode: SelectionToggleMode) => void;
  setActiveTrack: (trackId: string) => void;
  setTimeRange: (range: null) => void;
  setStatus: (message: string) => void;
  claimPointerGesture: (pointerId: number, abort: () => void) => (() => void) | null;
  watchLostPointer: (gesture: ClipEnvelopePointerGesture, onLostPointer: () => void) => void;
}

interface ClipEnvelopePointGesture extends ClipEnvelopePointerGesture {
  slot: number;
  startX: number;
  startY: number;
  before: Arrangement;
  pointSourceTime: number;
  pointIndex: number;
  originalTime: number;
  originalGain: number;
  bodyHeight: number;
  moved: boolean;
  captureElement: HTMLElement;
  revert: () => void;
}

interface ClipEnvelopePointSlot {
  point: ArrangementClipEnvelopePoint;
  slot: number;
}

function envelopePointTitle(time: number, gain: number): string {
  return studioClipEnvelopeStrings.pointTitle({
    time: studioClipStrings.seconds(time.toFixed(3)),
    gain: formatClipEnvelopeGain(gain),
  });
}

function envelopePointAfterMove(
  arrangement: Arrangement,
  clipId: string,
  pointIndex: number,
): { clip: ArrangementClip; point: ArrangementClipEnvelopePoint } | null {
  const clip = arrangement.clips.find((entry) => entry.id === clipId);
  const point = clip?.envelope?.[pointIndex];
  return clip && point ? { clip, point } : null;
}

function ClipEnvelopeEditor({
  clip,
  slots,
  pxPerSecond,
  getArrangement,
  previewArrangement,
  commitArrangement,
  selectClip,
  toggleClipSelection,
  setActiveTrack,
  setTimeRange,
  setStatus,
  claimPointerGesture,
  watchLostPointer,
}: Omit<ArrangementClipEnvelopeProps, 'width' | 'editing'> & {
  slots: readonly ClipEnvelopePointSlot[];
}) {
  const gestureRef = useRef<ClipEnvelopePointGesture | null>(null);
  const lastMovedRef = useRef<{ slot: number; at: number } | null>(null);

  useEffect(
    () => () => {
      const gesture = gestureRef.current;
      gestureRef.current = null;
      if (gesture) {
        if (gesture.moved) {
          gesture.revert();
        }
        gesture.release();
      }
    },
    [],
  );

  const endStaleEnvelopeGesture = (gesture: ClipEnvelopePointGesture) => {
    gestureRef.current = null;
    if (gesture.moved) {
      lastMovedRef.current = { slot: gesture.slot, at: performance.now() };
      gesture.revert();
    }
    gesture.release();
  };

  const handleEditorPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      toggleClipSelection(clip.id, 'toggle');
      return;
    }
    if (event.shiftKey) {
      toggleClipSelection(clip.id, 'add');
      return;
    }
    selectClip(clip.id);
    setActiveTrack(clip.trackId);
  };

  const handleEditorDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const root = event.currentTarget.closest<HTMLElement>('[data-clip-id]');
    const left = root
      ? root.getBoundingClientRect().left
      : (event.currentTarget.parentElement?.getBoundingClientRect().left ?? 0) -
        CLIP_ENVELOPE_ROOT_BORDER_PX;
    const before = getArrangement();
    const next = addClipEnvelopePoint(
      before,
      clip.id,
      clip.start + (event.clientX - left) / pxPerSecond,
    );
    if (next === before) {
      return;
    }
    const known = new Set(
      (before.clips.find((entry) => entry.id === clip.id)?.envelope ?? []).map(
        (point) => point.time,
      ),
    );
    const updated = next.clips.find((entry) => entry.id === clip.id);
    const added = updated?.envelope?.find((point) => !known.has(point.time));
    if (!commitArrangement(next, ENVELOPE_ADD_LABEL, before) || !updated || !added) {
      return;
    }
    setStatus(
      studioClipEnvelopeStrings.pointAdded({
        time: studioClipStrings.seconds(clipEnvelopePointTimelineTime(updated, added).toFixed(3)),
        gain: formatClipEnvelopeGain(added.gain),
      }),
    );
  };

  const handlePointPointerDown = (slot: number, event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.buttons === 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const point = slots[slot]?.point;
    if (!point) {
      return;
    }
    let claimed: ClipEnvelopePointGesture | null = null;
    const releaseClaim = claimPointerGesture(event.pointerId, () => {
      const stale = claimed;
      if (stale && gestureRef.current === stale) {
        endStaleEnvelopeGesture(stale);
        return;
      }
      stale?.release();
    });
    if (!releaseClaim) {
      return;
    }
    const leftover = gestureRef.current;
    if (leftover) {
      endStaleEnvelopeGesture(leftover);
    }
    const before = getArrangement();
    const captureElement = event.currentTarget;
    claimed = {
      pointerId: event.pointerId,
      slot,
      startX: event.clientX,
      startY: event.clientY,
      before,
      pointSourceTime: point.time,
      pointIndex: (clip.envelope ?? []).indexOf(point),
      originalTime: clipEnvelopePointTimelineTime(clip, point),
      originalGain: point.gain,
      bodyHeight: captureElement.parentElement?.getBoundingClientRect().height ?? 0,
      moved: false,
      captureElement,
      release: releaseClaim,
      revert: () => previewArrangement(before),
    };
    gestureRef.current = claimed;
    selectClip(clip.id);
    setActiveTrack(clip.trackId);
    setTimeRange(null);
    try {
      captureElement.setPointerCapture(event.pointerId);
    } catch {
      const gesture = gestureRef.current;
      if (gesture) {
        watchLostPointer(gesture, () => {
          if (gestureRef.current === gesture) {
            endStaleEnvelopeGesture(gesture);
            return;
          }
          gesture.release();
        });
      }
    }
  };

  const handlePointPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (
      !gesture.moved &&
      Math.abs(dx) < ENVELOPE_DRAG_THRESHOLD_PX &&
      Math.abs(dy) < ENVELOPE_DRAG_THRESHOLD_PX
    ) {
      return;
    }
    gesture.moved = true;
    const gainDelta = gesture.bodyHeight > 0 ? dy / gesture.bodyHeight : 0;
    const next = moveClipEnvelopePoint(
      gesture.before,
      clip.id,
      gesture.pointSourceTime,
      gesture.originalTime + dx / pxPerSecond,
      gesture.originalGain - gainDelta,
    );
    previewArrangement(next);
    const moved = envelopePointAfterMove(next, clip.id, gesture.pointIndex);
    if (moved) {
      setStatus(
        studioClipEnvelopeStrings.pointPreview({
          time: studioClipStrings.seconds(
            clipEnvelopePointTimelineTime(moved.clip, moved.point).toFixed(3),
          ),
          gain: formatClipEnvelopeGain(moved.point.gain),
        }),
      );
    }
  };

  const finishPointGesture = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    const cancelled = event.type === 'pointercancel';
    if (cancelled) {
      endStaleEnvelopeGesture(gesture);
    } else {
      gestureRef.current = null;
      gesture.release();
    }
    if (gesture.captureElement.hasPointerCapture(event.pointerId)) {
      gesture.captureElement.releasePointerCapture(event.pointerId);
    }
    if (!gesture.moved) {
      return;
    }
    lastMovedRef.current = { slot: gesture.slot, at: performance.now() };
    if (cancelled) {
      return;
    }
    if (!commitArrangement(getArrangement(), ENVELOPE_MOVE_LABEL, gesture.before)) {
      setStatus(ENVELOPE_NO_CHANGE);
      return;
    }
    const moved = envelopePointAfterMove(getArrangement(), clip.id, gesture.pointIndex);
    if (moved) {
      setStatus(
        studioClipEnvelopeStrings.pointCommitted({
          time: studioClipStrings.seconds(
            clipEnvelopePointTimelineTime(moved.clip, moved.point).toFixed(3),
          ),
          gain: formatClipEnvelopeGain(moved.point.gain),
        }),
      );
    }
  };

  const handlePointDoubleClick = (slot: number, event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const lastMoved = lastMovedRef.current;
    if (
      lastMoved &&
      lastMoved.slot === slot &&
      performance.now() - lastMoved.at < CLIP_DRAG_DOUBLE_CLICK_GUARD_MS
    ) {
      return;
    }
    const point = slots[slot]?.point;
    if (!point) {
      return;
    }
    const before = getArrangement();
    const next = removeClipEnvelopePoint(before, clip.id, point.time);
    if (next === before) {
      return;
    }
    if (commitArrangement(next, ENVELOPE_REMOVE_LABEL, before)) {
      setStatus(
        studioClipEnvelopeStrings.pointDeleted(
          studioClipStrings.seconds(clipEnvelopePointTimelineTime(clip, point).toFixed(3)),
        ),
      );
    }
  };

  return (
    <>
      <div
        className="absolute inset-x-2 inset-y-0 z-10 cursor-crosshair"
        data-testid="arrangement-clip-envelope-editor"
        title={studioClipEnvelopeStrings.editorTitle}
        onPointerDown={handleEditorPointerDown}
        onDoubleClick={handleEditorDoubleClick}
      />
      {slots.map(({ point, slot }) => {
        const time = clipEnvelopePointTimelineTime(clip, point);
        return (
          <div
            key={slot}
            data-testid="arrangement-clip-envelope-point"
            data-time={time.toFixed(3)}
            data-gain={point.gain.toFixed(4)}
            className="absolute z-30 size-2 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-xs border border-foreground bg-accent"
            style={{
              left: (point.time - clip.sourceOffset) * pxPerSecond - CLIP_ENVELOPE_ROOT_BORDER_PX,
              top: `${(1 - point.gain) * 100}%`,
            }}
            title={envelopePointTitle(time, point.gain)}
            onPointerDown={(event) => handlePointPointerDown(slot, event)}
            onPointerMove={handlePointPointerMove}
            onPointerUp={finishPointGesture}
            onPointerCancel={finishPointGesture}
            onDoubleClick={(event) => handlePointDoubleClick(slot, event)}
          />
        );
      })}
    </>
  );
}

export function ArrangementClipEnvelope({
  width,
  editing,
  ...props
}: ArrangementClipEnvelopeProps) {
  const { clip, pxPerSecond } = props;
  const points = visibleClipEnvelopePoints(clip);
  if ((clip.envelope?.length ?? 0) === 0 && !editing) {
    return null;
  }
  const lineWidth = Math.max(1, width);
  const envelope = clip.envelope ?? [];
  const firstGain = clipEnvelopeGainAtSource(envelope, clip.sourceOffset);
  const lastGain = clipEnvelopeGainAtSource(envelope, clip.sourceOffset + clip.duration);
  const linePoints = [
    `0,${1 - firstGain}`,
    ...points.map((point) => `${(point.time - clip.sourceOffset) * pxPerSecond},${1 - point.gain}`),
    `${lineWidth},${1 - lastGain}`,
  ].join(' ');
  const slots = points.map((point, slot) => ({ point, slot }));
  return (
    <>
      <svg
        className="pointer-events-none absolute inset-y-0 h-full overflow-visible text-accent"
        style={{ left: -CLIP_ENVELOPE_ROOT_BORDER_PX, width: lineWidth }}
        viewBox={`0 0 ${lineWidth} 1`}
        preserveAspectRatio="none"
        aria-hidden="true"
        data-testid="arrangement-clip-envelope-line"
      >
        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {editing ? <ClipEnvelopeEditor {...props} slots={slots} /> : null}
    </>
  );
}
