import json, sys
P = 'backlog.json'
b = json.load(open(P, encoding='utf-8'))
DATE = '2026-10-28'
ADDED = '2026-10-28 B round 215 -> 216 planning'

def by_id(lst, i):
    for x in lst:
        if isinstance(x, dict) and x.get('id') == i:
            return x
    return None

rounds = {r.get('round'): r for r in b['rounds']}
rounds[211]['status'] = 'c_pass_published'
rounds[211]['bookkeeping_fix_d29z214'] = 'was "dispatched"; C round 211 PASS, gate 211 published 28a274c (gates/gate-round-211.json); fixed per C round 215 needsBRuling'
rounds[212]['status'] = 'c_pass_gate_failed_published_with_213'
rounds[212]['bookkeeping_fix_d29z214'] = 'was "c_pass_published"; gate 212 failed (verify exit 1, GATE212-B1), work published by gate 213 as fe556fd (rounds 212+213)'
rounds[215]['status'] = 'c_fail_rt_num'
rounds[215]['result'] = ('C round 215 FAIL on RT-NUM only (C-R215-01 Low: retro-215.md l.53 "11 review" should be 10); '
    'SOURCE-SCOPE, RT-CAUSE, RT-IDS, RT-LESSONS, RT-SABA, G215-3, STUDIO-SMOKE-215 PASS; browserVerified=true, realVerified=true; '
    'gate 215 skipped (C FAIL; nothing to publish). B corrected retro l.53 (+ C notes l.32/l.70/l.75) at round-216 planning; RT-FIX rides in round 216 (D-29z213)')

of = b['open_findings']
of.append({'id': 'C-R215-01', 'severity': 'low', 'origin': 'C (round 215 RT-NUM)',
    'title': 'retro-215.md l.53 said "11 review" (10 review.md exist in 200-214) and omitted that 200-202 have no review',
    'source': 'c-round-215.json bugs; c-round-215/rt/gate-reviews.txt',
    'status': 'fixed in B planning (retros/retro-215.md l.53; diff b-round-215/retro-215-rtfix.diff); RT-FIX-216 re-check pending (round 216)',
    'added': ADDED})
of.append({'id': 'C-R215-02', 'severity': 'info', 'origin': 'C + A (round 215 lesson feedback)',
    'title': 'L28: A writes "Completed (C round N PASS)" before C runs; premature claim in working/FAIL trees',
    'source': 'c-round-215.json needsBRuling; a-round-215.md Lesson feedback',
    'status': 'ruled D-29z214: keep exact string, defined as post-PASS value valid only at HEAD; re-dispatch implicitly grants l.4 for N only; root request b-round-215-root-request-l28.md (gate-side Pending -> Completed substitution); L28 switches only after root confirms',
    'added': ADDED})
of.append({'id': 'C-R215-BOOKKEEPING-ROUNDS', 'severity': 'info', 'origin': 'C (round 215 needsBRuling)',
    'title': 'backlog rounds[] 211 dispatched / 212 c_pass_published were wrong',
    'source': 'c-round-215.json needsBRuling; gates/gate-round-211.json, gate-round-212.json',
    'status': 'closed D-29z214 (rounds[] fixed in this planning)', 'added': ADDED})

