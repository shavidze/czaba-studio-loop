# A — round 153 report: VISUAL-A V-2b-1 label typography (D-29z118)

**Scope completed:** F1, L1–L6, T1 (TH9), D1, D2. Nothing else touched. No commit/push/install/build/browser.

## Start checks (all OK)
HEAD `ff2fd6c`, `git status --short` empty, frozen 962 OK, 9 start hashes OK.

## Changed files (9 ` M` + 1 `??`)
- `app/styles/app.css` — F1: 3 lines after `--font-serif` in `@theme` TYPOGRAPHY (l.125–127). Diff = exactly those 3 `+` lines. Obsidian block untouched.
- `ArrangementMaster.tsx` — L1: `text-xs` → `text-label`, + `uppercase tracking-label` (`font-medium`, `text-muted`, `aria-hidden` kept). Biome's formatter split the span over 4 lines because of line width.
- `ArrangementTransport.tsx` — L2: `Zoom` wrapped in a span. `<label>`, input and readout unchanged.
- `ArrangementVideoDock.tsx` — L3: `Arrangement` wrapped in a span + `{' '}`. The `text-dim` span moved to the next line; textContent is still `Arrangement · Overview` (VDS1 green).
- `ArrangementTempoRow.tsx` — L4. `ArrangementMarkerRow.tsx` — L5. `StudioWorkspace.tsx` — L6 (`'Loop'` → span).
- `studio-theme-obsidian.test.tsx` — T1: new TH9 only. TH1–TH8 unchanged.
- doc 123 — D1: status line → `Completed (C round 152 PASS, gate 152 published ff2fd6c)`. The clause „C round 151 ჯერ არ გაშვებულა.“ → „C round 151-ისა და 152-ის შედეგები — ქვემოთ.“ **Line-number note:** the clause is on **l.70** at `ff2fd6c`, not l.67 as the task says. It occurs exactly once, so that is the line I edited. 2 lines changed.
- doc 124 (new) — D2. Georgian, TEMPLATE sections, status `In Progress (awaiting C round 153)`.

## TH9 details
- (a) The S0 SSR has exactly 6 tags with `tracking-label`, each with `text-label font-medium uppercase tracking-label`. **DOM order:** `Master, Zoom, Arrangement, BPM, Markers, Loop` (asserted as an ordered list). All six render in the S0 SSR (L6 too, because S0 has no loop), so no mounted fallback was needed. `text-[11px]` and `tracking-[0.14em]` occur 0 times.
- (b) Each of the 3 declarations occurs exactly once. Each is inside the brace-matched `@theme {…}` block at depth 1. After the review, each property name also occurs exactly once.
- (c) The SSR text of the dock caption span (`<span class="shrink-0">` before `arrangement-video-caption`) is `Arrangement · Overview`.
- Tailwind output on the running dev server (`/app/styles/app.css?direct`): `.text-label { font-size: var(--text-label); line-height: var(--tw-leading, var(--text-label--line-height)); }` and `.tracking-label { letter-spacing: var(--tracking-label); }`. This is a utility-generation check only. It is not a browser computed-style check; that is C's LABEL-STYLE row.

## Tests actually run
| Command | Result |
|---|---|
| 7 vitest files (baseline) | 88/88 passed, 23 suites — `a-round-153/vitest-baseline.json` |
| Same 7 files (final) | **89/89** passed (88 + TH9) — `a-round-153/vitest-after.json` |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 (218 warnings, 1 info, repo-wide; none in the changed files) |
| `npx biome check` on the 8 code/test files | exit 0. Biome checked 7 files: `app.css` is outside biome.json `includes` (`app/**/*.ts(x)`). |
| m134: `uppercase` removed from Markers | only TH9 red (89 total / 88 passed) |
| m135: `--tracking-label: 0.1em` | only TH9 red |
| m136: space before „· Overview“ dropped | TH9 + VDS1 red (`'Arrangement· Overview'`) |
Each mutation was applied with Edit and restored with Edit. After restoring, sha256 equals `post-edit-sha256.txt`. The mutations were run twice: before the review fix (`mutations-pre-review/`) and again on the final TH9 (`mutations/`), with the same results.
**Not run by A (per the speed rules):** full suite, `npm run verify`, build, e2e, every browser row.

## End checks
Frozen 962 OK. Protected diff vs `ff2fd6c` is empty: studio.$productId, api.studio-token, account.downloads, download-routes.test, AuthContext, StudioContext, Modal, root, and no `auth*` path in the diff. `git status` = the 9 granted ` M` + 1 `??`. Hashes are in `a-round-153/end-sha256.txt` (10 paths). The patch is `a-round-153/diff-vs-start.patch`.

## Code review (real subagent): 9/10, no Critical/High/Medium
See `a-round-153/code-review.md`. Fixed in TH9: the unbounded brace loop and the missing override guard. Not changed:
- the ordered-list lock (it is in the spec);
- the S0-only arbitrary-value ban;
- the screen-reader note on CSS uppercase;
- the 6× repeated class string.
**Architecture note (verbatim):** "none. The diff is six presentational class edits, three global `@theme` size/spacing tokens, and one test. No state, ref, lifecycle, ownership or coupling changes." **Proposal for B (not done):** a shared label-class constant for V-2b-2.

## B acceptance (A-side only)
- [x] F1 exactly 3 lines; obsidian block byte-identical (TH2 green).
- [x] L1–L6 as specified; textContent unchanged (VDS1 green, TH9 c).
- [x] TH9 (a)(b)(c); every baseline test still passes.
- [x] typecheck, lint, scoped Biome.
- [x] m134/m135/m136 behave as specified.
- [x] code-reviewer run; findings addressed or reported.
- [ ] Browser rows (LABEL-STYLE, RV-1-LABELS, NO-CLIP, FONTS-SCOPED, TOKENS-SCOPED, FUNC-SMOKE, G153-3, PX-NET/REG-HYD): **C's**, not run by A.

## Known gaps / risks for C
- Horizontal movers ≤ 26 px are expected (B's prediction). Check the 224 px header column (Markers + 3 buttons, BPM row) for clipping.
- L3 places the `text-dim` span on its own JSX line. The DOM is the same (one space text node).
- CSS `uppercase` may make some screen readers spell the labels letter by letter. Accessible names should be unchanged; LABEL-STYLE reports them.

## Exact next C checks
T153-TARGETED (expect 89/89 over the 7 files, TH9 green); SOURCE-SCOPE vs `a-round-153/end-sha256.txt`; AN-REVIEW; LABEL-STYLE (11px/16px/500/1.54px/uppercase/Instrument Sans, L6 in S0); RV-1-LABELS vs `c-round-152/out/bbox-post-v2a-*.json`; NO-CLIP (also the long-named video caption); FONTS-SCOPED; TOKENS-SCOPED; FUNC-SMOKE; G153-3; PX-NET/REG-HYD.
- Doc 124 got a post-review bullet in the ტესტირება section; end-sha256.txt and the patch were regenerated afterwards (post-edit-sha256.txt = end-sha256.txt; only doc 124's hash changed versus the mutation baseline).
