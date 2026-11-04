import subprocess, sys, re, hashlib, json, os
S = sys.argv[1] if len(sys.argv) > 1 else '/home/runner/b333-scratch/sc'
CL = 'app/components/arrangement/ArrangementClip.tsx'
DPN = 'app/components/arrangement/ArrangementDetailPanel.tsx'
WZ = 'app/lib/arrangement/waveform-zoom.ts'
MO = 'app/lib/arrangement/model.ts'
TESTS = ['app/lib/arrangement/__tests__/' + t for t in [
  'drag-preview-render.test.tsx', 'clip-gain-pointer-preview.test.tsx', 'clip-gain-waveform.test.tsx',
  'clip-gain.test.tsx', 'waveform-zoom.test.tsx', 'waveform-window-ui.test.tsx',
  'detail-panel-polish.test.tsx', 'detail-panel-reason.test.tsx', 'content-colour-ui.test.tsx']]
MUTANTS = [
  ('MU-PEAK-CLIP-PROP-BACK', 'HEAD', None, None),
  ('MU-PEAK-NO-MEMO', CL, 'export const ArrangementPeakPath = memo(ArrangementPeakPathInner);', 'export const ArrangementPeakPath = ArrangementPeakPathInner;'),
  ('MU-PEAK-LANE-GAIN-DROPPED', CL, '            gainDb={clip.gainDb}\n            peaks={peaks}', '            gainDb={undefined}\n            peaks={peaks}'),
  ('MU-PEAK-DETAIL-GAIN-DROPPED', DPN, '          gainDb={clip.gainDb}\n', '          gainDb={undefined}\n'),
  ('MU-PEAK-DRAFT-IGNORED', CL, 'waveformScaleForGainDb(draftGainDb ?? gainDb, isVideo, zoom)', 'waveformScaleForGainDb(gainDb, isVideo, zoom)'),
  ('MU-PEAK-COMMITTED-WINS', CL, 'waveformScaleForGainDb(draftGainDb ?? gainDb, isVideo, zoom)', 'waveformScaleForGainDb(gainDb ?? draftGainDb, isVideo, zoom)'),
  ('MU-PEAK-LANE-OFFSET-ZERO', CL, '            sourceOffset={clip.sourceOffset}\n', '            sourceOffset={0}\n'),
  ('MU-PEAK-DETAIL-OFFSET-ZERO', DPN, '          sourceOffset={clip.sourceOffset}\n', '          sourceOffset={0}\n'),
  ('MU-PEAK-MEMO-DEPS-STALE', CL, '    [peaks, sourceOffset, duration, columns, scale],', '    [peaks, columns, scale],'),
]
files = [CL, DPN, WZ, MO]
orig = {f: open(os.path.join(S, f), 'rb').read() for f in files}
sha = {f: hashlib.sha256(b).hexdigest() for f, b in orig.items()}
def restore():
    for f, b in orig.items(): open(os.path.join(S, f), 'wb').write(b)
out = []
for mid, f, old, new in MUTANTS:
    if f == 'HEAD':
        for g in files:
            open(os.path.join(S, g), 'wb').write(subprocess.run(['git', 'show', 'HEAD:' + g], cwd=S, capture_output=True).stdout)
    else:
        text = orig[f].decode()
        if text.count(old) != 1:
            out.append({'id': mid, 'error': 'anchor count %d' % text.count(old)}); continue
        open(os.path.join(S, f), 'wb').write(text.replace(old, new).encode())
    r = subprocess.run(['npx', 'vitest', 'run', *TESTS], cwd=S, capture_output=True, text=True)
    txt = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    red = sorted(set(re.findall(r'(?:×|FAIL ).*?> ([A-Z]{2,4}\d+[a-z]?)\b[ :]', txt)))
    restore()
    ok = all(hashlib.sha256(open(os.path.join(S, g), 'rb').read()).hexdigest() == sha[g] for g in files)
    out.append({'id': mid, 'rc': r.returncode, 'red': red, 'restored': ok})
    print(json.dumps(out[-1]), flush=True)
