# Round 508: DPG-BUTTON-CLEANUP-2-NONBRAND stage N1, re-dispatch. Fix the N1-2 swap gap (sketch v3 delta on top of the applied v2), then C runs the full N1 browser acceptance

**Planned by:** B, at the round 507 → 508 planning on 2026-11-14 (`b-round-507.md`). The round-507 task is archived as `tasks/round-507.md`; every section not restated here (reference table, ruling lines, D1–D5) is unchanged from it.

## Decisions (`backlog.json` v512, `decisions_log_b`)
- **D-29z1833, round 507 result (C evidence only):** C FAIL, `browserVerified`/`realVerified` false. A STOPped on **A-R507-CR-1-N1-2-SWAP-MUTANT (Medium)**: N1-2 clicks all four controls before count-only asserts, so a Previous↔Next handler swap stays green (`a-round-507/mutant-swap.log`; C confirmed by reading the source). The product handlers are correct. The gap came from B's mutant matrix, which had no pure-swap mutant. C ran only C0, C11 and C12, so N1 is **not** verified. Gate 507 was skipped: nothing published, baseline stays `3021b30`, and the store worktree keeps sketch v2.
- **D-29z1834, round 508 = N1 re-dispatch with a v3 delta.** It changes only the n1 test and doc 328. It also takes in two Lows from A's report, both in files this round owns: A-R507-CR-2 (new N1-6) and A-R507-CR-4 (CSS path in doc 328). After B's tech-lead sketch review (`b-round-507/sketch-review.md`), delta v2 also adds N1-7 (exact class set), the icon height in N1-4 and the 0.01 Mute threshold in N1-6. A-R507-CR-3 (ghost press text in DESIGN_SYSTEM) is deferred, to keep the round at three related items.
- **D-29z1835:** B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD moves to round 509 (bug-first). Retro signal RC-R507-SWAP-MUTANT is recorded for RETRO 510.
- **D-29z1836, sketch review:** tech-lead read delta v1 (`b-round-507/sketch-review.md`) and found surviving mutants. Delta v2 (`405384eb…`) fixes R1, R2 and R4 with N1-7, the N1-4 height check and the N1-6 0.01 case. R3, R5 and R6 are pre-ruled #11–#13. New deferred Low: B-R508-VOLUME-ICON-LOW-SAME.

## Rules
- **Read `lessons.md` first.** L10 (STOP), L22, L28, L52 (every jsdom row has a mutant; this round adds pure-swap mutants), L57, L58, L59 apply as in round 507.
- **Do not re-apply v2, and do not revert anything.** The store tree already carries v2 (2 M + 2 untracked). Only the delta is applied.
- **STOP threshold (L10).** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing or slow covering test (> 2,500 ms);
  - a frozen-file check that is not rc 0;
  - a delta that does not apply cleanly;
  - a number that differs from B's §3 value.
- **The sketch writes every granted byte.** A writes no prose in source or docs.
- **Pre-ruled Lows** (a re-raise goes under "For B", not a STOP):
  - round 507's #2–#7, unchanged. #1 now reads: doc 328 l.4 says "C round 508 PASS" before C runs (L28 contract);
  - #8: N1-2 calls `vi.clearAllMocks()` per step. This is intended: each step asserts the full action list from zero;
  - #9: A-R507-CR-3 is deferred (`deferred_low_polish`);
  - #10: N1-6 checks the icon's width/height attributes, not the rendered pixels. The rendered size is C1's job;
  - #11: jsdom does not pin where a control sits in the layout or the Previous/Next order. C1 (per-control boxes ±1 px vs the oracle) and C5 own it (`sketch-review.md` R3);
  - #12: a `disabled={isLoading}` mutant would survive. No such code exists; recorded only (R5);
  - #13: icon path shapes are not pinned (R6). The low- and high-volume icons are identical at HEAD: new deferred Low B-R508-VOLUME-ICON-LOW-SAME, pre-existing, not this round;
  - #14 (L31 ruling): the covering limit is 2,500 ms, i.e. 50 % of vitest's 5 s default. LT7 (753 ms on B's run, 763 ms on A's round-507 run) and PU1 are pre-existing tests in unrelated files, far below it. Round 507's "every covering test < 500 ms" was a B observation, not a limit.
