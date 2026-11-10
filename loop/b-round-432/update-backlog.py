# B round 432 -> 433 backlog update (v414 -> v415). Idempotent guard: refuses to run twice.
import json, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
P = L + '/backlog.json'
done = L + '/b-round-432/update-backlog.done'
assert not os.path.exists(done), 'already applied'
b = json.load(open(P, encoding='utf-8'))
assert b['version'] == 414 and b['decisions_log_b'][-1]['id'] == 'D-29z1526', (b['version'], b['decisions_log_b'][-1]['id'])
BY = '2026-11-10 B round 432 -> 433 planning'
def dec(i, text):
    b['decisions_log_b'].append({'id': i, 'date': '2026-11-10', 'by': BY, 'decision': text})
dec('D-29z1527', 'Round 432 accepted from C evidence: c-round-432.json PASS, 0 bugs, browserVerified/realVerified true (fake-bearer backend row and Firefox/Safari/High Contrast BLOCKED in the cloud; gate rows listed as gate). B re-runs: tools/l57-check.py L57 OK (b-round-432/l57-check-c432.txt); C probe JSON re-judged with compare-progress.py -> ALL OK (2 cells, 4 states each) and compare-neighbours.py -> NEIGHBOURS OK (b-round-432/recompare/); c-round-432/mutants/summary.txt identical to b-round-431/mutants/summary.txt; c-round-432/auth/g428-auth.json pass true (warm-up attempt false = cold-server, expected). Gate 432 published 1a417fb on both remotes (gate head field and context/head-sha.txt name 1197dcb, stale); gates/round-432/review.md COMMIT OK, 9/10, suggestions only. SABA-B-12 stage 2b is complete.')
dec('D-29z1528', 'Round 432 Lows (merged with the gate review where they overlap): A-R432-REVIEW-RV432-1 (indeterminate two stacked foreground/30 layers; Firefox single layer ~2.5:1) = gate suggestion 1 -> deferred_low_polish and in the TLM-SABA-B-12-FIREFOX-SAFARI scope; RV432-2 (pulse low point ~1.5:1) = gate suggestion 2 -> deferred_low_polish; RV432-3 (track vs surface 1.29:1, outline invisible at value 0) -> deferred_low_polish as an explicit product-designer ruling to revisit at the polish pass; RV432-4 (brassLabelTokens still exempts accent-foreground, no user) -> deferred_low_polish; RV432-5 (PG2 passes with a later {...spread} or style= on the tag; misses createElement/.ts wrappers/subdirectories) -> deferred_low_polish. Gate suggestion 3 (forced colours emulation only) = TLM row; gate 4 (PG2 [^<] fails loud) and 5 (labelStatusTokens exists) info, no entry. Records: R11-P1e render-budget 2,299 ms of 5 s (46 %, rising 2,006 -> 2,142 -> 2,299) carried as a record row; SfxSceneExport.tsx <progress> joins SABA-B-12-RECORDINGS-NUMBER (STORE-REDESIGN acceptance, apply STUDIO_PROGRESS_CLASS there and widen PG2 only if that acceptance wants it). Architecture note: none (A and gate).')
dec('D-29z1529', 'SABA-B-12 scrollbar scope (Saba named scrollbars; the stage list had none): B found in real Chromium at 1a417fb (b-round-432/probe/head/sheet.json) that the shortcut sheet scrolls on both viewports (scrollHeight 1368 vs clientHeight 808 at 1440x900 and 646 at 1280x720) inside Modal.tsx l.110 `styled-scrollbar`, whose app/styles/base/utilities.css l.109-113 sets scrollbar-width thin and scrollbar-color hsl(175 85% 46% / 0.4) = computed rgba(18,217,200,0.4): a teal (old brand) standard scrollbar; in Chromium 121+ a set scrollbar-color/width overrides the ::-webkit-scrollbar rules. The Studio scrollers already share STUDIO_SCROLLBAR_CLASS (studio-scrollbar.ts). New stage SABA-B-12-DIALOG-SCROLLBAR (Medium, stage 3b): Studio dialogs (shortcut sheet; Export dialog if it scrolls at 1280x720) get the Studio scrollbar without changing the shared store Modal default. Harness fact: Playwright headless passes --hide-scrollbars (offsetWidth-clientWidth = border only), so the stage 3b browser rows launch Chromium with ignoreDefaultArgs ["--hide-scrollbars"] and read computed scrollbar-color plus a pixel crop. Next UI round after stage 3.')
dec('D-29z1530', 'Round 433 dispatched: SABA-B-12 stage 3 (SABA-B-12-SEARCH-CANCEL) on baseline 1a417fb. HEAD fact: Chromium draws its native blue search-cancel in the shortcut sheet search (8 blue pixels in the right 42 px of the field, both viewports; b-round-432/probe/head/). Ruling (product-designer): hide the native cancel and draw the app button on the Library pattern one step up (h-7 w-7, X size-3.5, pr-9, aria-label/title "Clear search"); shown while query !== ""; a click/Enter/Space clears and ALWAYS focuses the search input (the button unmounts; Library refocuses only when the button had focus - a dialog must not drop focus); Esc still closes the sheet (Saba CALM-1; Live 12 manual 4.2: Esc clears the browser search - existing listed deviation, no new question). Reference: Live 12 manual 4.2 Search Bar "You can click the x button in the search bar to clear any search terms" (WebFetch 2026-11-10). tech-lead approve-with-lows TL-R433-01..06; 01-05 applied in sketch v2 (sha 82d7d76c), 06 deferred to ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS. B runs on v2: 8/8 mutants red; covering 10 files 196/196; typecheck/lint rc 0 (205 warnings = HEAD); real Chromium sketch ALL OK (2 cells), HEAD NOT ALL OK.')
for f in b['open_findings']:
    if f.get('id') == 'SABA-B-12-STAGE-2B-PROGRESS':
        f['status'] = 'done (D-29z1527): C round 432 PASS browserVerified, published 1a417fb'
    if f.get('id') == 'SABA-B-12':
        f['status'] = 'in_progress (D-29z1515, D-29z1521, D-29z1523, D-29z1527, D-29z1529, D-29z1530): stages 1, 2a, 2b passed C and are published (5a30894, 1197dcb, 1a417fb); stage 3 search clear = round 433; stage 3b dialog scrollbar next; stage 4 selects in REVIEW-RECOMMENDATIONS'
        for s in f['stages']:
            if s.get('stage') == 2:
                s['status'] = 'complete (D-29z1521, D-29z1527): 2a radios C round 431 (1197dcb); 2b <progress> C round 432 (1a417fb)'
            if s.get('stage') == 3:
                s['status'] = 'in_progress (D-29z1530): round 433, sketch b-round-432/sketch-433.patch.txt'
            if s.get('id') == 'SABA-B-12-RECORDINGS-NUMBER':
                s['progress_note'] = 'D-29z1528: SfxSceneExport.tsx <progress> also here (apply STUDIO_PROGRESS_CLASS, widen PG2) and SfxSoundLibrary.tsx search input (TL-R433-06)'
        if not any(s.get('id') == 'SABA-B-12-DIALOG-SCROLLBAR' for s in f['stages']):
            idx = [i for i, s in enumerate(f['stages']) if s.get('stage') == 3][0]
            f['stages'].insert(idx + 1, {'stage': '3b', 'id': 'SABA-B-12-DIALOG-SCROLLBAR', 'severity_audit': 'n/a (audit missed it)', 'what': 'Modal styled-scrollbar draws a teal thin standard scrollbar in the Studio shortcut sheet (and the Export dialog if it scrolls); give Studio dialogs the Studio scrollbar', 'status': 'planned after stage 3 (D-29z1529)'})
    if f.get('id') == 'TLM-SABA-B-12-FIREFOX-SAFARI':
        f['scope_r433'] = 'also: Firefox indeterminate progress single-layer contrast (A-R432-REVIEW-RV432-1); Safari/Firefox shortcut-sheet search shows no native cancel and the Clear search button (D-29z1530)'
