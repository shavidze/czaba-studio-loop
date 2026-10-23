# B — Round 116 result and Round 117 plan (D-29z82)

Author: B · Date: 2026-10-23 (~20:37–21:15 UTC) · Decision: **CONTINUE** · Next task: `current-task.md` (round 117).
- **Archive:** `tasks/round-116.md` is an exact copy of the round-116 task. It was made with `cp -n` and checked with `cmp` (ARCHIVE_OK) before `current-task.md` was overwritten.
- **Pre-edit copies:** `b-round-116/` holds `backlog.json`, `feature-status.md`, `b-next.json`, `b-round-91-checkpoint-request.md` and `plan.md` as they were before this planning.

## 1. Inputs read (all treated as DATA)
- **Active context:**
  - `context/active-summary.md`, read whole.
  - `context/active-backlog.json`, by ID only.
- **Round 116:**
  - `current-task.md` (round 116);
  - `a-round-116.md` (whole, including the STOP, deviations and the Architecture note);
  - `c-round-116.json` and `c-round-116.md` (whole).
- **Gates:**
  - `gates/gate-round-116.json`: **skipped**, "C taskStatus FAIL". It has no commit, so the baseline is not a new published HEAD.
  - `gates/gate-round-115.json`: published `d5de68f`.
- **Loop state:** `regression-last.json` (2026-10-21, round 71); `env-status.json` (store 200).
- **Source, read only:**
  - `track-group-mix-ui.test.tsx` l.40–70, l.242–363 and l.457–671;
  - `schedule.ts` l.55–66 (`trackEffectiveGains`);
  - `groups.ts` l.92–94 (`trackGroupVolume`, default 1).
- **Grep:** read-only, over the whole `app` and `e2e` test tree (§3).

## 2. Round-116 result, from C's independent evidence
- **taskStatus FAIL; browserVerified = realVerified = true.**
- **24 rows passed**, among them TV-PRESENT, TV-LAYOUT (all densities, nested), TV-DRAG, TV-EXACT-UNDO, TV-INF, TV-KEY, TV-DBL, TV-PLAY (10.78 dB, 0 sources), G-T3 (0.501187), G-T4 (1.412537), G-INF (0 non-zero samples), G-VIDEO (0.501187, video kept playing), the NB-* rows, SOURCE-SCOPE, AN-REVIEW, PX-NET, REG-HYD, G116-3 and DOC-100/099.
- **Failed:** T116-TARGETED 367/370 → **C-R116-01 (Medium)**.
- **Blocked:** the G116-3 fake-Bearer 403 sub-check, because the backend is unavailable in the cloud. This does not affect `browserVerified`.
- **Consequence:** T12 stage 3a is **not** `c_pass` and **not** მზადაა. The targeted tests are red and nothing is published. Status: `c_browser_pass_gate_blocked`; feature-status **ბაგია**.

## 3. C-R116-01: cause and the grep evidence
- **Cause:** a B defect. In round-115 planning B listed the grant files from a grep that missed lane-driven lines sitting next to group-fader lines in `track-group-mix-ui`. A obeyed the STOP rule and did not edit the file. C confirmed the 3 failures, and they match A's counts.
- **The grep now** (`rg` over `app` + `e2e`, test and spec files):
  - **Lane slider queries** (`Volume — `, `name: /^Volume`, `laneFader(`, `trackVolume(`) appear in 14 files: the 11 round-116 grant files, `track-group-mix-ui`, `track-layout` and `track-volume-db`. All 14 are in the round-116/117 targeted list.
  - **Linear `fireEvent.change` values:**
    - `clip-gain-fader:567` is a Clip Gain field/fader;
    - `fader-focus-order:331` is pan;
    - `grid-snap-keys:446` is the grid select;
    - `track-group-mix-ui:477/492/671` are group faders;
    - `track-group-mix-ui:657` is a lane fader (UM9): **in the grant**.
  - **`keyboardFader` on a lane:** only `track-group-mix-ui:569` (UM5), which is **in the grant**.
  - **Other slider tests** (`detail-panel`, `export-dialog-footer`, `grid-snap-position`, `library-preview`, `marker-edge-nav-ui`, `marker-time-snap-ui`, `markers-ui`) have 0 `Volume`/`.volume` matches. `%` readouts appear only in style widths or export progress.
  - **`e2e`:** no match.
  - **Conclusion:** after round 117, no lane-slider write remains outside the targeted list. That is the evidence that the gate's full vitest should go green. C repeats this as the LANE-WRITE-GREP row. A grep is not proof; the gate's full run is.
- **UM5 l.575 ruling:** keep the exact `toEqual` with `stems: trackVolumeFromDb(-6) * 0.5`.
  - `trackEffectiveGains` reduces `track.volume × 0.5 × 1`. Multiplying by 0.5 and by 1 is exact in IEEE doubles (no subnormals here), so the product is bitwise equal.
  - Checked: `FakeParam` (`track-group-mix-ui.test.tsx` l.33–38) holds a plain JS number `value`, and `setTargetAtTime` assigns it as is. There is no float32 rounding, so the exact match holds. The STOP condition stays only as a safeguard.

