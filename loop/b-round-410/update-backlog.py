import json, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
BY='2026-11-08 B round 410 -> 411 planning'
def find_stage(sid):
    for q in b['post_current_stage_queue']:
        for st in q.get('stages',[]) or []:
            if st.get('id')==sid: return q, st
    return None, None
q, st15 = find_stage('PERF-15')
_, st15a = find_stage('PERF-15a')
_, st15b = find_stage('PERF-15b')
assert q and st15 and st15a and st15b and q['id']=='STUDIO-PERFORMANCE'
if 'D-29z1431' in json.dumps(b['decisions_log_b']):
    print('already applied'); sys.exit(0)
st15a['status']='done (D-29z1431): C round 410 PASS (browserVerified/realVerified true, 0 bugs, c-round-410.json); gate 410 published 328db74 | '+st15a['status']
st15['status']='in_progress (D-29z1428): 15a done (410, 328db74); 15b split into 15b-i (round 411: demo peaks files + generator + S1/S2 + strip tooltip + browser proof) and 15b-ii (purchased adapter peaksUrl, streamed-bytes cap, non-Chromium probe; closes PERF-15) | '+st15['status']
st15b['status']='split (D-29z1428): -> PERF-15b-i (round 411) + PERF-15b-ii | '+st15b['status']
stages=q['stages']; i=stages.index(st15b)
stages.insert(i+1,{"id":"PERF-15b-i","what":"demo URL sources get committed audiowaveform peaks files (public/peaks, 16-bit, generated from a Chromium decode by scripts/peaks/generate-demo-peaks.mjs + meta); fetchPrecomputedPeaks credentials 'omit' (A-R410-REV-S1) and refused-body cancel (A-R410-REV-S2); library preview strip title = Preview's unavailable reason (product-designer); browser proof: waveform before ready, 0 worker jobs for the 2 MP3s, 404/8-bit fallbacks; PP8, PP9, PS16, PS17, LPA3b; 10 mutants; doc 264, doc 263 l.4 'stage 1 of 3'","status":"dispatched (D-29z1430): round 411, b-round-410/sketch-411.patch.txt v5 sha e9b149c4be701ad1","added":BY})
stages.insert(i+2,{"id":"PERF-15b-ii","what":"purchased adapter peaksUrl input (optional AudioStem.peaksUrl mapped like audioUrl; signed URL, credentials omit, injectable fetch, no cache keyed by an expiring URL); streamed-bytes cap when content-length is absent or compressed (TL-R411-L4 = GATE410-L2); one Firefox (non-Chromium) decode-length probe for the demo peaks files (TL-R411-L3); meta file field vs peaksFiles path (TL-R411-L9); docs 263/264/265 l.4 -> Completed on the final PASS (L28); closes PERF-15 (backend half stays the handoff note)","status":"not_started (D-29z1428): after 15b-i C PASS; product-designer/reference N/A unless visible change","added":BY})
q['status']='in_progress (D-29z1431): PERF-15a done (410, 328db74); round 411 = PERF-15b-i (demo precomputed peaks + strip tooltip); then PERF-15b-ii (closes PERF-15); REGRESSION-2026-11-10 when due; RETRO 416 | '+q['status']
of=b['open_findings']
def add_f(e):
    if not any(x.get('id')==e['id'] for x in of): of.append(e)
