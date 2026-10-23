# CURRENT TASK — Round 100: one held Enter on ▶ მოუსმინე toggles the preview once + doc 087 status line

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-99.md` (exact copy, sha256 `b8315fe9…`). Rationale: `b-round-99.md`. Decision record: D-29z65 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one bug on one button, plus one doc status line. One owner (A).
  1. **B-R98-H1-PREVIEW-TOGGLE-HOLD (Low, now browser-reproduced by B).** In real Chromium, holding Enter on the focused ▶ მოუსმინე button toggles the preview **once per auto-repeat keydown**.
     - **Evidence:** B's probe `b-round-99-probe/probe-toggle-result.json`, 1280×720, `keyboard.down('Enter')` ×3 at 50 ms.
     - **held3:** 3 keydowns (`repeat` false/true/true) gave **3 clicks** on the toggle. The label went ▶ მოუსმინე → ■ შეჩერება → ▶ მოუსმინე → ■ შეჩერება (start, stop, start).
     - **fresh1:** one `press('Enter')` gave 1 click (▶ → ■).
     - **Cause:** the button (`ArrangementLibraryPreview.tsx` l.281–303) has no `onKeyDown`, so Chromium turns every Enter keydown, repeats included, into a click. The ＋ დამატება button next to it got that guard in round 99, and the waveform's own handler already ignores repeats (l.202–204).
  2. **GATE99-S1-DOC087-STATUS:** doc 087 l.4 still says the round is waiting for C. C round 99 passed, and gate 99 published it at `e2412db`.
- **Not in this round:** the Export dialog footer Lows (GATE89-S4 + A-R88 #4 + GATE97-S4, GATE89-S6) and a shared "repeated Enter" helper (an architecture signal; the root checkpoint comes first). **`ArrangementExportDialog.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `StudioWorkspace.tsx` and `ArrangementContext.tsx` are frozen this round.**

## Why this round
- **C round 99: PASS**, `browserVerified=true`, `realVerified=true`, 0 bugs. **Gate 99: published**, commit `e2412db337e9015def8dc6855358437b900ff51e` on both remotes (reviewer 9/10, no Critical or High).
- The gate 99 reviewer's Low #2 asked for this exact guard "once B has reproduced it in a browser". B reproduced it (above). It is the last open member of the held-Enter family on the SRW-12 library panel, and it changes what the user hears. That puts it ahead of the footer's cosmetic 16 px strip.
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21 and B plans this on 2026-10-23 (2 days; the rule needs 3). **The next B planning on or after 2026-10-24 is the regression round, whatever this round leaves open.**

