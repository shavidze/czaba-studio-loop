import { describe, expect, it } from 'vitest';
import {
  filterStudioShortcutGroups,
  findStudioShortcut,
  STUDIO_SHORTCUT_GROUPS,
  type StudioShortcutGroup,
  studioShortcutAria,
  studioShortcutTitle,
} from '../shortcuts';

const EXPECTED_ROW_ORDER = [
  'play-stop',
  'continue-playback',
  'insert-marker-to-playhead',
  'back-to-start',
  'play-from-point',
  'loop',
  'undo',
  'redo',
  'copy-cut-paste',
  'duplicate',
  'delete',
  'select-all',
  'add-to-selection',
  'select-area',
  'rename',
  'split',
  'select-time',
  'cut-time',
  'extend-all-tracks',
  'nudge',
  'edge-nav',
  'marker',
  'add-sound',
  'lane-lock',
  'snap',
  'grid-width',
  'triplet',
  'grid-mode',
  'snap-bypass',
  'envelope',
  'zoom',
  'scroll',
  'zoom-range',
  'fit',
  'overview-scroll',
  'overview-toggle',
  'waveform-zoom',
  'group',
  'fold',
  'solo-add',
  'fader-step',
  'fader-page',
  'fader-fine',
  'fader-reset',
  'library-results',
  'library-add',
  'library-clear',
  'library-preview',
  'library-view-in-store',
  'shortcuts',
  'close',
];

const OLD_LINE_KEYS = [
  'Space',
  'Home',
  'Ctrl+E',
  'Ctrl+D',
  'Ctrl+C',
  'Ctrl+X',
  'Ctrl+V',
  'Ctrl+Shift+X',
  'Ctrl+Shift+L',
  'Ctrl+L',
  'Ctrl+A',
  'Delete',
  'Backspace',
  'Ctrl+Z',
  'Ctrl+Shift+Z',
  '← / →',
  'Enter',
  '+ / −',
  'Z',
  'X',
  'Ctrl+wheel',
  'Ctrl+G',
  'Ctrl+Shift+G',
  'F2',
  'U',
];

function rowIds(groups: readonly StudioShortcutGroup[]): string[] {
  return groups.flatMap((group) => group.rows.map((row) => row.id));
}

