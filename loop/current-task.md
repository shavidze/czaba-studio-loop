# Round 263: gate-262 fix-up (test-only). `track-layout.test.tsx` pins the footer's last row to 2 children; with Master there it has 3

**Planned by:** B, at the round 262 → 263 planning, 2026-10-30. **Decisions:** D-29z539 (round 262 = C PASS, gate failed), D-29z540 (this round), D-29z541 (C-R262-01), D-29z542 (A's notes), D-29z543 (lesson L23), D-29z544 (docs), D-29z545 (C's notes).
- **Read first:** `lessons.md` in full. These apply directly: L4 (no assertion lost; equal or stronger replacements allowed), L11 (STOP), L12 (selectors by testid or role), L23 (now with the "Moved element → grep the destination too" clause), L29 (claims, §7).
- **Previous task:** `tasks/round-262.md` (an exact copy of the round-262 `current-task.md`). C's result: `c-round-262.json` (PASS, 17 rows). The gate's result: `gates/gate-round-262.json` = **failed**, `gates/round-262/verify.log`. B's reasoning: `b-round-262.md`.
- **Reference-first:** not in scope. This is a test-only round, and no behaviour changes.

## Baseline: HEAD `10e1cd4` plus the unpublished round-262 diff
- `gates/gate-round-262.json`: `failed`, head `10e1cd4f7df96bb0f9bd4c2f6ab293ee2e805839`. Nothing was published. `git rev-parse HEAD` = `10e1cd4…` (`b-round-262/head-at-planning.txt`) [K1].
- **The working tree holds round 262's C-verified work:** 9 ` M` plus doc 196 `??` (`b-round-262/git-status-at-planning.txt`) [K1]. Keep all of it exactly as it is. This round adds one test edit on top, and the gate then publishes rounds 262 and 263 together.
- **Frozen:** every tracked file plus doc 196, except the one grant: **1,120** entries in `b-round-262-r263-tree-sha256.txt`. This freezes the 9 round-262 files at their C-verified bytes. From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-262-r263-tree-sha256.txt` returns rc 0 at planning. Each of the 7 protected auth and purchase files appears in it exactly once [K2].
- **Grant (edit):** `b-round-262-r263-grants.txt`. It has one entry: `app/lib/arrangement/__tests__/track-layout.test.tsx`, and only the two assertions in §2.
- **New files:** none (`b-round-262-r263-new-files.txt` is empty).
- **Not granted:** everything else. That includes the 9 round-262 files, doc 196, doc 193, doc 195 (its stale count is a deferred Low, D-29z542), `shortcut-sheet-ui.test.tsx`, `e2e/**`, `perf/**`, `package.json`, `.claude/**`, `CLAUDE.md` and the 7 protected files.

## 0. Why this round
- Round 262 (SABA-B-9 stage 2: Master to the footer's last row, directly before `Shortcuts ?`) passed C: 17 rows, with `browserVerified` and `realVerified` true.
- The root gate then failed. `npm run verify` stopped in `test:run`, so the build and e2e smoke never ran. The failure:
  - test: `track-layout.test.tsx` > "panel polish 14a" > "reserves the selected-clip row with an aria-hidden placeholder and renders the real line as one truncated full-width row (C-R11-02, C-R15-02)";
  - l.867 `expect(row.children).toHaveLength(2)` received 3 [K3].
- The test asserts that the footer's last row has exactly [reserve or line, `Shortcuts ?`]. Round 262 put the Master group between them, which is the approved and C-verified layout. The test's old structural fact is stale; the product is right.
- The same row repeats the assert at l.873, after `selectClip('music-1')` [K3]. The full gate run had no other failure: 1 failed / 3,163 passed.
- **Open Critical/High:** none. The regression round is not due: `regression-last.json` gives round 258, 2026-10-30, so the next one is due on or after 2026-11-02.

## Why we missed it (B's pre-check; not a Saba issue, recorded for RETRO 275)
- **Which phase should have caught it:** B's L23 pre-check at the round-262 planning.
- **Why not:** it grepped only the moved element's tokens (`arrangement-master|'Master'|Master Volume|…`). It did not grep the destination row's existing children (`arrangement-selected-clip-reserve`, `footerButtonLabel`). `track-layout.test.tsx` pins that row by those, so it was never run. A ran B's 23-file list, and C does not run the full suite (speed rules), so only the gate saw it.
- **The rule:** L23 now has the clause "Moved element → grep the destination too" (D-29z543). B applied it in this planning: `grep -rln "arrangement-selected-clip-reserve\|footerButtonLabel" app perf e2e` gives 4 test files, which are the run list in §3 [K4]. Retro candidate RC-R262-DEST-CONTAINER-GREP. C row LESSON checks it.

## 1. Measured facts (B's scratch pre-check)
- **Scratch:** `/home/runner/czaba-project/tmp/b262-scratch`, a copy of the current working tree (tracked files plus doc 196, with `node_modules` symlinked), and the §2 sketch applied (`b-round-262/sketch-track-layout.diff`).
- **Targeted tests:** `npx vitest run` on `track-layout`, `shortcut-sheet-ui`, `master-ui` and `meter-ui` gave **4/4 files, 81/81 tests** (`b-round-262/precheck-vitest.txt`).
- **Mutant** (the `<ArrangementMaster />` line removed from the footer of `StudioWorkspace.tsx`): `track-layout` → 1 failed / 35 passed, and the failure is the amended row (`b-round-262/precheck-mutant-no-master-in-footer.txt`).
- **Typecheck and lint:** `npx tsc --noEmit` rc 0 (`precheck-tsc.txt`); `npx biome check` on the file: clean (`precheck-biome.txt`).
- **Headroom (L31):** in the gate-262 `verify.log`, `track-layout.test.tsx` took 10.4 s for 36 tests. The changed row's describe block has a `{ timeout: 15_000 }` per-test limit, and the edit adds only synchronous asserts.

## 2. A: what to change
Edit only `app/lib/arrangement/__tests__/track-layout.test.tsx`, in the one test named in §0. The rule: **no assertion lost; equal or stronger replacements allowed** (L4).
1. **l.867** (empty state, after `expect(shortcutButton.parentElement).toBe(row);`): replace `expect(row.children).toHaveLength(2);` with:
   - `expect(row.children).toHaveLength(3);`
   - `expect(row.children[0]).toBe(placeholder);`
   - `expect(row.children[1]?.getAttribute('data-testid')).toBe('arrangement-master');`
   - `expect(row.children[2]).toBe(shortcutButton);`
2. **l.873** (after `selectClip('music-1')` and `expect(selected?.parentElement).toBe(row);`): replace `expect(row.children).toHaveLength(2);` with the same 4 asserts, using `selected` instead of `placeholder` as `children[0]`.
3. **Change nothing else:** not the test name, not the other asserts, and not any other test in the file. The name still describes the reserve and the line, which stay true. B's sketch is `b-round-262/sketch-track-layout.diff`. It is for reading only: it was made with `git diff --no-index` and carries absolute paths, so `git apply` will not take it. Make the §2.1/§2.2 edits by hand.
4. **Checks A runs** (speed rules):
   - `npm run typecheck` and `npm run lint`;
   - `npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx`;
   - `npx biome check` on the edited file;
   - no full suite, `npm run verify`, `test:perf` or code-reviewer. This is one test file with no app code, below the 3-file reviewer rule.
5. **STOP conditions** (L11, at the top of `a-round-263.md`):
   - any of the 4 files is red after the edit;
   - the edit needs any other file;
   - `sha256sum -c` of the frozen list is not rc 0 before or after the edit.
6. **Docs:** none. Doc 196 and doc 193 l.4 stay `Completed (C round 262 PASS)` (D-29z544). That is true, because rounds 262 and 263 publish together. No implementation doc is needed for a test-assertion update.
7. **Report:** `a-round-263.md` lists the diff hunks (old → new), the command results, and the `sha256sum -c` result before and after.

## 3. C: what to verify
C writes `c-round-263.md` and `c-round-263.json` as it goes. "Both viewports" means 1440×900 and 1280×720, in a fresh anonymous context on `/studio-lab`, after `Demo collection ready`.

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | From `store/`:<ul><li>`sha256sum -c --quiet ../tmp/studio-real-loop/b-round-262-r263-tree-sha256.txt` → rc 0;</li><li>`git status --short --untracked-files=all` lists the round-262 set (9 ` M` + doc 196 `??`) plus ` M` `track-layout.test.tsx`, and nothing else;</li><li>HEAD is `10e1cd4`.</li></ul> | Only the grant changed on top of round 262. | Any other change. |
| **NO-ASSERTION-LOST** | `git diff -U0 app/lib/arrangement/__tests__/track-layout.test.tsx`. | Exactly 2 hunks. Each removes one `toHaveLength(2)` line and adds the 4 lines of §2. No other line is removed. | Any other removed line, or a weaker replacement. |
| **TESTS-TARGETED** | `npx vitest run` on the 4 files of §2.4. | 4/4 files green. | Red. |
| **MUTANTS** (scratch copy outside `store/`) | <ol><li>Control: unchanged copy, `track-layout` green.</li><li>M1: remove `<ArrangementMaster />` from the footer of `StudioWorkspace.tsx`.</li><li>M2: move it to after the `Shortcuts ?` button.</li></ol> | Control green; M1 and M2 each red at the amended row. | A mutant stays green. |
| **PLACE-1440 / PLACE-1280** (browser, short re-check; the app code is unchanged since C round 262) | <ul><li>The sha256 of the 5 app/perf files equals C's `c-round-262/perf-run-1.start` record.</li><li>Re-measure with C's `c-round-262/layout.mjs`, or an equivalent: the Master group, `footer`, `header`, `Shortcuts ?` and the scroller, in the empty state and with a clip selected.</li></ul> | <ul><li>The hashes are equal.</li><li>Master is inside `footer` and directly before `Shortcuts ?`.</li><li>The values equal `c-round-262/after.json` (±0.5): footer 53, header 35, Master x 911.75 / 751.75, `Shortcuts ?` x 1352 / 1192, scroller 512 / 402.</li><li>0 overlaps.</li></ul> | A hash differs, or any value is out of bound. |
| **G263-AUTH** (browser; re-run `c-round-262/g262-auth.cjs` or an equivalent) | Fresh anonymous context at 1440×900: <ul><li>`/studio-lab` shows the workspace and the demo badge, and `auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required" and 0 `audio[src]`;</li><li>`/api/studio-token` with no header.</li></ul> | 401, and no token is issued. | Any bypass (Critical). |
| **LESSON** | From the loop root: `grep -c "Moved element → grep the destination too" lessons.md`. | `1` | `0` |

- **Gate rows:** full vitest (it must include the l.867 test), build, Biome, `npm run verify` and e2e smoke. List them under `"gate"`, never in `"passed"`.
- **`browserVerified`** is true only if PLACE-1440, PLACE-1280 and G263-AUTH ran in the browser.
- **Not re-run, on purpose:** AUDIO, KEYS, TAB-ORDER, STATES, NARROW, SCREEN-BUDGET and PERF-RUN. No app or perf byte changes (the SOURCE-SCOPE and hash rows prove it), and C round 262 holds that evidence.

## 4. Outcome, fixed in advance
| Result | B at the round-264 planning |
|---|---|
| C PASS and gate 263 `published` | SABA-B-9 → **მზადაა** (rounds 262 and 263); SABA-Q-9-MASTER-ROW stays with Saba (`awaiting_user`). Round 264 = **L46-CONTRACT-CHECKS** if planned before 2026-11-02, otherwise **REGRESSION**. Then SABA-B-11c (the `ableton-arrangement-expert` consult on the off-grid offset first), then SYS-6. |
| C PASS, gate fails on any other step (test, build, Biome, e2e smoke; the build and e2e smoke never ran on the round-262 diff) | A bounded fix-up for that step, with the L23 destination grep re-applied for a test failure. |
| A row fails | A bounded fix-up with the same grant. |
| G263-AUTH bypass | Stop. Critical first. |
| SOURCE-SCOPE fails | Stop. Root inspects. |

## 5. Neighbour risk
- None in the product, because no app byte changes.
- In the tests, `shortcut-sheet-ui.test.tsx` uses the same footer button but makes no children-count assert (B's grep). It stays in the run list as a guard.

## 6. Deliverables and root notes
- **A:** the one granted file and `a-round-263.md`.
- **C:** `c-round-263.md` and `c-round-263.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`), with evidence under `c-round-263/`.
- **Root:** commit-ready on C PASS. The commit covers rounds 262 and 263 (the 9 round-262 files, doc 196 and `track-layout.test.tsx`). This completes SABA-B-9 once the gate is green.

## 7. Claims (L29 form; C re-runs each verbatim)
`\|` inside a command is the markdown table escape; run it with `|`.

| Tag | Claim | Command (from `store/` unless stated) | Expected |
|---|---|---|---|
| K1 | gate 262 failed; HEAD and the tree at planning | from the loop root: `python3 -I -c "import json;g=json.load(open('gates/gate-round-262.json'));print(g['status'],g['head'])"; cat b-round-262/head-at-planning.txt; wc -l < b-round-262/git-status-at-planning.txt` | `failed 10e1cd4f7df96bb0f9bd4c2f6ab293ee2e805839`; the same hash; `10` |
| K2 | 1,120 frozen entries; each protected file once | from the loop root: `wc -l < b-round-262-r263-tree-sha256.txt; for f in 'app/routes/studio.$productId.tsx' app/routes/api.studio-token.ts app/routes/account.downloads.tsx app/lib/__tests__/download-routes.test.ts app/lib/auth.ts app/contexts/AuthContext.tsx app/entry.server.tsx; do grep -cF "  $f" b-round-262-r263-tree-sha256.txt; done \| tr '\n' ' '` | `1120`; `1 1 1 1 1 1 1` |
| K3 | the two stale asserts | `grep -n "row.children).toHaveLength(2)" app/lib/arrangement/__tests__/track-layout.test.tsx` (on the start tree) | 2 lines: l.867, l.873 |
| K4 | the destination-children grep | `grep -rln "arrangement-selected-clip-reserve\|footerButtonLabel" app perf e2e` | `StudioWorkspace.tsx`, `strings.ts`, and 4 tests: `meter-ui`, `shortcut-sheet-ui`, `track-layout`, `master-ui` |
| K5 | the gate failure | from the loop root: `grep -c "track-layout.test.tsx:.*867:28" gates/round-262/verify.log; grep -E "Tests .*failed" gates/round-262/verify.log` | `2`; `1 failed \| 3163 passed (3164)` once the ANSI colour codes are stripped |
