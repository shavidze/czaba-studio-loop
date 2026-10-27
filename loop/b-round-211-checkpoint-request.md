# Architecture checkpoint request: the PERF-FADER boundary (B, round 211 → 212 planning, D-29z195)

**Status:** requested from root. It is the commitment from **D-29z188** (round 210 planning: "B writes it at the 211→212 planning, whatever round 211's verdict"). It is **non-blocking**. Round 212 (PERF-FADER-c) does not wait for it, and it leaves `ArrangementContext.tsx` untouched; see below.

**Reviewer:** the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`. Root invokes it and records the result. B schedules any approved change as its own bounded task, with one owner and behaviour-preserving tests.

**Boundary:** PERF-FADER is complete through stage b: a0 in round 208, a in rounds 209–210, b in round 211, published as `28a274c`. The single owner has been changed in 4 consecutive rounds:
- `app/contexts/ArrangementContext.tsx`, 4,053 lines at `28a274c`, was 3,832 at `c274930`;
- `ArrangementDetailPanel.tsx`, 1,310 lines.

Line count alone is not a reason to split it.

## Signals folded in (backlog ids)
- **ARCH-R207-MIX-PREVIEW-STORE.** The mix preview store design, from round 207.
- **ARCH-R209-MIX-OVERRIDE** (`a-round-209.md` reviewer).
  - What: `mixOverrideRef`, `mixDraftStore` and `writeLiveMixGains`/`takeMixOverride`, all in the context.
  - Proposal: a pure gesture → override → commit/revert reducer in `lib/arrangement`.
- **ARCH-R210-OVERRIDE-UNIFY** (`gates/round-210/review.md`).
  - What: `panOverrideRef` sits beside `mixOverrideRef`, and the draft is cleared from 8 places. There are also four near-identical `begin*Gesture` claim/listener blocks.
  - Proposal: pan joins the `MixOverride` union, plus one draft-clear helper and one claim/listener helper.
- **GATE210-S4 and GATE211-S2.** `commitClipGainPending` (l.3158–3166) could call `applyEdit` twice when `before` and `pointerOverride` both exist. It is unreachable today, but only call order protects it.
- **GATE211-ARCH-CLIPGAIN-GESTURE** (`gates/round-211/review.md` Architecture note, signal 4, now seen 3 times).
  - What: Clip Gain runs two parallel machines (pending refs and the pointer override) that end in one commit.
  - Proposal: `lib/arrangement/clip-gain-gesture.ts`, with pure `preview`/`commit`/`cancel` functions of the form `(present, override) → {next, drafts, liveGains}`.
- **A-R211-ARCH-USEMIXDRAFT** (`a-round-211.md`, the final reviewer's note, mild signal 2). `useMixDraftValue` is a hook exported from a component file (`ArrangementMixFader.tsx:30`) and used by a sibling (`ArrangementClip.tsx:41`). Proposal: move it next to `mix-draft-store.ts` or into a hooks module. The reviewer's verdict: keep the lifecycle and leave the decision to this checkpoint.
- **GATE211-ARCH-CLIPGAIN-PROPS** (same note, signal 2). `ArrangementDetailClipGain` takes about 30 props. The reviewer's verdict is keep.

## Questions
Answer each with keep or extract, its value, its risk, and at most 3 sentences.
1. **One gesture lifecycle.** Should volume, group, master, pan and clip gain share one pure override reducer and one claim/listener helper now, or after PERF-8 and PERF-10, which move the store onto zustand (D-29z193)? Name the first extraction that does not change `useArrangement()`.
2. **Clip-gain gesture module.** Is `clip-gain-gesture.ts` (pure functions, refs and timing kept in the context) worth doing on its own? Or should it wait for question 1's shared reducer, so the region is not reworked twice?
3. **Draft clearing.** Should the 8 draft-clear call sites become one helper, and who should be the single writer of the pan draft?

## Acceptance for any approved extraction (B will copy it into the task)
- These run unedited and green, in their form as of the round-212 publish commit (round 212 re-expresses WG1/WG2/WZ1): FP1–FP14c, MD1–MD5, CP1–CP14, the CF/MG/WG/WZ clip-gain tests, `gesture-guard`, `fader-click` and `group-volume-db`.
- The shape of `useArrangement()` is unchanged.
- The `perf/budgets.json` asserts are unchanged.
- A dragged-mix export is bit-identical to the same mix set by typing the values.

## Round-212 interaction
- Round 212 (PERF-FADER-c) **does not touch `ArrangementContext.tsx`**. It changes only:
  - the peak path format in `buildPeakShape`, in `ArrangementClip.tsx`;
  - the Clip Gain block of `ArrangementDetailPanel.tsx`: C-R211-01 (stale text on release) and GATE211-S1 (stored gains passed as a prop);
  - one memo field in `StudioWorkspace.tsx` (`detailGroup.clipGainsDb`).
- GATE211-S2 (the exclusive branch) is **not** in round 212. It waits for this checkpoint and joins the extraction if one is approved, or a later bounded task if not (tech-lead consult, round 211→212 planning). It is unreachable today: `beginClipGainGesture` flushes the pending edit first (l.3226–3229).
- No gesture logic moves in round 212, so it does not prejudge questions 1–3.
