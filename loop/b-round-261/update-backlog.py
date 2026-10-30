import json, sys
P = sys.argv[1]
b = json.load(open(P, encoding='utf-8'))
DATE = '2026-10-30'
ADDED = f'{DATE} B round 261 -> 262 planning'
def one(lst, key, val):
    r = [x for x in lst if isinstance(x, dict) and x.get(key) == val]
    assert len(r) == 1, (key, val, len(r))
    return r[0]

b['updated'] = f'{ADDED} (D-29z530..D-29z538)'
b['current_task'] = 'current-task.md (round 262, D-29z530..D-29z538; SABA-B-9 stage 2: ArrangementMaster from the header to the footer last row left of Shortcuts ?; studioMasterStrings; perf allowlist 6 -> 5; baseline 10e1cd4, grants 9 + doc 196, frozen 1111)'

r261 = one(b['rounds'], 'round', 261)
r261['status'] = 'done: C round 261 PASS (browserVerified=true, realVerified=true, 10/10 rows, 0 bugs); gate 261 published 10e1cd4 (rounds 260-261) | ' + r261['status']
b['rounds'].append({'round': 262, 'task': 'current-task.md', 'decision': 'D-29z530..D-29z538', 'status': 'dispatched', 'type': 'SABA-B-9 stage 2: master volume to the workspace bottom-right (footer last row, left of Shortcuts ?) + studioMasterStrings (SIG-R261-INLINE-LABELS partial)', 'note': 'baseline 10e1cd4 clean (gate 261 published); grants b-round-261-r262-grants.txt (9); new b-round-261-r262-new-files.txt (doc 196); frozen 1111 b-round-261-r262-tree-sha256.txt; probe b-round-261/probe/ (header 35, footer 49 -> 53, scroller -4, 0 overlaps at 1440/1280/1024); scratch pre-check 23 files: 3 failed = granted rows, tsc rc 0', 'next': 'PASS -> SABA-B-9 done; round 263 = REGRESSION if planned on/after 2026-11-02, else L46-CONTRACT-CHECKS', 'added': ADDED})

for fid in ('C-R260-01', 'C-R260-02'):
    f = one(b['open_findings'], 'id', fid)
    f['status'] = 'closed (D-29z530): C round 261 RT-FIX-261 PASS (c-round-261/rt-fix.txt), published 10e1cd4 | ' + f['status']

st = one(b['systemic_tasks'], 'id', 'PERF-HARNESS-STRINGS-DRIFT')
st['status'] = 'done (D-29z530): C round 261 PASS (PERF-SWEEP 0, WIRING, ALLOWLIST-TRUE 6/6, MUTANT-PERF perf/ TS2551, PERF-RUN rc 0 3/3 0 deltas), published 10e1cd4 | ' + str(st.get('status', ''))

rr = one(b['retro_runs'], 'round', 260)
rr['status'] = 'done (D-29z530): RT-FIX-261 C PASS round 261, published 10e1cd4 | ' + str(rr.get('status', ''))

q = one(b['post_current_stage_queue'], 'id', 'SABA-B-9-10-11-TRANSPORT-GRID')
q['status'] = 'in_progress (D-29z531): round 261 PERF-HARNESS-STRINGS-DRIFT done (C PASS, published 10e1cd4); round 262 = SABA-B-9 stage 2 (master bottom-right); then L46-CONTRACT-CHECKS, SABA-B-11c, SYS-6 | ' + q['status']
s9 = one(q['stages'], 'id', 'SABA-B-9')
s9['status'] = 'in_progress (D-29z531): stage 1 done (d732d26); stage 2 dispatched round 262 (footer last row left of Shortcuts ?, D-29z532; Saba question SABA-Q-9-MASTER-ROW) | ' + s9['status']

