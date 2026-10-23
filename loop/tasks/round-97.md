# CURRENT TASK — Round 97: Export Lows part 1 — held Enter after Cancel closes the dialog (GATE90-S3) + dead disabled class on Cancel (GATE90-S4) + doc 084 status line (GATE96-S1)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-96.md` (exact copy, sha256 `5d25d47d…`). Rationale: `b-round-96.md`. Decision record: D-29z62 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** two related Lows in one component (the export dialog footer) plus one doc status line. One owner (A).
  1. **GATE90-S3-HOLD-ENTER-CLOSES:** during an export, Enter on „გაუქმება“ cancels. Cancel then unmounts and focus moves to „დახურვა“. If the user is still holding Enter, the browser's repeated keydown activates „დახურვა“. The dialog closes and the cancelled status is lost.
  2. **GATE90-S4-CANCEL-DISABLED-CLASS:** the Cancel button carries `disabled:opacity-40`, but it is never disabled, so the class can never apply.
  3. **GATE96-S1-DOC084-STATUS:** doc 084 l.4 still says the round is waiting for C. C round 96 passed and gate 96 published it.
- **GATE90-S5-UNUSED-PREDICATE is closed by B decision, with no code change.** `isArrangementExportCancelledError` stays as the type guard of the exported `ArrangementExportCancelledError` class, and `export-cancel.test.ts` uses it. The app correctly checks `signal.aborted`, which also hides late errors that are not cancel errors. A records this decision in doc 085. **Do not edit `export-cancel.ts` or `export-cancel.test.ts`.**

## Why this round
- **C round 96: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 96: published**, commit `ce440360062f16ee3db2e9795bf33b42c63abc23` on both remotes (reviewer 9/10, no Critical or High).
- C has no open bug. The next items in the planned order (b-round-95.md §Next 3) are the Export Lows, starting with GATE90-S3/S4/S5.
- **The held-Enter bug can be reached in a real browser.** B ran a read-only probe (`b-round-96-probe/probe.cjs`; result in `probe-result.json`) on a plain page, not on the app:
  - In Chromium, Playwright's `keyboard.down('Enter')` sent twice without `up` delivers the second keydown with `repeat=true`.
  - When the first button removes itself and focus moves to a second button, that repeat keydown **clicks the second button**.
  - A `preventDefault()` on a repeated Enter keydown stops the click, and a fresh Enter still clicks.
- `regression-last.json` is 2026-10-21 and today is 2026-10-23 (2 days), so the regression round is not due yet. **The first round planned on or after 2026-10-24 is the regression round.**

