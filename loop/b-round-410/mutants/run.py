# PERF-15b-i mutant runner (B round 410 -> 411). Usage: S=<committed scratch with the sketch/working tree> OUT=<dir> python3 -I run.py
# Each mutant replaces one exact string (must occur once), runs the two new test files, checks the expected row is red, restores.
import json, os, subprocess, sys
S = os.environ['S']; OUT = os.environ['OUT']
os.makedirs(OUT, exist_ok=True)
MOD = 'app/lib/arrangement/precomputed-peaks.ts'
DEMO = 'app/data/studio-lab-demo.ts'
ME = 'public/peaks/middle-east.peaks.json'
PRE = 'app/components/arrangement/ArrangementLibraryPreview.tsx'
TESTS = ['app/lib/arrangement/__tests__/precomputed-peaks.test.ts', 'app/data/__tests__/studio-lab-demo.test.ts', 'app/lib/arrangement/__tests__/library-preview.test.tsx']
M = [
 ('MU-411-NO-DEMO-PEAKS', DEMO, "  peaksUrl: (source) => (Object.hasOwn(demoPeaksUrls, source.id) ? demoPeaksUrls[source.id] : null),\n", "", 'PS16'),
 ('MU-411-SWAPPED-PEAKS', DEMO, "  'demo-middle-east': '/peaks/middle-east.peaks.json',\n  'demo-hero-music': '/peaks/hero-music.peaks.json',", "  'demo-middle-east': '/peaks/hero-music.peaks.json',\n  'demo-hero-music': '/peaks/middle-east.peaks.json',", 'PS16'),
 ('MU-411-CREDENTIALS-DEFAULT', MOD, "await fetchPeaks(url, { credentials: 'omit', signal });", "await fetchPeaks(url, { signal });", 'PP8'),
 ('MU-411-NO-CANCEL', MOD, "      void response.body?.cancel().catch(() => undefined);\n", "", 'PP9'),
 ('MU-411-FIXTURE-8BIT', ME, '"bits":16', '"bits":8', 'PS17'),
 ('MU-411-FIXTURE-WRONG-SPP', ME, '"samples_per_pixel":441', '"samples_per_pixel":400', 'PS17'),
 ('MU-411-MP3-SIZE-UNTIED', 'scripts/peaks/demo-peaks-meta.json', '"mp3Bytes": 4054080,', '"mp3Bytes": 4054081,', 'PS17'),
 ('MU-411-META-LENGTH-DRIFT', 'scripts/peaks/demo-peaks-meta.json', '"decodedLength": 6631424,', '"decodedLength": 6531424,', 'PS17'),
 ('MU-411-NO-STRIP-TITLE', PRE, "        aria-label={studioLibraryPanelStrings.previewWaveLabel}\n        title={previewUnavailableTitle ?? undefined}\n", "        aria-label={studioLibraryPanelStrings.previewWaveLabel}\n", 'LPA3b'),
 ('MU-411-STRIP-TITLE-WHEN-READY', PRE, "        aria-label={studioLibraryPanelStrings.previewWaveLabel}\n        title={previewUnavailableTitle ?? undefined}\n", "        aria-label={studioLibraryPanelStrings.previewWaveLabel}\n        title={previewUnavailableTitle ?? studioLibraryPanelStrings.previewLoadingTitle}\n", 'LPA3b'),
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
    return r.returncode, failed
lines = []
rc, failed = run('PRISTINE-BEFORE'); lines.append(f'PRISTINE-BEFORE rc {rc} failed {failed}')
for mid, path, old, new, expect in M:
    fp = f'{S}/{path}'; src = open(fp).read()
    n = src.count(old)
    if n != 1:
        lines.append(f'{mid} SITE-COUNT {n} (expected 1)'); continue
    open(fp, 'w').write(src.replace(old, new))
    try:
        rc, failed = run(mid)
    finally:
        open(fp, 'w').write(src)
    ok = expect in failed
    lines.append(f"{mid} {'RED' if ok else 'SURVIVED'} rc {rc} expected {expect} failed {failed}")
rc, failed = run('PRISTINE-AFTER'); lines.append(f'PRISTINE-AFTER rc {rc} failed {failed}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
