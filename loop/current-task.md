# CURRENT TASK — Round 98: Held Enter after closing the export dialog re-opens it from the toolbar Export button (GATE97-S1) + doc 085 status line (GATE97-S3)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-97.md` (exact copy, sha256 `bae416ad…`). Rationale: `b-round-97.md`. Decision record: D-29z63 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one Low that finishes the held-Enter fix from round 97, plus one doc status line. One component (`ArrangementTransport.tsx`). One owner (A).
  1. **GATE97-S1-TOOLBAR-EXPORT-HOLD-REOPEN** (gate 97 review #1). Focus is on „დახურვა“ and the user presses and holds Enter:
     - the first keydown (`repeat=false`) closes the dialog;
     - the dialog's focus restore moves focus back to the toolbar **Export** button;
     - the next repeated keydown (`repeat=true`) activates Export, and the dialog opens again.

     Round 97 turned the old close–open loop into a single re-open, but the re-open is still a bug.
  2. **GATE97-S3-DOC085-STATUS:** doc 085 l.4 still says the round is waiting for C. C round 97 passed, and gate 97 published it at `11d042c`.
- **Not in this round:** GATE97-S4 (the redundant `=== true` at `ArrangementExportDialog.tsx` l.542). It goes with GATE89-S4, which opens the same footer region next. **`ArrangementExportDialog.tsx` is frozen this round.**

## Why this round
- **C round 97: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 97: published**, commit `11d042c242a31f2350215ef30c2398079c1cf715` on both remotes (reviewer 9/10, no Critical or High).
- C has no open bug. Gate 97's first finding is what remains of the held-Enter bug that round 97 fixed. It has the same cause and needs the same proof, so it comes before the other Export Lows.
- **A browser can reach it.** B's round-96 probe (`b-round-96-probe/probe-result.json`) showed the mechanism in Chromium: when the focused button goes away and focus moves to another button, the repeat keydown clicks the new button. Gate 97's reviewer traced the same path in the app (`ArrangementExportDialog.tsx` l.145–155 restores focus to the opener).
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21. B plans this round on 2026-10-23, 2 days later, and the rule needs 3 or more. **The next B planning on or after 2026-10-24 is the regression round.**

## Baseline (measured by B, 2026-10-23)
- **HEAD `11d042c242a31f2350215ef30c2398079c1cf715`** (gate 97 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-97-r98-tree-sha256.txt`, **528** entries, **528/528 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the two owned existing files (`ArrangementTransport.tsx` and doc 085).
  - Frozen and relevant here:
    - `ArrangementExportDialog.tsx` (`cbee8cc6`), with its focus restore at l.145–155;
    - `StudioWorkspace.tsx` (`1270f6c5`), with the global Enter shortcut at l.1960–1969, which already ignores button targets;
    - `export-dialog-hold-enter.test.tsx` (`cd2b2562`), `render-budget.test.tsx`, `export-dialog-focus-restore.test.tsx`, and every other `__tests__` file. **No existing test file is granted.**
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-97-r98-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-97-r98-snapshots/` (`SHA256SUMS.txt`). Both are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementTransport.tsx` | `35b03a95` | 256 | owned (T1: the Export button, baseline l.246–252, and at most one module-level non-exported function) |
  | `docs/implementation/2026/quarter-IV/085-studio-export-dialog-hold-enter.md` | `ae26a4f5` | 70 | owned (l.4 only) |

- **Protected (frozen, never edited; hashes unchanged since earlier rounds):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`)
  - `app/routes/api.studio-token.ts` (`13914809`)
  - `app/contexts/StudioContext.tsx` (`caa388e7`)
  - `app/utils/ffmpeg.ts` (`0995ae78`)
  - `app/components/ui/Modal.tsx` (`741c2341`)
  - `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`)
  - the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`) and `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs and fail-before in a scratch copy (`a-round-98/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. You may reuse `a-round-97/` scratch scripts as a model; do not edit A round 97 files.
  - Stop and report if anything does not match: a different HEAD, a dirty tree at the start, or a changed frozen file.

## 1. What changes (A)

Read the primitives first: `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.

**Optional pre-edit browser reproduction (recommended).** The dev server serves `store/` live, so do this **before** your first edit:
1. Open `/studio-lab` and click the toolbar Export button.
2. Make sure focus is on „დახურვა“.
3. Call `page.keyboard.down('Enter')` 3 times, 50 ms apart, then `keyboard.up('Enter')`.
4. Record in `a-round-98/repro-before.json` whether the dialog is open at the end, and log `event.repeat` and the target of each keydown.

This only reads the repository. If the bug does not reproduce, say so and continue. Do not change the contract.

### T1 — the toolbar Export button ignores a repeated Enter (`ArrangementTransport.tsx`, the Export button at baseline l.246–252 only)
Add an `onKeyDown` to the Export button (the button with `onClick={onOpenExport}`):
- If `event.key === 'Enter'` and `event.repeat` is true, call `event.preventDefault()`. Nothing else happens.
- Leave every other key, and a non-repeated Enter, alone: no `preventDefault` and no `stopPropagation`.
- Write the check as `event.repeat`, not `event.repeat === true`. `repeat` is already a boolean (gate 97 nit).
- The handler may be inline or a module-level non-exported function in this file.
- Add no new export, prop, hook, state, ref or effect. Do not change the `className`, the label or `onClick`.
- No other toolbar button changes. `toolButtonClass` and the `ArrangementTransportProps` interface stay the same.

The result:
1. **Close, then held Enter:** a held Enter that closes the dialog from „დახურვა“ no longer re-opens it. Focus stays on Export and the dialog stays closed.
2. **Fresh Enter still works:** after the key is released, a new Enter press on Export opens the dialog, as now. A mouse click and Space also open it, as now. Space activates on keyup, so it is not part of this bug.
3. **Opening by holding Enter still works:** with Export focused, the first, non-repeated keydown opens the dialog. Initial focus goes to „დახურვა“, and round 97's guard there ignores the repeats. That rule is unchanged.
4. **Global shortcuts are unchanged:** `StudioWorkspace.tsx` l.1960–1969 already skips button targets, so a guarded Enter on Export never reached `addSourceToActiveTrack`, and it still does not.

**Why this is the smallest honest choice (B decision):**
- The bug is that a key press meant for „დახურვა“ lands on the button that gets focus back. Ignoring only the repeated Enter on that button fixes exactly that.
- It is the same rule as round 97, applied at the dialog's only opener.
- Rejected alternatives:
  - delaying the focus restore until keyup: this changes the frozen `ArrangementExportDialog.tsx` focus effect;
  - a timer or a "just closed" flag: this adds state;
  - a guard on every toolbar button: no other toolbar button opens or closes the dialog, so that changes behaviour with no reported bug;
  - `stopPropagation`: other listeners must still see the key.

### New test — `app/lib/arrangement/__tests__/export-toolbar-hold-enter.test.tsx`
Mount `ArrangementProvider` with a small harness component. The harness holds `isOpen` in `useState` and renders:
- the real `ArrangementTransport`, with `onOpenExport={() => setOpen(true)}` wrapped in a spy, and a plain `navigation` object;
- the real `ArrangementExportDialog`, with `isOpen` and an `onClose` that sets it to false.

`export-dialog-focus-restore.test.tsx` and `export-dialog-hold-enter.test.tsx` mount the provider in a similar way. Copy what you need, and never import from a test file. Keep the copied audio fakes to the minimum the provider needs (ARCH-R93-TEST-HARNESS).

Rules for the tests:
- Find the toolbar button by role and accessible name (`Export`). Find „დახურვა“ inside the dialog.
- Use the return value of `fireEvent.keyDown(...)`: `false` means the default was prevented.
- Assert exact values with `toBe`.
- Use no type assertions, including `as const`, and no `@ts-` directives.
- Restore all stubs in `afterEach`.

Tests:
- **TH1 close, then repeat:**
  1. Focus Export and click it. The dialog is open, focus is on „დახურვა“, and the spy has 1 call.
  2. `fireEvent.click(close)`. The dialog is gone, and `document.activeElement` is the Export button (the existing focus restore).
  3. `fireEvent.keyDown(exportButton, { key: 'Enter', repeat: true })` returns `false`. The spy still has 1 call, and no dialog is in the document.
- **TH2 a fresh Enter is not blocked:** in the same state, `fireEvent.keyDown(exportButton, { key: 'Enter', repeat: false })` returns `true`. Then `fireEvent.click(exportButton)` opens the dialog, and the spy has 2 calls. jsdom does not turn a keydown into a click, so the click is explicit.
- **TH3 only Enter is guarded:** a repeated `' '` (Space) keydown and a repeated `'a'` keydown on Export both return `true`.
- **TH4 propagation is unchanged:** a `keydown` listener on `document` still receives the repeated Enter that Export prevented. The guard does not call `stopPropagation`.
- **TH5 the guard is only on Export:** a repeated Enter keydown on the toolbar `Fit` button returns `true`.

**Fail-before:** in scratch, run the new file against the baseline snapshot of `ArrangementTransport.tsx`. B expects **only TH1 red**. TH2–TH5 lock behaviour that must not change, so they pass on both versions. Report the exact list and explain any difference.

**Mutations (scratch only; each must turn at least one named test red):**
- a: remove the guard → TH1
- b: prevent every Enter (drop the `repeat` check) → TH2
- c: prevent every repeated key (drop the `key` check) → TH3
- d: add `event.stopPropagation()` to the guard → TH4
- e: put the same guard on every toolbar button (through a shared handler on `Fit` as well) → TH5

Record the red tests for each mutation and for an unmutated control run.

### Docs
- **Doc 085 l.4:** `**სტატუსი:** C PASS (Round 97), გამოქვეყნდა 11d042c (D-29z62)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc** `docs/implementation/2026/quarter-IV/086-studio-toolbar-export-hold-enter.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z63). Record:
  - why only a repeated Enter on Export is ignored, and the alternatives that were rejected;
  - that this closes the re-open path that doc 085 left open;
  - that the browser evidence is Chromium only, and that environments which send auto-repeat as `repeat=false` remain the deliberate boundary from doc 085.
