# A — Round 60 report (SRW-14 stage 4b-2b, D-29z25)

Implementer: A (Claude Opus 5.5). Date: 2026-10-18. Task: `current-task.md` (round 60). No commit, push, deploy, install or server start/stop. Not a PASS claim; C verifies.

**Resume note:** this round ran in two A sessions. Session 1 crashed at 11:38Z on a session limit (`root-r60-recovery-note.txt`). Session 2 (this one) kept every session-1 edit. It re-verified the tree, read the diffs and re-read the primitives, then finished the mutations, gates, smoke, review and report. Nothing was reverted or re-created.
- **One scratch fix:** the crash left mutation `l` applied in the **scratch** copy of `ArrangementGridMenu.tsx`. I restored it from `store/` (`diff -rq` clean) before re-running.
- `store/` itself was never mutated.

## 1. Pre-flight gate and baseline

**Pre-flight gate**
- **Assumptions:**
  - §0.1–§0.3 and §2.2 are implemented exactly as specified; the session-1 diffs were read and match;
  - the baseline is case (A);
  - the remaining work is evidence (mutations, gates, smoke, review) plus the report.
- **Smallest version:**
  - source: +14/−6 in `StudioWorkspace` and +5 in `ArrangementGridMenu`;
  - tests: exactly the §2.2 additions;
  - no other change.
- **Files:** the 4 owned files and doc 053; scratch and evidence go under `a-round-60/`.
- **Success criteria:**
  - mutations a–m kill their named tests;
  - vitest 89 / 1552; tsc 0; build rc 0; `npm run verify` rc 0;
  - Biome within baseline; frozen 416/416; protected 4/4.

