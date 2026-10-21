# CURRENT TASK — Round 73: C-R72-01 fix (SRW-16 stage 1 completion), D-29z38

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-21
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` and the LOOP POLICY / Loop v2 / cloud-runner / speed rules in your prompt (they win over older text).
- **Previous task:** `tasks/round-72.md` (exact copy). Rationale: `b-round-72.md`. Decision record D-29z38 in `plan.md`.
- **Round size:** one bug (C-R72-01, medium), one owner (A). No new feature. SRW-16 stage 2 follows in round 74 (scheduled, not deferred).

## Why this round
C round 72 (`c-round-72.md`, `.json`): **FAIL**, `browserVerified=false`, one medium bug and every other stage-1 row PASS in the real browser at 1440x900 and 1280x720. The root gate for round 72 was **skipped** (`gates/gate-round-72.json`: "C taskStatus FAIL"), so nothing was published. Round 72's code is therefore **uncommitted work in the tree. It is preserved, not reverted.** Round 73 fixes the bug on top of it; the next gate publishes rounds 72+73 together.

### C-R72-01 (medium) — Delete / plain arrows hit the focused marker instead of the selected clip
Steps: drop a clip, ruler click, key M, Enter (marker committed, focus returns to its flag as specified), click the clip body (clip gets the brand ring), press Delete. Result: the **marker** is deleted; the clip stays; plain → does not nudge the clip. With focus blurred first, the same clip click + Delete removes the clip. Add always leaves focus on the flag, so "add marker, click a clip, Delete" is the normal flow.

Cause (B read the code): `releaseEditFocusOnTimelinePointerDown` (`StudioWorkspace.tsx` ~l.1143, attached as `onPointerDownCapture` at ~l.1727) blurs range inputs, typing targets and the loop brace when the pointer lands elsewhere. It has **no clause for a focused marker flag**. `ArrangementClip.beginGesture` calls `preventDefault` on pointerdown, so the browser never moves focus either. The window key branches (Delete ~l.1494, plain arrows ~l.1509) then see `isMarkerTarget(event.target)` and stand down for the flag, i.e. they act on the wrong object.

## Baseline (measured by B, 2026-10-21)
- **HEAD `1e469e59d28aebf2e2a90f3d9d6d614d4e599bd1`** (published round 71). **Valid start is NOT an empty tree.** `git status --short` must be exactly the 10 round-72 lines:
  `M app/components/arrangement/StudioWorkspace.tsx`, `M app/contexts/ArrangementContext.tsx`, `M app/lib/arrangement/model.ts`, `M app/types/arrangement.ts`, `M docs/implementation/2026/quarter-IV/063-studio-lab-metronome-horizon.md`, `?? app/components/arrangement/ArrangementMarkerRow.tsx`, `?? app/lib/arrangement/__tests__/markers-ui.test.tsx`, `?? app/lib/arrangement/__tests__/markers.test.ts`, `?? app/lib/arrangement/markers.ts`, `?? docs/implementation/2026/quarter-IV/064-studio-lab-markers.md`.
- **NEVER** stash, reset, checkout, clean or re-create anything. A mismatch (a different tree, a changed frozen file) means stop and report.
- **Frozen list (regenerated on Linux by B):** `../tmp/studio-real-loop/b-round-72-r73-tree-sha256.txt`, **449** entries, 449/449 OK (`cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-72-r73-tree-sha256.txt`). It covers every `app/**` and `docs/implementation/**` file (tracked and untracked) except the 3 owned files. This replaces the stale Windows-EOL list; the 17 CRLF mismatches of round 72 no longer exist.
- **Snapshots:** `../tmp/studio-real-loop/b-round-72-r73-snapshots/` with `SHA256SUMS.txt`:

  | File | sha256 prefix | CR / LF |
  |---|---|---|
  | `StudioWorkspace.tsx` | `b35a0f2a` | 0 / 2009 |
  | `markers-ui.test.tsx` | `4a09c6cc` | 0 / 705 |
  | `064-studio-lab-markers.md` | `6c9f0ae5` | 0 / 89 |
- **Protected files:** 4/4 OK (`protected-baseline.json`; `download-routes.test.ts`, `account.downloads.tsx`, `api.studio-token.ts`, `studio.$productId.tsx`). Never touch them.
- **Servers (B, Linux cloud):** `:5173/studio-lab` 200; backend `:5199` unavailable (expected). A and C re-check at phase start. Never start/stop servers. Rows that truly need the backend are "BLOCKED: backend unavailable in cloud", never PASS.
- Every owned file is LF. Never run `biome check --write`, `format --write`, `npm run format`, `check:fix`.

## 1. A: the change (smallest honest fix)

**F1 — `StudioWorkspace.tsx` only, in `releaseEditFocusOnTimelinePointerDown`:** add one clause parallel to the loop-brace one: when the focused element is a marker flag (`isMarkerTarget(focused)`) and the pointer target is **not** in a marker (`!isMarkerTarget(event.target)`), blur it. All existing guards stay (`!isScrollerGutterPointer`, `!isPointerGestureActive`, `!focused.contains(target)`). Do not change the Delete/arrow branches, the flag's own handlers, or `ArrangementClip.tsx`/`ArrangementLane.tsx` (frozen).
- **Confirm in the code that the capture handler's container covers the ruler, tempo row, marker row, lane backgrounds and clips.** Report any path that does not blur (e.g. ruler click or lane click with a flag focused). If one is uncovered, do the smallest extension inside `StudioWorkspace.tsx` and record it.
- **Click on another marker** or on the name editor input keeps focus (no blur): the clause must not fire when the target is in a marker.
- **Decisions recorded (B), no code beyond F1:**
  1. A's two deviations (blur during a gesture does not commit; blur never moves focus), confirmed by C in round 72, are **accepted** as the smallest honest behavior: the user's click decides where focus goes. Rationale: moving focus on blur would steal it from a deliberate click.
  2. ROW-RANGE-M (M adds at `range.start` even after a later ruler click, because CZABA's range is only dropped by Escape/another edit): spec R6 as written, **not changed**. It is recorded as a UX signal for stage 2 (BACKLOG, not a task).
  3. The focus hand-off is CZABA's own model. No Ableton parity is claimed for it ("არ ეხება"). Clip select + Delete is already confirmed (`ableton_round72`).

**F2 — tests (`markers-ui.test.tsx`, add; do not weaken existing ones):**
- **MU8c (the bug):** mount with a clip and a marker; focus the flag; `fireEvent.pointerDown` (button 0) on the clip element; assert `document.activeElement` is not the flag (body or the clip); selected clip set; `keyDown` Delete on `document.body` (and on the active element) removes the **clip**, `markers` equal to before; Undo restores the clip. Then the same with plain ArrowRight: clip `start` changes, markers unchanged.
- **MU8d (paths):** same precondition, `pointerDown` on (a) a lane background, (b) the ruler: the flag is blurred.
- **MU8e (inverse controls):** pointerDown on **another flag** and on the name editor input does NOT blur the focused flag. MU8 (Delete on the flag removes only the marker) stays unchanged and green.
- **Mutation h from C round 72 survived** (removing the window-branch guard `isMarkerTarget` in the Delete/arrow branches changes no test, because the flag's own `stopPropagation` makes it redundant). A must **either** add a test that reaches the window Delete/arrow branch with a marker target (e.g. dispatch from a marker element that does not stop propagation, such as a non-flag child), **or** record in the report and doc 064 that the guard is defense-in-depth and why no test can reach it. Do not leave it silent.
- **Mutation proof (A runs and records):** (i) remove the new clause → MU8c/d red; (ii) widen it to blur on a marker target too → MU8e red. Restore after each (byte-compare to a copy).

**F3 — doc 064 (`docs/implementation/2026/quarter-IV/064-studio-lab-markers.md`):** update the status line to round 73 (C-R72-01 fix), add one Problem → Solution entry for the focus bug and the two accepted deviations, keep the TEMPLATE sections, Georgian text, LF.

**A's checks (speed rules):** `npm run typecheck`, `npm run lint`, `npx vitest run app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/markers.test.ts app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/delete-selection.test.ts`. No full suite and no `npm run verify` (root gate). Code-reviewer: not required (1 source file); ask anyway if the change grows. Record any Architecture note as a signal; it is not a task.

## 2. Pre-flight for A
Read CLAUDE.md, `.claude/rules/*`, primitives-map, `AGENT_DISCOVERABLE_CODE`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`, `prompts/studio-feature.md`. Then verify the baseline (HEAD, the 10 status lines, frozen 449/449, snapshots 3/3, protected 4/4, EOL). Process count: `pgrep -c node`.

## 3. File ownership (exact)
Writable: `app/components/arrangement/StudioWorkspace.tsx`, `app/lib/arrangement/__tests__/markers-ui.test.tsx`, `docs/implementation/2026/quarter-IV/064-studio-lab-markers.md`. A's report: `a-round-73.md` (+ `a-round-73/` scratch under the loop folder). Everything else, including the other 7 round-72 files, is **read-only** (they are frozen at their current content). `git status --short` at the end = the same 10 lines. Only root commits.

## 4. Acceptance (C, real browser, 1440x900 and 1280x720; Playwright + installed Chromium; fresh context per run)
Ableton column: **CZABA-only / არ ეხება** for rows C73-1..4 (focus hand-off is CZABA's model); delete/nudge of the selected clip = already confirmed (`ableton_round72`).

| ID | Action → expected | Evidence |
|---|---|---|
| C73-1 (the bug) | Exact C-R72-01 steps: drop clip, ruler click, M, Enter, REAL click on the clip body, Delete → **clip removed, marker kept**, status is the SRW-24 clip message. Repeat with plain → → clip start changes, marker kept, flag not focused. | steps, status, counts, shots |
| C73-2 (paths) | Flag focused, then REAL click on (a) a lane background, (b) the ruler, (c) another flag, (d) the name editor of a rename: (a)(b) blur the flag; (c)(d) keep marker focus/behavior. Delete on a focused flag still removes only the marker (MK-DELETE), focus lands on the next flag. | per-path active element |
| C73-3 (controls) | Add via button then Escape: focus returns to the prior element (A's documented behavior); typing `m` in the search/BPM still types; Ctrl+←/→ prev/next still work after the fix (MK-NAV, one run). | results |
| C73-4 (round-72 not-run rows) | (a) header-link entry to `/studio-lab` loads and opens anonymously with the demo badge; (b) marker-row vertical stickiness: make vertical overflow (add enough tracks/lower viewport height or use a short viewport such as 1280x500) and scroll vertically → the marker row `y` stays under the tempo row; if overflow cannot be created, say so (not run), do not claim PASS; (c) "range stays after M at range.start" (the one partial row). | numbers/shots |
| REG-KEYS | Space/Home/G/1/2, arrow nudge after the fix (clip selected, body focused), Ctrl+Shift+L; Delete on a selected clip with focus on a fader/range input unchanged (R33-T/R34-T class: fader click → clip click → Delete removes the clip). | results |
| REG-HYD | no hydration warning on load | console |
| G73-3 | `/studio-lab` anonymous shows the demo badge; `/studio/middle-east` shows "Sign in required"; anonymous `/api/studio-token` 401; fake-Bearer 403 row = BLOCKED (backend unavailable in cloud); 0 forbidden requests, 0 Authorization headers. | network log |
| gate rows | vitest/typecheck/build/Biome/verify: marked `gate` in the JSON (root gate). Do not claim them. | — |

C reruns **only** these rows. The other stage-1 rows (MK-ADD*, JUMP, PLAYFROM, NAV, RENAME, CUT-TIME, LAYOUT, EXPORT-REG) passed in round 72 on code that this round does not touch (one pointer-capture clause); C re-checks MK-DELETE, MK-NAV and one MK-ADD-PLAYING run as the directly related regression. **Source-unchanged check for C:** the sha256 of all 3 owned files equal at C's start and end, the other 7 round-72 files equal to A's reported hashes.

C writes `c-round-73.md` and `c-round-73.json` (`taskStatus`, `browserVerified`, `realVerified`, `bugs`, `passed`, `blocked`, `notRun`, `gate`, `info`, `ableton`). `browserVerified=true` only if C73-1, C73-2 and G73-3 (non-backend rows) ran at both viewports in the real browser.

## 5. Reports and next
- A: `a-round-73.md` (baseline results, change summary, mutation proofs, the mutation-h decision, commands actually run, Architecture signal).
- C: as above. Bugs go back to B.
- Next (B): if C PASS with `browserVerified=true` → round 74 = SRW-16 stage 2 (move markers with drag/arrows and snap, right-click marker menu with Rename/Delete/Play from here, snap of clips/range/playhead to markers, Ctrl+←/→ also at clip edges) plus the ROW-RANGE-M signal. Then SRW-17…SRW-20 in dependency order. The regression round is due on or after 2026-10-24 (`regression-last.json`).