b['open_findings'].append({'id': 'SABA-B-12-SEARCH-CANCEL', 'severity': 'medium', 'origin': 'B inventory, part of SABA-B-12 (stage 3)', 'kind': 'saba_approved_task', 'status': 'in_progress (D-29z1530): round 433, sketch b-round-432/sketch-433.patch.txt', 'title': 'Shortcut sheet search shows Chromium\'s native blue cancel; hide it and draw the app Clear search button (Library pattern)', 'evidence': 'b-round-432/probe/head/clear.json, head/1440x900-typed.png', 'added': BY})
b['open_findings'].append({'id': 'SABA-B-12-DIALOG-SCROLLBAR', 'severity': 'medium', 'origin': 'B inventory, part of SABA-B-12 (stage 3b)', 'kind': 'saba_approved_task', 'status': 'planned (D-29z1529): next UI round after stage 3', 'title': 'Studio dialogs (shortcut sheet; Export dialog if it scrolls) inherit Modal styled-scrollbar: teal thin standard scrollbar (computed rgba(18,217,200,0.4)); give them the Studio scrollbar without changing the shared store Modal default', 'evidence': 'b-round-432/probe/head/sheet.json (scrollHeight 1368 vs 808/646; scrollbarColor rgba(18, 217, 200, 0.4) rgba(0, 0, 0, 0); scrollbarWidth thin); Modal.tsx l.110; app/styles/base/utilities.css l.109-113', 'repro': '/studio-lab, press ?, scroll the sheet (headed Chromium or ignoreDefaultArgs --hide-scrollbars)', 'added': BY})
lows = [
 ('A-R432-REVIEW-RV432-1-FIREFOX-SINGLE-LAYER', 'A', 'Indeterminate progress relies on Chromium stacking two bg-foreground/30 layers (measured mid pixel 4.37:1); one layer in Firefox ~2.5:1 (< 3:1)', 'a-round-432.md RV432-1', 'gates/round-432/review.md suggestion 1'),
 ('A-R432-REVIEW-RV432-2-PULSE-LOW-POINT', 'A', 'motion-safe animate-pulse takes the indeterminate bar to ~0.5 opacity, ~1.5:1 against the surface at its low point (label + aria-valuetext carry the state)', 'a-round-432.md RV432-2', 'gates/round-432/review.md suggestion 2'),
 ('A-R432-REVIEW-RV432-3-TRACK-AT-ZERO', 'A', 'Progress track vs surface 1.29:1, so the bar outline is invisible at value 0 (every phase reset); ruled "track carries no meaning" by product-designer - revisit at the polish pass', 'a-round-432.md RV432-3', None),
 ('A-R432-REVIEW-RV432-4-BRASS-EXEMPTION-LEFTOVER', 'A', 'label-status-colour-ui.test.tsx brassLabelTokens still exempts accent-foreground; no component uses it any more', 'a-round-432.md RV432-4', None),
 ('A-R432-REVIEW-RV432-5-PG2-SPREAD', 'A', 'PG2 passes when a later {...spread} or style= on the same <progress> tag overrides the class; misses createElement(progress), .ts wrappers and subdirectories; cheap hardening: reject {... and style= inside the matched tag', 'a-round-432.md RV432-5', None),
]
for i, origin, t, ev, conf in lows:
    e = {'id': i, 'severity': 'low', 'origin': origin, 'status': 'deferred_low_polish (D-29z1528)', 'title': t, 'evidence': ev, 'added': BY}
    if conf:
        e['confirmedBy'] = conf
    b['deferred_low_polish'].append(e)
