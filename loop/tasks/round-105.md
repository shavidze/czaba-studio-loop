# CURRENT TASK — Round 105: a held drag no longer repeats the same status sentence (A-R104-REPEAT-DRAG) + doc 092 status

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-23 (B planned at 08:16 UTC, `date -u`)
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules take precedence over older text.
- **Previous task:** `tasks/round-104.md` (exact copy of the round 104 task). Rationale: `b-round-104.md`. Decision record: D-29z70 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one Medium bug (a regression the round 104 fix introduced) plus the doc status line of that fix. One owner (A). It completes GATE96-S2; together they are one change set that root publishes after C passes.
  1. **A-R104-REPEAT-DRAG (Medium, a11y + render cost).** Round 104 made every `setStatus(string)` bump `sequence`, even when the text is the same. That was the intended fix for Space twice and Enter twice. But the drag paths call `setStatus(sameText)` on every pointermove (`ArrangementClip.tsx` l.495, 513, 563, 579–581, 611, and the clamped fade readout), and also the marker row, the clip envelope and the lane fader. Now every move replaces the keyed span, and the polite live region announces the same sentence again.
     - **Evidence:** C round 104 measured a blocked drag: 81 pointermoves → 81 added `<span>` nodes, 80 with the identical sentence `გადატანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.` A held fade clamp gave 21 identical `Fade In: 101.352 წმ` spans (`c-round-104/out/blocked-1280x720.json`, `drag-1280x720.json`). Gate 104 **blocked** publication for this reason (`gates/round-104/review.md` #1, score 7/10, "9/10 after the fix").
  2. **GATE104-S3 (housekeeping).** Doc 092 l.4 still says "waiting for C", and its l.60 hands the drag repeat to B as an open problem. Both must describe the round 105 state.
- **Not in this round (still open, not deferred):** GATE104-S2 (the loading text announced once at mount; the reviewer accepted it), GATE103-S1 (conditional), GATE103-S2/S3, A-R103-EW5-TITLE-NIT, the grid/tempo and marker Lows, GATE102-S3/S4, GATE98-S2, R21-I2, SRW-21-PREMOUNT and the SRW-21 mount (auth owner's release), T12, VISUAL-A-OBSIDIAN.
- **Frozen this round:** every app file except the owned ones below, every committed test file, every protected file. `ArrangementClip.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementClipEnvelope.tsx` and `ArrangementLane.tsx` stay frozen; the fix lives in the provider.

## Why this round
- **C round 104: PASS** (`browserVerified=true`, `realVerified=true`), with one Medium bug, A-R104-REPEAT-DRAG, confirmed in the browser.
- **Gate 104: blocked**, head `3b6178b` (`gates/gate-round-104.json`). Nothing from round 104 is published. Its 3 M + 4 ?? stay in the tree, and this round builds on them.
- **C bugs come first.** A-R104-REPEAT-DRAG is the only open C bug. It is a regression in an existing flow, and it blocks publishing GATE96-S2.
- **The regression round is not due yet.** `regression-last.json` is 2026-10-21; B planned this on 2026-10-23 at 08:16 UTC: 2 days, the rule needs 3. **The next B planning on or after 2026-10-24 is the regression round, whatever this round leaves open.**

## Baseline (measured by B, 2026-10-23 08:20 UTC)
- **HEAD `3b6178b758253d5098cea19f07c43e4799cb9299`** (the last publication; gate 104 blocked).
- `git status --short` is **3 M + 4 ??**, the round 104 work:
  - ` M app/components/arrangement/StudioWorkspace.tsx`
  - ` M app/contexts/ArrangementContext.tsx`
  - ` M docs/implementation/2026/quarter-IV/091-studio-export-worker-watchdog.md`
  - `?? app/lib/arrangement/__tests__/status-announcement-ui.test.tsx`
  - `?? app/lib/arrangement/__tests__/status-announcement.test.ts`
  - `?? app/lib/arrangement/status-announcement.ts`
  - `?? docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md`
- **Never revert, stash or re-create the round 104 work.** It is the baseline.
- **Frozen list:** `../tmp/studio-real-loop/b-round-104-r105-tree-sha256.txt`, **537** entries: round 104's 535 plus `StudioWorkspace.tsx` and doc 091 at their round 104 hashes.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-104-r105-tree-sha256.txt`.
- **Snapshots** of the round 104 state: `../tmp/studio-real-loop/b-round-104-r105-snapshots/` (`SHA256SUMS.txt`, 7 files). All LF, CR=0. Fail-before runs against these snapshots, **not** against `3b6178b`.

  | File | sha256 prefix | lines | permission |
  |---|---|---|---|
  | `app/lib/arrangement/status-announcement.ts` | `8befcfa8` | 24 | **owned:** the reducer gains a third parameter (T1). The exports and their names stay. |
  | `app/contexts/ArrangementContext.tsx` | `3b22246a` | 3411 | **owned, narrow:** (a) **move** the one line `const gestureCountRef = useRef(0);` from l.615 to directly above the `useReducer` at l.541; (b) replace the reducer argument `reduceArrangementStatus,` (l.542) with an inline reducer (T2); (c) add the two type imports to the existing `status-announcement` import block (l.134–137). **Nothing else.** |
  | `app/lib/arrangement/__tests__/status-announcement.test.ts` | `d25afddf` | 47 | **owned (round 104's own untracked file):** pass `false` as the new third argument to the existing SA1–SA5 calls (assertions unchanged), and add SA6/SA7. |
  | `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `503b198a` | 315 | **owned (round 104's own untracked file):** add SU5/SU6. SU1–SU4 stay byte-identical. |
  | `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md` | `eaafb193` | 79 | **owned:** l.4, the problem entry at l.60, the testing and TODO sections. |
  | `app/components/arrangement/StudioWorkspace.tsx` | `bfe53dcb` | — | **frozen** (in the list) |
  | doc 091 | `075dbf68` | — | **frozen** (in the list) |

- **Expected end state:** `git status --short` = the same **3 M + 4 ??** paths. No new path.
- **Protected (frozen, never edited; hashes re-checked by B in this tree):**
  - `app/routes/studio.$productId.tsx` (`fa2cf0bc`), `app/routes/api.studio-token.ts` (`13914809`), `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`), `app/components/ui/Modal.tsx` (`741c2341`), `app/lib/arrangement/mp3-encoder.client.ts` (`ddb70919`);
  - the auth files `app/lib/auth.ts` (`56f5b76f`), `app/contexts/AuthContext.tsx` (`bf9ee257`), `app/lib/firebase.client.ts` (`23468664`), `app/types/auth.ts` (`280fe7f2`).
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state.**
  - Never stash, reset, checkout, clean or re-create anything.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run fail-before and mutations in a scratch copy (`a-round-105/mut/`, `node_modules` symlink, Vitest `cacheDir` inside scratch), never in `store/`.
  - Stop and report if HEAD differs, the status differs from the 3 M + 4 ?? above at the start, or a frozen file changed.

## 1. What changes (A)

Read first: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md` (the provider owns the gesture), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/new-test.md`. There are no styling changes.

### T1 — gesture-aware reducer (`status-announcement.ts`)
- **New signature:** `reduceArrangementStatus(previous: ArrangementStatusEntry, next: ArrangementStatusUpdate, gestureActive: boolean): ArrangementStatusEntry`. The parameter is **required**, not defaulted, so a future caller cannot forget it silently.
- **Rules:**
  - **string, `gestureActive === true`, `next === previous.text`:** return **`previous` itself** (no render commit, no span change, no announcement).
  - **string, any other case:** a **new** object `{ text: next, sequence: previous.sequence + 1 }`, as in round 104. Outside a gesture the identical text is still announced again (the GATE96-S2 fix).
  - **function:** unchanged from round 104 (same text → `previous`; otherwise sequence + 1). The flag does not affect it.
- It stays pure: no time, no refs and no globals inside the module. StrictMode may call it twice.
- **Coverage (B checked the source):** the clip move, trim, range and fade drags all start in `beginGesture` → `claimPointerGesture` (`ArrangementClip.tsx` l.332–339, the fade handles at l.929–931). The marker drag (`ArrangementMarkerRow.tsx` l.430), the envelope point drag (`ArrangementClipEnvelope.tsx` l.186) and the lane gestures (`ArrangementLane.tsx` l.512, plus the volume/pan gestures in the provider) also claim. So no frozen file is needed. C verifies the clip paths in the browser; the other paths are covered by the same rule but are not separate rows this round.

### T2 — provider (`ArrangementContext.tsx`, narrow)
- **Move** `const gestureCountRef = useRef(0);` from l.615 to the line directly above `const [statusEntry, setStatus] = useReducer(` (l.541). The l.615 line is removed, so it is declared exactly once.
  - **Why (B probe, `b-round-104/probe/`):** React runs a `useReducer` reducer during the provider's render, at the `useReducer` call. An inline reducer that reads `gestureCountRef` while the `const` is still declared 74 lines below throws `ReferenceError: Cannot access 'gestureCountRef' before initialization` on the first status update. B reproduced this: SU1–SU4 all failed with that error.
  - It is an unconditional hook, so the hook order is the same in every render.
- **Replace the first argument** `reduceArrangementStatus,` with
  `(previous: ArrangementStatusEntry, next: ArrangementStatusUpdate) => reduceArrangementStatus(previous, next, gestureCountRef.current > 0),`
  and add `type ArrangementStatusEntry, type ArrangementStatusUpdate,` to the existing import block from `~/lib/arrangement/status-announcement` (Biome's import order decides the position). The second and third `useReducer` arguments stay byte-identical.
- The dispatch is still named `setStatus` and is still stable. No call site changes, and Biome's `useExhaustiveDependencies` adds **0** warnings (B probe: `biome lint` 0 diagnostics in the owned files).
- **No other line changes.** If something else seems necessary, stop and report to B.

**Recorded semantics (B decision, write them in doc 092):**
- **The flag is read when the reducer runs, which is during the next provider render, not at dispatch time.** An inference, not measured: a string dispatched on the last pointermove and rendered after the release counts as outside the gesture and may bump once. C's browser bound (≤ 2 added spans across a held drag) allows for this.
- **Residual cost:** with `useReducer`, a coalesced update still runs the provider body once (React then bails out: no commit, no consumer re-render). That sits between `3b6178b` (no render at all) and round 104 (a full commit). Do not call it "identical to the baseline".
- **Accepted trade-off (the reviewer's):** the same refusal triggered twice within one gesture is announced once. One gesture, one message.
- **Still announced during a gesture:** a different text (the first blocked sentence, a readout that changes). **Still announced outside a gesture:** an identical text (Space twice, Enter twice on a failed row).

### Tests (owned untracked files only)
**Rules for all tests:**
- Assert exact values (`toBe`, `toEqual`, `toBeNull`).
- No type assertions (no `as`, including `as const`), no `@ts-` directives and no `any`.

**`status-announcement.test.ts`:**
- SA1–SA5 calls gain `false` as the third argument; their assertions stay unchanged.
- **SA6:** same text with `gestureActive = true` returns **the same object** (`toBe(previous)`), sequence unchanged.
- **SA7:** same text with `gestureActive = false` returns a **new** object with sequence + 1 (pins that the flag does not over-coalesce). A different text with `gestureActive = true` also returns a new object with sequence + 1.

**`status-announcement-ui.test.tsx`** (SU1–SU4 byte-identical; reuse the file's own mount helpers):
- **SU5 — same text during a claimed gesture keeps the span.**
  1. Claim a pointer gesture through the public `claimPointerGesture`.
  2. `setStatus('<some exact text>')` once; capture `region.firstElementChild` and `statusSequence`.
  3. `setStatus` the same text twice more: the span is **the same node** and `statusSequence` is unchanged.
  4. Trigger `GESTURE_EDIT_BLOCKED_MESSAGE` twice (`addSourceToActiveTrack` during the gesture): the first shows the text in a new span, and the second keeps **that** span.
  5. Release: the text is the pre-refusal text again (the restore, as in SU4). The restore changes the text through the updater branch, so it is a new span and the sequence grows by 1.
  6. Outside the gesture, set that same text again: it is a new span, and the sequence has grown by exactly the number of announced changes (B's probe: + 3 from step 2).
- **SU6 — a changing readout during a gesture is still announced.** During a claimed gesture, `setStatus('A')`, `setStatus('B')`, `setStatus('A')`: each one is a new span with the exact text.
- B's probe version of SU5 passed against the fix (`b-round-104/probe/`); A writes its own.

**Fail-before** (scratch, against the round 104 snapshots of `status-announcement.ts` and `ArrangementContext.tsx`). B expects:
- **SA6 red** (the round 104 reducer ignores a third argument and returns a new object); **SA7 green**; SA1–SA5 green.
- **SU5 red** at step 3; **SU6 green**; SU1–SU4 green.

Report the exact list and explain any difference. `tsc` against the snapshot would reject the three-argument calls; Vitest does not typecheck, so that is expected and not a difference to report.

**Mutations** (scratch only; record the red tests for each, plus an unmutated control):
- **m6:** the provider passes `false` instead of `gestureCountRef.current > 0` → SU5 red.
- **m7:** the reducer ignores `gestureActive` (round 104 behaviour) → SA6 and SU5 red.
- **m8:** the provider inverts the flag (`gestureCountRef.current === 0`) → B expects SU1 and SU2 red (an identical text outside a gesture is coalesced) and SU5 red (inside the gesture it bumps). The SA tests stay green (they pass the flag directly). Report the exact list.
- **m9:** `gestureCountRef` left at its old line (no move) → report the error. B expects `ReferenceError` in every provider-mounting test.
- The round 104 mutations m1–m4 do not need re-running unless T1 touched their lines.

### Docs (doc 092 only)
- **l.4:** `**სტატუსი:** Round 105 — C-ის შემოწმებას ელოდება (D-29z70). Round 104: C PASS, gate 104 დაბლოკა (A-R104-REPEAT-DRAG).` or the same meaning in the doc's style.
- **The problem entry at l.60** (drag repeats): replace the hand-off to B with the round 105 solution:
  - the gesture-aware reducer, and why it lives next to `gestureCountRef` rather than at the call sites (it also covers the marker row, the envelope and the fader; no frozen file);
  - the moved `useRef` line and the `ReferenceError` it avoids;
  - the four recorded semantics above;
  - the rejected options: call-site `setStatus(() => message)` in `ArrangementClip.tsx` (scattered, easy to forget, needs a frozen file); a `{ text, coalesce }` action (keeps the reducer pure, but `setStatus`'s public type would need a wrapper, and a `useCallback` wrapper gave 29 lint warnings in round 104's probe).
- **Testing and TODO:** add SA6/SA7, SU5/SU6, the fail-before list, m6–m9 and the targeted count; the C rows of round 105; the Tech Lead check R104-T, extended with a held drag.
- Keep the l.59 entry ("every `setStatus(string)` renders the provider") accurate: outside a gesture, yes; during a gesture with the same text, the render bails out.

### Checks A runs (speed rules)
- `npm run typecheck`.
- `npm run lint`, with 0 diagnostics in the owned files.
- `npx biome check <owned code/test files>`, without `--write`.
- **Targeted vitest** (the context change reaches every provider mount):
  - write the list: `grep -rlE "ArrangementProvider|StudioWorkspace|useArrangement\b|status-announcement" app --include=*.test.ts --include=*.test.tsx | sort > ../tmp/studio-real-loop/a-round-105/targeted-list.txt`;
  - run it: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-105/targeted-list.txt)`.
  - Expect **69** files (no new test file). B's probe ran 69 files, 1123/1123 green with the fix and one probe SU5 (round 104 had 1122).
- Do **not** run the full suite or `npm run verify`; the root gate runs them.
- **Code-reviewer:** 5 files change in this round, so run it. Pass its Architecture note through verbatim.

## 2. Acceptance — what C checks (real Chromium)
**Setup for every browser row unless stated:**
- a fresh incognito context on `/studio-lab` at the stated viewport;
- Decline consent, then wait for the library to settle;
- C installs a `MutationObserver` on `[data-testid=arrangement-status]` (`childList`, `subtree`, `characterData`). For every record it logs the type, a timestamp and the added nodes' text. C also keeps a JS reference to the `<output>` node and checks whether it was ever replaced.
- A capture-phase `pointermove` listener on `window` counts moves.

| ID | Steps | PASS when |
|---|---|---|
| **HD-BLOCKED-HOLD** (primary; 1280 and 1440) | C's round 104 repro: focus the Middle East row and press Enter twice (2 clips back to back on the music lane), then Fit. Real mouse: press on the second clip's title strip, move left onto the first clip in ≥ 40 steps, then hold at the blocked spot with ≥ 20 one-pixel wiggles, then release. | <ul><li>The blocked sentence `გადატანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.` is added to the region **at most twice** across the whole drag (record the exact count; B expects 1).</li><li>**Counting window:** from the first added node with the blocked sentence through the release text, inclusive. Inside it: added nodes with the blocked sentence **≤ 2**, and **all added element nodes ≤ 3** (blocked sentence, at most one late bump on the last move, release text), while pointermoves in the window ≥ 40. Record all three counts and every added text in order.</li><li>After the release, the region shows the release text, and C records it verbatim (round 104 saw `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`).</li><li>The `<output>` is the same node throughout, `aria-live="polite"`, with exactly one element child at every sample.</li><li>The clips did not overlap, and there is no new history entry (Undo-button state unchanged, or as round 104 recorded).</li><li>Take a screenshot.</li></ul> |
| **HD-FADE-CLAMP** (1280) | 1 clip (Middle East). Real mouse drag of the fade-in handle far beyond its limit, so that the readout clamps; hold at the clamp with ≥ 20 wiggles; release. | <ul><li>**Counting window:** from the first added node with the clamped readout (round 104: `Fade In: 101.352 წმ`; record it) up to, but not including, the first node added after pointerup. Inside it: **added element nodes ≤ 2** (the clamped readout, at most one late bump), while pointermoves in the window ≥ 20. Record the counts, every added text in order, and the release text separately.</li><li>During the move toward the clamp, distinct readouts are still added (record the count; > 1).</li><li>The fade ends at its clamp with exactly one new history entry, and Ctrl+Z restores fade-in 0.</li><li>No pageerror. Report only: the longest long task.</li></ul> |
| **HD-READOUT-CHANGING** (1280) | 1 clip. Drag the fade-in handle slowly within its range (≥ 20 moves, no clamp), release. | Each distinct readout text appears in the region (added element nodes ≥ the number of distinct readout texts seen − 1, and ≤ pointermoves + 2). The final fade equals the last readout. |
| **SR-REPEAT-SPACE** (regression; 1280) | As in round 104: empty project, focus on `body`, Space, wait 500 ms, Space. | The exact text both times, the second press adds a span with that text, the `<output>` is the same node, and nothing plays. |
| **SR-REPEAT-FAILED-ROW** (regression; 1280) | As in round 104: `context.route` aborts `**/videos/hero/hero-music.mp3`; keyboard to the failed row; Enter, 500 ms, Enter. | The exact failed text both times, the second Enter adds a span with that text, and 0 clips are added. |
| **SR-TEXT-REG** (1280) | Middle East → Enter; Fit; select the clip, Delete; Ctrl+Z. | <ul><li>Each status text matches the string the source produces for that action.</li><li>The `<output>` is the same node with exactly one element child after each action (this replaces round 104's SR-REGION-STABLE, which assumed Space play/pause sets a status; it does not).</li><li>One line high at 1280; record the rect.</li></ul> |
| **PX-NET** | all sessions | 0 page-originated requests to `/api/studio-token`, R2, `/api/recording-*` or `/api/download`, and 0 `Authorization` headers. |
| **REG-HYD** | all sessions | No hydration warning, no pageerror and no non-noise console error (the cart/connection noise is expected). The aborted hero-music request may log one network error; record it verbatim. |
| **G105-3** | anonymous, run alone, after all rows | <ul><li>The header link opens `/studio-lab` with the workspace and the demo badge.</li><li>`/studio/middle-east` shows sign-in and no workspace.</li><li>`/api/studio-token` returns 401.</li><li>The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud); list it under `blocked`.</li></ul> |
| **AN-REVIEW** (offline) | Review A's tests. | <ul><li>The fail-before list matches §1, or A explains the difference.</li><li>C re-runs m6 and m7 in its own scratch, with its own mutation strings, and gets the same red tests.</li><li>SU1–SU4 are byte-identical to the snapshot.</li><li>Assertions are exact, and the added lines have no `as`, `@ts-` or `any`.</li></ul> |
| **T105-TARGETED** | `npx vitest run $(cat a-round-105/targeted-list.txt)` | All pass. C re-runs the grep from §1 and reports any missing file (expect 69). |
| **SOURCE-UNCHANGED** | start and end | <ul><li>HEAD is `3b6178b`, with the same 3 M + 4 ?? paths.</li><li>The frozen list is 537/537, and A's end hashes match.</li><li>Against the snapshot, the `ArrangementContext.tsx` diff touches only the `status-announcement` import block, the moved `gestureCountRef` line (removed at l.615, added above the `useReducer`) and the reducer argument. Every `setStatus(` line is unchanged.</li><li>Against the snapshot, SU1–SU4 in the UI test file are unchanged.</li></ul> |

Gate rows (C does not claim them; list them under `gate`): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

**Neighbouring behaviour that could break:**
- **Over-coalescing:** an identical text outside a gesture goes silent again (the GATE96-S2 regression). SR-REPEAT-SPACE, SR-REPEAT-FAILED-ROW and SU1/SU2 check this.
- **A changing readout goes silent** during a gesture. HD-READOUT-CHANGING and SU6 check this.
- **The post-gesture restore** stops working or starts announcing. SU4, SU5 step 5 and HD-BLOCKED-HOLD's release text check this.
- **A render-time crash** (the TDZ). Every provider-mounting test and every browser row would fail.
- **Drag results** (overlap, history entries, fade clamp). HD-BLOCKED-HOLD and HD-FADE-CLAMP check them.

## 3. Ableton correspondence
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| A status message repeated during one drag is announced once to assistive tech | None consulted. Live's status bar (manual §3.2, captured in `b-round-37/ableton-live-concepts-20261013.txt`) says nothing about screen readers. | — | CZABA's own accessibility rule for its browser status line: one gesture, one message per distinct text. No Ableton claim. | არ ეხება |

## 4. Report (A)
Write `a-round-105.md` and `a-round-105/a-round-105-summary.json` as you go (the harness writes `a-round-105-result.json`). Include:
- the changed files with their end sha256 (`a-round-105/end-hashes.txt`);
- the exact commands you ran and their results;
- the fail-before list and the mutation table (m6–m9);
- the code-reviewer findings with your disposition, and its Architecture note verbatim;
- the exact next C checks.

A may run its own pre-edit/post-edit browser check of HD-BLOCKED-HOLD in `a-round-105/`. It is A's own check, not C's acceptance.

If you stop early, write a checkpoint with the next step.
