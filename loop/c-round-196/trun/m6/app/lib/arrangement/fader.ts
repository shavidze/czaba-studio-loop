export interface RelativeFaderValueParams {
  startValue: number;
  deltaPx: number;
  widthPx: number;
  min: number;
  max: number;
  step: number;
}

const FADER_VALUE_PRECISION = 12;

export const FADER_SHIFT_FINE_DIVISOR = 10;

export function relativeFaderValue({
  startValue,
  deltaPx,
  widthPx,
  min,
  max,
  step,
}: RelativeFaderValueParams): number {
  if (
    ![startValue, deltaPx, widthPx, min, max, step].every(Number.isFinite) ||
    deltaPx === 0 ||
    widthPx <= 0 ||
    step <= 0 ||
    max <= min
  ) {
    return startValue;
  }
  const raw = startValue + (deltaPx * (max - min)) / widthPx;
  const snapped = min + Math.round((raw - min) / step) * step;
  const clamped = Math.min(max, Math.max(min, snapped));
  return Number.parseFloat(clamped.toPrecision(FADER_VALUE_PRECISION));
}
