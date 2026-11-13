# Round 491: B-R487-PROFILE-EDITOR-NARROW-OVERFLOW. The Account "Full Name" editor fits at 375, 360 and 320 px, so Save and Cancel can be clicked and tapped

**Planned by:** B, at the round 490 → 491 planning on 2026-11-13 (`b-round-490.md`, `b-round-490/checkpoint.md`).
- **Archive:** the round-490 task is copied byte-equal (`cmp`) to `tasks/round-490.md`; B's second copy is `b-round-490/current-task-before-491.md`.
- **Decisions:** D-29z1752 … D-29z1754 (`backlog.json`, `decisions_log_b`).
- **Advisor:** available; consulted after orientation and before hand-off (`b-round-490.md`).

## Read first
- **`lessons.md` in full.** Directly relevant: L1 (inventory), L10 (one STOP threshold), L11, L12 (no styling-class selectors in tests), L22, L28 (doc l.4), L29 (claims), L36 (stubbed rows prove the client path only), L38 (probes run alone; warm up), L53 (layout change → a probe below the required viewports), L56/L58 (claims, sketch, mutants, review), L57.
- **Claims:** `bash b-round-490/claims-491.sh` (`ROOT=` and `LOOP=` can be overridden).
  - `b-round-490/claims-491-planning-output.txt` is its output on the clean store tree at planning (HEAD `53ff249`). **A** runs the script before applying; the output must be equal.
  - `b-round-490/claims-491-sketch-output.txt` is its output on B's scratch (`ROOT=/tmp/b491-scratch`: a clone at `53ff249` with the sketch applied). **C** compares the store tree with it at start and at end; every line must be equal. Only K14 may differ, and only if root rewrote this task.

## Baseline: HEAD `53ff249`, clean
- Gate 490 is `published`, commit `53ff249` (rounds 489–490) [K1]. The store tree is clean at planning [K2].
- **Accepted:** a root-only commit after planning that leaves `git diff 53ff249 HEAD -- app` empty, with a note. Anything else is "STOP — baseline differs".

## 0. Why this round
- **Round 490 closed:** C PASS with `browserVerified` true, gate 490 published `53ff249`. SABA-B-17-ENTRANCE-3-4S, B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED, B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER and A-R489-REVIEW-NONZOOM-CLASSIFY are done (D-29z1752). C reported no bug, only two infos (below).
- **The bug gate (2026-10-23) fixes open Mediums first.** B-R487-PROFILE-EDITOR-NARROW-OVERFLOW is the next scheduled Medium (D-29z1751). No REGRESSION is due (`regression-last.json`: 2026-11-13, next on or after 2026-11-16); the next RETRO is round 495.
- **The bug, measured by B at HEAD on a production build** (`b-round-490/probe/headprod-narrow.json`, probe `narrow-491.mjs`; signed-in stub):
  - The editor row is `flex items-center gap-3` [K4] with two inputs of class `… py-1 w-40` [K4] and two 32 px icon buttons, Save name ✓ and Cancel name edit ✕ [K4]. Its content is 420 px wide.
  - At 375×812 the column is 343 px; at 360 it is 328 px; at 320 it is 288 px. At all three widths both buttons are `offscreen`: a mouse click and a touch tap on ✓ send 0 PUT, and the editor stays open; ✕ does not close it [K11].
  - At 1440×900 and 1280×720 it works (1 PUT, editor closes) [K11].
  - Cause: a flex item's automatic minimum width. For these inputs it is the `w-40` 160 px, so they never shrink.
- **Origin:** pre-existing (found by B at the round-486 pre-check).