e = by_id(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
st = e['stages']
s = by_id(st, 'PERF-8')
s['target_rebaseline_d29z215'] = 'PERF-1b-i production baseline for range body drag: 101.283 components/move, 1.983 commits/move (doc 168 PERF candidates; interact.drag.range.stopped.move-components-per-move); target stays <= 15/move'
s = by_id(st, 'PERF-3')
s['scope_addition_d29z215'] = 'add a Ctrl+wheel zoom baseline row before the fix (hypothesis in doc 168: continuous zoom, not measured); key zoom baseline 95 comps/key (1 clip)'
s = by_id(st, 'PERF-14')
s['scope_addition_d29z215'] = 'zoom with 30 clips grows with clip count: 240 comps/key (interact.zoom.30.components-per-key), key window 98-113 ms 1x'
s = by_id(st, 'PERF-10')
s['scope_addition_d29z215'] = 'clip click (102 comps, 3 commits) and play/pause (87 comps each) baselines from doc 168 belong here'
idx = [x['id'] for x in st].index('PERF-15') + 1
st.insert(idx, {'id': 'PERF-COMMIT-RESCHEDULE', 'what': 'on a clip-edit commit while playing, reschedule only the changed clip(s) instead of rebuilding the graph and restarting every clip; first row measures trim and move release restarts with 30 clips (doc 168 only infers them); then the fix', 'target': 'interact.drag.fade.30.playing.release-restarts == 1 (baseline 30), same for trim/move at 30 clips; playback position and mix unchanged; exported mix unchanged', 'source': 'doc 168 PERF candidates (fade 30-clip release restarts 30); tech-lead consult 2026-10-28', 'note': 'restarting every clip during playback may be audible: hypothesis, not measured; the stage measures it before claiming it', 'status': 'not_started (queued D-29z215)', 'added': ADDED})
st.insert(idx + 1, {'id': 'PERF-DRAG-PREVIEW', 'what': 'fade / trim / move drag previews leave history and provider state during the gesture (fader pattern, PERF-FADER-a/b); one history entry per gesture at release; Undo/Esc/snap/readouts unchanged', 'target': '<= 15 committed components per move (baselines 96.367 fade, 101.283 trim, 101.383 move); 1 history entry per gesture', 'preview_paths': 'ArrangementClip.tsx:503 / :674 / :634 previewArrangement -> ArrangementContext.tsx:1588 previewArrangement -> updateHistory', 'source': 'doc 168 PERF candidates; tech-lead consult 2026-10-28', 'note': 'goes right after PERF-8 (same ArrangementContext region ~l.1572-1588; may reuse its external store; B may merge with PERF-8 at its planning)', 'status': 'not_started (queued D-29z215)', 'added': ADDED})
st.insert(idx + 2, {'id': 'PERF-HARNESS-SHARED-LIB', 'what': 'test-only: extract the helpers copied between the three perf specs into perf/lib/page.ts + perf/lib/report.ts; behaviour unchanged; tighten ratio-row determinism tolerance (A-R214 review M2)', 'target': 'every deterministic median of latest.json, latest-interactions.json and latest-resources.json identical before and after; all three specs exit 0', 'source': 'architecture signal PERF-HARNESS-SHARED-LIB (3rd copy lands with PERF-1b-ii; project 3+ places rule); tech-lead consult 2026-10-28', 'status': 'not_started (queued D-29z215, after OSS-LIC)', 'added': ADDED})
e['execution_order_d29z215'] = ('PERF-1b-ii (216, or 217 if REGRESSION first) -> PERF-16 -> OSS-LIC -> PERF-HARNESS-SHARED-LIB -> PERF-2 -> PERF-3 -> '
    'PERF-COMMIT-RESCHEDULE -> PERF-4 -> PERF-5 -> PERF-7 -> PERF-8 -> PERF-DRAG-PREVIEW -> PERF-9 -> PERF-10 -> PERF-11 -> PERF-12 -> PERF-13 -> PERF-14 -> PERF-15 (PERF-6 dropped). '
    'Supersedes the PERF-2..15 tail of execution_order_d29z199. Source: tech-lead consult 2026-10-28 (b-round-215.md section 3).')

sig = by_id(b['architecture_signals'], 'PERF-HARNESS-SHARED-LIB')
sig['round_216'] = 'third occurrence with PERF-1b-ii (third self-contained spec); meets the 3+ places rule -> queued as STUDIO-PERFORMANCE stage PERF-HARNESS-SHARED-LIB after OSS-LIC (D-29z215)'
sig['status'] = 'queued (D-29z215)'

for i in ['GATE206-S5']:
    x = by_id(of, i) or by_id(b['deferred_low_polish'], i)
    x['status'] = x['status'] + ' | round 216 PERF-1b-ii: doc 169 section (D-29z217)'

json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
