#!/usr/bin/env python3
"""Run the round-332 (stage c2b-i) mutants on a SCRATCH copy that already has the sketch applied.
Usage: python3 -I run-mutants.py <scratch-dir>   (never point it at store/)"""
import hashlib, json, pathlib, re, subprocess, sys
root = pathlib.Path(sys.argv[1]).resolve()
if root.name == 'store':
    sys.exit('refusing to mutate store/')
SW = 'app/components/arrangement/StudioWorkspace.tsx'
PS = 'app/lib/arrangement/preview-store.ts'
METER = 'app/components/arrangement/ArrangementTrackMeter.tsx'
TESTS = ['app/lib/arrangement/__tests__/drag-preview-render.test.tsx',
         'app/lib/arrangement/__tests__/preview-store.test.ts',
         'app/lib/arrangement/__tests__/track-meter-ui.test.tsx']
MUTANTS = [
  ('MU-OVR-IDENTITY', SW, '      sameOverviewArrangementShownFields,\n', '      (a, b) => a === b,\n'),
  ('MU-OVR-IGNORES-START', PS,
   '    (a.id === b.id && a.trackId === b.trackId && a.start === b.start && a.duration === b.duration)\n',
   '    (a.id === b.id && a.trackId === b.trackId && a.duration === b.duration)\n'),
  ('MU-OVR-IGNORES-COUNT', PS, '      a.clips.length === b.clips.length &&\n', ''),
  ('MU-OVR-IGNORES-TRACKS', PS, '    (a.tracks === b.tracks &&\n', '    (\n'),
  ('MU-OVR-ROLE-SOURCE-SHOWN', PS, "  sourceId: 'ignored',\n  start: 'shown',\n", "  sourceId: 'shown',\n  start: 'shown',\n"),
  ('MU-METER-NO-MEMO', METER, 'export const ArrangementTrackMeter = memo(ArrangementTrackMeterInner);',
   'export const ArrangementTrackMeter = ArrangementTrackMeterInner;'),
]
files = sorted({m[1] for m in MUTANTS})
before = {f: hashlib.sha256((root / f).read_bytes()).hexdigest() for f in files}
results = []
for mid, rel, old, new in MUTANTS:
    path = root / rel
    original = path.read_text()
    if original.count(old) != 1:
        results.append({'mutant': mid, 'error': f'anchor count {original.count(old)}'})
        print(json.dumps(results[-1]), flush=True)
        continue
    path.write_text(original.replace(old, new, 1))
    try:
        out = subprocess.run(['npx', 'vitest', 'run', *TESTS, '--reporter=json'], cwd=root,
                             capture_output=True, text=True, timeout=1200).stdout
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
