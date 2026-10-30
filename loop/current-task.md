# Round 277: GATE276 test-only fix-up. Three stale assertions in two test files still pin native `disabled` and the old Split title, so the round-276 gate failed. A updates them to the round-276 contract (equal or stronger), and doc 206 records the fix. No app code changes.

**Planned by:** B, at the round 276 → 277 planning, 2026-10-30. **Decisions:**
- D-29z618: round 277 = GATE276 fix-up (test-only, round-263 shape). SYS-5 stage 2 moves to round 278.
- D-29z619: C-R276-01 (cursor) is ruled in favour of option (b), `aria-disabled:cursor-not-allowed!`, and built in SYS-5 stage 2 (round 278), not here.
- D-29z620: C-R276-02 is ruled **keep**. A click on an unavailable button does not blur or commit a focused text field.
- D-29z621: A-R276-REVIEW-DELETE-NAME goes into stage 2. A's guard-in-helper Architecture note goes to `architecture_signals` and is ruled at the stage-2 planning.
- D-29z622: L23 is amended (sweep forms).
- D-29z623: the outcome table of §9.

**Owner:** A (one implementer). **Verifier:** C. **Grants:** §4 and `b-round-276-r277-grants.txt`. **Frozen list:** `b-round-276-r277-tree-sha256.txt` (1136 files: every tracked file except the two granted tests, taken over the current working tree).

## Baseline: HEAD `a4c0e24` + A's round-276 working tree (unpublished; keep it)
`gates/gate-round-276.json` is `failed`: `verify exit 1`, head `a4c0e24`. Nothing was published, so the round-276 change is still uncommitted. It is 9 modified tracked files plus the untracked `docs/implementation/2026/quarter-IV/206-sys-5-disabled-reasons-stage-1.md` (`b-round-276/git-status-at-planning.txt`). **Do not revert, re-stage or rewrite any of it.** The frozen manifest pins those files at their current, C-verified content.

The planning copies of the three granted files are in `b-round-276/planning-copies/`.

## 0. Read first
`lessons.md` (L4, L11, L12, L23, L52), this task, and `gates/round-276/verify.log` around the three `FAIL` blocks. Ignore older task text that conflicts with this one.

## 1. What failed, and why (evidence: `gates/round-276/verify.log`)
The gate's full vitest run shows `Test Files 2 failed | 218 passed (220)` and `Tests 3 failed | 3291 passed (3294)` [K6]. Lint had warnings only, and typecheck passed (both steps ran before vitest). The `useArrangement… must be used within an ArrangementProvider` lines come from the intended throws in `context-hygiene.test.tsx`, which passes.

| Test | Stale line | Why it is stale after round 276 |
|---|---|---|
| NS1, `navigation-strings-ui.test.tsx` | l.222 expects Split's title `Split at the insert marker (Ctrl+E)` with no clip selected and no range [K1] | Round 276 §1 gives an unavailable Split the reason title `Split — select a clip or make a time selection first (Ctrl+E)` [K5]. The old literal is now only the title when a clip is selected |
| NS6, same file | l.429 `expect(button.hasAttribute('disabled')).toBe(disabled)` for Loop [K2] | Loop is never natively disabled now. Unavailable means `aria-disabled="true"`, and available means the attribute is absent [K4] |
| TC9, `transport-centre-ui.test.tsx` | l.404 `expect(undo).toHaveProperty('disabled', true)` after the undo [K3] | Same contract. The Undo → Redo handoff (the next line, `activeElement === redo`) still passes |

### Why we missed it (gate-found; root-cause record)
- **Phase that should have caught it:** B's spec, through the L23 "cannot pre-apply" sweep.
  - Round 276's `[SW1]` regex lacked the `hasAttribute('disabled')` and `toHaveProperty('disabled'` forms.
  - Its second filter keyed on helper identifiers (`undoButton`, `mountTransport`, …), not on the buttons' accessible names.
  - Its title check `[K7]` looked only in `strings.test.ts`, not for the old title literals across the tests.
  - The broader round-229 list `b-round-229/sys5-disabled-grep.txt` did contain `navigation-strings-ui.test.tsx`, and the narrower filter dropped it.
