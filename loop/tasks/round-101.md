# CURRENT TASK — Round 101: Export dialog footer Lows: no 16 px strip under the footer, a spoken progress value, and the Close guard's `=== true` nit (+ doc 088 status line)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-100.md` (exact copy, sha256 `f37163b3…`). Rationale: `b-round-100.md`. Decision record: D-29z66 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** three tightly related Lows in one region of one file (the Export dialog's `ModalBody` and sticky footer), plus one doc status line. One owner (A).
  1. **GATE89-S4-FOOTER-MX8-COUPLING + A-R88-REVIEW-EDGES #4 (Low, one bug; browser-measured by B).** `ModalBody` has `py-4` (shared `Modal.tsx` l.218), so a 16 px strip of `ModalBody` shows **below** the sticky footer.
     - **Evidence:** B's probe `b-round-100-probe/probe-strip-result.json` (Chromium, 1 clip, idle dialog):
       - **1280×720**: at scrollTop 0 the footer is flush (gap 0). At max scroll (61 = 707 − 646) the footer bottom is 667 and the panel inner bottom is 683, so the **gap is 16 px**, and `elementFromPoint` 4 px above the panel bottom hits `ModalBody`, not the footer.
       - **1440×900**: the panel does not overflow (707 = 707), and the **gap is 16 px with no scrolling at all**. The strip is visible every time the dialog opens.
       - **Simulated fix** (the probe added `pb-0` to the `ModalBody` element at runtime): computed `padding-bottom` is 0px, and the gap is **0 at both viewports**. At 1280 max scroll becomes 45 (691 − 646), and the hit point is a footer descendant. At 1440 the panel is 16 px shorter (691). So `pb-0` wins over `py-4` in the generated CSS (`pb-0` is already used at `app/components/studio/ExportDialog.tsx:120`).
       - Screenshots: `strip-before-max-*.png`, `strip-simulated-pb0-max-*.png`.
     - The nit in A-R88 #4 (footer `pt-4 pb-4` → `py-4`) is part of this item.
  2. **GATE89-S6-PROGRESS-VALUETEXT (Low, a11y).** The `<progress>` (l.508–514) has no `aria-valuetext`. A screen reader reads it as a bare percent, or as nothing in the MP3 load phase (no `value`). The visible label above it (`formatArrangementExportProgress(progress)`, l.505–507) already says the phase and percent.
  3. **GATE97-S4-REPEAT-EQ-TRUE-NIT (Info).** The Close guard (l.541–545) checks `event.repeat === true`. The three sibling guards check `event.repeat` (`ArrangementTransport.tsx` l.250, `ArrangementLibraryPreview.tsx` l.293 and l.312). `repeat` is a boolean, so the behaviour is identical. The point is that all four button guards read the same, as the pending architecture checkpoint (ARCH-R97 / addendum (m)) expects.
  4. **GATE100-S4-DOC088-STATUS (Low, housekeeping):** doc 088 l.4 still says the round is waiting for C. C round 100 passed, and gate 100 published it at `17d944d`.
- **Not in this round (still open, not deferred):**
  - A-R88-REVIEW-EDGES #1–#3: the focus guard measures the radio and not its label card, it also scrolls on mouse focus, and the footer grows after focus without a new focusin. They change focus-scroll behaviour, not this strip, so they get their own round.
  - GATE89-S3 (worker watchdog), C-R90-MUT-B-CU4-GAP and A-R87-LOW-PU-ORDER.
  - The shared repeat-Enter helper (architecture signal; the root checkpoint comes first).
- **Frozen this round:** `Modal.tsx` (protected), `ArrangementTransport.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx`, `export-progress.ts`, and every existing test file other than the one append below.

## Why this round
- **C round 100: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 100: published**, commit `17d944da5255248d87a4c35aa9169b25b7b3d812` on both remotes (reviewer 9/10, no Critical or High).
- **No C bug is open.**
- The Export footer Lows are next in the dependency order (D-29z63 … D-29z65). Rounds 97–100 deliberately kept `ArrangementExportDialog.tsx` frozen until the held-Enter family was closed, and round 100 closed it.
- The strip is visible on every open at 1440×900, which is what a first-time user sees.
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21 and B plans this on 2026-10-23 (2 days; the rule needs 3). **The next B planning on or after 2026-10-24 is the regression round, whatever this round leaves open.**

