# Usage: SCRATCH=<sketch tree with node_modules> OUT=<empty dir> python3 -I run-mutants.py
# Each mutant reverts one piece of the round-443 sketch in SCRATCH, runs ime-composition-ui.test.tsx, restores the file.
import json, os, re, subprocess
S = os.environ['SCRATCH']; OUT = os.environ['OUT']
A = 'app/components/arrangement/'
T = 'app/lib/arrangement/__tests__/ime-composition-ui.test.tsx'
M = [
 ('TEMPO-ENTER-REPEAT', A+'ArrangementTempoRow.tsx', "      if (!event.repeat) {\n        event.currentTarget.blur();\n      }\n", "      event.currentTarget.blur();\n"),
 ('TEMPO-ESC-REPEAT', A+'ArrangementTempoRow.tsx', "      if (event.repeat) {\n        return;\n      }\n      skipCommitRef", "      skipCommitRef"),
 ('MARKER-ESC-REPEAT', A+'ArrangementMarkerRow.tsx', "                if (event.repeat) {\n                  return;\n                }\n                settleEditor", "                if (preventRepeatedEnterKeyDown(event)) {\n                  return;\n                }\n                settleEditor"),
 ('GAIN-ESC-REPEAT', A+'ArrangementDetailPanel.tsx', "      if (!event.repeat) {\n        setClipGainText(displayedClipGainText);\n      }\n", "      setClipGainText(displayedClipGainText);\n"),
 ('TEMPO-ESC-NO-CANCEL', A+'ArrangementTempoRow.tsx', "      skipCommitRef.current = true;\n      setDraft(null);\n", "      setDraft(null);\n"),
 ('TEMPO-SKIP-BEFORE-REPEAT', A+'ArrangementTempoRow.tsx', "      event.preventDefault();\n      if (event.repeat) {\n        return;\n      }\n      skipCommitRef.current = true;\n", "      event.preventDefault();\n      skipCommitRef.current = true;\n      if (event.repeat) {\n        return;\n      }\n"),
 ('IME-GUARD-TEMPO-OFF', A+'ArrangementTempoRow.tsx', "    if (isImeCompositionKeyDown(event)) {\n      return;\n    }\n    if (event.key === 'Enter') {\n      event.preventDefault();\n      if (!event.repeat)", "    if (event.key === 'Enter') {\n      event.preventDefault();\n      if (!event.repeat)"),
]
os.makedirs(OUT, exist_ok=True)
for mid, path, old, new in M:
    p = os.path.join(S, path); src = open(p).read()
    assert src.count(old) == 1, (mid, src.count(old))
    open(p, 'w').write(src.replace(old, new))
    try:
        r = subprocess.run(['npx', 'vitest', 'run', T], cwd=S, capture_output=True, text=True, timeout=600, env={**os.environ, 'NO_COLOR': '1', 'FORCE_COLOR': '0'})
        log = r.stdout + r.stderr
        open(os.path.join(OUT, mid + '.log'), 'w').write(log)
        failed = sorted({re.sub(r'\x1b\[[0-9;]*m', '', l).split(' > ')[-1][:4] for l in log.splitlines() if ' FAIL ' in l and ' > ' in l})
        line = {'id': mid, 'rc': r.returncode, 'failedRows': failed}
    finally:
        open(p, 'w').write(src)
    open(os.path.join(OUT, 'results.jsonl'), 'a').write(json.dumps(line) + '\n')
    print(json.dumps(line))
