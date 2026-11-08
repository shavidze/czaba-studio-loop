import json, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b=json.load(open(P))
BY='2026-11-08 B round 411 -> 412 planning'
if 'D-29z1432' in json.dumps(b['decisions_log_b']):
    print('already applied'); sys.exit(0)
q=next(x for x in b['post_current_stage_queue'] if x['id']=='STUDIO-PERFORMANCE')
st=next(s for s in q['stages'] if s['id']=='PERF-15b-i')
st['status']=('bug (D-29z1432): C round 411 FAIL only on A-R411-REVIEW-M1 (Medium, generator rate not pinned; PS17 hardcoded 44100); '
 'browser rows 3/4/5a/7 PASS on the same runtime (c-round-411.json, browserVerified true) recorded as evidence, not done; '
 'round 412 = fix-up v6.1 (b-round-411/sketch-412-delta.patch.txt sha 833196f8) + full C run | '+st['status'])
q['status']='in_progress (D-29z1432): round 411 FAIL on A-R411-REVIEW-M1 -> round 412 fix-up of PERF-15b-i; then PERF-15b-ii (closes PERF-15); REGRESSION-2026-11-10 when due; RETRO 416 | '+q['status']
of=b['open_findings']
def add_f(e):
    if not any(x.get('id')==e['id'] for x in of): of.append(e)
add_f({"id":"A-R411-REVIEW-M1","severity":"medium","origin":"A code-reviewer (round 411); confirmed by C round 411 by code reading","evidence":"a-round-411.md section 4; c-round-411.json bugs[0]","title":"demo peaks generator uses the host AudioContext rate; PS17 hardcodes 44100 and ignores the meta sampleRate (false red after a valid 48 kHz regeneration)","status":"fix dispatched in round 412 (D-29z1432; v6.1 delta; MU-412-META-RATE-48K, MU-412-HEADER-RATE-48K, MU-412-REGEN-48K); close on C round 412 PASS","added":BY})
add_f({"id":"B-R411-SKETCH-M1-MISSED","severity":"low","origin":"B (planning)","evidence":"b-round-410/sketch-review.md (v5 APPROVE); a-round-411.md STOP; L58 'an unruled Medium that A's reviewer finds on B's sketch is a planning FAIL'","title":"B's reviewed v5 sketch carried a Medium (host-rate generator, hardcoded PS17 rate) that the review did not catch; round 411 lost","status":"retro input RETRO 416 (origin B); fixed by round 412","added":BY})
add_f({"id":"INFO-A411-SKETCH-REVIEW-HEADER","severity":"info","origin":"A (round 411)","evidence":"b-round-410/sketch-review.md l.2 names v4 sha 26266d04; l.24 names dispatched v5","title":"sketch-review header named a superseded sha","status":"resolved for round 412: b-round-411/sketch-review.md line 1 names the dispatched sha (K13)","added":BY})
add_f({"id":"INFO-A411-L31-TIMEOUT-WORDING","severity":"info","origin":"A (round 411)","evidence":"a-round-411.md INFO; render-budget.test.tsx detail-panel row closes with 15000","title":"task 411 quoted the detail-panel row against the 5,000 ms default; its declared timeout is 15,000 ms","status":"info; round 412 numbers re-measured (sketch-logs/slowest.txt)","added":BY})
for fid,title,status in [
 ("A-R411-REVIEW-L1","generator rate/100 duplicates PEAK_BUCKETS_PER_SECOND","fix dispatched in round 412 (PS17 ties header spp to sampleRate / PEAK_BUCKETS_PER_SECOND); close on C round 412 PASS"),
 ("A-R411-REVIEW-L2","peaks<->MP3 tie is byte size only (no sha256 in meta)","scheduled PERF-15b-ii candidate (with TL-R411-L9)"),
 ("A-R411-REVIEW-L3","generator: no response.ok check, no try/finally around browser.close, braceless for","fix dispatched in round 412 (v6.1); close on C round 412 PASS"),
 ("A-R411-REVIEW-L4","doc 264 tense next to the post-PASS status","fixed by A in round 411 (doc only)"),
 ("A-R411-REVIEW-L5","doc 264 l.31 claims an injected SourceFetch bearer header still works; no row tests it","doc reworded in round 412; test row scheduled PERF-15b-ii"),
 ("TL-R412-L-D","generator: browser.close() in finally can mask the original error","deferred_low_polish (D-29z1432): dev script"),
 ("TL-R412-L-E","generator: ctx.close() not in a finally inside evaluate","deferred_low_polish (D-29z1432): dev script, closed with the browser"),
 ("TL-R412-L-F","byte-identical regeneration proved on the loop runner's Chromium build only","doc 264 wording in round 412; close on C round 412 PASS"),
]:
    add_f({"id":fid,"severity":"low","origin":"A code-reviewer (round 411)" if fid.startswith('A-') else "B pre-check (tech-lead review of v6)","evidence":"a-round-411.md section 4" if fid.startswith('A-') else "b-round-411/sketch-review.md","title":title,"status":status,"added":BY})
