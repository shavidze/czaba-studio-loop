# Round 330: PERF-DRAG-PREVIEW stage c1 fix-up. Memoise the project-end leaf (C-R329-01) and guard the loop part of the overview extent (C-R329-02)

**Planned by:** B, at the round 329 → 330 planning, 2026-11-04.

**Decisions** (all in `backlog.json` → `decisions_log_b`, v289; D-29z954…D-29z961):
- **D-29z954: round 329 closed as FAIL, from C's evidence.** C round 329 is `taskStatus` FAIL with `browserVerified`/`realVerified` true. Every behaviour and browser row passed and equals HEAD: CLAIMS, SOURCE-SCOPE, UNIT ×3, MUTANT, END-LIVE, DRAG-NAMES, D-ROWS with the export sha, C's own viewport-bound probe, G329-AUTH and DOCS. Only PERF bullet 2 (the equality clause) failed. Gate 329 was skipped ("C taskStatus FAIL"), so nothing was published. HEAD stays `dae81bf`. A's 4-file tree is kept and is the base of this round: no revert, no re-apply. Stage c1 is **not done**.
- **D-29z955: the ruling on C-R329-01 (Low, origin B spec).** The leaf gets `memo`; the alternative, "accept +1 as the new baseline", is rejected.
  - B's round-329 sketch had added a non-memo leaf and asserted "equal to round 328" without running the perf spec (an L58 breach). The leaf re-renders on every `ArrangementTransport` render (click, play toggle, zoom, range start).
  - Accepting the +1 would keep an avoidable render on every transport render, and it would rewrite a row to fit the result.
  - The shape follows the file's existing convention (`function XInner` + `const X = memo(XInner)`, as for the 7 memo wrappers in `StudioWorkspace.tsx`). The render-log key therefore becomes `ArrangementProjectEndTextInner`.
  - B found that an inline `memo(function ArrangementProjectEndText …)` stops the jsdom render log from seeing the leaf at all: DP21's `toBe(2)` read 0 (`b-round-329/inline-memo-attempt.txt`). That would make DP21/DP23 vacuous, so the inline form is not allowed.
- **D-29z956: C-R329-02 (Low, test gap; = A-R329-REVIEW-LOOP-EXTENT)** is fixed here as DP24. `dragPreviewFixture` and `mountPreviewWorkspace` gain an optional `loop` parameter (default `null`, so every existing caller is unchanged).
- **D-29z957: A-R329-REVIEW-VIEWPORT-BOUND (Low, jsdom test gap)** → `deferred_low_polish`. C's browser probe C-VIEWPORT-BOUND covers that branch at both viewports (round 329 PASS, `c-round-329/vp/vp-summary.txt`), and it runs again here. A jsdom row would need resize plumbing that is outside this fix-up.
- **D-29z958: doc 232 l.4.** C flagged that the round-329 wording ("C round 329 PASS") is untrue. The new line states only what is true when A writes it: `**სტატუსი:** In Progress (stage c1 of a, b, c1–c5; round 330 fix-up, C verifies)`.
- **D-29z959: signals.** A's Architecture note ("keep: state lives where it is rendered") is a signal only; no checkpoint trigger is met. INFO-C329-FULLSCALE (20 full-scale samples in the demo export, the same at HEAD) → signal, linked to C-R178-EXPORT-CLIPS-AT-0DB; not scheduled.
- **D-29z960: this task.**
- **D-29z961: the next round** is REGRESSION if it is planned on or after 2026-11-05 (`regression-last` 2026-11-02 [K9]). Otherwise it is stage c2 (D-29z950). C-R328-01 (DP20) closes when this round gets C PASS and the gate publishes it.

**Read first:** `lessons.md`: L11, L23, L29, L31, L37, L56, L57, L58 (L58 gained the C-R329-01 clause in this planning).

**L29 note:** untagged code text in this task is an expected value, a new name, a row id or a loop-artifact path. Facts about `store/` carry `[K#]` (§7).

## Baseline
- HEAD is `dae81bf` (gate 328, published). The tree is **A's round-329 tree**: 4 modified files (`StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `drag-preview-render.test.tsx`, doc 232), nothing untracked [K1, K2]. Protected files: 11/11 OK [K8]. No dependency change.
- Round 330 publishes rounds 329 and 330 together after C PASS. C therefore re-runs every browser and perf row on the final tree, not only the changed ones.

