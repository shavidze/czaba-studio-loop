# CURRENT TASK — Round 352: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1, fix-up 2. DP72 gets its release and Undo halves (C-R351-01)

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 351 → 352 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v313 → v314, D-29z1123…D-29z1126):
- **D-29z1123: round 351 is closed as C FAIL "STOPPED — routed to B", with origin B spec.** A stopped at A-REVIEW. The reviewer's F1 (Medium) found that DP72 asserts nothing between release and Undo. C confirmed it by reading (C-R351-01) and passed CLAIMS, SOURCE-SCOPE and G351-AUTH. The mutant and names rows did not run, so `browserVerified` is false. Gate 351 was skipped. This was B's fault: the L58 sketch-review clause was not applied in round 350. It was not A's fault.
- **D-29z1124: the ruling on C-R351-01** is in §0.1.
- **D-29z1125: the doc 232 l.4 form.** Keep this doc's published convention, `…; C round N pending)`. HEAD reads `C round 349 pending`. This round grants exactly `C round 352 pending`. The conflict with L28 goes to RETRO 353 as RC-R351-L28-PENDING-FORM. Answer to A's round-351 observation: the task text wins here.
- **D-29z1126:** this task. RETRO moves from 352 to 353, its second move. The window is now 336–352, and ROOT-REQ-PERF-TIMEOUT moves with it (L46).

**Read first:**
- `lessons.md` items 10, 11, 22, 26, 28, 52, 56, 57 and 58. C also reads 38, 59 and 60.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
- `AUDIO_ARCHITECTURE.md`, read only, for the dock's stopped-video seek path.

**L29 note:** untagged code text is an expected value, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**What does not apply:** reference-first, product-designer, the screen budget and the YouTube request. This is a test-and-docs fix-up of a pure performance round, and nothing the user sees or hears changes. `ArrangementVideoDock.tsx` and `ArrangementContext.tsx` must stay byte-identical [K3].

## Baseline
- HEAD is `7f56989` (gate 349, published). Gates 350 and 351 were skipped [K1].
- `git status` shows exactly 3 files [K2]:
  - the dock, with sha256 `037f62faf9e69844…`, equal to the round-349 sketch [K3];
  - `drag-preview-render.test.tsx`, which is the round-350 copy plus `b-round-350/sketch-dp72.patch.txt` (`54+0-`) [K5];
  - doc 232, with A's round-351 edits [K6].
- Protected files: 11/11 OK [K7]. No dependency change.

## 0. Ruling and B's evidence

### 0.1 C-R351-01 → DP72 release and Undo halves (D-29z1124)
**The sketch:** `b-round-351/sketch-dp72-release.patch.txt`. It adds 17 lines and removes 9 on the current tree (`git apply --numstat`), and `git apply --check` is clean. The whole sketched file is `b-round-351/drag-preview-render.test.sketch352.tsx`. Against the r350 copy it reads `62+0-` [K5].

**What changes in DP72:**
1. **F2:** the `currentTime` setter spy is a `function (this: HTMLMediaElement, value: number)`. It records a write only when `this instanceof HTMLVideoElement`.
2. **F3:** the `try/finally` around the preview `waitFor` is removed, as in DP64.
3. **F7:** a blank line now separates DP71 from DP72.
4. **F1, the release half:**
   - B records `const writesBeforeRelease = seeks.length;` before `pointerUpAt`.
   - After a 20 ms real-timer settle inside `act`, `expect(seeks).toHaveLength(writesBeforeRelease)`. A correct release keeps the seek key, so it writes nothing.
   - Then the committed start `toBeCloseTo(shownStart, 6)`.
5. **The Undo-write half:** after Undo, `waitFor` `seeks.length > writesBeforeRelease`, then the existing pre-drag media-time `waitFor`.

**B's sketch runs.** Scratch is `/home/runner/b352-scratch/sk`; mutant runs use `-t 'DP6[6-9]|DP7[0-2]'`. Logs are in `b-round-351/`.

