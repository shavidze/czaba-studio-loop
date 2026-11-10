import subprocess, sys, pathlib, re
root = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
P = 'app/components/arrangement/ArrangementDetailPanel.tsx'
C = 'app/components/arrangement/studio-number-field.ts'
T = ['app/lib/arrangement/__tests__/studio-number-field.test.ts', 'app/lib/arrangement/__tests__/detail-panel-fit.test.tsx']
def sub(path, old, new):
    f = root / path; s = f.read_text(); assert s.count(old) >= 1, (path, old); f.write_text(s.replace(old, new, 1))
MUT = {
  'MU-NF-CLASS': lambda: sub(P, ' ${STUDIO_NUMBER_FIELD_CLASS}`;', '`;'),
  'MU-NF-INNER': lambda: sub(C, "  '[&::-webkit-inner-spin-button]:appearance-none',\n", ''),
  'MU-NF-TEXTFIELD': lambda: sub(C, "  '[appearance:textfield]',\n", ''),
  'MU-NF-NEW-FIELD': lambda: sub('app/components/arrangement/ArrangementTransport.tsx', 'type="range"', 'type="number"'),
  'MU-NF-4TH-FIELD': lambda: sub(P, '              className={inputClass}\n              data-testid="arrangement-detail-end"', '              className={inputClass}\n              data-testid="arrangement-detail-end"\n            />\n            <input\n              type="number"\n              aria-label="Extra"\n              className="h-6 w-20"'),
  'MU-NF-IMPORT-ONLY': lambda: (sub(P, " ${STUDIO_NUMBER_FIELD_CLASS}`;", '`;'), sub(P, "import { STUDIO_NUMBER_FIELD_CLASS } from './studio-number-field';", "import {\n  STUDIO_NUMBER_FIELD_CLASS,\n} from './studio-number-field';\nvoid STUDIO_NUMBER_FIELD_CLASS;")),
}
lines = []
for name, apply in MUT.items():
    subprocess.run(['git', 'checkout', '-q', '--', '.'], cwd=root, check=True)
    apply()
    r = subprocess.run(['npx', 'vitest', 'run', *T], cwd=root, capture_output=True, text=True)
    log = r.stdout + r.stderr; (out / f'{name}.log').write_text(log)
    failed = sorted(set(re.findall(r'(NF\d|F10)\b[^\n]*', '\n'.join(l for l in log.splitlines() if ('×' in l or 'FAIL' in l)))))
    ids = sorted(set(m.split(':')[0] for m in failed))
    t = re.search(r'Tests\s+(.*)', log)
    lines.append(f"{name} rc={r.returncode} red={','.join(ids) or 'none'} tests={re.sub(r'\x1b\[[0-9;]*m','',t.group(1)).strip() if t else '?'}")
subprocess.run(['git', 'checkout', '-q', '--', '.'], cwd=root, check=True)
(out / 'summary.txt').write_text('\n'.join(lines) + '\n'); print('\n'.join(lines))
