// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { STUDIO_RADIO_CLASS } from '~/components/arrangement/studio-radio';
import { type JsxOpeningTag, readSourceFiles, scanJsxOpeningTags } from './helpers/source-scan';

const LITERAL_TYPE = /^[a-z-]+$/;
const SPREAD_INPUTS_GUARDED_BY_TYPE = ['ArrangementMixFader.tsx'];

function inputTags(): JsxOpeningTag[] {
  return scanJsxOpeningTags('input', readSourceFiles());
}

function radioTags(): JsxOpeningTag[] {
  return inputTags().filter(({ attributes }) => attributes.get('type') === 'radio');
}

describe('Studio radios are drawn by the theme, not the browser (SABA-B-12 stage 2a)', () => {
  it('RD1: the shared class draws a token-only dot and restores the system radio in forced colours (token contract; the browser half is the C probe)', () => {
    const tokens = STUDIO_RADIO_CLASS.split(/\s+/);
    expect(tokens).toStrictEqual([
      'size-4',
      'shrink-0',
      'appearance-none',
      'rounded-full',
      'border',
      'border-outline-strong',
      'bg-transparent',
      'checked:border-4',
      'checked:border-brand',
      'checked:bg-brand-foreground',
      'enabled:not-checked:hover:border-brand-hover',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50',
      'forced-colors:appearance-auto',
    ]);
    expect(tokens.filter((token) => token.startsWith('accent-'))).toStrictEqual([]);
  });

  it('RD2: every radio input tag in the arrangement components carries className={STUDIO_RADIO_CLASS}, with no spread or style=', () => {
    const tags = radioTags();
    expect(
      [...new Set(tags.map(({ path }) => path))],
      'a new radio file must apply STUDIO_RADIO_CLASS and be added to this list',
    ).toStrictEqual(['ArrangementExportDialog.tsx']);
    expect(tags).toHaveLength(6);
    for (const { path, line, attributeTexts, hazards } of tags) {
      expect(attributeTexts.get('className'), `${path}:${line}`).toBe('{STUDIO_RADIO_CLASS}');
      expect(hazards, `${path}:${line}`).toStrictEqual([]);
    }
  });

  it('IN1: every arrangement <input> names a literal type, and the only spread attribute sits on a fader whose props type omits type (compile-time guard)', () => {
    const tags = inputTags();
    expect(
      tags
        .filter(({ attributes }) => !LITERAL_TYPE.test(attributes.get('type') ?? ''))
        .map(({ path, line }) => `${path}:${line}`),
      'a radio, number or search field cannot hide behind a variable type',
    ).toStrictEqual([]);
    expect(
      tags.filter(({ hazards }) => hazards.includes('spread')).map(({ path }) => path),
      'a spread on an <input> can override its literal type; the only allowed owner omits type from its props type',
    ).toStrictEqual(SPREAD_INPUTS_GUARDED_BY_TYPE);
    for (const owner of SPREAD_INPUTS_GUARDED_BY_TYPE) {
      const text = readSourceFiles().find(({ path }) => path === owner)?.text ?? '';
      expect(text, `${owner} omits type from the props it spreads`).toMatch(
        /Omit<\s*InputHTMLAttributes<HTMLInputElement>,\s*'type'\s*\|/,
      );
    }
    expect(
      readSourceFiles(undefined, ['.ts', '.tsx'])
        .filter(
          ({ path, text }) =>
            (text.match(/<input\b/g) ?? []).length !==
            tags.filter((tag) => tag.path === path).length,
        )
        .map(({ path }) => path),
      'every <input text in an arrangement source is a JSX input tag (no markup in strings or comments)',
    ).toStrictEqual([]);
  });
});
