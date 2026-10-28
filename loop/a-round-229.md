# A — round 229 (SABA-B-8 CALM-2a: canvas and dock helper text → quieter homes)

No STOP. No test above 50 % of its timeout. No regression found.

## Scope completed
- Start: HEAD `499c82167aeba92c6edf71af2dd1ddd880b5e098`; `git status --short` empty; tree, granted-start and root-files `sha256sum -c` rc 0.
- Applied B's `b-round-228/precheck-scratch.diff` (grants 1–14) unchanged, then added the §2.5 new cases and doc 178.
- §2.1–§2.4 implemented exactly: 6 strings + `TEMPO_EMPTY_HINT` + `LOOP_HINT` deleted; `studioLoopStrings.needsSelectionTitle`, `studioLaneStrings.videoMuteTitle`, `STUDIO_VIDEO_MIX_LABEL` added; bars/loop strips render no child when empty; Loop `title` three-state; dock label removed (row `min-h-4`), caption = file name or empty, empty overlay = textless `div` `data-testid="arrangement-video-empty"`; video-track Mute/Solo/Volume titles.

## Changed files (all granted)
`M`: grants 1–15 (see `b-round-228-r229-grants.txt`). `??`: `docs/implementation/2026/quarter-IV/178-calm-2a-canvas-dock-copy.md` (only new file). l.4 = `**სტატუსი:** In Progress (stage 1 of 2; C round 229 PASS)`.
Artifacts: `a-round-229/changed-end-sha256.txt`, `a-round-229/granted-hunks.diff` (vs `b-round-228/granted-start/`), `a-round-229/covering.json|log`, `a-round-229/self-S0-1280.png`, `a-round-229/selfcheck.cjs`.
Hunks beyond B's scratch diff: only the §2.5 new cases (ST-C2a + `studioShortcutTitle` import in strings.test; U1 title "hint"→"empty strip" and the `audio is not stretched` line; NS6 + `studioLoopStrings` import; LSU8, VDS4 + `studioLaneStrings` import in lane-strings-ui). `biome check --write` on the grants reformatted 1 file; per-file `@@` hunk counts vs HEAD equal B's scratch diff plus only the §2.5 additions (app grants 4/1/2/2/1/3/3; strings.test 12 = 10 + import + ST-C2a; tempo.test 2; tempo-ui 4 = 3 + the separate U1 title hunk granted by grant 10; tempo-window-ui 2; navigation 3; video-dock 1; obsidian 3; lane-strings 2), so the reflow is confined to a §2.5 block.

## Variants written
- **VDS4: full variant** (file name `film.mp4` equals caption text; `arrangement-video-empty` absent). Placed in `lane-strings-ui.test.tsx` (it has `importVideo`).
- **LSU8: full variant** — the video lane is shrunk with ArrowUp on the `separator` "height" control until "Original sound" disappears (non-full, non-folded: the Volume slider is still found); Volume title still `Original video sound`.

## Checks actually run
- `npm run typecheck` rc 0.
- `npm run lint` exit code observed **0** (205 warnings, 1 info repo-wide, pre-existing); `npx biome check` on grants 1–15: clean, 0 diagnostics.
- Covering set (24 files = the 18 pre-check files + L40 testid grep hits + §4.3 text grep hits; list in `covering.json`): **86 suites, 421/421 passed**.
  - Slowest: track-group-mix-ui UM9 2.68 s (describe timeout 20 s = 13 %); track-layout fold 1.33 s / 5 s = 27 %; fader-touch FT1 1.19 s / 5 s. None above 50 %.
  - New/changed: LSU8 347 ms, VDS4 101 ms, NS6 217 ms, NS4 292 ms, U1 342 ms, U8 174 ms, BU7 257 ms, VDS1 895 ms, TH9 19 ms, ST-C2a 0 ms.
