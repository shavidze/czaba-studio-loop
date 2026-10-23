# CURRENT TASK — Round 107: held shortcuts and held Enter act once (C-R106-02, GATE106-S5/F6, F5) + a single clip at time 0 gives its refusal (C-R106-01) + doc 092 (C-R106-03)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23 (B planned at ~10:00 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-106.md` (exact copy). Rationale: `b-round-106.md`. Decision record: **D-29z72** in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** three tightly related keyboard bugs with one owner (A). All three are about "one key press, one effect, one announcement". The doc line rides along.
  1. **HK: held shortcuts (C-R106-02 + gate-106 suggestion #5 / A's reviewer F6; Low, one has a behaviour impact).**
     - A held Ctrl/Cmd+L toggles the loop on **every** OS auto-repeat. C measured `aria-pressed` alternating true/false over 10 keydowns; the end state depends on how long the key was held, and each toggle is a history entry (`c-round-106/out/kr-loop-1280x720.json`, key `ctrlL`).
     - A held Ctrl/Cmd+E, Ctrl/Cmd+Shift+L and Ctrl/Cmd+C have no repeat guard either. Ctrl+E can split again at the playhead after a range split; the others re-announce the same text about 30 times a second.
     - Every sibling shortcut (Space, Ctrl+D/X/V/G, M, G, A, U, 1/2/3, Delete, Enter) already ignores `event.repeat`. These four were missed.
  2. **HE: held Enter on buttons and on the marker name editor (A's reviewer F5; Low, one has a behaviour impact).** Chromium fires `click` on every Enter keydown, including the auto-repeats.
     - **B probe** (`b-round-106/probe/probe-out.txt`, real Chromium, 1280×720, 1 down + 5 repeats):
       - Enter held on ◀: `უკან მარკერი აღარ არის` was added **6 times**.
       - Enter held on `+`: the first repeat landed on the newly opened name editor and **committed the default name `Marker 1`**. The user never got to type a name. The later repeats landed on the new flag.
     - The same convention already exists: `ArrangementExportDialog.tsx:554`, `ArrangementTransport.tsx:250` and `ArrangementLibraryPreview.tsx:294/313` prevent a repeated Enter on their buttons.
  3. **NZ: single clip at 00:00.000, Snap off, ←: no feedback at all (C-R106-01 = A-R106-TIME0-SILENT; Low, a11y).**
     - `nudgeSelectedClip` clamps to 0 with `Math.max(0, …)`. `moveClip` then succeeds without changing anything, and `applyEdit` writes nothing. So there is no status and no history entry, for a hold and for a deliberate press.
     - With Snap on, the same place announces `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` The two modes disagree.
  4. **C-R106-03 (Low, doc):** doc 092 l.94 (the A-R104-REPEAT-DRAG entry) still says round 105 is waiting for C.
- **Not in this round (still open, not deferred):**
  - GATE106-S1 (the reducer reads the gesture ref at render time), together with ARCH-R105-STATUS-INTENT and A-R105-REVIEW-2;
  - GATE106-S2 (the `statusRef` nit in `stepMarker`) and GATE106-S4 (one `KeyRepeatOptions` type);
  - GATE104-S2, GATE103-S1/S2/S3, A-R103-EW5-TITLE-NIT, GATE102-S3/S4, GATE98-S2 and the grid/tempo/marker Lows;
  - SRW-21-PREMOUNT and the SRW-21 mount (waiting for the auth owner), T12, VISUAL-A-OBSIDIAN.
- **Regression round:** `regression-last.json` is 2026-10-21; B planned this round on 2026-10-23 (2 days). **The next B planning on or after 2026-10-24 is the regression round.**

## Why this round
- **C round 106: PASS** (`browserVerified=true`, `realVerified=true`). Gate 106 **published** `35112cd` (rounds 104–106; reviewer 8/10, "nothing blocks").
- C filed three Lows, all of them pre-existing. The gate reviewer's suggestion #5 and A's code-reviewer (F5/F6) independently named the same remaining held-key paths.
- C's KR-NUDGE-SNAPOFF and KR-NUDGE-MOVES rows in round 106 were B spec errors: they assumed a single clip at 0 announced a refusal, and it never did. This round makes B's original assumption true, by a deliberate contract decision (below), and then tests it.

## Baseline (measured by B, 2026-10-23 ~10:00 UTC)
- **HEAD `35112cd5b112ac007169cf48771805fd70c211c2`** (published, gate 106). `git status --short` is **empty** (0 M + 0 ??).
- **Frozen list:** `../tmp/studio-real-loop/b-round-106-r107-tree-sha256.txt`, **536** entries (the round 106 list, plus `ArrangementLoopBrace.tsx`, minus the six owned paths below). Check it with `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-106-r107-tree-sha256.txt`.
- **Snapshots** of the owned files at `35112cd`: `../tmp/studio-real-loop/b-round-106-r107-snapshots/` (`SHA256SUMS.txt`; LF, CR=0; they equal A's round 106 end hashes). Fail-before runs against these.

  | File | sha256 prefix | lines | permission |
  |---|---|---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `ce70fcb5` | 2523 | **owned, narrow:** (a) the `~/contexts/ArrangementContext` import (l.11–17): add `NUDGE_AT_TIME_START_MESSAGE`; (b) delete the local `NUDGE_AT_TIME_START_MESSAGE` (l.150); (c) the Ctrl+E (l.1759–1763), Ctrl+L (l.1778–1786) and Ctrl+C (l.1799–1806) branches of `handleKeyDown`. Nothing else. |
  | `app/contexts/ArrangementContext.tsx` | `65a81c6d` | 3428 | **owned, narrow:** (a) one new `export const NUDGE_AT_TIME_START_MESSAGE` next to `GESTURE_EDIT_BLOCKED_MESSAGE` (l.169–170); (b) the single-clip part of `nudgeSelectedClip` (l.1700–1716). The reducer, `gestureCountRef`, `toggleLoopSelection`, `splitSelection`, `extendRangeToAllTracks`, `copySelection` and every other line stay byte-identical. |
  | `app/components/arrangement/ArrangementMarkerRow.tsx` | `58d9b313` | 837 | **owned, narrow:** the three header buttons `+`, ◀ and ▶ (l.681–714) and the name editor's `onKeyDown` (l.805–811). Nothing else. |
  | `app/components/arrangement/ArrangementDetailPanel.tsx` | `900350a5` | 855 | **owned, narrow:** the `მონიშვნა` apply button (l.516–525) and the `0 dB` Clip Gain reset button (l.557–568). Nothing else. |
  | `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `581db1e7` | 705 | **owned, append-only:** lines 1–705 stay byte-identical. Append one new top-level `describe` after l.705 (new helpers go inside it or directly before it). |
  | `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md` | `4e2ed121` | 185 | **owned (whole doc):** see §1 Docs. |

- **Expected end state:** `git status --short` = **6 M + 0 ??** (exactly the six paths above).
- **Protected (frozen, never edited; B re-checked them in this tree):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`);
  - the auth files: `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (B checked at ~10:00 UTC). The backend at `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean, commit or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run fail-before and mutations in a scratch copy (`a-round-107/mut/`, with a `node_modules` symlink and the Vitest `cacheDir` inside scratch), never in `store/`.
  - Stop and report if, at the start, HEAD differs, the status is not empty, or a frozen file changed.

## 1. What changes (A)

Read first: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/new-test.md`. There are no styling changes.

### The rules (B decisions, D-29z72)
- **R1, one-shot shortcuts:** Ctrl/Cmd+E, Ctrl/Cmd+L, Ctrl/Cmd+Shift+L and Ctrl/Cmd+C ignore `event.repeat`, exactly like Ctrl+D/X/V. `preventDefault()` still runs on every repeat, so the browser never sees them.
  - **Ctrl+C:** keep the `window.getSelection()?.isCollapsed === false` early return **before** `preventDefault`, unchanged, so copying selected page text still works. Only the `copySelection()` call is guarded.
  - **Not changed:** Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z keep repeating (each repeat is one real undo or redo step); Ctrl+A stays as it is (it is idempotent and sets no status); the gesture-refusal branch (l.1736–1758) stays as it is (the reducer already coalesces it during a gesture).
  - **Ctrl+L semantics are unchanged.** When a selected range differs from the brace, the first press replaces the loop with that range. That is the SRW-05 contract ("Loop Selection replaces old range"), and C saw exactly this in round 106. Do not touch `toggleLoopSelection`.
- **R2, held Enter on a button:** a repeated Enter keydown on these buttons is prevented: `onKeyDown={(event) => { if (event.key === 'Enter' && event.repeat) { event.preventDefault(); } }}`, which is the existing project convention (`ArrangementExportDialog.tsx:554`). No `stopPropagation`; Space and other keys are untouched. Buttons: marker `+`, ◀, ▶ (`ArrangementMarkerRow.tsx`); detail `მონიშვნა` and `0 dB` (`ArrangementDetailPanel.tsx`).
  - In Chromium, preventing the default of the Enter keydown stops the synthetic click. A fresh Enter (`repeat === false`) still clicks as before.
- **R3, the marker name editor:** a repeated Enter in the name input does nothing: `preventDefault()` and `stopPropagation()` as today, but **no** `settleEditor`. A fresh Enter commits as today. Escape is unchanged (a repeated Escape cancels once; the editor is gone after the first).
  - Reason: with R2 alone, holding Enter on `+` would still commit the default name, because the first repeat lands on the editor that the first keydown opened (B probe).
- **R4, single clip at time 0 (contract decision):** when the clamped target start equals the clip's current start (with a non-zero delta this happens only at 00:00.000 with a negative delta), `nudgeSelectedClip` announces `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` and writes nothing else.
  - This is the Snap-on text, so both modes say the same thing in the same place. One constant, `NUDGE_AT_TIME_START_MESSAGE`, now exported from `ArrangementContext.tsx` (like `GESTURE_EDIT_BLOCKED_MESSAGE`) and imported by the workspace, so the text cannot drift.
  - With `keyRepeat === true` it is dispatched in updater form, `setStatus(() => NUDGE_AT_TIME_START_MESSAGE)`, exactly as the other two nudge refusals already are. So a hold announces it once, and a deliberate press always announces it (D-29z71).
  - The neighbour text (`… მეზობელი კლიპი ან დროის დასაწყისი.`) stays for `moveClip` returning `null`. The group path is unchanged (it already refuses at 0).
  - Compare the clamped target with `clip.start` directly. Do not rely on `moveClip` or `replaceClip` returning the same object.
  - **Why this and not silence:** the user's rule for this Studio is that a refused action states its reason (done-policy "disabled features state reason"). The refusal already names the time start. A silent arrow key is indistinguishable from a broken one for a screen-reader user. This is the smallest honest behaviour; nothing moves and no history entry is written.

**Forbidden:** guarding the nudge **action** with `!event.repeat` (a held arrow must keep moving a clip while there is room); coalescing identical status texts in the reducer (D-29z71 k8); any change to the public `setStatus` type or the `useArrangement()` shape.

### Tests (owned UI test file, append-only)
**Rules:** exact assertions (`toBe`, `toEqual`, `toBeNull`); no `as` (including `as const`), no `@ts-` and no `any`; reuse `mountKeyRepeatWorkspace`, `keyRepeatClip`, `keyRepeatArrangement`, `pressKey`, `observeRegion`, `addedTexts` and the other helpers in l.1–705 without editing them. jsdom sends no click for a button keydown, so the button tests assert the return value of `fireEvent.keyDown` (false = prevented), as `export-toolbar-hold-enter.test.tsx` TH1/TH2 do, and click explicitly where a click is part of the scenario.

- **HK1 (Ctrl+L):** an enabled loop and no range. Ctrl+L once (`repeat: false`), then three repeats. The loop is disabled exactly once (`arrangement.loop.enabled === false` after the first press and after every repeat), one span with `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.` is added, the Undo label is `Undo: Loop გამორთვა`, and one Undo restores `enabled === true`. A later separate Ctrl+L enables it again.
- **HK2 (Ctrl+E):** one selected clip with the playhead inside it. Ctrl+E once, then three repeats. The clip count goes up by exactly one, one span `კლიპი გაიყო …-ზე.` is added, and nothing else is added (in particular not `Playhead არჩეული კლიპის შიგნით უნდა იყოს.`).
- **HK3 (Ctrl+Shift+L):** a range on one lane. One press, then three repeats: one span `მონიშვნა ყველა ხაზზე: …` is added.
- **HK4 (Ctrl+C):** one selected clip. One press, then three repeats: one span `Copy: 1 კლიპი ბუფერშია.`. A later separate press adds one more span with the same text. Every one of these keydowns returns `false` (prevented).
- **HK5 (not over-guarded):** with two undoable edits, Ctrl+Z once and then one repeat undoes **two** steps.
- **HE1 (◀ / ▶):** `fireEvent.keyDown(prev, { key: 'Enter', repeat: true })` and the same on next return `false`; with `repeat: false` they return `true`; a repeated Space on ◀ returns `true`.
- **HE2 (`+`):** a repeated Enter on `+` returns `false`, a fresh one returns `true`.
- **HE3 (name editor):** open the editor with a click on `+`. A repeated Enter in the name input leaves the editor open and adds no marker; then a fresh Enter commits exactly one marker with the default name.
- **HE4 (detail buttons):** a repeated Enter on `მონიშვნა` and on `0 dB` returns `false`; a fresh one returns `true`.
- **NZ1 (deliberate press):** Snap off, a single selected clip at 0. ArrowLeft (`repeat: false`) adds one span with exactly `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.`; the clip start stays 0 and the Undo label is unchanged.
- **NZ2 (hold):** the same setup. One press, then three repeats: one span in total; the same `<output>` and span node. A later separate press adds one new span with the same text.
- **NZ3 (the action still repeats):** Snap off, a single clip at 0.3 with no neighbour. ArrowLeft once, then four repeats: the start goes 0.2 → 0.1 → 0, then the time-start text is added **once** and no other text is added. This is B's original round-106 SK7 premise, now true.
- **NZ4 (Snap on, same text):** Snap on, a single clip at 0, ArrowLeft once: the added text equals NZ1's text (one string compared with `toBe`).
- **SU1–SU6 and SK1–SK12 stay byte-identical and green.** SK1/SK7 keep their neighbour setups.

**Fail-before** (scratch, the four code files = the snapshots, the new test file). B expects: HK1–HK4, HE1–HE4 and NZ1–NZ3 red; HK5 and NZ4 green; SU and SK green. Report the exact list and explain any difference.

**Mutations** (scratch only; one unmutated control; record the red tests):
- **h1:** remove the repeat guard from Ctrl+L → HK1 red.
- **h2:** remove it from Ctrl+E → HK2 red.
- **h3:** remove it from Ctrl+Shift+L → HK3 red.
- **h4:** remove it from Ctrl+C → HK4 red.
- **h5:** guard Ctrl+Z with `!event.repeat` as well → HK5 red (shows the test catches over-guarding).
- **h6:** drop the ◀ `onKeyDown` → HE1 red; **h7:** drop the `+` one → HE2 red; **h8:** let a repeated Enter settle the editor → HE3 red; **h9:** drop the `0 dB` one → HE4 red.
- **h10:** remove the R4 branch → NZ1–NZ3 red.
- **h11:** dispatch the R4 refusal as a plain string even on `keyRepeat` → NZ2 red.
- **h12:** guard the nudge action with `!event.repeat` → NZ3 and SK7 red.

### Docs (doc 092, owned whole)
- **l.4 status:** round 107 waits for C (D-29z72); rounds 104–106 are C PASS and published in `35112cd` (gate 106).
- **C-R106-03:** the A-R104-REPEAT-DRAG entry's status line (l.94) says round 105 passed C (C round 105) and was published in `35112cd`.
- **Problems and solutions:** one entry for HK (R1), one for HE (R2 + R3, with B's probe), and one for NZ (R4: why a refusal rather than silence; one exported constant).
- **Changed files:** add round 107 (HK1–HK5, HE1–HE4, NZ1–NZ4).
- **Testing:** fail-before, h1–h12, the targeted count.
- **TODO:** the C rows of round 107; GATE106-S1/S2/S4 and ARCH-R105-STATUS-INTENT (signals, not scheduled).

### Checks A runs (speed rules)
- `npm run typecheck`.
- `npm run lint`, with 0 diagnostics in the owned files (use `--max-diagnostics` and grep, as in round 106).
- `npx biome check <the 5 owned code and test files>`, without `--write`.
- **Targeted vitest:** the list is `grep -rlE "ArrangementProvider|StudioWorkspace|useArrangement\b|status-announcement|ArrangementMarkerRow|ArrangementDetailPanel|nudgeSelectedClip|stepMarker|NUDGE_AT_TIME_START" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-107/targeted-list.txt`, run with `npx vitest run $(cat ../tmp/studio-real-loop/a-round-107/targeted-list.txt)`. Report the file and test counts. B expects ≥ 69 files and 1138 + the new tests; list any extra files.
- **If a frozen test fails because it pinned the old silent time-0 nudge:** do not edit it. Stop the R4 part, keep R1–R3, and report the test and its line to B.
- Do **not** run the full suite or `npm run verify`; the root gate runs them.
- **Code-reviewer:** run it (6 files change). Pass its Architecture note through verbatim, and ask it to sweep every button with an `onClick` that sets a status in `app/components/arrangement` for the held-Enter class, and every `handleKeyDown` modifier branch for a missing repeat guard.

## 2. Acceptance — what C checks (real Chromium)
**Setup for every browser row unless stated:** a fresh incognito context on `/studio-lab` at the stated viewport; Decline; wait for the library to settle; a `MutationObserver` on `[data-testid=arrangement-status]` logging added element nodes and their text; a kept reference to the `<output>`; a capture-phase `keydown` counter for `repeat === true`. A hold is `keyboard.down` ×(N+1) at ~33 ms, then `up`. A separate press is `keyboard.press`. C's round-106 helpers (`c-round-106/tools/kr106.cjs`) may be reused.

**Clip setup:** focus the Middle East row and press Enter once (one clip at 00:00.000; twice for two back-to-back clips), Fit, then select a clip by clicking its title strip.

| ID | Steps | PASS when |
|---|---|---|
| **HK-CTRL-L** (primary; 1280 and 1440) | One clip. Snap on. Drag a range on the clip from t≈3 s to t≈12 s, blur, Ctrl+L (loop created). Then hold Ctrl+L: 1 down + ≥ 10 repeats. Then one separate Ctrl+L. | <ul><li>Over the hold, the loop button's `aria-pressed` changes **once** (true → false) and stays false.</li><li>Exactly one added span, `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.`</li><li>Undo label `Undo: Loop გამორთვა`.</li><li>Then exactly this sequence: one Ctrl+Z → `aria-pressed` true; one separate Ctrl+L → `aria-pressed` false and exactly one more added span `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.`</li><li>Screenshot.</li></ul> |
| **HK-CTRL-E** (1280) | One clip, Snap off. Click the ruler at t≈10 s (inside the clip), select the clip, hold Ctrl+E: 1 down + ≥ 10 repeats. | Clip count 1 → 2 exactly once; exactly one added span `კლიპი გაიყო …-ზე.`; no other text added. One Ctrl+Z → 1 clip. |
| **HK-CTRL-SHIFT-L** (1280) | One clip, a range dragged on it. Hold Ctrl+Shift+L: 1 down + ≥ 10 repeats. | Exactly one added span `მონიშვნა ყველა ხაზზე: …`. |
| **HK-CTRL-C** (1280) | One clip, selected. Hold Ctrl+C: 1 down + ≥ 10 repeats, then one separate Ctrl+C. | One span `Copy: 1 კლიპი ბუფერშია.` during the hold; the separate press adds one more. |
| **HK-UNDO-STILL-REPEATS** (1280) | One clip, three separate ArrowRight presses (Snap off; 0.300). Hold Ctrl+Z: 1 down + 2 repeats. | The clip is back at 00:00.000 (three undo steps). |
| **HE-MARKER-PREV** (1280 and 1440) | No markers, playhead at 0. Focus ◀ and hold Enter: 1 down + ≥ 10 repeats. Then one separate Enter. | `უკან მარკერი აღარ არის` added **once** during the hold (B probe before the fix: 6 of 6); the separate Enter adds one more. |
| **HE-MARKER-NEXT** (1280) | One marker at ≈5 s (ruler click with Snap off, M, Enter), then Home. Focus ▶ and hold Enter: 1 down + ≥ 10 repeats. | The playhead moves to the marker time (record the position readout) and stays there. A successful step sets no status (`stepMarker` l.247–250 only seeks and selects), so **0 spans are added** during the hold; in particular `წინ მარკერი აღარ არის` is never added (before the fix the second keydown would add it). |
| **HE-MARKER-ADD** (1280 and 1440) | Playhead at 0. Focus `+` and hold Enter: 1 down + ≥ 5 repeats, then up. Then type `Intro` and press Enter. | After the hold: the name editor is open and focused, there are 0 markers and the Undo label is unchanged (B probe before the fix: `Marker 1` committed by the repeat). After typing: exactly one marker, named `Intro`. |
| **HE-CLIPGAIN-RESET** (1280) | One clip, selected (gain 0.0). Focus `0 dB` and hold Enter: 1 down + ≥ 10 repeats; then one separate Enter. | `Clip Gain უცვლელია: 0.0 dB.` once during the hold; the separate Enter adds one more. |
| **HE-DETAIL-APPLY** (1280) | One clip, selected; detail panel open; type start 2 and end 4 in the range inputs (Tab between them, no Enter). Focus `მონიშვნა` and hold Enter: 1 down + ≥ 10 repeats. | Exactly one added span (record the exact text); the range is 2–4. |
| **NZ-TIME0** (primary; 1280 and 1440) | One clip at 0, selected, Snap off. One separate ArrowLeft. Then hold ArrowLeft: 1 down + ≥ 30 repeats. Wait 500 ms, then one separate ArrowLeft. | <ul><li>The first press adds `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.`</li><li>The hold adds exactly one more (its first, non-repeat keydown); the repeats add none.</li><li>The last press adds one more.</li><li>The clip stays 00:00.000; the Undo label never changes; the `<output>` is the same node with one child at every sample.</li></ul> |
| **NZ-MOVES** (1280) | B's round-106 KR-NUDGE-MOVES as written: one clip moved to 0.300 with three separate ArrowRight, then hold ArrowLeft: 1 down + ≥ 10 repeats. | The clip reaches 00:00.000; the time-start text is added exactly once and nothing else; Ctrl+Z ×3 → 0.100, 0.200, 0.300. |
| **NZ-SNAPON-SAME** (1280) | One clip at 0, Snap on, ArrowLeft once. | The added text is byte-identical to NZ-TIME0's. |
| **KR-NUDGE-NEIGHBOUR** (regression; 1280) | Round 106 KR-NUDGE-SNAPOFF with the neighbour recipe (two clips, second selected). | The neighbour text is added once during the hold, as in round 106. |
| **SR-REPEAT-SPACE**, **HD-BLOCKED-HOLD**, **SR-TEXT-REG** (regression; 1280) | As in round 106 (`c-round-106/tools/sr106.cjs`). | Same results as round 106. |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`; 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no pageerror, no non-noise console error. |
| **G107-3** | anonymous, run alone, after all rows | The header link opens `/studio-lab` with the workspace and the demo badge; `/studio/middle-east` shows sign-in and no workspace; `/api/studio-token` returns 401; the fake-Bearer sub-check is BLOCKED (backend unavailable in cloud) under `blocked`. |
| **AN-REVIEW** (offline) | Review A's tests. | The fail-before list matches §1 or A explains the difference; C re-runs h1, h5, h8, h10 and h12 with its own mutation strings and gets the same red tests; l.1–705 are byte-identical to the snapshot; exact assertions; no `as`, `@ts-` or `any` in the added lines. |
| **T107-TARGETED** | `npx vitest run $(cat a-round-107/targeted-list.txt)` | All pass. C re-runs the grep and reports any missing file. |
| **DOC-092** (offline) | Read doc 092. | l.4 carries the round 107 status and `35112cd`; l.94 no longer says waiting for C; HK, HE and NZ entries exist with their rules; the changed-files list names HK1–HK5, HE1–HE4, NZ1–NZ4. |
| **SOURCE-UNCHANGED** | start and end | HEAD `35112cd`; start status empty, end **6 M + 0 ??**; the frozen list 536/536; A's end hashes match; against the snapshots, every hunk lies inside the narrow ranges of the Baseline table; `toggleLoopSelection`, `splitSelection`, `extendRangeToAllTracks`, `copySelection` and the reducer are unchanged. |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- **A held arrow stops moving a clip:** a guard on the action. NZ3, NZ-MOVES, SK7 and h12 cover it.
- **Undo/Redo stops repeating:** HK5, HK-UNDO-STILL-REPEATS and h5.
- **A fresh Enter on a button stops working:** HE1–HE4 (`repeat: false` returns `true`), HE-MARKER-PREV's separate Enter, HE-MARKER-ADD's typed commit.
- **Copying page text with Ctrl+C:** the `getSelection` early return is unchanged (SOURCE-UNCHANGED).
- **A deliberate second press goes silent:** the separate-press steps, SR-REPEAT-SPACE.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A held shortcut (Loop, Split, Copy) acts once | None consulted; no Live claim is made about key auto-repeat. | — | CZABA's keyboard convention since Space/Ctrl+D/X/V: one-shot commands ignore auto-repeat; Undo/Redo repeat. | არ ეხება |
| A held Enter on a button acts once; a held Enter does not commit a name the user has not typed | None consulted. | — | CZABA's own rule (precedent: export dialog, transport, library preview). | არ ეხება |
| ← on a clip at time 0 says why nothing moved | Live 12 manual §3.2 Status Bar "displays useful information like error messages" (captured in `b-round-37/ableton-live-concepts-20261013.txt`); it says nothing about this case. | Not confirmed for this case | CZABA rule: a refused action states its reason; the same text with Snap on and off. | არ ეხება (CZABA requirement) |

## 4. Report (A)
Write `a-round-107.md` and `a-round-107/a-round-107-summary.json` as you go (the harness writes `a-round-107-result.json`). Include the changed files with end sha256 (`a-round-107/end-hashes.txt`), the exact commands and results, the fail-before list, the mutation table h1–h12, the code-reviewer findings with your disposition and its Architecture note verbatim, the sweep result for buttons and modifier branches, and the exact next C checks. A may run its own browser self-check (e.g. HE-MARKER-ADD, HK-CTRL-L) in `a-round-107/`; it is evidence, not C acceptance. If you stop early, write a checkpoint with the next step.