- **Purchase protection:** no auth, cart, checkout, ownership or download file is touched. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.
- **Persistent screen text (L39):** nothing is added.
- **Out of scope:** `AudioPlayer.tsx` and `DESIGN_SYSTEM.md` (byte-identical to v2 this round), the Play button, the ranges, `StemsPlayerModal`, `IconButton.tsx`, and Studio (`/studio-lab` is only smoke-checked, C11).
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.

## Baseline
- **HEAD is `3021b30`** (gate 507 skipped [K20]; gate 506 commit [K10]). The worktree carries v2: 4 changed paths [K2].
- **Frozen-file checks.** Run every check from `store/`; all were rc 0 at planning.
  1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-507/r508-tree-sha256.txt`: every tracked file except the two granted tracked paths. This is a copy of `r507-tree-sha256.txt`.
  2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files.
  3. **Before applying:** `b-round-507/r508-pre-sha.txt`, the four granted paths at their v2 bytes (= `b-round-506/r507-post-sketch-sha.txt`).
  4. **After applying:** `b-round-507/r508-post-sketch-sha.txt`, covering all four paths. `AudioPlayer.tsx` and `DESIGN_SYSTEM.md` keep their v2 sha (`8231a981…`, `0f01b243…`) [K22].
- **Reproduced by B.** On a fresh `git archive` of `3021b30` plus v2 plus the delta (`/home/runner/b507-fresh`), checks 4 and 1 are rc 0. In `store/` at planning, check 3 and `git apply --check` of the delta were rc 0.

## 0. Why this round
- **Bugs first.** A-R507-CR-1 is a Medium in round-owned code. It blocked N1's verification, so N1's browser half never ran (V2: not done).
- The fix is small and inside the four granted files. B does not downgrade it to Low: "Low is defensible" in C's report is data, not a ruling.
- **REGRESSION** is due on or after 2026-11-16 (`regression-last.json`: 2026-11-13). **RETRO** comes at round 510.

## 1. Reference
- **Unchanged from `tasks/round-507.md` §1.** The rule is IconButton ghost sm/md. The table rows (sizes, radius 12 px, rest `rgb(163, 155, 142)`, hover `rgb(29, 26, 23)` / `rgb(236, 230, 218)`, layout D5, ring, behaviour) and the deviations D1–D5 stay as written.
- **Ableton:** does not apply (Store overlay).
- **This round changes no user-visible behaviour.** It only strengthens the tests.

## 2. What changes: delta `b-round-507/sketch-508-delta.patch.txt`
Its sha256 is in `b-round-507/sketch-sha.txt` (`405384eb…`, delta v2; v1 `9fb27de4…` is superseded, see `sketch-sha-history.txt`).

| File | Change |
|---|---|
| `app/lib/__tests__/store-button-cleanup-n1.test.tsx` | **N1-2** loops over Close player, Previous, Next and Mute. For each one it clears the mocks and clicks once. It then asserts over all six actions (`closePlayer`, `skipPrevious`, `skipNext`, `setVolume`, `togglePlayPause`, `seek`): the step's own action ran exactly once and the other five ran 0 times. After the loop: `setVolume` was last called with 0. At volume 0, Mute is gone and Unmute (title "Unmute") exists. Unmute is clicked from cleared mocks; only `setVolume` runs, once, with 0.7. **N1-4** also checks the icon `height`. **New N1-6:** at volume 0 (Unmute) and 0.01 (still Mute), the volume SVG has width and height `20`. **New N1-7:** each control's sorted class set equals a rendered `<IconButton variant="ghost">` reference of its size, plus only Close's four position classes |
| `docs/implementation/2026/quarter-IV/328-dpg-nonbrand-stage-n1-audio-player.md` | l.4 → `**სტატუსი:** In Progress (stage N1 of DPG-BUTTON-CLEANUP-2-NONBRAND; C round 508 PASS)` (L28). l.44 `app.css` → `app/styles/app.css` and `app/styles/base/utilities.css`. N1-2 and N1-4 text rewritten, N1-6 and N1-7 lines added. Mutant line → `M0–M14 (b-round-507/mutants-508.txt)` |
| `app/components/audio/AudioPlayer.tsx`, `docs/design/DESIGN_SYSTEM.md` | **No change** (v2 bytes) |

## 3. A: what to implement
1. **Apply the delta.** From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - check the delta's sha256 against `b-round-507/sketch-sha.txt`;
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-507/sketch-508-delta.patch.txt`, then `git apply` on the same path;
   - run checks 4 and 1 (rc 0).
