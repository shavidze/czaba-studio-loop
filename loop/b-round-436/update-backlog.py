# B round 436 -> 437 planning: accept round 436 (COPY-PD-VIS stage 1), dispatch stage 2 (v420 -> v421). Idempotent guard.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-436/update-backlog.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 420 and b['decisions_log_b'][-1]['id'] == 'D-29z1547', (b['version'], b['decisions_log_b'][-1]['id'])
BY = '2026-11-10 B round 436 -> 437 planning'
def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-10', 'by': BY, 'decision': text})
F = {f.get('id'): f for f in b['open_findings'] if isinstance(f, dict)}
D = {f.get('id'): f for f in b['deferred_low_polish'] if isinstance(f, dict)}
S = {f.get('id'): f for f in b['screen_review_candidates'] if isinstance(f, dict)}

dec('D-29z1548', 'Round 436 (COPY-PD-VIS stage 1) accepted from C evidence: c-round-436.json PASS, 0 bugs, browserVerified/realVerified true (C3-C7 and C12-C13 real Chromium at 1440x900 and 1280x720); B re-ran tools/l57-check.py (b-round-436/l57-check-c436.txt, L57 OK). Gate 436 published 69de9bd (both remotes); gate review COMMIT OK with two Lows that are TL-R436-03 and TL-R436-02 (confirmedBy, L7) and an Architecture note equal to TL-R436-02 (no new id). STUDIO-VIS-4, STUDIO-VIS-6 and SR-435-2 -> done. Q4 / SR-435-1 (unit in the label) stays awaiting_user. The fake-bearer token row stays open evidence (backend unavailable in cloud). A note: UI says "clip origin" while code keeps sourceOffset/sourceOffsetLabel/clip-offset-label -> architecture signal SIG-R436-CLIP-ORIGIN-NAMING (not scheduled).')
for i in ('STUDIO-VIS-4', 'STUDIO-VIS-6'):
    F[i]['status'] = 'done (D-29z1548): C round 436 PASS browserVerified, published 69de9bd | ' + F[i]['status']
S['SR-435-2']['status'] = 'done (D-29z1548): C round 436 PASS (0 "source offset" in DOM text/attributes at both viewports), published 69de9bd | ' + S['SR-435-2']['status']
D['TL-R436-03-LABEL-IN-NAME'].setdefault('confirmedBy', []).append('gates/round-436/review.md Low 1 (D-29z1548)')
D['TL-R436-02-INLINE-STATUS'].setdefault('confirmedBy', []).append('gates/round-436/review.md Low 2 + Architecture note (D-29z1548)')
b['architecture_signals'].append({'id': 'SIG-R436-CLIP-ORIGIN-NAMING', 'added': BY, 'decision': 'D-29z1548', 'source': 'a-round-436.md Proposal for B; gates/round-436/review.md Info 3', 'signal': 'AGENT_DISCOVERABLE_CODE rule 2 (one concept, one term): the UI says "clip origin" while code keeps sourceOffset / sourceOffsetLabel / clip-offset-label. A rename round or a glossary line in docs/technical removes the split', 'status': 'signal only; not scheduled'})

