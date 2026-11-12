// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { STUDIO_PROGRESS_CLASS } from '~/components/arrangement/studio-progress';
import {
  callsWithStringArgument,
  readSourceFiles,
  scanJsxOpeningTags,
} from './helpers/source-scan';

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

  it('PG2: every progress tag in the arrangement components carries className={STUDIO_PROGRESS_CLASS}, with no spread or style= that could override it', () => {
    const tags = scanJsxOpeningTags('progress', readSourceFiles());
    expect(
      [...new Set(tags.map(({ path }) => path))],
      'a new progress file must apply STUDIO_PROGRESS_CLASS and be added to this list',
    ).toStrictEqual(['ArrangementExportDialog.tsx']);
    expect(tags).toHaveLength(1);
    for (const { path, line, attributeTexts, hazards } of tags) {
      expect(attributeTexts.get('className'), `${path}:${line}`).toBe('{STUDIO_PROGRESS_CLASS}');
      expect(hazards, `${path}:${line}`).toStrictEqual([]);
    }
    expect(
      readSourceFiles(undefined, ['.ts', '.tsx'])
        .filter(
          ({ path, text }) => callsWithStringArgument(text, 'createElement', 'progress', path) > 0,
        )
        .map(({ path }) => path),
      'no arrangement source creates a progress element outside JSX',
    ).toStrictEqual([]);
    expect(
      readSourceFiles(undefined, ['.ts', '.tsx'])
        .filter(
          ({ path, text }) =>
            (text.match(/<progress\b/g) ?? []).length !==
            tags.filter((tag) => tag.path === path).length,
        )
        .map(({ path }) => path),
      'every <progress text in an arrangement source is a JSX progress tag (no markup in strings or comments)',
    ).toStrictEqual([]);
  });
});
