"""B round 444 -> 445 planning backlog update. Idempotent: refuses to run twice (update-backlog.done)."""
import json, os, sys
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
B = f'{LOOP}/b-round-444'
DONE = f'{B}/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied')
SHA = open(f'{B}/sketch-445.sha256').read().split()[0][:8]
p = f'{LOOP}/backlog.json'
b = json.load(open(p, encoding='utf-8'))
by = '2026-11-11 B round 444 -> 445 planning'
b['version'] += 1
b['updated'] = '2026-11-11'
of = {e.get('id'): e for e in b['open_findings']}
dl = b['deferred_low_polish']
di = {e.get('id'): e for e in dl}

# D-29z1579: round 444 accepted from C evidence
m1 = of['A-R203-REVIEW-M1']
m1['status'] = 'closed (D-29z1579): SYS-3 stage 2a, C round 444 PASS (c-round-444.json browserVerified/realVerified true; C5 ALL OK 18 cells, HEAD control 14 of 18 failing), gate 444 published 616729c; real Android device half stays on TLM-SYS3-IME-PLATFORMS | ' + m1['status']
m1['closed_round'] = 444
i1 = of['A-R203-REVIEW-I1']
i1['status'] = ('closed_altgr_half (D-29z1579): Windows/Linux AltGr (getModifierState AltGraph) closed at contract level by C round 444 PASS (jsdom FT9 + mutant M3; Playwright cannot set AltGraph, b-round-443/probe/altgraph-check-sketch.json), gate 444 published 616729c. '
                'The macOS Option half is NOT fixed (gates/round-444/review.md finding 1: Chrome/Safari do not report AltGraph for Option+char, so it still flips to keyboard, same as before) -> split to GATE444-L1-MACOS-OPTION (Low, deferred_low_polish + TLM step) | ' + i1['status'])
i1['closed_round'] = 444
dl.append({'id': 'GATE444-L1-MACOS-OPTION', 'severity': 'low', 'origin': 'gate reviewer (B spec claim)',
           'status': 'deferred_low_polish (D-29z1579): owned by the next focus-source stage; no macOS heuristic chosen without a real Mac (cannot be run in the cloud); TLM-SYS3-IME-PLATFORMS step added',
           'title': 'macOS Option+character in a Studio text field still switches focus-source to keyboard in Chrome/Safari (altKey true, AltGraph false); FT9 title and doc 289 claimed "AltGr or Option"',
           'evidence': 'gates/round-444/review.md finding 1; app/lib/focus-source.ts at 616729c',
           'repro': 'macOS Chrome: focus the Library search by mouse, type Option+e / Option+2; data-focus-source becomes keyboard',
           'fix': 'reword FT9 title to AltGr only (doc 289 prose is corrected in round 445); optionally treat key.length===1 && altKey && !ctrlKey && !metaKey as a character on macOS after a real-Mac check',
           'added': by, 'confirmedBy': ['A-R203-REVIEW-I1 (Option half)'], 'systemic_task': 'SYS-3'})
dl.append({'id': 'A-R444-REVIEW-L1-ALTGRAPH-META', 'severity': 'low', 'origin': 'B spec (sketch-444; found by A code-reviewer)',
           'status': 'deferred_low_polish (D-29z1579): focus-source.ts and its test are not owned by stage 2b (tech-lead R3); same future focus-source stage as GATE444-L1-MACOS-OPTION',
           'title': 'isFocusSourceAltGraphCharacter runs before the modifier return and ignores metaKey: Cmd+Option+char (Firefox-mac reports Option as AltGraph) stays pointer',
           'evidence': 'a-round-444.md code-reviewer L1', 'repro': 'focus-source.ts:53-54,70 at 616729c',
           'fix': 'require !event.metaKey in isFocusSourceAltGraphCharacter + one FT9 row', 'added': by, 'systemic_task': 'SYS-3'})
dl.append({'id': 'TL-R445-R4-LEADMAGNET-INLINE-COMPOSING', 'severity': 'low', 'origin': 'B pre-check (tech-lead sketch review R4)',
           'status': 'deferred_low_polish (D-29z1580): store-side; out of the Studio scan scope',
           'title': 'LeadMagnetPopup.tsx reads e.nativeEvent.isComposing inline (and no keyCode 229) instead of the shared composition helper',
           'evidence': 'b-round-444/sketch-review.md R4', 'repro': 'grep -n isComposing app/components/marketing/LeadMagnetPopup.tsx at 616729c',
           'fix': 'move to isNativeImeCompositionKeyDown (or a lib helper, SIG-R444-COMPOSING-LIB-HELPER) when the store polish pass touches the popup', 'added': by})
