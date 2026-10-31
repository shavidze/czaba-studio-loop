import json, sys
P = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json'
b = json.load(open(P))
A = '2026-10-31 B round 290 -> 291 planning'
if any(x.get('id') == 'D-29z719' for x in b['decisions_log_b']):
    sys.exit('already applied')
def f(key, i):
    for x in b[key]:
        if x.get('id') == i:
            return x
    raise KeyError(i)
def pre(x, s):
    x['status'] = s + ' | ' + str(x.get('status'))
b['version'] = 251
b['updated'] = A
b['current_task'] = 'current-task.md (round 291, D-29z719..D-29z722; FIX-PD-1b2: GATE289-S1 heading aria-hidden (Medium), GATE289-S2 doc 216 l.17 (Medium, doc half), GATE289-S3 stable group keys (Low), A-R289-REVIEW-L2 test names + RT-FIX-291 (retro-290 l.87); baseline 5a911ff, frozen b-round-290-r291-tree-sha256.txt 1157)'
# D-29z719 round 290 result
rr = [x for x in b['retro_runs'] if x.get('round') == 290][0]
pre(rr, 'C round 290 FAIL on RT-CAUSE only (C-R290-01, Low, origin B spec); every other row PASS incl. G290-AUTH, STUDIO-SMOKE-290 and the RT-SCREEN re-probe at both viewports (browserVerified/realVerified true); gate 290 skipped (C FAIL), nothing to publish from store; retro-290.md l.87 corrected at this planning (b-round-290/retro-diff.txt), RT-FIX-291 re-checks that line only (D-29z719)')
b['open_findings'].append({'id': 'C-R290-01', 'severity': 'low', 'origin': 'B spec', 'against': 'B (retro document)', 'title': 'retro-290 section 3 row "276 gate fail" said 3 test files all checking native disabled; source: 2 files, 3 tests (NS6/TC9 disabled, NS1 old Split title)', 'source': 'c-round-290.json bugs[0]', 'evidence': 'c-round-290/rt/gate276-excerpt.txt; gates/round-276/verify.log Test Files 2 failed', 'status': 'fixed at planning (D-29z719): retros/retro-290.md l.87 rewritten (b-round-290/retro-diff.txt); C re-checks in RT-FIX-291 (round 291)', 'added': A})
b['open_findings'].append({'id': 'INFO-C290-01', 'severity': 'info', 'origin': 'B pre-check', 'title': 'retro290-mention-ids.txt missed the hyphen spelling RETRO-290 (D-29z692, PD-REVIEW order_rule) and the retro_policy/final_acceptance hits; C found no missing disposition', 'source': 'c-round-290.json info[0]', 'status': 'noted (D-29z719): next RETRO inventory greps retro[ _-]?<N> case-insensitive (C method, c-round-290/rt/inventory-c.txt)', 'added': A})
b['open_findings'].append({'id': 'INFO-C290-02', 'severity': 'info', 'origin': 'environment', 'title': 'first G290-AUTH attempt timed out on the cold dev server (L38 warm-up class); first smoke script stopped with a second Play click (Play is not a toggle, SABA-B-9)', 'source': 'c-round-290.json info[1]', 'status': 'noted (D-29z719): no app bug', 'added': A})
for i in ('GATE289-S1-HEADING-SR-DOUBLE', 'GATE289-S2-DOC216-ALWAYS', 'GATE289-S3-RUN-KEYS', 'A-R289-REVIEW-L2'):
    pre(f('open_findings', i), 'dispatched round 291 FIX-PD-1b2 (D-29z720)')
