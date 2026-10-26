# B → root: frontend-architect checkpoint at the DUX-R-5 boundary (2026-10-26, D-29z146)

**Status:** `requested_from_root`. This is a bounded request at a feature boundary. It does **not** block anything. Round 181 (M1) runs under fallback (c) either way.
- **Supersedes:** `b-round-173-checkpoint-request.md` and its addenda (rounds 176–179). That file remains as history. Q-COMMIT (`b-round-165-checkpoint-request.md`) stays open separately.
- **Procedure:** `store/.claude/references/architecture-checkpoint.md`. Root calls the read-only `frontend-architect` and records, per question, keep/extract, value, risk and at most 3 sentences.

## Why now
- **Feature boundary.** DUX-R-5, the one colour rule, ended with round 180: C PASS, INVENTORY-EXIT found 0 unmapped tokens, and the round was published as `59d4bab`. It took 7 rounds (174–180).
- **The same signal, seven rounds running.** Signal 3 is the same costly region changing round after round (ARCH-R178/R179/R180-SIGNAL3). Every reviewer gave the same verdict: keep for now, decide at the boundary.
  - **Class strings.** Toggle on-state and surface recipes are copied as literals: StudioWorkspace l.2284/2365, TempoRow l.241–243, Transport l.51/234/256, and the Mute/Solo strings in Lane, GroupHeader and Master. There are also three nearly identical ~400-character button strings: Lane l.723/l.731 and LibraryPreview l.332.
  - **Test locks.** Source-string counts read with `readFileSync` (DXT8, DXA7, TH6, DXG6, PNR5) depend on Biome line wrapping. Full-`className` locks also break on every colour round.
  - **Test harness.** The ~80-line fake AudioContext / OfflineAudioContext / AudioBuffer / ResizeObserver block is copied into every new suite. The latest copy is `drag-feedback-colour-ui` l.30–107.
- **What comes next.** M1, M3 and M4 are small layout moves. ROOT-RECON-GRID-HARNESS (test-only, user-approved) is planned for the end of VISUAL-A. After that, STORE-REDESIGN and REVIEW-RECOMMENDATIONS will touch many of the same Studio files again.

## Questions (max 3)
1. **Recipe extraction: keep or extract?**
   - **Proposal:** a `studioToggleClass` / surface-classes module in `app/lib/arrangement/`, holding the base, on-state, SURF, FILL and MOTION tokens. It would include gate-176 `ARRANGEMENT_MIX_ON_STATE` and possibly a shared add/import button recipe for the three ~400-character strings.
   - **Scope:** class strings only. No audio timing, refs, gesture lifecycle, Undo/Redo or `useArrangement()` changes. twMerge would learn `radius: ['panel']` (GATE172).
   - **Acceptance:** rendered token sets stay identical, current tests stay green without edits, and C measures 0 px layout and colour delta.
2. **Test infrastructure: one test-only task?**
   - **Proposal:** extend ROOT-RECON-GRID-HARNESS (`helpers/workspace-test-environment.ts`, `createWorkspaceTestEnvironment`) with three pieces:
     - (a) the shared workspace fakes and mount;
     - (b) one `expectTokens(element, present, absent, label)` helper, replacing full-string className locks;
     - (c) one whitespace-normalising `countOccurrences`, or DOM-token assertions in place of source-string counts. PNR5 would also stop reading the protected `StudioWorkspace.tsx` source.
   - **Rule:** lookups use role, name, text or testid, with labelled structural hops (B ruling A-R180-N1-STRUCT-LOOKUPS). Never use colour-class selectors.
   - **Acceptance:** the test count is unchanged, and the stored mutation lists (m235–m303) still turn red.
3. **Order.**
   - **Options:** run (1) and/or (2) now, before M1/M3/M4; at the end of VISUAL-A, next to ROOT-RECON-GRID-HARNESS (B's default); or not at all.
   - **Also:** should (1) be done before STORE-REDESIGN starts, given the Studio files it will touch?

## B's default if there is no answer
- **Fallback (c) continues.** Recipes stay per component, locked by tests. M1 (round 181), the REGRESSION round (due on/after 2026-10-27), M3 and M4 go ahead.
- **ROOT-RECON-GRID-HARNESS** stays at the end of VISUAL-A, with Q2 offered as an optional extension.
- **No self-scheduling.** B does not schedule an extraction on its own. A root-approved change becomes a separate B task with one owner and behaviour-preserving tests.
