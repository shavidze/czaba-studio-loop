export interface StudioShortcutRow {
  readonly id: string;
  readonly action: string;
  readonly keys: readonly string[];
  readonly ariaKeyShortcuts?: string;
}

export interface StudioShortcutGroup {
  readonly id: string;
  readonly title: string;
  readonly rows: readonly StudioShortcutRow[];
}

export const STUDIO_SHORTCUT_GROUPS = [
  {
    id: 'transport',
    title: 'Transport',
    rows: [
      {
        id: 'play-stop',
        action: 'Play from the insert marker or the selection start · Stop',
        keys: ['Space'],
        ariaKeyShortcuts: 'Space',
      },
      {
        id: 'continue-playback',
        action: 'Continue from where playback stopped',
        keys: ['Shift+Space'],
        ariaKeyShortcuts: 'Shift+Space',
      },
      {
        id: 'insert-marker-to-playhead',
        action: 'Move the insert marker to the playhead',
        keys: ['Ctrl+Shift+Space'],
        ariaKeyShortcuts: 'Control+Shift+Space Meta+Shift+Space',
      },
      {
        id: 'back-to-start',
        action: 'Back to start (the insert marker too)',
        keys: ['Home'],
        ariaKeyShortcuts: 'Home',
      },
      {
        id: 'play-from-point',
        action: 'Play from a point (needs a BPM)',
        keys: ['Click the top strip of the bars ruler'],
      },
      {
        id: 'loop',
        action: 'Loop the selection · Loop on / off',
        keys: ['Ctrl+L'],
        ariaKeyShortcuts: 'Control+L Meta+L',
      },
    ],
  },
  {
    id: 'edit',
    title: 'Edit',
    rows: [
      { id: 'undo', action: 'Undo', keys: ['Ctrl+Z'], ariaKeyShortcuts: 'Control+Z Meta+Z' },
      {
        id: 'redo',
        action: 'Redo',
        keys: ['Ctrl+Shift+Z', 'Ctrl+Y'],
        ariaKeyShortcuts: 'Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y',
      },
      { id: 'copy-cut-paste', action: 'Copy · Cut · Paste', keys: ['Ctrl+C', 'Ctrl+X', 'Ctrl+V'] },
      { id: 'duplicate', action: 'Duplicate', keys: ['Ctrl+D'] },
      {
        id: 'delete',
        action: 'Delete (the gap remains)',
        keys: ['Delete', 'Backspace'],
        ariaKeyShortcuts: 'Delete Backspace',
      },
      { id: 'select-all', action: 'Select all clips', keys: ['Ctrl+A'] },
      {
        id: 'add-to-selection',
        action: 'Add a clip to the selection',
        keys: ['Ctrl+click', 'Shift+click'],
      },
      { id: 'rename', action: 'Rename a marker or group', keys: ['F2'] },
    ],
  },
  {
    id: 'time-clips',
    title: 'Time & clips',
    rows: [
      {
        id: 'split',
        action: 'Split at the insert marker or the selection',
        keys: ['Ctrl+E'],
        ariaKeyShortcuts: 'Control+E Meta+E',
      },
      { id: 'cut-time', action: 'Cut Time (closes the gap on all tracks)', keys: ['Ctrl+Shift+X'] },
      {
        id: 'extend-all-tracks',
        action: 'Extend the time selection to all tracks',
        keys: ['Ctrl+Shift+L'],
      },
      { id: 'nudge', action: 'Nudge the selection', keys: ['← / →'] },
      {
        id: 'edge-nav',
        action: 'Previous / next marker or clip edge',
        keys: ['Ctrl+← / Ctrl+→'],
      },
      {
        id: 'marker',
        action:
          'Add a marker at the selection start, the insert marker, or the playhead while playing',
        keys: ['M'],
      },
      {
        id: 'add-sound',
        action: 'Add the selected sound at the insert marker',
        keys: ['Enter', 'Double-click'],
      },
      {
        id: 'lane-lock',
        action: 'Move to another track, keep the time',
        keys: ['Shift while dragging'],
      },
    ],
  },
  {
    id: 'grid-snap',
    title: 'Grid & snap',
    rows: [
      { id: 'snap', action: 'Snap on / off', keys: ['G', '4'] },
      { id: 'grid-width', action: 'Narrower / wider grid', keys: ['1 / 2'] },
      { id: 'triplet', action: 'Triplet grid (needs a BPM)', keys: ['3'] },
      { id: 'grid-mode', action: 'Adaptive / fixed grid', keys: ['5'] },
      { id: 'snap-bypass', action: 'Ignore snap while dragging', keys: ['Alt + drag'] },
      { id: 'envelope', action: 'Envelope mode', keys: ['A'] },
    ],
  },
  {
    id: 'zoom-view',
    title: 'Zoom & view',
    rows: [
      { id: 'zoom', action: 'Zoom in / out', keys: ['+ / −', 'Ctrl+wheel'] },
      { id: 'scroll', action: 'Scroll left / right', keys: ['Shift+wheel'] },
      { id: 'zoom-range', action: 'Zoom to the selection · Previous zoom', keys: ['Z', 'X'] },
      {
        id: 'fit',
        action: 'Fit the whole project',
        keys: ['Double-click the overview', 'Double-click the ruler (no time selection)'],
      },
      { id: 'overview-scroll', action: 'Overview: scroll 5 s', keys: ['← / → (overview focused)'] },
      {
        id: 'overview-toggle',
        action: 'Show / hide the overview',
        keys: ['Ctrl+Alt+O'],
        ariaKeyShortcuts: 'Control+Alt+O Meta+Alt+O',
      },
      {
        id: 'waveform-zoom',
        action: 'Waveform zoom (view only, the sound does not change)',
        keys: ['Waveform Zoom menu'],
      },
    ],
  },
  {
    id: 'tracks-mix',
    title: 'Tracks & mix',
    rows: [
      { id: 'group', action: 'Group · Ungroup', keys: ['Ctrl+G', 'Ctrl+Shift+G'] },
      { id: 'fold', action: 'Fold / unfold a group', keys: ['U'] },
      { id: 'solo-add', action: 'Add another Solo', keys: ['Ctrl+click S'] },
      { id: 'fader-step', action: 'Volume fader ±0.1 dB', keys: ['↑ / ↓'] },
      { id: 'fader-page', action: 'Volume fader: bigger step', keys: ['PageUp / PageDown'] },
      { id: 'fader-fine', action: 'Fine adjustment while dragging', keys: ['Shift + drag'] },
      { id: 'fader-reset', action: 'Reset to the default', keys: ['Double-click'] },
    ],
  },
  {
    id: 'library',
    title: 'Library',
    rows: [
      {
        id: 'library-results',
        action: 'Jump to the results · Move in the list',
        keys: ['↓', '↑ / ↓'],
      },
      { id: 'library-add', action: 'Add to the active track', keys: ['Enter'] },
      { id: 'library-clear', action: 'Clear the search', keys: ['Esc'] },
      {
        id: 'library-preview',
        action: 'Preview from a point',
        keys: ['Click the preview waveform', 'Space'],
      },
    ],
  },
  {
    id: 'general',
    title: 'General',
    rows: [
      { id: 'shortcuts', action: 'Keyboard shortcuts', keys: ['?'], ariaKeyShortcuts: 'Shift+/' },
      { id: 'close', action: 'Close a dialog', keys: ['Esc'] },
    ],
  },
] as const satisfies readonly StudioShortcutGroup[];

