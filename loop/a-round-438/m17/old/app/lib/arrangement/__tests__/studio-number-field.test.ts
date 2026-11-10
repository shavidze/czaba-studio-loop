// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STUDIO_NUMBER_FIELD_CLASS } from '~/components/arrangement/studio-number-field';

const ARRANGEMENT_DIR = resolve(__dirname, '../../../components/arrangement');
const NUMBER_INPUT = /type=["'`{]+number["'`}]+/g;
const IMPORT_STATEMENT = /^import[\s\S]*?from\s+['"][^'"]+['"];?$/gm;
const CONSTANT_USE = /\$\{STUDIO_NUMBER_FIELD_CLASS\}|cn\([^)]*STUDIO_NUMBER_FIELD_CLASS/;

function sourceFiles(): string[] {
  return readdirSync(ARRANGEMENT_DIR).filter(
    (name) => name.endsWith('.tsx') && !name.includes('.test.'),
  );
}

describe('Studio number fields have no browser spin buttons (SABA-B-12 stage 1)', () => {
  it('NF1: the shared class carries the three spin-button tokens (token contract; the browser half is the C probe)', () => {
    const tokens = STUDIO_NUMBER_FIELD_CLASS.split(/\s+/);
    expect(tokens).toStrictEqual([
      '[appearance:textfield]',
      '[&::-webkit-inner-spin-button]:appearance-none',
      '[&::-webkit-outer-spin-button]:appearance-none',
    ]);
  });

  it('NF2: every arrangement file with a number input uses the shared class outside its imports', () => {
    const owners = sourceFiles().filter(
      (name) =>
        (readFileSync(resolve(ARRANGEMENT_DIR, name), 'utf8').match(NUMBER_INPUT) ?? []).length > 0,
    );
    expect(
      owners,
      'a new number-input file must apply STUDIO_NUMBER_FIELD_CLASS and be added to this list',
    ).toStrictEqual(['ArrangementDetailPanel.tsx']);
    for (const name of owners) {
      const body = readFileSync(resolve(ARRANGEMENT_DIR, name), 'utf8').replace(
        IMPORT_STATEMENT,
        '',
      );
      expect(CONSTANT_USE.test(body), `${name} applies STUDIO_NUMBER_FIELD_CLASS`).toBe(true);
    }
  });
});
