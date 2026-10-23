import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { relativeFaderValue } from '~/lib/arrangement/fader';

export interface RelativeFaderDragOptions {
  min: number;
  max: number;
  step: number;
  readStoredValue: () => number;
  isPointerGestureActive: () => boolean;
  beginGesture: (pointerId: number) => boolean;
  previewValue: (value: number) => void;
  refuseGesture: () => void;
}

export interface RelativeFaderDragBinding {
  onPointerDown: (event: ReactPointerEvent<HTMLInputElement>) => void;
  ref: (element: HTMLInputElement | null) => void;
}

function preventFaderTouchStartDefault(event: TouchEvent) {
  event.preventDefault();
}

export function useRelativeFaderDrag(options: RelativeFaderDragOptions): RelativeFaderDragBinding {
  const optionsRef = useRef(options);
  const stopDragRef = useRef<(() => void) | null>(null);
  const touchFaderRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => () => stopDragRef.current?.(), []);

  const ref = useCallback((element: HTMLInputElement | null) => {
    touchFaderRef.current?.removeEventListener('touchstart', preventFaderTouchStartDefault);
    touchFaderRef.current = element;
    element?.addEventListener('touchstart', preventFaderTouchStartDefault, { passive: false });
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLInputElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (event.buttons === 0) {
      return;
    }
    const current = optionsRef.current;
    if (current.isPointerGestureActive()) {
      current.refuseGesture();
      return;
    }
    const fader = event.currentTarget;
    fader.focus();
    stopDragRef.current?.();
    const pointerId = event.pointerId;
    if (!current.beginGesture(pointerId)) {
      return;
    }
    const startX = event.clientX;
    const widthPx = fader.getBoundingClientRect().width;
    const startValue = current.readStoredValue();
    let previewedValue = startValue;
    const handleMove = (move: globalThis.PointerEvent) => {
      if (move.pointerId !== pointerId) {
        return;
      }
      const { min, max, step, previewValue } = optionsRef.current;
      const next = relativeFaderValue({
        startValue,
        deltaPx: move.clientX - startX,
        widthPx,
        min,
        max,
        step,
      });
      if (next === previewedValue) {
        return;
      }
      previewedValue = next;
      previewValue(next);
    };
    const handleEnd = (end: globalThis.PointerEvent) => {
      if (end.pointerId === pointerId) {
        stopDrag();
      }
    };
    function stopDrag() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
      window.removeEventListener('blur', stopDrag);
      fader.removeEventListener('blur', stopDrag);
      if (stopDragRef.current === stopDrag) {
        stopDragRef.current = null;
      }
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    window.addEventListener('blur', stopDrag);
    fader.addEventListener('blur', stopDrag);
    stopDragRef.current = stopDrag;
  }, []);

  return useMemo(() => ({ onPointerDown, ref }), [onPointerDown, ref]);
}
