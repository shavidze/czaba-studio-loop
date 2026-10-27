import { formatMasterGainDb } from './model';

export const TRACK_VOLUME_DB_MIN = -60;
export const TRACK_VOLUME_DB_MAX = 0;
export const TRACK_VOLUME_DB_STEP = 0.1;
export const TRACK_VOLUME_DB_FLOOR = -59.9;
export const TRACK_VOLUME_DB_DEFAULT = 0;
export const TRACK_VOLUME_MINUS_INFINITY_TEXT = '−∞ dB';
export const TRACK_VOLUME_UNITY_TEXT = '+0.0 dB';

function roundTrackVolumeDb(db: number): number {
  const rounded = Math.round(db * 10) / 10;
  return rounded === 0 ? 0 : rounded;
}

export function trackVolumeFromDb(db: number): number {
  if (!Number.isFinite(db) || db <= TRACK_VOLUME_DB_MIN) {
    return 0;
  }
  return 10 ** (Math.min(db, TRACK_VOLUME_DB_MAX) / 20);
}

export function trackVolumeSliderDb(volume: number): number {
  if (!Number.isFinite(volume) || volume <= 0) {
    return TRACK_VOLUME_DB_MIN;
  }
  const db = roundTrackVolumeDb(20 * Math.log10(volume));
  return Math.min(TRACK_VOLUME_DB_MAX, Math.max(TRACK_VOLUME_DB_FLOOR, db));
}

export function trackVolumeReadoutDb(volume: number): number | null {
  if (!Number.isFinite(volume) || volume <= 0) {
    return null;
  }
  return roundTrackVolumeDb(20 * Math.log10(volume));
}

export function formatTrackVolumeDb(volume: number): string {
  const db = trackVolumeReadoutDb(volume);
  if (db === null) {
    return TRACK_VOLUME_MINUS_INFINITY_TEXT;
  }
  return db === 0 ? TRACK_VOLUME_UNITY_TEXT : formatMasterGainDb(db);
}

export function formatTrackVolumeReadout(volume: number): string {
  return formatTrackVolumeDb(volume).replace(/ dB$/, '');
}
