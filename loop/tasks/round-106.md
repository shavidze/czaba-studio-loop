# CURRENT TASK — Round 106: a held key no longer repeats the same refusal (GATE105-S1) + doc 092 drift (C-R105-01, GATE105-S2)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23 (B planned at ~09:05 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-105.md` (exact copy of the round 105 task). Rationale: `b-round-105.md`. Decision record: D-29z71 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one bug class (a held key re-announces the same refusal), found at five call paths, plus the doc drift of the same change set. That is two tightly related items with one owner (A). Rounds 104, 105 and 106 are one change set, and root publishes them together after C passes and the gate reviewer approves.
  1. **GATE105-S1 (Medium: a11y and render cost; a regression of round 104).**
     - **The problem:** a key held at a boundary now re-announces the same refusal on every OS auto-repeat (about 30 per second), and each repeat commits the provider. At `3b6178b`, `useState` skipped the identical update, so the refusal was announced once.
     - **Why round 105 did not catch it:** its gesture-aware reducer covers pointer gestures only, and a key press is not a claimed gesture.
     - **Evidence:** `gates/round-105/review.md` #1. Gate 105 was **blocked** on this (score 6/10). B confirmed it by reading the source; it has not been measured in a browser yet.
  2. **C-R105-01 + GATE105-S2 (Low, doc 092).**
     - l.16 (Approach) still says the string branch "always" bumps `sequence`.
     - The Mermaid diagram (l.32–44) shows only the Space path.
     - The changed-files list (l.49–55) still names only SA1–SA5 and SU1–SU4.
     - The "recorded semantics" have no keyboard rule.
