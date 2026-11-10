# B round 425 -> 426 mutants for SYS-2 stage 2a. Usage: python3 -I run.py <scratch-with-HEAD-base> <out-dir-containing-sketch-426.patch.txt>
# The scratch must be a clean git repo whose HEAD tree is store HEAD f6c76f4 with nothing applied (node_modules symlinked).
# The script applies the sketch, commits it once, runs each mutant on mixer-held-enter-ui.test.tsx (MU-SPREAD-TYPE: npx tsc --noEmit),
# resets hard to the sketch commit after each, and writes <out>/mutants/summary.txt + mutant-<id>.log. It never writes into the store.
import os, re, subprocess, sys
scr, out = sys.argv[1], sys.argv[2]
def sh(cmd, **kw):
    return subprocess.run(cmd, cwd=scr, shell=True, capture_output=True, text=True, **kw)
assert sh('git status --porcelain').stdout.strip() == '', 'scratch not clean'
assert sh(f'git apply --check {out}/sketch-426.patch.txt').returncode == 0, 'sketch does not apply on scratch HEAD'
sh(f'git apply {out}/sketch-426.patch.txt')
sh('git add -A')
assert sh('git -c user.email=m@x -c user.name=M commit -qm sketch-426').returncode == 0, 'could not commit the sketch'
A = 'app/components/arrangement/'
L, GH, MA, TR, SD, H = A+'ArrangementLane.tsx', A+'ArrangementGroupHeader.tsx', A+'ArrangementMaster.tsx', A+'ArrangementTempoRow.tsx', A+'studio-soft-disabled.ts', A+'studio-repeat-safe.ts'
TEST = 'app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx'
def rep(path, old, new):
    def f():
        p = os.path.join(scr, path); s = open(p, encoding='utf-8').read()
        assert s.count(old) == 1, (path, old[:60], s.count(old))
        open(p, 'w', encoding='utf-8').write(s.replace(old, new))
    return f
def drop(path, anchor, indent):
    g = '\n' + ' ' * indent + 'onKeyDown={preventRepeatedEnterKeyDown}'
    return rep(path, anchor + g, anchor)
EARLY = lambda ind: (' ' * ind + 'if (preventRepeatedEnterKeyDown(event)) {\n' + ' ' * ind + '  return;\n' + ' ' * ind + '}\n')
def head_src():
    sh(f'git checkout HEAD~1 -- {L} {GH} {MA} {TR} {SD} {A}ArrangementTransport.tsx')
mutants = [
    ('MU-HEAD-SRC', head_src, 'vitest'),
    ('MU-LANE-MUTE', drop(L, '      onClick={() => toggleTrackMute(track.id)}', 6), 'vitest'),
    ('MU-LANE-SOLO', drop(L, '      onClick={(event) => toggleTrackSolo(track.id, event.ctrlKey || event.metaKey)}', 6), 'vitest'),
    ('MU-LANE-FOLD', rep(L, EARLY(4) + "    if (event.key !== ' ') {", "    if (event.key !== ' ') {"), 'vitest'),
    ('MU-LANE-NAME', rep(L, '            }}\n            onKeyDown={preventRepeatedEnterKeyDown}\n            aria-pressed={isActive}', '            }}\n            aria-pressed={isActive}'), 'vitest'),
    ('MU-LANE-VIDEO', rep(L, '                  onKeyDown={preventRepeatedEnterKeyDown}\n                  className="flex shrink-0', '                  className="flex shrink-0'), 'vitest'),
    ('MU-LANE-VIDEO-COMPACT', rep(L, '                  onKeyDown={preventRepeatedEnterKeyDown}\n                  aria-label={VIDEO_IMPORT_LABEL}', '                  aria-label={VIDEO_IMPORT_LABEL}'), 'vitest'),
    ('MU-PAN-RESET', rep(L, '        }}\n        onKeyDown={preventRepeatedEnterKeyDown}\n        disabled={isPanCentred}', '        }}\n        disabled={isPanCentred}'), 'vitest'),
    ('MU-GROUP-FOLD', rep(GH, EARLY(12) + "            if (event.key !== ' ') {", "            if (event.key !== ' ') {"), 'vitest'),
    ('MU-GROUP-NAME', rep(GH, EARLY(4) + "    if (event.key !== 'F2'", "    if (event.key !== 'F2'"), 'vitest'),
    ('MU-GROUP-INPUT', rep(GH, "                if (!event.repeat) {\n                  settleEditor(event.key === 'Enter' ? 'enter' : 'escape');\n                }", "                settleEditor(event.key === 'Enter' ? 'enter' : 'escape');"), 'vitest'),
    ('MU-GROUP-MUTE', drop(GH, '          onClick={() => toggleGroupMute(group.id)}', 10), 'vitest'),
    ('MU-GROUP-SOLO', drop(GH, '          onClick={(event) => toggleGroupSolo(group.id, event.ctrlKey || event.metaKey)}', 10), 'vitest'),
    ('MU-MASTER-MUTE', drop(MA, '        onClick={toggleMasterMute}', 8), 'vitest'),
    ('MU-MASTER-PEAK', drop(MA, '        onClick={onResetPeak}', 8), 'vitest'),
    ('MU-METRONOME', drop(TR, '          onClick={guardSoftDisabledClick(onMetronomeToggle)}', 10), 'vitest'),
    ('MU-HELPER', rep(H, "if (event.key !== 'Enter' || !event.repeat) {", "if (event.key !== 'Enter') {"), 'vitest'),
    ('MU-SPREAD-TYPE', rep(SD, '  onKeyDown?: never;\n', ''), 'tsc'),
]
os.makedirs(f'{out}/mutants', exist_ok=True)
lines = []
for mid, mut, kind in mutants:
    mut()
    if kind == 'vitest':
        r = sh(f'npx vitest run {TEST} 2>&1', timeout=900)
        log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout)
        red = sorted(set(re.findall(r'(?:×|✗|FAIL .*?> )\s*(HM\d+b?)\b', log)), key=lambda x: (int(re.sub(r'\D', '', x)), x))
        tests = re.search(r'\n\s*Tests\s+(\d+ (?:failed|passed).*?)\n', log)
        lines.append(f"{mid}: red {','.join(red) if red else 'NONE'} ({tests.group(1).strip() if tests else 'no Tests line'})")
    else:
        r = sh('npx tsc --noEmit 2>&1', timeout=900)
        log = r.stdout
        hits = [l for l in log.splitlines() if 'mixer-held-enter-ui' in l]
        lines.append(f"{mid}: tsc rc {r.returncode}, {len(hits)} error line(s) in mixer-held-enter-ui.test.tsx")
    open(f'{out}/mutants/mutant-{mid}.log', 'w').write(log)
    assert sh('git reset -q --hard HEAD').returncode == 0 and sh('git status --porcelain').stdout.strip() == ''
open(f'{out}/mutants/summary.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
