// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STUDIO_RADIO_CLASS } from '~/components/arrangement/studio-radio';

const ARRANGEMENT_DIR = resolve(__dirname, '../../../components/arrangement');
const INPUT_TAG = /<input\b[\s\S]*?\/>/g;
const RADIO_TYPE = /\btype=["'`{]+radio["'`}]+/;
const RADIO_CLASS_ATTRIBUTE = /\bclassName=\{STUDIO_RADIO_CLASS\}/;
const LITERAL_TYPE = /\btype=["'][a-z]+["']/;

function sourceFiles(): string[] {
  return readdirSync(ARRANGEMENT_DIR).filter(
    (name) => name.endsWith('.tsx') && !name.includes('.test.'),
  );
}

function inputTags(name: string): string[] {
  return readFileSync(resolve(ARRANGEMENT_DIR, name), 'utf8').match(INPUT_TAG) ?? [];
}

function radioTags(name: string): string[] {
  return inputTags(name).filter((tag) => RADIO_TYPE.test(tag));
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

  it('RD2: every radio input tag in the arrangement components carries className={STUDIO_RADIO_CLASS}', () => {
    const owners = sourceFiles().filter((name) => radioTags(name).length > 0);
    expect(
      owners,
      'a new radio file must apply STUDIO_RADIO_CLASS and be added to this list',
    ).toStrictEqual(['ArrangementExportDialog.tsx']);
    const tags = owners.flatMap((name) => radioTags(name));
    expect(tags).toHaveLength(6);
    for (const tag of tags) {
      expect(RADIO_CLASS_ATTRIBUTE.test(tag), tag.slice(0, 120)).toBe(true);
    }
    const hiddenTypes = sourceFiles().flatMap((name) =>
      inputTags(name)
        .filter((tag) => !LITERAL_TYPE.test(tag))
        .map((tag) => `${name}: ${tag.slice(0, 80)}`),
    );
    expect(
      hiddenTypes,
      'every arrangement <input> names a literal type, so a radio cannot hide behind a spread or a variable',
    ).toStrictEqual([]);
  });
});