st = [s for s in f('post_current_stage_queue', 'PD-REVIEW-2026-10-31')['stages'] if s.get('id') == 'FIX-PD-1b2'][0]
pre(st, 'dispatched (D-29z720): round 291, baseline 5a911ff; B pre-check on a scratch copy: 15 files / 258 tests pass, tsc rc 0, Biome rc 0, mutants M1-M3 red (b-round-290/sketch-results.txt, mutant-M*.log); AX probe ax-before (2 text nodes in groups) vs ax-sketch (0, names and list box unchanged)')
pre(f('post_current_stage_queue', 'PD-REVIEW-2026-10-31'), 'in_progress (D-29z720): RETRO 290 ran (C FAIL only on C-R290-01, Low, retro text; fixed at planning); FIX-PD-1b2 dispatched round 291 with RT-FIX-291')
# D-29z720 key ruling
b['open_findings'].append({'id': 'B-R290-S3-FIRST-ID-KEY-PARTIAL', 'severity': 'info', 'origin': 'B pre-check', 'title': "the gate reviewer's S3 fix key={results[run.start].id} keeps focus only when a whole run before the focused option disappears; when the first option of the focused option's own run disappears the group still remounts (LG8 b-two red); a label+occurrence key keeps both", 'source': 'b-round-290/sketch-results.txt, mutant-M2-first-id-key.log', 'status': 'ruled (D-29z720): task 291 requires the behaviour (LG8 both cases); sketch uses `${label}#${occurrence}`', 'added': A})
# D-29z721 new Low + signals
b['deferred_low_polish'].append({'id': 'B-R290-LIB-SHAPE-SWITCH-FOCUS', 'severity': 'low', 'status': 'deferred', 'origin': 'B pre-check (advisor)', 'title': 'when the library results change from >= 2 collection runs to 1 (or back) while an option has focus, the list switches between the grouped and the flat render branch, the focused option remounts and focus falls to body (pre-existing since round 289; key-independent)', 'evidence': 'ArrangementLibrary.tsx l.660 ternary at 5a911ff (b-round-290/claims-291.sh K12); reasoning in b-round-290.md', 'repro': 'unit: three-run fixture, focus an option, change the collection or query so only one run remains (fireEvent.change keeps focus on the option); browser: needs a collection change while an option is focused (typing moves focus to the search box), not reachable in the demo', 'deferred_reason': '2026-10-23 bug gate: Low -> deferred_low_polish (D-29z721); L47 names the focus target when fixed', 'added': A})
b['retro_candidates'].append({'id': 'RC-R290-AX-TREE-ROW', 'added': A, 'text': 'GATE289-S1 (Medium) reached the gate because task 289 checked group names via DOM/jsdom only; a role/ARIA structure change gets one Chromium accessibility-tree row (ariaSnapshot or CDP getFullAXTree) at both viewports (1x)', 'status': 'watch to RETRO 305 (D-29z721); applied in task 291 B-AX row'})
b['retro_candidates'].append({'id': 'RC-R290-L50-MULTILINE-TERNARY', 'added': A, 'text': 'the L50 focus-origin regex misses a conditional render whose `?` is on the next line (ArrangementLibrary.tsx l.660 `{libraryResultRuns.length >= 2` at 5a911ff, K12); B added it by hand in task 291 (1x)', 'status': 'watch to RETRO 305 (D-29z721)'})
b['architecture_signals'].append({'id': 'A-R289-ARCH-GROUP-RUNS-NOTE-291', 'added': A, 'text': 'task 291 adds a key to the run computation inside ArrangementLibrary.tsx; the extract proposal A-R289-ARCH-GROUP-RUNS (groupLibraryResults in lib/arrangement/library.ts) stays a signal; not scheduled; no frontend-architect checkpoint requested (one small owner change)', 'status': 'signal (D-29z721)'})
for d in [
 ('D-29z719', 'Round 290 (RETRO 290) closed: C FAIL only on RT-CAUSE (C-R290-01, Low, origin B spec: retro-290 l.87 said 3 test files all native disabled; source 2 files, 3 tests). All other rows PASS, browserVerified/realVerified true (G290-AUTH, STUDIO-SMOKE-290, RT-SCREEN re-probe at both viewports). Gate 290 skipped; baseline stays 5a911ff. B corrected l.87 (b-round-290/retro-diff.txt); RT-FIX-291 re-checks it. INFO-C290-01/02 noted. lessons.md unchanged (59 lines; a one-line miscount earns no lesson).'),
 ('D-29z720', 'Round 291 = FIX-PD-1b2 per task 290 section 4 row 1 (all-but-RT rows passed; RT failure handled by RT-FIX): GATE289-S1 aria-hidden on the group heading (Chromium AX tree before/after: 2 -> 0 stray text nodes, group names unchanged, list box unchanged; b-round-290/probe), GATE289-S2 doc 216 l.17 wording (product half stays SABA-Q-LIB-SINGLE-RUN), GATE289-S3 group key that survives index shifts and a removed run-start option (label+occurrence; the reviewer first-id key fails LG8 b-two, B-R290-S3-FIRST-ID-KEY-PARTIAL), A-R289-REVIEW-L2 ST47/ST51 names. New doc 217 (precedent 215 for a fix-up), doc 216 l.17 only. code-reviewer required (5 files).'),
 ('D-29z721', 'New Low B-R290-LIB-SHAPE-SWITCH-FOCUS -> deferred_low_polish (pre-existing, key-independent, not reachable in the demo); retro candidates RC-R290-AX-TREE-ROW and RC-R290-L50-MULTILINE-TERNARY (watch to 305); A-R289-ARCH-GROUP-RUNS stays a signal; no checkpoint request.'),
 ('D-29z722', 'Order after 291 unchanged (task 290 section 4): REGRESSION when the 292 planning is on/after 2026-11-02 (regression-last 2026-10-30, round 258), else FIX-PD-1c -> SYS-VACUOUS-ROWS -> STUDIO-LINK -> NAME-AND-HINT -> PERF-3c and the rest of STUDIO-PERFORMANCE -> STEM-LANES -> SYS-1..3 -> STORE-2b..5 (direction gate) -> REVIEW-RECOMMENDATIONS -> T12-ADVANCED -> phase-2 entries (skip rule). regression-last.json untouched.'),
]:
    b['decisions_log_b'].append({'id': d[0], 'date': '2026-10-31', 'text': d[1]})
json.dump(b, open(P, 'w'), ensure_ascii=False, indent=1)
print('ok')
