# B round 278 -> 279 planning: backlog.json update (evidence-only). Run: python3 -I backlog-update.py <sketch_note>
import json, sys
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
ADDED = '2026-10-30 B round 278 -> 279 planning'
sketch_note = sys.argv[1] if len(sys.argv) > 1 else 'see b-round-278.md section 4'

def find(lst, i):
    for x in lst:
        if isinstance(x, dict) and x.get('id') == i:
            return x
    raise KeyError(i)

def prepend(o, text):
    o['status'] = text + ' | ' + str(o.get('status', ''))

b['version'] = b['version'] + 1
b['updated'] = '2026-10-30 B round 278 -> 279 planning'
b['current_task'] = ('current-task.md (round 279, D-29z634..D-29z641; PERF-HARNESS-SHARED-LIB-b-ii stage 1 (b-ii-1, test-only perf harness): '
    'state waits for the fixed settles outside measurement windows (GATE214-S1), the deselect lane = first lane after the clip lane (GATE214-S2), '
    'export observer + poll loop inside try with an installed flag (GATE223-S2); baseline 873d835 clean; grants b-round-278-r279-grants.txt; '
    'frozen b-round-278-r279-tree-sha256.txt; oracle b-round-278/baseline-results)')

# rounds
r278 = [r for r in b['rounds'] if r.get('round') == 278][0]
r278['status'] = 'done (D-29z634): C PASS 27 rows, browserVerified/realVerified true, 0 bugs; gate 278 published 873d835 (both remotes)'
b['rounds'].append({'round': 279, 'task': 'current-task.md', 'decision': 'D-29z634..D-29z641', 'status': 'dispatched',
    'type': 'STUDIO-PERFORMANCE PERF-HARNESS-SHARED-LIB-b-ii stage 1 (b-ii-1), test-only',
    'note': 'baseline 873d835 clean (1142 tracked); grants 10 (1 new doc); frozen 1133; B HEAD perf run 3/3 PASS 15.2 min (1a 8.4 min = 56 % of 15 min); ' + sketch_note,
    'next': 'C PASS + gate -> round 280 = b-ii-2 (R216-MEM-POLLS-HEADROOM) unless REGRESSION due (on/after 2026-11-02, it goes first)',
    'added': ADDED})

# closures from round 278 evidence (c-round-278.json PASS + gate-round-278.json published)
EV = 'C round 278 PASS (c-round-278.json, browserVerified true) + gate 278 published 873d835'
for i, row in [('C-R276-01', 'B-CURSOR'), ('C-R276-02', 'C-R276-02-KEEP'), ('A-R276-REVIEW-DELETE-NAME', 'B-DELETE-NAME'), ('INFO-C277-DOC206-STAGE2-ROUND', 'DOC-206-207')]:
    prepend(find(b['open_findings'], i), f'closed (D-29z634): {EV}, row {row}')
prepend(find(b['deferred_low_polish'], 'C-R130-ADD-DISABLED-NO-REASON'), f'closed (D-29z634): {EV}, rows B-ADD-TITLES, B-AX-2, B-TAB-2')
r66 = find(b['deferred_low_polish'], 'ROOT-R66-L3')
r66['status_r279'] = f'disabled-reason half closed (D-29z634): {EV}, rows B-TAB-2/B-AX-2; the 16 px target half stays open in this Lows batch'
prepend(find(b['architecture_signals'], 'A-R276-ARCH-GUARD-IN-HELPER'), f'closed (D-29z634): {EV}; shared studio-soft-disabled.ts landed, MUTANTS row')
prepend(find(b['systemic_tasks'], 'SYS-5'), f'done (D-29z634): stage 1 (C 276/277, gate 277 42872cf) + stage 2 (C 278, gate 278 873d835), browserVerified true')

