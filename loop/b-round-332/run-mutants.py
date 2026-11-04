import subprocess, sys, re, hashlib, json, os
S = sys.argv[1] if len(sys.argv) > 1 else '/home/runner/b332-scratch/sc'
P = 'app/components/arrangement/ArrangementDetailPanel.tsx'
T = 'app/lib/arrangement/__tests__/drag-preview-render.test.tsx'
MUTANTS = [
  ('MU-DTXT-EFFECT-BACK', None, None),
  ('MU-DTXT-IGNORES-START', '    Object.is(synced.clipStart, next.clipStart) &&\n', ''),
  ('MU-DTXT-IGNORES-DURATION', '    Object.is(synced.clipStart, next.clipStart) &&\n    Object.is(synced.clipDuration, next.clipDuration)\n', '    Object.is(synced.clipStart, next.clipStart)\n'),
  ('MU-DTXT-IGNORES-ONCLIP', '    Object.is(synced.onClipStart, next.onClipStart) &&\n    Object.is(synced.onClipEnd, next.onClipEnd) &&\n', ''),
  ('MU-DTXT-MOUNT-ONLY', '  if (!isSameDetailRangeTextSource(syncedRangeTextSource, rangeTextSource)) {', '  if (syncedRangeTextSource === null) {'),
  ('MU-DTXT-KEYS-ON-GAIN', '    clipStart,\n    clipDuration,\n  };', '    clipStart,\n    clipDuration: clipDuration === undefined ? undefined : clipDuration + (clipGainDb ?? 0),\n  };'),
]
path = os.path.join(S, P)
orig = open(path, 'rb').read()
sha = hashlib.sha256(orig).hexdigest()
head = subprocess.run(['git', 'show', 'HEAD:' + P], cwd=S, capture_output=True).stdout
out = []
for mid, old, new in MUTANTS:
    text = orig.decode()
    if old is None:
        mutated = head
    else:
        if text.count(old) != 1:
            out.append({'id': mid, 'error': 'anchor count %d' % text.count(old)}); continue
        mutated = text.replace(old, new).encode()
    open(path, 'wb').write(mutated)
    r = subprocess.run(['npx', 'vitest', 'run', T, '--reporter=verbose'], cwd=S, capture_output=True, text=True)
    red = sorted(set(re.findall(r'(?:×|✗|FAIL).*?(DP\d+[a-z]?)\b', r.stdout + r.stderr)))
    open(path, 'wb').write(orig)
    out.append({'id': mid, 'rc': r.returncode, 'red': red, 'restored': hashlib.sha256(open(path, 'rb').read()).hexdigest() == sha})
for o in out:
    print(json.dumps(o))
