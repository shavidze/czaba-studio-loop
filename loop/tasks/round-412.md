# Round 412: PERF-15b-i fix-up — make the demo peaks generator deterministic (A-R411-REVIEW-M1), then verify the whole PERF-15b-i stage in full (stage 2 of 3 of PERF-15)

**Planned by:** B, at the round 411 → 412 planning, 2026-11-08 (`b-round-411.md`). The advisor was used after orientation and before hand-off. The round 411 task is archived as `tasks/round-411.md`. It stays the contract for everything this task does not change.

## Read first
- `lessons.md` in full. The most relevant lessons are L10, L11, L22, L26, L28, L29, L31, L56, L57, L58 and L59.
- This file, then `tasks/round-411.md` §1 (D-29z1427 contract, the Reference table and the Side effects table). Those sections still hold.
- Primitives: `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`, `AUDIO_ARCHITECTURE.md`, plus `docs/implementation/TEMPLATE.md`.
- **Claims:** run `bash b-round-411/claims-412.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-411/claims-412-planning-output.txt`, with empty stderr.
  - Output on the committed sketch scratch: `b-round-411/claims-412-sketch-output.txt`.
  - The two differ only on the lines in `b-round-411/claims-412-planning-vs-sketch.diff`. In the sketch output, K1 and K2 differ only because the scratch has its own commits.

## Baseline: HEAD `328db74` plus round 411's uncommitted tree
- Gate 411 was **skipped** ("C taskStatus FAIL"), and gate 410 published `328db74` [K16]. HEAD is `328db74…` [K1].
- **The working tree is not clean.** It holds round 411's work: B's v5 patch, applied byte-for-byte by A, plus A's docs 264 and 263. That is 7 ` M` + 5 `??` = 12 status lines, all inside the grants [K2, K2b]. **Keep that work. Do not revert it.** This round adds a 2-file delta on top of it.
- **Frozen:** `b-round-411/r412-frozen-sha256.txt` has **1,300** entries (every tracked file except the 7 tracked grants), and `sha256sum -c` gives rc 0 [K3].
- **Protected:** all 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4].
- **No root patch is pending:** neither `cloud/root-commits/` nor `root-deps-request.json` exists at planning. If K1 at A1 is not `328db74`, A re-runs the claims and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 411 FAILed on one Medium only.** A's `code-reviewer` found **A-R411-REVIEW-M1**, and A stopped as L11 requires.
  - **Where:** the generator opens `new AudioContext()` with no rate [K7: `unpinned-ctx 1`]. PS17 calls `precomputedPeaksMatchDecodedLength(..., decodedLength, 44100)` with a hardcoded rate and never reads the meta's `sampleRate` [K8: `hardcoded-44100-match 1`].
  - **Effect:** a regeneration on a 48 kHz host would give PS17 a false red. C confirmed this by reading the code.
  - **Not affected:** the committed files and the runtime. C round 411 ran rows 3, 4, 5a and 7 in the real browser on this exact tree, and all passed (K20; `c-round-411.json` `browserVerified` true).
- **Ruling (L10, D-29z1432): option (b).** M1 is fixed, not re-rated:
  - two reviewers rated it Medium;
  - the 2026-10-23 bug gate fixes Mediums now;
  - doc 264 promises regeneration that reproduces the files exactly, and the fix is small.

  Option (a), re-rating M1 as Low and re-dispatching v5 unchanged, is rejected.
- **Planning miss (B):** the v5 sketch review approved code that A's reviewer then found a Medium in. Under L58, an unruled Medium on B's sketch is a planning failure. It is recorded as **B-R411-SKETCH-M1-MISSED**, an input for RETRO 416. Also, `b-round-410/sketch-review.md` l.2 named the wrong sha (INFO-A411-SKETCH-REVIEW-HEADER). This round's `b-round-411/sketch-review.md` names the dispatched sha on line 1 [K13].
- **After this round passes,** PERF-15b-i is done and 15b-ii (the purchased adapter `peaksUrl`, the streamed-bytes cap, the Firefox probe) closes PERF-15.
- **Schedule:** REGRESSION-2026-11-10 is not due yet [K17]. RETRO is at round 416.
- **Open Criticals and Highs:** none. The open Mediums are root, manual or `awaiting_user` only.

## 1. Rulings (B)

