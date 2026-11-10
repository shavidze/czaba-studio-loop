# B round 429 -> 430 backlog update (v409 -> v410). Idempotent guard: refuses to run twice.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-429/update-backlog.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 409 and b['decisions_log_b'][-1]['id'] == 'D-29z1509', (b['version'], b['decisions_log_b'][-1]['id'])
SHA = open(L + '/b-round-429/sketch-430.sha256').read().strip()
BY = '2026-11-10 B round 429 -> 430 planning'
def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-10', 'by': BY, 'decision': text})
dec('D-29z1510', 'Round 429 accepted from C evidence: c-round-429.json PASS, 0 bugs, browserVerified/realVerified true. B re-runs: tools/l57-check.py L57 OK (b-round-429/l57-check-c429.txt); b-round-428/probe/compare.py on C probe JSONs ALL OK (8 cells) (b-round-429/recompare/compare.txt); C mutant lines identical to b-round-428/mutants/summary.txt; c-round-429/auth/g428-auth.json pass true. Gate 429 published 76f4147 on both remotes = baseline for round 430 (HEAD 7b66064 root docs commit was accepted by A and C: git diff b604cfb 7b66064 -- app empty).')
dec('D-29z1511', 'SYS-2 done (stages 1-5, rounds 422 and 426-429, all C PASS + published). A-R107-SWEEP-HELD-ENTER-TOOLBAR closed (doc 277 closure table). A round-429 reviewer Lows -> deferred_low_polish: A-R429-REVIEW-SCAN-NEGATED-REPEAT (= gate 429 review Low 1, confirmedBy), A-R429-REVIEW-EDITOR-REPEAT-ESCAPE (= gate 429 review Low 2, confirmedBy), A-R429-REVIEW-ROW-ID-COLLISIONS; all three fixed with ARCH-CHECKPOINT-SYS-2 follow-up or the polish pass. INFO-B-R429-K9-OVERSTATED (origin B spec: task 429 K9 called the 11 if(!event.repeat) sites menu containers; only GridMenu/MarkerMenu are) closed: doc 277 corrected by A. Gate 429 architecture note (lint rule vs scan, sibling helper for the delegated form, test helper) attached to ARCH-CHECKPOINT-SYS-2; request filed with root now (b-round-429-checkpoint-request.md), non-blocking.')
dec('D-29z1512', 'SABA-B-12 planned as stages (L42, L7; the product-designer audit docs/technical/studio-real-workspace/studio-visual-audit-2026-11-10.md is data; root policy 2026-11-10 table and Saba answers 1-4 are the authority). Stage 1 = STUDIO-VIS-1 (3 Detail panel number fields, round 430). Stage 2 = STUDIO-VIS-2 (6 Export dialog radios) + the Export dialog <progress> the audit missed; option (a) sr-only vs (b) styled dot is ruled at its planning against L1 and hidden_focusables_rulings_d29z169. Stage 3 = ShortcutSheet type=search native cancel (Library already hides it and has its own clear button; the sheet needs the same pattern = a new control, not a class tweak). STUDIO-VIS-3 (<select> grid division + waveform zoom) deferred by Saba answer 2 -> REVIEW-RECOMMENDATIONS, kept as SABA-B-12 stage 4. Legacy app/components/studio/ExportDialog.tsx checkbox: imported only by the protected studio.$productId.tsx (legacy purchased Studio, SRW-21 deferred_user) -> recorded under SRW-21, not scheduled. STUDIO-VIS-4/6/7/10 (copy + Export button fill + brand link) -> one COPY-PD-VIS round after SABA-B-12 stage 3; STUDIO-VIS-5/8/9 -> REVIEW-RECOMMENDATIONS (Saba: defer). Order after round 430: REGRESSION-2026-11-13 when due, else SABA-B-12 stage 2, stage 3, COPY-PD-VIS, then SYS-1, SYS-3; STEM-LANES jumps ahead when Saba answers.')
dec('D-29z1513', 'Round 430 = SABA-B-12 stage 1 (STUDIO-VIS-1) on 76f4147. Sketch b-round-429/sketch-430.patch.txt sha256 ' + SHA + ': new studio-number-field.ts STUDIO_NUMBER_FIELD_CLASS ([appearance:textfield] + webkit inner/outer spin-button appearance-none) appended to the Detail panel inputClass (Clip Gain, From, To); rows NF1, NF2 (studio-number-field.test.ts) and F10 (detail-panel-fit.test.tsx); doc 278. Real Chromium HEAD vs sketch (second vite on :5174, own cacheDir): hover gutter diff 182 px at HEAD, 0 px on the sketch in 6/6 cells x 2 replicates; appearance auto -> textfield; box 80x24 equal; ArrowUp steps equal. Mutants 4/4 red. Covering 32 files 660/660; typecheck/lint rc 0. Firefox/Safari half = TLM-SABA-B-12-FIREFOX-SAFARI (Tech Lead, deadline RETRO 435). Reference: Live 12 manual 42.6 Adjusting Values (arrows, type-in, Enter/Esc; no stepper documented - absence of arrows in Live is an inference, not a confirmed fact).')
dec('D-29z1514', 'Why we missed SABA-B-12: VISUAL-A and every RETRO whole-screen review used rest-state screenshots, and Chromium paints number spin buttons only on hover/focus; no task listed native control parts as rows. New lesson L61 (native control chrome is a row). lessons.md stays at 60 lines: old L9 (engine rounding, 1x) merged into L15 as a clause. Copy of the previous file: b-round-429/lessons-before-430.md.')
for s in b['systemic_tasks']:
    if s.get('id') == 'SYS-2':
        s['status'] = 'done (D-29z1511): stages 1-5 C PASS + published (rounds 422, 426, 427, 428, 429; gate 429 76f4147)'
