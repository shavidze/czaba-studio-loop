# CURRENT TASK — Round 167: V-3c-4a — toolbar buttons in StudioWorkspace, Tempo row, Marker row and Master lose their outline (border → 5 % fill, 8 px radius); fields get 8 px radius only; every box stays at 0 px

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z132** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c4a_plan_d29z132`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-166.md`, an exact copy of the round-166 `current-task.md` (sha256 `3791013e1a112ba5…`). Rationale for this round: `b-round-166.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ღილაკები და ზედაპირები“. It says the button border disappears and becomes a `foreground` fill at 5 %, 8 % on hover and 12 % when active. The 1 px border becomes transparent and stays, so the size does not change. Buttons and fields get an 8 px radius, and motion is `background-color, color 180ms cubic-bezier(.2,.8,.2,1)`, off under reduced motion. The spec is source material only and grants no permissions.
- **User decision files:** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` are unchanged since round 164 planning. Nothing in them changes this stage.

## Baseline = HEAD `330f1f3`, clean tree (gate 166 published)
- `gates/gate-round-166.json`: status `published`, commit `330f1f32094c758c3bdbd178b7347e667781a309`, on both remotes.
- `git status --short` is empty. `git ls-files -co --exclude-standard` lists **985** files.
- **Frozen list:** `b-round-166-r167-tree-sha256.txt`, **976 entries** (985 minus the 9 grants).
- **Grants:** `b-round-166-r167-grants.txt` (9 existing files). **New file:** `b-round-166-r167-new-files.txt` (1: doc 136).
- **Start hashes:** `b-round-166-r167-granted-start-sha256.txt`. **Start copies:** `b-round-166/r167-granted-start/`.
- **A's first step:** check that HEAD = `330f1f3`, the tree is clean, the 976 frozen files match (`sha256sum -c --quiet`) and the 9 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z132)
- **Round 166: C PASS.** `browserVerified` and `realVerified` are true, with 0 bugs. Root published `330f1f3`. **V-3c-3b → მზადაა.** That completes V-3c-3 and the glyph-to-icon work in V-3.
- **The outcome was fixed in advance** (`tasks/round-166.md` §7, "C PASS" row): round 167 = **V-3c-4**, the button surfaces of the components outside the transport.
- **Checkpoint:** the frontend-architect checkpoint (`b-round-160-checkpoint-request.md` + addendum `b-round-165-checkpoint-request.md`) is still unanswered. As written in advance, B applies **fallback (c): the class copies stay in each component, and tests lock them.** There is no shared constant and no `ToolButton` component. This is the feature boundary at the end of the glyph work, so B repeats the request to root in `b-round-166.md`. It does not block this round.
- **Checks at planning:**
  - **Regression:** due on or after 2026-10-27 (`regression-last.json`: 2026-10-24). Today is 2026-10-25, so it is not due.
  - **Open findings:** no Critical, High or Medium finding is open, apart from the Tech Lead manual items.
  - **C round 166 bugs:** none.
- **Split (D-29z132, scope unchanged).** The bordered buttons and fields span 11 components. One test file per owner puts that well past the ~12-grant limit, so V-3c-4 is split by owner:
  - **V-3c-4a (this round):** the small toolbar controls in `StudioWorkspace`, `ArrangementTempoRow`, `ArrangementMarkerRow` and `ArrangementMaster`.
  - **V-3c-4b:** the Lane and Group header Mute/Solo buttons, and the Lane video-import buttons.
  - **V-3c-4c:** the Detail panel, the Library preview and search, the Export dialog, and the video-dock float buttons.
  - The exact line lists are in `backlog.json` `v3c4a_plan_d29z132.v3c4_inventory`.

