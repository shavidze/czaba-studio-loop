# CURRENT TASK — Round 102: Export dialog focus guard measures the whole option card, the progress text is read once (+ doc 089 status line)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-101.md` (exact copy, sha256 `82d9255c…`). Rationale: `b-round-101.md`. Decision record: D-29z67 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** two Lows plus one nit in the Export dialog (`ArrangementExportDialog.tsx`), plus one doc status line. One owner (A).
  1. **A-R88-REVIEW-EDGES #1 (Low; browser-measured by B).** The focusin guard (l.222–237) measures only the focused element. For a radio, that element is the 13 px circle, but the visible option is its `<label>` card (`p-3`, border).
     - **Evidence:** B's probe `b-round-101-probe/probe-focus-result.json` (Chromium, 1 clip, real Tab keys).
     - **1280×720, done state** (after a real WAV export, the footer is 163 px tall and its top is at 520): Tab to `arrangement-export-scope-project` scrolls the panel 0 → **43**.
     - After that scroll, the radio bottom is 8.5 px above the footer top, but the **label card bottom is 8 px under the footer top**. The card's bottom border and padding are hidden behind the footer.
     - At idle (footer 71 px) the card is 41 px above the footer at 1280. At 1440 it is 86 px above, in both states. Neither case scrolls.
  2. **GATE101-S1 (Low, a11y) + GATE101-S2 (nit, same lines).** During a render the visible label `<p data-testid="arrangement-export-progress-label">` (l.505–507) and the bar's new `aria-valuetext` (l.511) carry the same text, so a screen reader reading line by line hears it twice.
     - **Evidence:** B's probe `b-round-101-probe/probe-ax-result.json` (Chromium, CDP `Accessibility.getFullAXTree` during a real render).
     - **Baseline:** the text is a `StaticText` node **and** the bar's valuetext. The dialog's text reads `… რენდერი · 4% რენდერი · 4% …`.
     - **Candidate (a), `aria-hidden="true"` on the `<p>`:** the StaticText node is gone. The bar stays `progressbar "ექსპორტის პროგრესი"` with the valuetext, and the text appears **once**.
     - **Candidate (b), `aria-labelledby` → `<p>` instead of `aria-label`:** worse. The bar's name becomes the percent text, the StaticText stays, and the text appears **three times**.
     - **Decision: candidate (a).** S2 rides along on the same lines: compute `formatArrangementExportProgress(progress)` once.
  3. **GATE101-S4 (Low, housekeeping):** doc 089 l.4 still says the round is waiting for C. C round 101 passed, and gate 101 published it at `56231c0`.
- **Closed by decision, no code (recorded in D-29z67, with the evidence):**
  - **A-R88 #2** (the guard also scrolls on mouse focus). This is the same finding as GATE89-S5, which the gate 89 reviewer acknowledged as "JS justified; cosmetic". B keeps that ruling: a click on a partly covered control brings all of it into view.
  - **A-R88 #3** (the footer grows after focus without a new focusin) is **unreachable in this dialog today.** B's probe shows the footer changes height only at render start (107 → 171) and at done (163). During a render the scope radios are disabled. The only body controls reachable by Tab are X and the format radios, which sit ≥ 289 px above the footer at 1280. At done the format radio stays 297 px above.
  - Reopen #3 if a later change puts a focusable body control near the footer while it can grow.
- **Not in this round (still open, not deferred):** GATE89-S3 (worker watchdog), C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER, GATE96-S2, the grid/tempo Lows, R21-I2. GATE101-S3 (a Firefox/WebKit pixel check) is environment-bound: only Chromium is installed, so it is filed with GATE97-S2.
- **Frozen this round:** `Modal.tsx` (protected), `export-progress.ts`, `dialog-tab-stops.ts`, every other component, and every existing test file other than the one append below. Existing tests FT1–FT4, FS1, FV1 and FV2 stay **unchanged and green**.

## Why this round
- **C round 101: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 101: published**, commit `56231c030d0cf85c13b818b481eec2886ebf1a04` on both remotes (reviewer 9/10, all findings Low).
- **No C bug is open.** The remaining Export dialog Lows are next in the published order (D-29z66: "A-R88 #1–#3 get their own focus-scroll round"). The gate 101 reviewer's Low 1 sits in the same footer and was introduced by round 101, so it is fixed while the code is fresh.
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21 and B plans this on 2026-10-23 (2 days; the rule needs 3). **The next B planning on or after 2026-10-24 is the regression round, whatever this round leaves open.**