describe('Studio shortcut source', () => {
  it('SC1: groups, titles and row ids are in order, unique, and every row has a key', () => {
    expect(STUDIO_SHORTCUT_GROUPS.map((group) => [group.id, group.title])).toEqual([
      ['transport', 'Transport'],
      ['edit', 'Edit'],
      ['time-clips', 'Time & clips'],
      ['grid-snap', 'Grid & snap'],
      ['zoom-view', 'Zoom & view'],
      ['tracks-mix', 'Tracks & mix'],
      ['library', 'Library'],
      ['general', 'General'],
    ]);
    const ids = rowIds(STUDIO_SHORTCUT_GROUPS);
    expect(ids).toEqual(EXPECTED_ROW_ORDER);
    expect(new Set(ids).size).toBe(ids.length);
    for (const group of STUDIO_SHORTCUT_GROUPS) {
      for (const row of group.rows) {
        expect(row.keys.length, row.id).toBeGreaterThanOrEqual(1);
      }
    }
    expect(findStudioShortcut('shortcuts')?.ariaKeyShortcuts).toBe('Shift+/');
    expect(findStudioShortcut('split')?.keys).toEqual(['Ctrl+E']);
  });

  it('SC2: every key of the old permanent shortcut line appears in some row', () => {
    const allKeys = STUDIO_SHORTCUT_GROUPS.flatMap((group) =>
      group.rows.flatMap((row) => [...row.keys]),
    );
    for (const key of OLD_LINE_KEYS) {
      expect(allKeys, key).toContain(key);
    }
  });

  it('SC3: the filter matches action, group title and key text, case-insensitively', () => {
    const split = filterStudioShortcutGroups('split');
    expect(rowIds(split)).toContain('split');
    expect(split.flatMap((group) => group.rows).find((row) => row.id === 'split')?.keys).toEqual([
      'Ctrl+E',
    ]);
    for (const query of ['cut', 'CUT']) {
      const ids = rowIds(filterStudioShortcutGroups(query));
      expect(ids, query).toContain('copy-cut-paste');
      expect(ids, query).toContain('cut-time');
    }
    expect(rowIds(filterStudioShortcutGroups('ctrl+e'))).toContain('split');
    expect(filterStudioShortcutGroups('zzzz')).toEqual([]);
    expect(filterStudioShortcutGroups('')).toBe(STUDIO_SHORTCUT_GROUPS);
    expect(filterStudioShortcutGroups('  ')).toBe(STUDIO_SHORTCUT_GROUPS);
    for (const group of filterStudioShortcutGroups('undo')) {
      expect(group.rows.length).toBeGreaterThan(0);
    }
  });

  it('SC4: the fit and waveform-zoom keys name the real controls, and no key names a button', () => {
    expect(findStudioShortcut('fit')?.keys).toEqual([
      'Double-click the overview',
      'Double-click the ruler (no time selection)',
    ]);
    expect(findStudioShortcut('waveform-zoom')?.keys).toEqual(['Waveform Zoom menu']);
    expect(findStudioShortcut('play-from-point')?.keys).toEqual([
      'Click the top strip of the bars ruler',
    ]);
    for (const group of STUDIO_SHORTCUT_GROUPS) {
      for (const row of group.rows) {
        for (const key of row.keys) {
          expect(/button/i.test(key), `${row.id}: ${key}`).toBe(false);
        }
      }
    }
  });
  it('SC5: the title shows the first key and aria-keyshortcuts lists every key in ARIA syntax', () => {
    expect(studioShortcutTitle('Undo', 'undo')).toBe('Undo (Ctrl+Z)');
    expect(studioShortcutTitle('Redo: X', 'redo')).toBe('Redo: X (Ctrl+Shift+Z)');
    expect(studioShortcutAria('play-stop')).toBe('Space');
    expect(studioShortcutAria('back-to-start')).toBe('Home');
    expect(studioShortcutAria('continue-playback')).toBe('Shift+Space');
    expect(studioShortcutAria('insert-marker-to-playhead')).toBe(
      'Control+Shift+Space Meta+Shift+Space',
    );
    expect(studioShortcutAria('loop')).toBe('Control+L Meta+L');
    expect(studioShortcutAria('undo')).toBe('Control+Z Meta+Z');
    expect(studioShortcutAria('redo')).toBe('Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y');
    expect(studioShortcutAria('split')).toBe('Control+E Meta+E');
    expect(studioShortcutAria('delete')).toBe('Delete Backspace');
    expect(studioShortcutAria('shortcuts')).toBe('Shift+/');
    const grammar =
      /^((Control|Meta|Shift|Alt)\+)*[^\s+]+( ((Control|Meta|Shift|Alt)\+)*[^\s+]+)*$/;
    const groups: readonly StudioShortcutGroup[] = STUDIO_SHORTCUT_GROUPS;
    let checked = 0;
    for (const group of groups) {
      for (const row of group.rows) {
        const aria = row.ariaKeyShortcuts;
        if (!aria) {
          continue;
        }
        checked += 1;
        expect(aria, row.id).toMatch(grammar);
        const combos = aria.split(' ');
        for (const combo of combos) {
          const modified = /^(Control|Meta)\+(.+)$/.exec(combo);
          if (modified) {
            expect(row.keys, `${row.id}: ${combo}`).toContain(`Ctrl+${modified[2]}`);
          }
        }
        for (const key of row.keys) {
          if (key.startsWith('Ctrl+')) {
            const rest = key.slice('Ctrl+'.length);
            expect(combos, `${row.id}: ${key}`).toContain(`Control+${rest}`);
            expect(combos, `${row.id}: ${key}`).toContain(`Meta+${rest}`);
          }
        }
      }
    }
    expect(checked).toBe(11);
  });
});

describe('CALM-3 Overview toggle row (SABA-B-8)', () => {
  it('SC-C3: overview-toggle is Ctrl+Alt+O in Zoom & view, right after overview-scroll, and found by "overview"', () => {
    const row = findStudioShortcut('overview-toggle');
    expect(row?.keys).toEqual(['Ctrl+Alt+O']);
    expect(row?.ariaKeyShortcuts).toBe('Control+Alt+O Meta+Alt+O');
    const group = STUDIO_SHORTCUT_GROUPS.find((candidate) =>
      candidate.rows.some((candidateRow) => candidateRow.id === 'overview-toggle'),
    );
    expect(group?.id).toBe('zoom-view');
    const ids = group?.rows.map((candidateRow) => candidateRow.id) ?? [];
    expect(ids.indexOf('overview-toggle')).toBe(ids.indexOf('overview-scroll') + 1);
    const found = filterStudioShortcutGroups('overview').flatMap((candidate) =>
      candidate.rows.map((candidateRow) => candidateRow.id),
    );
    expect(found).toEqual(expect.arrayContaining(['fit', 'overview-scroll', 'overview-toggle']));
  });
});
