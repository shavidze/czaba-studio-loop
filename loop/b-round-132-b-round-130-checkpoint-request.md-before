# B → root: bounded frontend-architect checkpoint at the close of the V-0.2 Context edits (2026-10-24)

**Status:** requested; non-blocking. Round 131 (V-0.2c1) and the following c2/c3 rounds do not wait for it.

**Why now:**
- Round 131 is the last V-0.2 stage that edits `ArrangementContext.tsx`. After it, the Context keeps only 4 Georgian lines, which belong to V-0.4/V-0.5.
- Three reviewers raised the same signals:
  - gate 129: ARCH-R129-TWO-PLACE-MESSAGE-ASSEMBLY;
  - gate 130: ARCH-R130-CONDITIONAL-COPY-IN-FORMATTERS;
  - A's round-130 reviewer: ARCH-R130-CONTEXT-REEXPORT-SURFACE.
- The checkpoint was planned "when V-0.2c closes, before V-0.3". V-0.2c is now split into c1/c2/c3, and c2/c3 do not touch the Context. So the answer can arrive while c2/c3 run, before V-0.3.
- `b-round-124-checkpoint-request.md` Q1 has no recorded answer. B used its fallback. That fallback is now the subject of Q1 below.

**Method:**
- Follow `store/.claude/references/architecture-checkpoint.md`, with the read-only `frontend-architect`, at the commit that root publishes for round 131 (or `ba54297` if root runs it earlier).
- For each question, answer with keep or extract, the value, the risk, and at most three sentences. "Not worth it now" is a valid answer.

## Questions (at most four)
1. **Strings module shape and growth.**
   - `app/lib/arrangement/strings.ts` now holds 7 objects (Export, Edit, Playback, Library, Loop, Move, Video). V-0.3–V-0.5 will add chrome, lanes and library.
   - Keep one file, or split it per area into `strings/*.ts` behind one index before V-0.3?
   - Is `strings.test.ts` as the single place that pins the literals still the right rule?
2. **Conditional copy: formatters or call sites.**
   - Today the Context picks variants: `moved ? nearestFreeSpot : ''`, `replaced ? … : …`, `enabling ? … : …`.
   - Should these move into formatters (for example `clipAdded({…, moved})`), so that no Context branch only picks between strings?
   - If yes, should that be one bounded stage after V-0, with one owner (`strings.ts` + the Context call sites) and behaviour-preserving tests?
3. **Context re-export surface.**
   - The Context re-exports module strings as aliases: `GESTURE_*`, `NUDGE_AT_TIME_START_MESSAGE`, `WEB_AUDIO_UNAVAILABLE_MESSAGE`. About 30 consumers reach the strings through `ArrangementContext.tsx`, and the leaf `strings.test.ts` now imports the Context.
   - Keep the aliases (the `===` identity is safe), or point consumers at `strings.ts` directly in a later stage?
4. **Context size.** `ArrangementContext.tsx` is about 3800 lines. Is there one extraction whose value clearly exceeds its risk now (for example the video import pipeline `runVideoImport` / `decodeVideoSourceAudio`)? Or is "keep" the answer until phase 2?

The older unanswered questions (`b-round-121-checkpoint-request.md` Q1, Q2 and Q4) still stand. Root may add them if they fit the same session.

## What B does with the answer
- B schedules no refactor without root's recorded result.
- An approved extraction becomes its own B task, with one owner, behaviour-preserving tests and no new behaviour. It is scheduled after V-0, unless root orders it before V-0.3.
- If there is no answer by V-0.3 planning, B keeps the current shape. The rationale is that the edits are mechanical, the invariants are untouched, and the migration ends at V-0.5. B records that choice.

## Addendum (e) — B round 131 → 132 planning (2026-10-24)
Source: the A round-131 reviewer's Architecture note and the gate-131 reviewer's Architecture note (signal 3, verdict "keep" from both). Backlog id: ARCH-R131-STRINGS-SPLIT-AND-HARNESS.
5. **`strings.ts` per area and a shared Context UI test harness.**
   - `strings.ts` has 7 objects today, and 10 after round 132. Each object costs about 100 lines in `strings.test.ts` plus a per-file scan.
   - Should it become `lib/arrangement/strings/<area>.ts` with an index that keeps every exported name? Acceptance: no caller changes, ST1–ST19 pass, and `useArrangement()` keeps the same shape.
   - To observe Context status text, a test today copies the `export-mp3.test.tsx` mock preamble. Should one shared test harness module replace those copies?
   - Timing: after V-0.2c3, or after V-0.5. "Keep" is a valid answer.

Still non-blocking. Rounds 132–133 (V-0.2c2/c3) do not touch the Context.