dl=b['deferred_low_polish']
for fid in ['TL-R412-L-D','TL-R412-L-E']:
    f=next(x for x in of if x['id']==fid)
    if not any(x.get('id')==fid for x in dl):
        dl.append({"id":fid,"severity":"low","origin":f['origin'],"evidence":f['evidence'],"title":f['title'],"status":f['status'],"added":BY})
b['architecture_signals'].append({"id":"SIG-R411-PEAKS-URL-COPIES","source":"a-round-411.md section 4 Architecture note (code-reviewer)","note":"The two demo MP3/peaks URL pairs live in 4 places (studio-lab-demo.ts, the PS16/PS17 peaksFiles map, the generator files list, the meta). Reviewer: keep (the test copy is intentionally independent; the .mjs cannot import TS). Separately ArrangementContext.tsx ~l.4557 calls fetchPrecomputedPeaks(...).then without .catch; safe only because the function never rejects. Signal only (D-29z1432); joins SIG-R410-PEAKS-ARBITRATION.","added":BY})
dec=[
 ("D-29z1432","Round 411 closed as C FAIL (A STOP L11 on A-R411-REVIEW-M1, Medium; C reduced run: browser rows 3/4/5a/7 PASS at both viewports on the same runtime, rows 2/5b/6-mutants/8/9/11 not run; gate 411 skipped). Ruling (L10): option (b) fix, not re-rate: two reviewers rated Medium, bug gate fixes Mediums now, doc 264 promises reproducible regeneration. v6.1 delta: generator pins AudioContext 44100 (+throw if not honoured), response.ok, try/finally, braces, writes after all decodes; PS17 reads meta sampleRate, pins 44100, ties header sample_rate and samples_per_pixel (folds A-R411-REVIEW-L1). L2 and L5 test -> 15b-ii; TL-R412-L-D/E -> deferred_low_polish; L-F doc wording. Planning miss recorded as B-R411-SKETCH-M1-MISSED (RETRO 416). PERF-15b-i stays 'bug' until C round 412 PASS; its round-411 browser rows are evidence only."),
 ("D-29z1433","Round 412 dispatched from b-round-411/sketch-412-delta.patch.txt (v5 -> v6.1, 2 files, sha 833196f8ccf086ab; git apply --check clean on the round-411 tree). Cumulative HEAD -> v6.1 (10 files) equals the scratch. tech-lead: v6 APPROVE WITH LOWS, v6.1 delta APPROVE WITH LOWS, no Medium+. Evidence on /tmp/b412: regeneration byte-identical 3/3; mutants 13/13 red (2 new rate mutants survive on the v5 test); tsc/Biome 0; covering 24 files 425/425 (slowest 2185/15000 ms); full vitest on v6 264/3911 rc 0. C runs the full stage (rows 1-11), incl. scratch-only regeneration and its own held=ready heights compare."),
]
for did, text in dec:
    b['decisions_log_b'].append({"id":did,"date":"2026-11-08","by":BY,"decision":text})
for r in b['rounds']:
    if r.get('round')==411:
        r['status']='C FAIL (c-round-411.json: A STOP on A-R411-REVIEW-M1; browser rows 3/4/5a/7 PASS, browserVerified true); gate 411 skipped (D-29z1432)'
b['rounds'].append({"round":412,"task":"current-task.md","decision":"D-29z1432..D-29z1433","type":"PERF-15b-i fix-up (A-R411-REVIEW-M1: deterministic generator + PS17 meta rate) + full stage verification","status":"dispatched","note":"baseline 328db74 + round-411 uncommitted tree (12 granted lines); frozen b-round-411/r412-frozen-sha256.txt (1300); grants b-round-411/grants-412.txt (12); delta b-round-411/sketch-412-delta.patch.txt sha 833196f8; claims b-round-411/claims-412.sh","added":BY})
b['current_task']='Round 412: PERF-15b-i fix-up from B reviewed delta b-round-411/sketch-412-delta.patch.txt (current-task.md)'
b['version']=b['version']+1
b['updated']=BY
json.dump(b,open(P,'w'),ensure_ascii=False,indent=1)
print('ok version',b['version'])
