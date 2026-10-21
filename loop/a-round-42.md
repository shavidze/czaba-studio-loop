# A — Round 42 report: SRW-13 stage 4b-2 group 2 (D-29z7) — Pan release recovery

Implementer: A (Claude Opus 5.5) · Date: 2026-10-14 · Task: `current-task.md` (round 42). **No PASS claimed** — all R42 IDs await C.

## 1. Pre-flight gate (posted before the first edit)

- **Read before editing:** `.claude/rules/read-primitives.md`. Primitives: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, plus DESIGN_TOKENS and TAILWIND_FIRST (injected by the hook). Also `prompts/new-test.md`, `prompts/studio-feature.md`, `docs/implementation/TEMPLATE.md` and `skills/pre-flight/SKILL.md`.
- **Assumptions:**
  - The contract is exactly §0.1 A and B.
  - Native `keydown` fires before the range input's `input`/`change`.
  - The context's `claimPointerGesture` window-blur abort already restores the stored pan, so B only has to clear the Lane's draft and refs.
- **Smallest version:** 7 lines in the Lane: a blur add/remove pair, a 3-line zero-arg handler, and one `onKeyDown` prop. No abstraction.
- **Files:**
  - the Lane (§2.1);
  - the new test (§2.3);
  - doc 039 (§2.2);
  - report and gate output under `tmp/studio-real-loop/a-round-42*`.
- **Success:** the new file is red on PK1/PK3/RW1/RW2 and green on the rest against the old Lane, then 8/8 green. The frozen suites, tsc, vitest, build, `npm run verify` and Biome stay at baseline.

**Baseline (before any edit), all OK:**
- HEAD `ea35611b01b381b473771d49807c027180e77514`; `git status --short` empty.
- 386 list: `grep -vc ': OK$'` → **0**.
- Lane `7de5a093…` = snapshot `SHA256SUMS.txt`.
- Protected 4/4 OK.
- node.exe 32.
- No new untracked paths. `a-round-42-result.json` (0 bytes) and the prompt file were already present from the loop runner; I did not touch them.

**§1.4 re-checks:**
- `arrangement-track-pan` occurs in `fader-click`, `fader-guards` and `track-pan`.
- `window.dispatchEvent(new Event('blur'))` occurs in `detail-panel` l.291, `floating-video` l.691, `gesture-guard` l.369 and l.462, `pending-status` l.423 and `track-layout` l.595. None of them involves a Pan stale draft: they cover clip move, Volume, status, height, panel height and the float box.
- `keyDown` on a Pan slider occurs only in `fader-guards` l.332–333 (Delete/Backspace, which expects `prevented: false`). `track-pan` l.827–838 has Delete/Backspace/Space through `slider()`.
- **No stop condition:**
  - no frozen test ignores a Pan change after a Pan keydown;
  - no frozen test expects a stale draft after a window blur;
  - no frozen test expects a prevented or stopped Pan keydown.
- Biome on the Lane before the edit: `Checked 1 file … No fixes applied.` (`a-round-42/biome-lane-before.txt`). After: the same.

## 2. Red run and green run

**Red run** (`a-round-42/red-run.txt`; old Lane `7de5a093`; node.exe 32 at the start). **Exactly B's prediction:**