for x in b['regression_rounds']:
    if x.get('id') == 'REGRESSION-2026-11-13':
        x.setdefault('scope_additions', []).append({'id': 'REG-SABA-B-12-SEARCH-CLEAR', 'what': 'Shortcut sheet search: no native cancel, Clear search button clears and focuses search, real Tab order, Esc closes (b-round-432/probe/clear-probe.mjs + compare-clear.py, both viewports; only if round 433 passed)', 'added': 'D-29z1530'})
for a in b.get('architecture_signals', []) if isinstance(b.get('architecture_signals'), list) else []:
    pass
for f in b['open_findings']:
    if f.get('id') == 'ARCH-SIGNAL-STUDIO-CONTROLS':
        f['note_r433'] = 'TL-R433-06: only the [&::-webkit-search-cancel-button]:hidden token is shared between Library and sheet search; bring a shared search-field constant to the checkpoint (D-29z1530)'
for r in b['rounds']:
    if r.get('round') == 432:
        r['status'] = 'c_pass_published (D-29z1527): gate 432 1a417fb'
b['rounds'].append({'round': 433, 'task': 'current-task.md', 'decision': 'D-29z1530', 'type': 'SABA-B-12 stage 3 (shortcut sheet search clear)', 'status': 'dispatched', 'note': 'baseline 1a417fb clean; sketch b-round-432/sketch-433.patch.txt; claims b-round-432/claims-433.sh'})
b['current_task'] = 'Round 433: SABA-B-12 stage 3 - the shortcut sheet search hides the native cancel and draws its own Clear search button (Library pattern; always refocuses search; Esc still closes); rows SC1-SC6 + SF1-SF2; doc 281 (current-task.md; sketch b-round-432/sketch-433.patch.txt)'
b['version'] = 415
b['updated'] = '2026-11-10'
json.dump(b, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(done, 'w').write('ok\n')
print('backlog v415')
