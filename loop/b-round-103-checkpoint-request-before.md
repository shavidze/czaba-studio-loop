# Request to root: bounded frontend-architect checkpoint at the SRW-20 boundary (q14)

From: B · Date: 2026-10-22 · Status: **requested, non-blocking**
Method: `store/.claude/references/architecture-checkpoint.md` (read-only frontend-architect). For each question, give keep or extract, the value, the risk, and at most three sentences.

## Why now
- SRW-20 (export completeness) is complete. All stages passed C with browser evidence, the last being 3b-2: C round 91 PASS, `browserVerified=true`, gate 91 published as `77cd5b6`.
- `b-round-83-checkpoint-request.md` promised the formal request at this boundary. Root has not answered q1–q14 yet.
- Round 92 (SRW-21 stage 1) touches `ArrangementContext.tsx` only at the status initializer, the load-effect status and the three download names. It does not wait for this answer.

## Questions (inputs already on file)
- **q1–q13:** see `b-round-78-checkpoint-request.md` (SRW-16 snap entry points, row focus, track selection hook, volume state machine) and `b-round-83-checkpoint-request.md` (fades helpers, export dialog axes).
- **q14 — export orchestration (SRW-20 boundary):**
  - **(a)** Keep the export orchestration in `ArrangementContext.tsx` (`exportWav` l.2674–2749, `exportMp3` l.2751–2954, `exportAbortRef`, cancel, the unmount abort), or extract it into a `useArrangementExport` hook or a pure `lib/arrangement/export-orchestration.ts`? Acceptance for an extraction: CU1–CU9, EC1–EC4, TR1–TR6, MX*, PU* and EW* unchanged and green, and an identical `useArrangement()` surface.
  - **(b)** Keep or extract `useExportDialogFocus` from the four focus effects in `ArrangementExportDialog.tsx`.
  - **(c)** Where should `dialog-tab-stops.ts` live?
  - **(d) New from round 91:** the gate-91 reviewer suggests exporting the user-facing export message constants from one module, so tests import them instead of copying them. A's round-91 reviewer counted up to four coordinated edits per wording change (component/context plus `export-mp3`, `export-progress-ui`, `export-range-ui`). Keep or extract? Note: C's exact-text acceptance rows must keep literal strings in C's own harness either way.
  - **(e) Shared UI test harness (ARCH (c)):** round 92 adds a fifth copy of the workspace jsdom stubs (`purchased-collection-ui.test.tsx`). Should it be a shared `__tests__/harness/` module now?

## What B does without an answer
B schedules no extraction. Any approved change becomes one separate B task with one owner and behaviour-preserving tests. The Lows batch and the regression round do not wait for this answer.

## Addendum — B round 93 (2026-10-23)
- **(g) ARCH-R93-TEST-HARNESS** (gate 93 reviewer + A round 93 reviewer, Signal 3): every new arrangement UI test copies ~80 lines of audio fakes plus the provider/dialog mount helper (`class FakeAudioBuffer` is in 61 files under `app/lib/arrangement/__tests__/`). Proposal: one shared non-test support module for the fakes, the provider mount and `live(api)`; test files only; existing tests migrate only when their region is next touched. Question for the checkpoint: keep or extract, and where it should live (a `*.test.*` file must not be imported). Non-blocking; not scheduled.

## Addendum — B round 94 (2026-10-23): re-sent to root
- **(h) ARCH-R94-LOAD-EFFECT** (gate 94 reviewer Signal 4 + A round 94 reviewer Signal 3): the collection load effect in `app/contexts/ArrangementContext.tsx` l.3000–3051 was changed in rounds 92, 93-prep and 94. Each change copied a ~300-line provider harness (`collection-load-status.test.tsx`). Reviewer verdict: keep it for now, because status and loading share one abort lifecycle. Proposal: if SRW-21 adds more load or swap rules, move the per-run bookkeeping (pending/failed count, status choice) into a pure `lib/arrangement` helper with unit tests. The effect, refs, abort and `useArrangement()` would stay unchanged.
- **Why now:** two consecutive structural signals on the same owner (R93 harness, R94 load effect) meet the "accumulated risk on one owner" trigger in `agent-workflow.md`. B asks root for one bounded read-only frontend-architect checkpoint per `store/.claude/references/architecture-checkpoint.md` on (g) and (h) together, plus (f) if convenient. The output should be keep or extract, the value, the risk, and at most three sentences each.
- **Not blocking:** round 95 (`app/data/studio-lab-demo.ts`, `ArrangementContext.tsx` frozen) and the regression round proceed without the answer. An approved extraction becomes one separate B task with one owner and behaviour-preserving tests.

