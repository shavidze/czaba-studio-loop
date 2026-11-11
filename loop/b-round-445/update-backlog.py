"""B round 445 -> 446 planning backlog update. Idempotent: refuses to run twice (update-backlog.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
B = f'{LOOP}/b-round-445'
DONE = f'{B}/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
SHA = open(f'{B}/sketch-446.sha256').read().split()[0][:8]
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 445 -> 446 planning'
b['version'] += 1
b['updated'] = '2026-11-11'
of = {e.get('id'): e for e in b['open_findings']}
dl = b['deferred_low_polish']
di = {e.get('id'): e for e in dl}
C445 = 'C round 445 PASS (c-round-445.json, browserVerified/realVerified true, 0 bugs; C5 tree ALL OK 14 / HEAD 8 of 14 failing; C6 ALL OK 18 x3; C7 ALL SAME 18), gate 445 published 4bfebd7'

# D-29z1582: round 445 accepted, SYS-3 complete
for fid in ['A-R443-REVIEW-L1-IME6-WEAK-GAIN', 'A-R443-REVIEW-L2-IME6-ONE-IT', 'A-R444-REVIEW-I1-HELD-ESC-VIDEO']:
    e = of[fid]; e['status'] = f'closed (D-29z1582): {C445} | ' + e['status']; e['closed_round'] = 445
g = of['GATE443-L1-REPEAT-ESCAPE-BUBBLES']
g['status'] = f'closed (D-29z1582): C round 445 re-ran the GAIN and LIBSEARCH held-Escape cells on tree and HEAD; the video stays expanded on both (no user-visible effect); {C445} | ' + g['status']
g['closed_round'] = 445
t3 = di['TL-R443-G3-PLAIN-HELD-ROWS']
t3['status'] = f'closed (D-29z1582): IME13 plain held rows for all five editors; {C445} | ' + t3['status']
t3['closed_round'] = 445
for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R442-INLINE-EDITOR-KEYS':
        s['status'] = f'implemented (D-29z1582): inlineEditorKeyIntent + IME14/IME15 scan; {C445} | ' + s['status']
    if s.get('id') == 'TL-R445-I1-SCAN-NESTED-DESTRUCTURING':
        s.setdefault('confirmedBy', []).extend(['A-R445-REVIEW-L3 (bracket access, named 229 constant, "in" form; a-round-445.md)', 'gates/round-445/review.md finding 4 (Info)'])
s3 = [x for x in b['systemic_tasks'] if x['id'] == 'SYS-3'][0]
s3['status'] = f'done (D-29z1582): stage 2b {C445}; stages 1, 1-fix, 2a, 2b all C PASS and published (4aa3c82, 1eefb4c, 616729c, 4bfebd7); open platform half TLM-SYS3-IME-PLATFORMS (RETRO 450) | ' + s3['status']
for st in s3.get('stages_d29z1571', []):
    if st['id'] == 'SYS-3-stage-2b':
        st['status'] = f'done (D-29z1582): {C445}'
dl.append({'id': 'A-R445-REVIEW-L1-IME12-229-FORM', 'severity': 'low', 'origin': 'B spec (sketch-445; found by A code-reviewer)',
           'status': 'deferred_low_polish (D-29z1582): test-only gap; the helper is shared, so the 229 form is exercised through BPM, marker and Clip Gain (IME6)',
           'title': 'IME12 drives composing only in the isComposing form; the keyCode 229 form is not covered for the group editor and Detail From/To',
           'evidence': 'a-round-445.md code-reviewer L1', 'repro': 'app/lib/arrangement/__tests__/ime-composition-stage2b-ui.test.tsx:173-178 at 4bfebd7',
           'fix': 'add the 229 form to the IME12 editor x key-form table', 'added': by, 'systemic_task': 'SYS-3'})
dl.append({'id': 'A-R445-REVIEW-L2-DETAIL-TO-FIELD', 'severity': 'low', 'origin': 'B spec (sketch-445; found by A code-reviewer)',
           'status': 'deferred_low_polish (D-29z1582): To shares the From handler', 'title': 'IME12/IME13 exercise only the Detail From field, not To',
           'evidence': 'a-round-445.md code-reviewer L2', 'repro': 'ime-composition-stage2b-ui.test.tsx:160 at 4bfebd7', 'fix': 'add a To row', 'added': by, 'systemic_task': 'SYS-3'})
dl.append({'id': 'A-R445-REVIEW-L3-IME14-SCAN-FORMS', 'severity': 'low', 'origin': 'B spec (sketch-445; found by A code-reviewer)',
           'status': 'deferred_low_polish (D-29z1582); same class as TL-R445-I1 (confirmedBy there)',
           'title': 'IME14 source scan misses event["isComposing"], a named constant for 229 and the "isComposing" in event form; IME15 title claims slightly more than the regex covers',
           'evidence': 'a-round-445.md code-reviewer L3; gates/round-445/review.md finding 4', 'repro': 'app/lib/arrangement/__tests__/ime-composition-source-scan.test.ts at 4bfebd7',
           'fix': 'extend the regex or narrow the IME15 title', 'added': by, 'confirmedBy': ['gates/round-445/review.md finding 4 (Info)'], 'systemic_task': 'SYS-3'})
dl.append({'id': 'GATE445-L3-PRESSCELL-FINALLY', 'severity': 'low', 'origin': 'B spec (sketch-445; found by gate reviewer)',
           'status': 'deferred_low_polish (D-29z1582): test-only; production unaffected',
           'title': 'pressCell removes its document listener only after fireEvent.keyDown returns; a throwing dispatch leaks the listener into the next test',
           'evidence': 'gates/round-445/review.md finding 3', 'repro': 'app/lib/arrangement/__tests__/ime-composition-stage2b-ui.test.tsx:167-182 at 4bfebd7',
           'fix': 'try/finally around the dispatch', 'added': by, 'systemic_task': 'SYS-3'})
b['architecture_signals'].append({'id': 'SIG-R445-INTENT-RETURNS-KEY', 'added': by, 'decision': 'D-29z1582',
    'source': 'gates/round-445/review.md finding 2 + Architecture note',
    'signal': 'ArrangementDetailPanel and ArrangementTempoRow re-read event.key after inlineEditorKeyIntent to tell Enter from Escape; proposal: the helper returns settle with the matched key so the 4 call sites stop reading event.key; acceptance IME11/12/13 green. Gate verdict on the helper: keep (pure, no timing, low cost)',
    'status': 'signal only; not scheduled (A-R445 Architecture note agrees: keep the helper, do not build a handler factory)'})

# D-29z1583: STORE-REDESIGN resumes; STORE-2b split
q = {e['id']: e for e in b['post_current_stage_queue']}
sr = q['STORE-REDESIGN']
sr['status'] = ('in_progress (D-29z1583): resumed after SYS-1..3 (SYS-3 done round 445, D-29z1582) per the 2026-10-27 order (STUDIO-PERFORMANCE, SYS-1..3, then STORE-2b..5); STEM-LANES still awaiting_user (AGREE-STEM-LANES.md unanswered) so it does not outrank STORE-2b; '
                'STORE-2b split 2b-1..2b-4; round 446 = STORE-2b-1 | ' + sr['status'])
for st in sr['stages']:
    if st['id'] == 'STORE-2':
        st['status'] = 'in_progress (D-29z1583): 2a done (published 7339cd5); 2b split 2b-1..2b-4; 2b-1 dispatched round 446; 2c, 2d not_started | ' + st['status']
        st['split_2b_d29z1583'] = {
            'STORE-2b-1': 'round 446: PD-REVIEW F4 / Saba Q3 - LeadMagnet does not open on /products/*, /cart, /checkout*; fresh window after an excluded page; an open popup hides on an excluded route without a dismissal and without the old-page scroll jump; keep-list content and HEAD one-shot 8 s timer unchanged. Why first: Saba-approved behaviour (Medium in the PD review), small, and it removes the auto-open popup from STORE-4 product-page probes (L1)',
            'STORE-2b-2': 'hardcoded teal sweep in TS/TSX; recount at 4bfebd7: 24 hits in 9 files (regex in b-round-445.md section 4; the old 37/14 count was at caa09af with another regex); B re-greps at planning with app/** and perf/** roots (L23/L29)',
            'STORE-2b-3': 'app/styles/app.css: 6 blur glow blobs, gradient text (--gradient-text, .text-glow), shadow-glow, teal gradient/glow tokens, decorative crystal/premium/info/video/buy-blue alias colours; needs a B narrow grant for app/styles/app.css with an exact byte scope (precedent rounds 192, 196, 201, 316); obsidian block byte-identical; components/studio/** StudioTrack.tsx:155 stays global_forbidden (signal)',
            'STORE-2b-4': 'F6 visual part (one name "CZABA Studio" done by NAME-AND-HINT; remaining visual mismatch handled inside the restyle stages)',
            'why': 'one feature stage per round; nothing dropped from STORE-2b', 'added': by}
b['open_findings'].append({'id': 'SABA-Q-LEADMAGNET-RECORDINGS-SCENES', 'severity': 'info', 'origin': 'B + product-designer (round 446 planning)',
    'title': 'Should the LeadMagnet popup also stay closed on /recordings/* and /scenes/* (product-detail-like views)? Default: not excluded (Saba Q3 named only /products/*, /cart, /checkout*)',
    'status': 'awaiting_user (D-29z1583): not scheduled; asked once via feature-status.md', 'added': by})
b['architecture_signals'].append({'id': 'SIG-R446-LEADMAGNET-CAP-COMMENT', 'added': by, 'decision': 'D-29z1583',
    'source': 'product-design-review-2026-10-31 F4 + B read of app/hooks/useLeadMagnet.ts at 4bfebd7',
    'signal': 'MAX_VIEWS_PER_DAY = 10 while its comment says "Max 2 views per day"; behaviour is keep-list, so only Saba can change the value; the comment can go in the store polish pass',
    'status': 'signal only; not scheduled'})

# D-29z1584: dispatch round 446
dl.append({'id': 'TL-R446-L1-POP-RESTORE-LOST', 'severity': 'low', 'origin': 'B pre-check (tech-lead v2 sketch review)',
           'status': 'deferred_low_polish (D-29z1584): accepted in round 446 (ruling line); better than the old-offset jump the v1 sketch had',
           'title': 'A Back (POP) navigation to an excluded route while the LeadMagnet popup is open loses Remix ScrollRestoration\'s saved position for that page: the restore runs in a layout effect while the body is still position:fixed, so the page lands at its top',
           'evidence': 'b-round-445/sketch-review.md pass 2', 'repro': 'open the popup on /, scroll a product page first so it has a saved position, Back while the popup is open',
           'fix': 'unlock synchronously in a layout effect before ScrollRestoration, or re-apply the saved position after unlock', 'added': by})
for r in b['rounds']:
    if r.get('round') == 445:
        r['status'] = 'done (D-29z1582): C PASS browserVerified true, gate 445 published 4bfebd7'
b['rounds'].append({'round': 446, 'task': 'current-task.md', 'decision': 'D-29z1584', 'type': 'STORE-2b-1 (LeadMagnet route exclusion, PD-REVIEW F4 / Saba Q3)', 'status': 'dispatched',
                    'note': 'baseline 4bfebd7 (gate 445 published); sketch b-round-445/sketch-446.patch.txt sha ' + SHA + '; claims b-round-445/claims-446.sh; grants b-round-445/grants-446.txt'})
pd = q.get('PD-REVIEW-2026-10-31')
if pd is not None:
    pd['status'] = 'in_progress (D-29z1584): F4/Q3 LeadMagnet route exclusion dispatched as STORE-2b-1 (round 446) | ' + pd['status']
b['decisions_log_b'] += [
    {'id': 'D-29z1582', 'date': '2026-11-11', 'by': by,
     'decision': 'Round 445 accepted from C evidence: ' + C445 + '. SYS-3 complete (stages 1, 1-fix, 2a, 2b). Closed: TL-R443-G3-PLAIN-HELD-ROWS, A-R443-REVIEW-L1/L2, A-R444-REVIEW-I1-HELD-ESC-VIDEO, GATE443-L1-REPEAT-ESCAPE-BUBBLES (C re-ran the GAIN/LIBSEARCH cells), SIG-R442-INLINE-EDITOR-KEYS (implemented). A reviewer Lows L1/L2/L3 -> deferred_low_polish (L3 also confirmedBy on TL-R445-I1). Gate 445: finding 1 Low needs no fix (idempotent guard, FV-HELD covers it); finding 2 -> SIG-R445-INTENT-RETURNS-KEY (signal); finding 3 -> GATE445-L3-PRESSCELL-FINALLY (deferred Low); finding 4 Info -> confirmedBy. A and gate Architecture notes agree: keep inlineEditorKeyIntent; no checkpoint request. L57 on c-round-445.json OK (b-round-445/l57-check-c445.txt).'},
    {'id': 'D-29z1583', 'date': '2026-11-11', 'by': by,
     'decision': 'STORE-REDESIGN resumes (2026-10-27 order: STUDIO-PERFORMANCE, SYS-1..3, then STORE-2b..5; regression due 2026-11-13; RETRO 450). STEM-LANES stays awaiting_user. STORE-2b split into 2b-1 (LeadMagnet route exclusion, PD F4 / Saba Q3), 2b-2 (TS/TSX teal sweep, recount 24 hits / 9 files at 4bfebd7), 2b-3 (app.css glow/gradient, B narrow grant), 2b-4 (F6 visual). 2b-1 first: Saba-approved behaviour, small, unblocks STORE-4 product-page probes. New: SABA-Q-LEADMAGNET-RECORDINGS-SCENES (awaiting_user, default not excluded), SIG-R446-LEADMAGNET-CAP-COMMENT (signal).'},
    {'id': 'D-29z1584', 'date': '2026-11-11', 'by': by,
     'decision': 'Dispatch round 446 = STORE-2b-1 on 4bfebd7: sketch b-round-445/sketch-446.patch.txt sha ' + SHA + ' (tech-lead v1 approve-with-changes: M1 scroll restore reproduced by B in Chromium y=206 vs 0, M2 same-render mask, L3 error reset, L4 router flags, all applied; v2 approve with Low TL-R446-L1-POP-RESTORE-LOST deferred). product-designer rulings (a) suppress, (b) fresh window, (c) hide without dismissal, (d) Saba list only; the designer\'s second 8 s wait corrected to HEAD one-shot timer (keep-list). Grants: useLeadMagnet.ts, useScrollLock.ts (option, default true), LeadMagnetPopup.tsx (one call), new store-lead-magnet-routes.test.tsx, doc 291. B pre-check: 14/14 mutants red incl. HEAD sources, full suite on sketch, typecheck 0, lint 205 = HEAD, HEAD browser control popup on all excluded routes at 1440/1280/375.'},
]
b['current_task'] = 'Round 446: STORE-2b-1 (LeadMagnet does not open on /products/*, /cart, /checkout*; sketch b-round-445/sketch-446.patch.txt sha ' + SHA + ') on 4bfebd7 (current-task.md)'
b['advisor_used_by_B'] = 'round 445 -> 446 planning: advisor available and consulted after orientation and before hand-off'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n')
print('ok v', b['version'])