## Baseline (measured by B, 2026-10-23)
- **HEAD `e2412db337e9015def8dc6855358437b900ff51e`** (gate 99 published). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-99-r100-tree-sha256.txt`, **531** entries, **531/531 OK**.
  - It covers every tracked `app/**` and `docs/implementation/**` file plus `vite.config.ts` (534), **except** the three owned files below.
  - Frozen and relevant here:
    - `held-enter-add.test.tsx` (`b1d6ff96`), with round 99's HA1–HA8;
    - `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, `ArrangementContext.tsx` (`db7a477d`);
    - `ArrangementExportDialog.tsx` (`cbee8cc6`) and `ArrangementTransport.tsx` (`899c7c52`);
    - every other `__tests__` file.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-99-r100-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-99-r100-snapshots/` (`SHA256SUMS.txt`). All three are LF with CR=0.

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementLibraryPreview.tsx` | `f074a9bb` | 320 | owned (T1: the ▶ მოუსმინე `<button>` element, l.281–303 only) |
  | `app/lib/arrangement/__tests__/library-preview.test.tsx` | `b42334fc` | 287 | owned **append-only** (new `it` blocks after the last existing `it`, which ends at l.285; see "Tests") |
  | `docs/implementation/2026/quarter-IV/087-studio-held-enter-single-add.md` | `38cbeb22` | 81 | owned (l.4 only) |

  New file: `docs/implementation/2026/quarter-IV/088-studio-preview-toggle-hold-enter.md`.
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
  - Run mutation proofs and the fail-before in a scratch copy (`a-round-100/mut/`), never in `store/`. Set the Vitest `cacheDir` to the scratch folder. You may reuse `a-round-99/` scratch scripts as a model; do not edit A round 99 files.
  - Stop and report if anything does not match: a different HEAD, a dirty tree at the start, or a changed frozen file.

## 1. What changes (A)

Read the primitives first: `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md` (Studio file), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.

**Pre-edit browser reproduction (recommended).** Before your first edit, **copy** B's `b-round-99-probe/probe-toggle.cjs` to `a-round-100/` and run the copy there. Never run it inside `b-round-99-probe/`: the script writes its JSON and PNGs next to itself and would overwrite B's cited evidence. Record the result in `a-round-100/repro-before.json`, and repeat after the edit into `repro-after.json`. Prefer 4 keydowns: with 3 the end label is ■ with or without the fix. This is A's own check, not C's acceptance.

### T1 — ▶ მოუსმინე (`ArrangementLibraryPreview.tsx`, the toggle `<button>` at l.281–303 only)
- Add an `onKeyDown` with exactly the ＋ დამატება rule from l.307–311: if `event.key === 'Enter'` and `event.repeat`, call `event.preventDefault()`. Nothing else happens.
- Write the check as `event.repeat`, not `=== true`.
- No `stopPropagation`. Leave every other key and a non-repeated Enter alone. Space is not touched this round: in the workspace, global Space is the transport shortcut (D-29z64 R2, C-R98-B1). B makes no claim about Space on the focused toggle; nobody has observed it.
- `onClick`, `disabled`, `className`, `data-testid` and both labels stay the same. No other line in the file changes: no new import, state, ref, effect, helper or listener.

**Why this is the smallest honest choice (B decision):**
- One press means one toggle, the same rule as SRW-12 R12-L2 (round 99) and the waveform handler (l.202–204). After a held Enter the preview starts and keeps playing; the repeats do not stop it.
- Rejected alternatives:
  - a repeat guard inside `startLibraryPreview` / `stopLibraryPreview`: it changes the frozen `ArrangementContext.tsx`, and the context cannot tell a key repeat from a mouse click;
  - a time window or debounce: it would also block a deliberate fast second press;
  - a shared helper for all six repeat-Enter sites: it touches frozen files and needs the root checkpoint first (`ARCH-R97-EXPORT-FOOTER-KEYBOARD`, addendum (l));
  - `stopPropagation`: other listeners must still see the key.

### Tests — append to `app/lib/arrangement/__tests__/library-preview.test.tsx` (no new test file)
This file already mounts `ArrangementLibraryPreview` under `ArrangementProvider` with a ready source. It also proves that a click on the toggle changes the label to `■ შეჩერება` (l.271–272). Reusing it avoids another copy of the audio fake harness (ARCH-R93-TEST-HARNESS).
- **Append-only:** add new `it` blocks inside the existing `describe`, after the last existing `it` (which ends at l.285) and before the closing `});` at l.286. You may use its existing `mountPreview`, fakes, `beforeEach` and `afterEach`.
- **No existing line changes.** `git diff -U0` must show one pure-addition hunk in this file.
- If an extra cleanup is needed (for example a `document` listener), remove it inside the test with `try/finally`. The existing `afterEach` stays unchanged.

Rules:
- Find the toggle by `data-testid="arrangement-library-preview-toggle"`. Read the label with `textContent` and assert exact values with `toBe`.
- Use the return value of `fireEvent.keyDown(...)`: `false` means the default was prevented.
- Use no type assertions (including `as const`) and no `@ts-` directives.

Tests:
- **HT1 held Enter:** on the toggle (`▶ მოუსმინე`):
  - `keyDown Enter repeat=false` returns `true`;
  - then two `keyDown Enter repeat=true` each return `false`;
  - no keydown changes the label (jsdom sends no click);
  - then one `fireEvent.click` gives `■ შეჩერება`.
- **HT2 fresh presses:** two `keyDown Enter repeat=false` on the toggle each return `true`.
- **HT3 only Enter, no stopPropagation:**
  - a repeated `'q'` keydown on the toggle returns `true`;
  - a bubble-phase `document` `keydown` listener receives the repeated Enter that the toggle prevented.

**Fail-before:** in scratch, run the extended file against the three baseline snapshots. B expects **HT1 red**, and HT2, HT3 and the four existing tests green. Report the exact list and explain any difference. HT2 and HT3 are locks; only mutations make them discriminate.

**Mutations (scratch only; each must turn at least one named test red):**
- a: remove the toggle guard → HT1
- b: the guard drops the `key` check (prevents every repeated key) → HT3
- c: add `event.stopPropagation()` to the guard → HT3
- d: the guard prevents every Enter, repeated or not → HT2

Record the red tests for each mutation and for an unmutated control run.

### Docs
- **Doc 087 l.4:** `**სტატუსი:** C PASS (Round 99), გამოქვეყნდა e2412db (D-29z64)`, or the same meaning in the doc's style. Only l.4 changes.
- **New doc** `docs/implementation/2026/quarter-IV/088-studio-preview-toggle-hold-enter.md`, in Georgian, following `docs/implementation/TEMPLATE.md`. Its status line says the round is waiting for C (D-29z65). Record:
  - B's Chromium reproduction (3 clicks, start/stop/start);
  - the rule (one press = one toggle) and the rejected alternatives;
  - that this closes `B-R98-H1-PREVIEW-TOGGLE-HOLD`, which doc 087 left as a hypothesis;
  - that the repeat-Enter guard now lives in six places, and a shared helper waits for the root architecture checkpoint;
  - that environments which send auto-repeat as `repeat=false` remain the boundary from doc 085.

## 2. Checks A runs (speed rules)
- `npm run typecheck`, `npm run lint`.
- `npx vitest run` on these files:
  - `app/lib/arrangement/__tests__/library-preview.test.tsx`;
  - `app/lib/arrangement/__tests__/held-enter-add.test.tsx` (the sibling ＋ guard, unchanged);
  - `app/lib/arrangement/__tests__/render-budget.test.tsx`;
  - every other existing test file that greps for the touched names: `grep -rlE "ArrangementLibraryPreview|preview-toggle|მოუსმინე|startLibraryPreview|stopLibraryPreview" app/ --include=*.test.ts --include=*.test.tsx`.

  Write the final list to `a-round-100/targeted-list.txt`.
- Read-only Biome on the component and the test file (`npx biome check <files>`).
- **code-reviewer** is required (4 changed or new code/doc files). Hand its Architecture note to B verbatim.
- No full suite and no `npm run verify`; those belong to the gate.
- **Expected end state:** `git status --short` shows exactly **3 M** (`ArrangementLibraryPreview.tsx`, `library-preview.test.tsx`, doc 087) and **1 ??** (doc 088). The frozen list stays 531/531. Write `a-round-100/end-hashes.txt` with the 4 files.

## 3. What C verifies (browser first, Playwright Chromium, fresh incognito context per scenario, no credentials)
Every row runs at **1280×720 and 1440×900** unless noted. Use real keyboard and mouse input (`page.keyboard`, `page.mouse` or `locator.click`). Record the exact texts.

Setup:
- Decline consent. Wait until the `demo-middle-east` option is `draggable="true"` (ready).
- Install a capture-phase recorder through `addInitScript`. It logs:
  - every `keydown` (`key`, `repeat`, active element);
  - every `click` with its target;
  - every change of the toggle label, with a timestamp (a MutationObserver, as in `b-round-99-probe/probe-toggle.cjs`).
- Read `defaultPrevented` with a bubble listener installed late (C-R98-N4).
- **Preview audio:** measure the output RMS with the same method as C round 96 FAIL-PREVIEW (`c-round-96/tools/r96.cjs`: output RMS 0.031 while playing, 0 after stop). Cite the method; do not invent a new one.
- **"Held Enter" here is four keydowns:** `keyboard.down('Enter')`, then **3** more `keyboard.down('Enter')` 50 ms apart, then `keyboard.up('Enter')`, then wait 1.2 s.
  - Use four keydowns so that the final state discriminates. Without the fix, four toggles end **stopped** (▶ მოუსმინე). With the fix, the preview ends **playing** (■ შეჩერება).
  - The three-keydown probe ends in ■ either way, so it does not discriminate.
- **Do not run G100-3 or any other route-loading row at the same time as a held-key measurement** (C-R99-N1: a Vite reload destroyed the page context).

| ID | Action | PASS evidence |
|---|---|---|
| **HOLD-TOGGLE** (primary) | Click the Middle East row. Focus ▶ მოუსმინე with `locator.focus()` (record it). Do not click the toggle. Held Enter (4 keydowns). | <ul><li>The recorder shows 4 keydowns on the toggle: `repeat` false/true/true/true.</li><li>There is **exactly 1 click** on the toggle.</li><li>The 3 repeats have `defaultPrevented=true`.</li><li>The label changes **once** (▶ მოუსმინე → ■ შეჩერება) and is still ■ შეჩერება 1.2 s after keyup.</li><li>The output RMS is > 0 at 1.2 s.</li><li>0 clips are added.</li><li>Then one `keyboard.press('Enter')` gives ▶ მოუსმინე, and RMS is 0 within 400 ms.</li><li>Screenshot.</li></ul> |
| **FRESH-TOGGLE** (1280 only) | On the focused toggle, `keyboard.press('Enter')` twice, 300 ms apart. Then click the toggle twice with the mouse, 300 ms apart. | Each step makes exactly 1 click and 1 label change: ▶ → ■ → ▶, then ▶ → ■ → ▶. Every `press` keydown has `repeat=false`. RMS > 0 while ■ and 0 after ▶. |
| **WAVE-REG** (1280 only) | Focus the preview waveform and hold Enter (4 keydowns). | The preview toggles once (its own handler, l.202–204, unchanged). Record the label and RMS. |
| **HOLD-PLUS-REG** (1280 only) | Round 99 HOLD-PLUS: focus ＋ დამატება, held Enter (4 keydowns). | Clips 0 → **1**, exactly 1 click on ＋. |
| **HOLD-ROW-REG** (1280 only) | Round 99 HOLD-ROW: focus the Middle East row, held Enter (4 keydowns). | Clips 0 → **1**. |
| **EXPORT-REG** (1280 only) | After HOLD-ROW-REG (1 clip), open Export with a click and run a WAV export to the end. | One download that decodes as a real WAV (record sample rate, channels and duration > 0). |
| **PX-NET** | all sessions | 0 requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no non-noise console error, no pageerror. |
| **G100-3** | anonymous, run alone | <ul><li>The header link opens `/studio-lab` with the workspace and the demo badge.</li><li>`/studio/middle-east` shows sign-in and no workspace.</li><li>`/api/studio-token` returns 401.</li><li>The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`.</li></ul> |
| **AN-REVIEW** | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs mutations a, b and c in its own scratch and gets the same red tests.</li><li>Assertions are exact, and the added lines have no `as` and no `@ts-`.</li><li>The test hunk is a pure addition after the last existing `it`.</li></ul> |
| **T100-TARGETED** | `npx vitest run $(cat a-round-100/targeted-list.txt)` | All pass. Record the files and test counts. C re-runs the grep from §2 and reports any missing file. |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD is `e2412db`, with 3 M + 1 ??.</li><li>The frozen list is 531/531, and A's end hashes match.</li><li>The `git diff -U0` hunks lie only in `ArrangementLibraryPreview.tsx` l.281–303 (the toggle element), one pure addition in `library-preview.test.tsx` after l.285, and doc 087 l.4.</li></ul> |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- A single Enter or a mouse click on the toggle still starts and stops the preview, and the preview is really audible.
- The waveform keyboard handler (Space/Enter toggle, arrows, Home/End).
- Round 99's ＋ and row guards.
- Global Space play/stop. The transport and the preview never play together (R12-L3).
- The export still produces a real decodable file.

## 4. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| One held Enter on the preview button toggles the preview once | none consulted | — | CZABA's own rule (one press = one action; SRW-12 R12-L2, round 99). B makes no claim about Live's browser preview and key repeat. | დაუდასტურებელი |

No Ableton claim is made.

## 5. Report (A)
Write `a-round-100.md` and `a-round-100-result.json` as you go. Include:
- the changed files with their end sha256;
- the exact commands you ran and their results;
- the pre-edit and post-edit browser reproduction;
- the fail-before list and the mutation table;
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
