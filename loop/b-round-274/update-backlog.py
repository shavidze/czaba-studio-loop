import json
P = 'backlog.json'
d = json.load(open(P))
A = '2026-10-30 B round 274 -> 275 planning'
assert d['version'] == 238, d['version']
d['version'] = 239
d['updated'] = A + ' (D-29z605..D-29z612)'
d['current_task'] = 'current-task.md (round 275, D-29z605..D-29z612; RETRO 275 (window 260-274) + whole-screen review; no app code; baseline a4c0e24, 0 grants, frozen 1138)'


def find(pool, i):
    for x in d[pool]:
        if isinstance(x, dict) and x.get('id') == i:
            return x
    return None


def add(pool, e):
    if find(pool, e['id']) is None:
        d[pool].append(e)


EV274 = 'C round 274 PASS (c-round-274.json: 18 rows passed, browserVerified/realVerified true, 0 bugs) and gate 274 published a4c0e24 on both remotes'

# D-29z605: round 274 accepted
if not any(r.get('round') == 274 for r in d['rounds']):
    d['rounds'].append({'round': 274, 'task': 'current-task.md (archived tasks/round-274.md)', 'decision': 'D-29z601..D-29z604', 'type': 'systemic bug round: SYS-6 STATUS-LIFETIME stage 3 of 3 (nudge result text)', 'status': 'done: ' + EV274 + ' (D-29z605)', 'added': A})
for i, why in [('C-R271-01-NUDGE-STALE-STATUS', 'B-NUDGE-SINGLE/HELD/GROUP both viewports'),
               ('GATE270-S2-REPEAT-ANNOUNCE', 'premise false: B-ENTER-TWICE 2 mutations per Enter on both trees, plus SK8/SK12')]:
    x = find('deferred_low_polish', i)
    if x is not None:
        d['deferred_low_polish'].remove(x)
        x['status'] = 'closed (D-29z605): ' + EV274 + '; ' + why + ' | ' + str(x.get('status'))
        x['removed_from_deferred_low_polish'] = A
        add('open_findings', x)
for i, why in [('A-R273-REPEAT-PASTEND', 'superseded: B-NUDGE-PASTEND'),
               ('GATE273-S4-PBS9-DESCRIBE', 'describe titles renamed (TEST-CHANGES row)')]:
    x = find('open_findings', i)
    if x is not None and not str(x.get('status')).startswith('closed'):
        x['status'] = 'closed (D-29z605): ' + EV274 + '; ' + why + ' | ' + str(x.get('status'))
for x in d['systemic_tasks']:
    if x.get('id') == 'SYS-6' and not str(x.get('status')).startswith('done'):
        x['status'] = 'done (D-29z605): stages 1-3 C PASS (rounds 272, 273, 274; published b288be7, 52b17e4, a4c0e24); docs 203/204/205 Completed | ' + str(x.get('status'))
for i, t in [('INFO-C274-01', 'A-R274-GROUP-NUDGE-FLOAT-DRIFT is model-only: Snap-off group nudge x4 shows data-clip-start 0.100..0.400 and exact texts in the browser'),
             ('INFO-C274-02', 'group status write guarded by if (before && after), beyond section 2.2; no reachable path found')]:
    add('open_findings', {'id': i, 'severity': 'info', 'title': t, 'source': 'c-round-274.json notes', 'status': 'info (D-29z606): folded into ' + ('A-R274-GROUP-NUDGE-FLOAT-DRIFT' if i.endswith('01') else 'GATE274-S3-GROUP-ANCHOR-GUARD') + ' (deferred Low)', 'added': A})

# D-29z606: gate 274 review triage
add('open_findings', {'id': 'GATE274-S1-HELD-REPEAT-ANNOUNCE', 'severity': 'medium', 'origin': 'gates/round-274/review.md suggestion 1',
    'title': 'a held ArrowRight on one clip writes a new nudge text on every key repeat (function form, new start each step), so the aria-live span is re-keyed about 30 times a second; NVDA/VoiceOver may queue readouts that continue after release',
    'status': 'open_tech_lead_manual (D-29z606): per-step announcement is the round-274 contract (SK13, doc 205); the only remaining step is a real screen-reader check (2026-10-23 root clarification: does not block); manual row TLM-R274-SR-HELD-REPEAT, deadline RETRO 290 (L46). If Saba reproduces it, it becomes a normal Medium: announce the final start on settle, rewrite SK13, LT21 unchanged',
    'testable_half': 'count status-announcement span re-keys under N repeat keydowns (jsdom, fake timers); target to be chosen with the fix, not pinned now',
    'consult': 'tech-lead preferred scheduling a settle/keyup fix now; B kept the contract (no evidence which replacement is right; reviewer asked for a real screen-reader test first)', 'added': A})