### D-29z1432: the fix (sketch v6.1)
1. **`scripts/peaks/generate-demo-peaks.mjs`** (M1, A-R411-REVIEW-L3, tech-lead L-c):
   - **Fixed rate:** `const sampleRate = 44100;`. The context is opened as `new AudioContext({ sampleRate: contextRate })`, and the script throws if `ctx.sampleRate` differs.
   - **Error handling:** a non-ok audio response throws (`if (!response.ok) throw …`). The browser is closed in a top-level `try { … } finally { await browser.close(); }`.
   - **Style:** the channel `for` loop gets braces.
   - **All-or-nothing writes:** the peaks files and the meta are written only after both decodes succeed.
   - **Result:** regenerating on this runner gives **byte-identical** `public/peaks/*.peaks.json` and `scripts/peaks/demo-peaks-meta.json` [K10]. **A never regenerates the files.** C may regenerate them only in a scratch copy (row 6b).
2. **PS17** in `app/data/__tests__/studio-lab-demo.test.ts` (M1, A-R411-REVIEW-L1, tech-lead L-a):
   - `readPeaksMeta` also returns `sampleRate`. PS17 asserts it is `44100` (the generator's pin) [K8].
   - PS17 also checks the file header: its `sample_rate` equals the meta rate, and its `samples_per_pixel` equals `sampleRate / PEAK_BUCKETS_PER_SECOND` [K8].
   - The length match uses the meta rate, and the 48 kHz cross-check is scaled from it.
   - A small `numberField` helper replaces the repeated descriptor reads. It uses no type assertion and no `any`.
   - PS17's title is updated. Rows PP8, PP9, PS16 and LPA3b are unchanged.
3. **No runtime file changes** [K11 = 0]. The browser behaviour is exactly round 411's.

### Rulings on the remaining Lows (no code this round)
| Id | Ruling |
|---|---|
| A-R411-REVIEW-L2 (sha256 in the meta) | → 15b-ii, as a candidate, together with TL-R411-L9 (the meta `file` field) |
| A-R411-REVIEW-L5 (doc 264 l.31: a bearer header added by an injected `SourceFetch` still works [K23]) | → 15b-ii, which adds a test row for it. A rewords doc 264 l.31 to "per the tech-lead ruling D-29z1427 item 4; tested in 15b-ii" |
| TL-R412-L-b (`rate / 100` in the browser-side script) | Kept. The `.mjs` script cannot import TS, and PS17 ties it to `PEAK_BUCKETS_PER_SECOND`. Doc 264 says so |
| TL-R412-L-d, L-e (`close()` in a finally) | Low, kept: it is a dev script → `deferred_low_polish` |
| TL-R412-L-f (byte identity holds only on this runner and Chromium build) | Doc 264 wording (A, below) |
| A-R411-REVIEW-L4 (doc tense) | Already fixed by A in round 411 |
| Architecture note (the URL pairs live in 4 places; `.then` without `.catch` in `ArrangementContext.tsx`) | Backlog signal SIG-R411-PEAKS-URL-COPIES; not scheduled |

### Reference
This round is a test and tooling fix-up, so reference-first does not apply. The stage's Reference table (Live 12 manual 5.1.2) is in `tasks/round-411.md` §1. C did not run its row 9 in round 411, so C runs it this round.

### Doc 264 (granted whole) and doc 263 (l.4 unchanged [K6])
A edits `docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md`:
- **l.4, byte-exact (L28, re-dispatch):** `**სტატუსი:** In Progress (stage 2 of 3; C round 412 PASS)`.
- **Sketch reference (today l.17 [K22]):** cite both the v5 patch and `tmp/studio-real-loop/b-round-411/sketch-412-delta.patch.txt` (v6.1, sha256 `833196f8…`).
- **პრობლემები და გადაწყვეტები:** add one Problem → Solution bullet for A-R411-REVIEW-M1 (the fixed 44.1 kHz context; PS17 reads the meta rate and ties the header to it). Add one for L3/L-c (`response.ok`, `finally`, writes after both decodes).
- **Regeneration wording (L-f):** say regeneration was byte-identical **on the loop runner's HeadlessChrome 143 build**. On other CPUs or Chromium versions it may differ by one quantisation step, while the lengths and rate stay the same and PS17 stays green.
- **Generator note (L-b):** `rate / 100` mirrors `PEAK_BUCKETS_PER_SECOND`, and PS17 enforces it.
- **l.31 (L5):** reword as in the Lows table above.
- **PS17 description:** describe the new checks.
- **"A-ს შემოწმებები":** round 412 and your own numbers.
- **The mutant block:** replace it with the 13 `MU-` lines of `b-round-411/mutants/summary.txt`, copied byte for byte.
- **No line in doc 264 may say `C round 411`.**

Doc 263 stays exactly as it is; its l.4 is already `In Progress (stage 1 of 3; C round 410 PASS)` [K6]. After the round, K6b stays at 9 `In Progress (stage` docs, with `pending` 0.

### Ruling lines (L4)
- **Patch files:** "apply the delta byte-for-byte" wins over any style preference of A's reviewer. A Medium+ in the delta logic is a STOP (L11), not an edit.
- **The 8 other patch files from round 411:** they stay byte-identical to v5. Row 2 checks the whole 10-file result against the cumulative patch.

### D-29z1433: the dispatched patch (L58: reviewed = dispatched)
- **Delta:** `b-round-411/sketch-412-delta.patch.txt` (v5 → v6.1), sha256 `833196f8ccf086ab…` in `b-round-411/sketch-dispatched.sha256`. It touches 2 files [K5], and `git apply --check` is clean on the current tree [K5 `yes`]. **A applies it byte-for-byte and does not edit those 2 files afterwards.**
- **Cumulative:** `b-round-411/sketch-412-cumulative.patch.txt` (HEAD → v6.1, 10 files). Applied to `git archive HEAD`, it equals the scratch [K12]. C uses it in row 2.
- **Review:** `b-round-411/sketch-review.md`. Line 1 names the dispatched sha [K13]. `tech-lead` gave v6 APPROVE WITH LOWS and the v6.1 delta APPROVE WITH LOWS, with no Medium or higher.
- **Evidence on the committed scratch `/tmp/b412`:**
  - `tsc` rc 0, Biome on the test file rc 0, and covering 24 files **425/425** [K19]. The slowest test is 2,185 ms against `render-budget`'s 15,000 ms (15 %). The detail-panel row is 1,652 ms against the 5,000 ms default (33 %). Nothing is above 50 % (L31, `sketch-logs/slowest.txt`).
  - **Full vitest on v6: 264 files, 3,911/3,911, rc 0** [K19]. v6.1 changes only one PS17 assert and the generator's write order. Both are covered by the covering run and the mutants.
  - **Mutants: 13/13 red,** with pristine rc 0 before and after and 0 scratch status lines [K15]. On the **v5** test, the two new rate mutants (MU-412-META-RATE-48K and MU-412-HEADER-RATE-48K) **survive**, which shows the new checks add coverage [K15].
  - **Regeneration identity:** 3 of 3 files byte-identical [K10].

### Side effects (L49)
| Effect | Ruling | Proof |
|---|---|---|
| A real 48 kHz regeneration (pin removed) now fails PS17 on an explicit `expected 48000 to be 44100` | Intended: it shows the pin was removed | MU-412-REGEN-48K |
| The generator stops on a non-ok audio response or an unpinned context, where it used to write garbage | Intended | Code (dev script; not linted, L30) |
| No runtime, browser or screen change | — | K11 = 0; rows 3–5 and 10 |

## 2. What A changes
1. Run the claims at the start (A1).
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-411/sketch-412-delta.patch.txt`, then `git apply` the same file. **Do not edit those 2 files after that, or any other patch file.**
3. Edit doc 264 as ruled above. Doc 263 is not touched.
   - **Restore fallback:** if K2 is `total 0` at A1 (the round-411 tree was not restored), apply `b-round-411/sketch-412-cumulative.patch.txt` on the clean HEAD instead (it applies to `git archive HEAD` [K12]). Then write doc 264 from `tasks/round-411.md` plus this file, and set doc 263 l.4 per `tasks/round-411.md`. Report it as INFO.
4. Run the §4 checks. Write `a-round-412.md` as you go: changed files, checks with rc and file paths, reviewer findings, and a For B section (include any Architecture note).

## 3. Grants (`b-round-411/grants-412.txt`, the same 12 paths as round 411)
- **Delta this round:**
  - `scripts/peaks/generate-demo-peaks.mjs`
  - `app/data/__tests__/studio-lab-demo.test.ts`
- **Doc:** `docs/implementation/2026/quarter-IV/264-perf-precomputed-peaks-demo.md` (whole).
- **Unchanged from round 411, kept as they are:**
  - `app/data/studio-lab-demo.ts`
  - `app/lib/arrangement/precomputed-peaks.ts`
  - `app/lib/arrangement/__tests__/precomputed-peaks.test.ts`
  - `app/components/arrangement/ArrangementLibraryPreview.tsx`
  - `app/lib/arrangement/__tests__/library-preview.test.tsx`
  - `public/peaks/middle-east.peaks.json`
  - `public/peaks/hero-music.peaks.json`
  - `scripts/peaks/demo-peaks-meta.json`
  - `docs/implementation/2026/quarter-IV/263-perf-precomputed-peaks.md`
- **Nothing else:** no protected, auth, route, context, config, package or other file.
- At the end, `git status --short --untracked-files=all` shows the same 7 ` M` lines and 5 `??` lines.

## 4. A's checks
Under the speed rules, the full suite and verify belong to the gate.

| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-411/claims-412.sh` at start | Equals `claims-412-planning-output.txt`; stderr empty |
| A2 | `npm run typecheck`; `npm run lint`; `npx biome check app/data/__tests__/studio-lab-demo.test.ts` | rc 0 each |
| A3 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-411/sketch-logs/covering.txt)` (24 files) | 425/425 pass. Report the slowest test against its declared timeout. L31: none may be above 50 %; otherwise STOP |
| A4 | Claims at end | Differs from planning only on K5 (`no`), K6 (doc 264 l.4 with 412, the mention count, and `doc264-mutant-lines 13`), K7, K8, and K22/K23 (they may change with A's doc 264 edit). K7 and K8 equal `claims-412-sketch-output.txt`. K3 stays 1,300 rc 0, and K9 and K10 are unchanged |
| A5 | `code-reviewer` on the 2 delta files and doc 264 | No Critical, High or Medium in the delta logic. A Medium+ there is a STOP (L11). Lows that `b-round-411/sketch-review.md` already rules are not new. Doc findings are fixed in the doc |

## 5. C's acceptance (full run, the whole PERF-15b-i stage)
This is not a STOP round. Run every row (L22 does not apply). Write `c-round-412.json` with **all L57 fields**. They include:
- `mutantRedOnSketch` = `b-round-411/mutants/summary.txt`;
- `mutantRedOnTree`, `gateChecksNamed`, `gateChecksRunOnSketch` and `chainHeadGateRunGreen`;
- `affectedChecksNamed` and `affectedChecksRunOnSketch`;
- one result per row.

Run `python3 -I tools/l57-check.py c-round-412.json c-round-412/l57-check.txt` before hand-off.

**Order (L59):** row 6, then row 4, then rows 3 and 5. Write `c-round-412/progress.json` after every row.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start** | Claims equal the planning output except the A4 lines. Status = the 12 granted paths. Frozen 1,300 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY** | Apply `b-round-411/sketch-412-cumulative.patch.txt` to a `git archive HEAD` scratch and `cmp` its 10 files against the working tree: 0 differences |
| 3 | **WAVEFORM-BEFORE-READY** (browser, 1440×900 and 1280×720, working tree, `:5173`) | As `tasks/round-411.md` row 3: `node b-round-410/probe/peaks-before-ready-411.mjs http://127.0.0.1:5173 <out>.json <WxH> real`. **Held:** `rects` 96, `ariaDisabled` "true", `opacity` "0.4", `cursor` "not-allowed", `tabIndex` "-1", `title` "Preview — wait for the sound to load". **Ready:** `rects` 96, "false", `title` null, "pointer", "0". `middleEastBegins` 0 and `heroBegins` 0. `peaksRequests` is exactly the 2 `/peaks/*.peaks.json` URLs. `pageErrors` []. **New this round:** C compares the held and ready `heights` arrays itself; the maximum absolute difference must be ≤ 0.0001, written down per viewport. Keep the screenshots |
| 4 | **FALLBACKS** (browser, both viewports) | As `tasks/round-411.md` row 4 (modes `404` and `8bit`) |
| 5 | **NO-REGRESSION** (browser, both viewports) | (a) `node b-round-408/lane/lane-actions-probe.mjs …`: `ok` true, 8/8. (b) `node b-round-409/probe/peaks-probe-410.mjs …`: every source has 96 columns, `pageErrors` [], and `peaksRequests` is exactly the 2 peaks files. Its `ok` false is expected (round 411's side-effect table). **Row (b) was not run in round 411.** |
| 6 | **UNIT + MUTANT** | (a) The A3 set passes, 425/425. (b) **Mutants:** on a committed scratch copy of the working tree, run `S=/tmp/c412-scratch OUT=<loop>/c-round-412/mutants FIX=<loop>/b-round-411/fixtures/regen-48k python3 -I b-round-411/mutants/run.py`. Never use another `OUT`. Pass = 13/13 RED, each naming its expected row; pristine before and after rc 0 with `failed []`; `SCRATCH-STATUS 0 lines`. (c) **Regeneration (scratch only, never in `store/`):** in the same scratch, run `node scripts/peaks/generate-demo-peaks.mjs` with `:5173` up. Then `sha256sum` the 3 output files: they must equal the working tree's files, and the scratch `git status` must be 0 lines. A difference on this runner is a FAIL of M1 |
| 7 | **AUTH** (browser, fresh context, no credentials) | Demo `/studio-lab` opens with `auth_user` null and no "Sign in required". `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token?product=middle-east&file=a.mp3` without auth gets 401. The fake-bearer path is BLOCKED (backend unavailable in the cloud) |
| 8 | **DOCS** | **Doc 264:** l.4 is byte-exact (412). It has the 7 TEMPLATE headings in order (L26). Its `MU-` lines equal the 13 in `b-round-411/mutants/summary.txt`. It has no `C round 411`. It contains the M1 Problem → Solution bullet and the runner-scoped regeneration wording. **Doc 263:** l.4 is unchanged (`stage 1 of 3; C round 410 PASS`). **Test rows:** PP8, PP9, PS16, PS17 and LPA3b exist in their test files. **Sweep:** `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. No doc other than doc 264 (this round) and doc 263 l.4 (round 411) differs from HEAD |
| 9 | **REFERENCE** (Live 12 manual 5.1.2; the table in `tasks/round-411.md` §1) | Each point is a match or a listed deviation, using the evidence from rows 3 and 4. Report the Ableton status separately |
| 10 | **SCREEN BUDGET** (L39) | `git diff HEAD -- app/components/arrangement/ArrangementLibraryPreview.tsx` shows exactly 1 insertion and 0 deletions, containing `title=`. No JSX text node is added |
| 11 | **SOURCE-SCOPE end + L57** | As row 1, at the end. Claims at end equal claims at start, and `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch run is `b-round-411/sketch-logs/full.json` (v6, 3,911/3,911) |

**Notes on the rows:**
- **Retries (rows 3, 4, 5 and 7):** a first-load timeout on a cold server is an environment problem (L38: warm `/studio-lab` once in a browser first). Retry at most twice; it is never a FAIL.
- **Row 3, scope:** this proves Chromium only. Firefox and Safari belong to 15b-ii (TL-R411-L3).
- **Row 6, the scratch:**
  1. Copy the working tree, including `public/` and `scripts/`, to `/tmp/c412-scratch`, and symlink `node_modules`.
  2. Run `git init && git add -A && git commit`.
  3. Row 6c writes inside the scratch only, through the generator's own path resolution.
- **Do not overlap jobs (L38):** never run vitest while a browser probe runs.

**Neighbouring behaviour that could break:** the other 16 rows of `studio-lab-demo.test.ts` (DL1–DL-BPM, PS15, PS16). The `numberField` helper replaces the descriptor reads in `readPeaksMeta`, so a wrong key would turn PS17 red, not green (MU-411-MP3-SIZE-UNTIED, MU-411-META-LENGTH-DRIFT).

## 6. For C: the mutants (`b-round-411/mutants/run.py`)
The 10 MU-411 mutants of `tasks/round-411.md` §6 run unchanged. Three new ones:

| Mutant | Site | Expected red |
|---|---|---|
| MU-412-META-RATE-48K | The meta file's Middle East `sampleRate` is 48000; the peaks file is unchanged | PS17 (survives on the v5 test) |
| MU-412-HEADER-RATE-48K | The Middle East file header says `sample_rate` 48000 and `samples_per_pixel` 480 | PS17 (survives on the v5 test) |
| MU-412-REGEN-48K | All 3 files are replaced by a real 48 kHz regeneration (`b-round-411/fixtures/regen-48k/`, made by the generator with the pin set to 48000) | PS17 |
