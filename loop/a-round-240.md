# A round 240 — SABA-B-11b-FIX-1 (GATE239-S2, GATE239-S1/C-R239-01 ruling, GATE239-S3, GATE239-S6)

**No STOP.** No covering test failed. No test is above 50 % of its timeout: the slowest covering test is `track-group-collapse-ui` UC5 at 3,876 ms against a 20 s limit (19 %). The slowest in `grid-adaptive-ui` is GAU6 at 1,828 ms against 15 s (12 %); that file took 8.3 s for 17 tests inside the full 41-file run.

## 1. Start state (§0)
- HEAD `d0afa6409184dcab951309e7079b780a1b65366c`, clean `git status --short --untracked-files=all`.
- `sha256sum -c --quiet` gave rc 0 on all three lists: tree (1,101), root files and grant start hashes. `git apply --check -p1 b-round-239/precheck-scratch.diff` gave rc 0.

## 2. Changed files (exactly the 3 grants)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | `precheck-scratch.diff` applied as is. In the adaptive branch of `stepGridDivision`, the `next === null` end-check moved before the density loop (+4/−4), and `gridHandChosenRef.current = true;` was added after both refusal guards, before `gridDensityRef.current = density;` (+1). `git diff -U0` has 3 hunks, all inside `stepGridDivision`; grep `origin` = 0. |
| 2 | `app/lib/arrangement/__tests__/grid-adaptive-ui.test.tsx` | `precheck-scratch.diff` applied as is: describe id `D-29z352` → `D-29z356`; GAU12 gained 3 statements; GAU14–GAU17 added. The only removed line is the describe title. `expect(` count went 98 → 121. |
| 3 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | <ul><li>l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 240 PASS)`.</li><li>`## მიდგომა`: one density-model paragraph (D-29z361, SABA-Q-11B-DENSITY-MODEL).</li><li>`## პრობლემები და გადაწყვეტები`: GATE239-S2, GATE239-S1/C-R239-01 (ruling, 19,710 + 960 cases, 0 differences, why the absolute model was rejected) and GATE239-S3.</li><li>`## ტესტირება`: GAU12 extension, GAU14–GAU17, the two mutants.</li><li>`## TODO`: "round 240" → "round 241"; GATE239-S4 added; SABA-Q-11B-DENSITY-MODEL added to the Saba question list.</li></ul>The 7 `## ` headings are unchanged and in order. Cited ids exist: GAU11–GAU17, GA6, and `tempo-seed-ui.test.tsx` TU5, named with its file because `grid-triplet-ui` also has a TU5. |

Diff: `a-round-240/granted-hunks.diff`; end hashes: `a-round-240/changed-end-sha256.txt`.

