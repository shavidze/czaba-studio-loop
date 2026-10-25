# A round 159: V-3a fix-up for C-R158-01 (transport colour motion and reduced motion)

Implementer: A · Date: 2026-10-25 · Task: `current-task.md` (D-29z124) · Evidence: `a-round-159/`

## Start checks (all OK)
- HEAD = `f8a316a583663e9715207727d7b997323fa97019`.
- `git status --short` showed the expected 2 ` M` and 2 `??` lines.
- The frozen 975 files matched (`sha256sum -c` was quiet).
- The 3 granted start hashes matched.

## Changed files (only the 3 grants)
| ID | File | Change |
|---|---|---|
| F1 | `app/components/arrangement/ArrangementTransport.tsx` | `toolButtonClass` only. Final string: `… text-foreground motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! enabled:hover:bg-foreground/8 …`. Biome kept the token order. Every other byte is unchanged. |
| N1' | `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | TS1 only. On each of the 12 buttons it asserts the 4 `!` tokens and that the 3 non-important exact tokens are absent. The TS1 title, the other TS1 assertions and TS2–TS6 are unchanged. |
| D2' | `docs/implementation/2026/quarter-IV/128-studio-v3a-transport-surfaces.md` | Status set to `In Progress (awaiting C round 159; round 158 C FAIL Low C-R158-01)`. Added a C-R158-01 Problem → Solution entry covering the unlayered rule, why `!` + `motion-reduce:transition-none!`, why not app.css (ROOT-GLOBAL-TRANSITION-RULE) and the accepted consequence. Added the generation check, a "round 159" tests note (jsdom tokens do not prove the cascade), m156/m157 and the reviewer outcome. |

Not touched: `app/styles/**`, `strings.ts`, `package.json` and any other component. There is no `style=`, no hex and no leading `!`.

## Commands and tests actually run
- **Baseline:** 25 files (`a-round-159/vitest-files.txt` = `b-round-158-r159-vitest-base.txt`): **386/386** (`vitest-baseline.json`).
- **After F1 + N1':** the same 25 files, **386/386**, TS1–TS6 all passed (`vitest-after.json`). No new `it` was added.
- `npm run typecheck`: exit 0 (`typecheck.log`).
- `npm run lint`: exit 0, 218 warnings and 1 info. These are pre-existing; none are in the 2 owned code files (`lint.log`).
- `npx biome check` (read-only) on the component and test file: "Checked 2 files … No fixes applied", clean. This was run again at the end.
- **Tailwind generation check** on the already-running dev server (`http://127.0.0.1:5173/app/styles/app.css?direct`, HTTP 200; A did not start or stop any server): all 4 selectors exist, each with `!important` inside the right media query. `motion-safe:*!` is inside `prefers-reduced-motion: no-preference` and `motion-reduce:transition-none!` (`transition-property: none !important`) is inside `prefers-reduced-motion: reduce`. `allOk: true` (`tailwind-css-check.json`, `served-app.css`). This proves generation only, not the cascade.
- **Mutations** (Edit → run the transport test file → restore by Edit → sha256 equals the post-edit `e4814d8e…`):
  - **m156:** `motion-safe:duration-180!` → `motion-safe:duration-180`. TS1 **failed** (killed) and the file was restored (`mutations/m156.json`).
    - The first attempt is invalid and kept as `mutations/m156-invalid-attempt1.json`. The Edit tool trimmed the trailing space, so the mutant fused two tokens. I restored the file, checked the hash, and re-ran the exact mutation with a non-whitespace anchor.
  - **m157:** deleted `motion-reduce:transition-none!`. TS1 **failed** (killed) and the file was restored (`mutations/m157.json`).
- **Not run by A** (speed rules / task): the full suite, `npm run verify`, the build, e2e and every browser row.

