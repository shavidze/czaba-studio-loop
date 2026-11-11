# Round 444 mutants (B round 443 planning). Usage: SCRATCH=<dir with sketch-applied store> OUT=<empty dir> python3 -I run-mutants.py
# Each mutant: copy SCRATCH/store (node_modules symlinked), apply one replacement, run the named test files, write mutant-<id>.log and one results.jsonl line.
import json, os, re, shutil, subprocess, sys
SCRATCH = os.environ['SCRATCH']; OUT = os.environ['OUT']
os.makedirs(OUT, exist_ok=True)
assert not os.listdir(OUT) or os.listdir(OUT) == [], 'OUT must start empty'
FS = 'app/lib/focus-source.ts'; LIB = 'app/components/arrangement/ArrangementLibrary.tsx'
SHEET = 'app/components/arrangement/ArrangementShortcutSheet.tsx'; HELP = 'app/components/arrangement/studio-ime-composition.ts'
T_FS = 'app/lib/__tests__/focus-source-typing.test.tsx'; T_IME = 'app/lib/arrangement/__tests__/ime-composition-stage2-ui.test.tsx'
MUTANTS = [
  ('M1-FS-COMPOSE', FS, 'if (isFocusSourceComposingKey(event) || isFocusSourceAltGraphCharacter(event)) {', 'if (isFocusSourceAltGraphCharacter(event)) {', [T_FS]),
  ('M2-FS-MODIFIER-ORDER', FS, "if (typeof event.key !== 'string') {", "if (event.ctrlKey || event.metaKey || event.altKey || typeof event.key !== 'string') {", [T_FS]),
  ('M3-FS-ALTGRAPH', FS, 'if (isFocusSourceComposingKey(event) || isFocusSourceAltGraphCharacter(event)) {', 'if (isFocusSourceComposingKey(event)) {', [T_FS]),
  ('M4-LIB-GUARD', LIB, '    if (isImeCompositionKeyDown(event)) {\n      return;\n    }\n    if (event.key === \'ArrowDown\') {', "    void isImeCompositionKeyDown;\n    if (event.key === 'ArrowDown') {", [T_IME]),
  ('M5-LIB-REPEAT', LIB, '      if (!event.repeat) {\n        setQuery(\'\');\n      }', "      setQuery('');", [T_IME]),
  ('M6-SHEET-GUARD', SHEET, '        if (isNativeImeCompositionKeyDown(event)) {\n          event.stopPropagation();\n          return;\n        }\n', '        void isNativeImeCompositionKeyDown;\n', [T_IME]),
  ('M7-SHEET-REPEAT', SHEET, '        if (event.repeat) {\n          event.stopPropagation();\n        }\n', '', [T_IME]),
  ('M8-NATIVE-229', HELP, '  return event.isComposing || event.keyCode === 229;', '  return event.isComposing;', [T_IME]),
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
    failed = sorted(set(re.findall(r'(?:FAIL|×)\s.*?\b((?:FT|IME)\d+)\b', re.sub(r'\x1b\[[0-9;]*m', '', log))))
    res.write(json.dumps({'id': mid, 'rc': r.returncode, 'failedRows': failed}) + '\n'); res.flush()
    shutil.rmtree(d)
    print(mid, r.returncode, failed)
