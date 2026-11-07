# Round 384: PERF-13b-i, finishing the checks. C runs the round-383 rows that did not run; A changes one doc line

**Planned by:** B, at the round 383 → 384 planning, 2026-11-07 (`b-round-383.md`).

**Decisions** (`backlog.json` v349 → v350, `decisions_log_b`):
- **D-29z1280: round 383 is accepted as C BLOCKED (incomplete).** C found no bug, but ran out of time before the required rows. Gate 383 was `skipped`, so the baseline stays HEAD `5745526` [K1]. The round-382 and round-383 work stays uncommitted (11 status lines [K2]). Root publishes 382, 383 and 384 together after a C PASS.
  - The round-383 rows that passed **carry over unchanged**: the measured tree is byte-identical. `r383-frozen-sha256.txt` is still rc 0 [K17], and the new `r384` manifest covers every file except the one grant [K16].
  - Round 384 is the browser and verification half of PERF-13b-i. It is **not** new scope.
- **D-29z1281: C-R382-02 is closed** by C's own evidence (`c-round-383/b2.json`, both viewports [K12]):
  - with the library preview's Stop: the 101.35 s buffer is live while the preview plays and gone after Stop; Add makes it live, Undo removes it, Redo makes it live again;
  - with the transport Stop: the buffer stays live because the preview keeps playing. This matches HEAD (B-R382-TRANSPORT-STOP-VS-PREVIEW).

  The `stop()` call count is a corroboration row only (EVICT-B2-COUNT).
  - **C-R382-01 stays open.** The dev evidence is good: live `[2,5,16,16,16,16,16]`, 0 `baseQueue` paths, and the mutant is red. The finding closes only on the production heap row plus PERF-RES in this round.
- **D-29z1282: the auth row is corrected; nothing in the product changes.**
  - `api.studio-token.ts` validates `product`/`file` (l.19, 400) **before** it checks Authorization (l.23, 401) [K8].
  - C's `auth.mjs` in rounds 382 and 383 called the bare URL. Both `auth.json` files show 400 [K9], yet `c-round-382.json` said "no-token 401 verified".
  - **This means the 401 branch has not been checked in a browser in either round.** Row G384-AUTH uses valid parameters.
  - Recorded as B-R383-AUTH-ROW-BARE-URL (Low, process) and as a RETRO input.
- **D-29z1283: the code-reviewer's L1 and Architecture note.**
  - **L1:** after a collection change, a stale `ensureDecoded` may `set` an entry for an old collection. This is not reachable today. It is recorded as A-R383-REVIEW-L1-STALE-ENSURE-DECODED (Low) and assigned to **PERF-13b-ii**, which owns the same region. The guard there checks that the controller and the collection are current before `set`.
  - **Architecture note:** recorded as SIG-R383-SOURCE-LOAD-ORCHESTRATION, joined to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING.
  - **Checkpoint request:** three consecutive rounds changed the same decode → peaks → cache → reset region. B therefore asks root for a bounded checkpoint at the 13b-i / 13b-ii boundary (`b-round-383/root-request-arch-checkpoint-decode-region.md`). It does not block round 384.
- **D-29z1284: order after this round.**
  1. REGRESSION-2026-11-08, at the first planning on or after 2026-11-08.
  2. RETRO. It is due by count (the last RETRO was 369, window 353–368 [K19]). The deadlines tied to "RETRO 384" move with it.
  3. PERF-13b-ii.

  Closing an open Medium comes first, under the bug gate.

**Why this round.** C-R382-01 (Medium) is fixed in the tree, but the evidence that closes it has not run:
- the production heap probe;
- PERF-RES, with live PCM at ready ≈ 31.9 MiB against a target of ≤ 60.

PLAY-REFUSE, the unit mutants and the covering tests also did not run. Without them PERF-13b-i cannot be marked done (Loop V2: `browserVerified=false` is never მზადაა).

