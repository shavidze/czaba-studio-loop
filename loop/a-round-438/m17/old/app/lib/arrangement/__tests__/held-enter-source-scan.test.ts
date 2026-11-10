// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const STORE_ROOT = resolve(__dirname, '../../../..');
const SCAN_ROOTS = ['app', 'perf'];
const HELPER_PATH = 'app/components/arrangement/studio-repeat-safe.ts';
const ENTER_KEY = String.raw`(?:[\w.?]*\bkey\s*={2,3}\s*['"\x60]Enter['"\x60]|['"\x60]Enter['"\x60]\s*={2,3}\s*[\w.?]*\bkey\b)`;
const REPEAT = String.raw`[\w.?]*\brepeat\b`;
const INLINE_REPEATED_ENTER_PATTERN = new RegExp(
  `${ENTER_KEY}\\s*&&\\s*${REPEAT}|${REPEAT}\\s*&&\\s*${ENTER_KEY}`,
  'g',
);

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (entry === 'node_modules' || entry === '__tests__') {
      continue;
    }
    if (statSync(path).isDirectory()) {
      files.push(...listSourceFiles(path));
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.(ts|tsx)$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

function findInlineRepeatedEnterCopies(): string[] {
  const hits: string[] = [];
  for (const root of SCAN_ROOTS) {
    for (const file of listSourceFiles(resolve(STORE_ROOT, root))) {
      const path = relative(STORE_ROOT, file).split('\\').join('/');
      const text = readFileSync(file, 'utf-8');
      for (const match of text.matchAll(INLINE_REPEATED_ENTER_PATTERN)) {
        hits.push(`${path}:${text.slice(0, match.index).split('\n').length}`);
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
  });
});