### 0.1 B evidence: browser probe (planning data, not C rows)
`b-round-166/v3c4a-probe.cjs` → `out/v3c4a-probe.json` + png. Real Chromium on `/studio-lab` at `330f1f3`, at 1440×900 and 1280×720.
- **Method:** the R1 surface swap is applied in the live DOM. Every class it uses is already compiled by the transport recipe.
- **States:**
  - **S0-default:** everything is off, and the metronome is disabled because there is no tempo.
  - **S3-on:** Snap on, Env on, BPM 120, Metronome on and Master Mute on.

| Measure | Result (identical at 1440 and 1280) |
|---|---|
| Layout: every `button, a, input, select, [data-testid], [role]` box | **max 0.000 px**, 0 added, 0 missing, in both states. The restore check is also 0. |
| Radius | 6 px → 8 px on every site |
| Off-state text contrast (muted on the composited fill) | **6.68 → 5.98** (fill rgb(33,31,28) on surface rgb(22,20,18)) |
| Off-state hover (foreground text on 8 %) | 12.35 |
| On-state (accent on `bg-accent/20`) | 5.48, unchanged |
| Master Mute on (background text on `bg-accent`) | 8.32, unchanged |
| Disabled metronome (opacity 50) | 2.59 → 2.52. It was already below the threshold; disabled controls are exempt. |
| Fields (BPM input, grid select, waveform-zoom select) | Border colour and contrast are unchanged: 15.62, 14.78 and 14.78. |

- **Probe limit:** the probe's on-states did not carry the R2 hover tokens. The hover row for the on-states therefore shows that the on-fill survives when no foreground hover is added. R2 makes that true in code.
- **Not probed:** the Master Peak "over" state. It needs a live overload; vitest HM7 covers it.

