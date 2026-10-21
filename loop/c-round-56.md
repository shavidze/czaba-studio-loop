# C — Round 56 verification: C-R48-01 timeout headroom (D-29z21)

Verifier: C · 2026-10-17 20:37–20:53 +04 · Evidence: `tmp/studio-real-loop/c-round-56/`
App source is read-only. C made no edits under `store/`, made no commit or push, and started or stopped no server.

## Summary

- **Task status: PASS** for every round-56 ID that could run: G56-2, R56-S (with deviation R56-S-DEV1), R56-U (M1–M5 and durations), G56-1 and R56-LOAD.
- **C-R48-01 is closed as not reproduced under test load; the headroom is proven only by M1–M5.**
  - The control run (snapshot files, 5 s default) showed **0 timeouts** under the tsc load generator. So the generator did **not** reproduce the bug.
  - This is closure form 2 in §4.4, not "reproduced and fixed".
- **The browser half (§4.5) and G56-3 were not run (environment).** This is the **fifth round** with no browser evidence.
  - `http://127.0.0.1:5173/studio-lab` and `:5199` returned `000` at 20:37, 20:50 and 20:51.
  - `netstat` showed no listener on 5173 or 5199.
  - Purchase protection (G-3/G56-3) has **never been browser-verified** in rounds 52–56. The stage-4a browser acceptance is still pending.
  - No gstack browse state was created, because there was nothing to load.
- **New bugs: none.**

## G56-2 — baseline and end state: PASS

| Check | Start 20:37 | End 20:51 |
|---|---|---|
| HEAD | `038ed5a45f94…` | same |
| `git status --short` | 22 lines (17 baseline + 4 ` M` owned + `?? …/049-…md`) = case A | 22 |
| Frozen list (409 entries) | 0 not OK | 0 not OK |
| Snapshots `SHA256SUMS` | 4/4 OK | — |
| Protected files | 4/4 OK | 4/4 OK |
| `node.exe` | 9 | 9 |

Files: `end-state.txt`.

## R56-S — static: PASS with deviation R56-S-DEV1

`sfx-library`, `master-ui` and `fader-guards` each have exactly 1 hunk with +1/−1. That line only adds `{ timeout: 15_000 }` as the second argument (`diff-*.txt`).

`track-layout`:
- 3 describes, wrapped by Biome.
- `diff -u` shows **1 hunk (+882/−866)** because the bodies were re-indented.
- `diff -w` shows:
  - the 3 wraps with the argument;
  - the 3 `},\n);` closings;
  - **2 `toBe(\n'music'|'sfx',\n)` re-wraps** at about l.703 and l.707.

