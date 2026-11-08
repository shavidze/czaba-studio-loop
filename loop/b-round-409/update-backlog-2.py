# B round 409 -> 410 planning, part 2: backlog v384 -> v385 (round 410 = PERF-15a dispatch). Not re-runnable.
import json, os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-409/update-backlog-2.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/backlog.json'
b = json.load(open(p))
assert b['version'] == 384, b['version']
BY = '2026-11-08 B round 409 -> 410 planning'
def pre(o, text):
    o['status'] = text + ' | ' + o.get('status', '')
dec = [
 ('D-29z1423', "PERF-15a contract (current-task.md D-29z1423): new pure module app/lib/arrangement/precomputed-peaks.ts (parseAudiowaveformPeaks: BBC audiowaveform JSON v1/v2, bits 8|16, interleaved min/max per channel, max over channels of max(|min|,|max|)/128|32768 clamped, max-pooled onto 100 buckets/s with peakBucketCount, null for anything malformed or coarser than 100/s; precomputedPeaksMatchDecodedLength within 1 bucket; fetchPrecomputedPeaks never throws, 4 MiB declared-size cap as defence in depth, passes the signal); optional WorkspaceCollection.peaksUrl; collection-load wiring: parallel fetch, early store while loading, skip the worker only for 16-bit + matching length, 8-bit is a placeholder, decoded peaks always win, late arrival ignored, decode error drops early peaks, swap/unmount cleanup drops early peaks of sources never ready, a ready source keeps its peaks (HEAD behaviour). No collection sets peaksUrl yet, so /studio-lab is unchanged. Premise measured at HEAD: library preview draws sourcePeaks in any load state (dimmed opacity-40 while loading); lanes need ready (sourceDurations ready-only), so 'waveform visible before decode' = the library preview only; re-decode never recomputes peaks. No status write, focus change or visible change."),
 ('D-29z1424', "PERF-15 split: PERF-15a (round 410: parser + optional peaksUrl + fallback wiring, jsdom rows + browser no-regression rows) and PERF-15b (next: the demo's URL-backed sources get a peaksUrl and a real-browser 'waveform before ready' row with page.route stubs (peaks JSON immediate, audio held; 16-bit matched = 0 worker jobs, 8-bit = 1, 404 negative row), purchased adapter peaksUrl input, product-designer consult on the dimmed loading waveform, PERF-15 closes). 15a's unit PASS does not make PERF-15 done. Backend half = handoff note docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md (B-owned; audiowaveform as an external process, -b 16 --split-channels, spp = sample_rate/100, same decoded asset or WAV master, versioned and protected peaksUrl for purchased files); real backend checks stay BLOCKED in the cloud."),
 ('D-29z1425', "PERF-15a consults: performance-optimizer (b-round-409/consult-performance-optimizer.md: reject coarser than 100/s, skip the worker only for 16-bit matched, 4 MiB cap, main-thread parse acceptable, PP4 fixture row, stage-b row design). tech-lead on sketch v1 ac774c3c: APPROVE WITH LOWS (SK-1..7); SK-2 and SK-4 fixed in v2 (swap cleanup, PPC9-PPC11), SK-1/5/6 into the docs, SK-3 deferred Low (fix with previewUrl), SK-7 info. tech-lead delta re-review on v2 8f22c005: APPROVE WITH LOWS, new SK-8 (equivalent-mutant record) fixed in b-round-409/mutants/equivalent.txt. No Medium or higher open on the dispatched sha."),
 ('D-29z1426', "Round 410 dispatched: PERF-15a from B's reviewed sketch b-round-409/sketch-410.patch.txt (v2, sha 8f22c005447dc388; 5 files; git apply --check clean on 9616d3a). Evidence on the committed scratch: tsc/Biome/lint rc 0; full vitest 264 files 3906/3906 rc 0; covering 16 files 274/274 (slowest 2715 ms in a 15000 ms describe, 18 %); mutants 17/17 red, pristine rc 0 before/after; browser no-regression probe (peaks-probe-410) and round-409 lane probe ok on HEAD and on the v2 sketch at both viewports (9 sources x 96 preview columns, 0 peaks requests, 0 page errors; lane 8/8). Grants b-round-409/grants-410.txt (5 patch files + new doc 263), frozen 1301, protected 11 unchanged; claims b-round-409/claims-410.sh. Doc 263 l.4 'In Progress (stage 1 of 2; C round 410 PASS)'. ARCH-CHECKPOINT-PERF11C-III-BOUNDARY still non-blocking. Order after 410: PERF-15b -> SYS-R2-FAKE-FIDELITY + SYS-R388 -> SYS-CLOCK-DETERMINISM -> SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10. RETRO at 416."),
]
for did, text in dec:
    b['decisions_log_b'].append({'id': did, 'date': '2026-11-08', 'by': BY, 'decision': text})
