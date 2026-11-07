# B round 384 -> 385: accept round 384 (D-29z1285..D-29z1287). Run once from the loop root.
import json, os, sys
DONE = 'b-round-384/update-backlog-part1.done'
if os.path.exists(DONE): sys.exit('already applied')
b = json.load(open('backlog.json'))
assert b['version'] == 350, b['version']
ADDED = '2026-11-07 B round 384 -> 385 planning'
def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': ADDED, 'decision': text})
def stage(i):
    return [s for s in b['post_current_stage_queue'][7]['stages'] if s['id'] == i][0]
def find(i):
    return [f for f in b['open_findings'] if f['id'] == i][0]
r = [x for x in b['rounds'] if x.get('round') == 384][0]
r['status'] = 'done (D-29z1285): C round 384 PASS (c-round-384.json: 13 rows passed, browserVerified true, realVerified true, 0 bugs; fake-bearer row blocked = backend-only); gate 384 published 7295618 on both remotes (rounds 382-384)'
s = stage('PERF-13b-i')
s['status'] = 'done (D-29z1285): C round 384 PASS (HEAP-RETAINERS-PROD live [2,5,16,16,16,16,16] 0 baseQueue at 1440 and 1280; PERF-RES 22/22, pcm ready 31.9 MiB / 7 / decode 0); gate 384 published 7295618 | ' + s['status']
s = stage('PERF-13b'); s['status'] = 'in_progress (D-29z1285): 13b-i done (gate 7295618); 13b-ii not started | ' + s['status']
s = stage('PERF-13'); s['status'] = 'in_progress (D-29z1285): 13a done, 13b-i done (7295618); 13b-ii, 13c, 13d not started | ' + s['status']
f = find('C-R382-01')
f['status'] = 'closed (D-29z1285): C round 384 HEAP-RETAINERS-PROD (c-round-384/heap-prod-1440.json, heap-prod-1280x720.json: live [2,5,16,16,16,16,16], 0 baseQueue) + PERF-RES (c-round-384/perfres.log 22/22, pcm-live-mib-ready 31.9 <= 60); gate 7295618 | ' + f['status']
f = find('B-R383-AUTH-ROW-BARE-URL')
f['status'] = 'closed (D-29z1285): C round 384 G384-AUTH with ?product=middle-east&file=stem.mp3 returned 401 "Please sign in to access Studio." at both viewports (c-round-384.md row 9); process lesson handled at RETRO 385 | ' + f['status']
f = find('TL-R376-M1-HANDOFF-ARM-LIFETIME')
f['status'] = 'closed (D-29z1286): stale-open bookkeeping; the v2 fix shipped with PERF-11c-iii-c1, C round 377 PASS (c-round-377.json lists FL11 present, mutants red), gate 377 published 79ed8a9; status said "closes on C PASS of round 376" but 376 was BLOCKED and 377 carried it (L7) | ' + f['status']
gbase = {'origin': 'gate 384 code-reviewer', 'evidence': 'gates/round-384/review.md', 'added': ADDED}
b['open_findings'].append(dict(gbase, id='GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION', severity='medium',
    title='ensureDecoded fulfilled handler calls syncPlayback; if it throws, the Promise.all rejects and the three void call sites (history publish ~922/927, startPlaybackAt 1646, startLibraryPreview 1727) leave it unhandled',
    repro='gates/round-384/review.md suggestion 1; ArrangementContext.tsx l.1409-1450 (ensureDecoded), l.927, l.1646, l.1727 at 7295618; reachability needs a syncPlayback/startGraph throw (not yet reproduced in a browser)',
    status='scheduled round 386 (D-29z1287): bug round with A-R383-REVIEW-L1 (same function), before REGRESSION and PERF-13b-ii; severity kept as the reviewer rated it (bug gate)'))
b['deferred_low_polish'].append(dict(gbase, id='GATE384-L2-PREVIEW-STOP-ON-FAILED-DECODE', severity='low',
    title='deferred preview branch stops timeline playback at click time; if the re-decode then fails nothing plays',
    repro='gates/round-384/review.md suggestion 2; ArrangementContext.tsx l.1722-1724', status='candidate for round 386 (same function, cheap) else deferred_low_polish (D-29z1286)'))
b['deferred_low_polish'].append(dict(gbase, id='GATE384-L3-PLAY-REFUSE-AUTO-START', severity='low',
    title='Play during a re-decode is refused; user must press again (EV3 contract, intentional)',
    repro='gates/round-384/review.md suggestion 3', status='deferred_low_polish (D-29z1286): behaviour change, product question; not scheduled'))
b['deferred_low_polish'].append(dict(gbase, id='GATE384-L4-LOAD-EFFECT-RESET-ON-IDENTITY', severity='low',
    title='load effect cleanup now deletes buffers; an unstable callback identity would drop and re-decode everything',
    repro='gates/round-384/review.md suggestion 4; proposed row: re-render provider with unchanged collection, loadSource called once', status='deferred_low_polish (D-29z1286): row candidate for PERF-13b-ii'))
b['architecture_signals'].append(dict(gbase, id='SIG-R384-USE-DECODED-SOURCES-HOOK', note='gate 384 Architecture note: extract useDecodedSources(collection, deps) owning cache, in-flight map, ensureDecoded and pin helpers, only if another round changes the region; keep for now', status='recorded (D-29z1286): joins SIG-R383-SOURCE-LOAD-ORCHESTRATION and ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (eleventh echo); signal only'))
dec('D-29z1285', 'Round 384 accepted from evidence: C PASS (c-round-384.json: 13 rows, browserVerified true, realVerified true, 0 bugs), gate 384 published 7295618 on both remotes (rounds 382-384). PERF-13b-i done. C-R382-01 closed (HEAP-RETAINERS-PROD both viewports + PERF-RES 22/22). B-R383-AUTH-ROW-BARE-URL closed (G384-AUTH 401). Baseline for round 385 = 7295618, clean tree.')
dec('D-29z1286', 'Gate 384 review routed: suggestion 1 -> GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION (Medium, kept as rated); 2 -> GATE384-L2 (round-386 candidate, same function); 3 -> GATE384-L3 deferred (intentional EV3 contract); 4 -> GATE384-L4 deferred (row candidate for 13b-ii); 5 info closed (reviewer: correct result). Architecture note -> SIG-R384-USE-DECODED-SOURCES-HOOK (signal only). TL-R376-M1 closed as stale-open (fixed and passed in round 377).')
dec('D-29z1287', 'Order after round 384: round 385 = RETRO 385 (window 369-384; next_due was 384, analysis done at this planning, changes no code, so the Medium waits one round; it is not security or data loss). Round 386 = bug round GATE384-M1 + A-R383-REVIEW-L1 (+ GATE384-L2 if cheap), all in ensureDecoded/startLibraryPreview, ahead of REGRESSION-2026-11-08 (bug gate: Medium before other work; the regression runs at the first planning after 386 closes) and PERF-13b-ii.')
b['version'] = 351
b['updated'] = ADDED
json.dump(b, open('backlog.json', 'w'), indent=1, ensure_ascii=False)
open(DONE, 'w').write('applied\n')
print('ok v351')
