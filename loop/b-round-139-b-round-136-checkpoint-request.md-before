# B → root: a bounded frontend-architect checkpoint at the close of V-0.3 (2026-10-24)

**Status:** requested; non-blocking. Round 137 (V-0.3d) goes ahead now. **When to run it:** after C round 137 PASS and the gate 137 publication, and before B plans V-0.4. If the result is not there at round 138 planning, V-0.4 goes ahead on the same import path, and B records that.

**Why now (the feature boundary):**
- V-0.3d is the last V-0.3 stage. After it, all workspace chrome is English, and V-0.4/V-0.5 (lanes, detail, library, dock) remain.
- Reviewers in four rounds (132, 134, 135, 136) raised the same Signal 3 about `app/lib/arrangement/strings.ts`:
  - ARCH-R132-STRINGS-SPLIT-BEFORE-V03;
  - ARCH-R134-RATCHET-SHAPE;
  - ARCH-R135-STRINGS-GROWTH;
  - ARCH-R136-STRINGS-GROWTH (gate 136 and A's reviewer).
- Each one recommended a single checkpoint **after V-0.3d**.
- After round 137 the module has 16 objects (14 today, plus two new: `studioClipEnvelopeStrings` and `studioWorkspaceStrings`). `strings.test.ts` has 33 `it`s, with `EXPECTED_*` and `*_KEYS` maps that repeat each other.
- The earlier requests have no result in `gates/`, the loop folder or `store/.claude/references/`. These are `b-round-130-checkpoint-request.md` addenda (e)–(g), (h) in `b-round-134.md`, and the repeats in `b-round-135.md`. This request replaces them with one bounded question set.

**Method:**
- Follow `store/.claude/references/architecture-checkpoint.md`, with the read-only `frontend-architect`, at the gate-137 commit.
- For each question, answer with keep or extract, the value, the risk, and at most three sentences. "Not worth it now" is a valid answer.

## Questions (at most three)
1. **Split `strings.ts`?**
   - Keep one leaf file, or split it into `app/lib/arrangement/strings/<area>.ts` with an `index.ts` barrel that keeps the `~/lib/arrangement/strings` import path?
   - **Acceptance if extracted:** ST1–ST33 pass byte-for-byte; every consumer import is unchanged; the leaf rule (no imports from `~/lib/arrangement`, `~/contexts` or `~/components`) holds per file; one owner (A) in one bounded round.
2. **Test maps.** Should `strings.test.ts` derive the `*_KEYS` lists from the `EXPECTED_*` maps, or split them per area beside the split files? The constraint is that assertion strength stays the same: exact key sets, exact literals, and the per-file Georgian scans.
3. **Local aliases.** Should the component-local aliases that only re-export module values (for example `ArrangementMarkerRow` l.54–55, gate-136 finding 2, and the StudioWorkspace `VIDEO_*` / `CLIP_LANE_SHIFT_*` constants after round 137) be inlined during the split, or kept? The module contract currently says to keep them.

## What B does with the answer
- **Keep:** record the result in `architecture_signals` and continue with V-0.4.
- **Extract approved by root:** one separate B task before V-0.4, with one owner, behaviour-preserving tests and no text change. V-0.4 follows it.

## Addendum (B, round 137 → 138 planning, 2026-10-24)
- **Still no root result** at round 138 planning (nothing in `gates/`, the loop folder or `store/.claude/references/`). As stated above, V-0.4 goes ahead on the same import path: round 138 = V-0.4a adds one more object, `studioClipStrings`.
- **Fold into question 2** (gate-137 reviewer finding 2 and Architecture note, A round-137 reviewer finding 3): `strings.test.ts` now imports `StudioWorkspace` only for ST32's `VIDEO_RETURNED_*` alias check, which pulls the heaviest component into a pure strings unit test. Options: check through `studioVideoStrings`, or move the alias check into `workspace-strings-ui.test.tsx`. Same constraint: assertion strength unchanged.
- Signal count on `strings.ts` / `strings.test.ts` (Signal 3): rounds 132, 134, 135, 136, 137. Recommended timing unchanged: answer before V-0.4b if possible; otherwise each V-0.4 stage keeps adding one object per area.

## Addendum (B, round 138 → 139 planning, 2026-10-24)
- **Still no root result** at round 139 planning. V-0.4b goes ahead on the same import path (`studioLaneStrings` appended).
- **New signal (gate-138 Architecture note + finding 5, A round-138 Architecture note):** 8 test files locate clip bodies and trim handles by `title`, and 6 more locate the track name button by an aria-label regex; every wording round rewrites them. Proposal for question 2: give these elements `data-testid`s in one behaviour-preserving round so locators stop depending on text. Signal only; not scheduled.
- Signal count on `strings.ts` / test pins (Signal 3): rounds 132, 134, 135, 136, 137, 138.
