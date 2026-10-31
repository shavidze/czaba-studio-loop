#!/usr/bin/env python3
# C289 own mutants M1-M5 on /tmp/c289mut (scratch rsync of A's tree). Usage: python3 -I mutants-c.py
import subprocess, pathlib, re, json
ROOT = pathlib.Path('/tmp/c289mut')
LIB = 'app/components/arrangement/ArrangementLibrary.tsx'
DEMO = 'app/data/studio-lab-demo.ts'
TESTS = ['app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx', 'app/data/__tests__/studio-lab-demo.test.ts']
OPT_CTX = ('        {source.shortTitle ?? source.title}\n      </span>\n',
           '        {source.shortTitle ?? source.title}\n      </span>\n      {source.shortTitle ? (<span className="text-xs" data-testid="arrangement-library-option-context">{source.collectionLabel}</span>) : null}\n')
M3_OLD = '      const last = runs[runs.length - 1];\n      if (last && last.label === source.collectionLabel) {\n        last.end = index + 1;\n      } else {'
MUTANTS = {
    'M1': [(LIB, 'libraryResultRuns.length >= 2', 'libraryResultRuns.length >= 1')],
    'M2': [(LIB, OPT_CTX[0], OPT_CTX[1])],
    # M3: group by first appearance -> merge non-contiguous runs and reorder rendered options (slice by collected ids)
    'M3': [(LIB, M3_OLD, '      const last = runs.find((r) => r.label === source.collectionLabel);\n      if (last) {\n        last.end = index + 1;\n      } else {')],
    'M4': [(LIB, 'id={headingId}\n', 'id={headingId}\n                            tabIndex={0}\n')],
    'M5': [(DEMO, "bass: 'Bass',", "bass: 'ბასი',")],
}
res = {}
for name, edits in MUTANTS.items():
    saved = {}
    try:
        for f, old, new in edits:
            p = ROOT / f
            s = saved.setdefault(f, p.read_text())
            cur = p.read_text()
            assert cur.count(old) == 1, (name, f, cur.count(old))
            p.write_text(cur.replace(old, new))
        r = subprocess.run(['npx', 'vitest', 'run', *TESTS, '--reporter=verbose'], cwd=ROOT, capture_output=True, text=True, timeout=600)
        txt = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
        (pathlib.Path(__file__).parent / f'mut-{name}.log').write_text(txt)
        failed = sorted(set(re.findall(r'(?:×|✗|FAIL)\s.*?((?:LG[1-7]|DL-EN))\b', txt)))
        res[name] = {'rc': r.returncode, 'failedIds': failed}
    finally:
        for f, s in saved.items():
            (ROOT / f).write_text(s)
    print(name, res[name], flush=True)
(pathlib.Path(__file__).parent / 'mutants-c.json').write_text(json.dumps(res, indent=1))
