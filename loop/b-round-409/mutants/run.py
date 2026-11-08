# PERF-15a mutant runner. Usage: S=<committed scratch with the sketch/working tree> OUT=<dir> python3 -I run.py
# Each mutant replaces one exact string (must occur once), runs the two new test files, checks the expected row is red, restores.
import json, os, subprocess, sys
S = os.environ['S']; OUT = os.environ['OUT']
os.makedirs(OUT, exist_ok=True)
MOD = 'app/lib/arrangement/precomputed-peaks.ts'
CTX = 'app/contexts/ArrangementContext.tsx'
TESTS = ['app/lib/arrangement/__tests__/precomputed-peaks.test.ts', 'app/lib/arrangement/__tests__/precomputed-peaks-context.test.tsx']
M = [
 ('MU-410-NO-SKIP', CTX, "            markReady(precomputed.peaks);\n            return;\n", "", 'PPC1'),
 ('MU-410-SKIP-8BIT', CTX, "precomputed?.bits === 16 &&", "precomputed !== undefined &&", 'PPC2'),
 ('MU-410-NO-LENGTH-CHECK', CTX, "            precomputedPeaksMatchDecodedLength(precomputed.peaks, buffer.length, buffer.sampleRate)\n", "            true\n", 'PPC3'),
 ('MU-410-LATE-OVERWRITE', CTX, "if (!precomputed || controller.signal.aborted || peaksDecided.has(source.id)) {", "if (!precomputed || controller.signal.aborted) {", 'PPC4'),
 ('MU-410-ERROR-KEEPS-PEAKS', CTX, "            dropSourcePeaks(source.id);\n", "", 'PPC5'),
 ('MU-410-NO-EARLY-STORE', CTX, "        storeSourcePeaks(source.id, precomputed.peaks);\n", "", 'PPC1'),
 ('MU-410-FIRST-CHANNEL-ONLY', MOD, "offset < (pixel + 1) * channels * 2;", "offset < pixel * channels * 2 + 2;", 'PP1'),
 ('MU-410-MAX-ONLY', MOD, "      max = Math.max(max, Math.abs(value));", "      max = offset % 2 === 1 ? Math.max(max, value) : max;", 'PP2'),
 ('MU-410-COARSE-ACCEPTED', MOD, "    samplesPerPixel > sampleRate / PEAK_BUCKETS_PER_SECOND ||\n", "", 'PP5'),
 ('MU-410-POOL-FIRST-PIXEL', MOD, "      max = Math.max(max, pixels[pixel]);", "      max = max === 0 ? pixels[pixel] : max;", 'PP3'),
 ('MU-410-NO-SIZE-CAP', MOD, "!(declaredBytes <= PRECOMPUTED_PEAKS_MAX_BYTES)", "false", 'PP7c'),
 ('MU-410-NO-SIGNAL', MOD, "await fetchPeaks(url, { signal });", "await fetchPeaks(url, {});", 'PP7a'),
 ('MU-410-TOLERANCE-ANY', MOD, "<= PRECOMPUTED_PEAKS_BUCKET_TOLERANCE", "<= 2", 'PP6'),
 ('MU-410-ERROR-NOT-DECIDED', CTX, "          peaksDecided.add(source.id);\n          if (precomputedPeaks.delete(source.id)) {", "          if (precomputedPeaks.delete(source.id)) {", 'PPC9'),
 ('MU-410-SWAP-KEEPS-EARLY', CTX, "          dropSourcePeaks(id);\n", "", 'PPC10'),
 ('MU-410-READY-NOT-MARKED', CTX, "            peaksReady.add(source.id);\n", "", 'PPC11'),
 ('MU-410-ABORT-IGNORED', MOD, "return signal.aborted ? null : parseAudiowaveformPeaks(data);", "return parseAudiowaveformPeaks(data);", 'PP7d'),
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
