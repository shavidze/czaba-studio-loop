import json, pathlib, sys
L = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop')
marker = L / 'b-round-394/update-backlog.done'
if marker.exists():
    print('already applied'); sys.exit(0)
d = json.loads((L / 'backlog.json').read_text())
assert d['version'] == 361, d['version']
BY = '2026-11-07 B round 394 -> 395 planning'
d['version'] = 362
d['updated'] = BY
d['current_task'] = 'Round 395: PERF-13c-ii-a fix-up on the unpublished round-394 tree: a same-url seek restarts an armed stall watchdog (C-R394-01); PS25/PS26 + PS22 asserts; doc 252 l.4 "C round 395 PASS" (current-task.md)'
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
R394 = 'round 394 tree (unpublished; gate 394 skipped, C FAIL): C browser PASS on its rows'
for i, row in [('REV-B393-M1-STALL', 'R1 no-click HOLD (8369/8362 ms), but C-R394-01 (wave click before playing) still reproduces the stuck Stop -> stays open; fix-up round 395 (D-29z1348)'),
               ('GATE393-M1-SYNC-THROW', 'jsdom PS22/PS23 only (not browser-testable); stays open until gate 395 publishes (D-29z1347)'),
               ('A-R393-REVIEW-M1-EXTERNAL-PAUSE', 'R2 PASS both viewports; stays open until gate 395 publishes (D-29z1347)')]:
    for o in by_id(i):
        prepend(o, 'status', f'{R394}: {row}')
d['open_findings'].append({'id': 'C-R394-01', 'alias': 'A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING', 'severity': 'medium', 'origin': 'B spec (round-394 ruling "not armed by a same-URL seek"); found by A code-reviewer (STOP), browser-confirmed by C', 'evidence': 'c-round-394.json bugs[0]; c-round-394/rows-R1.json R1b_seekBeforePlaying-*; a-round-394.md STOP; b-round-394/probe/rows-R1b.json (sketch fixes it: 8296/8300 ms after the seek)', 'title': 'HOLD stream + wave click before playing: the seek moves currentTime, the watchdog expiry sees moved time, never re-arms; toggle stays Stop forever (23.6 s observed, both viewports)', 'status': 'scheduled round 395 (D-29z1348): option (a) - a same-url seek restarts an already armed timer (re-reading armedAt), never arms one; PS25 + MU-395-SEEK-NO-REARM; C row R1b binding', 'added': BY})
d['deferred_low_polish'].append({'id': 'A-R394-REVIEW-L3-REENTRANT-SYNC-THROW', 'severity': 'low', 'origin': 'A round 394 code-reviewer (record only)', 'evidence': 'a-round-394.md Code-reviewer Low 3', 'title': 'a synchronous throw calls onStreamError re-entrantly inside the provider startLibraryPreview; safe today (provider returns right after), no provider-level test', 'status': 'deferred_low_polish (D-29z1349): candidate row with the preview-controller extraction (ARCH-CHECKPOINT-PREVIEW-AFTER-13C)', 'added': BY})
for i, t in [('A-R394-REVIEW-L1-PS22-ASSERTS', 'PS22 lacks two asserts of the task row (src removed in case 1, offset null in case 2)'), ('A-R394-REVIEW-L2-PS21A-LISTENER-REMOVAL', 'PS21(a) cannot catch a listener detach failed to remove; no row asserts the 4 new removals')]:
    d['open_findings'].append({'id': i, 'severity': 'low', 'origin': 'A round 394 code-reviewer', 'evidence': 'a-round-394.md Code-reviewer', 'title': t, 'status': 'scheduled round 395 (D-29z1349): same file, the round owns it, cheap (2026-10-23 rule: a Low may be fixed when the round owns the code)' + ('; PS26 + MU-395-PAUSE-LISTENER-LEFT' if 'L2' in i else '; two asserts added to PS22'), 'added': BY})
for o in by_id('ARCH-CHECKPOINT-PREVIEW-AFTER-13C'):
    o.setdefault('signals', []).append('A-R394-ARCH-STREAM-WATCHDOG-UNIT: preview.client.ts stream closure now holds 6 listeners, a timer and 3 handlers; reviewer advice keep now, consider a stream-watchdog unit inside the preview-controller extraction (D-29z1349)')