## Baseline (measured by B, 2026-10-23)
- **HEAD `ce440360062f16ee3db2e9795bf33b42c63abc23`** (gate 96 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-96-r97-tree-sha256.txt`, **526** entries, **526/526 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the two owned existing files (`ArrangementExportDialog.tsx`, doc 084).
  - Frozen and relevant here:
    - `app/lib/arrangement/export-cancel.ts` (`07826749`) and `app/contexts/ArrangementContext.tsx`;
    - `export-cancel-ui.test.tsx` (`e850f4eb`), `export-cancel.test.ts` (`b15ef366`), `export-dialog-focus.test.tsx` (`ac53f685`), `export-dialog-focus-restore.test.tsx` (`e4ad8336`), `export-dialog-footer.test.tsx` (`5d6d30e4`), `export-dialog-tab-stops.test.tsx` (`8fd007ba`), `export-dialog-a11y-copy.test.tsx` (`b54abec3`), and every other `__tests__` file. **No existing test file is granted.**
    - doc 078 (`ce84a27d`). It says the Cancel classes were copied from Close on purpose. Do not edit it; doc 085 records that this note is superseded.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-96-r97-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-96-r97-snapshots/` (`SHA256SUMS.txt`). Both are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `0040e050` | 571 | owned (E1 and E2 only) |
  | `docs/implementation/2026/quarter-IV/084-studio-failed-source-refusal-text.md` | `869f9238` | 62 | owned (l.4 only) |

- **Protected (frozen, never edited):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`)
  - `app/routes/api.studio-token.ts` (`13914809`)
  - `app/contexts/StudioContext.tsx` (`caa388e7`)
  - `app/utils/ffmpeg.ts` (`0995ae78`)
  - `app/components/ui/Modal.tsx` (`741c2341`)
  - `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`)
  - the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs and fail-before in a scratch copy (`a-round-97/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. You may reuse `a-round-96/` scratch scripts as a model; do not edit A round 96 files.
  - A mismatch (another HEAD, a dirty tree at start, a changed frozen file) means stop and report.

## 1. What changes (A)

Read the primitives first: `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**Optional pre-edit browser reproduction (recommended):** the dev server serves `store/` live, so do this **before** your first edit.
1. Open `/studio-lab` and open Export.
2. Start a WAV export and Tab to Cancel.
3. Call `page.keyboard.down('Enter')` twice.
4. Record whether the dialog closes and what `event.repeat` was, in `a-round-97/repro-before.json`.

This only reads the repository. If it does not reproduce, say so and continue; do not change the contract.

### E1 — „დახურვა“ ignores a repeated Enter (`ArrangementExportDialog.tsx`, the Close button at baseline l.537–545 only)
Add an `onKeyDown` to the „დახურვა“ button (the one with `ref={closeButtonRef}`):
- If `event.key === 'Enter'` and `event.repeat === true`, call `event.preventDefault()`. Nothing else happens.
- Every other key, and a non-repeated Enter, is untouched: no `preventDefault` and no `stopPropagation`.
- The handler may be inline or a module-level non-exported function in this file. Add no new export, hook, state, ref or effect.

The result, in every phase (not only after Cancel):
1. A held Enter that started on Cancel no longer closes the dialog. The cancelled status stays, and focus stays on Close.
2. A fresh Enter press on Close (after the key was released) still closes the dialog, as now.
3. A mouse click and Space on Close still close the dialog, as now. Space activates on keyup, so a held Space is not part of this bug.
4. The focus rules are unchanged: initial focus on Close, focus on Close after Cancel and at render end, and focus restore to the opener. The Tab trap is unchanged.

**Why this is the smallest honest choice (B decision):** the bug is that a key press meant for Cancel lands on the next button. Ignoring only the repeated Enter on the button that receives focus after Cancel fixes exactly that.
- Delaying focus, adding a timer, or blocking Enter for a time window would change the frozen focus rules or add state.
- Applying the guard in every phase is simpler than tying it to the cancel moment. A held Enter on Close is never a deliberate second action.
- The same mechanism has a second entry point: opening the dialog by holding Enter on the toolbar Export button puts the initial focus on Close, and the repeat keydown would close the dialog at once. The every-phase guard covers it too (C row OPEN-HOLD).
- The primary export button and the radios are not touched. After Cancel, focus goes to Close, not to them.

### E2 — Cancel loses the dead `disabled:` variant (`ArrangementExportDialog.tsx`, the Cancel button at baseline l.528–535 only)
- Remove only the `disabled:opacity-40` token from the Cancel button's `className`. Every other token stays, in the same order.
- The Close and primary export buttons keep their classes unchanged. Close is disabled while rendering, so its `disabled:opacity-40` is live.
- Cancel never gets a `disabled` attribute.

**Nothing else in this file changes.** This includes the four focus effects (baseline l.145–240), `handleClose`, the footer markup and classes (GATE89-S4 is a later round), the progress element (GATE89-S6 is a later round), the status paragraph and the primary button.

### New test — `app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx`
Mount the provider and the dialog with a render that stays pending until the test settles it, the way `export-cancel-ui.test.tsx` does (CU1, CU3, CU9). Copy what you need; never import from a test file.
- Find the buttons by role and accessible name (`გაუქმება`, `დახურვა`).
- Use the return value of `fireEvent.keyDown(...)`: `false` means the default was prevented.
- Assert exact strings with `toBe`.
- Use no type assertions, including `as const`.
- Restore all stubs in `afterEach`.

Tests:
- **HE1 repeat after Cancel (WAV, render phase):** start a WAV export and click Cancel. Focus is on Close and the status is exactly `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.`. `fireEvent.keyDown(close, { key: 'Enter', repeat: true })` returns `false`. The dialog's `onClose` mock has 0 calls, the status text is unchanged, and focus is still on Close.
- **HE2 fresh Enter is not blocked:** in the same state, `fireEvent.keyDown(close, { key: 'Enter', repeat: false })` returns `true`. Then `fireEvent.click(close)` calls `onClose` exactly once. jsdom does not turn a keydown into a click, so the click is explicit.
- **HE3 only Enter is guarded:** in the same state, a repeated `' '` (Space) keydown and a repeated `'a'` keydown on Close both return `true`.
- **HE4 idle dialog:** open the dialog with no export running. Focus is on Close. A repeated Enter keydown returns `false`; a non-repeated Enter keydown returns `true`.
- **HE5 classes:** while rendering, the Cancel button has no `disabled` attribute and its `className` contains no `disabled:` token. Close is disabled and its `className` still contains `disabled:opacity-40`. After Cancel, Close is enabled.
- **HE6 no propagation change:** a `keydown` listener on `document` still receives the repeated Enter that Close prevented. The guard does not call `stopPropagation`.
- **HE7 MP3 load phase:** start an MP3 export and cancel it in the `load` phase (hanging encoder load, as CU3 does). The status is exactly `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა. MP3 encoder შემდეგ MP3 ექსპორტზე თავიდან ჩაიტვირთება.`. A repeated Enter keydown on Close returns `false`, `onClose` has 0 calls, and the text is unchanged.

**Fail-before:** in scratch, run the new file against the baseline snapshot of `ArrangementExportDialog.tsx`. B expects **HE1, HE4, HE5 and HE7 red**. HE2, HE3 and HE6 lock behaviour that must not change, so they pass on both versions. Report the exact list and explain any difference.

**Mutations (scratch only; each must turn at least one named test red):**
- a: remove the guard → HE1/HE4/HE7
- b: prevent every Enter (drop the `repeat` check) → HE2/HE4
- c: prevent every repeated key (drop the `key` check) → HE3
- d: add `event.stopPropagation()` to the guard → HE6
- e: put `disabled:opacity-40` back on Cancel → HE5
- f: remove `disabled:opacity-40` from Close → HE5

Record the red tests for each mutation and for an unmutated control run.

### Docs
- **Doc 084 l.4:** `**სტატუსი:** C PASS (Round 96), გამოქვეყნდა ce44036 (D-29z61)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc** `docs/implementation/2026/quarter-IV/085-studio-export-dialog-hold-enter.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z62). Record:
  - why only a repeated Enter on Close is ignored, and the alternatives that were rejected;
  - that doc 078's note about copying the Close classes onto Cancel is superseded for the `disabled:` token;
  - the GATE90-S5 decision to keep `isArrangementExportCancelledError`.
- `docs/technical/arrangement-workspace.md` is **not** owned this round (frozen).

## 2. Checks A runs (speed rules)
- `npm run typecheck`, `npm run lint`.
- `npx vitest run` on these files, all under `app/lib/arrangement/__tests__/`:
  - the new file;
  - `export-cancel-ui.test.tsx`, `export-dialog-focus.test.tsx`, `export-dialog-focus-restore.test.tsx`, `export-dialog-footer.test.tsx`, `export-dialog-tab-stops.test.tsx`, `export-dialog-a11y-copy.test.tsx`;
  - `export-progress-ui.test.tsx`, `export-range-ui.test.tsx`, `export-mp3.test.tsx`;
  - any other existing test file that greps for `ArrangementExportDialog`, `arrangement-export-cancel` or `დახურვა` (`grep -rl` under `app/`).

  Write the final list to `a-round-97/targeted-list.txt`.
- Read-only Biome on the two code files (`npx biome check <files>`).
- **code-reviewer** is required (4 changed or new files). Hand its Architecture note to B verbatim.
- No full suite and no `npm run verify`; those belong to the gate.
- **Expected end state:** `git status --short` shows exactly **2 M** (`ArrangementExportDialog.tsx`, doc 084) and **2 ??** (the new test file and doc 085). The frozen list stays 526/526. Write `a-round-97/end-hashes.txt` with the 4 files.

## 3. What C verifies (browser first, Playwright Chromium, fresh incognito context, no credentials)
Every row runs at **1280×720 and 1440×900** unless noted. Use real keyboard and mouse input (`page.keyboard`, `page.mouse` or `locator.click`). Record the exact texts.

Notation:
- `CANCELLED` = `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.`
- `CANCELLED_ENC` = `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა. MP3 encoder შემდეგ MP3 ექსპორტზე თავიდან ჩაიტვირთება.`

Setup:
- Install a capture-phase `keydown` recorder through an init script. It logs `key`, `repeat` and the text of `document.activeElement` for each event. Install it once (C round 90 N1: a double install logs every event twice).
- To get a render long enough to cancel, add enough clips (for example Middle East, HERO and synthetic rows), as C round 90 CX-KEYS did (Enter landed at `რენდერი · 4%` and `9%`). C may reuse its round 90 tools.

| ID | Action | PASS evidence |
|---|---|---|
| **HOLD-ENTER** (primary) | Open Export, choose WAV and start the export. During `რენდერი`, Tab to „გაუქმება“ and call `keyboard.down('Enter')` once. Wait until focus is on „დახურვა“. Then call `keyboard.down('Enter')` 3 more times, 50 ms apart, then `keyboard.up('Enter')`. | The recorder shows the first keydown with `repeat=false` on გაუქმება and the next three with `repeat=true` on დახურვა. After the up, the dialog is still open, the status is exactly `CANCELLED`, focus is on „დახურვა“, and there are 0 downloads in 10 s. Screenshot. |
| **HOLD-ENTER-MP3** (1440 only) | The same, with MP3 chosen. | The dialog stays open after the repeats. The status is whichever cancel text appeared (`CANCELLED` or `CANCELLED_ENC`, recorded) and does not change after the repeats. 0 downloads. |
| **FRESH-ENTER-CLOSES** | Continue from HOLD-ENTER after `keyboard.up`, and press Enter once (`keyboard.press`). | The dialog closes and focus returns to the toolbar Export button (the existing focus restore). In a second run, a mouse click on „დახურვა“ after a cancel also closes the dialog. |
| **OPEN-HOLD** (1280 only) | Focus the toolbar Export button. `keyboard.down('Enter')` once, wait for the dialog and for focus on „დახურვა“, then `keyboard.down('Enter')` 2 more times and `keyboard.up('Enter')`. | The recorder shows `repeat=true` on დახურვა. The dialog is still open and focus is on „დახურვა“. |
| **SPACE-REG** (1280 only) | During a render, focus Cancel and press Space. Then press Space on „დახურვა“. | Space on Cancel gives `CANCELLED`. Space on Close closes the dialog. |
| **CANCEL-CLASS** | During a render, read both buttons. | Cancel has no `disabled` attribute and its `class` contains no `disabled:`. Close has the `disabled` attribute and a computed `opacity` of `0.4`. After Cancel, Close has no `disabled` attribute and an opacity of `1`. Screenshot of the footer during the render. |
| **CX-REG** | Mouse-click Cancel during a render. Then run a new WAV export to the end. | `CANCELLED`, and 0 downloads in 10 s. The second export downloads one WAV that decodes (record sample rate, channels, and a duration > 0). |
| **DONE-REG** | A full WAV export without cancel. | The done status appears, focus is on „დახურვა“, and one fresh Enter closes the dialog. |
| **ESC-REG** | During a render, press Escape. Then cancel and press Escape. | The same as C round 90 CX-KEYS: Escape during a render does not cancel. After a cancel, Escape closes the dialog and focus is on the toolbar Export button. Record both observations. |
| **PX-NET** | all sessions | 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no non-noise console error, no pageerror. |
| **G97-3** | anonymous | The header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows sign-in and no workspace. `/api/studio-token` returns 401. The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`. |
| **AN-REVIEW** | Review A's tests. | The fail-before list matches §1, or the difference is explained. C re-runs mutations a, b and e in its own scratch and gets the same red tests. Assertions are exact, and the new file has no `as`. |
| **T97-TARGETED** | `npx vitest run $(cat a-round-97/targeted-list.txt)` | All pass. Record the files and test counts. |
| **SOURCE-UNCHANGED** | start and end | HEAD `ce44036`; 2 M + 2 ??; frozen 526/526; A's end hashes match. The `git diff -U0` hunks in `ArrangementExportDialog.tsx` lie only inside the Cancel button (baseline l.528–535), the Close button (l.537–545) and at most one module-level non-exported function. Doc 084 changes only at l.4. |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- A fresh Enter, a click and Space on „დახურვა“ must still close the dialog.
- The focus rules (initial Close, Close after Cancel and at render end, restore to the opener) and the Tab trap.
- Cancel itself: Enter, Space and a click still cancel in every phase.
- The export result: a later export still produces a real decodable file.
- Escape behaviour, which belongs to the protected `Modal.tsx`.

## 4. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A held Enter after Cancel does not also close the export dialog | none | — | Browser key-repeat behaviour on CZABA's own web dialog. B makes no claim about Live's export dialog. | არ ეხება |
| Disabled styling only on buttons that can be disabled | none | — | CZABA Tailwind hygiene | არ ეხება |

No Ableton claim is made.

## 5. Report (A)
Write `a-round-97.md` and `a-round-97-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the optional pre-edit browser reproduction result;
- the fail-before list and the mutation table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