**R56-S-DEV1 (ruling: deviation, not a bug; a B decision item):**
- This is not the letter of §4.1. §4.1 expects 6 hunks, 3/1/1/1, and `diff -w` showing only the added argument.
- The 2 extra re-wraps are forced by Biome. The re-indent pushes those lines over lineWidth 100. Leaving them unwrapped would break the "0 Biome diagnostics" criterion, which is also in §4.1.
- C proved equivalence independently with its own script (`tokeq.cjs`, not A's recipe):
  1. Insert `{timeout:15_000},` after each top-level `describe('<title>',` in the snapshot.
  2. Strip all whitespace from both files.
  3. Normalise trailing `,)` and `,}`.
- Result: **equal = true for all 4 files** (1/1/1/3 insertions; `token-equivalence.txt`).

Other checks:
- **`it` counts:** 36 / 3 / 18 / 63, unchanged.
- **Forbidden tokens:**
  - `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` and `useFakeTimers` are 0 in the 4 owned files, after the edit (`end-state.txt`) and in the snapshots.
  - Note: the first grep in `token-equivalence.txt` also matched `timeout:`. Its 0→1/1/1/3 delta is exactly the intended suite option and is **not** a finding.
- **EOL:** LF only, 0 CRLF (track-layout 1191, sfx 182, master 701, fader 1721).
- **Doc 049:** has date, status (`Round 56 — D-29z21; C-ის შემოწმებას ელოდება`), changed project, context, approach, architecture, changed files, problems, testing, Ableton and TODO.

## R56-U — mechanism (C's own scratch and strings): PASS

**Setup:**
- C made a scratch copy of `store/app` under `c-round-56/scratch`, with its own `vitest.config.mts` and a `node_modules` junction.
- The junction was **removed at the end**; `store/node_modules` still has 618 entries.
- Hang string, different from A's: `await new Promise<void>((settle) => { setTimeout(settle, 120_000); });`.
- Each file was restored after its case (`restored true`).

| # | Change | Result | Expected |
|---|---|---|---|
| M1 | `track-layout` fold test (l.279) | `Test timed out in 15000ms`, 1 failed / 35 passed | 15000 ✔ |
| M2 | `fader-guards` **last** `it` of the 2-level nested `C-R36-01` describe (l.1704; A used l.1621) | 15000, 1 / 70 | 15000 ✔ |
| M3 | M1 with `{ timeout: 15_000 }` removed | 5000, 1 / 35 | 5000 ✔ |
| M4 | non-owned `grid-snap-ui` GS14 (l.363) | 5000, 1 / 19 | 5000 ✔ |
| M5 (C extra) | `sfx-library` "adds three" (l.107) | 15000, 1 / 2 | 15000 ✔ |

Files: `mechanism.txt`, `m-M1..M5.log`, `mech.cjs`.

**Alone-durations:**
- Before: the snapshot files in scratch. After: the store files.
- Both runs: 4 files, 128/128, `node.exe` 9 (`named-before.txt`, `named-after.txt`).

| Test | before ms | after ms |
|---|---|---|
| fold | 378 | 384 |
| no-history | 78 | 78 |
| adds three | 458 | 479 |
| searches | 278 | 285 |
| renders | 124 | 121 |
| `Clip Gain typed "3"` → the same SFX header click … | 47 | 51 |

All are within 2×. Info: C's alone times are 2–4× faster than B's table (fold 378 vs 1579). This is environment variance, not a finding.

## G56-1 — gates: PASS

- `npx tsc --noEmit`: rc 0.
- Biome `./app`: **5 errors / 218 warnings / 1 info**.
  - The errors are exactly the baseline CRLF `format` list: `StudioWorkspace.tsx`, `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `auth.ts`.
  - The 4 owned files have 0 diagnostics ("Checked 4 files … No fixes applied").
- Full vitest, quiet (`node.exe` 9): **87 files / 1504 passed**, 47.9 s, 0 `timed out`.
- `npm run build`: rc 0.
- `npm run verify`, attempt 1, quiet: **rc 0**; 87/1504; both builds OK. One attempt was enough.

Files: `tsc.txt`, `biome-app.txt`, `biome-owned.txt`, `full-vitest.txt`, `build.txt`, `verify-1.txt`.

## R56-LOAD — under load

**Method (`run-load.sh`):**
- A background loop ran `npx tsc --noEmit` back-to-back in `store/`. It started 8 s before vitest and was stopped only after vitest ended.
- `node.exe` was sampled at the start, after about 30 s, and at the end.
- Reporters: default + JSON → `runs/<label>.json`.

| Run | Tree | Generator PID / iterations | Alive at end | `node.exe` start / mid / end | Wall s | Result | Timeouts |
|---|---|---|---|---|---|---|---|
| control | scratch, snapshot (5 s default) | 50879 / 3 | yes | 11 / 17 / 11 | 80 | 1504/1504 | **0** |
| run1 | store | 50949 / 3 | yes | 11 / 17 / 11 | 85 | 1504/1504 | 0 |
| run2 | store | 51018 / 3 | yes | 11 / 17 / 11 | 89 | 1504/1504 | 0 |
| run3 | store | 51087 / 3 | yes | 11 / 17 / 11 | 90 | 1504/1504 | 0 |

**Slowest test per file, ms** (`load-summary.txt`):

| Run | sfx-library | master-ui | track-layout | fader-guards | grid-snap-ui | grid-snap-loop-drop |
|---|---|---|---|---|---|---|
| control | 2786 | 998 | 814 | 405 | 692 | 340 |
| run1 | 2016 | 1814 | 1368 | 460 | 620 | 364 |
| run2 | 2483 | 1740 | 1760 | 659 | 598 | 316 |
| run3 | 2467 | 2081 | 1586 | 662 | 678 | 442 |

**Scratch note:** after the control run, the 4 owned files in `c-round-56/scratch/app` are the **snapshot (pre-edit)** versions. They are not the store versions, and the store edit was not reverted.

**Verdict:** 3 valid runs, 0 extra attempts used, and 0 timeouts in every file, owned and non-owned. The control also showed 0.
- **C-R48-01: "closed as not reproduced under test load; headroom proven only by M1–M5"** (closure form 2).
- **Residual for B:**
  - The generator was weak: 3 tsc iterations per run, `node.exe` peak 17, vitest wall about 1.7–1.8× the quiet run.
  - The worst observed test was 3.0 s (`render-budget`, control). That is far below the 5–8.45 s timeouts of rounds 51–54.
  - So the fix is shown by the runner mechanism, not by reproducing the bug.
- **C-R48-01-GRID-RESIDUAL (Low):** stays open. M4 confirms that `grid-snap-ui` keeps 5 s. There was no recurrence this round.

## §4.5 carried browser half and G56-3: not run (environment)

- Servers were `000` at 20:37, 20:50 and 20:51, with no listener in `netstat`. Agents do not start servers.
- The following are **not PASS**:
  - R55-SHIFT (SH-CROSS, SH-SAME, SH-NOTE);
  - R52-EDGE;
  - R54-CROSS (CX-VIDEO, CX-NOTE);
  - R53-LANE, R52-TRIM, R52-PLAY (EP-VIDEO, EP-OFF, EP-CROSS, EP-SHIFT);
  - R52-REG and REG-HYD;
  - **G56-3: anonymous `/studio-lab` and the purchase-protection checks (401 on `/api/studio-token`, "Sign in required" on `/studio/middle-east`, no Authorization or R2 traffic).** Fifth round without them.
- The user-level flow (find sound → add → fit video → real export with WAV data, duration and sample checks) and the 1280×720 and 1440×900 checks were **not run** for the same reason. They are not claimed.

## Ableton

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| Test timeout headroom for jsdom suites | PASS (R56-U, R56-LOAD) | **does not apply** (test infrastructure; no claim) |

The round-55 Ableton table (§6.7 and §6.10) was not evaluated, because §4.5 did not run.

## Commit readiness for root

- **Round 56** (4 test files + doc 049): **commit-ready** on the C evidence for R56-S, R56-U, R56-LOAD, G56-1 and G56-2.
  - Note R56-S-DEV1: the Biome-forced `track-layout` re-indent plus 2 `toBe` re-wraps, proven token-equivalent.
  - Suggested unit: `test(store): … C-R48-01 timeout headroom`.
- **Rounds 50–55** (17 paths): **unchanged status.** Unit and probe evidence only, and still **no browser evidence**. The commit remains root's decision (ROOT-COMMIT-ROUND51). C does not upgrade it.

## Findings for B

1. **R56-S-DEV1 (decision item, not a bug):** accept Biome's re-wraps as part of the §4.1 re-indentation allowance, or record a different ruling.
2. **C-R48-01 closure form 2.** If B wants form 1, it needs a stronger load generator (for example parallel vitest or several tsc processes) as a separate staged regression, outside this round's budget.
3. **ENV-DEV-SERVER-DOWN (fifth round):** root's yes/no answer (§6.1) is still missing. Stage 4a and G56-3 still have no browser evidence.

## Carried items (not re-verified this round)

**Open C bugs:**
- C-R53-01, C-R54-01, C-R54-02 (fixed at unit/probe level; browser pending);
- C-R51-01, C-R51-02 (→ 4b);
- C-R52-T1 (→ 4c);
- C-R48-01-GRID-RESIDUAL;
- C-R41-01;
- C-R27-01, C-R6-02, C-R8-01;
- C-R23-01 + C-R38-01 (Tech Lead).

**Open Low / info:** the list in `current-task.md` §4.7 is unchanged.

**`root-pre-push-review.md`:**
- **Video sync:** RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
- **Partially measured:** R5-L3.
- **Unit tests only:** R5-L5, R5-E1, R6-S2 and R6-S3.
- **Medium:**
  - M1: loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value makes every consumer re-render.
- **Lows:**
  - L1: undo/redo is unguarded during a gesture.
  - L2: `holdUntil` on a reschedule in the hold window.
  - L3: Delete ignores `event.repeat`.
  - L4: a `setPointerCapture` throw leaves the gesture state set.
  - L6: export-dialog wording when the loop is on.
  - L7: unbounded history.
  - L8: an unguarded `new AudioContext`.

**`publication-checkpoint.json`:**
- SRW-21: the purchased loader hardcodes `middle-east`, so do not claim that every product's stems work.
- Instruction files need portable paths.
- **Scrollbar refinement:** tokens on both timeline axes and the library; wheel, keyboard and drag preserved; checks at 1280×720 and 1440×900.
- **Library and stems parity:** the SRW-12 tree and the SRW-11 panel; audible, honestly labelled demo stems; find → stems folder → preview → drag.
- T12 continuation.

**Not run this round in any case:**
- video sync;
- the full find → add → fit → export flow with WAV checks;
- the FB-01..FB-16 regression;
- `test:e2e:smoke` (root);
- a real `pointercancel`.