# new Lows -> deferred_low_polish (2026-10-23 bug gate)
DEF = 'user decision 2026-10-23: open Lows no longer block; fixed in the polish pass before release; final acceptance requires each fixed and C-verified'
b['deferred_low_polish'] += [
    {'id': 'GATE278-S1', 'severity': 'low', 'status': 'open - Lows batch', 'title': 'soft-disabled Add keeps its border-outline-strong border and fill at full strength (only the children dim); may not read as unavailable',
     'evidence': 'gates/round-278/review.md suggestion 1; C V-LOOK-2 measured dE2000 <= 3 (accepted round-278 section 4 trade-off)', 'repro': '/studio-lab, make the video track active, look at library Add', 'deferred_reason': DEF, 'added': ADDED},
    {'id': 'GATE278-S2', 'severity': 'low', 'status': 'open - Lows batch (merged with A-R278-REVIEW-UNUSED-EVENT)', 'title': 'unused (event) parameter in the Split, Loop and Zoom-to-selection guardSoftDisabledClick wrappers in ArrangementTransport.tsx',
     'evidence': 'gates/round-278/review.md suggestion 2; a-round-278.md code-reviewer 4', 'repro': 'source read', 'deferred_reason': DEF, 'added': ADDED},
    {'id': 'A-R278-REVIEW-METRONOME-SPY', 'severity': 'low', 'status': 'open - Lows batch', 'title': 'no test fails if the metronome guardSoftDisabledClick is deleted (toggleMetronome returns early on null tempo); candidate: standalone ArrangementTempoRow render with vi.fn() onMetronomeToggle',
     'evidence': 'a-round-278.md code-reviewer 1', 'repro': 'mutant: remove the metronome wrapper -> UI12 stays green', 'deferred_reason': DEF, 'added': ADDED},
]
b['open_findings'] += [
    {'id': 'GATE278-S3', 'severity': 'info', 'status': 'recorded (scope decision)', 'title': 'a typed, uncommitted BPM is not committed when the user clicks a soft-disabled Preview or Add (they preventDefault on mousedown); only the metronome commits first (variant X, D-29z628)', 'source': 'gates/round-278/review.md suggestion 3', 'added': ADDED},
    {'id': 'GATE278-S4', 'severity': 'info', 'status': 'recorded', 'title': 'Preview has a title only when unavailable; Add always has one (unchanged from HEAD)', 'source': 'gates/round-278/review.md suggestion 4', 'added': ADDED},
    {'id': 'C-R278-NOTE-01', 'severity': 'info', 'status': 'recorded', 'title': 'Preview/Add loading titles reachable in the demo only ~1.5 s after first load; no-sound and failed not reachable (jsdom LPA3 covers)', 'source': 'c-round-278.json notes', 'added': ADDED},
    {'id': 'C-R278-NOTE-02', 'severity': 'info', 'status': 'recorded; reconcile candidate with the SABA-B-4 1.5 px wording (not scheduled)', 'title': 'metronome focus ring is inset (-2 px, STUDIO_FOCUS_RING_INSET_CLASS, pre-existing) and 1 px wide on all buttons vs SABA-B-4 text 1.5 px; contrast 5.04-5.57:1', 'source': 'c-round-278.json notes', 'added': ADDED},
    {'id': 'C-R278-ENV-01', 'severity': 'info', 'status': 'lesson (D-29z639): L38 clause', 'title': "C's HEAD dev server shared node_modules/.vite and broke :5173 (504 Outdated Optimize Dep); a second Vite server needs its own cacheDir", 'source': 'c-round-278.json notes', 'added': ADDED},
]
b['architecture_signals'] += [
    {'id': 'GATE278-ARCH-SOFT-DISABLED-TOKENS', 'source': 'gates/round-278/review.md Architecture note signal 3', 'text': 'soft-disabled class assertions rewritten in 5+ test files in rounds 276-278; proposal: one shared token list (e.g. SOFT_DISABLED_SURFACE_TOKENS) next to studio-soft-disabled.ts', 'status': 'recorded (not scheduled)', 'added': ADDED},
    {'id': 'A-R278-ARCH-METRONOME-KEEPMOUSEFOCUS', 'source': 'a-round-278.md Architecture note signal 1', 'text': 'ArrangementTempoRow writes aria-disabled by hand; proposal softDisabledButtonProps(isUnavailable, { keepMouseFocus: true }); acceptance UI12/UI13 unchanged + a spy guard test', 'status': 'recorded (not scheduled)', 'added': ADDED},
    {'id': 'B-R279-PERF-READY-WAIT-DUP', 'source': 'tech-lead consult round 279 T5', 'text': 'the load-ready waitForFunction body is copied in 3 specs (1a measureLoad, 1b-i/1b-ii measureLoadReady) and settleMs/idleSettleMs constants are duplicated; candidate to move into perf/lib', 'status': 'recorded (not scheduled)', 'added': ADDED},
]
b['root_requests_b'].append({'id': 'ROOT-REQ-PERF-TIMEOUT', 'file': 'b-round-278-root-request-perf-timeout.md', 'decision': 'D-29z638', 'blocking': False, 'status': 'open', 'added': ADDED})
b['harness_facts'].append({'id': 'B-R278-LANE-ORDER', 'fact': 'At 873d835, /studio-lab [data-track-id] DOM order is video, music, stems, sfx; library Add lands on music (no empty right-half point); first later lane with one is stems at 1440x900 (x 724) and 1280x720 (x 644). Probe b-round-278/probe/lane.cjs -> lane.json', 'added': ADDED})

