# B round 427 -> 428 backlog update (v405 -> v406). Run once from the loop root: python3 -I b-round-427/update-backlog.py
import json, os, sys
DONE = 'b-round-427/update-backlog.done'
if os.path.exists(DONE):
    sys.exit('already applied (' + DONE + ')')
p = 'backlog.json'
b = json.load(open(p, encoding='utf-8'))
if b.get('version') != 405:
    sys.exit(f"expected version 405, found {b.get('version')}")
BY = '2026-11-10 B round 427 -> 428 planning'
b['version'] = 406
b['updated'] = '2026-11-10 (B round 427 -> 428 planning: round 427 C PASS + gate 427 published ffae71c; SYS-2 stage 3 (2b-i) done; round 428 = SYS-2 stage 4 (2b-ii-a) on ffae71c)'
b['current_task'] = 'Round 428: SYS-2 stage 4 (2b-ii-a) - a held Enter acts once on the footer Shortcuts button, the shortcut sheet Close, the narrow-screen Send link and the export dialog Export/Cancel/Done buttons (current-task.md; sketch b-round-427/sketch-428.patch.txt)'
b['advisor_used_by_B'] = 'round 427 -> 428 planning: advisor available and consulted after orientation and before close'
b['decisions_log_b'].extend([
    {'id': 'D-29z1498', 'date': '2026-11-10', 'by': BY,
     'decision': 'Round 427 accepted from C evidence only: c-round-427.json PASS, 0 bugs, browserVerified/realVerified true; B ran tools/l57-check.py (L57 OK, b-round-427/l57-check-c427.txt), re-ran C\'s compare (python3 -I c-round-427/probe/compare.py c-round-427/probe -> ALL OK (18 cells)) and diffed c-round-427/b426copy/mutants/summary.txt against b-round-426/mutants/summary.txt (identical). Gate 427 verify 266 files / 3984 tests, published ffae71c on both remotes = baseline for round 428. The fake-bearer row with a real backend stays BLOCKED (backend unavailable in cloud), open backend evidence. SYS-2 stage 3 (2b-i) done. TL-R425-09-HM5-GESTURE-ROW closed by HM5b (characterization, C round 427 PASS). A-R107-SWEEP-HELD-ENTER-TOOLBAR advanced (HP1-HP9), stays open for stages 4-5.'},
    {'id': 'D-29z1499', 'date': '2026-11-10', 'by': BY,
     'decision': 'A round 427 reviewer items ruled. A-R427-REVIEW-L3 (HM5b toBeGreaterThan(before.statusSequence) loose; toBe(+1) would pin a single refusal write) = Low, origin B spec (HM5b was in B\'s sketch), deferred_low_polish as A-R427-REVIEW-L3-HM5B-LOOSE; I1 (HM5b leaves the pointer gesture open, relies on unmount) and I3 (unused trackHeader/EnterModifiers/ctrlKey, copied MIXER_CLIPS name in panel-held-enter-ui) attached to it as notes: all three are fixed together when the held-Enter test helpers are extracted (SIG-R427-HELD-ENTER-TEST-HELPER). A-R427-REVIEW-L2/L2b (task 427 section 7 named detail-panel* and self-disabling-focus as covering the folds; the real rows are HE4, LF8, HT1, HA5) = origin B spec, already fixed in doc 275 by A; recorded as INFO-B427-COVERING-WORDING (closed). I2 is confirmedBy on TL-R426-08 and I4 is documented in doc 275 l.22; no new ids. C\'s carried note on the Ableton row: does not apply.'},
    {'id': 'D-29z1500', 'date': '2026-11-10', 'by': BY,
     'decision': 'SYS-2 2b-ii split again by surface after a real-Chromium HEAD probe at ffae71c (b-round-427/probe/head, 1440x900 + 1280x720, Send link at 800x700): real defects only on the shortcut sheet Close (Close docks focus on the footer Shortcuts button and the repeats reopen the sheet, sheetOpens 1 -> 2) and the narrow-screen Send link (clipboard writes 1 -> 4). No defect on the footer button alone (focus goes to the search field), export Done (already guarded inline), the Modal close X and Export (focus to the guarded opener / Done), the grid menu (container keydown ignores repeats). Stages now 5: stage 4 = 2b-ii-a (round 428): footer Shortcuts, sheet Close, Send link (the two defect fixes) + preventive guards on export Export/Cancel + the export Done inline copy folded; stage 5 = 2b-ii-b: the 5 MarkerRow inline copies (add/prev/next/flag handler/name editor) and the LibraryMenu container copy folded, the grid/marker menu `if (!event.repeat)` delegated form ruled, a closing grep over app/** and perf/** with every copy form named (literal, reversed operands, `.repeat` checks) and one mutant per form, optionally the shared held-Enter test helper, and l.4 of docs 274, 275, 276 and the stage-5 doc granted to Completed (L28). Scope set from the /studio-lab import closure (b-round-427/tools/import-closure.py), not the arrangement glob: ui/Modal.tsx close X excluded with evidence (shared Store UI; XMODALX no defect; focus returns to the guarded Export opener); root.tsx CookieConsent excluded (renders only with GA4_MEASUREMENT_ID, absent in the cloud; Accept/Decline unmount it), AuthModal and ToastContainer excluded (not opened by /studio-lab demo flows); Transport Fit (TH5), the video drag handle and the library option stay as ruled in round 427. The grid menu chosen from a pointer-opened menu with no prior focus returns focus to BODY: pre-existing, the known GATE243/244 grid-menu focus family, no new id.'},
    {'id': 'D-29z1501', 'date': '2026-11-10', 'by': BY,
     'decision': 'Signals. Gate 427 review Architecture note (per-button guard across about a dozen files; proposal: after stage 5 a lint/test scan that fails for a <button onClick> in /studio-lab folders without a repeat-safe onKeyDown; no wrapper component) recorded as confirmedBy on SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT (no new id). A round 427 For-B note (panel-held-enter-ui copies the mixer test setup; move pressEnter/holdEnter and a snapshot builder into __tests__/helpers/held-enter.ts) plus tech-lead TL-R427-05 (pressHeldEnter now copied in three more files) = new signal SIG-R427-HELD-ENTER-TEST-HELPER, attached to ARCH-CHECKPOINT-SYS-2 and offered to stage 5; not scheduled as its own task.'},
    {'id': 'D-29z1502', 'date': '2026-11-10', 'by': BY,
     'decision': 'C round 427 auth note: one g390-auth run read legacy signIn:false at 1440 on a first read while workspace was false and audio[src] was 0 in the same read; C\'s independent polling (legacy-1440.png at 0.5/3/10 s) and the final auth.log (pass true) show the Sign in gate. Recorded as INFO-C427-AUTH-TRANSIENT-FIRST-READ, origin environment (probe reads before the route settles); purchase protection not bypassed. Round 428 auth row: the legacy route is read only after a settled state (Sign in required visible, or 10 s) and every read records workspace and audio[src]; any read with a workspace or audio[src] > 0 is a Critical finding.'},
    {'id': 'D-29z1503', 'date': '2026-11-10', 'by': BY,
     'decision': 'Round 428 = SYS-2 stage 4 (2b-ii-a) on ffae71c with sketch b-round-427/sketch-428.patch.txt (sha256 fa75fa82...; v1 fc3d0b63 reviewed approve-with-lows by tech-lead, test-only delta re-reviewed approve). Guards: onKeyDown={preventRepeatedEnterKeyDown} on the footer Shortcuts button (StudioWorkspace), the sheet Close (ArrangementShortcutSheet), Send link (StudioNarrowScreen), export Cancel and Export (ArrangementExportDialog, preventive: no Chromium defect at HEAD); export Done inline copy folded onto the helper. Rows HQ1, HQ2 (shortcut-sheet-ui), HN1 (studio-narrow-gate-ui), HX1-HX3 (export-cancel-ui); 7 mutant lines (HEAD-SRC red HN1,HQ1,HQ2,HX1,HX2; HX3 green at HEAD by design: Done was guarded inline). Focus targets: sheet Close -> footer Shortcuts button; footer -> sheet search field (repeats there not prevented, nothing happens); Send link keeps focus; Cancel -> Done; Done/X -> Export opener. Covering 59 files 996/996, full 266 files / 3990 tests, browser HEAD vs sketch ALL OK (13 cells). Doc 276 l.4 In Progress (stage 4 of 5; C round 428 PASS). Ableton conformance: does not apply (no per-press change).'},
])
ok = 0
for r in b['rounds']:
    if r.get('round') == 427 and r.get('status') == 'dispatched':
        r['status'] = 'c_pass_published (D-29z1498): C PASS c-round-427.json, browserVerified true, 0 bugs; gate 427 published ffae71c'; ok += 1
