# B round 390 -> 391: backlog v357 -> v358. Run once from the loop root.
import json, pathlib, sys
P = pathlib.Path('backlog.json'); DONE = pathlib.Path('b-round-390/update-backlog.done')
if DONE.exists(): sys.exit('already applied')
b = json.loads(P.read_text())
assert b['version'] == 357, b['version']
BY = '2026-11-07 B round 390 -> 391 planning'
EV = 'c-round-390.json (PASS, 0 failed, 0 bugs, 0 inconclusive, 0 blocked, browserVerified/realVerified true; recorded R390-POSCTL, R390-ESC-DRAG, R390-RP-BUILT, R390-RP301, RR-OSS single file); a-round-390.md no change; gate 390 skipped (no real changes), baseline stays 11ca746'
n = 0
for r in b['rounds']:
    if isinstance(r, dict) and r.get('round') == 390:
        r['status'] = 'c_pass (D-29z1322): REGRESSION part 2 PASS, 0 bugs; gate 390 skipped - nothing to publish | ' + str(r['status'])
        r['result'] = EV; n += 1
assert n == 1, n
b['rounds'].append({'round': 391, 'task': 'current-task.md', 'decision': 'D-29z1322..D-29z1329',
    'type': 'PERF-13b-ii: decode wait text (sourceDecoding/sourceReady, settle swap), error-source clips (export refuses window-limited, Play plays with warning), pcm-live-mib-ready/decode-mib-ready record -> assert',
    'status': 'dispatched', 'note': 'baseline 11ca746 clean; grants b-round-390/grants-391.txt (6); frozen b-round-390/r391-frozen-sha256.txt (1279); claims b-round-390/claims-391.sh K1..K26; perf sketch 31.9/0 PASS, mutant MU-391-NOTHING-EVICTABLE 124/92.2 FAIL', 'added': BY})
m = 0
for r in b['regression_rounds']:
    if r.get('id') == 'REGRESSION-2026-11-08':
        r['status'] = 'done (D-29z1322): part 1 round 389 PASS, part 2 round 390 PASS (0 bugs, browserVerified true); regression-last.json = 2026-11-07 / 390; next due on or after 2026-11-10 | ' + r['status']
        r['carry_to_next_regression_d29z1323'] = [
            'NO-SHIFT-203: not run (needs a second reference server; single-dev-server rule D-29z1057) - carry as a named row',
            'INFO-C390-HARNESS-DRIFT: fold four probe adaptations into the permanent probes before the next regression: (1) rows1.cjs RG-06 marquee = Ctrl+drag (SABA-B-11c); (2) rows5.cjs RG-18 STEM=demo-stem-pad; (3) c250-s9.cjs splitPlaying uses a sample-series max, not one instant; (4) c218-mp3.cjs waits for "Demo collection ready" before Add (L48)',
            'INFO-C390-RV-M-HYDRATION-GLITCH: unreproduced (1 of 6 loads, during a long chain; 4 fresh loads + attempt 2 clean); re-check once with a fresh load per row',
            'INFO-C390-VIDEO-SNAP: R390-VIDEO-SOUND expectation is written against the real (grid-snapped) landing position',
        ]
        m += 1
assert m == 1, m
k = 0
for f in b['open_findings']:
    if f.get('id') == 'ESCAPE-CANCEL-GESTURE':
        f['status'] = str(f['status']) + ' | D-29z1323: round 390 R390-ESC-DRAG observed again (both viewports, release commits Move clip 0.000 -> 5.000); evidence only, still awaiting a Live source and Saba'
        k += 1
assert k == 1, k
st = b['post_current_stage_queue'][7]['stages'][49]
assert st['id'] == 'PERF-13b-ii'
st['status'] = 'dispatched round 391 (D-29z1324..D-29z1327) | ' + st['status']
st['rulings_d29z1325_1327'] = {
  'assert_flip': 'pcm-live-mib-ready <= 60 MiB, decode-mib-ready <= 0 (B sketch b-round-390/perf-sketch-391.log 31.9/0 x3 PASS; MU-391-NOTHING-EVICTABLE 124/92.2 FAIL); count/after-add/export-delta stay record',
  'known_vs_decoded': 'derived (ready && !decodedBuffers.has && in flight), no new React state (tech-lead); sourceDecoding/sourceReady texts; settle swap at the Play and preview call sites only when the line still equals the loading text',
  'A-R382-ERROR-SOURCE-SKIPPED': 'ruled D-29z1326: export refuses (window-limited) with the existing failed text; Play plays and warns after playingFrom (Live 12 manual 5.6)',
  'A-R383-REVIEW-L1-STALE-ENSURE-DECODED': 'closed D-29z1327 with no code: unreachable (abort before clear, owner check, unmount cleanup), no mutant can tell it from signal.aborted (L52); EV7 covers it',
  'purchased_reload': 'question moved to SRW-21-PLAN (D-29z1329)',
  'offline_mark': 'Saba Q1 user-review/questions-perf13b-ii.md (awaiting_user)'}
for a in b['architecture_checkpoint_requests']:
    if a.get('id') == 'ARCH-CHECKPOINT-DECODE-REGION':
        a['status'] = 'still unanswered at round 391 planning (D-29z1328): PERF-13b-ii dispatched anyway (non-blocking; D-29z1321 rule "if unanswered B rules with a reason"): the round adds no React state or context field and does not touch ensureDecoded, the cache, pins or collection effect; request stays open and should be answered before PERF-13c (same region) | ' + a['status']
