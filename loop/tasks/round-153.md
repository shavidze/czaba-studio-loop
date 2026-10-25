# CURRENT TASK — Round 153: VISUAL-A V-2b-1 — label typography (six Latin section labels: 11 px, 500, 0.14em, uppercase)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z118** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-152.md`, an exact copy of the round-152 `current-task.md` (sha256 `d76725e1…0dff5d`). Rationale: `b-round-152.md`.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` § „ტიპოგრაფია“ (row „ეტიკეტები“: UI sans, 500, 11 px, `letter-spacing: 0.14em`, Latin UPPERCASE — MASTER, ARRANGEMENT etc.) and § „საზღვრები“. Use it as source material. It does not grant permissions and does not change the protected-file list.

## Baseline = HEAD `ff2fd6c`, clean tree
- Gate 152 **published** `ff2fd6ce73eeee41f92b13d743aa97520d27e502` (rounds 151 + 152, both remotes). `git status --short` is empty.
- **Frozen list:** `tmp/studio-real-loop/b-round-152-r153-tree-sha256.txt`, **962 entries**. That is `git ls-files -co --exclude-standard` (971) minus the 9 grants.
- **Grants:** `b-round-152-r153-grants.txt` (9 existing files). **New file:** `b-round-152-r153-new-files.txt` (1 file, doc 124).
- **Start hashes:** `b-round-152-r153-granted-start-sha256.txt`. **Start copies:** `b-round-152/r153-granted-start/`.
- **First step for A:** check HEAD, the empty status, the frozen list and the start hashes. If anything differs, A stops and reports.

## 0. Why this round (D-29z118)
- **Round 152: C PASS, 0 bugs.** `browserVerified` and `realVerified` are both true. Gate 152 published `ff2fd6c`, so **V-2a is done (მზადაა)**. C-R151-1, A-R151-REVIEW-L1 and A-R151-REVIEW-L4 are closed.
- **Checks at planning:**
  - The regression is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122). Today is 2026-10-25, so it is not due.
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist.
  - No Critical, High or Medium finding is open, apart from the Tech Lead manual items.