## 0. Why this round, and B's evidence
- **The failed clause** (C round 329, `c-round-329/perf-rowcmp-vs-c328.txt`): range `move-components-max` 30 → 31 and `-per-move` 9.233 → 9.25; click 106 → 107; zoom.1 99 → 100; zoom.30 244 → 245; play start/stop 90 → 91. C traced the cause in the browser: the clip-click commit renders 105 on A and 104 at HEAD, and the only extra name is `ArrangementProjectEndText` (`c-round-329/click-names-vs-head.txt`).
- **B's sketch** (`b-round-329/sketch/sketch.patch.txt`; scratch `/home/runner/b329-scratch`, a copy of A's tree; `git apply --check` is clean on `store/`). Two files:
  - `ArrangementTransport.tsx`: `memo` joins the `react` import [K3]. The leaf is renamed `ArrangementProjectEndTextInner`, and `const ArrangementProjectEndText = memo(ArrangementProjectEndTextInner);` follows it [K4]. The JSX use and the span are unchanged.
  - `drag-preview-render.test.tsx`: `ArrangementLoop` joins the type import. The fixture and the mount get an optional `loop` parameter. DP21's three `rendersOf('ArrangementProjectEndText')` keys become `…Inner` (a rename; no `expect(` is removed). DP23 and DP24 are appended [K6].
