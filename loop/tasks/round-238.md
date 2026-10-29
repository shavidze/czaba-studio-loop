# Round 238: SABA-B-11a-FIX-3 — a gesture refusal no longer restores a stale loading text, and a seed appended onto a refusal keeps only the seed (fix-up of round 237)

**Planned by:** B, at the round 237 → 238 planning, 2026-10-29. **Decisions:** D-29z346…D-29z351.

**Type:** fix-up round on the same code path, two tightly related bugs (L10 ruling on A's STOP and C's FAIL). Round 237 is **not** published (gate 237 `skipped`, C FAIL); its tree is kept and is this round's start. When C passes this round, the gate publishes rounds 237 + 238 together.

| Id | Severity | Origin | One line |
|---|---|---|---|
| **C-R237-01** (= A-R237-REVIEW-M1) | Medium, regression caused by round 237 | A's code-reviewer; reproduced by A and independently by C in Chromium at both viewports | A gesture refusal (`Undo/Redo does not work while dragging — let go first.`) that is on screen when loading settles is replaced on release by the stale `Loading the demo collection…`, which then stays. HEAD `ecaf0e4` ends on the ready text. |
| **A-R237-REVIEW-L1** | Low (fixed now: same class, same function, the round owns the code; D-29z348) | A's code-reviewer; **reproduced by B at the API level** on the round-237 tree (§0.2) | A seed appended onto a showing refusal (`Editing does not work while dragging — let go first. Tempo 90 BPM … Snap on — grid 1/4 (G)`) is no longer recognised as a refusal, so the release leaves the whole combined text. |

**Read first:** `lessons.md` in full. Directly relevant: L10 (this ruling), L11/L32/L33 (STOP), L23 (B's pre-check, §0.2), L26/L28 (doc 185), L29 (recipes B ran in Chromium, §0.3), L31 (timeouts), L12 and L40 (no class selectors; no testid changes).

**Not this round:**
- The rest of the round-237 tree (7 code/test files, docs 182/183, `tempo-seed-search-ui.test.tsx`) is **frozen at its round-237 hashes**. It passed C's round-237 rows; it is not reworked.
- Reviewer L2 (the failed > 0 path drops placement + seed; deliberate, D-29z339) and L3 (TU11 reaches the empty status only through a direct `setStatus('')`): notes, not tasks (D-29z349).
- The reviewer's Architecture note (structured status parts instead of a text-prefix contract): signal `A-R237-ARCH-STATUS-PARTS` and addendum 3 to `b-round-234-checkpoint-request.md` (D-29z349). Not scheduled.
- C-R236-01, the gate-236 Lows, SABA-B-11b, SABA-B-10a, SABA-B-7 (`awaiting_user`), and the purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 `deferred_user`).

## 0. Baseline and scope

**Start state (this is not a clean tree; do not STOP on it):**
- HEAD = `ecaf0e4bd9c99081c2db7a4cd97497562d00193d` (gate 236 `published`; gate 237 `skipped`, so HEAD did not move).
- `git status --short --untracked-files=all` lists **exactly the 11 paths** of `b-round-237/git-status-at-planning.txt` (9 `M` + 2 `??`, the round-237 work), and each has the sha256 in `b-round-237-r238-start-sha256.txt` (`sha256sum -c --quiet` from `store/` gives rc 0).
- **STOP (L11)** if HEAD differs, if any other path is dirty, or if any of the 11 has a different hash. One exception: a root commit that touches only the 4 root files; then re-hash those and continue.

