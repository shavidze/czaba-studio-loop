import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ARRANGEMENT_DIR = join(process.cwd(), 'app/components/arrangement');
const NATIVE_CANCEL_HIDDEN = '[&::-webkit-search-cancel-button]:hidden';

function inputTags(source: string): string[] {
  const tags: string[] = [];
  let from = source.indexOf('<input');
  while (from !== -1) {
    let depth = 0;
    let quote: string | null = null;
    let end = from + '<input'.length;
    for (; end < source.length; end++) {
      const char = source[end];
      if (quote) {
        if (char === '\\') {
          end++;
        } else if (char === quote) {
          quote = null;
        }
      } else if (char === '"' || char === "'" || char === '`') {
        quote = char;
      } else if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
      } else if (char === '>' && depth === 0) {
        break;
      }
    }
    tags.push(source.slice(from, end + 1));
    from = source.indexOf('<input', end);
  }
  return tags;
}

const SEARCH_TYPE = /\btype=(?:"search"|'search'|\{\s*['"`]search['"`]\s*\})/;

function searchInputTags(): { file: string; tag: string }[] {
  return readdirSync(ARRANGEMENT_DIR)
    .filter((file) => file.endsWith('.tsx'))
    .flatMap((file) =>
      inputTags(readFileSync(join(ARRANGEMENT_DIR, file), 'utf8'))
        .filter((tag) => SEARCH_TYPE.test(tag))
        .map((tag) => ({ file, tag })),
    );
}

describe('SABA-B-12 stage 3: no native search cancel in Studio', () => {
  it('SF1: the whole-tag scanner reads braces, quotes and arrows, and finds every spelling of the search type', () => {
    const tags = inputTags(
      [
        '<input type="search" onChange={(event) => set(event.target.value > 1)} className="a b" />',
        '<input placeholder="a > b" title={\'}\'} type={\'search\'} className="c" />',
        '<input type=\'search\' className="d" />',
        '<input type="text" />',
      ].join(''),
    );
    expect(tags).toHaveLength(4);
    expect(tags[0]).toContain('className="a b"');
    expect(tags[1]).toContain('className="c"');
    expect(tags[2]).toContain('className="d"');
    expect(tags[3]).toBe('<input type="text" />');
    expect(tags.map((tag) => SEARCH_TYPE.test(tag))).toEqual([true, true, true, false]);
  });

  it('SF2: every search field in the arrangement components hides the native cancel', () => {
    const found = searchInputTags();
    expect(found.map(({ file }) => file).sort()).toEqual([
      'ArrangementLibrary.tsx',
      'ArrangementShortcutSheet.tsx',
    ]);
    for (const { file, tag } of found) {
      expect(tag, file).toContain(NATIVE_CANCEL_HIDDEN);
    }
  });
});
