# A — Round 106 report: a held key no longer repeats the same refusal (GATE105-S1) + doc 092 (C-R105-01, GATE105-S2)

Implementer: A (Claude Opus 5.5) · 2026-10-23 · HEAD `3b6178b` (unchanged) · no commit/push/deploy.
STATUS: implementation done; code-reviewer run (8/10, no blockers), F1/F2 addressed with SK9–SK12 in the owned test file. Ready for C.

## 1. Start state (verified)
- HEAD `3b6178b758253d5098cea19f07c43e4799cb9299`; `git status --short` = 3 M + 4 ?? exactly as in the task.
- Frozen list `b-round-105-r106-tree-sha256.txt`: 535/535 OK. The 7 owned files matched the snapshot hashes (`bfe53dcb`, `939e720c`, `e8bbab9a`, `e9b38eee`, `00dc8d66`, `b6b54dc7`, `651428dd`).

## 2. Changed files (end sha256 in `a-round-106/end-hashes.txt`)
| File | End sha256 (prefix) | Change |
|---|---|---|
| `app/contexts/ArrangementContext.tsx` | `65a81c6d` | `stepLoopRange(…, options?: { keyRepeat })`, `nudgeSelectedClip(delta, options?: { keyRepeat })`; on keyRepeat the 3 refusals are dispatched in updater form; 2 interface lines. Reducer block, `gestureCountRef` and every other `setStatus(` untouched. |
| `app/components/arrangement/StudioWorkspace.tsx` | `ce70fcb5` | Both `nudgeSelectedClip` calls pass `{ keyRepeat: event.repeat }`; Snap-on `NUDGE_AT_TIME_START_MESSAGE` guarded by `!event.repeat \|\| current.status !== …`; Ctrl/Option+Arrow `stepMarker(…, edgeTimes, { keyRepeat: event.repeat })`. |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | `c5e6af8b` | Both `stepLoopRange` calls pass `{ keyRepeat: event.repeat }` (first call now gives `gridStep` explicitly as `null`). |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | `58d9b313` | `status` in destructure; `stepMarker(direction, edgeTimes?, options?)` + handle type; `commitMarkerMove(…, keyRepeat = false)` gates only the conflict text; `nudgeMarker(…, keyRepeat: boolean)` gates `MARKER_AT_TIME_START_MESSAGE`; flag arrow passes `event.repeat`. `stepMarker` deps now include `status` (expected). |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | `900350a5` | Enter branches of `handleRangeInputKeyDown` and `handleClipGainKeyDown`: `preventDefault(); if (!event.repeat) { … }`. Escape unchanged. |
| `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `581db1e7` | Pure append after l.391 (705 lines now): constants, `keyRepeatClip`, `keyRepeatArrangement`, `mountKeyRepeatWorkspace`, `pressKey`, `expectOneAnnouncementPerPress`, new top-level describe with SK1–SK8 + SK9–SK12 (reviewer F1/F2). l.1–391 byte-identical to snapshot; no `as`/`@ts-`/`any` in added lines. |
| `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md` | `4e2ed121` | l.4 status, Approach qualified, Mermaid gesture + key-repeat branches, changed files rounds 104–106 (SA1–SA7, SU1–SU6, SK1–SK8), GATE105-S1 problem/solution with keyboard semantics, forbidden (k8) and rejected (k9) rules, round 106 testing, TODO. |

End state: `git status --short` = **6 M + 4 ??** (expected). Frozen list 535/535 OK at end. HEAD `3b6178b`.
Hunks vs snapshots (diff line anchors): Context 295, 301, 1651, 1662, 1674, 1680, 1698; Workspace 1852, 1944, 1955, 1958; LoopBrace 203, 211; MarkerRow 82, 137, 223, 232, 240, 364, 367, 382, 390, 397, 620; DetailPanel 323, 373 — all inside the narrow ranges of the Baseline table.

## 3. Difference from the task (important for C and B)
**A single clip at time 0 with Snap off is a silent no-op, before and after this round.** `nudgeSelectedClip` clamps with `Math.max(0, …)`, `moveClip` returns an identical arrangement (not `null`), and `applyEdit` does nothing — no status, no history entry. The single-clip refusal (`…მეზობელი კლიპი ან დროის დასაწყისი.`) only appears when a **neighbour** blocks.
- Evidence: scratch probe `PROBE0` (not in the owned test file) — ArrowLeft + 2 repeats on a single clip at 0 adds no span, `statusSequence` and `undoLabel` unchanged — **green against both the round 105 snapshots and the fixed code** (`a-round-106/mut/results/probe0-snapshot.raw`, `probe0-fixed.raw`).
- Therefore SK1 and SK7 use a left neighbour (c0 at 0, duration 5): SK1 selects c1 at 5; SK7 selects c1 at 5.3 → starts 5.2 → 5.1 → 5 → 5 → 5 and the refusal once. Move logic was **not** changed (out of scope; would be new behaviour).
- Open finding for B (**A-R106-TIME0-SILENT**, Low a11y): ArrowLeft on a single clip at time 0 (Snap off) gives no feedback at all; the refusal text names "დროის დასაწყისი" but never fires there.
- KR-NUDGE-SNAPOFF and KR-NUDGE-MOVES as written would add 0 spans → see revised recipes in §8.
- SK2 (Snap on), SK3 (group) and the other SKs use B's time-0 setups unchanged and pass.

## 4. Sweep table (keydown handlers)
A listed every handler with `grep -n "onKeyDown=\|addEventListener('keydown'\|const handle[A-Za-z]*KeyDown"` over `app/components/arrangement/*.tsx` and `ArrangementContext.tsx`; the code-reviewer independently classified them (A spot-checked TempoRow Enter → blur, marker name input → editor settles). B's "already safe" list is confirmed.

| Handler | Repeat sets same text? | Disposition |
|---|---|---|
| Workspace arrow nudge (P1/P2) | was yes | **fixed** (provider updater + `current.status` comparison) |
| Workspace Ctrl/Option+Arrow (P5) | was yes | **fixed** (`stepMarker` `keyRepeat`) |
| LoopBrace `handleLoopKeyDown` (P3) | was yes | **fixed** |
| MarkerRow flag arrows (P4: start + conflict) | was yes | **fixed** |
| DetailPanel range / Clip Gain Enter (P6) | was yes | **fixed** (repeat skipped) |
| Workspace Space, Ctrl+D/X/V, Ctrl+G, M, A, U, 1/2/3, Delete, Enter, grid select | no | `!event.repeat` guards |
| Workspace gesture refusal (l.~1756) | no | inside claimed gesture → reducer coalesces (coupled to `gestureCountRef`) |
| Workspace zoom/nav, Ctrl+A, Home, Ctrl+Z/Y | no | no status / each undo step is a real action |
| **Workspace Ctrl/Cmd+E (split)** | **yes** | **NOT fixed — outside owned ranges → B** (reviewer F6) |
| **Workspace Ctrl+L** | **yes** + behaviour bug (loop toggles on every repeat) | **NOT fixed → B** (F6) |
| **Workspace Ctrl+Shift+L** | **yes** | **NOT fixed → B** (F6) |
| **Workspace Ctrl/Cmd+C** | **yes** | **NOT fixed → B** (F6) |
| **Buttons with held Enter → click per repeat: ◀/▶ marker (`ArrangementMarkerRow` ~l.695/706), Clip Gain reset (`ArrangementDetailPanel` ~l.384)** | **yes** | **NOT fixed — outside narrow ranges (task: ◀/▶ unchanged) → B** (F5). `+`/Snap toggle not confirmed. |
| Library, LibraryPreview, Lane (pan/fold/height), GroupHeader, TempoRow, MarkerMenu, GridMenu, Ruler, Overview, VideoDock, ExportDialog, marker name input, DetailPanel toggle/separator | no | guarded / no status / one-shot |

## 5. Commands run and results
| Command | Result |
|---|---|
| `git rev-parse HEAD`, `git status --short`, `sha256sum -c --quiet b-round-105-r106-tree-sha256.txt` (start and end) | `3b6178b`; 3M+4?? → 6M+4??; 535/535 OK both times |
| `npm run typecheck` | exit 0 |
| `npm run lint -- --max-diagnostics=500` | exit 0; 218 warnings + 1 info repo-wide, **0** lines for the 6 owned code/test files (grep) |
| `npx biome check <6 owned code/test files>` (no `--write`) | "Checked 6 files … No fixes applied", 0 diagnostics. The test file was formatted via `biome format --stdin-file-path` → stdout. |
| `npx vitest run app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | 18/18 pass (SU1–SU6, SK1–SK12) |
| targeted list (`a-round-106/targeted-list.txt`, B's grep) → `npx vitest run $(cat …)` | **69 files, 1138 tests, all pass** (`a-round-106/targeted.log`; = B's 1134 + SK9–SK12). Same 69 files as round 105's list — no extra files. |
| All checks above were re-run after SK9–SK12 were added | typecheck 0, lint 0 in owned files, biome check 6 files clean |
| Browser self-check `a-round-106/browser/kr-selfcheck.cjs` (A's own, not C acceptance) | see §7 |

## 6. Code-reviewer (actual `code-reviewer` subagent; score 8/10, "nothing in the diff blocks")
| # | Sev | Finding | Disposition |
|---|---|---|---|
| F1 | Medium | `expectOneAnnouncementPerPress` always starts with `repeat=false`, so SK2/SK5/SK6 can't tell `!repeat \|\| status !== MSG` from plain `!repeat` | **Fixed**: SK9 (marker reaches 0 then the first refusal arrives on a repeat), SK10 (Ctrl+→ reaches the end on a repeat). New mutation k10 (plain `!event.repeat` in components) → SK9, SK10 red. |
| F2 | Low | `commitMarkerMove` conflict branch and range-input Enter untested | **Fixed**: SK11 (conflict), SK12 (range start Enter). k12 → SK11 red, k11 → SK12 red. |
| F3 | Low | Comparing with last-render `status` could lose one refusal if a non-sync status update lands between two keydowns | Accepted, not changed (rare; provider path is immune). Covered by the Architecture note. |
| F4 | Nit | `status` in `stepMarker` deps rebuilds the imperative handle | Kept as B instructed (no ref). |
| F5 | Low, pre-existing | Held Enter on ◀/▶ marker buttons and Clip Gain reset re-announces | Outside narrow ranges → **reported to B** |
| F6 | Low, pre-existing | Ctrl/Cmd+E, Ctrl+L (also toggles loop each repeat), Ctrl+Shift+L, Ctrl/Cmd+C lack repeat guards | Outside owned ranges → **reported to B** |
| note | Low | Agrees time-0 single-clip silence is out of scope; inconsistent with Snap-on and marker behaviour | → B backlog (A-R106-TIME0-SILENT) |

Note on the reviewer's remark that `status-announcement.ts` has no snapshot: it is in the frozen list (535) at its round 105 hash and passed `sha256sum -c` at start and end — unchanged this round.

**Architecture note (verbatim):**
> - Signal 2/3: duplicate-refusal suppression now lives in two places — the provider updater (`ArrangementContext.tsx:1673,1693,1712`) and four component-side `status` comparisons (`StudioWorkspace.tsx:1957`, `ArrangementMarkerRow.tsx:242,385,410`). This announcement region has now been changed in rounds 96, 104 and 105.
> - Keep for now: this round preserves the `useArrangement()` shape and the gesture and Undo invariants, and the component comparison is only theoretically weaker (F3).
> - Proposal for the planner (one bounded task): an additive provider method `announceRefusal(text, { keyRepeat })`, or widening `setStatus` to accept the existing `ArrangementStatusUpdate`. The four component sites would switch to it, with SK1–SK8 plus the F1 discriminating tests as acceptance criteria.

(Proposal for B/root only; A did not refactor.)

## 7. Fail-before and mutations (scratch `a-round-106/mut/`, node_modules symlink, Vite `cacheDir` inside scratch via `vitest.scratch.config.ts`)
- Control (unmutated, before and after): 18/18 green (first pass with SK1–SK8: 14/14).
- **Fail-before** (5 code files = round 105 snapshots, new test file): **SK1–SK12 red, SU1–SU6 green.** Matches B (SK1–SK6, SK8 red at the repeat step; SK7 red at the "once" count: 2 blocked texts instead of 1).

| Mutation | Red tests | B expected |
|---|---|---|
| k1 workspace passes `keyRepeat: false` to both `nudgeSelectedClip` calls | SK1, SK3, SK7 | SK1, SK3 (SK7 also red: it uses the same path — consistent) |
| k2 drop the repeat/status check around `NUDGE_AT_TIME_START_MESSAGE` | SK2 | SK2 |
| k3 guard the action (`if (!event.repeat) nudgeSelectedClip(…)`) | SK7 | SK7 |
| k4 loop brace passes `keyRepeat: false` | SK4 | SK4 |
| k5 flag passes `false` | SK5, SK9, SK11 | SK5 |
| k6 Ctrl+Arrow passes `keyRepeat: false` | SK6, SK10 | SK6 |
| k7 Clip Gain Enter not repeat-guarded | SK8 | SK8 |
| k8 all 5 code files = snapshots + reducer coalesces identical string regardless of gesture | SU1, SU2, SU5, SK1–SK6, SK8, SK11, SK12 | SU1/SU2 + SK step 3. SU5 also red (its last step sets the same text outside a gesture and expects a bump). SK7 green under k8 (only one distinct refusal, coalescing hides the repeats). |
| k9 provider skips the refusal on every repeat (instead of updater form) | SK7 | SK7 |
| k10 (new) components use plain `!event.repeat` / `!keyRepeat` instead of the status comparison | SK9, SK10 | — (reviewer F1) |
| k11 (new) range-input Enter not repeat-guarded | SK12 | — |
| k12 (new) `commitMarkerMove` conflict not guarded | SK11 | — |

Mutation scripts: `a-round-106/mut/mutate.py`, `run.sh`, `reset.sh`; raw logs `a-round-106/mut/results/*.raw`.

**A's browser self-check** (Playwright, installed Chromium, `:5173/studio-lab`, fresh contexts, Decline, Snap off, Middle East row focus + Enter ×2, Fit, click second clip's title strip; MutationObserver on the `<output>`, capture keydown repeat counter; `keyboard.down('ArrowLeft')` ×32 then up; 500 ms; one `press('ArrowLeft')`):
- 1280×720 and 1440×900: in-page repeats **31**; during the hold the blocked text was added **once** (1 element node); the separate press added **exactly one** more with the same text; `<output>` the same node with one element child at every sample; clip starts `0.000`/`101.352` before and after; 0 pageerrors / non-noise console errors; 0 forbidden requests; 0 Authorization headers. Evidence `a-round-106/browser/kr-selfcheck.json`, `kr-selfcheck-1280.png`, `kr-selfcheck-1440.png`.

Note: the first mutation pass parsed test ids with a one-digit regex; that was only correct while SK ≤ 8. All rows above come from the second pass (`results/*c.txt`, `fail-before3.txt`, `control3*.txt`), with a fixed `[0-9]+` regex.

## 8. Exact next C checks
B's §2 rows apply unchanged, **except for the two nudge rows below**: as written, they would add 0 spans (see §3).
- **KR-NUDGE-SNAPOFF (revised; 1280 and 1440):** focus the Middle East row and press Enter twice (two back-to-back clips), then Fit. Snap off. Select the **second** clip by its title strip. Hold ArrowLeft (1 down + ≥ 30 repeats), then up. Wait 500 ms, then one `press('ArrowLeft')`.
  - Expected: `ჩაჩოჩება დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი.` added exactly once during the hold. The separate press adds exactly one more. Clip starts are unchanged (A's self-check: `0.000` / `101.352`). The `<output>` is the same node with one child.
- **KR-NUDGE-MOVES (revised):** use the same two clips and select the second. Use three `press('ArrowRight')` to make a 0.300 gap, and record the start. Hold ArrowLeft (1 down + ≥ 10 repeats).
  - Expected: the second clip returns to the first clip's end, and the refusal is added once and nothing else.
  - Then Ctrl+Z ×3 and record the start after each.
- **Optional extra row for B/C:** a single clip at 00:00.000 with Snap off, holding ArrowLeft, adds nothing. Record this as A-R106-TIME0-SILENT, not as a FAIL of this round.
- KR-NUDGE-SNAPON, KR-GROUP, KR-LOOP, KR-MARKER-FLAG (including the ArrowRight per-step text), KR-MARKER-STEP, KR-DETAIL-ENTER, HD-BLOCKED-HOLD, SR-REPEAT-SPACE, SR-TEXT-REG, PX-NET, REG-HYD, G106-3, AN-REVIEW (k1, k4, k8, k9; the fail-before list now covers SK1–SK12), T106-TARGETED (expect **1138**, not 1134), DOC-092 and SOURCE-UNCHANGED: as in the task.
- For SOURCE-UNCHANGED, the test file's end hash is `581db1e7` and doc 092's is `4e2ed121`; all hashes are in `end-hashes.txt`.

## 9. Scope completed / acceptance A truly passed
- Done: P1–P6 code, SK1–SK8 (with SK1/SK7 on the neighbour variant), SK9–SK12, fail-before, k1–k12, typecheck, lint, Biome on owned files, targeted 69/1138, code-reviewer plus its F1/F2 fixes, and doc 092.
- A did not claim any C acceptance row. A's browser self-check (§7) covers only the revised KR-NUDGE-SNAPOFF recipe and is evidence, not acceptance.
- **Open for B:**
  - A-R106-TIME0-SILENT;
  - reviewer F5 (held Enter on buttons) and F6 (Ctrl+E/L/Shift+L/C repeats; Ctrl+L also toggles the loop on every repeat);
  - the Architecture note (ARCH-R105-STATUS-INTENT continues).
- Not run by A (gate): the full suite, `npm run verify`, build and e2e smoke.