## Addendum — B round 96 (2026-10-23)
- **(i) ARCH-R96-REFUSAL-MAPPING** (A round 96 reviewer + gate 96 reviewer, independently, Signal 3): the library refusal texts in `app/contexts/ArrangementContext.tsx` (l.1204–1208, l.1317–1325, l.1391 at `ce44036`) were changed in rounds 95 and 96. Each change needed a full provider mount with a copied audio fake. Both reviewers say keep for now. Proposal: a pure `librarySourceRefusalText(source, state, mode)` in `app/lib/arrangement/` with plain unit tests; the callbacks stay in the context; FS1–FS8 and `grid-snap-loop-drop.test.tsx` l.541–547 stay green unchanged; `useArrangement()` keeps its shape. Value: low to medium.
- **(g) gets one more data point:** the round 96 test copied `FakeAudioContext` and the clock again (gate 96 "Test fixtures" note).
- **Still non-blocking.** (g), (h) and (i) all concern `ArrangementContext.tsx` and its test harness, the same owner, so one bounded read-only checkpoint answering all three is the request. Round 97 (export dialog footer Lows) and the regression round go ahead without the answer.

## Addendum — B round 97 (2026-10-23)
- **(j) ARCH-R97-EXPORT-FOOTER-KEYBOARD** (gate 97 reviewer, Signal 3, verdict keep): `ArrangementExportDialog.tsx` l.484–571 (the footer: focus and keyboard) was changed by doc 078 and doc 085. GATE89-S4 and GATE89-S6 are planned for the same region. The reviewer proposes one checkpoint after the Export Lows: is it worth gathering the dialog's keyboard and focus rules (initial focus, focus restore, Tab groups, repeat guard) in one place, with a shared test harness? Acceptance: HE1–HE7 and the existing focus tests keep their behaviour. "Not worth a refactor now" is a valid answer.
- **(g) gets another data point:** A's round 97 reviewer counts the fake AudioContext, encoder and `URL.createObjectURL` setup copied into 9 test files. Round 98's new test is likely to copy part of it again.
- **Still non-blocking.** Round 98 (the toolbar Export guard, `ArrangementTransport.tsx`) and the regression round go ahead without an answer. (j) fits best after the remaining Export Lows. (g)–(i) are still one bounded read-only checkpoint request.

## Addendum — B round 98 (2026-10-23)
- **(k) held-key guards are spreading (A round 98 reviewer + gate 98 reviewer, Signal 3, verdict keep).** The "ignore a repeated Enter" rule is now at `ArrangementExportDialog.tsx` l.541–545 (round 97) and `ArrangementTransport.tsx` l.249–253 (round 98). Round 99 adds it at three more places: the library row (`ArrangementLibrary.tsx` l.242–247), the global Enter (`StudioWorkspace.tsx` l.1960–1968) and ＋ დამატება (`ArrangementLibraryPreview.tsx` l.304–311). After round 99 the question is: keep five inline guards, or add a small unit-tested `isRepeatedEnter(event)` helper in `app/lib/arrangement/`? Both reviewers say keep for two sites. Five sites is the new data point.
- **(g) another data point:** the round 98 test copied the audio, ResizeObserver and clock fakes again (about 100 lines; the gate 98 reviewer counts 10 files). The gate 98 reviewer proposes one fixture under `app/lib/arrangement/__tests__/`, used by the new file and at least two existing Studio UI tests, with test counts and render-budget unchanged.
- **Trigger, not scheduled:** the gate 98 reviewer suggests the checkpoint after the Export Lows. B keeps that order: round 99 (held Enter add), then the footer Lows, then this checkpoint is due. Nothing here blocks round 99 or the regression round.

## Addendum — B round 99 (2026-10-23): checkpoint requested at the SRW-12 held-Enter boundary
- **(l) The repeat-Enter guard is at 6 sites after round 100** (gate 99 reviewer Signal 3, verdict keep). Three are the same inline button guard: `ArrangementTransport.tsx` l.250, `ArrangementLibraryPreview.tsx` l.308 (＋) and `ArrangementExportDialog.tsx` l.542. Round 100 adds a fourth on ▶ მოუსმინე. The other two are `!event.repeat` checks in `StudioWorkspace.tsx` l.1967 and `ArrangementLibrary.tsx` l.245. The reviewer proposes one bounded task: move the button guards into a small helper in `app/lib/arrangement/`, with one focused unit test, and keep the HA5/HA6, HT1–HT3 and Export tests unchanged. Value low, risk low.
- **(g) gets another data point:** A's round 99 reviewer counts the ~60th copy of the audio/DOM fake harness, and the rAF behaviour already differs between files. Round 100 deliberately appends to `library-preview.test.tsx` instead of adding a new copy.
- **Request to root:** round 100 closes the held-Enter family on the SRW-12 library panel, which is a feature boundary. B asks for one bounded, read-only frontend-architect checkpoint (`store/.claude/references/architecture-checkpoint.md`) on (g) and (k)/(l) together: keep or extract, cost, risk, at most three sentences each. "Not worth it now" is a valid outcome.
- **Not blocking.** Round 100, the regression round due from 2026-10-24 and the Export Lows go ahead without an answer. An approved change becomes its own B task with one owner and behaviour-preserving tests.

