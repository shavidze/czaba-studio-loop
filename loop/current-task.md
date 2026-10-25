# CURRENT TASK — Round 172: V-3c-5a — 10 px panel radius: a new `--radius-panel` token; the Detail panel boxes, the video dock frames and the Grid and Marker menus take it; nothing moves

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z137** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c5a_plan_d29z137`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-171.md`, an exact copy of the round-171 `current-task.md` (sha256 `75df5427de58f7a5…`, checked with `cmp`). Rationale for this round: `b-round-171.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ღილაკები და ზედაპირები“ (l.86): "buttons and fields 8 px, **panels 10 px**. This has no effect on layout." The spec is source material only; it grants no permissions.
- **User decision files:** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` were re-read; every ABL-R/DUX-R id in them is already in `backlog.json`. `docs/technical/store-redesign/direction-decision.md` (direction A) concerns STORE-REDESIGN, which is queued after VISUAL-A. Nothing in them changes this stage.

## Baseline = HEAD `13ad2bd`, clean tree (gate 171 published)
- **Gate:** `gates/gate-round-171.json` status `published`, commit `13ad2bd63db5fe1fcc9d413d6989fb83d3e6243d`, on both remotes.
- **Tree:** `git status --short` is empty; `git ls-files -co --exclude-standard` lists **990** files.
- **Frozen list:** `b-round-171-r172-tree-sha256.txt`, **983 entries** (990 minus the 7 grants).
- **Grants:** `b-round-171-r172-grants.txt` (7 existing files). **New files:** `b-round-171-r172-new-files.txt` (2: the new test file and doc 141).
- **Start hashes:** `b-round-171-r172-granted-start-sha256.txt`. **Start copies:** `b-round-171/r172-granted-start/`.
- **Line numbers** below were grepped by B at `13ad2bd`.
- **A's first step:** HEAD = `13ad2bd`, clean tree, `sha256sum -c --quiet b-round-171-r172-tree-sha256.txt` OK, the 7 start hashes match, the 2 new files do not exist. If anything differs, stop and report.

## 0. Why this round (D-29z137)
- **Round 171: C PASS**, `browserVerified` and `realVerified` true. Root published `13ad2bd` (review 9/10, nothing blocking). **V-3c-4c-3 → მზადაა; V-3c-4 is complete.** C's two new findings (C-R171-01, C-R171-02) are pre-existing Lows outside the edited lines → `deferred_low_polish`.
- **Outcome fixed in advance** (`tasks/round-171.md` §7, "C PASS"): round 172 = **V-3c-5**, unless the regression is due or root answered the checkpoint with "extract".
  - Regression: `regression-last.json` = 2026-10-24 → due on/after 2026-10-27; today is 2026-10-25 → not due.
  - Checkpoint `b-round-170-checkpoint-request.md`: **no answer** → fallback (c) continues; B does not schedule the extraction on its own.
  - No Critical, High or Medium finding is open (Tech Lead manual items aside).
- **V-3c-5 is split by owner (scope unchanged):**
  - **V-3c-5a (this round):** the token + the framed and floating boxes that are clearly panels (Detail panel, video dock, Grid and Marker menus).
  - **V-3c-5b (next):** the Overview (root, outline overlay and view frame together, OV1) — it needs its own probe because the view frame has no minimum width and 10 px turns a narrow frame into a capsule — plus the radius rulings for the remaining 6 px controls (Transport timecode readout l.159, Library preview waveform l.251, `← CZABA` link l.2197).

### 0.1 How 10 px is expressed (R21)
- Tailwind's scale here has no 10 px step: `rounded-sm` 6 px, `rounded-md` 8 px, `rounded-lg` 12 px (`app.css` l.130–132). An arbitrary `rounded-[10px]` is **not allowed**.
- **R21:** add **one** theme token in the `@theme` block of `app/styles/app.css`, on a new line directly after l.131 (`--radius-md`):
  `  --radius-panel: 0.625rem; /* 10px - Studio panels */`
  (the comment follows the existing token-table style of l.130–134; if A prefers no comment, `  --radius-panel: 0.625rem;` is also accepted). Tailwind v4 then emits the `rounded-panel` utility (`border-radius: var(--radius-panel)`).
