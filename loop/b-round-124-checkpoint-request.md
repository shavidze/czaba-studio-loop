# B → root: bounded frontend-architect checkpoint before VISUAL-A V-0 (2026-10-24)

**Status:** requested; non-blocking. DESIGN-UX-REVIEW (rounds 125–126) changes no code and does not wait for it.

**Why now:** ABLETON-EXPERT-REVIEW is done (round 124), and the next code owner is VISUAL-A **V-0**. V-0 moves every Studio UI string into one strings module: about 30 source files and 58 test files (`visual-direction-a.md`, V-0). Rounds 125–126 change no code, so a checkpoint answered during them costs no implementation time. The questions in `b-round-121-checkpoint-request.md` (view-preference props, fader mapping, peak geometry, export orchestration) are still unanswered and still apply. This request adds one question about V-0.

**Method:** `store/.claude/references/architecture-checkpoint.md`, read-only `frontend-architect`, at `608187f`. For each question: keep or extract, the value, the risk, and at most three sentences. "Not worth it now" is a valid answer.

## Questions (at most four)
1. **V-0 strings module shape (new).** Where should the module live (`app/lib/arrangement/strings.ts` vs `app/components/arrangement/strings.ts`)? Should it be flat constants or functions for interpolated text (times, names, counts)? How should tests reference it so that a later language does not touch every test file? How should V-0 split into 2–3 rounds by owner (for example status/announcement strings, then controls/labels, then dialogs/library), so that no round touches `StudioWorkspace.tsx` together with every component?
2. **Export orchestration (SRW20 q14).** This is the oldest open question; restated from `b-round-121-checkpoint-request.md` Q4.
3. **View-preference props (ARCH-R121-LANE-VIEW-OPTIONS).** Restated from Q1 of the same request.
4. **Fader mapping duplication (ARCH-R117-HOOK-SLIDER-MAPPING).** Restated from Q2 of the same request.

## What B does with the answer
- Q1: B writes the V-0 stage tasks (round 127 at the earliest) following root's recorded answer. If no answer has arrived, B uses the smallest honest split: one module in `app/lib/arrangement/`, plain constants plus small formatter functions, and one owner group per round. B records the rationale.
- Q2–Q4: an approved extraction becomes its own B task, with one owner, tests that preserve behaviour, and no new behaviour. It is scheduled after VISUAL-A unless root orders otherwise.
- B schedules no refactor without root's recorded result.
