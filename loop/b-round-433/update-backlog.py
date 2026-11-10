# B round 433 -> 434 backlog update (v415 -> v416). Idempotent guard: refuses to run twice.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-433/update-backlog.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 415 and b['decisions_log_b'][-1]['id'] == 'D-29z1531', (b['version'], b['decisions_log_b'][-1]['id'])
BY = '2026-11-10 B round 433 -> 434 planning'
def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-10', 'by': BY, 'decision': text})
dec('D-29z1532', 'Round 433 accepted from C evidence: c-round-433.json PASS, 0 bugs, browserVerified/realVerified true (fake-bearer backend row and Firefox/Safari BLOCKED in the cloud; gate rows listed as gate). B re-runs: tools/l57-check.py L57 OK (b-round-433/l57-check-c433.txt); compare-clear.py on c-round-433/probe/after -> ALL OK (2 cells); c-round-433/mutants/summary.txt identical to b-round-432/mutants/summary.txt; c-round-433/auth measured pass true (warm-up false = cold server, expected). Gate 433 published 0c22ac9 on both remotes; gates/round-433/review.md COMMIT OK, suggestions only. SABA-B-12 stage 3 (SABA-B-12-SEARCH-CANCEL) is complete.')
dec('D-29z1533', 'Round 433 Lows -> deferred_low_polish: A-R433-REVIEW-SC3-SELECTOR-COPY, A-R433-REVIEW-NO-SPACE-UNIT (Space on Clear only browser-proved; C row 4 proved it), A-R433-REVIEW-SHEET-STRINGS-KEY-PIN, A-R433-REVIEW-SF2-SCANNER-BLIND-SPOTS, GATE433-S1-DOC281-SAFARI-TODO (doc 281 TODO claims Safari draws our button twice; Safari draws ::-webkit-search-cancel-button, which the sheet hides; doc-only fix), GATE433-S2-DOC281-LESSON-IDS (doc cites L47/L13 lesson ids that read as line numbers; doc-only). Gate 3 (no hover transition, consistent with Close) and 4 (SF2 cwd / exact list, intended) info. B self-finding B-R433-HEAD-BLUE-PX-MISCOUNT (low, origin B): round 433 task text said HEAD 8 blue px while B\'s own probe/head/clear.json said 32 - an L58 violation (asserted number not copied from the saved output); tools/l58-check.py only checks the sketch-review sha and verdict, so it could not catch it. Row pass condition (sketch = 0) unaffected. RETRO 435 input, no new lesson (L58 already states the rule; lessons.md at 60 lines).')
dec('D-29z1534', 'SABA-B-12 stage 3b facts (B, real Chromium 143 at 0c22ac9 with ignoreDefaultArgs --hide-scrollbars, b-round-433/probe/): shortcut sheet scrolls on both viewports (1410 vs 808/646) with computed scrollbar-color rgba(18,217,200,0.4), width thin, 10 px bar, ~1,750 teal px in the right 13 px strip; Export dialog (560 wide) scrolls only at 1280x720 (691 vs 646), same teal; at 1440x900 it fits. The library scroller (STUDIO_SCROLLBAR_CLASS) has scrollbar-color auto and a 10 px bar. In-page experiments: adding the Studio classes alone changes nothing (the standard scrollbar-color wins over ::-webkit-scrollbar); forcing scrollbar-color auto while styled-scrollbar stays gives a 4 px bar with an invisible thumb (unlayered utilities.css beats layered Tailwind; border-2 eats the width). Ruling: Modal gets an optional scrollbarClassName prop (default styled-scrollbar, so ConfirmModal and the frozen legacy studio/ExportDialog keep the store look); new STUDIO_DIALOG_SCROLLBAR_CLASS = the lane skin minus [scrollbar-gutter:stable] (a stable gutter would narrow the non-scrolling Export dialog at 1440); STUDIO_SCROLLBAR_CLASS byte-identical; both Studio dialogs pass it. Thumb dim 5.38:1 vs surface (HEAD teal ~2.60:1); hover foreground 14.78:1. Firefox ignores ::-webkit-scrollbar -> the Studio dialogs get the OS default there, as the Studio lanes already do (TL-R434-01) -> TLM-SABA-B-12-FIREFOX-SAFARI scope. tech-lead approve-with-lows TL-R434-01..05 (b-round-433/sketch-review.md). No Ableton reference for a dialog scrollbar look (Live draws its own thin scrollbars; not a behaviour) - "no reference found" for the look.')
dec('D-29z1535', 'ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS filed with root as promised after stage 3: b-round-433-checkpoint-request.md (4 questions: class-constant modules, shared JSX tag scanner for PG2/SF2/DS4, StudioSearchField refocusPolicy, Modal scrollbarClassName vs StudioDialog wrapper). Non-blocking.')
dec('D-29z1536', 'Round 434 dispatched: SABA-B-12 stage 3b (SABA-B-12-DIALOG-SCROLLBAR) on baseline 0c22ac9. A applies b-round-433/sketch-434.patch.txt (sha 8aed38f3, 5 files: Modal.tsx prop, studio-scrollbar.ts split, the two Studio dialogs, new studio-dialog-scrollbar.test.tsx DS1-DS4) and writes doc 282. B runs: 8/8 mutants red; covering 30 files 442/442; typecheck/lint rc 0 (205 warnings = HEAD); real Chromium sketch ALL OK (2 cells), HEAD NOT ALL OK. Next after 434: RETRO-435 (round 435), then REGRESSION-2026-11-13 when due, then COPY-PD-VIS with the lane resize handle.')
for f in b['open_findings']:
    if f.get('id') == 'SABA-B-12-SEARCH-CANCEL':
        f['status'] = 'done (D-29z1532): C round 433 PASS browserVerified, published 0c22ac9'
    if f.get('id') == 'SABA-B-12-DIALOG-SCROLLBAR':
        f['status'] = 'in_progress (D-29z1536): round 434, sketch b-round-433/sketch-434.patch.txt'
        f['evidence_r434'] = 'b-round-433/probe/head/scrollbar.json, compare-head.txt; Export dialog also scrolls at 1280x720'
    if f.get('id') == 'SABA-B-12':
        f['status'] = 'in_progress (D-29z1515, D-29z1521, D-29z1523, D-29z1527, D-29z1532, D-29z1536): stages 1, 2a, 2b, 3 passed C and are published (5a30894, 1197dcb, 1a417fb, 0c22ac9); stage 3b dialog scrollbar = round 434; stage 4 selects in REVIEW-RECOMMENDATIONS'
        for s in f['stages']:
            if s.get('stage') == 3:
                s['status'] = 'complete (D-29z1532): C round 433 PASS, published 0c22ac9'
            if s.get('stage') == '3b':
                s['status'] = 'in_progress (D-29z1536): round 434'
    if f.get('id') == 'TLM-SABA-B-12-FIREFOX-SAFARI':
        f['scope_r434'] = 'also: Studio dialogs (shortcut sheet, Export at 1280x720) in Firefox show the OS default scrollbar (no ::-webkit-scrollbar), consistent with the Studio lanes; Safari should show the Studio thumb (D-29z1534). Deadline RETRO 435 (L46): at RETRO 435 the unchecked rows go to Saba as one question.'
    if f.get('id') == 'ARCH-SIGNAL-STUDIO-CONTROLS':
        f['note_r434'] = 'Modal scrollbarClassName prop + STUDIO_DIALOG_SCROLLBAR_CLASS + DS4 source scan added (round 434); in the checkpoint request (D-29z1535)'