- `docs/technical/arrangement-workspace.md` is **not** owned this round (frozen).

## 2. Checks A runs (speed rules)
- `npm run typecheck`, `npm run lint`.
- `npx vitest run` on these files, all under `app/lib/arrangement/__tests__/`:
  - the new file;
  - `export-dialog-hold-enter.test.tsx`, `export-dialog-focus-restore.test.tsx`, `export-dialog-focus.test.tsx`;
  - `render-budget.test.tsx` (it counts `ArrangementTransport` renders; an inline handler must not change the counts);
  - `master-hold-tick.test.tsx`;
  - every other existing test file that greps for `ArrangementTransport` or for a role query on the name `Export` (`grep -rlE "ArrangementTransport|name: 'Export'|/\^Export\$/" app/`).

  Write the final list to `a-round-98/targeted-list.txt`.
- Read-only Biome on the two code files (`npx biome check <files>`).
- **code-reviewer** is required (4 changed or new files). Hand its Architecture note to B verbatim.
- No full suite and no `npm run verify`; those belong to the gate.
- **Expected end state:** `git status --short` shows exactly **2 M** (`ArrangementTransport.tsx`, doc 085) and **2 ??** (the new test file and doc 086). The frozen list stays 528/528. Write `a-round-98/end-hashes.txt` with the 4 files.