**Baseline (case A)**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` has 28 lines before the round and 29 after.
- Frozen list: 0 non-OK of 416. Protected: 4/4 OK.
- Snapshots: session 1 recorded 4/4 equal before editing (`checkpoint.md`).
- Biome `./app`: 5 / 218 / 1. `node.exe`: 12.
- Servers: `/studio-lab` 200 and `:5199/api/products` 200 at the start and at the end.

## 2. Diff per file (`a-round-60/diff.patch`)

**`app/components/arrangement/StudioWorkspace.tsx`** — CRLF 1807 / LF 1807 (0 bare LF); sha `0ea67202`.
- New `stepGridDivision(direction)` `useCallback` (deps `[changeGridDivision]`). It uses `workspaceRef.current.setStatus`, which is the same object as the old `current`.
- The window digit branch keeps its guards in the same order (`modifier` return → `!alt && !shift` → `preventDefault` → `repeat` return), then calls `stepGridDivision`.
- The select `onKeyDown` returns early on `exportOpenRef.current`, on a code other than Digit1/Digit2, and on Ctrl/Meta/Alt/Shift. Otherwise it calls `preventDefault()`, and steps only when `!event.repeat`.
- Effect deps: `[changeGridDivision, returnFloatingVideo, toggleSnap]` → `[returnFloatingVideo, stepGridDivision, toggleSnap]` (Biome lint 0).
- `isTypingTarget`, `aria-keyshortcuts` and both `title` suffixes are unchanged.

**`app/components/arrangement/ArrangementGridMenu.tsx`** — LF 202; sha `baf32ff4`.
- `onContextMenu={(event) => event.preventDefault()}` on the `role="menu"` root.
- In `armGridMenuDismissClickSwallow`:
  - `keydown` (capture `true`) and `blur` (non-capture) both call `releaseClickSwallow`;
  - `releaseClickSwallow` removes both with matching flags.
- `blur` is deliberately non-capture. `closeGridMenu` restores focus synchronously, and a capture listener on window would see that element blur and release the swallow at once (doc 053).

**`grid-snap-menu.test.tsx`** — LF 954; 35 `it`; sha `12870d41`.
- `cleanup` is imported.
- `afterEach` gains `cleanup()` → `fireEvent.pointerDown(window)` → `expect(fireEvent.click(document.body)).toBe(true)`, placed before the existing two lines.
- GM25–GM31 are appended after GM24 in describe 1.

**`grid-snap-keys.test.tsx`** — LF 456; 13 `it`; sha `89c40175`.
- GK9: name and body rewritten.
- GK11: appended after GK10.

**Doc `docs/implementation/2026/quarter-IV/053-studio-lab-grid-select-keys-menu-release.md`** — new; LF 124; sha `4983c748`.
- It has the §2.5 sections.
- Two edits came from the review (§6): the Ableton table now has the EG-GROUP row and the C-check column, and l.88 is reworded.

**Banned patterns** in the 3 LF code files: 0 hits for `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig`, `: any`, `as unknown` and `@ts-ignore`. There are no comments and no colours.

## 3. New tests (run alone)

| File | Result | Duration |
|---|---|---|
| `grid-snap-keys` | 13/13, rc 0 | 9.54 s (tests 3.23 s) |
| `grid-snap-menu` | 35/35, rc 0 | 12.17 s (tests 7.69 s) |

| Test | Time | Test | Time |
|---|---|---|---|
| GK9 | 145 ms | GK11 | 436 ms |
| GM25 | 179 ms | GM26 | 205 ms |
| GM27 | 89 ms | GM28 | 149 ms |
| GM29 | 166 ms | GM30 | 226 ms |
| GM31 | 135 ms | | |

- **`afterEach` probe:** it passed for all 35 tests on the unmutated tree. There was no spec-assumption stop: no §2.2 assertion failed on the unmutated tree, and no existing `it` changed.

## 4. Mutations (`a-round-60/mutations.txt`; scratch `a-round-60/scratch/` with a `node_modules` junction and its own `vitest.config.mts`)

**Command:**
```
npx vitest run --config vitest.config.mts grid-snap-keys grid-snap-menu grid-snap-ui gesture-guard --reporter=verbose
```
It runs in the scratch copy, over 87 tests.

| # | Mutation | Failing tests | Must fail | Killed |
|---|---|---|---|---|
| none | unmutated | 87/87 pass | — | — |
| a | select `onKeyDown` removed | GK9, GK11 | GK9 | yes |
| b | select `preventDefault` removed | GK9, GK11 | GK9 | yes |
| c | modifier guard dropped | GK11 | GK11 | yes |
| d | `repeat` check dropped | GK11 | GK11 | yes |
| e | `exportOpenRef` guard dropped | GK11 | GK11 | yes |
| f | `stepGridDivision` always `'narrow'` | GK2, GK3, GK9 | GK2, GK9 | yes |
| g | menu `onContextMenu` removed | GM25 | GM25 | yes |
| h | `keydown` release removed | GM26 | GM26 | yes |
| i | `blur` release removed | GM27 | GM27 | yes |
| j | `pointercancel` listener removed | GM28 | GM28 | yes |
| k | `scheduleClickSwallowRelease` ignores button ≠ 0 | GM29 | GM29 | yes |
| l | window `pointerdown` effect has no cleanup | 35 (the whole menu file, incl. GM31; the leaked listener arms a swallow that the `afterEach` probe catches) | GM31 | yes |
| m | Tab branch calls `preventDefault` | GM30 | GM30 | yes |
| r58a | swallow arm removed | GM16 | GM16 | yes |
| r58d | `closeGridMenu` on any scroll | GM21 | GM21 | yes |
| r59a | window digit branch removed | GK1, GK2, GK3, GK7, GK8 | GK1, GK2 | yes |
| r59j | arm before the inside return | GM22 | GM22 | yes |
| r59k | release calls `preventDefault` | GM23 | GM23 | yes |
| r59m | `followModeRef === 'on'` dropped | GM24 | GM24 | yes |
| **xblurcap** (extra, reviewer #2) | `blur` added with capture `true` | **none, 87/87** (survives) | — | info → B |

- Both source files were restored after each mutation (`restored=true`).

## 5. Browser smoke (not a PASS claim; `a-round-60/smoke.txt`)

**Daemon:**
- The gstack CLI daemon failed in session 1 (`Server failed to start within 15s`, repeated).
- Per `harness_rules`, I started my **own** `server-node.mjs` from `tmp/studio-real-loop/`:
  - `BROWSE_PARENT_PID=0`;
  - state `a-round-60/a-browse.json`; log `a-round-60/daemon.log`;
  - PID 832, port 20452.
- Stopped with `browse stop`: PID 832 is gone and the state file was removed. No `$B restart`.

**Steps** (gstack REAL, 1440×900):
1. `/studio-lab` → 200; badge present; `data-grid-seconds=1`.
2. Click the division select → `Escape`. Focus stays on `arrangement-grid-division`, value `1`.
3. `1` → `data-grid-seconds=0.5`, select `0.5`, focus still on the select.

**Network and console:**
- 0 matches for studio-token / recording- / api/download / r2 / authorization.
- Console: only the known root `GET /api/cart` CORS / "Failed to load cart" errors.

## 6. Code review (real `code-reviewer` subagent, session 2) — 9/10, no Critical

Session 1 had also run it (8/10). Its findings survive only as the summary in `a-round-60/checkpoint.md`, so I re-ran it on the final tree.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Low | `ArrangementGridMenu.tsx:55`: on Windows, a held Shift/Ctrl auto-repeats `keydown` (`repeat: true`). A Shift+click outside the open menu held for more than about 500 ms therefore releases the swallow before its click. Example: Shift+click on Play both dismisses and starts playback. This is broader than the §0.3 trade-off. | **→ B** (A-R60-REVIEW-REPEAT-RELEASE). §0.3 says "any key", so this is not changed in-round. Suggested fix: the keydown release ignores `event.repeat`; GM26 stays valid. Suggested C extra: PW, hold Shift, then `mouse.down`/`up` on Snap with the menu open. |
| 2 | Low / Info | No unit test pins the non-capture `blur`. The `xblurcap` mutation **survives** (§4). Doc l.88 implied GM16/GM17 pin it. | Doc l.88 reworded (owned). **Test → B** (A-R60-REVIEW-BLUR-CAPTURE-TEST): focus an opener → open → outside dismiss → `pointerUp` → click returns `false`. It is not added this round (§2.3: no tests outside the list). |
| 3 | Info | GK9's focus assertions cannot fail in jsdom, because there is no type-ahead or focus move. | Recorded. SEL-KEYS in the browser is the real evidence; the smoke saw focus stay. |
| 4 | Info | GK11's export step at 0.1 is killed only by the `toBe(true)` return. | Already in doc 053 l.89. Optional hardening (assert the status is unchanged) → B. |
| 5 | Info | The `afterEach` probe runs before the stub/mock restores, so a probe failure could cascade. | The order is mandated by §2.2. Recorded. |
| 6 | Low | Doc 053's Ableton table lacked the EG-GROUP row and the C-check column. | **Fixed** (owned doc). |

**Architecture note** (proposal for B / root, not acted on):
- `armGridMenuDismissClickSwallow` now owns six window listeners plus a timer, as a module-level function. **Keep**; it belongs under root's existing `useArrangementGridMenu` proposal (ROOT-R50-58-L5).
- The select handler duplicates the window branch's guard set and is the 7th consumer of the grid refs. **Keep this round**; it belongs under the open §6.3(a) question (snap-preference plumbing vs an edit-preferences slice). The reviewer proposes no new task.

## 7. Command tails (verbatim)

```
HEAD 038ed5a45f94596a264c14c4ec834607cb407948
status lines: 29
 M app/components/arrangement/StudioWorkspace.tsx