if ok != 1:
    sys.exit('round 427 entry not found')
b['rounds'].append({'round': 428, 'task': 'current-task.md', 'decision': 'D-29z1503', 'type': 'SYS-2 stage 4 (2b-ii-a: shortcut sheet, export dialog, narrow screen held Enter)', 'status': 'dispatched',
                    'note': 'baseline ffae71c clean; sketch b-round-427/sketch-428.patch.txt; claims b-round-427/claims-428.sh'})
seen = set()
for s in b['systemic_tasks']:
    if s.get('id') == 'SYS-2':
        s['status'] = 'in_progress (D-29z1498, D-29z1500, D-29z1503): stage 3 (2b-i) done (C round 427 PASS, gate 427 published ffae71c); 5 stages now; stage 4 (2b-ii-a) dispatched as round 428 (footer Shortcuts, sheet Close, Send link, export Export/Cancel + Done fold); stage 5 (2b-ii-b) next: MarkerRow and LibraryMenu inline copies, menu delegated-form ruling, closing grep over app/** and perf/** with one mutant per copy form, L28 Completed for docs 274-276 and the stage-5 doc | ' + s['status']
        seen.add('SYS-2')
for f in b['deferred_low_polish']:
    if f.get('id') == 'A-R107-SWEEP-HELD-ENTER-TOOLBAR':
        f['status'] = 'in_progress (D-29z1500): panels done (round 427, HP1-HP9); stage 4 (round 428: sheet, export dialog, narrow screen) and stage 5 (marker row, library menu, closing grep) remain | ' + f['status']; seen.add(f['id'])
    if f.get('id') == 'TL-R425-09-HM5-GESTURE-ROW':
        f['status'] = 'closed (D-29z1498): HM5b characterization row passed C round 427, published ffae71c | ' + f['status']; seen.add(f['id'])
