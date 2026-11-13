# B round 490 -> 491 planning: backlog update (run once: python3 -I b-round-490/update-backlog.py from the loop root).
import json, os
P = 'backlog.json'
MARK = 'b-round-490/update-backlog.done'
if os.path.exists(MARK):
    raise SystemExit('already applied')
b = json.load(open(P, encoding='utf-8'))
BY = '2026-11-13 B round 490 -> 491 planning'
arch = json.load(open('archive/findings-archived.json', encoding='utf-8'))
arch_list = arch if isinstance(arch, list) else arch.get('findings', arch.get('items', []))
arch_by = {f['id']: f for f in arch_list if isinstance(f, dict) and 'id' in f}
of = b['open_findings']
of_by = {f['id']: f for f in of if isinstance(f, dict) and 'id' in f}

DONE490 = 'done (D-29z1752): C round 490 PASS (browserVerified true, c-round-490.json), gate 490 published 53ff249 (rounds 489-490)'
for fid in ('SABA-B-17-ENTRANCE-3-4S', 'B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED', 'B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER', 'A-R489-REVIEW-NONZOOM-CLASSIFY'):
    if fid in of_by:
        f = of_by[fid]
        f['status'] = DONE490 + ' | ' + str(f.get('status', ''))
    else:
        src = dict(arch_by[fid])
        src['status'] = DONE490 + ' | ' + str(src.get('status', ''))
        of.append(src)
of_by['A-R489-REVIEW-NONZOOM-CLASSIFY'].setdefault('confirmedBy', 'C-R489-A-STOP-NONZOOM-TEST-GAP (C round 489)')

dl = b['deferred_low_polish']
new_lows = [
    {'id': 'A-R490-REVIEW-NOCTRL-NEG-WHEEL', 'severity': 'low', 'origin': 'B spec',
     'status': 'deferred_low_polish (D-29z1753): ruled Low inside the pinned contract; closes in the first round that touches store-entrance-loader.test.tsx or extracts useEntranceSkip (SIG-R489-ENTRANCE-ZOOM-RULE-TWICE): S1 and E8c gain a no-ctrl wheel row at deltaY -100 and a mutant ctrlKey || deltaY < 0 (overlay and boot) must be red there',
     'title': 'Entrance scroll rows send a no-ctrl wheel only at deltaY +100, so a classifier ctrlKey || deltaY < 0 survives S1/E8c',
     'evidence': 'a-round-490.md R1 (code-reviewer); round-490 task contract "ctrlKey alone decides zoom, at both delta signs"', 'repro': 'mutate isZoomGesture to event.ctrlKey || event.deltaY < 0; S1/E8c stay green', 'added': BY},
    {'id': 'A-R490-REVIEW-TOUCH-DELTA-LABEL', 'severity': 'low', 'origin': 'B spec',
     'status': 'deferred_low_polish (D-29z1753): cosmetic test-title nit; same closing round as A-R490-REVIEW-NOCTRL-NEG-WHEEL',
     'title': 'E8e title shows "touchmove (deltaY 0)"; the deltaY default of dispatchZoomGesture is never used', 'evidence': 'a-round-490.md R2', 'repro': 'grep -n "touchmove (deltaY" app/lib/__tests__/store-entrance-loader.test.tsx', 'added': BY},
    {'id': 'A-R490-REVIEW-E18-LITERAL', 'severity': 'low', 'origin': 'B spec',
     'status': 'deferred_low_polish (D-29z1753): E18 uses ENTRANCE_FAILSAFE_MS + 250 (E1 pins 250, not weaker); same closing round as A-R490-REVIEW-NOCTRL-NEG-WHEEL',
     'title': 'store-entrance-loader E18 keeps the + 250 literal where E8d now uses ENTRANCE_EXIT_MS', 'evidence': 'a-round-490.md R3', 'repro': 'grep -n "ENTRANCE_FAILSAFE_MS + 250" app/lib/__tests__/store-entrance-loader.test.tsx', 'added': BY},
    {'id': 'GATE490-L1-SKIP-LISTENER-ASYNC-REMOVE', 'severity': 'low', 'origin': 'B spec',
     'status': 'deferred_low_polish (D-29z1753): inside round 489 accepted exit-fade ruling (React-path burst, info in task 490); fix with useEntranceSkip extraction (remove listeners synchronously before hideEntrance)',
     'title': 'SpotlightLoader React skip handler removes wheel/touch listeners only after the commit; 1-3 burst events may be swallowed', 'evidence': 'gates/round-490/review.md Low 1', 'repro': 'SpotlightLoader.tsx handleEntranceSkipScroll', 'added': BY},
    {'id': 'GATE490-L2-TOUCH-JITTER-SKIP', 'severity': 'low', 'origin': 'B spec',
     'status': 'deferred_low_polish (D-29z1753): real-phone half joins TLM-R489-TOUCH-SWIPE (tap with finger jitter must not skip); fix (about 10 px threshold) only if the phone check shows it',
     'title': 'Any one-finger touchmove (tap jitter) is prevented and skips the entrance', 'evidence': 'gates/round-490/review.md Low 2', 'repro': 'real phone: tap during the entrance with slight finger movement', 'added': BY},
    {'id': 'GATE490-L3-FAILSAFE-2S', 'severity': 'low', 'origin': 'B spec',
     'status': 'deferred_low_polish (D-29z1753): deliberate round 489 trade-off (doc 316); error path only, first visit per tab',
     'title': 'CSS failsafe 1 s -> 2 s: when JS fails the cover stays black up to 2 s', 'evidence': 'gates/round-490/review.md Low 3', 'repro': 'block JS on a fresh tab of /', 'added': BY},
    {'id': 'GATE490-L5-OVERLAY-RENDER-COST', 'severity': 'low', 'origin': 'B spec',
     'status': 'deferred_low_polish (D-29z1753): 4x CPU probe passed (C round 490 C6/C7); revisit with a low-end device measurement or STUDIO/STORE perf work',
     'title': 'Entrance overlay effects (blur glow, feTurbulence grain, conic gradient, 15 infinite particles) run 2-3x longer during hydration', 'evidence': 'gates/round-490/review.md Low 5', 'repro': 'Performance panel on a throttled first visit', 'added': BY},
]
new_lows.append({'id': 'B-R491-NARROW-EDITOR-E2E-GUARD', 'severity': 'low', 'origin': 'B spec',
     'status': 'deferred_low_polish (D-29z1754): tech-lead TL-R491-L2; follow-up after round 491: a role-based Playwright test at 375 px (signed-in stub, /api/downloads stubbed) asserting Save name and Cancel name edit are inside the viewport; the smoke config has no signed-in stub today',
     'title': 'No durable automated guard for the Profile name editor fitting at narrow widths (jsdom cannot lay out; class asserts are forbidden by L12)',
     'evidence': 'b-round-490/sketch-review.md TL-R491-L2', 'repro': 'remove min-w-0 from the name inputs; no test turns red', 'added': BY})
