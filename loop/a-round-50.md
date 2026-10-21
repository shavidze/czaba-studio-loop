# A — Round 50 report: SRW-14 stage 3a (FB-13): position follows the grid; C-R49-01 / C-R49-02 test gaps

Implementer: A (Claude Opus 5.5). Date: 2026-10-17. Task: `current-task.md` (D-29z15). **No PASS is claimed here; C verifies.** No commit, push, deploy, install, server start/stop or permission bypass.

## 1. Pre-flight gate and baseline

**Pre-flight gate:**
- **Assumptions:**
  - The spec fixes every hunk (§0.1–§0.4, §0.7).
  - jsdom rects are 0, so a ruler or lane `clientX` maps to `clientX / 40` s (zoom readout `40 px/წმ`, asserted in SP2).
  - Alt for a click is read from the `pointerup`; the playhead drag reads it on every sample.
- **Smallest version:** about 25 source lines across 4 files, plus tests and doc 046.
- **Files:** only the 7 in §3.1.
- **Success criteria:**
  - red run as in §2.2;
  - green run;
  - mutations (a)–(r) killed;
  - tsc 0;
  - vitest 84 files / 1418 + 3 + N;
  - Biome within the baseline;
  - `npm run verify` exit 0.

**Read before the first edit:**
- `.claude/rules/read-primitives.md`;
- the primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and GEORGIAN_DOCS;
- `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`;
- the code ranges in §1.3;
- C's `c49-supplement-cases.tsx.txt` and `run-mut.sh` (for the exact (n)/(p) mutations).