for s in b['architecture_signals']:
    if s.get('id') == 'SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT':
        s['confirmedBy'] = (s.get('confirmedBy', '') + ' | ' if s.get('confirmedBy') else '') + 'gates/round-427/review.md Architecture note (scan row after stage 5, no wrapper) (D-29z1501)'; seen.add(s['id'])
for r in b['architecture_checkpoint_requests']:
    if r.get('id') == 'ARCH-CHECKPOINT-SYS-2':
        r['status'] = 'planned: file with root after SYS-2 stage 5 (2b-ii-b) C PASS; non-blocking; scope adds SIG-R427-HELD-ENTER-TEST-HELPER (D-29z1501) | ' + r['status']; seen.add(r['id'])
if seen != {'SYS-2', 'A-R107-SWEEP-HELD-ENTER-TOOLBAR', 'TL-R425-09-HM5-GESTURE-ROW', 'SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT', 'ARCH-CHECKPOINT-SYS-2'}:
    sys.exit('ids not found: ' + str(seen))
b['deferred_low_polish'].append({'id': 'A-R427-REVIEW-L3-HM5B-LOOSE', 'severity': 'low', 'origin': 'B spec', 'status': 'deferred_low_polish (D-29z1499)',
    'title': 'HM5b asserts statusSequence toBeGreaterThan(before) after the fresh refused Enter; toBe(before + 1) would pin exactly one refusal write. Notes: I1 HM5b leaves the pointer gesture open (no pointerup/cancel, relies on unmount); I3 unused trackHeader, EnterModifiers/ctrlKey and the copied MIXER_CLIPS name in panel-held-enter-ui.test.tsx',
    'evidence': 'a-round-427.md section 4 (A-R427-REVIEW-L3, I1, I3); app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx HM5b; panel-held-enter-ui.test.tsx',
    'repro': 'mutate the window refusal branch to write the refusal status twice per fresh Enter: HM5b stays green', 'added': BY,
    'fixWith': 'SIG-R427-HELD-ENTER-TEST-HELPER extraction (test-only)'})
b['open_findings'].append({'id': 'INFO-C427-AUTH-TRANSIENT-FIRST-READ', 'severity': 'info', 'origin': 'environment', 'status': 'recorded (D-29z1502); round 428 auth row reads a settled state',
    'title': 'g390-auth attempt 2 read legacy signIn:false at 1440 on a first read; workspace false and audio[src] 0 in the same read; polling and attempt 3 show the Sign in gate', 'evidence': 'c-round-427.json environmentRetries; c-round-427/auth.log; c-round-427/legacy-1440.png', 'added': BY})
b['open_findings'].append({'id': 'INFO-B427-COVERING-WORDING', 'severity': 'info', 'origin': 'B spec', 'status': 'closed (D-29z1499): fixed in doc 275 by A; lesson L26/L56 already cover it',
    'title': 'task 427 section 7 named detail-panel* and self-disabling-focus as the covering rows of the folded inline copies; the real repeat rows are HE4, LF8, HT1, HA5', 'evidence': 'a-round-427.md A-R427-REVIEW-L2/L2b', 'added': BY})
b['architecture_signals'].append({'id': 'SIG-R427-HELD-ENTER-TEST-HELPER', 'added': BY, 'decision': 'D-29z1501', 'source': 'a-round-427.md For B (Architecture note); b-round-427/sketch-review.md TL-R427-05',
    'signal': 'held-Enter emulation is copied per test file: pressEnter/holdEnter + snapshot setup in mixer-held-enter-ui and panel-held-enter-ui, pressHeldEnter in shortcut-sheet-ui, studio-narrow-gate-ui and export-cancel-ui (round 428). Proposal: one test-only helper (__tests__/helpers/held-enter.ts) with pressEnter/holdEnter/pressHeldEnter and a configurable snapshot; acceptance: every HM/HP/HQ/HN/HX row green with the same assertions, no production change; closes A-R427-REVIEW-L3-HM5B-LOOSE',
    'status': 'signal only; offered to SYS-2 stage 5 or ARCH-CHECKPOINT-SYS-2; not scheduled'})
open(p, 'w', encoding='utf-8').write(json.dumps(b, ensure_ascii=True, indent=2))
open(DONE, 'w').write('applied v406\n')
print('ok v406')