# perf queue
sp = find(b['post_current_stage_queue'], 'STUDIO-PERFORMANCE')
prepend(sp, 'in_progress (D-29z636): resumed after SYS-5; round 279 = PERF-HARNESS-SHARED-LIB-b-ii-1, round 280 = b-ii-2, then PERF-2.. per execution_order_d29z636')
st = find(sp['stages'], 'PERF-HARNESS-SHARED-LIB-b-ii')
prepend(st, 'split D-29z636 (tech-lead T4) into b-ii-1 (round 279: GATE214-S1, GATE214-S2, GATE223-S2 incl. pollLoop) and b-ii-2 (round 280: R216-MEM-POLLS-HEADROOM); PERF-1A-TIMEOUT-HEADROOM -> root request ROOT-REQ-PERF-TIMEOUT (D-29z638); nothing dropped')
sp['stages'] += [
    {'id': 'PERF-HARNESS-SHARED-LIB-b-ii-1', 'what': 'state waits (waitForCollectionReady / waitForPlaybackSettled / waitForStudioQuiet in perf/lib/page.ts, cap hit = problem) for 1a l.574/l.668, 1b-i l.637/l.703, 1b-ii l.279; keep 1a l.579 (hook-live window), l.597 (idle window) and 1b-ii l.524 (defines the ready-heap read); GATE214-S2 emptyLanePointAfterClip; GATE223-S2 observer + timeOrigin + pollLoop inside try, installed flag; doc 208', 'target': 'every deterministic median identical to b-round-278/baseline-results (equiv-check.py, 0 problems); named mutants red', 'status': 'dispatched round 279 (D-29z636)', 'added': ADDED},
    {'id': 'PERF-HARNESS-SHARED-LIB-b-ii-2', 'what': 'R216-MEM-POLLS-HEADROOM: page-timestamped export window (clock-offset probe, sample midpoints), heapPollMs re-ruled; named exceptions mem-polls (wallclock) and res.export.*.peak-backing-delta-mib (+-0.1); budgets.resources.json notes; >= 5 threshold kept (performance-optimizer Q2)', 'target': 'mem-polls headroom at 1x and 6x; named exceptions only', 'status': 'not_started (round 280)', 'added': ADDED},
]
sp['consults_round_279'] = {
    'tech-lead': 'helpers in perf/lib/page.ts, thin wrapper over waitForQuiet, return capped; keep 1a l.579 (doc 168 hygiene ruling); l.597 needs a ruling (defines the idle window); no unit rows (vitest include app/** only); grants 3 specs + page.ts + docs; frozen config/budgets.json/budgets.interactions.json; split (b) into its own round; pollLoop also before try; file the timeout request now; arch signal B-R279-PERF-READY-WAIT-DUP',
    'performance-optimizer': 'per-site table: replace 1a l.574/l.668, 1b-i l.637/l.703 (poll isPlaying), res l.524 (revert if rows move), res l.279; keep 1a l.597, res l.180; l.659 out of scope; replace res l.342 (not adopted: B keeps it, flush wait after the window, wallclock rows only); l.579 replace as named exception (not adopted: tech-lead keep, B rules keep, D-29z637); pollLoop leak + installed flag; lane guard; equivalence: filter kind deterministic then compare; mutants; timeout 25 min; Q2 design for b-ii-2',
    'advisor': 'used before writing: sequencing (L38), oracle at 873d835, claims regenerated, invert-predicate mutants, grants/frozen, root request in outcome table, bookkeeping from round-278 evidence only',
    're_measurement': 'B HEAD run at 873d835 on a git archive: 3/3 PASS 15.2 min (1b-i 5.5, 1b-ii 1.1, 1a 8.4 min); 1a and 1b-i deterministic medians identical to c-round-259; 1b-ii differs only in 3 DOM and 4 JS-bytes rows moved by app rounds 260-278 (equiv-check vs c-round-259)'}
