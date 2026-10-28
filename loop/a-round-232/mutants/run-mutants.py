import pathlib, shutil, subprocess, sys, hashlib
root = pathlib.Path('.')
out = pathlib.Path(sys.argv[1])
N2 = 'app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx'
N4 = 'app/lib/arrangement/__tests__/overview-visibility-persist-ui.test.tsx'
OV = 'app/components/arrangement/ArrangementOverview.tsx'
WS = 'app/components/arrangement/StudioWorkspace.tsx'
VIS = 'app/lib/arrangement/overview-visibility.ts'
STR = 'app/lib/arrangement/strings.ts'
mutants = [
  ('MU-1', OV, "const hasClips = arrangement.clips.length > 0;", "const hasClips = !(arrangement.clips.length > 0);", [N2]),
  ('MU-2', WS, "        !event.shiftKey &&\n        !event.getModifierState('AltGraph')\n", "        !event.shiftKey\n", [N2]),
  ('MU-3', WS, "if (event.repeat || workspaceRef.current.isPointerGestureActive()) {", "if (workspaceRef.current.isPointerGestureActive()) {", [N2]),
  ('MU-4', WS, "    readOverviewHidden,\n    () => false,\n", "    readOverviewHidden,\n    readOverviewHidden,\n", [N4]),
  ('MU-5', VIS, "window.localStorage.removeItem(OVERVIEW_HIDDEN_STORAGE_KEY);", "window.localStorage.setItem(OVERVIEW_HIDDEN_STORAGE_KEY, '0');", [N2]),
  ('MU-6', WS, """<div
                  aria-hidden="true"
                  className="h-16 w-full"
                  data-testid="arrangement-overview-hidden-slot"
                />""", "null", [N2]),
  ('MU-7', WS, "hidden ? studioViewStrings.overviewHidden : studioViewStrings.overviewShown", "hidden ? studioViewStrings.overviewShown : studioViewStrings.overviewHidden", [N2]),
  ('MU-8', OV, "'pointer-events-none absolute inset-y-0 rounded-panel border border-foreground/70 bg-foreground/5',\n          !hasClips && 'invisible',", "'pointer-events-none absolute inset-y-0 rounded-panel border border-foreground/70 bg-foreground/5',", [N2, N4]),
]
for name, rel, old, new, tests in mutants:
    p = root / rel
    orig = p.read_bytes()
    s = orig.decode()
    n = s.count(old)
    if n != 1:
        print(name, 'PATTERN COUNT', n); continue
    p.write_text(s.replace(old, new))
    r = subprocess.run(['npx', 'vitest', 'run', *tests], capture_output=True, text=True)
    p.write_bytes(orig)
    (out / f'{name}.log').write_text(r.stdout + r.stderr)
    fails = [l.strip() for l in (r.stdout + r.stderr).splitlines() if '×' in l or 'FAIL' in l][:6]
    print(name, 'rc', r.returncode, 'RED' if r.returncode else 'GREEN', '|', ' || '.join(fails))
    assert hashlib.sha256(p.read_bytes()).digest() == hashlib.sha256(orig).digest()
