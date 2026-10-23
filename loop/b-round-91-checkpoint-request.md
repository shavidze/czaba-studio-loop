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

## Addendum (p) — B round 103 planning, 2026-10-23
- **New signal (gate 103 Architecture note, Signal 3):** the `exportMp3` cancel/abort ordering in `ArrangementContext.tsx` needed new microtask-sensitive tests in several rounds (CU4 in round 90, CU10 in round 103).
  - Reviewer proposal: a `docs/technical/` note on the export pipeline abort contract (who removes which listener, where `signal.aborted` is checked), with no code change; CU1–CU10 stay unchanged and green.
  - Backlog: ARCH-R103-EXPORT-ABORT-CONTRACT-DOC.
  - Signal 4 (`export-wav.client.ts` `detachWorker` lifecycle): the reviewer says **keep**; no request.
- **Please add this to the same bounded read-only checkpoint:** keep or extract, cost, risk, at most three sentences.
- **Still non-blocking.** Round 104 changes the status state in `ArrangementContext.tsx` (l.535 only, plus the value field) and does not touch the export pipeline.

## Addendum (q) — B round 105 planning, 2026-10-23
- **New signal (two independent reviewers, the same owner `ArrangementContext.tsx`):**
  - **A's round 105 reviewer:** the status reducer now reads the gesture ref at render time. The proposal is a status action that records the gesture flag at dispatch time.
  - **The gate 105 reviewer:** let each `setStatus` call carry its repeat intent, for example `announceStatus` vs `setStatus`, or a `{ text, repeat }` action. Then one rule covers the pointer drag, the held key and deliberate double presses.
- **Both verdicts are keep for now.** Round 106 fixes the held-key case at the key handlers (the `keyRepeat` option) without changing the public `setStatus` type.
- **Backlog:** ARCH-R105-STATUS-INTENT.
- **Please add this to the same bounded read-only checkpoint:** keep or extract, cost, risk, at most three sentences. "Not worth it now" is a valid answer.
- **Still non-blocking.**

