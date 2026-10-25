# CURRENT TASK — Round 173: V-3c-5b — 10 px radius on the Overview (root, outline overlay and view frame together) and 8 px on two remaining 6 px controls; nothing moves

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z138** (`backlog.json` → VISUAL-A-OBSIDIAN `v3c5b_plan_d29z138`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-172.md`. It is an exact copy of the round-172 `current-task.md` (sha256 `529ad8f0fc98…`, checked with `cmp`). The rationale for this round is in `b-round-172.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ღილაკები და ზედაპირები“ (l.86): "buttons and fields 8 px, **panels 10 px**. This has no effect on layout." The spec is source material only and grants no permissions.
- **User decision files:** `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md` and `docs/technical/store-redesign/direction-decision.md` (direction A, STORE-REDESIGN) were re-read. Nothing in them changes this stage.

## Baseline = HEAD `3810816`, clean tree (gate 172 published)
- **Gate:** `gates/gate-round-172.json` has status `published` and commit `3810816ff0683b4246f4c4ca4f25067522fda35a` on both remotes.
- **Tree:** `git status --short` is empty, and `git ls-files -co --exclude-standard` lists **992** files.
- **Frozen list:** `b-round-172-r173-tree-sha256.txt`, with **986 entries** (992 minus the 6 grants).
- **Grants:** `b-round-172-r173-grants.txt` lists 6 existing files. **New files:** `b-round-172-r173-new-files.txt` lists 1 file (doc 142).
- **Start hashes** are in `b-round-172-r173-granted-start-sha256.txt`, and **start copies** are in `b-round-172/r173-granted-start/`.
- **Line numbers** below were grepped by B at `3810816`.
- **A's first step:** check that HEAD = `3810816`, the tree is clean, `sha256sum -c --quiet b-round-172-r173-tree-sha256.txt` is OK, the 6 start hashes match, and doc 142 does not exist. If anything differs, stop and report.

## 0. Why this round (D-29z138)
- **Round 172: C PASS**, with `browserVerified` and `realVerified` true. Root published `3810816` (review 9/10, nothing blocking). **V-3c-5a → მზადაა.**
- C's two new findings are pre-existing **Lows** that need layout changes outside this stage:
  - C-R172-01: at 1280 the group-reason text crosses the bottom border of the P2 box (caused by wrapping, not by the radius).
  - C-R172-02: Set selection adds a footer line and the Clip details panel jumps 20 px.
  - Both → `deferred_low_polish`.
- **The outcome was fixed in advance** in `tasks/round-172.md` §7, row "C PASS": round 173 = **V-3c-5b**.
  - Regression: `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Today is 2026-10-25, so it is not due.
  - The checkpoint (`b-round-170-checkpoint-request.md`) has **no answer**, so fallback (c) continues.
  - No Critical, High or Medium finding is open (Tech Lead manual items aside).
- **V-3c-5b completes V-3c-5.** It covers the Overview and the last 6 px controls that the round-172 inventory left open.

### 0.1 B's probe of the Overview at `3810816` (before writing; read-only)
Tool: `b-round-172/tools/probe-ov.cjs`. Output: `b-round-172/out/probe-ov.json`. It used real Chromium on `/studio-lab`, with fonts OK at both viewports.

| State | 1440×900 | 1280×720 |
|---|---|---|
| Overview root (`arrangement-overview`) box | x 300, y 118, **956 × 64**, radius 6px | x 300, y 156, **796 × 64**, radius 6px |
| Parent (no radius, no border) | 956 × 90 | 796 × 90 |
| Empty project (extent 10 s), zoom max 320 px/s: frame width | 274.25 | 188.55 |
| `demo-middle-east` on `music` at 1 s (extent 101.352 s), zoom max: frame width | **27.05** | **18.59** |
| Same, after clicking the right end of the Overview: frame x + w vs root right | 1267.52 vs 1256 (11.5 px past the edge, clipped by the root) | 1103.28 vs 1096 (7.3 px past, clipped) |

**What this shows:**
- **The frame gets narrow.** With one 101 s clip at maximum zoom, the frame is 18.6 px wide at 1280. Longer projects make it narrower still: `overviewFrame` (`view.ts` l.175) has no minimum width.
- **What happens to the radius.** CSS scales the radii down when they do not fit. A 10 px radius on a frame narrower than 20 px therefore becomes a vertical capsule. The 6 px radius at HEAD already does the same below 12 px.
- **At the right end, the frame runs past the root**, because the view can scroll beyond the extent. The root's `overflow-hidden` clips it. This is pre-existing and recorded as information (B-R172-OV-FRAME-OVERFLOW). It is not changed here.

### 0.2 Rulings (all user-vetoable in `feature-status.md`)
- **R25. The Overview is a panel.** It is a 64 px framed map that holds clip bars, with a bordered outline overlay and its own surface.
  - The root (l.293), the outline overlay (l.305) and the view frame (l.329) all → `rounded-panel` (10 px), **together**. OV1 locks them together because of SABA-B-2.
  - **Why the frame cannot stay at 6 px:** a 6 px frame inside a 10 px `overflow-hidden` root reopens the corner notch at x = 0 and at the right end.
  - **The capsule at extreme zoom is accepted** and recorded as vetoable, with C's 4× crops (NARROW-FRAME row).
  - **Not done:** a `min-w` on the frame, or any change to `overviewFrame`. Both would misstate the visible range and move the frame.
  - The Overview clip bars keep `rounded-xs` (they are timeline objects, R24).
- **R26. The Transport readout is a field-like display, so it gets 8 px.**
  - Site: `ArrangementTransport.tsx` l.159, `flex items-baseline gap-2 rounded-sm bg-background px-3 py-1 font-mono tabular-nums`. It is the position and project-end readout, not interactive.
  - **Ruling:** `rounded-sm` → `rounded-md`. It sits in the transport row between the 8 px buttons (TS1) and reads as a display field, and the spec gives fields 8 px.
  - **Alternative recorded:** keep it at 6 px as a chip (as R20 did for the badge and the flag).
- **R27. The Library preview waveform is a control, so it gets 8 px.**
  - Site: `ArrangementLibraryPreview.tsx` l.251, the `cn()` base string. It is `role="slider"`: a 32 px, borderless, focusable seek bar inside the preview row.
  - **Ruling:** `rounded-sm` → `rounded-md`.
  - **How it differs from P1 and the Overview:** both of those are bordered, framed boxes, so they count as panels.
  - The conditional classes of that `cn()` (`cursor-pointer` / `cursor-not-allowed opacity-40`) contain no `rounded-*`.
- **R28. The `← CZABA` link stays at 6 px.**
  - Site: `StudioWorkspace.tsx` l.2197, `arrangement-exit`. It is a borderless text link, and its `rounded-sm` only shapes the focus ring (`px-1`).
  - An earlier round already ruled it out of the button slice ("borderless link"). It is unchanged, and `StudioWorkspace.tsx` is not granted.
- **R29. The twMerge rule (gate-172 finding 2).** No V-3c-5b site may pass `rounded-panel` through `cn()` together with another `rounded-*` class. `tailwind-merge` does not know `rounded-panel`, so both classes would survive.
  - R25's sites are plain `className` strings. The Overview clip bars go through `cn()`, but they keep `rounded-xs` and get no `rounded-panel`.
  - R27 uses the standard `rounded-md`.
- **Unchanged from round 172:** R21–R24, including Q-V3C5-MODAL-RADIUS (the protected `Modal.tsx`).

## 1. What changes (exact; line numbers at `3810816`)
| ID | File / line | Change |
|---|---|---|
| O1 | `ArrangementOverview.tsx` l.293 (root) | `rounded-sm` → `rounded-panel` |
| O2 | `ArrangementOverview.tsx` l.305 (outline overlay) | `rounded-sm` → `rounded-panel` |
| O3 | `ArrangementOverview.tsx` l.329 (view frame) | `rounded-sm` → `rounded-panel` |
| S1 | `ArrangementTransport.tsx` l.159 (readout) | `rounded-sm` → `rounded-md` |
| S2 | `ArrangementLibraryPreview.tsx` l.251 (the `cn()` base string) | `rounded-sm` → `rounded-md` |
| L1 | `studio-theme-obsidian.test.tsx`, the OV1 `it` block only (l.219–236) | Root and frame: `toContain('rounded-sm')` → `toContain('rounded-panel')`. The frame keeps `not.toContain('rounded-xs')`; the frame (and optionally the root) gains `not.toContain('rounded-sm')`. The overlay exact string becomes `'<div className="pointer-events-none absolute inset-0 rounded-panel border border-outline" />'`, count 1. The title may say `rounded-panel` instead of `rounded-sm`. No other line of the file changes (TH1 and the rest stay byte-identical). |
| L2 | `panel-radius-ui.test.tsx` | (a) `EXPECTED_PANEL_CLASS_COUNTS` gains `'components/arrangement/ArrangementOverview.tsx': 3`. (b) `PANEL_SITE_CLASSES` gains the three exact O1–O3 strings. For O1 use the full root `className`; for O3, `'pointer-events-none absolute inset-y-0 rounded-panel border border-foreground/70 bg-foreground/5'`. (c) The PNR2 title may say "nine" instead of "six". (d) New `it`s **PNR4** and **PNR5** (below). PNR1, PNR3a/b/c and the helpers stay unchanged; new helpers may be added. |
| D1 | `docs/…/141-studio-v3c5a-panel-radius.md` | Set l.4 to exactly `**სტატუსი:** Completed (C round 172 PASS; published 3810816)`. The l.82 TODO ("C round 172-ის ბრაუზერის მტკიცებულება…") may be struck through. Nothing else changes. |
| D2 | **new** `docs/implementation/2026/quarter-IV/142-studio-v3c5b-overview-control-radius.md` | Follow `docs/implementation/TEMPLATE.md`, in Georgian with English technical terms. Cover R25–R29, the §0.1 probe table, the capsule trade-off and its veto, the frame overflow observation, the tests and mutations. TODO: DUX-R-5, M1, M3, M4, ROOT-RECON-GRID-HARNESS, Q-V3C5-MODAL-RADIUS, the checkpoint request, and Safari video clipping (gate-172 finding 3, a Tech Lead manual check). Status: `In Progress (awaiting C round 173)`. |

**New locks.** B grepped `app`, `e2e`, `docs` and `backlog.json` at `3810816`: `PNR4` and `PNR5` are used nowhere.
- **PNR4, the Overview (source and render).**
  - **Source:** `ArrangementOverview.tsx` contains `rounded-panel` exactly 3 times and `rounded-sm` 0 times. The clip-bar string `'absolute inset-y-0 rounded-xs',` is still present once.
  - **Render:** render the workspace the way OV1 or `navigation-strings-ui` does, with at least one clip so that a clip bar exists.
    - `arrangement-overview` includes `rounded-panel`, `overflow-hidden`, `bg-background` and `h-16`.
    - Its first child (the overlay) includes `rounded-panel`, `border` and `border-outline`.
    - `arrangement-overview-frame` includes `rounded-panel`, `border-foreground/70` and `bg-foreground/5`.
    - None of these three includes `rounded-sm`.
    - Every clip bar inside the Overview includes `rounded-xs` and does not include `rounded-panel`.
- **PNR5, the two controls (source and render).**
  - **Source:** in `ArrangementTransport.tsx`, the readout string `'flex items-baseline gap-2 rounded-md bg-background px-3 py-1 font-mono tabular-nums'` occurs once. In `ArrangementLibraryPreview.tsx`, the base string `'relative block h-8 w-full overflow-hidden rounded-md bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'` occurs once. Neither file contains `rounded-panel`.
  - **Render:**
    - The closest ancestor `div` of `arrangement-project-end` (the readout container that also holds `ArrangementTransportPosition`) includes `rounded-md`, `bg-background` and `font-mono`, and excludes `rounded-sm`.
    - `arrangement-library-preview-wave` includes `rounded-md` and `overflow-hidden` and excludes `rounded-sm`. Check it before the preview is ready (with `cursor-not-allowed`) and, where `library-preview.test.tsx` shows how, when it is ready.
  - **`arrangement-exit` keeps `rounded-sm` (R28):** check it in source and in render.
- **Mounting and cleanup:** follow the existing mounts (`panel-radius-ui` `mountPanelWorkspace`, `navigation-strings-ui`, `library-preview`). Copy small helpers rather than exporting them from other tests. Unmount in `afterEach`/`finally` and restore every stub.

**Not allowed:**
- any other line in the granted files: the root's handlers, aria and `data-*`; `overviewFrame`/`view.ts`; the frame's inline `style`; the clip bars; the playhead;
- `StudioWorkspace.tsx` (R28), `Modal.tsx`, `app.css` (the token already exists), `strings.ts`, `package.json`;
- `style=`, custom CSS, hex values, `rounded-[...]` or any arbitrary value, `min-w-*` on the frame;
- any text, icon, size, padding, gap, border, colour, shadow, position, aria, title or `role` change; any handler, focus, keyboard, drag or pointer change.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementOverview.tsx` | O1, O2, O3 only |
| `app/components/arrangement/ArrangementTransport.tsx` | S1 only |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | S2 only |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | L1 only. The "existing tests unchanged" rule is lifted for the OV1 block, because OV1 is the lock R25 updates. |
| `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx` | L2 only |
| `docs/…/141-…md` | D1 only |
| **new** `docs/…/142-studio-v3c5b-overview-control-radius.md` | D2 |

**Read before editing** (`.claude/rules/read-primitives.md`):
- `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`;
- `AUDIO_ARCHITECTURE.md` and `prompts/studio-feature.md` (these are Studio files, but no audio or navigation logic changes);
- `prompts/new-test.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`.

**Protected:** the diff against `3810816` stays empty for:
- **Purchase and auth:** `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `collection.ts`.
- **Shared UI:** `Modal.tsx`, `Toast.tsx`, `root.tsx`, `CookieConsent.tsx`, `app/components/icons/**`, everything under `app/styles/`.
- **Arrangement:** `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementVideoDock.tsx`, `ArrangementGridMenu.tsx`, `ArrangementMarkerMenu.tsx`, `ArrangementExportDialog.tsx`, `ArrangementMarkerRow.tsx`, every other Arrangement component, `app/lib/arrangement/view.ts`, `strings.ts`, `studio-lab.tsx`, docs 127–140.
- **Frozen neighbour tests:** every file in `b-round-172-r173-vitest-base.txt` except the L1/L2 files. In particular `view.test.ts` (the frame width `toBeCloseTo(25)`), `navigation-strings-ui.test.tsx`, `library-preview.test.tsx`, `transport-surface-ui.test.tsx` (TS1) and `detail-panel-polish.test.tsx` stay unchanged.

**Not allowed:** any other file; commit, push, stash, install, revert or `npm run build`. Every lasting edit goes through Edit/Write (C-R120-01). Use shell writes only for temporary mutations, and restore and sha-verify each one. No placeholder appends.

**B grep at planning (at `3810816`):**
- **OV1** (`studio-theme-obsidian` l.219–236) is the only radius lock on the Overview. `view.test.ts` l.477–523 and `navigation-strings-ui` l.346 check the frame width, aria and behaviour, not the radius.
- **`transport-surface-ui` TS1** checks the 12 transport **buttons** (they must have `rounded-md` and must not have `rounded-sm`). The readout is not a button, so S1 does not affect it.
- **No test locks** the readout string, the preview-wave class or `arrangement-exit`'s radius.
- **`e2e/`** has no hit for these strings.
- **`PNR2`** counts `rounded-panel` per file "and nowhere else", so O1–O3 need L2(a)/(b) (granted).

## 3. A — tests and commands (speed rules)
- **Baseline:** the 25 files in `b-round-172-r173-vitest-base.txt` (round 172's 21, plus `view.test.ts`, `navigation-strings-ui`, `library-preview` and `transport-surface-ui`). Expect **423/423**; B ran it at `3810816` (`b-round-172/out/vitest-base.json`). Save the list as `a-round-173/vitest-files.txt` and the result as `a-round-173/vitest-baseline.json`.
- **After the edits:** the same 25 files. Expect 423 plus PNR4 and PNR5 (more `it`s are allowed), all green. Also run `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the changed code and test files.
- **`expect(` counts at `3810816`:** `studio-theme-obsidian` 76 (L1 may add at most 2: `not.toContain('rounded-sm')` on the frame and on the root), `panel-radius-ui` 25 (it grows). Record both counts.
- **Mutations.** They touch granted files only (R28 is proven by PNR5's source and render checks plus C's RADIUS row, not by a mutation of the protected `StudioWorkspace.tsx`). For each: Edit → run → restore by Edit → check that the sha256 equals the post-edit hash before the next one. Write one JSON per mutation in `a-round-173/mutations/`.

  | Mutation | Change | Must turn red |
  |---|---|---|
  | m235 | O1 back to `rounded-sm` | OV1, PNR2, PNR4 |
  | m236 | O2 back to `rounded-sm` | OV1, PNR2, PNR4 |
  | m237 | O3 back to `rounded-sm` | OV1, PNR2, PNR4 |
  | m238 | the Overview clip bar `rounded-xs` → `rounded-panel` | PNR2, PNR4 |
  | m239 | S1 back to `rounded-sm` | PNR5 |
  | m240 | S2 back to `rounded-sm` | PNR5 |

- **Code-reviewer: required** (7 paths). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The 986 frozen files are OK, and the protected diff against `3810816` is empty.
  - `git status --short` shows the changed grants as ` M` (report any grant that was not needed) plus 1 `??` (doc 142), and nothing else.
  - Write `a-round-173/end-sha256.txt` (all changed and new paths) and `a-round-173/diff-vs-start.patch` (against `b-round-172/r173-granted-start/`, with the new file as new).

## 4. C — rows
**Setup:**
- Use real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720.
- Wait for `document.fonts.ready` and record the font status in every session tool. A session with a non-200 Google Fonts response is environment-invalid (replace it at most twice). One cold-Vite first load may be replaced (ENV-FIRST-LOAD-LUCIDE).
- Copy the reused tools into `c-round-173/tools/` unchanged:
  - `c-round-172/tools/*` (`lib.cjs`, `png.cjs`, `d6.cjs` sha256 `3abc88fe…`, `d6-fontwrap.cjs`, `g172-3.cjs`);
  - B's probe `b-round-172/tools/probe-ov.cjs` as the starting point for the narrow-frame states. Lane ids are lowercase (`'music'`).
- **States:**
  - **O0:** an empty project at the default zoom.
  - **O1:** `demo-middle-east` on `music` at 1 s, with the zoom slider at max (focus `arrangement-zoom`, then End), so the frame sits at the left edge.
  - **O2:** O1, then a real click at the right end of the Overview (the frame is flush right and runs past it).
  - **O3:** O1, with the frame dragged to the middle (a narrow frame away from both edges).
  - **T0:** the transport readout. **W0/W1:** the Library preview waveform, before and after a source is ready (select a library item so the preview loads).
- Write nothing under earlier `c-round-*/out/`, and use unique output names.

| Row | Check |
|---|---|
| T173-TARGETED | Re-run `a-round-173/vitest-files.txt`. The counts equal A's. OV1, PNR1–PNR5, TH1, `view.test.ts`, `navigation-strings-ui`, `library-preview` and TS1 are present and green. |
| SOURCE-SCOPE | HEAD `3810816`. The 986 frozen files are OK at start and end, and the end hashes equal `a-round-173/end-sha256.txt`. `git status` shows the changed grants as ` M` plus 1 `??`. The protected diff against `3810816` is empty (§2 list, including `StudioWorkspace.tsx`, `view.ts`, `Modal.tsx` and `app/styles/`). No source changes during C's phase. |
| AN-REVIEW | C reads the diff against `b-round-172/r173-granted-start/` itself. O1–O3, S1 and S2 each change one radius token and nothing else. The clip bars, playhead, handlers, aria and inline styles are untouched. L1 touches only the OV1 block, L2 only what §1 allows. There is no arbitrary value and no `min-w`. Doc 141 changes only l.4 (and the l.82 TODO). Doc 142 exists with the D2 sections. |
| RADIUS-V3C5B | At both viewports, read the computed style on the real compiled class. In O0–O3, the Overview root, overlay and frame have `border-*-radius` **10px** (for a frame narrower than 20 px, record the **used** radius from a 4× crop together with the computed value). The clip bars stay at their `rounded-xs` value. In T0 the readout is **8px**, and in W0/W1 the preview wave is **8px**. `arrangement-exit` stays **6px**. Record the border, background and box-shadow for each site. They must equal C's own measurement of the same state in round 172 where one exists; otherwise record "no before-value" (do not revert A's work to make one). |
| OV-CORNERS (SABA-B-2) | At both viewports, take 4× crops of all four Overview corners in O0, O1 and O2. There must be no notch or gap between the overlay's border and the root's curve, and in O1 (frame at x = 0) and O2 (frame flush right) the frame's border follows the root's curve with no square corner and no double border. The bottom corners against the panel below must stay closed, with no new notch, as in Saba's case `user-review/img/saba-2026-10-25-overview-corners.png`. |
| NARROW-FRAME | Record the frame's width, the used radius and a 4× crop in O1, O2 and O3 at both viewports (B measured 27.05 / 18.59 px at max zoom). The capsule shape below 20 px is the **accepted R25 trade-off**; C reports it as evidence for Saba, not as a FAIL. A FAIL is: the frame is missing, the frame's width or left differs from the same state at `3810816` by more than 0.5 px (B's numbers in `b-round-172/out/probe-ov.json` are the before-values for O1 = `clip_max_left` and O2 = `clip_max_right`; O3 has no before-value), or the border is broken. O2's reference uses the probe's click point, `ov.x + ov.width − 2` at the vertical centre; use the same point, or record the delta as a harness difference rather than a finding. |
| BOX-V3C5B | Raw `getBoundingClientRect` (0.01 px) of the Overview root, overlay, frame, playhead and clip bars in O0–O2, the readout and its children in T0, and the preview wave in W0/W1, at both viewports. For the Overview, before-values exist **only for the root, overlay and frame in O0 (`empty_default`), O1 (`clip_max_left`) and O2 (`clip_max_right`)** in B's `probe-ov.json` (expected 0.00 px; any delta > 0.5 px is a finding). The playhead, the clip bars and O3 have **no before-value**: record them, and rely on RV1 (page level). For T0, W0 and W1, the before-value is RV1 (page level), plus the fact that a radius does not change boxes. |
| RV1-V3C5B | Run the copied `d6.cjs` unchanged through `d6-fontwrap.cjs`, once per viewport, and compare with `c-round-172/out/d6/d6-{1440,1280}-r1.json`: 0 missing / 0 added keys, every x/y/w/h within ±0.5 px, and the failing-contrast set equal. The Overview is in S0–S2, so this row is a real before-value for it. |
| FUNC-SMOKE-V3C5B | Use a real mouse at the centre (`elementFromPoint` must hit the target) at both viewports. **Overview:** dragging the frame pans the timeline (the ruler's start time changes). A click moves the view as it did at HEAD. With the Overview focused, ArrowLeft and ArrowRight pan and update `aria-valuenow`/`aria-valuetext`. A double-click behaves as at HEAD (record what it does). **Readout:** it shows the position and the project end, and the position advances while Space plays. **Preview wave:** a click on a ready wave seeks the preview (`aria-valuenow` changes), and when it is not ready it does nothing. **Focus rings:** Tab to the Overview, the preview wave and `arrangement-exit`, and take a 4× crop of each ring (the ring follows the new radius on the first two). Focus wording: "focus returns to the opener" applies only when the opener is focusable; otherwise record where focus lands (C-R172 note). |
| G173-3 | `/studio-lab` opens anonymously with the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token?product=middle-east&file=stem1.wav` → 401. Fake-Bearer 403: BLOCKED (backend unavailable in cloud). |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. |

- **Not re-run** (unchanged since C verified them in rounds 158–172): the toolbar, the lane and group headers, the clip, the marker row, the icon rows, ENV-VIS, the Export dialog, the Detail panel and the dock (V-3c-5a). A new observation about them is a note.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.
- **Harness facts:**
  - The Clip details panel is collapsed by default at 720 px height; expand it with `arrangement-detail-toggle`.
  - A real right-press on a non-focusable lane blurs the focused element before `contextmenu` (C-R172-GRID-ESCAPE-FOCUS-BODY).
  - Release the mouse inside a dialog or menu (C-R171-01).
  - There is no transport-container testid, so use the button text.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Overview navigation: drag, click, keys, double-click, aria value | FUNC-SMOKE, T173-TARGETED (`view.test.ts`, `navigation-strings-ui`) |
| SABA-B-2 corner fix | OV-CORNERS, OV1 |
| Narrow frame visibility | NARROW-FRAME |
| Transport buttons (TS1) next to the readout | T173-TARGETED, RV1 |
| Library preview seek | FUNC-SMOKE, T173-TARGETED (`library-preview`) |
| Layout of the page | BOX-V3C5B, RV1-V3C5B |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| 10 px Overview, 8 px readout and preview wave | None used. Source: the user-approved `visual-direction-a.md` § „ღილაკები და ზედაპირები“. No Live 12 manual section was opened. | Not checked. | **Not applicable; this is a CZABA brand decision.** The Overview's navigation behaviour is unchanged, and no claim is made about how Live's Overview looks. | Requirement: the RADIUS, OV-CORNERS, NARROW-FRAME, BOX, RV1 and FUNC-SMOKE rows. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-173.md`, `a-round-173-result.json` and `a-round-173/` (vitest JSON and list, mutations, end-sha256, diff patch, `expect(` counts).
- **C:** `c-round-173.md` and `c-round-173.json` (`browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun`, `invalidRuns`). The `.md` must include the RADIUS, NARROW-FRAME and BOX tables for both viewports. Tools, out and shots go in `c-round-173/`.
- Write the reports as you go, because the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 174 planning)
| Condition | Round 174 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, `npm run test:e2e:smoke`, and the open evidence gap C-R167-METRONOME-UNDER-MUTE. The rows below follow it. |
| C FAIL at Critical, High or Medium | A bounded fix-up (at most 3 related bugs) by the same owner. |
| C FAIL on OV-CORNERS (a notch or a double border) or on BOX (> 0.5 px) | A fix-up within R25 using C's measurements, or a question for Saba. It is not deferred silently. |
| C FAIL on Lows only | A fix-up if it is in V-3c-5b's own lines and cheap; otherwise `deferred_low_polish`, and DUX-R-5 goes ahead. |
| C PASS | Root publishes round 173. V-3c-5b → **მზადაა**, so **V-3c-5 and V-3c are complete**. B writes a refreshed bounded architecture-checkpoint request (`b-round-173-checkpoint-request.md`) at this feature boundary. Round 174 = the **DUX-R-5** stage (the one colour rule; re-verify SABA-B-1 contrast), unless root answers the checkpoint with "extract". In that case B schedules the extraction as one bounded round first. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md` and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on C PASS, publish round 173: the changed granted paths plus doc 142, against `3810816`. `StudioWorkspace.tsx`, `view.ts`, `Modal.tsx`, `app/styles/`, `strings.ts` and the purchase/auth files must be unchanged.
- **Architecture checkpoint:** `b-round-170-checkpoint-request.md` is still unanswered (third planning), so fallback (c) continues. This round adds no SURF/MOTION copy. After V-3c-5b passes, V-3c is at a feature boundary, and B will write a refreshed bounded request then.
- **Gate-172 review findings, as recorded by B:**
  1. The doc 141 status → D1 here.
  2. twMerge does not know `rounded-panel` → signal GATE172-TWMERGE-RADIUS-PANEL, plus the R29 rule.
  3. Safari may not clip the video to the rounded corner → a Tech Lead manual check (cloud is Chromium only), not a bug.
  4. The exact-string locks → folded into GATE167-TOKEN-TEST-FRAGILITY.
- **User-visible decisions** (vetoable in `feature-status.md`): R25 (Overview 10 px, capsule frame at extreme zoom), R26 (readout 8 px), R27 (preview wave 8 px) and R28 (exit link stays 6 px).
