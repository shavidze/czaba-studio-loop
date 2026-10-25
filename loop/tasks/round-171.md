# CURRENT TASK — Round 171: V-3c-4c-3 — Export dialog and video dock surfaces: Cancel and Done lose their outline (5 % fill, 8 px); the Export button takes the transport Export look; option cards and dock buttons get 8 px only; every box stays at 0 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z136** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c4c3_plan_d29z136`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-170.md`, an exact copy of the round-170 `current-task.md` (sha256 `2cfeee98614c6485…`, checked with `cmp`). Rationale for this round: `b-round-170.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ღილაკები და ზედაპირები“ (l.84–90). The spec is source material only; it grants no permissions.
  - **Buttons:** the `border-outline` border goes and is replaced by a `foreground` fill: 5 % at rest, 8 % on hover, 12 % when active. The 1 px border stays but becomes transparent.
  - **Primary action ("Export"):** border and text in `brand`.
  - **Radius:** buttons and fields get 8 px; panels get 10 px (V-3c-5).
  - **Motion:** `background-color, color 180ms cubic-bezier(.2,.8,.2,1)`, off under reduced motion.
- **User decision files:** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` have the same content as at round 170 planning, and every decision in them is already in `backlog.json`. Nothing in them changes this stage. `docs/technical/store-redesign/direction-decision.md` is new (direction A), but it concerns STORE-REDESIGN. That entry is queued after VISUAL-A and does not change this round.

## Baseline = HEAD `fe6ea99`, clean tree (gate 170 published)
- **Gate:** `gates/gate-round-170.json` status is `published`, commit `fe6ea99361592b9ca6dbecda8f1879d47cf0a369`, on both remotes.
- **Tree:** `git status --short` is empty, and `git ls-files -co --exclude-standard` lists **989** files.
- **Frozen list:** `b-round-170-r171-tree-sha256.txt`, **984 entries** (989 minus the 5 grants).
- **Grants:** `b-round-170-r171-grants.txt` (5 existing files).
- **New file:** `b-round-170-r171-new-files.txt` (1 file: doc 140).
- **Start hashes:** `b-round-170-r171-granted-start-sha256.txt`. **Start copies:** `b-round-170/r171-granted-start/`.
- **Line numbers:** B grepped them at `fe6ea99`. They equal the inventory taken at `330f1f3`.
- **A's first step:** check that HEAD = `fe6ea99`, the tree is clean, the 984 frozen files match (`sha256sum -c --quiet`) and the 5 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z136)
- **Round 170: C PASS.** `browserVerified` and `realVerified` are true, with 0 bugs. Root published `fe6ea99`. The gate review scored 9/10 with nothing blocking. **V-3c-4c-2 → მზადაა.**
- **The outcome was fixed in advance** (`tasks/round-170.md` §7, "C PASS" row): round 171 = **V-3c-4c-3**.
- **Checks at planning:**
  - **Regression:** `regression-last.json` is 2026-10-24, so the next one is due on or after 2026-10-27. Today is 2026-10-25, so it is not due.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.
  - **C round 170 bugs:** none.
- **V-3c-4 ends with this round.** It is the feature boundary, so B has sent root a bounded architecture checkpoint request: `b-round-170-checkpoint-request.md`. Until root answers, fallback (c) applies: the class copies stay in each component, locked by tests.

### 0.1 B evidence: browser probe (planning data, not C rows)
`b-round-170/v3c4c3-probe.cjs` → `out/v3c4c3-probe.json`, with PNGs next to it.
- **Setup:** real Chromium on `/studio-lab` at `fe6ea99`, 1440×900 and 1280×720. The planned class swap is applied in the live DOM. Every class it uses is already compiled by earlier stages.
- **States:**
  - **E0:** the Export dialog is open on the empty project, so the Export button is disabled.
  - **E1:** the Export dialog is open after one clip was added: `demo-middle-east` on Music at 1 s, with Enter (`tools/lib.cjs` `addAt`). The Export button is enabled.
  - **V0:** the dock with a real video loaded (`media/beeps-6s-h264-aac.mp4` through `arrangement-video-input`, `L.loadVideo`).
  - **V1:** the video expanded into the floating box, which shows the drag, expand/return and close buttons and the placeholder Return.
  - E0 and E1 were each measured with both primary variants: `exportLook` (R15) and `keepFill` (the fallback).

| Measure | Result (1440 and 1280) |
|---|---|
| Layout: every `button, a, input, select, label, [data-testid], [role]` box | **max 0.000 px**, 0 added, 0 missing, in all states and both variants. The restore check is also 0. |
| Radius | 6 px → 8 px on every changed site |
| Done (enabled) | Border rgb(36,33,30) → transparent. Fill rgb(22,20,18) → rgb(33,31,28). Contrast **14.78 → 13.24**, hover **12.35**. |
| Export, `exportLook` (E1, enabled) | Fill rgb(201,164,106) → rgb(33,31,28), and the text becomes brand. Contrast **8.32 → 7.05**, hover **6.58**. The brand border stays. |
| Export, `keepFill` (E1) | 8.32, unchanged |
| Export, disabled (E0, `opacity-40`) | 2.29 → 2.26. Informational: the pre-existing opacity-40 exemption, the same as the transport. |
| Option cards (6) | Radius only. The colours are unchanged: selected 12.56; unselected 14.78; video option and invalid range 5.38 (pre-existing `text-dim`). |
| Dock float buttons, Return | Radius only. Colours unchanged: float 7.09 (hover 15.68), measured against the box background and not video pixels; Return 15.62 (hover 13.94). They keep the global 150 ms `app.css` transition. |
| Cancel | **Not reachable in the probe.** It renders only while `isRendering`, so C covers it in state E2. |
| Fill against its surface | 1.12, the spec's known trade-off (GATE167-WCAG-1411-FILL), for the record. |

### 0.2 B rulings (D-29z136; all user-vetoable in `feature-status.md`)
- **R1 (as before). The token set** is copied from the transport `toolButtonClass` (`ArrangementTransport.tsx` l.51):
  - **SURF:** `border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`
  - **FILL:** SURF without `border-transparent`
  - **MOTION:** `motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none!`
  - **RADIUS:** `rounded-sm` → `rounded-md`
  - The four MOTION tokens are the **only** arbitrary `[...]` values allowed.
- **R15. The Export button (l.615) takes the Export look:**
  - **Changes:** `bg-brand` → FILL, `text-brand-foreground` → `text-brand`; add MOTION; `rounded-sm` → `rounded-md`.
  - **Keeps:** `border border-brand font-medium px-4 py-2 text-sm`, the focus ring, `disabled:cursor-not-allowed disabled:opacity-40`. No `border-transparent`.
  - **Why:** the spec (l.87) defines the primary action as a brand border with brand text. The transport Export already dropped `bg-brand`/`text-brand-foreground` (`transport-surface-ui` l.336–343). The R6 video import button and the R11 library Add already took this look. A second Export style two clicks away would be the inconsistency.
  - **Vetoable fallback (`keepFill`):** `rounded-md` + MOTION only; the solid brand fill stays (8.32).
- **R16. Cancel (l.581) and Done (l.596):**
  - **Changes:** `rounded-sm` → `rounded-md`; `border-outline` → `border-transparent`; `hover:border-outline-hover` is removed; add the SURF fills and MOTION. The hover feedback is now the 8 % fill (the R9 precedent).
  - **Keeps:** `border px-4 py-2 text-sm text-foreground` and the focus ring.
  - **Done** keeps its **pre-existing** `disabled:opacity-40`, which HE5 locks (`CLOSE_DISABLED_TOKEN`). This differs from V-3c-4c-2 because here the token already exists and is locked; it is not being added.
  - **Cancel** stays without any `disabled:` token (HE5).
- **R17. The option cards are form controls: radius only.** The six format and scope labels each change `rounded-sm` → `rounded-md` and nothing else: l.288 (WAV), l.321 (MP3), l.344 (both), l.365 (video, disabled), l.392 (project), l.418 (range).
  - `border-outline` / `border-brand bg-brand/10` and `text-dim` stay, because the border is the selection cue.
- **R18. Dock buttons: radius only.**
  - **`VIDEO_FLOAT_BUTTON_CLASS` (l.60):** `rounded-sm` → `rounded-md` only. `bg-background/80` stays for legibility over the picture, and `hover:text-foreground` stays. No 5 % fill and no MOTION (the R7 borderless precedent). At h-6 w-6 the 8 px radius approaches a circle (the R4 precedent); C takes 4× crops for veto.
  - **The placeholder Return (l.911):** `rounded-sm` → `rounded-md` only. `hover:bg-elevated` stays.
  - Both keep the global 150 ms transition, which is recorded under C-R168-BORDERLESS-REDUCED-MOTION.
- **R19. Not in this slice:**
  - the dock placeholder's dashed box (l.901) and the video box (l.920): these are frames, which go to V-3c-5 (10 px);
  - the dialog footer strip (l.531, a divider; FS1);
  - the progress bar;
  - the radio inputs (`accent-brand`).
- **R20. The `ArrangementMarkerRow` l.811 flag label chip is closed: it stays out of V-3c.**
  - It is the text label inside the marker flag button, not a button surface or a field.
  - At h-4 with `px-1 truncate`, an 8 px radius would make a pill that clips the truncated text edge.
  - Its border carries the selected cue.
  - The file is not touched.

## 1. What changes (exact; line numbers at `fe6ea99`)
Change IDs are S1–S4 (Export dialog) and K1–K2 (dock). E0–E2 and V0/V1 are **states** (§0.1, §4), not changes.
| ID | File / lines | Change |
|---|---|---|
| S1 | `ArrangementExportDialog.tsx` l.581 (Cancel) | R16 |
| S2 | l.596 (Done) | R16; `disabled:opacity-40` stays |
| S3 | l.615 (Export) | R15 |
| S4 | l.288, l.321, l.344, l.365, l.392, l.418 (cards) | `rounded-sm` → `rounded-md` only (R17) |
| K1 | `ArrangementVideoDock.tsx` l.60 (`VIDEO_FLOAT_BUTTON_CLASS`) | `rounded-sm` → `rounded-md` only (R18) |
| K2 | l.911 (placeholder Return) | `rounded-sm` → `rounded-md` only (R18) |
| D1 | `docs/implementation/2026/quarter-IV/139-studio-v3c4c2-detail-panel-button-surfaces.md` | Set **l.4** to exactly `**სტატუსი:** Completed (C round 170 PASS; published fe6ea99)` (gate-170 review suggestion 5). The l.100 TODO ("C round 170-ის ბრაუზერის მტკიცებულება…") may be struck through in the same edit. Nothing else changes. |
| D2 | **new** `docs/implementation/2026/quarter-IV/140-studio-v3c4c3-export-dialog-video-dock-surfaces.md` | See below. |

**D2 content:**
- Follow `docs/implementation/TEMPLATE.md`, in Georgian, with technical terms in English.
- Contents: R1, R15–R20, the §0.1 probe table (both primary variants), the tokens before and after, and the tests and mutations.
- **Known trade-offs:**
  - WCAG 1.4.11: the fill against its surface is 1.12.
  - The Export button goes from 8.32 to 7.05 and loses its solid fill (R15 is vetoable).
  - The dock buttons keep the global transition.
- **TODO:**
  - V-3c-5, including the l.901/l.920 dock frames and the DetailPanel l.221/l.702 boxes;
  - DUX-R-5, M1, M3, M4;
  - the checkpoint request `b-round-170-checkpoint-request.md`.
- **Status:** `In Progress (awaiting C round 171)`.

**Not allowed:**
- `app/styles/**`, `Modal.tsx`, any other component, `strings.ts`, `package.json`.
- `style=`, custom CSS, a hex value, a new token, or any arbitrary `[...]` value other than the four MOTION tokens.
- Any UI text, icon, size, padding, gap, position, aria, title, `data-*` or `role` change. The class-string edits in §1 are the only string changes allowed.
- Any change to handlers, focus, keyboard (including the Done Enter-repeat guard, the dock's drag, arrow-key and Escape handlers), export logic, video logic, or `cn()` call structure.
- A shared constant or component across files, or a new file-local constant: fallback (c). Edit the class strings only. `VIDEO_FLOAT_BUTTON_CLASS` is an existing constant and keeps its name.
- `ArrangementMarkerRow.tsx` (R20) and the excluded R19 sites.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementExportDialog.tsx` | S1–S4 only (class strings) |
| `app/components/arrangement/ArrangementVideoDock.tsx` | K1–K2 only (class strings) |
| `app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx` | Add **ESU1** and **ECR1** in a new describe at the end of the file. Use the file's own `mountHoldEnterDialog()`, `pendingRenders()`, `clickExport()`, `cancelButton()`, `closeButton()`, `classTokens()` and `settleRenders()`. Any new helper goes **inside** the new describe. Unmount in an `afterEach` or a `try/finally`, and settle pending renders. HE1–HE6 and everything else stay unchanged. |
| `app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx` | Add **VFR1** in a new describe at the end of the file, using `mountDockWorkspace()`. Helpers go inside the describe; unmount in `afterEach`/`finally`. VDS1–VDS3 and LVD1 stay unchanged. |
| `docs/…/139-studio-v3c4c2-detail-panel-button-surfaces.md` | D1 only |
| **new** `docs/…/140-studio-v3c4c3-export-dialog-video-dock-surfaces.md` | D2 |

**New locks.** B grepped `app`, `e2e` and `docs` at `fe6ea99`: `ESU1`, `ECR1` and `VFR1` are used nowhere. Token checks split `className` on whitespace.
- **ESU1, Export dialog button surfaces.**
  - **Export (idle, the WAV format chosen by default):**
    - **includes:** `border`, `border-brand`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `text-brand`, `font-medium`, `rounded-md`, `px-4`, `py-2`, `text-sm`, the 4 MOTION tokens, `focus-visible:ring-brand`, `disabled:cursor-not-allowed`, `disabled:opacity-40`;
    - **excludes:** `bg-brand`, `text-brand-foreground`, `border-transparent`, `rounded-sm`.
  - **Done, idle and again during a render (disabled):**
    - **includes:** `border`, `border-transparent`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `rounded-md`, `px-4`, `py-2`, `text-sm`, `text-foreground`, the 4 MOTION tokens, `focus-visible:ring-brand`, `disabled:opacity-40`;
    - **excludes:** `border-outline`, `hover:border-outline-hover`, `rounded-sm`.
  - **Cancel, during a render:** the same include and exclude lists as Done, except `disabled:opacity-40`, plus **no** token that starts with `disabled:`.
- **ECR1, Export option card radius.** Find the six cards as `closest('label')` of the dialog's radio inputs: the 4 format radios, including the disabled video radio, and the 2 scope radios.
  - Each one includes `rounded-md`, `border` and `p-3`, and excludes `rounded-sm`.
  - The selected WAV card includes `border-brand` and `bg-brand/10`.
  - The unselected MP3 card includes `border-outline` and excludes `bg-brand/10`.
  - The video card includes `border-outline` and `text-dim`.
- **VFR1, Video dock button radius.**
  - **Compact `arrangement-video-expand`; after Expand video, `arrangement-video-drag`, `arrangement-video-expand` and `arrangement-video-close`:**
    - **includes:** `rounded-md`, `bg-background/80`, `hover:text-foreground`, `h-6`, `w-6`, `focus-visible:ring-brand`;
    - **excludes:** `rounded-sm`, `bg-foreground/5`;
    - and no token that starts with `motion-`.
  - **`arrangement-video-placeholder-return`:**
    - **includes:** `rounded-md`, `hover:bg-elevated`, `px-2`, `py-0.5`;
    - **excludes:** `rounded-sm`.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio or video logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `fe6ea99` stays empty for:
- **Purchase and auth files:** `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`.
- **Shared UI and styles:** `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`.
- **Arrangement code:** `ArrangementContext.tsx`, `ArrangementTransport.tsx`, `ArrangementMarkerRow.tsx`, every other Arrangement component, `strings.ts`, `studio-lab.tsx`, docs 127–138.
- **The frozen neighbour tests in the vitest list:** every file in `b-round-170-r171-vitest-base.txt` except the two granted tests.

**Not allowed:**
- any other file;
- commit, push, stash, install, revert or `npm run build`.

Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are allowed only for temporary mutations, and each one is restored and sha-verified. No placeholder appends.

**B grep at planning (at `fe6ea99`):**
- **Class assertions today:**
  - HE5 (`export-dialog-hold-enter` l.339–355) asserts that Cancel has no `disabled:` token and that Done has `disabled:opacity-40`. R16 keeps both.
  - FS1 (`export-dialog-footer` l.447) locks the footer strip, which is excluded.
  - `floating-video` checks only `fixed`, `w-40`, `aspect-video` and `z-40` on the box and placeholder; the radius is not involved.
  - LVD1 checks the icons, aria and titles of the dock buttons.
  - TH11 counts one mono span in `ArrangementVideoDock.tsx`; it is unchanged.
- **No test** asserts `rounded-sm`, `border-outline`, `bg-brand` or `bg-background/80` on any changed site, and no e2e spec references them.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 19 files in `b-round-170-r171-vitest-base.txt`. Expect **279/279**; B ran it at `fe6ea99` (`b-round-170/out/vitest-base.json`). Save the list as `a-round-171/vitest-files.txt` and the result as `a-round-171/vitest-baseline.json`.
- **After the edits:**
  - Run the same 19 files. Expect 279 plus ESU1, ECR1 and VFR1, all green.
  - `npm run typecheck`.
  - `npm run lint`.
  - A read-only `npx biome check` on the 4 code and test files.
- **`expect(` counts:** record them before and after. At `fe6ea99`, `export-dialog-hold-enter` has 47 and `video-dock-strings-ui` has 44; the counts may only grow.
- **Mutations.** For each one: Edit → run → restore by Edit → check the sha256 equals the post-edit hash **before** the next mutant. Write one JSON per mutation in `a-round-171/mutations/`.

  | Mutation | Change | Must turn red |
  |---|---|---|
  | m219 | Done: `border-transparent` → `border-outline` | ESU1 |
  | m220 | Cancel: drop `enabled:hover:bg-foreground/8` | ESU1 |
  | m221 | Export: `bg-foreground/5` → `bg-brand` | ESU1 |
  | m222 | Export: `text-brand` → `text-brand-foreground` | ESU1 |
  | m223 | Done: drop `disabled:opacity-40` | ESU1 and HE5 |
  | m224 | WAV card: `rounded-md` → `rounded-sm` | ECR1 |
  | m225 | `VIDEO_FLOAT_BUTTON_CLASS`: `rounded-md` → `rounded-sm` | VFR1 |
  | m226 | `VIDEO_FLOAT_BUTTON_CLASS`: drop `bg-background/80` | VFR1 |

- **Code-reviewer: required.** Six paths change (5 grants + 1 new doc). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 984 files are OK, and the protected diff vs `fe6ea99` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant you did not need) + 1 `??` (doc 140), nothing else.
  - Write `a-round-171/end-sha256.txt` (all changed paths + doc 140).
  - Write `a-round-171/diff-vs-start.patch` (vs `b-round-170/r171-granted-start/`, plus doc 140 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready` and record the font status in **every** session tool.
- A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice. One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE).
- Copy the tools you reuse into `c-round-171/tools/`, unchanged: `b-round-170/tools/*`, `b-round-170/v3c4c3-probe.cjs`, `c-round-169/tools/d6.cjs` (check its sha256 `3abc88fe…`) and `c-round-170/tools/d6-fontwrap.cjs`.
- B's probe has the E0/E1/V0/V1 recipes, the site selectors and a canvas colour parse (Tailwind v4 emits oklab).
- **For E2 (rendering, Cancel visible):**
  - Start a real WAV export of a project long enough to render for a while (several clips; `demo-middle-east` is a full-length mix).
  - Poll for `[data-testid=arrangement-export-cancel]` every ≈ 50 ms. `c-round-100/tools/lib100.cjs` l.82–127 has a working recipe that captures Cancel during a render.
  - If Cancel still cannot be caught within the run budget, the row's Cancel part is `notRun` with the reason. A unit lock does not stand in for it, and B does not mark the stage მზადაა on that site.
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T171-TARGETED | Re-run `a-round-171/vitest-files.txt`. The counts equal A's, and ESU1, ECR1, VFR1, HE1–HE6, FS1, LVD1, VDS1–VDS3, TH11 and the `transport-surface-ui` TS rows are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `fe6ea99`.</li><li>The frozen 984 files are OK at start and at end.</li><li>The end hashes equal `a-round-171/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` + doc 140 as `??`, nothing else.</li><li>The protected diff vs `fe6ea99` is empty (§2 list, including `ArrangementMarkerRow.tsx` and `Modal.tsx`).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-170/r171-granted-start/` itself:<ul><li>`ArrangementExportDialog.tsx` changes only S1–S4, as class tokens only.</li><li>Cancel and Done each have exactly one border colour (`border-transparent`); Done keeps `disabled:opacity-40`.</li><li>Export keeps `border-brand font-medium` and has no `bg-brand`/`text-brand-foreground`.</li><li>The cards change only the radius.</li><li>`ArrangementVideoDock.tsx` changes only the radius on l.60 and l.911.</li><li>The only arbitrary values are the 4 MOTION tokens.</li><li>No text, aria, role, title, handler, size, gap or padding token changed.</li><li>The tests only add ESU1, ECR1 and VFR1 (0 removed lines), with helpers inside the new describes. Count `expect(`; it must not drop.</li><li>Doc 139 changes only l.4 (and the l.100 TODO, if A used that allowance).</li><li>Doc 140 exists with the D2 sections.</li></ul> |
| SURF-V3C4C3 | Both viewports.<ul><li>**Done (E1, enabled), Cancel (E2), Export (E1, enabled):**<ul><li>Record the computed `border-top-color` (transparent on Done and Cancel; brand rgb(201,164,106) on Export), `border-top-width` 1 px and `border-radius` 8 px.</li><li>Record the rest background, and the hover and active backgrounds from a real mouse hover and a held mouse button (release it off-target). Export text is brand at rest and on hover.</li><li>Record `transition-property` (includes `background-color` and `color`), duration 0.18 s and timing `cubic-bezier(0.2, 0.8, 0.2, 1)`.</li></ul></li><li>**Disabled** (informational): Done during E2 and Export in E0. Record the colours and opacity once per viewport.</li><li>**Cards** (E1): radius 8 px; border colours and fills equal B's `before` values.</li><li>**Dock** (V0, V1, with real video frames showing): the float buttons and Return have an 8 px radius; their background and colours equal B's `before` values.</li><li>**Reduced motion:** under `reducedMotion: 'reduce'` (one extra context per viewport), `transition-property` is `none` on Done, Cancel (if caught) and Export.</li><li>**4× crops**, for Saba's veto:<ul><li>the footer buttons at rest and on hover (E1);</li><li>Cancel (E2);</li><li>the cards;</li><li>the float buttons over a **real video frame** in V1 (this is the legibility evidence; B's contrast is against the box background).</li></ul></li><li>Record the fill against its surface once per viewport (B: 1.12). Informational only.</li></ul> |
| BOX-V3C4C3 | Raw `getBoundingClientRect` values (0.01 px) of the probe sites in E0, E1, V0 and V1 at both viewports, compared with the `before.box` values of the `exportLook` runs in `b-round-170/out/v3c4c3-probe.json` (same states, measured at `fe6ea99`).<ul><li>Expected: 0.00 px on every control.</li><li>Cancel (E2) has no B baseline. Record its box and check that the footer row keeps Done and Export at their E1 sizes.</li><li>Any delta > 0.5 px is a finding.</li></ul> |
| CONTRAST-V3C4C3 | <ul><li>Use a real canvas colour parse on the composited background.</li><li>**Enabled Done, Cancel and Export:** ≥ 4.5:1 at rest and on hover (B: Done 13.24 / 12.35; Export 7.05 / 6.58).</li><li>**Cards and dock:** each equals B's `before` value for the same state.</li><li>Any enabled control below 4.5:1 is a finding.</li><li>Disabled controls are informational.</li></ul> |
| RV1-V3C4C3 | <ul><li>Run the copied `d6.cjs` unchanged through `d6-fontwrap.cjs`, **one run** per viewport.</li><li>Compare S0/S1/S2 with `c-round-170/out/d6/d6-{1440,1280}-r1.json`.</li><li>Expected: 0 missing and 0 added keys, and every x/y/w/h within ±0.5 px.</li><li>The set of failing contrast entries equals the reference.</li><li>A new failing entry, a key change, or any box delta > 0.5 px is a finding.</li></ul> |
| FUNC-SMOKE-V3C4C3 | Each control still does its real action at both viewports. Use real mouse clicks at the button centre (`elementFromPoint` must hit the target).<ul><li>**Export:** with a clip added (E1), click Export with WAV chosen. A real `.wav` download arrives. Parse it: it is a valid RIFF/WAVE, its duration matches the project end ±0.05 s, and its peak is > 0.01 (real audio, not silence).</li><li>**Cancel:** during a render (E2), click Cancel. The status reads exactly `Export cancelled — no file was created.`, no download arrives, Done becomes enabled again, and Cancel is gone.</li><li>**Done:** click Done. The dialog closes, and focus returns to the transport Export button (EXPORT-DIALOG-FOCUS-RESTORE).</li><li>**Cards:** click the MP3 card label. The MP3 radio becomes checked, its card takes the brand border, and the Export label changes to the MP3 text. Click WAV again to restore.</li><li>**Dock**, with the real video (V0 → V1):<ul><li>Click Expand: the video floats, and the placeholder and Return appear.</li><li>Focus the drag button and press ArrowRight: the box moves by 16 px.</li><li>Start transport playback: the floating video's `currentTime` advances, and pausing stops it.</li><li>Click Close: the dock returns to compact, and focus lands on Expand video.</li><li>Expand again, then click the placeholder Return: it returns to compact.</li><li>Press Escape while floating: it returns to compact.</li></ul></li></ul> |
| G171-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", with no workspace and 0 `audio[src]`.</li><li>`GET /api/studio-token?product=middle-east&file=stem1.wav` returns 401 (HR-TOKEN-401-PARAMS).</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–170): the transport, toolbar, lane and group header, library and preview, detail panel, clip, marker and icon rows, ENV-VIS and OV-CORNERS. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Harness fact (C round 170):** `arrangement-lane-range` renders only for all-lanes ranges. A single-lane range is drawn inside the clip without a testid (`backlog.json` `harness_facts` C-R170-LANE-RANGE-TESTID).

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Export render, download, Cancel, the Done Enter-repeat guard, focus restore | FUNC-SMOKE-V3C4C3, T171-TARGETED (`export-*`) |
| Format and scope choice, range export | FUNC-SMOKE-V3C4C3 (cards), T171-TARGETED (`export-range-ui`, `export-mp3`) |
| Floating video drag, keyboard move, close, Escape, return focus, playback sync | FUNC-SMOKE-V3C4C3, T171-TARGETED (`floating-video`, `video-dock-strings-ui`, `library-video-return-focus`, `video-fades-ui`) |
| Dialog and dock layout | BOX-V3C4C3, RV1-V3C4C3 |
| Theme locks (TH11) and the render budget | T171-TARGETED |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Borderless filled Cancel/Done, a brand-outlined Export confirm, 8 px option cards and dock buttons | None used. The source is the user-approved `visual-direction-a.md` § „ღილაკები და ზედაპირები“. No Live 12 manual section was opened for this planning. | Not checked. | **Not applicable; a CZABA brand decision.** Export and video behaviour is unchanged, and the look is not claimed to match Live's Export dialog. | Requirement: SURF, BOX, CONTRAST, RV1 and FUNC-SMOKE (V3C4C3). Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-171.md`, `a-round-171-result.json` and `a-round-171/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-171.md` and `c-round-171.json`.
  - `c-round-171.json` has `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`.
  - `c-round-171.md` includes the SURF, BOX, CONTRAST and RV1 tables for both viewports.
  - Put tools, out and shots in `c-round-171/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 172 planning)
| Condition | Round 172 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first. It covers every done / c_pass item at both viewports, `npm run test:e2e:smoke`, and the open evidence gap C-R167-METRONOME-UNDER-MUTE. Then the rows below apply. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on BOX-V3C4C3 (> 0.5 px) or CONTRAST-V3C4C3 (an enabled control < 4.5:1) | A fix-up within R1/R15–R18 using C's measurements, or the site is recorded as a question for Saba. It is not deferred silently. |
| Cancel (E2) could not be caught in the browser | V-3c-4c-3 is not მზადაა. Round 172 schedules the Cancel browser half alone (V2 rule). |
| C FAIL Low only | A bounded fix-up if it is in V-3c-4c-3's own code and cheap. Otherwise it goes to `deferred_low_polish`, and V-3c-5 goes ahead. |
| C PASS | Root publishes round 171. V-3c-4c-3 → **მზადაა**, and V-3c-4 is complete. Round 172 = **V-3c-5** (10 px panel radius), unless root has answered the checkpoint with "extract now", in which case B schedules the extraction as one bounded round first. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 171: the changed granted paths plus the new doc 140, vs `fe6ea99`. `app/styles/**`, `Modal.tsx`, `strings.ts`, `ArrangementMarkerRow.tsx`, the other Arrangement components and the purchase/auth files are unchanged.
- **Architecture checkpoint:** `b-round-170-checkpoint-request.md`. This is the V-3c-4 feature boundary; please answer Q1–Q3 by round 172 planning if possible.
- **STORE-REDESIGN:** it is now in the backlog queue (after VISUAL-A, before REVIEW-RECOMMENDATIONS), with direction A recorded. B could not find `cloud/run.sh` or `mock-api/` under `/home/runner/czaba-project`. Please confirm where the cloud job starts `mock-api/server.mjs` before STORE-0 is scheduled.
- **User-visible decisions** (may be vetoed in `feature-status.md`):
  - **R15:** the Export button loses its solid brand fill and takes the transport Export look. The fallback keeps the fill.
  - **R16:** Cancel and Done lose their outline.
  - **R17:** the cards keep their border.
  - **R18:** the dock buttons keep their dark background.
  - **R20:** the marker flag chip is unchanged.