sp['execution_order_d29z636'] = '... -> PERF-HARNESS-SHARED-LIB-b-ii-1 (279) -> PERF-HARNESS-SHARED-LIB-b-ii-2 (280) -> PERF-2 -> PERF-3 -> PERF-COMMIT-RESCHEDULE -> PERF-4 -> PERF-5 -> PERF-7 -> PERF-8 -> PERF-DRAG-PREVIEW -> PERF-9 -> PERF-10 -> PERF-11 -> PERF-12 -> PERF-13 -> PERF-14 -> PERF-15 (PERF-6 dropped). REGRESSION first whenever due (on/after 2026-11-02); RETRO at 290. Supersedes execution_order_d29z262.'
for i in ('GATE214-S1', 'GATE214-S2', 'GATE223-S2'):
    prepend(find(b['deferred_low_polish'], i), 'dispatched round 279 (PERF-HARNESS-SHARED-LIB-b-ii-1, D-29z636)')
prepend(find(b['open_findings'], 'R216-MEM-POLLS-HEADROOM'), 'queued PERF-HARNESS-SHARED-LIB-b-ii-2 (round 280, D-29z636)')
prepend(find(b['open_findings'], 'PERF-1A-TIMEOUT-HEADROOM'), 'root request ROOT-REQ-PERF-TIMEOUT filed (D-29z638): B run at 873d835 1a 8.4 min = 56 % of 15 min (b-round-278/head-perf-run.log); closes when root applies 25 min and a run shows <= 50 %')

b['decisions_log_b'] += [
    {'id': 'D-29z634', 'date': '2026-10-30', 'text': 'Round 278 closed: C PASS (27 rows, browserVerified/realVerified true, 0 bugs), gate 278 published 873d835. SYS-5 is done (stages 1+2). Closed: ROOT-R66-L3 reason half, C-R130-ADD-DISABLED-NO-REASON, C-R276-01, C-R276-02, A-R276-REVIEW-DELETE-NAME, A-R276-ARCH-GUARD-IN-HELPER, INFO-C277-DOC206-STAGE2-ROUND.'},
    {'id': 'D-29z635', 'date': '2026-10-30', 'text': 'Gate 278 and A/C notes: Lows GATE278-S1, GATE278-S2 (+A unused event), A-R278-REVIEW-METRONOME-SPY -> deferred_low_polish; info GATE278-S3/S4, C-R278-NOTE-01/02, C-R278-ENV-01; architecture signals GATE278-ARCH-SOFT-DISABLED-TOKENS, A-R278-ARCH-METRONOME-KEEPMOUSEFOCUS, B-R279-PERF-READY-WAIT-DUP recorded, not scheduled.'},
    {'id': 'D-29z636', 'date': '2026-10-30', 'text': 'Round 279 = PERF-HARNESS-SHARED-LIB-b-ii-1 (GATE214-S1, GATE214-S2, GATE223-S2 incl. the poll loop). b-ii split (tech-lead T4): R216-MEM-POLLS-HEADROOM moves to b-ii-2 (round 280) because it moves rows inside the export window; nothing dropped.'},
    {'id': 'D-29z637', 'date': '2026-10-30', 'text': 'Wait rulings: replace 1a l.574/l.668, 1b-i l.637/l.703, 1b-ii l.279; keep 1b-ii l.524 (res.mem.used-ready-mib depends on time since load: HEAD 5.3, quiet wait 5.6-5.8, status wait 5.9-6.0), 1a l.579 (defines the harness.hook-live window; tech-lead over performance-optimizer), 1a l.597 (defines the play.idle window), 1b-ii l.180 (GC settle), l.342 (observer flush after the window), l.659 (poll interval), page.ts l.40/l.53.'},
    {'id': 'D-29z638', 'date': '2026-10-30', 'text': 'PERF-1A-TIMEOUT-HEADROOM: root request ROOT-REQ-PERF-TIMEOUT (15 -> 25 min) filed now; B HEAD run 1a 8.4 min = 56 %; A never uses test.setTimeout.'},
    {'id': 'D-29z639', 'date': '2026-10-30', 'text': 'lessons.md: L38 gains the C-R278-ENV-01 clause (a second Vite server gets its own cacheDir). Line count unchanged.'},
    {'id': 'D-29z640', 'date': '2026-10-30', 'text': 'Round 279 equivalence contract: oracle b-round-278/baseline-results (873d835); every deterministic median identical, no named exception; envelope and sequence identical (the 1b-i sequence text "empty Stems lane click" stays true: the derived lane is stems, B-R278-LANE-ORDER).'},
    {'id': 'D-29z641', 'date': '2026-10-30', 'text': 'Round 279 outcome table (current-task.md section 11). Doc 208 l.4 = In Progress (stage 1 of 2; C round 279 PASS) (L28 multi-stage).'},
]
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok')