add('tech_lead_manual_checks', {'id': 'TLM-R274-SR-HELD-REPEAT', 'status': 'planned (D-29z606)', 'what': 'NVDA (Chrome, Windows) or VoiceOver (Safari/Chrome, macOS): select one clip on /studio-lab, hold ArrowRight 2 s, release; does speech stop within about 1 s and name the final start ("Nudge clip: start ...")?', 'source': 'GATE274-S1-HELD-REPEAT-ANNOUNCE', 'deadline': 'RETRO 290 (L46)', 'added': A})
for i, t in [('GATE274-S2-GROUP-HOLD-TEXT', 'during a held group nudge the line keeps "...moved 00:00.100 to the right" (per-step distance), so it never names where the clips ended; the single-clip readout names the absolute start; doc 205 does not mention the difference'),
             ('GATE274-S3-GROUP-ANCHOR-GUARD', 'nudgeSelectedClip group branch: if ids[0] is missing from the arrangement while other selected ids exist, applyEdit runs but no status is written (the C-R271-01 class); defensive, no known path (INFO-C274-02 folded)'),
             ('GATE274-S4-ZERO-DIRECTION', 'direction check uses >= so a 0 move would be labelled "to the right"; unreachable while moveClips is rigid'),
             ('A-R274-GROUP-NUDGE-FLOAT-DRIFT', 'moveClips (selection.ts) adds start + delta without rounding; after 4 group steps start reads 5.399999999999999 in the model (gate-274 suggestion 5; INFO-C274-01: not visible in the browser, DOM formats to 3 decimals)')]:
    add('deferred_low_polish', {'id': i, 'severity': 'low', 'title': t, 'source': 'gates/round-274/review.md; a-round-274.md; c-round-274.json', 'repro': 'code reading at a4c0e24' + ('; C floatDrift probe c-round-274/probe-r274-new.json' if 'DRIFT' in i else ''), 'status': 'deferred_low_polish (D-29z606)', 'added': A})
add('architecture_signals', {'id': 'GATE274-ARCH-NUDGE-DESCRIBE', 'source': 'gates/round-274/review.md Architecture note', 'text': 'nudge result text is inline in the provider action; proposal: pure describeNudgeResult(before, after, ids): string | null in app/lib/arrangement/status-*.ts with unit tests; must not change useArrangement() shape, the applyEdit -> setRange -> setStatus order or sequence numbers (SK13/SK14/LT20/LT21). Reviewer: keep for now', 'status': 'signal (D-29z606): added to checkpoint addendum b-round-274-checkpoint-addendum.md (question 3); not scheduled', 'added': A})
for x in d['architecture_checkpoint_requests']:
    if x.get('id') == 'ARCH-CHECKPOINT-SYS6-STATUS-TAG':
        x['signals'] = list(dict.fromkeys(x.get('signals', []) + ['GATE274-ARCH-NUDGE-DESCRIBE']))
        x['status'] = 'boundary reached (SYS-6 done, D-29z605); re-requested once with b-round-274-checkpoint-addendum.md (D-29z606, three questions); non-blocking; no automatic default (policy: root approves, then a separate B task) | ' + str(x.get('status'))

# D-29z607: RETRO 275
for r in d['retro_runs']:
    if r.get('round') == 260 and not str(r.get('status', '')).startswith('done'):
        r['status'] = 'done (C round 260 RT rows; RT-FIX-261 PASS) | ' + str(r.get('status'))
