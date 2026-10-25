# A — Round 150 report: V-1b (DUX-B-3) + C-R149-1 + C-R149-2

Date: 2026-10-25 · Task: `current-task.md` (D-29z115) · Status: **implementation done; C not run yet** (no browser rows run by A).

## Start checks (all passed)
- HEAD `b292ff48b7c245d3435f8a44e6c3fc511cb66289`; `git status --short` = 3 ` M` + 2 `??`.
- `sha256sum -c --quiet b-round-149-r150-tree-sha256.txt` (962) OK; `b-round-149-r150-granted-start-sha256.txt` 8/8 OK; all 8 granted files `cmp`-equal to `b-round-149/r150-granted-start/`.
- Pre-flight gate (assumptions / smallest version / files / success command) posted in chat before the baseline run and before any edit; primitives read: DESIGN_TOKENS, TAILWIND_FIRST, FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, GEORGIAN_DOCS, TESTING_QUALITY_GATES.

## Changes (exactly §1; every edit via Edit/Write)
| ID | File | Change |
|---|---|---|
| F1 | `app/styles/app.css` l.3924 (obsidian block only) | `#3a3530` → `#736b60` |
| F2 | `ArrangementTempoRow.tsx` l.230 | `border-outline` → `border-outline-strong` |
| F3 | `ArrangementLibrary.tsx` l.469 | `border-outline` → `border-outline-strong` |
| F4 | `ArrangementDetailPanel.tsx` l.639 (`inputClass`) | `border-outline` → `border-outline-strong` |
| L1 | `ArrangementLoopBrace.tsx` l.239 | `bg-accent/30` → `bg-accent/20` |
| L2 | `ArrangementOverview.tsx` l.334 | `+ ring-1 ring-background` |
| test | `studio-theme-obsidian.test.tsx` | TH2 one map value → `#736b60`; new TH5 (SSR tokens for 5 fields + playhead), TH6 (source literal in LoopBrace); helper `classTokensByTestId`, const `LOOP_BRACE_PATH`. TH1/TH3/TH4 unchanged. |
| doc | `docs/implementation/2026/quarter-IV/122-…md` | Georgian; title/status cover V-1a + V-1b; status `In Progress (C round 150 — ჯერ არ გაშვებულა)`; C round 149 FAIL-Low result, F/L table, R1–R3 math, 6 source files listed. Filename kept. |

Store `@theme` l.61 unchanged; obsidian block still 22 lines at EOF. Biome needed no rewrap. Diff: `a-round-150/diff-vs-start.patch` (vs start copies).

