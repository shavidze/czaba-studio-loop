# A round 237 — SABA-B-11a-FIX-2 (seed status vs collection ready write)

## STOP — needs B ruling on A-R237-REVIEW-M1 (Medium, regression this round caused; fix outside the grants, L33/L11)

**What:** if a gesture refusal is showing when the last source settles, the gesture release now restores a stale `Loading the demo collection…`, and nothing clears it afterwards. The code-reviewer found it. A reproduced it in a unit test and in real Chromium.

**Trace:**
- The provider's `lastNonRefusalStatusRef` (`ArrangementContext.tsx` l.640–645) holds `copy.loading` while a refusal (`GESTURE_UNDO_BLOCKED_MESSAGE` / `GESTURE_EDIT_BLOCKED_MESSAGE`) is shown during loading.
- The new `settledCollectionStatus` sees a non-loading status with 0 failures and keeps the refusal (l.3675).
- The release in `beginPointerGesture` (l.1645–1649) swaps the refusal for `lastNonRefusalStatusRef.current`, which is the loading text.
- At HEAD, the plain `copy.ready` write replaced the refusal, and the layout effect then synced the ref to ready. So HEAD did not have this.

**Evidence (facts):**
- Unit, on scratch copies outside the repo. TU12 (text below; also in `a-round-237/tu12-scratch-test.txt`): deferred collection → `beginPointerGesture()` → `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` → settle → release → expect the ready text.
  - **This round's tree: red.** `Received: "Loading the demo collection…"` (`a-round-237/tu12-fixed-tree.log`).
  - **HEAD `ecaf0e4`: green** (`a-round-237/tu12-head.log`).
- Browser, on `:5173` (`a-round-237/refusal-probe.cjs`, `refusal-probe.json`, `refusal-1440x900.png`, `refusal-1280x720.png`). Both demo MP3s delayed 6 s, no ready wait. Steps: press and hold the first `Volume — …` slider, move 4 px, press Ctrl+Z, hold until loading finishes, release.
  - Both viewports, valid attempts (status before the gesture = loading).
  - The refusal stays during the hold.
  - **After the release, the final status is `Loading the demo collection…`.** 0 page errors.
  - Loading had finished before the release: at release time the `demo-hero-music` row already showed its decoded duration `02:30.372`. History at 1440: loading (248 ms) → refusal (1,868 ms) → `Loading…` at the release (9,381 ms); at 1280 the same order (171 / 1,772 / 9,286 ms).
  - (After the run, A removed one always-true `waitForFunction` line from `refusal-probe.cjs`. It had no effect on the result.)
- Reachability: a fader drag and Ctrl+Z (or any edit refusal) during the first seconds of a load. With normal network it is a ~1–2 s window. Medium as rated by the reviewer: the status line states something false.

**Candidate fix for B to grant (not applied in the repo):** `a-round-237/candidate-fix.diff`.
- In `settle`, after `const failedCount = failed;`, add `lastNonRefusalStatusRef.current = settledCollectionStatus(lastNonRefusalStatusRef.current, copy, failedCount);`.
- This sits outside the reducer updater, so it is StrictMode-safe. The layout effect overwrites the ref anyway whenever the status is not a refusal.
- It needs a TU12-shaped row in `tempo-seed-ui.test.tsx` (not covered by grant 5).
- Scratch result with the candidate fix: TU12 green. `tempo-seed-ui`, `collection-load-status`, `collection`, `purchased-collection-ui` and `status-announcement` give 5 files / 54 tests green (`candidate-fix-tests.log`). The 23 test files that mention the refusal messages give 492 tests green (`candidate-fix-refusal-tests.log`). This is not the full covering set.

**Same class, separate decision (reviewer L1, Low). The candidate fix above does NOT cover it:** the seed status appended onto a showing refusal gives "refusal + seed". The release no longer recognises the refusal, so the combined text stays. This is rare: it needs a seeding clip change during a gesture.

