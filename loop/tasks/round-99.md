# CURRENT TASK — Round 99: one held Enter adds exactly one clip (library row, global Enter, ＋ დამატება) + doc 086 status line

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-98.md` (exact copy, sha256 `6942f610…`). Rationale: `b-round-98.md`. Decision record: D-29z64 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one bug with three entry points to the same action, plus one doc status line. One owner (A).
  1. **B-R98-HELD-ENTER-MULTI-ADD (Low, browser-reproduced by B).** In real Chromium, holding Enter adds **one clip per auto-repeat keydown**. B's probe (`b-round-98-probe/probe-result.json`, `probe-result-plus.json`; 1280×720, `keyboard.down('Enter')` ×3 at 50 ms) gave 0 → **3** clips on each of these paths:
     - **P1 library row:** focus on a ready library option (`[role=option]`, a `<button>`). Its own `handleOptionKeyDown` adds on every Enter (`ArrangementLibrary.tsx` l.242–247).
     - **P2 global Enter:** a source is selected and focus is on `body` (for example after a click on the status text). The window handler adds on every Enter (`StudioWorkspace.tsx` l.1960–1968). This is gate 98 review Low #1 / doc 086's second boundary; B found that it is reachable in Chromium too.
     - **P3 ＋ დამატება:** focus on the preview panel's add button. Chromium turns every Enter keydown, repeats included, into a click (`ArrangementLibraryPreview.tsx` l.304–311).
  2. **GATE98-S5-DOC086-STATUS:** doc 086 l.4 still says the round is waiting for C. C round 98 passed, and gate 98 published it at `736db33`.
- **Not in this round:** the export dialog footer Lows (GATE89-S4 + A-R88 #4 + GATE97-S4, GATE89-S6). They are next. **`ArrangementExportDialog.tsx`, `ArrangementTransport.tsx` and `ArrangementContext.tsx` are frozen this round.**

## Why this round
- **C round 98: PASS**, `browserVerified=true`, `realVerified=true`. **Gate 98: published**, commit `736db33c339bcef4757535d60524c2f92d7e6587` on both remotes (reviewer 9/10, no Critical or High).
- C's one finding, **C-R98-B1** (Space on a focused toolbar Export does not open the dialog), is closed by a B decision with no code change: global Space is the play/stop shortcut, as the shortcut footer says, and it already wins over focused workspace buttons outside the dialog. See `b-round-98.md` and D-29z64. Enter and a mouse click still open Export.
- The held-Enter add is a real arrangement mutation from a held key. It is the same mechanism as rounds 97–98, and B reproduced it in Chromium. That puts it ahead of the footer's 16 px strip.
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21 and B plans this on 2026-10-23 (2 days; the rule needs 3). **The next B planning on or after 2026-10-24 is the regression round.**

## Baseline (measured by B, 2026-10-23)
- **HEAD `736db33c339bcef4757535d60524c2f92d7e6587`** (gate 98 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-98-r99-tree-sha256.txt`, **528** entries, **528/528 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the four owned existing files below.
  - Frozen and relevant here:
    - `ArrangementContext.tsx` (`db7a477d`), with `addSourceToActiveTrack` at l.1308;
    - `ArrangementExportDialog.tsx` (`cbee8cc6`) and `ArrangementTransport.tsx` (`899c7c52`);
    - every `__tests__` file. **No existing test file is granted.**
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-98-r99-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-98-r99-snapshots/` (`SHA256SUMS.txt`). All four are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementLibrary.tsx` | `a2b6f78d` | 566 | owned (T1: the Enter branch of `handleOptionKeyDown`, l.242–247 only) |
  | `app/components/arrangement/StudioWorkspace.tsx` | `1270f6c5` | 2516 | owned (T2: the global Enter branch, l.1960–1968 only) |
  | `app/components/arrangement/ArrangementLibraryPreview.tsx` | `c6efc0ef` | 315 | owned (T3: the ＋ დამატება button, l.304–311 only) |
  | `docs/implementation/2026/quarter-IV/086-studio-toolbar-export-hold-enter.md` | `524d9b22` | 74 | owned (l.4 only) |

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
  - Run mutation proofs and fail-before in a scratch copy (`a-round-99/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. You may reuse `a-round-98/` scratch scripts as a model; do not edit A round 98 files.
  - Stop and report if anything does not match: a different HEAD, a dirty tree at the start, or a changed frozen file.

## 1. What changes (A)

Read the primitives first: `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` (Studio files), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.

**Pre-edit browser reproduction (recommended).** The dev server serves `store/` live, so do this **before** your first edit. You may run B's `b-round-98-probe/probe.cjs` and `probe-plus.cjs` as they are (read-only), or your own copy in `a-round-99/`. Record the result in `a-round-99/repro-before.json`. Repeat after the edit into `repro-after.json`. This is A's own check, not C's acceptance.

**The rule for all three paths:** one Enter press adds one clip. The first, non-repeated keydown (`event.repeat === false`) adds, exactly as now. A repeated keydown (`event.repeat` true) adds nothing. Write the check as `event.repeat` or `!event.repeat`, not `=== true`.

### T1 — library row (`ArrangementLibrary.tsx`, the `if (event.key === 'Enter')` branch at l.242–247 only)
- Keep `event.preventDefault()` and `event.stopPropagation()` for **every** Enter, repeated or not, as now.
- Call `selectSource(sourceId)` and `addSourceToActiveTrack(sourceId)` only when `!event.repeat`.
- The ArrowUp/ArrowDown/ArrowLeft/ArrowRight branches do not change. A held ArrowDown still moves the selection one row per repeat (B probe `probe-result-arrow.json`: 3 downs moved Middle East → Slow Rise).
- No change to `onDoubleClick`, `handleOptionAdd`, the option markup or any other function.

### T2 — global Enter (`StudioWorkspace.tsx`, l.1960–1968 only)
- The condition (Enter, not a button, not a slider, not a separator) and `event.preventDefault()` stay as they are.
- Call `current.addSourceToActiveTrack()` only when `!event.repeat`. This is the same pattern as the Space branch at l.1699–1704.
- No other line in this file changes. No new import, ref, state, effect or listener.

### T3 — ＋ დამატება (`ArrangementLibraryPreview.tsx`, the button at l.304–311 only)
- Add an `onKeyDown`: if `event.key === 'Enter'` and `event.repeat`, call `event.preventDefault()`. Nothing else happens. This is the round 98 Export-button rule.
- No `stopPropagation`. Leave every other key and a non-repeated Enter alone.
- `onClick`, `disabled`, `className` and the label stay the same. The ▶ მოუსმინე toggle does not change this round (see "Not decided" below).

**Why this is the smallest honest choice (B decision):**
- The user contract is SRW-12 R12-L2: "Enter adds to the active track at the insert marker". One press means one add. A held key that silently adds a clip per auto-repeat is not part of that contract; each repeat is also a separate Undo step.
- The guard sits at each of the three places that turn Enter into an add, and it only skips the repeats.
- Rejected alternatives:
  - a de-duplication or time window inside `addSourceToActiveTrack`: it would also block a fast, deliberate second press, and it changes the frozen `ArrangementContext.tsx`;
  - a "key is down" flag or keyup listener: it adds state and lifecycle;
  - a guard on every button in the library or the workspace: no other button has a reported repeat bug, so that changes behaviour with no evidence;
  - `stopPropagation` on ＋: other listeners must still see the key.
- **Not decided this round:** a held Enter on ▶ მოუსმინე may toggle the preview on every repeat. B has not probed it. It is recorded as hypothesis `B-R98-H1-PREVIEW-TOGGLE-HOLD` for a later round. The waveform's own handler already ignores repeats (`ArrangementLibraryPreview.tsx` l.202–204).

### New test — `app/lib/arrangement/__tests__/held-enter-add.test.tsx`
Mount the real `StudioWorkspace` under `ArrangementProvider` with at least one **ready** library source. Use `grid-snap-ui.test.tsx` (`mountGridWorkspace`) and `library-preview.test.tsx` / `collection-load-status.test.tsx` as models. Copy what you need, and never import from a test file. Keep the copied audio fakes to the minimum the provider needs (ARCH-R93-TEST-HARNESS).

Rules for the tests:
- Count clips by their rendered `[data-clip-id]` elements. Record the count before each step.
- Find the row by `role="option"` and its source id, and find ＋ დამატება by role and accessible name.
- Dispatch every keydown to `document.activeElement` at that moment (real-keyboard semantics), unless a test names another target. After an add, focus is expected to stay on the row (B's probe: the active element stayed `demo-middle-east`); assert it.
- Use the return value of `fireEvent.keyDown(...)`: `false` means the default was prevented.
- Assert exact values with `toBe`.
- Use no type assertions, including `as const`, and no `@ts-` directives.
- Restore all stubs and remove every added listener in `afterEach`.

Tests:
- **HA1 row, held:** on a focused ready row, `keyDown Enter repeat=false` adds exactly 1 clip. Two more `keyDown Enter repeat=true` each return `false` and add nothing. The total is +1.
- **HA2 row, fresh presses:** two `keyDown Enter repeat=false` on the row add 2 clips.
- **HA3 global, held:** select a ready source (click its row), then move focus to `document.body`. `keyDown Enter repeat=false` on `document.body` adds 1 and returns `false`. Two `repeat=true` keydowns return `false` and add nothing.
- **HA4 global, fresh presses:** a second `repeat=false` keydown on `document.body` adds 1 more (2 in total).
- **HA5 ＋, held:** on ＋ დამატება, `keyDown Enter repeat=true` returns `false` and `keyDown Enter repeat=false` returns `true`. No keydown changes the clip count (jsdom sends no click). Then `fireEvent.click` adds exactly 1.
- **HA6 ＋, only Enter and no stopPropagation:** a repeated `'q'` keydown on ＋ returns `true` (`'q'` has no workspace shortcut at baseline; A confirms by reading the handler and records it). A bubble-phase `document` `keydown` listener receives the repeated Enter that ＋ prevented.
- **HA7 held arrows still work:** on a focused row, two `keyDown ArrowDown repeat=true`, each sent to `document.activeElement` (the row handler moves focus between them), move `aria-selected` and focus two rows down.
- **HA8 one Undo step:** after the HA1 sequence, one Ctrl+Z (the workspace shortcut) brings the clip count back to the count before HA1.

**Fail-before:** in scratch, run the new file against the four baseline snapshots. B expects **HA1, HA3, HA5 and HA8 red**, and HA2, HA4, HA6 and HA7 green. Report the exact list and explain any difference. HA2, HA4, HA6 and HA7 are locks, not detectors: they pass on the baseline and only the mutations make them discriminate (HA6 only through mutations f and g).

**Mutations (scratch only; each must turn at least one named test red):**
- a: remove the row guard (T1) → HA1
- b: remove the global guard (T2) → HA3
- c: remove the ＋ guard (T3) → HA5
- d: the global branch never adds (drop the `repeat` check, skip every add) → HA4
- e: the row branch never adds → HA2
- f: the ＋ guard drops the `key` check (prevents every repeated key) → HA6
- g: add `event.stopPropagation()` to the ＋ guard → HA6
- h: the row skips every repeated key, arrows included → HA7

Record the red tests for each mutation and for an unmutated control run.

### Docs
- **Doc 086 l.4:** `**სტატუსი:** C PASS (Round 98), გამოქვეყნდა 736db33 (D-29z63)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc** `docs/implementation/2026/quarter-IV/087-studio-held-enter-single-add.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z64). Record:
  - the three paths and B's Chromium reproduction (0 → 3 clips);
  - why only the repeats are skipped, and the rejected alternatives;
  - that this closes the global-Enter path from doc 086's second boundary for every browser, because the guard no longer depends on where focus lands;
  - that the ▶ მოუსმინე toggle is a separate, unprobed hypothesis;
  - that environments which send auto-repeat as `repeat=false` remain the boundary from doc 085.
- `docs/technical/arrangement-workspace.md` is **not** owned this round (frozen).

## 2. Checks A runs (speed rules)
- `npm run typecheck`, `npm run lint`.
- `npx vitest run` on these files, all under `app/lib/arrangement/__tests__/` unless a path says otherwise:
  - the new file;
  - `render-budget.test.tsx` (it counts library option and workspace renders; the edits must not change the counts);
  - `library-preview.test.tsx`, `collection-load-status.test.tsx`, `purchased-collection-ui.test.tsx`, `failed-source-refusal.test.tsx`, `pending-status.test.tsx`;
  - every other existing test file that greps for the touched names: `grep -rlE "ArrangementLibrary|ArrangementLibraryPreview|<StudioWorkspace|addSourceToActiveTrack|＋ დამატება|role: 'option'" app/ --include=*.test.ts --include=*.test.tsx`.

  Write the final list to `a-round-99/targeted-list.txt`.
- Read-only Biome on the four code files (`npx biome check <files>`).
- **code-reviewer** is required (5 changed or new code/doc files). Hand its Architecture note to B verbatim.
- No full suite and no `npm run verify`; those belong to the gate.
- **Expected end state:** `git status --short` shows exactly **4 M** (`ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, `ArrangementLibraryPreview.tsx`, doc 086) and **2 ??** (the new test file and doc 087). The frozen list stays 528/528. Write `a-round-99/end-hashes.txt` with the 6 files.