**What the user notices:** nothing.

**Read first:**
- `tasks/round-383.md`: the full round-383 contract. It still holds, except where this task amends it.
- `tasks/round-382.md` §1: the behaviour that must not change.
- `c-round-383.md` / `.json`: what already ran.
- `a-round-383.md`: A's runner, SWEEP and heap self-check.
- `lessons.md`: A reads 11 and 28. C reads 38, 56, 57, **59** and 60.

**Not applicable:** reference-first, `product-designer`, the YouTube request and the screen budget. This is a verification round; nothing visible changes.

## Baseline
- **HEAD:** `5745526`, with 11 status lines [K1, K2].
- **Helper:** `storeSourcePeaks` at l.768–769. Its callers are at l.2844 (video audio) and l.4307 (load path) [K3, K4].
- **Reset:** `decodedBuffers.deleteMany(collectionSourceIds)` at l.4264. `decodedBuffers.clear(` has 0 calls [K5].
- **Rows:** DC8 and EV10 exist [K6].
- **Doc 248 l.4:** `**სტატუსი:** In Progress (stage 1 of 2; C round 383 PASS)` [K7].
- **Manifests:**
  - frozen `b-round-383/r384-frozen-sha256.txt`: 1,279 entries, which is every tracked and untracked file except the grant, rc 0 [K16];
  - protected `b-round-318/protected-sha256.txt`, rc 0 [K15].
- **Grant:** `b-round-383/grants-384.txt`, 1 path: doc 248.

## 1. Behaviour that must not change
Everything in `tasks/round-382.md` §1 and `tasks/round-383.md` §1. No source, test, perf or data file changes in this round.

## 2. What A changes (grant: 1 path)
1. **Doc 248, l.4, byte for byte:** `**სტატუსი:** In Progress (stage 1 of 2; C round 384 PASS)`. Per L28, N is the round whose C pass closes the stage.
2. **Nothing else in the doc changes.** Any other line that names "round 383" as the round in which C verifies changes to 384. A lists each such line in the report, or writes "none".
3. **A runs:**
   - `diff` of the doc before and after, pasted into the report;
   - SOURCE-SCOPE: 11 status lines, `r384-frozen` rc 0, protected rc 0.

   **A runs no tests, builds or browser jobs**, because no code changes. No `code-reviewer` is needed (one doc file).

**STOP (L11):** if `r384-frozen` is not rc 0 at the start, A changes nothing and reports the failing paths.

## 3. C: what to verify
C writes `c-round-384.md` and `c-round-384.json` as it goes. **L59 applies:**
- write `c-round-384/progress.json` after **every** row;
- run rows until each has a result, or until the job's real time limit stops the phase;
- a BLOCKED-for-time report names the real stop signal.