d['architecture_signals'].append({'id': 'A-R394-ARCH-STREAM-WATCHDOG-UNIT', 'origin': 'A round 394 code-reviewer Architecture note', 'note': 'one closure owns 6 listeners, a timer and 3 handlers; keep for now; candidate stream-watchdog unit in the preview-controller extraction', 'status': 'recorded (D-29z1349); joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C; not scheduled', 'added': BY})
d['retro_candidates'].append({'id': 'RC-R394-GESTURE-IN-DEGRADED-STATE', 'decision': 'D-29z1350', 'round': 394, 'note': 'round-394 rows tested the stall (R1, no gesture) and the false positive (R3, gesture while healthy) separately; no row put a user gesture inside the degraded state (wave click during HOLD), which is where the ruling "seek never arms" broke. Candidate lesson for RETRO 400: for every watchdog/timeout/degraded-state fix, an acceptance row repeats each user gesture the feature accepts while the degraded state is active.', 'status': 'open (RETRO 400 input)', 'added': BY})
for o in by_id('PERF-13c'):
    prepend(o, 'status', 'in_progress (D-29z1347): 13c-ii-a round 394 C FAIL (C-R394-01, Medium); tree kept; fix-up round 395 on the same tree')
    for st in o.get('stages_d29z1340', []):
        if st.get('id') == 'PERF-13c-ii-a':
            prepend(st, 'status', 'bug (D-29z1347): round 394 C FAIL C-R394-01; round 395 fix-up (D-29z1348)')
            st.setdefault('closes', []).extend(['C-R394-01', 'A-R394-REVIEW-L1-PS22-ASSERTS', 'A-R394-REVIEW-L2-PS21A-LISTENER-REMOVAL'])
decs = [
 ('D-29z1347', 'Round 394 result: C FAIL (c-round-394.json: browserVerified/realVerified true; 1 Medium C-R394-01 = A STOP A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING; R1-R7, PERF-RES, AUTH, SOURCE-SCOPE, DOC-252 PASS). Gate 394 skipped (not published). A\'s 3 granted files stay in the tree (never reverted); round 395 builds on them. Nothing moves to done; the three round-394 Mediums stay open until gate 395 publishes. tasks/round-394.md archived.'),
 ('D-29z1348', 'Ruling on A\'s STOP: option (a). A same-url seek restarts an already armed stall timer, re-reading armedAt (the progress rule), and never arms one. Supersedes the round-394 §1 line "not armed by: a same-URL seek". Option (b) (record as known gap) rejected: a Medium reachable by an ordinary click is not a known gap under the 2026-10-23 bug gate. Sketch b-round-394/sketch-395.patch.txt (sha 558694697085f2bc): field restartArmedStall on ActiveStreamPreview, used by progress and by the seek try after the currentTime assignment. Evidence: covering 14 files 258 tests rc0, mutants 15/15 red, C\'s own R1b probe on a scratch server: fallback 8296/8300 ms after the seek at both viewports; R1/R2/R3/R6 unchanged.'),
 ('D-29z1349', 'A-394 review Lows: L1 (PS22 asserts) and L2 (listener removal -> PS26) fixed in round 395 (same file); L3 re-entrant sync throw -> deferred_low_polish; architecture note A-R394-ARCH-STREAM-WATCHDOG-UNIT recorded, joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C (not scheduled).'),
 ('D-29z1350', 'Retro candidate RC-R394-GESTURE-IN-DEGRADED-STATE for RETRO 400 (no lessons.md edit now: not a Saba-reported issue).'),
]
for i, t in decs:
    d['decisions_log_b'].append({'id': i, 'date': '2026-11-07', 'by': BY, 'decision': t})
for r in d['rounds']:
    if r.get('round') == 394:
        r['status'] = 'C FAIL (c-round-394.json, C-R394-01 Medium); gate 394 skipped; tree kept for round 395 (D-29z1347)'
d['rounds'].append({'round': 395, 'task': 'current-task.md', 'decision': 'D-29z1347..D-29z1350', 'type': 'PERF-13c-ii-a fix-up: same-url seek restarts the armed stall watchdog (C-R394-01) + PS22 asserts + PS26 listener removal; doc 252 l.4', 'status': 'dispatched', 'note': 'baseline HEAD 1091b9e + the 3 round-394 granted files modified (unpublished, kept); grants b-round-394/grants-395.txt (same 3); frozen b-round-393/r394-frozen-sha256.txt (1284, still valid: it excludes the 3 grants); claims b-round-394/claims-395.sh K1..K19; sketch b-round-394/sketch-395.patch.txt', 'added': BY})
(L / 'backlog.json').write_text(json.dumps(d, ensure_ascii=True, indent=2))
marker.write_text(BY + '\n')
print('ok v362')
