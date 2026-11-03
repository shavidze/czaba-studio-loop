import json
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
assert b['version'] == 279 and b['decisions_log_b'][-1]['id'] == 'D-29z879', 'already applied or unexpected state; do not re-run'
A = '2026-11-03 B round 320 -> 321 planning'
EV = 'C round 320 PASS (c-round-320.json: 24 rows passed incl. PERF-RANGE 108.167 -> 9.233/move, max 30, R-rows and G320-AUTH at both viewports, 4 WAV byte-identical; browserVerified/realVerified true; 1 Low C-R320-01) and gate 320 published 53c5c79 on both remotes'
q = {e['id']: e for e in b['post_current_stage_queue']}
sp = q['STUDIO-PERFORMANCE']; st = {s['id']: s for s in sp['stages']}
of = {x.get('id'): x for x in b['open_findings']}
rc = {x.get('id'): x for x in b['retro_candidates']}
D = lambda i, t: b['decisions_log_b'].append({'id': i, 'date': '2026-11-03', 'text': t})

# D-29z880 round 320 accepted; PERF-8a done
for r in b['rounds']:
    if r.get('round') == 320: r['status'] = 'done: ' + EV + ' (D-29z880)'
st['PERF-8a']['status'] = 'done (D-29z880): ' + EV + ' | ' + st['PERF-8a']['status']
st['PERF-8']['status'] = 'in_progress (D-29z880): PERF-8a done (rounds 318-320, 53c5c79); PERF-8b next code round (after REGRESSION when due) | ' + st['PERF-8']['status']
st['PERF-8b']['status'] = 'not_started (D-29z888): next code round after RETRO 321 unless REGRESSION is due; carries GATE320-S2 browser experiment row and GATE320-L1 doc 230 line; reads ARCH-CHECKPOINT-PERF8-STORE-PATTERN result if present, else follows D-29z193 (zustand) | ' + st['PERF-8b']['status']
st['PERF-10']['required_rows_d29z880'] = ['C-R320-01: render-budget row ArrangementPeakPathInner / ArrangementDetailPlayheadInner / ArrangementDetailWaveformInner / ArrangementRangeReadoutInner = 0 per range-drag move with the detail panel open; each memo-removal mutant (const X = XInner) turns it red', 'GATE320-S3: background all-lanes drag as a record row in perf/budgets.interactions.json', 'A-R320-REVIEW-WAVEFORM-NAME-POSITIVE: a positive count for ArrangementDetailWaveformInner (folded into the C-R320-01 row)']
closed = {
 'C-R318-01': 'closed (D-29z880): readout memo + overlay child landed; C round 320 PERF-NAMED: every added fiber is the overlay/readout; non-range rows 0 rises',
 'C-R318-02': 'closed (D-29z880): C round 320 PERF-RANGE 9.233/move <= 15, max 30 <= 35',
 'C-R318-03': 'closed (D-29z880): notices regenerated (564), TL5 green in C round 320 UNIT',
 'C-R318-04': 'closed (D-29z880): K14 5, doc 230, review and mutants delivered (C round 320)',
 'C-R319-01': 'closed (D-29z880): XInner form, K24 0, NAME-LIVE all five names > 0 (C round 320)',
 'C-R319-02': 'closed (D-29z880): every missing deliverable present (C round 320 SOURCE-SCOPE/CLAIMS)',
 'C-R319-03': 'closed (D-29z880): RS8 red under C-MU-DETAIL-IGNORE-PROP and MU-DETAIL-IGNORE-STORE (C round 320)',
}
for i, s in closed.items(): of[i]['status'] = s + ' | ' + of[i]['status']
b['open_findings'] += [
 {'id': 'C-R320-01', 'severity': 'low', 'origin': 'B spec', 'title': "the round's four memo boundaries (Playhead, PeakPath, DetailWaveform, RangeReadout) have no guard that can fail; budget <= 15 is met by the no-memo tree (14.15)", 'source': 'c-round-320.json bugs[0]; c-round-320/mutants.txt', 'status': 'open, scheduled (D-29z880): required row in PERF-10 (tech-lead: L8, PERF-10 owns the same boundaries); not deferred', 'added': A},
 {'id': 'INFO-C320-EXPORT-ESC-FLAKE', 'severity': 'info', 'origin': 'environment', 'title': 'one 1280-reload run crashed at the project export (dialog overlay intercepted the Export click); 0/6 in a targeted probe on both builds', 'status': 'noted (D-29z880): harness timing, not an app bug', 'added': A},
 {'id': 'INFO-C320-LONGTASK', 'severity': 'info', 'origin': 'environment', 'title': 'prod load.longtask-max median 0 -> 69 (wall-clock, 12-commit loads; baseline 12-commit sample had 99 ms)', 'status': 'noted (D-29z880): wall-clock row, info only', 'added': A},
 {'id': 'INFO-C320-COLD', 'severity': 'info', 'origin': 'environment', 'title': 'baseline dev warm-up and G320-AUTH attempt 1 timed out on cold dev compiles; each replaced once', 'status': 'noted (D-29z880): L38 warm-up', 'added': A},
]
b['architecture_signals'].append({'id': 'A-R320-ARCH-USE-DETAIL-RANGE', 'origin': 'A round 320 code-reviewer', 'note': 'useDetailRange(override) hook used only in the two leaves that need the range (waveform overlay, range inputs); done = RS8 green + render-budget row ArrangementDetailContentInner = 0 during a range drag', 'status': 'signal (D-29z880) -> PERF-10, with A-R319-ARCH-DETAIL-SUBSCRIPTION and SIG-R320-WAVEFORM-VIDEO-NONBAIL; not scheduled', 'added': A})
b['deferred_low_polish'].append({'id': 'A-R320-REVIEW-EXPORT-RENDER-READ', 'severity': 'low', 'origin': 'A code-reviewer', 'source': 'a-round-320.md l.117', 'title': 'ArrangementExportDialog export onClick builds renderWindow from the render-time selector value (second render-time read besides applyDetailRange); judged harmless', 'repro': 'code reading at 53c5c79', 'status': 'deferred_low_polish (D-29z880): document as an intended exception or switch to getState(); may ride the next round that owns ArrangementExportDialog.tsx', 'added': A})
D('D-29z880', 'Round 320 accepted: ' + EV + '. PERF-8a done. Closed: C-R318-01/02/03/04, C-R319-01/02/03. C-R320-01 -> required row in PERF-10 (tech-lead; L8), not deferred. A-R320-REVIEW-WAVEFORM-NAME-POSITIVE folded into that row; A-R320-REVIEW-EXPORT-RENDER-READ -> deferred_low_polish; A-R320-ARCH-USE-DETAIL-RANGE signal -> PERF-10. INFO-C320-EXPORT-ESC-FLAKE, -LONGTASK, -COLD noted. C-R318-06 stays open_low_provisional with its REGRESSION repro row.')

