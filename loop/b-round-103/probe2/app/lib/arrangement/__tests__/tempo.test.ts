import { describe, expect, it } from 'vitest';
import {
  barsRulerMarks,
  formatTempoBpm,
  parseTempoBpm,
  TEMPO_EMPTY_HINT,
  TEMPO_INVALID_MESSAGE,
  tempoStatusMessage,
} from '../tempo';

function expectMarks(
  actual: ReturnType<typeof barsRulerMarks>,
  expected: { time: number; kind: 'bar' | 'beat'; label: string | null }[],
) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((mark, index) => {
    expect(actual[index].kind).toBe(mark.kind);
    expect(actual[index].label).toBe(mark.label);
    expect(actual[index].time).toBeCloseTo(mark.time, 6);
  });
}

describe('SRW-15 stage 1 tempo model', () => {
  it('T1 parses integers within the 20–999 bounds', () => {
    expect(parseTempoBpm('90')).toBe(90);
    expect(parseTempoBpm('20')).toBe(20);
    expect(parseTempoBpm('999')).toBe(999);
    expect(parseTempoBpm(' 120 ')).toBe(120);
  });

  it('T2 parses decimals with a dot or a comma', () => {
    expect(parseTempoBpm('92.5')).toBe(92.5);
    expect(parseTempoBpm('92,5')).toBe(92.5);
    expect(parseTempoBpm('120.25')).toBe(120.25);
    expect(parseTempoBpm('60.1')).toBe(60.1);
  });

  it('T3 rejects empty, out-of-range and malformed text', () => {
    for (const text of [
      '',
      '  ',
      '19.99',
      '1000',
      '999.5',
      'abc',
      '90.123',
      '-90',
      '1e2',
      '90bpm',
      '0',
    ]) {
      expect(parseTempoBpm(text)).toBeNull();
    }
  });

  it('T4 formats with up to two decimals and no trailing zeros', () => {
    expect(formatTempoBpm(90)).toBe('90');
    expect(formatTempoBpm(92.5)).toBe('92.5');
    expect(formatTempoBpm(120.25)).toBe('120.25');
  });

  it('T5 90 BPM at 40 px/s gives four bars and unlabeled beats, nothing at 10 s', () => {
    const marks = barsRulerMarks(10, 40, 90);
    expectMarks(marks, [
      { time: 0, kind: 'bar', label: '1' },
      { time: 0.666667, kind: 'beat', label: null },
      { time: 1.333333, kind: 'beat', label: null },
      { time: 2, kind: 'beat', label: null },
      { time: 2.666667, kind: 'bar', label: '2' },
      { time: 3.333333, kind: 'beat', label: null },
      { time: 4, kind: 'beat', label: null },
      { time: 4.666667, kind: 'beat', label: null },
      { time: 5.333333, kind: 'bar', label: '3' },
      { time: 6, kind: 'beat', label: null },
      { time: 6.666667, kind: 'beat', label: null },
      { time: 7.333333, kind: 'beat', label: null },
      { time: 8, kind: 'bar', label: '4' },
      { time: 8.666667, kind: 'beat', label: null },
      { time: 9.333333, kind: 'beat', label: null },
    ]);
    expect(marks.some((mark) => Math.abs(mark.time - 10) < 1e-6)).toBe(false);
  });

  it('T6 120 BPM at 40 px/s gives bars 1–5 every 2 s and unlabeled beats', () => {
    const marks = barsRulerMarks(10, 40, 120);
    expect(marks).toHaveLength(20);
    const bars = marks.filter((mark) => mark.kind === 'bar');
    expect(bars.map((mark) => mark.label)).toEqual(['1', '2', '3', '4', '5']);
    bars.forEach((mark, index) => {
      expect(mark.time).toBeCloseTo(index * 2, 6);
    });
    const beats = marks.filter((mark) => mark.kind === 'beat');
    expect(beats).toHaveLength(15);
    for (const beat of beats) {
      expect(beat.label).toBeNull();
    }
  });

  it('T7 zoomed out thins bars to every fourth and drops beats and the clipped label', () => {
    const marks = barsRulerMarks(60, 5, 120);
    expectMarks(marks, [
      { time: 0, kind: 'bar', label: '1' },
      { time: 8, kind: 'bar', label: '5' },
      { time: 16, kind: 'bar', label: '9' },
      { time: 24, kind: 'bar', label: '13' },
      { time: 32, kind: 'bar', label: '17' },
      { time: 40, kind: 'bar', label: '21' },
      { time: 48, kind: 'bar', label: '25' },
      { time: 56, kind: 'bar', label: null },
    ]);
  });

  it('T8 zoomed in labels the beats', () => {
    expectMarks(barsRulerMarks(4, 160, 120), [
      { time: 0, kind: 'bar', label: '1' },
      { time: 0.5, kind: 'beat', label: '1.2' },
      { time: 1, kind: 'beat', label: '1.3' },
      { time: 1.5, kind: 'beat', label: '1.4' },
      { time: 2, kind: 'bar', label: '2' },
      { time: 2.5, kind: 'beat', label: '2.2' },
      { time: 3, kind: 'beat', label: '2.3' },
      { time: 3.5, kind: 'beat', label: '2.4' },
    ]);
  });

  it('T9 a bar step of 2 shows bars 1, 3 and 5 only', () => {
    expectMarks(barsRulerMarks(10, 15, 120), [
      { time: 0, kind: 'bar', label: '1' },
      { time: 4, kind: 'bar', label: '3' },
      { time: 8, kind: 'bar', label: '5' },
    ]);
  });

  it('T10 status messages and the empty hint are verbatim', () => {
    expect(tempoStatusMessage(90)).toBe(
      'ტემპი 90 BPM · 4/4 — ტაქტების სახაზავი განახლდა. მხოლოდ ბადეა: აუდიო არ იწელება.',
    );
    expect(tempoStatusMessage(92.5)).toContain('92.5 BPM');
    expect(tempoStatusMessage(null)).toBe(
      'ტემპი წაიშალა — ტაქტების სახაზავი დამალულია. აუდიო არ შეცვლილა.',
    );
    expect(TEMPO_INVALID_MESSAGE).toBe(
      'ტემპი უნდა იყოს 20–999 BPM (მაგ. 90 ან 92.5) — არ შეიცვალა.',
    );
    expect(TEMPO_EMPTY_HINT).toBe('ტაქტები: მიუთითე BPM — მხოლოდ ბადე, აუდიო არ იწელება');
  });
});