**Tree state:** B's sketch is applied in full, plus the three doc grants. All checks below are green. Nothing was reverted. Docs l.4 are left as written (L28: on a re-dispatch, l.4 of doc 185 is implicitly granted).

TU12 scratch text:
```ts
it('TU12 a refusal shown when loading settles is restored to the ready text on release, not loading', async () => {
  const { api, view, settle } = await mountDeferredSeedWorkspace();
  expect(statusText(view)).toBe(DEMO_LOADING);
  let releaseGesture: () => void = () => {};
  act(() => { releaseGesture = live(api).beginPointerGesture(); });
  act(() => live(api).setStatus(GESTURE_EDIT_BLOCKED_MESSAGE));
  expect(statusText(view)).toBe(GESTURE_EDIT_BLOCKED_MESSAGE);
  await settle();
  act(() => releaseGesture());
  expect(statusText(view)).toBe(DEMO_READY);
});
```

No covering test is above 50 % of its timeout (L32). The slowest on A's run is CP12a at 5.6 s against 30 s. At gate 236 the slowest is CP12d at 6.6 s / 30 s and UM1 at 2.4 s / 20 s. The 5 s-default tests reached at most 2.08 s.

## Baseline and scope
- At start: HEAD `ecaf0e4bd9c99081c2db7a4cd97497562d00193d`, `git status` empty. The frozen, granted-start and root-file `sha256sum -c` checks all gave rc 0.
- At the end: exactly the 9 grants are `M`, plus the 2 new files. Root files untouched. No protected file touched.

## Changed files
- `app/contexts/ArrangementContext.tsx`: `setStatus` type, collection import, functional loading and settle writes (§2.2).
- `app/components/arrangement/StudioWorkspace.tsx`: import, `collectionHasTempoSource` memo, seed guard and deps, functional filtered write (§2.3).
- `app/lib/arrangement/collection.ts`: `loadingCollectionStatus`, `settledCollectionStatus`.
- `app/lib/arrangement/tempo-seed.ts`: `hasAssetTempoSource`.
- `app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx`: TU9–TU11 appended.
- `app/lib/arrangement/__tests__/collection.test.ts`: import and CR1–CR4.
- `app/lib/arrangement/__tests__/tempo-seed.test.ts`: import and TS7.
- `app/lib/arrangement/__tests__/tempo-seed-search-ui.test.tsx` (new): TQ1, TQ2.
- `docs/implementation/2026/quarter-IV/182-saba-b-11a-tempo-seed.md`: first problem bullet and last TODO bullet.
- `docs/implementation/2026/quarter-IV/183-saba-b-11a-bars-ruler.md`: `playFromRuler` bullet (C-R236-02), checked against `playFrom` l.1390–1413.
- `docs/implementation/2026/quarter-IV/185-saba-b-11a-seed-status-fix.md` (new). l.4 is `**სტატუსი:** Completed (C round 237 PASS)`. It has the 7 TEMPLATE headings in order. Every row id it cites exists (grep).

The code and test changes are B's `precheck-scratch.diff`, applied unchanged (`git apply` rc 0).

## Tests actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`a-round-237/typecheck.log`) |
| `npx biome check` on the 8 changed code and test files | clean, no fixes |
| Covering set: `covering-files.txt` + `tempo-seed-search-ui` | **121 files, 1,715 tests green**, 130 s (`a-round-237/covering.log`) |
| Doc hunks (`git diff -U0`) | 182: @@100 (first problem bullet), @@133 (last TODO bullet). 183: @@38 (`playFromRuler` bullet). l.4 of both is unchanged (`Completed (C round 235 PASS)`) |

**Mutants:** `b-round-236/mutants.sh` run on the scratch copy `/tmp/a237-scratch`, which is identical to the working tree. The repo status was the same before and after. Logs are in `a-round-237/mutants/`. The script's own summary grep printed empty because of ANSI colours, so the red rows below come from the de-coloured logs.
| Mutant | Red rows |
|---|---|
| MU-RC | TU9, TU10 |
| MU-LD | TU10 |
| MU-F | TU11 |
| MU-S2 | TQ1 |
| MU-SR | 0 red (equivalent, as B recorded) |