for f in b['open_findings'] + b['deferred_low_polish']:
    if f.get('id') == 'A-R107-SWEEP-HELD-ENTER-TOOLBAR':
        f['status'] = 'closed (D-29z1511): SYS-2 stage 5 C round 429 PASS, gate 429 76f4147; closure table doc 277'
    if f.get('id') == 'SABA-B-12':
        f['status'] = 'in_progress (D-29z1512, D-29z1513): stage 1 STUDIO-VIS-1 dispatched as round 430'
        f['stages'] = [
            {'stage': 1, 'id': 'STUDIO-VIS-1', 'severity_audit': 'high', 'what': 'hide spin buttons on Detail panel Clip Gain/From/To number fields', 'status': 'dispatched round 430'},
            {'stage': 2, 'id': 'STUDIO-VIS-2', 'severity_audit': 'high', 'what': '6 native radios in ArrangementExportDialog + its <progress> bar (audit missed progress)', 'status': 'planned next UI round (rule sr-only vs styled dot vs L1/hidden_focusables_rulings_d29z169)'},
            {'stage': 3, 'id': 'SABA-B-12-SEARCH-CANCEL', 'severity_audit': 'n/a (audit missed it)', 'what': 'ArrangementShortcutSheet type=search shows the native cancel; Library hides it and draws its own clear button; give the sheet the same pattern', 'status': 'planned after stage 2'},
            {'stage': 4, 'id': 'STUDIO-VIS-3', 'severity_audit': 'medium', 'what': 'native <select> grid division + waveform zoom (zoom select has appearance-none and no chevron)', 'status': 'deferred by Saba answer 2 (2026-11-10) -> REVIEW-RECOMMENDATIONS'},
            {'stage': None, 'id': 'SABA-B-12-RECORDINGS-NUMBER', 'what': '7 number inputs (+ search, select, radio, checkbox, progress) in app/components/recordings/*; reached only from routes recordings.$productId and scenes.$productId, not from /studio-lab (import closure 0)', 'status': 'Store pages -> STORE-REDESIGN acceptance (TL-R430-10)'},
            {'stage': None, 'id': 'SABA-B-12-LEGACY-CHECKBOX', 'what': 'app/components/studio/ExportDialog.tsx checkbox; only importer is protected studio.$productId.tsx', 'status': 'recorded under SRW-21 (deferred_user); not scheduled'},
        ]
        f['why_we_missed_it'] = 'D-29z1514 / L61'
for c in b['architecture_checkpoint_requests']:
    if c.get('id') == 'ARCH-CHECKPOINT-SYS-2':
        c['status'] = 'filed with root (D-29z1511): b-round-429-checkpoint-request.md; non-blocking; result awaited'
        prev = c.get('confirmedBy')
        add = 'gates/round-429/review.md Architecture note (lint rule vs scan; sibling helper for if(!event.repeat); SIG-R427 test helper)'
        c['confirmedBy'] = (prev + ' | ' + add) if prev else add
for r in b['rounds']:
    if r.get('round') == 429:
        r['status'] = 'c_pass_published (D-29z1510): gate 429 76f4147'