2. **Grants:** the four paths of round 507, exactly as v2 plus the delta writes them. Nothing else changes.
3. **Run.** Save the logs under `a-round-508/`. A difference from B's value is a STOP.
   - `npm run typecheck`: rc 0 (B: `b-round-507/precheck-tsc.log`).
   - `npm run lint`: rc 0, "Found 175 warnings." (B: `precheck-lint.log`).
   - `npx biome check app/components/audio/AudioPlayer.tsx app/lib/__tests__/store-button-cleanup-n1.test.tsx`: rc 0, "Checked 2 files", no fixes, "Found 1 warning." (pre-ruled #7; B: `precheck-biome.log`).
   - `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-507/covering-files.txt)`: 8 files, 88/88, the lines N1-1…N1-7 present, and no test above 2,500 ms (#14). On B's run the slowest was LT7 at 753 ms (`precheck-covering.log`).
   - **Swap proof.** Copy `store/`'s working tree to a folder outside `store/` (no `node_modules`, `.git` or `build`; symlink `node_modules`), as in C9. Then re-apply A's round-507 M7 (Previous `onClick={skipNext}`, Next `onClick={skipPrevious}`) to that copy, or use `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-507/mutants-508.py <copy outside store/> <abs a-round-508/mutant-logs> /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/head-AudioPlayer.tsx.txt`. M7 and M8 must turn N1-2 red; the whole matrix must match `mutants-508.txt` (M0–M14 OK). `store/` is restored with checks 4 and 1 rc 0. Never run a mutant inside `store/` while C may run.
   - **Code-reviewer** on the whole change against `3021b30`: give it `git diff 3021b30` plus the two untracked files.
   - **Not run by A:** the full suite and the build. B ran both on the v3 tree: `precheck-full.log` (304 files / 4,386 tests, rc 0) and `precheck-build-sketch.log` (rc 0).
4. **Write `a-round-508.md`,** including the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-508.md`, `c-round-508.json` and `c-round-508/progress.json` as it goes, heaviest rows first (L59).

**Environment**
- Store dev server: `http://127.0.0.1:5173`. Mock API: `:5199`. If `curl -s http://127.0.0.1:5199/__mock/health` fails, start the mock from the loop folder: `node mock-api/server.mjs > c-round-508/mock.log 2>&1 &`.
- **Opening the player:** on `/`, wait 6 s, press Esc, then `.click()` the first `button[aria-label="Play preview"]` via `page.evaluate`. A real preview (`middle-east.mp3`) plays.
- **Warm-up (L38):** run `ap-507.cjs` once with `WIDTHS=1440` into `c-round-508/warm`, and discard the result. Do not run vitest while a probe runs.

**Harnesses.** These are the round-507 harnesses and oracles, still valid because `AudioPlayer.tsx` is byte-identical to v2 [K22]. The oracles are in `b-round-506/probe/sketch/{sketch.jsonl,layout.json,behaviour.json}`; HEAD is in `probe/head/`.
- `BASE=http://127.0.0.1:5173 node /home/runner/czaba-project/tmp/studio-real-loop/b-round-506/probe/ap-507.cjs <abs c-round-508/after> after`
- `node …/b-round-506/probe/ap-layout-507.cjs <abs c-round-508/after/layout.json>`
- `node …/b-round-506/probe/ap-behaviour-507.cjs <abs c-round-508/after/behaviour.json>`

**Rows**

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 2 modified (`AudioPlayer.tsx`, `DESIGN_SYSTEM.md`), 2 untracked (the n1 test, doc 328); checks 1, 2 and 4 rc 0 |
| C1 | REST | `after.jsonl` `rest` | Equal to `sketch.jsonl`, boxes ±1 px. Previous, Next and Mute are 40×40; Close is 32×32, at every viewport. Radius `12px`, colour `rgb(163, 155, 142)`, opacity `1`, `title` = label |
| C2 | HOVER + PRESS | `hover`; `behaviour.json` `pressed` | Hover: bg `rgb(29, 26, 23)`, text `rgb(236, 230, 218)` on all four, and no white overlay. Close pressed: centre = `restCentre` ±1 px, scale `0.95` |
| C3 | KEYBOARD FOCUS + POINTER | `kbd`, the `*-focus.png` crops, `afterMute.fv` | `fv` true, offset `2px` on all four at all 3 viewports; view ≥ 4 crops. Previous, Next and Mute show the ring on all four sides. Close shows left, top and bottom; its right side is off-screen, as at HEAD (record: B-R507-PLAYER-CLOSE-RING-CLIPPED). After a mouse click on Mute, `fv` is false |
| C4 | CONTRAST | `restContrastVsPanel` | 7.2 on all four at every viewport (≥ 3:1). Below 3 is a Medium |
| C5 | LAYOUT | `layout.json` vs `probe/head/layout.json` | Player height 90 at 1440 and 1280; 243.8 ±1 at 375 (D5). `playCx` 720 / 640 / 187.5. One full-player screenshot per viewport: the title does not overlap Close, and nothing wraps |
| C6 | BEHAVIOUR (real audio) | `behaviour.json` | At each viewport: the preview plays (`mediaB.t` > `mediaA.t`). Mute → `vol` 0, and an "Unmute" button exists with title "Unmute". Unmute → `vol` 0.7. Close → no Close button, and the media is `paused` at `t` 0. 0 page errors. **Record:** `activeAfterClose` is BODY, as at HEAD (B-R507-PLAYER-CLOSE-FOCUS-LOST); another value is reported, not failed |
| C7 | GREP | From `store/`: `python3 -I …/b-round-506/scan-nonbrand.py . /tmp/n.json` and `python3 -I …/b-round-497/scan-brand.py . /tmp/s.json`; K3 | `54 hits; files 28`; brand `92 hits; 31 solid`; K3 `<button=1 <IconButton=4 bg-white/10=0 hover:text-error=0` |
| C8 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-507/covering-files.txt)` | 8 files, 88/88; N1-1…N1-7 present; no test above 2,500 ms |
| C9 | MUTANTS | Copy `store/`'s working tree (no `node_modules`, `.git` or `build`) outside `store/`, and symlink `node_modules`. Run `python3 -I …/b-round-507/mutants-508.py <copy> <abs c-round-508/mutant-logs> …/b-round-506/head-AudioPlayer.tsx.txt` | M0–M14 all `OK` and `restored rc 0`, matching `b-round-507/mutants-508.txt`. Above all: **M7 (Previous↔Next swap) and M8 (Close↔Next swap) are red on N1-2**, and M11/M14 (extra class) are red on N1-7 |
| C10 | DOCS | `git diff 3021b30 -- docs/design/DESIGN_SYSTEM.md`; doc 328 | DESIGN_SYSTEM: only the one added `ghost` line. Doc 328: the 7 headings (L26 subsequence). l.4 byte-equal to `**სტატუსი:** In Progress (stage N1 of DPG-BUTTON-CLEANUP-2-NONBRAND; C round 508 PASS)` [K23]. l.44 names `app/styles/app.css` and `app/styles/base/utilities.css`. N1-6 and N1-7 lines present; mutant line `M0–M14`. Every number in D1–D5 traces to `sketch.jsonl` / `layout.json` or `after*`. `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 |
| C11 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link. `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each). Check 2 rc 0 |
| C12 | CLAIMS + SOURCE-SCOPE (end) + L57 | `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-507/claims-508.sh`, compared with `b-round-507/claims-508-sketch-output.txt`; C0 again; `python3 -I tools/l57-check.py c-round-508.json c-round-508/l57-check.txt` | No `MISSING`. Identical except K1 (store HEAD `3021b30`, or the loop-state commit) and K2 (store 4 changed, scratch 2). C0 still holds. L57 rc 0, every `null` naming its reason |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Blocked:** none expected.
- **Neighbours that could break:**
  - the player's progress and volume ranges (`audio-preview-player`, the SABA-B-14 seek thumb): covered by the covering set and C6;
  - ChatInput "Send message" (the other `IconButton` user): `IconButton.tsx` is unchanged;
  - `store-focus-ring`: in the covering set.
- **L22:** if A STOPs, C runs only C0, C12 and C11. A STOP that names an unruled Medium+ is a short FAIL.
- **Closing:** with C PASS and `browserVerified` true, NONBRAND stage N1 is verified, and A-R507-CR-1, CR-2 and CR-4 close.

## 5. B's pre-check (`b-round-507/`, on `/home/runner/b507-scratch` = a `git archive` of `3021b30` + v2 + the delta, outside `store/`)

| Check | Result | Log |
|---|---|---|
| tsc / lint / Biome (2 files) | rc 0 / rc 0, 175 warnings / rc 0, no fixes, 1 warning | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log` |
| Covering tests | 8 files, 88/88 (slowest LT7 753 ms) | `precheck-covering.log` |
| Full suite | 304 files / 4,386 tests, rc 0 | `precheck-full.log` |
| Build | rc 0 | `precheck-build-sketch.log` |
| Mutants | M0–M14 OK (M7/M8 → N1-2; M9/M10/M13 → N1-6; M11/M14 → N1-7; M12 → N1-4), `restored rc 0` | `mutants-508.txt`, `mutant-logs/` |
| Sketch review | tech-lead on delta v1: 3 Medium + 4 Low test-strength findings. R1, R2 and R4 were fixed in v2; R3, R5 and R6 are pre-ruled #11–#13 | `sketch-review.md`, `sketch-sha-history.txt` |
| Gap proven on v2 | A's M7 on v2: 5/5 green | `a-round-507/mutant-swap.log` [K25] |
| Delta reproduces the tree | fresh archive + v2 + delta: checks 4 and 1 rc 0; in `store/`, check 3 and `git apply --check` rc 0 | (this table) |
| Claims | planning and sketch outputs, no MISSING | `claims-508-planning-output.txt`, `claims-508-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if the planning happens on or after 2026-11-16.
2. **Round 509: B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD** (Medium, bug-first). Needs:
   - a product-designer target ruling;
   - a jsdom repro;
   - ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE for the browser half. Without it, that half stays a named open row, not a PASS.
3. **NONBRAND N2–N9**, in the consult's order, then the StemsPlayerModal pair once the fixture exists.
4. **Then:**
   - PD-R498-404-SECONDARY-ALIGN;
   - the stage-2 close-out;
   - the rest of DPG P1;
   - the DP gate;
   - P2.
5. **RETRO** at round 510.

## Claims (`b-round-507/claims-508.sh` = round 507's K1–K18 plus K19–K26)
- K19: n1 test shape (its=7, clearAllMocks, per-click loop, togglePlayPause in list, N1-6, N1-7, ghost reference)
- K20: gate 507 skipped
- K21: c-round-507 FAIL, with its one Medium
- K22: `AudioPlayer.tsx` sha = v2 pin
- K23: doc 328 l.4
- K24: mutants-508 15 OK, 0 MISMATCH
- K25: A's swap proof on v2
- K26: artifacts present (incl. `sketch-review.md`)
