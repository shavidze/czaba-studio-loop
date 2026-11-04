#!/usr/bin/env python3
"""Run the round-331 (stage c2a) mutants on a SCRATCH copy that already has the sketch applied.
Usage: python3 -I run-mutants.py <scratch-dir>   (never point it at store/)"""
import json, pathlib, re, subprocess, sys
root = pathlib.Path(sys.argv[1]).resolve()
if root.name == 'store':
    sys.exit('refusing to mutate store/')
SW = 'app/components/arrangement/StudioWorkspace.tsx'
PS = 'app/lib/arrangement/preview-store.ts'
DPANEL = 'app/components/arrangement/ArrangementDetailPanel.tsx'
TESTS = ['app/lib/arrangement/__tests__/drag-preview-render.test.tsx',
         'app/lib/arrangement/__tests__/preview-store.test.ts']
MUTANTS = [
  ('MU-DETAIL-SHALLOW', SW, '      sameSelectedClipsShownFields,\n',
   '      (a, b) => a.length === b.length && a.every((clip, index) => clip === b[index]),\n'),
  ('MU-READOUT-IDENTITY', SW, '      sameSelectedClipShownFields,\n', '      (a, b) => a === b,\n'),
  ('MU-READOUT-HINT-SELECTS', SW, 'clipLaneDrag ? null : primaryClipId', 'primaryClipId'),
  ('MU-EQUAL-IGNORES-START', PS, '    a.start === b.start &&\n', ''),
  ('MU-ROLE-GAIN-IGNORED', PS, "  gainDb: 'shown',\n", "  gainDb: 'ignored',\n"),
  ('MU-DETAIL-SHOWS-FADE', DPANEL,
   '{formatArrangementTime(selection.clip.sourceOffset)}',
   '{formatArrangementTime(selection.clip.sourceOffset)}{selection.clip.fadeIn ?? 0}'),
  ('MU-DETAIL-FADE-ATTR', DPANEL,
   '      data-testid="arrangement-detail-waveform"\n',
   '      data-testid="arrangement-detail-waveform"\n      data-fade-in={clip.fadeIn ?? 0}\n'),
]
import hashlib
files = sorted({m[1] for m in MUTANTS})
before = {f: hashlib.sha256((root / f).read_bytes()).hexdigest() for f in files}
results = []
for mid, rel, old, new in MUTANTS:
    path = root / rel
    original = path.read_text()
    if original.count(old) != 1:
        results.append({'mutant': mid, 'error': f'anchor count {original.count(old)}'})
        continue
    path.write_text(original.replace(old, new, 1))
    try:
        out = subprocess.run(['npx', 'vitest', 'run', *TESTS, '--reporter=json'], cwd=root,
                             capture_output=True, text=True, timeout=900).stdout
        start = out.find('{')
        data = json.loads(out[start:]) if start >= 0 else {}
        red = sorted({re.match(r'(\S+)', a['title']).group(1)
                      for f in data.get('testResults', []) for a in f.get('assertionResults', [])
                      if a.get('status') == 'failed'})
        results.append({'mutant': mid, 'red': red, 'killed': bool(red)})
    finally:
        path.write_text(original)
    print(json.dumps(results[-1]), flush=True)
after = {f: hashlib.sha256((root / f).read_bytes()).hexdigest() for f in files}
print(json.dumps({'restored': before == after, 'all_killed': all(r.get('killed') for r in results)}))