- **Not in this round (still open, not deferred):**
  - GATE104-S2 (the loading text announced at mount);
  - A-R105-REVIEW-2 (an optional "dispatch during a gesture, render after release" test);
  - ARCH-R105-STATUS-INTENT (architecture signal);
  - GATE103-S1/S2/S3, A-R103-EW5-TITLE-NIT, GATE102-S3/S4, GATE98-S2;
  - the grid/tempo/marker Lows;
  - SRW-21-PREMOUNT and the SRW-21 mount (waiting for the auth owner's release), T12, VISUAL-A-OBSIDIAN.
- **Regression round:** `regression-last.json` is 2026-10-21. B planned this round on 2026-10-23, which is 2 days. **The next B planning on or after 2026-10-24 is the regression round.**

## Why this round
- **C round 105: PASS** (`browserVerified=true`, `realVerified=true`). The only finding was C-R105-01 (Low, doc).
- **Gate 105: BLOCKED** at head `3b6178b` (`gates/gate-round-105.json`, `gates/round-105/review.md`). Nothing from rounds 104–105 is published.
- The gate bug is in the same class as gate 104's: a repeated identical status. Gate 104 blocked the pointer version, and gate 105 blocked the keyboard version.
- **The gate reviewer's sweep was partial** ("not a full sweep"), so B swept every `onKeyDown` handler in `app/components/arrangement` and the workspace `handleKeyDown`. The five paths are listed in §1. Fixing only the reviewer's one site would leave four siblings for the next gate to block.

## Baseline (measured by B, 2026-10-23 ~09:05 UTC)
- **HEAD `3b6178b758253d5098cea19f07c43e4799cb9299`** (the last publication; gates 104 and 105 blocked).
- `git status --short` = **3 M + 4 ??** (the round 104 + 105 work):
  - ` M app/components/arrangement/StudioWorkspace.tsx`
  - ` M app/contexts/ArrangementContext.tsx`
  - ` M docs/implementation/2026/quarter-IV/091-studio-export-worker-watchdog.md`
  - `?? app/lib/arrangement/__tests__/status-announcement-ui.test.tsx`
  - `?? app/lib/arrangement/__tests__/status-announcement.test.ts`
  - `?? app/lib/arrangement/status-announcement.ts`
  - `?? docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md`
- **Never revert, stash or re-create the round 104/105 work.** It is the baseline.
- **Frozen list:** `../tmp/studio-real-loop/b-round-105-r106-tree-sha256.txt`, **535** entries. It is the round 105 list (537) plus `status-announcement.ts` and `status-announcement.test.ts` at their round 105 hashes, minus the four component files owned below.
  - Check it with: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-105-r106-tree-sha256.txt`.
- **Snapshots** of the round 105 state: `../tmp/studio-real-loop/b-round-105-r106-snapshots/` (`SHA256SUMS.txt`, 7 files). All are LF with CR=0, and they match A's round 105 end hashes. Fail-before runs against these snapshots, **not** against `3b6178b`.

  | File | sha256 prefix | lines | permission |
  |---|---|---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `bfe53dcb` | 2519 | **owned, narrow:** the arrow-nudge branch (l.1933–1960) and the Ctrl/Option+Arrow `stepMarker` call (l.1852). Nothing else. |
  | `app/contexts/ArrangementContext.tsx` | `939e720c` | 3414 | **owned, narrow:** `nudgeSelectedClip` (l.1673–1702) and `stepLoopRange` (l.1650–1670) get an optional options argument; the two interface lines (l.295, l.301). Nothing else: the reducer, `gestureCountRef` and every other `setStatus(` line stay byte-identical. |
  | `app/components/arrangement/ArrangementLoopBrace.tsx` | `e8bbab9a` | 280 | **owned, narrow:** `handleLoopKeyDown` (l.193–212) only. |
  | `app/components/arrangement/ArrangementMarkerRow.tsx` | `e9b38eee` | 813 | **owned, narrow:** the `useArrangement()` destructure (add `status`), `stepMarker` (l.222–239, including its deps array: Biome will require `status` there, so `stepMarker` and the `useImperativeHandle` re-create on each status change; that is expected and harmless, so do not use a ref) and its handle type (l.82), `commitMarkerMove` (l.364–381), `nudgeMarker` (l.382–398), and the arrow branch of `handleFlagKeyDown` (l.615–620). |
  | `app/components/arrangement/ArrangementDetailPanel.tsx` | `00dc8d66` | 851 | **owned, narrow:** the Enter branches of `handleRangeInputKeyDown` (l.320–325) and `handleClipGainKeyDown` (l.370–378). |
  | `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `b6b54dc7` | 391 | **owned:** append one new `describe` with SK1–SK8. Lines 1–390 (helpers and SU1–SU6) stay byte-identical, apart from the relocated closing `});` (see Tests). You may add new helpers inside the new `describe`, or after line 210 as new top-level functions, without changing existing lines. |
  | `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md` | `651428dd` | 106 | **owned (whole doc):** see §1 Docs. |
  | `app/lib/arrangement/status-announcement.ts`, `…/__tests__/status-announcement.test.ts`, doc 091 | — | — | **frozen** (in the list) |

- **Expected end state:** `git status --short` = **6 M + 4 ??**: the 7 baseline paths, plus ` M` for `ArrangementLoopBrace.tsx`, `ArrangementMarkerRow.tsx` and `ArrangementDetailPanel.tsx`. No other new path.
- **Protected (frozen, never edited; B re-checked the hashes in this tree):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`);
  - the auth files: `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). The backend at `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run fail-before and mutations in a scratch copy (`a-round-106/mut/`, with a `node_modules` symlink and the Vitest `cacheDir` inside scratch), never in `store/`.
  - Stop and report if, at the start, HEAD differs, the status differs from the 3 M + 4 ?? above, or a frozen file changed.

## 1. What changes (A)

Read first: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `FORWARDREF_COMPONENT.md` (you touch components), and `.claude/prompts/new-test.md`. There are no styling changes.

### The rule (B decision, D-29z71)
**A keyboard auto-repeat (`event.repeat === true`) never re-announces a refusal that is already the current status text.**
- **On a repeat,** the refusal is dispatched only if its text differs from the current `status`. For held keys this is exactly what `3b6178b` did, because `useState` dropped an identical text.
  - Example: a held ArrowLeft that moves a clip 0.3 → 0 and then hits time 0. The refusal is announced **once**, at the first refused repeat, because the text is new there. Later repeats stay silent.
- **The action still runs on every repeat,** so a held arrow keeps nudging or stepping while there is room. Only the repeated identical refusal is silent.
- **A separate, deliberate press** (`repeat === false`) always announces, even the same text again. That is GATE96-S2 for keys.

**Forbidden fix:** do not coalesce identical texts in the reducer or provider for non-repeat input outside a gesture. Text merging silences Space twice and Enter twice again (SU1/SU2) and breaks GATE96-S2. The gate must sit at the key handler, which knows `event.repeat`, as the gate reviewer recommended.

**Mechanism:** inside the provider, a refusal on a repeat is dispatched in updater form, `setStatus(() => MESSAGE)`. The reducer's function branch already returns `previous` when the text is unchanged (round 104 SA/SU4), and bumps otherwise. Components cannot use the updater, because the public `setStatus` type stays `(message: string) => void`; widening it would break frozen test fakes under `strictFunctionTypes`. So a component call site uses `if (!event.repeat || status !== MESSAGE) { setStatus(MESSAGE); }`, where `status` is the `useArrangement()` text of the latest render. Each keydown is a discrete event that React flushes before the next one, so that render is current.

**Rejected:** skipping the refusal on every repeat. B's first draft of this task did that, and it would announce nothing when the boundary is first reached during a hold, which `3b6178b` announced once.

### The five paths (B swept them; A confirms the sweep in the report)
| # | Key and focus | Where the refusal is set | Text (exact, from source) |
|---|---|---|---|
| P1 | ←/→ with a clip selected, **Snap off** | `nudgeSelectedClip` → `ArrangementContext.tsx` l.1698 (single clip) and l.1680 (≥ 2 clips) | `ჩაჩოჩება დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი.` / `ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.` |
| P2 | ←/→ with a clip selected, **Snap on**, no grid line to the left | `StudioWorkspace.tsx` l.1955 (and P1's provider texts when the step is blocked by a neighbour) | `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` |
| P3 | ←/→ (Shift = end) on the focused loop brace | `stepLoopRange` → `ArrangementContext.tsx` l.1662 | `Loop ვეღარ გადაიწევს: დროის დასაწყისი ან მინიმალური სიგრძე.` |
| P4 | ←/→ on a focused marker flag | `nudgeMarker` l.390 / `commitMarkerMove` l.367 | `მარკერი დროის დასაწყისშია.` / `ამ დროზე მარკერი უკვე არის: «…»` |
| P5 | Ctrl+←/→ (Option on Apple) past the last or first stop | `stepMarker` l.232, called from `StudioWorkspace.tsx` l.1852 | `წინ მარკერი აღარ არის` / `უკან მარკერი აღარ არის` |
| P6 | Enter held in the detail panel's range inputs or Clip Gain input | `applyDetailRange` / `commitClipGain('enter')` | e.g. `Clip Gain უცვლელია: 0.0 dB.` |

P6 is a sixth path of the same class (a held Enter in an input). Gate it by skipping the repeated Enter entirely. Repeating the apply is idempotent and only produces the no-change text, and the workspace Enter (l.1968) already follows this convention.

**Paths B checked and found already safe** (A re-confirms them, no edit): the Digit1/2/3 grid keys (guarded); the library option Enter (guarded); the group-header rename Enter (guarded); the lane fold key (guarded); the playhead, overview, separator, float-handle and preview-wave arrows (no `setStatus`); the workspace gesture refusal at l.1756 (it is inside a claimed gesture, so the round 105 reducer already coalesces it).

If A finds another path where `repeat: true` sets the same text and the file is not owned here, **stop editing that path and report it to B**. Do not touch frozen files.

### Changes
**One option name everywhere: `keyRepeat`** (default `false`), so the rule can be found with grep.
- **P1, P2: `ArrangementContext.tsx` + `StudioWorkspace.tsx`**
  - `nudgeSelectedClip(delta: number, options?: { readonly keyRepeat?: boolean }): void`.
    - With `keyRepeat === true`, both refusals (l.1680, l.1698) are dispatched as `setStatus(() => MESSAGE)`. Otherwise they stay `setStatus(MESSAGE)`.
    - The move logic is unchanged.
    - Update the interface line l.301.
    - The frozen tests that call `nudgeSelectedClip(0.5)` stay valid.
  - In the workspace nudge branch:
    - Both `nudgeSelectedClip` calls pass `{ keyRepeat: event.repeat }`.
    - Snap on: `if (target === null) { if (!event.repeat || current.status !== NUDGE_AT_TIME_START_MESSAGE) { current.setStatus(NUDGE_AT_TIME_START_MESSAGE); } return; }`.
- **P3: `ArrangementContext.tsx` + `ArrangementLoopBrace.tsx`**
  - `stepLoopRange(kind, delta, gridStep?: number | null, options?: { readonly keyRepeat?: boolean })`.
    - With `keyRepeat`, `LOOP_STEP_BLOCKED_MESSAGE` is dispatched in updater form.
    - Update the interface line l.295.
  - Both calls in `handleLoopKeyDown` pass `{ keyRepeat: event.repeat }`. Give `gridStep` explicitly in the first call as `null`, which is the current default.
- **P4: `ArrangementMarkerRow.tsx`**
  - Add `status` to the existing `useArrangement()` destructure (around l.120–150).
  - `nudgeMarker(markerId, direction, keyRepeat: boolean)`. The parameter is required, because the function is private and has one caller.
    - On `keyRepeat`, `MARKER_AT_TIME_START_MESSAGE` is set only if it differs from `status`.
  - `commitMarkerMove(before, markerId, time, keyRepeat = false)`.
    - On `keyRepeat`, only the conflict text is set, and only if it differs from `status`.
    - The success text `მარკერი «…» გადავიდა: …` is unchanged and is set on every successful step, because the time changes each step.
    - The drag commit path keeps calling it with 3 arguments.
  - The flag arrow branch passes `event.repeat`.
- **P5: `ArrangementMarkerRow.tsx` + `StudioWorkspace.tsx`**
  - `stepMarker(direction, edgeTimes?, options?: { readonly keyRepeat?: boolean })`.
    - On `keyRepeat`, the end text (`წინ/უკან მარკერი აღარ არის`) is set only if it differs from `status`.
    - Update the handle type at l.82.
  - The ◀/▶ buttons (l.671/682) are unchanged; a click is never a repeat.
  - The workspace Ctrl/Option+Arrow call passes `{ keyRepeat: event.repeat }`.
- **P6: `ArrangementDetailPanel.tsx`**
  - In both Enter branches: `event.preventDefault(); if (!event.repeat) { … }`. The repeated apply is idempotent and only produces the no-change text, and the workspace Enter at l.1968 already follows this convention.
  - Escape is unchanged.
- **No new state, refs, listeners or timers.**
- `setStatus`'s public type, `useArrangement()` and the reducer keep their shape. Any added parameters are optional, except the private `nudgeMarker` one.

### Tests (owned UI test file only; SK = "status, key repeat")
**Rules for all tests:**
- Assert exact values (`toBe`, `toEqual`, `toBeNull`).
- No type assertions (no `as`, including `as const`), no `@ts-` directives and no `any`.
- Reuse `mountAnnouncementWorkspace`, `observeRegion`, `stopWatching` and `addedTexts`.
- A repeat is `fireEvent.keyDown(target, { key, repeat: true })` after one `repeat: false` press.
- **Each SK test (except SK7) checks the following:**
  1. The first press adds the exact refusal text in a new span.
  2. Three repeats keep **the same span node**, and `statusSequence` does not change.
  3. A later separate press (`repeat: false`) adds a **new** span with the same text, and the sequence grows by 1.

- **SK1 (P1, single clip):** a clip at 0 is selected, Snap is off, and the key is ArrowLeft.
- **SK2 (P2):** Snap on. Toggle it through the workspace control or the key the workspace uses (A's choice; record which). ArrowLeft at 0.
- **SK3 (P1, group):** two clips are selected, and the left one is at 0.
- **SK4 (P3):** a loop starts at 0, and ArrowLeft is pressed on the focused `[data-testid=arrangement-loop-brace]`.
- **SK5 (P4):** a marker at 0, and ArrowLeft is pressed on its focused flag.
- **SK6 (P5):** Ctrl+ArrowRight with the playhead at or after the last stop.
- **SK7 (the action still repeats):**
  - Setup: Snap off, a clip at 0.3 s is selected, and no clip lies to its left.
  - Steps: ArrowLeft once, then four repeats.
  - Expected: the clip start goes 0.2 → 0.1 → 0 (the exact values after `roundToMs`), and then the refusal is announced **once** (at the first refused repeat, because the earlier steps set no status and the text is new) and stays silent on the later repeats.
  - Record the exact span count. This pins down that the guard gates the announcement, not the move.
- **SK8 (P6):** a clip is selected. Enter is pressed in the Clip Gain input with the value unchanged, which gives the exact `Clip Gain უცვლელია: 0.0 dB.` once. A repeat Enter adds nothing, and a separate Enter adds a new span.
- **SU1–SU6** stay byte-identical. The file's last line, the closing `});` of the existing describe, may move only if A puts the new describe inside it. B prefers a **separate top-level `describe`** after it, so that `diff` against the snapshot is one pure addition.

**Fail-before** (scratch, against the round 105 snapshots of the five owned code files). B expects:
- SK1–SK6 and SK8 **red at the repeat step** (each repeat adds a span);
- SK7 red at the "once" count;
- SU1–SU6 green.

Report the exact list and explain any difference. `tsc` rejects the new options argument against the snapshot. Vitest does not typecheck, so that is expected.

**Mutations** (scratch only; record the red tests for each one, plus an unmutated control):
- **k1:** the workspace passes `keyRepeat: false` to `nudgeSelectedClip` → SK1, SK3 red.
- **k2:** the workspace drops the repeat/status check around `NUDGE_AT_TIME_START_MESSAGE` → SK2 red.
- **k3:** the guard is put around the action instead (a repeat skips `nudgeSelectedClip`) → SK7 red.
- **k4:** the loop brace passes `keyRepeat: false` → SK4 red.
- **k5:** the flag branch passes `false` → SK5 red.
- **k6:** the Ctrl+Arrow call passes `keyRepeat: false` → SK6 red.
- **k7:** the Clip Gain Enter is not repeat-guarded → SK8 red.
- **k8 (the forbidden fix):**
  - Mutation: revert all the call-site changes, and make the reducer coalesce an identical string regardless of the gesture.
  - Expected: SU1/SU2 red, plus step 3 of the SK tests.
  - This proves the text-merge route breaks GATE96-S2.
- **k9 (the rejected rule):** on a repeat, the provider skips the refusal entirely, instead of using updater form → SK7 red (the refusal is never announced).

### Docs (doc 092, owned whole)
- **l.4 status:**
  - Round 106 is waiting for C (D-29z71).
  - Round 105: C PASS; gate 105 blocked it (GATE105-S1).
- **l.16, Approach:** qualify "always". Outside a gesture, the string branch bumps even for the same text. During a claimed pointer gesture the same text keeps `previous`. A held key is handled at the key handler: on `event.repeat`, a refusal is dispatched only if its text differs from the current status (the provider uses the updater form, a component compares with `status`). Enter in the detail inputs skips the repeat, by the existing convention.
- **Mermaid (l.32–44):**
  - keep the Space path;
  - add a gesture branch (same text → `previous`, no commit);
  - add a key-repeat branch (`event.repeat` → the refusal is dispatched only if its text differs from the current status; otherwise nothing changes).
  - Keep it valid Mermaid.
- **Changed files (l.49–55):** list every file of rounds 104–106, with SA1–SA7, SU1–SU6 and SK1–SK8.
- **Recorded semantics:** add the keyboard rule (§1 "The rule"), the forbidden text-merge fix with the k8 evidence, and the rejected skip-every-repeat rule with the k9 evidence.
- **Problems and solutions:** add a GATE105-S1 entry: the five paths plus P6, the `keyRepeat` option (updater form in the provider, a status comparison in components), and why it is at the key handler rather than in the reducer.
- **Testing:** the SK tests, fail-before, k1–k8, and the targeted count.
- **TODO:** the C rows of round 106, and the Tech Lead check R104-T extended with a held arrow at a boundary using a real screen reader.

### Checks A runs (speed rules)
- `npm run typecheck`.
- `npm run lint`, with 0 diagnostics in the owned files (use `--max-diagnostics` and grep, as in round 105).
- `npx biome check <owned code and test files>`, without `--write`.
- **Targeted vitest:**
  - write the list: `grep -rlE "ArrangementProvider|StudioWorkspace|useArrangement\b|status-announcement|ArrangementLoopBrace|ArrangementMarkerRow|ArrangementDetailPanel|nudgeSelectedClip|stepLoopRange|stepMarker" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-106/targeted-list.txt`;
  - run it: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-106/targeted-list.txt)`.
  - Report the file count and the test count. B expects ≥ 69 files. The round 105 subset of 69 files gives 1126 + 8 = 1134 tests, and any extra files the wider grep finds add their own tests. List the extra files.