## Tests actually run
- Baseline (round-149 tree), 6 files: **115/115** → `a-round-150/vitest-baseline.json` (theme 4, pending-status 22, detail-panel-fit 7, view 41, navigation-strings-ui 5, grid-snap-loop-drop 36).
- After: same 6 files **117/117** → `a-round-150/vitest-after.json`. Per-file counts unchanged except theme 4 → 6.
- `npm run typecheck` exit 0; `npm run lint` exit 0 (218 warnings / 1 info repo-wide, none reported for the changed files; 199 diagnostics hidden by Biome's cap); `npx biome check` (read-only) on the 6 changed `.ts/.tsx` files: exit 0, no diagnostics.
- Mutations (`a-round-150/mutations/summary.json` + per-mutation vitest JSON); each Edit → 6-file run → restore by Edit → sha256 = `post-edit-sha256.txt` OK:
  - m119 (F1 `#736b61`) → only TH2 red (116/1)
  - m120 (F2) → only TH5 red
  - m121 (F3) → only TH5 red
  - m122 (F4) → only TH5 red; **pending-status PM2 stayed green** (R5 confirmed); detail-panel-fit all green
  - m123 (L1 `/30`) → only TH6 red
  - m124 (L2 ring removed) → only TH5 red
- Not run by A (per speed rules): full suite, `npm run verify`, build, e2e, any browser row.

## End checks
- Frozen 962 OK; `git status --short` = **8 ` M` + 2 `??`**; protected diff vs b292ff4 empty (studio.$productId, api.studio-token, account.downloads, download-routes.test, auth*, AuthContext, StudioContext, Modal, root).
- `a-round-150/end-sha256.txt`: all 10 changed paths of rounds 149 + 150.

## Code-reviewer (actual subagent run) — 0 High/Medium, score 8.5/10
1. **Low, not fixed (outside ownership):** `detail-panel-fit.test.tsx:293` `expect(pendingTokens).not.toContain('border-outline')` is a token-array check and now guards nothing (the token is `border-outline-strong`). I confirmed it. **This contradicts B's R5 claim that detail-panel-fit F4 "stays meaningful".** The only test that still proves twMerge drops `border-outline-strong` when `border-warning` is added is PM1's substring check `pending-status.test.tsx:461` (`className` `not.toContain('border-outline')`), and that coverage is accidental. Suggested for B: a grant to change :293 to `not.toContain('border-outline-strong')`. Proposed ID `A-R150-REVIEW-L1`.
2. **Low, kept per B spec:** TH6 is a source-literal check, tied to formatting (quotes and class order). B prescribed it because the brace only renders with a loop. Signal only.
3. **Low, fixed:** the doc said "(R5)" for the PM2 note; changed to `(B-R150-PM2-SUBSTRING)`. I also recorded finding 1 in the doc's problems section.
4. **Info, relevant to C:** `ring-1 ring-background` compiles (`--color-background` is in `@theme`) and changes no layout. But the Overview root is `overflow-hidden` and the playhead is `inset-y-0`, so the halo shows **only left and right**: top/bottom are clipped, and the left side is clipped at `left: 0%`. C's STATE-DISTINCT should sample the halo horizontally (the task already says "horizontal pixel run"), at t > 0.
5. **Info:** the doc filename (`…-v1a-…`) and its V-1 title differ. Kept per task.
6. **Info:** `outline-strong` consumers in `app/` = the `@theme` definition, the scoped override, and the 3 new field uses only.

### Architecture note (verbatim from reviewer, for B)
> None of the four signals applies. The diff changes class strings and one CSS value. No state, ref, effect, lifecycle or ownership moves, and the audio timing, gesture and Undo/Redo paths are untouched. The obsidian block in `app/styles/app.css:3916-3936` has now been edited in two rounds in a row. That doesn't meet "repeated expensive change", because each edit was one line with no mocks or regression cost. Keep it as it is. The doc already sends moving these rules to `studio-theme.css` to the planner as a signal, so I'm not adding a separate proposal.

## B acceptance criteria truly passed by A
- §1 edits exactly as specified (6 single-line edits; app.css one value) — yes.
- §3.1 TH2/TH5/TH6 — yes; §3.2 m119–m124 red exactly as specified, with m122 PM2 green recorded — yes.
- §3.3 start/end checks, typecheck, lint, scoped Biome, 6 vitest files — yes.
- Code-reviewer run, Architecture note passed on — yes.
- **Not claimed:** every C row (FIELD-BOUNDARY, RV-2, STATE-DISTINCT, RV-1, TOKENS-SCOPED, RV-3, FUNC-SMOKE, VISUAL, G150-3, PX-NET/REG-HYD). The predicted ratios (3.50/3.70/3.30, 5.47, 8.32) are B's math. Nobody has measured them in a browser yet.

## Known gaps
- No browser measurement by A. Pixel ratios are unverified until C runs.
- Weak pending-state guard in `detail-panel-fit.test.tsx:293` (finding 1), not fixable in this round's ownership.
- On elevated surfaces the boundary is 3.30 (predicted). C must record each field's actual parent background.

## Exact next C checks
1. SOURCE-SCOPE: frozen 962, `sha256sum -c a-round-150/end-sha256.txt`, 8 M + 2 ??, protected diff empty.
2. T150-TARGETED: the 6 vitest files → 117 (theme 6, pending-status 22, detail-panel-fit 7, view 41, navigation-strings-ui 5, grid-snap-loop-drop 36).
3. FIELD-BOUNDARY at 1440×900 and 1280×720: BPM, library search, detail From/To/Clip Gain with a clip selected. Computed border `rgb(115, 107, 96)`; pixel border vs actual parent ≥ 3.0; pending Clip Gain shows `border-warning`; focused search shows `border-brand`.
4. RV-2: Loop brace label "Loop" ≥ 4.5 (computed and pixel); the 61 DUX-B-1/B-4 elements still ≥ 4.5.
5. STATE-DISTINCT: Overview playhead at 1/3/10/30 s over the full `bg-brand` bar. Sample **horizontally** (finding 4); halo step ≥ 3:1.
6. RV-1 (0 px expected), TOKENS-SCOPED (`--color-outline-strong` = `#736b60`), RV-3, FUNC-SMOKE (incl. Ctrl+L brace on/off, typing a BPM value, search filter), VISUAL, G150-3, PX-NET/REG-HYD.

## Scope completed
Round-150 A scope only. V-1b is not done until C PASS; I am not marking backlog items complete.
