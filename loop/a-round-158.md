# A round 158 — V-3a: transport surfaces, Play/Export colour roles, lucide icons on Play/Pause and Zoom to selection

Implementer: A (Claude Opus 5.5) · Date: 2026-10-25 · Task: `current-task.md` (D-29z123) · Baseline HEAD `f8a316a`

## Start checks (all OK)
- HEAD = `f8a316a583663e9715207727d7b997323fa97019`; `git status --short` was empty.
- Frozen 974 (`b-round-157-r158-tree-sha256.txt`) OK at start and at end.
- 2 granted start hashes matched (`b-round-157-r158-granted-start-sha256.txt`).
- Primitives read before editing: FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, AUDIO_ARCHITECTURE, AGENT_DISCOVERABLE_CODE, prompts/studio-feature, prompts/new-test, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, docs/implementation/TEMPLATE.md. Pre-flight gate posted.

## Changed files (exactly 4)
| Path | Change |
|---|---|
| `app/components/arrangement/ArrangementTransport.tsx` (M) | T0 lucide import (`MoveHorizontal, Pause, Play`, Biome-sorted above `react`); T1 `toolButtonClass` = exact §1 string; T2 Play class `cn(toolButtonClass, 'w-24 justify-center bg-foreground font-medium text-background enabled:hover:bg-foreground/92 enabled:active:bg-foreground/88')`, children `<Pause/><span>Pause</span>` / `<Play/><span>Play</span>`; T3 Loop-on string with `enabled:hover:bg-accent/20 enabled:active:bg-accent/20`; T4 `⇔` → `<MoveHorizontal/>`; T5 Export `'border-brand font-medium text-brand'`. Icons: `className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true"`. Nothing else changed (handlers, aria-labels, widths, other glyphs). |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` (new) | TS1–TS6 on the real `StudioWorkspace` (master-ui harness mocks). Toolbar = ancestor `.flex-wrap` of `arrangement-position` that also contains `arrangement-fit` (no `closest('div')`); asserts exactly 12 buttons. |
| `docs/implementation/2026/quarter-IV/127-…font-trim.md` (M) | D1: status line only → `Completed (C round 157 PASS, gate 157 f8a316a)`. |
| `docs/implementation/2026/quarter-IV/128-studio-v3a-transport-surfaces.md` (new) | D2: Georgian, TEMPLATE sections, R1–R6, §0.1 table, class before/after, Problem→Solution, tests/mutations, TODO. Status `In Progress (awaiting C round 158)`. |

`git status --short` at end: 2 ` M` + 2 `??`, nothing else. Protected diff vs `f8a316a` empty (studio.$productId, api.studio-token, account.downloads, download-routes.test, AuthContext, StudioContext, auth.ts, Modal, Toast, root.tsx, app/styles, components/icons, strings.ts, StudioWorkspace.tsx, studio-theme-obsidian.test.tsx, studio-lab.tsx, package.json).

## Tailwind generation check (dev server CSS, 127.0.0.1:5173 `app/styles/app.css`)
All new utilities generate CSS, so no arbitrary-form fallback was needed (`a-round-158/tailwind-css-check.json`):
- `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `enabled:hover:bg-foreground/92`, `enabled:active:bg-foreground/88`, `enabled:hover|active:bg-accent/20`, `rounded-md` (`--radius-md`), `size-4`.
- `motion-safe:duration-180` → `transition-duration: 180ms`; `motion-safe:transition-[background-color,color]`; `motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]` — all inside `@media (prefers-reduced-motion: no-preference)`.
- `enabled:hover:*` sits inside `@media (hover: hover)`; `enabled:active:*` rules come after the hover rules in source order (lines 5074/5084 vs 5031/5043).

## Tests actually run
- **Baseline** (24 files of `b-round-157-r158-vitest-base.txt`): 380/380 passed (`a-round-158/vitest-baseline.json`).
- **After** (same 24 + new = `a-round-158/vitest-files.txt`, 25 files): **386/386 passed**, 0 failed (`vitest-after.json`). No listed test was changed or turned red.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0, 0 errors, 218 warnings / 1 info (none in owned files; grep count 0).
- Read-only `npx biome check` on the component and the new test: clean.
- **Mutations** (Edit → run → restore by Edit → sha256 = post-edit `4804126c…`), JSON in `a-round-158/mutations/`, all re-run against the final test file:
  - m151 `border-transparent`→`border-outline`: TS1 red (also TS2, which asserts border-transparent on Play). Killed.
  - m152 Play icon+span → `▶ Play`: TS2 red. Killed.
  - m153 drop `enabled:hover:bg-accent/20`: TS5 red. Killed.
  - m154 Export back to `border-brand bg-brand font-medium text-brand-foreground`: TS4 red. Killed.
  - m155 (extra, reviewer Low) Pause branch renders `<Play/>`: TS2 red. Killed.
