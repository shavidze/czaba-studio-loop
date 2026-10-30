import json, sys
P = sys.argv[1]
b = json.load(open(P, encoding='utf-8'))
DATE = '2026-10-30'
ADDED = f'{DATE} B round 262 -> 263 planning'
def one(lst, key, val):
    r = [x for x in lst if isinstance(x, dict) and x.get(key) == val]
    assert len(r) == 1, (key, val, len(r))
    return r[0]
b['updated'] = f'{ADDED} (D-29z539..D-29z545)'
b['current_task'] = 'current-task.md (round 263, D-29z539..D-29z545; GATE262-TRACK-LAYOUT fix-up: one granted test file track-layout.test.tsx l.867/873 footer-row children 2 -> 3 with Master pinned in the middle; baseline 10e1cd4 + unpublished round-262 diff; frozen 1120 b-round-262-r263-tree-sha256.txt)'
r262 = one(b['rounds'], 'round', 262)
r262['status'] = 'c_pass_gate_failed (D-29z539): C round 262 PASS (browserVerified=true, realVerified=true, 17 task rows, 1 Low pre-existing C-R262-01); gate 262 FAILED verify exit 1: track-layout.test.tsx l.867 row.children toHaveLength(2) got 3 (footer last row now holds Master); unpublished; build and e2e smoke not reached | ' + r262['status']
b['rounds'].append({'round': 263, 'task': 'current-task.md', 'decision': 'D-29z539..D-29z545', 'status': 'dispatched', 'type': 'gate-262 fix-up (test-only): track-layout.test.tsx footer-row structure asserts 2 -> 3 children, Master pinned as the middle child', 'note': 'baseline HEAD 10e1cd4 + the unpublished round-262 working diff (9 M + doc 196); grant b-round-262-r263-grants.txt (1 file); frozen 1120 b-round-262-r263-tree-sha256.txt (includes the 9 round-262 files at their C-verified bytes and doc 196); B scratch pre-check: 4 files 81/81 green, mutant (Master removed from footer) red at the amended row, tsc rc 0, Biome clean (b-round-262/precheck-*)', 'next': 'C PASS -> root gate publishes rounds 262+263; SABA-B-9 -> done; round 264 = L46-CONTRACT-CHECKS (or REGRESSION if planned on/after 2026-11-02)', 'added': ADDED})
q = one(b['post_current_stage_queue'], 'id', 'SABA-B-9-10-11-TRANSPORT-GRID')
q['status'] = 'in_progress (D-29z539): round 262 SABA-B-9 stage 2 C PASS but gate 262 failed (one non-granted test track-layout.test.tsx l.867 pinned the footer row to 2 children); round 263 = test-only fix-up; then L46-CONTRACT-CHECKS, SABA-B-11c, SYS-6 | ' + q['status']
s9 = one(q['stages'], 'id', 'SABA-B-9')
s9['status'] = 'in_progress (D-29z539): stage 2 C round 262 PASS, gate 262 failed (track-layout l.867), not published; fix-up round 263; done only after the gate publishes | ' + s9['status']
b['deferred_low_polish'].append({'id': 'C-R262-01', 'severity': 'low', 'origin': 'C round 262', 'title': 'Escape during a relative fader pointer drag (Master Volume; same hook for track, group, pan, clip gain: useRelativeFaderDrag) does not restore the pre-drag value; the drag commits one history entry. Pre-existing at HEAD 10e1cd4.', 'repro': '/studio-lab; press the Master Volume thumb, move left ~30%, press Escape, release: value stays (-1.5 -> -21.5 dB), one Master Volume undo entry', 'evidence': 'c-round-262/after-audio-keys.json, c-round-262/head/head-audio-keys.json; app/hooks/useRelativeFaderDrag.ts listeners (pointerup, pointercancel, blur only)', 'status': 'deferred_low_polish (D-29z541); product question joined to ESCAPE-CANCEL-GESTURE (Esc-cancel for every relative fader needs a Live source check first); the task-262 KEYS clause "Esc restores" was B wording, not a HEAD contract', 'added': ADDED})
esc = one(b['open_findings'], 'id', 'ESCAPE-CANCEL-GESTURE')
esc['status'] = esc['status'] + ' | D-29z541: + relative faders (track, group, master, pan, clip gain; C-R262-01 evidence). Policy SABA-B-5 lists "Esc-cancel" among fader behaviours to keep, but no fader has it at HEAD (C round 262); decide together with this signal'
sig = one(b['architecture_signals'], 'id', 'SIG-R261-INLINE-LABELS')
sig['status'] = 'Master part done in round 262 (C PASS, awaiting gate) (D-29z542); remaining: Transport Export/Undo, Lane Volume/Pan, DetailPanel Clip Gain, rangeLabelEnd, ArrangementContext undo labels MASTER_VOLUME_LABEL/MASTER_MUTE_LABEL (l.233-234) | ' + sig['status']
b['architecture_signals'] += [
    {'id': 'A-R262-ARCH-FOOTER-ROW', 'source': 'a-round-262.md code-reviewer Architecture note', 'text': 'StudioWorkspace.tsx:3095-3189 footer chrome changed in rounds 193 and 196; if a third round touches this region, extract the footer last row as a presentational child using the placement and FOCUS-KEEP rows as acceptance (value low, risk low)', 'status': 'signal (D-29z542); keep; appended to ARCH-CHECKPOINT-TRANSPORT-POSITIONS context (non-blocking)', 'added': ADDED},
    {'id': 'A-R262-REVIEW-TEST-GAPS', 'source': 'a-round-262.md code-reviewer info', 'text': 'FOCUS-KEEP does not cover the clipLaneDrag branch or the multi-select count <p>; the LABELS source scan misses aria-label={...} and template literals; strings.test.ts does not cover studioMasterStrings', 'status': 'signal (D-29z542); not scheduled', 'added': ADDED},
]
b['deferred_low_polish'].append({'id': 'A-R262-DOC195-STALE-COUNT', 'severity': 'low', 'origin': 'A round 262 (for B)', 'title': 'doc 195 l.18 and l.60 still count Master Volume among the 6 inline perf labels (5 remain after round 262)', 'repro': 'docs/implementation/2026/quarter-IV/195-*.md l.18, l.60', 'status': 'deferred_low_polish (D-29z542); docs only; not folded into the round-263 fix-up', 'added': ADDED})
b['retro_candidates'] += [
    {'id': 'RC-R262-DEST-CONTAINER-GREP', 'added': ADDED, 'text': "B's L23 pre-check grepped only the moved element's tokens (Master labels, testids); a non-granted test pinning the destination container's structure (track-layout l.867 footer row children = 2) was missed and failed the gate after a C PASS. Lesson L23 amended (D-29z543).", 'status': 'candidate for RETRO 275'},
    {'id': 'RC-R262-METER-MUTE-BOUND', 'added': ADDED, 'text': "task-262 AUDIO row '-inf within 1 s' after M is not achievable with a 20 dB/s meter release from 0 dB (measured 1.08-1.10 s at -26.5 dB; HEAD identical). C's suggested wording: after M the meter falls at <= the release rate from the click and reads -inf by (level+60)/20 s + 0.2 s.", 'status': 'candidate for RETRO 275; use C wording in future meter rows'},
    {'id': 'RC-R262-NARROW-TRUNCATE-BOXES', 'added': ADDED, 'text': 'leaf-box overlap scans count spans hidden by truncate as overlaps; clip leaf boxes to the <p> box first (C round 262 note)', 'status': 'candidate for RETRO 275'},
]
D = [
 ('D-29z539', 'Round 262: C PASS (17 rows, browserVerified/realVerified true) but gate 262 failed (verify exit 1: track-layout.test.tsx l.867 footer row children 2 -> 3). Round 262 = c_pass_gate_failed, unpublished; SABA-B-9 stays in_progress (task 262 section 6 row 1 assumed a passing gate).'),
 ('D-29z540', 'Round 263 = GATE262-TRACK-LAYOUT test-only fix-up: grant only track-layout.test.tsx; both toHaveLength(2) (l.867, l.873) become 3 with children[0] = reserve/line, children[1] = [data-testid=arrangement-master], children[2] = Shortcuts button (no assertion lost, stronger). Baseline 10e1cd4 + the unpublished round-262 diff, frozen at its C-verified bytes (1120 entries). Regression not due (2026-10-30 < 2026-11-02).'),
 ('D-29z541', 'C-R262-01 (Escape does not cancel a relative fader drag; pre-existing) -> deferred_low_polish and joined to ESCAPE-CANCEL-GESTURE; the task-262 KEYS Esc clause was B wording, not a HEAD contract; policy SABA-B-5 Esc-cancel wording noted for the joint decision.'),
 ('D-29z542', 'A round 262 notes: Architecture note A-R262-ARCH-FOOTER-ROW and review test gaps -> architecture_signals (keep); doc 195 stale label count -> deferred_low_polish (docs, Low); SIG-R261-INLINE-LABELS Master part done pending gate.'),
 ('D-29z543', 'Lesson L23 amended (no new line; lessons.md stays <= 60): when an element moves into a container, grep app/**/__tests__ for the testids and role names of that container\'s existing children and run every hit (evidence: gate 262 track-layout l.867).'),
 ('D-29z544', 'Docs under L28: doc 196 and doc 193 l.4 stay "Completed (C round 262 PASS)" (true: C round 262 passed; rounds 262 and 263 publish together); both frozen in round 263.'),
 ('D-29z545', 'C round 262 notes: spec tension 1 (meter -inf bound) and the NARROW truncate-box note -> retro_candidates RETRO 275; the A dev-server hydration error did not reproduce (no finding).'),
]
for i, t in D:
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': t})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(b['deferred_low_polish']))
