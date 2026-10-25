# A — round 154 report: VISUAL-A V-2b-2 weight roles + remaining timecodes in mono (D-29z119)

**Scope completed:** W1–W6, N1–N6, T1 (TH10), T2, T3, D1, D2. Nothing else touched. No commit/push/stash/install/build/browser.

## Start checks (all OK)
HEAD `037e25f`, `git status --short` empty, frozen 959 OK (`git ls-files -co --exclude-standard` = 972), 13 start hashes OK.

## Changed files (13 ` M` + 1 `??`)
- `StudioWorkspace.tsx` — W1 (`h1` `font-semibold` → `font-medium`).
- `ArrangementLibrary.tsx` — W2 (`h2` → `font-medium`); N1 (ready branch only → `<span className="font-mono">{formatArrangementTime(state.duration)}</span>`). **Note:** once one branch became JSX, Biome's formatter required the whole ternary in JSX-ternary form (`? ( … ) : …`). The loading/error expressions and strings are byte-identical; only line layout changed. The meta row (l.117) and its first child are unchanged.
- `ArrangementGroupHeader.tsx` — W3 (`TRACK_GROUP_MIX_BUTTON_CLASS` `font-bold` → `font-medium`), W4 (group-name `font-semibold` → `font-medium`).
- `ArrangementMaster.tsx` — W5 (Master Mute `font-bold` → `font-medium`), W6 (over branch now `'border-destructive bg-destructive/15 text-destructive'`).
- `ArrangementLane.tsx` — W5 (l.612 M, l.630 S → `font-medium`), N6 (ghost start span + `font-mono`). Pan (l.773) unchanged.
- `ArrangementLibraryPreview.tsx` — N2 (`font-mono tabular-nums`). Biome split the `<span>` attributes over 4 lines (line width).
- `ArrangementRuler.tsx` — N3. `ArrangementTempoRow.tsx` — N4 (l.233 `4/4` unchanged). `ArrangementDetailPanel.tsx` — N5.
- `studio-theme-obsidian.test.tsx` — T1: new TH10 only (TH1–TH9 and helpers unchanged).
- `render-budget.test.tsx` — T2: l.528 → `toBe('font-mono tabular-nums')`. Nothing else.
- `library-row-strings-ui.test.tsx` — T3: in LRS3 after l.248: second meta child has exactly one `span.font-mono` with textContent `00:20.000`; first child has no `font-mono`. Existing assertions unchanged.
- doc 124 — D1: l.4 only → `**სტატუსი:** Completed (C round 153 PASS, gate 153 published 037e25f)`.
- doc 125 (new) — D2: Georgian, TEMPLATE sections, status `In Progress (awaiting C round 154)`; R1–R5, W/N table, sans list + reasons, B-R153-PREVIEW-DUR, Export title under V-2b-DISPLAY, V-2b-3, css2-trim evidence plan, tests and mutations.

## TH10 coverage (how each item is covered)
An SSR probe of `renderToString(<StudioLabRoute />)` (saved: `a-round-154/ssr-probe.html`; run via a temporary `it` in the TH file, then replaced by TH10) decided the split:
| Item | Coverage |
|---|---|
| W1 h1, W2 Library h2 | S0 SSR (local `<h[1-6]\b` regex — the shared `classTokensOfEveryTag` regex `<[a-z]+\b` cannot match `h1`/`h2`; helper left unchanged) |
| W5 Master Mute (1), lane Mute (4), lane Solo (4) | S0 SSR, exact counts, `font-medium` and no `font-semibold`/`font-bold` |
| W3, W4 group header | Not in S0 SSR → (a) source scan + exact class string (new = 1, old = 0) in `ArrangementGroupHeader.tsx` |
| W6 peak over | Not in S0 SSR → source: `bg-destructive/15 font-medium` = 0, new over string = 1 |
| (a) scan | No `.ts`/`.tsx` under `components/arrangement` (≥ 20 files) has `font-semibold|bold|extrabold|black|[NNN]` (widened after review; the task asked for `.tsx` + semibold/bold, so this is a superset) |
| N2 playhead | S0 SSR: `font-mono` + `tabular-nums` |
| N3 ruler | S0 SSR (30 labels, all with the exact class including `font-mono`) **and** source string |
| N4 tempo row | Not in S0 SSR (needs BPM) → exact source string |
| N5 clip-gain reset | S0 SSR (`classTokensByTestId`) |
| N6 ghost | Not in SSR (needs a drag) → exact source string |
| N1 library duration | Not in TH10 (SSR rows are still loading) → LRS3 / T3 in jsdom |
| Sans guards | S0 SSR: `arrangement-zoom-readout` and the 3 `arrangement-track-pan-reset` have no `font-mono` |

