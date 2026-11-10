# B round 426 -> 427 mutants for SYS-2 stage 2b-i. Usage: python3 -I run.py <scratch-with-HEAD-base> <out-dir-containing-sketch-427.patch.txt>
# The scratch must be a clean git repo whose HEAD tree is store HEAD 052c76c with nothing applied (node_modules symlinked).
# The script applies the sketch, commits it once, runs each mutant on panel-held-enter-ui.test.tsx + mixer-held-enter-ui.test.tsx,
# resets hard to the sketch commit after each, and writes <out>/mutants/summary.txt + mutant-<id>.log. It never writes into the store.
import os, re, subprocess, sys
scr, out = sys.argv[1], sys.argv[2]
def sh(cmd, **kw):
    return subprocess.run(cmd, cwd=scr, shell=True, capture_output=True, text=True, **kw)
assert sh('git status --porcelain').stdout.strip() == '', 'scratch not clean'
assert sh(f'git apply --check {out}/sketch-427.patch.txt').returncode == 0, 'sketch does not apply on scratch HEAD'
sh(f'git apply {out}/sketch-427.patch.txt')
sh('git add -A')
assert sh('git -c user.email=m@x -c user.name=M commit -qm sketch-427').returncode == 0, 'could not commit the sketch'
A = 'app/components/arrangement/'
LIB, DP, VD, WS, LP = A+'ArrangementLibrary.tsx', A+'ArrangementDetailPanel.tsx', A+'ArrangementVideoDock.tsx', A+'StudioWorkspace.tsx', A+'ArrangementLibraryPreview.tsx'
TESTS = 'app/lib/arrangement/__tests__/panel-held-enter-ui.test.tsx app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx'
G = 'onKeyDown={preventRepeatedEnterKeyDown}'
def drop_after(path, anchor):
    def f():
        p = os.path.join(scr, path); s = open(p, encoding='utf-8').read()
        m = re.search(re.escape(anchor) + r'\n(\s*)' + re.escape(G) + r'\n', s)
        assert m and len(re.findall(re.escape(anchor) + r'\n\s*' + re.escape(G) + r'\n', s)) == 1, (path, anchor)
        open(p, 'w', encoding='utf-8').write(s[:m.start()] + anchor + '\n' + s[m.end():])
    return f
def rep(path, old, new):
    def f():
        p = os.path.join(scr, path); s = open(p, encoding='utf-8').read()
        assert s.count(old) == 1, (path, old[:60], s.count(old))
        open(p, 'w', encoding='utf-8').write(s.replace(old, new))
    return f
def head_src():
    sh(f'git checkout HEAD~1 -- {LIB} {DP} {VD} {WS} {LP}')
mutants = [
    ('MU-HEAD-SRC', head_src),
    ('MU-SNAP', drop_after(WS, 'onClick={toggleSnap}')),
    ('MU-ENVELOPE', drop_after(WS, 'onClick={toggleEnvelopeMode}')),
    ('MU-LIB-FOLD', drop_after(LIB, 'onClick={() => toggleCollection(entry.id)}')),
    ('MU-LIB-ALL', drop_after(LIB, 'onClick={() => setNodeId(LIBRARY_ALL_NODE_ID)}')),
    ('MU-LIB-COLLECTION', drop_after(LIB, 'onClick={() => setNodeId(entry.id)}')),
    ('MU-LIB-FOLDER', drop_after(LIB, 'onClick={() => setNodeId(folder.id)}')),
    ('MU-LIB-DISMISS', rep(LIB, '                  }}\n                  ' + G + '\n                  aria-label={studioLibraryPanelStrings.dismissNotice}', '                  }}\n                  aria-label={studioLibraryPanelStrings.dismissNotice}')),
    ('MU-DETAIL-TOGGLE', rep(DP, '    if (preventRepeatedEnterKeyDown(event)) {\n      return;\n    }\n    if (event.key !== \' \') {', '    if (event.key !== \' \') {')),
    ('MU-VIDEO-EXPAND', drop_after(VD, 'onClick={() => onVideoExpandedChange(!isVideoExpanded)}')),
    ('MU-VIDEO-CLOSE', rep(VD, '              ' + G + '\n              aria-label={studioVideoDockStrings.closeLabel}', '              aria-label={studioVideoDockStrings.closeLabel}')),
    ('MU-VIDEO-RETURN', rep(VD, '            ' + G + '\n            aria-label={VIDEO_RETURN_LABEL}', '            aria-label={VIDEO_RETURN_LABEL}')),
]
os.makedirs(f'{out}/mutants', exist_ok=True)
lines = []
for mid, mut in mutants:
    mut()
    r = sh(f'npx vitest run {TESTS} 2>&1', timeout=900)
    log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout)
    red = sorted(set(re.findall(r'(?:×|✗)\s*(H[PM]\d+b?)\b', log)), key=lambda x: (x[:2], int(re.sub(r'\D', '', x)), x))
    tests = re.search(r'\n\s*Tests\s+(\d+ (?:failed|passed).*?)\n', log)
    lines.append(f"{mid}: red {','.join(red) if red else 'NONE'} ({tests.group(1).strip() if tests else 'no Tests line'})")
    open(f'{out}/mutants/mutant-{mid}.log', 'w', encoding='utf-8').write(log)
    assert sh('git reset -q --hard HEAD && git clean -qfd').returncode == 0
    print(lines[-1], flush=True)
open(f'{out}/mutants/summary.txt', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
