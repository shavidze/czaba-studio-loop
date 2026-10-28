import sys,re
R=sys.argv[1]
def sub(path, old, new, count=1):
    p=R+'/'+path; s=open(p,encoding='utf-8').read()
    if s.count(old)!=count: raise SystemExit(f'{path}: expected {count} of {old!r}, got {s.count(old)}')
    open(p,'w',encoding='utf-8').write(s.replace(old,new))
S='app/lib/arrangement/shortcuts.ts'
sub(S,"{ id: 'play-stop', action: 'Play / Stop', keys: ['Space'] },","{ id: 'play-stop', action: 'Play / Stop', keys: ['Space'], ariaKeyShortcuts: 'Space' },")
sub(S,"{ id: 'back-to-start', action: 'Back to start', keys: ['Home'] },","{ id: 'back-to-start', action: 'Back to start', keys: ['Home'], ariaKeyShortcuts: 'Home' },")
sub(S,"{ id: 'loop', action: 'Loop the selection · Loop on / off', keys: ['Ctrl+L'] },","{\n        id: 'loop',\n        action: 'Loop the selection · Loop on / off',\n        keys: ['Ctrl+L'],\n        ariaKeyShortcuts: 'Control+L Meta+L',\n      },")
sub(S,"{ id: 'undo', action: 'Undo', keys: ['Ctrl+Z'] },","{ id: 'undo', action: 'Undo', keys: ['Ctrl+Z'], ariaKeyShortcuts: 'Control+Z Meta+Z' },")
sub(S,"{ id: 'redo', action: 'Redo', keys: ['Ctrl+Shift+Z', 'Ctrl+Y'] },","{\n        id: 'redo',\n        action: 'Redo',\n        keys: ['Ctrl+Shift+Z', 'Ctrl+Y'],\n        ariaKeyShortcuts: 'Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y',\n      },")
sub(S,"{ id: 'delete', action: 'Delete (the gap remains)', keys: ['Delete', 'Backspace'] },","{\n        id: 'delete',\n        action: 'Delete (the gap remains)',\n        keys: ['Delete', 'Backspace'],\n        ariaKeyShortcuts: 'Delete Backspace',\n      },")
sub(S,"{ id: 'split', action: 'Split at the playhead or the selection', keys: ['Ctrl+E'] },","{\n        id: 'split',\n        action: 'Split at the playhead or the selection',\n        keys: ['Ctrl+E'],\n        ariaKeyShortcuts: 'Control+E Meta+E',\n      },")
sub(S,"'Double-click the ruler (no selection)'","'Double-click the ruler (no time selection)'")
s=open(R+'/'+S,encoding='utf-8').read()
s+='''
export function studioShortcutTitle(label: string, id: StudioShortcutId): string {
  const key = findStudioShortcut(id)?.keys[0];
  return key ? `${label} (${key})` : label;
}

export function studioShortcutAria(id: StudioShortcutId): string | undefined {
  return findStudioShortcut(id)?.ariaKeyShortcuts;
}
'''
open(R+'/'+S,'w',encoding='utf-8').write(s)
T='app/lib/arrangement/strings.ts'
p=R+'/'+T; s=open(p,encoding='utf-8').read()
s="import { studioShortcutTitle } from './shortcuts';\n\n"+s
open(p,'w',encoding='utf-8').write(s)
sub(T,"splitRangeTitle: 'Split at both edges of the time selection (Ctrl/Cmd+E)',","splitRangeTitle: studioShortcutTitle('Split at both edges of the time selection', 'split'),")
sub(T,"splitPlayheadTitle: 'Split at the playhead (Ctrl/Cmd+E)',","splitPlayheadTitle: studioShortcutTitle('Split at the playhead', 'split'),")
sub(T,"deleteClipTitle: 'Delete clip — leaves a gap (Delete)',","deleteClipTitle: studioShortcutTitle('Delete clip — leaves a gap', 'delete'),\n  undoTitle: (label: string | null): string =>\n    studioShortcutTitle(label ? `Undo: ${label}` : 'Undo', 'undo'),\n  redoTitle: (label: string | null): string =>\n    studioShortcutTitle(label ? `Redo: ${label}` : 'Redo', 'redo'),")
sub(T,"backToStartTitle: 'Back to start (0)',","backToStartTitle: studioShortcutTitle('Back to start', 'back-to-start'),")
sub(T,"playTitle: 'Play (Space)',","playTitle: studioShortcutTitle('Play', 'play-stop'),")
sub(T,"pauseTitle: 'Pause (Space)',","pauseTitle: studioShortcutTitle('Pause', 'play-stop'),")
sub(T,"selectionTitle: 'Loop the time selection (Ctrl/Cmd+L)',","selectionTitle: studioShortcutTitle('Loop the time selection', 'loop'),")
sub(T,"toggleTitle: 'Loop on / off (Ctrl/Cmd+L)',","toggleTitle: studioShortcutTitle('Loop on / off', 'loop'),")
sub(T,"fitTitle: 'Fit — the entire project is visible (double-click the ruler or the overview)',","fitTitle:\n    'Fit — the entire project is visible (double-click the overview, or the ruler with no time selection)',")
X='app/components/arrangement/ArrangementTransport.tsx'
sub(X,"title={isPlaying ? studioPlaybackStrings.pauseTitle : studioPlaybackStrings.playTitle}","title={isPlaying ? studioPlaybackStrings.pauseTitle : studioPlaybackStrings.playTitle}\n        aria-keyshortcuts={studioShortcutAria('play-stop')}")
sub(X,"title={studioPlaybackStrings.backToStartTitle}","title={studioPlaybackStrings.backToStartTitle}\n        aria-keyshortcuts={studioShortcutAria('back-to-start')}")
sub(X,"title={undoLabel ? `Undo: ${undoLabel}` : 'Undo'}","title={studioEditStrings.undoTitle(undoLabel)}\n        aria-keyshortcuts={studioShortcutAria('undo')}")
sub(X,"title={redoLabel ? `Redo: ${redoLabel}` : 'Redo'}","title={studioEditStrings.redoTitle(redoLabel)}\n        aria-keyshortcuts={studioShortcutAria('redo')}")
sub(X,"title={range ? studioEditStrings.splitRangeTitle : studioEditStrings.splitPlayheadTitle}","title={range ? studioEditStrings.splitRangeTitle : studioEditStrings.splitPlayheadTitle}\n        aria-keyshortcuts={studioShortcutAria('split')}")
sub(X,"aria-label={rangeDeleteHint ?? studioEditStrings.deleteClipLabel}","aria-label={rangeDeleteHint ?? studioEditStrings.deleteClipLabel}\n        aria-keyshortcuts={studioShortcutAria('delete')}")
sub(X,"title={range ? studioLoopStrings.selectionTitle : studioLoopStrings.toggleTitle}","title={range ? studioLoopStrings.selectionTitle : studioLoopStrings.toggleTitle}\n        aria-keyshortcuts={studioShortcutAria('loop')}")
p=R+'/'+X; s=open(p,encoding='utf-8').read()
s=s.replace("import { cn } from '~/lib/utils';","import { studioShortcutAria } from '~/lib/arrangement/shortcuts';\nimport { cn } from '~/lib/utils';",1)
open(p,'w',encoding='utf-8').write(s)
print('applied')