if not any(r.get('round') == 275 for r in d['retro_runs']):
    d['retro_runs'].append({'round': 275, 'decision': 'D-29z607', 'window': '260-274', 'report': 'retros/retro-275.md',
        'lessons': 'lessons.md (59 lines): L49 + consumer-sweep (SWEEP tag) clause; L29 code-premise type + prose-ruling evidence clause; header line 3; nothing merged or retired',
        'data': 'b-round-274/*.py, *.json, *.txt (run on backlog-before-275.json) + fails-cause-hand.txt, claims-findings-hand.txt, stops.txt, claims-count.txt',
        'consults': {'tech-lead': 'used', 'consequence-tester': 'used', 'product-designer': 'used (screen review)', 'design-philosopher': 'used (screen review, told to write nothing; tree sha256 rc 0)', 'first-visit-host': 'used (screen review)', 'qa-engineer': 'not in B consult list'},
        'headline': '15 rounds, C PASS 12 / FAIL 3 (260, 265, 267); gate published 11, skipped 3, failed 1 (262); cost $334.94 (B 154.14, A 101.42, C 79.38); 1 of 7 feature stages failed C first time; retro-260 claims-block experiment refuted on the count clause (5 accepted, 1 Medium; failures moved from claims to consumer sweeps); SYS-6 done',
        'screen_review': 'user-review/screen-review-275.md (SR-275-1..8 + SR-275-Q1/Q2, awaiting_user)',
        'status': 'dispatched round 275 (C traceability check)', 'added': A})
rp = d['retro_policy']
rp['next_due'] = 'round 290 or the end of STUDIO-PERFORMANCE, whichever first (retro 275 window 260-274)'
rp['signals_for_next_retro'] = ['retro-275 section 10: SWEEP experiment: post-dispatch findings caused by a missing consumer sweep, baseline 3 (1 Medium); refuted if >= 3 or >= 1 Medium in a task that carried a SWEEP tag; stop: B planning median > $15.77, > 25 tags per task incl. SWEEP, or C sweep re-runs > $3/round (C writes claimRerunMinutes in c-round-N.json, else untestable); null if < 3 tasks remove a boundary, move an element or change a meaning; counters: C FAIL 3/15, in-window fix-ups 3, C median $5.26, lessons <= 60, claim-caused <= 2, STOPped rounds that reach C 0 (baseline 1), shadow row-severity disagreements',
    'RC-R260-ROW-SEVERITY shadow mode: C writes shadowRowSeverityVerdict; adopt at RETRO 290 only if no would-be-deferred Low was later upgraded or needed a fix-up and none stayed open > 5 rounds',
    'lessons merge candidates for RETRO 290 (tech-lead): L21 -> L20, L27 -> L52 (clause-by-clause diff before C)',
    'L46 at RETRO 290: TLM-R274-SR-HELD-REPEAT (GATE274-S1) deadline'] + [s for s in rp.get('signals_for_next_retro', []) if not str(s).startswith('retro-260 section 10')]
add('harness_rules', {'id': 'HR-TRUNCATE-LEAF-BOXES', 'added': 'round 275 planning (D-29z611)', 'rule': 'leaf-box overlap scans clip each leaf box to its truncating ancestor (<p> with truncate/overflow hidden) before counting overlaps; spans hidden by truncate are not overlaps', 'reference': 'RC-R262-NARROW-TRUNCATE-BOXES (c-round-262)'})
add('harness_rules', {'id': 'HR-C-SHADOW-FIELDS', 'added': 'round 275 planning (D-29z611)', 'rule': 'from round 276 C writes two extra fields in c-round-N.json: claimRerunMinutes (wallclock minutes spent re-running claims and SWEEP greps) and shadowRowSeverityVerdict (the verdict a pre-declared row severity would give; informational, never changes taskStatus)', 'reference': 'retro-275 sections 9-10 (consequence-tester)'})

# D-29z608 lessons, D-29z611 retro candidates
disp = {'RC-R262-DEST-CONTAINER-GREP': 'applied: L23 clause (D-29z543); marked at RETRO 275 (D-29z611)',
        'RC-R266-PANEL-CLAMP-CONSUMER': 'applied at RETRO 275: L49 consumer-sweep (SWEEP) clause (D-29z608)',
        'RC-R272-UNPROBED-PREMISE': 'applied at RETRO 275: L29 code-premise evidence clause (prose rulings), 2x (D-29z608)',
        'RC-R262-METER-MUTE-BOUND': 'applied: covered by L29 measured-bound claim type; C wording kept as a harness note (D-29z611)',
        'RC-R271-SCRATCH-NODE-MODULES': 'applied: harness rule HR-SECOND-SERVER-VITE already says never symlink node_modules whole (D-29z611)',
        'RC-R262-NARROW-TRUNCATE-BOXES': 'applied at RETRO 275 as harness rule HR-TRUNCATE-LEAF-BOXES (D-29z611)',
        'C-R261-N1-SWEEP-FORMS': 'applied at RETRO 275: covered by the L49 SWEEP clause (app text sweep includes === and includes( forms when the grep targets copy) (D-29z611)',
        'RC-R266-JSX-ATTR-GREP': 'candidate for RETRO 290 (1x; line budget) (D-29z611)',
        'RC-R270-TEST-ID-COLLISION': 'candidate for RETRO 290 (1x; line budget) (D-29z611)',
        'C-R261-N2-WIRING-WORDING': 'candidate for RETRO 290 (1x) (D-29z611)',
        'RC-R260-ROW-SEVERITY': 'not adopted; shadow mode from round 276 (HR-C-SHADOW-FIELDS); decide at RETRO 290 (D-29z611)'}