ai1 = {'id': 'A-R444-REVIEW-I1-HELD-ESC-VIDEO', 'severity': 'low', 'origin': 'pre-existing (found by A code-reviewer round 444; reproduced by B)',
       'status': 'in_progress (D-29z1580): SYS-3 stage 2b, round 445; closes on C PASS',
       'title': 'a held Escape that closes the shortcut sheet, the Export dialog, the BPM edit or the marker editor also collapses the expanded floating video through its auto-repeat keydowns (Workspace window Escape branch has no event.repeat check)',
       'evidence': 'a-round-444.md code-reviewer I1 (rated Info); B real-Chromium probe b-round-444/probe/compare-head.txt NOT ALL OK (8 of 14 failing) at 616729c; severity raised to Low with this evidence (user-visible, no data loss)',
       'repro': 'BASE=http://127.0.0.1:5173 node b-round-444/probe/held-escape-video.mjs ALL 1440x900,1280x720', 'added': by, 'systemic_task': 'SYS-3'}
b['open_findings'].append(ai1)
for fid in ['TL-R444-L2-MODAL-COMPOSING-ESCAPE']:
    e = di[fid]
    e.setdefault('confirmedBy', []).append('a-round-444.md Architecture note: a Modal shouldCloseOnEscape predicate is the alternative for this deferred Modal round once the protected ExportDialog question allows it')
b['architecture_signals'].append({'id': 'SIG-R444-COMPOSING-LIB-HELPER', 'added': by, 'decision': 'D-29z1579',
    'source': 'gates/round-444/review.md Architecture note',
    'signal': 'focus-source.ts and studio-ime-composition.ts both decide "is this an IME/composing key" (isComposing || keyCode 229; focus-source adds Unidentified). Proposal: one lib/ helper for isComposing || 229 after SYS-3, Unidentified stays in focus-source; done when IME8, FT7, FT8 pass. Cost low, risk low',
    'status': 'signal only; candidate for the next focus-source stage with GATE444-L1-MACOS-OPTION and A-R444-REVIEW-L1; not scheduled'})
b['architecture_signals'].append({'id': 'TL-R445-I1-SCAN-NESTED-DESTRUCTURING', 'added': by, 'decision': 'D-29z1580',
    'source': 'b-round-444/sketch-review.md pass 2 Info',
    'signal': 'IME14 scan misses nested destructuring ({ nativeEvent: { isComposing } } = event) and bracket access (e["isComposing"]); neither exists today; the scan is a guardrail',
    'status': 'signal only; not scheduled'})

# D-29z1580: round 445 = SYS-3 stage 2b
for fid in ['A-R443-REVIEW-L1-IME6-WEAK-GAIN', 'A-R443-REVIEW-L2-IME6-ONE-IT']:
    e = of[fid]; e['status'] = 'in_progress (D-29z1580): SYS-3 stage 2b, round 445; closes on C PASS | ' + e['status']
g = of['GATE443-L1-REPEAT-ESCAPE-BUBBLES']
g['status'] = ('ruled_no_user_effect (D-29z1580; tech-lead R1 confirmed): the only window Escape listener returns for typing targets (StudioWorkspace isTypingTarget), Tempo blurs on the fresh press so its repeats target body (now handled by A-R444-REVIEW-I1); '
               'B probe: Clip Gain and Library search held Escape leave the video expanded at HEAD (b-round-444/probe/head.json GAIN/LIBSEARCH cells). HEAD propagation kept cell for cell (IME12). Closes when C round 445 re-runs those probe cells | ' + g['status'])
t3 = di['TL-R443-G3-PLAIN-HELD-ROWS']
t3['status'] = 'in_progress (D-29z1580): SYS-3 stage 2b, round 445 (IME13 rows for all five editors); closes on C PASS | ' + t3['status']
for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R442-INLINE-EDITOR-KEYS':
        s['status'] = 'in_progress (D-29z1580): implemented as inlineEditorKeyIntent + IME14/IME15 scan in round 445 (tech-lead: keep the helper in studio-ime-composition.ts; do not extract a flag-driven handleInlineEditorKey) | ' + s['status']
s3 = [x for x in b['systemic_tasks'] if x['id'] == 'SYS-3'][0]
s3['status'] = ('in_progress (D-29z1580): stage 2a done (C round 444 PASS, published 616729c); stage 2b dispatched round 445 (sketch b-round-444/sketch-445.patch.txt sha ' + SHA + '); SYS-3 complete on its C PASS | ' + s3['status'])
for st in s3['stages_d29z1571']:
    if st['id'] == 'SYS-3-stage-2a':
        st['status'] = 'done (D-29z1579): C round 444 PASS browserVerified true; gate 444 published 616729c'
    if st['id'] == 'SYS-3-stage-2b':
        st['round'] = 445
        st['scope'] = ('inlineEditorKeyIntent (other|composing|held|settle) in studio-ime-composition.ts used by the five inline-editor handlers (HEAD truth table kept cell for cell, IME12); IME14/IME15 source scan; '
                       'IME6 split per editor + Clip Gain toBe(shown); IME13 plain held-key rows; Workspace floating-video Escape ignores repeats (A-R444-REVIEW-I1, FV-HELD); docs 288/289 l.4 -> Completed, doc 289 FT9 prose AltGr only, new doc 290')
        st['closes'] = ['TL-R443-G3-PLAIN-HELD-ROWS', 'A-R443-REVIEW-L1-IME6-WEAK-GAIN', 'A-R443-REVIEW-L2-IME6-ONE-IT', 'GATE443-L1-REPEAT-ESCAPE-BUBBLES', 'A-R444-REVIEW-I1-HELD-ESC-VIDEO', 'SIG-R442-INLINE-EDITOR-KEYS']
        st['browser_evidence_head'] = 'b-round-444/probe/compare-head.txt NOT ALL OK (8 of 14 failing); sketch b-round-444/probe/compare-sketch.txt ALL OK (14 cells), FRESH ALL SAME (14 cells)'
        st['status'] = 'dispatched (D-29z1580): round 445'
