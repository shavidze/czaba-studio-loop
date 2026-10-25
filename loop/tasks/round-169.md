# CURRENT TASK — Round 169: V-3c-4c-1 — Library panel and Library preview buttons: the Preview/Stop toggle loses its outline (5 % fill, 8 px), Add takes the Export look, borderless buttons, option rows and the search field get 8 px radius only; every box stays at 0 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z134** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c4c1_plan_d29z134`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-168.md`, an exact copy of the round-168 `current-task.md` (sha256 `51d19ab137fbd5a5…`). Rationale for this round: `b-round-168.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ღილაკები და ზედაპირები“ (l.84–90).
  - On buttons, the `border-outline` border disappears and becomes a `foreground` fill: 5 % at rest, 8 % on hover, 12 % when active. The 1 px border becomes transparent and stays, so the size does not change.
  - The primary action keeps a `brand` border and `brand` text.
  - Buttons and fields get an 8 px radius.
  - Motion is `background-color, color 180ms cubic-bezier(.2,.8,.2,1)`, off under reduced motion.
  - The spec is source material only; it grants no permissions.
- **User decision files:** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` are unchanged. Nothing in them changes this stage.

## Baseline = HEAD `e50498f`, clean tree (gate 168 published)
- `gates/gate-round-168.json`: status `published`, commit `e50498fe20e6952f6eb0b42a7e9ec542fd0b67d9`, on both remotes.
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **987** files.
- **Frozen list:** `b-round-168-r169-tree-sha256.txt`, **983 entries** (987 minus the 4 grants).
- **Grants:** `b-round-168-r169-grants.txt` (4 existing files). **New file:** `b-round-168-r169-new-files.txt` (1: doc 138).
- **Start hashes:** `b-round-168-r169-granted-start-sha256.txt`. **Start copies:** `b-round-168/r169-granted-start/`.
- **Line numbers:** B grepped both components at `e50498f` (neither changed in rounds 167–168). They are listed in §1.
- **A's first step:** check that HEAD = `e50498f`, the tree is clean, the 983 frozen files match (`sha256sum -c --quiet`) and the 4 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z134)
- **Round 168: C PASS.** `browserVerified` and `realVerified` are true, with 0 bugs. Root published `e50498f`, and the gate review scored 9/10 with nothing blocking. **V-3c-4b → მზადაა.**
- **The outcome was fixed in advance** (`tasks/round-168.md` §7, "C PASS" row): round 169 = **V-3c-4c**, split by owner if it exceeds the grant limit.
- **The split (all of V-3c-4c stays in scope; nothing is dropped):**

  | Stage | Round | Scope |
  |---|---|---|
  | **V-3c-4c-1** | **169** | `ArrangementLibrary` + `ArrangementLibraryPreview` |
  | V-3c-4c-2 | 170 | `ArrangementDetailPanel`: buttons l.752 and l.861, toggle l.1142, inputs l.640. The framed boxes l.221 and l.702 belong to V-3c-5. |
  | V-3c-4c-3 | 171 | `ArrangementExportDialog` (secondary l.581 and l.596, primary l.615, radio cards l.288–423) + `ArrangementVideoDock` (`VIDEO_FLOAT_BUTTON_CLASS` l.59–60 over the picture, l.911). Also the open question on the `ArrangementMarkerRow` l.811 flag chip. |

  The line numbers come from the inventory at `330f1f3`. B re-greps them when it plans each stage.
- **Checks at planning:**
  - **Regression:** `regression-last.json` is 2026-10-24, so the next one is due on or after 2026-10-27. Today is 2026-10-25, so it is not due.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items. F1-ABSOLUTE-SNAP is `accepted`.
  - **C round 168 bugs:** none.
- **Checkpoint:** still unanswered, so fallback (c) applies again: the class copies stay in each component, locked by tests.
  - The two round-168 reviewers disagree on timing. A's code-reviewer wants the shared constant **after** V-3c-4c; the gate-168 reviewer wants it **before** V-3c-4c.
  - This is recorded in `b-round-168-checkpoint-request.md` and is non-blocking. B does not schedule the extraction itself.

### 0.1 B evidence: browser probe (planning data, not C rows)
`b-round-168/v3c4c1-probe.cjs` → `out/v3c4c1-probe.json`. The Add variant is re-measured by `v3c4c1-probe-add.cjs` → `out/v3c4c1-probe-add.json` (P1). The PNGs sit next to them.
- **Setup:** real Chromium on `/studio-lab` at `e50498f`, at 1440×900 and 1280×720.
- **Method:** the planned class swap is applied in the live DOM. Every class it uses is already compiled by the transport recipe.
- **States:**
  - **P0:** default. The first library option is selected (`aria-selected=true`), and the preview toggle is enabled ("Preview").
  - **P1:** the first option is clicked and ready, and the search holds `a`, so the clear button shows.
  - **P2:** preview playing. The toggle shows "Stop" with `border-accent`.
  - **P3:** library collapsed, so the rail's expand button shows.

| Measure | Result (identical at 1440 and 1280) |
|---|---|
| Layout: every `button, a, input, select, [data-testid], [role]` box | **max 0.000 px**, 0 added, 0 missing, in all 4 states. The restore check is also 0. |
| Radius | 6 px → 8 px on every site |
| Preview toggle, off ("Preview", `text-brand`) | Border rgb(36,33,30) → transparent. Fill rgb(22,20,18) → rgb(33,31,28). Contrast **7.88 → 7.05**; hover (8 %) 6.58. The hover border stays transparent (`hover:border-brand` removed). |
| Preview toggle, on ("Stop", `border-accent text-accent`) | Border rgb(201,164,106) kept (in Obsidian, `accent` = `#c9a46a`). Fill → rgb(33,31,28). Contrast **7.88 → 7.05**; hover 6.58. |
| Add (Export look, R11) | Border brand, kept. Fill rgb(40,35,27) (brand/10) → rgb(33,31,28). Contrast **6.69 → 7.05**; hover 5.48 → **6.58**. |
| Option row (selected `bg-brand/10`), collapse, expand, search clear | Radius only. Colours and contrast are unchanged: 12.56, and 6.68 / hover 13.94 / 14.78. |
| Search field | Radius only. The border rgb(115,107,96) (`border-outline-strong`) and the focus border (brand) are unchanged; 15.62. |
| Fill against its own surface (WCAG 1.4.11, for the record) | 1.12, the spec's known trade-off (GATE167-WCAG-1411-FILL). Not a pass/fail row. |

