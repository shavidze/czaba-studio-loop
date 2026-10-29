# Request to root: two bounded frontend-architect checkpoints at the SABA-B-11b boundary (B, round 247 → 248 planning, 2026-10-29; D-29z421, D-29z423)

Both are **non-blocking**. Round 248 is dispatched without them. They are wanted before **SABA-B-10a**, which rewrites the Space contract in `StudioWorkspace.tsx` and many tests. Use `store/.claude/references/architecture-checkpoint.md`. Read-only. The result is keep/extract with cost and risk, in three sentences or fewer per question.

## 1. ARCH-CHECKPOINT-TEMPO-GRID: re-ask after stage 2b (addendum 10)
- **History:** `b-round-234-checkpoint-request.md` plus addenda 1–9. Question 7 is GATE239-ARCH-USESTUDIOGRID: extract a `useStudioGrid` hook from `StudioWorkspace`, or keep the grid state there. The request was "re-ask after SABA-B-11b stage 2 and before SABA-B-10a".
- **Addendum 10 (round 248):** stage 2b adds three derived grid values to `StudioWorkspace` (`gridLinesShown` moved up, `snapGridSeconds`, `activeSnapSeconds`) and a status helper, `withSnapPausedNote`, which wraps 6 grid status writes. Grid knowledge is now spread over:
  - the grid refs and state (`gridSecondsRef`, `gridModeRef`, `gridDensityRef`, `gridHandChosenRef`, `snapEnabledRef`);
  - 7 grid callbacks;
  - 5 prop sites and 2 ref sites that derive the snap step;
  - the grid-control JSX.
- **Question:** keep it all in `StudioWorkspace`, or extract `useStudioGrid` (state, refs, derived snap inputs, status texts) before SABA-B-10a? Acceptance for any extract: the `grid-*` suites (GS, GAU, GM, GU, SP, HS, HP rows), `tempo-seed-ui` and `strings` stay green, with no behaviour change.

## 2. ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS: gate-247 note (addendum to question 4)
- **History:** `b-round-244-checkpoint-request.md`; question 4 plus the D-29z416 addendum (`b-round-246-checkpoint-addendum.md`).
- **New input:** the gate 247 review (`gates/round-247/review.md`, Architecture note) and A's reviewer (`a-round-247.md` §6). After round 247, `StudioWorkspace` holds three no-deps focus layout effects: the detach rescue (l.929), `pendingRowFocusRef` (l.942) and the library-rail rescue (l.962). Their precedence lives only in declaration order. GF7 and MU-PRECEDENCE-INVERTED guard it. Both reviewers say "keep for now". The gate proposes a later `useRowFocusRescue` hook with written precedence; acceptance would be GF1–GF7, UC4 F3, UC9 and UM9.
- **Question:** confirm keep, or schedule the extraction. If you schedule it, say before or after SABA-B-10a, which adds Insert-Marker focus behaviour to the same owner.

Root records the answer here or in `backlog.json` → `architecture_checkpoint_requests`. B schedules any approved change as its own bounded task, with one owner and behaviour-preserving tests.
