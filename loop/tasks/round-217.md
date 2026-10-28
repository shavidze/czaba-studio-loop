# CURRENT TASK — Round 217: PERF-1b-ii fix-up (C-R216-01 doc 169 `## არქიტექტურა` heading; C-R216-02 `mem-polls` kind labels; 0.1 MiB determinism ruling; stale peak notes)

Decisions:
- **D-29z218:** round 216 C FAIL on two Lows that are this round's deliverable defects. Round 217 is a bounded fix-up of the failing rows only (`tasks/round-216.md` §6).
- **D-29z219:** rulings on C-R216-02, A's deviation 5 (the 0.1 MiB asymmetry) and A's deviations 1–4.

Planned by B on 2026-10-28. Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md`. L10, L11, L26, L28, L30 and L34 apply.
- `b-round-216.md` §2–§3 (the data and the rulings).
- `c-round-216.md` (DOC-216 and PERF-RUN-216 sections).
- `a-round-216.md` (deviations 1–5).
- Project: `docs/implementation/TEMPLATE.md` l.29–50, and the `GEORGIAN_DOCS.md` primitive.

**Reference first / Ableton:** not in scope (docs and test-only round; policy "Not in scope").

## Baseline
- **HEAD `eb9e76e`.** Gate 216 was skipped (C FAIL), so the last publication is still `eb9e76e1bc2b41f6ec1a3e083a391d05cb1a844f`. The round-216 working tree carries over unchanged: 4 M (docs 160, 161, 162 and 168) and 3 ?? (the spec, `budgets.resources.json` and doc 169). It is listed in `b-round-216/git-status-at-planning.txt`.
- **Frozen:** 1,063 files in `b-round-216-r217-tree-sha256.txt`.
  - These are every tracked file (the 4 SYS-4 docs at their current working content) plus the untracked `perf/studio-lab-resources.perf.spec.ts`, minus the 2 grants.
  - From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-216-r217-tree-sha256.txt`. B checked it: rc 0.
- **Grants:** `b-round-216-r217-grants.txt` (2 files).
  - Start hashes: `b-round-216-r217-granted-start-sha256.txt`.
  - Start copies: `b-round-216/r217-granted-start/`.