Round 383 ended with neither `progress.json` nor the L57 fields [K11]. The L57 fields are `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, and `mutantRedOnSketch`: "none: B ran no sketch; perf rows stay record (13b-ii flips them)".

**Run order**, by weight of evidence, so that a second time-out still settles the Medium:
- **Two production builds:** row 3's (served on 5190, then stopped) and row 5's own, because its `webServer` rebuilds and serves on 5188 (`reuseExistingServer: false`). Never run anything else during row 5 (L38).
- Run perf and mutants alone, after a warm-up (L38).
- Make copies, and run destructive commands, only under `c-round-384/` (L60).

**Locator rule** (unchanged): the library preview button has no `aria-label`, and its text toggles between `Preview` and `Stop` [K20]. The transport Stop has `aria-label="Stop"`. Record the `outerHTML` (first 120 characters) of every Stop clicked.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all`; from `store/`, `sha256sum -c --quiet b-round-383/r384-frozen-sha256.txt` and the protected manifest | 11 lines; both rc 0. If r384 is not rc 0, the carried rows below do **not** carry: C re-runs them and reports the paths |
| 2 | **DOCS-L4** | `sed -n 4p` doc 248; A's diff | l.4 byte for byte as in §2.1; the diff touches only the lines A listed |
| 3 | **HEAP-RETAINERS-PROD** | `npm run build`, then `npx remix-serve build/server/index.js` with `PORT=5190`. Copy `c-round-383/heap-retainers.mjs` to `c-round-384/` (it imports `../c-round-382/lib.mjs` and sets the viewport explicitly via `open(base, 1440, 900)`). Then `node c-round-384/heap-retainers.mjs http://127.0.0.1:5190 <abs>/c-round-384/heap-prod-1440.json`, after one warm-up load. Stop the 5190 server before row 5 | At ready after GC ×2, live = exactly `[2,5,16,16,16,16,16]`, and 0 `native:AudioBuffer` paths contain `baseQueue` |
| 4 | **HEAP-LIVE-1280** | The same probe at 1280×720, on prod (and on the dev server, if time allows): a second copy with only `open(base, 1280, 720)` changed. Record the viewport in the output file name | Live list as in row 3 |
| 5 | **PERF-RES** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts`, alone. It builds and serves itself on 5188 | 0 FAIL, 0 problems, 22/22 asserts; export bytes 29,189,420 at 1× and 58,378,796 at 6×. **Record:** `pcm-live-mib-ready` ≈ 31.9, `count-ready` 7, `decode-mib-ready` 0, after-add ≈ 69.0 / 8, after-export delta ≈ +37.1. A value that differs and is not explained per buffer is a finding |
| 6 | **MUTANTS-UNIT** | `TREE=<abs c-round-384/tree> OUT=<abs c-round-384/mutants-out> MODE=unit bash a-round-383/mutants/run-mutants-383.sh` on a `cp -a` copy (`node_modules` symlinked) | All 19 red on their named rows (16 from round 382 + MU-383-RESET-CLEAR→EV7, MU-383-NONFUNCTIONAL-PEAKS→EV10, MU-383-DELETE-MANY-ALL→DC8); `restored` printed |
| 7 | **PLAY-REFUSE-BROWSER** | `c-round-382/playrefuse.mjs`, adapted, at 1440×900 with CPU 6× | As in round 382: if the window is caught, the refusal text is exact; the second Space starts the hero |
| 8 | **UNIT** | The 35 covering files (`a-round-383/covering-hits.txt`); the 10 C-DEMO files (`b-round-381/fixture-grants-382.txt`), with `sha256sum -c a-round-383/cdemo-sha-before.txt`; the perf lib with `npx vitest run --config <loop>/b-round-334/vitest.perf-lib.config.mjs` | All pass; C-DEMO sha rc 0 |
| 9 | **G384-AUTH** | Fresh anonymous context, both viewports: `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem.mp3` with **no** Authorization header | `auth_user` null and the workspace opens; "Sign in required" with 0 `audio[src]`; the token API returns **401** with body `Please sign in to access Studio.` and no token. The bare URL returning 400 is recorded only as the validation order. The fake bearer goes under `blocked` (no backend) |
| 10 | **EVICT-B2-COUNT** | Reuse B's `b-round-382/probe/preview-stop-check-lib.mjs` (it already counts `stop()` calls as `stops`), copied to `c-round-384/` with its import changed to `../c-round-382/lib.mjs`, and pointed at the dev server; library-preview Stop, 1440×900 | At least 1 `stop()` call; 101.35 s not live afterwards. Corroboration only: C-R382-02 is already closed (D-29z1281). A contradiction reopens it |
| 11 | **CLAIMS** | `bash b-round-383/claims-384.sh`, compared with `b-round-383/claims-384-output.txt` | Differences only in K7 (l.4 → 384). No `MISSING`. Each difference explained |
| 12 | **SOURCE-SCOPE** (end) + **L57** | As in row 1; then `python3 -I tools/l57-check.py c-round-384.json c-round-384/l57-check.txt` | 11 lines, both rc 0; l57-check rc 0. `store/build/` is gitignored and must not appear in status |

**Rows that carry from round 383 without a re-run** (the tree is byte-identical, shown by row 1). In `c-round-384.json`, list them under `"carried"` with their evidence paths:
- SWEEP;
- the decoded-buffer UNIT files (23/23);
- HEAP-RETAINERS on dev at 1440 (`heap-dev-1/2.json`);
- HEAP-MUTANT (`heap-mutant-2*.json`);
- EVICT-BROWSER and the EVICT-B2 live lists at both viewports (`b2.json`);
- EXPORT-BROWSER, sha `5fadd97a…8202` (`exp383.json`);
- the `/studio-lab` and `/studio/middle-east` halves of G383-AUTH;
- the DOCS rows other than l.4;
- RESET-UNREACHABLE.

**`browserVerified`:** true only if rows 3, 4 (prod), 5, 7, 9 and 10 ran in this round, and row 1 kept the round-383 browser rows valid.

**Verdict:**
- **PASS** needs every row 1–12 PASS.
- **C-R382-01** closes on rows 3 and 5.
- A failing row is a finding with an `origin`. Rows that did not run make the round BLOCKED, never PASS.

## 4. Neighbour risk
- **The production build** could behave differently from dev, for example through minified closure contexts. Rows 3 and 5 exist for this.
- **Status pollution:** `npm run build` writes `store/build/`, which is gitignored. Any new status line is a SOURCE-SCOPE FAIL.
- **Nothing else.** No code changes.

## 5. Order after this round (D-29z1284)
1. REGRESSION-2026-11-08 (at the first planning on or after 2026-11-08).
2. RETRO (due by count; the deadlines tied to "RETRO 384" move to it, including ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING and PERF-11c-iii-d/e).
3. PERF-13b-ii, which includes the A-R383-REVIEW-L1 guard.
4. PERF-13c, PERF-13d, PERF-14 and PERF-15.
5. SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
6. STEM-LANES, then SYS-1…3, then STORE-2b…5.
7. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
8. The phase-2 entries, under the skip rule.

If round 384 finds a Medium or higher, its fix comes first.

## 6. Claims
Run `bash b-round-383/claims-384.sh` from the loop root. The output at planning is in `b-round-383/claims-384-output.txt` (0 `MISSING`).

| Tag | Claim |
|---|---|
| K1 | gate 383 `skipped` (C BLOCKED); HEAD `5745526` |
| K2 | 11 status lines |
| K3 | helper `storeSourcePeaks` l.768, the only updater at l.769 |
| K4 | callers l.2844 and l.4307 |
| K5 | `deleteMany` at l.4264; 0 `decodedBuffers.clear(` calls |
| K6 | DC8 and EV10 present |
| K7 | doc 248 l.4 (round 383 text) |
| K8 | token route: 400 at l.19, before 401 at l.23 |
| K9 | auth.json 382/383 = 400 at both viewports; bare URL in both `auth.mjs`; the 382 report's "401 verified" text |
| K10 | C round-383 evidence files exist |
| K11 | C round 383: no `progress.json`, no `l57-check.txt`, no L57 fields |
| K12 | `b2.json`: library Stop releases; Add, Undo and Redo behave as described; transport Stop keeps the buffer live |
| K13 | A round-383 evidence files; 35 covering hits |
| K14 | tools and configs exist (perf-lib config, heap probe, l57 checker, C-DEMO list, C-DEMO sha) |
| K15 | protected rc 0 |
| K16 | frozen r384: 1,279 entries, rc 0; grant = doc 248 |
| K17 | frozen r383 still rc 0 |
| K18 | regression 2026-11-05; lessons 60 lines |
| K19 | last RETRO 369, window 353–368 |
| K20 | library preview strings `Preview`/`Stop` |
