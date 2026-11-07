import json, pathlib, sys
L = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop')
marker = L / 'b-round-392/update-backlog.done'
if marker.exists():
    print('already applied'); sys.exit(0)
d = json.loads((L / 'backlog.json').read_text())
assert d['version'] == 359, d['version']
BY = '2026-11-07 B round 392 -> 393 planning'
d['version'] = 360
d['updated'] = BY
d['current_task'] = 'Round 393: PERF-13c-i: library preview of a URL-backed source streams through a media element (no decode); fallback to the decode path on a stream error; doc 252 (current-task.md)'

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

for o in by_id('PERF-13b-ii'):
    prepend(o, 'status', 'done (D-29z1336): C round 392 PASS (c-round-392.json: browserVerified/realVerified true, 0 bugs; B1-B5, B7-B9, PERF-RES at 1440+1280); gate 392 published c1183a0 (rounds 389-392)')
for o in by_id('C-R391-01'):
    prepend(o, 'status', 'closed (D-29z1336): fixed by round 392 (owner-controller settle rule); C round 392 B7/B8/B9 PASS at both viewports; published c1183a0')
for o in by_id('PERF-13'):
    prepend(o, 'status', 'in_progress (D-29z1336): 13a, 13b-i, 13b-ii done (c1183a0); 13c split 13c-i (round 393) / 13c-ii; 13d not started')
for o in by_id('PERF-13c'):
    prepend(o, 'status', 'in_progress (D-29z1340): 13c-i dispatched round 393 (demo URL sources stream through a media element; fallback to decode on a stream error); 13c-ii not started (purchased adapter previewUrl from signed stemUrls - browser half BLOCKED backend unavailable in cloud; perf harness preview row; stem-cache interplay)')
    o['premise_d29z1340'] = 'b-round-392/premise/premise-head.json (HEAD c1183a0, dev, 1440): Preview Middle East decode 278 ms +37.1 MiB live PCM first sound 360 ms; hero 673 ms +55.1 MiB 765 ms; synth Full mix 66 ms no decode'
    o['stages_d29z1340'] = [
        {'id': 'PERF-13c-i', 'what': 'collection.previewUrl (types), demo returns demoUrls; preview.client playLibraryPreviewStream (bare HTMLAudioElement, injectable factory); provider stream branch only for ready + not cached + previewUrl; no status while buffering; any stream error -> decode path (remembered per collection); doc 252', 'status': 'dispatched round 393 (D-29z1340, D-29z1341)'},
        {'id': 'PERF-13c-ii', 'what': 'purchased adapter previewUrl (signed stemUrls, fresh per call; SRW-21 prerequisite) - browser half BLOCKED backend unavailable in cloud; perf harness preview scenario res.mem.pcm-live-preview-delta-mib / decode count (assert from B sketch, L58); stem cache not warmed by preview (SIG-R393-PREVIEW-NO-CACHE-WARM) ruled', 'status': 'not_started'},
    ]
for o in by_id('STUDIO-PERFORMANCE'):
    prepend(o, 'status', 'in_progress (D-29z1336): PERF-13b-ii done (C round 392 PASS, c1183a0); round 393 = PERF-13c-i')
for o in by_id('ARCH-CHECKPOINT-DECODE-REGION'):
    prepend(o, 'status', 'B ruling while unanswered (D-29z1337, D-29z1321 rule): KEEP the decode region in ArrangementProvider - A-392 code-reviewer, gate-392 reviewer (gates/round-392/review.md) and the tech-lead consult (round 393 planning) all say keep; only the pure decideDecodeSettle (+ a status-settle helper) could move to lib/arrangement, as candidate ARCH-CAND-SETTLE-HELPER-EXTRACT after PERF-13c closes, root approval needed. Round 393 is the eleventh round in the region; its new code lives in preview.client.ts, the provider change is limited to the branch choice + one fallback ref. Request stays open for root to confirm or overrule')
d['architecture_signals'].append({'id': 'GATE392-ARCH-SETTLE-HELPER', 'origin': 'gate 392 reviewer (gates/round-392/review.md, Architecture note)', 'note': 'decode/settle/status logic at two call sites in ArrangementContext.tsx (l.289-304, 1727-1760, 1831-1870 at c1183a0); verdict keep; proposal: move decideDecodeSettle + settleDecodeStatus helper to lib/arrangement with EV3/EV9/EV12/EV16-EV25 unchanged and useArrangement() shape unchanged', 'status': 'recorded (D-29z1337); candidate ARCH-CAND-SETTLE-HELPER-EXTRACT after PERF-13c, root approval', 'added': BY})
d['architecture_signals'].append({'id': 'SIG-R393-PREVIEW-NO-CACHE-WARM', 'origin': 'performance-optimizer consult, round 393 planning', 'note': 'a streamed preview bypasses publicPreviewSourceFetch (stem cache); demo sources are already cached at load (decoded for peaks), so no extra Add download in /studio-lab; for purchased sources preview-then-place may download twice. Ruled in PERF-13c-ii', 'status': 'recorded (D-29z1341)', 'added': BY})