- **jsdom, on the sketch:** the 10 covering files (the 9 of `b-round-328/k13-covering-files.txt` plus `status-preview-store.test.ts`): **119/119** (`sketch-unit.log`). Typecheck rc 0. Biome is clean on the two files.
- **Full vitest on the sketch:** PRECHECK_FULL [K14].
- **HEAD parity (A's round-329 tree + only the sketch's test hunk):** HEAD_PARITY [K16].
- **Mutants** (`b-round-329/run-mutants.sh`; `mutants-summary.txt`) [K15], every one red:
  - B328's five, unchanged: MU-WORKSPACE-RAW-END → DP21, DP22; MU-WORKSPACE-COMMITTED-END → DP22; MU-OVERVIEW-COMMITTED-END → DP21, DP22, DP24; MU-CLEAR-ANY-PREVIEW → DP20; MU-TRANSPORT-SUBSCRIBES → DP2, DP9a, DP21.
  - **MU-ENDTEXT-NO-MEMO** (the round-329 code: `const ArrangementProjectEndText = ArrangementProjectEndTextInner;`) → DP23.
  - **MU-OVERVIEW-NO-LOOP** (C's C-MU-OVERVIEW-NO-LOOP: the wrapper passes no loop) → DP24.
  - Restored: 26/26.
- **L58 memo re-check** (every positive control the new memo could silence): `grep` finds no `ArrangementProjectEndText…).toBeGreaterThan` anywhere in `app/**/__tests__` [K11]. The 4 test files that read the leaf or its testid are all in the covering set and green.
- **Perf, on a production build of the sketch** (C's command, the interactions spec alone, its own Vite `cacheDir`): PERF_SKETCH [K17].
- **Browser names probe on the sketch** (dev server :5198, own `cacheDir`): NAMES_SKETCH.
- **Consults:** none this round. This is a one-line fix-up of a ruled perf contract with B's own measurements; `tech-lead` and `performance-optimizer` set the c1 contract at round 328 and nothing in it changes.
- **Reference-first, product-designer, screen budget:** not applicable. This is a perf fix-up and nothing visible changes.

## 1. Contract
**Apply `b-round-329/sketch/sketch.patch.txt` with `git apply` from `store/`, on top of A's round-329 tree.** §1.1–§1.2 describe that patch. Do not retype it: the mutants and the claims match its exact lines. §1.3 (doc 232) is the only edit by hand. If the patch does not apply, STOP.

1. **`ArrangementTransport.tsx`:** `memo` is added to the `react` import. `function ArrangementProjectEndText(…)` becomes `function ArrangementProjectEndTextInner(…)` with the same body, followed by `const ArrangementProjectEndText = memo(ArrangementProjectEndTextInner);`. No other line changes. Do **not** use the inline form `memo(function ArrangementProjectEndText …)`: the render log cannot see it (D-29z955).
2. **`drag-preview-render.test.tsx`:**
   - `dragPreviewFixture(clips, loop = null)` sets `loop`; `mountPreviewWorkspace(clips = AUDIO_CLIPS, loop = null)` passes it on.
   - DP21: the three `rendersOf('ArrangementProjectEndText')` keys become `rendersOf('ArrangementProjectEndTextInner')`. The values do not change.
   - **DP23** (closes C-R329-01): on `LATE_AUDIO_CLIPS`, `selectClip('c1')` and then `selectClip(null)` each render `ArrangementTransport` (> 0) and `ArrangementProjectEndTextInner` 0 times, and the end text is unchanged.
   - **DP24** (closes C-R329-02): with `loop` {start 2, end 20, enabled}, `data-extent` is `20.000` at rest and after a move that pushes the end to 12.750 (the end text shows it). A move far past the loop gives an extent above 20.
   - A may strengthen these rows, never weaken them.
3. **Doc 232:**
   - l.4 becomes exactly `**სტატუსი:** In Progress (stage c1 of a, b, c1–c5; round 330 fix-up, C verifies)` [K7].
   - Under `### ეტაპი c1`, add one item: the leaf is memoised (`ArrangementProjectEndTextInner` + `memo`), because a plain child re-rendered on every transport render.
   - `## პრობლემები და გადაწყვეტები`: one Problem → Solution entry. Problem: C round 329 measured +1 component on every transport render (click 106 → 107, range max 30 → 31). Solution: `memo` on the leaf; DP23 guards it.
   - `## ტესტირება`: DP23, DP24 and the perf numbers C measures this round. Name only rows that exist.
   - `## TODO`: add the A-R329-REVIEW-VIEWPORT-BOUND jsdom gap (deferred, D-29z957). The seven TEMPLATE headings stay in order.

## 2. Acceptance

### 2.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, run `bash b-round-329/claims-330.sh` from the loop root. The output must equal `b-round-329/claims-330-planning-output.txt`, except K12 and K14–K17, which may only gain files B produced after that output was saved (compare with `claims-330-sketch-output.txt`). Any other difference is a STOP |
| A-IMPL | `git apply b-round-329/sketch/sketch.patch.txt` (§1.1–§1.2), then §1.3 by hand |
| A-CLAIMS-AFTER | Save as `a-round-330/claims-after.txt`. It must equal `b-round-329/claims-330-sketch-output.txt` except K2 (A's line is `dae81bf 4`), K7 (the new l.4), K8 (A's line is `11`) and K6 (more only if A strengthens a row) |
| A-SCOPE | `git status --short` lists exactly the same 4 modified files as round 329, and nothing untracked |
| A-TYPE / A-LINT | `npm run typecheck` rc 0. `npm run lint` rc 0. K10 stays **16**. `npx biome check` on the three code files is clean |
| A-UNIT | `npx vitest run` on the 9 files of `b-round-328/k13-covering-files.txt` plus `app/lib/arrangement/__tests__/status-preview-store.test.ts`: all green, 119 or more. List any test above 50 % of its timeout (L31) |
| A-MUTANT | On a scratch copy, never in `store/`: `bash b-round-329/run-mutants.sh <scratch>`. Each of the seven mutants is red on the rows in §0. Restored: 26/26 |
| A-REVIEW | code-reviewer (the 4 files of the round). Its Architecture note goes to B |

A does not run a browser or perf row; C runs them.

### 2.2 C's rows
C writes `c-round-330.md` and `c-round-330.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, and an `origin` for each finding;
- `assertsSpecified` = 5 (DP20–DP24) + 4 browser or perf rows (END-LIVE, DRAG-NAMES, D-ROWS, PERF) = 9;
- `mutantsRecorded` = 7, the `run-mutants.sh` set; `mutantRedOnSketch` = true, evidence `b-round-329/mutants-summary.txt`; `mutantRedOnTree` from C's own run;
- `gateChecksNamed` = 6; `gateChecksRunOnSketch` = 2 (full vitest `b-round-329/precheck-full.log`, typecheck `b-round-329/sketch-typecheck.log`);
- `chainHeadGateRunGreen` = true, evidence `gates/gate-round-328.json` (the baseline is a published gate commit; gate 329 was skipped and published nothing).

| Row | Action | Expected |
|---|---|---|
| CLAIMS | `bash b-round-329/claims-330.sh`, first (L56) | Equal to A-CLAIMS-AFTER |
| SOURCE-SCOPE | `git status`; `git diff --stat`; protected sha | 4 modified files, nothing untracked; `git apply -R --check b-round-329/sketch/sketch.patch.txt` passes, and then `git apply -R --check b-round-328/sketch/sketch.patch.txt` passes on that reversed copy (unless A strengthened a test: then only test hunks may differ, with no `expect(` removed); protected 11/11 |
| UNIT | On C's scratch: `drag-preview-render` and `status-preview-store`, ×3 | Green on every run; DP20–DP24 present |
| MUTANT | `b-round-329/run-mutants.sh` on C's scratch, plus one mutant of C's own | As A-MUTANT. C's own mutant is red on the row C names |
| **END-LIVE (browser)** | `node b-round-328/end-bound-probe.mjs <base> <absolute out path>` against A's tree (:5173) and HEAD `dae81bf` on a second dev server with its own Vite `cacheDir` (L38) | At 1440×900 and 1280×720 the whole output equals HEAD's, as in round 329: `distinctEnds` 60, `distinctExtents` 60, 4 ruler widths, `afterRelease` equal |
| **VIEWPORT-BOUND (browser)** | C's round-329 probe `c-round-329/vp-bound-probe.mjs`, A vs HEAD | Every sample, `pre` and `afterRelease` equal HEAD at both viewports |
| **DRAG-NAMES (browser)** | `node b-round-328/names-probe.mjs <A base> <out>` on A's tree, warm server (a cold-compile timeout is environment-invalid and replaced) | NAMES_ROW |
| **D-ROWS (browser)** | `ROWS_DIR=<absolute c-round-330/rows dir> node b-round-328/rows.mjs <base> <tag>` on A and on HEAD (tags `a` and `head`), then `python3 b-round-328/rows-diff.py <dir>/rows-head.json <dir>/rows-a.json` | `DIFFS 0`; no page errors on either tree; the EXPORT WAV sha equals HEAD's at both viewports |
| **PERF** | Production build of A's tree. Run `perf/studio-lab-interactions.perf.spec.ts` **alone**, after a browser warm-up (L38). Compare with `python3 -I b-round-329/perf-rowcmp.py c-round-328/perf-interactions-atree-results/latest-interactions.json <C's latest-interactions.json>` | PERF_ROW |
| G330-AUTH | As G328-AUTH (`c-round-328/g328-auth.cjs`), at both viewports | `/studio-lab`: the anonymous workspace and the demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required" and 0 `audio[src]`. `/api/studio-token` with no header → 401 |
| DOCS | Check doc 232 against §1.3 | l.4 byte-equal; 7 headings in order; the memo item, the problem entry, DP23/DP24 and the TODO line exist; every cited DP id exists in the test file |

**Gate rows.** C does not claim these: the full vitest, the build, Biome, typecheck, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if END-LIVE, VIEWPORT-BOUND, D-ROWS and G330-AUTH ran at both viewports, and DRAG-NAMES and PERF ran once.

**Ableton conformance:** not applicable. Behaviour is held to HEAD.

## 3. Grants
A edits only:
- `app/components/arrangement/ArrangementTransport.tsx`: the `react` import and the leaf (§1.1);
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: the type import, the fixture and mount parameters, the DP21 key rename, and DP23–DP24 appended (§1.2);
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (§1.3).

`StudioWorkspace.tsx` keeps A's round-329 content and must not change in this round. Nothing else may change: not `ArrangementContext.tsx`, `preview-store.ts`, `ArrangementOverview.tsx`, `perf/*`, any other test, the package, lock or config files, any protected file, or a loop artifact outside `a-round-330*`.

## 4. Neighbouring behaviour at risk (C probes)
- **The project-end readout during a move**: with `memo`, the leaf must still update on every preview end change. Covering: DP21 (2 renders over 2 moves), END-LIVE (60 distinct ends), C-MU-ENDTEXT-COMMITTED from round 329.
- **The readout after Undo, a load and a committed change**: its prop `committedProjectEnd` changes, so memo lets it render. Covering: D-UNDO, D-ROWS, DP7.
- **The overview extent with a loop**: DP24 and D-LOOP.
- **Every round-329 behaviour** (the ruler width, scroll width, Fit, playback while moving): END-LIVE, VIEWPORT-BOUND, D-ROWS, PERF move restarts 0.

## 5. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-330.md` and leaves the tree consistent when:
- A-CLAIMS differs from planning beyond the allowed lines, or the patch does not apply;
- a covering test fails, or a test runs above 50 % of its timeout (L11);
- a mutant is not red on its rows;
- Biome flags anything new;
- another file seems to need a change;
- the reviewer's fix would change a clause ruled here (L11).

## 6. Next, and commit readiness
- **After C PASS:** the gate runs verify and publishes rounds 329 and 330 together. Stage c1 is then done; PERF-DRAG-PREVIEW stays in progress.
- **Next round:** REGRESSION if it is planned on or after 2026-11-05 [K9]. It carries C-R318-06, CAND-R323-FOLD-CLEARS-SELECTION, SIG-R327-NOBPM-RULER-CLICK, the A-R328-REVIEW-SAME-TEXT-RACE and GATE328-S1 probes, and one short row per item finished since round 301 (stage b and c1 included). Otherwise stage c2 (the shared in-second remainder, D-29z950).

## 7. Claims (L29 + L56)
Run `bash b-round-329/claims-330.sh` from the loop root. `CLAIMS_STORE` may override the store path.
- Planning output: `b-round-329/claims-330-planning-output.txt`. Sketch output: `b-round-329/claims-330-sketch-output.txt`.

CLAIMS_TABLE