- **twMerge fact,** checked in node against the installed tailwind-merge with `cn`'s `clsx` + `twMerge`:
  - Appending `'border-accent text-accent'` to the new base drops `border-transparent` and keeps `bg-foreground/5` and the `enabled:hover`/`enabled:active` fills.
  - Appending `'text-brand'` keeps the whole base.

### 0.2 B rulings (D-29z134; all user-vetoable in `feature-status.md`)
- **R1 (same as V-3c-4a/4b). The token set** is copied from the transport `toolButtonClass` (`ArrangementTransport.tsx` l.51):
  - **SURF:** `border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`
  - **FILL** (SURF without `border-transparent`): `bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`
  - **MOTION:** `motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none!`
  - **RADIUS:** `rounded-sm` → `rounded-md` (8 px).
  - Each button keeps its own size, padding, text size, text colour, `font-medium`, focus ring and `disabled:` tokens.
  - The four MOTION tokens are the **only** arbitrary `[...]` values allowed.
- **R9. Preview toggle, off** (`ArrangementLibraryPreview` l.307 base, l.310 off).
  - The base gets SURF + MOTION, and `rounded-sm` → `rounded-md`.
  - Off: `'border-outline text-brand hover:border-brand'` → `'text-brand'`.
  - `hover:border-brand` goes because the spec replaces the border with the fill, so the hover feedback is now the 8 % fill.
  - Side effect: today `hover:border-brand` is a plain `hover:`, so it also tints a **disabled** toggle on hover. After the change, the `enabled:` fills give no hover change while disabled.