### 0.2 B rulings (D-29z132; all user-vetoable in `feature-status.md`)
- **R1. The surface token set.** It is copied from the transport `toolButtonClass` (`ArrangementTransport.tsx` l.51), and **only these tokens** are copied:
  - **SURF:** `border-transparent bg-foreground/5 enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12`
  - **MOTION:** `motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none!`
  - **RADIUS:** `rounded-sm` → `rounded-md` (8 px in this project's `--radius-md`).
  - **Do not copy** `inline-flex`, `h-8`, `items-center`, `gap-1`, `px-2.5`, `text-sm`, `text-foreground` or `disabled:opacity-40`.
  - **Each button keeps** its own size, padding, text size, text colour, `hover:text-*`, focus ring and disabled cue.
  - The `!` suffixes stay while ROOT-GLOBAL-TRANSITION-RULE (checkpoint Q2) is open. This is the round-159 precedent.
  - The four MOTION tokens are the **only** arbitrary `[...]` values allowed in this round.
- **R2. State cues keep their strings.** This is the Loop precedent, `ArrangementTransport.tsx` l.234.
  - The on-state string stays byte-identical and still wins through `cn`/twMerge: its border colour replaces `border-transparent`, and its fill replaces `bg-foreground/5`.
  - So that hover and active do not replace the on-fill, the same hover/active fill is added to each on-state:
    - Snap, Env and Metronome on: `enabled:hover:bg-accent/20 enabled:active:bg-accent/20`.
    - Master Mute on: `enabled:hover:bg-accent enabled:active:bg-accent`.
    - Master Peak over: `enabled:hover:bg-destructive/15 enabled:active:bg-destructive/15`, as a **separate** `cn` argument. The string `'border-destructive bg-destructive/15 text-destructive'` stays byte-identical, because TH10 counts it.
- **R3. Fields keep their border.** The spec removes the border on **buttons** only, while the radius applies to buttons and fields. The four fields therefore change only `rounded-sm` → `rounded-md`:
  - BPM input (`border-outline-strong`, kept by V-1b/TH5);
  - the grid-division select;
  - the waveform-zoom select (its on-state keeps `border-accent bg-accent/20`);
  - the marker name input.
- **R4. 16 px controls become pill or circle shapes.** An 8 px radius on the 16 px-high marker `+`, ◀ and ▶ buttons and on the metronome makes the ends fully round. The 16×16 `+` becomes a circle.
  - This is the spec taken literally: no exception for small controls.
  - It changes no box. C records 4× crops so Saba can veto it.
  - The 20 px Master buttons and the 24 px Snap and Env buttons get 8 px rounded corners.
- **R5. Not in this slice:**
  - the demo badge span (`StudioWorkspace` l.2210, not a button);
  - the exit link's `rounded-sm` (l.2197, a borderless link);
  - the marker flag label chip (`ArrangementMarkerRow` l.811, a label, not a button). It is recorded in the V-3c-4c inventory as a question;
  - row dividers, which are structural borders.

## 1. What changes (exact; line numbers at `330f1f3`)
| ID | File / lines | Change |
|---|---|---|
| W2 | `StudioWorkspace.tsx` l.2285 (Snap base) | `rounded-sm` → `rounded-md`. `border-outline` → SURF. Add MOTION. `border`, `h-6`, `px-1.5`, `text-xs`, `leading-none`, `text-muted`, `hover:text-foreground` and the focus tokens stay. |
| W3 | `StudioWorkspace.tsx` l.2286 (Snap on) | Append `enabled:hover:bg-accent/20 enabled:active:bg-accent/20`. The rest of the string is unchanged. |
| W4 | `StudioWorkspace.tsx` l.2365–2366 (Env base + on) | The same as W2 + W3. |
| W5 | `StudioWorkspace.tsx` l.2326 (grid select), l.2384 (waveform-zoom select) | Only `rounded-sm` → `rounded-md`. l.2386 is unchanged. |
| T1 | `ArrangementTempoRow.tsx` l.241 (Metronome base) | `rounded-sm` → `rounded-md`. `border-outline` → SURF. Add MOTION. `disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted` stay. |
| T2 | `ArrangementTempoRow.tsx` l.242 (Metronome on) | Append `enabled:hover:bg-accent/20 enabled:active:bg-accent/20`. |
| T3 | `ArrangementTempoRow.tsx` l.230 (BPM input) | Only `rounded-sm` → `rounded-md`. |
| K2 | `ArrangementMarkerRow.tsx` l.51 (`MARKER_HEADER_BUTTON_CLASS`) | `rounded-sm` → `rounded-md`. `border-outline` → SURF. Add MOTION. `MARKER_STEP_BUTTON_CLASS` (l.52) keeps its formula unchanged. The add button keeps using the base const, with no `inline-flex`. |
| K3 | `ArrangementMarkerRow.tsx` l.847 (marker name input) | Only `rounded-sm` → `rounded-md`. |
| X1 | `ArrangementMaster.tsx` l.108–111 (Master Peak) | <ul><li>Base: `rounded-sm` → `rounded-md`; add SURF and MOTION.</li><li>The clear string `'border-outline text-muted hover:border-outline-hover hover:text-foreground'` becomes `'text-muted hover:text-foreground'`.</li><li>The over string stays byte-identical.</li><li>Add a third `cn` argument: `over && 'enabled:hover:bg-destructive/15 enabled:active:bg-destructive/15'`.</li></ul> |
| X2 | `ArrangementMaster.tsx` l.170–173 (Master Mute) | <ul><li>Base: `rounded-sm` → `rounded-md`; add SURF and MOTION.</li><li>The off string `'border-outline text-muted hover:text-foreground'` becomes `'text-muted hover:text-foreground'`.</li><li>The on string becomes `'border-accent bg-accent text-background enabled:hover:bg-accent enabled:active:bg-accent'`.</li></ul> |
| D1 | `docs/implementation/2026/quarter-IV/135-studio-v3c3b-marker-detail-grid-exit-icons.md` | Exactly the status line **l.4** → `**სტატუსი:** Completed (C round 166 PASS; published 330f1f3)`. This is gate 166 review suggestion 1. If the l.154 TODO waits on "C round 166", it may be marked done in the same edit; nothing else changes. |
| D2 | **new** `docs/implementation/2026/quarter-IV/136-studio-v3c4a-toolbar-button-surfaces.md` | <ul><li>Follows `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English.</li><li>Contents: R1–R5, the §0.1 probe table, the split and the 4b/4c inventory reference, the token sets before and after, tests and mutations.</li><li>TODO: V-3c-4b, V-3c-4c, V-3c-5, DUX-R-5, M1/M3/M4, and the checkpoint Q1 fallback (c).</li><li>Status: `In Progress (awaiting C round 167)`.</li></ul> |

**Not allowed:**
- `app/styles/**`, `ArrangementTransport.tsx`, any other component, `package.json`;
- `style=`, custom CSS, a hex value, a new token, or any arbitrary `[...]` value other than the four MOTION tokens;
- any UI text (`strings.ts` or JSX text), icon, size, padding, position, aria or `data-*` change. The class-string edits in §1 are the only allowed string changes;
- any change to handlers, focus or keyboard logic;
- a shared constant or component across files (fallback (c)).

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | W2–W5 only (4 class sites, no other hunk) |
| `app/components/arrangement/ArrangementTempoRow.tsx` | T1–T3 |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | K2, K3 |
| `app/components/arrangement/ArrangementMaster.tsx` | X1, X2 |
| `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | Add **TS8**. Nothing else. |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | Add **UI11**. Nothing else. |
| `app/lib/arrangement/__tests__/marker-strings-ui.test.tsx` | Add **MS5**. Nothing else. MS4 stays green and unchanged. |
| `app/lib/arrangement/__tests__/header-meter-envelope-strings-ui.test.tsx` | Add **HM7**. Nothing else. |
| `docs/…/135-studio-v3c3b-marker-detail-grid-exit-icons.md` | D1 only |
| **new** `docs/…/136-studio-v3c4a-toolbar-button-surfaces.md` | D2 |

**New locks.** Use each file's existing mount helper. Token checks split `className` on whitespace.
- **Mount check:** B confirmed at planning that `ArrangementMaster` has no early return, and that the Snap/Env toolbar renders unconditionally in `StudioWorkspace`. The TS8 targets should therefore mount with transport-surface-ui's fakes, even though they have no `createAnalyser`, so the master meter tap is `null`.
- **Fallback:** if a TS8 target does not render in that mount, move its assertions to HM7 (Master) or MS5 and say so in the report. Do not touch frozen files.
- **TS8, StudioWorkspace and Master toolbar surfaces** (in transport-surface-ui):
  - **Snap and Env, off:** the tokens include `border`, `border-transparent`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`, `rounded-md`, the 4 MOTION tokens, `text-muted` and `hover:text-foreground`. They exclude `border-outline` and `rounded-sm`.
  - **Snap and Env, on** (click each): the tokens include `border-accent`, `bg-accent/20`, `text-accent`, `enabled:hover:bg-accent/20` and `enabled:active:bg-accent/20`. They exclude `bg-foreground/5`, `border-transparent` and `enabled:hover:bg-foreground/8`, which twMerge drops. `aria-pressed` is `true`.
  - **Grid select and waveform-zoom select:** the tokens include `rounded-md` and `border-outline`, and exclude `rounded-sm` and `bg-foreground/5`.
  - **Master Mute:** off has the SURF, `rounded-md` and MOTION tokens, with no `border-outline`. Click it: on has `border-accent`, `bg-accent`, `text-background`, `enabled:hover:bg-accent` and `enabled:active:bg-accent`, with no `bg-foreground/5`.
  - **Master Peak, clear state:** it has the SURF, `rounded-md` and MOTION tokens, `text-muted` and `hover:text-foreground`. It has no `border-outline`, no `hover:border-outline-hover` and no `enabled:hover:bg-destructive/15`.
- **UI11, Metronome and BPM input** (in metronome-ui):
  - **No tempo:** the toggle is disabled and has the SURF, `rounded-md` and MOTION tokens, with `disabled:opacity-50` kept and no `border-outline`.
  - **At 120 BPM, after a click:** it is pressed and has `border-accent`, `bg-accent/20`, `enabled:hover:bg-accent/20` and `enabled:active:bg-accent/20`, with no `bg-foreground/5`.
  - **BPM input:** it has `rounded-md` and `border-outline-strong`, with no `rounded-sm`.
- **MS5, marker header buttons and name input** (in marker-strings-ui):
  - **Add, prev and next:** each has the SURF, `rounded-md` and MOTION tokens, `text-muted` and `hover:text-foreground`, with no `border-outline` and no `rounded-sm`.
  - **Prev and next** still have `inline-flex items-center justify-center`; **add** has no `inline-flex`.
  - **The name input** (open it as MS1 does): it has `rounded-md` and `border-brand`, with no `rounded-sm`.
- **HM7, Master Peak over state** (in header-meter-envelope-strings-ui; HM6's flow):
  - **Over:** the peak has `border-destructive`, `bg-destructive/15`, `text-destructive`, `enabled:hover:bg-destructive/15` and `enabled:active:bg-destructive/15`, with no `bg-foreground/5` and no `border-transparent`.
  - **After the click that resets it:** it has `bg-foreground/5` and `border-transparent`, with no `enabled:hover:bg-destructive/15`.

**Read before editing** (`.claude/rules/read-primitives.md`):
- `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md` and `DESIGN_TOKENS.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `330f1f3` stays empty for:
- the purchase and auth files: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`;
- shared UI and styles: `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/styles/**`, `app/components/icons/**`;
- `ArrangementContext.tsx`, `ArrangementTransport.tsx`, every other Arrangement component, `strings.ts`, `studio-lab.tsx`, docs 127–134;
- the frozen neighbour tests in the vitest list: `studio-theme-obsidian`, `markers-ui`, `master-ui`, `grid-snap-menu`, `clip-envelope-ui`, `metronome-horizon-ui`, `waveform-zoom`, `meter-ui`.

**Not allowed:** any other file; commit, push, stash, install, revert, or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes are only for temporary mutations, restored and sha-verified.

**B grep at planning (at `330f1f3`):**
- **Class assertions today:**
  - No test asserts the classes of Snap, Env, the selects, Metronome, the marker header buttons, the name input, Master Mute or the Peak clear string.
  - TH10 (`studio-theme-obsidian` l.366–368) counts the Peak over string and checks Master Mute `font-medium`.
  - TH5 checks the field `border-outline-strong`, and OV1 checks `rounded-sm` on the Overview (not touched).
  - MS4 checks that the marker add button has no `inline-flex`.
- **TS-plain** (`transport-surface-ui` l.243–268) covers only the 12 transport buttons.
- **No e2e spec** asserts these classes.

## 3. A — tests and commands (speed rules)
- **Baseline:** run the 12 files in `b-round-166-r167-vitest-base.txt`. Expect **176/176**; B ran it at `330f1f3` (`b-round-166/out/vitest-base.json`). Save the list as `a-round-167/vitest-files.txt` and the result as `a-round-167/vitest-baseline.json`.
- **After the edits:**
  - Run the same 12 files. Expect 176 plus the new `it`s (TS8, UI11, MS5, HM7), all green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 8 code and test files.
- **`expect(` counts:** record them per granted test file, before and after. At `330f1f3` they are transport-surface-ui 67, metronome-ui 72, marker-strings-ui 40 and header-meter-envelope-strings-ui 17. A drop needs a reason.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; one JSON per mutation in `a-round-167/mutations/`):
  - **m192:** Snap base `border-transparent` → `border-outline`. TS8 turns red.
  - **m193:** drop `enabled:hover:bg-accent/20` from the Env on-string. TS8 turns red.
  - **m194:** Metronome base `rounded-md` → `rounded-sm`. UI11 turns red.
  - **m195:** add `inline-flex` to `MARKER_HEADER_BUTTON_CLASS`. MS4 and MS5 turn red.
  - **m196:** drop the third Peak `cn` argument. HM7 turns red.
  - **m197:** Master Mute on-string without `enabled:hover:bg-accent`. TS8 turns red.
  - **m198:** BPM input `rounded-md` → `rounded-sm`. UI11 turns red.
  - Do not use a mutant that only removes a MOTION token's `!`. It may be equivalent in jsdom; if you add one, report whether it was killed.
- **Code-reviewer: required** (more than 3 changed files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 976 files are OK, and the protected diff vs `330f1f3` is empty.
  - `git status --short` = the changed grants as ` M` (report any grant not needed) + 1 `??` (doc 136), nothing else.
  - Write `a-round-167/end-sha256.txt` (all changed paths + doc 136) and `a-round-167/diff-vs-start.patch` (vs `b-round-166/r167-granted-start/`, plus doc 136 as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready`. A session with a non-200 Google Fonts response is environment-invalid; replace it at most twice.
- One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE).
- Copy the tools you reuse (`b-round-166/tools/*`, `c-round-166/tools/d6.cjs`) unchanged into `c-round-167/tools/` and check the d6 sha256 (`3abc88fe…`). B's probe is `b-round-166/v3c4a-probe.cjs`; its `measureSites` uses a canvas colour parse, because Tailwind v4 emits oklab.
- Write nothing under earlier `c-round-*/out/`; every run writes a uniquely named output.

| Row | Check |
|---|---|
| T167-TARGETED | Re-run `a-round-167/vitest-files.txt`. The counts equal A's, and TS8, UI11, MS5 and HM7 are present and green. |
| SOURCE-SCOPE | <ul><li>HEAD is `330f1f3`.</li><li>The frozen 976 files are OK at start and at end.</li><li>The end hashes equal `a-round-167/end-sha256.txt`.</li><li>`git status` = the changed grants as ` M` plus doc 136 as `??`, nothing else.</li><li>The protected diff vs `330f1f3` is empty (§2 list).</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | C reads the diff vs `b-round-166/r167-granted-start/` itself:<ul><li>Each component changes only its §1 IDs, as class tokens only. `StudioWorkspace.tsx` changes exactly the 4 class sites.</li><li>The on-state strings are byte-identical apart from the R2 appends, and the Peak over string is byte-identical.</li><li>The only arbitrary values are the 4 MOTION tokens.</li><li>No text, aria, handler, size or padding token changed.</li><li>The test files only add TS8, UI11, MS5 and HM7. Count `expect(` per file; a drop needs a reason.</li><li>Doc 135 changes only l.4 (and the l.154 TODO if A used that allowance), and doc 136 exists with the D2 sections.</li></ul> |
| SURF-V3C4A | Both viewports, in the 4 states below.<ul><li>**States:**<ul><li>**S0:** default.</li><li>**S3:** Snap on, Env on, BPM 120, Metronome on, Master Mute on.</li><li>**S4:** Master Peak over, if C can produce a real overload (for example, the demo playing with the master fader and the clip gain at the maximum). If it cannot be produced, record S4 as not run with the reason; HM7 covers it.</li><li>**S5:** the marker name editor open (M).</li></ul></li><li>**On each of the 8 buttons** (Snap, Env, Metronome, marker add/prev/next, Master Peak, Master Mute), record the computed values: `border-top-color` (transparent in the off state; accent or destructive in the on state), `border-top-width` 1 px, `border-radius` 8 px, the `background-color` at rest, the hover and active backgrounds (from a real mouse hover and a held mouse button), `transition-property` (includes `background-color` and `color`), `transition-duration` 0.18 s and the timing function `cubic-bezier(0.2, 0.8, 0.2, 1)`.</li><li>**On-states:** hover and active keep the on-fill (`bg-accent/20`, `bg-accent`, or `bg-destructive/15` in S4).</li><li>**Under `reducedMotion: 'reduce'`** (one extra context per viewport): `transition-property` is `none` on at least Snap and Master Mute.</li><li>**Fields** (BPM input, grid select, waveform-zoom select, marker name input): radius 8 px, and the border colour equals the `330f1f3` value (B probe: rgb(115,107,96) for BPM and rgb(36,33,30) for the selects).</li><li>**4× crops** of the marker header buttons, Metronome, Master Mute + Peak, and Snap/Env in S0 and S3, for R4.</li></ul> |
| BOX-V3C4A | Raw `getBoundingClientRect` values (0.01 px) of the 11 controls in S0 and S3 at both viewports, compared with the `before.box` values in B's `b-round-166/out/v3c4a-probe.json`, which were measured at `330f1f3` in the same states.<ul><li>**Expected:** 0.00 px on every control.</li><li>The marker name input (S5) has no B baseline. Its change is radius only, so it is checked by SURF and RV1, not here.</li><li>The rest of the page is covered by RV1-V3C4A.</li><li>Any delta > 0.5 px is a finding.</li></ul> |
| CONTRAST-V3C4A | <ul><li>Measure contrast on the composited background with a real canvas colour parse; do not regex-parse `rgb()`.</li><li>**Off-state text at rest:** ≥ 4.5:1 (B predicts 5.98). **On hover:** ≥ 4.5:1 (B predicts 12.35). **On-states:** ≥ 4.5:1 (B: 5.48 / 8.32).</li><li>A disabled control (the metronome without a tempo) is reported but exempt. It was already below 3:1 at `330f1f3` (2.59).</li><li>Any enabled control below 4.5:1 is a finding.</li></ul> |
| RV1-V3C4A | <ul><li>Run the copied `d6.cjs` (sha256 `3abc88fe…`) unchanged, **one run** per viewport.</li><li>Compare S0/S1/S2 with **`c-round-166/out/d6/d6-{1440,1280}-r1.json`**. **No key renames** are expected; this round is class-only.</li><li>Expected: 0 missing and 0 added keys, and every x/y/w/h within ±0.5 px.</li><li>Contrast entries for the converted buttons may drop because of the composited fill (to about 5.98 for muted text). Every enabled entry stays at or above its d6 threshold. The set of failing entries equals the reference set; the pre-existing disabled entries may differ by ≤ 0.1 in ratio.</li><li>A new failing entry, a key change, or any box delta > 0.5 px is a finding.</li></ul> |
| FUNC-SMOKE-V3C4A | Each control still does its real action at both viewports, with real mouse clicks at the button centre:<ul><li>Snap toggles: status `Snap on — …` / off, and `aria-pressed` flips. `G` still toggles Snap.</li><li>Env toggles `aria-pressed`, and `A` still toggles it.</li><li>The grid select changes the division (status).</li><li>The waveform-zoom select changes the zoom (status).</li><li>Type 120 + Enter in BPM: the metronome becomes enabled, and a click turns it on (pressed).</li><li>Play plays real audio: the tap peak is > 0 and the playhead advances about 1.5 s in 1.5 s.</li><li>Marker: M + name + Enter at 2 s and 6 s, then add/prev/next step the playhead as in round 166.</li><li>Master Mute: during playback, a click makes the tap peak fall below 0.001 within 500 ms (the gain is smoothed), and a second click brings it back above 0. The tap is downstream of the mute:<ul><li>`graph.client.ts` l.177 is `master.connect(ctx.destination)`, and the master gain is 0 when muted (`model.ts` l.497).</li><li>`tapInit` in `lib122.cjs` analyses whatever connects to the `AudioDestinationNode`.</li><li>Round 164 ENV-FUNC is the precedent: gain 0 gave peak 0.00000.</li></ul></li>
<li>**Triplets checked icon (closes C-R166-TRIPLET-CHECKED-BROWSER):** at BPM 120, right-click the music lane body, click Triplets (3), then reopen the menu. Triplets holds exactly one `svg.lucide-check`. The other checks are only on the checked division and on Snap if it is on. This is a note row about round-166 code; a failure is a finding against V-3c-3b, not against A's round-167 work.</li><li>A Master Peak click resets the readout.</li></ul> |
| G167-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (code unchanged since C verified it in rounds 158–166): the transport rows, the dock, lane, group, clip and library rows, the icon rows of round 166, ENV-VIS, OV-CORNERS and the MK-* rows. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Snap / grid / waveform zoom controls and their shortcuts | FUNC-SMOKE-V3C4A, T167-TARGETED (`grid-snap-menu`, `waveform-zoom`) |
| Envelope mode | FUNC-SMOKE-V3C4A, T167-TARGETED (`clip-envelope-ui`) |
| Metronome and tempo entry | FUNC-SMOKE-V3C4A, T167-TARGETED (`metronome-ui`, `metronome-horizon-ui`) |
| Marker header buttons and the name editor | FUNC-SMOKE-V3C4A, T167-TARGETED (`markers-ui`, `marker-strings-ui`) |
| Master Mute and Peak readout, header layout | FUNC-SMOKE-V3C4A, BOX-V3C4A, RV1-V3C4A, T167-TARGETED (`master-ui`, `meter-ui`) |
| Obsidian theme locks (TH5, TH10, OV1) | T167-TARGETED (`studio-theme-obsidian`) |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Borderless filled toolbar buttons with an 8 px radius and a hover fill | None used. Source: the user-approved `visual-direction-a.md` § „ღილაკები და ზედაპირები“. No Live 12 manual section was opened this planning. | Not checked. | **Not applicable; a CZABA brand decision.** Behaviour, shortcuts and focus are unchanged, and the look is not claimed to match Live. | Requirement: SURF-V3C4A, BOX-V3C4A, CONTRAST-V3C4A, RV1-V3C4A, FUNC-SMOKE-V3C4A. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-167.md`, `a-round-167-result.json` and `a-round-167/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-167.md` and `c-round-167.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the SURF, BOX, CONTRAST and RV1 tables (both viewports). Put tools, out and shots in `c-round-167/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 168 planning)
| Condition | Round 168 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, plus `npm run test:e2e:smoke`. Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on BOX-V3C4A (> 0.5 px) or CONTRAST-V3C4A (an enabled control < 4.5:1) | A fix-up within R1–R3 using C's measurements, or the site is recorded as a question for Saba. It is not deferred silently. |
| C FAIL Low only | A bounded fix-up if it is in V-3c-4a's own code and cheap; otherwise `deferred_low_polish`, and V-3c-4b goes ahead. |
| C PASS | Root publishes round 167. V-3c-4a → **მზადაა**. Round 168 = **V-3c-4b** (Lane and Group header Mute/Solo, Lane video-import buttons; inventory in `backlog.json`). |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on a C PASS, publish round 167: the changed granted paths plus the new doc 136, vs `330f1f3`. `app/styles/**`, `ArrangementTransport.tsx`, `ArrangementContext.tsx`, `strings.ts`, the other Arrangement components and the purchase/auth files are unchanged.
- **Architecture checkpoint, repeated at the feature boundary** (the end of the V-3 glyph work). `b-round-160-checkpoint-request.md` and its addendum `b-round-165-checkpoint-request.md` are still unanswered. This round uses fallback (c).
  - **V-3c-4b and 4c will copy the same SURF + MOTION token set into 5 more components**, so Q1 (a shared recipe) and Q2 (the global transition rule) now have their highest value. An answer before V-3c-4b planning changes that work.
  - **The gate-166 reviewer** noted that the icon stroke/size convention repeats across the V-3c rounds. That is Q3, recorded as a signal only.
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - R1, the borderless fill on these toolbar buttons;
  - R2, the on-states keep their colours on hover;
  - R3, fields keep their border;
  - R4, the 16 px controls become pill or circle shapes.
- **Open from round 166 (for Saba):** the exit link's accessible name is `CZABA` (R3 of round 166). The gate reviewer suggested `aria-label="Back to CZABA"` as an option. It is recorded as a user question and is not scheduled.