# D-29z881 gate-320 triage
b['open_findings'] += [
 {'id': 'GATE320-C1-HOOK-SHAPE', 'severity': 'critical (reviewer)', 'origin': 'gate reviewer', 'source': 'gates/round-320/review.md finding 1', 'title': 'useArrangement() shape changed (range removed) without a grant the reviewer could find', 'status': 'closed (D-29z881): granted in tasks/round-318.md l.102 (range removed from ArrangementContextValue, D-29z863..); root published 53c5c79; the missing doc line -> GATE320-L1-DOC230-GRANT-LINE', 'added': A},
 {'id': 'GATE320-L1-DOC230-GRANT-LINE', 'severity': 'low', 'origin': 'gate reviewer', 'source': 'gates/round-320/review.md finding 1 fix', 'title': "doc 230 'გადაწყვეტილებები' lacks the D-ID line that range leaves useArrangement() (read with useArrangementRange)", 'status': 'open (D-29z881): rides PERF-8b (same feature PERF-8; one granted doc line; bug-gate exception, costs little)', 'added': A},
 {'id': 'GATE320-S2-POST-AWAIT-ORDER', 'severity': 'low (provisional)', 'origin': 'gate reviewer', 'source': 'gates/round-320/review.md finding 2; tech-lead consult round 321 planning', 'title': 'setRange(null) now runs before setSelectedClipId/setSelection; after an await (add video, library clip load) the store write commits at SyncLane in a microtask and the selection at DefaultLane: two commits, possibly one painted frame with range gone and old selection shown', 'status': 'open_low_provisional (D-29z881): tech-lead: mechanism real (add-video path), final state correct; Medium only if the intermediate frame paints or an effect fires on it. PERF-8b carries a browser experiment row (per-commit logger + rAF marker; control unstable_batchedUpdates on scratch)', 'added': A},
 {'id': 'GATE320-S3-ALL-LANES-DRAG', 'severity': 'info', 'origin': 'gate reviewer', 'source': 'gates/round-320/review.md finding 3', 'title': 'all-tracks drag re-renders every lane per move; not covered by an asserted row', 'status': 'scheduled (D-29z881): record row in PERF-10 (required_rows_d29z880)', 'added': A},
 {'id': 'GATE320-S6-TWO-STORE-PATTERNS', 'severity': 'info', 'origin': 'gate reviewer', 'source': 'gates/round-320/review.md finding 6', 'title': 'zustand range store next to hand-written useSyncExternalStore stores', 'status': 'requested (D-29z887): ARCH-CHECKPOINT-PERF8-STORE-PATTERN', 'added': A},
]
b['deferred_low_polish'].append({'id': 'GATE320-S4-RANGE-PROP-JSDOC', 'severity': 'low', 'origin': 'gate reviewer', 'source': 'gates/round-320/review.md finding 4', 'title': 'ArrangementDetailPanel range prop: range={null} differs from omitted (RS8); a short JSDoc would help', 'repro': 'code reading at 53c5c79', 'status': 'deferred_low_polish (D-29z881); may ride PERF-10 (owns the panel subscription)', 'added': A})
D('D-29z881', 'Gate-320 triage: finding 1 (Critical, COMMIT BLOCK on hook shape) closed - grant tasks/round-318.md l.102, root published; GATE320-L1-DOC230-GRANT-LINE (Low) rides PERF-8b; GATE320-S2 open_low_provisional with a PERF-8b browser experiment (tech-lead); GATE320-S3 -> PERF-10 record row; GATE320-S4 -> deferred_low_polish; finding 5 = SIG-R319-DEVOPTIONAL-NOTICES (root); GATE320-S6 -> ARCH-CHECKPOINT-PERF8-STORE-PATTERN.')