add_f({"id":"A-R410-REV-S1","severity":"low","origin":"A code-reviewer (round 410)","evidence":"a-round-410.md 'Code-reviewer findings' S1","title":"fetchPrecomputedPeaks used the default credentials ('same-origin') while audio uses 'omit'","status":"fix dispatched in round 411 (D-29z1427 item 4; PP8; MU-411-CREDENTIALS-DEFAULT); close on C round 411 PASS","added":BY})
add_f({"id":"A-R410-REV-S2","severity":"low","origin":"A code-reviewer (round 410)","evidence":"a-round-410.md S2","title":"non-ok or over-cap peaks response body not cancelled","status":"fix dispatched in round 411 (D-29z1427 item 4; PP9; MU-411-NO-CANCEL); close on C round 411 PASS","added":BY})
add_f({"id":"A-R410-REV-S3","severity":"low","origin":"A code-reviewer (round 410)","evidence":"a-round-410.md S3; ArrangementContext collection-load effect","title":"all peaks fetches start before any loadSource (HTTP/1.1 slot contention); with a throwing peaksUrl no source starts decoding","status":"deferred_low_polish (D-29z1431): measured round 411 planning: 2 small same-origin JSON requests, the MP3s still load (probe beginsTotal 7, lane probe ok); fix together with TL-R410-SK-3 (guard + order)","added":BY})
add_f({"id":"A-R410-REV-S4","severity":"low","origin":"A code-reviewer (round 410)","evidence":"a-round-410.md S4","title":"bucket-count match is a weak identity check (same-length stem served the wrong peaks skips the worker)","status":"deferred_low_polish (D-29z1431): demo files tied to their MP3 by byte size (PS17, round 411); backend versioned URLs per handoff note (TL-R410-SK-6)","added":BY})
add_f({"id":"GATE410-L3","severity":"low","origin":"gate 410 reviewer","evidence":"gates/round-410/review.md item 3","title":"peaks keyed by source id only; a new collection reusing a ready id can overwrite and then drop that id's peaks","status":"deferred_low_polish (D-29z1431): theoretical (ids unique per collection: demo-*, purchased stem ids)","added":BY})
add_f({"id":"GATE410-L1","severity":"low","origin":"gate 410 reviewer","evidence":"gates/round-410/review.md item 1","title":"= TL-R410-SK-3 (unguarded peaksUrl call)","status":"duplicate of TL-R410-SK-3 (deferred_low_polish); demo peaksUrl (round 411) is a map lookup and cannot throw","added":BY})
add_f({"id":"GATE410-L2","severity":"low","origin":"gate 410 reviewer","evidence":"gates/round-410/review.md item 2","title":"4 MiB cap works only with an uncompressed content-length","status":"scheduled PERF-15b-ii (= TL-R411-L4)","added":BY})
add_f({"id":"TL-R411-L3","severity":"low","origin":"B pre-check (tech-lead sketch review)","evidence":"b-round-410/sketch-review.md","title":"demo peaks evidence is HeadlessChrome only; Firefox/Safari MP3 decode length may differ by > 1 bucket (worker path, safe)","status":"scheduled PERF-15b-ii (Firefox probe)","added":BY})
add_f({"id":"TL-R411-L4","severity":"low","origin":"B pre-check (tech-lead sketch review)","evidence":"b-round-410/sketch-review.md","title":"size cap applies only with content-length (chunked/gzip unbounded)","status":"scheduled PERF-15b-ii (streamed-bytes cap; signed URLs)","added":BY})
add_f({"id":"TL-R411-L5","severity":"low","origin":"B pre-check (tech-lead sketch review)","evidence":"b-round-410/sketch-review.md","title":"demoPeaksUrls repeats the demoUrls keys","status":"deferred_low_polish (D-29z1429): kept; PS16 pins both maps","added":BY})
add_f({"id":"TL-R411-L9","severity":"low","origin":"B pre-check (tech-lead delta review v5)","evidence":"b-round-410/sketch-review.md","title":"meta 'file' field not checked against peaksFiles path","status":"scheduled PERF-15b-ii (same test file)","added":BY})
add_f({"id":"INFO-B411-CONTEXT-STALE","severity":"info","origin":"environment","evidence":"context/head-sha.txt and context/active-summary.md name 9616d3a; gates/gate-round-410.json published 328db74","title":"context files written before gate 410; the gate file wins","status":"info","added":BY})
dl=b['deferred_low_polish']
for fid in ['A-R410-REV-S3','A-R410-REV-S4','GATE410-L3','TL-R411-L5']:
    f=next(x for x in of if x['id']==fid)
    if not any(x.get('id')==fid for x in dl):
        dl.append({"id":fid,"severity":"low","origin":f['origin'],"evidence":f['evidence'],"title":f['title'],"status":f['status'],"added":BY})
