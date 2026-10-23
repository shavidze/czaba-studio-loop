import {
  RULER_LABEL_CHAR_WIDTH_PX,
  RULER_LABEL_OFFSET_PX,
  RULER_LABEL_SPACING_PX,
  RULER_TICK_LINE_PX,
} from './view';

export const TEMPO_BPM_MIN = 20;
export const TEMPO_BPM_MAX = 999;
export const TEMPO_BEATS_PER_BAR = 4;
export const TEMPO_INVALID_MESSAGE = `ტემპი უნდა იყოს ${TEMPO_BPM_MIN}–${TEMPO_BPM_MAX} BPM (მაგ. 90 ან 92.5) — არ შეიცვალა.`;
export const TEMPO_EMPTY_HINT = 'ტაქტები: მიუთითე BPM — მხოლოდ ბადე, აუდიო არ იწელება';

const TEMPO_TEXT_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;
const SECONDS_PER_MINUTE = 60;

export interface BarsRulerMark {
  time: number;
  kind: 'bar' | 'beat';
  label: string | null;
}

export interface BarsRulerWindow {
  fromPx: number;
  toPx: number;
}

export function parseTempoBpm(text: string): number | null {
  const normalized = text.trim().replace(/,/g, '.');
  if (!TEMPO_TEXT_PATTERN.test(normalized)) {
    return null;
  }
  const bpm = Math.round(Number(normalized) * 100) / 100;
  return bpm >= TEMPO_BPM_MIN && bpm <= TEMPO_BPM_MAX ? bpm : null;
}

export function formatTempoBpm(bpm: number): string {
  return String(Math.round(bpm * 100) / 100);
}

export function tempoStatusMessage(bpm: number | null): string {
  if (bpm === null) {
    return 'ტემპი წაიშალა — ტაქტების სახაზავი დამალულია. აუდიო არ შეცვლილა.';
  }
  return `ტემპი ${formatTempoBpm(bpm)} BPM · ${TEMPO_BEATS_PER_BAR}/4 — ტაქტების სახაზავი განახლდა. მხოლოდ ბადეა: აუდიო არ იწელება.`;
}

export function barsRulerMarks(
  seconds: number,
  pxPerSecond: number,
  bpm: number,
  rulerWindow?: BarsRulerWindow,
): BarsRulerMark[] {
  if (
    !Number.isFinite(seconds) ||
    !Number.isFinite(pxPerSecond) ||
    !Number.isFinite(bpm) ||
    seconds <= 0 ||
    pxPerSecond <= 0 ||
    bpm <= 0
  ) {
    return [];
  }
  if (
    rulerWindow !== undefined &&
    (!Number.isFinite(rulerWindow.fromPx) ||
      !Number.isFinite(rulerWindow.toPx) ||
      rulerWindow.toPx < rulerWindow.fromPx)
  ) {
    return [];
  }
  const barSecondsAtOneBpm = TEMPO_BEATS_PER_BAR * SECONDS_PER_MINUTE;
  const barSeconds = barSecondsAtOneBpm / bpm;
  let barStep = 1;
  while (barStep * barSeconds * pxPerSecond < RULER_LABEL_SPACING_PX) {
    barStep *= 2;
  }
  const rulerWidthPx = seconds * pxPerSecond;
  const labelBeats = (SECONDS_PER_MINUTE / bpm) * pxPerSecond >= RULER_LABEL_SPACING_PX;
  const marks: BarsRulerMark[] = [];
  const pushMark = (time: number, kind: BarsRulerMark['kind'], label: string | null) => {
    const leftPx = time * pxPerSecond;
    if (
      leftPx + RULER_TICK_LINE_PX > rulerWidthPx ||
      (rulerWindow !== undefined && (leftPx < rulerWindow.fromPx || leftPx > rulerWindow.toPx))
    ) {
      return;
    }
    const fits =
      label !== null &&
      leftPx + RULER_LABEL_OFFSET_PX + label.length * RULER_LABEL_CHAR_WIDTH_PX <= rulerWidthPx;
    marks.push({ time, kind, label: fits ? label : null });
  };
  const lastBar = Math.floor((seconds * bpm) / barSecondsAtOneBpm);
  const windowBar =
    rulerWindow === undefined ? 0 : Math.floor(rulerWindow.fromPx / (barSeconds * pxPerSecond));
  const firstBar = Math.max(0, (Math.floor(windowBar / barStep) - 1) * barStep);
  for (let bar = firstBar; bar <= lastBar; bar += barStep) {
    const barTime = (bar * barSecondsAtOneBpm) / bpm;
    if (rulerWindow !== undefined && barTime * pxPerSecond > rulerWindow.toPx) {
      break;
    }
    pushMark(barTime, 'bar', String(bar + 1));
    if (barStep === 1) {
      for (let beat = 1; beat < TEMPO_BEATS_PER_BAR; beat++) {
        pushMark(
          ((bar * TEMPO_BEATS_PER_BAR + beat) * SECONDS_PER_MINUTE) / bpm,
          'beat',
          labelBeats ? `${bar + 1}.${beat + 1}` : null,
        );
      }
    }
  }
  return marks;
}