dec('D-29z1549', 'COPY-PD-VIS stage 2 rulings (product-designer consult, B browser pre-check on HEAD 69de9bd vs sketch). STUDIO-VIS-7: Export primary button filled brass: bg-brand text-brand-foreground, border-transparent (same height as Done/Cancel), enabled:hover:bg-brand-hover, enabled:active:bg-brand, idle disabled keeps disabled:opacity-40, busy (rendering) gets aria-busy and opacity-70 so the "Rendering..." label stays readable; shared 1.5 px brass ring with 2 px offset unchanged (5.45:1 on the panel; label on fill 8.32:1). cursor-progress dropped: unlayered app.css l.482 button{cursor:pointer} makes cursor utilities on buttons dead (B-R437-BUTTON-CURSOR-UNLAYERED, pre-existing Low). STUDIO-VIS-10: header and narrow-screen exit link get group text-foreground; the arrow keeps text-muted and hovers to foreground (group-hover); no underline. SABA-LANE-RESIZE-HANDLE: the lane height handle keeps its h-1.5 box and draws a 1 px ::after hairline over the lane border-b (after:-bottom-px), foreground/25 on hover and foreground/40 while dragging; the drag swaps the hover class out because pointer capture keeps :hover (B-R437-DRAG-HOVER-WINS, found by B probe, fixed in the sketch). The Clip-details top separator follows for consistency (product-designer) with after:top-0 (panel overflow-hidden clips -1px; TL-R437-01 accepted). Saba request overrides doc 144 3:1 hover rule for these two separators (hover-only paint; keyboard ring unchanged); doc 284 records it (TL-R437-02). Library edge, clip trim edges and loop-brace edges stay foreground/50 (out of scope: vertical / on-object). Reference: Live 12 manual 6.9 ("dragging the split line below the Unfold Track button"; no hover/cursor description). COPY-PD "filled primary" is delivered by STUDIO-VIS-7.')
for i in ('STUDIO-VIS-7', 'STUDIO-VIS-10', 'SABA-LANE-RESIZE-HANDLE'):
    F[i]['status'] = 'in_progress (D-29z1552): dispatched round 437 (COPY-PD-VIS stage 2, sketch b-round-436/sketch-437.patch.txt) | ' + F[i]['status']
for q in b['post_current_stage_queue']:
    for st in q.get('stages', []) if isinstance(q, dict) else []:
        if isinstance(st, dict) and st.get('id') == 'COPY-PD':
            st['note_d29z1549'] = '"filled primary" dispatched in round 437 as STUDIO-VIS-7 (filled brass Export); drop it from COPY-PD when round 437 passes C'

dec('D-29z1550', 'Round-437 sketch review (tech-lead, approve-with-lows, b-round-436/sketch-review.md, sha 88259112...): TL-R437-01 (Detail hairline reads 2 rows under the clipped border-t) and TL-R437-03 (fold mid-drag drops the drag paint; folded handle is pointer-events-none) accepted and parked in deferred_low_polish; TL-R437-02 (override of doc 144 not recorded) fixed by the task: doc 284 must state it; TL-R437-04 (sketch-green covered only covering files) closed: B ran the full suite on the final sketch (272 files, 4019 tests, rc 0). Pre-existing B-R437-BUTTON-CURSOR-UNLAYERED -> deferred_low_polish. B-R437-DRAG-HOVER-WINS: B pre-check finding, fixed in the sketch before dispatch (mutant M10). Architecture note -> SIG-R437-SEPARATOR-HAIRLINE (not scheduled).')
for i, o, title, ev in [
 ('TL-R437-01', 'B spec', 'Clip-details top separator hover hairline sits under the panel border-t (overflow-hidden clips after:-top-px), so it reads as 2 rows (border 36,33,30 + hairline 75,73,68) while the lane hairline replaces the border row; option: recolour border-t via has-[separator:hover] on the panel root', 'b-round-436/sketch-review.md TL-R437-01; b-round-436/probe/rows-decoded.txt'),
 ('TL-R437-03', 'B spec', 'lane height handle: !folded && drops the drag hairline if a lane folds mid-drag; barely reachable (folded handle pointer-events-none); no test', 'b-round-436/sketch-review.md TL-R437-03'),
 ('B-R437-BUTTON-CURSOR-UNLAYERED', 'pre-existing', 'app/styles/app.css l.482 unlayered `button { cursor:pointer }` overrides every Tailwind cursor utility on buttons (disabled:cursor-not-allowed on the Export/Done buttons computes pointer at HEAD); fix in the cursor/polish pass by moving the rule into @layer base or dropping it', 'b-round-436/probe/summary.txt (exportDisabledEmpty cursor pointer, HEAD and sketch)'),
]:
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': o, 'status': 'deferred_low_polish (D-29z1550)', 'title': title, 'evidence': ev, 'added': BY})
b['open_findings'].append({'id': 'TL-R437-02', 'severity': 'low', 'origin': 'B spec', 'status': 'scheduled (D-29z1550): fixed by round 437 doc 284 (override of doc 144 3:1 hover rule recorded); closes with C round 437 PASS', 'title': 'lane/detail hover hairline ~2.1:1 vs the border pixel, below doc 144 3:1 hover rule; the Saba override must be recorded', 'evidence': 'b-round-436/sketch-review.md TL-R437-02', 'added': BY})
b['architecture_signals'].append({'id': 'SIG-R437-SEPARATOR-HAIRLINE', 'added': BY, 'decision': 'D-29z1550', 'source': 'b-round-436/sketch-review.md Architecture note', 'signal': 'two separator hairline recipes (lane after:-bottom-px, Detail after:top-0); when a third separator adopts the style, one shared constant in studio-focus.ts with the edge as parameter', 'status': 'signal only; not scheduled'})

