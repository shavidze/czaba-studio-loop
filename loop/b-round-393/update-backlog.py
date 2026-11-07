import json, pathlib, sys
L = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop')
marker = L / 'b-round-393/update-backlog.done'
if marker.exists():
    print('already applied'); sys.exit(0)
d = json.loads((L / 'backlog.json').read_text())
assert d['version'] == 360, d['version']
BY = '2026-11-07 B round 393 -> 394 planning'
d['version'] = 361
d['updated'] = BY
d['current_task'] = 'Round 394: PERF-13c-ii-a: streamed library preview stall watchdog, synchronous-throw guard, external pause ends the preview (preview.client.ts only); doc 252 stage 2 of 3 (current-task.md)'
def walk(o):
    if isinstance(o, dict):
        yield o
        for v in o.values(): yield from walk(v)
    elif isinstance(o, list):
        for v in o: yield from walk(v)
def by_id(i):
    hits = [o for o in walk(d) if o.get('id') == i]
    assert hits, i
    return hits
def prepend(o, key, text):
    o[key] = text + (' | ' + o[key] if o.get(key) else '')

for o in by_id('PERF-13c-i'):
    prepend(o, 'status', 'done (D-29z1342): C round 393 PASS (c-round-393.json: browserVerified/realVerified true, 0 bugs; S1-S11, PERF-RES, AUTH at 1440+1280); gate 393 published 1091b9e')
for o in by_id('PERF-13c'):
    prepend(o, 'status', 'in_progress (D-29z1343): 13c-i done (1091b9e); 13c-ii split into 13c-ii-a (round 394, stream robustness) and 13c-ii-b (purchased previewUrl, harness row, cache warm, stable seek key, fallback expiry); doc 252 now 3 stages')
    st = o['stages_d29z1340']
    st[0]['status'] = 'done (D-29z1342): C round 393 PASS, gate 393 published 1091b9e'
    old = st[1]
    st[1] = {'id': 'PERF-13c-ii-a', 'what': 'stream lifecycle robustness in preview.client.ts only: stall watchdog 8000 ms (armed at start and on waiting, cleared on playing/stop, restarted on progress, expiry only when currentTime did not move -> onStreamError -> decode fallback); sync-throw guard (src/currentTime/play and same-url seek); external pause ends the preview (guards !ended && !error); NotAllowedError keeps the fallback', 'closes': ['REV-B393-M1-STALL', 'GATE393-M1-SYNC-THROW', 'A-R393-REVIEW-M1-EXTERNAL-PAUSE', 'A-R393-SKETCH-L4-EXTERNAL-PAUSE'], 'status': 'dispatched round 394 (D-29z1343, D-29z1344)', 'evidence_b': 'b-round-393/premise/events-head.json, sketch-events.json, sketch-hold.json, mutants/summary.txt (12/12 red), precheck-covering.log (256)'}
    st.append({'id': 'PERF-13c-ii-b', 'what': old['what'], 'scope_additions': [x for x in old.get('scope_additions', []) if 'REV-B393-M1-STALL' not in x and 'NotAllowedError' not in x and 'synchronously' not in x] + ['A-R393-REVIEW-L6: compare a stable key (source id), not the URL, for the same-preview seek (fresh signed URL per call)', 'GATE393-L4 / A-R393-REVIEW-L4: decide fallback-set expiry for signed URLs', 'SIG-R393-PREVIEW-NO-CACHE-WARM: the stall/abort fallback issues one fetch for the file (b-round-393/sketch-hold.json); rule cache warm for purchased sources', 'L36: try page.route stubs for the purchased half before writing it BLOCKED'], 'status': 'not_started (next after 13c-ii-a)'})
for o in by_id('STUDIO-PERFORMANCE'):
    prepend(o, 'status', 'in_progress (D-29z1342): PERF-13c-i done (C round 393 PASS, 1091b9e); round 394 = PERF-13c-ii-a')
for o in by_id('REV-B393-M1-STALL'):
    prepend(o, 'status', 'scheduled round 394 PERF-13c-ii-a (D-29z1344): HEAD premise b-round-393/premise/events-head.json (HOLD: toggle Stop after 14 s, no fallback); sketch fixes it (fallback 8378 ms, both viewports)')
