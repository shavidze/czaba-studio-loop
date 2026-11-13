import json, pathlib, sys
M = pathlib.Path('b-round-496/update-backlog.done')
if M.exists(): sys.exit('already applied')
p = pathlib.Path('backlog.json'); b = json.loads(p.read_text())
pathlib.Path('b-round-496/backlog-before-497.json').write_text(p.read_text())
BY = '2026-11-13 B round 496 -> 497 planning'
b['version'] += 1
b['updated'] = '2026-11-13'
D = b['decisions_log_b']
D.append({'id': 'D-29z1778', 'date': '2026-11-13', 'by': BY, 'decision': 'Round 496 result accepted as BLOCKED (A STOP on two code-reviewer Mediums in sketch test lines; C ran C0/C13/C14 only per L22, browserVerified false; gate 496 skipped). Nothing closes: C passed only C0 and C13; C\'s measure.mjs run is an extra observation, not acceptance, so B-R496-404-BROWSE-STORE-UNSTYLED and DPG-BUTTON-CLEANUP stay open. Baseline for round 497 = HEAD 3bcf8cb + the 13-line round-496 worktree (gate not published). Archive tasks/round-496.md = byte-identical copy of the round-496 current-task.md.'})
D.append({'id': 'D-29z1779', 'date': '2026-11-13', 'by': BY, 'decision': 'Ruling on the STOP: option (a), test-only addendum (b-round-496/addendum-497.patch.txt) to store-glow-shadow.test.ts (GS3: every app/**/*.css scanned for the retired class selectors, with a positive/negative regex self-test; exact-selector loop kept) and store-button-cleanup.test.tsx (BC1b: 288 combos of variant x size x fullWidth x disabled x isLoading x className against literal HEAD 3bcf8cb strings; BC3 closest(button) null; BC4 token absence). Not option (b): both are real guard gaps (8 B mutants survive A-496 tests, all red with the addendum: b-round-496/mutants-497*.txt). The reviewer-proposed regex (?<![\\w-])\\. misses a.button (B self-test red), so the addendum uses \\.(...)(?![\\w-]). sketch-496 is not re-applied; the 10 other round-496 paths are frozen (b-round-496/r497-a496-frozen-sha256.txt).'})
D.append({'id': 'D-29z1780', 'date': '2026-11-13', 'by': BY, 'decision': 'Pre-ruled reviewer Lows of round 496 (a re-raise in round 497 is listed For B, not a STOP): #3 A-R496-CR-LINK-DISABLED-VISUAL-ONLY, #6 A-R496-CR-BC5-CLASS-ONLY, #7 A-R496-CR-SIGNED-IN-SKELETON-SHIFT (also C row C15), #10 A-R496-CR-BC6-BARE-BUTTON-TOKEN -> deferred_low_polish; #11 = existing SIG-R496-UNLAYERED-A-TRANSITION; #4/#5 fixed by the addendum, close on C PASS of C10/C11. Order after round 497 unchanged (D-29z1776): DPG-BUTTON-CLEANUP-2, then rest of DPG P1; REGRESSION first if planning is on/after 2026-11-16.'})
OF = b['open_findings']
for fid, title in [
    ('A-R496-CR-GS3-GUARD', 'GS3 only catches the exact retired selectors in styles/app.css; :focus-visible/::after/a.button/.btn-secondary or rules in base/utilities.css would pass'),
    ('A-R496-CR-BC1-PIN', 'BC1 pins only Button primary/md; other variants, sizes, fullWidth, disabled/loading and className position unpinned against HEAD'),
]:
    OF.append({'id': fid, 'severity': 'medium', 'origin': 'A code-reviewer', 'status': 'dispatched round 497 (D-29z1779): test-only addendum; closes on C PASS of C10/C11', 'title': title, 'evidence': 'a-round-496.md STOP section; b-round-496/mutants-497-on-a496-tests.txt (8/8 survive)', 'added': BY})
for f in OF:
    if f.get('id') == 'B-R496-404-BROWSE-STORE-UNSTYLED':
        f['status'] = 'dispatched round 497 (D-29z1778): round 496 STOPPED before C acceptance; closes on C PASS of C2/C6 | ' + f['status']
    if f.get('id') == 'DPG-BUTTON-CLEANUP-2':
        f['status'] = 'scheduled (D-29z1780): after round 497 closes stage 1 | ' + f['status']
DL = b['deferred_low_polish']
for fid, title, st in [
    ('A-R496-CR-LINK-DISABLED-VISUAL-ONLY', 'buildButtonClassName isDisabled on a <Link> is visual only (pointer-events-none); Enter still activates; no consumer uses it', 'deferred_low_polish (D-29z1780)'),
    ('A-R496-CR-BC5-CLASS-ONLY', 'BC5 compares class strings only; mobile Sign In click and skeleton sizes untested in jsdom (max-lg:hidden stays browser row C4)', 'deferred_low_polish (D-29z1780)'),
    ('A-R496-CR-SIGNED-IN-SKELETON-SHIFT', 'desktop auth skeleton w-24 h-12 (96x48) resolves to the ~36px btn-icon user button for signed-in users: the skeleton-to-content shift may now hit signed-in users', 'deferred_low_polish (D-29z1780); measured by C row C15 in round 497'),
    ('A-R496-CR-BC6-BARE-BUTTON-TOKEN', 'BC6 className="button[ \\"]" misses quoted/template/clsx bare button tokens (0 current hits); __tests__ filter redundant', 'deferred_low_polish (D-29z1780)'),
    ('A-R496-CR-BC3-SELF-DERIVED', 'BC3 expected value derived from the builder under test; add closest(button) null', 'fixed by round 497 addendum (D-29z1780); closes on C PASS of C10/C11'),
    ('A-R496-CR-BC4-NEAR-VACUOUS', "BC4 not.toBe(PILL_LG) near-vacuous; assert bg-brand/rounded-full absent", 'fixed by round 497 addendum (D-29z1780); closes on C PASS of C10/C11'),
]:
    DL.append({'id': fid, 'severity': 'low', 'origin': 'A code-reviewer', 'status': st, 'title': title, 'evidence': 'a-round-496.md For B', 'repro': 'see a-round-496.md For B', 'added': BY})
for r in b['rounds']:
    if r.get('round') == 496:
        r['status'] = 'BLOCKED (A STOP, C L22 rows only; gate skipped)'
b['rounds'].append({'round': 497, 'task': 'current-task.md', 'decision': 'D-29z1779', 'type': 'DPG-BUTTON-CLEANUP stage 1 completion (test-only addendum + full C table)', 'status': 'dispatched', 'note': 'baseline 3bcf8cb + round-496 worktree; addendum b-round-496/addendum-497.patch.txt'})
b['current_task'] = 'Round 497: DPG-BUTTON-CLEANUP stage 1 completion: A applies the test-only addendum b-round-496/addendum-497.patch.txt (GS3 all-CSS scan, BC1b 288-combo HEAD pin, BC3/BC4 strengthening) and updates doc 319; C runs the full C0-C15 table in the browser (current-task.md)'
p.write_text(json.dumps(b, ensure_ascii=False, indent=2)); M.write_text('done'); print('v', b['version'])
