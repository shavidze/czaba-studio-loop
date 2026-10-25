# B → root: a bounded frontend-architect checkpoint at the V-2 boundary (2026-10-25, D-29z121)

**Status:** requested now; **non-blocking**. Round 156 (V-2b-3a) goes ahead.
- This request **adds to** `b-round-148-checkpoint-request.md` (V-0 boundary). That request is still pending; it has had no root result for 7 plannings.
- Root may run both together, in one checkpoint at commit `4c07d5f` or later. Its three questions (split `strings.ts`, test-side structure, `ArrangementLibraryOption`) stay as written there.
- This file adds **at most two** V-2-specific questions, so the total stays bounded.

**Why now:**
- V-2a, V-2b-1 and V-2b-2 are published (`ff2fd6c`, `037e25f`, `4c07d5f`). This is the feature boundary named in `tasks/round-155.md` §7.
- **Signal 3 (repeated costly change):** `studio-theme-obsidian.test.tsx` has been edited in rounds 151–156:
  - TH7, TH8, TH9, TH10, and TH11 planned;
  - it locks exact class strings from many component files with `node:fs`;
  - each typography round must name each literal.
- **Signal 2 (ownership):** round 156 adds `studioTimeTextParts` to `strings.ts` and a new rendering helper, `ArrangementTimeText.tsx`. This is the first time the strings module supplies **structured** text rather than plain strings.

**Method:** follow `store/.claude/references/architecture-checkpoint.md` with the read-only `frontend-architect`. For each question, give keep or extract, the value, the risk, and at most three sentences. "Not worth it now" is a valid answer.

## Questions (two, V-2 boundary)
1. **Source-level class locks.** Should TH8/TH10/TH11 keep pinning exact class literals per file? Or should the typography roles become named Tailwind class constants with one test per role, for example a mono timecode constant `font-mono font-normal tabular-nums`?
   - Constraint: no custom CSS (Tailwind-first), and assertion strength stays the same, including the C-R154-01 inherited-weight case.
2. **Part templating.** Is `studioTimeTextParts` + `ArrangementTimeText` the right shape for sentence-with-timecode text? V-2b-3b will reuse it for the Export dialog. If not, what is the alternative? The constraints:
   - one strings module (M2);
   - `textContent` byte-identical;
   - no `any` and no assertions.

## What B does with the answer
- **Keep:** record it in `backlog.json` as a signal and continue V-2b-3b and V-3.
- **Extract approved by root:** one separate, behaviour-preserving B task with one owner. B schedules it between VISUAL-A stages, not interleaved with a stage's own files.
- **No result:** V-2b-3b and V-3 proceed. These questions are re-asked once, at the VISUAL-A boundary before the deferred-Low polish pass.