## Baseline (measured by B, 2026-10-23)
- **HEAD `17d944da5255248d87a4c35aa9169b25b7b3d812`** (gate 100 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-100-r101-tree-sha256.txt`, **532** entries, **532/532 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts` (535), **except** the three owned files below.
  - It includes `export-dialog-hold-enter.test.tsx` (`cd2b2562`, HE1–HE7), `export-progress-ui.test.tsx` and every other `__tests__` file.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-100-r101-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-100-r101-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `cbee8cc6` | 576 | owned, **only** at: l.267 (`ModalBody` className), l.487 (footer className), the `<progress>` element l.508–514, l.542 (Close guard condition) |
  | `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx` | `5d6d30e4` | 443 | owned **append-only**: new `it` blocks after the last existing `it` (FT4 unmount, which ends at **l.442**), before the describe's closing `});` at **l.443** |
  | `docs/implementation/2026/quarter-IV/088-studio-preview-toggle-hold-enter.md` | `0a77d036` | 68 | owned (l.4 only) |
  | `ref_Modal.tsx`, `ref_export-dialog-hold-enter.test.tsx` | `741c2341`, `cd2b2562` | — | reference only (frozen) |

  New file: `docs/implementation/2026/quarter-IV/089-studio-export-footer-strip-valuetext.md`.
- **Protected (frozen, never edited; hashes unchanged since earlier rounds):**
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
  - Run mutation proofs and the fail-before in a scratch copy (`a-round-101/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. You may reuse `a-round-100/` scratch scripts as a model; do not edit A round 100 files.
  - Stop and report if anything does not match: a different HEAD, a dirty tree at the start, or a changed frozen file.

## 1. What changes (A)

Read the primitives first: `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` (Studio file), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.

**Pre-edit browser reproduction (recommended).** **Copy** `b-round-100-probe/probe-strip.cjs` to `a-round-101/` and run the copy there; never inside B's folder, because it writes its JSON and PNGs next to itself. Record `repro-before.json`, and after the edit `repro-after.json`. After the fix the "simulated" block adds a class that is already present, so its numbers equal the real ones. This is A's own check, not C's acceptance.

### T1 — the strip (`ArrangementExportDialog.tsx` l.267 and l.487)
- l.267: `<ModalBody className="space-y-4">` → `<ModalBody className="space-y-4 pb-0">`.
- l.487: in the footer className, replace `pt-4 pb-4` with `py-4`. Everything else in that string stays, including `-mx-8` and `px-8`.
- **Why this is the smallest honest choice (B decision):**
  - `Modal.tsx` is protected, so `ModalBody`'s `py-4` stays. Overriding its bottom padding from the one call site is the only fix inside ownership.
  - B's probe shows that `pb-0` wins over `py-4` and closes the gap at both viewports. The footer keeps its own 16 px bottom padding, so the buttons do not touch the panel edge.
  - **Rejected:** moving the footer out of `ModalBody` as a sibling. That moves the sticky/scroll container relationship, the focusin guard (`footer.contains`, `target.contains(footer)`) and FT1 ("last child of ModalBody"), which is a bigger change for the same pixels. Also rejected: editing `Modal.tsx`, which is protected.
  - **Accepted coupling:** the footer's `-mx-8` / `px-8` still mirrors `ModalBody`'s `px-8`. Doc 089 records this as accepted while `Modal.tsx` is frozen. GATE89-S4's coupling half stays a recorded signal, not a bug.

### T2 — `aria-valuetext` (the `<progress>` element l.508–514 only)
- Add `aria-valuetext={formatArrangementExportProgress(progress)}`. The function is already imported (l.6) and used on l.506 for the visible label, so the spoken text equals the visible label in every phase:
  - render and wav: `რენდერი · N%` / `WAV-ის ჩაწერა · N%`;
  - load (no `value`): `MP3 encoder-ის ჩატვირთვა…`;
  - mp3: `MP3-ის შექმნა · N%`.
- Nothing else on the element changes: `max`, `value`, `aria-label`, `data-testid` and `className` stay. Add no `aria-live` (gate 89 #6: the status message already announces phase changes, and a live region would read every percent).
- No new import, state, ref, effect or helper.

### T3 — the Close guard condition (l.542 only)
- `event.key === 'Enter' && event.repeat === true` → `event.key === 'Enter' && event.repeat`. Nothing else changes.
- This is an equivalence: the existing HE1–HE7 (`export-dialog-hold-enter.test.tsx`, frozen) must stay green unchanged. No new test can tell the two forms apart, so none is required. Say so in the report.

### Tests — append to `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx` (no new test file)
This file already mounts the dialog under `ArrangementProvider` (`mountFooterDialog`, l.124). It has `exportFooter`, `dialogPanel`, `byTestId` and `startControlledRender` (l.229), which calls `onProgress('render', 0.5)` and returns the control with `options.onProgress` and `finish`. Reusing it avoids another copy of the audio fake harness (ARCH-R93-TEST-HARNESS).
- **Append-only:** new `it` blocks inside the existing `describe`, after the last existing `it` (ends at l.442) and before the closing `});` at l.443. `git diff -U0` must show one pure-addition hunk in this file. The existing `beforeEach`/`afterEach` stay unchanged.

Rules:
- Assert exact values with `toBe`/`toEqual`.
- Use no type assertions (including `as const`) and no `@ts-` directives.
- jsdom has no layout. **FS1 is a className lock and proves nothing about pixels.** The browser rows STRIP-1280 and STRIP-1440 are the acceptance for T1. Write that into the test title.

Tests:
- **FS1 strip lock:**
  - the footer's parent (`ModalBody`) has the class tokens `pb-0` and `space-y-4`;
  - the footer is still its last element child;
  - the footer's tokens include `py-4`, `px-8`, `-mx-8`, `sticky`, `bottom-0` and `bg-surface`, and include neither `pt-4` nor `pb-4`.
- **FV1 valuetext follows the label:**
  - after `startControlledRender` the bar's `aria-valuetext` is exactly `რენდერი · 50%`, and it equals the text of `arrangement-export-progress-label`;
  - after `act(() => control.options?.onProgress?.('wav', 0.25))` both are exactly `WAV-ის ჩაწერა · 25%`;
  - the bar keeps `aria-label="ექსპორტის პროგრესი"`;
  - after `control.finish(...)` and a flush, the bar is gone.

  If the `onProgress` call signature differs, read it from `startControlledRender` and adapt; do not change the helper.
- **FV2 no live region on the bar:** during the render, the bar has no `aria-live` attribute and no `role` attribute. This is a lock; only mutation c makes it discriminate.

**Fail-before:** in scratch, run the extended file against the baseline snapshot `cbee8cc6`. B expects **FS1 red and FV1 red**, and FV2 plus the 7 existing tests (FT1, FT2, FT3, FT4 ×4) green. Report the exact list and explain any difference.

**Mutations (scratch only; each must turn at least one named test red):**
- a: drop `pb-0` from `ModalBody` → FS1
- b: `aria-valuetext` set to a constant (e.g. the `aria-label` text) → FV1
- c: add `aria-live="polite"` to the bar → FV2
- d: restore `pt-4 pb-4` on the footer → FS1

Record the red tests for each mutation and for an unmutated control run.

### Docs
- **Doc 088 l.4:** `**სტატუსი:** C PASS (Round 100), გამოქვეყნდა 17d944d (D-29z65)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc** `docs/implementation/2026/quarter-IV/089-studio-export-footer-strip-valuetext.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z66). Record:
  - B's measurements (16 px at 1280 max scroll and at 1440 without scrolling; 0 with `pb-0`);
  - why `pb-0` on the call site and not a footer move or `Modal.tsx`;
  - the accepted `-mx-8`/`px-8` coupling while `Modal.tsx` is protected;
  - `aria-valuetext` = the visible label, and why there is no `aria-live`;
  - the `=== true` equivalence;
  - that A-R88 #1–#3 stay open.

## 2. Checks A runs (speed rules)
- `npm run typecheck`, `npm run lint`.
- `npx vitest run` on these files:
  - `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx`;
  - `app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx` (HE1–HE7, unchanged);
  - `app/lib/arrangement/__tests__/export-progress-ui.test.tsx`;
  - every other export-dialog test file: `grep -rlE "ArrangementExportDialog|arrangement-export-footer|arrangement-export-progress" app/ --include=*.test.ts --include=*.test.tsx`. B's grep at baseline (from `store/`) returns **13** files: `export-cancel-ui`, `export-dialog-a11y-copy`, `export-dialog-focus-restore`, `export-dialog-focus`, `export-dialog-footer`, `export-dialog-hold-enter`, `export-mp3`, `export-progress-ui`, `export-range-ui`, `export-toolbar-hold-enter`, `master-ui`, `meter-ui`, `track-group-mix-ui`. The three files named above are among them.

  Write the final list to `a-round-101/targeted-list.txt`.
- Read-only Biome on the component and the test file (`npx biome check <files>`).
- **code-reviewer** is required (4 changed or new code/doc files). Hand its Architecture note to B verbatim.
- No full suite and no `npm run verify`; those belong to the gate.
- **Expected end state:** `git status --short` shows exactly **3 M** (`ArrangementExportDialog.tsx`, `export-dialog-footer.test.tsx`, doc 088) and **1 ??** (doc 089). The frozen list stays 532/532. Write `a-round-101/end-hashes.txt` with the 4 files.

## 3. What C verifies (browser first, Playwright Chromium, fresh incognito context per scenario, no credentials)
Use real keyboard, mouse and wheel input (`page.keyboard`, `page.mouse`, `locator.click`). **Do not set `scrollTop` from script for acceptance.** Scroll the dialog panel with `page.mouse.wheel` over the panel (the C round 88 VIS-SCROLL method), and record scrollTop after each step.

Setup:
- Decline consent. Wait until the `demo-middle-east` option is `draggable="true"` (ready).
- Add one clip: focus the row and press Enter once (0 → 1 clip).
- Open Export with a mouse click on the toolbar `Export` button.
- **Panel** = the nearest ancestor of `[data-testid=arrangement-export-footer]` with computed `overflow-y: auto`.
- **inner bottom** = panel rect bottom − its `border-bottom-width`.
- **gap** = inner bottom − footer rect bottom.
- **hit** = `elementFromPoint(panel centre x, inner bottom − 4)`.
- B's baseline numbers are in `b-round-100-probe/probe-strip-result.json`.
- **Do not run G101-3 or any route-loading row at the same time as a measurement row** (C-R99-N1).

| ID | Action | PASS evidence |
|---|---|---|
| **STRIP-1280** (primary) | 1280×720, idle dialog: measure at scrollTop 0, then wheel down until scrollTop stops growing (max). After a WAV export finishes (done state), wheel to max again. | <ul><li>At max scroll, idle and done: gap is **0 (±1 px)**; the baseline was 16.</li><li>hit is a footer descendant.</li><li>scrollTop max equals scrollHeight − clientHeight. Expected about 45 when idle; record the exact value.</li><li>No non-footer element is visible below the footer: hit-test 3 points across, 4 px above the inner bottom.</li><li>Screenshots at max scroll, idle and done.</li></ul> |
| **STRIP-1440** (primary) | 1440×900, idle dialog, no scrolling. | <ul><li>gap is **0 (±1 px)** at scrollTop 0 (baseline 16).</li><li>hit is a footer descendant.</li><li>Record whether the panel overflows (B expects scrollHeight = clientHeight = 691).</li><li>Screenshot.</li></ul> |
| **VIS-RENDER-REG** (1280) | Round 88 VIS-RENDER method: start a WAV export and sample with a MutationObserver until done. | In every sample the status, progress label, `<progress>` and busy button are visible and hit-tested inside the panel. scrollTop does not move by itself. |
| **VALUETEXT** (1280) | During the WAV export from VIS-RENDER-REG (or its own run), record the bar's `aria-valuetext` and the label text at every sample. Then run an MP3 export on a fresh page. | <ul><li>In every sample `aria-valuetext` equals the visible label text exactly, in the render, wav, load and mp3 phases.</li><li>In the load phase the bar has no `value` attribute, and `aria-valuetext` is `MP3 encoder-ის ჩატვირთვა…`.</li><li>The bar has no `aria-live`.</li><li>One `.mp3` downloads, with the exact done message.</li><li>If the encoder CDN is unreachable, the MP3 half is BLOCKED (network), not a FAIL.</li></ul> |
| **FOCUS-REG** (1280) | Idle dialog: Tab from the initial focus through the whole cycle (X → checked format → checked scope → Close → Export → X), then Shift+Tab back once. | <ul><li>The Tab order is as in round 89.</li><li>Every focused element outside the footer has rect bottom ≤ footer top, and focus never leaves the dialog.</li><li>Record scrollTop at each step; the focusin guard still works with the new padding.</li></ul> |
| **CLOSE-HOLD-REG** (1280) | Rounds 97–98 method: idle dialog, focus on Close (initial focus), held Enter (`keyboard.down('Enter')` + 3 more downs 50 ms apart, then up, then wait 1.2 s). | <ul><li>Keydowns repeat false/true/true/true.</li><li>The dialog closes once, and focus returns to the toolbar Export button.</li><li>The repeats have `defaultPrevented=true` (late bubble listener, C-R98-N4).</li><li>The dialog is **not** reopened 1.2 s after keyup.</li></ul> |
| **SPACE-TOGGLE-OBS** (1280, no code changed) | Gate 100 Low #1: 1 clip, click the Middle East row, `locator.focus()` on ▶ მოუსმინე, then hold Space (4 keydowns as above). | <ul><li>Record the clicks on the toggle, the toggle label and the transport button's `aria-label` timeline.</li><li>B's probe saw 0 clicks on the toggle, the label stayed ▶ მოუსმინე, and the transport went Play → Pause **once** (`b-round-100-probe/probe-space-hold-result.json`).</li><li>PASS = the same: the transport starts once, the preview is not started, and preview and transport never play together.</li><li>Stop the transport afterwards with one Space.</li></ul> |
| **EXPORT-REG** (1280) | The WAV from STRIP-1280 / VIS-RENDER-REG. | <ul><li>Exactly one download, a real WAV: RIFF/WAVE, PCM, 2 ch, 48 kHz, 24-bit, duration > 0, no NaN.</li><li>Record the duration and the done message.</li></ul> |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no non-noise console error, no pageerror. |
| **G101-3** | anonymous, run alone, after all measurement rows | <ul><li>The header link opens `/studio-lab` with the workspace and the demo badge.</li><li>`/studio/middle-east` shows sign-in and no workspace.</li><li>`/api/studio-token` returns 401.</li><li>The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`.</li></ul> |
| **AN-REVIEW** | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs mutations a, b and c in its own scratch and gets the same red tests.</li><li>Assertions are exact, and the added lines have no `as` and no `@ts-`.</li><li>The test hunk is a pure addition after l.442.</li></ul> |
| **T101-TARGETED** | `npx vitest run $(cat a-round-101/targeted-list.txt)` | All pass. Record the files and test counts. C re-runs the grep from §2 and reports any missing file. |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD is `17d944d`, with 3 M + 1 ??.</li><li>The frozen list is 532/532, and A's end hashes match.</li><li>The `git diff -U0` hunks in `ArrangementExportDialog.tsx` lie only at l.267, l.487, inside the `<progress>` element (l.508–514) and l.542.</li><li>There is one pure addition in the test file after l.442, and doc 088 changes only at l.4.</li></ul> |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- The sticky footer still keeps the status, label, bar and buttons visible during a render at 1280 (round 88).
- The focusin guard still scrolls a focused control above the footer.
- The Tab trap and the Close initial focus still work.
- The held-Enter Close guard still holds (HE1–HE7, CLOSE-HOLD-REG).
- MP3 and WAV exports still produce real files.

## 4. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Export dialog layout (footer flush with the panel edge), spoken progress text | none consulted; Live's export dialog is not a reference for CZABA's web modal | — | CZABA's own UI and a11y rules (design tokens, WAI-ARIA `aria-valuetext`). B makes no Ableton claim. | არ ეხება |
| Space with focus on a library button starts the transport | none consulted | — | CZABA rule D-29z64 R2 / C-R98-B1 (global Space = transport) | დაუდასტურებელი |

## 5. Report (A)
Write `a-round-101.md` and `a-round-101-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the pre-edit and post-edit browser reproduction;
- the fail-before list and the mutation table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
