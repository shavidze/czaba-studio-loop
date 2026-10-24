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

## Addendum (B, round 139 → 140 planning, 2026-10-24)
- **Still no root result** at round 140 planning (fourth planning without it). V-0.4c goes ahead on the same import path: envelope keys are appended to `studioClipEnvelopeStrings`; `studioGroupHeaderStrings` and `studioMeterStrings` are appended.
- **New signal (gate-139 suggestion 1 + Architecture note Signal 2, A round-139 Architecture note) — ARCH-R139-TRACK-NAME-TESTID:** `StudioWorkspace.tsx:331` `trackRowNameButton` finds the track name button by the aria-label substring `— set as the active track`, coupled to `studioLaneStrings.activeTrackLabel` with no shared constant (guarded by ST33, `track-group-collapse-ui` UC8/UC9 and C's ungroup-focus browser check). Proposal: `data-testid="arrangement-track-name"` on the Lane name button and query it. Acceptance: `track-group-collapse-ui` l.860/887 and the focus tests green with no other edits. Value medium, risk low. Merges with ARCH-R138-TITLE-LOCATORS-TESTID into question 2. Signal only; not scheduled.
- Signal count on `strings.ts` / test pins (Signal 3): rounds 132, 134, 135, 136, 137, 138, 139.

## Addendum (B, round 140 → 141 planning, 2026-10-24)
- **Still no root result** at round 141 planning (fifth planning without it). V-0.4d adds only one key, `studioTrackGroupStrings.defaultNamePrefix`, and no new object.
- **New signal (gate-140 Architecture note Signal 3; A round-140 Architecture note) — ARCH-R140-STRINGS-TEST-SPLIT:** `strings.ts` gained whole objects in rounds 138, 139 and 140. `strings.test.ts` (~2080 lines) is edited every round, and older ST loops break when an object gains formatters (the round-140 ST33 guard). Reviewer proposal for question 2, after V-0.5: split `strings.test.ts` by feature, keep `strings.ts` as one leaf, and add one shared Georgian/`«»` scan helper. Acceptance: the same `it` counts, the no-Georgian scan still covers all component files, and a Georgian-letter mutation still turns red. A's Signal 2: three test files find group buttons by an aria-label regex, which adds to ARCH-R139-TRACK-NAME-TESTID (use `data-testid` for group and track name buttons).
- Signal count on `strings.ts` / test pins (Signal 3): rounds 132, 134, 135, 136, 137, 138, 139, 140. Recommended timing: answer before V-0.5 ends, so the split can run as its own bounded round right after V-0. It does not block V-0.4d/e.

## Addendum (B, round 141 → 142 planning, 2026-10-24)
- **Still no root result** at round 142 planning (sixth planning without it). V-0.4e appends one new object (`studioDetailStrings`) and 4 keys to `studioLibraryStrings`.
- **New signal (gate-141 Architecture note) — ARCH-R141-DEFAULT-NAME-SEEDS:** default-name seeds are placed inconsistently. The group prefix lives in `strings.ts` (`studioTrackGroupStrings.defaultNamePrefix`), while the default track names are data literals in `studio-lab.tsx` l.13–16 and `ArrangementContext.tsx` l.548–549. Both are user-renamable seeds. Reviewer: keep for now. Question for the checkpoint: "where do default-name seeds live (strings vs data)". Signal only; not scheduled.
- **A round-141 signal — ARCH-R141-SSR-TEST-HELPER:** the `@remix-run/react` mock and the console spy are duplicated in `ssr-layout-effect.test.tsx` and `default-track-names-ssr.test.tsx`. Extract a shared SSR test helper when a third SSR test appears. Signal only.
- Signal count on `strings.ts` / test pins (Signal 3): rounds 132, 134–141. Recommended timing unchanged: answer before V-0.5 ends.

## Round-142 addendum (B, round 143 planning, 2026-10-24; D-29z108)
- **ARCH-R142-LIBRARY-SEARCH-KEYWORDS** (A round-142 code-reviewer Architecture note, verdict keep for now): `library.ts` `matchesLibraryQuery` uses the display label `LIBRARY_KIND_LABELS` as search text, so a copy edit in `strings.ts` changes search results (mutation m86 proved it; C-R142-02 `stems` → 0). Question for the checkpoint: should per-kind search keywords (incl. plurals) live next to the display labels in the strings module, or in `library.ts` as data? B has scheduled it as a V-0.5 forward constraint (LIB-SEARCH-KEYWORDS); a checkpoint answer before V-0.5 would decide where it goes.
- V-0.4 completes with round 143 (feature boundary). The request is still open and non-blocking.

## Round-144 addendum (B, round 145 planning, 2026-10-24; D-29z110)
- **V-0.4 is complete** (gate 144 published 9a67abd). This is the feature boundary named in the request. Still no root result (eighth planning without it). Non-blocking: round 145 (V-0.5a) proceeds.
- **New in round 145:** one more object `studioSourceLoadStrings` (13 keys) and a search-keyword table `LIBRARY_KIND_SEARCH_KEYWORDS` in `library.ts` (resolves ARCH-R142-LIBRARY-SEARCH-KEYWORDS by separating search from display). Gate-144 Architecture note: one-way imports into the leaf `strings.ts`, verdict keep (ARCH-R144-STRINGS-IMPORTS).
- **Recommended timing:** before V-0.5c, which closes V-0 and re-captures the RV-1 baseline; a split of `strings.ts` / `strings.test.ts` after that point means a separate behaviour-preserving round.

## Round-145 addendum (B, round 146 planning, 2026-10-24; D-29z111)
- Still no root result (ninth planning without it). Non-blocking: round 146 (V-0.5a fix-up) proceeds.
- **New signal ARCH-R145-STRINGS-22ND-OBJECT** (A round-145 code-reviewer Architecture note): `strings.ts` now holds its 22nd `studio*Strings` object (~680 lines). Reviewer verdict: keep, because the leaf rule is test-enforced and nothing couples in a new direction. Same question as (a) of this request: split before V-0.5c or after V-0.
- Round 146 adds no strings and no module. It is one JSX move in `ArrangementLibrary.tsx` plus test pins.

## Round-146 addendum (B, round 147 planning, 2026-10-24; D-29z112)
- Still no root result (tenth planning without it). Non-blocking: round 147 (V-0.5b) proceeds.
- **Round 147 adds the 23rd object `studioLibraryPanelStrings`** (22 plain keys, about 25 lines). `collection.ts` interpolates its `add` key into the `ready` status, so the Add button and the sentence that names it stay in sync. The import is one-way into the leaf.
- **Gate-146 Architecture notes:** signal 2 (one-way imports into `strings.ts`, verdict keep); signal 3 (the library option row layout changed in rounds 142, 145 and 146; a bounded "row layout contract" task is proposed only if V-0.5b breaks the row again).
- **Timing request:** B asks root to run the bounded frontend-architect checkpoint **when V-0.5c closes (round 148 at the earliest)**. That is the V-0 feature boundary, before V-1 colour work starts. Questions:
  - (a) split `strings.ts` / `strings.test.ts`, or keep them;
  - (b) the shared Georgian-scan helper;
  - (c) extracting `ArrangementLibraryOption` (gate-146 signal 3).

## Round-147 addendum (B, round 148 planning, 2026-10-24; D-29z113)
- There is still no root result (eleventh planning without it). It does not block: round 148 (V-0.5c) proceeds.
- **Round 148 is the last V-0 stage.** It adds the 24th object, `studioVideoDockStrings` (17 plain keys), and ST51, a recursive directory-walk Georgian sweep in `strings.test.ts`. ST51 partly answers question (b): the shared scan helper.
- **New signals:**
  - **GATE147-SIGNAL3-TESTS-IMPORT-CONSTANTS** (gate-147 Architecture note): rounds 144–147 each edited 8–9 test files that repeat the same literals.
  - **A-R147-ARCH-NOTE:** keep `strings.ts` import-free; verdict keep.
  - **GATE147-S5:** near-identical object names (`studioLibraryStrings` / `studioLibraryPanelStrings`). Round 148 adds `studioVideoDockStrings` next to `studioVideoStrings`.
- **Request, unchanged in timing:** run the bounded frontend-architect checkpoint when V-0.5c closes (C round 148 PASS + gate 148). That is the V-0 feature boundary, before V-1 colour work. Questions:
  - (a) split `strings.ts` / `strings.test.ts`, or keep them;
  - (b) the shared Georgian-scan helper (ST51 now exists);
  - (c) extract `ArrangementLibraryOption`;
  - (d) **new:** should the test pins import constants from `strings.ts` while exact-literal tests (ST45/ST49/ST50 style) keep the literals? The cost is that the pins stop catching a wrong English text on their own;
  - (e) **new:** rename the near-identical objects, or keep them.

  The answer is scheduled as its own behaviour-preserving round with one owner. It does not block V-1 unless root says so.

## Superseded (B, round 149 planning, 2026-10-24; D-29z114)
- V-0 closed at gate 148 (b292ff4). This open request is replaced by `b-round-148-checkpoint-request.md` (three consolidated questions, non-blocking).