?? app/components/arrangement/ArrangementGridMenu.tsx
?? app/lib/arrangement/__tests__/grid-snap-keys.test.tsx
?? app/lib/arrangement/__tests__/grid-snap-menu.test.tsx
?? docs/implementation/2026/quarter-IV/053-studio-lab-grid-select-keys-menu-release.md
frozen non-OK: 0
frozen total: 416
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
StudioWorkspace.tsx CRLF 1807 LF 1807
node.exe 12
5173 200 5199 200

tsc rc=0
owned (3 LF files) biome check: Checked 3 files in 128ms. No fixes applied. rc=0
StudioWorkspace biome lint: Checked 1 file in 97ms. No fixes applied. rc=0
SW stdin format: identical to LF copy

npx vitest run (node.exe 12 before)
 Test Files  89 passed (89)
      Tests  1552 passed (1552)
   Duration  89.29s
rc=0

npm run build: ✓ built in 5.76s  build rc=0

npx biome check ./app (read-only)
Checked 363 files. Found 5 errors. Found 218 warnings. Found 1 info.
format errors: StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts (baseline CRLF list)

npm run verify (attempt 1, quiet, node.exe 12 before)
 Test Files  89 passed (89)
      Tests  1552 passed (1552)
✓ built in 24.00s
✓ built in 6.07s
verify rc=0
```

- No `Test timed out` appeared in the full run or in verify.
- Full logs: `a-round-60/{tsc,biome-owned,biome-sw-lint,biome-app,vitest-full,build,verify,end-state,alone-*}.txt`.

## 8. Deviations

- **D1 — two sessions.** This is a crash resume (see the top). I restored the leftover scratch mutation; `store/` was unaffected.
- **D2 — my own aborted mutation runs.** Two of my own `mut.mjs` runs were stopped early with `taskkill /T` on **my own** PIDs (44864, 25888):
  - the first, because an edit failed and the run would have crashed without writing output;
  - the second, because I started it by mistake under a 10-minute cap.

  I checked for orphans (none) and confirmed scratch matched store before the real run.
- **D3 — doc 053 edits after the review** (#6 and #2 wording). Both are within ownership.
- **D4 — extra mutation `xblurcap`.** It is info only and outside the §2.3 list. It survives, and the test is routed to B.

## Acceptance (A side only; C decides PASS)

What A met itself:
- §0.1 S1–S3, §0.2 and §0.3 are implemented.
- §2.2: `afterEach` plus GM25–GM31; GK9 rewritten and GK11 added. The counts are 35 and 13 `it`.
- §2.3: a–m and all 6 re-runs are killed.
- §2.4: tsc 0; vitest 89/1552; build 0; Biome within baseline; owned files 0 diagnostics; `StudioWorkspace` lint 0 and its stdin format is identical; verify rc 0.
- The real code-reviewer was run and its findings dispositioned. The smoke was done.
- §2.5: doc 053 written. §3.1: `git status` has 29 lines in case A.

**Not claimed:** any browser acceptance (§4.6 / §4.7 / G60-3). Those are C's.

## Next C checks (exact)

1. **G60-2:** HEAD and 29 status lines (case A); frozen 416 OK; protected 4/4.
2. **R60-S:**
   - `diff -u --strip-trailing-cr` of the 4 files against `b-round-59-r60-snapshots/`;
   - AST equality of the 28 old menu `it` and the 11 unchanged keys `it`;
   - EOL counts (`StudioWorkspace` CRLF 1807/1807);
   - doc 053 sections.
3. **R60-U:**
   - mutations a–m plus the re-runs in C's own scratch;
   - the C extras n, p and q;
   - **also `xblurcap`**, expected to survive, and the reviewer-#1 repeat-keydown probe (info).
4. **G60-1:** tsc, build, Biome, vitest 89/1552, `npm run verify`.
5. **G60-3, then §4.6 at 1440 and the starred items at 1280:**
   - SEL-KEYS, SEL-ENDS, SEL-NATIVE, SEL-MOD, SEL-SNAP;
   - MN-CONTEXT, MN-KEY-RELEASE, MN-BLUR-PROBE (PROBE);
   - the regressions MN-DISMISS-BUTTON, MN-KEYS, KEY-NARROW / KEY-TYPE and MN-FOLLOW;
   - VSCROLL-PROBE (evidence for L1).
6. **§4.7:** EG-GROUP read-only against `c-round-59/runs/r59e-1440x900-g3_g4.txt`.

## Follow-ups for B / root

- **New Lows:**
  - A-R60-REVIEW-REPEAT-RELEASE (#1);
  - A-R60-REVIEW-BLUR-CAPTURE-TEST (#2; `xblurcap` survives);
  - A-R60-REVIEW-GK11-EXPORT-STATUS (#4, optional).
- **Still open from the task:**
  - ROOT-R50-58-L1 (VSCROLL-PROBE first);
  - L5 / ARCH-CHECKPOINT-SRW14-PREFS (a)–(c);
  - A-R59-REVIEW-PUNCTUATION / END-INDEX / REANNOUNCE.
- **`root-pre-push-review.md`:** RF3-1, RF3-2 and R5-L6 (video sync, C-R27-01) are open. R5-L3 is partial. R5-L5, R5-E1, R6-S2 and R6-S3 are unit-only. M1 (hidden-tab loop refill) and M2 (per-frame context re-render) are open, plus Lows L1–L4 and L6–L8.
- **`publication-checkpoint.json`:** SRW-21 (the hardcoded `middle-east` loader), portable instruction paths, the SRW-23 scrollbar check at 1280 and 1440, SRW-11/12 parity, and T12.
- **Root:**
  - the `cb12805` bundle (r50–58) is still pending;
  - round 59 and round 60 are separate interim units, after C;
  - ENV-BROWSE-DAEMON: the CLI daemon failed again this round, and the fallback worked.
- **Source files re-checked:** `root-pre-push-review.md` (2026-10-18 12:46:34) and `publication-checkpoint.json` (2026-10-17 11:11:24) have the same mtimes B recorded in `current-task.md` §4.9, so the items above are carried as listed. I did not re-read their contents this session.
- **Reviewer #1, the priority for B:** this one is not just an edge case. It partly regresses the round-58 swallow in a plausible workflow: Shift- or Ctrl-click to extend a selection while the menu is open.
  - **One-line fix:** route `keydown` to a small handler that returns early when `event.repeat` is set, then calls `releaseClickSwallow`. GM26 is unaffected.
  - **PW repro:** open the menu with a right-click on a lane → `keyboard.down('Shift')` → wait 700 ms → `mouse.down`/`mouse.up` on Snap → `keyboard.up('Shift')`.
  - **Expected today:** Snap toggles (not swallowed). **Expected after the fix:** swallowed.
