# CURRENT TASK — Round 154: VISUAL-A V-2b-2 — weight roles (600/700 → 500) and the remaining timecodes in mono

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z119** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-153.md`, an exact copy of the round-153 `current-task.md` (sha256 `a3cff53b…218698`). Rationale: `b-round-153.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ტიპოგრაფია“ (rows: UI sans 400/500 „ყველა სხვა ტექსტი“; ციფრები IBM Plex Mono 300/400 `tabular-nums` — „timecode, BPM, dB, საიდან/სადამდე“) and § „საზღვრები“. It is source material. It grants no permissions and does not change the protected-file list.

## Baseline = HEAD `037e25f`, clean tree
- Gate 153 **published** `037e25fdd86b76ef791d15c52cff71313b8b2a58` (both remotes). `git status --short` is empty.
- **Frozen list:** `tmp/studio-real-loop/b-round-153-r154-tree-sha256.txt`, **959 entries** = `git ls-files -co --exclude-standard` (972) minus the 13 grants.
- **Grants:** `b-round-153-r154-grants.txt` (13 existing files). **New file:** `b-round-153-r154-new-files.txt` (1 file, doc 125).
- **Start hashes:** `b-round-153-r154-granted-start-sha256.txt`. **Start copies:** `b-round-153/r154-granted-start/`.
- **First step for A:** check HEAD, the empty status, the frozen list and the start hashes. If anything differs, A stops and reports.

