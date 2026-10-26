export const MAX_24BIT_SAMPLE = 8388607 / 8388608;
export const METER_FLOOR_DB = -60;
export const METER_CEILING_DB = 6;
export const METER_RELEASE_DB_PER_SECOND = 20;
export const METER_PEAK_HOLD_MS = 1500;
export const MASTER_METER_FFT_SIZE = 4096;

export interface MeterBlock {
  peak: number;
  over: boolean;
}

export interface MasterMeterState {
  levelDb: number;
  holdDb: number;
  holdUntilMs: number;
  maxPeak: number;
  over: boolean;
  lastMs: number | null;
}

export interface MasterMeterStore {
  getMeterFrame: () => MasterMeterState;
  getMeterOver: () => boolean;
  publishMeterFrame: (next: MasterMeterState) => void;
  subscribeMeter: (listener: () => void) => () => void;
}

export function isOverFullScale(sample: number): boolean {
  return sample > MAX_24BIT_SAMPLE || sample < -1;
}

export function measureBlock(samples: ArrayLike<number>): MeterBlock {
  let peak = 0;
  let over = false;
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const magnitude = Math.abs(sample);
    if (magnitude > peak) {
      peak = magnitude;
    }
    if (isOverFullScale(sample)) {
      over = true;
    }
  }
  return { peak, over };
}

function peakToMeterDb(peak: number): number {
  if (!(peak > 0)) {
    return METER_FLOOR_DB;
  }
  return Math.max(METER_FLOOR_DB, 20 * Math.log10(peak));
}

export function createMasterMeterState(): MasterMeterState {
  return {
    levelDb: METER_FLOOR_DB,
    holdDb: METER_FLOOR_DB,
    holdUntilMs: 0,
    maxPeak: 0,
    over: false,
    lastMs: null,
  };
}

export function stepMeter(
  state: MasterMeterState,
  block: MeterBlock,
  nowMs: number,
): MasterMeterState {
  const elapsed = state.lastMs === null ? 0 : Math.max(0, nowMs - state.lastMs) / 1000;
  const released = Math.max(METER_FLOOR_DB, state.levelDb - METER_RELEASE_DB_PER_SECOND * elapsed);
  const levelDb = Math.max(peakToMeterDb(block.peak), released);
  let holdDb = state.holdDb;
  let holdUntilMs = state.holdUntilMs;
  if (levelDb > holdDb) {
    holdDb = levelDb;
    holdUntilMs = nowMs + METER_PEAK_HOLD_MS;
  } else if (nowMs >= holdUntilMs) {
    holdDb = levelDb;
  }
  return {
    levelDb,
    holdDb,
    holdUntilMs,
    maxPeak: Math.max(state.maxPeak, block.peak),
    over: state.over || block.over,
    lastMs: nowMs,
  };
}

export function floorMasterMeter(state: MasterMeterState): MasterMeterState {
  return {
    ...state,
    levelDb: METER_FLOOR_DB,
    holdDb: METER_FLOOR_DB,
    holdUntilMs: 0,
    lastMs: null,
  };
}

export function resetMasterMeterPeak(state: MasterMeterState): MasterMeterState {
  return { ...state, maxPeak: 0, over: false };
}

export function formatPeakDbfs(peak: number, over: boolean): string {
  const db = peak > 0 ? 20 * Math.log10(peak) : Number.NEGATIVE_INFINITY;
  if (over) {
    const shown = Math.round(Math.max(0, db) * 10) / 10;
    return `+${shown.toFixed(1)}`;
  }
  if (db <= METER_FLOOR_DB) {
    return '−∞';
  }
  const rounded = Math.round(db * 10) / 10;
  if (rounded < 0) {
    return `−${Math.abs(rounded).toFixed(1)}`;
  }
  return '0.0';
}

export function formatMeterDbAttribute(db: number): string {
  if (db <= METER_FLOOR_DB) {
    return '-inf';
  }
  return (Math.round(db * 10) / 10).toFixed(1);
}

export function meterDbToFraction(db: number): number {
  const clamped = Math.min(METER_CEILING_DB, Math.max(METER_FLOOR_DB, db));
  return (clamped - METER_FLOOR_DB) / (METER_CEILING_DB - METER_FLOOR_DB);
}

export interface TrackMeterStore {
  getTrackMeterFrame: (trackId: string) => MasterMeterState;
  getTrackMeterOver: (trackId: string) => boolean;
  publishTrackMeterFrames: (frames: ReadonlyMap<string, MasterMeterState>) => void;
  subscribeTrackMeters: (listener: () => void) => () => void;
}

const TRACK_METER_FLOOR_FRAME: MasterMeterState = Object.freeze(createMasterMeterState());

export function floorTrackMeterFrames(
  frames: ReadonlyMap<string, MasterMeterState>,
): Map<string, MasterMeterState> {
  return new Map([...frames].map(([trackId, frame]) => [trackId, floorMasterMeter(frame)]));
}

export function resetTrackMeterPeaks(
  frames: ReadonlyMap<string, MasterMeterState>,
): Map<string, MasterMeterState> {
  return new Map([...frames].map(([trackId, frame]) => [trackId, resetMasterMeterPeak(frame)]));
}

export function createTrackMeterStore(): TrackMeterStore {
  const current = new Map<string, MasterMeterState>();
  const listeners = new Set<() => void>();
  return {
    getTrackMeterFrame: (trackId) => current.get(trackId) ?? TRACK_METER_FLOOR_FRAME,
    getTrackMeterOver: (trackId) => current.get(trackId)?.over ?? false,
    publishTrackMeterFrames: (frames) => {
      for (const [trackId, frame] of frames) {
        current.set(trackId, frame);
      }
      for (const listener of [...listeners]) {
        listener();
      }
    },
    subscribeTrackMeters: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function createMasterMeterStore(): MasterMeterStore {
  let current = createMasterMeterState();
  const listeners = new Set<() => void>();
  return {
    getMeterFrame: () => current,
    getMeterOver: () => current.over,
    publishMeterFrame: (next) => {
      current = next;
      for (const listener of [...listeners]) {
        listener();
      }
    },
    subscribeMeter: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