- Not run by A (per speed rules): full suite, `npm run verify`, build, e2e, any browser row.

## Code-reviewer (actual subagent call) — `a-round-158/code-reviewer.md`
Score 8/10; no Critical/High/Medium. Lows fixed inside N1 / D2: icon identity (lucide-* classes, m155); TS1 locks `border`, focus ring, `disabled:opacity-40` and the absence of a bare `hover:` token; TS2 locks `w-24`; doc 128 lists itself. Infos are passed to C below.

### Architecture note for B (verbatim in code-reviewer.md; NOT implemented)
1. The V-3 surface recipe (`toolButtonClass`) will be copied into ~8 components in V-3c (`ArrangementExportDialog.tsx:615` still has the old brand-fill recipe; `ArrangementLane.tsx:632`, `ArrangementGroupHeader.tsx:300` partial). Proposal before V-3c: shared `studioToolButtonClass` (+ Play/outline variants) or a small `ToolButton` component; acceptance = identical class output, TS1–TS6 + obsidian test green. Keep now.
2. Test harness duplication: 81 files define `class FakeAudioContext`. Proposal: shared `__tests__/helpers` fixture (`stubStudioGlobals()`), adopted file by file. Keep now.

## B acceptance criteria truly passed by A
- T0–T5, N1 (TS1–TS6 green), D1, D2 done within ownership.
- Tailwind check done (all bare-value utilities generate).
- 25 files green, typecheck, lint, scoped Biome clean; m151–m154 killed and restored.
- End: frozen 974 OK, protected diff empty, status 2 M + 2 ??; `end-sha256.txt` and `diff-vs-start.patch` written.
- **Not claimed:** every C browser row (SURFACE-STYLE, ICON-STYLE, RV1-V3A, CONTRAST-V3A, FUNC-SMOKE-T, OVERLOAD-CHECK, G158-3, PX-NET/REG-HYD). realVerified for V-3a belongs to C.

## Known gaps / notes for C
- No browser check by A. Computed styles, layout ±1 px and contrast are unverified until C runs them.
- Reviewer Info: the focus ring on the ivory Play fill has a weak inner edge (~1.9:1); the outer edge vs surface is ~7:1. Judge SURFACE-STYLE (i) on the outer edge.
- The lucide svg carries `width="24" height="24"` attributes; `size-4` makes the rendered box 16×16. Measure the box (ICON-STYLE), not the attributes.
- Low UX (user-vetoable): at S0, 7/12 buttons are disabled; opacity-40 on a 5 % fill ≈ 2 % effective, so the idle toolbar reads as mostly unframed text. Belongs with the D-29z123 R3 veto list.
- Zoom to selection keeps `text-xs` (now inert; the spec says unchanged).
- B-R157-EXPORT-PEAK: audio code unchanged; OVERLOAD-CHECK is C's.

## Exact next C checks
1. T158-TARGETED: `npx vitest run $(cat a-round-158/vitest-files.txt)` → 25 files, 386/386, TS1–TS6 present and green.
2. SOURCE-SCOPE: HEAD `f8a316a`; frozen 974 OK; `sha256sum -c a-round-158/end-sha256.txt`; status 2 M + 2 ??; protected diff empty.
3. AN-REVIEW on `a-round-158/diff-vs-start.patch`.
4. RV1-V3A, SURFACE-STYLE (a)–(i), ICON-STYLE, CONTRAST-V3A, FUNC-SMOKE-T, OVERLOAD-CHECK, G158-3, PX-NET/REG-HYD on http://127.0.0.1:5173/studio-lab at 1440×900 and 1280×720.

## Scope
V-3a implementation stage complete and awaiting C round 158. V-3 is not complete (V-3b and V-3c remain); the backlog is not marked complete.