## 3. What C verifies (browser first, Playwright Chromium, fresh incognito context, no credentials)
Every row runs at **1280×720 and 1440×900** unless noted. Use real keyboard and mouse input (`page.keyboard`, `page.mouse` or `locator.click`). Record the exact texts.

Setup:
- Install a capture-phase `keydown` recorder once per context through `addInitScript`. It logs `key`, `repeat` and the text of `document.activeElement` for each event. A bubble-phase listener adds `defaultPrevented`. Also log `click` events with their target text. C may reuse `c-round-97/tools/lib97.cjs`.
- Find the toolbar button with `getByRole('button', { name: 'Export', exact: true })`. It is outside the dialog; the dialog title „Export“ is a heading, not a button.
- `CANCELLED` = `ექსპორტი გაუქმდა — ფაილი არ შეიქმნა.`

| ID | Action | PASS evidence |
|---|---|---|
| **CLOSE-HOLD** (primary) | Mouse-click the toolbar Export button. Wait until focus is on „დახურვა“. Call `keyboard.down('Enter')` once and wait until the dialog is gone. Then call `keyboard.down('Enter')` 2 more times, 50 ms apart, then `keyboard.up('Enter')`. Wait 1 s. | The recorder shows the first keydown with `repeat=false` on დახურვა, followed by a click on დახურვა. The next two show `repeat=true` on Export with `defaultPrevented=true`, and there is no click on Export. After 1 s no dialog is open and focus is on Export. Screenshot. |
| **CANCEL-CLOSE-HOLD** (1440 only) | Add enough clips for a long render (as in C round 97). Start a WAV export and mouse-click „გაუქმება“ during `რენდერი`. When the status is `CANCELLED` and focus is on „დახურვა“, do the same held-Enter sequence as CLOSE-HOLD. | The same: the dialog closes once and does not re-open, and focus is on Export. 0 downloads in 10 s. |
| **FRESH-OPEN** | Continue from CLOSE-HOLD and call `keyboard.press('Enter')` on Export. Close the dialog with a click. Then focus Export and call `keyboard.press('Space')`. Close it again, then mouse-click Export. | Each of the three opens the dialog, and focus goes to „დახურვა“. The `press('Enter')` keydown has `repeat=false` and `defaultPrevented=false`. |
| **OPEN-HOLD** (1280 only, round 97 regression) | Focus Export, `keyboard.down('Enter')` once, wait for the dialog and for focus on „დახურვა“, then 2 more downs and an up. | The dialog opens once and stays open. The repeats show `repeat=true` on დახურვა with `defaultPrevented=true`. |
| **ENTER-ADD-REG** (1280 only) | With the dialog closed, click a ready library row (for example Middle East), then press Enter once, the same method as C round 96 FAIL-ADD. Then press Ctrl+Z. | One new clip appears, as before this round. Record the status text and the clip count before, after, and after Undo. Undo removes the clip. |
| **EXPORT-REG** (1280 only) | Open Export with a click and run a WAV export to the end. | One download, which decodes as a real WAV (record sample rate, channels and duration > 0). The done status appears, and one fresh Enter on „დახურვა“ closes the dialog. Focus goes to Export. |
| **PX-NET** | all sessions | 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no non-noise console error, no pageerror. |
| **G98-3** | anonymous | The header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows sign-in and no workspace. `/api/studio-token` returns 401. The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`. |
| **AN-REVIEW** | Review A's tests. | The fail-before list matches §1, or A explains the difference. C re-runs mutations a, b and d in its own scratch and gets the same red tests. Assertions are exact, and the new file has no `as` and no `@ts-`. |
| **T98-TARGETED** | `npx vitest run $(cat a-round-98/targeted-list.txt)` | All pass. Record the files and test counts. C greps for missing files the same way. |
| **SOURCE-UNCHANGED** | start and end | HEAD `11d042c`; 2 M + 2 ??; frozen 528/528; A's end hashes match. The `git diff -U0` hunks in `ArrangementTransport.tsx` lie only inside the Export button (baseline l.246–252) and in at most one module-level non-exported function. Doc 085 changes only at l.4. |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- Opening the dialog with a click, a fresh Enter or Space on Export.
- Round 97's guard on „დახურვა“ (OPEN-HOLD).
- The dialog's focus restore to Export after close.
- The global Enter shortcut (add a source from the library) and the other toolbar buttons.
- The `ArrangementTransport` render counts in `render-budget.test.tsx`.
- The export itself: it must still produce a real decodable file.

## 4. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A held Enter that closes the export dialog does not re-open it from the toolbar button | none | — | This is browser key-repeat behaviour on CZABA's own web toolbar and dialog. B makes no claim about Live. | არ ეხება |

No Ableton claim is made.

## 5. Report (A)
Write `a-round-98.md` and `a-round-98-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the result of the optional pre-edit browser reproduction;
- the fail-before list and the mutation table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