| ID | Old source | Failure text |
|---|---|---|
| PK1 | **red** | `expected +0 to be 0.1` (l.274) |
| PK2 | green | |
| PK3 | **red** | `expected +0 to be 0.1` (l.297, PK1's step) |
| PK4 | green | |
| RW1 | **red** | `expected '-10' to be '0'` (l.346) |
| RW2 | **red** | `expected '5' to be '0'` (l.365) |
| RW3 | green | |
| RW4 | green | |

**The test changed after the red run** (two review-driven assertions, §5). So I re-ran red on the **final** test file (sha `de42634f…`) against the old Lane (`7de5a093`) in a scratch copy outside `store/`, at `a-round-42/scratch/`:
- the scratch has a copied `app/` and its own `vitest.config.mts`;
- `node_modules` was a temporary directory junction to `store/node_modules`, used read-only and removed afterwards (link only; the target was verified intact);
- result in `a-round-42/red-run-final.txt`: the **same pattern**, 4 failed (PK1 l.274, PK3 l.297, RW1 l.346, RW2 l.365) and 4 passed.

**Green runs** (new Lane `855bc517…`):
- `a-round-42/green-run.txt`: 8/8;
- after the review amendment, `a-round-42/green-run-2.txt`: 8/8.

**Extra scratch mutation** (A's own check, not C's table), `a-round-42/mutation-leak.txt`: removing `window.removeEventListener('blur', cleanup)` makes RW3 fail with `expected [ [Function abortIfStillActive], …(1) ] to include [Function cleanup]`; the other 7 stay green. The scratch Lane was restored to the new Lane afterwards.

## 3. Diff summary per file

`git status --short` matches §3.2 exactly:

```
 M app/components/arrangement/ArrangementLane.tsx
?? app/lib/arrangement/__tests__/pan-release-recovery.test.tsx
?? docs/implementation/2026/quarter-IV/039-studio-lab-pan-release-recovery.md
```

- **`ArrangementLane.tsx`** (sha `855bc5175725…`, +7/−0, `a-round-42/diff-lane.txt`):
  - `beginPanPointerDrag`: `window.addEventListener('blur', cleanup)` next to `pointerup`/`pointercancel`, and `window.removeEventListener('blur', cleanup)` inside `cleanup`. The rest of the `cleanup` body is unchanged.
  - New `const handlePanKeyDown = () => { panBlurSuppressionCleanupRef.current?.(); };`. It takes no arguments, calls no `preventDefault`/`stopPropagation` and does nothing else.
  - `onKeyDown={handlePanKeyDown}` is one added line after `onBlur` on the Pan input.
  - No class or attribute change, no comment, no export, no `any`/assertion. Biome `--write` applied no fixes.
- **`pan-release-recovery.test.tsx`** (new, sha `de42634f…`, 8 `it`):
  - The harness is **copied** from `fader-guards`: the fake audio graph, `press`, `windowPointer`, `undoChainLabels`, `trackOf`, `clipTable` and the probe. Nothing is imported from another test.
  - Added accessors: `reset`, and `windowBlur()` as `act(() => window.dispatchEvent(new Event('blur')))`.
  - `instanceof` guards only. No `any`, comments, snapshots or fake timers. The labels are the same literals `fader-guards` uses; `formatTrackPan(0)` and `GESTURE_EDIT_BLOCKED_MESSAGE` are imported.
- **Doc 039** (new, sha `9b15bc74…`), in Georgian, follows TEMPLATE:
  - status line `Round 42 — D-29z7; C-ის შემოწმებას ელოდება`;
  - context (both pairs) and approach (contract A/B, rejected a–d, the accepted edge);
  - a Mermaid sequence, the files, Problem → Solution, red/green per case, the §4.8 two-row table ("არ ეხება" only) and the TODO.

## 4. Browser smoke (A, one scenario; NOT a PASS claim)

- **Server:** `http://127.0.0.1:5173/studio-lab` returned 200.
- **ENV-BROWSE-DAEMON** with `a-browse.json`: `[browse] Server failed to start within 15s` twice (node.exe 40). The single permitted retry used a fresh state file, `a-round-42/a-browse-retry.json`, and the daemon started. That daemon is left running; I started it and did not stop it, because `stop` hung in round 40.
- **Run 1 was invalid** (`smoke/pk-b-1440.txt`). The synthetic press ran before hydration: no draft and no focus. The badge selector `text=დემო კოლექცია` was also ambiguous, so no click happened. It is not counted.
- **Run 2** (`smoke/pk-b-1440-run2.txt`, `smoke/pk-b-1440-run2.png`; 1440×900, fresh load, `wait --networkidle`; node.exe 54):

| Step | Kind | Result |
|---|---|---|
| 0 | initial | value `0`, valuetext `C`, reset `C`, undo title `Undo` |
| 1 | SYNTHETIC `pointerdown` 41 at the centre, then window `pointermove` +10 px | slider focused; draft `21` / `21R` / reset `21R`; no entry |
| 2 | REAL click on the `დემო კოლექცია — ავტორიზაცია არ სჭირდება` badge (`header span.border-accent`) | slider blurred; value `0`/`C`, reset `C`, `Undo` (no entry) |
| 3 | SYNTHETIC `.focus()` on music Pan | focused, value `0` |
| 4 | REAL `ArrowRight` | `1` / `1R` / reset `1R`; title `Undo: Pan — მუსიკა` |
| 5 | REAL `ArrowRight` | `2` / `2R` / `2R` |
| 6 | SYNTHETIC window `pointerup` 41 (PK-LATE) | unchanged `2R` |
| 7–8 | REAL click Undo ×2 | `1R`, then `C` with title `Undo`, so **exactly 2 entries**, one per key |

`isPointerGestureActive` was not read: there is no `window.__c` reader in my session. C should read it.

## 5. Code review (the actual `code-reviewer` subagent; 9/10, no Critical, High or Medium)

The reviewer saw the final Lane, but the **test file before** findings 3 and 4 were applied, and **doc 039 did not exist yet**. I did not run a second review.

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | Any key (Shift/Ctrl/Escape/Tab) clears the suppression. With the same pointer still physically held, later native `change`s would each write an entry | Low | **Not changed.** Contract §0.1 (d) and the accepted edge; recorded in doc 039 |
| 2 | Info: after a window blur no suppression is set, so a native `change` after focus returns writes entries | Info | Intended by D-29z7 B and locked by RW4 |
| 3 | Removing the `blur` listener in `cleanup` was untested | Low | **Fixed in the test (no new `it`):** RW3 spies on `window.add/removeEventListener` and asserts that every `blur` listener added during the drag is removed after `pointerup`. Proven by the scratch mutation (§2) |
| 4 | No test for a late `pointerup` 41 after the window blur | Low | **Fixed:** RW1 now dispatches a window `pointerup` 41 and asserts the same arrangement object, value `0` and no entry |
| 5 | PK4 does not assert the suppression state after Delete | Info | Not added; consistent with (d) |
| 6 | Alternative: a context callback instead of a Lane window listener | Info | Rejected (D-29z7 (c); the frozen context) |

The reviewer confirmed:
- the listener lifecycle is correct on every path (pointerup, pointercancel, element blur, window blur, unmount, new drag);
- removing a listener twice is safe;
- element `blur` cannot trigger the window listener;
- the result does not depend on listener order.

Its mutation map: (a) → PK1/PK3, (b) → PK4, (d) → RW1/RW2, (e) → RW4/RW2, (f) → PK2.

## 6. Command tails (verbatim)

```
$ git rev-parse HEAD                       → ea35611b01b381b473771d49807c027180e77514 (start and end)
$ sha256sum -c …/b-round-41-tree-sha256.txt | grep -vc ': OK$'   → 0
$ sha256sum ArrangementLane.tsx            → 855bc5175725f38e0f565fb153dafa8dd5fe7493713264fa9db2b4284c6376a2 (was 7de5a093…)
$ protected: download-routes.test.ts OK / account.downloads.tsx OK / api.studio-token.ts OK / studio.$productId.tsx OK
$ npx vitest run pan-release-recovery      → Tests  8 passed (8)
$ frozen suites (10 files, §5 list)        → Test Files  10 passed (10) / Tests  270 passed (270)   [node.exe 36]
$ npx tsc --noEmit                         → exit 0   [node.exe 36]; again after the review amendment → 0
$ npx vitest run                           → Test Files  74 passed (74) / Tests  1333 passed (1333)   [node.exe 40; before the review amendment]
$ npx biome check ./app                    → Found 2 errors. Found 218 warnings. Found 1 info.   [node.exe 40]
     errors = format on app\lib\auth.ts and app\lib\__tests__\bug-hunting\auth-bugs.test.ts (baseline CRLF); 0 diagnostics in my files
$ npx biome check --write <Lane> <new test> → Checked 2 files … No fixes applied. (twice)
$ npm run verify                           → … Test Files 74 passed (74) / Tests 1333 passed (1333) / ✓ built in 10.21s / ✓ built in 2.73s / verify exit 0   [node.exe 40; after the review amendment and doc 039]
$ tasklist | grep -ci node.exe             → 32 (baseline), 43 (final gates)
```

Full outputs are in `a-round-42/`:
- `tsc.txt`, `biome-app.txt`, `vitest-full.txt`, `frozen-suites.txt`, `verify.txt`, `final-gates.txt`, `diff-lane.txt`;
- `red-run.txt`, `red-run-final.txt`, `green-run.txt`, `green-run-2.txt`, `mutation-leak.txt`;
- `smoke/`.

No timeouts occurred, so no file needed a re-run.

**Timing of the outputs:**
- `vitest-full.txt` (1333) was taken **before** the review amendment. The post-amendment full run is the one inside `verify.txt` (1333).
- The final read-only Biome run `./app`, after every edit, is `a-round-42/biome-app-final.txt`: `Found 2 errors. Found 218 warnings. Found 1 info.` [node.exe 38].

## 7. Deviations, self-check and known gaps

- **DEVIATION — PK4 and §4.3 REG-DEL are wrong in B's task. B/C must correct them.**
  - B expected Delete with focus on the Pan slider to delete the SFX clip with one `კლიპის წაშლა` entry.
  - The frozen code says otherwise: `StudioWorkspace.tsx` l.1181–1184 returns early when Delete/Backspace targets a range input.
  - The frozen tests assert the opposite: `fader-guards` l.275–292 ("keep the selected clip, history, status and value", which includes `pan`) and `track-pan` "Delete and Backspace on the focused Pan slider do not delete the selected clip" (C-R31-02).
  - This is not a §1.4 stop condition. PK4 follows the frozen contract: the window listener receives Delete with `prevented: false`, the clip table and selection are unchanged, the pan stays 0, and the undo chain is only `[Mute — ვიდეო]`. It still catches mutation (b).
  - **For C:** REG-DEL as written ("REAL Delete → the SFX clip is deleted") will fail against intended, frozen behaviour. The expected result should be "clip kept, no entry; Space toggles playback".
- **Self-check (§2.4):**
  - frozen suites green;
  - full vitest 1333 = 1325 + 8;
  - Biome on my two files: --write made no fixes, then a read-only `./app` showed exactly the 2 baseline errors, 218 warnings and 1 info;
  - code-reviewer run and its findings addressed;
  - smoke run once (valid run 2);
  - `npm run verify` exit 0.
  - I did not run `test:e2e:smoke`.
- **EOL:** `git diff --stat` prints `LF will be replaced by CRLF` for the Lane. It is not a reformat: `diff -u` against the snapshot shows only the 4 contracted hunks (+7/−0), and `file` reports the same encoding and line-ending class for both copies.
- **Mutations (a)–(f):** not run by A in C's form; they are C's job. A ran only the extra leak mutation above, in scratch.
- **Edits:** none in `store/` beyond the 3 owned paths. The scratch copy `a-round-42/scratch/app/` (a plain copy, no junction left) stays under my folder as evidence.
- **Known gaps:**
  - The real Alt+Tab with the mouse held and released outside the window is not reproducible headless. That stays R31-T for the Tech Lead.
  - `isPointerGestureActive` was not read in the browser.
  - The 1280 case (PK-1280), PK-NEG, R42-RW in the browser and R42-REG were not run by A.

## 8. Exact next C checks

1. G42-2:
   - HEAD;
   - `git status` = the 3 paths above;
   - 386 OK;
   - protected 4/4;
   - Lane sha `855bc517…`, test `de42634f…`, doc `9b15bc74…`.
2. R42-S: `diff -u` against the snapshot. Expect only the 4 hunks in `a-round-42/diff-lane.txt`.
3. R42-PK in the browser:
   - PK-B, PK-LATE, PK-NEG and PK-1280;
   - wait for hydration (`wait --networkidle`) before the synthetic `pointerdown`, or the press is a no-op;
   - `header span.border-accent` is an unambiguous neutral badge;
   - read `isPointerGestureActive` through `window.__c`.
4. R42-RW in the browser: RW-B, RW-KEY, RW-GESTURE and RW-NORMAL.
5. R42-U:
   - re-run red against the snapshot Lane in scratch;
   - run mutations (a)–(f);
   - note that (e) is caught by RW4 (and RW2's after-release write).
6. R42-REG: with **REG-DEL corrected** as in §7.
7. G42-1 and G42-3 as specified, plus R42-Doc.

## 9. Carried items (unchanged by this round; for B/C follow-up)

- **C-R41-01:** TL-Q-VIEWPORT.
- **Open C bugs and Low items:** C-R27-01, C-R6-02, C-R8-01, C-R23-01/C-R38-01 and all other §4.9 items stay open.
- **Root items** from `root-pre-push-review.md` and `publication-checkpoint.json`, all unchanged:
  - the ignored `.kilo/`;
  - `test:e2e:smoke` (root only);
  - SRW-21 (the purchased loader hardcodes middle-east);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip at 0 dBFS;
  - the CRLF Biome errors on the auth files;
  - the `frontend-architect.md` grant;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - fake Bearer → 500;
  - the CDP allowlist;
  - `Content-Type` without a charset;
  - dev-server availability, ENV-BROWSE-DAEMON (again this round: two start failures on `a-browse.json`, the retry succeeded) and machine load.
- **Tech Lead R31-T** gains the step: real mouse Pan drag → Alt+Tab while holding → release → back → ArrowRight moves Pan.

## Scope completed

§2.1, §2.2, §2.3 and §2.4 are implemented and self-checked. Round 42 becomes checkpoint-ready only after C PASS. **No acceptance criterion is marked passed by A.**
