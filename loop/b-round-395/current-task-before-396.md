# Round 395: PERF-13c-ii-a fix-up. A wave click during a stalled stream keeps the stall watchdog alive

**Planned by:** B, at the round 394 → 395 planning, 2026-11-07 (`b-round-394.md`).
**Decisions:** D-29z1347 … D-29z1350 (`backlog.json` v362, `decisions_log_b`).
**Type:** bug fix-up of the round-394 stage (PERF-13c, stage 2 of 3). One Medium (C-R394-01, alias A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING) and two Lows in the same test file the round owns (A-R394-REVIEW-L1-PS22-ASSERTS, A-R394-REVIEW-L2-PS21A-LISTENER-REMOVAL). No new screen element, no new behaviour a user must learn.

**Read first:**
- `lessons.md` in full. Most relevant here: L4, L11, L23, L26, L31, L49, L56, L57, L58, L59.
- This file. `tasks/round-394.md` is the round-394 contract (D-29z1344). It still holds, **except** for the line replaced in §1 below. Open it only to look up a PS16–PS24 row or the §1 rulings.
- `a-round-394.md` (your own STOP) and `c-round-394.md` (C's R1b evidence).
- **Claims:** `b-round-394/claims-395.sh`, run from the loop root.
  - Planning output: `b-round-394/claims-395-planning-output.txt`.
  - Output on B's sketch: `b-round-394/claims-395-on-sketch.txt`. §7 is the diff of the two, plus the doc line.
  - A runs the claims before editing. C runs them at SOURCE-SCOPE start (must equal the planning output) and at the end (only the §7 facts may differ).

## Baseline: HEAD `1091b9e` + the round-394 tree (unpublished, kept)
- Gate 394 is `skipped` ("C taskStatus FAIL"); the last published commit is still `1091b9e` (gate 393) [K1].
- HEAD is `1091b9e` with **3 modified files**: exactly the 3 grants, holding A's round-394 work [K2]. **That work is kept. Do not revert, stash or re-apply it**; this round adds a small delta on top of it.
- Protected files: 11/11 [K3]. Frozen manifest `b-round-393/r394-frozen-sha256.txt`: 1284 entries, 0 failures [K4]. It still applies: it covers every tracked file except the 3 grants.
- Grants: `b-round-394/grants-395.txt`, the same 3 paths (§4).

## 0. Why this round
- **C round 394 FAIL** [K7]: one Medium, C-R394-01. Steps: HOLD route (media never answered) → select Middle East → Preview → about 3.5 s later click the preview wave → wait. The toggle stays `Stop` forever (23.6 s observed at both viewports): no fallback, 0 decodes. Evidence: `c-round-394/rows-R1.json` (`R1b_seekBeforePlaying-*`).
- **Cause (A's STOP, confirmed by C in the browser):** before `playing`, the same-URL seek sets `currentTime` (at HAVE_NOTHING the getter returns the new value; no `seeking`/`waiting` fires). At expiry the watchdog sees moved time ("moved time wins") and does nothing; nothing re-arms it. This is the REV-B393-M1-STALL symptom reached by an ordinary click, so that finding is not closed.
- Every other round-394 row passed in the browser (R1 no-click 8369/8362 ms, R2–R7, PERF-RES, AUTH). They are evidence on an unpublished tree, not "done".

## 1. Rulings (B)

### D-29z1348: a same-URL seek restarts an armed watchdog (option (a))
- **Replaces** the round-394 §1 item 1 line "Not armed by: a same-URL seek". The new rule: **a same-URL seek restarts an already armed stall timer, re-reading `armedAt` at the new time, and never arms one.** It is the same rule as `progress`.
- **Where:** `ActiveStreamPreview` gains a field `restartArmedStall: () => void`. The stream closure's `handleProgress` becomes that function (renamed `restartArmedStall`), registered for `progress` and stored on the preview object. In the seek branch, inside the existing `try`, it is called **after** `active.element.currentTime = start` succeeds. A throwing assignment still goes to `catch` → `active.fail()` and never re-arms.
- **Why it is enough:** in C's HOLD trace the click lands while the start timer is armed (no `playing` yet). The restart re-reads `armedAt` = the seek target; the time stays there (Chromium kept 4.99 bit-identical, `b-round-394/probe/rows-R1b.json`), so the expiry falls back.
- **Unchanged:** after `playing` the timer is disarmed, and a seek does not arm one (PS19; a seek outside the buffer fires `waiting`, which arms as before). The expiry rule, 8000 ms, the pause route, the sync-throw route and NotAllowedError are all unchanged (D-29z1344).
- **Option (b) rejected:** a Medium reachable by an ordinary click is not a "known gap" under the 2026-10-23 bug gate.
- **Known gap kept (round-394 §8):** a stream whose `progress` keeps restarting the timer but never reaches `playing`. A seek in that state restarts the timer too; this widens nothing new (the trickle already never expires). Doc 252 records it.

### D-29z1349: the two A-394 review Lows (same file, the round owns it)
- **L1, PS22:** add the two missing asserts of the task row: `throwingTime.hasAttribute('src') === false` in case 1, and `second.getLibraryPreviewOffset()` is `null` in case 2.
- **L2, listener removal:** a new row PS26 asserts that a stop removes exactly the 6 stream listeners (`ended`, `error`, `pause`, `playing`, `progress`, `waiting`), by spying on the element's `removeEventListener`.
- **L3 (re-entrant sync throw in the provider):** record only, `deferred_low_polish`. Not this round.
- **Architecture note** (stream-watchdog unit): recorded as A-R394-ARCH-STREAM-WATCHDOG-UNIT and joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C. Not this round.

### Side effects of the code this round touches (L49)
| Effect | Ruling |
|---|---|
| `handleProgress` renamed `restartArmedStall` | `progress` listener add and remove both use the new name (K8 `progress-uses-restart` 1, `removes` 6) |
| The seek branch's `return` without a pause (PS2) | **Kept** |
| The seek `catch` → `active.fail()` (PS23) | **Kept**; the restart sits after the assignment, so a throw never restarts |
| PS19 "a same-url seek never arms" after `playing` | **Kept** and now also pins MU-395-SEEK-ARMS-ALWAYS |

### Ruling lines (L4)
- **Seek vs watchdog:** a seek restarts an armed timer, never arms one.
- **A watchdog expiry vs moved time:** moved time still wins (no fallback). After a seek the reference time is the seek target.
- **The status line:** this round writes none. The fallback texts are the unchanged round-392 ones (`Loading “X”…` → `“X” is ready.`).

## 2. Reference
- Bug-fix round inside a performance stage: no `product-designer` consult or full reference section (policy exemption).
- **Alignment:** Live 12 manual ch. 5 (browser preview): a preview that cannot play stops; a new click restarts it. A click during a stalled preview leading to a working fallback is "consistent in direction", not "identical".
- **Screen budget (L39):** nothing new is visible.

## 3. What A changes
1. **`app/lib/arrangement/preview.client.ts`:** §1 D-29z1348 only (field, rename, one call in the seek `try`). No other line changes.
2. **`app/lib/arrangement/__tests__/library-preview-stream.test.tsx`:** PS25 and PS26 appended to the `PERF-13c-ii-a stream lifecycle robustness` describe; the two PS22 asserts. PS1–PS24 otherwise unchanged (no assert removed or weakened).
3. **`docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`** (the whole doc is granted, L34):
   - l.4 becomes, byte-exact: `**სტატუსი:** In Progress (stage 2 of 3; C round 395 PASS)`.
   - The title (l.1) range becomes `(rounds 393–395)`. No line may state or imply a C PASS for round 394 (C round 394 failed): `grep -c "round 394 PASS"` on the doc = 0. The stage-2 verification cites round 395 and R1b.
   - In the stage-2 part (Georgian, under the existing 7 TEMPLATE headings; **no new `## ` heading**): the seek-restart rule and why (C-R394-01, round 394 C FAIL → round 395 fix); the state diagram gains the edge "seek while Armed → Armed (re-read time)"; the sketch numbers with their file `b-round-394/probe/rows-R1b.json` (8296/8300 ms after the seek); PS25, PS26 and the three MU-395 mutants. Cite only ids that exist (L26). TODO keeps stage 3 = 13c-ii-b.

**B's sketch.**
- `b-round-394/sketch-395.patch.txt`, sha256 `558694697085f2bc…` [K18]. It is a diff **against the current tree** (A's round-394 work included) and covers the source and tests only; the doc is A's. `git apply --check` passes on the tree [K18].
- On it, B ran: `tsc --noEmit` and scoped Biome, both rc 0 (`b-round-394/sketch-tsc.log`, `sketch-biome.log`); the covering set, 14 files, 258 tests, rc 0 [K17]; 15/15 mutants red, pristine rc 0 [K16]; C's own `rows.mjs` retargeted to a scratch server on port 5174 at both viewports [K14, K15].
- A may follow it. **No `as`, `any` or `@ts-ignore`.** A deviation from §1's semantics is a STOP (L11).

**Forbidden:**
- every path outside the grants, in particular `ArrangementContext.tsx` (zero provider change; K9 must stay equal), `ArrangementLibraryPreview.tsx`, `collection.ts`, `studio-lab-demo.ts`, `types/arrangement.ts`, `perf/**`, `strings.ts`;
- the global forbidden files and actions, the protected files and `package.json`;
- reverting or re-applying the round-394 work; commit, push, stash, checkout, deploy and dev-server restarts.

## 4. Grants (`b-round-394/grants-395.txt`)
- `app/lib/arrangement/preview.client.ts`
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx`
- `docs/implementation/2026/quarter-IV/252-perf-library-preview-stream.md`

## 5. A: tests
Row ids are binding. Each row names the mutant that must turn it red. A runs the mutants on a scratch copy outside `store/` and saves the logs in `a-round-395/mutants/`. B's runner is `b-round-394/mutants/run.py` (retarget its `root`/`out`); B's result is `b-round-394/mutants/summary.txt`.

| Row | Sequence | Expected | Mutant (red) |
|---|---|---|---|
| **PS25** | Fake scheduler; stream at 0; same-URL stream call at 5 (no `playing`); fire | After the seek: 1 pending, `delays` = [8000, 8000], `src` kept. After fire: `onStreamError(5)` once; `src` removed; offset `null` | MU-395-SEEK-NO-REARM, MU-394-NO-WATCHDOG, MU-394-DEFAULT-DELAY |
| **PS26** | Stream; spy on the element's `removeEventListener`; stop | The removed types, sorted, equal `ended, error, pause, playing, progress, waiting` | MU-395-PAUSE-LISTENER-LEFT |
| **PS22** (2 asserts added) | as round 394 | + `throwingTime` has no `src`; + `second.getLibraryPreviewOffset()` is `null` | MU-394-SYNC-THROW-START |
| **PS19** (unchanged) | as round 394 | 0 pending after a seek that follows `playing` | MU-395-SEEK-ARMS-ALWAYS (the seek calls `armStall` instead) |

All 12 MU-394 mutants must stay red (B's run: `b-round-394/mutants/summary.txt`, 15/15 red).

**Collision rows (L23).**
- The covering set is `a-round-393/covering-files.txt` (14 files). On the sketch it is green: `b-round-394/precheck-covering.log`, 258 tests.
- **Timeout headroom (L31):** the slowest covering test is LRS4 at about 2.0 s, under a 15 s describe timeout [K17]. PS25 and PS26 take a few ms.

**A also runs:** `npm run typecheck`; `npm run lint`; scoped `npx biome check` on the 2 code paths; `npx vitest run` on the covering set; the claims script at the start and the end; the `code-reviewer` (3 files changed). A reviewer Medium whose fix falls outside §1 is a STOP (L11). A does not run the full suite, `verify`, the build or a browser.

**A's report, `a-round-395.md`:** the changed lines (delta over round 394); each command with rc and a log path under `a-round-395/`; the mutant logs; any deviation from the sketch; the reviewer's notes (Architecture notes go to B as signals).

## 6. C: browser rows
Run at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`, with a fresh context per row.
- **Probes:** reuse `c-round-394/rows.mjs` (copy it into `c-round-395/` and set `OUT`), with `c-round-382/lib.mjs`'s `open` and `warm.mjs`. Warm the server before any timed row (L38). B's run of the same script on the sketch: `b-round-394/probe/` (it adds `msAfterSeek` and `timeAfterSeek` to R1b; copy those two fields too).
- The code file changed and this tree is what gate 395 will publish, so the round-394 rows run again.

| Row | Steps | PASS when |
|---|---|---|
| **R1b SEEK-DURING-STALL** (the bug, binding) | HOLD route; select Middle East; Preview; at 3.5 s click the wave at 5 %; wait ≤ 20 s | **Assert:** the fallback happens: status `Loading “Middle East — public preview”…` → `“Middle East — public preview” is ready.`; exactly one `decodeAudioData` of 101.35 s; exactly one buffer start of 101.35 s; toggle `Stop`; the element has no `src`. **Assert:** time from the wave click to the moment a buffer start of 101.35 s appears in `__starts` (`wait100` resolving) is between 7.5 s and 11 s (B's sketch: 8296 / 8300 ms [K14]). **Record:** `timeAfterSeek` (sketch 4.99) |
| **R1 STALL-FALLBACK** | as round 394 (no click) | as round 394 §6 R1 (sketch 1 decode, 1 start, toggle Stop [K15]) |
| **R2 EXTERNAL-PAUSE** | as round 394 | as round 394 (toggle `Preview`, no `src`, 0 decodes) |
| **R3 NORMAL-20S** (false-positive guard, seek while playing) | as round 394 | still one element playing, 0 decodes, 0 buffer starts, PCM and status unchanged |
| **R4 END** | as round 394 | as round 394 |
| **R5 ABORT** | as round 394 | as round 394 |
| **R6 STOP** | as round 394 | `Preview`, no `src`, 20 s later 0 decodes |
| **R7 PLAY-STOPS-PREVIEW** | as round 394 | as round 394 |
| **PERF-RES** | `perf/studio-lab-resources.perf.spec.ts`, alone (L38) | `pcm-live-mib-ready` ≤ 60 and `pcm-live-decode-mib-ready` ≤ 0; results to `c-round-395/perf-results/` |
| **AUTH** | Fresh context, no credentials | `/studio-lab` opens the demo; `/studio/<premium handle>` shows sign-in with no workspace; `/api/studio-token` without credentials is refused (4xx) |
| **SOURCE-SCOPE** | Claims at start and end; `git status`; `sha256sum -c` on `b-round-393/r394-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` | Start = the planning output. End: only the 3 grants modified; K4 0 failures; K3 11; K9 unchanged; only the §7 facts differ |
| **DOC-252** | Read the doc | Georgian; the 7 TEMPLATE headings in order, none added; l.4 exact as §3; title range `(rounds 393–395)`; `grep -c "round 394 PASS"` = 0; the seek-restart rule present; every cited row id exists; cited files exist |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- **jsdom-only note** (not in `passed`/`blocked`, no effect on `browserVerified`): PS21(b), PS22, PS23, PS26 (listener removal is not observable in a browser), relying on A's `a-round-395/mutants/summary.txt`.
- **Ableton:** "consistent in direction (a preview that cannot play stops or falls back; a new click restarts it)", status `not applicable / perf`.
- **All L57 fields in `c-round-395.json`:** `manifestPaths` = `b-round-393/r394-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`; `missingPaths`, `countMismatches`, `claimCheckMinutes`; an `origin` per finding; `assertsSpecified`, `mutantsRecorded`; `mutantRedOnSketch` = `b-round-394/mutants/summary.txt`; `mutantRedOnTree`; `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-394/precheck-covering.log`), `chainHeadGateRunGreen` (gate 393 published `1091b9e`; gate 394 skipped); `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-394/probe/rows-R1b.json`, `rows-R1.json`, `rows-R2.json`, `rows-R3.json`, `rows-R6.json`); `progressFile`, `stopSignal`.
- **Before hand-off:** run `tools/l57-check.py`. Heaviest rows first: PERF-RES, R1b, R1, R3. Write `c-round-395/progress.json` after each row (L59).

## 7. Claims that may change during the round
From `diff b-round-394/claims-395-planning-output.txt b-round-394/claims-395-on-sketch.txt`, plus the doc:
- **K8:** `seek-restart` 0 → 1; `restart-field` 0 → 1; `progress-uses-restart` 0 → 1. Everything else in K8 unchanged (`removes` 6, `try` 3, listeners 1 each).
- **K10:** `stream-file` 23 → 25; `last` PS24 → PS26; `describes` 3; `demo-PS15` 1.
- **K11:** l.4 becomes the §3 string; `headings` 7; `in-progress-docs` 6.
- **K18:** `applies-to-tree` yes → no (the sketch is then applied).
- K2 stays `1091b9e 3` (the same 3 files, still modified).

Every other fact must equal the planning output, including K9 (provider) and K12 (the player's users).

## 8. Out of scope (recorded, not dropped)
- **PERF-13c-ii-b** (stage 3 of 3; next after this round passes): the purchased adapter's `previewUrl` (browser half BLOCKED "backend unavailable in cloud"; try L36 stubs first); the stable seek key (A-393 L6); fallback-set expiry (GATE393-L4-FALLBACK-NEVER-EXPIRES); the perf harness preview row; SIG-R393-PREVIEW-NO-CACHE-WARM.
- **Recorded:** the progress-trickle gap (doc 252); A-R394-REVIEW-L3-REENTRANT-SYNC-THROW (deferred Low); A-R394-ARCH-STREAM-WATCHDOG-UNIT (signal, joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C, requested from root at the 13c-ii-b boundary).
- **Next:** PERF-13c-ii-b → PERF-13d → PERF-14 → PERF-15. The regression round is due at the first planning on or after 2026-11-10. RETRO at round 400 (input RC-R394-GESTURE-IN-DEGRADED-STATE).