## Addendum — B round 100 (2026-10-23)
- **(m) Gate 100 reviewer, Signal 3 (verdict keep):** the held-Enter guard is inline at 6 places in 4 files:
  - `ArrangementLibraryPreview.tsx` l.293 and l.312;
  - `ArrangementTransport.tsx` l.249;
  - `ArrangementExportDialog.tsx` l.541;
  - `ArrangementLibrary.tsx` l.242;
  - `StudioWorkspace.tsx` l.1961.
- **Reviewer proposal:** one `preventRepeatedEnterClick(event)` in `app/lib/arrangement/`, used only by the 4 native `<button>` sites. The library row and the global Enter keep their `!event.repeat` pattern, because they have a different contract. Acceptance: HT1–3, HA6 and TH4 unchanged and green, and C reruns HOLD-* and EXPORT-REG. Cost low.
- **Round 101** (GATE97-S4) makes the 4 button guards textually identical, so the extraction would be a pure move.
- **(g) another data point:** rounds 100 and 101 append to existing test files instead of adding harness copies.
- **Request to root:** after round 101 closes the Export footer Lows, which is the trigger (j) named, B asks for **one bounded, read-only frontend-architect checkpoint** (`store/.claude/references/architecture-checkpoint.md`) on (g), (j), (k)/(l)/(m) together: keep or extract, cost, risk, at most three sentences each. "Not worth it now" is a valid outcome.
- **Not blocking:** the regression round (due from 2026-10-24) and the remaining Lows go ahead without an answer. An approved change becomes its own B task with one owner and behaviour-preserving tests.

## Addendum — B round 101 (2026-10-23): trigger (j) met, checkpoint requested now
- **(n) Gate 101 reviewer, Architecture note:**
  - **Signal 2 (keep, cost low):** `ArrangementExportDialog.tsx` l.267 `pb-0` is a second dependency on `ModalBody`'s internal padding, next to the footer's `-mx-8`/`px-8`. Proposal for when `Modal.tsx` is unfrozen: a `className`/padding override on `ModalBody` or a `ModalStickyFooter` slot. Acceptance: FS1, FT1 and the focusin tests stay green, and STRIP-1280/1440 stay at 0 px. Backlog: ARCH-R101-MODALBODY-PADDING-SLOT.
  - **Signal 3:** the footer region changed in rounds 87/88, 97 and 101. Round 102 (D-29z67) touches it again: the focusin guard and the progress label. Each change is small.
- **Trigger:** (j) said "after the Export Lows". Round 101 closed the footer Lows (C PASS, published `56231c0`).
- **Request to root:** **one bounded, read-only frontend-architect checkpoint** (`store/.claude/references/architecture-checkpoint.md`) on these items together:
  - (g)/ARCH-R93-TEST-HARNESS: the shared jsdom audio/DOM fixture;
  - (j)/ARCH-R97 + ARCH-R88: the Export dialog keyboard/focus rules (initial focus, restore, Tab groups, repeat guard, focusin guard);
  - (k)/(l)/(m): the `preventRepeatedEnterClick` helper for the 4 button sites;
  - (n): the `ModalBody` padding coupling.

  For each: keep or extract, cost, risk, at most three sentences. "Not worth it now" is a valid outcome.
- **Not blocking:** round 102 and the regression round (due from 2026-10-24) go ahead without an answer. An approved change becomes its own B task, with one owner and behaviour-preserving tests.

## Addendum (o) — B round 102 planning, 2026-10-23
- **New signal (gate 102 and A round 102 Architecture notes):** the Export dialog focus guard (`ArrangementExportDialog.tsx` l.217–246) changed in rounds 83, 88/89 and 102. Reviewer verdict: keep.
  - Proposal 1: move the arithmetic into a pure `lib/arrangement` function.
  - Proposal 2: fold the dialog's four focus effects into one dialog-local hook.
  - Acceptance for either: FT4, FC1–FC4 and FA1 stay unchanged and green.
  - Backlog: ARCH-R102-FOOTER-GUARD-PURE-FN.
- **Please add this to the same bounded read-only checkpoint, under (j)/(n):** keep or extract, cost, risk, at most three sentences.
- **Still non-blocking.** Round 103 does not touch the dialog.
