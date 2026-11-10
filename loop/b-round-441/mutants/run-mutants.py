import json, os, subprocess, shutil, sys
S = os.environ.get('SCRATCH') or open('/home/runner/czaba-project/tmp/studio-real-loop/b-round-441/scratch-path.txt').read().strip()
OUT = os.environ.get('OUT') or '/home/runner/czaba-project/tmp/studio-real-loop/b-round-441/mutants'
A = 'app/components/arrangement/'
G1 = "    if (isImeCompositionKeyDown(event)) {\n      return;\n    }\n"
MK_NEW = "                event.stopPropagation();\n                if (isImeCompositionKeyDown(event)) {\n                  return;\n                }\n                event.preventDefault();\n"
MK_NOSTOP = "                if (isImeCompositionKeyDown(event)) {\n                  return;\n                }\n                event.stopPropagation();\n                event.preventDefault();\n"
MK_PD = "                event.stopPropagation();\n                event.preventDefault();\n                if (isImeCompositionKeyDown(event)) {\n                  return;\n                }\n"
MK_NONE = "                event.stopPropagation();\n                event.preventDefault();\n"
def tempo(): return [(A+'ArrangementTempoRow.tsx', G1, '', 1)]
MUTANTS = {
  'M-TEMPO': [(A+'ArrangementTempoRow.tsx', G1, '', 1)],
  'M-MARKER': [(A+'ArrangementMarkerRow.tsx', MK_NEW, MK_NONE, 1)],
  'M-MARKER-NOSTOP': [(A+'ArrangementMarkerRow.tsx', MK_NEW, MK_NOSTOP, 1)],
  'M-MARKER-PD': [(A+'ArrangementMarkerRow.tsx', MK_NEW, MK_PD, 1)],
  'M-GROUP': [(A+'ArrangementGroupHeader.tsx', MK_NEW, MK_NONE, 1)],
  'M-GROUP-NOSTOP': [(A+'ArrangementGroupHeader.tsx', MK_NEW, MK_NOSTOP, 1)],
  'M-GROUP-PD': [(A+'ArrangementGroupHeader.tsx', MK_NEW, MK_PD, 1)],
  'M-RANGE': [(A+'ArrangementDetailPanel.tsx', "  const handleRangeInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {\n"+G1, "  const handleRangeInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {\n", 1)],
  'M-GAIN': [(A+'ArrangementDetailPanel.tsx', "  const handleClipGainKeyDown = useStableHandler((event: KeyboardEvent<HTMLInputElement>) => {\n"+G1, "  const handleClipGainKeyDown = useStableHandler((event: KeyboardEvent<HTMLInputElement>) => {\n", 1)],
  'M-HELPER-NO229': [(A+'studio-ime-composition.ts', "event.nativeEvent.isComposing || event.keyCode === 229", "event.nativeEvent.isComposing", 1)],
  'M-HELPER-NOCOMPOSING': [(A+'studio-ime-composition.ts', "event.nativeEvent.isComposing || event.keyCode === 229", "event.keyCode === 229", 1)],
  'M-HELPER-ALWAYS': [(A+'studio-ime-composition.ts', "event.nativeEvent.isComposing || event.keyCode === 229", "event.nativeEvent.isComposing || event.keyCode !== 0", 1)],
  'M-HELPER-TRUE': [(A+'studio-ime-composition.ts', "return event.nativeEvent.isComposing || event.keyCode === 229;", "return event.type === 'keydown';", 1)],
  'M-HEAD-SOURCE': [(A+'ArrangementTempoRow.tsx', G1, '', 1), (A+'ArrangementMarkerRow.tsx', MK_NEW, "                event.preventDefault();\n                event.stopPropagation();\n", 1), (A+'ArrangementGroupHeader.tsx', MK_NEW, "                event.preventDefault();\n                event.stopPropagation();\n", 1), (A+'ArrangementDetailPanel.tsx', G1, '', 2)],
}
only = sys.argv[1:] or list(MUTANTS)
res = open(f'{OUT}/results.jsonl', 'a')
for mid in only:
    edits = MUTANTS[mid]; backups = {}
    try:
        for path, old, new, n in edits:
            p = f'{S}/{path}'
            if p not in backups: backups[p] = open(p).read()
            t = open(p).read(); assert t.count(old) == n, (mid, path, t.count(old)); open(p, 'w').write(t.replace(old, new))
        r = subprocess.run(['npx', 'vitest', 'run', 'app/lib/arrangement/__tests__/ime-composition-ui.test.tsx'], cwd=S, capture_output=True, text=True, timeout=600)
        log = r.stdout + r.stderr
        open(f'{OUT}/mutant-{mid}.log', 'w').write(log)
        fails = sorted({l.split(' > ')[-1].split(':')[0].strip()[:40] for l in log.splitlines() if ' FAIL ' in l and ' > ' in l})
        rec = {'id': mid, 'rc': r.returncode, 'failed_rows': fails}
        print(json.dumps(rec)); res.write(json.dumps(rec) + '\n')
    finally:
        for p, t in backups.items(): open(p, 'w').write(t)