- Mutants (each restored, sha verified):
  - MU-1 Loop hint span restored → **NS4 red**.
  - MU-2 Loop title falls back to `toggleTitle` → **NS6 red**.
  - MU-3 video Mute title `"Mute"` → **LSU8 red**.
  - MU-4 `formatTitle={isVideo && density !== 'full' …}` → **LSU8 red**.
  - MU-5 caption `'Video'` fallback → **VDS1 red**.
  - MU-6 `min-h-4` removed → 421/421 still green: **browser-only: C-BBOX-229** (no class pin added, L12).
- Browser self-check (Playwright Chromium, existing server :5173, 1280×720, S0): bars strip `""`, loop strip `""`, caption `""`, caption row height **16 px**, row text `""`, `arrangement-video-empty` text `""`, box `[1108,130,160,90]` = `arrangement-video-box` box, bg `rgb(14, 13, 12)`; Loop button disabled, title `Loop: make a time selection first (Ctrl+L)`, `aria-keyshortcuts` `Control+L Meta+L`; Overview aria-label unchanged; 0 page errors. Native tooltip hover not checked (C-LOOP-229).
- End: frozen tree list rc 0; root-files rc 0; protected files `git diff --quiet HEAD` rc 0 (studio.$productId, api.studio-token, account.downloads, download-routes.test, auth.ts).

## Note for C / B on the §2.1 grep (L4)
`grep -rn "emptyHint\|braceHint\|overviewNote\|captionFallback\|captionSoundNote\|studioVideoDockStrings.empty\b\|TEMPO_EMPTY_HINT" app` returns **only the ST-C2a absence lines** in `strings.test.ts` (`'emptyHint' in studioTempoStrings` … ), which §2.5 itself mandates. Excluding those `'<key>' in` lines, the grep is 0. The two clauses bind the same lines; I followed §2.5.

## code-reviewer (actual subagent, 16 paths) — 9/10, no Critical/High/Medium
- Low 1: the disabled Loop reason is in a `title` on a native `disabled` button, so keyboard users cannot focus it (same pattern as the existing Zoom-to-selection title; spec-mandated). Proposal for B: handle with DUX-R-4(b) (`aria-disabled` + focusable) — not done here, `disabled` is frozen by §2.2.
- Low 2: TH9 `not.toContain('>Arrangement<')` is narrow (spec form, grant 14); leftover `captionIndex` check kept.
- Info: video Mute/Solo titles equal their aria-labels (possible double read; Chromium usually drops); VDS1 test title now slightly stale (rename not granted); VDS4 id lives in a `V-0.4b` describe.
- **Architecture note: none** (keep as is).
No finding fixed in-round (none is within-grant Medium+).

## Process note
- My first command's attempt to read `context/active-summary.md` errored (chained `cat` of a missing path); it was read later (status ENV_CHECK round 229, last publication 499c821); nothing in it changes this round.

## Known gaps
- C-BBOX-229 (row height / overview box) is browser-only; my self-check measured 16 px at 1280 S0 only.
- No 1440 or SV/S2/S3 browser checks by A; native tooltip paint not checked.
- Full suite, build, `verify`, e2e smoke not run (speed rule; gate).

## Exact next C checks
C-SCOPE-229 (use `a-round-229/changed-end-sha256.txt`; note the ST-C2a grep lines above), C-UNIT-229, C-TEXT-229, C-BUDGET-229, C-BBOX-229 (caption row 16 ±1 px in S0 and SV), C-LOOP-229 (S0–S3), C-FACTS-229, C-VIDEO-TITLES-229 (default + smallest unfolded height), C-MONITOR-229 (SV file name, gap caption), C-OVERVIEW-229, G229-3, LAB-SMOKE-229, AN-REVIEW-229, C-REF-229, C-SHOTS-229; neighbours §6 (video float, tempo field, loop brace keys, 1280 header).

## B acceptance criteria A passed (unit/self-check level only; browser rows are C's)
- §4.1 start checks; §4.2 typecheck/lint/biome; §4.3 covering set green; §4.4 MU-1…MU-5 red as required, MU-6 browser-only; §4.6 code-reviewer run; §4.7 end state (15 `M` + one `??`, frozen/root rc 0, artifacts written).
