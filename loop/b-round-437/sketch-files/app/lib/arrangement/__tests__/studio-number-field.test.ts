// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { STUDIO_NUMBER_FIELD_CLASS } from '~/components/arrangement/studio-number-field';
import {
  identifierUsesOutsideImports,
  type JsxOpeningTag,
  jsxAttributeTextsByName,
  readSourceFiles,
  scanJsxOpeningTags,
  variableInitializersUsing,
} from './helpers/source-scan';

const NUMBER_CLASS_CARRIER =
  /^\{(?:inputClass|STUDIO_NUMBER_FIELD_CLASS|cn\((?:inputClass|STUDIO_NUMBER_FIELD_CLASS),[^}]*\))\}$/;

function numberInputTags(): JsxOpeningTag[] {
  return scanJsxOpeningTags('input', readSourceFiles()).filter(
    ({ attributes }) => attributes.get('type') === 'number',
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

  it('NF2: every arrangement file with a number input uses the shared class outside its imports; every number tag takes it through className and carries no spread or style=', () => {
    const tags = numberInputTags();
    const owners = [...new Set(tags.map(({ path }) => path))];
    expect(
      owners,
      'a new number-input file must apply STUDIO_NUMBER_FIELD_CLASS and be added to this list',
    ).toStrictEqual(['ArrangementDetailPanel.tsx']);
    expect(tags).toHaveLength(3);
    const files = readSourceFiles();
    for (const owner of owners) {
      const text = files.find(({ path }) => path === owner)?.text ?? '';
      expect(
        identifierUsesOutsideImports(text, 'STUDIO_NUMBER_FIELD_CLASS', owner),
        `${owner} applies STUDIO_NUMBER_FIELD_CLASS`,
      ).toBeGreaterThan(0);
    }
    for (const { path, line, attributeTexts, hazards } of tags) {
      const className = attributeTexts.get('className') ?? '';
      expect(className, `${path}:${line} carries the class directly or through inputClass`).toMatch(
        NUMBER_CLASS_CARRIER,
      );
      if (/\binputClass\b/.test(className)) {
        const text = files.find((file) => file.path === path)?.text ?? '';
        expect(
          variableInitializersUsing(text, 'inputClass', 'STUDIO_NUMBER_FIELD_CLASS', path),
          `${path} declares inputClass once, built from STUDIO_NUMBER_FIELD_CLASS`,
        ).toStrictEqual([true]);
        expect(
          jsxAttributeTextsByName(text, 'inputClass', path).filter(
            (value) => value !== '{inputClass}',
          ),
          `${path} hands inputClass to child fields unchanged`,
        ).toStrictEqual([]);
      }
      expect(hazards, `${path}:${line}`).toStrictEqual([]);
    }
  });
});
