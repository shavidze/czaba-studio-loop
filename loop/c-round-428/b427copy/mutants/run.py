# B round 427 -> 428 mutants for SYS-2 stage 4 (2b-ii-a). Usage: python3 -I run.py <scratch-with-HEAD-base> <out-dir-containing-sketch-428.patch.txt>
# The scratch must be a clean git repo whose HEAD tree is store HEAD ffae71c with nothing applied (node_modules symlinked).
# The script applies the sketch, commits it once, runs each mutant on the three covering held-Enter files,
# resets hard to the sketch commit after each, and writes <out>/mutants/summary.txt + mutant-<id>.log. It never writes into the store.
import os, re, subprocess, sys
scr, out = sys.argv[1], sys.argv[2]
def sh(cmd, **kw):
    return subprocess.run(cmd, cwd=scr, shell=True, capture_output=True, text=True, **kw)
assert sh('git status --porcelain').stdout.strip() == '', 'scratch not clean'
assert sh(f'git apply --check {out}/sketch-428.patch.txt').returncode == 0, 'sketch does not apply on scratch HEAD'
sh(f'git apply {out}/sketch-428.patch.txt')
sh('git add -A')
assert sh('git -c user.email=m@x -c user.name=M commit -qm sketch-428').returncode == 0, 'could not commit the sketch'
A = 'app/components/arrangement/'
WS, SH, NS, XD = A+'StudioWorkspace.tsx', A+'ArrangementShortcutSheet.tsx', A+'StudioNarrowScreen.tsx', A+'ArrangementExportDialog.tsx'
T = 'app/lib/arrangement/__tests__/'
TESTS = f'{T}shortcut-sheet-ui.test.tsx {T}studio-narrow-gate-ui.test.tsx {T}export-cancel-ui.test.tsx'
G = 'onKeyDown={preventRepeatedEnterKeyDown}'
def drop_after(path, anchor):
    def f():
        p = os.path.join(scr, path); s = open(p, encoding='utf-8').read()
        pat = re.escape(anchor) + r'\n\s*' + re.escape(G) + r'\n'
        hits = re.findall(pat, s)
        assert len(hits) == 1, (path, anchor, len(hits))
        m = re.search(pat, s)
        open(p, 'w', encoding='utf-8').write(s[:m.start()] + anchor + '\n' + s[m.end():])
    return f
def head_src():
    sh(f'git checkout HEAD~1 -- {WS} {SH} {NS} {XD}')
mutants = [
    ('MU-HEAD-SRC', head_src),
    ('MU-SHEET-FOOTER', drop_after(WS, 'onClick={() => setIsShortcutSheetOpen(true)}')),
    ('MU-SHEET-CLOSE', drop_after(SH, 'onClick={onClose}')),
    ('MU-NARROW-SEND', drop_after(NS, 'onClick={sendStudioLink}')),
    ('MU-EXPORT-PRIMARY', drop_after(XD, '                }}')),
    ('MU-EXPORT-CANCEL', drop_after(XD, 'onClick={cancelExport}')),
    ('MU-EXPORT-DONE', drop_after(XD, 'onClick={handleClose}')),
]
os.makedirs(f'{out}/mutants', exist_ok=True)
lines = []
for mid, mut in mutants:
    mut()
    r = sh(f'npx vitest run {TESTS} 2>&1', timeout=900)
    log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout)
    red = sorted(set(re.findall(r'(?:×|✗)\s*(H[QNX]\d+)\b', log)), key=lambda x: (x[:2], int(re.sub(r'\D', '', x))))
    other = sorted(set(re.findall(r'(?:×|✗)\s*([A-Z]+\d+[a-z]?)\b', log)) - set(red))
    tests = re.search(r'\n\s*Tests\s+(\d+ (?:failed|passed).*?)\n', log)
    lines.append(f"{mid}: red {','.join(red) if red else 'NONE'}{(' other ' + ','.join(other)) if other else ''} ({tests.group(1).strip() if tests else 'no Tests line'})")
    open(f'{out}/mutants/mutant-{mid}.log', 'w', encoding='utf-8').write(log)
    assert sh('git reset -q --hard HEAD && git clean -qfd').returncode == 0
    print(lines[-1], flush=True)
open(f'{out}/mutants/summary.txt', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
