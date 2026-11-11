# Round 445 mutants (B round 444 planning, SYS-3 stage 2b; sketch v2). Usage: SCRATCH=<dir with sketch-applied store/> OUT=<empty dir> python3 -I run-mutants.py [ids]
# Each mutant: copy SCRATCH/store (node_modules symlinked), apply one replacement (must match exactly once), run the named test files,
# write mutant-<id>.log and one results.jsonl line {id, rc, failedRows}. failedRows = sorted row ids (IME*, FV-HELD) in failing test names.
import json, os, re, shutil, subprocess, sys
SCRATCH = os.environ['SCRATCH']; OUT = os.environ['OUT']
os.makedirs(OUT, exist_ok=True)
assert os.listdir(OUT) == [], 'OUT must start empty'
A = 'app/components/arrangement/'
TEMPO = A + 'ArrangementTempoRow.tsx'; MARKER = A + 'ArrangementMarkerRow.tsx'; GROUP = A + 'ArrangementGroupHeader.tsx'
DETAIL = A + 'ArrangementDetailPanel.tsx'; WS = A + 'StudioWorkspace.tsx'; HELP = A + 'studio-ime-composition.ts'
T = 'app/lib/arrangement/__tests__/'
T_S1 = T + 'ime-composition-ui.test.tsx'; T_2B = T + 'ime-composition-stage2b-ui.test.tsx'
T_SCAN = T + 'ime-composition-source-scan.test.ts'; T_FV = T + 'floating-video.test.tsx'
ALL_IME = [T_S1, T_2B, T_SCAN]
TEMPO_HELD = "    event.preventDefault();\n    if (intent === 'held') {\n      return;\n    }\n    if (event.key === 'Escape') {\n      skipCommitRef.current = true;"
GAIN_HELD = "    event.preventDefault();\n    if (intent === 'held') {\n      return;\n    }\n    if (event.key === 'Enter') {\n      commitClipGain('enter');"
MUTANTS = [
  ('M1-TEMPO-HELD', TEMPO, TEMPO_HELD, "    event.preventDefault();\n    if (event.key === 'Escape') {\n      skipCommitRef.current = true;", ALL_IME),
  ('M2-TEMPO-COMPOSE', TEMPO, "    if (intent === 'other' || intent === 'composing') {\n      return;\n    }\n    event.preventDefault();\n    if (intent === 'held') {\n      return;\n    }\n    if (event.key === 'Escape') {",
   "    if (intent === 'other') {\n      return;\n    }\n    event.preventDefault();\n    if (intent === 'held') {\n      return;\n    }\n    if (event.key === 'Escape') {", ALL_IME),
  ('M3-MARKER-STOP', MARKER, "              event.stopPropagation();\n              if (intent === 'composing') {", "              if (intent === 'composing') {", ALL_IME),
  ('M4-GROUP-HELD', GROUP, "              if (intent === 'settle') {", "              if (intent !== 'other') {", ALL_IME),
  ('M5-RANGE-HELD', DETAIL, "    event.preventDefault();\n    if (intent === 'settle') {\n      applyDetailRange();", "    event.preventDefault();\n    if (intent !== 'other') {\n      applyDetailRange();", ALL_IME),
  ('M6-GAIN-HELD', DETAIL, GAIN_HELD, "    event.preventDefault();\n    if (event.key === 'Enter') {\n      commitClipGain('enter');", ALL_IME),
  ('M7-GAIN-REVERT-VALUE', DETAIL, '      setClipGainText(displayedClipGainText);\n    }\n  });', "      setClipGainText('');\n    }\n  });", ALL_IME),
  ('M8-HELPER-REPEAT-FIRST', HELP, "  if (isImeCompositionKeyDown(event)) {\n    return 'composing';\n  }\n  return event.repeat ? 'held' : 'settle';",
   "  if (event.repeat) {\n    return 'held';\n  }\n  if (isImeCompositionKeyDown(event)) {\n    return 'composing';\n  }\n  return 'settle';", ALL_IME),
  ('M9-HELPER-KEYS', HELP, '  if (!settleKeys.some((settleKey) => settleKey === event.key)) {', "  if (event.key === 'Tab') {", ALL_IME),
  ('M10-VIDEO-HELD', WS, '        if (!event.repeat) {\n          returnFloatingVideo();\n        }', '        returnFloatingVideo();', [T_FV]),
  ('M11-SCAN-INLINE-COMPOSING', TEMPO, '  const handleTempoKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {\n',
   '  const handleTempoKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {\n    if (event.nativeEvent.isComposing) {\n      return;\n    }\n', [T_SCAN]),
  ('M12-SCAN-INTENT-BYPASS', GROUP, '              const intent = inlineEditorKeyIntent(event, INLINE_EDITOR_SETTLE_KEYS);',
   "              const intent = event.key === 'Enter' || event.key === 'Escape' ? (event.repeat ? 'held' : 'settle') : 'other';\n              void inlineEditorKeyIntent;", [T_SCAN]),
]
only = sys.argv[1].split(',') if len(sys.argv) > 1 else None
res = open(os.path.join(OUT, 'results.jsonl'), 'a')
for mid, path, old, new, tests in MUTANTS:
    if only and mid not in only: continue
    d = os.path.join(OUT, 'work-' + mid); src = os.path.join(SCRATCH, 'store')
    shutil.copytree(src, d, ignore=shutil.ignore_patterns('node_modules', '.git'), symlinks=True)
    os.symlink('/home/runner/czaba-project/store/node_modules', os.path.join(d, 'node_modules'))
    p = os.path.join(d, path); s = open(p).read(); assert s.count(old) == 1, (mid, s.count(old)); open(p, 'w').write(s.replace(old, new))
    r = subprocess.run(['npx', 'vitest', 'run', *tests], cwd=d, capture_output=True, text=True, timeout=900)
    log = r.stdout + r.stderr; open(os.path.join(OUT, f'mutant-{mid}.log'), 'w').write(log)
    failed = sorted(set(re.findall(r'(?:FAIL|×)\s.*?\b(IME\d+|FV-HELD)\b', re.sub(r'\x1b\[[0-9;]*m', '', log))))
    res.write(json.dumps({'id': mid, 'rc': r.returncode, 'failedRows': failed}) + '\n'); res.flush()
    shutil.rmtree(d)
    print(mid, r.returncode, failed)
