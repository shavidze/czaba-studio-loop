# CURRENT TASK — Round 170: V-3c-4c-2 — Clip details panel: the Set selection, 0 dB and Collapse/Expand buttons lose their outline (5 % fill, 8 px); the From/To and Clip Gain fields get 8 px only; every box stays at 0 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z135** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c4c2_plan_d29z135`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-169.md`, an exact copy of the round-169 `current-task.md` (sha256 `5ac812ff044e3289…`, checked with `cmp`). Rationale for this round: `b-round-169.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ღილაკები და ზედაპირები“ (l.84–90). The spec is source material only; it grants no permissions.
  - On buttons, the `border-outline` border goes and is replaced by a `foreground` fill: 5 % at rest, 8 % on hover, 12 % when active. The 1 px border stays but becomes transparent, so the size does not change.
  - Buttons and fields get an 8 px radius.
  - Motion is `background-color, color 180ms cubic-bezier(.2,.8,.2,1)`, and it is off under reduced motion.
- **User decision files:** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` have the same content as at round 169 planning, and every decision in them is already in `backlog.json`. Nothing in them changes this stage.

## Baseline = HEAD `352dc91`, clean tree (gate 169 published)
- **Gate:** `gates/gate-round-169.json` status is `published`, commit `352dc914f6b0f6c05030f9762cc42fd3c2270250`, on both remotes.
- **Tree:** `git status --short` is empty, and `git ls-files -co --exclude-standard` lists **988** files.
- **Frozen list:** `b-round-169-r170-tree-sha256.txt`, **985 entries** (988 minus the 3 grants).
- **Grants:** `b-round-169-r170-grants.txt` (3 existing files).
- **New file:** `b-round-169-r170-new-files.txt` (1 file: doc 139).
- **Start hashes:** `b-round-169-r170-granted-start-sha256.txt`. **Start copies:** `b-round-169/r170-granted-start/`.
- **Line numbers:** B grepped `ArrangementDetailPanel.tsx` at `352dc91`. They are unchanged since the inventory at `330f1f3`.
- **A's first step:** check that HEAD = `352dc91`, the tree is clean, the 985 frozen files match (`sha256sum -c --quiet`) and the 3 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z135)
- **Round 169: C PASS.** `browserVerified` and `realVerified` are true, with 0 bugs. Root published `352dc91`; the gate review scored 9/10 with nothing blocking. **V-3c-4c-1 → მზადაა.**
- **The outcome was fixed in advance** (`tasks/round-169.md` §7, "C PASS" row): round 170 = **V-3c-4c-2** (`ArrangementDetailPanel`).
- **Checks at planning:**
  - **Regression:** `regression-last.json` is 2026-10-24, so the next one is due on or after 2026-10-27. Today is 2026-10-25, so it is not due.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.
  - **C round 169 bugs:** none. Three new Lows went to `deferred_low_polish` (§0.3).
- **Checkpoint:** still unanswered, so fallback (c) applies again: the class copies stay in each component, locked by tests. Pointer: `b-round-169-checkpoint-request.md`. B does not schedule the extraction.
- **The rest of V-3c-4c (nothing dropped):**
  - **V-3c-4c-3** (round 171, unless the regression is due): `ArrangementExportDialog` + `ArrangementVideoDock`, plus the `ArrangementMarkerRow` l.811 chip question.
  - **The framed boxes** at l.221 and l.702 of this file belong to **V-3c-5**.

### 0.1 B evidence: browser probe (planning data, not C rows)
`b-round-169/v3c4c2-probe.cjs` → `out/v3c4c2-probe.json`, with PNGs next to it.
- **Setup:** real Chromium on `/studio-lab` at `352dc91`, at 1440×900 and 1280×720.
- **Method:** the planned class swap (R13 and R3) is applied in the live DOM. Every class it uses is already compiled by earlier stages.
- **States:**
  - **D0:** the Clip details panel is open (expanded first at 1280; see HR-1280-DETAIL-COLLAPSED) and nothing is selected. Set selection, 0 dB and the three fields are disabled.
  - **D1:** the panel is open with one clip selected. The clip is added with the Music track active, playhead at 1 s, `demo-middle-east` focused and Enter (`tools/lib.cjs` `addAt`), then selected with a real header click. Set selection is enabled. 0 dB stays disabled because the clip is at 0 dB.
  - **D2:** the panel is collapsed, and the toggle reads "Expand".

| Measure | Result (1440 and 1280) |
|---|---|
| Layout: every `button, a, input, select, [data-testid], [role]` box | **max 0.000 px**, 0 added, 0 missing, in all 3 states. The restore check is also 0. |
| Radius | 6 px → 8 px on all 6 sites |
| Set selection (enabled, D1), toggle (D0–D2) | Border rgb(36,33,30) → transparent. Fill rgb(22,20,18) → rgb(33,31,28). Contrast **14.78 → 13.24**. Hover (8 % fill + `hover:text-brand`): **6.58**. |
| Set selection (D0) and 0 dB (D0, D1): disabled | Contrast 5.38 → **4.82** (`text-dim` on the 5 % fill). Hover leaves it unchanged, because `disabled:text-dim` wins and the `enabled:` fills are off. Informational only. |
| From, To, Clip Gain fields | Radius only. The border rgb(115,107,96) (`border-outline-strong`) stays. Contrast is unchanged: **15.62** enabled (D1), 5.69 disabled (D0, `text-dim`). |
| Transition after the swap | `background-color, color 0.18s` |
| Fill against its own surface (WCAG 1.4.11, for the record) | 1.12, the spec's known trade-off (GATE167-WCAG-1411-FILL). Not a pass/fail row. |

- **Pre-existing layout fact (not this round's change):** at 1280 the Set selection button is squeezed by the flex column. It measures **18 px** high in D0 and **23 px** in D1, identical before and after the swap. Its reason line is also cut at the panel edge. This is recorded as Low `B-R169-1280-SET-SELECTION-SQUASH` (§0.3). A must **not** fix it this round: any fix moves boxes, and this stage's acceptance is 0 px.

### 0.2 B rulings (D-29z135; all user-vetoable in `feature-status.md`)
- **R1 (same as V-3c-4a/4b/4c-1). The token set** is copied from the transport `toolButtonClass` (`ArrangementTransport.tsx` l.51):
  - **SURF:** `border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`
  - **MOTION:** `motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none!`
  - **RADIUS:** `rounded-sm` → `rounded-md` (8 px).
  - **Each button keeps** its own size, padding, text colour, **hover text** (`hover:text-brand`), focus ring and disabled cue (`disabled:text-dim`). This follows the V-3c-4a R1 precedent: `ArrangementMarkerRow` l.51 kept `hover:text-foreground`.
  - `disabled:opacity-40` is **not** added.
  - The four MOTION tokens are the **only** arbitrary `[...]` values allowed.
- **R13. The three outline buttons** become SURF buttons. All three are static strings, so each keeps exactly one border colour: `border-outline` is replaced by `border-transparent`.
  - **Set selection** (`arrangement-detail-apply`, l.752).
  - **0 dB reset** (`arrangement-detail-clip-gain-reset`, l.861). `font-mono` stays (TH10 l.405 asserts it).
  - **Header toggle** (`arrangement-detail-toggle`, l.1142). `inline-flex items-center gap-0.5 pl-2 pr-1` stays (DPS5 asserts them and asserts that `px-2` is absent). It has no `disabled` state, so the `enabled:` fills always apply.
- **R3 (as before). Fields keep their border.** `inputClass` (l.640) changes only `rounded-sm` → `rounded-md`. It is used by From (`arrangement-detail-start`), To (`arrangement-detail-end`) and Clip Gain (`arrangement-detail-clip-gain-input`).
  - `border-outline-strong` stays. TH5 locks it on all three fields.
  - The pending `cn(inputClass, 'shrink-0', … 'border-warning focus-visible:ring-warning')` is unchanged:
    - twMerge still replaces `border-outline-strong` with `border-warning`;
    - `pending-status` PM1/PM2 still pass, and PM2's `toContain('border-outline')` is satisfied by `border-outline-strong`;
    - `detail-panel-fit` F4 still passes.
  - Do not "fix" any of these.
- **R14. Not in this slice:**
  - the video/waveform framed box (l.221), which goes to V-3c-5. Its exact string is locked by `detail-panel-polish` l.128 (`WAVEFORM_BOX_CLASS`);
  - the group-reason framed box (l.702), which goes to V-3c-5;
  - the Clip Gain fader (l.841): a range input, the same category as the V-3c-4b range inputs;
  - the resize handle (l.1121, `role=separator`);
  - the panel `border-t` (l.1095) and the header `border-b` (l.1124): these are dividers.

### 0.3 Backlog bookkeeping this planning (no app work)
These three Lows went to `deferred_low_polish`. None is in this round's scope:
- **C-R169-N1-SEARCH-DOUBLE-RING:** the library search shows two focus rings. The likely owner is `app/styles/app.css`, which is protected.
- **GATE169-TEST-HYGIENE-LIBRARY-STRINGS:** test hygiene in `library-row-strings-ui`.
- **B-R169-1280-SET-SELECTION-SQUASH:** see §0.1.

## 1. What changes (exact; line numbers at `352dc91`)
| ID | File / lines | Change |
|---|---|---|
| S1 | `ArrangementDetailPanel.tsx` l.752 (Set selection) | `rounded-sm` → `rounded-md`; `border-outline` → `border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`; add MOTION. Everything else stays: `h-6 w-fit border px-2 text-foreground hover:text-brand`, the focus ring, `disabled:text-dim`. |
| S2 | l.861 (0 dB reset) | Same as S1. `font-mono` stays. |
| S3 | l.1142 (header toggle) | Same as S1. `inline-flex h-6 shrink-0 items-center gap-0.5 pl-2 pr-1` stays. |
| F1 | l.640 (`inputClass`) | `rounded-sm` → `rounded-md` only. |
| D1 | `docs/implementation/2026/quarter-IV/138-studio-v3c4c1-library-button-surfaces.md` | Change the status line **l.4** to exactly `**სტატუსი:** Completed (C round 169 PASS; published 352dc91)` (gate-169 review suggestion 1). The l.126 TODO ("C round 169-ის ბრაუზერის მტკიცებულება…") may be struck through in the same edit. Nothing else changes. |
| D2 | **new** `docs/implementation/2026/quarter-IV/139-studio-v3c4c2-detail-panel-button-surfaces.md` | See below. |

**D2 content:**
- Follow `docs/implementation/TEMPLATE.md`, in Georgian, with technical terms in English.
- Contents: R1, R3, R13, R14, the §0.1 probe table, the tokens before and after, and the tests and mutations.
- **Known trade-offs:**
  - WCAG 1.4.11: the fill against its surface is 1.12 (a spec decision).
  - The disabled contrast drops 5.38 → 4.82, still at least 4.5.
  - The 1280 squeeze (B-R169-1280-SET-SELECTION-SQUASH) is pre-existing and deferred.
- **TODO:** V-3c-4c-3, V-3c-5 (including the l.221/l.702 framed boxes), DUX-R-5, M1/M3/M4, and the checkpoint Q1 fallback (c).
- **Status:** `In Progress (awaiting C round 170)`.

**Not allowed:**
- `app/styles/**`, any other component, `strings.ts`, `package.json`.
- `style=`, custom CSS, a hex value, a new token, or any arbitrary `[...]` value other than the four MOTION tokens.
- Any UI text, icon, size, padding, gap, position, aria, title, `data-*` or `role` change. The class-string edits in §1 are the only string changes allowed.
- Any change to handlers, focus, keyboard (including the toggle's Space handler), the fader, Clip Gain commit/reset logic, or range logic.
- A shared constant or component across files (fallback (c)). A file-local constant is also out of scope: edit class strings only.
- Fixing B-R169-1280-SET-SELECTION-SQUASH (`shrink-0`, height) or the l.221/l.702 boxes.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | S1–S3 and F1 only (class strings) |
| `app/lib/arrangement/__tests__/detail-panel-strings-ui.test.tsx` | Add **DSU1** and **DFR1** in a new describe at the end of the file. Put any helper **inside** that describe (this answers gate-169 suggestion 3 / A-169 note 2). Unmount in an `afterEach` or a `try/finally`, so a failing assertion still unmounts. Nothing else changes. DPS1–DPS5 stay green and unchanged. |
| `docs/…/138-studio-v3c4c1-library-button-surfaces.md` | D1 only |
| **new** `docs/…/139-studio-v3c4c2-detail-panel-button-surfaces.md` | D2 |

**New locks.** B grepped `app`, `e2e` and `docs` at `352dc91`: `DSU1` and `DFR1` are used nowhere (A-R167-DUP-TEST-IDS). Use the file's own `mountStringsWorkspace()`, `openDetailPanel()`, `detailInputByTestId()` and `live(api).selectClip('music-1')` (as DPS2 does). Token checks split `className` on whitespace.
- **DSU1, Detail button surfaces.** Check each of these:
  - Set selection, with `music-1` selected and the panel open.
  - 0 dB reset, in the same state.
  - The toggle, both expanded and collapsed.

  Each one:
  - **includes:** `border`, `border-transparent`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `rounded-md`, the 4 MOTION tokens, `hover:text-brand`, `text-foreground`, `focus-visible:ring-brand`;
  - **excludes:** `border-outline`, `rounded-sm`, `disabled:opacity-40`.

  Per button:
  - **Set selection and 0 dB** also include `disabled:text-dim`.
  - **0 dB** also includes `font-mono`.
  - **The toggle** also includes `pl-2`, `pr-1` and `gap-0.5`, and excludes `px-2`.
- **DFR1, Detail field radius.**
  - **At rest:** From, To and Clip Gain each include `rounded-md` and `border-outline-strong`, and exclude `rounded-sm` and `border-outline`.
  - **Pending** (change Clip Gain to `3`, as DPS3 does): the Clip Gain field includes `rounded-md` and `border-warning`, and excludes `border-outline-strong` and `rounded-sm`.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `352dc91` stays empty for:
- **Purchase and auth files:** `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`.
- **Shared UI and styles:** `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`.
- **Arrangement code:** `ArrangementContext.tsx`, `ArrangementTransport.tsx`, every other Arrangement component, `strings.ts`, `studio-lab.tsx`, docs 127–137.
- **The frozen neighbour tests in the vitest list:** `detail-panel`, `detail-panel-polish`, `detail-panel-fit`, `detail-panel-reason`, `pending-status`, `clip-gain-fader`, `self-disabling-focus`, `studio-theme-obsidian`, `render-budget`, `strings`.

**Not allowed:**
- any other file;
- commit, push, stash, install, revert or `npm run build`.

Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are allowed only for temporary mutations, and each one is restored and sha-verified.

**B grep at planning (at `352dc91`):**
- **Class assertions today:**
  - TH5 (`studio-theme-obsidian` l.197–211) asserts `border-outline-strong`, and not `border-outline`, on the three detail fields. R3 keeps that.
  - TH10 l.405 asserts `font-mono` on the 0 dB reset.
  - DPS5 asserts the toggle's `inline-flex items-center gap-0.5 pl-2 pr-1`, and not `px-2`.
  - PM1/PM2 (`pending-status` l.460–473) and F4 (`detail-panel-fit` l.282–296) check the field border tokens.
  - `detail-panel-polish` l.128 locks the l.221 box string exactly, which is why that box is excluded.
- **No test** asserts `rounded-sm` or `border-outline` on Set selection, the 0 dB reset or the toggle, and no e2e spec references them.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 11 files in `b-round-169-r170-vitest-base.txt`. Expect **183/183**; B ran it at `352dc91` (`b-round-169/out/vitest-base.json`). Save the list as `a-round-170/vitest-files.txt` and the result as `a-round-170/vitest-baseline.json`.
- **After the edits:**
  - Run the same 11 files. Expect 183 plus DSU1 and DFR1, all green.
  - `npm run typecheck`.
  - `npm run lint`.
  - A read-only `npx biome check` on the 2 code and test files.
- **`expect(` counts:** record them before and after. At `352dc91`, `detail-panel-strings-ui` has 48; the count may only grow.
- **Mutations.** For each one: Edit → run → restore by Edit → check the sha256 equals the post-edit hash **before** the next mutant. Write one JSON per mutation in `a-round-170/mutations/`.

  | Mutation | Change | Must turn red |
  |---|---|---|
  | m213 | put `border-outline` back on Set selection (in place of `border-transparent`) | DSU1 |
  | m214 | drop `hover:text-brand` from the 0 dB reset | DSU1 |
  | m215 | toggle `rounded-md` → `rounded-sm` | DSU1 |
  | m216 | drop `enabled:hover:bg-foreground/8` from the toggle | DSU1 |
  | m217 | `inputClass` `rounded-md` → `rounded-sm` | DFR1 |
  | m218 | `inputClass` `border-outline-strong` → `border-outline` | DFR1 (and TH5) |

- **Code-reviewer: required.** Four paths change (3 grants + 1 new doc). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 985 files are OK, and the protected diff vs `352dc91` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant you did not need) + 1 `??` (doc 139), nothing else.
  - Write `a-round-170/end-sha256.txt` (all changed paths + doc 139).
  - Write `a-round-170/diff-vs-start.patch` (vs `b-round-169/r170-granted-start/`, plus doc 139 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`, and record the font status in **every** session tool, including `d6` and `g170-3`. That closes the round-169 fontStatusGap.
- A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE).
- Copy the tools you reuse into `c-round-170/tools/`, unchanged: `b-round-169/tools/*`, `b-round-169/v3c4c2-probe.cjs` and `c-round-169/tools/d6.cjs`. Check the d6 sha256 (`3abc88fe…`).
- B's probe has the D0–D2 state recipes, the site selectors and a canvas colour parse (Tailwind v4 emits oklab).
- At 1280 the panel starts collapsed (HR-1280-DETAIL-COLLAPSED): expand it before you read or type.
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T170-TARGETED | Re-run `a-round-170/vitest-files.txt`. The counts equal A's, and DSU1, DFR1, DPS1–DPS5, TH5, TH10, PM1/PM2 and F4 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `352dc91`.</li><li>The frozen 985 files are OK at start and at end.</li><li>The end hashes equal `a-round-170/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` + doc 139 as `??`, nothing else.</li><li>The protected diff vs `352dc91` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-169/r170-granted-start/` itself:<ul><li>The component changes only S1–S3 and F1, as class tokens only.</li><li>Each of the 3 buttons has exactly one border colour (`border-transparent`) and keeps `hover:text-brand`, `disabled:text-dim` (S1, S2), `font-mono` (S2) and `pl-2 pr-1 gap-0.5` (S3).</li><li>F1 changes only the radius.</li><li>The only arbitrary values are the 4 MOTION tokens.</li><li>No text, aria, role, title, handler, size, gap or padding token changed.</li><li>The test file only adds DSU1 and DFR1 (0 removed lines), with helpers inside the new describe. Count `expect(`; it must not drop.</li><li>Doc 138 changes only l.4 (and the l.126 TODO, if A used that allowance).</li><li>Doc 139 exists with the D2 sections.</li></ul> |
| SURF-V3C4C2 | Both viewports, states D0–D2 from §0.1.<ul><li>**Set selection (D1), the toggle (D0 "Collapse", D2 "Expand"), and the 0 dB reset (enabled):**<ul><li>To enable the reset, type `-6` in Clip Gain and press Enter in D1.</li><li>Record the computed `border-top-color` (transparent), `border-top-width` 1 px and `border-radius` 8 px.</li><li>Record the rest background, plus the hover and active backgrounds from a real mouse hover and a held mouse button. Hover text is brand.</li><li>Record `transition-property` (includes `background-color` and `color`), duration 0.18 s and timing `cubic-bezier(0.2, 0.8, 0.2, 1)`.</li></ul></li><li>**Disabled** (informational, d6 convention): Set selection in D0, and 0 dB at 0 dB. Record colours and hover once per viewport. Expected: the 5 % fill, `text-dim`, no hover change.</li><li>**Fields** (From, To, Clip Gain in D1): radius 8 px. The border stays rgb(115,107,96) at rest. A pending Clip Gain (typed, not committed) shows the warning border with an 8 px radius.</li><li>**Reduced motion:** under `reducedMotion: 'reduce'` (one extra context per viewport), `transition-property` is `none` on all 3 buttons.</li><li>**4× crops** of the three buttons (D1 at rest and on hover) and the fields, for Saba's veto.</li><li>Record the fill against its surface once per viewport (B: 1.12). Informational only.</li></ul> |
| BOX-V3C4C2 | Raw `getBoundingClientRect` values (0.01 px) of the 7 probe sites (6 changed + the unchanged fader as a reference) in D0–D2 at both viewports, compared with the `before.box` values in `b-round-169/out/v3c4c2-probe.json` (same states, measured at `352dc91`).<ul><li>Expected: 0.00 px on every control.</li><li>The 1280 Set selection height of 18 / 23 px is the pre-existing baseline, not a finding, as long as it is unchanged.</li><li>Any delta > 0.5 px is a finding.</li></ul> |
| CONTRAST-V3C4C2 | <ul><li>Use a real canvas colour parse on the composited background.</li><li>**Enabled Set selection, 0 dB and toggle:** ≥ 4.5:1 at rest (B: 13.24) and on hover (6.58).</li><li>**Fields:** each equals B's `before` value for the same state in `b-round-169/out/v3c4c2-probe.json`: 15.62 enabled (D1), 5.69 disabled (D0).</li><li>Any enabled control below 4.5:1 is a finding.</li><li>Disabled controls are informational (B: 4.82).</li></ul> |
| RV1-V3C4C2 | <ul><li>Run the copied `d6.cjs` unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with `c-round-169/out/d6/d6-{1440,1280}-r1.json`. No key renames are expected.</li><li>Expected: 0 missing and 0 added keys, and every x/y/w/h within ±0.5 px.</li><li>Contrast changes are expected only on the three detail buttons. The set of failing entries equals the reference set; pre-existing disabled entries may differ by ≤ 0.6 (5.38 → 4.82).</li><li>A new failing entry, a key change, or any box delta > 0.5 px is a finding.</li></ul> |
| FUNC-SMOKE-V3C4C2 | Each control still does its real action at both viewports. Use real mouse clicks at the button centre (`elementFromPoint` must hit the target).<ul><li>**Set selection:** add and select a clip (D1 recipe). Type From = clip start + 1 and To = clip start + 3, then click Set selection. The time selection appears on that lane (`arrangement-lane-range`), the `arrangement-range` text shows those times, and the status names the track. Then type an invalid pair (From > To) and click: the invalid-range status shows, and the selection is unchanged (B grep: `clampDetailRangeToClip` returns null when end ≤ start, `panels.ts` l.269–289).</li><li>**Clip Gain with real audio** (AudioDestination tap; HR-TAP-REALTIME-ONLY):<ul><li>Play the clip at 0 dB and record the peak over a fixed window.</li><li>Type `-20` + Enter (inside the −60…+24 dB range, `model.ts` l.21–22), replay the same window: the peak drops by ≥ 15 dB (a paired ratio; HR-SUSTAINED-SOURCE).</li><li>Click **0 dB**: the field reads 0.0, the status confirms 0 dB, and replaying restores the level within 1 dB.</li><li>Ctrl+Z gives back −20 dB (the Undo label names Clip Gain).</li></ul></li><li>**Toggle:**<ul><li>A mouse click collapses the panel (`aria-expanded=false`, "Expand", the content is hidden), and a second click expands it.</li><li>Keyboard: focus the toggle and press Space. The panel toggles, and transport playback does **not** start (the position stays put). Then press Enter: it toggles as well, and the clip count is unchanged (B grep: the workspace Enter-to-add handler skips button targets, `StudioWorkspace.tsx` l.2013–2014).</li><li>Focus stays on the toggle after each action.</li></ul></li></ul> |
| FOCUS-RING-INFO | Informational, not pass/fail: at 1440, click into From, then press Tab until focus reaches Clip Gain (From → To → Set selection → Clip Gain). Record the outline and the border/ring, and say whether the double ring of C-R169-N1 also appears here. |
| G170-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`GET /api/studio-token?product=middle-east&file=stem1.wav` returns 401 (HR-TOKEN-401-PARAMS).</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–169): the transport, toolbar, lane and group header, library and preview, dock, clip, marker and icon rows, ENV-VIS and OV-CORNERS. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Set selection / Enter-to-apply, the range clamp | FUNC-SMOKE-V3C4C2, T170-TARGETED (`detail-panel`, `detail-panel-reason`) |
| Clip Gain type/commit/pending, the fader, 0 dB reset, focus after self-disabling | FUNC-SMOKE-V3C4C2, T170-TARGETED (`pending-status`, `clip-gain-fader`, `self-disabling-focus`, `detail-panel-fit`) |
| Panel collapse/expand, the Space handler, the 1280 start state | FUNC-SMOKE-V3C4C2, T170-TARGETED (`detail-panel`, DPS1/DPS5) |
| Detail panel layout and height | BOX-V3C4C2, RV1-V3C4C2 |
| Obsidian theme locks (TH5, TH10) and the render budget | T170-TARGETED |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Borderless filled Set selection / 0 dB / Collapse buttons with 8 px radius and a hover fill; fields with 8 px radius in the Clip details panel | None used. The source is the user-approved `visual-direction-a.md` § „ღილაკები და ზედაპირები“. No Live 12 manual section was opened for this planning. | Not checked. | **Not applicable; a CZABA brand decision.** Behaviour (range, Clip Gain, collapse) is unchanged, and the look is not claimed to match Live's Clip View. | Requirement: SURF, BOX, CONTRAST, RV1 and FUNC-SMOKE (V3C4C2). Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-170.md`, `a-round-170-result.json` and `a-round-170/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-170.md` and `c-round-170.json`.
  - `c-round-170.json` has `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`.
  - `c-round-170.md` includes the SURF, BOX, CONTRAST and RV1 tables for both viewports.
  - Put tools, out and shots in `c-round-170/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 171 planning)
| Condition | Round 171 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first. It covers every done / c_pass item at both viewports, `npm run test:e2e:smoke`, and the open evidence gap C-R167-METRONOME-UNDER-MUTE. Then the rows below apply. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on BOX-V3C4C2 (> 0.5 px) or CONTRAST-V3C4C2 (an enabled control < 4.5:1) | A fix-up within R1/R3/R13/R14 using C's measurements, or the site is recorded as a question for Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3c-4c-2's own code and cheap. Otherwise it goes to `deferred_low_polish`, and V-3c-4c-3 goes ahead. |
| C PASS | Root publishes round 170. V-3c-4c-2 → **მზადაა**. Round 171 = **V-3c-4c-3** (`ArrangementExportDialog` + `ArrangementVideoDock` + the MarkerRow l.811 question). If root has answered the checkpoint by then, B applies the answer. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 170: the changed granted paths plus the new doc 139, vs `352dc91`. `app/styles/**`, `strings.ts`, the other Arrangement components and the purchase/auth files are unchanged.
- **Architecture checkpoint:** see `b-round-169-checkpoint-request.md`. This round uses fallback (c) and adds 3 more SURF copies, which puts the token set in 10 components. The reviewers now agree on the extraction's shape (`lib/arrangement/surface-classes.ts`) but not on its timing.
- **User-visible decisions** (may be vetoed in `feature-status.md`):
  - **R13:** Set selection, 0 dB and Collapse/Expand lose their outline and get the 5 % fill.
  - **R3:** the three fields keep their border.
  - **R14:** the framed boxes wait for V-3c-5.