## Tests actually run
| Command | Result |
|---|---|
| 21 vitest files, baseline (the 8 listed; group header: `header-meter-envelope-strings-ui`, `track-groups-ui`, `track-group-collapse-ui`; clip-gain reset: `clip-gain-fader`, `self-disabling-focus`, `clip-gain`, `clip-gain-multi`, `detail-panel-strings-ui`, `pending-status`, `detail-panel-reason`, `status-announcement-ui`, `detail-panel-fit`; plus `grid-musical-ui` for ruler/tempo). List: `a-round-154/vitest-files.txt` | **292/292** passed — `a-round-154/vitest-baseline.json` |
| Same 21 files, final | **293/293** passed (292 + TH10) — `a-round-154/vitest-after.json` |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 (218 warnings, 1 info, repo-wide; none in the 12 changed files) |
| `npx biome check` on the 12 code/test files (read-only) | exit 0, 12 files checked, no findings — `a-round-154/biome-scoped.log` |
| m137: `font-bold` back on lane l.612 | only TH10 red (293 total / 292 passed) |
| m138: `font-mono` removed from the ruler label | only TH10 red |
| m139: N1 `font-mono` moved onto the meta row (l.117) | only LRS3 red (l.248 exact class) |
| m139b (extra): inner span loses `font-mono`, meta row unchanged | only LRS3 red (T3: `span.font-mono` length 1) |
| m140: `font-medium` back in the W6 over branch | only TH10 red |

Each mutation was applied with Edit and restored with Edit; afterwards the sha256 equals `a-round-154/post-edit-sha256.txt`. The mutations ran before the review fix (`mutations-pre-review/`) and again on the final TH10 (`mutations/`), with the same results. **Process note:** in the second pass I accidentally applied m138's edit together with m137 before running anything. I restored the ruler (hash verified OK) before running m137, so every recorded run is a single mutation.
**Not run by A (speed rules):** full suite, `npm run verify`, build, e2e, every browser row.

## Code-reviewer (real `code-reviewer` subagent)
Score 9/10, no Critical/High/Medium. Summary: `a-round-154/code-reviewer-output.md`.
- Fixed: the TH10 scan now uses `/\.tsx?$/` with ≥ 20 files (same as TH3), and the regex was widened to extrabold/black/arbitrary `font-[NNN]`.
- Not fixed (recorded):
  - The W6 negative check depends on class order: `font-medium` added as a separate `cn()` argument would not be caught. C's MASTER-OVER computed weight 400 is the real check.
  - The N1 loading/error branches have no "no span.font-mono" lock, because the T3 grant covers only the l.248 test. **Proposal for B.**
  - In mono, ruler labels ≥ 10:00 (~36 px + 4 px offset) use the full 40 px `RULER_LABEL_SPACING_PX`, so labels may touch on long timelines. **C's NO-CLIP/OVERLAP should include a zoom where labels read ≥ 10:00, if reachable.**
- **Architecture note (verbatim):** "Architecture note: none. The diff only changes class strings and adds one inner span. It adds no state, effects, refs or lifecycle, and moves no ownership. This reviews the diff only, not the full modules."

## End checks
- Frozen 959 OK.
- The protected diff vs `037e25f` is empty (studio.$productId, api.studio-token, account.downloads, download-routes.test, AuthContext, StudioContext, Modal, root; 0 `auth*` paths in the diff).
- `app.css`, `studio-lab.tsx` and `package.json` are unchanged.
- `git status --short` = 13 ` M` (all granted) + 1 `??` (doc 125).
- Hashes: `a-round-154/end-sha256.txt` (14 paths). Patch: `a-round-154/diff-vs-start.patch` (includes doc 125 as a new file).

## B acceptance — A-side items
- [x] Baseline checks; W1–W6 and N1–N6 exactly as specified; T1/T2/T3; D1; D2.
- [x] Every baseline-passing test still passes; TH10 green; typecheck; lint; scoped Biome.
- [x] m137–m140 red as predicted; restored and verified by hash.
- [x] Code-reviewer run and addressed; frozen/protected/status end checks.
- [ ] All C rows (WEIGHT-STYLE, MASTER-OVER, MONO-STYLE, RV-1-V2B2, NO-CLIP/OVERLAP, LANE-GHOST, WEIGHT-INVENTORY, FONTS-SCOPED, FUNC-SMOKE, G154-3, PX-NET/REG-HYD) — not run by A; A has no browser evidence.

## Known gaps / notes for C and B
- No browser verification by A: computed weights, Plex Mono rendering, bbox movers and clipping stay unverified until C runs.
- The library preview duration intentionally stays sans (B-R153-PREVIEW-DUR). The range readout, selected-clip line and Export scope line also stay sans until V-2b-3.
- The Export `ModalTitle` (600) remains, via the protected `Modal.tsx` (R3).
- The old `app/components/studio/**` still has `font-bold`/`font-semibold`. It is outside the `/studio-lab` arrangement scope and was not part of this round.

## Exact next C checks
1. T154-TARGETED: `npx vitest run $(cat /home/runner/czaba-project/tmp/studio-real-loop/a-round-154/vitest-files.txt)` → expect 293/293.
2. SOURCE-SCOPE: `sha256sum -c a-round-154/end-sha256.txt`; frozen 959; status 13 ` M` + 1 `??`.
3. WEIGHT-STYLE / MASTER-OVER / MONO-STYLE per task §4 (both viewports). Include a ruler zoom with labels ≥ 10:00 if reachable (reviewer note).
4. RV-1-V2B2 vs `c-round-153/out/bbox-post-v2b1-{1280,1440}.json` (B prediction: only clip-gain reset dw ≈ +3).
5. NO-CLIP/OVERLAP, LANE-GHOST, WEIGHT-INVENTORY, FONTS-SCOPED, FUNC-SMOKE, G154-3, PX-NET/REG-HYD.
