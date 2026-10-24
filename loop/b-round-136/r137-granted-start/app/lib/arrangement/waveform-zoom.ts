import type { ArrangementClip } from '~/types/arrangement';
import { clipLinearGain } from './model';

export const WAVEFORM_ZOOM_LEVELS: readonly number[] = [0.5, 1, 2, 4, 8];

export const WAVEFORM_ZOOM_DEFAULT = 1;

export function waveformZoomLabel(level: number): string {
  return level === 0.5 ? '½×' : `${level}×`;
}

export function waveformZoomPercent(level: number): number {
  return Math.round(level * 100);
}

export function parseWaveformZoom(value: string): number | null {
  const level = Number(value);
  return WAVEFORM_ZOOM_LEVELS.includes(level) ? level : null;
}

export function waveformZoomStatus(level: number): string {
  return `Waveform Zoom ${waveformZoomPercent(level)}% — მხოლოდ ხედი, ხმა არ იცვლება.`;
}

export function clipWaveformScale(clip: ArrangementClip, isVideo: boolean, zoom: number): number {
  const gain = clipLinearGain(clip);
  if (isVideo) {
    return gain;
  }
  const z = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  return gain * z;
}