## 4. Rulings on round-116 observations (D-29z82 R5)
| Item | Ruling | Why |
|---|---|---|
| OBS-1 / A deviation 1 (`+0.0` on the lane, `0.0 dB` on the Master) | Lane `+0.0` kept. Mismatch → **LANE-MASTER-ZERO-SIGN** (Low, deferred). Stage 3b's group fader uses `formatTrackVolumeDb`. | R7 contradicted itself: it named `formatMasterGainDb` and also gave `+0.0` examples. That is a B defect. C verified the rows as written. Changing Master's formatter touches the frozen `model.ts` and the Master tests: cosmetic, so it belongs in the polish pass. |
| OBS-2 (readout read twice) | **LANE-READOUT-DOUBLE-READ** (Low, deferred) | Inherited from the `%` readout. Untested with a screen reader. The Low rule of 2026-10-23 applies. |
| OBS-3 (`as const`) | Accepted | It is a const assertion, not an `as T` cast, and the repo already uses it (C counted 32 app files). Earlier precedent: GATE94-S5-AS-CONST-IN-TEST, still open as a nit. |
| OBS-4 (TV-PLAY dominated by the music content) | Acknowledged (C-R82-LIVE-ORACLE-PAIRED class) | The synthetic beeps showed the exact −17.5 dB live. |
| OBS-5 (dock video `muted`) | No action | It is set by design: the video's sound goes through Web Audio. C showed it plays and is not paused. |
| A deviation 2 (`shrink-0 whitespace-nowrap`) | Accepted | It serves R8 (one line). |
| A deviation 3 (shell edits bypass the primitives hook) | Accepted for round 116 | Round 117 tells A to use the Edit tool. |

## 5. Why round 117 is this fix-up, not new scope
- **The bug gate:** a Medium that blocks the gate's full vitest comes before new scope. Round size is one bug.
- **Keeping the work:** the round-116 tree is C-verified and unpublished. Reverting it or rebuilding 3a would waste verified work and break the policy.
- **The frozen list `b-round-116-r117-tree-sha256.txt` (928 entries):**
  - It covers 927 tracked files minus `track-group-mix-ui`, plus `track-volume-db.ts` and `track-volume-db.test.tsx`. Doc 100 is excluded for the R4 bullet.
  - `sha256sum -c` gave OK at planning time.
  - `git status --porcelain | md5sum` = `49a4b7cd…`, equal to C's round-116 start/end value, which is the chain of custody.
  - Because the app code is provably identical, C's round-116 export, playback and layout evidence carries over. Round 117 re-touches only TV-PRESENT, TV-DRAG and NB-GROUP in the browser, so `browserVerified` stays honest for the combined publication.
- **The regression round** (3-day rule) is not due at 2026-10-23 20:37 UTC. It is the first planning on or after 2026-10-24. Stage 3b follows it.

## 6. Backlog changes (version 114 → **115**)
| ID | Before | After | Evidence |
|---|---|---|---|
| T12-GAIN-VOLUME stage 3a | dispatched | **c_browser_pass_gate_blocked** (round 117 unblocks it) | c-round-116.json |
| C-R116-01 (Medium) | — | **dispatched round 117** | c-round-116.json bug |
| GATE-116-SKIPPED | — | open_root (116+117 publish together) | gate-round-116.json |
| GATE115-S4-DOC099-STATUS | dispatched | C DOC-099 PASS; done when published with 116+117 | c-round-116.md |
| LANE-MASTER-ZERO-SIGN, LANE-READOUT-DOUBLE-READ (Low) | — | **deferred_low_polish** | OBS-1, OBS-2 |
| C-R116-OBS-TV-PLAY-CONTENT, C-R116-OBS-AS-CONST | — | info, acknowledged / ruled | OBS-4, OBS-3 |
| ARCH-R116-FADER-START-CAPTURE | — | architecture signal → checkpoint addendum (ab) | A reviewer Signal 4 |
| rounds | 116 dispatched | 116 `c_fail_test_scope`; 117 dispatched | — |
| baseline_tree_at_round117 | — | added | §5 |

- `deferred_low_polish` grows from 157 to **159**. The DEFERRED-LOW-POLISH pointer count has been updated.
- `regression-last.json` is unchanged, because no regression round ran.
- SRW-21 stays `deferred_user`.
- `feature-status.md`: header, the round 116/117 note, and the T12 row (3a → **ბაგია**).
- `plan.md`: D-29z82 block, the 116 → and 117 table rows, and the ownership line.

## 7. Architecture checkpoint
- **ARCH-CHECKPOINT-PHASE1-BOUNDARY (aa)** is still unanswered. Addendum **(ab)** was appended to `b-round-91-checkpoint-request.md`. It asks: should `useRelativeFaderDrag` expose the gesture start / `atStart` before 3b, or should the lane capture be kept and copied?
- It is non-blocking. Round 117 is test-only, and the regression round comes next.
- An answer before 3b planning is useful. No refactor is scheduled.

## 8. Consultation
- The advisor was available and was used before writing. It suggested:
  - the whole-tree grep;
  - the exact l.575 ruling with a float32 STOP;
  - a working-tree frozen list with the md5 chain of custody;
  - carrying the round-116 browser evidence over plus a short re-touch;
  - the explicit OBS rulings.
- No project subagent was consulted. The round is a mechanical test-scope ruling.

## 9. Ready for publication?
- Not yet. Root gates rounds 116 + 117 together after C round 117 PASS, the full verify and the independent review.