- **Why A did not catch it:** A ran exactly the 20 files of round-276 §6.3, as the speed rules say. The other two files were not in that list.
- **Rule added:** L23 now says an attribute or state-contract change greps every assertion form and filters by accessible name and old literal (D-29z622). Evidence id GATE276-T1.

## 2. The change (B pre-applied it on a scratch copy; L23)
B applied exactly this diff on a scratch copy of the current tree (`b-round-276/sketch.diff`):
- the two files: 18/18 tests pass (`b-round-276/sketch-vitest.log`);
- Biome is clean on both (`sketch-biome.log`);
- mutant N1 turns NS1, NS6 and TC9 red (`mutant-N1.log`), and N2 turns NS1 red (`mutant-N2.log`).

A applies the same change. Formatting may differ only where Biome demands it.

- **NS1 (l.222):** replace the one line with four assertions. Each is equal to or stronger than the old one (L4: the old literal is kept, now in the state where it is true):
  1. no clip selected: Split's title is `'Split — select a clip or make a time selection first (Ctrl+E)'` (a literal, not the string constant, so a wording change is caught);
  2. no clip selected: Split's `aria-disabled` is `'true'`;
  3. right after the existing `act(() => live(api).selectClip('music-1'));`: the title is `'Split at the insert marker (Ctrl+E)'`;
  4. clip selected: `hasAttribute('aria-disabled')` is `false`.

  The rest of NS1 is unchanged.
- **NS6 `expectLoopState` (l.429):** replace the line with two assertions:
  1. `button.hasAttribute('disabled')` is `false` in both states;
  2. `button.getAttribute('aria-disabled')` is `disabled ? 'true' : null`.

  The helper's parameter name and its three call sites stay unchanged.
- **TC9 (l.404):** replace the line with two assertions:
  1. `undo.getAttribute('aria-disabled')` is `'true'`;
  2. `expect(undo).toHaveProperty('disabled', false)`.

  The `activeElement === redo` line stays.
- **Doc 206** (the implementation-docs rule; the file stays untracked and new):
  - l.4 becomes, byte-exact: `**სტატუსი:** In Progress (stage 1 of 2; C round 276 PASS; gate 276 test fix-up round 277)`;
  - add one bullet in Problem → Solution form under `## პრობლემები და გადაწყვეტები`. It says, in Georgian: gate 276 failed on NS1, NS6 and TC9 (`navigation-strings-ui`, `transport-centre-ui`), which still pinned native `disabled` and the old Split title; round 277 moved the assertions to `aria-disabled` and the new title, with no lost assertion;
  - add one line under `## ტესტირება` that names NS1, NS6 and TC9 and the two files.

  Change nothing else in the doc.

Nothing in `app/components/**`, `app/lib/arrangement/strings.ts`, the CSS files or any other test changes.

