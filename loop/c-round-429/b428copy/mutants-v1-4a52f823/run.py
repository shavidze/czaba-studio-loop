# B round 428 -> 429 mutants for SYS-2 stage 5 (2b-ii-b). Usage: python3 -I run.py <scratch-with-HEAD-base> <out-dir-containing-sketch-429.patch.txt>
# The scratch must be a clean git repo whose HEAD tree is store HEAD b604cfb with nothing applied (node_modules symlinked).
# Applies the sketch, commits it, runs each mutant on the three covering files, resets after each, writes <out>/mutants/summary.txt + mutant-<id>.log.
import os, re, subprocess, sys
scr, out = sys.argv[1], sys.argv[2]
def sh(cmd, **kw):
    return subprocess.run(cmd, cwd=scr, shell=True, capture_output=True, text=True, **kw)
assert sh('git status --porcelain').stdout.strip() == '', 'scratch not clean'
assert sh(f'git apply --check {out}/sketch-429.patch.txt').returncode == 0, 'sketch does not apply on scratch HEAD'
sh(f'git apply {out}/sketch-429.patch.txt'); sh('git add -A')
assert sh('git -c user.email=m@x -c user.name=M commit -qm sketch-429').returncode == 0
A = 'app/components/arrangement/'
MR, LM = A + 'ArrangementMarkerRow.tsx', A + 'ArrangementLibraryMenu.tsx'
T = 'app/lib/arrangement/__tests__/'
TESTS = f'{T}markers-ui.test.tsx {T}studio-link-view-in-store-ui.test.tsx {T}held-enter-source-scan.test.ts'
def rep(path, old, new):
    def f():
        p = os.path.join(scr, path); s = open(p, encoding='utf-8').read()
        assert s.count(old) == 1, (path, old[:70], s.count(old))
        open(p, 'w', encoding='utf-8').write(s.replace(old, new))
    return f
G = 'onKeyDown={preventRepeatedEnterKeyDown}\n'
def drop_guard_after(anchor):
    return rep(MR, anchor + '\n          ' + G, anchor + '\n')
INLINE_ARROW = "onKeyDown={(event) => {\n            if (event.key === 'Enter' && event.repeat) {\n              event.preventDefault();\n            }\n          }}\n"
FLAG_GUARD = "    if (preventRepeatedEnterKeyDown(event)) {\n      return;\n    }\n    if (event.target !== event.currentTarget"
EDIT_GUARD = "                if (preventRepeatedEnterKeyDown(event)) {\n                  return;\n                }\n                settleEditor("
LM_GUARD = "    preventRepeatedEnterKeyDown(event);\n  };"
def head_src():
    sh(f'git checkout HEAD~1 -- {MR} {LM}')
def perf_copy():
    p = os.path.join(scr, 'perf/lib/stats.ts')
    open(p, 'a', encoding='utf-8').write("\nexport function heldEnterProbe(event: { key: string; repeat: boolean }): boolean {\n  return event.repeat && event.key === 'Enter';\n}\n")
mutants = [
    ('MU-HEAD-SRC', head_src),
    ('MU-ADD', drop_guard_after('onClick={() => runUnlessGesture(beginAddMarker)}')),
    ('MU-PREV', drop_guard_after('onClick={() => runUnlessGesture(() => stepMarker(-1))}')),
    ('MU-NEXT', drop_guard_after('onClick={() => runUnlessGesture(() => stepMarker(1))}')),
    ('MU-FLAG', rep(MR, FLAG_GUARD, "    if (event.target !== event.currentTarget")),
    ('MU-EDITOR', rep(MR, EDIT_GUARD, "                settleEditor(")),
    ('MU-LIBMENU', rep(LM, LM_GUARD, "  };")),
    ('MU-FORM-ARROW', rep(MR, "onClick={() => runUnlessGesture(beginAddMarker)}\n          " + G, "onClick={() => runUnlessGesture(beginAddMarker)}\n          " + INLINE_ARROW)),
    ('MU-FORM-IF-RETURN', rep(MR, FLAG_GUARD, "    if (event.key === 'Enter' && event.repeat) {\n      event.preventDefault();\n      return;\n    }\n    if (event.target !== event.currentTarget")),
    ('MU-FORM-NESTED', rep(MR, EDIT_GUARD, "                if (event.key === 'Enter' && event.repeat) {\n                  return;\n                }\n                settleEditor(")),
    ('MU-FORM-CONTAINER', rep(LM, LM_GUARD, "    if (event.key === 'Enter' && event.repeat) {\n      event.preventDefault();\n    }\n  };")),
    ('MU-FORM-PERF-REVERSED', perf_copy),
]
os.makedirs(f'{out}/mutants', exist_ok=True)
lines = []
for mid, mut in mutants:
    mut()
    r = sh(f'npx vitest run {TESTS} 2>&1', timeout=900)
    log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout)
    fails = re.findall(r'(?:×|✗)\s*(H[KS]\d+)[^\n]*?(arrangement-marker-(?:add|prev|next))?(?: is prevented|:)', log)
    red = sorted(set(a + (('[' + b.split('-')[-1] + ']') if b else '') for a, b in fails))
    other = sorted(set(re.findall(r'(?:×|✗)\s*([A-Z]+\d+[a-z]?)\b', log)) - set(x.split('[')[0] for x in red))
    tests = re.search(r'\n\s*Tests\s+(\d+ (?:failed|passed).*?)\n', log)
    lines.append(f"{mid}: red {','.join(red) if red else 'NONE'}{(' other ' + ','.join(other)) if other else ''} ({tests.group(1).strip() if tests else 'no Tests line'})")
    open(f'{out}/mutants/mutant-{mid}.log', 'w', encoding='utf-8').write(log)
    assert sh('git reset -q --hard HEAD && git clean -qfd').returncode == 0
    print(lines[-1], flush=True)
open(f'{out}/mutants/summary.txt', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
