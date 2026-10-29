import subprocess, sys, pathlib, re
S = pathlib.Path('/tmp/c254-scratch')
OUT = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/c-round-254/mutants')
SW = S/'app/components/arrangement/StudioWorkspace.tsx'
SC = S/'app/lib/arrangement/shortcuts.ts'
files = ['app/lib/arrangement/__tests__/shortcuts.test.ts','app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx','app/lib/arrangement/__tests__/insert-marker-ui.test.tsx','app/lib/arrangement/__tests__/render-budget.test.tsx']
def sw_hidden(t):
    t2 = t.replace('hidden={hidden}\n', 'hidden\n').replace('className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-foreground motion-safe:animate-insert-marker-blink"\n','')
    assert t2 != t; return t2
def sw_nohide(t):
    t2 = t.replace('      hidden={hidden}\n', ''); assert t2 != t; return t2
def sc_norows(t):
    t2 = re.sub(r"      \{\n        id: 'continue-playback',.*?\},\n      \{\n        id: 'insert-marker-to-playhead',.*?\},\n", '', t, flags=re.S); assert t2 != t; return t2
muts = [('FIX-CONTROL', None, None), ('MU-HIDDEN-SIGNAL', SW, sw_hidden), ('MU-NO-HIDE', SW, sw_nohide), ('MU-SHEET-NO-ROWS', SC, sc_norows)]
summary = []
for name, f, fn in muts:
    orig = f.read_text() if f else None
    try:
        if f: f.write_text(fn(orig))
        r = subprocess.run(['npx','vitest','run',*files], cwd=S, capture_output=True, text=True, timeout=900)
        log = r.stdout + r.stderr
        (OUT/f'{name}.log').write_text(log)
        failed = sorted(set(re.findall(r'(?:×|FAIL).*?((?:SC\d|SS-T\d|IMV\d|RB-IM)[^\n]{0,60})', log)))
        tl = [l for l in log.splitlines() if 'Tests' in l and ('passed' in l or 'failed' in l)]
        summary.append(f'{name}: rc={r.returncode} {tl[-1].strip() if tl else ""} | red: {failed}')
    finally:
        if f: f.write_text(orig)
(OUT/'summary.txt').write_text('\n'.join(summary)+'\n')
print('\n'.join(summary))