for x in d['retro_candidates']:
    if x.get('id') in disp and 'RETRO 275' in str(x.get('status')):
        x['status'] = disp[x['id']] + ' | ' + str(x.get('status'))
add('retro_candidates', {'id': 'RC-R275-STOP-ROUTES-TO-B', 'added': A, 'text': 'an A STOP should route the round back to B before C runs (round 267: A STOPped, C still ran and failed, $5.45 + fix-up $14.38); loop-runner behaviour, proposal for root/Saba (retro-275 section 12.3), not a lesson', 'status': 'proposal for root/Saba'})

# D-29z609 screen review
SR = [('SR-275-1', 'gain value in four formats (+0.0 track, 0.0 dB Master, 0.0 Clip Gain field, 0 dB readout); one format, signed, one decimal, dB', 'visual/copy'),
      ('SR-275-2', 'question: first-run instruction twice (status line and Music lane hint; "Press ? for shortcuts" next to the Shortcuts ? button); options (a) shorter status, (b) lane hint names + Add, (c) keep; CALM-2b text', 'copy (question)'),
      ('SR-275-3', 'Master peak "-inf" in a bordered box reads as an empty input; remove the border, tooltip "Peak"', 'visual'),
      ('SR-275-4', 'Clip Gain field shows 0.0 and an enabled-looking slider with no clip selected; empty, dimmed, disabled tooltip, geometry unchanged', 'visual'),
      ('SR-275-5', 'library cards and preview header show durations with milliseconds, twice; show 1:42 there, keep ms in timeline and Clip details', 'copy/visual'),
      ('SR-275-6', 'question: collection label "CZABA public previews + synthetic SFX" wraps to three lines; shorter label, full text in tooltip', 'copy (question)'),
      ('SR-275-7', 'two equally bright start hints (Video lane and Music lane) on an empty project; dim the video hint until the first clip', 'visual'),
      ('SR-275-8', 'last library card cut in half with no scroll cue; bottom fade or +N more', 'visual'),
      ('SR-275-Q1', 'question (position move): at 1280 move Master up to the status row end so the footer is one row', 'layout (question)'),
      ('SR-275-Q2', 'question: empty-lane time selection (round 265) has no signifier; one ? sheet row and a hover cursor', 'behaviour signifier (question)')]
for i, w, k in SR:
    add('screen_review_candidates', {'id': i, 'what': w, 'kind': k, 'status': 'awaiting_user', 'source': 'user-review/screen-review-275.md; b-round-274/screens/', 'added': A})

# D-29z610 L46 at RETRO 275
L46 = ['A-R204-SAFARI-USERMENU-CLICK', 'TLM-R232-ALTGR-WIN', 'TLM-R232-MAC', 'TLM-R228-META-KEYS', 'TLM-R233-SR-ORDER']
for x in d['tech_lead_manual_checks']:
    if x.get('id') in L46:
        x['l46_retro275'] = 'deadline passed twice (RETRO 260, RETRO 275) without an answer; recorded as a Saba-owned manual item in the final acceptance list (no cloud path: Chromium only) (D-29z610)'
x = find('open_findings', 'GATE244-S4')
if x is not None:
    x['l46_retro275'] = 'macOS Ctrl+click half: Saba-owned manual item in the final acceptance list (D-29z610); contract half verified C round 264'
d['final_acceptance_saba_manual_items'] = {'added': A, 'decision': 'D-29z610', 'rule': 'retro_policy signal from RETRO 260: without an answer at RETRO 275, the platform halves become Saba-owned manual items in the final acceptance list; they do not block rounds; the whole request is not COMPLETE until Saba reports them',
    'items': L46 + ['GATE244-S4 (macOS Ctrl+click)', 'GATE232-S2 (Windows AltGr platform half)', 'TLM-R274-SR-HELD-REPEAT (deadline RETRO 290)']}