have = {f['id'] for f in dl if isinstance(f, dict) and 'id' in f}
for f in new_lows:
    if f['id'] not in have:
        dl.append(f)
for f in dl:
    if isinstance(f, dict) and f.get('id') == 'B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER':
        f['confirmedBy'] = (str(f.get('confirmedBy', '')) + ' | ' if f.get('confirmedBy') else '') + 'gates/round-490/review.md Low 4 (no visible skip cue; Enter/Space/arrows scroll under the cover) (D-29z1753)'

tlm = b['tech_lead_manual_checks']
for t in tlm:
    if t.get('id') == 'TLM-R489-SABA-ENTRANCE-FEEL':
        t['note_r490'] = 'C round 490 info: C-R490-INFO-EXIT-FADE-DOUBLE-WORDMARK (at 3.2 s the entrance wordmark and the hero CZABA headline show together mid-crossfade, c-round-490/rec/saba-b-17-entrance-after-1440-3200.png) and C-R490-INFO-CLICK50-HANDOFF-GAP (0-2 sampled frames at the cover-to-overlay hand-off on a pre-hydration click; blackFrames 0). Ask Saba with the recording (D-29z1753)'
    if t.get('id') == 'TLM-R489-TOUCH-SWIPE':
        t['note_r490'] = 'also GATE490-L2-TOUCH-JITTER-SKIP: a tap with slight finger movement during the entrance must not skip it (D-29z1753)'
tlm.append({'id': 'TLM-R491-PHONE-NAME-EDITOR', 'added': BY,
            'status': 'open (D-29z1754): deadline RETRO 495 (L46); does not block (2026-10-23 root clarification class)',
            'what': 'Real phone (iOS Safari and Android Chrome), signed in, /account: open the Full Name editor; Save and Cancel are visible and tappable; focusing a name input (text-lg, 18 px, no iOS focus zoom expected) does not push the buttons off-screen; the virtual keyboard does not hide them'})

for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R489-ENTRANCE-ZOOM-RULE-TWICE':
        s['confirmedBy'] = (str(s.get('confirmedBy', '')) + ' | ' if s.get('confirmedBy') else '') + 'gate 490 Architecture note (signals 3 and 4; keep for now; proposal useEntranceSkip(hide) in app/components/loading/, removing listeners synchronously, S1/S2/S3/E8c/E8d/E8e green) and A round 490 reviewer note (contract table ctrl x sign, 1/2 touches) (D-29z1753)'
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-ENTRANCE-LOADING':
        r['status'] = 'sent to root (D-29z1753): round 490 C PASS + gate 490 published 53ff249; request b-round-490/checkpoint-request-entrance.md (adds the gate-490 useEntranceSkip proposal); non-blocking | ' + str(r.get('status', ''))
        r['file'] = 'b-round-490/checkpoint-request-entrance.md'
    if r.get('id') == 'ARCH-CHECKPOINT-ACCOUNT-PROFILE':
        r['status'] = 'no root answer found at round 491 planning (D-29z1754); still requested, non-blocking: round 491 only adds min-w-0 to two inputs (no new editor state); answer wanted before round 492 (PasswordModal dialog) | ' + str(r.get('status', ''))

