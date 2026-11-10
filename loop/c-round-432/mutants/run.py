# B round 431 -> 432 mutants for SABA-B-12 stage 2b. usage: python3 -I run.py <scratch repo with sketch committed> <out dir>
import subprocess, sys, os
REPO, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
DLG = 'app/components/arrangement/ArrangementExportDialog.tsx'
PRG = 'app/components/arrangement/studio-progress.ts'
SHEET = 'app/components/arrangement/ArrangementShortcutSheet.tsx'
T = 'app/lib/arrangement/__tests__/'
FILES = [T + 'studio-progress.test.ts', T + 'label-status-colour-ui.test.tsx']
def sub(path, old, new, count=1):
    p = os.path.join(REPO, path); s = open(p).read()
    assert s.count(old) >= 1, (path, old)
    open(p, 'w').write(s.replace(old, new, count))
MUTANTS = {
    'MU-PG-ACCENT': lambda: sub(DLG, 'className={STUDIO_PROGRESS_CLASS}', 'className="h-2 w-full accent-foreground"'),
    'MU-PG-NO-FORCED': lambda: sub(PRG, "  'forced-colors:appearance-auto',\n", ''),
    'MU-PG-NATIVE': lambda: sub(PRG, "  'appearance-none',\n", ''),
    'MU-PG-ALWAYS-PULSE': lambda: sub(PRG, "'motion-safe:indeterminate:animate-pulse'", "'animate-pulse'"),
    'MU-PG-BRASS-FILL': lambda: sub(PRG, "'[&::-webkit-progress-value]:bg-foreground'", "'[&::-webkit-progress-value]:bg-brand'"),
    'MU-PG-MOZ-IND': lambda: sub(PRG, "  'indeterminate:[&::-moz-progress-bar]:bg-foreground/30',\n", ''),
    'MU-PG-CLOSING-PAIR': lambda: sub(DLG, 'className={STUDIO_PROGRESS_CLASS}\n                />', 'className={STUDIO_PROGRESS_CLASS}\n                ></progress>'),
    'MU-PG-NEW-BAR': lambda: sub(SHEET, '<input', '<progress max={1} value={0.5} />\n      <input'),
}
lines = []
for name, apply in MUTANTS.items():
    subprocess.run(['git', 'checkout', '-q', '--', '.'], cwd=REPO, check=True)
    apply()
    r = subprocess.run(['npx', 'vitest', 'run', *FILES], cwd=REPO, capture_output=True, text=True)
    log = r.stdout + r.stderr
    open(os.path.join(OUT, name + '.log'), 'w').write(log)
    red = sorted({tok for tok in ['PG1', 'PG2', 'DXL7c', 'DXL8'] if any(('×' in l or 'FAIL' in l) and (tok + ':' in l or tok + ' ' in l) for l in log.splitlines())})
    lines.append(f"{name}: rc={r.returncode} red={','.join(red) or 'NONE'}")
subprocess.run(['git', 'checkout', '-q', '--', '.'], cwd=REPO, check=True)
open(os.path.join(OUT, 'summary.txt'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