- **Why `@theme` and not the obsidian block:** a variable that only exists in the scoped `[data-studio-theme="obsidian"]` block does not generate a utility, and TH1 locks that block as an exact token map. Overriding `--radius-lg` in the scope was rejected: `body:has(...)` also reaches the portalled `Modal.tsx`, whose `rounded-lg` buttons would change. No Store file uses `rounded-panel`, so the global token changes nothing outside Studio.
- B has no compiled-class probe: the class does not exist until A adds the token. Border radius cannot change `getBoundingClientRect` boxes; C measures the real class (BOX row).

### 0.2 Inventory and rulings (all user-vetoable in `feature-status.md`)
**What counts as a panel (R22):** a framed or floating box that holds content (border and/or own surface, not a button, field, chip, clip or handle). The docked regions (library sidebar, Detail panel body, transport, dock strip) have **no radius today** and are separated by straight dividers; rounding them would leave corner notches against the neighbouring dividers (the SABA-B-2 failure mode) or need new margins (a layout change). They stay square. This is B's interpretation of "panels 10 px", recorded as vetoable.

| ID | Site (at `13ad2bd`) | Today | Ruling |
|---|---|---|---|
| P1 | `ArrangementDetailPanel.tsx` l.221, waveform / video box (`arrangement-detail-waveform`) | `rounded-sm` | → `rounded-panel` (R22) |
| P2 | `ArrangementDetailPanel.tsx` l.702, group-state reason box (parent of `arrangement-detail-reason`) | `rounded-sm` | → `rounded-panel` (R22) |
| P3 | `ArrangementVideoDock.tsx` l.901, floating placeholder (`arrangement-video-placeholder`, dashed) | `rounded-sm` | → `rounded-panel` (R22; was R19's deferral) |
| P4 | `ArrangementVideoDock.tsx` l.920, video box (`arrangement-video-box`, compact and floating) | `rounded-sm` | → `rounded-panel` (R22; was R19's deferral) |
| P5 | `ArrangementGridMenu.tsx` l.175, menu container (`role=menu`) | `rounded-md` | → `rounded-panel` (R23) |
| P6 | `ArrangementMarkerMenu.tsx` l.126, menu container (`role=menu`) | `rounded-md` | → `rounded-panel` (R23) |

- **R23. Menus are floating panels** (`fixed z-50 border bg-surface p-1 shadow-lg`) → 10 px. **Their item rows stay `rounded-sm` (6 px)** (GridMenu l.11, MarkerMenu l.8): with `p-1` (4 px) inside a 10 px container, 6 px is the concentric inner radius (10 − 4). Vetoable; the alternative (8 px rows) is recorded.
- **R24. Out of V-3c-5, with reasons:**
  - `Modal.tsx` container `rounded-xl` (16 px) and its `rounded-lg` buttons: **protected shared file**. Recorded as question **Q-V3C5-MODAL-RADIUS** for Saba/root (does the Export dialog panel follow the 10 px rule? it would need a Modal prop or an approved Modal change). Not a task.
  - Clips (`ArrangementClip` l.823), drop ghosts and range overlays (`ArrangementLane` l.884/l.920 and their labels l.900/l.934), the Loop brace (l.237), clip-name tabs (`rounded-br-sm`), envelope and fade handles (`rounded-xs`), the ruler handle (`rounded-b-sm`), the meter (`rounded-l-full`), group overview blocks (`ArrangementGroupHeader` l.353), Overview clip bars (l.315): timeline objects and handles, not panels or buttons. Unchanged.
  - The demo badge chip (`StudioWorkspace` l.2210) and the marker flag chip (`ArrangementMarkerRow` l.811, R20): chips. Unchanged.
  - The Export dialog footer strip (FS1): a divider.
  - **V-3c-5b** sites listed in §0 (Overview; the remaining 6 px controls).

## 1. What changes (exact; line numbers at `13ad2bd`)
| ID | File / lines | Change |
|---|---|---|
| T1 | `app/styles/app.css`, new line after l.131 | R21 token line, inside `@theme`, nothing else in the file changes |
| P1 | `ArrangementDetailPanel.tsx` l.221 | `rounded-sm` → `rounded-panel` |
| P2 | `ArrangementDetailPanel.tsx` l.702 | `rounded-sm` → `rounded-panel` |
| P3 | `ArrangementVideoDock.tsx` l.901 | `rounded-sm` → `rounded-panel` |
| P4 | `ArrangementVideoDock.tsx` l.920 (the base string of the `cn()` call) | `rounded-sm` → `rounded-panel` |
| P5 | `ArrangementGridMenu.tsx` l.175 | `rounded-md` → `rounded-panel` |
| P6 | `ArrangementMarkerMenu.tsx` l.126 | `rounded-md` → `rounded-panel` |
| L1 | `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` l.128 `WAVEFORM_BOX_CLASS` | `rounded-sm` → `rounded-panel` in this one constant (its exact-string lock at l.358 follows P1). Nothing else in the file changes. |
| D1 | `docs/implementation/2026/quarter-IV/140-studio-v3c4c3-export-dialog-video-dock-surfaces.md` | l.4 exactly `**სტატუსი:** Completed (C round 171 PASS; published 13ad2bd)`; the l.114 TODO ("C round 171-ის ბრაუზერის მტკიცებულება…") may be struck through. Nothing else. |
| D2 | **new** `docs/implementation/2026/quarter-IV/141-studio-v3c5a-panel-radius.md` | `docs/implementation/TEMPLATE.md`, Georgian with English technical terms: R21–R24, the §0.2 table, the token before/after, tests and mutations; known trade-off: the global `@theme` token (unused by Store); TODO: V-3c-5b (Overview + remaining 6 px controls), Q-V3C5-MODAL-RADIUS, DUX-R-5, M1, M3, M4, the checkpoint request. Status `In Progress (awaiting C round 172)`. |

**Not allowed:**
- any other line of `app.css`, the obsidian block, any other token; `Modal.tsx` and every other component; `strings.ts`; `package.json`;
- `style=`, custom CSS, hex values, `rounded-[...]` or any new arbitrary value;
- any text, icon, size, padding, gap, border, colour, shadow, position, aria, title, `data-*` or `role` change; any handler, focus, keyboard, drag, video, export, menu-logic or `cn()` structure change;
- the menu item rows (R23), the Overview (V-3c-5b) and every R24 site.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/styles/app.css` | T1 only |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | P1, P2 only |
| `app/components/arrangement/ArrangementVideoDock.tsx` | P3, P4 only |
| `app/components/arrangement/ArrangementGridMenu.tsx` | P5 only |
| `app/components/arrangement/ArrangementMarkerMenu.tsx` | P6 only |
| `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | L1 only (the usual "existing tests unchanged" rule is lifted for this one constant because it is an exact-string lock of P1) |
| **new** `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx` | PNR1–PNR3 (below) |
| `docs/…/140-…md` | D1 only |
| **new** `docs/…/141-studio-v3c5a-panel-radius.md` | D2 |

**New locks** (B grepped `app`, `e2e`, `docs` and `backlog.json` at `13ad2bd`: `PNR1`–`PNR3`, `rounded-panel` and `--radius-panel` are used nowhere; `PR1`–`PR3` are taken by `export-progress.test.ts`, so do not use them). Token checks split `className` on whitespace. Follow the patterns of `studio-theme-obsidian.test.tsx` (comment stripping, brace depth) and `video-dock-strings-ui.test.tsx` (mount helpers); copy small helpers into the new file rather than exporting from existing tests.
- **PNR1, the token.** In `app.css` with comments stripped: `--radius-panel: 0.625rem;` occurs exactly once, `--radius-panel:` occurs exactly once, its index is inside the `@theme {…}` block at brace depth 1, and the scoped obsidian block contains no `--radius-` property. `--radius-sm: 0.375rem;`, `--radius-md: 0.5rem;` and `--radius-lg: 0.75rem;` are still present once each.
- **PNR2, the sites (source).** Across every non-test file under `app/components` and `app/routes`, `rounded-panel` occurs exactly: `ArrangementDetailPanel.tsx` 2, `ArrangementVideoDock.tsx` 2, `ArrangementGridMenu.tsx` 1, `ArrangementMarkerMenu.tsx` 1, and nowhere else. The exact P1–P6 class strings each occur once (write them out in full; P4 is the `cn()` base string `'aspect-video shrink-0 overflow-hidden rounded-panel bg-background'`). The menu row constants (GridMenu l.11, MarkerMenu l.8) still contain `rounded-sm`.
- **PNR3, the sites (rendered).**
  - `arrangement-video-box` in the compact dock (with a loaded video source, via a mount like `mountDockWorkspace()`), and again after Expand video (floating): includes `rounded-panel`, `aspect-video`, `overflow-hidden`, `bg-background`; excludes `rounded-sm`, `rounded-md`. Floating also includes `fixed`, `ring-1`, `ring-outline`.
  - `arrangement-video-placeholder` (floating): includes `rounded-panel`, `border-dashed`, `border-outline`, `w-40`; excludes `rounded-sm`.
  - The group-state reason box (two clips selected, `selectClips([...])` as in `detail-panel-reason` RF1): the parent of `arrangement-detail-reason` includes `rounded-panel`, `border`, `border-outline`, `bg-background`, `px-2`, `py-1`; excludes `rounded-sm`.
  - The Grid menu and a Marker menu, opened the way `grid-snap-menu.test.tsx` / `markers-move-ui.test.tsx` open them: the `role="menu"` element includes `rounded-panel`, `border-outline`, `bg-surface`, `p-1`, `shadow-lg`; excludes `rounded-md`; each `role="menuitem…"` row still includes `rounded-sm`.
  - Unmount in `afterEach`/`finally`; restore every stub.

**Read before editing** (`.claude/rules/read-primitives.md`): `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`; `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (Studio files; no audio/video logic change); `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`; `GEORGIAN_DOCS.md`.

**Protected:** the diff vs `13ad2bd` stays empty for:
- **Purchase and auth:** `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`.
- **Shared UI:** `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/components/icons/**`, and every file under `app/styles/` except the T1 line.
- **Arrangement:** `ArrangementContext.tsx`, `ArrangementTransport.tsx`, `ArrangementOverview.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementExportDialog.tsx`, every other Arrangement component, `strings.ts`, `studio-lab.tsx`, docs 127–139.
- **Frozen neighbour tests:** every file in `b-round-171-r172-vitest-base.txt` except `detail-panel-polish.test.tsx` (L1). In particular `studio-theme-obsidian.test.tsx` (TH1, OV1), `video-dock-strings-ui.test.tsx` (VFR1) and `floating-video.test.tsx` stay unchanged.

**Not allowed:** any other file; commit, push, stash, install, revert or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Shell writes only for temporary mutations, each restored and sha-verified. No placeholder appends.

**B grep at planning (at `13ad2bd`):**
- `detail-panel-polish` l.128/l.358 is the only exact-string lock on a changed site (→ L1).
- `floating-video` checks `fixed`, `w-40`, `aspect-video`, `z-40` on the box and placeholder only; VFR1 checks the float buttons and Return (unchanged, l.60/l.911); OV1 checks the Overview (unchanged this round).
- TH1 locks the obsidian block as an exact map; T1 is outside it. TH-label checks only `--text-label*`/`--tracking-label` in `@theme`.
- No test asserts `rounded-md` on the menu containers or `rounded-sm` on P2–P4. `e2e/` has no hit for `rounded-md`, `rounded-sm`, `min-w-36`, `min-w-40`, `border-dashed`, `arrangement-video-box` or `role="menu"`.

## 3. A — tests and commands (speed rules)
- **Baseline:** the 20 files in `b-round-171-r172-vitest-base.txt`. Expect **357/357** (B ran it at `13ad2bd`: `b-round-171/out/vitest-base.json`). Save the list as `a-round-172/vitest-files.txt` (the 20 + the new file) and the result as `a-round-172/vitest-baseline.json`.
- **After the edits:** the 20 files + `panel-radius-ui.test.tsx`: expect 357 + PNR1–PNR3 (more `it`s allowed), all green. `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the changed code and test files.
- **`expect(` counts:** `detail-panel-polish` has 53 at `13ad2bd`; it must stay 53. Record the new file's count.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash before the next one; one JSON per mutation in `a-round-172/mutations/`):

  | Mutation | Change | Must turn red |
  |---|---|---|
  | m227 | T1 value `0.625rem` → `0.75rem` | PNR1 |
  | m228 | T1 line removed | PNR1 |
  | m229 | P1 back to `rounded-sm` | PNR2 and `detail-panel-polish` (l.358) |
  | m230 | P2 back to `rounded-sm` | PNR2 and PNR3 |
  | m231 | P4 back to `rounded-sm` | PNR2 and PNR3 |
  | m232 | P3 back to `rounded-sm` | PNR2 and PNR3 |
  | m233 | P5 back to `rounded-md` | PNR2 and PNR3 |
  | m234 | GridMenu row constant l.11 `rounded-sm` → `rounded-panel` | PNR2 and PNR3 |

- **Code-reviewer: required** (9 paths). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, every browser row.
- **End:** the 983 frozen files OK; protected diff vs `13ad2bd` empty; `git status --short` = the changed grants as ` M` (report any grant not needed) + 2 `??` (the new test, doc 141), nothing else; `a-round-172/end-sha256.txt` (all changed + new paths); `a-round-172/diff-vs-start.patch` (vs `b-round-171/r172-granted-start/`, new files as new).

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, fresh context per session, 1440×900 and 1280×720. Wait for `document.fonts.ready`, record font status in every session tool. A session with a non-200 Google Fonts response is environment-invalid (replace at most twice); one cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE).
- Copy reused tools into `c-round-172/tools/` unchanged: `c-round-171/tools/*` you need, `c-round-169/tools/d6.cjs` (sha256 `3abc88fe…`) and `c-round-170/tools/d6-fontwrap.cjs`. Clip add recipe: `b-round-170/tools/lib.cjs` `addAt`; video: `media/beeps-6s-h264-aac.mp4` through `arrangement-video-input` (`L.loadVideo`).
- **States:**
  - **D1:** `demo-middle-east` added on Music at 1 s and selected → the Detail panel waveform box (P1) shows real peaks.
  - **D2:** a second clip added (e.g. `demo-middle-east` on SFX at 1 s), then real-mouse click the first clip and **Ctrl+click** the second (`ArrangementClip.tsx` l.362–363: Ctrl/Meta toggles, Shift also adds) → group state, `arrangement-detail-reason` visible inside the P2 box. If the group state still cannot be reached, P2's browser half is `notRun` with the reason; a unit lock does not replace it and B will not mark P2 მზადაა.
  - **V0 / V1:** the dock with the real video, compact (P4) and floating (P3 + P4).
  - **G1:** the Grid menu open (P5). **K1:** a marker added and its menu open (P6).
- Write nothing under earlier `c-round-*/out/`; unique output names.

| Row | Check |
|---|---|
| T172-TARGETED | Re-run `a-round-172/vitest-files.txt`: counts equal A's; PNR1–PNR3, `detail-panel-polish` (l.358 lock), OV1, TH1, VFR1, `floating-video`, RF1 and the grid/marker menu tests present and green. |
| SOURCE-SCOPE | HEAD `13ad2bd`; the 983 frozen files OK at start and end; end hashes equal `a-round-172/end-sha256.txt`; `git status` = changed grants ` M` + 2 `??`; protected diff vs `13ad2bd` empty (§2 list incl. `Modal.tsx`, `ArrangementOverview.tsx`, `ArrangementExportDialog.tsx`, the obsidian block); no source change during C's phase. |
| AN-REVIEW | C reads the diff vs `b-round-171/r172-granted-start/` itself: `app.css` adds exactly the T1 line inside `@theme` and nothing else; P1–P6 change one radius token each and nothing else; the menu rows and the Overview are untouched; L1 changes one token in one constant; no arbitrary value, text, aria, role, title, handler, size, padding, colour or shadow change; the new test has PNR1–PNR3; `detail-panel-polish` `expect(` count still 53; doc 140 changes only l.4 (and the l.114 TODO); doc 141 exists with the D2 sections. |
| RADIUS-V3C5A | Both viewports, computed style on the real compiled class: P1 (D1), P2 (D2), P3 and P4 (V1), P4 (V0), P5 (G1), P6 (K1) each have `border-*-radius` **10px** on all four corners; the menu item rows **6px**; the Overview root, outline overlay and frame still **6px** (unchanged, V-3c-5b). Record border colour/width, background and box-shadow per site; they must be unchanged: compare with C round 171's dock JSON (`c-round-171/out/surf/`, V0/V1) where it exists; for the other sites record the value and state that no before-value exists (do not stash or revert A's work to make one). 4× crops of every corner pair for Saba's veto: P1 with real peaks touching the edges, P2, P3 dashed corners, P4 compact and floating over a **real video frame** (the video must be clipped by the rounded corner, no square video corner showing through), P5 and P6 with the row hover visible against the container corner. |
| BOX-V3C5A | Raw `getBoundingClientRect` (0.01 px) of every site above and their direct children/buttons in D1, D2, V0, V1, G1, K1 at both viewports, compared with C round 171's V0/V1 boxes (`c-round-171/out/box-v3c4c3.json`) for P3/P4 and the dock buttons. **P1, P2, P5, P6 have no earlier box JSON** (no state in d6 S0–S2 selects a clip or opens a menu): record their boxes and mark them "no before-value"; for them the 0 px claim rests on RV1 (page level) plus the fact that `border-radius` does not change layout boxes. Where a before-value exists, expected 0.00 px; any delta > 0.5 px is a finding. |
| RV1-V3C5A | The copied `d6.cjs` unchanged through `d6-fontwrap.cjs`, one run per viewport, compared with `c-round-171/out/d6/d6-{1440,1280}-r1.json`: 0 missing / 0 added keys, every x/y/w/h within ±0.5 px, the failing-contrast set equal to the reference. |
| FUNC-SMOKE-V3C5A | Real mouse at the centre (`elementFromPoint` hits the target), both viewports: **P1** click inside the waveform box behaves as before (record what it does at `13ad2bd` behaviour per `detail-panel` tests: no crash, selection kept) and Set selection still works on the selected clip; **P2** the group reasons read exactly as RF1 (`RANGE_GROUP_REASON`, `CLIP_GAIN_GROUP_REASON`); **P3/P4** Expand → floats, drag button + ArrowRight moves 16 px, Space plays and the floating video `currentTime` advances, placeholder Return and Escape return to compact with focus on Expand video; **P5** open the Grid menu, choose a different grid value, the menu closes and the grid readout changes, Escape on a reopened menu closes it with focus back on its opener; **P6** open a marker menu, rename or delete through it (one real action), Escape closes it. |
| G172-3 | `/studio-lab` anonymous with the demo badge; `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`; `GET /api/studio-token?product=middle-east&file=stem1.wav` → 401; Fake-Bearer 403: BLOCKED (backend unavailable in cloud). |
| PX-NET / REG-HYD | Every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror; expected cart noise allowed. |

- **Not re-run** (unchanged since C verified them in rounds 158–171): transport, toolbar, lane/group header, library/preview, Export dialog, clip, marker row, icon rows, ENV-VIS, OV-CORNERS. A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Harness facts:** single-lane ranges have no `arrangement-lane-range` testid (C-R170-LANE-RANGE-TESTID); there is no transport-container testid, so focus checks use the button's text (C-R171 note); a hover/active harness must release the mouse **inside** the dialog or menu, because a release on a backdrop closes it (C-R171-01).

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Detail waveform rendering, range overlay inside the box, group reasons and their `aria-describedby` | FUNC-SMOKE (P1/P2), T172-TARGETED (`detail-panel*`, `clip-gain-waveform`, `waveform-zoom`) |
| Floating video drag, keyboard move, Return, Escape, focus, playback sync | FUNC-SMOKE (P3/P4), T172-TARGETED (`floating-video`, `video-dock-strings-ui`, `library-video-return-focus`, `video-fades-ui`) |
| Grid and Marker menus: open, choose, Escape, focus return | FUNC-SMOKE (P5/P6), T172-TARGETED (`grid-snap-menu`, `markers-move-ui`, `marker-strings-ui`) |
| Theme and typography locks, render budget | T172-TARGETED (`studio-theme-obsidian`, `render-budget`) |
| Layout of every panel | BOX-V3C5A, RV1-V3C5A |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| 10 px rounded panels and menus | None used. Source: the user-approved `visual-direction-a.md` § „ღილაკები და ზედაპირები“. No Live 12 manual section was opened for this planning. | Not checked. | **Not applicable; a CZABA brand decision.** Behaviour unchanged; no claim that Live's panels look like this. | Requirement: RADIUS, BOX, RV1, FUNC-SMOKE (V3C5A). Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-172.md`, `a-round-172-result.json`, `a-round-172/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-172.md` and `c-round-172.json` (`browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun`, `invalidRuns`); the RADIUS and BOX tables for both viewports in the `.md`; tools, out and shots in `c-round-172/`.
- Write reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 173 planning)
| Condition | Round 173 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first (every done / c_pass item at both viewports, `npm run test:e2e:smoke`, the open evidence gap C-R167-METRONOME-UNDER-MUTE). Then the rows below. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on BOX (> 0.5 px) or a visual defect at a rounded corner (square video corner, clipped content that matters) | A fix-up within R21–R23 using C's measurements, or a question for Saba. Not deferred silently. |
| P2 group state not reachable in the browser | V-3c-5a is not მზადაა; round 173 schedules P2's browser half with a recipe, together with V-3c-5b if that stays ≤ 1 stage. |
| C FAIL Low only | Fix-up if in V-3c-5a's own lines and cheap; otherwise `deferred_low_polish`, and V-3c-5b goes ahead. |
| C PASS | Root publishes round 172. V-3c-5a → **მზადაა**. Round 173 = **V-3c-5b** (Overview 10 px with OV1 updated and a narrow-frame probe, plus the remaining 6 px control rulings), unless root answers the checkpoint with "extract", in which case B schedules the extraction as one bounded round first. |

At every planning B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md` and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on C PASS, publish round 172: the changed granted paths plus the 2 new files, vs `13ad2bd`. `Modal.tsx`, `ArrangementOverview.tsx`, `ArrangementExportDialog.tsx`, `strings.ts`, the obsidian block and the purchase/auth files unchanged.
- **Architecture checkpoint:** `b-round-170-checkpoint-request.md` is still unanswered (second planning). Fallback (c) continues; this round adds no SURF/MOTION copy.
- **STORE-0:** confirmed by B — `cloud/run.sh` l.127–131 starts `$LOOP/mock-api/server.mjs` (i.e. `tmp/studio-real-loop/mock-api/server.mjs`) when that file exists. The round-171 question is closed.
- **Question for Saba/root: Q-V3C5-MODAL-RADIUS** — the Export dialog's panel radius lives in the protected `Modal.tsx` (16 px container, 12 px buttons). Keep, or allow a bounded change so Studio dialogs use 10 px?
- **User-visible decisions** (vetoable in `feature-status.md`): R21 (global `rounded-panel` token), R22 (docked regions stay square; framed/floating boxes get 10 px), R23 (menus 10 px, rows stay 6 px concentric).