for f in of:
    if f.get('id') == 'B-R487-PROFILE-EDITOR-NARROW-OVERFLOW':
        f['status'] = 'dispatched (D-29z1754): round 491, sketch b-round-490/sketch-491.patch.txt (min-w-0 on both name inputs); B browser evidence b-round-490/probe/ | ' + f['status']
    if f.get('id') == 'B-R488-PASSWORD-MODAL-DIALOG':
        f['status'] = 'scheduled (D-29z1754): round 492 (REGRESSION first if planning is on/after 2026-11-16) | ' + f['status']

for r in b['rounds']:
    if r.get('round') == 490:
        r['status'] = 'C PASS (browserVerified true); gate 490 published 53ff249 (with round 489)'
b['rounds'].append({'round': 491, 'task': 'current-task.md', 'decision': 'D-29z1754', 'type': 'B-R487-PROFILE-EDITOR-NARROW-OVERFLOW (Medium)', 'status': 'dispatched',
                    'note': 'baseline HEAD 53ff249 clean; sketch b-round-490/sketch-491.patch.txt; claims b-round-490/claims-491.sh; probes b-round-490/probe/narrow-491.mjs, mut-491.mjs'})
b['current_task'] = 'Round 491: B-R487-PROFILE-EDITOR-NARROW-OVERFLOW - min-w-0 on both Full Name inputs so Save/Cancel stay on-screen and clickable/tappable at 375/360/320 px; desktop boxes equal HEAD; baseline 53ff249 (current-task.md, sketch b-round-490/sketch-491.patch.txt)'
b['updated'] = '2026-11-13'
dec = b['decisions_log_b']
dec.extend([
    {'id': 'D-29z1752', 'date': '2026-11-13', 'by': BY, 'decision': 'Round 490 closed: C PASS (browserVerified true, 24 rows), gate 490 published 53ff249. SABA-B-17-ENTRANCE-3-4S, B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED, B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER and A-R489-REVIEW-NONZOOM-CLASSIFY -> done (V2: browser verified). TLM-R489-SABA-ENTRANCE-FEEL and TLM-R489-TOUCH-SWIPE stay open (deadline RETRO 495). Task archived as tasks/round-490.md (cmp).'},
    {'id': 'D-29z1753', 'date': '2026-11-13', 'by': BY, 'decision': 'Rulings on round 490 findings: A-R490-REVIEW-NOCTRL-NEG-WHEEL ruled Low (inside the pinned contract; named closing condition), A-R490-REVIEW-TOUCH-DELTA-LABEL and -E18-LITERAL Low; gate-490 reviewer Lows 1, 2, 3, 5 -> GATE490-L1/L2/L3/L5 in deferred_low_polish, Low 4 = confirmedBy on B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER; C infos attached to TLM-R489-SABA-ENTRANCE-FEEL. Gate-490 Architecture note -> confirmedBy on SIG-R489-ENTRANCE-ZOOM-RULE-TWICE (signal, not a task). ARCH-CHECKPOINT-ENTRANCE-LOADING sent to root (b-round-490/checkpoint-request-entrance.md).'},
    {'id': 'D-29z1754', 'date': '2026-11-13', 'by': BY, 'decision': 'Round 491 = B-R487-PROFILE-EDITOR-NARROW-OVERFLOW (Medium, bug gate; regression not due until 2026-11-16, RETRO at 495). Fix = min-w-0 on both name inputs (B browser: desktop equal to HEAD on prod builds; 375/360/320 Save/Cancel on-screen, click and tap 1 PUT; DOM mutant without min-w-0 red). Rejected: flex-wrap, stacked layout, and v0 (flex-1 + sm: + shrink-0; redundant tokens survived mutants). Layout is browser-only (L12 forbids class asserts); HEAD build + DOM mutant are the red controls. New manual row TLM-R491-PHONE-NAME-EDITOR. Order after: 492 B-R488-PASSWORD-MODAL-DIALOG, then DPG-BUTTON-CLEANUP / remaining DPG P1 (REGRESSION first when due on/after 2026-11-16).'},
])
for e in b['post_current_stage_queue']:
    if isinstance(e, dict) and e.get('id') == 'DPG-FIX':
        e['status'] = 'in_progress (D-29z1754): 489-490 SABA-B-17 done (published 53ff249); 491 B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, 492 B-R488-PASSWORD-MODAL-DIALOG, then DPG-BUTTON-CLEANUP (REGRESSION first when due on/after 2026-11-16; RETRO 495) | ' + str(e.get('status', ''))
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(MARK, 'w').write('ok\n')
print('updated')