## 3. What C verifies (browser first, Playwright Chromium, fresh incognito context, no credentials)
Every row runs at **1280×720 and 1440×900** unless noted. Use real keyboard and mouse input (`page.keyboard`, `page.mouse` or `locator.click`). Record the exact texts.

Setup:
- Decline consent. Wait until the `demo-middle-east` option is `draggable="true"` (ready).
- Install a capture-phase `keydown` recorder once per context through `addInitScript`. It logs `key`, `repeat` and the active element (tag plus `data-source-id` or text). Log `click` events with their target text. C may reuse `c-round-98/tools/lib98.cjs` and B's `b-round-98-probe/*.cjs`.
- Count clips with `[data-clip-id]`. Read the status from `[data-testid=arrangement-status]`.
- "Held Enter" means: `keyboard.down('Enter')`, then 2 more `keyboard.down('Enter')` 50 ms apart, then `keyboard.up('Enter')`, then wait 1.2 s.

| ID | Action | PASS evidence |
|---|---|---|
| **HOLD-ROW** (primary) | Click the Middle East row. Held Enter. Then blur and press Ctrl+Z once (the same method as C round 98 ENTER-ADD-REG). | The recorder shows 1 keydown `repeat=false` and 2 `repeat=true`, all on the row. Clips go 0 → **1** (not 3). Record the status text. After one Ctrl+Z, clips are 0. Screenshot. |
| **HOLD-BODY** (primary) | Click the Middle East row, then click the status text (focus moves to `body`; confirm `document.activeElement` is BODY). Held Enter. | The keydowns are on BODY. Clips go 0 → **1**. |
| **HOLD-PLUS** (primary) | Click the Middle East row, then focus ＋ დამატება with `locator.focus()` (as in C round 98's Space probe) or by Tab from ▶ მოუსმინე; record which. Do not click ＋ (a click adds). Held Enter. | Clips go 0 → **1**. The 2 repeats on ＋ have `defaultPrevented=true` (read with a late bubble listener, see C-R98-N4), and there is exactly 1 click on ＋. |
| **FRESH-ADD** (1280 only) | On the row, `keyboard.press('Enter')` twice, 300 ms apart. Then click ＋ twice. Then focus ＋ and `keyboard.press('Enter')` once. | Use a fresh context, or record the count before each step. Clips change by **+2**, then **+2**, then **+1**. Each `press('Enter')` keydown has `repeat=false`. Double-clicking a row still adds 1 clip (record before and after). |
| **HELD-ARROW-REG** (1280 only) | Focus the Middle East row. `keyboard.down('ArrowDown')` 3 times 50 ms apart, then up. | The selection moves 3 rows to `demo-slow-rise`, as in B's probe. No clip is added. |
| **SPACE-REG** (1280 only) | Add one clip with one Enter, click the status text, press Space, wait 1 s, press Space. | Play → Pause → Play, as seen in C round 98 (C-R98-B1 evidence). |
| **CLOSE-HOLD-REG** (1280 only) | The round 98 CLOSE-HOLD row: click toolbar Export, focus on „დახურვა“, held Enter. | The dialog closes once and does not re-open, and focus is on Export. 0 clips added. |
| **EXPORT-REG** (1280 only) | After HOLD-ROW (1 clip, re-added if undone), open Export with a click and run a WAV export to the end. | One download, which decodes as a real WAV (record sample rate, channels and duration > 0). |
| **PX-NET** | all sessions | 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no non-noise console error, no pageerror. |
| **G99-3** | anonymous | The header link opens `/studio-lab` with the workspace and the demo badge. `/studio/middle-east` shows sign-in and no workspace. `/api/studio-token` returns 401. The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`. |
| **AN-REVIEW** | Review A's tests. | The fail-before list matches §1, or A explains the difference. C re-runs mutations a, b, c and g in its own scratch and gets the same red tests. Assertions are exact, and the new file has no `as` and no `@ts-`. |
| **T99-TARGETED** | `npx vitest run $(cat a-round-99/targeted-list.txt)` | All pass. Record the files and test counts. C re-runs the grep from §2 and reports any missing file. |
| **SOURCE-UNCHANGED** | start and end | HEAD `736db33`; 4 M + 2 ??; frozen 528/528; A's end hashes match. The `git diff -U0` hunks lie only in: `ArrangementLibrary.tsx` l.242–247, `StudioWorkspace.tsx` l.1960–1968, `ArrangementLibraryPreview.tsx` l.304–311, and doc 086 l.4. |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- A single Enter on a row, on `body` with a selected source, or on ＋ still adds one clip at the insert marker, with the same status text.
- Double-click on a row and a mouse click on ＋ still add.
- Held arrow keys in the library still move the selection.
- The global Space play/stop and the round 97–98 Export held-Enter guards.
- The render counts in `render-budget.test.tsx`.
- The export still produces a real decodable file.

## 4. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| One held Enter adds one clip from the library | none consulted | — | CZABA's own rule from SRW-12 R12-L2 (one press = one add). B makes no claim about Live's browser and key repeat. | დაუდასტურებელი |
| Space on a focused workspace button plays/stops instead of activating it (C-R98-B1) | none consulted | — | CZABA's existing global transport shortcut, kept by B decision. | დაუდასტურებელი |

No Ableton claim is made.

## 5. Report (A)
Write `a-round-99.md` and `a-round-99-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the pre-edit and post-edit browser reproduction;
- the fail-before list and the mutation table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
