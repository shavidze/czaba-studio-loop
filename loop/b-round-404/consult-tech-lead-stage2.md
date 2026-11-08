# tech-lead consult, SYS-R385 stage 2 comparators (B round 404 -> 405, 2026-11-08), read-only, HEAD dd52107

Verbatim summary of the real `tech-lead` run (B's paraphrase of structure only; recommendations unchanged):

- **Q1 GATE371-L2 → (c) close as covered by GH2.** (a) a type rule cannot work: `Object.is` is typed `is(value1: any, value2: any): boolean` (`node_modules/typescript/lib/lib.es2015.core.d.ts` l.332), so it fits every `(a: T, b: T) => boolean`; only a brand + factory could reject it, and `group`/`actions`/`soloState` are compared by identity on purpose. `TRACK_GROUP_OVERVIEW_CLIP_EQUALITY` holds primitives only. GH2 should go red because every mute rebuilds the candidate and overview arrays (`groups.ts` builders, no cache). Mutants to record: M1 `activeCandidateTrackIds: Object.is`, M2 `overviewClips: Object.is` → GH2 red. Fallback (b) only if either survives.
- **Q2 GATE375-L2 → (c) close as covered by RB-LEAF3 and LP-EQ2.** Production call sites: StudioWorkspace (library view) and ArrangementLibrary (preview view). Mutants: M3 `actions={{ ...libraryActions }}` in StudioWorkspace, M4 `actions={{ ...actions }}` in ArrangementLibrary → RB-LEAF3 red. A table would not catch an inline closure either. Remaining gap (an inline prop new only in an untested state) exists under every option.
- **Q3:** no shared `prop-equality.ts` this round (one consumer).
- **Q4:** no render-count risk: no runtime change.

B's evidence for M1-M4: `mutants/summary.txt` rows MU-405-GH2-CANDIDATES-OBJECTIS, MU-405-GH2-OVERVIEW-OBJECTIS, MU-405-RBLEAF3-INLINE-WORKSPACE, MU-405-RBLEAF3-INLINE-LIBRARY: all RED on the sketch.