b['rounds'].append({'round': 430, 'task': 'current-task.md', 'decision': 'D-29z1513', 'type': 'SABA-B-12 stage 1 (STUDIO-VIS-1 number spin buttons)', 'status': 'dispatched', 'note': 'baseline 76f4147 clean; sketch b-round-429/sketch-430.patch.txt; claims b-round-429/claims-430.sh'})
b['current_task'] = 'Round 430: SABA-B-12 stage 1 (STUDIO-VIS-1) - the Detail panel Clip Gain/From/To number fields lose the browser spin buttons via a shared STUDIO_NUMBER_FIELD_CLASS; rows NF1, NF2, F10; doc 278 (current-task.md; sketch b-round-429/sketch-430.patch.txt)'
lows = [
 ('A-R429-REVIEW-SCAN-NEGATED-REPEAT', "held-enter-source-scan HS1 second regex branch matches '!event.repeat && event.key === \\'Enter\\'' (a fresh-Enter-only guard) -> false red; none in source today", 'gates/round-429/review.md Low 1'),
 ('A-R429-REVIEW-EDITOR-REPEAT-ESCAPE', 'no row pins that a repeated Escape still settles the marker name editor; a repeat-only mutant in the editor branch passes HK3', 'gates/round-429/review.md Low 2'),
 ('A-R429-REVIEW-ROW-ID-COLLISIONS', 'row ids HE/HK/HS/HP/HM reused across test files with different meanings (doc 277 table now names the file)', None),
]
for i, t, conf in lows:
    e = {'id': i, 'severity': 'low', 'origin': 'A', 'status': 'deferred_low_polish (D-29z1511); fix with ARCH-CHECKPOINT-SYS-2 follow-up', 'title': t, 'evidence': 'a-round-429.md For B; doc 277 TODO', 'added': BY}
    if conf: e['confirmedBy'] = conf
    b['deferred_low_polish'].append(e)
b['open_findings'].append({'id': 'INFO-B-R429-K9-OVERSTATED', 'severity': 'info', 'origin': 'B spec', 'status': 'closed (D-29z1511): doc 277 corrected by A', 'title': 'task 429 K9 listed DetailPanel/Library/GroupHeader if(!event.repeat) sites as delegated menu containers', 'evidence': 'a-round-429.md For B', 'added': BY})
b['open_findings'].append({'id': 'TLM-SABA-B-12-FIREFOX-SAFARI', 'severity': 'info', 'origin': 'B spec', 'status': 'open_tech_lead_manual (D-29z1513): deadline RETRO 435 (L46)', 'title': 'SABA-B-12 stage 1 on Firefox and Safari: Detail panel number fields show no spin buttons at rest, hover and focus; ArrowUp/Down still step', 'evidence': 'cloud runner has Chromium only', 'added': BY})
vis = [
 ('STUDIO-VIS-4', 'medium', 'Rename "Source offset" -> "Clip origin" (strings.ts sourceOffsetLabel + selectedClipDetail)', 'COPY-PD-VIS (after SABA-B-12 stage 3)'),
 ('STUDIO-VIS-5', 'medium', 'Detail panel spacing (gap-0.5 -> gap-1, px-3 -> px-4)', 'REVIEW-RECOMMENDATIONS (Saba: defer)'),
 ('STUDIO-VIS-6', 'medium', '"From, s" / "To, s" -> "From" / "To"', 'COPY-PD-VIS (after SABA-B-12 stage 3)'),
 ('STUDIO-VIS-7', 'low', 'Export dialog primary button outline -> filled brass (Saba answer 3)', 'COPY-PD-VIS (after SABA-B-12 stage 3)'),
 ('STUDIO-VIS-8', 'low', 'Insert marker blink timing', 'REVIEW-RECOMMENDATIONS (Saba: defer)'),
 ('STUDIO-VIS-9', 'low', 'Purchased collection badge styling', 'REVIEW-RECOMMENDATIONS (Saba: defer)'),
 ('STUDIO-VIS-10', 'low', '"CZABA" brand link text-muted -> text-foreground, arrow stays muted (Saba answer 4)', 'COPY-PD-VIS (after SABA-B-12 stage 3)'),
]
for i, sev, t, where in vis:
    b['open_findings'].append({'id': i, 'severity': sev, 'origin': 'product-designer audit 2026-11-10, approved by Saba (policy 2026-11-10)', 'kind': 'saba_approved_task', 'status': 'scheduled (D-29z1512): ' + where, 'title': t, 'evidence': 'docs/technical/studio-real-workspace/studio-visual-audit-2026-11-10.md', 'added': BY})
b['version'] = 410
b['updated'] = '2026-11-10'
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n')
print('backlog v410')
