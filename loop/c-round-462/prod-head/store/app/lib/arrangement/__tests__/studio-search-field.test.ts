import { describe, expect, it } from 'vitest';
import {
  type JsxOpeningTag,
  jsxOpeningTags,
  readSourceFiles,
  scanJsxOpeningTags,
} from './helpers/source-scan';

const NATIVE_CANCEL_HIDDEN = '[&::-webkit-search-cancel-button]:hidden';

function searchInputTags(): JsxOpeningTag[] {
  return scanJsxOpeningTags('input', readSourceFiles()).filter(
    ({ attributes }) => attributes.get('type') === 'search',
  );
}

describe('SABA-B-12 stage 3: no native search cancel in Studio', () => {
  it('SF1: the shared scanner reads braces, quotes, arrows and comments, and finds every spelling of the search type', () => {
    const tags = jsxOpeningTags(
      [
        'const view = (',
        '  <>',
        '    <input type="search" onChange={(event) => set(event.target.value > 1)} className="a b" />',
        '    <input placeholder="a > b" title={\'}\'} type={\'search\'} className="c" />',
        '    <input type=\'search\' className="d" />',
        '    <input type="text" />',
        '    <input',
        "      // don't > close here",
        '      type={`search`}',
        '      className="e"',
        '    />',
        '  </>',
        ');',
      ].join('\n'),
      'input',
    );
    expect(tags).toHaveLength(5);
    expect(tags.map(({ attributes }) => attributes.get('className'))).toEqual([
      'a b',
      'c',
      'd',
      undefined,
      'e',
    ]);
    expect(tags.map(({ attributes }) => attributes.get('type') === 'search')).toEqual([
      true,
      true,
      true,
      false,
      true,
    ]);
  });

  it('SF2: every search field in the arrangement components hides the native cancel, with no spread or style= on the tag', () => {
    const found = searchInputTags();
    expect(found.map(({ path }) => path).sort()).toEqual([
      'ArrangementLibrary.tsx',
      'ArrangementShortcutSheet.tsx',
    ]);
    for (const { path, line, tag, hazards } of found) {
      expect(tag, `${path}:${line}`).toContain(NATIVE_CANCEL_HIDDEN);
      expect(hazards, `${path}:${line}`).toStrictEqual([]);
    }
  });
});