b['open_findings'].append({'id': 'SABA-Q-PERF13B-OFFLINE-MARK', 'severity': 'info', 'origin': 'B round 390 -> 391 planning (product-designer, L44)', 'evidence': 'user-review/questions-perf13b-ii.md Q1; Live 12 manual 5.6 Locating Missing Files', 'title': 'a clip whose source failed has no Offline mark (Live marks such clips Offline); status-line warning only', 'status': 'awaiting_user (D-29z1326): default not now', 'added': BY})
b['architecture_signals'].append({'id': 'SIG-R391-DECODE-REGION-NINTH-ROUND', 'origin': 'B round 390 -> 391 planning', 'note': 'round 391 is the ninth round (381-391) on the ArrangementProvider decode/peaks/cache/schedule region; kept small (call-site status swaps, one export check) pending ARCH-CHECKPOINT-DECODE-REGION', 'status': 'recorded (D-29z1328)', 'added': BY})
dec = [
 ('D-29z1322', 'Round 390 accepted on C evidence: ' + EV + '. REGRESSION-2026-11-08 closed (parts 389 and 390 PASS); regression-last.json -> 2026-11-07 / 390 (next due on/after 2026-11-10). No findings to close or defer; C reported 0 bugs.'),
 ('D-29z1323', 'C round-390 observations: NO-SHIFT-203, the four INFO-C390-HARNESS-DRIFT probe adaptations, the unreproduced RV-M hydration glitch and the VIDEO-SNAP note are carried to the next regression (carry_to_next_regression_d29z1323), not scheduled; R390-ESC-DRAG appended to ESCAPE-CANCEL-GESTURE as evidence (awaiting Live source + Saba).'),
 ('D-29z1324', 'PERF-13b-ii assert flip: res.mem.pcm-live-mib-ready assert <= 60 MiB (perf-plan PERF-13 target) and res.mem.pcm-live-decode-mib-ready assert <= 0, from B production sketch on a scratch copy (b-round-390/sketch-391.patch.txt, perf-sketch-391.log 31.9/0 x3, 1 passed) and fix-removed mutant MU-391-NOTHING-EVICTABLE (canReloadSource -> false; 124/92.2 FAIL). count-ready, after-add, count-after-add, after-export-delta stay record.'),
 ('D-29z1325', 'Decode wait text: new studioLibraryStrings.sourceDecoding (Loading "X"...) and sourceReady ("X" is ready.); Play refusal for ready-not-cached sources and the preview wait write sourceDecoding; at settle, a functional setStatus swaps only when the line still equals that loading text (all awaited cached -> sourceReady; any error -> sourceFailed of the first; abort -> none). Uniform for preview (product-designer clear-on-start rejected: restoring replaced text across overlapping waits can restore a stale loading text). No new React state (tech-lead). Still-loading sources keep sourceNotLoaded.'),
 ('D-29z1326', 'A-R382-ERROR-SOURCE-SKIPPED ruled: export (WAV/MP3) refuses when a rendered clip (window-limited) has a source in exactly error, with the existing exportFailed(sourceFailed) text; Play starts and writes sourceFailed after playingFrom (Live 12 manual 5.6: plays silence, warns in status bar). Export with missing media: no Live reference found (5.1.3); own decision. Offline clip mark -> Saba Q1 (awaiting_user, default not now). Retry of a failed source out of scope.'),
 ('D-29z1327', 'A-R383-REVIEW-L1-STALE-ENSURE-DECODED closed with no code: tech-lead traced it unreachable (collection cleanup aborts before clearing in-flight; stale closure gets controller null from the owner check; unmount same cleanup); a guard would equal signal.aborted and no mutant could separate them (L52); EV7 covers the invariant.'),
 ('D-29z1328', 'ARCH-CHECKPOINT-DECODE-REGION unanswered for the 7th planning; PERF-13b-ii dispatched per D-29z1321 with reason: bounded to call-site status swaps and one export check, no new React state/context field, ensureDecoded/cache/pins/collection effect untouched. Request stays open; wanted before PERF-13c. Signal SIG-R391-DECODE-REGION-NINTH-ROUND recorded.'),
 ('D-29z1329', 'Purchased collection reload (signed URL expiry): canReloadSource stays absent for the purchased adapter; question moved to SRW-21-PLAN (root parallel lane).'),
]
for i, t in dec:
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': BY, 'decision': t})
for q in b['post_current_stage_queue']:
    if q.get('id') == 'STUDIO-PERFORMANCE':
        q['status'] = 'in_progress (D-29z1322): REGRESSION-2026-11-08 closed (rounds 389-390 PASS); round 391 = PERF-13b-ii | ' + q['status']
b['advisor_used_by_B'] = 'yes (round 390 -> 391 planning: advisor available; consulted after orientation and before declaring done; effect: regression-last updated, L58 sketch + mutant actually run before flipping, count rows kept record, L1 guard ruled no-assert, error-source ruling made explicit, L51 lifetime for the decode text) | ' + str(b.get('advisor_used_by_B', ''))
b['current_task'] = 'Round 391: PERF-13b-ii decode wait text, error-source clips, PCM rows -> assert (current-task.md)'
b['version'] = 358; b['updated'] = BY
P.write_text(json.dumps(b, indent=2)); DONE.write_text('ok\n'); print('ok')