b['architecture_signals'].append({"id":"SIG-R410-PEAKS-ARBITRATION","source":"a-round-410.md Architecture note (signal 4); gates/round-410/review.md Architecture note","note":"ArrangementContext collection-load effect carries per-run early/decided/ready peaks bookkeeping with a fetch/decode/worker/swap interleaving. Both reviewers: keep for now. Proposal (after PERF-15b, not scheduled): pure createCollectionPeaksTracker({ store, drop }) in app/lib/arrangement with onEarly/onDecoded/onFailed; PPC1-PPC11 unchanged + unit rows; cost low-medium. Signal only (D-29z1431); joins the pending ARCH-CHECKPOINT-PERF11C-III-BOUNDARY question on ArrangementContext.","added":BY})
dec=[
 ("D-29z1427","Round 411 contract = PERF-15b-i: committed demo peaks files (public/peaks, audiowaveform v1 16-bit, spp 441 @44.1k, from a Chromium decode; 121,855 / 188,440 bytes) + in-repo generator scripts/peaks (no comments, paths from import.meta.url) + meta; demo peaksUrl for the 2 URL sources only; fetchPrecomputedPeaks credentials 'omit' + refused-body cancel; library preview strip title = previewUnavailableTitle (none when ready). Option (a) committed files chosen over (b) a 404 URL: (a) makes the promise real for users and gives an unstubbed browser row; (b) would fire 2 failing requests per load."),
 ("D-29z1428","PERF-15b split into 15b-i (round 411) and 15b-ii (purchased adapter peaksUrl + streamed cap + Firefox probe + closes PERF-15): staging, not a scope cut; the purchased half needs its own design (fetch injection, signed URLs, no cache by expiring URL)."),
 ("D-29z1429","Consults: product-designer keeps the dimmed loading state and adds the strip tooltip (rejected shimmer, hide-until-ready, ready announcement, softer dim); reference Live 12 manual 5.1.2 (.asd: waveform grayed out until fully drawn, not playable) -> match; deviation: CZABA shows the complete stored waveform dimmed. tech-lead v2 APPROVE WITH LOWS (M1 generator, L2 MP3 tie fixed), v4 APPROVE WITH LOWS (L6-L8 fixed in v5), v5 APPROVE; L3/L4/L9 -> 15b-ii, L5 kept."),
 ("D-29z1430","Round 411 dispatched from b-round-410/sketch-411.patch.txt v5 (sha e9b149c4be701ad1, 10 files, git apply --check clean on 328db74). Evidence on the committed scratch: tsc/lint/Biome rc 0; full vitest 264 files 3911/3911 rc 0; covering 24 files 425/425 (slowest 2842 ms / 15000; detail-panel 2119 ms / 5000 = 42 %); mutants 10/10 red; browser at both viewports: HEAD 0 columns while the MP3 is held and 1 worker job per MP3, sketch 96 dimmed columns + tooltip and 0 jobs, 404/8-bit fallbacks 1 job; heights held=ready, HEAD vs sketch <= 0.0133; lane probe ok; frozen r411 1300; grants 12."),
 ("D-29z1431","Round 410 closed: C PASS (8 rows, browserVerified/realVerified true, 0 bugs), gate 410 published 328db74 -> PERF-15a done. A-R410-REV-S1/S2 fixed in 411; S3/S4, GATE410-L3, TL-R411-L5 -> deferred_low_polish; GATE410-L1 = TL-R410-SK-3; GATE410-L2 = TL-R411-L4 -> 15b-ii. Architecture note -> SIG-R410-PEAKS-ARBITRATION (signal, not scheduled). No new checkpoint request: PERF-15 is mid-feature and ARCH-CHECKPOINT-PERF11C-III-BOUNDARY (ArrangementContext) still has no root result; non-blocking."),
]
for did, text in dec:
    b['decisions_log_b'].append({"id":did,"date":"2026-11-08","by":BY,"decision":text})
for r in b['rounds']:
    if r.get('round')==410:
        r['status']='C PASS (c-round-410.json, browserVerified true, 0 bugs); gate 410 published 328db74 (D-29z1431)'
b['rounds'].append({"round":411,"task":"current-task.md","decision":"D-29z1427..D-29z1431","type":"PERF-15b-i (demo precomputed peaks files + generator + S1/S2 + preview strip tooltip; stage 2 of 3)","status":"dispatched","note":"baseline 328db74 clean; frozen b-round-410/r411-frozen-sha256.txt (1300); grants b-round-410/grants-411.txt (12); patch b-round-410/sketch-411.patch.txt sha e9b149c4be701ad1; claims b-round-410/claims-411.sh","added":BY})
b['current_task']='Round 411: PERF-15b-i from B reviewed sketch b-round-410/sketch-411.patch.txt (current-task.md)'
b['version']=b['version']+1
b['updated']=BY
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok version',b['version'])