| Run | Red tests (DP72's failing line) | Log |
|---|---|---|
| control | none; 7/7 | `mutant-control.log` |
| M-B2 (`b-round-350/mutant-M-B2.diff.txt`) | DP66, DP67 | `mutant-M-B2.log` |
| M-B2′ (`b-round-350/mutant-M-B2prime.diff.txt`) | DP66, DP67, DP71 | `mutant-M-B2prime.log` |
| A-M5 (`b-round-350/mutant-A-M5.diff.txt`) | DP71 | `mutant-A-M5.log` |
| M-B5 (`b-round-350/mutant-M-B5.diff.txt`) | DP72 (the preview `waitFor`: `expected 2 to be close to 1`) | `mutant-M-B5.log` |
| **M-B1** (`b-round-351/mutant-M-B1.diff.txt`; the reader's base is `arrangement`) | DP69, **DP72** (`expected [ +0, 2, 1, 1 ] to have a length of 3 but got 4`: release writes) | `mutant-M-B1.log` |
| M-B1 on the **round-351** DP72 | DP69 only; DP72 **green**. This is the gap the reviewer named, made concrete | `mutant-M-B1-on-dp72-r351.log` |
| **M-B6** (`b-round-351/mutant-M-B6.diff.txt`; `commitArrangement` commits `before`) | DP66–DP70, DP72 (the committed-start line) | `mutant-M-B6.log` |
| **M-B7** (`b-round-351/mutant-M-B7.diff.txt`; the seek effect's deps drop `videoLane`) | **DP72 only** (`expected 3 to be greater than 3`: Undo writes nothing) | `mutant-M-B7.log` |

**Other sketch checks:**
- The whole file: 74/74 in 9.98 s (`sketch-file.log`).
- `tsc --noEmit`: rc 0 with 0 lines (`sketch-tsc.log`).
- Biome on the file: clean (`sketch-biome.log`).
- DP72 alone: 3/3 green, about 0.53 s each (`sketch-dp72-replicates.log`; L31).

**Why a fixed 20 ms settle, and why it is not a "no-write" proof by `waitFor`.** A positive `waitFor` returns on the first poll that passes, so it cannot prove that no later write happens. In jsdom `video.seeking` is false, so a pending seek lands within microtasks of the sync. 20 ms of real time covers that with a wide margin. Under M-B1 the extra write does land inside the window (the log above). This is the rationale A applies unchanged.

**Sketch review before dispatch (L58).** `tech-lead` reviewed it (`b-round-351/sketch-review.md`). `code-reviewer` is not on B's consult list. tech-lead reviewed the first form of the sketch; the only change since is its own Low 1 (the count check), so the exact dispatched diff was not re-reviewed.
- Result: 0 Medium+.
- Low 1 asked for a count check, not a last-value check, after release. It is applied, and it is what turns M-B1 red.
- Low 2 says the Undo length check is redundant with the final value check. It is kept as documentation, because it is the line M-B7 turns red on its own.
- The `this`-typed spy: tech-lead found no `any` and no type assertion; Biome's `useArrowFunction` ignores functions that use `this`.

**What A's code-reviewer may still raise:** a finding that only repeats Low 1 or Low 2 is already ruled here and is not a STOP. Any other Medium+ that asks to change DP72 is a STOP (§4).

## 1. Scope (A)

### 1.1 Files (exactly 2 edited)
| # | File | Change |
|---|---|---|
| 1 | `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | `git apply ../tmp/studio-real-loop/b-round-351/sketch-dp72-release.patch.txt`, unchanged. Afterwards the file is byte-equal to `b-round-351/drag-preview-render.test.sketch352.tsx` [K5]. DP66–DP71 are untouched |
| 2 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | `git apply ../tmp/studio-real-loop/b-round-351/sketch-doc232.patch.txt`, unchanged (§1.2) |

**Untouched:** `ArrangementVideoDock.tsx` (sha256 `037f62faf9e69844…`), `ArrangementContext.tsx` (sha256 `ff46799c5a35e17c…`) [K3], every other `app/` file, `perf/`, `e2e`, config and the protected files.

### 1.2 Doc 232 (Georgian, technical terms in English; this is the content of `sketch-doc232.patch.txt`)
- **l.4:** `C round 351 pending` becomes `C round 352 pending` (D-29z1125).
- **The changed-files line:** `(DP66–DP71; DP72 — round 351)` becomes `(DP66–DP71; DP72 — rounds 351–352)`.
- **The DP72 testing bullet is replaced.** It now starts `` - `drag-preview-render.test.tsx`, rounds 351–352 (A-R350-REVIEW-SEEK-TEST, D-29z1120; C-R351-01, D-29z1124): DP72 ``. It names:
  - the video-only spy;
  - the preview, release (no new write, committed start) and Undo halves;
  - mutants M-B5, M-B1 (green on the round-351 DP72), M-B6 and M-B7.
- **The `## ` count stays 7** [K6].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-351/claims-352.sh` from the loop root | equals `b-round-351/claims-352-planning-output.txt` |
| A-CLAIMS final | same | K1, K3, K7, K9, K10 and K11 equal the planning output. K2 = `7f56989 3`. K4, K5 and K6 equal `b-round-351/claims-352-sketch-output.txt`. K8 = `0 untracked 0` |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | 74/74 |
| A-MUTANT | on a scratch copy, never in `store/`: control plus the 7 mutants of §0.1, each with `-t 'DP6[6-9]\|DP7[0-2]'` | the red sets exactly as in §0.1; logs in `a-round-352/` |
| A-REVIEW | `code-reviewer` on the test diff | 0 unruled Medium+ (§0.1 lists the ruled Lows) |

### 2.2 C rows
The dock and the context are byte-identical to the files C verified in round 350 [K3]. C's round-350 PERF, BEHAVIOUR, RELEASE and PLAY-SYNC evidence (`c-round-350/`) therefore stands for this tree, and SOURCE-SCOPE proves that it applies.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-351/claims-352.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `sha256sum` of the dock and the context; `cmp` of the store test file against `b-round-351/drag-preview-render.test.sketch352.tsx` | exactly 3 files modified and 0 untracked; dock `037f62faf9e698441f0f0ed913c7397d6b2fc9c70840eb4a47d906317cd15e96`; context unchanged from HEAD; the test file is byte-equal |
| READ | the DP72 hunk | asserts as §0.1 items 1–5; DP66–DP71 unchanged |
| UNIT | A-UNIT's command | 74/74 |
| MUTANT (jsdom) | control plus the 7 mutants on C's own scratch (L60) | red sets exactly as §0.1. In particular: M-B1 → DP72 red at the release length; M-B7 → DP72 alone; M-B5 → DP72 |
| MUTANT (browser, M-B2′) | a scratch dev server with M-B2′ applied and its own Vite `cacheDir` (L38); then `node b-round-349/video-names-probe.mjs http://127.0.0.1:<port> c-round-352/names-M-B2prime.json` | `ArrangementVideoDock` appears in the trim, fade and move commits per move. Stop and delete the scratch server afterwards. Never run in rounds 350 or 351 |
| NAMES smoke (browser, dev, 1440×900, this tree) | `node b-round-349/video-names-probe.mjs http://127.0.0.1:5173 c-round-352/names.json` | video-trim 13, video-fade 3, video-move 11 on its first 3 moves; no `ArrangementVideo*` or `Maximize2` in any move commit (equal to `c-round-350/names.json`) |
| G352-AUTH (browser, 1440×900 and 1280×720) | a fresh anonymous context (`c-round-351/auth.mjs`, copied to `c-round-352/`) | `/studio-lab` opens the workspace with the demo badge, and `auth_user` is null. `/studio/<id>` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token` refuses (401, 400 or 405). A 500 is allowed only when the mock on :5199 is down; that case is listed under `blocked` |
| DOCS | doc 232 | l.4 ends `video-trim-fade-cost-1; C round 352 pending)`; the bullet and the changed-files line as §1.2; 7 `## ` |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified:** MUTANT (browser), NAMES smoke and G352-AUTH can all run here, and none needs the backend. If any of them does not run, `browserVerified` is false.

**Ableton conformance:** not applicable (test and docs only).

**L57: write all L57 fields** in `c-round-352.json`.
- `mutantRedOnSketch`: `b-round-351/mutant-M-B1.log`, `mutant-M-B5.log`, `mutant-M-B6.log`, `mutant-M-B7.log`, `mutant-M-B2prime.log` and `mutant-A-M5.log`.
- `mutantRedOnTree`: C's own runs.
- `gateChecksRunOnSketch`: `b-round-351/sketch-file.log`, `sketch-tsc.log` and `sketch-biome.log`.
- `affectedChecksNamed`: `drag-preview-render.test.tsx` and the names probe.

## 3. Neighbouring behaviour that could break
- **Other tests in the file:** the spy is now a `function` with a `this` filter, and it is restored by `afterEach` `vi.restoreAllMocks()` [K4]. The whole file passed 74/74 on the sketch.
- **The 20 ms settle:** it adds about 20 ms to DP72. DP72 runs in about 0.53 s against the 5 s default.
- **Doc 232:** only the three places in §1.2 change.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- A patch does not apply, or DP72 fails on the tree.
- An existing test fails.
- A change outside the 2 edited files is needed.
- A mutant's red set differs from §0.1.
- A review Medium+ that is not ruled in §0.1 asks to change DP72, the dock or the context.

## 5. Routed, not in scope
- **These close on C round 352 PASS:**
  - C-R351-01 (Medium);
  - A-R351-REVIEW-GLOBAL-SPY and A-R351-REVIEW-TRY-SPAN (Low, fixed in the sketch);
  - C-R350-01 (ruled in D-29z1119);
  - A-R350-REVIEW-SEEK-TEST.
- **RETRO 353** (window 336–352). It takes:
  - candidates RC-R350-MUTANT-PAIR-UNRUN, RC-R351-SKETCH-REVIEW-SKIPPED (proposed: `b-round-N/sketch-review.md` becomes a K10 artifact) and RC-R351-L28-PENDING-FORM;
  - ROOT-REQ-PERF-TIMEOUT to Saba (L46).
- **Unchanged from round 351:**
  - A-R350-REVIEW-CACHED-TRACKS, A-R350-REVIEW-TEST-NITS and C-R350-OBS-FADE-COVERS-TRIM stay in `deferred_low_polish`.
  - A-R350-ARCH-PREVIEW-READER is a signal held under ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE.

## 6. Deliverables
- **A:** the 2 edited files; `a-round-352.md`; logs and mutant outputs in `a-round-352/`.
- **C:** `c-round-352.md`, `c-round-352.json` and `c-round-352/`.

## 7. Claims
Run `bash b-round-351/claims-352.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree.

**Expected outputs:**
- `b-round-351/claims-352-planning-output.txt`: the current tree.
- `b-round-351/claims-352-sketch-output.txt`: B's scratch with both patches applied. K2 reads `no-git 0` there, and K8 is not meaningful there.

| Claim | What it checks |
|---|---|
| K1 | gate 349 `published` `7f56989`; gates 350 and 351 `skipped` |
| K2 | HEAD and the `git status` count |
| K3 | the dock's sha256 (16 hex digits) equals the round-349 sketch; the context sha256 `ff46799c5a35e17c`; mutant anchors present once each: the seek preview subscription, the seek effect deps, `return applyEdit(next, label, before);` |
| K4 | DP66–DP71 count; DP72 and its title; the setter spy; the `HTMLVideoElement` filter; `writesBeforeRelease`; the release length check; the Undo write check; `vi.restoreAllMocks();` |
| K5 | the test file's numstat against `b-round-350/drag-preview-render.test.r350.tsx` (`62+0-` after the patch); byte-equality with the sketch file |
| K6 | doc 232: `## ` count; `C round 351 pending`; `C round 352 pending`; `rounds 351–352`; `D-29z1124`; `M-B5`; `M-B6`; `M-B7` |
| K7 | protected files OK |
| K8 | diff lines in `app`, `perf`, `e2e` and `docs` outside the 3 files; untracked files |
| K9 | the `regression-last` date |
| K10 | the kept `b-round-351` artifacts (23 files) |
| K11 | the lane hook's `useShallow` line; `PX_PER_SECOND = 40`; DP64 |
