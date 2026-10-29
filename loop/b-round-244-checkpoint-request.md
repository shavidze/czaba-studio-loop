# Architecture checkpoint request: focus return and status ownership in StudioWorkspace (B, round 244 → 245 planning, D-29z404)

**Status:** requested from root, **non-blocking**. This is the "after round 244" re-ask of ARCH-CHECKPOINT-TEMPO-GRID (`b-round-234-checkpoint-request.md`, addenda 1–9). It narrows that request to the three signals that are still open on the same owner. Wanted before SABA-B-10a is dispatched. If it is not answered by then, SABA-B-10a is dispatched on its own grants and the gap is recorded (the retro-230 precedent for SABA-B-7).

**Why now:**
- A feature-boundary signal plus accumulated structural risk on one owner. Rounds 242, 243 and 244 each changed the grid-menu focus return in `StudioWorkspace.tsx`; that meets the gate-243 reviewer's own trigger.
- Gate 244's Architecture note (`gates/round-244/review.md`) and A round 244's reviewer (`a-round-244.md` §5) both say "keep for now" and propose a later `useGridMenuFocusReturn` extraction.
- RETRO 245 (`retros/retro-245.md` §4, §7) found two Medium classes on this owner: focus lost on unmount or menu close (5 issues) and status-line clobbering (3 issues). `tech-lead` advised an architecture signal, not a systemic task, for both.

**Reviewer:** the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`. Root invokes it and records the result. An approved change becomes its own bounded B task with one owner and behaviour-preserving tests. Line counts are context, not a reason to split.

**Scope at `e9fb805`:**
- `StudioWorkspace.tsx`: `gridMenuPressFocusRef`, `gridMenuPressGroupIdRef`, `gridMenuReturnGroupIdRef` and the return ref; `releaseEditFocusOnTimelinePointerDown`; `handleGridMenuRequest`; `closeGridMenu`; `groupNameEditorRowId`; `trackRowNameButton`; the Overview/dock focus rescue (GATE233-ARCH-DOCK-FOCUS-RESCUE).
- `ArrangementMarkerRow.tsx`: the imperative handle (`focusEditorSuccessor`, `focusMarkerTarget`), `pendingFocusRef`, `blurSuccessorRef`.
- `ArrangementContext.tsx`: `setStatus` and the provider's `copy.loading` / `copy.ready` writes (A-R237-ARCH-STATUS-PARTS). `tech-lead` counted 231 `setStatus*`/`announce(` hits in 25 files, 70 of them in the context.

## Questions (keep/extract, value, risk; at most 3 sentences each)
1. **`useGridMenuFocusReturn(scrollerRef, markerRowRef)`** owning the press and return refs and the group ids, and returning `onPressCapture`, `captureReturn(event)` and `restore()`. Acceptance: GM14, GM36–GM49, FR1–FR4 and MU14 green with no edits, plus a mutant proving one writer. Should the macOS Ctrl+click press (GATE244-S4 / A-R244-REVIEW-L6, `button 0` + `ctrlKey`) be folded into that task or stay separate?
2. **One focus-successor mechanism for editors** (gate 244 "Alternative B": a registry instead of the marker handle plus the group DOM lookup). Is two inline editors still too few to justify it? Does `groupNameEditorRowId`'s runtime `data-testid` read (GATE244-S3) need a dedicated attribute now?
3. **Status ownership.** Keep the free-string `setStatus` with the new spec rule (lessons L51: every status write lists what it can overwrite and carries one clobber row), or introduce status parts/priority behind the frozen `useArrangement()` shape? If the latter, what is the smallest first step?

## Not in scope
- B-R243-UNDO-MARKER-FOCUS (Medium). `tech-lead`: a MarkerRow-owned behaviour fix (when the focused flag's id leaves `markers`, focus the neighbouring flag, else the add control). It is scheduled as a normal task and does not wait for this checkpoint.
- Any change to Undo/Redo atomicity, history entries or the `useArrangement()` shape.