q = [e for e in b['post_current_stage_queue'] if e['id'] == 'STUDIO-PERFORMANCE'][0]
pre(q, 'in_progress (D-29z1426): PERF-11c done (409, 9616d3a); round 410 = PERF-15a (precomputed peaks loader, stage 1 of 2); then PERF-15b')
q['execution_order_d29z1426'] = "round 410 PERF-15a -> PERF-15b -> SYS-R2-FAKE-FIDELITY + SYS-R388 -> SYS-CLOCK-DETERMINISM -> SYS-R369 -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase 2 (skip rule). REGRESSION-2026-11-10 first at the first planning on/after 2026-11-10. RETRO at 416."
st = {x.get('id'): x for x in q['stages']}
pre(st['PERF-15'], 'in_progress (D-29z1424): split 15a (round 410) / 15b; limit: before-decode waveform = library preview only (lanes need ready); backend half = handoff note')
i = q['stages'].index(st['PERF-15'])
q['stages'][i+1:i+1] = [
 {'id': 'PERF-15a', 'what': 'precomputed audiowaveform peaks: parser + optional WorkspaceCollection.peaksUrl + collection-load fallback wiring (skip worker only for 16-bit matched; decoded wins; error and swap cleanup); jsdom PP1-PP7, PPC1-PPC11; browser no-regression rows', 'status': 'dispatched (D-29z1426): round 410, b-round-409/sketch-410.patch.txt sha 8f22c005447dc388', 'added': BY},
 {'id': 'PERF-15b', 'what': "demo URL-backed sources get peaksUrl; real-browser 'waveform before ready' row with page.route stubs (peaks immediate, audio held; 16-bit matched 0 worker jobs, 8-bit 1; 404 negative); purchased adapter peaksUrl input; product-designer consult on the dimmed loading waveform; closes PERF-15 (backend half stays a handoff)", 'status': 'not_started (D-29z1424): after 15a C PASS; needs reference-first section N/A ruling (perf) but the loading-waveform look is user-visible -> product-designer consult', 'added': BY},
]
b['deferred_low_polish'].append({'id': 'TL-R410-SK-3', 'severity': 'low', 'origin': 'B pre-check (tech-lead sketch review)', 'evidence': 'b-round-409/sketch-review.md', 'title': 'collection.peaksUrl?.(source) is called without a guard (as previewUrl at HEAD); a throwing adapter would stop the load effect before loadSource', 'status': 'deferred_low_polish (D-29z1425)', 'added': BY, 'fix_home': 'one small round fixing peaksUrl and previewUrl together'})
b['rounds'].append({'round': 410, 'task': 'current-task.md', 'decision': 'D-29z1421..D-29z1426', 'type': 'PERF-15a (precomputed audiowaveform peaks: parser, optional peaksUrl, worker fallback; stage 1 of 2; behaviour-neutral for /studio-lab)', 'status': 'dispatched', 'note': 'baseline 9616d3a clean; frozen b-round-409/r410-frozen-sha256.txt (1301); grants b-round-409/grants-410.txt (6); patch b-round-409/sketch-410.patch.txt sha 8f22c005447dc388; claims b-round-409/claims-410.sh', 'added': BY})
b['current_task'] = 'Round 410: PERF-15a from B reviewed sketch b-round-409/sketch-410.patch.txt (current-task.md)'
b['version'] = 385
b['updated'] = BY
json.dump(b, open(p, 'w'), ensure_ascii=False, indent=2)
open(done, 'w').write('applied v384 -> v385\n')
print('ok v385')
