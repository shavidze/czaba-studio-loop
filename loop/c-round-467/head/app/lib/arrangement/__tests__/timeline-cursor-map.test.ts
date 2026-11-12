import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ARRANGEMENT_DIR = resolve(__dirname, '../../../components/arrangement');
const PLUS_CURSOR_PATTERN =
  /(?<![\w-])(?:cursor-\[?|\[cursor:|cursor:\s*['"`]?)(crosshair|move|cell|copy|all-scroll)(?![\w-])/g;

function listComponentSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return listComponentSourceFiles(path);
    }
    return entry.isFile() && /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe('SABA-B-6 timeline cursor map (CU4)', () => {
  it('CU4 no arrangement .tsx or .ts file uses a plus-shaped cursor (crosshair, move, cell, copy, all-scroll) anywhere in the file, as a utility, arbitrary value or inline style', () => {
    const files = listComponentSourceFiles(ARRANGEMENT_DIR);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((file) => file.endsWith('ArrangementClipEnvelope.tsx'))).toBe(true);
    expect(files.some((file) => file.endsWith('ArrangementVideoDock.tsx'))).toBe(true);
    const hits = files.flatMap((file) =>
      Array.from(readFileSync(file, 'utf8').matchAll(PLUS_CURSOR_PATTERN), (match) => {
        return `${file.slice(ARRANGEMENT_DIR.length + 1)}: ${match[0]}`;
      }),
    );
    expect(hits).toEqual([]);
  });
});