- **R10. Preview toggle, on ("Stop")** (l.309).
  - `'border-accent text-accent hover:bg-accent/10'` → `'border-accent text-accent'`.
  - This is **not** the R2 filled on-state: "Stop" has no fill today. It is a coloured outline button, so the R6/Export pattern applies. The accent border and text stay, and the button gains the 5/8/12 fill.
  - `hover:bg-accent/10` is removed. Next to `enabled:hover:bg-foreground/8` it would never apply, because `:enabled:hover` is more specific.
  - Unlike Mute/Solo on (Q-R167-ON-HOVER), Stop **does** give hover and press feedback (8 %/12 %). Reason: it was an outline button, so no fill has to be preserved.
  - The on-state string therefore changes; it is **not** byte-identical, and that is intended.
- **R11. Add takes the Export look** (l.334, a static string, not `cn`).
  - `rounded-sm` → `rounded-md`. `bg-brand/10` → `bg-foreground/5`. `hover:bg-brand/20` → `enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`. Add MOTION.
  - Keep `border border-brand text-brand font-medium`, the flex, gap, padding and `disabled:` tokens.
  - Do **not** add `border-transparent`: this is a static string, so both border colours would sit in one string and CSS order would decide (the same reason as R6).
  - **Why:** the spec defines the primary action as a brand border plus brand text (the Export precedent, C-verified rounds 158–159; R6 applied it to the video import). A brand-tint fill would be a second primary style.
  - **Probe:** contrast improves (6.69 → 7.05; hover 5.48 → 6.58).
  - **Visible change:** the brand-tinted background goes. Saba can veto it from C's 4× crop.
- **R7 (as in V-3c-4b). Borderless buttons: radius only.** No fill and no MOTION are added; they keep the unchanged global transition, as in round 168.
  - Library option rows (l.99, `<button role="option">`, selected `bg-brand/10`).
  - The rail expand button (l.438), the collapse button (l.457), the search clear button (l.482).
  - The 8 px shows on the selected option fill (a 66.5 px-high row) and on the focus rings.
- **R3 (as before). Fields keep their border.** The search input (l.473) changes only `rounded-sm` → `rounded-md`. TH5 locks `border-outline-strong`, and it stays.
- **R12. Not in this slice:**
  - the preview waveform (l.251): a `role=slider` seek surface, not a button or field (same as the 4b range inputs);
  - the tree nodes (`treeNodeClass` l.42–43) and the tree fold buttons (l.534). They have **no radius today** and use the `border-l-2` active stripe, the same category as the lane `border-l-4` in R5'. Adding a radius would change their shape, not round it 6 → 8;
  - the resize handle (l.638, `role=separator`);
  - the preview section's `border-t` divider (l.228).

