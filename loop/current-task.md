# CURRENT TASK — Round 108: a button that disables itself keeps keyboard focus in its group (C-R107-01 + B probe: Undo, Redo, ⌫, ↩ Zoom), and these buttons act once per Enter press

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23 (B planned at ~11:15 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-107.md` (exact copy). Rationale: `b-round-107.md`. Decision record: **D-29z73** in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one bug class in two code files, one implementer (A): "a focused button disables itself, focus falls to `<body>`, and the next Enter makes an edit the user did not ask for".
  1. **FL-GAIN (C-R107-01, Medium):** the detail panel's `0 dB` Clip Gain reset.
     - C's recipe: gain 1 dB, Tab to `0 dB`, Enter. The reset applies, the button disables itself (0 dB is stored as no `gainDb`), and `document.activeElement` becomes BODY.
     - The next Enter reaches the workspace Enter handler and adds the last library item as a new clip (`… დაემატა მუსიკა ხაზზე 01:41.352-ზე …`, clips 1 → 2, `Undo: დამატება …`). Evidence: `c-round-107/out/gain-focus-1280x720.json`.
  2. **FL-HISTORY (B probe, same class, Medium):** the transport `Undo`, `Redo` and `⌫ წაშლა` buttons.
     - **B probe** (real Chromium, 1280×720, `b-round-107/probe/out/focus-loss-1280x720.json`, `delete-focus-1280x720.json`). Each button was focused and activated with one Enter:
       - Undo of the last entry: Undo disables, focus goes to BODY, and the next Enter adds a library clip. That add also clears the redo entry the user just created.
       - Redo of the last entry: the same; clips 1 → 2.
       - ⌫ on the selected clip: the button disables (no selection), focus goes to BODY, and the next Enter adds a library clip at 00:02.688 instead of doing anything with the deleted clip.
  3. **FL-ZOOM (B probe, same class, Low):** the transport `↩ Zoom` (zoom back) button. Activating the last history step disables it, focus goes to BODY, and the next Enter adds a clip (2 → 3).
- **Not in this round (still open, not deferred):**
  - the held-Enter toolbar sweep (transport Loop, Play, Split, Follow, ⇔, Snap, Env, Metronome, video expand, Mute/Solo, folds) and GATE107-S1 (marker flags). These wait for the root architecture checkpoint on one shared guard (ARCH-R107-SHARED-ENTER-GUARD, addendum (s));
  - GATE107-S2/S3/S4, GATE106-S1/S2/S4, ARCH-R105-STATUS-INTENT, GATE104-S2, GATE103-S1/S2/S3, GATE102-S3/S4, GATE98-S2 and the grid/tempo/marker Lows;
  - B-R107-ENTER-ON-BODY (an open question for the user; see `b-round-107.md`). The workspace-wide Enter → "add the active library item" contract is **not** changed here;
  - SRW-21-PREMOUNT and the SRW-21 mount (waiting for the auth owner), T12, VISUAL-A-OBSIDIAN.
- **Regression round:** `regression-last.json` is 2026-10-21, and B planned this round on 2026-10-23 (2 days). **The next B planning on or after 2026-10-24 is the regression round.**

## Why this round
- **C round 107: PASS** (`browserVerified=true`, `realVerified=true`). Gate 107 **published** `fc08617` (reviewer 8.5/10, "COMMIT: OK").
- C filed one Medium, **C-R107-01**. C bugs come first.
- B's probe shows the same mechanism on four more buttons. Fixing only `0 dB` would leave the identical footgun one Tab away, so the round takes the whole class. The instances share one rule and one test style. All of them are in two files.

## Baseline (measured by B, 2026-10-23 ~11:12 UTC)
- **HEAD `fc086179b6f16d6ca6a523c79d333a5e6248c599`** (published, gate 107). `git status --short` is **empty**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-107-r108-tree-sha256.txt`, **539** entries. It is the round 107 list, plus the four round-107 paths that are not owned again, minus `ArrangementTransport.tsx`. Check it with `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-107-r108-tree-sha256.txt`. B checked it: OK.
- **Snapshots** of the two owned code files and doc 092 at `fc08617`: `../tmp/studio-real-loop/b-round-107-r108-snapshots/` (`SHA256SUMS.txt`; LF, CR=0). Fail-before runs against these.

  | File | sha256 prefix | lines | permission |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementDetailPanel.tsx` | `02583893` | 865 | **owned, narrow:** inside `ArrangementDetailContent` only: a ref for the Clip Gain input (l.536–559 gets `ref`), `resetClipGain` (l.384–398), and the `0 dB` button (l.562–578). Add a React import name only if needed (l.1–20). The range inputs, `applyDetailRange`, `commitClipGain`, `handleClipGainKeyDown`, the resize/collapse shell (l.600+) and every other line stay byte-identical. |
  | `app/components/arrangement/ArrangementTransport.tsx` | `899c7c52` | 261 | **owned, narrow:** the `react` import (l.1); one new import line `import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';` if a layout effect is used (raw `useLayoutEffect` warns under SSR); new refs, handlers and one layout effect inside `ArrangementTransport` (after l.73); the `Undo` (l.106–115), `Redo` (l.116–125), `⌫ წაშლა` (l.140–149), `↩ Zoom` (l.221–235) and `Fit` (l.236–244) buttons. **Byte-identical:** Play, ↤, the position block, Split, Loop, Follow, the Zoom slider, ⇔ and Export (l.77–104, 127–139, 151–220, 245–261), and `ArrangementTransportNavigation` / props types. |
  | `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx` | — | new | **owned (new file).** |
  | `docs/implementation/2026/quarter-IV/093-studio-self-disabling-button-focus.md` | — | new | **owned (new doc, whole).** |

  | `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md` | `8e4fd333` | — | **owned, one line:** l.4 (the status line) only. It must say that round 107 is C PASS and published in `fc08617` (gate 107). Every other line stays byte-identical. This stops a repeat of C-R106-03. |

- **Expected end state:** `git status --short` = **3 M + 2 ??** (exactly the five paths above).
- **Protected (frozen, never edited; B re-checked them at `fc08617`):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`);
  - the auth files: `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
  - `StudioWorkspace.tsx`, `ArrangementContext.tsx` and the window key handler are frozen. **Do not** change the Enter-on-body contract.
- **Servers:** `:5173/studio-lab` returns 200 (B checked at ~11:10 UTC; B's probes ran against it). The backend at `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean, commit or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run fail-before and mutations in a scratch copy (`a-round-108/mut/`, with a `node_modules` symlink and the Vitest `cacheDir` inside scratch), never in `store/`.
  - Stop and report if, at the start, HEAD differs, the status is not empty, or a frozen file changed.

## 1. What changes (A)

Read first: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md`, and `docs/implementation/TEMPLATE.md`. There are no styling changes: no class strings change.

### The rules (B decisions, D-29z73)
- **F1, focus handoff (the invariant):** when one of the buttons below is activated **while it holds focus** and, as a result of that activation, it is **disabled** after the next render, focus moves to its partner:

  | Button | Partner | Why the partner is valid |
  |---|---|---|
  | `0 dB` (detail) | the Clip Gain input | Always enabled for a single audio clip. Its own `onKeyDown` already ignores a repeated Enter and commits only on a fresh one. |
  | `Undo` | `Redo` | A successful undo always creates a redo entry. |
  | `Redo` | `Undo` | A successful redo always creates an undo entry. |
  | `⌫ წაშლა` | `Undo` | A successful delete always writes `Undo: …წაშლა…`. A fresh Enter there undoes the delete, which the user can see on the focused label. |
  | `↩ Zoom` | `Fit` | Fit is never disabled. |

  - **"Holds focus"** = `document.activeElement === event.currentTarget` at click time. This covers a keyboard Enter/Space and a mouse click that focused the button (Chromium focuses a clicked button).
    - `0 dB` keeps its `onMouseDown` `preventDefault`. A mouse click therefore never focuses it, and focus is **not** moved. Focus stays where it was, for example in the Clip Gain input.
  - **Only on exhaustion:** if the button is still enabled after the action (more undo steps, more zoom history, a refused action such as a gesture block), focus is **not** moved. N presses with N history entries = N undos, and focus stays on Undo until the last one.
  - **Only if focus has not gone elsewhere:** move focus only while `document.activeElement` is the disabled button itself, `document.body` or `null`. jsdom keeps focus on a disabled button; Chromium drops it to BODY. Both must be handled.
  - The partner is focused with `focus()` and no options. No `preventScroll`: these elements are already on screen.
  - **Mechanism (A decides; keep it local and explicit):** for example, a ref holding "the button that was focused when clicked", plus a layout effect on `undoLabel` / `redoLabel` / `selectedClipId`+`range` / `navigation.canZoomBack` that focuses the partner when the button is now disabled, and clears the ref after each render. For `0 dB`, the reset to 0 always disables the button on success, so focusing the input right after a successful `setClipGain` is enough. It must still check that the button held focus.
  - **Forbidden:** a document-level or capture-phase focus listener; any change to `StudioWorkspace.tsx`, `ArrangementContext.tsx` or the window Enter handler; switching these buttons from `disabled` to `aria-disabled`. Tests and C tools read `.disabled`, and the Undo/Redo titles stay as they are.
- **F2, these buttons act once per Enter press:** `Undo`, `Redo`, `⌫ წაშლა`, `↩ Zoom` and `Fit` prevent a repeated Enter keydown with the existing convention: `onKeyDown={(event) => { if (event.key === 'Enter' && event.repeat) { event.preventDefault(); } }}`. No `stopPropagation`; Space and other keys are untouched.
  - **Why:** without it, a held Enter on Undo would undo every step, then land on Redo (F1) and redo them all back. A held Enter on `↩ Zoom` would land on Fit and push a Fit on every repeat.
  - **The contract this sets:** a **button** acts once per Enter press; the **shortcuts** Ctrl/Cmd+Z, Ctrl/Cmd+Y / Ctrl/Cmd+Shift+Z and +/− keep repeating (HK5, unchanged). B searched the backlog: no accepted contract says a held Enter on the Undo button repeats. A's round-107 reviewer listed it as "intended", but that was an inference.
  - `0 dB` already has this guard (round 107). The Clip Gain input already ignores a repeated Enter.

### Tests (new file `app/lib/arrangement/__tests__/self-disabling-focus.test.tsx`)
**Rules:**
- Exact assertions only (`toBe`, `toEqual`, `toBeNull`). No `as` (including `as const`), no `@ts-` and no `any`.
- **jsdom does not blur a focused element that becomes disabled.** So every handoff assertion is `expect(document.activeElement).toBe(<partner element>)`, which is red before the fix because focus stays on the disabled button. An assertion like "activeElement is not BODY" is forbidden: it is green before the fix.
- jsdom sends no click for a button keydown. Focus the button with `.focus()`, then `fireEvent.click` (a "keyboard" activation in this harness). For F2, assert the return value of `fireEvent.keyDown` (false = prevented), as `export-toolbar-hold-enter.test.tsx` TH1/TH2 do.
- **Harness:** reuse the pattern of `export-toolbar-hold-enter.test.tsx`: `ArrangementProvider` + `ArrangementTransport` with a `navigation` prop, and the fake AudioContext. Copying its fakes into the new file is allowed; do not edit that file. For zoom back, use a small stateful wrapper whose `onZoomBack` sets `canZoomBack` to false. For the detail panel, mount the panel the way `clip-gain.test.tsx` does.

**Cases:**
- **FL1 (0 dB, keyboard):** a selected audio clip with `gainDb: 1`, the panel open. Focus `0 dB`, then click.
  - The gain is cleared (`undefined`) and `0 dB` is disabled.
  - `document.activeElement` is the Clip Gain input.
  - A fresh Enter keydown on the input adds exactly `Clip Gain უცვლელია: 0.0 dB.` and leaves the clip count unchanged.
- **FL2 (0 dB, mouse):** the same setup, focus on `document.body`. `fireEvent.mouseDown` on `0 dB` returns `false`, then `fireEvent.click`. The gain is cleared and `document.activeElement` is still `document.body`. Focus is not stolen, because the button never held focus.
- **FL3 (Undo, only on exhaustion):** two undoable edits. Focus Undo.
  - First click: one step undone, Undo still enabled, `document.activeElement` is the Undo button.
  - Second click: Undo disabled, `document.activeElement` is the Redo button.
- **FL4 (Redo):** two undone edits. Focus Redo. First click: focus stays on Redo. Second click: Redo disabled, focus on Undo.
- **FL5 (⌫):** one selected clip, no range. Focus ⌫, click. The clip is removed, ⌫ is disabled, and `document.activeElement` is the Undo button, whose title is `Undo: ` + the delete label (assert the exact title).
- **FL6 (↩ Zoom):** stateful wrapper with `canZoomBack` true. Focus ↩ Zoom, click. It becomes disabled and `document.activeElement` is the Fit button.
- **FL7 (no focus, no move):** two undoable edits, focus on `document.body`. Click Undo twice without focusing it. `document.activeElement` is `document.body` after each click.
- **FL8 (refused action keeps focus):** with the pointer gesture active, or another refusal the provider exposes (A picks one and names it), focus Undo and click. Undo stays enabled and focus stays on Undo. If no refusal is reachable from this harness, say so and skip FL8; FL3's first click already covers "enabled → no move".
- **FL9 (F2):**
  - A repeated Enter keydown on Undo, Redo, ⌫, ↩ Zoom and Fit returns `false`; a fresh one returns `true`.
  - A repeated Space keydown on Undo returns `true` (this harness has no window handler).
  - The Ctrl+Z **shortcut** is not part of this file. HK5 covers it and stays frozen.

**Fail-before** (scratch: the two code files = the snapshots, the new test file). B expects FL1, FL3, FL4, FL5, FL6 and FL9 red (FL3 and FL4 on the second click), and FL2, FL7 and FL8 green. Report the exact list and explain any difference.

**Mutations** (scratch only; one unmutated control before and after; record the red tests):
- **m1:** drop the 0 dB handoff → FL1 red.
- **m2:** 0 dB hands off even when it did not hold focus → FL2 red.
- **m3:** Undo hands off after every undo, not only on exhaustion → FL3 red (first click).
- **m4:** drop the Redo → Undo handoff → FL4 red.
- **m5:** drop the ⌫ handoff → FL5 red.
- **m6:** drop the ↩ Zoom handoff → FL6 red.
- **m7:** hand off without the "held focus" check → FL7 red.
- **m8:** drop the repeated-Enter guard from Undo → FL9 red.
- **m9:** drop it from Fit → FL9 red.

### Docs (new doc 093, owned whole; doc 092 l.4 only)
- **Doc 092 l.4:** the status reads that round 107 is C PASS and published in `fc08617` (gate 107). No other line in doc 092 changes.
Follow `docs/implementation/TEMPLATE.md`, in Georgian with English technical terms.
- **Status:** round 108 waits for C (D-29z73).
- **Context:** C-R107-01 and B's probe (Undo, Redo, ⌫, ↩ Zoom), with the evidence paths.
- **Approach:** F1 (partner table, "held focus", "only on exhaustion") and F2 (buttons once per press, shortcuts repeat). Name the rejected alternatives and why: `aria-disabled`; a global focus listener; changing the Enter-on-body contract.
- **Changed files**, **Problems and solutions**, **Testing:** fail-before, m1–m9 and the targeted count.
- **TODO:** the C rows of round 108; B-R107-ENTER-ON-BODY (a user question); the held-Enter toolbar sweep pending ARCH-R107-SHARED-ENTER-GUARD; GATE107-S1..S4.

### Checks A runs (speed rules)
- `npm run typecheck`.
- `npm run lint`, with 0 diagnostics in the owned files (use `--max-diagnostics` and grep, as in round 107).
- `npx biome check <the 3 owned code and test files>`, without `--write`.
- **Targeted vitest:** build the list with `grep -rlE "StudioWorkspace|useArrangement\b|ArrangementTransport|ArrangementDetailPanel|clip-gain-reset|arrangement-zoom-back|arrangement-fit|self-disabling-focus" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-108/targeted-list.txt` and run it with `npx vitest run $(cat ../tmp/studio-real-loop/a-round-108/targeted-list.txt)`. Report the file and test counts, and list every file. Round 107's similar list had 69 files; expect about that many plus the new file. Tests that mount `StudioWorkspace` and click Undo, ⌫ or `0 dB` cover the changed code.
- **If a frozen test fails** because it pinned focus staying on a disabled button, or a held Enter on a toolbar button repeating, do not edit it. Stop that part and report the test and its line to B.
- Do **not** run the full suite or `npm run verify`; the root gate runs them.
- **Code-reviewer:** run it if 3 or more files change (4 change). Pass its Architecture note through verbatim. Ask it to sweep for other self-disabling buttons in `app/components/arrangement` whose activation can leave focus on BODY. Examples: the marker ⌫, the export dialog, the group/track folds. List them for B, with no fix.
- **Optional browser self-check** in `a-round-108/` (evidence, not C acceptance), e.g. FL-GAIN-KEYBOARD and FL-UNDO.

## 2. Acceptance — what C checks (real Chromium)
**Setup for every browser row unless stated:**
- A fresh incognito context on `/studio-lab` at the stated viewport; Decline; wait for the library to settle.
- A `MutationObserver` on `[data-testid=arrangement-status]` logging added nodes and their text.
- Record `document.activeElement` after every step: its `data-testid`, else its `title`, else its tag. Record the clip count (`[data-clip-id]`).
- A hold is `keyboard.down` ×(N+1) at ~33 ms, then `up`. A separate press is `keyboard.press`.
- C's helpers `c-round-107/tools/gainfocus.cjs` and `lib107.cjs` and B's `b-round-107/probe/*.cjs` may be reused.

**Clip setup:** focus the Middle East row and press Enter once per clip, then Fit and blur.

| ID | Steps | PASS when |
|---|---|---|
| **FL-GAIN-KEYBOARD** (primary; 1280 and 1440) | C-R107-01's exact recipe: one clip, select it by its title strip, open the detail panel, type 1 in Clip Gain + Enter, Tab to `0 dB`, Enter. Then Enter once more. | <ul><li>After the reset: `Clip Gain: Middle East — საჯარო preview — 0.0 dB.` added once, `0 dB` disabled, the active element is `arrangement-detail-clip-gain-input`, value `0.0`.</li><li>After the second Enter: exactly one added span `Clip Gain უცვლელია: 0.0 dB.`; the clip count stays **1**; no `დაემატა` text; the Undo label stays `Undo: Clip Gain`.</li><li>Screenshot.</li></ul> |
| **FL-GAIN-HOLD** (1280) | The same up to Tab to `0 dB`. Hold Enter: 1 down + ≥ 10 repeats. | Exactly one added span (`… — 0.0 dB.`); focus on the Clip Gain input at the end; clip count 1; no `უცვლელია` and no `დაემატა` during the hold. |
| **FL-GAIN-MOUSE** (regression; 1280) | Gain 1 dB committed. Click into the Clip Gain input, then mouse-click `0 dB`. | Gain `0.0`; the active element is still the Clip Gain input; one `… — 0.0 dB.` span; clip count 1. |
| **FL-UNDO** (primary; 1280 and 1440) | Two clips (two `დამატება` entries). Focus Undo, Enter; Enter; Enter. | <ul><li>1st Enter: 1 clip, focus on Undo.</li><li>2nd Enter: 0 clips, Undo disabled, focus on the button whose title starts `Redo:`.</li><li>3rd Enter: 1 clip, and the button whose title starts `Redo:` is **still enabled** (a library add would clear the redo stack). The clip starts at `00:00.000`. Record the exact status text; it is expected to start with `Redo: `.</li><li>Screenshot.</li></ul> |
| **FL-UNDO-HOLD** (1280) | Three clips. Focus Undo, hold Enter: 1 down + ≥ 10 repeats. Then one separate Enter. | Exactly one undo during the hold (3 → 2 clips; focus stays on Undo); the separate Enter → 1 clip. |
| **FL-REDO** (1280) | One clip, then Ctrl+Z (0 clips, one redo entry). Focus Redo, Enter; Enter. | 1st: 1 clip, Redo disabled, focus on Undo. 2nd: 0 clips and Redo enabled again (an undo, not a library add). Record the status text. |
| **FL-DELETE** (primary; 1280 and 1440) | One clip, selected by its title strip, no range. Focus `⌫ წაშლა`, Enter; Enter. | 1st: 0 clips, focus on Undo with title `Undo: კლიპის წაშლა`. 2nd: 1 clip back at `00:00.000` (the probe's library add landed at `00:02.688`), and Redo is enabled with title `Redo: კლიპის წაშლა` (an undo of the delete). Record the status text. |
| **FL-ZOOMBACK** (1280) | One clip. Blur, press `=` then `+` (B's probe recipe; ↩ Zoom becomes enabled). Focus ↩ Zoom, Enter; Enter. | 1st: ↩ Zoom disabled, focus on `arrangement-fit`. 2nd: a Fit (record the zoom readout); clip count unchanged. If ↩ Zoom is still enabled after the 1st Enter (more zoom history than the recipe expected), press it until it disables, and report the recipe difference. That is not a FAIL of A. |
| **FL-UNDO-MOUSE** (regression; 1280) | Two clips. Mouse-click Undo twice. | Two undos (0 clips). Record the active element; it is the Redo button or BODY, never an unexpected element. Then one Enter: if focus is on Redo, it redoes (1 clip, the status starts `Redo: `); if focus is BODY, report it as a finding, not a FAIL of this row. |
| **HK-UNDO-STILL-REPEATS** (regression; 1280) | As in round 107. | The clip is back at 00:00.000 (the Ctrl+Z shortcut still repeats). |
| **R12-L2-ENTER-ADD** (regression; 1280) | Focus the Middle East row, Enter. | One clip is added (the library Enter contract is unchanged). |
| **HE-MARKER-ADD**, **SR-TEXT-REG** (regression; 1280) | As in round 107 (`c-round-107/tools`). | Same results as round 107. |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no pageerror, no non-noise console error. |
| **G108-3** | anonymous, run alone, after all rows | The header link opens `/studio-lab` with the workspace and the demo badge; `/studio/middle-east` shows sign-in and no workspace; `/api/studio-token` returns 401. The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud) and goes under `blocked`. |
| **AN-REVIEW** (offline) | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs m1, m3, m5, m7 and m8 with its own mutation strings and gets the same red tests.</li><li>Handoff assertions use `toBe(<partner>)`, not "not BODY".</li><li>Exact assertions only; no `as`, `@ts-` or `any`.</li></ul> |
| **T108-TARGETED** | `npx vitest run $(cat a-round-108/targeted-list.txt)` | All pass. C re-runs the grep and reports any missing file. |
| **DOC-092-L4** (offline) | Diff doc 092 against the snapshot. | Only l.4 changed, and it names round 107 as C PASS and published in `fc08617`. |
| **DOC-093** (offline) | Read doc 093. | The TEMPLATE sections exist; F1 (partner table, held focus, exhaustion) and F2 are stated; the rejected alternatives are named; testing has fail-before and m1–m9. |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD `fc08617`; the start status is empty and the end status is **3 M + 2 ??**.</li><li>The frozen list checks 539/539, and A's end hashes match.</li><li>Against the snapshots, every hunk lies inside the narrow ranges of the Baseline table.</li><li>Play, ↤, Split, Loop, Follow, the slider, ⇔ and Export are byte-identical, and so are `commitClipGain` and `handleClipGainKeyDown`.</li></ul> |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- **Several undos in a row stop working:** focus is moved too early. FL3 (first click), FL-UNDO (1st Enter) and m3 cover it.
- **Mouse users lose their place:** FL2, FL7, FL-GAIN-MOUSE and FL-UNDO-MOUSE.
- **The Ctrl+Z shortcut stops repeating:** HK5 (frozen) and HK-UNDO-STILL-REPEATS.
- **The library's Enter stops adding:** R12-L2-ENTER-ADD.
- **The pending-gain flow:** `commitClipGain` is unchanged, and FL-GAIN-MOUSE covers it.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Keyboard focus stays in the group when the activated button disables itself | None consulted. Live's own UI is not a keyboard-focus reference, and no Live claim is made. | — | CZABA accessibility rule: a refused or finished action never leaves keyboard focus on `<body>`, where the next Enter would edit silently. | არ ეხება (CZABA requirement) |
| A toolbar button acts once per Enter press; Ctrl+Z repeats | None consulted. | — | CZABA convention (rounds 97–107: Export, marker, detail buttons). | არ ეხება |

## 4. Report (A)
Write `a-round-108.md` and `a-round-108/a-round-108-summary.json` as you go (the harness writes `a-round-108-result.json`). Include:
- the changed files with end sha256 (`a-round-108/end-hashes.txt`);
- the exact commands and their results;
- the fail-before list and the mutation table m1–m9;
- the code-reviewer findings with your disposition, its Architecture note verbatim, and the self-disabling sweep;
- the exact next C checks.

If you stop early, write a checkpoint with the next step.