## 3. Sweep (L23 amended form; C re-runs it)
- **[SW-A]** (every assertion form, filtered by the seven buttons' accessible names and test accessors): 14 files. `b-round-276/sweep2-disabled-reads.txt` has the raw reads. B checked each one:
  - **in grant:** NS6 l.429 and TC9 l.404;
  - **already converted in round 276:** `self-disabling-focus`;
  - **non-transport controls, unchanged:** every other read targets a Reset, field, fader, Stop or Export control (`pending-status`, `fader-click`, `clip-gain*`, `track-pan`, `video-fades-ui`, `fader-guards`, `master-ui`, `status-announcement-ui`, `transport-centre-ui` l.322 Stop).
- **[SW-B]** (the old unavailable-state title literals): 6 hits at the start. On A's tree it is still 6: NS1 keeps the Split literal in the clip-selected state, so the two `navigation-strings-ui` hits move to l.227 and l.229 (B checked this on the sketch). Each start hit is in grant or unchanged:
  - **in grant:** `navigation-strings-ui` l.222;
  - **available state, unchanged:** `navigation-strings-ui` l.224 (a clip is selected), `delete-selection-ui` l.531 (after `selectClip`);
  - **units of the strings themselves, unchanged:** `shortcuts.test.ts` l.167 and `strings.test.ts` l.412/l.418.
- **Authoritative enumeration:** the gate's full run on this exact tree, with 3 failures in 2 files [K6].

A hit A finds outside this list that fails is a **STOP** (§8), not an edit.

## 4. Grants (exact; also in `b-round-276-r277-grants.txt`)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | NS1 l.222 and NS6 l.429 only, as in §2 |
| `app/lib/arrangement/__tests__/transport-centre-ui.test.tsx` | TC9 l.404 only, as in §2 |
| `docs/implementation/2026/quarter-IV/206-sys-5-disabled-reasons-stage-1.md` | l.4 and the two additions of §2 |

Everything else is frozen. `sha256sum -c b-round-276-r277-tree-sha256.txt` must give rc 0 at hand-over. Protected auth files (`app/routes/studio.$productId.tsx`, `app/lib/auth.ts`, `AuthContext`, the studio-token route) are untouched, as always.

## 5. What A runs (speed rules; no full suite)
1. `npx vitest run app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx app/lib/arrangement/__tests__/transport-centre-ui.test.tsx app/lib/arrangement/__tests__/self-disabling-focus.test.tsx`: all pass.
2. `npm run typecheck` and `npm run lint`: rc 0. Run `npx biome check` on the two test files: clean.
3. Mutants, each on a scratch copy; restore and verify the sha afterwards:
   - **N1:** `softDisabledButtonProps` drops `'aria-disabled': 'true'` (`ArrangementTransport.tsx` l.66 [K4]). Expected red: NS1, NS6, TC9.
   - **N2:** the no-target Split title branch returns `splitAtInsertMarkerTitle` (l.216 [K5]). Expected red: NS1.

   Report red and green per row.
4. `sha256sum -c b-round-276-r277-tree-sha256.txt` rc 0. `git status --short` gives 12 lines: the 9 round-276 `M` paths, the 2 granted tests (`M`) and doc 206 (untracked). Only the three §4 files differ from `b-round-276/grant-files-sha256-at-planning.txt`.
5. Code-reviewer: not required (fewer than 3 changed files), but allowed.

## 6. C rows (`c-round-277.json`; Chromium at 1440×900 and 1280×720 on `/studio-lab`, fresh anonymous contexts; wait for `Demo collection ready`)
| Row | Check | PASS when |
|---|---|---|
| SOURCE-SCOPE | manifest and grant-file shas | `sha256sum -c b-round-276-r277-tree-sha256.txt` rc 0; `git status --short` gives 12 lines (9 round-276 `M` + 2 granted tests `M` + doc 206 untracked); only the three §4 files differ from `b-round-276/grant-files-sha256-at-planning.txt` |
| HUNK-SCOPE | `diff -u b-round-276/planning-copies/<file> <file>` for the three files | the hunks match §2 (formatting aside); doc 206 differs only at l.4 plus the two additions; l.4 is byte-exact |
| TEST-CHANGES | each removed assertion | it has an equal or stronger replacement (L4); no assertion lost; NS1 still asserts the old literal in the clip-selected state |
| CLAIMS | `bash b-round-276/claims.sh` from `store/` on a scratch copy of A's tree with the three files put back from `b-round-276/planning-copies/` | output equals `b-round-276/claims-output.txt` |
| SWEEP | re-run [SW-A] and [SW-B] on A's tree | SW-A: 14 files. SW-B: 6 hits; the two `navigation-strings-ui` hits move down to l.227 (the Split literal, now in the clip-selected state) and l.229 (Delete); the other 4 are byte-identical. After the edit NS6's read is at l.434 |
| TESTS-TARGETED | the three files of §5.1 | all pass |
| MUTANTS | re-run N1 and N2 | N1 → NS1, NS6, TC9 red; N2 → NS1 red; file restored |
| B-MATCH-SPLIT | browser, empty demo | Split: `aria-disabled="true"`, no `disabled` attribute, the title is the no-target literal. After a click on a clip: no `aria-disabled`, and the title is `Split at the insert marker (Ctrl+E)` |
| B-MATCH-LOOP | browser | no range: Loop has `aria-disabled="true"`, no `disabled`, title `Loop: make a time selection first (Ctrl+L)`. After an empty-lane drag time selection: no `aria-disabled`. Press Ctrl+L, then clear the selection with a click on an empty lane area (not Escape, which does not clear a time selection here; C-N229-S3-METHOD): no `aria-disabled` and the toggle title. NS6 in jsdom uses `setTimeRange(null)` instead |
| B-MATCH-UNDO | browser | make a loop edit; Tab to Undo; Enter → Undo has `aria-disabled="true"`, no `disabled`, and `document.activeElement` is Redo with a visible ring |
| STUDIO-SMOKE-277 | the round-276 smoke (play/stop, the playhead moves, live RMS > 0.001, export WAV) | export sha256 equals round 276's `1fea093b…` (no app code changed) |
| G277-AUTH | fresh context | `/studio-lab` opens anonymously with the "Demo collection — no sign-in required" badge; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token…` with no header → 401 |
| DOC-206 | the doc | l.4 is byte-exact; the 7 TEMPLATE headings are in order; the new bullet names NS1, NS6 and TC9 |
| gate | full vitest, typecheck, build, Biome, `npm run verify`, `test:e2e:smoke` | **gate** rows: not claimed in `passed` |

The B-MATCH rows prove that the new assertions describe the real browser, not just jsdom. A failure there is a FAIL of the assertion, not a reason to weaken it.

## 7. Claims (L29). Run `bash b-round-276/claims.sh` from `store/` on the start tree
| Tag | What | Expected (`b-round-276/claims-output.txt`) |
|---|---|---|
| K1 | the NS1 Split literal | `navigation-strings-ui` l.222 |
| K2 | the NS6 `hasAttribute('disabled')` read | l.429 |
| K3 | the TC9 `toHaveProperty('disabled', true)` | `transport-centre-ui` l.404 |
| K4 | the helper sets `aria-disabled` | `ArrangementTransport.tsx` l.66 |
| K5 | the no-target Split title | `ArrangementTransport.tsx` l.216; `strings.ts` l.147 |
| K6 | the gate's vitest totals | `grep -c ×` = 5 lines that contain ×, which is not the failure count; the totals lines are 2 failed / 218 passed files and 3 failed / 3291 passed tests |
| SW-A | the assertion-form sweep | 14 files |
| SW-B | the old title literals | 6 hits (listed in §3) |

## 8. STOP conditions (L11)
- Any other line in NS1, NS6 or TC9 fails after the §2 change.
- Any failure in a file outside §4.
- A need to touch app code, `strings.ts`, CSS or a frozen test.

On any of these, write the STOP with its evidence in `a-round-277.md` and do not edit outside the grants.

## 9. Outcome, fixed in advance (D-29z623)
- **C PASS → gate.**
  - If the gate publishes, SYS-5 stage 1 becomes **მზადაა**, and round 278 = SYS-5 stage 2. Stage 2 contains the metronome toggle, the library Add button, the helper moved to a shared file, the C-R276-01 token `aria-disabled:cursor-not-allowed!` with C's cursor row, the A-R276-REVIEW-DELETE-NAME fix, and the C-R276-02 "keep" row.
  - If the date is on or after 2026-11-02, REGRESSION goes first.
- **C FAIL on a test, sweep or B-MATCH row** → a re-fix of only that row.
- **Gate fails again** → one more bounded fix-up, with its cause recorded.

## 10. Deliverables
- **A:** the §2 edits and `a-round-277.md`, which holds the changed hunks, the commands with their results, and the N1/N2 table.
- **C:** `c-round-277.md` and `c-round-277.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`), with evidence under `c-round-277/`.

## 11. Root notes
- No dependency change and no root request. The architecture checkpoint addenda (`b-round-274-checkpoint-addendum.md` and earlier) stand and are non-blocking.
- After C PASS, round 276 + 277 together are ready for the gate as SYS-5 stage 1. That is not a release.