## 1. What changes (exact; line numbers at `e50498f`)
| ID | File / lines | Change |
|---|---|---|
| P1 | `ArrangementLibraryPreview.tsx` l.307 (toggle base) | `rounded-sm` → `rounded-md`. Add SURF after `border`, and MOTION. `gap-0.75`, `px-2 py-1.5`, `text-sm font-medium`, the focus ring and the `disabled:` tokens stay. |
| P2 | l.309 (toggle on) | `'border-accent text-accent hover:bg-accent/10'` → `'border-accent text-accent'` (R10). |
| P3 | l.310 (toggle off) | `'border-outline text-brand hover:border-brand'` → `'text-brand'` (R9). |
| P4 | l.334 (Add) | R11, exactly. |
| B1 | `ArrangementLibrary.tsx` l.99 (option row base) | `rounded-sm` → `rounded-md` only. The l.100 state strings are unchanged. |
| B2 | l.438 (expand), l.457 (collapse), l.482 (search clear) | `rounded-sm` → `rounded-md` only. |
| B3 | l.473 (search input) | `rounded-sm` → `rounded-md` only. |
| D1 | `docs/implementation/2026/quarter-IV/137-studio-v3c4b-lane-group-button-surfaces.md` | <ul><li>Exactly the status line **l.4** → `**სტატუსი:** Completed (C round 168 PASS; published e50498f)`. This is gate-168 review suggestion 5.</li><li>The l.136 TODO ("C round 168-ის ბრაუზერის მტკიცებულება…") may be struck through in the same edit; nothing else changes.</li></ul> |
| D2 | **new** `docs/implementation/2026/quarter-IV/138-studio-v3c4c1-library-button-surfaces.md` | <ul><li>Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English.</li><li>Contents: R1, R3, R7, R9–R12, the §0.1 probe table, the twMerge fact, the tokens before and after, and the tests and mutations.</li><li>**Known trade-offs:** WCAG 1.4.11 fill vs surface 1.12 (spec decision), and Add losing its brand tint (R11, vetoable).</li><li>TODO: V-3c-4c-2, V-3c-4c-3, V-3c-5, DUX-R-5, M1/M3/M4, and the checkpoint Q1 fallback (c).</li><li>Status: `In Progress (awaiting C round 169)`.</li></ul> |

**Not allowed:**
- `app/styles/**`, any other component, `strings.ts`, `package.json`;
- `style=`, custom CSS, a hex value, a new token, or any arbitrary `[...]` value other than the four MOTION tokens;
- any UI text, icon, size, padding, gap, position, aria, title, `data-*` or `role` change. The class-string edits in §1 are the only allowed string changes;
- any change to handlers, focus, keyboard, drag, preview audio or Add logic;
- a shared constant or component across files (fallback (c)). A file-local constant inside one granted component is also out of scope (class strings only).

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | P1–P4 only (class strings) |
| `app/components/arrangement/ArrangementLibrary.tsx` | B1–B3 only (class strings) |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | Add **LBS1** and **LPS1** in a new describe at the end of the file. Nothing else. LI1, LI2, LI3 and LRS1–LRS5 stay green and unchanged. |
| `docs/…/137-studio-v3c4b-lane-group-button-surfaces.md` | D1 only |
| **new** `docs/…/138-studio-v3c4c1-library-button-surfaces.md` | D2 |

**New locks.** B grepped `app`, `e2e` and `docs` at `e50498f`: `LBS1` and `LPS1` are used nowhere (A-R167-DUP-TEST-IDS). Use the file's own `mountRows()`, `flushAsync()` and `libraryRow()`. Token checks split `className` on whitespace.
- **LPS1, preview surfaces:**
  - **Toggle off ("Preview"):** the tokens include `border`, `border-transparent`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `rounded-md`, the 4 MOTION tokens, `text-brand`, `font-medium`, `gap-0.75` and `disabled:opacity-40`. They exclude `border-outline`, `hover:border-brand` and `rounded-sm`.
  - **Toggle on ("Stop"; select `song` and click the toggle, as LI2 does):** includes `border-accent`, `text-accent`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `rounded-md` and the 4 MOTION tokens. Excludes `border-transparent` (twMerge drops it), `hover:bg-accent/10`, `border-outline` and `rounded-sm`. Click again: the off list holds again.
  - **Add:** includes `border`, `border-brand`, `text-brand`, `font-medium`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `rounded-md`, the 4 MOTION tokens and `disabled:opacity-40`. Excludes `bg-brand/10`, `hover:bg-brand/20`, `border-transparent` and `rounded-sm`.
- **LBS1, library panel radius:**
  - **Option row** (`libraryRow(view, 'song')`): includes `rounded-md`; excludes `rounded-sm`, `bg-foreground/5` and `border-transparent`. After a click it includes `bg-brand/10` (selected).
  - **Collapse:** the same three-token check.
  - **Search clear** (type into the search as LI1 does): the same three-token check.
  - **Expand** (collapse the panel as LI3 does): the same three-token check.
  - **Search input:** includes `rounded-md` and `border-outline-strong`; excludes `rounded-sm`.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `e50498f` stays empty for:
