import sys,re
R=sys.argv[1]+'/app/lib/arrangement/__tests__/'
def edit(f, fn):
    p=R+f; s=open(p,encoding='utf-8').read(); t=fn(s)
    if t==s: raise SystemExit(f'no change {f}')
    open(p,'w',encoding='utf-8').write(t)
def undo_lit(s):
    s=s.replace("toBe('Undo')","toBe(studioEditStrings.undoTitle(null))")
    s=re.sub(r"toBe\(`Undo: \$\{([^`]+)\}`\)", r"toBe(studioEditStrings.undoTitle(\1))", s)
    return s
edit('grid-snap-loop-drop.test.tsx', lambda s: undo_lit(s).replace("import { studioLibraryStrings, studioLoopStrings } from '../strings';","import { studioEditStrings, studioLibraryStrings, studioLoopStrings } from '../strings';"))
edit('status-announcement-ui.test.tsx', lambda s: s.replace("queryAllByTitle(`Undo: ${studioLoopStrings.historyOff}`)","queryAllByTitle(studioEditStrings.undoTitle(studioLoopStrings.historyOff))"))
edit('markers-ui.test.tsx', lambda s: s.replace("getByTitle('Undo: Add Marker')","getByTitle(studioEditStrings.undoTitle('Add Marker'))"))
edit('self-disabling-focus.test.tsx', lambda s: s.replace("toBe(`Undo: ${studioEditStrings.historyDeleteClip}`)","toBe(studioEditStrings.undoTitle(studioEditStrings.historyDeleteClip))"))
edit('waveform-zoom.test.tsx', lambda s: s.replace("import { clipLinearGain, createArrangement } from '../model';","import { clipLinearGain, createArrangement } from '../model';\nimport { studioEditStrings } from '../strings';").replace("{ title: `Undo: ${CLIP_GAIN_LABEL}`, disabled: false }","{ title: studioEditStrings.undoTitle(CLIP_GAIN_LABEL), disabled: false }").replace("{ title: 'Redo', disabled: true }","{ title: studioEditStrings.redoTitle(null), disabled: true }"))
def nav(s):
    for a,b in [("'Back to start (0)'","'Back to start (Home)'"),("'Split at the playhead (Ctrl/Cmd+E)'","'Split at the playhead (Ctrl+E)'"),("'Loop on / off (Ctrl/Cmd+L)'","'Loop on / off (Ctrl+L)'"),("'Split at both edges of the time selection (Ctrl/Cmd+E)'","'Split at both edges of the time selection (Ctrl+E)'"),("'Loop the time selection (Ctrl/Cmd+L)'","'Loop the time selection (Ctrl+L)'"),("'Fit — the entire project is visible (double-click the ruler or the overview)'","'Fit — the entire project is visible (double-click the overview, or the ruler with no time selection)'")]:
        s=s.replace(a,b)
    return s
edit('navigation-strings-ui.test.tsx', nav)
def st(s):
    s=nav(s)
    s=s.replace("  copyClipsDone: [e.copyClipsDone(1), e.copyClipsDone(3)],","  copyClipsDone: [e.copyClipsDone(1), e.copyClipsDone(3)],\n  undoTitle: [e.undoTitle(null), e.undoTitle('Add Marker')],\n  redoTitle: [e.redoTitle(null), e.redoTitle('Add Marker')],",1)
    return s
edit('strings.test.ts', st)
edit('shortcuts.test.ts', lambda s: s.replace("'Double-click the ruler (no selection)'","'Double-click the ruler (no time selection)'"))
print('ok')