- **New files:** none (`b-round-216-r217-new-files.txt` is empty).
- **No dependency change:** HEAD must be exactly `eb9e76e`. A `chore(deps)` commit on top is unexpected: report it, don't stop.
- **Protected as always:**
  - `app/**`;
  - the auth and purchase files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`;
  - `.claude/**`, `CLAUDE.md`;
  - `package*.json` and every config file;
  - **the spec `perf/studio-lab-resources.perf.spec.ts`** (frozen: none of this round's rulings needs a spec change);
  - `perf/lib/**` and the other budgets files.

## 0. Why this round
C round 216 passed every row except two Lows, and both are defects in the round's own deliverable:
- **C-R216-01 (DOC-216):** doc 169 lacks the TEMPLATE heading `## არქიტექტურა`. Its Mermaid diagram sits inside `## მიდგომა`, after `### Pass-ის თანმიმდევრობა (1×)` (current l.30–41). Docs 163–168 all have the heading.
- **C-R216-02 (PERF-RUN-216):** `res.harness.mem-polls-1`, `-1.6x` and `-2.6x` (and, by the same nature, `-2`) are labelled `deterministic`, but they are timing-dependent poll counts that differ between runs.

`browserVerified` and `realVerified` were true. The regression is due on or after 2026-10-30, so it is not due at this planning.

## 1. Rulings (D-29z219). Required.
**Data:** the per-run samples are in `b-round-216.md` §2, taken from `a-round-216/final-run-{1,2}.json` and `c-round-216/perf-run-{1,2}.json`.

1. **`mem-polls` rows are `wallclock`.** The four rows are `res.harness.mem-polls-1`, `res.harness.mem-polls-2`, `res.harness.mem-polls-1.6x` and `res.harness.mem-polls-2.6x`.
   - Set `"kind": "wallclock"`.
   - Keep `mode` (`assert`), `budget` (`>= 5`), `id`, `scenario`, `metric`, `unit` and `owner` byte for byte.
   - Append this sentence to each `note`: `Timing-dependent poll count, so wallclock (round 217, D-29z219); observed across A and C runs in round 216: <range>.` The ranges are exactly:
     - `7–9` for `mem-polls-1`;
     - `13–15` for `mem-polls-2`;
     - `9–12` for `mem-polls-1.6x`;
     - `17–20` for `mem-polls-2.6x`.

     Use an en dash (–), as in the doc.
   - Leave the set-membership liveness rows alone (`clips-*`, `export-*-produced`, `js-*-seen`). They stay `deterministic`.
2. **The 0.1 MiB rule.** A MiB row rounded to 0.1 stays `deterministic` when its median is identical in every run and no sample differs from the median by more than 0.1.
   - **`res.mem.used-ready-mib` returns to `deterministic`.** Replace its note's sentence `Left the deterministic set (round 216): A observed [5.1, 5.2, 5.1] in one run. Trend only.` with `Deterministic under the 0.1 MiB rule (round 217, D-29z219): median 5.1 in all four round-216 runs; one sample at 5.2.` Keep the rest of the note.
   - `res.export.1.peak-backing-delta-mib` stays `deterministic`. Its note changes only per item 3.
   - `res.export.2.longtasks-over-50` stays `wallclock`, unchanged: it is a count with a threshold-borderline task.
3. **Stale peak notes (L34).** In the four `peak-backing-delta-mib` rows (`res.export.1`, `res.export.2` and both `.6x` versions), replace `polled every 50 ms in the window` with `polled in the window (at most every 50 ms) plus one window-end sample`. Nothing else in those notes changes.
4. **A's deviations 1–4 are accepted** (C passed them in round 216): the window-end sample, the throttle after Add, asserts on incomplete runs, and the `MutationObserver` window end. The doc already describes them; no edit is needed for them.

## 2. A: the files you own. Everything else is frozen.
| Path | Allowed edits (nothing else) |
|---|---|
| `perf/budgets.resources.json` | <ul><li>The `kind` and `note` of the rows named in §1.1–§1.3: 4 + 1 + 4 = 9 rows.</li><li>Row count (61), order, ids and all other fields stay unchanged.</li><li>Keep the file's existing formatting (indentation, key order).</li></ul> |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` | <ul><li>**(a)** l.4 → exactly `**სტატუსი:** Completed (C round 217 PASS)` (L28).</li><li>**(b)** Insert a `## არქიტექტურა` section directly after the end of the `## მიდგომა` section, which is the end of `### GATE206-S5: საერთო build/ საქაღალდე`. Move the existing Mermaid block there **unchanged**, with one Georgian sentence before it, for example "Pass-ის ნაკადი:". Remove it from its old place. The `##` order then follows TEMPLATE: კონტექსტი, მიდგომა, არქიტექტურა, … The extra `##` sections stay where they are, after არქიტექტურა.</li><li>**(c)** Rewrite the `### Determinism-იდან გასული სტრიქონები` subsection so it states both rules: the count rule from §2.5, and the 0.1 MiB rule with D-29z219 and the timing-dependent poll-count rule. The table lists `res.export.2.longtasks-over-50` and the four `mem-polls` rows with the observed values. `res.mem.used-ready-mib` leaves the table and gets a sentence saying it returned under the 0.1 MiB rule.</li><li>**(d)** In the `## გაზომილი სტრიქონები` table, update the kind cells for the 5 rows whose kind changed (`used-ready-mib` → `deterministic / record`; the 4 `mem-polls` → `wallclock / assert`). Also update the sentence in that section's intro (current l.96) that calls `res.export.1.peak-backing-delta-mib`'s difference the only one. It now names the 0.1 MiB rule, and says the `mem-polls` rows are wallclock.</li><li>**(e)** In `### Export-ის მეტრიკები`, the `mem-polls-N` row may gain "(wallclock, D-29z219)". Optional.</li><li>**(f)** One line in `## პრობლემები და გადაწყვეტები`: C-R216-01 and C-R216-02, Problem → Solution.</li></ul> No other line of doc 169 changes. |

**Self-checks before handover** (not the full suite):
- `sha256sum -c` of the frozen list, at the start and at the end: rc 0.
- `node -e "JSON.parse(require('fs').readFileSync('perf/budgets.resources.json','utf8'))"`: rc 0. Count the rows: 61, ids identical to the start copy. Paste the result of a python/node diff of ids, kind and note against `b-round-216/r217-granted-start/budgets.resources.json`: exactly the 9 rows changed.
- `npm run typecheck`: rc 0. It covers `perf/**` but not JSON. Biome ignores `perf/` (L30), so do not cite Biome.
- **Run the perf spec once:** `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, with nothing else running (GATE206-S5).
  - It should exit 0, with `complete: true` and `failures []`.
  - This proves that `loadPerfBudgets` (`perf/lib/budgets.ts:58` validates `kind`) loads the edited file, and that `used-ready-mib` passes the determinism check now that it is back in the deterministic set.
  - Report `durationMs` and the samples of the 9 changed rows.
- **One named mutant**, on a `/tmp` copy or with `PERF_BUDGETS_RESOURCES` pointing at a `/tmp` file, never in the store: one row with `"kind": "flaky"`. Show the loader error text `budgets[<i>].kind must be deterministic or wallclock`.
- `grep -n '^## ' doc169` alongside TEMPLATE's `##` list (l.29–47): each of TEMPLATE's 7 headings is present, in order.
- **Code-reviewer:** not required (2 files, labels and docs). Run it if you change anything beyond §2.

## 3. C: rows
Setup: Playwright Chromium. Do not run the full vitest suite, `npm run verify` or the two frozen perf specs. **Re-verify only what this round changed**; round 216's PASS rows stand.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-217** (start + end) | <ul><li>HEAD;</li><li>`git status --short --untracked-files=all`;</li><li>`sha256sum -c` of the 1,063-file list;</li><li>a diff of each grant against `b-round-216/r217-granted-start/`.</li></ul> | <ul><li>HEAD is `eb9e76e`.</li><li>Status is exactly 4 M (docs 160, 161, 162 and 168) and 3 ?? (the spec, the budgets file and doc 169).</li><li>Frozen rc 0, so the spec and the 4 docs are byte-identical to C round 216's state.</li></ul> |
| **BUDGETS-217** | Diff the budgets file's rows against the start copy by id: every field. | <ul><li>61 rows, ids and order unchanged.</li><li>Exactly 9 rows differ, only in `kind` and/or `note`, as §1.1–§1.3 state: 4 `mem-polls` → `wallclock`, with the range sentence; `used-ready-mib` → `deterministic`, with the new sentence; 4 peak notes with the end-sample wording.</li><li>`clips-*`, `export-*-produced` and `js-*-seen` are still `deterministic`.</li></ul> |
| **DOC-217** | <ul><li>`grep -n '^## '` of doc 169 against TEMPLATE l.29–47.</li><li>A diff against the start copy.</li><li>Grep every `res.*` id the doc cites in the budgets file (L26).</li></ul> | <ul><li>`## არქიტექტურა` exists, directly after the `## მიდგომა` section, and holds the Mermaid block byte-identical to the start copy's block. The block appears only once in the file.</li><li>The 7 TEMPLATE `##` headings appear in TEMPLATE order.</li><li>The diff touches only §2 (a)–(f).</li><li>The kind cells for the 5 rows match the budgets file.</li><li>The determinism subsection states both rules and lists the 4 `mem-polls` rows and `res.export.2.longtasks-over-50`.</li><li>l.4 is exactly `**სტატუსი:** Completed (C round 217 PASS)`.</li><li>Every cited id exists.</li></ul> |
| **PERF-RUN-217** (real browser) | Run the spec alone **once**: `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`. Before the run, put sentinel `latest.json` and `latest-interactions.json` files in place, as in round 216. | <ul><li>rc 0, `complete`, `failures []`, `durationMs` ≤ 8 min.</li><li>61 rows × 3.</li><li>The `deterministic` medians equal round 216's medians (`c-round-216/perf-compare.txt`).</li><li>Every `mem-polls` sample is ≥ 5.</li><li>`reactRenderer` is 18.x.</li><li>The sentinels are unchanged.</li></ul> |
| **REDPROOF-217** | Read A's `kind: "flaky"` log. Add C's own mutant: a `/tmp` budgets file whose `res.harness.mem-polls-1` assert is `>= 1000`, run with `PERF_BUDGETS_RESOURCES`. | <ul><li>A's mutant shows the loader error.</li><li>C's mutant fails on `assert failed res.harness.mem-polls-1` only: the relabel did not disable the assert.</li><li>Nothing hangs.</li></ul> |
| **AN-REVIEW-217** | `npm run typecheck`, and the JSON parse. | <ul><li>rc 0.</li><li>Biome is not claimed for `perf/` (L30).</li></ul> |
| **G217-3** (browser) | Fresh contexts at 1440×900 and 1280×720: <ul><li>`/studio-lab` anonymous;</li><li>`/studio/middle-east`;</li><li>`/api/studio-token?product=middle-east&file=stem1.wav`, with no header and with a fake Bearer.</li></ul> | <ul><li>`/studio-lab` opens anonymously with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>No header → 401.</li><li>Fake Bearer → 403 with the `:5199` mock, or 500 without it.</li><li>**No token is issued.**</li></ul> |
| **STUDIO-SMOKE-217** (browser) | On `/studio-lab` (dev server), at both viewports, with the real mouse: add the demo clip, Export WAV, capture the download. | <ul><li>`czaba-studio-lab.wav` arrives: PCM, 2 ch, 48 kHz, 24-bit.</li><li>Its length matches "WAV created" within 1 frame.</li><li>The audio is not all zeros.</li><li>0 page errors.</li></ul> |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. | Not claimed by C. |

**`browserVerified`:** PERF-RUN-217, G217-3 and STUDIO-SMOKE-217 run in the cloud. If any of them does not run, the flag is false.

**Product / Ableton:** not applicable. This is a harness-label and docs round. The CZABA requirement (PERF-1 baselines) is unchanged.

## 4. Adjacent behaviour that could break
- **The budgets file is loaded at runtime.** A malformed JSON or kind makes the whole spec throw, and that breaks `npm run test:perf` at the gate.
- **`used-ready-mib` re-enters the determinism check** (`countsAgree` ±2), which could add a failure. The observed spread is 0.1, so a failure is not expected; PERF-RUN proves it.
- **Doc 169's section move:** a duplicated or edited Mermaid block, or a lost line.
- **The 4 SYS-4 docs and the spec** must stay byte-identical (frozen list).

## 5. Outcome, fixed in advance
| C result | B at round-218 planning |
|---|---|
| PASS, and planning on or after 2026-10-30 | Round 218 = **REGRESSION** (3-day rule). PERF-16 follows, with `root-deps-request.json` filed at the planning step that dispatches it. |
| PASS, and planning before 2026-10-30 | Round 218 = **PERF-16**, with `root-deps-request.json` `{"add": ["mediabunny", "@mediabunny/mp3-encoder"], "remove": []}` filed in that planning step (D-29z216). Its baseline is the `chore(deps)` commit. |
| A BUDGETS or DOC row fails | Fix-up again, the failing rows only. |
| SCOPE-217 fails | Stop. Root inspects. |
| G217-3 or STUDIO-SMOKE-217 finds Medium+ | Bounded fix-up first. A Low goes to `deferred_low_polish`. |

## 6. Publication
- After C PASS, root gates this tree. It holds rounds 216 and 217 together: the 4 doc l.4 lines, the spec, the budgets file and doc 169.
- Suggested commit message: "test(perf): PERF-1b-ii resource baselines (WAV export long tasks + peak memory, backing store, DOM per clip, JS bytes per route); GATE206-S5 documented; SYS-4 doc status backfill (docs 160/161/162/168)".
- **Root reviewer, please cover:** the four late spec changes that A's code-reviewer never re-saw (ROOT-R216-LATE-SPEC-REVIEW: the window redesign, the window-end heap sample, assert evaluation on incomplete runs, the 8 min guard).
- Root does not amend any doc l.4 (L28).
- Still pending with root, non-blocking: the frontend-architect checkpoint (D-29z195) and `b-round-215-root-request-l28.md`.
