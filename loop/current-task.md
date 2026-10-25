# CURRENT TASK — Round 168: V-3c-4b — Lane and Group header buttons lose their outline (Mute/Solo → 5 % fill, 8 px radius), the video-import buttons follow the transport Export look, borderless header buttons and the group rename field get 8 px radius only; every box stays at 0 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z133** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c4b_plan_d29z133`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-167.md`, an exact copy of the round-167 `current-task.md` (sha256 `baa7c70047c48e9f…`). Rationale for this round: `b-round-167.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ღილაკები და ზედაპირები“ (l.84–90).
  - On buttons, the `border-outline` border disappears and becomes a `foreground` fill: 5 % at rest, 8 % on hover, 12 % when active. The 1 px border becomes transparent and stays, so the size does not change.
  - The primary action ("Export") keeps a `brand` border and `brand` text.
  - Buttons and fields get an 8 px radius.
  - Motion is `background-color, color 180ms cubic-bezier(.2,.8,.2,1)`, off under reduced motion.
  - The spec is source material only and grants no permissions.
- **User decision files:** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` are unchanged since round 164 planning. Nothing in them changes this stage.

## Baseline = HEAD `1fef377`, clean tree (gate 167 published)
- `gates/gate-round-167.json`: status `published`, commit `1fef3770879b34d6633e26e8f3a01a83742d7f78`, on both remotes.
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **986** files.
- **Frozen list:** `b-round-167-r168-tree-sha256.txt`, **980 entries** (986 minus the 6 grants).
- **Grants:** `b-round-167-r168-grants.txt` (6 existing files). **New file:** `b-round-167-r168-new-files.txt` (1: doc 137).
- **Start hashes:** `b-round-167-r168-granted-start-sha256.txt`. **Start copies:** `b-round-167/r168-granted-start/`.
- **Line numbers:** gate 167's `paths` did not include `ArrangementLane.tsx` or `ArrangementGroupHeader.tsx`. B re-grepped both at `1fef377`, and the inventory line numbers from `330f1f3` still hold. They are listed in §1.
- **A's first step:** check that HEAD = `1fef377`, the tree is clean, the 980 frozen files match (`sha256sum -c --quiet`) and the 6 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z133)
- **Round 167: C PASS.** `browserVerified` and `realVerified` are true, with 0 bugs. Root published `1fef377`; the gate review scored 8/10 with nothing blocking. **V-3c-4a → მზადაა.**
- **The outcome was fixed in advance** (`tasks/round-167.md` §7, "C PASS" row): round 168 = **V-3c-4b**, the Lane and Group header buttons. The line inventory is in `backlog.json` `v3c4a_plan_d29z132.v3c4_inventory`.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.
  - **C round 167 bugs:** none.
- **Checkpoint:** the frontend-architect checkpoint (`b-round-160-checkpoint-request.md`, addendum `b-round-165-checkpoint-request.md`, repeated in `b-round-166-checkpoint-request.md`) is still unanswered. As written in advance, B applies **fallback (c)**: the class copies stay in each component, and tests lock them. There is no shared constant and no `ToolButton` component.
  - Both round-167 reviewers now count 7 copies of the recipe in 5 files. This round adds the Lane and Group copies.
  - B updated the request in `b-round-167-checkpoint-request.md`. It does not block this round.

### 0.1 B evidence: browser probe (planning data, not C rows)
`b-round-167/v3c4b-probe.cjs` → `out/v3c4b-probe.json` (S0–S4) and `out/v3c4b-probe-S2.json` (re-run of S2), plus png. **The S2 block inside `v3c4b-probe.json` is superseded and must not be used.** That run's recipe collapsed the group, so group Solo was not mixed. `v3c4b-probe-S2.json` comes from the fixed script now on disk. Group rename is in the undo history (`track-groups-ui` asserts the undo label `Rename Group`). Real Chromium on `/studio-lab` at `1fef377`, at 1440×900 and 1280×720.
- **Method:** the class swap below is applied in the live DOM. Every class it uses is already compiled by the transport recipe.
- **States:**
  - **S0:** default. No group exists, and the video lane is unfolded, so the full "Your own video" import button shows.
  - **S1:** a group made from stems + SFX (click the stems name, Ctrl+click the SFX name, Ctrl+G); music Mute on and Solo on; group Mute on; video lane folded, so the compact import button shows.
  - **S2:** the same group, with the stems lane soloed. Group Solo is `aria-pressed="mixed"`.
  - **S3:** the same group, with group Solo on.
  - **S4:** the group rename field open (focus the group name, press F2).

| Measure | Result (identical at 1440 and 1280) |
|---|---|
| Layout: every `button, a, input, select, [data-testid], [role]` box | **max 0.000 px**, 0 added, 0 missing, in all 5 states. The restore check is also 0. |
| Radius | 6 px → 8 px on every site |
| Lane Mute/Solo off (muted text on the composited fill) | **6.68 → 5.98** (fill rgb(33,31,28) on the lane header surface rgb(22,20,18)); hover 12.35 |
| Group Mute/Solo off | **6.30 → 5.57** (fill rgb(40,37,33) on the group header rgb(29,26,23)); hover 11.46 |
| Lane/Group Mute and Solo on | 8.32, unchanged; hover keeps the on-fill |
| Group Solo mixed (S2) | Rest is unchanged (bg-color rgb(29,26,23) under the gradient, 13.94). Hover 8 % gives rgb(46,42,38), 11.46. |
| Video import, full and compact (brand text on the 5 % fill) | **7.88 → 7.05**; hover (8 %) 6.58 |
| Borderless buttons (lane fold, name, pan reset; group fold, name) | Radius only. Colours and contrast are unchanged (6.68 / 14.78 / 6.68; 6.30 / 9.57). |
| Group rename field (S4) | Radius only; `border-brand` rgb(201,164,106) is unchanged; 15.62 |
| Fill against its own surface (WCAG 1.4.11, for the record) | 1.12 (lane) / 1.13 (group). This is the spec's known trade-off, the same as V-3c-4a. It is not a pass/fail row. |

- **twMerge fact, checked in node against the installed `tailwind-merge` 3.4.0:** `twMerge('bg-foreground/5', 'bg-gradient-to-r')` returns `bg-gradient-to-r`. tailwind-merge drops the base `bg-foreground/5` when the mixed Solo string adds `bg-gradient-to-r`. It keeps `enabled:hover:bg-foreground/8` and `enabled:active:bg-foreground/12`, because those have a different variant. The probe's mixed state reproduces this. That is the basis of R8.

### 0.2 B rulings (D-29z133; all user-vetoable in `feature-status.md`)
- **R1 (same as V-3c-4a). The token set** is copied from the transport `toolButtonClass` (`ArrangementTransport.tsx` l.51), and **only these tokens** are copied:
  - **SURF:** `border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`
  - **MOTION:** `motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none!`
  - **RADIUS:** `rounded-sm` → `rounded-md` (8 px).
  - Each button keeps its own size, padding, text size, text colour, `hover:text-*`, `font-medium`, `before:content-*` and focus ring.
  - The four MOTION tokens are the **only** arbitrary `[...]` values allowed in this round.
- **R2 (same as V-3c-4a). On-state strings stay byte-identical**, and the same hover/active fill is appended so that hover does not replace the on-fill:
  - Lane Mute on and group Mute on: `'border-accent bg-accent text-background enabled:hover:bg-accent enabled:active:bg-accent'`.
  - Lane Solo on and group Solo on: `'border-brand bg-brand text-brand-foreground enabled:hover:bg-brand enabled:active:bg-brand'`.
  - The gate-167 reviewer pointed out that on-state buttons then give no hover feedback. That is this ruling's trade-off. It is recorded as the Saba question **Q-R167-ON-HOVER**, not as a bug.
- **R6. The video-import buttons follow the Export precedent** (spec l.87; `ArrangementTransport.tsx` l.339 `cn(toolButtonClass, 'border-brand font-medium text-brand')`, verified by C in rounds 158–159).
  - Both import buttons (compact l.723, full l.731): `rounded-sm` → `rounded-md`. Keep `border border-brand text-brand`. Replace `hover:bg-brand/10` with `bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`, and add MOTION.
  - Do **not** add `border-transparent`. These are static strings, not `cn`, so both border colours would be in one string and CSS order would decide.
  - `hover:bg-brand/10` is removed, not kept. Next to `enabled:hover:bg-foreground/8` it would never apply, because `enabled:hover:` is more specific.
  - `font-medium` is **not** added; text weight is unchanged.
  - The full button keeps `flex items-center gap-1`, and the compact button keeps `flex h-5 w-5 items-center justify-center` (LV1 asserts both).
  - **Why this and not "radius only":** the inventory's placeholder said "radius only + motion". The Export look is already approved in the spec and verified by C. A brand outline with no fill would be a second primary-button style in the same UI.
- **R7. Borderless buttons: radius only.** The spec's fill replaces a `border-outline` border. These buttons have no border, so no fill is added. The 8 px radius applies because they are buttons; it shows on the focus ring and on the selected-name fill.
  - Lane fold (l.685), lane name (l.697, `bg-brand/20` when selected), lane pan reset (l.779), group fold (l.226), group name (l.269, `hover:bg-surface` / `bg-brand/20`).
  - The lane name and the 16 px-high pan reset become rounder: the selected name fill gets 8 px ends on a 20 px height. This is the R4 literal-spec precedent from V-3c-4a. C records 4× crops so Saba can veto it.
  - Contrast with round 166: there the exit *link* was excluded. Links stay out; buttons are in.
- **R8. The group's mixed Solo string stays byte-identical** (`'border-brand bg-gradient-to-r from-brand from-50% to-transparent to-50% text-foreground'`; UM4 asserts `from-brand`).
  - Because of the twMerge fact in §0.1, the mixed state has no 5 % rest fill. Its rest look is pixel-identical to `1fef377`: the left half is brand, and the right half is the bare group surface.
  - On hover and press, the right half shows the 8 % / 12 % fill, so it gives feedback. No append is needed.
  - Adding `bg-foreground/5` to the mixed string to force a rest fill was rejected. It would change a string that UM4 relies on, for a 1.13:1 difference.
- **R3 (same as V-3c-4a). Fields keep their border.** The group rename input (l.252) changes only `rounded-sm` → `rounded-md`. `border-brand` stays.
- **R5'. Not in this slice:**
  - the Lane move/trim ghosts and their label chips (l.884, l.900, l.920, l.934). They are `pointer-events-none` overlays, not buttons, and TH10 counts the l.920 string;
  - the group overview blocks (`ArrangementGroupHeader` l.352);
  - the volume and pan range inputs (sliders, not text fields);
  - row dividers and the header's `border-l-4` active stripe.

## 1. What changes (exact; line numbers at `1fef377`)
| ID | File / lines | Change |
|---|---|---|
| L1 | `ArrangementLane.tsx` l.613 (Mute base) and l.616 (Mute off) | <ul><li>Base: `rounded-sm` → `rounded-md`; add SURF and MOTION. `h-6 w-6` stay adjacent (UM1-style check).</li><li>Off: `'border-outline text-muted hover:text-foreground'` → `'text-muted hover:text-foreground'`.</li></ul> |
| L2 | `ArrangementLane.tsx` l.615 (Mute on) | Append `enabled:hover:bg-accent enabled:active:bg-accent` (R2). |
| L3 | `ArrangementLane.tsx` l.631, l.633, l.634 (Solo) | The same as L1 for the base and off strings. On: append `enabled:hover:bg-brand enabled:active:bg-brand`. |
| L4 | `ArrangementLane.tsx` l.723 (compact import), l.731 (full import) | R6. |
| L5 | `ArrangementLane.tsx` l.685 (fold), l.697 (name), l.779 (pan reset) | Only `rounded-sm` → `rounded-md` (R7). |
| G1 | `ArrangementGroupHeader.tsx` l.36–37 (`TRACK_GROUP_MIX_BUTTON_CLASS`) | <ul><li>`rounded-sm` → `rounded-md`, and add SURF + MOTION **after** `leading-none`.</li><li>The substring `rounded-md border text-xs font-medium leading-none` must stay contiguous, because TH10 (G-TH below) counts it.</li><li>Keep `h-6 w-6` adjacent.</li></ul> |
| G2 | `ArrangementGroupHeader.tsx` l.288–289 (group Mute) | Off: `'text-muted hover:text-foreground'`. On: append `enabled:hover:bg-accent enabled:active:bg-accent`. |
| G3 | `ArrangementGroupHeader.tsx` l.303–306 (group Solo) | On: append `enabled:hover:bg-brand enabled:active:bg-brand`. Off: `'text-muted hover:text-foreground'`. Mixed: byte-identical (R8). |
| G4 | `ArrangementGroupHeader.tsx` l.226 (fold), l.269 (name), l.252 (rename input) | Only `rounded-sm` → `rounded-md` (R7, R3). |
| G-TH | `studio-theme-obsidian.test.tsx` l.448, inside TH10 | Exactly one value: `after: 'rounded-sm border text-xs font-medium leading-none'` → `after: 'rounded-md border text-xs font-medium leading-none'`. The `before` value on l.449 and everything else in the file stay unchanged. |
| D1 | `docs/implementation/2026/quarter-IV/136-studio-v3c4a-toolbar-button-surfaces.md` | <ul><li>Exactly the status line **l.4** → `**სტატუსი:** Completed (C round 167 PASS; published 1fef377)`. This is gate-167 review suggestion 5.</li><li>The l.135 TODO ("C round 167-ის ბრაუზერის მტკიცებულება…") may be marked done in the same edit; nothing else changes.</li></ul> |
| D2 | **new** `docs/implementation/2026/quarter-IV/137-studio-v3c4b-lane-group-button-surfaces.md` | <ul><li>Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English.</li><li>Contents: R1–R3 and R5'–R8, the §0.1 probe table, the twMerge fact, the token sets before and after, and the tests and mutations.</li><li>**Known trade-offs:** the WCAG 1.4.11 fill-vs-surface ratio of 1.12–1.13 (spec decision), and Q-R167-ON-HOVER.</li><li>TODO: V-3c-4c, V-3c-5, DUX-R-5, M1/M3/M4, and the checkpoint Q1 fallback (c).</li><li>Status: `In Progress (awaiting C round 168)`.</li></ul> |

**Not allowed:**
- `app/styles/**`, `ArrangementTransport.tsx`, any other component, `package.json`;
- `style=`, custom CSS, a hex value, a new token, or any arbitrary `[...]` value other than the four MOTION tokens;
- any UI text (`strings.ts`, JSX text, `before:content-*`), icon, size, padding, gap, position, aria, title or `data-*` change. The class-string edits in §1 are the only allowed string changes;
- any change to handlers, focus, keyboard or audio logic;
- a shared constant or component across files (fallback (c)).

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | L1–L5 only (class strings) |
| `app/components/arrangement/ArrangementGroupHeader.tsx` | G1–G4 only (class strings) |
| `app/lib/arrangement/__tests__/lane-strings-ui.test.tsx` | Add **LSU7**. Nothing else. LV1 stays green and unchanged. |
| `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx` | Add **UM11**. Nothing else. UM1 and UM4 stay green and unchanged. |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | **G-TH only** (one string value on l.448) |
| `docs/…/136-studio-v3c4a-toolbar-button-surfaces.md` | D1 only |
| **new** `docs/…/137-studio-v3c4b-lane-group-button-surfaces.md` | D2 |

**New locks.** B grepped every test file at `1fef377`: `LSU7` and `UM11` are used nowhere else. Use each file's existing mount helper (`mountLaneStringsWorkspace`, `mountMixWorkspace` + `groupRows`). Token checks split `className` on whitespace.
- **LSU7, Lane header surfaces** (in lane-strings-ui; the music lane unless stated):
  - **Mute and Solo, off:** the tokens include `border`, `border-transparent`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `rounded-md`, the 4 MOTION tokens, `text-muted`, `hover:text-foreground`, `h-6`, `w-6` and `font-medium`. They exclude `border-outline` and `rounded-sm`.
  - **Mute on** (click it): includes `border-accent`, `bg-accent`, `text-background`, `enabled:hover:bg-accent` and `enabled:active:bg-accent`. Excludes `bg-foreground/5`, `border-transparent` and `enabled:hover:bg-foreground/8` (twMerge drops them). `aria-pressed` is `true`.
  - **Solo on** (click it): includes `border-brand`, `bg-brand`, `text-brand-foreground`, `enabled:hover:bg-brand` and `enabled:active:bg-brand`. It has the same three exclusions as Mute on.
  - **Video import, full** (unfolded video lane): includes `border`, `border-brand`, `text-brand`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `rounded-md`, the 4 MOTION tokens, `flex`, `items-center` and `gap-1`. Excludes `hover:bg-brand/10`, `border-transparent`, `rounded-sm` and `font-medium`.
  - **Video import, compact** (fold the video lane as LV1 does): the same includes and excludes, plus `h-5`, `w-5` and `justify-center`.
  - **Fold, name and pan reset:** each includes `rounded-md` and excludes `rounded-sm`, `bg-foreground/5` and `border-transparent`.
- **UM11, Group header surfaces** (in track-group-mix-ui; group stems + SFX as UM1 does):
  - **Group Mute and Solo, off:** the same includes and excludes as LSU7 off, plus `before:content-['M']` / `before:content-['S']` and `leading-none`. `mute.className` contains the contiguous substring `rounded-md border text-xs font-medium leading-none`.
  - **Group Mute on:** the same as the LSU7 Mute-on lists. `data-mute="on"`.
  - **Group Solo on:** the same as the LSU7 Solo-on lists. `data-solo="on"`.
  - **Group Solo mixed** (produce it as UM4 does): includes `border-brand`, `bg-gradient-to-r`, `from-brand`, `enabled:hover:bg-foreground/8` and `enabled:active:bg-foreground/12`. Excludes `bg-foreground/5`, `border-transparent` and `border-outline`. `data-solo="mixed"`.
  - **Group fold and name:** each includes `rounded-md` and excludes `rounded-sm` and `bg-foreground/5`.
  - **Rename input** (focus the group name, press F2): includes `rounded-md` and `border-brand`, and excludes `rounded-sm`.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `1fef377` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `ArrangementContext.tsx`, `ArrangementTransport.tsx`, every other Arrangement component, `strings.ts`, `studio-lab.tsx`, docs 127–135;
- the frozen neighbour tests in the vitest list: `track-group-collapse-ui`, `track-groups-ui`, `track-layout`, `track-pan`, `header-meter-envelope-strings-ui`, `track-meter-ui`, `fader-guards`, `gesture-guard`, `video-fades-ui`.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are only for temporary mutations, restored and sha-verified.

**B grep at planning (at `1fef377`):**
- **Class assertions today:**
  - TH10 (`studio-theme-obsidian` l.349, l.446–450) counts the group mix class substring. That is why G-TH is granted.
  - TH10 also counts the Lane move-ghost string at l.920. It is not touched (R5').
  - UM1 checks `h-6 w-6` and `before:content-*`, and UM4 checks `from-brand`.
  - LV1 checks the import buttons' `flex items-center gap-1` / `h-5 w-5 justify-center` with `arrayContaining`.
  - `track-group-collapse-ui` l.1051–1052 checks the group name's `gap-1.25`.
- **No test** asserts `border-outline`, `rounded-sm` or `hover:bg-brand/10` on these sites, and no e2e spec references them.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 12 files in `b-round-167-r168-vitest-base.txt`. Expect **249/249**; B ran it at `1fef377` (`b-round-167/out/vitest-base.json`). Save the list as `a-round-168/vitest-files.txt` and the result as `a-round-168/vitest-baseline.json`.
- **After the edits:**
  - Run the same 12 files. Expect 249 plus LSU7 and UM11, all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 5 code and test files.
- **`expect(` counts:** record them per granted test file, before and after. At `1fef377` they are lane-strings-ui 45, track-group-mix-ui 131 and studio-theme-obsidian 76 (must stay 76). A drop needs a reason.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-168/mutations/`):
  - **m199:** Lane Mute off string gets `border-outline` back. LSU7 turns red.
  - **m200:** drop `enabled:hover:bg-brand` from the Lane Solo on string. LSU7 turns red.
  - **m201:** put `hover:bg-brand/10` back on the full import button. LSU7 turns red.
  - **m202:** Lane fold `rounded-md` → `rounded-sm`. LSU7 turns red.
  - **m203:** `TRACK_GROUP_MIX_BUTTON_CLASS` `rounded-md` → `rounded-sm`. UM11 **and** TH10 turn red.
  - **m204:** drop `bg-gradient-to-r` from the mixed Solo string. UM11 turns red.
  - **m205:** group rename input `rounded-md` → `rounded-sm`. UM11 turns red.
  - Do not use a mutant that only removes a MOTION token's `!`. It may be equivalent in jsdom; if you add one, report whether it was killed.
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 980 files are OK, and the protected diff vs `1fef377` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant not needed) + 1 `??` (doc 137), nothing else.
  - Write `a-round-168/end-sha256.txt` (all changed paths + doc 137) and `a-round-168/diff-vs-start.patch` (vs `b-round-167/r168-granted-start/`, plus doc 137 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice.
- One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE).
- Copy the tools you reuse (`b-round-167/tools/*`, `c-round-167/tools/d6.cjs`) unchanged into `c-round-168/tools/` and check the d6 sha256 (`3abc88fe…`).
- B's probe is `b-round-167/v3c4b-probe.cjs`. Its `measureSites` uses a canvas colour parse, because Tailwind v4 emits oklab. Its S0–S4 state recipes and site selectors are reusable.
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T168-TARGETED | Re-run `a-round-168/vitest-files.txt`. The counts equal A's, and LSU7, UM11 and TH10 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `1fef377`.</li><li>The frozen 980 files are OK at start and at end.</li><li>The end hashes equal `a-round-168/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` plus doc 137 as `??`, nothing else.</li><li>The protected diff vs `1fef377` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-167/r168-granted-start/` itself:<ul><li>Each component changes only its §1 IDs, as class tokens only.</li><li>The on-state strings are byte-identical apart from the R2 appends, and the mixed Solo string is byte-identical.</li><li>The import buttons match R6 exactly: `hover:bg-brand/10` removed, no `border-transparent`, no `font-medium`.</li><li>The only arbitrary values are the 4 MOTION tokens.</li><li>No text, aria, title, `before:content`, handler, size, gap or padding token changed.</li><li>`studio-theme-obsidian.test.tsx` changes exactly one string value (G-TH).</li><li>The other test files only add LSU7 and UM11. Count `expect(` per file; a drop needs a reason.</li><li>Doc 136 changes only l.4 (and the l.135 TODO if A used that allowance), and doc 137 exists with the D2 sections.</li></ul> |
| SURF-V3C4B | Both viewports, in states S0–S4 from §0.1.<ul><li>**Buttons** (lane music Mute and Solo, an off lane Mute, both video-import buttons, group Mute and Solo): record the computed `border-top-color` (transparent when off; accent or brand when on; brand on import), `border-top-width` 1 px, `border-radius` 8 px, the `background-color` at rest, the hover and active backgrounds (from a real mouse hover and a held mouse button), `transition-property` (includes `background-color` and `color`), `transition-duration` 0.18 s and the timing function `cubic-bezier(0.2, 0.8, 0.2, 1)`.</li><li>**On-states** (S1, S3): hover and active keep the on-fill (`bg-accent` / `bg-brand`).</li><li>**Mixed Solo (S2):** its rest `background-color` and `background-image` equal B's `before` values (rgb(29,26,23) under the brand gradient). Hover makes the right half the 8 % fill. Sample one pixel in the right quarter of the button from a screenshot at rest and on hover, and record both.</li><li>**Borderless buttons** (lane fold, name, pan reset; group fold, name): radius 8 px, and the colours equal B's `before` values.</li><li>**Rename field (S4):** radius 8 px; the border stays rgb(201,164,106).</li><li>**Under `reducedMotion: 'reduce'`** (one extra context per viewport): `transition-property` is `none` on at least the lane Mute, the group Solo and the full import button.</li><li>**4× crops** of the lane header (S0, S1), the group header (S1, S2, S3) and both import buttons, for R6 and R7.</li><li>Record, once per viewport, the 5 % fill against its surface (B: 1.12 / 1.13). This is informational, not pass/fail.</li></ul> |
| BOX-V3C4B | Raw `getBoundingClientRect` values (0.01 px) of every SURF site in S0–S4 at both viewports, compared with the `before.box` values in `b-round-167/out/v3c4b-probe.json` (S2 from `v3c4b-probe-S2.json`), measured at `1fef377` in the same states.<ul><li>**Expected:** 0.00 px on every control.</li><li>The rest of the page is covered by RV1-V3C4B.</li><li>Any delta > 0.5 px is a finding.</li></ul> |
| CONTRAST-V3C4B | <ul><li>Measure contrast on the composited background with a real canvas colour parse; do not regex-parse `rgb()`.</li><li>**Off-state text at rest:** ≥ 4.5:1 (B predicts 5.98 lane / 5.57 group). **On hover:** ≥ 4.5:1 (12.35 / 11.46). **On-states:** ≥ 4.5:1 (8.32).</li><li>**Import buttons:** brand text ≥ 4.5:1 at rest (B: 7.05) and on hover (6.58).</li><li>**Mixed Solo:** report the ratio on the right-half colour at rest and on hover.</li><li>Any enabled control below 4.5:1 is a finding.</li></ul> |
| RV1-V3C4B | <ul><li>Run the copied `d6.cjs` (sha256 `3abc88fe…`) unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with **`c-round-167/out/d6/d6-{1440,1280}-r1.json`**. **No key renames** are expected; this round is class-only.</li><li>Expected: 0 missing and 0 added keys, and every x/y/w/h within ±0.5 px.</li><li>Contrast entries for the converted lane buttons may drop because of the composited fill (to about 5.98). Every enabled entry stays at or above its d6 threshold. The set of failing entries equals the reference set; pre-existing disabled entries may differ by ≤ 0.1 in ratio.</li><li>A new failing entry, a key change, or any box delta > 0.5 px is a finding.</li></ul> |
| FUNC-SMOKE-V3C4B | Each control still does its real action at both viewports, with real mouse clicks at the button centre (`elementFromPoint` must hit the target):<ul><li>**Lane Mute, real audio:** play the demo. Mute the lane(s) that carry it: the tap peak falls below 0.001 within 500 ms. Unmute: the peak returns above 0. `aria-pressed` flips each time.</li><li>**Lane Solo, real audio:** Solo an empty lane: the demo lane is silenced (peak < 0.001). Ctrl+click Solo on the demo lane adds it (peak > 0). Clear the solos.</li><li>**Group Mute and Solo, real audio:** group lanes that carry the demo (or move the demo onto stems/SFX first). Group Mute silences them (peak < 0.001) and unmuting restores them. Solo one member: group Solo shows mixed (`aria-pressed="mixed"`). Click group Solo: `on`.</li><li>**Video import:** click the full button. A file chooser opens (Playwright `filechooser` event). Pick a real video from `media/`: a video clip appears on the video lane, and the dock shows a frame. Fold the video lane and click the compact button: the file chooser opens again.</li><li>**Fold:** clicking the lane fold and the group fold toggles `aria-expanded`.</li><li>**Name:** clicking the music name makes it active (`aria-pressed=true`); Ctrl+click another adds it to the selection.</li><li>**Pan reset:** move the music pan (keyboard on the slider), then click the reset readout: it shows `C`, and the button becomes disabled.</li><li>**Rename:** F2 on the group name, type a name, Enter: the group shows the new name. Undo restores the old name.</li></ul> |
| G168-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–167): the transport rows, the V-3c-4a toolbar rows, the dock, clip and library rows, the icon rows of rounds 162–166, ENV-VIS, OV-CORNERS and the MK-* rows. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Lane Mute/Solo, the mix model and its shortcuts | FUNC-SMOKE-V3C4B, T168-TARGETED (`track-meter-ui`, `fader-guards`, `gesture-guard`) |
| Group Mute/Solo/fold/rename | FUNC-SMOKE-V3C4B, T168-TARGETED (`track-group-mix-ui`, `track-group-collapse-ui`, `track-groups-ui`, `header-meter-envelope-strings-ui`) |
| Video import and the video lane | FUNC-SMOKE-V3C4B, T168-TARGETED (`lane-strings-ui` LV1, `video-fades-ui`) |
| Lane header layout, fold, pan | BOX-V3C4B, RV1-V3C4B, T168-TARGETED (`track-layout`, `track-pan`) |
| Obsidian theme locks (TH10) | T168-TARGETED (`studio-theme-obsidian`) |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Borderless filled Mute/Solo and header buttons, 8 px radius, hover fill | None used. Source: the user-approved `visual-direction-a.md` § „ღილაკები და ზედაპირები“. No Live 12 manual section was opened this planning. | Not checked. | **Not applicable; a CZABA brand decision.** Mute/Solo behaviour, shortcuts and focus are unchanged, and the look is not claimed to match Live. | Requirement: SURF-V3C4B, BOX-V3C4B, CONTRAST-V3C4B, RV1-V3C4B, FUNC-SMOKE-V3C4B. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-168.md`, `a-round-168-result.json` and `a-round-168/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-168.md` and `c-round-168.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the SURF, BOX, CONTRAST and RV1 tables (both viewports). Put tools, out and shots in `c-round-168/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 169 planning)
| Condition | Round 169 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, plus `npm run test:e2e:smoke`. Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on BOX-V3C4B (> 0.5 px) or CONTRAST-V3C4B (an enabled control < 4.5:1) | A fix-up within R1–R8 using C's measurements, or the site is recorded as a question for Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3c-4b's own code and cheap; otherwise `deferred_low_polish`, and V-3c-4c goes ahead. |
| C PASS | Root publishes round 168. V-3c-4b → **მზადაა**. Round 169 = **V-3c-4c**, possibly split by owner if it exceeds the grant limit (Detail panel, Library preview and search, Export dialog, video-dock float buttons; inventory in `backlog.json`). If root has answered the checkpoint by then, B applies the answer to 4c. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 168: the changed granted paths plus the new doc 137, vs `1fef377`. `app/styles/**`, `ArrangementTransport.tsx`, `ArrangementContext.tsx`, `strings.ts`, the other Arrangement components and the purchase/auth files are unchanged.
- **Architecture checkpoint:** see `b-round-167-checkpoint-request.md`. Both round-167 reviewers propose one shared tool-surface constant after V-3c-4c, together with Q2 (dropping the `!` suffixes). That is a proposal, not approved scope. This round uses fallback (c).
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - R1/R2 on the Lane and Group Mute/Solo buttons;
  - R6, the video-import buttons take the Export look (brand border and text, plus the 5 % fill), and the brand hover tint goes;
  - R7, the borderless buttons get 8 px, so the selected track name and the pan readout get rounder ends;
  - R8, the mixed Solo look at rest is unchanged;
  - **Q-R167-ON-HOVER** (from the gate-167 reviewer): on-state buttons give no hover change. An option is a one-step-stronger fill on hover/press.