**Frozen:** `b-round-237-r238-tree-sha256.txt`, **1,098** files = the 1,090 HEAD files of round 237 (`b-round-236-r237-tree-sha256.txt`) + the 8 round-237 paths that are not re-granted, at their round-237 hashes:
`StudioWorkspace.tsx`, `collection.ts`, `tempo-seed.ts`, `collection.test.ts`, `tempo-seed.test.ts`, `tempo-seed-search-ui.test.tsx`, docs 182 and 183. `sha256sum -c --quiet` gives rc 0 at planning.
- It includes every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`; also `.claude/**`, `CLAUDE.md`, every config file, `status-announcement.ts`, `strings.ts`, and every test except grant 2.

**Root-owned, must equal HEAD:** `b-round-237-r238-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`); start hashes `b-round-237-r238-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-237-r238-grants.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/contexts/ArrangementContext.tsx` | §2.1 only: <ul><li>two non-exported module functions `gestureRefusalPrefix` and `statusAfterGestureRelease`, placed right after `NUDGE_AT_TIME_START_MESSAGE`;</li><li>the `lastNonRefusalStatusRef` layout effect's condition;</li><li>the `beginPointerGesture` release updater;</li><li>one statement in the load effect's `settle`, after `const failedCount = failed;`.</li></ul> Nothing else. The exported `GESTURE_*` constants and every round-237 hunk stay as they are. |
| 2 | `app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx` | §2.2: the `~/contexts/ArrangementContext` import gains `GESTURE_EDIT_BLOCKED_MESSAGE` and `GESTURE_UNDO_BLOCKED_MESSAGE`; a helper `failingDeferredSeedCollection` and a new `describe` with TU12–TU15 are **appended at the end**. **0 removed lines** against the start hash; TU1–TU11 and every line above them stay byte-identical. |
| 3 | `docs/implementation/2026/quarter-IV/185-saba-b-11a-seed-status-fix.md` | §2.3. The whole file is granted (it was created in round 237 and has never been published). l.4 becomes exactly `**სტატუსი:** Completed (C round 238 PASS)` (explicit grant; C asked for it). The L26 heading order stays. |

No new files. Read before editing: `REACT_CONTEXT.md` (context status), `AUDIO_ARCHITECTURE.md` (the provider's load path), `AGENT_DISCOVERABLE_CODE.md` (two new function names), `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (rows), `GEORGIAN_DOCS.md` (doc 185).

### 0.2 B's pre-check (L23, done)
B copied the **round-237 working tree** (not HEAD) to `/tmp/b237-scratch`, outside the repo and the loop folder, with `node_modules` symlinked. The full code + test change is `b-round-237/precheck-scratch.diff` (194 lines). `git apply --check -p1` on the current store tree gives rc 0. **A may apply it as is**, then write doc 185.
- **L1 reproduced first** (on the round-237 tree plus the C-R237-01 line only): `beginPointerGesture()` → `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` → `commitArrangement(+ stem-90 clip)` → release. Status during and after the release: `Editing does not work while dragging — let go first. Tempo 90 BPM from “Slow stem” — bars ruler on. Grid only: audio is not stretched. Snap on — grid 1/4 (G)`. The UI path is not shown: every gesture that creates a seeding clip found by B (lane move, `ArrangementClip.tsx` l.750–764) writes its own string status at commit, which replaces the refusal first. So L1 is real at the API level and unproven in the UI. It is fixed now because the fix is the same release function (D-29z348).
- **Static checks:** `npx tsc --noEmit` rc 0; `npx biome check` on both files clean, no fixes.
- **Covering set:** `b-round-237/covering-files.txt`, **121 files** = round 237's 121 ∪ the 31 test files that mention a refusal message, `beginPointerGesture` or `claimPointerGesture` (`b-round-237/refusal-files.txt`; all 31 were already in the set). **121 files, 1,719 tests green**, 129 s (`b-round-237/precheck-covering-final.log`). No red row, so no frozen test needs a grant.
- **Mutants** (applied one at a time on the scratch copy, then restored; logs in `b-round-237/`):
  - **MU-RF** (drop the `settle` ref statement, i.e. the round-237 tree) → **TU12 and TU13 red**, TU14 green (TU14 pins "failure wins over a refusal", which holds either way).
  - **MU-L1-REL** (restore the exact-equality release updater) → **TU15 red** (`mutant-MU-L1-REL.log`).
  - **MU-L1-EFF** (restore the exact-equality layout-effect condition) → **TU15 red** (`mutant-MU-L1-EFF.log`).
- **Keep these true:** do not change `status-announcement.ts`, the reducer's duplicate guard, any `setStatus(GESTURE_*)` caller, or any round-237 hunk.

### 0.3 Recipes, signals, timeouts (L29, L31)
- **Recipe (C's, `c-round-237/race.cjs <base> <out.json> refusal`):** fresh context; `page.route` delays `**/middle-east.mp3` and `**/hero-music.mp3` by 6,000 ms then `route.continue()`; while the status still reads `Loading the demo collection…`, press on the first `Volume — …` slider, move 4 px, press Ctrl+Z (status = the undo refusal); hold until the `demo-hero-music` row shows `02:30.372`, wait 1.5 s, release, wait 3 s.
- **Validity:** valid only if the status before the press is still the loading text **and** the hero row showed its decoded duration before the release. Otherwise keep it as evidence and repeat with the delay raised to 10,000 ms; at most 2 extra attempts. No valid attempt left → FAIL-unverified, not PASS.
- **B ran it on the scratch build (`:5174`) at both viewports** (`b-round-237/probe/race-scratch.json`), modes refusal, delay, fail; all attempts valid, 0 page errors:
  - refusal → final `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.` (the round-237 tree gave `Loading the demo collection…`: `c-round-237/race-after.json`);
  - delay → exactly the placement + seed + `Snap on — grid 1/4 (G)` text;
  - fail → exactly `1 sound in the demo collection failed to load — details are in the library.`
- **Signals:** status `[data-testid="arrangement-status"]`; tempo `[data-testid="arrangement-bars-ruler"]` `data-bpm`; Snap `[data-testid="arrangement-grid-control"]` `data-snap`; source rows `[data-source-id="…"]`. All are unchanged from round 237 (rendered in every state used here).
- **Timeouts (L31):** `tempo-seed-ui.test.tsx` declares `{ timeout: 15_000 }` per describe; on the scratch its 15 rows took 2.3 s in total, slowest 0.38 s. No covering test is near its limit (round 237: slowest CP12a 5.6 s / 30 s; gate 236: CP12d 6.6 s / 30 s).
- **Testids (L40):** no element with a `data-testid` changes.

## 1. Why
- **C-R237-01.** Round 237 made `settle` keep a non-loading status (D-29z339). A refusal is a non-loading status, so it now stays on screen at settle. But the provider's `lastNonRefusalStatusRef` (synced in a layout effect only while no refusal shows) still holds `copy.loading`. On release, `beginPointerGesture` swaps the refusal for that stale loading text. At HEAD the plain ready write replaced the refusal, which hid the problem.
- **Fix (A's candidate, verified by B):** in `settle`, before the reducer write, re-derive the ref with the same rule: `lastNonRefusalStatusRef.current = settledCollectionStatus(lastNonRefusalStatusRef.current, copy, failedCount);`. It runs in the callback, not inside the reducer updater, so it is StrictMode-safe. Results: loading → ready; a loading prefix + mount seed → ready + seed; a user status → kept; a failure → the failed text (which also replaces the refusal at once, as at HEAD).
- **A-R237-REVIEW-L1.** The seed effect appends its parts to the current text. If that text is a refusal, the result starts with the refusal but is not equal to it, so (a) the layout effect stores the combined text as "last non-refusal", and (b) the release does not recognise it. **Fix:** one prefix rule used in both places, the same shape as the collection's loading-prefix rule: a status is a refusal if it equals a refusal message or starts with it plus a space; on release, the refusal prefix is replaced by the last non-refusal status and the rest is kept (empty parts filtered).
- **Smallest honest behaviour (D-29z347, D-29z348):** a refusal is temporary feedback for the gesture; after the release the line shows what is true now (the settled collection state, plus any seed facts that happened during the gesture). Nothing new is shown permanently.

## 2. Changes

### 2.1 `ArrangementContext.tsx` (grant 1; exact code in `precheck-scratch.diff`)
```ts
function gestureRefusalPrefix(text: string): string | null
// returns the refusal message when text === refusal or text starts with `${refusal} `, else null
// (refusals: GESTURE_EDIT_BLOCKED_MESSAGE, GESTURE_UNDO_BLOCKED_MESSAGE)

