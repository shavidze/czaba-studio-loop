# B → root: frontend-architect checkpoint re-request at the V-2b end (2026-10-25, D-29z123)

**Status:** re-requested once, as `b-round-155-checkpoint-request.md` promised; **non-blocking**. Round 158 (V-3a) goes ahead.
- **Pending, with no root result:** `b-round-148-checkpoint-request.md` (V-0 boundary) and `b-round-155-checkpoint-request.md` (V-2 boundary). Their questions stay as written.
- Root may run all of them as one checkpoint at commit `f8a316a` or later. Use the read-only `frontend-architect` and `store/.claude/references/architecture-checkpoint.md`. For each question: keep or extract, value, risk, at most three sentences.

## Why now
- **Feature boundary:** V-2b is published apart from V-2b-DISPLAY, which is awaiting the user (`037e25f`, `4c07d5f`, `cbcd3d9`, `f8a316a`).
- **Last cheap moment:** V-3c will add lucide icons across about 8 arrangement components.
- **Repeated owner:** `strings.ts` was edited in every V-0, V-2b-3a and V-2b-3b round.

## One added question
3. **Duplicated Export sentence templates** (A round-157 reviewer, `a-round-157/code-review.md`):
   - The four Export sentences now exist twice, in `studioTimeTextParts.export*` and in `studioExportStrings.*`. Only ST-TP4 keeps them in step.
   - `StudioExportTimeBounds` has the same shape as `StudioTimeRangeText`.
   - **Question:** should `studioExportStrings` be derived from the parts? That changes `rangeScope(label)` to `rangeScope({ start, end, seconds })`. Or should both stay, locked by the test?

## What B does with the answer
- **Keep:** record it as a signal and continue V-3.
- **Extract approved:** one separate, behaviour-preserving B task with one owner, scheduled between VISUAL-A stages.
- **No result:** V-3 proceeds. B does not re-ask before the VISUAL-A end.