lows = [
    {'id': 'A-R392-REVIEW-M1', 'severity': 'low', 'origin': 'A round 392 code-reviewer (Medium) -> B ruling Low (D-29z1338)', 'evidence': 'a-round-392.md section 5; a-round-392/probe/probe.log', 'title': 'after a collection prop change, Play with an old clip whose source id is not in the new collection writes a false "is ready" and never plays', 'repro': 'jsdom scratch probe only; unreachable in the browser: only app/routes/studio-lab.tsx mounts ArrangementProvider, with the module constant studioLabDemoCollection', 'status': 'deferred_low_polish (D-29z1338); prerequisite_for SRW-21-PLAN / SRW-21: row "Play after a collection switch with an old clip -> sourceNotLoaded"; candidate fix: treat an awaited id with no collection.sources entry like the null owner', 'added': BY},
    {'id': 'A-R392-REVIEW-L1-FAILURE-BEFORE-ABORT', 'severity': 'low', 'origin': 'A round 392 code-reviewer', 'evidence': 'a-round-392.md section 4', 'title': 'decideDecodeSettle checks failure before abort: an aborted caller could write sourceFailed(old title) if a new collection has a failed source with the same id', 'status': 'deferred_low_polish (D-29z1338); B-ruled order (D-29z1331/1333); unreachable with a constant collection; revisit with SRW-21', 'added': BY},
    {'id': 'A-R392-REVIEW-L2-STALE-CALL-STOPS-PREVIEW', 'severity': 'low', 'origin': 'A round 392 code-reviewer', 'evidence': 'a-round-392.md section 4', 'title': 'a stale (null-owner) preview call stops the live preview before writing sourceNotLoaded', 'status': 'deferred_low_polish (D-29z1338); task-ruled (D-29z1332)', 'added': BY},
    {'id': 'A-R392-REVIEW-L3-SUPERSESSION-BY-ID', 'severity': 'low', 'origin': 'A round 392 code-reviewer', 'evidence': 'a-round-392.md section 4', 'title': 'the preview supersession gate keys on sourceId, not a request token: stop then re-preview of the same id during its decode starts with the first call offset', 'status': 'deferred_low_polish (D-29z1338); pre-existing; the decode path only (round 393 stream path does not use previewRequestRef)', 'added': BY},
    {'id': 'GATE392-L1-TEST-CONSOLE-INFO', 'severity': 'low', 'origin': 'gate 392 reviewer', 'evidence': 'gates/round-392/review.md finding 1', 'title': 'three console.info record lines in decoded-buffer-eviction-ui.test.tsx (EV12, EV22, EV25); EV22 asserts only not.toBe(decoding)', 'status': 'deferred_low_polish (D-29z1338); fix when a round owns that test file', 'added': BY},
    {'id': 'GATE392-L2-PLAY-WARNING-ANY-CLIP', 'severity': 'low', 'origin': 'gate 392 reviewer', 'evidence': 'gates/round-392/review.md finding 2', 'title': 'the Play warning names the first failed clip anywhere in the arrangement, not one at or after the play point', 'status': 'deferred_low_polish (D-29z1338); current contract D-29z1326; candidate: filter clip.start + clip.duration > from', 'added': BY},
]
d['deferred_low_polish'].extend(lows)
d['open_findings'].append({'id': 'GATE392-L3-BUDGET-ZERO-WATCH', 'severity': 'info', 'origin': 'gate 392 reviewer', 'evidence': 'gates/round-392/review.md finding 3', 'title': 'pcm-live-decode-mib-ready assert <= 0 relies on GC x2 reclaiming every decoded buffer; watch the next gates for flakiness', 'status': 'watch (D-29z1338): no action unless a gate fails on it', 'added': BY})
d['open_findings'].append({'id': 'INFO-C392-B3-PLAYING', 'severity': 'info', 'origin': 'C round 392 note 1', 'evidence': 'c-round-392.md Notes for B 1', 'title': 'B3: Play with only a failed clip sets data-playing true', 'status': 'ruled (D-29z1339): the D-29z1326 contract (Play plays and warns; missing media plays as silence, Live 12 manual 5.6); next regression B3 row reads "playing true, no buffer of the failed id started, the warning text exact"', 'added': BY})
d['open_findings'].append({'id': 'INFO-C392-FIRSTLOAD-OBSERVER', 'severity': 'info', 'origin': 'C round 392 note (neighbour first load)', 'evidence': 'c-round-392.md neighbour first load', 'title': 'the first-load "Loading the demo collection" text was not observed because the observer was installed after it', 'status': 'probe note (D-29z1339): install the status observer with addInitScript; not a bug', 'added': BY})
d['deferred_low_polish'].append({'id': 'A-R393-SKETCH-L4-EXTERNAL-PAUSE', 'severity': 'low', 'origin': 'B sketch review (tech-lead), round 393 planning', 'evidence': 'b-round-392/sketch-review.md #4', 'title': 'a streamed preview paused externally (OS media session) never resumes on a same-url seek and keeps libraryPreviewSourceId', 'status': 'deferred_low_polish (D-29z1341)', 'added': BY})
for o in by_id('SRW-21-PLAN'):
    o.setdefault('scope_additions', []).append('sketch-review #5 (round 393): a collection change does not stop an active stream; a late stream error re-enters with an old id (D-29z1341)')
