import type { CSSProperties } from 'react';

export const STUDIO_SLIDER_INPUT_CLASS = [
  'appearance-none',
  'bg-transparent',
  'rounded-full',
  'forced-colors:appearance-auto',
].join(' ');

export const STUDIO_SLIDER_TRACK_CLASS = [
  '[&::-webkit-slider-runnable-track]:h-1',
  '[&::-webkit-slider-runnable-track]:rounded-full',
  '[&::-webkit-slider-runnable-track]:bg-outline-hover',
  '[&::-moz-range-track]:h-1',
  '[&::-moz-range-track]:rounded-full',
  '[&::-moz-range-track]:bg-outline-hover',
].join(' ');

export const STUDIO_SLIDER_THUMB_CLASS = [
  '[&::-webkit-slider-thumb]:-mt-1.25',
  '[&::-webkit-slider-thumb]:size-3.5',
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:border-0',
  '[&::-webkit-slider-thumb]:bg-foreground',
  '[&::-moz-range-thumb]:size-3.5',
  '[&::-moz-range-thumb]:appearance-none',
  '[&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-0',
  '[&::-moz-range-thumb]:bg-foreground',
].join(' ');

export const STUDIO_NEUTRAL_SLIDER_CLASS = [
  STUDIO_SLIDER_INPUT_CLASS,
  STUDIO_SLIDER_TRACK_CLASS,
  STUDIO_SLIDER_THUMB_CLASS,
].join(' ');

export const STUDIO_LEVEL_FADER_CLASS = [
  STUDIO_NEUTRAL_SLIDER_CLASS,
  '[&::-webkit-slider-runnable-track]:bg-linear-to-r',
  '[&::-webkit-slider-runnable-track]:from-brand',
  '[&::-webkit-slider-runnable-track]:to-brand',
  '[&::-webkit-slider-runnable-track]:bg-no-repeat',
  '[&::-webkit-slider-runnable-track]:bg-size-[calc(var(--spacing)*1.75+(100%-var(--spacing)*3.5)*var(--studio-fader-fill,0))_100%]',
  '[&::-moz-range-progress]:h-1',
  '[&::-moz-range-progress]:rounded-full',
  '[&::-moz-range-progress]:bg-brand',
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
