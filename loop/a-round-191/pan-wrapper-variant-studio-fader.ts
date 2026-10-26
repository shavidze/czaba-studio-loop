import type { CSSProperties } from 'react';

export const STUDIO_FADER_FOCUS_CLASS = [
  'rounded-full',
  'focus-visible:outline-2!',
  'focus-visible:outline-offset-2!',
  'focus-visible:outline-brand!',
].join(' ');

export const STUDIO_FADER_FOCUS_WRAPPER_CLASS = [
  'rounded-full',
  'has-[:focus-visible]:outline-2!',
  'has-[:focus-visible]:outline-offset-2!',
  'has-[:focus-visible]:outline-brand!',
].join(' ');

export const STUDIO_FADER_FOCUS_DELEGATED_CLASS = 'focus-visible:outline-none!';

export const STUDIO_LEVEL_FADER_CLASS = [
  'appearance-none',
  'bg-transparent',
  '[&::-webkit-slider-runnable-track]:h-1',
  '[&::-webkit-slider-runnable-track]:rounded-full',
  '[&::-webkit-slider-runnable-track]:bg-outline-hover',
  '[&::-webkit-slider-runnable-track]:bg-linear-to-r',
  '[&::-webkit-slider-runnable-track]:from-brand',
  '[&::-webkit-slider-runnable-track]:to-brand',
  '[&::-webkit-slider-runnable-track]:bg-no-repeat',
  '[&::-webkit-slider-runnable-track]:bg-size-[calc(var(--spacing)*1.875+(100%-var(--spacing)*3.75)*var(--studio-fader-fill,0))_100%]',
  '[&::-webkit-slider-thumb]:-mt-[calc(var(--spacing)*1.375)]',
  '[&::-webkit-slider-thumb]:size-3.75',
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:bg-foreground',
  '[&::-moz-range-track]:h-1',
  '[&::-moz-range-track]:rounded-full',
  '[&::-moz-range-track]:bg-outline-hover',
  '[&::-moz-range-progress]:h-1',
  '[&::-moz-range-progress]:rounded-full',
  '[&::-moz-range-progress]:bg-brand',
  '[&::-moz-range-thumb]:size-3.75',
  '[&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-0',
  '[&::-moz-range-thumb]:bg-foreground',
  'forced-colors:appearance-auto',
].join(' ');

export interface StudioLevelFaderRange {
  value: number;
  min: number;
  max: number;
}

export interface StudioLevelFaderFillStyle extends CSSProperties {
  '--studio-fader-fill': string;
}

export function studioLevelFaderFillFraction({ value, min, max }: StudioLevelFaderRange): number {
  const span = max - min;
  if (Number.isNaN(value) || !Number.isFinite(span) || span <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, (value - min) / span));
}

export function studioLevelFaderFillStyle(range: StudioLevelFaderRange): StudioLevelFaderFillStyle {
  return { '--studio-fader-fill': String(Number(studioLevelFaderFillFraction(range).toFixed(4))) };
}