- **Purchase and auth files:** `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`.
- **Shared UI and styles:** `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`.
- **Arrangement code:** `ArrangementContext.tsx`, `ArrangementTransport.tsx`, every other Arrangement component, `strings.ts`, `studio-lab.tsx`, docs 127–136.
- **The frozen neighbour tests in the vitest list:** `library-preview`, `library-focus-handoff`, `library-video-return-focus`, `studio-theme-obsidian`, `render-budget`, `floating-video`, `strings`.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are only for temporary mutations, restored and sha-verified.

**B grep at planning (at `e50498f`):**
- **Class assertions today:**
  - TH5 (`studio-theme-obsidian` l.196–211) asserts `border-outline-strong`, and not `border-outline`, on `arrangement-library-search`. It is kept by R3.
  - LI1, LI2 and LI3 check `flex items-center justify-center` / `gap-0.75` with `arrayContaining`, so they survive.
  - `library-preview.test.tsx` checks the active-lane row only.
- **No test** asserts `rounded-sm`, `border-outline`, `hover:border-brand`, `hover:bg-accent/10`, `bg-brand/10` or `hover:bg-brand/20` on these sites, and no e2e spec references them.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 8 files in `b-round-168-r169-vitest-base.txt`. Expect **163/163**; B ran it at `e50498f` (`b-round-168/out/vitest-base.json`). Save the list as `a-round-169/vitest-files.txt` and the result as `a-round-169/vitest-baseline.json`.
- **After the edits:**
  - Run the same 8 files. Expect 163 plus LBS1 and LPS1, all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 3 code and test files.