# D-29z882 RETRO 321
b['retro_runs'].append({'round': 321, 'decision': 'D-29z882', 'window': '305-320', 'report': 'retros/retro-321.md', 'lessons': 'lessons.md (59 lines): L16 merged into L3 (tech-lead); new L58 assert rows from C command on B sketch (tech-lead); L54, L57 one clause each; line 3 shortened to a pointer', 'data': 'b-round-320/*.py, *.json, *.txt (run on backlog-before-321.json) + fails-cause-hand.txt', 'consults': {'tech-lead': 'used', 'consequence-tester': 'used', 'product-designer': 'used (screen + journey review)', 'design-philosopher': 'used (told to write nothing; tree sha256 -c rc 0)', 'first-visit-host': 'used (journey review)', 'qa-engineer': 'not in B consult list'}, 'headline': '16 rounds, C PASS 10 / FAIL 6 (305, 312, 313, 316, 318, 319); gate published 10, skipped 6, failed 0; $394.74 (B 192.26, A 110.06, C 92.42); three fix-up chains, all B origin (312-314, 316-317, 318-320); EXP-R305-SKETCH-MUTANT stopped and refuted', 'added': A})
pol = b['retro_policy']
pol['next_due'] = 'round 336 or the end of STUDIO-PERFORMANCE, whichever first (retro 336 window 321-335) (D-29z882)'
pol['signals_for_next_retro'].insert(0, 'retro-321 section 10: EXP-R321-PRECHECK-GATES (consequence-tester): B runs every gate check the task names on the sketch before dispatch and saves each result under b-round-N/ (L58); C records gateChecksNamed, gateChecksRunOnSketch, chainHeadGateRunGreen (L57). Baseline 305-320: 3 chains in 16 rounds (2 with >= 2 fix-ups), B median $12.12. Refuted if >= 1 chain of >= 2 fix-ups whose head check B ran green on the sketch, or >= 2 chains despite full coverage. Stop: B median > $13.94 or result files missing in 2 rounds. Null if < 3 rounds name a gate check. Countermetric: A cost per round. Counters for RETRO 336: C FAIL 6/16, gate failed 0, STOPped rounds that reached C 3, lessons 59, L23 chars 5033 (RC-R305-LESSON-CHAR-CAP trigger > 5500), L57 field coverage (manifest fields absent 313/315/318/320)')
pol['signals_for_next_retro'] = [s if not s.startswith('retro-305 section 10: EXP-R305-SKETCH-MUTANT') else 'CLOSED at RETRO 321 (D-29z884): ' + s for s in pol['signals_for_next_retro']]
D('D-29z882', 'RETRO 321 (window 305-320) written: retros/retro-321.md; numbers from b-round-320 scripts on backlog-before-321.json; consults tech-lead, consequence-tester, product-designer, design-philosopher, first-visit-host; next RETRO round 336 or end of STUDIO-PERFORMANCE.')
D('D-29z883', 'lessons.md 59 -> 59 lines (diff b-round-320/lessons-diff.txt): L16 merged into L3 (alias L16; tech-lead); new L58 (an asserted number, name or byte pin is the saved output of C command on B sketch; else record; tech-lead); L54 gains the truncation/overflow clause (adopts RC-R305-CAPTURE-TEXT-SLICE); L57 gains the whole-field-list clause, mutantRedOnSketch names a B file (mutantRedOnTree separate) and the EXP-R321 fields; line 3 shortened to a pointer to b-round-320/lessons-before-321.md.')
D('D-29z884', 'EXP-R305-SKETCH-MUTANT closed: stopped (B median $12.12 > $11.70, above the line from round 305) and refuted by condition (b) (chains 312-314 and 318-320 of B-spec origin); condition (a) 0. consequence-tester design note: 318-320 tasks sent mutantRedOnSketch to A tree and (b) counts chains of other causes, so the hypothesis is mostly unsupported rather than cleanly refuted. Successor EXP-R321-PRECHECK-GATES adopted (window 322-337).')