# D-29z612 order + SYS-5 note
for x in d['systemic_tasks']:
    if x.get('id') == 'SYS-5':
        x['note_retro275'] = 'next after RETRO 275 (round 276 unless REGRESSION is due, on/after 2026-11-02). Planning check (tech-lead, D-29z612): grep the sketch for setStatus; if a disabled-reason path writes status text, add L51 rows (clobber + lifetime) and one evidence line to ARCH-CHECKPOINT-SYS6-STATUS-TAG. Apply the L49 SWEEP clause: aria-disabled replaces disabled, so every toBeDisabled/disabled consumer is a SWEEP hit'

DL = [('D-29z605', 'Round 274 accepted: ' + EV274 + '. Closed C-R271-01-NUDGE-STALE-STATUS and GATE270-S2-REPEAT-ANNOUNCE (removed from deferred_low_polish, kept in open_findings as closed), A-R273-REPEAT-PASTEND, GATE273-S4-PBS9-DESCRIBE; SYS-6 done; INFO-C274-01/02 info'),
      ('D-29z606', 'Gate-274 triage: S1 -> GATE274-S1-HELD-REPEAT-ANNOUNCE Medium open_tech_lead_manual (TLM-R274-SR-HELD-REPEAT, deadline RETRO 290; tech-lead disagreement recorded); S2/S3/S4 + A-R274-GROUP-NUDGE-FLOAT-DRIFT -> deferred_low_polish (462 - 2 + 4 = 464); Architecture note -> GATE274-ARCH-NUDGE-DESCRIBE signal + checkpoint addendum 2 (boundary reached, re-requested once, non-blocking)'),
      ('D-29z607', 'RETRO 275 (window 260-274): retros/retro-275.md; numbers from b-round-274 scripts on backlog-before-275.json; experiment refuted on the count clause; next due round 290 or end of STUDIO-PERFORMANCE'),
      ('D-29z608', 'lessons.md 59 -> 59: L49 + consumer-sweep SWEEP clause (3x); L29 code-premise type + prose-ruling evidence clause (2x); header updated; no merge (L21->L20, L27->L52 candidates for RETRO 290)'),
      ('D-29z609', 'Whole-screen review: user-review/screen-review-275.md SR-275-1..8 + Q1/Q2 awaiting_user (product-designer, design-philosopher, first-visit-host)'),
      ('D-29z610', 'L46 at RETRO 275: A-R204-SAFARI-USERMENU-CLICK and the platform halves (TLM-R232-ALTGR-WIN/GATE232-S2, TLM-R232-MAC, TLM-R228-META-KEYS, TLM-R233-SR-ORDER, GATE244-S4) recorded as Saba-owned manual items in the final acceptance list (final_acceptance_saba_manual_items)'),
      ('D-29z611', 'Retro candidates disposed (applied / harness rule / RETRO 290); harness rules HR-TRUNCATE-LEAF-BOXES and HR-C-SHADOW-FIELDS; RC-R260-ROW-SEVERITY shadow mode only; RC-R275-STOP-ROUTES-TO-B proposal for root/Saba'),
      ('D-29z612', 'Order: 275 RETRO -> 276 SYS-5 (first stage; SWEEP + setStatus check at planning) -> STUDIO-PERFORMANCE; REGRESSION goes first when due (on/after 2026-11-02); architecture checkpoint non-blocking')]
have = {x.get('id') for x in d['decisions_log_b'] if isinstance(x, dict)}
for i, t in DL:
    if i not in have:
        d['decisions_log_b'].append({'id': i, 'date': '2026-10-30', 'text': t})
if not any(r.get('round') == 275 for r in d['rounds']):
    d['rounds'].append({'round': 275, 'task': 'current-task.md', 'decision': 'D-29z605..D-29z612', 'status': 'dispatched', 'type': 'RETRO 275 (window 260-274) + whole-screen review (no app code)', 'note': 'baseline a4c0e24 clean; frozen 1138 (b-round-274-r275-tree-sha256.txt); grants none; outputs retros/retro-275.md, lessons.md, user-review/screen-review-275.md', 'next': 'all RT rows PASS -> round 276 = SYS-5 (or REGRESSION if due); RT row failure -> RT-FIX lines in round 276', 'added': A})
json.dump(d, open(P, 'w'), indent=1, ensure_ascii=False)
print('ok', d['version'], len(d['deferred_low_polish']), len(d['open_findings']))
