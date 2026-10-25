# A round 167 — V-3c-4a toolbar button surfaces (D-29z132)

Status: implementation complete, code-reviewer done and addressed. `realVerified=false` for A (no browser rows run by A — they are C's).

## Pre-flight / baseline (actually run)
- HEAD `330f1f3`, `git status --short` empty, 976 frozen files `sha256sum -c` OK, 9 grant start hashes OK.
- Primitives read: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, AUDIO_ARCHITECTURE, prompts/studio-feature, prompts/new-test, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS; docs/implementation/TEMPLATE.md.
- 12-file vitest baseline (`a-round-167/vitest-files.txt` = `b-round-166-r167-vitest-base.txt`): **176/176** → `a-round-167/vitest-baseline.json`.

## Changed files (all 9 grants used + 1 new)
| File | IDs |
|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | W2, W3 (Snap), W4 (Env), W5 (grid select, waveform-zoom select). Exactly 4 class sites (`git diff -U0` = 4 hunks). |
| `app/components/arrangement/ArrangementTempoRow.tsx` | T1, T2 (Metronome), T3 (BPM input radius) |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | K2 (`MARKER_HEADER_BUTTON_CLASS`; `MARKER_STEP_BUTTON_CLASS` formula unchanged), K3 (name input radius) |
| `app/components/arrangement/ArrangementMaster.tsx` | X1 (Peak: base SURF+MOTION+rounded-md, clear → `text-muted hover:text-foreground`, over string byte-identical, third `cn` arg `over && 'enabled:hover:bg-destructive/15 enabled:active:bg-destructive/15'`), X2 (Mute) |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | + TS8 only |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | + UI11 only |
| `app/lib/arrangement/__tests__/marker-strings-ui.test.tsx` | + MS5 only (MS4 unchanged, green) |
| `app/lib/arrangement/__tests__/header-meter-envelope-strings-ui.test.tsx` | + HM7 only |
| `docs/…/135-studio-v3c3b-marker-detail-grid-exit-icons.md` | D1: l.4 status → `Completed (C round 166 PASS; published 330f1f3)`; l.154 TODO marked done (allowance used) |
| **new** `docs/…/136-studio-v3c4a-toolbar-button-surfaces.md` | D2 (Georgian, TEMPLATE sections, R1–R5, probe table, split, before/after tokens, tests, mutations, TODO, status In Progress) |

Token notes: SURF + MOTION copied byte-exact from `ArrangementTransport.tsx` `toolButtonClass`; the only arbitrary values are the 4 MOTION tokens. On-state strings are byte-identical with only the R2 appends. No text, aria, handler, size, padding, data-* change. No shared constant (fallback (c)). Snap/Env on-strings were wrapped onto a second line by the formatter-compatible layout (`snapEnabled &&` newline) — content-only change is the append.

TS8 mount: all TS8 targets (Snap, Env, grid select, waveform-zoom select, Master Mute, Master Peak) rendered in transport-surface-ui's mount; no fallback to HM7/MS5 was needed.

## Tests and commands (actually run)
- 12-file vitest after edits: **180/180** (176 + TS8, UI11, MS5, HM7 all green) → `a-round-167/vitest-after.json`.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0 (218 warnings + 1 info repository-wide, none in the 8 owned files).
- `npx biome check` (read-only) on the 8 code+test files: clean, no fixes.
- `expect(` counts (`a-round-167/expect-counts.txt`): transport-surface-ui 67→74, metronome-ui 72→83, marker-strings-ui 40→48, header-meter-envelope-strings-ui 17→24 (after review fix). No drops vs baseline.

## Mutations (Edit → run → restore by Edit → sha256 = post-edit hash; JSON per mutation in `a-round-167/mutations/`)
| ID | Mutation | Result |
|---|---|---|
| m192 | Snap base `border-transparent` → `border-outline` | killed: TS8 |
| m193 | Env on-string without `enabled:hover:bg-accent/20` | killed: TS8 |
| m194 | Metronome base `rounded-md` → `rounded-sm` | killed: UI11 |
| m195 | `inline-flex` added to `MARKER_HEADER_BUTTON_CLASS` | killed: MS4 + MS5 |
| m196 | third Peak `cn` argument dropped | killed: HM7 |
| m197 | Master Mute on-string without `enabled:hover:bg-accent` | killed: TS8 |
| m198 | BPM input `rounded-md` → `rounded-sm` | killed: UI11 |
No MOTION `!`-only mutant was run. All 4 component files match `a-round-167/post-edit-sha256.txt` after restore; 180/180 re-run green after restores.

## End state
- 976 frozen files OK; protected diff vs `330f1f3` empty (routes studio.$productId / api.studio-token / account.downloads, download-routes test, app/contexts, app/styles, app/components/icons, root.tsx, ArrangementTransport.tsx, strings.ts, package.json).
- `git status --short`: the 9 grants as ` M` + doc 136 as `??`, nothing else.
- `a-round-167/end-sha256.txt` (10 paths), `a-round-167/diff-vs-start.patch` (vs `b-round-166/r167-granted-start/` + doc 136 as new).

## Code-reviewer (actual `code-reviewer` subagent, read-only)
- Score 8/10, **no Critical issues**. Confirmed recipe is byte-identical to `toolButtonClass`, twMerge (tailwind-merge 3.4.0) resolves every on-state conflict, Peak over string byte-identical, fields radius-only, focus/disabled cues intact, out-of-scope `rounded-sm` sites untouched. Reviewer had no shell and could not run `git diff` itself (it reviewed working-tree contents); the byte-level scope is evidenced by `a-round-167/diff-vs-start.patch` for C's AN-REVIEW.
- Addressed (test-only, inside the new `it` blocks):
  - Medium: HM7 now also asserts `enabled:hover:bg-foreground/8` and `enabled:active:bg-foreground/12` are absent in the over state.
  - Low: TS8 on-state DROPPED list now includes `enabled:active:bg-foreground/12`; Snap/Env on-state assert `hover:text-accent` present and `hover:text-foreground` absent; Master Mute on uses the same DROPPED list.
  - Low: UI11 on-state asserts the full dropped set + `hover:text-accent`/no `hover:text-foreground`; disabled cue now checks `disabled:cursor-not-allowed`, `disabled:opacity-50`, `disabled:hover:text-muted`.
- Not changed (noted for B): test IDs `TS8` and `MS5` also exist in other files (marker-time-snap-ui.test.tsx:601, marker-snap.test.tsx:475) — IDs were assigned by B; no runtime effect. Pre-existing metronome `disabled:opacity-50` vs transport `disabled:opacity-40` mismatch (out of scope, R1 says each button keeps its own disabled cue).
- After the fixes: 12 files 180/180, typecheck 0, lint 0, scoped Biome clean. m192–m198 were run first before this strengthening and then **re-run against the final tests**: all 7 killed again with the same red tests (TS8 / TS8 / UI11 / MS4+MS5 / HM7 / TS8 / UI11); each restore matches `post-edit-sha256.txt`, `end-sha256.txt` re-verified OK, and the final 12-file run is 180/180. The mutation JSONs hold the re-run results (`runAgainst`).
- `expect(` literal count for header-meter-envelope-strings-ui is 24 (was 25 before the review fix) because two explicit `not.toContain` calls were folded into a loop with four tokens; vs baseline 17 it is still an increase.

### Architecture note (verbatim from reviewer, for B — not acted on)
> **Signal 3 (one region changed repeatedly at high cost)** at ArrangementTransport.tsx:51, StudioWorkspace.tsx:2285 and :2366, ArrangementTempoRow.tsx:241, ArrangementMarkerRow.tsx:51, and ArrangementMaster.tsx:108 and :171.
> - The same ~400-character recipe is now duplicated in 7 places across 5 files. Each copy needs its own token test (TS8, UI11, MS5, HM7), and the four motion tokens are repeated in every test.
> - **Keep for now:** the spec ruled out a cross-file constant this round, every site is pinned by a test, and nothing is broken.
> - **Proposal for the planner (a suggestion, not approved scope):** one task to export a single tool-button surface class constant from `app/lib/arrangement/`. The 7 sites would use it through `cn`, with their own size and padding. Add one test that checks every tool-button test ID includes the constant's tokens. Acceptance: the existing TS8, UI11, MS5 and HM7 pass unchanged, and nothing else changes.

## Not run by A
Full suite, `npm run verify`, build, e2e, and every browser row (SURF, BOX, CONTRAST, RV1, FUNC-SMOKE, G167-3, PX-NET/REG-HYD).

## B acceptance actually passed by A
- §2 ownership: only granted files + doc 136 changed. ✔
- §3 baseline 176/176, after 180/180, typecheck, lint, scoped Biome, expect counts, m192–m198 all killed. ✔
- Browser acceptance: not run by A (C).

## Next C checks
1. T167-TARGETED: re-run `a-round-167/vitest-files.txt` → expect 180/180 with TS8, UI11, MS5, HM7.
2. SOURCE-SCOPE: HEAD 330f1f3, frozen 976 OK, end hashes = `a-round-167/end-sha256.txt`, git status as above, protected diff empty.
3. AN-REVIEW on `a-round-167/diff-vs-start.patch` (StudioWorkspace 4 hunks with -U0).
4. Browser rows SURF/BOX/CONTRAST/RV1/FUNC-SMOKE-V3C4A at 1440×900 and 1280×720, plus G167-3 and PX-NET/REG-HYD.

## Known gaps
- No browser verification by A. Master Peak over (S4) in a real browser depends on producing a live overload; HM7 covers it in jsdom.
