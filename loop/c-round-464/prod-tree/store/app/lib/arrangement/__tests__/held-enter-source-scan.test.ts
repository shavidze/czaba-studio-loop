// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readSourceFiles, STORE_ROOT } from './helpers/source-scan';

const SCAN_ROOTS = ['app', 'perf'];
const HELPER_PATH = 'app/components/arrangement/studio-repeat-safe.ts';
const ENTER_KEY = String.raw`(?:[\w.?]*\bkey\s*={2,3}\s*['"\x60]Enter['"\x60]|['"\x60]Enter['"\x60]\s*={2,3}\s*[\w.?]*\bkey\b)`;
const REPEAT = String.raw`(?<![!\w.?])[\w.?]*\brepeat\b`;
const INLINE_REPEATED_ENTER_PATTERN = new RegExp(
  `${ENTER_KEY}\\s*&&\\s*${REPEAT}|${REPEAT}\\s*&&\\s*${ENTER_KEY}`,
  'g',
);

function findInlineRepeatedEnterCopies(): string[] {
  const hits: string[] = [];
  for (const root of SCAN_ROOTS) {
    for (const { path, text } of readSourceFiles(resolve(STORE_ROOT, root), ['.ts', '.tsx'])) {
      for (const match of text.matchAll(INLINE_REPEATED_ENTER_PATTERN)) {
        hits.push(`${root}/${path}:${text.slice(0, match.index).split('\n').length}`);
      }
    }
  }
  return hits;
}

describe('held Enter: one shared guard (SYS-2 stage 5)', () => {
  it('HS1: no source file under app/ or perf/ repeats the held-Enter check inline; the shared helper is the only home', () => {
    expect(findInlineRepeatedEnterCopies()).toEqual([]);
    expect(readFileSync(resolve(STORE_ROOT, HELPER_PATH), 'utf-8')).toMatch(
      /export function preventRepeatedEnterKeyDown\b/,
    );
  });

  it('HS2: the scan pattern matches both operand orders, ==, wrapped lines and template keys, and ignores the helper and menu forms', () => {
    const matches = (text: string) => (text.match(INLINE_REPEATED_ENTER_PATTERN) ?? []).length;
    expect(matches("if (event.key === 'Enter' && event.repeat) {")).toBe(1);
    expect(matches('if (event.repeat && event.key === "Enter") {')).toBe(1);
    expect(matches("if (e.nativeEvent.key === 'Enter' && e.nativeEvent.repeat) {")).toBe(1);
    expect(matches("if ('Enter' === event.key && event.repeat) {")).toBe(1);
    expect(matches("if (event.key == 'Enter' &&\n      event.repeat) {")).toBe(1);
    expect(matches('if (key === `Enter` && repeat) {')).toBe(1);
    expect(matches("if (event.key !== 'Enter' || !event.repeat) {")).toBe(0);
    expect(matches("if (event.key === 'Enter' || event.key === ' ') {")).toBe(0);
    expect(matches('if (!event.repeat) {')).toBe(0);
    expect(matches("if (!event.repeat && event.key === 'Enter') {")).toBe(0);
    expect(matches("if (event.key === 'Enter' && !event.repeat) {")).toBe(0);
  });
});