## Rulings on round 490 findings (L10)
| Id | Ruling |
|---|---|
| A-R490-REVIEW-NOCTRL-NEG-WHEEL (Low, A's reviewer, unruled by A) | **Ruled Low**, inside the round-490 contract. `deferred_low_polish` with a named closing condition: the first round that touches `store-entrance-loader.test.tsx` or extracts `useEntranceSkip` adds S1/E8c rows with a no-ctrl wheel at `deltaY` −100, and a mutant `ctrlKey \|\| deltaY < 0` (overlay and boot) must be red there |
| A-R490-REVIEW-TOUCH-DELTA-LABEL, A-R490-REVIEW-E18-LITERAL (Low) | `deferred_low_polish`, same closing round |
| Gate 490 reviewer Lows 1, 2, 3, 5 | GATE490-L1-SKIP-LISTENER-ASYNC-REMOVE, GATE490-L2-TOUCH-JITTER-SKIP (real-phone half joins TLM-R489-TOUCH-SWIPE), GATE490-L3-FAILSAFE-2S, GATE490-L5-OVERLAY-RENDER-COST → `deferred_low_polish` |
| Gate 490 reviewer Low 4 | `confirmedBy` on B-R489-ENTRANCE-SCROLL-KEYS-UNDER-COVER (L7) |
| C-R490-INFO-CLICK50-HANDOFF-GAP, C-R490-INFO-EXIT-FADE-DOUBLE-WORDMARK (info) | Attached to TLM-R489-SABA-ENTRANCE-FEEL (Saba's feel check, deadline RETRO 495) |
| Gate 490 Architecture note (`useEntranceSkip`) | Backlog signal only (`confirmedBy` on SIG-R489-ENTRANCE-ZOOM-RULE-TWICE). ARCH-CHECKPOINT-ENTRANCE-LOADING is sent to root now (`b-round-490/checkpoint-request-entrance.md`) |

None of these touch this round's files.

## Reference: how established practice does it
This is a Store page, so no Ableton parity claim applies. `product-designer` is not consulted: this is a Medium bug fix with no new element, and the desktop layout does not change.

| Point | Source | Confirmed there | CZABA decision | C row |
|---|---|---|---|---|
| Content reflows at 320 CSS px without loss of function | WCAG 2.2 SC 1.4.10 Reflow (https://www.w3.org/TR/WCAG22/#reflow; cited from the standard, not re-fetched this round) | content and function are available at 320 CSS px wide without two-dimensional scrolling | the editor fits the column at 375, 360 and 320; both buttons stay reachable | C6, C7 |
| Pointer targets keep a usable size | WCAG 2.2 SC 2.5.8 Target Size (Minimum) (same source, #target-size-minimum) | at least 24×24 CSS px | Save and Cancel stay 32×32 at every width; the inputs shrink instead | C6 |
| An inline edit row keeps its actions beside the fields | Common inline-edit pattern (fields followed by confirm/cancel icons). This is B's inference, not a quoted source | — | keep one row; the inputs share the shrink | C5, C6 |

**Deviations:** none. Rejected options, with reasons (D-29z1754):
- `flex-wrap`: it moves the buttons to a second line away from the fields and changes the row height.
- A stacked layout on narrow screens: more layout change than the bug needs.
- v0 (`min-w-0 flex-1 sm:w-40 sm:flex-none` on the inputs + `shrink-0` on the buttons): the extra tokens survived their mutants (`b-round-490/probe/mutants-variant.json`), so they cannot be verified and were dropped.

No persistent screen element is added (L39 does not apply).

## 1. What changes (sketch `b-round-490/sketch-491.patch.txt`, sha256 in `b-round-490/sketch-491.sha256`)
A applies it from `store/` with `git apply ../tmp/studio-real-loop/b-round-490/sketch-491.patch.txt` on the clean HEAD. The result must be byte-equal to `b-round-490/sketch-491/` (K5 `===`).
1. **`app/routes/account.tsx` (`ProfileContent`):** both name inputs get `min-w-0` first in their `className` [K4 `old=0 new=2` on the sketch]. Nothing else changes: the row, `nameEditorRef`, the buttons' classes, labels, handlers and focus rules (rounds 487/488) stay as they are [K4].
2. **`docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md`** (new): l.4 `**სტატუსი:** Completed (C round 491 PASS)` (L28) and the 7 TEMPLATE headings [K10].
3. **`docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`:** one TODO line. "planned for round 489" becomes "fixed in round 491 (doc 317)" [K10].

**Tests:** no unit row is added or changed. jsdom does no layout, and L12 forbids asserting class tokens. The acceptance is the browser rows (§3): the HEAD build is red, the sketch is green, and a DOM mutant that removes `min-w-0` is red again. A durable Playwright guard is a recorded follow-up (B-R491-NARROW-EDITOR-E2E-GUARD, Low). **A reviewer finding "fix without a unit test" is ruled here: Low, not a STOP.** The same holds for every finding already ruled in `b-round-490/sketch-review.md` (TL-R491-L1 … L4 and TL-R491-V2-OPT), whatever severity A's reviewer gives it. The likely re-raises are: Chromium-only measurement, 94 px inputs at 320, no `shrink-0` on the buttons, and doc l.4 written before C. Each is ruled there and none is a STOP.

**Floor (L53):** 320 CSS px is the asserted floor. Nothing below 320 is asserted. By arithmetic, the buttons fit down to a column of about 100 px.

**Sweep (L23):** no test in `app/**`, `perf/**` or `e2e/**` pins the input or button classes. Three test files read `account.tsx`: `account-profile-name.test.tsx`, `store-focus-ring.test.ts` and `store-theme-tokens.test.ts` [K6]. All are in the covering set.

## 2. A: grants, forbidden, checks
- **Granted paths (only these):** the 3 files of §1, changed only by the sketch. A changes no sketch line. A doc line A finds false is a STOP (below), not an edit.
- **Forbidden:**
  - every other path;
  - `global_forbidden_files`, including `app/root.tsx`, `app/styles/**`, `app/contexts/AuthContext.tsx` and `app/lib/auth*`;
  - the protected purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`) [K3];
  - inside `account.tsx`: any line outside the two input `className`s, including the whole `PasswordModal` (that is round 492, B-R488-PASSWORD-MODAL-DIALOG);
  - `global_forbidden_actions`: commit, push, stash, checkout, reset, deploy, and restarting the :5173 dev server.
- **STOP threshold (the only statement of it; L10):** STOP and report, without editing any line, if:
  - the start check differs (except K14 if root rewrote the task);
  - `git apply` fails or K5 is not `===`;
  - a Medium+ finding (from your code-reviewer, or a failing or slow covering test) is not ruled in this task;
  - a line of doc 317 is false at hand-over;
  - any path outside the grants would need to change.
- **A runs:**
  - the start check `bash ../tmp/studio-real-loop/b-round-490/claims-491.sh`, which must equal `claims-491-planning-output.txt`;
  - after applying: `npm run typecheck`, `npm run lint`, and `npx biome check app/routes/account.tsx`. Expected: 4 warnings, all pre-existing (3 × `noLabelWithoutControl` in PasswordModal, 1 × `useButtonType` on the password link), as on B's sketch (`b-round-490/sketch-491-biome.log`) [K9];
  - `npx vitest run app/lib/__tests__/account-profile-name.test.tsx app/lib/__tests__/store-focus-ring.test.ts app/lib/__tests__/store-theme-tokens.test.ts app/lib/__tests__/store-internal-links.test.ts app/lib/arrangement/__tests__/held-enter-source-scan.test.ts`. B's run: 5 files, 82 tests (`b-round-490/sketch-491-covering.log`) [K7];
  - the code-reviewer on the 3 changed files.
- **A does not run** the full suite, the build or browser probes. B ran the full suite on the sketch: 293 files, 4294 tests, rc 0 (`b-round-490/precheck-full-491.log`) [K8]. The gate runs it again.
- **Report in `a-round-491.md`:** the start HEAD and `git status`; the start check; the `git apply` output; K5; the commands with pass counts; the reviewer findings and its Architecture note.

## 3. C: rows
- **Setup (production builds; L38: probes run alone, after one untimed warm-up load of `/account`):**
  - Tree server: `bash b-round-490/probe/serve-prod.sh start <abs c-round-491>/tree 5193 TREE > <abs c-round-491>/serve-start.log 2>&1` (SRC unset = the store tree). Redirect its output to a file: piped to `tail`, it hung for B. Use a free port, because :5191 may still hold C round 490's old server.
  - HEAD control: B's `b-round-490/probe/headprod-narrow.json` (production build of `53ff249`). C may rebuild HEAD with `serve-prod.sh start <abs c-round-491>/head 5194 53ff249` and re-run it.
  - **Environment fact:** when the loop mock API runs on `:5199`, it answers `GET /api/downloads` with 401. The client then calls refresh, gets 401, and signs the stub user out. `narrow-491.mjs` and `mut-491.mjs` stub `/api/downloads` with 200 `[]`. Any other signed-in probe must do the same. A signed-out page in a probe is environment-invalid, not a FAIL.
  - Stubbed rows prove the client path only (L36).

| Row | What | Pass when |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --untracked-files=all`; K3 | exactly 3 paths: ` M app/routes/account.tsx`, ` M docs/…/315-profile-name-keyboard.md`, `?? docs/…/317-profile-editor-narrow-overflow.md`; K3 `0 … 0 … 0` (root.tsx, protected files and every other `app/` file have no diff) |
| C2 CLAIMS | `bash b-round-490/claims-491.sh` at start and at end; L29's grep over this task | every line equals `claims-491-sketch-output.txt` (K14 may differ only if root rewrote this task); stderr empty |
| C3 APPLY | K5 | `===`, and the patch sha equals `recorded` |
| C4 COVERING | A's covering command | 5 files / 82 tests green |
| C5 DESKTOP UNCHANGED | `node b-round-490/probe/narrow-491.mjs http://127.0.0.1:5193 <abs out>/tree-narrow.json <abs out>/shots tree`, then `python3 -I b-round-490/probe/desk-eq.py b-round-490/probe/headprod-narrow.json <abs out>/tree-narrow.json` | `1440x900 equal` and `1280x720 equal`: every measured box, hit, focus and PUT field equals HEAD (B: `b-round-490/probe/desk-eq.txt`) |
| C6 NARROW REACHABLE | same run, rows 375×812, 360×780 and 320×640 (`hasTouch`); `python3 -I b-round-490/probe/c6-check.py <abs out>/tree-narrow.json` checks every clause below | rc 0 and the last line `C6 PASS` (B on the sketch: `b-round-490/probe/c6-sketch.txt`; HEAD: `b-round-490/probe/c6-head.txt`, rc 1, 23 RED. At HEAD only the keyboard rows pass, because focus scrolls the clipped row into view, so the keyboard already worked). The clauses: in `editing`: both buttons `hit: self`, 32×32, right edge ≤ the viewport width; `mouseSave` puts 1 and the editor closes; `tapSave` puts 1 and the editor closes; `mouseCancel` and `tapCancel` close the editor; `saving`: both buttons disabled and still inside the viewport; `longTyped` (22- and 26-character names): both buttons still `hit: self`; `kbSave`/`kbCancel` are the Save/Cancel buttons with `focusVisible` true and the box inside the viewport. B's values: `b-round-490/probe/sketch-narrow.json` (inputs 121.5 / 114 / 94 px wide). HEAD at the same widths: `offscreen`, 0 PUT (assert the difference) |
| C7 MUTANT | `node b-round-490/probe/mut-491.mjs http://127.0.0.1:5193 <abs out>/mutants.json` | `M0` PASS and `MA_no_min_w_0` RED at both 375 and 320, as `b-round-490/mutants/mutants-summary.txt` |
| C8 VISUAL | screenshots from C5/C6 (`<out>/shots/tree-editing-*`, `tree-long-*`, `tree-ring-*`) | at 375 and 320 the ✓ and ✕ are fully visible beside the fields, and the focus ring is not clipped. Desktop screenshots look the same as HEAD's (`b-round-490/probe/shots/headprod-editing-1440x900.png`, `-1280x720.png`) |
| C9 AUTH + STUDIO | fresh context, no credentials, 1440×900 and 1280×720 | `/account` shows "Sign in required" with no "Full Name"; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/studio-lab` opens anonymously (`auth_user` null), shows `Demo collection ready`, Enter on a library item adds 1 clip, Space → `Playing` with the clock above `00:00.000` about 1.5 s later (record the value; round 490 read `00:01.471`), Space → `Stopped`. Screenshot per step |
| C10 DOC | doc 317 and doc 315 | doc 317 l.4 byte-exact `**სტატუსი:** Completed (C round 491 PASS)`; its `## ` headings contain TEMPLATE's 7 in order (L26); no `pending` (K10); every number in its Testing section is in `b-round-490/probe/sketch-narrow.json` or `mutants-summary.txt`; doc 315 has the new TODO line and no "round 489" plan line (K10) |
| C11 L57 | `python3 -I tools/l57-check.py c-round-491.json c-round-491/l57-check.txt` | rc 0; all L57 fields are written: `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (= `b-round-490/mutants/mutants-summary.txt`), `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch` |
| OWN-BACKEND | a real profile update against the .NET backend | BLOCKED: backend unavailable in cloud (not in `passed`) |
| gate | full vitest, typecheck, build, Biome, `npm run verify` | root gate only; never in `passed` |

- **L22:** if A STOPs with no diff, C runs only C1, C2 and C9 and reports "STOPPED — routed to B".
- **Manual row (does not block; deadline RETRO 495, L46):** TLM-R491-PHONE-NAME-EDITOR, on a real phone (iOS Safari and Android Chrome) plus WebKit/Firefox. Save and Cancel must be visible and tappable, and the virtual keyboard must not hide them.

## 4. Sketch review and mutants (L58)
- `b-round-490/sketch-review.md` names the dispatched sha256 (v2) and the reviewed v1. `tech-lead` approved v1. v2 is a docs-only delta, which `tech-lead` re-reviewed and approved. B's ruling on each Low is in the file.
- **Mutants:** browser DOM mutants on the production build of the delivered sketch tree, including both docs (`probe/mut-491.mjs`): `M0` PASS, `MA_no_min_w_0` RED at 375 and 320. HEAD (`probe/headprod-narrow.json`) is the pre-fix control.

## 5. Outcome fixed in advance
- **C PASS with `browserVerified` true:** B-R487-PROFILE-EDITOR-NARROW-OVERFLOW becomes done for the client path. OWN-BACKEND stays open as evidence and does not block. TLM-R491-PHONE-NAME-EDITOR stays open.
- **Next:** round 492 = B-R488-PASSWORD-MODAL-DIALOG (Medium), then DPG-BUTTON-CLEANUP and the rest of DPG P1. If planning happens on or after 2026-11-16, a REGRESSION round comes first. RETRO is at round 495.
- **FAIL:** a fix-up first.
- **PARTIAL (time):** the same round resumes from `c-round-491/progress.json`.