tlm = [x for x in b['tech_lead_manual_checks'] if x.get('id') == 'TLM-SYS3-IME-PLATFORMS'][0]
tlm['what'] += (' | D-29z1579 added step (round 445 planning): macOS Chrome and Safari: focus the Library search by mouse and type Option+e / Option+2; record whether the focus ring appears (expected today: it does, GATE444-L1-MACOS-OPTION, deferred).')

b['decisions_log_b'] += [
    {'id': 'D-29z1579', 'date': '2026-11-11', 'by': by,
     'decision': 'Round 444 accepted from C evidence: c-round-444.json PASS, browserVerified/realVerified true, 0 bugs (C5 ALL OK 18 cells, HEAD control 14 of 18 failing; C6 ALL OK; C7 ALL SAME); gate 444 published 616729c on both remotes. A-R203-REVIEW-M1 closed. A-R203-REVIEW-I1 closed for the AltGr half only; the macOS Option half -> GATE444-L1-MACOS-OPTION (Low, deferred, TLM step). A-R444-REVIEW-L1 -> deferred (focus-source not owned by stage 2b). A-R444-REVIEW-I1 reproduced in real Chromium (8 of 14 cells) -> Low, in stage 2b. Gate-444 finding 2 needs no fix, findings 3/4 info (finding 3 noted in doc 290). Gate Architecture note -> SIG-R444-COMPOSING-LIB-HELPER (signal). A Architecture note -> confirmedBy on TL-R444-L2.'},
    {'id': 'D-29z1580', 'date': '2026-11-11', 'by': by,
     'decision': 'Dispatch round 445 = SYS-3 stage 2b (final SYS-3 stage) on 616729c: sketch b-round-444/sketch-445.patch.txt sha ' + SHA + ' (tech-lead v1 approve-with-changes, L1-L3 applied; v2 delta approve). HEAD truth table pinned (IME12, run on HEAD 10/10). GATE443-L1 ruled no user-visible effect (probe). B pre-check: typecheck 0, lint 205 = HEAD, covering 60/1082, full 277/4071 rc 0, 12/12 mutants red, real Chromium video probe sketch ALL OK 14 / HEAD 8 of 14 failing, stage-1/2a probes ALL OK, plain held ALL SAME.'},
    {'id': 'D-29z1581', 'date': '2026-11-11', 'by': by,
     'decision': 'Order after round 445: REGRESSION-2026-11-13 at the first planning on or after 2026-11-13 (first if due); STORE-REDESIGN 2b..5 (direction decision exists); ARCH-SPLIT (root frontend-architect checkpoint first); REVIEW-RECOMMENDATIONS; T12-ADVANCED; phase 2 under the skip rule. Next RETRO round 450. SYS-3 completes on round 445 C PASS: its open signals (SIG-R444-COMPOSING-LIB-HELPER, TL-R445-I1) stay signals; focus-source Lows (GATE444-L1-MACOS-OPTION, A-R444-REVIEW-L1-ALTGRAPH-META) go to the deferred polish pass. No new architecture checkpoint request: SYS-3 adds one small pure helper (tech-lead keep), and ARCH-SPLIT already has its root checkpoint step.'},
]
for r in b['rounds']:
    if r.get('round') == 444:
        r['status'] = 'done (D-29z1579): C PASS browserVerified true, gate 444 published 616729c'
b['rounds'].append({'round': 445, 'task': 'current-task.md', 'decision': 'D-29z1580', 'type': 'SYS-3 stage 2b (shared inline-editor key intent; held Escape keeps the floating video)', 'status': 'dispatched',
                    'note': 'baseline 616729c (gate 444 published); sketch b-round-444/sketch-445.patch.txt sha ' + SHA + '; claims b-round-444/claims-445.sh'})
b['current_task'] = 'Round 445: SYS-3 stage 2b (inlineEditorKeyIntent for the five inline editors, IME11-IME15, FV-HELD; closes TL-R443-G3, A-R443-REVIEW-L1/L2, GATE443-L1, A-R444-REVIEW-I1, SIG-R442 on C PASS; sketch b-round-444/sketch-445.patch.txt sha ' + SHA + ') on 616729c (current-task.md)'
b['advisor_used_by_B'] = 'round 444 -> 445 planning: advisor available and consulted after orientation and before hand-off'
json.dump(b, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(DONE, 'w').write('applied\n')
print('ok v', b['version'])