dec('D-29z1551', 'SABA-LANE-RESIZE-HANDLE "Why we missed it": DUX-R-5b-1 (round 175, doc 144) chose hover:bg-foreground/50 over the whole 6 px hit band for 3:1 contrast; every later C row checked tokens or the computed colour at hover, none compared the painted thickness with the reference (Live 12 6.9: a split line), and every RETRO screen review used rest-state screenshots where hover paint is invisible. Phases: B spec (no reference row for the handle), C (hover paint read as a colour, not a thickness), RETRO screen reviews (rest only). Rule: lessons.md L61 gains the clause "Hover and drag paint on a hit area" (computed value per state, 1-px pixel column vs the reference line; pointer capture keeps :hover; unlayered button cursor) - merged into L61, lessons.md stays at 60 lines; C checks the clause exists (K24).')

dec('D-29z1552', 'Round 437 dispatched: COPY-PD-VIS stage 2 (STUDIO-VIS-7 + STUDIO-VIS-10 + SABA-LANE-RESIZE-HANDLE, + TL-R437-02 doc note) on 69de9bd (current-task.md, claims b-round-436/claims-437.sh, sketch b-round-436/sketch-437.patch.txt sha 88259112..., 12 files + doc 284). Order after it: REGRESSION-2026-11-13 at the first planning on or after 2026-11-13 (with REG-PERF-FULL-SUITE); else SYS-R435-SOURCE-SCAN-HELPER, SYS-1, SYS-3, STORE-REDESIGN 2b..5, ARCH-SPLIT (first stage needs the frontend-architect checkpoint through root), REVIEW-RECOMMENDATIONS (SABA-B-12 stage 4 / VIS-3, VIS-5/8/9, COPY-PD), T12-ADVANCED, phase 2 (skip rule); STEM-LANES jumps ahead on Saba answer; next RETRO round 450.')
b['rounds'][-1]['status'] = 'C PASS (browserVerified), published 69de9bd (D-29z1548)'
b['rounds'].append({'round': 437, 'task': 'current-task.md', 'decision': 'D-29z1552', 'type': 'COPY-PD-VIS stage 2 (STUDIO-VIS-7 + STUDIO-VIS-10 + SABA-LANE-RESIZE-HANDLE)', 'status': 'dispatched', 'note': 'baseline 69de9bd clean; sketch b-round-436/sketch-437.patch.txt; claims b-round-436/claims-437.sh'})
b['current_task'] = 'Round 437: COPY-PD-VIS stage 2 (STUDIO-VIS-7 filled brass Export, STUDIO-VIS-10 exit link, SABA-LANE-RESIZE-HANDLE 1 px hairline + Detail separator) on 69de9bd (current-task.md)'
b['version'] = 421
b['updated'] = '2026-11-10'
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n'); print('ok v421')