- Do **not** run the full suite or `npm run verify`; the root gate runs them.
- **Code-reviewer:** run it, because 7 files change. Pass its Architecture note through verbatim, and ask it explicitly to sweep every keydown path for a `repeat: true` identical status.

## 2. Acceptance — what C checks (real Chromium)
**Setup for every browser row unless stated:**
- a fresh incognito context on `/studio-lab` at the stated viewport;
- Decline consent, then wait for the library to settle;
- a `MutationObserver` on `[data-testid=arrangement-status]` (`childList`, `subtree`, `characterData`), logging the type, a timestamp and the added nodes' text;
- a kept JS reference to the `<output>` node;
- a capture-phase `keydown` listener on `window` that counts `repeat === true` events.

**Held key:** call `page.keyboard.down(key)` repeatedly without `up`. B's probe (`b-round-105/probe/probe-out.txt`) confirmed that the second and later calls arrive as `repeat: true` in the page. Separate presses use `keyboard.press`. In-page `repeat` counts must be ≥ the stated number; record them.

**Clip setup** (C's round 104/105 recipe):
- One clip: focus the Middle East row and press Enter once. The clip lands at 00:00.000.
- Two clips: press Enter twice. They are back to back.
- Then Fit.
- Select the clip by clicking its title strip. Snap's state is shown in the toolbar; record it before each row.

| ID | Steps | PASS when |
|---|---|---|
| **KR-NUDGE-SNAPOFF** (primary; 1280 and 1440) | One clip at 0, selected, Snap off. Hold ArrowLeft: 1 down + ≥ 30 repeats, then up. Wait 500 ms, then one separate `press('ArrowLeft')`. | <ul><li>During the hold, `ჩაჩოჩება დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი.` is added **exactly once**, and the total number of added element nodes is ≤ 1, while the in-page repeats are ≥ 30.</li><li>The separate press adds exactly one more span with the same text.</li><li>The clip start stays 00:00.000, and the Undo label is unchanged.</li><li>The `<output>` is the same node with one element child at every sample.</li><li>Take a screenshot.</li></ul> |
| **KR-NUDGE-SNAPON** (1280) | As above with Snap on (record the grid division). | `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` is added exactly once during ≥ 30 repeats. The separate press adds one more. |
| **KR-NUDGE-MOVES** (1280) | One clip, Snap off. Move the clip to start at 0.300 s with three separate `press('ArrowRight')`, and verify 00:00.300. Then hold ArrowLeft: 1 down + ≥ 10 repeats. | <ul><li>The clip reaches 00:00.000; record its start after the hold.</li><li>The single-clip refusal text is added **once**, and no other text is added during the hold.</li><li>Record the history entries. B expects three Undo steps back to 0.300; use Ctrl+Z ×3 and record the start after each.</li></ul> |
| **KR-GROUP** (1280) | Two clips. Select both: click the first, Ctrl+click the second. Snap off. Hold ArrowLeft: 1 down + ≥ 30 repeats. | `ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.` is added once. Both clips are unchanged. |
| **KR-LOOP** (1280) | Create a loop that starts at 0, using C's earlier loop recipe (record it). Focus `[data-testid=arrangement-loop-brace]` and hold ArrowLeft: 1 down + ≥ 30 repeats. | <ul><li>`Loop ვეღარ გადაიწევს: დროის დასაწყისი ან მინიმალური სიგრძე.` is added once, and the loop start stays 0.</li><li>A separate press adds one more.</li></ul> |
| **KR-MARKER-FLAG** (1280) | Playhead at 0. Add a marker with M, then Enter to accept the default name (C's round 72 recipe). Focus its flag and hold ArrowLeft: 1 down + ≥ 30 repeats. | `მარკერი დროის დასაწყისშია.` is added once, and the separate press adds one more. Also record that holding ArrowRight on the flag moves it by 0.1 s per keydown, with one changing `მარკერი «…» გადავიდა: …` text per step (not coalesced). |
| **KR-MARKER-STEP** (1280) | One marker. Click the ruler after the marker and every clip edge, then hold Ctrl+ArrowRight: 1 down + ≥ 30 repeats. | `წინ მარკერი აღარ არის` is added once, and a separate Ctrl+ArrowRight adds one more. |
| **KR-DETAIL-ENTER** (1280) | One clip, selected. Focus the detail panel's Clip Gain input without changing it. Hold Enter: 1 down + ≥ 20 repeats. | `Clip Gain უცვლელია: 0.0 dB.` is added once, and a separate Enter adds one more. |
| **HD-BLOCKED-HOLD** (regression; 1280) | Round 105's row as written (≥ 40 steps, ≥ 20 wiggles). | The blocked sentence appears ≤ 2 times and there are ≤ 3 added elements in the window, with the same release text as round 105. |
| **SR-REPEAT-SPACE** (regression; 1280) | As in round 105. | The exact text both times, and the second press adds a span. |
| **SR-TEXT-REG** (regression; 1280) | As in round 105. | The same texts as in round 105, the same `<output>`, and one line high. |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no pageerror and no non-noise console error. The cart/connection noise is expected. |
| **G106-3** | anonymous, run alone, after all rows | <ul><li>The header link opens `/studio-lab` with the workspace and the demo badge.</li><li>`/studio/middle-east` shows sign-in and no workspace.</li><li>`/api/studio-token` returns 401.</li><li>The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`.</li></ul> |
| **AN-REVIEW** (offline) | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs k1, k4, k8 and k9 in its own scratch, with its own mutation strings, and gets the same red tests.</li><li>SU1–SU6 are byte-identical to the snapshot.</li><li>Assertions are exact, and the added lines contain no `as`, `@ts-` or `any`.</li></ul> |
| **T106-TARGETED** | `npx vitest run $(cat a-round-106/targeted-list.txt)` | All pass. C re-runs the grep from §1 and reports any missing file. |
| **DOC-092** (offline) | Read doc 092. | <ul><li>l.4 carries the round 106 status.</li><li>The Approach no longer says "always" without the gesture/key qualifier.</li><li>The Mermaid diagram has the gesture and key-repeat branches.</li><li>The changed-files list names SA1–SA7, SU1–SU6 and SK1–SK8.</li><li>The semantics contain the keyboard rule.</li></ul> |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD is `3b6178b`.</li><li>The start state is 3 M + 4 ??, and the end state is the expected **6 M + 4 ??**.</li><li>The frozen list is 535/535, and A's end hashes match.</li><li>Against the snapshots: `ArrangementContext.tsx` changes only in the two helpers and the two interface lines.</li><li>The reducer block (the `gestureCountRef` line through the `useReducer` call) is unchanged.</li><li>Every other changed hunk lies inside the narrow ranges in the Baseline table.</li></ul> |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- **A held arrow stops moving the clip, loop or marker:** a guard around the action instead of the announcement. KR-NUDGE-MOVES, KR-MARKER-FLAG's ArrowRight check, SK7 and k3 cover this.
- **A deliberate second press goes silent** (the GATE96-S2 regression): the "separate press" step of every KR row, SR-REPEAT-SPACE, SU1/SU2 and k8 cover this.
- **The boundary is reached during a hold and nothing is announced** (the rejected rule): KR-NUDGE-MOVES, SK7 and k9 cover this.
- **The pointer coalescing from round 105 regresses:** HD-BLOCKED-HOLD covers this.
- **The ◀/▶ marker buttons, a loop brace drag, a marker drag commit, and the detail panel's Escape** must behave as before. SK tests, KR-MARKER-STEP's separate press, and A's targeted run cover these.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A refusal repeated by a held key is announced once to assistive tech | None consulted. Live's status bar (manual §3.2, captured in `b-round-37/ableton-live-concepts-20261013.txt`) says nothing about screen readers or key repeat. | — | CZABA's own accessibility rule for its browser status line: one held key, one refusal; a deliberate press is announced again. No Ableton claim. | არ ეხება |
| A held arrow keeps nudging while there is room | Not re-checked this round. The nudge behaviour itself is unchanged from the C-verified SRW-14 rounds. | — | Unchanged | არ ეხება (regression only) |

## 4. Report (A)
Write `a-round-106.md` and `a-round-106/a-round-106-summary.json` as you go (the harness writes `a-round-106-result.json`). Include:
- the changed files with their end sha256 (`a-round-106/end-hashes.txt`);
- the sweep table: every keydown handler, whether a repeat can set the same text, and the fix or the reason it is safe;
- the exact commands you ran and their results;
- the fail-before list and the mutation table (k1–k8);
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

A may run its own browser self-check of KR-NUDGE-SNAPOFF in `a-round-106/`. It is A's own check, not C's acceptance.

If you stop early, write a checkpoint with the next step.