for o in by_id('A-R393-SKETCH-L4-EXTERNAL-PAUSE'):
    prepend(o, 'status', 'superseded (D-29z1344) by A-R393-REVIEW-M1-EXTERNAL-PAUSE (Medium, fixed in round 394)')
for o in by_id('ARCH-CHECKPOINT-DECODE-REGION'):
    prepend(o, 'status', 'B ruling still KEEP (D-29z1346): round 394 has zero provider delta (claim K9); feature boundary for a bounded frontend-architect checkpoint = after PERF-13c-ii-b (b-round-393/root-request-arch-checkpoint-preview.md)')
for o in by_id('SRW-21-PLAN'):
    o.setdefault('scope_additions', []).append('A-R393-REVIEW-L5 (same-url seek keeps the first onStreamError; two sources sharing one URL) and the collection-change stream stop (D-29z1345)')
d['open_findings'].append({'id': 'GATE393-M1-SYNC-THROW', 'severity': 'medium', 'origin': 'gate 393 reviewer (gates/round-393/review.md suggestion 1)', 'evidence': 'gates/round-393/review.md', 'title': 'element.currentTime = start or element.play() can throw synchronously; active stays set, the UI shows Stop on silence', 'status': 'scheduled round 394 PERF-13c-ii-a (D-29z1344): try/catch -> error route; rows PS22, PS23 (jsdom only)', 'added': BY})
d['open_findings'].append({'id': 'A-R393-REVIEW-M1-EXTERNAL-PAUSE', 'severity': 'medium', 'origin': 'A round 393 code-reviewer (Medium); B re-rating (D-29z1344)', 'evidence': 'a-round-393.md Code review M1; b-round-393/premise/events-head.json (console pause keeps Stop at HEAD)', 'title': 'a streamed preview paused externally (media key / OS media session; the bare element is listed in Chrome/OS media controls, A-393 L7) keeps Stop with a frozen cursor', 'status': 'scheduled round 394 PERF-13c-ii-a (D-29z1344): pause on the active element (not ended, no error) ends the preview; C row R2', 'added': BY})
lows = [
 ('A-R393-REVIEW-L1-UNREACHABLE-GUARD', 'the active !== preview guard after element.src = url cannot fire in a browser', 'kept (B-ruled delta round 393)'),
 ('A-R393-REVIEW-L2-PS3-GUARD', 'PS3 cannot tell the ended guard from detach (mutant removes both)', 'test-precision note'),
 ('A-R393-REVIEW-L3-URL-SWITCH-ROWS', 'no test that a stream with a different URL releases the previous one, nor that a stream start cancels a pending decode request', 'candidate rows when a round owns the stream test file'),
 ('A-R393-REVIEW-L7-MEDIA-SESSION', 'the bare element appears in OS/Chrome now-playing controls (the buffer path never did)', 'accepted with the external-pause fix (round 394); metadata/actions not in scope'),
 ('GATE393-L3-FALLBACK-REENTRY', 'the stale startLibraryPreviewRef.current is called synchronously from inside the media error handler', 'works (PS8, PS13); candidate with the preview-controller extraction'),
]
for i, t, s in lows:
    d['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': 'A round 393 code-reviewer' if i.startswith('A-') else 'gate 393 reviewer', 'evidence': 'a-round-393.md Code review' if i.startswith('A-') else 'gates/round-393/review.md', 'title': t, 'status': f'deferred_low_polish (D-29z1345): {s}', 'added': BY})