**Note for B (not edited, outside grant 3's section list):** doc 186 `## შეცვლილი ფაილები` still says `GAU1–GAU13` for `grid-adaptive-ui.test.tsx`. The `## ტესტირება` section lists GAU14–GAU17. A one-word fix can go into a later grant. Also, `## TODO` now says "ეტაპი 2 (round 241)". That number is a placeholder until B's next planning: §7 puts a regression round first if planning falls on or after 2026-10-30.

## 3. Checks actually run
| Check | Result | Evidence |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-240/typecheck.log` |
| `npx biome check` on grants 1 and 2 | rc 0, clean | `a-round-240/biome.log` |
| `npm run lint` | rc 0 | `a-round-240/lint.log` |
| Covering set `b-round-239/covering.txt` | **41 files, 680/680 passed**, rc 0 (GAU1–GAU17 green) | `a-round-240/covering.json`, `covering.log` |
| MU-FLAG-MISSING (flag line deleted, scratch `/tmp/a240-scratch`) | **GAU16 red**, 16 passed | `a-round-240/mutants/MU-FLAG-MISSING.log` |
| MU-FLAG-BEFORE-GUARDS (flag as the first statement of the adaptive branch) | **GAU17 red**, 16 passed | `a-round-240/mutants/MU-FLAG-BEFORE-GUARDS.log` |
| Scratch restored | 17/17 green; `store/` `git status` identical before and after | — |
| End scope | HEAD unchanged; exactly 3 `M`; tree (1,101) and root lists rc 0; the 7 protected files `git diff --quiet HEAD` | — |

Not run (speed rule, gate rows): full vitest, build, `npm run verify`, e2e smoke.

## 4. Playwright (A evidence, not C evidence)
I ran a copy of B's `probe-240.cjs` (`a-round-240/probe-240-a.cjs`, unedited) against the running `:5173`, at 1440×900 and 1280×720. No server was started.
- Attempt 1 timed out after 30 s waiting for `Demo collection ready` on the first load after the edit, most likely a cold Vite transform; it is environment-invalid and kept as `probe-240-a-attempt1.err`. B's first scratch attempt hit the same thing.
- Attempt 2: rc 0, **0 page errors** in every recipe and viewport (`probe-240-a.json`, `probe-240-a.out`). It matches B's "after" column at both viewports:
  - `1` then seed: `adaptive 0.5`, Snap on, `data-bpm` 120, status ends `Snap on — grid 0.5 s (G)`;
  - control (no key) then seed: `adaptive 1/2`, status ends `Snap on — grid 1/2 (G)`;
  - C-R239-01 (`1 1`, `=`×10, `2`, `−`×10): 0.25 → 0.1 → 0.25 → `2`.

## 5. Code review (required, 3 files)
The `code-reviewer` subagent was actually run on the 3 files and the task contract. It couldn't run `git diff` and reasoned from the current files. **Score 8.5/10. No Critical, High or Medium findings.** Code verdict:
- The flag comes after both refusals.
- `toggleGridMode` and the adaptive branch of `toggleGridTriplet` don't set it; the fixed branch still uses `changeGridDivision`.
- Moving the end check doesn't change any outcome.
- None of `changeGridDivision`'s skipped side effects matters (the refs are covered by `resolveAdaptiveGrid`; mode and family are kept on purpose).
- The expected values in GAU12 and GAU14–GAU17 were re-derived independently and match.

| Finding | Severity | Action |
|---|---|---|
| A mutant that puts the flag between the loop and the ±2 guard can't be shown red: reaching ±2 takes earlier accepted presses that already set the flag | Low (info) | Fixed in doc 186 `## ტესტირება` (grant 3): MU-FLAG-BEFORE-GUARDS now says "first statement of the adaptive branch", plus one sentence on why the between-guards placement can't be observed. A grep backs that sentence: density is written only at l.554 (state mirror), l.1448–1449 (`toggleGridMode` reset to 0) and l.1571–1572 (`stepGridDivision`). |
| Doc 186 `## შეცვლილი ფაილები` still says `GAU1–GAU13` | Low | **Not edited:** this section isn't in grant 3's list. For B: a one-word fix in a later grant. |
| Doc l.4 claims `C round 240 PASS` before C has run | Low | **Not changed:** L28 requires exactly this post-PASS value, written by A. C's json is the source of truth. |
| GAU12 title doesn't mention zoom-back; GAU14's `34.359738368` could be a named value (any zoom from 24 to 48 px/s gives `2`) | Nit | **Not changed:** grant 2 allows only B's exact additions plus the title-id fix. For B: deferred-polish candidate. |
| `1` then `2` (net density 0) still counts as a hand choice | Observation | Same as fixed mode (choosing 0.5 then 1 sets the flag); no action. |

**Architecture note (proposal for B/root, not acted on):** `stepGridDivision` and the grid ref block (`StudioWorkspace.tsx` ~543–571, 1543–1586) changed in rounds 239 and 240 with reviewer findings each time. The hand-choice rule is written at l.1410 and l.1570 and read at l.1505, and only full-workspace tests can pin it. The reviewer's call is "keep for now". Candidate for a later bounded task: one hook that owns grid mode, density and the hand-choice flag, with GAU1–GAU17 and the tempo-seed TU tests as acceptance.

After the doc fix: `git status` = the same 3 `M`, tree list rc 0, l.4 and the 7 headings unchanged; end hashes re-written.

## 6. Known gaps / not done
- The task's §5 C rows are not claimed: C-REFUSED-240, C-DENSITY-MODEL-240 (b)/(c), C-SEED-REG-240, C-GRID-REG-240, C-BUDGET-240, C-REF-240, LAB-SMOKE-240 and Auth. My probe covers only B's three recipes.
- No persistent screen text was added (no UI change).
- The purchased origin is not touched (grant 1 has no origin branch).

## 7. Next C checks (exact)
1. C-SCOPE-240: 3 `M`; `git diff -U0` on grant 1 = the moved block plus the flag line; 1 removed line in grant 2 (the title).
2. C-HAND-240 (a)/(b)/(c) and C-REFUSED-240 (expect `1/16` at 120 BPM and 320 px/s, with the narrowest text first).
3. C-DENSITY-MODEL-240 (a) ends `2`, (b) ends `5`, (c) per §2.1, with no swallowed key.
4. C-SEED-REG-240 (select 0.5 → fixed kept; `5` → fixed 1/4; `3` → triplet adaptive).
5. C-MUT-240 on a scratch copy; C-REF-240 runs `eq2.mjs`/`eq.mjs`; AN-REVIEW-240 on doc 186 l.4 byte-exact.

## 8. Scope completed
§4 steps 1–8 are done, with step 6 as recorded in §5. Grants 1–3 are written. B acceptance is for C to judge; A claims only the checks in §3–§4.
