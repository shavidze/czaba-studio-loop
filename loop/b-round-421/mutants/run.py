# B round 421 -> 422 mutants for SYS-2 stage 1. Usage: python3 -I run.py <scratch-with-HEAD-base> <out-dir-containing-sketch-422.patch.txt>
# The scratch must be a git repo whose HEAD tree is store HEAD 4786c13 with nothing applied. The script applies the sketch,
# commits the sketch on the scratch once, runs each mutant on transport-centre-ui.test.tsx, resets to the sketch commit after each, and writes <out>/mutants/summary.txt + mutant-<id>.log.
import os, re, subprocess, sys
scr, out = sys.argv[1], sys.argv[2]
def sh(cmd, **kw):
    return subprocess.run(cmd, cwd=scr, shell=True, capture_output=True, text=True, **kw)
assert sh('git status --porcelain').stdout.strip() == '', 'scratch not clean'
assert sh(f'git apply --check {out}/sketch-422.patch.txt').returncode == 0, 'sketch does not apply on scratch HEAD'
sh(f'git apply {out}/sketch-422.patch.txt')
assert sh('git -c user.email=m@x -c user.name=M commit -qam sketch-422').returncode == 0, 'could not commit the sketch on the scratch'
T = 'app/components/arrangement/ArrangementTransport.tsx'
M = 'app/components/arrangement/ArrangementMarkerRow.tsx'
G = '\n        onKeyDown={preventRepeatedEnterKeyDown}'
def drop_after(path, anchor):
    def f():
        s = open(os.path.join(scr, path), encoding='utf-8').read()
        assert s.count(anchor + G) == 1, (path, anchor)
        open(os.path.join(scr, path), 'w', encoding='utf-8').write(s.replace(anchor + G, anchor))
    return f
def flag():
    p = os.path.join(scr, M); s = open(p, encoding='utf-8').read()
    a = "    if (event.key === 'Enter' && event.repeat) {\n      event.preventDefault();\n      return;\n    }\n    if (event.target !== event.currentTarget"
    assert s.count(a) == 1
    open(p, 'w', encoding='utf-8').write(s.replace(a, "    if (event.target !== event.currentTarget"))
def head_src():
    sh(f'git checkout HEAD~1 -- {T} {M}')
mutants = [
    ('MU-HEAD-SRC', head_src),
    ('MU-SPLIT', drop_after(T, "          splitSelection();\n        })}")),
    ('MU-FOLLOW', drop_after(T, "        onClick={onToggleFollow}")),
    ('MU-BACK', drop_after(T, '        type="button"\n        onClick={returnToStart}')),
    ('MU-LOOP', drop_after(T, "          toggleLoopSelection();\n        })}")),
    ('MU-ZOOMRANGE', drop_after(T, "          onZoomToRange();\n        })}")),
    ('MU-FLAG', flag),
]
lines = []
for mid, mut in mutants:
    mut()
    r = sh('npx vitest run app/lib/arrangement/__tests__/transport-centre-ui.test.tsx 2>&1', timeout=600)
    open(os.path.join(out, 'mutants', f'mutant-{mid}.log'), 'w').write(r.stdout + r.stderr)
    red = sorted(set(re.findall(r'(?:×|✗)\s+((?:HE|TC)\d+)', re.sub(r'\x1b\[[0-9;]*m', '', r.stdout))))
    lines.append(f"{mid}: red {','.join(red) if red else 'none'}")
    sh('git reset -q --hard')
    assert sh('git status --porcelain').stdout.strip() == '', 'scratch not back at the sketch commit'
open(os.path.join(out, 'mutants', 'summary.txt'), 'w').write('\n'.join(lines) + '\n')
sh('git reset -q --hard')
print('\n'.join(lines))
