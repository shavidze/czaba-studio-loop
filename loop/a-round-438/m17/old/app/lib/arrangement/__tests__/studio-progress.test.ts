// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STUDIO_PROGRESS_CLASS } from '~/components/arrangement/studio-progress';

const ARRANGEMENT_DIR = resolve(__dirname, '../../../components/arrangement');
const PROGRESS_OPENING = /<progress\b/g;
const PROGRESS_TAG = /<progress\b[^<]*?\/>/g;
const PROGRESS_CLOSING = /<\/progress>/g;
const PROGRESS_CLASS_ATTRIBUTE = /\bclassName=\{STUDIO_PROGRESS_CLASS\}/;

function sourceFiles(): string[] {
  return readdirSync(ARRANGEMENT_DIR).filter(
    (name) => name.endsWith('.tsx') && !name.includes('.test.'),
  );
}

function arrangementSource(name: string): string {
  return readFileSync(resolve(ARRANGEMENT_DIR, name), 'utf8');
}

function progressOpenings(name: string): number {
  return arrangementSource(name).match(PROGRESS_OPENING)?.length ?? 0;
}

function progressTags(name: string): string[] {
  return arrangementSource(name).match(PROGRESS_TAG) ?? [];
}

describe('Studio progress bars are drawn by the theme, not the browser (SABA-B-12 stage 2b)', () => {
  it('PG1: the shared class draws a neutral token-only bar, pulses only while indeterminate and only with motion allowed, and restores the system bar in forced colours (token contract; the browser half is the C probe)', () => {
    const tokens = STUDIO_PROGRESS_CLASS.split(' ');
    expect(tokens).toStrictEqual([
      'h-2',
      'w-full',
      'appearance-none',
      'overflow-hidden',
      'rounded-full',
      'border-0',
      'bg-outline-hover',
      '[&::-webkit-progress-bar]:rounded-full',
      '[&::-webkit-progress-bar]:bg-outline-hover',
      '[&::-webkit-progress-value]:rounded-full',
      '[&::-webkit-progress-value]:bg-foreground',
      '[&::-moz-progress-bar]:rounded-full',
      '[&::-moz-progress-bar]:bg-foreground',
      'indeterminate:bg-foreground/30',
      'indeterminate:[&::-webkit-progress-bar]:bg-foreground/30',
      'indeterminate:[&::-moz-progress-bar]:bg-foreground/30',
      'motion-safe:indeterminate:animate-pulse',
      'forced-colors:appearance-auto',
    ]);
    expect(tokens.filter((token) => /accent|brand/.test(token))).toStrictEqual([]);
    expect(tokens.filter((token) => token.includes('animate-'))).toStrictEqual([
      'motion-safe:indeterminate:animate-pulse',
    ]);
  });

  it('PG2: every progress tag in the arrangement components carries className={STUDIO_PROGRESS_CLASS}', () => {
    const owners = sourceFiles().filter((name) => progressOpenings(name) > 0);
    expect(
      owners,
      'a new progress file must apply STUDIO_PROGRESS_CLASS and be added to this list',
    ).toStrictEqual(['ArrangementExportDialog.tsx']);
    const tags = owners.flatMap((name) => progressTags(name));
    expect(tags, 'each <progress> is one self-closing tag').toHaveLength(
      owners.reduce((sum, name) => sum + progressOpenings(name), 0),
    );
    expect(tags).toHaveLength(1);
    expect(
      sourceFiles().filter(
        (name) => (arrangementSource(name).match(PROGRESS_CLOSING)?.length ?? 0) > 0,
      ),
      'no <progress>…</progress> pair hides from the self-closing scan',
    ).toStrictEqual([]);
    for (const tag of tags) {
      expect(PROGRESS_CLASS_ATTRIBUTE.test(tag), tag.slice(0, 120)).toBe(true);
    }
  });
});