# D-29z885 screen review
for i, w, k, p in [
 ('SR-321-1', 'export file is always czaba-studio-lab.wav/.mp3 (-range); name it from the content (e.g. "Middle East - CZABA mix.wav") shown as the dialog single subtitle, replacing the range repeat SR-290-2 removes', 'copy / small behaviour', 'low'),
 ('SR-321-2', 'question: after "Try it" the only visible exit "<- CZABA" goes to /; PD default: when opened with ?preview=, it returns to that product page (label/position unchanged); changes a Saba-decided STUDIO-LINK element', 'behaviour (question)', 'medium'),
 ('SR-321-3', 'question: product Provenance copy "exactly what you get" vs the Studio "Synthetic demo stems" notice and Premium extra files; PD wording "The preview is the full mix; Premium adds the stems." (STORE-4, read with SR-305-2)', 'store copy (question)', 'low'),
 ('SR-321-4', 'active lane stated three ways (bar, highlight, "· active") plus the footer line; move the word "active" to the accessible name/tooltip, keep bar and footer line', 'copy / a11y', 'low'),
 ('SR-321-5', 'question: audio-only project keeps the Video lane hint and duplicate wording; hint empty-state-only (copy); collapsing the monitor or moving the lane is a position question (monitor = SR-290-7)', 'copy / position (question)', 'low'),
 ('SR-321-6', 'export dialog does not say which tracks go into the file (Music empty -> only synthetic stems); one content line, decided together with SR-321-1', 'copy', 'low')]:
    b['screen_review_candidates'].append({'id': i, 'what': w, 'kind': k, 'priority': p, 'status': 'awaiting_user', 'source': 'user-review/screen-review-321.md; b-round-320/screens/', 'added': A})
