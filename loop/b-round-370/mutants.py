import subprocess, sys, shutil, os
# Usage: python3 -I mutants.py <tree> <outdir>  (C: tree = a copy of A's tree, outdir = c-round-371/mutants)
SC=sys.argv[1] if len(sys.argv) > 1 else '/home/runner/b371-scratch/sc'
OUT=sys.argv[2] if len(sys.argv) > 2 else '/home/runner/czaba-project/tmp/studio-real-loop/b-round-370/mutants'
os.makedirs(OUT, exist_ok=True)
W=SC+'/app/components/arrangement/StudioWorkspace.tsx'
H=SC+'/app/components/arrangement/ArrangementGroupHeader.tsx'
C=SC+'/app/contexts/ArrangementContext.tsx'
M={
 'MU-GH-CTX': (H, "  } = actions;\n", "  } = actions;\n  useArrangement();\n", "  GESTURE_EDIT_BLOCKED_MESSAGE,\n} from", "  GESTURE_EDIT_BLOCKED_MESSAGE,\n  useArrangement,\n} from"),
 'MU-GH-DEFAULT-MEMO': (W, "const ArrangementGroupHeaderWithSelection = memo(\n  ArrangementGroupHeaderWithSelectionInner,\n  sameGroupHeaderWithSelectionProps,\n);", "const ArrangementGroupHeaderWithSelection = memo(ArrangementGroupHeaderWithSelectionInner);\nvoid sameGroupHeaderWithSelectionProps;", None, None),
 'MU-GH-ACTIONS-INLINE': (W, "                    actions={groupHeaderActions}", "                    actions={{ ...groupHeaderActions }}", None, None),
 'MU-GH-SOLO-OFF': (W, "soloState={trackGroupSoloStates.get(row.id) ?? 'off'}", "soloState={'off'}", None, None),
 'MU-GH-COMPARATOR-NO-SOLO': (W, "    soloState: Object.is,", "    soloState: () => true,", None, None),
 'MU-GH-COMPARATOR-NO-GROUP': (W, "    group: Object.is,", "    group: () => true,", None, None),
 'MU-GH-CLIP-START-IGNORED': (W, "  start: Object.is,", "  start: () => true,", None, None),
 'MU-L8-NAME': (C, "useArrangementPlaybackStoreContext('useArrangementIsPlayingReader')", "useArrangementPlaybackStoreContext('useArrangementIsPlaying')", None, None),
}
for name,(f,a,b,a2,b2) in M.items():
    orig=open(f).read()
    assert a in orig, name
    s=orig.replace(a,b,1)
    if a2:
        assert a2 in s, name+' a2'
        s=s.replace(a2,b2,1)
    open(f,'w').write(s)
    try:
        r=subprocess.run(['npx','vitest','run','app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx','app/lib/arrangement/__tests__/context-hygiene.test.tsx'],cwd=SC,capture_output=True,text=True)
        open(f'{OUT}/mutant-{name}.log','w').write(r.stdout+r.stderr)
        reds=[l for l in (r.stdout).split('\n') if '×' in l]
        print(name, 'RED:', [x.split('×')[1].strip()[:40] for x in reds])
    finally:
        open(f,'w').write(orig)