- **B measured V-2b in real Chromium** on `ff2fd6c` (store untouched; tools in `b-round-152/tools/`, results in `b-round-152/out/`):
  - `size152-{1440,1280}.json` covers S0, S1, the marker menu, the grid menu and S2 (Export). The only Studio texts ≥ 16 px are these:
    - the mono transport position (numeral role);
    - the `◀` library-collapse icon (V-3);
    - the 24 px Export dialog title (`ModalTitle`, defaults from the protected `Modal.tsx`; not in the spec's display list).
  - Every text the spec names for the display serif is 12–14 px: panel titles, track names, library entry names and the selected clip name.
  - `dispsim-*.json`: raising those roles to 16 px gives 59–65 vertical moves, and long library names wrap (+27.5 px each). That is a layout change.
  - `labelsim-*.json`: the label style on the six labels below gives **16 horizontal movers, 0 vertical, 0 new clip, 0 missing/added**, at both viewports, in S0 and S1.

### 0.1 B rulings (D-29z118)
- **R1 — V-2b is split, and scope is not reduced:**
  - **V-2b-1 (this round):** label typography.
  - **V-2b-2 (next round):** weight roles from the spec table, and the remaining numerals in mono.
    - Weight roles: UI sans 400/500 and mono 300/400. The `font-semibold`/`font-bold` uses and the peak over-state `font-medium` are kept today only to avoid faux bold (D-29z116 R5).
    - Remaining numerals (C-R151-SIG-SANS-TIMECODES): library durations, playhead timecodes, the zoom readout, ruler labels and counts.
  - **V-2b-DISPLAY:** waits for the user (R2).
- **R2 — Display serif → `awaiting_user`.** No text in the spec's named display roles is ≥ 16 px. Applying the serif would need a size change, and a size change is a layout change the user has not approved.
  - Options for Saba: (a) no serif in the Studio; (b) approve 16 px for those roles (B's numbers above); (c) serif on the Export dialog title only; (d) relax the ≥ 16 px rule.
  - Until he answers, **Cormorant is not loaded** (TH7 keeps asserting that it is absent). This is not deferral and not a scope cut: it is recorded in `feature-status.md` as a user question.
- **R3 — Which elements are labels (smallest honest reading of „MASTER, ARRANGEMENT და სხვ.“).** A label here is a static Latin word that names a Studio section or row. There are exactly six:

| # | Label | File / line at `ff2fd6c` | Now |
|---|---|---|---|
| L1 | Master | `ArrangementMaster.tsx` l.157–159 (`<span className="text-xs font-medium text-muted" aria-hidden="true">`) | 12 px / 500 |
| L2 | Zoom | `ArrangementTransport.tsx` l.235–236 (bare text inside the `<label>` that also holds the range input and the readout) | 12 px / 400 |
| L3 | Arrangement | `ArrangementVideoDock.tsx` l.888–890 (bare text before the `text-dim` "· Overview" span) | 12 px / 400 |
| L4 | BPM | `ArrangementTempoRow.tsx` l.219 (`<span>BPM</span>`) | 12 px / 400 |
| L5 | Markers | `ArrangementMarkerRow.tsx` l.687 (`<span>Markers</span>`) | 12 px / 400 |
| L6 | Loop | `StudioWorkspace.tsx` l.2442 (the `'Loop'` fallback text of the loop strip, shown when no loop is set) | 12 px / 400 |

  - **Not labels:** buttons, panel titles (display role, R2), field names in the detail panel (Track, Start, Length, Source offset), descriptive text (Original sound, No video added yet), and user content.
  - **User-visible decision (may be vetoed in `feature-status.md`):** the approved style widens the labels, so same-row neighbours move horizontally by up to **26 px**. That is more than the ≤ ~9 px of V-2a. B's simulation (1440 S0):

| Mover | dx | dw |
|---|---|---|
| Master fieldset and its label | −14.2 | +14.3 |
| Follow | −10.1 | — |
| Zoom label | −10.1 | +10.2 |
| Arrangement | — | +26 |
| "· Overview" note | +26 | — |
| Video caption | +26 | −26 |
| BPM | — | +1.6 |
| BPM input / 4/4 / Metronome | +1.6 | — |
| Markers | — | +18.8 |
| `+` / `◀` / `▶` marker buttons | +18.8 | — |
| Loop | — | +9.2 |

- **R4 — Tokens, not arbitrary values.** Tailwind has no default for 11 px or 0.14em (`text-xs` is 12 px, `tracking-widest` is 0.1em). A adds three `@theme` tokens in the TYPOGRAPHY section of `app.css`; they become the `text-label` and `tracking-label` utilities. **The obsidian block is not touched**, so TH2's "exactly 21 declarations" still holds. These are size and spacing tokens, not colours; no Store page uses them. `DESIGN_TOKENS.md` is silent on font-size tokens; `TAILWIND_FIRST.md` forbids hardcoded arbitrary values, so tokens are the closer fit.
- **R5 — Text content is unchanged.** Uppercase comes from CSS `uppercase` (`text-transform`). The DOM `textContent` of every label, and of its parent, stays byte-identical, including `VDS1`'s `'Arrangement · Overview'`.
- **R6 — Folded in (same doc owner):** C-R152-DOC123-L67. Doc 123 l.67 still says that C round 151 has not run; the status line becomes Completed.

## 1. What changes (exact)
| ID | File | Change |
|---|---|---|
| F1 | `app/styles/app.css` | In the `@theme` TYPOGRAPHY section, directly after `--font-serif: …;` (l.124), add exactly 3 lines: `--text-label: 0.6875rem;`, `--text-label--line-height: 1rem;`, `--tracking-label: 0.14em;`. No other line changes. |
| L1 | `ArrangementMaster.tsx` l.157 | On the Master span, `text-xs` → `text-label`, and add `tracking-label uppercase`. `font-medium`, `text-muted` and `aria-hidden` stay. |
| L2 | `ArrangementTransport.tsx` l.236 | Wrap the bare `Zoom` text in `<span className="text-label font-medium uppercase tracking-label">Zoom</span>`. The `<label>`, its classes, the input and the readout are unchanged. |
| L3 | `ArrangementVideoDock.tsx` l.889 | Wrap `Arrangement` in the same span classes. Keep exactly one space before the `text-dim` span (for example `{' '}`), so the outer span's `textContent` stays `Arrangement · Overview`. |
| L4 | `ArrangementTempoRow.tsx` l.219 | `<span>BPM</span>` → `<span className="text-label font-medium uppercase tracking-label">BPM</span>`. |
| L5 | `ArrangementMarkerRow.tsx` l.687 | The same change for `Markers`. |
| L6 | `StudioWorkspace.tsx` l.2442 | `'Loop'` → `<span className="text-label font-medium uppercase tracking-label">Loop</span>`. The loop-times branch is unchanged. |
| T1 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | New `it` **TH9** (the existing TH1–TH8 are unchanged). Details below the table. |
| D1 | `docs/implementation/2026/quarter-IV/123-studio-v2a-typography-fonts.md` | Edit 2 lines only. l.4 status → `Completed (C round 152 PASS, gate 152 published ff2fd6c)`. On l.67, replace the clause „C round 151 ჯერ არ გაშვებულა.“ with „C round 151-ისა და 152-ის შედეგები — ქვემოთ.“ |
| D2 | **new** `docs/implementation/2026/quarter-IV/124-studio-v2b1-label-typography.md` | Follow `docs/implementation/TEMPLATE.md`. Write it in Georgian, with technical terms in English. Include: the R1–R5 context; the six labels; the `@theme` token decision and the arbitrary-value alternative; the expected 26 px horizontal shift as a user-vetoable decision; the V-2b-DISPLAY user question; the tests and mutations; and a TODO for V-2b-2 / V-2b-DISPLAY. Status `In Progress (awaiting C round 153)`. |

**T1 / TH9 details:**
- **(a) Labels in the S0 SSR.** Use `renderToString(<StudioLabRoute />)`. Exactly **6** tags carry `tracking-label`. Each has the tokens `text-label`, `font-medium`, `uppercase` and `tracking-label`, and their inner texts (in DOM order, original case) equal exactly `['Master', 'Zoom', 'Arrangement', 'BPM', 'Markers', 'Loop']` (as a set if the DOM order differs; record the order in the report).
  - L6 is visible in S0 because S0 has no loop. If the S0 SSR does not render one of the six, A records which one and why, asserts the rest, and covers the missing one in a mounted test inside TH9.
  - No tag in the SSR uses `text-[11px]` or `tracking-[0.14em]`.
- **(b) The app.css tokens.** `app.css` contains each of the 3 F1 declarations exactly once, outside the obsidian block (brace depth 1 inside `@theme`).
- **(c) Text content.** The SSR text of the dock caption span is still `Arrangement · Overview`.

- **Nothing else changes:** no colour, no string in `strings.ts`, no other component, route or test file, and no `package.json`.

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/styles/app.css` | F1 only (3 lines) |
| `app/components/arrangement/ArrangementMaster.tsx` | L1 only |
| `app/components/arrangement/ArrangementTransport.tsx` | L2 only |
| `app/components/arrangement/ArrangementVideoDock.tsx` | L3 only |
| `app/components/arrangement/ArrangementTempoRow.tsx` | L4 only |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | L5 only |
| `app/components/arrangement/StudioWorkspace.tsx` | L6 only |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` | T1 only (new TH9) |
| `docs/implementation/2026/quarter-IV/123-studio-v2a-typography-fonts.md` | D1 only (2 lines) |
| `docs/implementation/2026/quarter-IV/124-studio-v2b1-label-typography.md` (new) | D2 |

- **Read before editing** (`.claude/rules/read-primitives.md`): `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `FORWARDREF_COMPONENT.md`, `GEORGIAN_DOCS.md`, `TESTING_QUALITY_GATES.md`.
- **Protected:** the diff vs `ff2fd6c` stays empty for `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx` and `root.tsx`.
- **Not allowed:** any other file; commit, push, stash, install, revert; `npm run build`. Every lasting edit goes through Edit/Write (the C-R120-01 rule).
- **If an existing test breaks because of L1–L6** (for example, an exact class or `textContent` assertion), A **stops and reports** the file, the line and the assertion. A does not edit any test file that is not granted; B grants it in the next round. B grepped `__tests__` and expects none: `VDS1` reads `textContent` (kept by L3), `GS14` reads button labels only, and the Zoom slider is found by its aria-label.

## 3. A — tests and commands (speed rules)
- **Start:** the checks in the Baseline section.
- **Baseline run:**
  ```
  npx vitest run app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/tempo-ui.test.tsx app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx
  ```
  Save the result as `a-round-153/vitest-baseline.json`.
- **After the edits:**
  - Run the same command. Every test that passed at baseline still passes, and TH9 is green.
  - `npm run typecheck`
  - `npm run lint`
  - A read-only `npx biome check` on the 8 changed code and test files.
- **Mutations** (Edit → run → restore by Edit → sha256 equals the post-edit hash; JSON goes in `a-round-153/mutations/`):
  - **m134:** remove `uppercase` from L5 (Markers). Only TH9 turns red.
  - **m135:** in F1, change `--tracking-label: 0.14em;` to `0.1em`. Only TH9 turns red.
  - **m136:** change L3 to drop the space before "· Overview". `VDS1` and TH9 (c) turn red.
- **Code-reviewer:** required (10 files). Pass any Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and every browser row.
- **End:**
  - The frozen 962 are OK, and the protected diff is empty.
  - `git status --short` = exactly the 9 granted ` M` + 1 `??` (doc 124).
  - Write `a-round-153/end-sha256.txt` (10 paths) and `a-round-153/diff-vs-start.patch`.

## 4. C — rows
**Setup:**
- Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Use both viewports, 1440×900 and 1280×720.
- Wait for `document.fonts.ready` before measuring. A session where the Google Fonts css2/woff2 do not return 200 is **invalid (environment)**; replace it at most twice.
- Reuse `c-round-152/tools/`; change only the output dir, labels and file names.
- **Reference for RV-1-LABELS:** `c-round-152/out/bbox-post-v2a-{1280,1440}.json`. Write nothing under earlier `c-round-*/out/`.

| Row | Check |
|---|---|
| T153-TARGETED | Re-run A's 7 vitest files. The counts equal A's. TH9 asserts the 6 labels exactly. |
| SOURCE-SCOPE | <ul><li>HEAD is `ff2fd6c`.</li><li>The frozen 962 are OK at start and at end.</li><li>The 10 end hashes equal `a-round-153/end-sha256.txt`.</li><li>`git status` = 9 ` M` + 1 `??`.</li><li>The protected diff vs `ff2fd6c` is empty.</li><li>The `app.css` diff is exactly the 3 F1 lines.</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | <ul><li>Each component diff is only its L-row.</li><li>The test diff is only the new TH9.</li><li>The doc 123 diff is the 2 D1 lines.</li><li>Doc 124 is in Georgian and has the TEMPLATE sections.</li></ul> |
| LABEL-STYLE | For each of the six labels at both viewports (L6 in **S0**, because S1 sets a loop and that replaces the fallback text), the computed style is: `font-size` 11px, `line-height` 16px, `font-weight` 500, `letter-spacing` 1.54px, `text-transform` uppercase, family Instrument Sans (CDP `getPlatformFontsForNode`: Instrument Sans [web]). `textContent` is the original-case word, and the rendered text is uppercase in the screenshot. Report the accessible name of the Master fieldset, the Zoom slider and the marker/BPM controls; they must be unchanged from round 152. |
| RV-1-LABELS | Re-run the d6 bbox chain (S0/S1/S2, both viewports, twice; determinism 0 px) vs the round-152 reference. PASS only if all of these hold: <ul><li>every y/h is within ±1 px;</li><li>0 keys are missing or added;</li><li>every `kind: panel` box is within ±1 px;</li><li>every mover > 1 px is horizontal, and is either a label's own width change or a same-row follower (list dx/dw/cause);</li><li>nothing is newly past 1280.</li></ul> **d6 keys only interactive, panel and clip elements** (`c-round-152/tools/d6.cjs` `collect`). So the new wrapper spans add **no** key, and the labels themselves, the "· Overview" note and the video caption are not d6 keys; LABEL-STYLE and NO-CLIP measure those. **B's prediction in d6 terms:** <ul><li>the Master `M` / Volume / Peak controls dx ≈ −14.2;</li><li>Follow dx ≈ −10.1 (the Zoom slider and readout ≤ 1 px or the same shift; report it);</li><li>the BPM input and Metronome dx ≈ +1.6;</li><li>marker `+` / `◀` / `▶` dx ≈ +18.8;</li><li>every panel (video dock, marker row, tempo row, loop strip) within ±1 px.</li></ul>The full sim table (§0.1 R3, max \|dx\| 26, including non-d6 spans) is in `b-round-152/out/labelsim-*.json`; C compares its own label/caption measurements against it. Report any mover that is not in the prediction. |
| NO-CLIP | For the six labels and their row neighbours (marker `+`/`◀`/`▶`, BPM input, 4/4, Metronome, Follow, the video caption): no new ellipsis, wrap or `scrollWidth > clientWidth` vs round 152, in S0 and S1, at both viewports. Also check with a loaded long-named video (S1 `beeps-6s-h264-aac.mp4`): the caption is not newly truncated. |
| FONTS-SCOPED | <ul><li>`/` and `/cart` at both viewports: 0 Instrument Sans / Plex Mono / Noto Georgian woff2 (a css2 `prefetch` after hover/focus is still allowed).</li><li>On the Store pages, `body` font-family is the Store literal, and 0 elements have computed `letter-spacing` 1.54px.</li><li>`/studio-lab` requests no new family (still exactly the V-2a css2 URL; no Cormorant).</li></ul> |
| TOKENS-SCOPED | The obsidian block is byte-identical to `ff2fd6c`. There is no hex in the components. The only `@theme` change is the 3 F1 lines. |
| FUNC-SMOKE | <ul><li>Play 2 s.</li><li>A clip drag, then Ctrl+Z.</li><li>Type a BPM, then Enter.</li><li>Move the Zoom slider (the readout changes).</li><li>M, then Enter, adds a marker; then marker `◀`/`▶`.</li><li>Ctrl+L on/off: the Loop label comes back when the loop is cleared/off, if the app shows it then; report what the app does.</li><li>Open the Export dialog and close it with Escape.</li></ul> Both viewports. |
| G153-3 | <ul><li>`/studio-lab` is anonymous, with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns 401.</li><li>Fake-Bearer 403: BLOCKED (backend unavailable in cloud).</li></ul> |
| PX-NET / REG-HYD | In every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror. The expected cart noise is allowed. One cold-Vite first load may be replaced (ENV-FIRST-LOAD). |

- **Not re-run** (unchanged by this round): RV-2 contrast (the label colours are unchanged, `text-muted`), FONT-FAIL. If the d6 contrast pass runs anyway, report the count; it is expected to equal round 152 (32).
- **Not C rows:** V-2b-DISPLAY (awaiting user), C-R151-2 and C-R151-3 (`deferred_low_polish`). A new observation about them is a note, not a FAIL.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:**
| Neighbour | Row |
|---|---|
| Marker row buttons and the BPM row in the fixed 224 px header column (`overflow-hidden`) | NO-CLIP, RV-1-LABELS |
| Video caption truncation (flex-1) | NO-CLIP |
| Right-anchored transport group (Follow, Zoom) | RV-1-LABELS |
| `VDS1` caption text, Zoom slider aria-label | T153-TARGETED, LABEL-STYLE |
| Store pages (new `@theme` tokens) | FONTS-SCOPED |

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Uppercase spaced section labels | None used. Source: the user-approved `visual-direction-a.md` § „ტიპოგრაფია“. | Not checked. | **Not applicable; CZABA brand decision.** | Requirement: LABEL-STYLE, RV-1-LABELS. Parity: not applicable. |

## 6. Evidence and reporting
- **A:** `a-round-153.md`, `a-round-153-result.json`, and `a-round-153/` (vitest JSON, mutations, end-sha256, the diff patch, the reviewer output).
- **C:** `c-round-153.md` and `c-round-153.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate` and `invalidRuns`. Include the RV-1-LABELS move table vs B's prediction and the LABEL-STYLE table. Put tools, out and shots in `c-round-153/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 154 planning)
| Condition | Round 154 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first (every done / c_pass item, both viewports, `npm run test:e2e:smoke`). Then the row below applies. |
| C FAIL Critical / High / Medium | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL on a row this round owns (TH9, LABEL-STYLE, NO-CLIP, RV-1-LABELS beyond the prediction) | A bounded fix-up of that row. |
| C PASS | Root publishes round 153. V-2b-1 → `c_pass` (**მზადაა** only with browser evidence). Round 154 = **V-2b-2**. B first measures the remaining sans numerals and the 600/700 weights, then plans. If `design-ux-decisions.md` or a user answer on V-2b-DISPLAY has arrived, B schedules it. |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` (both absent at round 153 planning).

## 8. Root notes
- **Gate:** publish round 153 on C PASS. The `app.css` diff vs `ff2fd6c` must be exactly the 3 F1 lines in `@theme`; `root.tsx` and `Modal.tsx` are unchanged.
- **User-visible decisions (may be vetoed in `feature-status.md`):**
  - D-29z118 R3: label widening, with neighbours moving horizontally ≤ 26 px.
  - D-29z118 R4: global `@theme` size/spacing tokens.
- **User questions:**
  - V-2b-DISPLAY: the serif options (a)–(d) in R2.
  - C-R151-2: the separators (accept / `word-spacing: 0.12em` / another glyph).
- **Frontend-architect checkpoint:** `b-round-148-checkpoint-request.md` is still pending and does not block. No new owner-concentration risk this round: each component gets one line or one wrapper.
