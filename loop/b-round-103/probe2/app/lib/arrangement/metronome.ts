import { ARRANGEMENT_EPS } from './model';
import { formatTempoBpm, TEMPO_BEATS_PER_BAR } from './tempo';

export const METRONOME_CLICK_SECONDS = 0.03;
export const METRONOME_ACCENT_FREQUENCY_HZ = 1600;
export const METRONOME_BEAT_FREQUENCY_HZ = 1000;
export const METRONOME_ACCENT_PEAK = 0.5;
export const METRONOME_BEAT_PEAK = 0.25;
export const METRONOME_SCHEDULE_HORIZON_SECONDS = 2;
export const METRONOME_NEEDS_TEMPO_TITLE = 'მეტრონომი — ჯერ მიუთითე BPM';
export const METRONOME_TITLE = `მეტრონომი — კლიკი ყოველ დარტყმაზე დაკვრისას (${TEMPO_BEATS_PER_BAR}/4, ტაქტის პირველი დარტყმა უფრო ხმამაღლა). Master-ის ხმა და Mute მასზეც მოქმედებს. ექსპორტში არ შედის.`;

const METRONOME_DECAY_SECONDS = 0.005;
const SECONDS_PER_MINUTE = 60;

export interface MetronomeClick {
  when: number;
  offset: number;
  duration: number;
  accent: boolean;
}

export interface MetronomeHorizonState {
  bpm: number;
  from: number;
  startAt: number;
  end: number;
  nextFrom: number;
}

export function planMetronomeClicks(
  bpm: number,
  from: number,
  until: number,
  soundUntil?: number,
): MetronomeClick[] {
  if (
    !Number.isFinite(bpm) ||
    bpm <= 0 ||
    !Number.isFinite(from) ||
    !Number.isFinite(until) ||
    until <= from
  ) {
    return [];
  }
  const soundEnd =
    soundUntil !== undefined && Number.isFinite(soundUntil) && soundUntil >= until
      ? soundUntil
      : until;
  const clicks: MetronomeClick[] = [];
  let k = Math.max(0, Math.floor((from * bpm) / SECONDS_PER_MINUTE) - 1);
  let time = (k * SECONDS_PER_MINUTE) / bpm;
  while (time < until - ARRANGEMENT_EPS) {
    if (time >= from - ARRANGEMENT_EPS) {
      const when = Math.max(time, from);
      const offset = when - time;
      clicks.push({
        when,
        offset,
        duration: Math.min(METRONOME_CLICK_SECONDS - offset, soundEnd - when),
        accent: k % TEMPO_BEATS_PER_BAR === 0,
      });
    }
    k += 1;
    time = (k * SECONDS_PER_MINUTE) / bpm;
  }
  return clicks;
}

export function nextMetronomeChunk(
  state: MetronomeHorizonState,
  now: number,
  horizon: number,
  lateMargin: number,
): { from: number; until: number } | null {
  if (
    !Number.isFinite(state.from) ||
    !Number.isFinite(state.startAt) ||
    !Number.isFinite(state.end) ||
    !Number.isFinite(state.nextFrom) ||
    state.nextFrom >= state.end - ARRANGEMENT_EPS
  ) {
    return null;
  }
  const chunkCtx = state.startAt + (state.nextFrom - state.from);
  if (chunkCtx > now + horizon) {
    return null;
  }
  const from =
    chunkCtx < now + lateMargin ? state.from + (now + lateMargin - state.startAt) : state.nextFrom;
  if (from >= state.end - ARRANGEMENT_EPS) {
    return null;
  }
  return { from, until: Math.min(state.end, from + horizon) };
}

export function generateMetronomeClickSamples(
  sampleRate: number,
  accent: boolean,
): Float32Array<ArrayBuffer> {
  const length = Math.round(METRONOME_CLICK_SECONDS * sampleRate);
  const frequency = accent ? METRONOME_ACCENT_FREQUENCY_HZ : METRONOME_BEAT_FREQUENCY_HZ;
  const peak = accent ? METRONOME_ACCENT_PEAK : METRONOME_BEAT_PEAK;
  const decaySamples = METRONOME_DECAY_SECONDS * sampleRate;
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    samples[i] =
      peak * Math.sin((2 * Math.PI * frequency * i) / sampleRate) * Math.exp(-i / decaySamples);
  }
  return samples;
}

export function metronomeStatusMessage(bpm: number | null): string {
  if (bpm === null) {
    return 'მეტრონომი გამორთულია.';
  }
  return `მეტრონომი ჩართულია — ${formatTempoBpm(bpm)} BPM, ${TEMPO_BEATS_PER_BAR}/4: კლიკი ყოველ დარტყმაზე, ტაქტის პირველზე უფრო ხმამაღლა. ექსპორტში არ შედის.`;
}