**Baseline (before any edit):**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` empty.
- 401 list: **0 non-OK**.
- Snapshot `SHA256SUMS.txt`: 5/5 OK, and `cmp` of all 5 owned files reported "same".
- Protected files: 4/4 OK.
- node.exe: 33.
- Biome `./app` was not re-measured before the edits. B's 5 / 218 / 1 is the reference, and the final read-only run gives exactly 5 / 218 / 1 (§6).

**Design choice (§0.2):** the Alt bypass reaches `endRulerNavigation` as a **third parameter**, `bypass = false`. `handlePointerEnd` passes `event.altKey`. The abort and unmount paths, which never seek, omit it.

## 2. Red run, mutations, green run

**Red run** (the 5 snapshot sources plus the new tests, in scratch `a-round-50/scratch` outside `store/`; file `a-round-50/red-run.txt`; node.exe 33): **9 failed, 32 passed. This is exactly §2.2's expectation, with no differences.**
- Red: SP1 (`resolveGridTime is not a function`), SP3, SP5, SP7, SP11, SP14 (the first half: `expected 9.3 to be 9`), SP15, SP16 and the rewritten SE10.
- Green: SP2, SP4, SP6, SP8, SP9, SP10, SP12, SP13, SE10b, SE20, SE21, plus the unchanged SE cases.

**SP17** was added after the code review (§5). On the snapshot ruler it is red: `expected 5.4 to be 5` (`a-round-50/red-run-sp17.txt`).

**Green run** (`a-round-50/green-run.txt`): 2 files, **41/41**. With SP17 added, the new file alone gives 17/17.

**Mutations** (`a-round-50/mutations.txt`, runner `tools/run-mutations.sh`, exact single-match replacements by `tools/mutate.cjs`, node.exe 33–45). The unmutated base is 41/41. **Every mutation was killed by its named test:**

| # | Mutation | Failed tests |
|---|---|---|
| (a) | ruler click seeks `anchorTime` unsnapped | SP3, SP5, SP15, SP14 |
| (b) | ruler click ignores Alt | SP4, SP5, SP14 |
| (c) | ruler click reads Alt from `pointerdown` (ref set at down) | SP4, SP5, SP14 |
| (d) | playhead snaps only on release | SP7 |
| (e) | playhead ignores the step entirely | SP7 |
| (f) | ruler drag also seeks | SP6 |
| (g) | playhead ←/→ snapped | SP10 |
| (h) | lane click unsnapped | SP11 |
| (i) | lane click reads Alt from `pointerdown` (`event.altKey`) | SP12 |
| (j) | clip-body click unsnapped (round-49 code) | SE10, SP16 |
| (k) | clip-body click ignores Alt | SE10b |
| (l) | `resolveGridTime` rounds the free value to ms | SP1 |
| (m) | fixed 1 s when Alt-enabling | SP1, SP5 |
| (n) | C's (n), verbatim from `c-round-49/tools/run-mut.sh`: trim clamp-then-snap | SE20 |
| (p) | C's (p): only `'before-start'` suppresses ghosts | SE21 |
| (r) | clip-body seek clamped to `gesture.original.start` | SP16 |
| (q) | A extra, C's (q): ruler gets `snapSeconds={gridSeconds}` regardless of Snap | SP2, SP5, SP9 |
| (t1) | SP17 extra: cancel commits the raw cancel x | SP17 (`mutations-sp17.txt`) |
| (t2) | SP17 extra: cancel snaps the cancel x | SP17 |

C's mutation (s) (clip-body Alt read from `pointerdown`) was **not run** by A; it is left to C. SE10b presses without Alt and adds Alt only on the `pointerup`, so (s) should fail SE10b.

After the runs the scratch files were restored from `store/`. The scratch `node_modules` junction was removed with `cmd /c rmdir` only; `store/node_modules` is intact.

## 3. Diff summary per file (EOL counted with node: CRLF / LF lines)

| File | Change | EOL |
|---|---|---|
| `app/lib/arrangement/grid.ts` | +1 export `resolveGridTime` (10 lines); existing lines byte-identical | LF 0/84 |
| `app/components/arrangement/ArrangementRuler.tsx` | `grid` import; 2 optional props in `ArrangementRulerProps`; defaults `snapSeconds = null`, `gridSeconds` in both destructures (playhead and ruler); move → `resolveGridTime(pointerTime(x), …, event.altKey)`; pointerup branch of `onScrubEnd` likewise (cancel keeps `drag.time`); `endRulerNavigation(…, bypass = false)` → `onSeek(resolveGridTime(anchorTime, …, bypass))`; `handlePointerEnd` passes `event.altKey`. Keys, `pointerTime`, effects and listeners unchanged | LF 0/420 |
| `app/components/arrangement/StudioWorkspace.tsx` | import gains `resolveGridTime`; ruler gets `snapSeconds={snapEnabled ? gridSeconds : null}` and `gridSeconds={gridSeconds}`; lane `finish` → `latest.seekTo(resolveGridTime(gesture.clickTime, snapEnabledRef.current ? gridSecondsRef.current : null, gridSecondsRef.current, end.altKey))` (Biome-wrapped). Edited with a CRLF-preserving script; the LF copy gives no changes under `biome format` | **CRLF 1668/1668** |
| `app/components/arrangement/ArrangementClip.tsx` | grid import (now multi-line, as Biome requires); the one `finishGesture` line `seekTo(resolveGridTime(gesture.anchorTime, snapSeconds, gridSeconds, event.altKey))`. `beginGesture`, `handlePointerMove` and `DRAG_THRESHOLD_PX` are untouched | LF 0/664 |
| `app/lib/arrangement/__tests__/grid-snap-edit.test.tsx` | SE10 rewritten (title + `toBe(7)`); SE10b, SE20 and SE21 added; nothing else changed (checked with `git diff`) | LF 0/693 |
| `app/lib/arrangement/__tests__/grid-snap-position.test.tsx` | new: 17 `it` (SP1–SP17); harness copied, not imported | LF 0/513 |
| `docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md` | new, per TEMPLATE / GEORGIAN_DOCS, with the §4.9 table | LF 0/112 |

`git diff --stat`: 5 files, +94 / −9. Full diff: `a-round-50/diff.txt`.

**Harness notes for C:**
- The handle's move, up and cancel events are fired on the handle itself, because its `pointerdown` calls `stopPropagation`.
- Lane events: `pointerdown` goes on `[data-track-id=X] [data-grid-seconds]`, and up/move go on `window`.
- SP13 marquee x = 224 + t × 40. The marquee uses the container rect and the header width, while `clickTime` uses the lane rect.
- SP6 uses a vertical 60 px drag. rAF is stubbed, so the view is applied on release; the observable is the zoom readout.

## 4. Browser smoke (one run; not a PASS claim)

- File: `a-round-50/smoke.txt`.
- Setup: gstack `$B` with a fresh state file `a-round-50/a-browse.json` (wrapper `a-round-50/b.sh`, `BROWSE_PARENT_PID=0`), on the running `http://127.0.0.1:5173/studio-lab` (curl 200). node.exe 46. No server was started; no `$B restart`.
- Steps:
  1. viewport 1440×900, goto (200);
  2. initial state: `data-snap="off"`, zoom `40 px/წმ`, handle 0;
  3. **REAL `$B press g`** → `data-snap="on"`, status `Snap ჩართულია — ბადე 1 წმ (G)`;
  4. **REAL `$B click`** on a 2-px marker injected inside the ruler at x = ruler.left + 7.3 × 40 = 804 (`elementFromPoint` hit the marker; this is C's targeting method). The click bubbles to the ruler.
- Result: handle `aria-valuenow` **7**, `aria-valuetext` **`00:07.000`**. The marker was removed afterwards.
- Console: only the known `GET /api/cart` `ERR_CONNECTION_REFUSED` and "Failed to load cart" (allowed list). This is not REG-HYD.
- I stopped my own browse server with `$B stop`; its pid 42296 is no longer running.

## 5. code-reviewer (actual subagent run): findings and dispositions

Full text: `a-round-50/code-review.md`. **Score 8.5/10, no blockers.**
- **Should-fix 1 — the playhead cancel/lost-capture path had no test.** Addressed: SP17 was added in my own new file, and mutations t1/t2 kill it. This is one `it` beyond §2.2's SP list, so the new-file count is 17. Recorded under deviations.
- **Should-fix 2 — a clip-body `pointercancel` with no movement still seeks** (`onPointerCancel` → `finishGesture`). The ruler and the lane do not seek on cancel. This existed before this round, and §0.4 names "pointerup/pointercancel". `finishGesture` is frozen except for the one line, so **I did not change it**. → For B: **A-R50-REVIEW-CLIP-CANCEL-SEEK** (Low, consistency).
- **Nits** were recorded and not changed:
  - the `bypass` default parameter;
  - a ~100-column line (Biome reports 0);
  - `aria-valuenow` above `aria-valuemax` by less than half a division (P6; C's P-END);
  - SP14 asserts the exact status string;
  - SP16 relies on the jsdom zero clip-root rect;
  - the duplicated `snapEnabled ? gridSeconds : null` (as §0.3 asks).
- **Architecture notes (for B/root; not acted on):**
  1. The `(snapSeconds, gridSeconds, bypass)` triple is now threaded into the lanes, the clips and the ruler, and the lane gesture has a ref copy. It grows in round 51. This is input for **ARCH-CHECKPOINT-SRW14-PREFS**: should a read-only edit-prefs slice exist? It would also unblock a snapped paste (P4).
  2. The per-file copied test harness (~200 lines). Proposal: a test-only extraction task with identical counts.
  3. The reviewer considered and rejected snapping centrally in `seekTo`. That would also snap the arrow keys, playback and Stop (against P3/P4), it needs the frozen context, and it loses the per-event Alt.

## 6. Command tails (verbatim)

```
$ git rev-parse HEAD            -> 038ed5a45f94596a264c14c4ec834607cb407948 (start and end)
$ git status --short (end)
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementRuler.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
 M app/lib/arrangement/grid.ts
?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
$ sha256sum -c b-round-49-r50-tree-sha256.txt   -> non-OK 0, OK 401
protected: download-routes.test.ts OK / account.downloads.tsx OK / api.studio-token.ts OK / studio.$productId.tsx OK
$ frozen suites (18 files listed in §4.8)        -> Test Files 18 passed (18), Tests 357 passed (357)   [node.exe in frozen-suites.txt]
$ npx tsc --noEmit                               -> exit 0, no output
$ npx vitest run (before SP17)                   -> Test Files 84 passed (84), Tests 1437 passed (1437)
$ npm run build                                  -> exit 0, "✓ built in 2.87s"
$ npx biome check ./app --diagnostic-level=error -> Found 5 errors: StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, auth.ts — all `format`, the baseline CRLF list
$ npx biome check ./app                          -> Found 5 errors. Found 218 warnings. Found 1 info.
$ npx biome check <4 LF owned + new test>        -> Checked 5 files … No fixes applied. (0 diagnostics)
$ npx biome lint StudioWorkspace.tsx             -> Checked 1 file … No fixes applied.
$ biome format on the LF copy of StudioWorkspace -> no changes
$ npm run verify (final tree, with SP17)         -> Test Files 84 passed (84), Tests 1438 passed (1438), builds ✓, "verify exit 0"
$ tasklist | grep -ci node.exe                   -> 33 (start), 33–46 during runs, 41 (end)
```

The final vitest count is **1438 = 1418 + 3 (SE10b, SE20, SE21) + 17 (new file)**. Before SP17 it was 1437 (+16). Files: `a-round-50/{red-run,red-run-sp17,green-run,mutations,mutations-sp17,frozen-suites,tsc,full-vitest,build,biome-app,biome-app-errors,verify,final-state,diffstat,diff,smoke,code-review}.txt|md`.

## 7. Deviations and notes

1. **SP17 is an extra `it`** (reviewer should-fix 1). It lies within my new-file ownership. The new-file count is 17, not 16.
2. **The red run was not re-run with SP17 for the whole file.** SP17 alone was run on the snapshot sources (red).
3. **Shell EOL counter:** in this Git Bash, `grep -c $'\r$'` printed the full line count for LF files too, so it is unreliable here. All EOL counts in §3 come from node (`/\r\n/g` versus `/\n/g`). C should not rely on the grep form.
4. **The smoke click was REAL `$B click`** on an injected ruler-child marker, the same targeting method C used in round 46. A did not run PW, drags or Alt in the browser.
5. **Biome `./app` was not measured before the edits.** The end-state numbers equal B's baseline.
6. **Biome `--write` on two test files.** I ran `npx biome check --write` once on `grid-snap-edit.test.tsx` and `grid-snap-position.test.tsx`, only to wrap my own new long lines. `git diff` shows only the §0.7 hunks in `grid-snap-edit`; no pre-existing line was reformatted. No `--write` was run on any source file or on `StudioWorkspace.tsx`.
7. **`a-round-50/diff.txt` was regenerated from the final tree** (including SP17 and doc 046). The code-reviewer saw the earlier, pre-SP17 diff.
8. `root-pre-push-review.md` is the round-3 review from 2026-10-07. Its findings fall outside this round's scope. Root items still open in `publication-checkpoint.json` → `round49.open`: C-R48-01, R49-T, GSTACK-NO-MOUSE, ARCH-CHECKPOINT-SRW14-PREFS. C-R49-01 and C-R49-02 should close if C confirms SE20 and SE21.

## 8. Scope completed and next C checks

**Done by A** (implementation only; nothing below is a PASS claim):
- §0.1–§0.4 source;
- §0.7 test changes;
- §2.2 (a) new file;
- doc 046.

**B acceptance items A actually checked and passed in its own runs:**
- the §2.2 red/green expectations;
- mutations (a)–(r);
- §2.3 self-check counts and Biome limits;
- `npm run verify` exit 0;
- §3.1 file list;
- 401 OK;
- protected 4/4.

The browser acceptance IDs (R50-RULER/DRAG/LANE/CLIP/PASTE/PLAY/REG, G50-3) were **not run by A**.

**Exact next C checks:**
1. **G50-2**, then **R50-S:** `diff -u --strip-trailing-cr` against `b-round-49-r50-snapshots/`, and EOL counts using node, not `grep $'\r$'`.
2. **R50-U:**
   - re-run (a)–(r);
   - C's (q) and (s). (s) is not run by A; it should fail SE10b;
   - optionally SP17's t1 and t2.
3. **Browser:**
   - **R50-RULER:** RU-1, RU-ALT, RU-ALT-ON, RU-NAV, RU-DBL, RU-10, RU-1280, P-END;
   - **R50-DRAG:** DR-1 (handle line vs lane playhead ±1 px), DR-PLAY (audio restarts at 10.000);
   - **R50-LANE:** LA-ALT (Alt pressed between down and up);
   - **R50-CLIP:** CL-EDGE (not clamped, P5);
   - **R50-PASTE:** PA-1 (record the exact status text; the unit test expects `ჩასმა (1): 00:09.000-ზე · SFX ხაზზე.` for the lane named `SFX`), PA-ALT;
   - **R50-PLAY:** PL-1 versus PL-OFF meter contrast.
4. **R50-REG:**
   - REG-HYD, TR-1, AL-1;
   - **G50-1** and **G50-3**.
5. **For B:**
   - A-R50-REVIEW-CLIP-CANCEL-SEEK (Low);
   - the two architecture notes in §5.

**Commit readiness:** the 7 paths in §3.1 match the expected `git status`. Root decides after C's verdict.