export type StudioShortcutId = (typeof STUDIO_SHORTCUT_GROUPS)[number]['rows'][number]['id'];

export function findStudioShortcut(id: StudioShortcutId): StudioShortcutRow | undefined {
  for (const group of STUDIO_SHORTCUT_GROUPS) {
    for (const row of group.rows) {
      if (row.id === id) {
        return row;
      }
    }
  }
  return undefined;
}

export function filterStudioShortcutGroups(query: string): readonly StudioShortcutGroup[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return STUDIO_SHORTCUT_GROUPS;
  }
  const matches = (text: string) => text.toLowerCase().includes(needle);
  const filtered: StudioShortcutGroup[] = [];
  for (const group of STUDIO_SHORTCUT_GROUPS) {
    const groupMatches = matches(group.title);
    const rows: StudioShortcutRow[] = group.rows.filter(
      (row: StudioShortcutRow) =>
        groupMatches || matches(row.action) || row.keys.some((key) => matches(key)),
    );
    if (rows.length > 0) {
      filtered.push({ id: group.id, title: group.title, rows });
    }
  }
  return filtered;
}

export function studioShortcutTitle(label: string, id: StudioShortcutId): string {
  const key = findStudioShortcut(id)?.keys[0];
  return key ? `${label} (${key})` : label;
}

export function studioShortcutAria(id: StudioShortcutId): string | undefined {
  return findStudioShortcut(id)?.ariaKeyShortcuts;
}