## Addendum (r) — B round 106 planning, 2026-10-23
- **New signal (gate 106 reviewer Architecture note, Signal 1; A's round 106 reviewer said the same):** suppressing a repeated refusal on key auto-repeat is done three ways: the provider's updater form (`stepLoopRange`, `nudgeSelectedClip`), a component comparison with `status` (`StudioWorkspace.tsx`, `ArrangementMarkerRow.tsx`), and skipping the Enter repeat outright (`ArrangementDetailPanel.tsx`).
  - Proposal: an internal `requestStatus(message, { keyRepeat })` next to `setStatus` (gate 106) or `announceRefusal(text, { keyRepeat })` (A's reviewer), without changing `useArrangement()`; SK1–SK12 and SU1–SU6 unchanged as acceptance.
  - Related: GATE106-S1, the reducer reads `gestureCountRef` at render time (record the flag at dispatch time).
  - Backlog: merged into ARCH-R105-STATUS-INTENT; GATE106-S1 is its own Low.
- **Both reviewers say keep for now.** Round 107 adds no new style: it uses the existing `!event.repeat` guard and the existing updater form.
- **Please add this to the same bounded read-only checkpoint:** keep or extract, cost, risk, at most three sentences. Still non-blocking.

## Addendum (s) — B round 108 planning, 2026-10-23: bounded request for one shared guard (ARCH-R107-SHARED-ENTER-GUARD)
- **Trigger:** accumulated risk on one class. Gate 107's reviewer (Signal 3) and A's round-107 reviewer both flag the inline `if (event.key === 'Enter' && event.repeat) event.preventDefault();`.
  - It is now copied on 9 buttons in 5 files: MarkerRow ×3, DetailPanel ×2, Transport ×1, LibraryPreview ×2, ExportDialog ×1.
  - Round 108 adds 5 more in `ArrangementTransport.tsx` (Undo, Redo, ⌫, ↩ Zoom, Fit), because the focus-handoff fix needs them.
  - About 15 toolbar buttons still lack it. The strongest is the transport Loop, which has the same toggle+history bug Ctrl+L had.
- **Question for the read-only frontend-architect:**
  - Keep the guard inline, or extract one exported `preventRepeatedEnterActivation(event)` in `app/lib/arrangement/`, applied explicitly at each call site? The reviewer prefers this over a global capture listener.
  - Answer in the usual form: keep/extract, cost, risk, at most three sentences.
- **Invariants for any extraction:**
  - no `stopPropagation`; Space untouched;
  - gesture lifecycle, Undo/Redo and the `useArrangement()` shape unchanged;
  - the shortcuts Ctrl/Cmd+Z/Y and +/− keep repeating.
  - **Tests:** the HE pattern per button, plus one Chromium probe asserting click count 1 for 1 keydown + 5 repeats.
- **Scheduling:** round 108 is not blocked. The held-Enter toolbar sweep (A-R107-SWEEP-HELD-ENTER-TOOLBAR, GATE107-S1) is planned after root records the checkpoint result. If no result arrives by the time that sweep is next in order, B plans it with the inline convention and records that.

## Addendum (t) — round 108 result (B, round 109 planning, 2026-10-23)
- **Source:** the gate-108 reviewer Architecture note (`gates/round-108/review.md`, Signal 4, verdict keep) and the A round-108 reviewer note (Signals 3 and 4, verdict keep). Both are signals, not tasks.
- **What it adds to (s):**
  - `ArrangementTransport.tsx:75-107` now holds focus-handoff state: three partner refs, one handoff ref and a deps-free layout effect.
  - The repeated-Enter guard is now inline in Transport (Undo/Redo/⌫/↩ Zoom and Export) and DetailPanel (two places).
  - Separate handoff mechanisms exist in Transport, `ArrangementDetailPanel.tsx:394-404`, `ArrangementLane.tsx:720-723` and `ArrangementMarkerRow.tsx:172-191`.
- **New evidence:** a B probe in real Chromium (`b-round-108/probe/lib-focus-probe-result.json`) confirms the same focus-loss class on Library ◀/▶/× (B-R108-LIB-FOCUS-LOSS, Medium). These are self-**unmounting** buttons, not self-disabling ones.
- **Question:** the same as (s), widened by one clause. Should a shared `preventRepeatedEnter` util and a small local "self-disabling or self-unmounting focus handoff" convention (not a generic hook) cover Transport, DetailPanel and Library? Both reviewers advise against a generic focus-handoff hook. Answer in the usual form: keep/extract, cost, risk, at most three sentences.
- **Scheduling:** non-blocking. B-R108-LIB-FOCUS-LOSS is planned after the regression round. If no checkpoint result has arrived by then, B plans it with the inline convention used in round 108 and records that.

## Addendum (u) — round 109 result, round 110 plan (B, round 110 planning, 2026-10-23)
- **Status:** no checkpoint result from root for (s)/(t) has arrived. As announced in (t), round 110 (B-R108-LIB-FOCUS-LOSS) uses the **inline convention**: a local arm ref + one deps-free layout effect in `ArrangementLibrary.tsx`, and a local copy of the Enter-repeat guard. No extraction is scheduled. Signal id: ARCH-R110-FOCUS-HANDOFF-THIRD-FILE.
- **What it adds:** the arm-ref + layout-effect mechanism now exists in a third component (Transport, DetailPanel, Library); the repeat guard gains three more inline call sites (◀, ▶, ×).
- **Gate 109 Architecture note (Signal 2, verdict keep):** the new `app/lib/ssr/` NUL filter is stateless; remove it when react-dom is upgraded (ARCH-R109-NUL-FILTER-REMOVAL). No question for the architect.
- **Question unchanged from (t):** keep inline, or extract a shared `preventRepeatedEnter` util plus a small local "self-disabling or self-unmounting focus handoff" convention? Usual form: keep/extract, cost, risk, at most three sentences. Non-blocking.

## Addendum (v) — round 110 result, round 111 plan (B, round 111 planning, 2026-10-23)
- **Status:** still no checkpoint result from root for (s)/(t)/(u). Round 111 (C-R110-01) uses the same inline convention, this time on the workspace side: one arm ref in `returnFloatingVideo` and one deps-free layout effect in `StudioWorkspace.tsx`, next to the existing `pendingRowFocusRef` effect.
- **What it adds:** a fourth focus-rescue site. Both round-110 reviewers (A's `code-reviewer` and the gate-110 reviewer) said **keep inline**.
  - They proposed `useFocusHandoffAfterCommit` / `useFocusHandoff(partnerRefs)` in `app/hooks/` plus a shared `preventRepeatedEnterKeyDown`, with a required "the action took effect" check. It would migrate Transport and Library with their existing tests unchanged.
  - Transport hands off only after `source.disabled`; Library checks nothing. That difference must be settled before any extraction.
  - Gate-110 Signal 3: the recurring root cause is the workspace's Enter-on-BODY contract, which is the user's question B-R107-ENTER-ON-BODY.
- **Question (narrowed):** keep the four inline sites, or extract one hook with an explicit "took effect" predicate? Usual form: keep/extract, cost, risk, at most three sentences. **Non-blocking:** the cloud measurement round and T12 do not wait for it.

## Addendum (w) — B round 112 planning, 2026-10-23 (round 111 reviewers)
- **Signal:** ARCH-R111-FOCUS-OWNERSHIP. The library/video focus handoff changed in rounds 107, 108, 110 and 111. The armed-ref + deps-free layout-effect pattern now lives in `StudioWorkspace.tsx` (twice: `pendingRowFocusRef`, `pendingLibraryRailFocusRef`), `ArrangementLibrary.tsx` and `ArrangementTransport.tsx`.
- **Reviewers:** both say keep inline. Value of extraction now: low. Risk to the commit-order invariants that rounds 110/111 confirmed in Chromium: medium.
- **Two proposals:** a `useArmedFocusRescue` hook (A's reviewer), or one checkpoint on who owns focus handoff across Library, VideoDock and Workspace, covering docs 093/095/096 (gate-111 reviewer). Acceptance for either: the VR tests and the round-110 handoff tests stay unchanged and green, and the `useArrangement()` shape is unchanged.
- **Question:** same as (v), widened to ownership: keep, extract a hook, or move ownership. Usual form. **Non-blocking:** the round-112 measurement round and T12 do not wait for it.

## Addendum (x) — B round 113 planning, 2026-10-23 (round 113 reviewers; phase-1 boundary re-request)
- **Signal:** the gate-113 reviewer's Signal 3. The Pan gesture region in `ArrangementLane.tsx` l.314–401 (blur suppression, drag cleanup, draft state, and since round 113 a merged ref) has changed in several rounds.
- **Proposal:** `useTrackPanFader(track)` → `{ binding, panDraft, sliderRef }`, owned by `ArrangementLane` plus the new hook. Acceptance: `pan-release-recovery`, `fader-click`, `fader-guards`, `fader-focus-order` and `fader-touch` stay unchanged and green.
- **Reviewers' view:** value medium; risk in the gesture timing. Worth doing only if Pan is touched again, which T12 stage 3 (Track Volume in dB, Shift fine on the mixer faders) may do. Both reviewers keep Signal 4 (the touch listener in `useRelativeFaderDrag`).
- **Question:** keep, or extract before stage 3? Usual form: keep/extract, cost, risk, at most three sentences.

## Addendum (y) — B round 113 planning, 2026-10-23 (T12 stage 1)
- **Signal:** ARCH-R81-VOLUME-STATE-MACHINE said "extract only if a third target kind arrives". Round 114 (T12 stage 1) lets A add clip gain either as a third `MixVolumeTarget` kind `'clip'` or as a Master-style pair (D-29z79 R4). T12 stages 2–3 add multi-clip gain and dB track/group volume on the same machine.
- **Question:** after round 114's C PASS, should the volume preview/commit/cancel machine move to a pure `lib/arrangement` module before stages 2–3, or stay in `ArrangementContext`? Usual form.
- **Phase boundary:** phase 1 is complete-for-gate at this planning, which is the feature boundary the workflow names. This is the **one re-request** of the pending checkpoint: `b-round-78`, `b-round-83` and this file, addenda (a)–(y). **Non-blocking:** T12 stage 1 proceeds now.

## Addendum (z) — B round 114 planning, 2026-10-23 (round 114 reviewers; answers which branch of (y) was taken)
- **Fact:** round 114 took the Master-style pair (not a third `MixVolumeTarget` kind). `ArrangementContext` now has three pending-preview machines (Volume, Master, Clip Gain); the flush trio is wired at about 10 sites (gate review: l.1154-1155, 2067-2068, 2081-2082, 2298-2299, 2398-2399, 2594-2595, 2652, 2733-2734, 2770-2774, 2864-2865 at `38c0e21`). `useRelativeFaderDrag` changed in rounds 113 and 114 (frozen in round 115).
- **Proposal (both reviewers, "after T12 stage 2"):** one tagged `pendingPreviewRef {kind, key, before, label}` + one `flushPendingPreviews()`, owner `ArrangementContext` only. Acceptance: master-ui, volume, pan, clip-gain-fader and clip-gain-multi tests unchanged and green; an m6-style mutation (a removed flush) covered; `useArrangement()` shape unchanged.
- **Reviewers' view:** keep for now; cost medium (n² wiring per new preview kind); risk: gesture lifecycle crosses the context boundary if extracted outward.
- **Question:** after round 115 (stage 2) closes and before stage 3 (Track Volume dB, which touches the Volume machine), merge in place, extract, or keep? Usual form: keep/extract, value, risk, at most three sentences. B sends the bounded request to root at that planning. **Non-blocking** for round 115.

## Addendum (aa) — B round 115 planning, 2026-10-23 (FOCUSED REQUEST TO ROOT: stage 2 closed)
- **Trigger:** T12 stage 2 is C PASS and published (`d5de68f`). This is the point that (z) and `b-round-114.md` §6 named for the request. Root: please run the read-only frontend-architect per `store/.claude/references/architecture-checkpoint.md` on these three bounded questions only (the older addenda stay open, but these are the ones with a pending T12 dependency):
  1. **(z) pending-preview machines:** Volume / Master / Clip Gain in `ArrangementContext.tsx` (Clip Gain region l.2778–3015 at `d5de68f`, now with member-set key `clipGainMemberIdsRef`). Merge in place into one tagged `pendingPreviewRef` + `flushPendingPreviews()` (or a `usePendingPreview` controller owned by the context), or keep? Acceptance if extract/merge: `useArrangement()` shape unchanged; clip-gain-fader, clip-gain-multi, pending-status, master-ui, track-group-mix-ui green unchanged; a removed-flush mutation is caught.
  2. **Clip Gain panel block:** `ArrangementDetailPanel.tsx` l.~400–615 has single/multi branches in 8 handlers (rounds 114, 115). Both round-115 reviewers propose, after T12 stage 4, `ArrangementDetailClipGain` / `ClipGainControls` + `useClipGainTargets` (captured ids, anchor, routing; single clip = one-member group). Keep until stage 4, or schedule earlier?
  3. **(x) `useTrackPanFader`** in `ArrangementLane.tsx`: round 116 (stage 3a) edits only the Lane Volume fader, not Pan; stage 3b adds Shift fine to the Lane/Group/Master faders. Extract the Pan region before 3b, or keep?
- **Round 116 does not touch the pending machines.** The dB conversion is UI-only (`track-volume-db.ts` + `ArrangementLane.tsx`); `ArrangementContext.tsx` is frozen in that round. So no answer is needed before round 116; an answer before stage 3b or stage 4 is useful.
- **Usual form:** for each question keep/extract, value, risk, at most three sentences. **Non-blocking**; the next planning is the regression round anyway.

## Addendum (ab) — B round 116 → 117 planning (2026-10-23)
- **Trigger:** the round-116 code-reviewer Architecture note, Signal 4 (`a-round-116.md`, Code review). The lane Volume fader keeps its own capture of the exact linear start value (`volumeGestureStartRef` in `ArrangementLane.tsx`). It does this because `useRelativeFaderDrag` holds the gesture start but does not expose it. The capture keeps a press without movement, or a move back to the start, from rewriting the stored value with the rounded dB.
- **Question:** before stage 3b (group dB plus Shift fine on track, group and Master), should the hook tell `previewValue` that the value is back at the start (for example `previewValue(value, { atStart })`, or expose the start), so that the group and Master dB faders do not each copy the capture? Or should the lane-local capture be kept and copied for the group?
- **Acceptance if changed:** TV1–TV11, CF11, MG13, fader-click, fader-guards, fader-touch and track-group-mix-ui stay green and unchanged, and the m2 mutation (press without change rewrites the rounded value) is still caught.
- **Non-blocking.** Round 117 is test-only, and the next planning is the regression round. An answer before stage 3b is useful.

## Addendum (ac) — B round 118 planning (2026-10-23)
- **Trigger:** the gate-117 code-reviewer Architecture note (`gates/round-117/review.md`, Signal 4). The proposal: give `useRelativeFaderDrag` an optional stored ↔ slider mapping, so that the hook itself restores the anchor exactly and each owner needs no ref of its own. It must not change the public shape for Pan and Master, the gesture lifecycle, or F2/F8/TV4.
- **What round 118 does:** it copies the lane's `volumeGestureStartRef` pattern into `ArrangementGroupHeader.tsx`. This is the second copy. Addendum (ab) is still unanswered, and B does not delay stage 3b for it.
- **Question:** after round 118, should the two copies (lane, group) be folded into the hook (the mapping, or `previewValue(value, { atStart })`)? Or keep them until a third dB fader arrives?
- **Acceptance if changed:** TV1–TV11, GV1–GV9, CF11, MG13, fader-click, fader-guards and fader-touch stay green and unchanged, and the m2 mutations (lane TV, group GV4) are still caught.
- **Non-blocking.**

## Addendum (ad) — B round 121 planning (2026-10-23)
- **Trigger:** the round-120 code-reviewer Architecture note (`a-round-120.md`, Code review). `buildPeakShape` and `PeakShape` are pure geometry, but they are exported from the component file `ArrangementClip.tsx`. The detail panel and the tests import them from there. Stage 4b (round 121) uses them again, through the new pure `clipWaveformScale` in `waveform-zoom.ts`.
- **Question:** should `buildPeakShape`/`PeakShape` move to `app/lib/arrangement/peaks.ts` with the same signatures, as a single-owner task? Or should they stay where they are?
- **Acceptance if moved:** WG1–WG8 and WZ1–WZ9 stay green, with the WG2 sha256 pin `cc617f0c…` unchanged. Lane and detail drawings are byte-identical.
- **Feature boundary:** T12 V1 closes with round 121, so this checkpoint is now due under the workflow. StudioWorkspace also gains one more view state (`waveformZoom`), the same signal as ARCH-CHECKPOINT-SRW14-PREFS (a). The reviewer's verdict is "keep" (low value). **Non-blocking:** the next planning is the regression round, then ABLETON-EXPERT-REVIEW.