sig = one(b['architecture_signals'], 'id', 'SIG-R261-INLINE-LABELS')
sig['status'] = 'partly scheduled (D-29z533): the 3 Master labels (Master, Master Mute, Master Volume) move to studioMasterStrings in round 262 and leave the perf allowlist (6 -> 5); Export/Undo (ArrangementTransport), Clip Gain fader (DetailPanel), Volume/Pan (Lane) stay signals; + 7th pattern rangeLabelEnd separators inline in ArrangementClip.tsx (C-R261-N3); + undo label Master Volume inline in ArrangementContext.tsx | ' + sig['status']
b['architecture_signals'] += [
    {'id': 'GATE261-S1-NEEDLE-GUARD', 'source': 'gate 261 review Suggestion 1 (gates/round-261/review.md)', 'text': 'nothing reads perfInlineLabels sourceFile/sourceNeedle; a small node test could assert each needle is present, turning class (b) into a gated check without app/** changes', 'status': 'signal (D-29z536); not scheduled; alternative to moving the remaining inline labels (SIG-R261-INLINE-LABELS)', 'added': ADDED},
    {'id': 'GATE261-ARCH-KEEP-ADAPTER', 'source': 'gate 261 review Architecture note + A round 261 reviewer', 'text': 'perf/lib/app-labels.ts is a one-way stateless adapter onto strings.ts (keep); risk: a future ~ import in strings.ts breaks the Playwright loader (doc 195 limit 4)', 'status': 'signal (D-29z536)', 'added': ADDED},
]
b['deferred_low_polish'] += [
    {'id': 'GATE261-S2-EXPORT-NEEDLE-INDENT', 'severity': 'low', 'origin': 'gate 261 review Suggestion 2', 'title': "perf/lib/app-labels.ts exportButton needle '          Export' depends on indentation (a reflow breaks ALLOWLIST-TRUE loudly, not silently)", 'repro': 'source perf/lib/app-labels.ts (exportButton entry)', 'status': 'deferred_low_polish (D-29z536); closes with SIG-R261-INLINE-LABELS (move Export into strings.ts) or GATE261-S1', 'added': ADDED},
    {'id': 'GATE261-S3-FIXTURE-CONST', 'severity': 'low', 'origin': 'gate 261 review Suggestion 3', 'title': 'perf/lib/app-labels.ts perfFixtureTracks lacks as const / satisfies Record<string, string>', 'repro': 'source', 'status': 'deferred_low_polish (D-29z536)', 'added': ADDED},
    {'id': 'GATE261-S4-ALIAS-CONSTS', 'severity': 'low', 'origin': 'gate 261 review Suggestion 4', 'title': 'membersSourceTitle (studio-lab.perf.spec.ts) and wavDonePattern (studio-lab-resources.perf.spec.ts) are aliases of the imports (cosmetic)', 'repro': 'source', 'status': 'deferred_low_polish (D-29z536)', 'added': ADDED},
]
b['retro_candidates'] += [
    {'id': 'C-R261-N1-SWEEP-FORMS', 'added': ADDED, 'text': "B's K3 literal sweep missed browser-side textContent === 'Add' forms (3 sites); an app-text sweep should include === ' and includes(' forms (L23/L29 sweep clause candidate); A found and wired them", 'status': 'candidate for RETRO 275'},
    {'id': 'C-R261-N2-WIRING-WORDING', 'added': ADDED, 'text': "write 'no copy of a class (a) value' instead of 'no literal equals a strings.ts value' (collides with fixture data equal by coincidence)", 'status': 'candidate for RETRO 275'},
]
b['open_findings'] += [
    {'id': 'C-R261-N4', 'severity': 'info', 'origin': 'C round 261', 'title': 'npx tsx installed tsx@4.23.15 into the npm cache (outside store/); store unchanged (same class as C-R29-NPX-CACHE)', 'status': 'root_note', 'added': ADDED},
    {'id': 'C-R261-N5', 'severity': 'info', 'origin': 'C round 261', 'title': "C's first G261-AUTH script waitFor (Add, visible) timed out right after the perf run; rerun with the harness readiness predicate passed, 0 page errors; not reproduced, not an app bug", 'status': 'watch (D-29z537)', 'added': ADDED},
    {'id': 'SABA-Q-9-MASTER-ROW', 'severity': 'info', 'origin': 'B round 261 -> 262 planning (L43/L44, D-29z532)', 'title': "Saba question, SABA-B-9 stage 2: (a) Master as a Main-track row under the lanes (Live 12 manual 18.4 'bottom end of the Arrangement View') instead of the footer corner (default: footer, no new strip); (b) swap Master and Shortcuts ? so Master is the very corner (default: Shortcuts ? keeps its corner); (c) a show/hide for Master like Live's Ctrl+Alt+M (6.15) (default: none); (d) lane mixers on the left while Live shows Arrangement Track Controls on the right (6.15 caption) (default: unchanged)", 'status': 'awaiting_user', 'added': ADDED},
]
fold = one(b['deferred_low_polish'], 'id', 'GATE257-NARROW-TOOLBAR-OVERLAP')
fold['status'] = fold['status'] + ' | D-29z534: not folded into SABA-B-9 stage 2 (ArrangementTransport.tsx not granted; stage 2 changes only the master parent); stays in the polish pass'
req = one(b['architecture_checkpoint_requests'], 'id', 'ARCH-CHECKPOINT-TRANSPORT-POSITIONS')
req['addenda'] = req.get('addenda', []) + ['b-round-261-checkpoint-addendum.md (D-29z538): SABA-B-9 feature boundary; question 8 master placement + label ownership (strings.ts vs inline) across Transport/Master/Lane/DetailPanel']
D = [
 ('D-29z530', 'Round 261 closed: C PASS (10/10, browserVerified/realVerified true, 0 bugs), gate 261 published 10e1cd4; PERF-HARNESS-STRINGS-DRIFT done; C-R260-01/02 closed; retro_runs 260 done; C spec-tension rulings 1-3 confirmed (templated strings byte-equal; fixtures Music/Stems are not copies; rangeLabelEnd is a parser, added to SIG-R261-INLINE-LABELS).'),
 ('D-29z531', 'Round 262 = SABA-B-9 stage 2 (task 261 section 4 row 1; 2026-10-30 < 2026-11-02, regression not due).'),
 ('D-29z532', 'Placement ruling: ArrangementMaster renders in the footer last row directly before Shortcuts ? (the workspace bottom-right corner; no new strip); Shortcuts ? keeps its corner (only the master move is approved; L4); footer +4 px (20 px Master row vs 16 px) and scroller -4 px measured at 1440/1280, header 35 and toolbar 49/87 unchanged; M button not resized. Live 12 18.4 Main track at the bottom end of the Arrangement View is a Main-track row: asked as SABA-Q-9-MASTER-ROW (a)-(d), not built.'),
 ('D-29z533', 'SIG-R261-INLINE-LABELS reconsidered: the 3 Master labels move to studioMasterStrings (rendered text byte-identical); perf allowlist 6 -> 5 with perfMasterVolumeLabel; Transport/Lane/DetailPanel labels stay signals (not granted); C-R261-N3 rangeLabelEnd and the ArrangementContext undo label added to the signal.'),
 ('D-29z534', 'GATE257-NARROW-TOOLBAR-OVERLAP not folded into stage 2: ArrangementTransport.tsx is not granted; stays deferred_low_polish.'),
 ('D-29z535', 'L28 multi-stage: doc 193 l.4 granted to Completed (C round 262 PASS); new doc 196; doc 176 In Progress stays tied to the open STUDIO-PERFORMANCE harness stage.'),
 ('D-29z536', 'Gate 261 review: S1 needle guard and the adapter keep-note -> architecture_signals; S2/S3/S4 -> deferred_low_polish (perf test code, Low); S5 (test:perf as a gate smoke) is the existing Saba proposal from retro-260 section 12.'),
 ('D-29z537', 'C round 261 info: N1/N2 -> retro_candidates (RETRO 275); N4 root_note; N5 watch.'),
 ('D-29z538', 'Feature boundary: SABA-B-9 completes with round 262; bounded addendum b-round-261-checkpoint-addendum.md to the pending ARCH-CHECKPOINT-TRANSPORT-POSITIONS (non-blocking); no new request.'),
]
for i, t in D:
    b['decisions_log_b'].append({'id': i, 'date': DATE, 'text': t})
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