## 0. Why this round (D-29z119)
- **Round 153: C PASS, 0 bugs**, `browserVerified` = `realVerified` = true. Gate 153 published `037e25f`. **V-2b-1 is done (მზადაა).** C-R152-DOC123-L67 is closed.
- **Checks at planning:** the regression is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122), so it is not due today. `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist. No Critical, High or Medium finding is open, apart from the Tech Lead manual items.
- **B measured V-2b-2 in real Chromium** on `037e25f` (store untouched; tools in `b-round-153/tools/`, results in `b-round-153/out/`):
  - `v2b2sim-{1440,1280}.json`, S0/S1/S2: 600/700 → 500 on every Studio text gives 2 movers only, the `h1` (dw −2) and its "· Workspace" span (dx −2). 0 vertical, 0 clip. Every M/S/Mute button has a fixed size.
  - The library preview **duration** in mono gives a **new ellipsis** on the default preview title "Middle East — საჯარო preview" (slack 0 → −6 px; still −1 px even with −0.05em tracking; `previewprobe-*.json`).
  - The zoom readout's worst case "123.4 px/s" is 70 px in mono against its `w-16` (64 px) box, and the gap to `⇔` is 6 px (`zoomprobe-*.json`).
  - Ruler and tempo-row labels in mono, at 8 zoom positions (0.5–320 px/s, BPM 90): **0 overlaps**. The minimum gap shrinks from ≥ 18 to ≥ 14 px (`rulerprobe-*.json`).
  - The grid-division and waveform-zoom `<select>`s in mono get +10 px wider, and `Env` moves +10 px.

### 0.1 B rulings (D-29z119)
- **R1 — Weight roles.** UI sans uses only 400/500. Every `font-semibold`/`font-bold` in `app/components/arrangement/**` becomes `font-medium` (7 places, W1–W5 below). The peak over-state `font-medium` on the mono peak button is removed, so the button stays at 400 per the spec's mono row (W6). Nothing uses mono 300, so Plex Mono 300 is **not** added; FONTS-SCOPED stays unchanged.
- **R2 — Which numerals go mono (the spec list only: timecode, BPM, dB, from/to).** This keeps the round-151 rule that put the pan readout outside the list (TH8 still asserts that):
  - **In this round:** library row durations (N1), the library playhead (N2), the ruler labels (N3), the tempo-row bar labels (N4), the clip-gain reset "0 dB" (N5), and the lane-move ghost start time (N6).
  - **Stay sans, not on the spec list** (B ruling; the user may veto it in `feature-status.md`):
    - the zoom readout "40 px/s" (it would also overflow `w-16`);
    - the library counts;
    - `4/4`;
    - the pan readout (TH8);
    - the grid-division and waveform-zoom `<select>`s.
  - **The library preview duration is a timecode but stays sans for now: a user question (B-R153-PREVIEW-DUR).** Mono would newly truncate the default preview title, and that hides content. Options for Saba:
    - (a) accept the earlier ellipsis (the full title stays in the `title` tooltip);
    - (b) a layout change (gap or width, an M-type move);
    - (c) keep it sans.
  - **From/to timecodes inside sentences → the next stage, V-2b-3, which is not deferred.** These are the range readout, the selected-clip line and the Export scope line. Each is built as one string in `strings.ts`, so mono only on the times needs part-templating that keeps `textContent` byte-identical. That is its own stage.
- **R3 — The Export dialog title (24 px / 600) is not touched.** Its weight comes from the protected `Modal.tsx`. It joins the V-2b-DISPLAY user question: its role and weight follow the option Saba picks.
- **R4 — The css2 URL is not changed in this round.** Instrument Sans 600/700 and Plex Mono 500 may now have no consumer. Per the backlog rule ("drop unused css2 weights only with C font evidence"), C produces that evidence in WEIGHT-INVENTORY. B trims the URL (with TH7) in a later bounded round only if C shows zero consumers on the whole `/studio-lab` page.
- **R5 — Text content is unchanged.** Only classes change, plus one `<span className="font-mono">` around the formatted library duration (N1), so the meta row keeps exactly 2 children and its exact class string (LRS test l.248).

## 1. What changes (exact; line numbers at `037e25f`)
| ID | File | Change |
|---|---|---|
| W1 | `StudioWorkspace.tsx` l.2199 | `<h1 className="text-sm font-semibold">` → `font-medium`. |
| W2 | `ArrangementLibrary.tsx` l.443 | Library `h2`: `font-semibold` → `font-medium`. |
| W3 | `ArrangementGroupHeader.tsx` l.36 | `TRACK_GROUP_MIX_BUTTON_CLASS`: `font-bold` → `font-medium`. |
| W4 | `ArrangementGroupHeader.tsx` l.264 | Group-name button: `font-semibold` → `font-medium`. |
| W5 | `ArrangementMaster.tsx` l.170 and `ArrangementLane.tsx` l.612, l.630 | Master Mute and lane M/S buttons: `font-bold` → `font-medium`. |
| W6 | `ArrangementMaster.tsx` l.110 | Peak over branch: `'border-destructive bg-destructive/15 font-medium text-destructive'` → `'border-destructive bg-destructive/15 text-destructive'`. |
| N1 | `ArrangementLibrary.tsx` l.119–124 | Only in the ready branch, `formatArrangementTime(state.duration)` → `<span className="font-mono">{formatArrangementTime(state.duration)}</span>`. The loading and error strings, the meta row (l.117) and its first child are unchanged. |
| N2 | `ArrangementLibraryPreview.tsx` l.75 | Playhead span `className="tabular-nums"` → `"font-mono tabular-nums"`. |
| N3 | `ArrangementRuler.tsx` l.262 | Add `font-mono` to the ruler label span. |
| N4 | `ArrangementTempoRow.tsx` l.120 | Add `font-mono` to the bar/beat label base class. l.233 (`4/4`) is unchanged. |
| N5 | `ArrangementDetailPanel.tsx` l.860 | Add `font-mono` to the clip-gain reset button class (`arrangement-detail-clip-gain-reset`). |
| N6 | `ArrangementLane.tsx` l.929 | Add `font-mono` to the ghost start-time span. l.773 (pan) is unchanged. |
| T1 | `studio-theme-obsidian.test.tsx` | New `it` **TH10** (TH1–TH9 unchanged). Details below the table. |
| T2 | `render-budget.test.tsx` l.528 | `toBe('tabular-nums')` → `toBe('font-mono tabular-nums')`. Nothing else. |
| T3 | `library-row-strings-ui.test.tsx` | In the test that holds l.248, add assertions: the meta row's second child contains exactly one `span.font-mono` whose `textContent` is `00:20.000`, and the first child has no `font-mono`. Existing assertions are unchanged. |
| D1 | `docs/implementation/2026/quarter-IV/124-studio-v2b1-label-typography.md` | Change l.4 only: `**სტატუსი:** Completed (C round 153 PASS, gate 153 published 037e25f)`. |
| D2 | **new** `docs/implementation/2026/quarter-IV/125-studio-v2b2-weights-numerals.md` | Follow `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English. Include: R1–R5; the W/N table; what stays sans and why; the user questions (B-R153-PREVIEW-DUR, the Export title under V-2b-DISPLAY); V-2b-3; the css2-trim evidence plan; tests and mutations. Status `In Progress (awaiting C round 154)`. |

**T1 / TH10 details:**
- **(a) Source scan.** No `.tsx` file under `app/components/arrangement` (use the existing `listFilesRecursively`) contains the class token `font-semibold` or `font-bold`. `ArrangementMaster.tsx` no longer contains `bg-destructive/15 font-medium`.
- **(b) S0 SSR** (`renderToString(<StudioLabRoute />)`):
  - The `h1`, the Library `h2`, the Master Mute button and the lane M/S buttons carry `font-medium` and neither `font-semibold` nor `font-bold`.
  - `arrangement-library-playhead` carries `font-mono` and `tabular-nums`.
  - `arrangement-zoom-readout` and the 3 `arrangement-track-pan-reset` tags have **no** `font-mono`.
- **(c) N3 / N4 / N5 / N6.** Assert each one that renders in the S0 SSR. For each one that does not, write a mounted assertion inside TH10 (for example, render `ArrangementRuler` with a width, or the workspace with a BPM). Record in the report which way each was covered.
  - If N6 (the ghost appears only during a lane drag) cannot be mounted at reasonable cost, cover it with a source-level assertion on the ghost start span in `ArrangementLane.tsx` and say so. C checks it in the browser (LANE-GHOST).
  - No assertion may use snapshot matching.

**Nothing else changes:** no colour, no `app.css` line, no string in `strings.ts`, no route, no `package.json`. In particular, `studio-lab.tsx` and the css2 URL are not touched (R4).

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | W1 only |
| `app/components/arrangement/ArrangementLibrary.tsx` | W2, N1 only |
| `app/components/arrangement/ArrangementGroupHeader.tsx` | W3, W4 only |
| `app/components/arrangement/ArrangementMaster.tsx` | W5 (l.170), W6 only |
| `app/components/arrangement/ArrangementLane.tsx` | W5 (l.612, l.630), N6 only |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | N2 only |
| `app/components/arrangement/ArrangementRuler.tsx` | N3 only |
| `app/components/arrangement/ArrangementTempoRow.tsx` | N4 only |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | N5 only |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | T1 only (new TH10) |
| `app/lib/arrangement/__tests__/render-budget.test.tsx` | T2 only (1 line) |
| `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` | T3 only (added assertions) |
| `docs/implementation/2026/quarter-IV/124-studio-v2b1-label-typography.md` | D1 only (1 line) |
| `docs/implementation/2026/quarter-IV/125-studio-v2b2-weights-numerals.md` (new) | D2 |

- **Read before editing** (`.claude/rules/read-primitives.md`): `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md` (Master/Lane are Studio files; no audio logic changes), `GEORGIAN_DOCS.md`, `TESTING_QUALITY_GATES.md`.
- **Protected:** the diff vs `037e25f` stays empty for `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx` and `root.tsx`.
- **Not allowed:** any other file; commit, push, stash, install, revert; `npm run build`. Every lasting edit goes through Edit/Write (the C-R120-01 rule).
- **If another existing test breaks because of W/N** (an exact class or `textContent` assertion), A **stops and reports** the file, the line and the assertion. A does not edit a test file that is not granted; B grants it next round. B grepped `__tests__` for exact class assertions. The only one hit was `render-budget` l.528 (T2). `library-row-strings-ui` l.248 holds because N1 wraps inside the second child. TH8 holds because pan stays sans.

## 3. A — tests and commands (speed rules)
- **Start:** the checks in the Baseline section.
- **Baseline run:**
  ```
  npx vitest run app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/tempo-ui.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/library-preview.test.tsx app/lib/arrangement/__tests__/track-header-stacking.test.tsx
  ```
  Also run the test file(s) that cover the group header and the detail-panel clip gain. Find them by grepping `__tests__` for `arrangement-group-name` and `arrangement-detail-clip-gain-reset`, and list them in the report. Save the result as `a-round-154/vitest-baseline.json`.
- **After the edits:**
  - Run the same files. Every test that passed at baseline still passes, and TH10 is green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 12 changed code and test files.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; JSON goes in `a-round-154/mutations/`):
  - **m137:** put `font-bold` back on lane l.612. Only TH10 turns red.
  - **m138:** remove `font-mono` from N3 (ruler). Only TH10 turns red.
  - **m139:** move N1's `font-mono` from the inner span onto the meta row (l.117). The LRS test turns red (l.248 and/or T3).
  - **m140:** put `font-medium` back into the W6 over branch. Only TH10 turns red.
- **Code-reviewer:** required (14 files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 959 are OK, and the protected diff is empty.
  - `git status --short` = exactly the granted ` M` files that A really changed (≤ 13) + 1 `??` (doc 125).
  - Write `a-round-154/end-sha256.txt` and `a-round-154/diff-vs-start.patch`.

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Use both viewports, 1440×900 and 1280×720.
- Wait for `document.fonts.ready` before measuring. A session where the Google Fonts css2/woff2 do not all return 200 is **invalid (environment)**; replace it at most twice.
- Reuse `c-round-153/tools/` (d6, labels, fs3, g153-3); change only the output dir, labels and file names.
- **Reference for RV-1-V2B2:** `c-round-153/out/bbox-post-v2b1-{1280,1440}.json`. Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T154-TARGETED | Re-run A's vitest files. The counts equal A's. TH10 covers W1–W6 and N2–N6 as A reports. |
| SOURCE-SCOPE | <ul><li>HEAD is `037e25f`.</li><li>The frozen 959 are OK at start and at end.</li><li>The end hashes equal `a-round-154/end-sha256.txt`.</li><li>`git status` matches A's list (≤ 13 ` M` + 1 `??`).</li><li>The protected diff vs `037e25f` is empty.</li><li>`app.css` and `studio-lab.tsx` are unchanged.</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | <ul><li>Each component diff is only its W/N rows.</li><li>The test diffs are only TH10, the T2 line and the T3 assertions.</li><li>The doc 124 diff is the 1 D1 line.</li><li>Doc 125 is in Georgian and has the TEMPLATE sections.</li></ul> |
| WEIGHT-STYLE | Computed `font-weight` is **500**, and CDP `getPlatformFontsForNode` gives Instrument Sans [web], at both viewports, on: the `h1` (S0); the Library `h2`; Master Mute; every lane M/S; and in S1 (with a group) the group name, its `▣` and the group mix buttons. Each box is within ±1 px of round 153, except the `h1` (dw ≈ −2) and its "· Workspace" span (dx ≈ −2). `textContent` is unchanged. |
| MASTER-OVER | Drive the Master peak into the over state in the real browser (for example, Master volume to max plus the loudest overlap, then Play). On `arrangement-master-peak` with `data-state="over"`: computed weight **400**, family IBM Plex Mono [web], and the destructive colours are still applied. If over cannot be reached in 2 attempts, the row is **not run** (say so; `browserVerified` false). |
| MONO-STYLE | Computed family IBM Plex Mono (CDP: IBM Plex Mono [web]), weight 400 and `font-variant-numeric` tabular-nums on: <ul><li>N1, every ready library duration;</li><li>N2;</li><li>N3, the ruler labels;</li><li>N4, the tempo-row labels after BPM 90 + Enter;</li><li>N5, where the detail panel is visible;</li><li>N6, in LANE-GHOST.</li></ul> **Still sans** (Instrument Sans): the zoom readout, the library counts, `4/4`, the pan readout, the two selects, the library preview duration, the range readout and the selected-clip line. `textContent` is byte-identical to round 153 for every N element. |
| RV-1-V2B2 | Re-run the d6 bbox chain (S0/S1/S2, both viewports, twice; determinism 0 px) vs the round-153 reference. PASS only if all of these hold: <ul><li>every y/h is within ±1 px;</li><li>0 keys are missing or added;</li><li>every `kind: panel` box is within ±1 px;</li><li>every mover > 1 px is horizontal and listed with its cause;</li><li>nothing is newly past 1280.</li></ul>**B prediction in d6 terms:** only `arrangement-detail-clip-gain-reset` dw ≈ +3 where the detail panel is visible (1440 S0/S1/S2; 1280 S1/S2 after opening it), with no follower. Everything else is within ±1 px. Report any other mover. |
| NO-CLIP / OVERLAP | <ul><li>**Preview title:** at both viewports in S0, the "Middle East — საჯარო preview" title keeps `scrollWidth == clientWidth` (B: slack 0; N excludes the preview duration).</li><li>**Library rows:** the meta rows stay on 1 line. The active-lane row (`line-clamp-2`, `h-8`) keeps its height and line count with the mono playhead, at playheads `00:00.000` and `01:41.352`.</li><li>**Ruler/tempo:** at ≥ 6 zoom positions from 0.5 to 320 px/s (BPM 90), same-row ruler and tempo labels have 0 overlaps (B: min gap ≥ 14 px).</li><li>**Weights:** the M/S, Mute and group buttons have no `scrollWidth > clientWidth`.</li><li>**Gain reset:** the "0 dB" button keeps 1 line.</li></ul> |
| LANE-GHOST | Drag a clip across lanes with the mouse and hold it. The ghost label's start time is IBM Plex Mono with its original text. Report whether the ghost title truncates earlier than in round 153 (info only; the ghost is transient). Release, then Ctrl+Z. |
| WEIGHT-INVENTORY | Evidence for R4, not pass/fail beyond the first bullet. On `/studio-lab` (S0, S1 with a group, S2 Export, marker menu, grid menu, and the cookie banner if shown), at 1440: <ul><li>**PASS only if** 0 visible text elements inside `.studio-container` have computed weight ≥ 600.</li><li>List every visible text element on the whole page with weight ≥ 600: text, family, weight, location. The Export `ModalTitle` (600) is expected.</li><li>List `document.fonts` faces with status `loaded` (family + weight).</li><li>State whether any element renders Instrument Sans 600/700 or Plex Mono 500.</li></ul> |
| FONTS-SCOPED | <ul><li>`/` and `/cart` at both viewports: 0 Instrument Sans / Plex Mono / Noto Georgian woff2 (a css2 `prefetch` after hover/focus is allowed).</li><li>`body` is the Store literal.</li><li>`/studio-lab` requests exactly the round-153 css2 set (no new family, no Cormorant, no Plex 300).</li></ul> |
| FUNC-SMOKE | Both viewports: <ul><li>Play 2 s.</li><li>A clip drag, then Ctrl+Z.</li><li>BPM 90 + Enter.</li><li>Zoom slider ±5 steps.</li><li>M + Enter adds a marker; then `◀`/`▶`.</li><li>Lane M and S toggle (audible state or graph evidence) and undo.</li><li>Create a group (Ctrl+G), then fold/unfold it.</li><li>Clip-gain reset in the detail panel after a gain change.</li><li>Open the Export dialog, Escape, then one real project WAV export: decodable, length = project end, 0 NaN.</li></ul> |
| G154-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. One cold-Vite first load may be replaced (ENV-FIRST-LOAD). |

- **Not re-run** (unchanged by this round): LABEL-STYLE (the round-153 labels are untouched), RV-2 contrast (no colour change; if the d6 contrast pass runs anyway, report the count, expected 32), FONT-FAIL.
- **Not C rows:** V-2b-DISPLAY and B-R153-PREVIEW-DUR (awaiting user), V-2b-3 (next stage), C-R151-2 and C-R151-3 (`deferred_low_polish`). A new observation about them is a note, not a FAIL.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Library preview title (zero slack) | NO-CLIP / OVERLAP |
| Active-lane row line clamp (mono playhead +8 px) | NO-CLIP / OVERLAP |
| Dense ruler / tempo labels at low zoom | NO-CLIP / OVERLAP |
| Master peak over-state readability | MASTER-OVER |
| `render-budget` playhead class, LRS meta row | T154-TARGETED |
| Faux bold if a 600/700 consumer remains | WEIGHT-INVENTORY, WEIGHT-STYLE |
| M/S/Mute/group actions | FUNC-SMOKE |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Medium-weight UI text; monospaced timecodes | None used. Source: the user-approved `visual-direction-a.md` § „ტიპოგრაფია“. | Not checked. | **Not applicable; CZABA brand decision.** | Requirement: WEIGHT-STYLE, MONO-STYLE, RV-1-V2B2. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-154.md`, `a-round-154-result.json`, and `a-round-154/` (vitest JSON, mutations, end-sha256, the diff patch, the reviewer output).
- **C:** `c-round-154.md` and `c-round-154.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `notRun` and `invalidRuns`. Include the WEIGHT-STYLE and MONO-STYLE tables, the RV-1 mover table vs B's prediction, and the WEIGHT-INVENTORY lists. Put tools, out and shots in `c-round-154/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 155 planning)
| Condition | Round 155 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`). Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on a row this round owns | A bounded fix-up of that row. |
| C PASS | Root publishes round 154. V-2b-2 → `c_pass` (**მზადაა** only with browser evidence). Round 155 = **V-2b-3** (from/to timecodes inside the range readout, the selected-clip line and the Export scope line, mono via part templating, `textContent` byte-identical). If WEIGHT-INVENTORY shows zero consumers, the css2 trim (Instrument Sans 600/700, Plex Mono 500, plus TH7) joins V-2b-3. Otherwise it stays recorded with the consumer list. B also sends root the **frontend-architect checkpoint request** for the V-2 boundary (with the pending `b-round-148-checkpoint-request.md`). Independent V-3 work is not delayed by it. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 154 planning).

## 8. Root notes
- **Gate:** publish round 154 on C PASS. `app.css`, `studio-lab.tsx`, `root.tsx` and `Modal.tsx` are unchanged vs `037e25f`.
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - D-29z119 R1: all Studio UI text at 400/500, so bold M/S and headings become medium.
  - D-29z119 R2: the sans/mono split by the spec list.
- **User questions:**
  - B-R153-PREVIEW-DUR (a)–(c).
  - V-2b-DISPLAY (a)–(d), which now includes the Export title weight.
  - C-R151-2 (the separators).
- **Frontend-architect checkpoint:** `b-round-148-checkpoint-request.md` is still pending and does not block. This round edits 9 components with one class each, so there is no new owner-concentration risk. The V-2 boundary request goes to root at round 155 planning.