function statusAfterGestureRelease(current: string, lastNonRefusal: string): string
// no refusal prefix -> current
// else [lastNonRefusal, current.slice(refusal.length).trimStart()].filter(nonEmpty).join(' ')
```
- Layout effect: `if (gestureRefusalPrefix(status) === null) { lastNonRefusalStatusRef.current = status; }`
- Release: `setStatus((current) => statusAfterGestureRelease(current, lastNonRefusalStatusRef.current));`
- `settle`: the ref statement above, between `const failedCount = failed;` and the existing functional `setStatus`.

### 2.2 Tests (grant 2)
| Row | Case | Expected |
|---|---|---|
| TU12 | Deferred collection; `beginPointerGesture()`; `setStatus(GESTURE_UNDO_BLOCKED_MESSAGE)`; settle; release | The refusal stays through the settle; after the release the status is exactly the demo ready text. Red on MU-RF. |
| TU13 | The same with an initial `stem-90` clip at 2 s (mount seed), edit refusal | After the release: exactly `<ready> <seed> <Snap on>`. Red on MU-RF. |
| TU14 | `failingDeferredSeedCollection` (every non-`stem-90` source rejects after the gate); refusal; settle; release | At settle the status is exactly `3 sounds in the demo collection failed to load — details are in the library.`; after the release the same text. |
| TU15 | `mountSeedWorkspace()`; record the status; `beginPointerGesture()`; edit refusal; `commitArrangement` adds a `stem-90` clip; release | During: exactly `<edit refusal> <seed> <Snap on>`. After: exactly `<recorded status> <seed> <Snap on>`. Red on MU-L1-REL and MU-L1-EFF. |

### 2.3 Doc 185 (grant 3)
- l.4 exactly `**სტატუსი:** Completed (C round 238 PASS)`.
- Add to `## პრობლემები და გადაწყვეტები` two Problem → Solution bullets: C-R237-01 (the stale ref; why HEAD hid it; the `settle` re-derive) and A-R237-REVIEW-L1 (the prefix rule; API-level repro; UI path unproven).
- Add to `## ტესტირება`: TU12–TU15 and the three mutants (MU-RF, MU-L1-REL, MU-L1-EFF), and C's refusal recipe.
- `## შეცვლილი ფაილები` names round 238's two code/test files as well.
- Cite only rows that exist (L26 grep). Keep "no reference found" (task §3). Add the live-region note: a release that changes the text gives one new announcement, as at HEAD. Also state the two recorded edges of §6 (the prefix edge and the repeated-refusal-over-seed edge).