D('D-29z885', 'Screen and journey review RETRO 321: user-review/screen-review-321.md; captures b-round-320/screens/ (capture.mjs keeps text to 2000 chars); persistent-line counts 97/124/86/101 equal RETRO 305; no visible change in 305-320; weakest step still SR-305-3; new candidates SR-321-1..6 awaiting_user; repeats mapped to existing ids (STORE-4 F1/F3, SR-245-7, SR-290-1/2/5/7, SR-230-9, SR-260-3, COPY-PD F11, STEM-LANES, F12).')

# D-29z886 systemic task
b['systemic_tasks'].append({'id': 'SYS-R2-FAKE-FIDELITY', 'added': A + ' (D-29z886)', 'what': 'test-only: the R2 worker tests fake behaves like R2 (object without httpEtag, outOfRange check before the TypeError throw, no body opened in throw mode asserted honestly, version switch between head and get), with a mutant per row; both worker copies', 'closes': ['C-R311-01', 'A-R311-REVIEW-L4', 'GATE311-L1', 'A-R309-REVIEW-TEST-GAPS'], 'root_cause': 'the fake R2 in r2-proxy tests is more lenient than R2, so branch-specific mutants survive', 'place': 'end of STUDIO-PERFORMANCE, after PERF-15 (worker tests belong to this queue entry; Saba order unchanged)', 'status': 'not_started'})
sp['stages'].append({'id': 'SYS-R2-FAKE-FIDELITY', 'what': 'see systemic_tasks SYS-R2-FAKE-FIDELITY', 'status': 'not_started (D-29z886): after PERF-15', 'added': A})
for f in b['deferred_low_polish']:
    if f.get('id') in ('C-R311-01', 'A-R311-REVIEW-L4', 'GATE311-L1', 'A-R309-REVIEW-TEST-GAPS'):
        f['status'] = 'scheduled in SYS-R2-FAKE-FIDELITY (D-29z886) | ' + f['status']
D('D-29z886', 'Systemic task SYS-R2-FAKE-FIDELITY (test-only, one round) closes C-R311-01, A-R311-REVIEW-L4, GATE311-L1, A-R309-REVIEW-TEST-GAPS (one root cause: the fake R2 is more lenient than R2); placed at the end of STUDIO-PERFORMANCE after PERF-15.')

# D-29z887 architecture checkpoint request
b['architecture_checkpoint_requests'].append({'id': 'ARCH-CHECKPOINT-PERF8-STORE-PATTERN', 'file': 'b-round-320.md section 5', 'question': 'PERF-8 boundary (PERF-8a done, PERF-8b next): (1) confirm D-29z193 zustand as the standard for new Studio stores and the named migrations (mix draft onto zustand in PERF-8/PERF-10), and whether REACT_CONTEXT.md should record it (proposal for Saba only); (2) the useArrangement() shape change as an accepted invariant change (GATE320-C1, grant tasks/round-318.md l.102); (3) keep or extract: the detail panel range subscription (A-R319-ARCH-DETAIL-SUBSCRIPTION, A-R320-ARCH-USE-DETAIL-RANGE). Output per architecture-checkpoint.md: keep/extract, value, risk, max three sentences', 'blocking': False, 'status': 'requested_from_root (D-29z887): non-blocking; if no answer before PERF-8b planning, PERF-8b follows D-29z193', 'added': A})
D('D-29z887', 'Bounded frontend-architect checkpoint requested from root at the PERF-8 boundary: ARCH-CHECKPOINT-PERF8-STORE-PATTERN (tech-lead: stage boundary + ownership signal + gate-found invariant change). Non-blocking for PERF-8b.')