for o in by_id('PERF-13c'):
    o['stages_d29z1340'][1]['scope_additions'] = ['REV-B393-M1-STALL (Medium, sketch review): stall watchdog (no playing within 8 s or stalled that long -> stream error)', 'sketch-review #2: fall back only on NotSupportedError/media errors, not NotAllowedError', 'sketch-review #9: a synchronously throwing play() is not caught']
d['open_findings'].append({'id': 'REV-B393-M1-STALL', 'severity': 'medium', 'origin': 'B sketch review (tech-lead), round 393 planning', 'evidence': 'b-round-392/sketch-review.md #1', 'title': 'a stalled streamed preview (stalled/waiting, no error) never recovers: Stop stays shown with a frozen cursor', 'status': 'scheduled PERF-13c-ii (D-29z1341): 13c-i streams same-origin static demo files only; the decode path has the same hung-fetch exposure today; not a shipped defect until 13c-i lands', 'added': BY})
for o in by_id('SRW-21-PLAN'):
    o.setdefault('scope_additions', []).append('A-R392-REVIEW-M1 + A-R392-REVIEW-L1 (collection swap: old clip -> sourceNotLoaded; failure-before-abort) (D-29z1338)')
    o.setdefault('scope_additions', []).append('PERF-13c-ii: purchased previewUrl from signed stemUrls (fresh per call, expiry) (D-29z1340)')

decs = [
 ('D-29z1336', 'Round 392 result: C PASS (c-round-392.json, browserVerified/realVerified true, 0 bugs); gate 392 published c1183a0 (rounds 389-392). PERF-13b-ii done; C-R391-01 closed (B7/B8/B9 at 1440+1280). tasks/round-392.md archived.'),
 ('D-29z1337', 'ARCH-CHECKPOINT-DECODE-REGION still unanswered: B rules KEEP (three independent reads agree), extraction of the pure settle helper = candidate after PERF-13c with root approval; PERF-13c-i proceeds with new code in preview.client.ts and a provider change limited to the branch choice and one fallback ref. Request stays open.'),
 ('D-29z1338', 'A-R392-REVIEW-M1 -> Low (unreachable: one provider mount, constant collection), deferred with prerequisite_for SRW-21-PLAN; A-392 review L1-L3, GATE392-L1, GATE392-L2 -> deferred_low_polish; GATE392-L3 info watch.'),
 ('D-29z1339', 'C round 392 notes: INFO-C392-B3-PLAYING ruled as the D-29z1326 contract (row wording for the next regression); INFO-C392-FIRSTLOAD-OBSERVER = probe note.'),
 ('D-29z1340', 'PERF-13c split: 13c-i (round 393, demo URL sources stream) / 13c-ii (purchased previewUrl, BLOCKED browser half in cloud; harness preview row; cache warm). Premise measured at HEAD (b-round-392/premise/premise-head.json). Consults: performance-optimizer, tech-lead (b-round-392.md section 4).'),
 ('D-29z1341', 'PERF-13c-i rulings: stream only when ready + not cached + previewUrl; bare HTMLAudioElement (routing-equivalent: both preview paths bypass master); no status while buffering; any stream error -> decode path at the element time, remembered per collection (the decode path then writes the honest round-392 texts); stem cache not warmed (signal); no new persistent screen element.'),
]
for i, t in decs:
    d['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': BY, 'decision': t})
for r in d['rounds']:
    if r.get('round') == 392:
        r['status'] = 'done: C PASS (c-round-392.json), gate published c1183a0 (D-29z1336)'
d['rounds'].append({'round': 393, 'task': 'current-task.md', 'decision': 'D-29z1336..D-29z1341', 'type': 'PERF-13c-i: library preview streams URL sources through a media element; fallback to decode on a stream error; doc 252', 'status': 'dispatched', 'note': 'baseline c1183a0 (clean); grants b-round-392/grants-393.txt (7); frozen b-round-392/r393-frozen-sha256.txt (1280); claims b-round-392/claims-393.sh K1..K22; sketch b-round-392/sketch-393.patch.txt', 'added': BY})
(L / 'backlog.json').write_text(json.dumps(d, ensure_ascii=True, indent=2))
marker.write_text('applied v360\n')
print('ok v360')