## 3. Reference: how the reference product does it
**No reference found**, the same as round 237 (`tasks/round-237.md` §3): this is a contract between CZABA's own status writers (the gesture refusal, the collection load, the seed). Live 12 has no documented "refusal while dragging" status that competes with a load message. Searched: round 237's WebSearch (2026-10-28, "Ableton Live 12 manual status bar messages bottom of screen", no manual section). B did not repeat it, because nothing in this round's question is new to Live. **Binding rule instead:** CALM-2's "facts that move must stay reachable" and D-29z339.

| Behaviour | Source | CZABA decision | C check |
|---|---|---|---|
| After a refused gesture is released, the line shows the current collection state | none (CZABA contract) | D-29z347 | C-REFUSAL-238 |
| A load failure replaces a showing refusal and stays | none | D-29z339 (failure wins) | C-REFUSAL-FAIL-238, TU14 |
| Seed facts that occur during a gesture survive the release | none | D-29z348 | TU15 (unit; UI path unproven) |

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. Start-state check (§0): HEAD, the 11 paths, `sha256sum -c` on the start, frozen and root lists.
2. Apply `b-round-237/precheck-scratch.diff`; write doc 185 (§2.3).
3. `npm run typecheck` rc 0; `npx biome check app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx` clean.
4. `npx vitest run $(cat ../tmp/studio-real-loop/b-round-237/covering-files.txt)`: all green; any test above 50 % of its timeout goes at the top of the report (L32).
5. MU-RF, MU-L1-REL and MU-L1-EFF on a scratch copy outside `store/` (never on `store/`); report the red rows. The final files contain no mutant.
6. `code-reviewer` (the round-237 + 238 change set is 3+ files): pass its Architecture note to B.
7. Playwright: `c-round-237/race.cjs` against `:5173`, modes `refusal,delay,fail`, both viewports, plus a refusal-with-404 variant (§5 C-REFUSAL-FAIL-238). No new persistent text.
8. Write `a-round-238.md`: changed hunks, tests run with counts, mutants, reviewer result, any STOP at the top.

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720, fresh context per row)
| Row | What | Pass when |
|---|---|---|
| C-SCOPE-238 | HEAD, status, hashes | <ul><li>HEAD is `ecaf0e4`; exactly the 11 round-237 paths are dirty (9 `M`, 2 `??`), no other path;</li><li>`sha256sum -c` on `b-round-237-r238-tree-sha256.txt` (1,098) and on the root list give rc 0;</li><li>protected files: `git diff --quiet HEAD` rc 0;</li><li>against `b-round-237-r238-start-sha256.txt`, only the 3 grants changed;</li><li>`tempo-seed-ui.test.tsx`: 0 removed lines in `git diff --no-index b-round-237/start-copies/app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx <store file>` (B saved the 3 start copies; their hashes match the start list);</li><li>`ArrangementContext.tsx` (same `--no-index` diff against its start copy): the removed lines are only the old layout-effect condition and the old 5-line release updater.</li></ul> |
| C-UNIT-238 | `tempo-seed-ui` (TU1–TU15), `tempo-seed-search-ui`, `tempo-seed`, `collection`, `collection-load-status`, `purchased-collection-ui`, `label-status-colour-ui`, `library-row-strings-ui`, `status-announcement`, `status-announcement-ui`, plus 3 refusal files of C's choice from `b-round-237/refusal-files.txt` | All green. The full suite is a gate row. |
| C-MUT-238 | C re-runs MU-RF and MU-L1-REL once each on a scratch copy outside the repo | MU-RF: TU12 and TU13 red. MU-L1-REL: TU15 red. Repo status identical before and after. |
| C-REFUSAL-238 | **C-R237-01 recipe** (§0.3), valid attempts only | Final status exactly the demo ready text at both viewports; no entry after the release equals `Loading the demo collection…`. Control: `c-round-237/race-after.json` (round-237 tree: final loading). |
| C-REFUSAL-FAIL-238 | The same recipe with `**/hero-music.mp3` answered 404 after the delay | At settle the status becomes exactly `1 sound in the demo collection failed to load — details are in the library.` (it replaces the refusal while the button is still held), and after the release it is the same text. |
| C-REFUSAL-READY-238 | Neighbour: refusal with no loading involved. Wait for the ready text, then hold the fader, Ctrl+Z, release | During the hold: the undo refusal. After the release: exactly the ready text (unchanged HEAD behaviour). |
| C-RACE-238 | Round-237 rows on the changed `settle`: delay, fail, idle, placement (`tasks/round-237.md` §5) | The same exact texts as round 237's C-RACE-DELAY/FAIL/IDLE/PLACEMENT-237, valid attempts only; `data-bpm` 120 / `data-snap` on where the pulse seeds; no leading space. |
| C-L1-238 | A-R237-REVIEW-L1 | Unit only: TU15 green and MU-L1-REL red. C states whether it found a UI path (it is not required); not BLOCKED. |
| C-SHOTS-238 | Evidence | Full-window screenshots at both viewports after the refusal release (this round) next to `c-round-237/shots/after-refusal-*` (before). C-BUDGET is not re-run: no persistent element changes (only the status content); C says so. |
| AN-REVIEW-238 | Doc 185 | l.4 byte-exact `**სტატუსი:** Completed (C round 238 PASS)`; the 7 L26 headings in order; C-R237-01 and A-R237-REVIEW-L1 Problem → Solution bullets; cites only existing row ids (TU12–TU15 included, grep). Docs 182/183 unchanged since round 237 (frozen hashes). |
| C-REF-238 | §3 | "No reference found" stated with the search; C-R237-01 and A-R237-REVIEW-L1 in `backlog.json`; `A-R237-ARCH-STATUS-PARTS` recorded as a signal. |
| LAB-SMOKE-238 | `/studio-lab` | Loads; Space plays and pauses; the export dialog exports a WAV; 0 page errors. |
| Auth | Standing check | Fresh context: `/studio-lab` opens anonymously with `auth_user` null; `/studio/middle-east` shows "Sign in required" with no workspace and no `audio[src]`. |
| Purchased origin (browser) | Same rules on the purchased copy | BLOCKED: backend unavailable in cloud (unit coverage: CR1, `purchased-collection-ui`). |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **Every refusal path** (`refuseEditDuringGesture`, the undo/redo refusals, fader, marker, detail-panel and master refusals): a plain refusal still shows during the hold and is replaced on release by the last non-refusal status, exactly as at HEAD (C-REFUSAL-READY-238; the 31 refusal test files in the covering set).
- **The reducer's duplicate guard** (`gestureActive && next === previous.text`): unchanged; a repeated refusal during one hold makes no new announcement **when the line is the bare refusal**. Recorded edge, not a bug and no row: if the line is `<refusal> <seed> <Snap on>` (TU15 shape, UI path unproven) and the user presses Ctrl+Z again, the string write replaces it with the bare refusal, so the seed tail leaves the line (one announcement); the seed facts stay in the BPM field and the Snap state. Doc 185 states this next to the prefix edge.
- **Live region:** a release that changes the text increments the sequence once (one announcement), as at HEAD; a release that keeps the text makes none.
- **A user status written after loading began** (placement, Snap, tempo) is still kept at settle (C-RACE-238 delay and placement).
- **Known edge, recorded and not fixed:** a status that is a non-refusal text which happens to *start with* a refusal message plus a space can only be produced by appending to a refusal; no string in `strings.ts` starts that way (B grep for either message followed by a space inside a literal: 0 hits). Doc 185 states it.

## 7. Outcomes for B's next planning
- **PASS and gate published (rounds 237 + 238):** C-R237-01, A-R237-REVIEW-L1, A-R234-REVIEW-M1 (+ B-R235-READY-CLOBBER), GATE234-S2, GATE234-S3 and C-R236-02 close. Then **the REGRESSION round** if the next planning is on or after 2026-10-30 (likely), otherwise **SABA-B-11b** (zone-adaptive grid, Live 6.10; closes ABL-R-8).
- **FAIL:** a fix-up on the same grants.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.

## 8. Root notes
- Nothing in `store/` is ready to commit until C passes this round; the gate then publishes the round-237 + 238 tree together.
- `b-round-234-checkpoint-request.md` (ARCH-CHECKPOINT-TEMPO-GRID) has addendum 3 (`A-R237-ARCH-STATUS-PARTS`). Still non-blocking; please run it before SABA-B-11b.
- B's scratch copy `/tmp/b237-scratch` and its dev server (`:5174`, stopped after use) are outside the repo; no tracked file changed.
