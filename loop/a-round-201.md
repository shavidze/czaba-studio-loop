# STOP — needs B ruling on R94 × `SfxVideoSync.tsx:34` (hidden file input loses its only focus indicator)

A, round 201 (D-29z166, SABA-B-4 stage 2). Written 2026-10-27.

**Tree state: no source change.** `git status --short --untracked-files=all` is empty; all 31 grants still match `b-round-200-r201-granted-start-sha256.txt`. Neither new file (`store-focus-ring.test.ts`, doc 160) was created. L22 applies to C (short round). `a-round-201/end-sha256.txt` is written over the 31 grants and is identical to the start hashes. `a-round-201/diff-vs-start.patch` is **intentionally absent** because there is no diff.

## 1. The collision
- `app/components/recordings/SfxVideoSync.tsx:34–43`: a `<label class="relative inline-flex … rounded-lg border border-outline px-4 … focus-within:ring-2 focus-within:ring-brand">` wraps `<input aria-label="Choose local video" type="file" class="absolute inset-0 cursor-pointer opacity-0">`.
- R94 mandates removing both `focus-within:ring-*` tokens. After that the only indicator left is the global `:focus-visible` outline on the **input**, and `opacity: 0` hides the outline too.
- §2 STOP rule: "a store control that loses its only visible indicator and cannot be fixed with R96/R97 inside the grants". R97 changes only the offset, which cannot make an `opacity-0` element paint. Any working fix (for example `has-[:focus-visible]:…` on the label, or un-hiding the input) is not an R94 token removal. It would also break the fixed after-count of "store 15 tokens / 5 files", because B's inventory regex matches `has-[:focus-visible]:`.
- Reachability: `SfxVideoSync` is rendered only by `SfxSceneBuilder.tsx:611`, which renders on `/scenes/:id` (BLOCKED-AUTH in the task, §4). The problem is still real at code level.

## 2. Measurement (Chromium via Playwright, minimal reproduction with `page.setContent`)
Evidence: `a-round-201/hidden-input-probe.cjs`, `hidden-input-probe.json`, `count-brass.cjs`, `brass-count.json`, and 3 PNGs. Setup: the same label/input shape, the app's global `:focus-visible` rule (1.5px, brass 80 %, offset 2px), bg #0b0a09, 1280×720. A Tab from a preceding button focuses the input.

| State | activeElement | input `:focus-visible` | input outline | input opacity | label box-shadow | brass px in crop |
|---|---|---|---|---|---|---|
| ref (focus-within ring kept) | file input | true | solid 1px | 0 | `rgb(201,164,106) 0 0 0 2px` | **693** |
| tree (R94 applied) | file input | true | solid 1px | 0 | none | **69** |
| control: unfocused | — | — | — | 0 | none | **69** |

The focused tree crop is identical to the unfocused control (69 px = background noise in the crop, not a ring). **Zero ring pixels are painted** (`tree-r94-removed.png`). The computed outline is "solid" but invisible.

## 3. Complete hit list (so B rules once, L10)
I scanned the 27 sweep files for visually hidden focusables that could rely on a wrapper or sibling indicator (`opacity-0`, `sr-only`, `invisible`, `appearance-none`, `focus-within`, `group-focus`):
- **SfxVideoSync.tsx:34/40**: the only case. Collision above.
- `NewsletterSection.tsx:68`, `free-downloads.tsx:303`: honeypot inputs with `tabIndex={-1}`, not tabbable. Not affected.
- `hire-us.tsx:259`: a visible `appearance-none` select, so the global outline paints on it. Not affected.
- `sr-only` hits (legends, labels, a live region, a loading span): not focusable. Not affected.
- I re-ran the scan without the `group-hover:opacity` filter. `ProductCard.tsx:96/105` are `pointer-events-none` decorative glows and are not focusable. `ProductCard.tsx:132` is a `md:flex … opacity-0 group-hover:opacity-100` overlay around `AudioPreviewButton`, which is tabbable on md+. Its indicator is **already invisible in ref** under the same `opacity: 0`. ProductCard has no R94 tokens, so R94 does not change this. It is a **pre-existing hidden-until-hover** state, not a second STOP trigger. B may want to record it next to C-R196-03 (R96), but I made no change.
- `ExportDialog.tsx:283` (a visible native checkbox with `focus:ring-brand`/`focus:ring-accent`): after removal the global outline paints on the visible checkbox. Not affected, by inspection only (BLOCKED-AUTH page, not run in a browser).
- `VideoUploadZone.tsx:169` (a visible URL input with `focus:outline-none focus:border-brand`): after removal the global outline paints. Not affected, by inspection only.

## 4. Pre-work done (do not repeat it)
- Start checks: HEAD `5b1a2bb`, clean tree, frozen list (1001) OK, grant start hashes OK.
- Step 2 inventory: `store 155 tokens / 31 files`, `studio 13 / 5`, so it **matches** B.
- R95 precondition: `grep -rn "newsletter-input-large\|glass-input" app/` (all file types) returns only the two definitions and the two `:focus` rules in `app/styles/app.css` (l.1487/1500, l.3896/3904). Nothing else uses them.
- R93 check: `useFocusSourceAttribute` call sites are `StudioWorkspace.tsx:461` (import l.121) and the test `focus-source.test.tsx`. `AppContent` in `root.tsx` (l.127) renders for every route, `/studio*` included, so the move is feasible.
- Primitives read: TAILWIND_FIRST, AGENT_DISCOVERABLE_CODE, GEORGIAN_DOCS, TESTING_QUALITY_GATES (first part), and the pre-flight skill.

## 5. Candidate rulings for B (options, not decisions)
- **(a)** Grant one exception on that label: `has-[:focus-visible]:outline …`, or a matching arbitrary property that draws the outline on the label. Amend STF2 and the after-count to allow exactly that one site.
- **(b)** Grant a structural change so the focus lands on a visible element: the input becomes `sr-only`/`peer`, and the label gets the outline through a `peer-focus-visible` or similar sibling rule. This also needs an STF2 exception, because `peer-focus-visible:` is in its forbidden list.
- **(c)** Accept it as a recorded Low (the page is BLOCKED-AUTH in the cloud) and proceed with R94 as written. Note that RING-VISIBLE treats a lost indicator as **Medium (WCAG 2.4.7)**, so B must reconcile (c) with that clause. Code-level loss holds regardless of testability.
- **(d)** Keep the two `focus-within:ring-*` tokens on this one label (a one-site R94 exemption), and set the after-count to 17 tokens / 6 files. This draws a box-shadow ring on the wrapper instead of the shared outline style, which departs from Saba's "outline, no ring" rule at this one site.

## 6. Tests run
- No app tests were run (no code change). Browser: only the minimal reproduction above. The app pages were not exercised.
- typecheck/lint: not run (no change).
- The code-reviewer was not invoked (no change).

## 7. B acceptance criteria passed
- None of the implementation rows. Only the step 1 start checks and the step 2 inventory match are confirmed.

## 8. Next for C (L22)
SOURCE-SCOPE (`git status` empty, frozen list plus grant start hashes) and the G201-3 auth guard only. Then report FAIL "not implemented (A STOP)". RT-FIX is independent of A and may still be checked per task §4/§6.
