# B round 430 -> 431 mutants for SABA-B-12 stage 2a. usage: python3 -I run.py <scratch repo with sketch committed> <out dir>
import subprocess, sys, os
REPO, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
DLG = 'app/components/arrangement/ArrangementExportDialog.tsx'
RAD = 'app/components/arrangement/studio-radio.ts'
SHEET = 'app/components/arrangement/ArrangementShortcutSheet.tsx'
T = 'app/lib/arrangement/__tests__/'
FILES = [T + 'studio-radio.test.ts', T + 'export-dialog-a11y-copy.test.tsx', T + 'affordance-colour-ui.test.tsx', T + 'label-status-colour-ui.test.tsx']
def sub(path, old, new, count=1):
    p = os.path.join(REPO, path); s = open(p).read()
    assert s.count(old) >= 1, (path, old)
    open(p, 'w').write(s.replace(old, new, count))
MUTANTS = {
    'MU-RD-ONE-ACCENT': lambda: sub(DLG, 'className={STUDIO_RADIO_CLASS}', 'className="accent-brand"'),
    'MU-RD-VIDEO-BARE': lambda: sub(DLG, '                disabled\n                className={STUDIO_RADIO_CLASS}\n', '                disabled\n'),
    'MU-RD-NO-FORCED': lambda: sub(RAD, "  'forced-colors:appearance-auto',\n", ''),
    'MU-RD-NATIVE': lambda: sub(RAD, "  'appearance-none',\n", ''),
    'MU-RD-NEW-RADIO': lambda: sub(SHEET, '<input', '<input type="radio" name="x" />\n      <input'),
    'MU-RD-SPREAD-TYPE': lambda: sub(SHEET, '<input', "<input {...{ type: 'radio' }} />\n      <input"),
    'MU-RD-HOVER-CHECKED': lambda: sub(RAD, "'enabled:not-checked:hover:border-brand-hover'", "'enabled:hover:border-brand-hover'"),
}
lines = []
for name, apply in MUTANTS.items():
    subprocess.run(['git', 'checkout', '-q', '--', '.'], cwd=REPO, check=True)
    apply()
    r = subprocess.run(['npx', 'vitest', 'run', *FILES], cwd=REPO, capture_output=True, text=True)
    log = r.stdout + r.stderr
    open(os.path.join(OUT, name + '.log'), 'w').write(log)
    red = sorted({tok for tok in ['RD1', 'RD2', 'RD3', 'DXA7', 'DXL8', 'AN1', 'AN2'] if any(('×' in l or 'FAIL' in l) and (tok + ':' in l or tok + ' ' in l) for l in log.splitlines())})
    lines.append(f"{name}: rc={r.returncode} red={','.join(red) or 'NONE'}")
subprocess.run(['git', 'checkout', '-q', '--', '.'], cwd=REPO, check=True)
open(os.path.join(OUT, 'summary.txt'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
