import subprocess, sys, shutil, re, pathlib
S = pathlib.Path('/tmp/a244-scratch'); O = pathlib.Path('/tmp/a244-orig')
OUT = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-244/mutants')
STORE = '/home/runner/czaba-project/store'
SW = 'app/components/arrangement/StudioWorkspace.tsx'; MR = 'app/components/arrangement/ArrangementMarkerRow.tsx'
T = 'app/lib/arrangement/__tests__/grid-snap-menu.test.tsx'
def head(p): return subprocess.run(['git','show','HEAD:'+p],cwd=STORE,capture_output=True,text=True,check=True).stdout
def rep(old,new):
    def f(src):
        assert src.count(old)==1, old
        return src.replace(old,new)
    return f
muts = {
 'FIX-CONTROL': {},
 'MU-HEAD': {SW: lambda s: head(SW), MR: lambda s: head(MR)},
 'MU-NO-MARKER-FALLBACK': {SW: rep("    if (markerRowRef.current?.focusEditorSuccessor(returnFocus)) {\n      return;\n    }\n","")},
 'MU-NO-GROUP-FALLBACK': {SW: rep("      trackRowNameButton(scrollerRef.current, returnGroupId)?.focus({ preventScroll: true });\n","")},
 'MU-L1-REVERT': {SW: rep("      gridMenuPressFocusRef.current = pressFocus;\n","      if (pressFocus !== null) {\n        gridMenuPressFocusRef.current = pressFocus;\n      }\n")},
 'MU-RELEASE-LEFT-ONLY': {SW: rep("      if (\n        focused instanceof HTMLElement &&\n        (((isRangeInputTarget","      if (\n        event.button !== 2 &&\n        focused instanceof HTMLElement &&\n        (((isRangeInputTarget")},
 'MU-SUCCESSOR-NO-IDENTITY': {MR: rep("successor === null || successor.input !== element","successor === null")},
 'MU-ALWAYS-SUCCESSOR': {MR: rep("const moveFocus = reason !== 'blur';","const moveFocus = true;")},
}
cov_grep = [l.strip() for l in open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-243/covering-grep.txt') if l.strip()]
for name, edits in muts.items():
    if len(sys.argv)>1 and name not in sys.argv[1:]: continue
    for f in (SW, MR): shutil.copy(O/pathlib.Path(f).name, S/f)
    for f, fn in edits.items():
        (S/f).write_text(fn((S/f).read_text()))
    files = sorted(set(cov_grep+[T])) if name=='MU-ALWAYS-SUCCESSOR' else [T]
    r = subprocess.run(['npx','vitest','run',*files],cwd=S,capture_output=True,text=True)
    log = re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
    (OUT/f'{name}.log').write_text(log)
    reds = sorted(set(re.findall(r'^\s+(?:×|✗) .*?\b((?:GM|FR|MU)\d+)\b', log, re.M)))
    summ = [l.strip() for l in log.splitlines() if l.strip().startswith('Tests ')]
    print(name, 'rc', r.returncode, 'red:', reds, summ)
for f in (SW, MR): shutil.copy(O/pathlib.Path(f).name, S/f)
