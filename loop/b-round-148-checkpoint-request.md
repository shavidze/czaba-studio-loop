# B → root: a bounded frontend-architect checkpoint at the V-0 boundary (2026-10-24, D-29z114)

**Status:** requested now; **non-blocking**.
- Round 149 (V-1a: a colour token block in `app.css` + one attribute on the StudioWorkspace root) and V-1b (field border classes) go ahead. Neither touches `strings.ts` or its tests.
- This file **replaces** the open question set in `b-round-136-checkpoint-request.md` and its addenda: twelve plannings with no root result, and five questions there, while the policy cap is three.

**Why now:**
- V-0 is complete (gate 148, `b292ff4`). This is the feature boundary named in rounds 146–148.
- The same Signal 3 was raised by reviewers in rounds 132, 134, 135, 136, 147 and 148:
  - `app/lib/arrangement/strings.ts` now holds 24 `studio*Strings` objects, edited in every V-0 round;
  - the object names are near-identical (`studioVideoStrings` / `studioVideoDockStrings`, `studioLibraryStrings` / `studioLibraryPanelStrings`);
  - `strings.test.ts` now also contains a filesystem walk (`collectWorkspaceSourceFiles`, ST51).

**Method:**
- Follow `store/.claude/references/architecture-checkpoint.md` with the read-only `frontend-architect`, at commit `b292ff4` or later.
- For each question, give keep or extract, the value, the risk, and at most three sentences. "Not worth it now" is a valid answer.

## Questions (three)
1. **Split `strings.ts` and the matching test file?**
   - Options: keep one leaf file, or move to `app/lib/arrangement/strings/<area>.ts` with an `index.ts` barrel that keeps the `~/lib/arrangement/strings` import path.
   - Folded in:
     - renaming the near-identical objects (GATE147-S5);
     - inlining the component-local aliases (`VIDEO_PLAY_FAILED_MESSAGE` / `VIDEO_RETURN_LABEL`, gate-148 #3; `ArrangementMarkerRow` l.54–55);
     - the gate-148 reviewer's proposed "every key's value is unique, except documented duplicates" test.
   - **Acceptance if extracted:**
     - every ST test passes byte-for-byte;
     - consumer imports are unchanged;
     - the leaf rule holds per file;
     - one owner and one bounded round, with no text change.
2. **Test-side structure.**
   - Should the many per-component test pins import constants from `strings.ts`, while the exact-literal tests (ST45/ST49/ST50 style) keep hand-written literals? The cost: a pin stops catching a wrong English text on its own (GATE147-SIGNAL3).
   - Should the Georgian-scan / directory-walk helper (`stripSourceComments`, `normalisedGeorgianLines`, `collectWorkspaceSourceFiles`) move to one shared test helper (A-R148 arch note, signal 1)?
   - Constraint: assertion strength stays the same.
3. **Extract `ArrangementLibraryOption`?** Gate-146 signal 3: the library option row layout changed in rounds 142, 145 and 146. Should it become its own component with a row-layout contract test, or stay inline?

## What B does with the answer
- **Keep:** record it in `backlog.json` `architecture_signals` and continue V-1/V-2/V-3.
- **Extract approved by root:** one separate, behaviour-preserving B task with one owner. B schedules it between VISUAL-A stages and does not interleave it with a stage's own files. V-1 does not wait for it unless root says so.
- **No result:** V-1…V-3 proceed. These questions stay open signals and are re-asked once at the VISUAL-A boundary (before the deferred-Low polish pass), not every planning.