- **`expect(` counts:** record them before and after. At `e50498f`, `library-row-strings-ui` has 95; it may only grow.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-169/mutations/`):

  | Mutation | Change | Must turn red |
  |---|---|---|
  | m206 | put `border-outline` back on the toggle-off string | LPS1 |
  | m207 | put `hover:bg-accent/10` back on the toggle-on string | LPS1 |
  | m208 | put `bg-brand/10` back on Add (replace `bg-foreground/5`) | LPS1 |
  | m209 | toggle base `rounded-md` → `rounded-sm` | LPS1 |
  | m210 | option row `rounded-md` → `rounded-sm` | LBS1 |
  | m211 | search input `rounded-md` → `rounded-sm` | LBS1 |
  | m212 | collapse `rounded-md` → `rounded-sm` | LBS1 |

  Do not use a mutant that only removes a MOTION token's `!`. If you add one, report whether it was killed.
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 983 files are OK, and the protected diff vs `e50498f` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant you did not need) + 1 `??` (doc 138), nothing else.
  - Write `a-round-169/end-sha256.txt` (all changed paths + doc 138) and `a-round-169/diff-vs-start.patch` (vs `b-round-168/r169-granted-start/`, plus doc 138 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice.
- One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE).
- Copy the tools you reuse into `c-round-169/tools/`, unchanged: `b-round-168/tools/*`, `b-round-168/v3c4c1-probe*.cjs` and `c-round-168/tools/d6.cjs`. Check the d6 sha256 (`3abc88fe…`).
- B's probe has the P0–P3 state recipes, site selectors and a canvas colour parse (Tailwind v4 emits oklab).
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T169-TARGETED | Re-run `a-round-169/vitest-files.txt`. The counts equal A's, and LBS1, LPS1, LI1–LI3 and TH5 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `e50498f`.</li><li>The frozen 983 files are OK at start and at end.</li><li>The end hashes equal `a-round-169/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` + doc 138 as `??`, nothing else.</li><li>The protected diff vs `e50498f` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-168/r169-granted-start/` itself:<ul><li>Each component changes only its §1 IDs, as class tokens only.</li><li>The toggle on and off strings match R9/R10 exactly.</li><li>Add matches R11 exactly: no `border-transparent`; `font-medium` kept.</li><li>B1–B3 change only the radius.</li><li>The only arbitrary values are the 4 MOTION tokens.</li><li>No text, aria, role, title, handler, size, gap or padding token changed.</li><li>The test file only adds LBS1 and LPS1 (0 removed lines). Count `expect(`; it must not drop.</li><li>Doc 137 changes only l.4 (and the l.136 TODO, if A used that allowance). Doc 138 exists with the D2 sections.</li></ul> |
| SURF-V3C4C1 | Both viewports, states P0–P3 from §0.1.<ul><li>**Toggle (off in P0/P1, on in P2) and Add (P1):** record the computed `border-top-color` (transparent when off; accent or brand on Stop and Add), `border-top-width` 1 px and `border-radius` 8 px. Record the rest background, plus the hover and active backgrounds from a real mouse hover and a held mouse button. Record `transition-property` (includes `background-color` and `color`), duration 0.18 s and timing `cubic-bezier(0.2, 0.8, 0.2, 1)`.</li><li>**Toggle off hover:** the border stays transparent (no brand border).</li><li>**Stop (P2):** hover gives the 8 % fill and press the 12 % fill, with the accent border kept.</li><li>**Disabled state** (informational, not pass/fail): if the toggle or Add can be disabled in `/studio-lab` (for example, no ready source, or Add with the video lane active), record its colours and hover once per viewport. If no such state can be reached, say so.</li><li>**Borderless buttons and rows** (selected option, an unselected option, collapse, expand in P3, search clear in P1): radius 8 px; the colours equal B's `before` values.</li><li>**Search field:** radius 8 px. The border stays rgb(115,107,96) at rest and is brand on focus.</li><li>**Under `reducedMotion: 'reduce'`** (one extra context per viewport): `transition-property` is `none` on the toggle and on Add.</li><li>**4× crops** of the preview buttons (P1, P2), the selected option row (P0) and the search with clear (P1), for R7, R10 and R11.</li><li>Record the fill against its surface once per viewport (B: 1.12). Informational only.</li></ul> |
| BOX-V3C4C1 | Raw `getBoundingClientRect` values (0.01 px) of every SURF-row site in P0–P3 at both viewports, compared with the `before.box` values in `b-round-168/out/v3c4c1-probe.json` (same states, measured at `e50498f`).<ul><li>Expected: 0.00 px on every control.</li><li>The rest of the page is covered by RV1-V3C4C1.</li><li>Any delta > 0.5 px is a finding.</li></ul> |
| CONTRAST-V3C4C1 | <ul><li>Use a real canvas colour parse on the composited background.</li><li>**Toggle off and Stop:** ≥ 4.5:1 at rest (B: 7.05) and on hover (6.58).</li><li>**Add:** ≥ 4.5:1 at rest (B: 7.05) and on hover (6.58).</li><li>**Borderless and rows:** unchanged from `before` (12.56; 6.68 / hover 13.94 / 14.78).</li><li>Any enabled control below 4.5:1 is a finding. Disabled controls are informational (d6 convention).</li></ul> |
| RV1-V3C4C1 | <ul><li>Run the copied `d6.cjs` unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with `c-round-168/out/d6/d6-{1440,1280}-r1.json`. No key renames are expected.</li><li>Expected: 0 missing and 0 added keys, and every x/y/w/h within ±0.5 px.</li><li>Contrast changes are expected only on the toggle and Add (toward about 7.05). The set of failing entries equals the reference set; pre-existing disabled entries may differ by ≤ 0.1.</li><li>A new failing entry, a key change, or any box delta > 0.5 px is a finding.</li></ul> |
| FUNC-SMOKE-V3C4C1 | Each control still does its real action at both viewports, with real mouse clicks at the button centre (`elementFromPoint` must hit the target):<ul><li>**Preview, real audio** (B grep: `startLibraryPreview` uses the shared `ensureAudioContext()`, and `preview.client.ts` l.41 connects its `AudioBufferSourceNode` straight to `ctx.destination`, so the destination tap of round 168 sees it): select a ready option and click Preview. Tap the AudioDestination: the peak rises above 0.01 within 1 s, the button reads "Stop", and the row shows "Playing". Click Stop: the peak falls below 0.001 within 500 ms, and the button reads "Preview".</li><li>**Add:** with an audio lane active, click Add. A new clip of that source appears on the active lane (clip count +1), and Undo removes it. (B grep: `addSourceToActiveTrack` commits through `applyEdit` with the `historyAdd` label, so it is in the undo history.)</li><li>**Option row:** a click selects it (`aria-selected=true`), and a double click adds it.</li><li>**Search:** typing filters the list (the option count changes). The clear button empties the field, restores the list, and focus stays usable.</li><li>**Collapse/expand:** collapse shows the rail and expand restores the panel. The focus hand-off of `library-focus-handoff` holds: focus lands on the opposite toggle.</li></ul> |
| G169-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–168): the transport, toolbar, lane and group header rows, the dock, clip and marker rows, the icon rows, ENV-VIS and OV-CORNERS. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Library preview audio and the Playing marker | FUNC-SMOKE-V3C4C1, T169-TARGETED (`library-preview`, `library-row-strings-ui` LRS1, LI2) |
| Add to the active lane, double-click add, drag | FUNC-SMOKE-V3C4C1, T169-TARGETED |
| Library collapse/expand focus hand-off | FUNC-SMOKE-V3C4C1, T169-TARGETED (`library-focus-handoff`, `library-video-return-focus`) |
| Library layout and the panel width | BOX-V3C4C1, RV1-V3C4C1 |
| Obsidian theme locks (TH5) | T169-TARGETED (`studio-theme-obsidian`) |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Borderless filled Preview/Stop and Add buttons, 8 px radius, hover fill, in the library preview | None used. Source: the user-approved `visual-direction-a.md` § „ღილაკები და ზედაპირები“. No Live 12 manual section was opened for this planning. | Not checked. | **Not applicable; a CZABA brand decision.** Preview, Add, search and collapse behaviour is unchanged, and the look is not claimed to match Live's browser. | Requirement: SURF-V3C4C1, BOX-V3C4C1, CONTRAST-V3C4C1, RV1-V3C4C1, FUNC-SMOKE-V3C4C1. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-169.md`, `a-round-169-result.json` and `a-round-169/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-169.md` and `c-round-169.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the SURF, BOX, CONTRAST and RV1 tables (both viewports). Put tools, out and shots in `c-round-169/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 170 planning)
| Condition | Round 170 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, `npm run test:e2e:smoke`, and the open evidence gap C-R167-METRONOME-UNDER-MUTE. Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on BOX-V3C4C1 (> 0.5 px) or CONTRAST-V3C4C1 (an enabled control < 4.5:1) | A fix-up within R1–R12 using C's measurements, or the site is recorded as a question for Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3c-4c-1's own code and cheap; otherwise `deferred_low_polish`, and V-3c-4c-2 goes ahead. |
| C PASS | Root publishes round 169. V-3c-4c-1 → **მზადაა**. Round 170 = **V-3c-4c-2** (`ArrangementDetailPanel`). If root has answered the checkpoint by then, B applies the answer. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 169: the changed granted paths plus the new doc 138, vs `e50498f`. `app/styles/**`, `strings.ts`, the other Arrangement components and the purchase/auth files are unchanged.
- **Architecture checkpoint:** see `b-round-168-checkpoint-request.md`. The two round-168 reviewers now disagree on timing: A's reviewer says after V-3c-4c, the gate reviewer says before it. This round uses fallback (c) and adds 3 more SURF/FILL copies (toggle, Add).
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - R9/R10: the Preview/Stop toggle loses its outline (off) or keeps its accent outline with the new fill (Stop). Stop gives hover feedback.
  - R11: Add loses its brand-tinted fill and takes the Export look.
  - R7: option rows and the library icon buttons get 8 px corners.
  - R12: the tree rows and tree fold buttons stay square.