## Baseline (measured by B, 2026-10-23)
- **HEAD `56231c030d0cf85c13b818b481eec2886ebf1a04`** (gate 101 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-101-r102-tree-sha256.txt`, **533** entries, **533/533 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts` (536), **except** the 3 owned files below.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-101-r102-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-101-r102-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `c2c32e1c` | 577 | owned, **only** at: the focusin guard body l.222–237; **at most one new line** directly before `const handleClose` (l.242), for `progressText`; and the `isRendering && progress` block l.503–517 |
  | `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx` | `9997e4cb` | 492 | owned **append-only**: new `it` blocks after the last existing `it` (FV2, which ends at **l.491**), before the describe's closing `});` at **l.492** |
  | `docs/implementation/2026/quarter-IV/089-studio-export-footer-strip-valuetext.md` | `dcf8d187` | 71 | owned (l.4 only) |
  | `ref_Modal.tsx` | `741c2341` | — | reference only (frozen) |

  New file: `docs/implementation/2026/quarter-IV/090-studio-export-focus-card-progress-once.md`.
- **Expected end state:** `git status --short` = **3 M + 1 ??**: the dialog, the test file, doc 089, and the new doc 090. Nothing else.
- **Protected (frozen, never edited; hashes re-checked by B at `56231c0`):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`)
  - `app/routes/api.studio-token.ts` (`13914809`)
  - `app/contexts/StudioContext.tsx` (`caa388e7`)
  - `app/utils/ffmpeg.ts` (`0995ae78`)
  - `app/components/ui/Modal.tsx` (`741c2341`)
  - `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`)
  - the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`) and `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`; B re-checked it). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs and the fail-before in a scratch copy (`a-round-102/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. You may reuse `a-round-101/` scratch scripts as a model; do not edit A round 101 files.
  - Stop and report if anything does not match: a different HEAD, a dirty tree at the start, or a changed frozen file.

## 1. What changes (A)

Read the primitives first: `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` (Studio file), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.

**Pre-edit browser reproduction (recommended).** **Copy** `b-round-101-probe/probe-focus.cjs` and `probe-ax.cjs` to `a-round-102/` and run the copies there. Never run them inside B's folder, because they write JSON and PNGs next to themselves. Record `repro-before.json` and, after the edit, `repro-after.json`. This is A's own check, not C's acceptance.

### T1 — the guard measures the option card (`ArrangementExportDialog.tsx` l.222–237 only)
- Keep every existing early return: no footer, target not an `HTMLElement`, target inside the footer, or target containing the footer.
- **New measurement:** the covered bottom is the larger of two values:
  - the focused element's `getBoundingClientRect().bottom`;
  - the bottom of its nearest enclosing `<label>`, if that label exists **and** lies inside `content` (`target.closest('label')`, then `content.contains(label)`).

  Then `overlap = coveredBottom − footer top`. If `overlap > 0`, use the same scroll as today: `content.scrollTop += overlap + ARRANGEMENT_EXPORT_FOOTER_FOCUS_MARGIN_PX`.
- **Why "the larger of the two" and not "the label instead of the target" (B decision):**
  - It can only add scroll, never remove it. So every case that passes today still passes; for example, a control taller than its label.
  - The existing FT4 tests mock only the radio's rect, and jsdom returns a 0×0 rect for the label. The max keeps FT4 green unchanged. "Label instead of target" would turn FT4 red for a reason that is not a behaviour change.
- Controls without an enclosing label (X, Close, Export, Cancel) behave exactly as today.
- No new state, ref, effect, listener or export. The margin constant stays 8.

### T2 — the progress text is read once
- **One new line** directly before `const handleClose` (l.242):
  `const progressText = isRendering && progress ? formatArrangementExportProgress(progress) : null;`
  The exact form is A's choice; it must be `null` when not rendering and add no export.
- In the `isRendering && progress` block (l.503–517), the condition stays as it is:
  - The `<p data-testid="arrangement-export-progress-label">` gets `aria-hidden="true"` and renders `progressText`. Its className and testid are unchanged, so sighted users still see it.
  - The `<progress>` uses `aria-valuetext={progressText ?? undefined}` (or an equivalent that never sets the attribute to the string `"null"`).
  - `aria-label="ექსპორტის პროგრესი"`, `max`, `value`, `data-testid` and `className` stay.
  - Add no `aria-live` and no `role`.
- **Why `aria-hidden` on the label (B decision, from the AX probe):** it is the only candidate that leaves the text in the accessibility tree exactly once, as the bar's value, while the bar keeps a stable name. `aria-labelledby` made the name change with every percent and kept the duplicate.

### Tests — append to `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx` (no new test file)
Reuse `mountFooterDialog`, `exportFooter`, `dialogPanel`, `byTestId`, `mockBottom` (l.199) and `startControlledRender` (l.229).
- **Append-only:** new `it` blocks inside the existing `describe`, after FV2 (ends at l.491) and before the closing `});` at l.492. `git diff -U0` must show one pure-addition hunk in this file. The existing `beforeEach`/`afterEach` stay unchanged.

Rules:
- Assert exact values with `toBe`/`toEqual`.
- Use no type assertions (including `as const`) and no `@ts-` directives.
- jsdom has no layout, so the FC tests check the guard's arithmetic on mocked rects. The pixel acceptance is C's CARD-1280 row. Write that into the FC1 title.

Tests:
- **FC1 the card counts:**
  - mock the footer to (560, 680);
  - mock `scope-project` to (530, 546), above the footer;
  - mock its `closest('label')` to (517, 571), so 11 px of the card is under the footer;
  - focus the radio → `panel.scrollTop` is exactly `11 + 8 = 19`.
- **FC2 the target still counts when its label is higher.** Use the same footer, the radio at (584, 600) and its label card at (300, 350). Focus the radio → `scrollTop` is exactly `40 + 8 = 48`, the same as FT4.
- **FC3 a card fully above the footer never scrolls:**
  - the radio at (300, 316) and its card at (290, 330) → `scrollTop` stays 0;
  - Close (no label, inside the footer) → still 0.
- **FA1 the text is read once:**
  - after `startControlledRender`, the label `<p>` has `aria-hidden="true"` and text exactly `რენდერი · 50%`;
  - the bar's `aria-valuetext` is exactly `რენდერი · 50%` and its `aria-label` is exactly `ექსპორტის პროგრესი`;
  - after `onProgress('wav', 0.25)` the label is still `aria-hidden="true"` and the text and valuetext are both `WAV-ის ჩაწერა · 25%`.

**Fail-before:** in scratch, run the extended file against the baseline snapshot `c2c32e1c`. B expects **FC1 red and FA1 red**, and FC2, FC3 plus the 10 existing tests (FT1–FT3, FT4 ×4, FS1, FV1, FV2) green. Report the exact list and explain any difference.

**Mutations (scratch only):**
- a: measure only the target (the baseline guard) → FC1 red.
- b: measure only the label, dropping the target → FC2 red, and FT4 "scrolls the panel by overlap + margin" red.
- c: drop the `content.contains(label)` check. This is optional: no reachable DOM puts the enclosing label outside the dialog, so if no test can tell, say so honestly and do not invent one.
- d: remove `aria-hidden` from the label → FA1 red.
- e: put the valuetext back to a second, independent `formatArrangementExportProgress(progress)` call. This is an equivalence, so no test should turn red. Report it as such: it only checks S2's refactor and is not a behaviour.

Record the red tests for each mutation and for an unmutated control run.

### Docs
- **Doc 089 l.4:** `**სტატუსი:** C PASS (Round 101), გამოქვეყნდა 56231c0 (D-29z66)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc** `docs/implementation/2026/quarter-IV/090-studio-export-focus-card-progress-once.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z67). Record:
  - B's measurements: the card is 8 px under the footer at 1280 in the done state, and the expected scroll is ≈ 59;
  - why "the larger of target and label" was chosen;
  - the AX probe result and why `aria-hidden` was chosen over `aria-labelledby`;
  - that A-R88 #2 and #3 are closed by decision, with the reasons above;
  - the open info item INFO-B101-VALUETEXT-CDP (below), as an observation, not a defect.

### Checks A runs (speed rules)
- `npm run typecheck`
- `npm run lint`
- Targeted vitest: `grep -rlE "ArrangementExportDialog|export-dialog|arrangement-export-progress" app --include=*.test.tsx --include=*.test.ts | sort > ../tmp/studio-real-loop/a-round-102/targeted-list.txt`, then `npx vitest run $(cat ../tmp/studio-real-loop/a-round-102/targeted-list.txt)`.
- Do **not** run the full suite or `npm run verify`; the root gate runs them.
- **Code-reviewer:** this round changes 4 files, so run it. Pass its Architecture note through verbatim.

## 2. Acceptance — what C checks (real Chromium, both viewports where stated)
**Setup for every row unless stated:**
- a fresh incognito context on `/studio-lab`, and Decline consent;
- focus the Middle East row and press **Enter** (one clip);
- open Export with a real click.

Scroll only with the mouse wheel; never set `scrollTop` from script. Measure with `getBoundingClientRect` and `elementFromPoint`.

| ID | Steps | PASS when |
|---|---|---|
| **CARD-1280** (primary) | 1280×720. Run a real WAV export (real click on WAV-ის ექსპორტი) and wait for done. Then press Tab from the initial focus until `scope-project` is focused. | <ul><li>The `scope-project` **label card** bottom is ≤ the footer top. B measured +8 before; expected ≈ −8 ± 1.</li><li>The radio bottom is above the footer.</li><li>`elementFromPoint` at the card's bottom-centre minus 2 px hits the card or a descendant, not the footer.</li><li>The card top is below the panel's top edge (the scroll did not overshoot).</li><li>Record `scrollTop`: B expects ≈ 59 (was 43), and it must be ≤ the max scroll (137).</li><li>Take a screenshot.</li></ul> |
| **CARD-IDLE-REG** | 1280 idle, and 1440 idle + done: the same Tab walk. | <ul><li>Nothing scrolls where nothing needed to: `scrollTop` stays 0 (the cards are 41 / 86 / 86 px above the footer).</li><li>Every focused body control's card (or the control itself) is above the footer.</li></ul> |
| **AX-ONCE** | 1280: real WAV export. During the render, take CDP `Accessibility.getFullAXTree` (as in `b-round-101-probe/probe-ax.cjs`). Also take one sample in the MP3 path (format MP3), in the load or mp3 phase. | <ul><li>No non-ignored `StaticText` node has the progress text.</li><li>There is exactly one `progressbar`, with the name `ექსპორტის პროგრესი` and a valuetext.</li><li>The dialog's aggregated text holds the progress string once. The B baseline had it twice.</li><li>The `<p>` is still visible: a non-zero rect, and its text equals the bar's `aria-valuetext` attribute.</li></ul> |
| **VALUETEXT-REG** | 1280 WAV, and one MP3 run | `aria-valuetext` equals the visible label text in every sample, in every phase seen (render, wav, load, mp3). This is round 101's VALUETEXT method. |
| **FOCUS-REG** (1280 idle) | Tab through the whole cycle, then Shift+Tab once. | <ul><li>The order is unchanged from round 101: Close → WAV-ის ექსპორტი → X → format-wav → scope-project → Close.</li><li>Focus never leaves the dialog.</li></ul> |
| **STRIP-REG** | 1280 idle at max wheel scroll, and 1440 done | The gap below the footer is 0 ± 1 px (the round 101 STRIP rows). |
| **EXPORT-REG** | The WAV from CARD-1280, and the MP3 from AX-ONCE | <ul><li>WAV: exactly one download, a real WAV (RIFF/WAVE, PCM, 2 ch, 48 kHz, 24-bit, duration > 0, no NaN).</li><li>MP3: one file that decodes in Web Audio. If the CDN is unreachable, MP3 is BLOCKED (environment), not FAIL.</li></ul> |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no non-noise console error, no pageerror. |
| **G102-3** | anonymous, run alone, after all measurement rows | <ul><li>The header link opens `/studio-lab` with the workspace and the demo badge.</li><li>`/studio/middle-east` shows sign-in and no workspace.</li><li>`/api/studio-token` returns 401.</li><li>The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`.</li></ul> |
| **AN-REVIEW** | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs mutations a, b and d in its own scratch and gets the same red tests.</li><li>Assertions are exact, and the added lines have no `as` and no `@ts-`.</li><li>The test hunk is a pure addition after l.491.</li></ul> |
| **T102-TARGETED** | `npx vitest run $(cat a-round-102/targeted-list.txt)` | All pass. Record the files and test counts. C re-runs the grep from §1 and reports any missing file. |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD is `56231c0`, with 3 M + 1 ??.</li><li>The frozen list is 533/533, and A's end hashes match.</li><li>The `git diff -U0` hunks in `ArrangementExportDialog.tsx` lie only inside l.222–237, one added line before l.242, and l.503–517.</li><li>There is one pure addition in the test file after l.491, and doc 089 changes only at l.4.</li></ul> |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- The guard scrolls too far and hides a control at the top of the panel. Check the card top in CARD-1280.
- The Tab trap and the Close initial focus.
- The sticky footer during a render.
- The 0 px strip from round 101.
- MP3 and WAV exports.
- A sighted user must still see the progress label: `aria-hidden` must not hide it visually.

**Observation for C (record it, do not FAIL on it): INFO-B101-VALUETEXT-CDP.**
- In B's CDP dump, the bar's `valuetext` *property* shows as mojibake (`á ááááá á Â· 9%`).
- The names and the aggregated dialog text show correct Georgian.
- This looks like a CDP serialization artifact (UTF-8 read as Latin-1), not app behaviour. A real screen reader check is a Tech Lead item.
- If C sees the same, note it under `notes`.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A focused option is never hidden behind the dialog footer | none consulted; Live's export dialog is not a reference for CZABA's web modal | — | CZABA's own a11y/layout rule (WCAG 2.4.11 Focus Not Obscured, as a design aim). No Ableton claim. | არ ეხება |
| The progress text is announced once | none consulted | — | WAI-ARIA `aria-valuetext`, plus `aria-hidden` on the duplicate visual label | არ ეხება |

## 4. Report (A)
Write `a-round-102.md` and `a-round-102-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the pre-edit and post-edit browser reproduction;
- the fail-before list and the mutation table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
