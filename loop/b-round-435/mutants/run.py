# usage: python3 -I run.py <scratch> <loopB>  — each mutant reverts one sketch string in source only, runs the covering files, logs red rows
import subprocess, sys, pathlib, re
S, B = sys.argv[1], pathlib.Path(sys.argv[2])
cov = (B / 'covering-files.txt').read_text().split()
M = {
 'M1-label': ('app/lib/arrangement/strings.ts', "sourceOffsetLabel: 'Clip origin',", "sourceOffsetLabel: 'Source offset',"),
 'M2-footer': ('app/lib/arrangement/strings.ts', "text: ' · clip origin ',", "text: ' · source offset ',"),
 'M3-announce': ('app/components/arrangement/ArrangementClip.tsx', ", clip origin ${", ", source offset ${"),
 'M4-from': ('app/lib/arrangement/strings.ts', "rangeFromLabel: 'From',", "rangeFromLabel: 'From, s',"),
 'M5-to': ('app/lib/arrangement/strings.ts', "rangeToLabel: 'To',", "rangeToLabel: 'To, s',"),
}
(B / 'mutants').mkdir(parents=True, exist_ok=True)
summary = []
for mid, (f, new, old) in M.items():
    p = pathlib.Path(S) / f; orig = p.read_text(); assert orig.count(new) == 1, mid
    p.write_text(orig.replace(new, old))
    try:
        r = subprocess.run(['npx', 'vitest', 'run', *cov], cwd=S, capture_output=True, text=True, timeout=900)
        log = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
        (B / 'mutants' / f'mutant-{mid}.log').write_text(log)
        red = sorted(set(m.group(1).strip() for m in re.finditer(r'^ +(?:×|✗|FAIL) +(.+?)(?: \d+ms)?$', log, re.M)))
        summary.append(f"{mid} rc {r.returncode} red: {' | '.join(red) if red else 'none'}")
    finally:
        p.write_text(orig)
r = subprocess.run(['npx', 'vitest', 'run', *cov], cwd=S, capture_output=True, text=True, timeout=900)
summary.append(f"sketch-green rc {r.returncode}")
(B / 'mutants' / 'summary.txt').write_text('\n'.join(summary) + '\n')
print('\n'.join(summary))
