# PERF-15b-ii-a mutant runner (B round 412 -> 413). Usage: S=<committed scratch with the sketch applied> OUT=<dir> python3 -I run.py
# Each mutant replaces one exact string (must occur once), runs the 4 covering files, checks the expected row is red, restores.
import json, os, subprocess
S = os.environ['S']; OUT = os.environ['OUT']
os.makedirs(OUT, exist_ok=True)
MOD = 'app/lib/arrangement/precomputed-peaks.ts'
COL = 'app/lib/arrangement/collection.ts'
CTX = 'app/contexts/ArrangementContext.tsx'
META = 'scripts/peaks/demo-peaks-meta.json'
TESTS = [
    'app/lib/arrangement/__tests__/precomputed-peaks.test.ts',
    'app/lib/arrangement/__tests__/precomputed-peaks-context.test.tsx',
    'app/lib/arrangement/__tests__/collection.test.ts',
    'app/data/__tests__/studio-lab-demo.test.ts',
]
M = [
    ('MU-413-NO-STREAM-CAP', MOD, 'if (total > maxBytes) {', 'if (total > maxBytes * 4) {', 'PP10'),
    ('MU-413-NO-STREAM-CAP-LYING', MOD, 'if (total > maxBytes) {', 'if (total > maxBytes * 4) {', 'PP11'),
    ('MU-413-CAP-OFF-BY-ONE', MOD, 'if (total > maxBytes) {', 'if (total >= maxBytes) {', 'PP11'),
    ('MU-413-NO-ABORT-LISTENER', MOD, "  signal.addEventListener('abort', cancel, { once: true });\n", '', 'PP12'),
    ('MU-413-NO-ABORT-LISTENER-PP7D', MOD, "  signal.addEventListener('abort', cancel, { once: true });\n", '', 'PP7d'),
    ('MU-413-NO-PRE-ABORT', MOD, '  if (signal.aborted) {\n    cancel();\n    return null;\n  }\n', '', 'PP12b'),
    ('MU-413-NO-CALLER-ABORT-CHECK', MOD, 'if (text === null || signal.aborted) {', 'if (text === null) {', 'PP7e'),
    ('MU-413-NO-CTX-FETCHPEAKS', CTX, 'fetchPrecomputedPeaks(peaksUrl, controller.signal, collection.fetchPeaks)', 'fetchPrecomputedPeaks(peaksUrl, controller.signal)', 'PPC12'),
    ('MU-413-NO-ADAPTER-FETCHPEAKS', COL, '    fetchPeaks: fetchAudio,\n', '', 'PK2'),
    ('MU-413-ADAPTER-FETCH-STUB', COL, '    fetchPeaks: fetchAudio,\n', "    fetchPeaks: async () => new Response(null, { status: 404 }),\n", 'PK3'),
    ('MU-413-NO-ADAPTER-PEAKSURL', COL, '    peaksUrl: (source) => stemPeaksUrls.get(source.id) ?? null,\n', '', 'PK1'),
    ('MU-413-EMPTY-PEAKSURL-KEPT', COL, '  if (candidate.length === 0) {\n    return false;\n  }\n', '', 'PK4'),
    ('MU-413-PEAKSURL-LIVE-READ', COL, '    peaksUrl: (source) => stemPeaksUrls.get(source.id) ?? null,\n', '    peaksUrl: (source) => stems.find((stem) => stem.id === source.id)?.peaksUrl || null,\n', 'PK1'),
    ('MU-413-NO-ORIGIN-CHECK', COL, 'if (stem.peaksUrl !== undefined && sameOrigin(stem.peaksUrl, stem.audioUrl)) {', 'if (stem.peaksUrl !== undefined && stem.peaksUrl.length > 0) {', 'PK4'),
    ('MU-413-META-FILE-SWAPPED', META, '"file": "public/peaks/middle-east.peaks.json",', '"file": "public/peaks/hero-music.peaks.json",', 'PS18'),
]


def run(tag):
    rep = f'{OUT}/{tag}.json'
    r = subprocess.run(['npx', 'vitest', 'run', *TESTS, '--reporter=json', f'--outputFile={rep}'], cwd=S, capture_output=True, text=True)
    failed = []
    try:
        d = json.load(open(rep))
        for f in d['testResults']:
            for a in f['assertionResults']:
                if a['status'] != 'passed':
                    failed.append(a['title'].split(' ')[0])
    except Exception as e:
        failed.append(f'NO-REPORT {e}')
    open(f'{OUT}/{tag}.log', 'w').write(f'rc {r.returncode} failed {failed}\n' + r.stdout[-4000:] + r.stderr[-2000:])
    return r.returncode, failed


lines = []
rc, failed = run('PRISTINE-BEFORE'); lines.append(f'PRISTINE-BEFORE rc {rc} failed {failed}')
for mid, path, old, new, expect in M:
    fp = f'{S}/{path}'; src = open(fp).read(); n = src.count(old)
    if n != 1:
        lines.append(f'{mid} SITE-COUNT {n} (expected 1)'); continue
    open(fp, 'w').write(src.replace(old, new))
    try:
        rc, failed = run(mid)
    finally:
        open(fp, 'w').write(src)
    lines.append(f"{mid} {'RED' if expect in failed else 'SURVIVED'} rc {rc} expected {expect} failed {failed}")
rc, failed = run('PRISTINE-AFTER'); lines.append(f'PRISTINE-AFTER rc {rc} failed {failed}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