## Code-reviewer (actual subagent, 3 files)
- **Verdict:** the fix is correct, with no Critical or High findings. Score 8.5/10. Cascade reasoning and tailwind-merge behaviour were checked against the served CSS and all call sites.
- **Medium (fixed in D2'):** the doc named only `app.css` l.305–314. The same unlayered rule is also in `app/styles/base/utilities.css` l.7–15, which `app.css` pulls in with a plain `@import`. I confirmed this by reading both files. The doc now names both, and says the `!` suffixes can only be dropped after **both** copies are layered.
- **Low (fixed in D2'):** under reduced motion only `transition-property` becomes `none`. The global shorthand's duration (0.15s/0.25s) and ease-out remain in computed style, but they animate nothing. The C row (h-rm) already accepts "`transition-property: none` **or** 0s". C should expect the `none` branch.
- **Low (no change):** the `not.toContain` loop in TS1 adds little, and nothing in jsdom ties tokens to CSS. Both limits are documented.
- **Info:** the focus ring, the `border-accent` toggles (Delete with range, Loop on, Follow paused) and `disabled:opacity-40` are now instant. This is the accepted consequence from §0.1 and is not a regression.
- **Info:** browsers without `prefers-reduced-motion` support would fall back to the global transition. Negligible.
- **Architecture note (verbatim, for B/root; not acted on):**
  > **Signal 2 (ownership/coupling):** `ArrangementTransport.tsx:40-41`. The transport buttons' transition behaviour now depends on two unlayered global rules (`app.css:306` and `base/utilities.css:7`) that the component doesn't own. The `!` suffixes are a local workaround for that.
  > - Keep the code as it is this round. It is a single constant, has low cost, and touches no audio timing, refs or Undo/Redo.
  > - Proposal for planner/root (not part of this round): one bounded task to move both global `a, button, …` transition rules into `@layer base`. Acceptance criteria: 1. Audit the Store's interactive elements whose utilities would then start working, e.g. `ProductAccordion`'s `transition-colors duration-300 motion-reduce:transition-none`. 2. Remove the `!` suffixes in `toolButtonClass` at the same time. 3. Update TS1. 4. Have C re-measure computed transitions on the transport and on a sample of Store links and buttons.

  For B: ROOT-GLOBAL-TRANSITION-RULE should list **both** locations. The same `!` recipe will be needed in V-3b and V-3c unless root layers both rules first.

## End checks
- Frozen 975: OK. `git ls-files -co --exclude-standard` lists 978 files.
- `git status --short` matches the start exactly: 2 ` M` (ArrangementTransport.tsx, doc 127) and 2 `??` (transport-surface-ui.test.tsx, doc 128).
- Protected diff vs `f8a316a` is empty: `app/styles/**`, `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, auth, Modal, Toast, root, CookieConsent, icons, strings.ts, StudioWorkspace.tsx, studio-theme-obsidian test and studio-lab.tsx.
- Doc 127 still equals `0b3cf016…`.
- `a-round-159/end-sha256.txt` has the 4 paths: component `e4814d8e…`, doc 127 `0b3cf016…`, test `c9aeee05…`, doc 128 `b135b55b…`.
- `a-round-159/diff-vs-start.patch` is the diff vs `b-round-158/r159-granted-start/`.

## B acceptance (A's part) actually passed
- F1, N1' and D2' are done within the exact scope.
- The 25-file baseline and post-edit runs are 386/386, and TS1 is green.
- typecheck, lint and scoped Biome are clean.
- m156 and m157 both killed TS1, and the restore hashes were verified.
- The Tailwind generation check is OK.
- A real code-reviewer ran and its findings were addressed.
- The end-state checks are OK.

**Not claimed:** any browser or cascade result. SURFACE-STYLE (h)/(h-rm)/(i), CASCADE-SCOPE, RV1-V3A, FUNC-SMOKE-T, G159-3 and PX-NET/REG-HYD belong to C.

## Known gaps
- jsdom cannot prove the computed transition. Only C's real-Chromium measurement closes C-R158-01.
- Under reduced motion, computed `transition-duration` and `transition-timing-function` still show the global values. Only `transition-property` is `none`, which matches the (h-rm) "or" condition.
- The non-important `motion-safe:transition-[background-color,color]` selector still appears in the served CSS. It most likely comes from scanned source text: the test file's `not.toContain` strings and/or doc 128's tables. I have not verified which. It is harmless because no element carries that class, so the cascade is unaffected.
- **Doc 128 is internally inconsistent (for B; outside the enumerated D2' edits, so left as is):**
  - The round-158 "კლასი — ადრე და შემდეგ" table's `შემდეგ` row still lists the 3 non-important tokens.
  - The R3 bullet still says the `motion-safe:transition-[…]` pattern means "reduced motion-ისას transition არ არის", which is the claim C-R158-01 disproved.
  - The new C-R158-01 Problem → Solution entry states the current truth, and the current tokens are in F1. B may grant a one-line doc fix later, e.g. at gate or V-3b.
- **Pre-flight:** the skill's chat gate (Assumptions / Smallest version / Files / Success) was posted in A's session before the first edit, and the start checks were run.

## Exact next C checks
1. T159-TARGETED: re-run `a-round-159/vitest-files.txt`. Expect 386/386 with TS1–TS6 green.
2. SOURCE-SCOPE: compare against `a-round-159/end-sha256.txt` and the frozen 975.
3. AN-REVIEW: read `a-round-159/diff-vs-start.patch`.
4. SURFACE-STYLE (h): all 12 buttons compute `background-color, color` / `0.18s` / `cubic-bezier(0.2, 0.8, 0.2, 1)`.
5. SURFACE-STYLE (h-rm): in a `reducedMotion: 'reduce'` context, expect `transition-property: none`. Do not expect a 0s duration; see the reviewer's Low.
6. SURFACE-STYLE (i): the focus ring is now immediate.
7. CASCADE-SCOPE: the library, lane M/S and Export Done controls keep the global 0.15s/0.25s ease-out.
8. Then RV1-V3A, FUNC-SMOKE-T, G159-3 and PX-NET/REG-HYD, per the task.

STATUS: A round 159 complete; awaiting C. Backlog is not marked complete.
