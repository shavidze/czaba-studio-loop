# PERF-15b-i v6 mutant runner (B round 411 -> 412). Usage: S=<committed scratch with v6 applied> OUT=<dir> FIX=<b-round-411/fixtures/regen-48k> [TESTV=<alt PS17 test file to swap in>] python3 -I run.py
# String mutants replace one exact string (must occur once); file mutants copy fixture files over the tree; each runs the 3 covering files, checks the expected row is red, restores.
import json, os, shutil, subprocess
S = os.environ['S']; OUT = os.environ['OUT']; FIX = os.environ['FIX']; TESTV = os.environ.get('TESTV')
os.makedirs(OUT, exist_ok=True)
MOD = 'app/lib/arrangement/precomputed-peaks.ts'
DEMO = 'app/data/studio-lab-demo.ts'
ME = 'public/peaks/middle-east.peaks.json'
META = 'scripts/peaks/demo-peaks-meta.json'
PRE = 'app/components/arrangement/ArrangementLibraryPreview.tsx'
PS = 'app/data/__tests__/studio-lab-demo.test.ts'
TESTS = ['app/lib/arrangement/__tests__/precomputed-peaks.test.ts', PS, 'app/lib/arrangement/__tests__/library-preview.test.tsx']
M = [
 ('MU-411-NO-DEMO-PEAKS', DEMO, "  peaksUrl: (source) => (Object.hasOwn(demoPeaksUrls, source.id) ? demoPeaksUrls[source.id] : null),\n", "", 'PS16'),
 ('MU-411-SWAPPED-PEAKS', DEMO, "  'demo-middle-east': '/peaks/middle-east.peaks.json',\n  'demo-hero-music': '/peaks/hero-music.peaks.json',", "  'demo-middle-east': '/peaks/hero-music.peaks.json',\n  'demo-hero-music': '/peaks/middle-east.peaks.json',", 'PS16'),
 ('MU-411-CREDENTIALS-DEFAULT', MOD, "await fetchPeaks(url, { credentials: 'omit', signal });", "await fetchPeaks(url, { signal });", 'PP8'),
 ('MU-411-NO-CANCEL', MOD, "      void response.body?.cancel().catch(() => undefined);\n", "", 'PP9'),
 ('MU-411-FIXTURE-8BIT', ME, '"bits":16', '"bits":8', 'PS17'),
 ('MU-411-FIXTURE-WRONG-SPP', ME, '"samples_per_pixel":441', '"samples_per_pixel":400', 'PS17'),
 ('MU-411-MP3-SIZE-UNTIED', META, '"mp3Bytes": 4054080,', '"mp3Bytes": 4054081,', 'PS17'),
 ('MU-411-META-LENGTH-DRIFT', META, '"decodedLength": 6631424,', '"decodedLength": 6531424,', 'PS17'),
 ('MU-411-NO-STRIP-TITLE', PRE, "        aria-label={studioLibraryPanelStrings.previewWaveLabel}\n        title={previewUnavailableTitle ?? undefined}\n", "        aria-label={studioLibraryPanelStrings.previewWaveLabel}\n", 'LPA3b'),
 ('MU-411-STRIP-TITLE-WHEN-READY', PRE, "        aria-label={studioLibraryPanelStrings.previewWaveLabel}\n        title={previewUnavailableTitle ?? undefined}\n", "        aria-label={studioLibraryPanelStrings.previewWaveLabel}\n        title={previewUnavailableTitle ?? studioLibraryPanelStrings.previewLoadingTitle}\n", 'LPA3b'),
 ('MU-412-META-RATE-48K', META, '"decodedLength": 4469623,\n    "sampleRate": 44100,', '"decodedLength": 4469623,\n    "sampleRate": 48000,', 'PS17'),
 ('MU-412-HEADER-RATE-48K', ME, '"sample_rate":44100,"samples_per_pixel":441', '"sample_rate":48000,"samples_per_pixel":480', 'PS17'),
]
FILE_M = [('MU-412-REGEN-48K', {'public/peaks/middle-east.peaks.json': 'middle-east.peaks.json', 'public/peaks/hero-music.peaks.json': 'hero-music.peaks.json', META: 'demo-peaks-meta.json'}, 'PS17')]
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
saved_test = None
if TESTV:
    saved_test = open(f'{S}/{PS}').read(); shutil.copy(TESTV, f'{S}/{PS}')
lines = [f'TEST-VARIANT {TESTV or "v6 (tree)"}']
try:
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
    for mid, files, expect in FILE_M:
        saved = {p: open(f'{S}/{p}').read() for p in files}
        for p, fx in files.items():
            shutil.copy(f'{FIX}/{fx}', f'{S}/{p}')
        try:
            rc, failed = run(mid)
        finally:
            for p, t in saved.items():
                open(f'{S}/{p}', 'w').write(t)
        lines.append(f"{mid} {'RED' if expect in failed else 'SURVIVED'} rc {rc} expected {expect} failed {failed}")
    rc, failed = run('PRISTINE-AFTER'); lines.append(f'PRISTINE-AFTER rc {rc} failed {failed}')
finally:
    if saved_test is not None:
        open(f'{S}/{PS}', 'w').write(saved_test)
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