d['open_findings'].append({'id': 'GATE393-L2-NOTALLOWED', 'severity': 'low', 'origin': 'gate 393 reviewer suggestion 2 (= sketch-review #2)', 'evidence': 'gates/round-393/review.md', 'title': 'a NotAllowedError from play() is treated as a stream failure and remembered (decode + memory cost)', 'status': "closed wontfix-by-ruling (D-29z1344): keep the decode fallback - on Safari/iOS the element can be blocked while the unlocked AudioContext works, so fallback = sound, ending = silence (tech-lead consult round 394)", 'added': BY})
d['open_findings'].append({'id': 'GATE393-L4-FALLBACK-NEVER-EXPIRES', 'severity': 'low', 'origin': 'gate 393 reviewer suggestion 4 (= A-393 L4)', 'evidence': 'gates/round-393/review.md', 'title': 'streamFallbackRef is never cleared per collection; one transient error disables streaming for that id', 'status': 'scheduled PERF-13c-ii-b (D-29z1345): decide expiry with signed URLs', 'added': BY})
d['architecture_signals'].append({'id': 'A-R393-ARCH-DECIDE-PREVIEW-MODE', 'origin': 'A round 393 code-reviewer Architecture note', 'note': 'startLibraryPreview has four branches (stream, decode, not-ready, buffer) plus fallback memory; propose a pure decidePreviewMode({ isCached, status, url, fallbackHas }) in lib/arrangement', 'status': 'recorded (D-29z1346); joins ARCH-CAND-SETTLE-HELPER-EXTRACT; checkpoint after PERF-13c-ii-b', 'added': BY})
d['architecture_signals'].append({'id': 'GATE393-ARCH-PREVIEW-CONTROLLER', 'origin': 'gate 393 reviewer Architecture note', 'note': 'third inline preview-player creation block + third preview path in one useCallback with 8 deps; proposal after 13c-ii lands: extract ensurePreviewPlayer + useLibraryPreviewController owning preview refs, fallback set and three paths; useArrangement() shape and PS1-PS15 + round-392 preview tests unchanged; cost medium, risk re-entrancy around startLibraryPreviewRef', 'status': 'recorded (D-29z1346); checkpoint request filed for after PERF-13c-ii-b', 'added': BY})
decs = [
 ('D-29z1342', 'Round 393 result: C PASS (c-round-393.json, browserVerified/realVerified true, 0 bugs); gate 393 published 1091b9e. PERF-13c-i done. tasks/round-393.md archived.'),
 ('D-29z1343', 'PERF-13c-ii split: 13c-ii-a (round 394, stream robustness, preview.client.ts only) / 13c-ii-b (purchased previewUrl, harness row, cache warm, stable seek key, fallback expiry). Doc 252 becomes 3 stages (l.4 "stage 2 of 3").'),
 ('D-29z1344', '13c-ii-a rulings: stall watchdog 8000 ms (start + waiting arm; playing/stop clear; progress restarts only; expiry only if currentTime unmoved; mid-play stall -> decode fallback); GATE393-M1-SYNC-THROW created and fixed by try/catch -> error route; A-393 review M1 external pause RE-RATED Medium (reachable through OS/Chrome media controls) superseding A-R393-SKETCH-L4, fixed as pause -> onEnded with !ended && !error guards; NotAllowedError keeps the fallback (closes sketch-review #2 scope addition and GATE393-L2). Premise HEAD + sketch probes in b-round-393/. Consults: tech-lead, performance-optimizer.'),
 ('D-29z1345', 'A-393 review L1/L2/L3/L7 and GATE393-L3 -> deferred_low_polish; A-393 L4 + GATE393-L4 and A-393 L6 -> PERF-13c-ii-b; A-393 L5 -> SRW-21-PLAN row.'),
 ('D-29z1346', 'Architecture: keep holds (round 394 zero provider delta). Signals A-R393-ARCH-DECIDE-PREVIEW-MODE and GATE393-ARCH-PREVIEW-CONTROLLER recorded, not scheduled. Feature boundary = after PERF-13c-ii-b: bounded frontend-architect checkpoint requested from root (b-round-393/root-request-arch-checkpoint-preview.md).'),
]
for i, t in decs:
    d['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': BY, 'decision': t})
for r in d['rounds']:
    if r.get('round') == 393:
        r['status'] = 'done: C PASS (c-round-393.json), gate published 1091b9e (D-29z1342)'
d['rounds'].append({'round': 394, 'task': 'current-task.md', 'decision': 'D-29z1342..D-29z1346', 'type': 'PERF-13c-ii-a: stream lifecycle robustness (stall watchdog, sync-throw guard, external pause ends the preview) in preview.client.ts only; doc 252 stage 2 of 3', 'status': 'dispatched', 'note': 'baseline 1091b9e (clean); grants b-round-393/grants-394.txt (3); frozen b-round-393/r394-frozen-sha256.txt (1284); claims b-round-393/claims-394.sh K1..K20; sketch b-round-393/sketch-394.patch.txt', 'added': BY})
(L / 'backlog.json').write_text(json.dumps(d, ensure_ascii=True, indent=2))
marker.write_text(BY + '\n')
print('ok v361')
