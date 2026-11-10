# B round 428 -> 429: SYS-2 stage 5 test rows. Usage: python3 -I make-sketch-tests.py <scratch>
import sys, os
scr = sys.argv[1]
T = os.path.join(scr, 'app/lib/arrangement/__tests__/')
MU = T + 'markers-ui.test.tsx'
s = open(MU, encoding='utf-8').read()
s = s.rstrip('\n') + '\n' + r"""
describe('marker row: held Enter (SYS-2 stage 5)', { timeout: 15000 }, () => {
  it.each([
    ['arrangement-marker-add'],
    ['arrangement-marker-prev'],
    ['arrangement-marker-next'],
  ])('HK1: a repeated Enter on %s is prevented; a fresh Enter is not', async (testId) => {
    const { view } = await mountMarkerWorkspace(
      markerArrangement([
        { id: 'k1', time: 2, name: 'One' },
        { id: 'k2', time: 6, name: 'Two' },
      ]),
    );
    const button = view.getByTestId(testId);
    button.focus();
    expect(fireEvent.keyDown(button, { key: 'Enter', code: 'Enter', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })).toBe(true);
  });

  it('HK2: a repeated Enter on a flag is prevented and changes nothing; a fresh Enter is not prevented', async () => {
    const { api, view } = await mountMarkerWorkspace(
      markerArrangement([{ id: 'k1', time: 4, name: 'Flag' }]),
    );
    const flag = flagAt(view, '4.000');
    flag.focus();
    const before = live(api).arrangement;
    expect(fireEvent.keyDown(flag, { key: 'Enter', code: 'Enter', repeat: true })).toBe(false);
    expect(live(api).arrangement).toBe(before);
    expect(view.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(flag);
    expect(fireEvent.keyDown(flag, { key: 'Enter', code: 'Enter' })).toBe(true);
  });

  it('HK3: a repeated Enter in the name editor does not settle it (editor open, no marker, no undo); a fresh Enter commits one marker', async () => {
    const { api, view } = await mountMarkerWorkspace();
    act(() => live(api).seekTo(9));
    pressM();
    const input = nameInput(view);
    fireEvent.change(input, { target: { value: 'Held' } });
    expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', repeat: true })).toBe(false);
    expect(view.queryByTestId('arrangement-marker-name-input')).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(markerFlags(view)).toHaveLength(0);
    expect(live(api).undoLabel).toBeNull();
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(view.queryByTestId('arrangement-marker-name-input')).toBeNull();
    expect(markerTimes(view)).toEqual(['9.000']);
    expect(live(api).undoLabel).toBe('Add Marker');
  });
});
"""
open(MU, 'w', encoding='utf-8').write(s)

VS = T + 'studio-link-view-in-store-ui.test.tsx'
v = open(VS, encoding='utf-8').read()
anchor = "  it('VS7: Enter on the link keeps its native activation"
assert v.count(anchor) == 1
row = r"""  it('HK4: a repeated Enter on the store link is prevented by the menu and keeps the menu open; a fresh Enter is not', () => {
    renderWideStudio();
    const option = libraryOption(MAPPED_SOURCE_ID);
    option.focus();
    fireEvent.keyDown(option, { key: 'F10', shiftKey: true });
    const item = viewInStoreItem();
    expect(document.activeElement).toBe(item);
    expect(fireEvent.keyDown(item, { key: 'Enter', repeat: true })).toBe(false);
    expect(fireEvent.keyDown(item, { key: 'Enter', repeat: true })).toBe(false);
    expect(libraryMenu()).not.toBeNull();
    expect(document.activeElement).toBe(item);
    expect(fireEvent.keyDown(item, { key: 'Enter' })).toBe(true);
  });

"""
v = v.replace(anchor, row + anchor)
open(VS, 'w', encoding='utf-8').write(v)

HS = T + 'held-enter-source-scan.test.ts'
open(HS, 'w', encoding='utf-8').write(r"""// @vitest-environment node
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
""")
print('tests written')
