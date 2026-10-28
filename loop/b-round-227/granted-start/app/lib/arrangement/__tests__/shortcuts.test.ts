import { describe, expect, it } from 'vitest';
import {
  filterStudioShortcutGroups,
  findStudioShortcut,
  STUDIO_SHORTCUT_GROUPS,
  type StudioShortcutGroup,
} from '../shortcuts';

const EXPECTED_ROW_ORDER = [
  'play-stop',
  'back-to-start',
  'loop',
  'undo',
  'redo',
  'copy-cut-paste',
  'duplicate',
  'delete',
  'select-all',
  'add-to-selection',
  'rename',
  'split',
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
  'snap-bypass',
  'envelope',
  'zoom',
  'scroll',
  'zoom-range',
  'fit',
  'overview-scroll',
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
      'Double-click the ruler (no selection)',
    ]);
    expect(findStudioShortcut('waveform-zoom')?.keys).toEqual(['Waveform Zoom menu']);
    for (const group of STUDIO_SHORTCUT_GROUPS) {
      for (const row of group.rows) {
        for (const key of row.keys) {
          expect(/button/i.test(key), `${row.id}: ${key}`).toBe(false);
        }
      }
    }
  });
});