**Playwright on `:5173`** (`a-round-237/readyrace-a.cjs` = B's recipe plus a warm-up, the validity field, `data-snap`, status-box height, SFX placement mode and screenshots; output `readyrace-a.json`; screenshots `a-round-237/shots/`). Delay 4 s. Every race attempt was valid (the status before Add was loading). 0 page errors.
- **delay, 1440 and 1280:** the final status is exactly the placement + seed + `Snap on — grid 1/4 (G)` text. 0 ready entries after the Add. `data-bpm` 120, `data-snap` on. No leading space. Box 16 px.
- **fail, both viewports:** exactly `1 sound in the demo collection failed to load — details are in the library.` bpm 120, snap on. The hero row contains `Error: File failed to load (404)`. Box 16 px (one line).
- **idle:** the exact ready text.
- **placement (`demo-soft-impact`):** the final status is exactly `“Soft impact” added to the Music track at 00:00.000.` bpm empty, snap off, no leading space.
- No new persistent text was added; only the status content changes. A did not run a HEAD screenshot control; C-SHOTS-237 / C-BUDGET-237 belong to C.
- The first attempt failed on a cold Vite load: the page navigated 3 times in 20 s and the item detached. With the warm-up, the run was clean.

## Code-reviewer (actual subagent run), score 8/10
- **M1:** see the STOP above (A-R237-REVIEW-M1).
- **L1:** "seed + refusal" restore. Same class, listed in the STOP for the same ruling.
- **L2:** the failed > 0 path drops placement + seed. This is deliberate (D-29z339). There is no UI row for it, only CR3 and C-RACE-FAIL. Note for B.
- **L3:** TU11 reaches the empty status only through a direct `setStatus('')`. This is a guard for the filter, not a user flow. Note.
- **L4:** doc 185 l.4 claims PASS before C. This follows L28 by design; no action.
- **Architecture note (passed to B as a signal, not a task):**
  - The collection fns (`collection.ts`) and the seed write (`StudioWorkspace.tsx`) are now coupled through a status-text prefix contract. The refusal-restore ref does not know that contract, which caused M1 and L1.
  - The reviewer suggests, as a scoped proposal, structured status parts: a collection-state part plus an action part. Acceptance would cover TU9/TU10, LS3–LS7 and the refusal restore.
  - The status-line region changed in rounds 234–237 and each round needed full-provider UI tests: a backlog signal. Verdict: keep for now.

## B acceptance criteria actually passed by A (A-side only)
- §4.1 typecheck and Biome, §4.2 covering set, §4.3 mutants, §4.4 code-reviewer run, §4.5 Playwright probe at both viewports: done, with the results above.
- **Not passed:** the round as a whole (STOP). No C row is claimed.

## Known gaps
- A-R237-REVIEW-M1 open (Medium regression, needs a grant). Reviewer L1 open (Low, same class).
- On a re-dispatch, doc 185 needs an M1 Problem → Solution bullet (a grant for the re-dispatch).
- Not run by A: the full suite, `verify`, build (gate), and a HEAD-server control (C).

## Exact next C checks (once B has ruled and a re-dispatch lands)
- The refusal-during-load recipe (`a-round-237/refusal-probe.cjs`) at both viewports. Expected after the fix: the final status after release is the ready text (or the failed text), never `Loading…`.
- Then the §5 rows as written: C-RACE-DELAY / FAIL / IDLE / PLACEMENT, C-FIX1-REG, C-BUDGET, C-SHOTS (HEAD control on another port), AN-REVIEW, Auth, LAB-SMOKE.
- If C runs this tree as is, C-RACE-* should pass per A's probe, but the round must not pass while M1 is open.