for x in b['root_requests_b']:
    if x.get('id') == 'ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS':
        x['status'] = 'filed with root (D-29z1535): b-round-433-checkpoint-request.md; non-blocking; result awaited'
lows = [
 ('A-R433-REVIEW-SC3-SELECTOR-COPY', 'A', 'SC3 copies the focus-trap selector string instead of importing SHORTCUT_SHEET_FOCUSABLE; a selector change would leave SC3 green', 'a-round-433.md reviewer Lows', None),
 ('A-R433-REVIEW-NO-SPACE-UNIT', 'A', 'No jsdom row for Space on the sheet Clear button (browser probe afterSpace only; C round 433 row 4 proved it)', 'a-round-433.md reviewer Lows', None),
 ('A-R433-REVIEW-SHEET-STRINGS-KEY-PIN', 'A', 'Nothing pins studioShortcutSheetStrings exact keys (SC1 pins the clearSearch literal only)', 'a-round-433.md reviewer Lows', None),
 ('A-R433-REVIEW-SF2-SCANNER-BLIND-SPOTS', 'A', 'SF2 scanner misses a type passed through {...props} and an apostrophe in a // comment inside a tag', 'a-round-433.md reviewer Lows', None),
 ('GATE433-S1-DOC281-SAFARI-TODO', 'gate reviewer', 'Doc 281 TODO says Safari shows our Clear button twice; Safari draws ::-webkit-search-cancel-button, which the sheet hides - correct the doc text', 'gates/round-433/review.md suggestion 1', None),
 ('GATE433-S2-DOC281-LESSON-IDS', 'gate reviewer', 'Doc 281 cites L47/L13 (lesson ids) that read like line numbers; name the lessons or the symbols', 'gates/round-433/review.md suggestion 2', None),
 ('B-R433-HEAD-BLUE-PX-MISCOUNT', 'B', 'Round 433 task text said HEAD 8 blue px; B probe said 32 (L58 miss; l58-check checks only the review sha). Retro input', 'a-round-433.md For B; c-round-433.md Notes for B', None),
]
for i, origin, t, ev, conf in lows:
    if any(e.get('id') == i for e in b['deferred_low_polish']):
        continue
    b['deferred_low_polish'].append({'id': i, 'severity': 'low', 'origin': origin, 'status': 'deferred_low_polish (D-29z1533)', 'title': t, 'evidence': ev, 'added': BY})
for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-2026-11-13':
        x.setdefault('scope_additions', []).append({'id': 'REG-SABA-B-12-DIALOG-SCROLLBAR', 'what': 'Studio dialog scrollbars: shortcut sheet (both viewports) and Export (1280x720) show the warm Studio thumb, 0 teal px, computed scrollbar-color auto (b-round-433/probe/scrollbar-probe.mjs + compare-scrollbar.py, visible scrollbars; only if round 434 passed)', 'added': 'D-29z1536'})
for r in b['rounds']:
    if r.get('round') == 433:
        r['status'] = 'c_pass_published (D-29z1532): gate 433 0c22ac9'
b['rounds'].append({'round': 434, 'task': 'current-task.md', 'decision': 'D-29z1536', 'type': 'SABA-B-12 stage 3b (Studio dialog scrollbar)', 'status': 'dispatched', 'note': 'baseline 0c22ac9 clean; sketch b-round-433/sketch-434.patch.txt; claims b-round-433/claims-434.sh'})
b['current_task'] = 'Round 434: SABA-B-12 stage 3b - the shortcut sheet and Export dialog use the Studio scrollbar instead of the store teal styled-scrollbar (Modal scrollbarClassName prop, STUDIO_DIALOG_SCROLLBAR_CLASS); rows DS1-DS4; doc 282 (current-task.md; sketch b-round-433/sketch-434.patch.txt)'
b['version'] = 416
b['updated'] = '2026-11-10'
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n')
print('backlog v416')