# D-29z888 next
b['rounds'].append({'round': 321, 'task': 'current-task.md', 'decision': 'D-29z880..D-29z889', 'type': 'RETRO 321 (window 305-320) + whole-screen and journey review; no app code', 'status': 'dispatched', 'note': 'baseline 53c5c79 clean, 0 grants, frozen b-round-320-r321-tree-sha256.txt (1226); claims b-round-320/claims-321.sh', 'added': A})
sp['status'] = 'in_progress (D-29z880..D-29z888): PERF-8a done (C round 320 PASS, gate 320 53c5c79); round 321 RETRO; round 322 REGRESSION if its planning is on/after 2026-11-05, else PERF-8b | ' + sp['status']
D('D-29z888', 'Next: round 321 RETRO; round 322 = REGRESSION if its planning falls on or after 2026-11-05 (regression-last 2026-11-02; carries the C-R318-06 repro row), else PERF-8b (selection store) with the GATE320-S2 experiment and GATE320-L1. If C fails an RT row, round 322 re-checks the changed lines (RT-FIX) together with that task.')

# D-29z889 retro candidates
rc['RC-R305-LESSON-CHAR-CAP']['status'] = 'partly adopted (D-29z889): line 3 shortened to a pointer; L23 5033 chars (+764 since RETRO 305); new sketch-run clauses go to L58, not L23; watch to RETRO 336, trigger L23 > 5500 | ' + rc['RC-R305-LESSON-CHAR-CAP']['status']
rc['RC-R305-CAPTURE-TEXT-SLICE']['status'] = 'adopted (D-29z889): L54 clause; b-round-320/screens/capture.mjs keeps 2000 chars | ' + rc['RC-R305-CAPTURE-TEXT-SLICE']['status']
rc['RC-R308-SPLICE-PROBE']['status'] = 'retired (D-29z889): no recurrence in 309-320 (1x) | ' + rc['RC-R308-SPLICE-PROBE']['status']
if 'RC-R275-STOP-ROUTES-TO-B' in rc:
    rc['RC-R275-STOP-ROUTES-TO-B']['status'] = 'raised to Saba a fourth time (RETRO 321 section 12: STOPs 313, 318, 319 reached C, all FAIL, $77.52) (D-29z889) | ' + rc['RC-R275-STOP-ROUTES-TO-B']['status']
b['open_findings'].append({'id': 'HR-C-L57-LAPSE-R321', 'severity': 'info', 'origin': 'B spec + C', 'title': 'the four manifest fields are absent from c-round-313/315/318/320.json; tasks 313/314/315/318/320 listed only the three new fields as "the L57 fields"', 'source': 'b-round-320/l57-fields.txt', 'status': 'closed by lesson (D-29z889): L57 whole-field-list clause; RETRO 336 counts coverage', 'added': A})
D('D-29z889', 'Retro candidates: RC-R305-LESSON-CHAR-CAP partly adopted (pointer line 3; watch, trigger L23 > 5500); RC-R305-CAPTURE-TEXT-SLICE adopted (L54); RC-R308-SPLICE-PROBE retired; RC-R275-STOP-ROUTES-TO-B to Saba a fourth time. HR-C-L57-LAPSE-R321 closed by the L57 clause.')

b['current_task'] = 'current-task.md (round 321, D-29z880..D-29z889; RETRO 321 (window 305-320) + whole-screen and journey review; no app code; baseline 53c5c79, 0 grants, frozen 1226)'
b['version'] = 280
b['updated'] = A
json.dump(b, open(P, 'w'), indent=1, ensure_ascii=False)
print('ok', b['version'], b['decisions_log_b'][-1]['id'])
