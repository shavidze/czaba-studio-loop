# A round 418 — SYS-R416-PREVIEW-CONTROLLER

**Status:** implementation done; awaiting C. Attempt 3 (attempts 1–2 hit the usage limit before any work; no partial edits existed — tree was clean at 061068d).

## Changed files (`git status --short --untracked-files=all`: 3 ` M` + 1 `??`)
- ` M app/contexts/ArrangementContext.tsx` — sketch only (git apply)
- ` M app/lib/arrangement/preview.client.ts` — sketch only
- ` M app/lib/arrangement/__tests__/library-preview-stream.test.tsx` — sketch only
- `?? docs/implementation/2026/quarter-IV/269-sys-preview-controller.md` — new, Georgian

The three sketch files were not edited after `git apply` (sketch sha256 `146bce6c0e33…8525` verified before apply; `git apply --check` rc 0).

## Checks (all actually run)
| # | Result | Log |
|---|---|---|
| A1 claims start | rc 0, stderr 0 bytes, **identical** to `b-round-417/claims-418-planning-output.txt` | `a-round-418/claims-start.txt` |
| A2 vitest 5 files | rc 0, **5 files, 117/117** | `a-round-418/a2-vitest.log` |
| A3 typecheck | rc 0 | `a-round-418/typecheck.log` |
| A3 lint | rc 0, 205 warnings + 1 info (= HEAD) | `a-round-418/lint.log` |
| A4 biome 3 code files | rc 0, no fixes | `a-round-418/biome3.log` |
| A5 claims end | rc 0, stderr empty; differs from planning only in K2 (`1 ?? 3 M total 4`), K5 `no`, K6 (doc 269 l.4 exact), K9/K10 (equal to `claims-418-sketch-output.txt`). K3 1314 rc 0, K4 rc 0, K2b 0 | `a-round-418/claims-end.txt`, `claims-end-vs-planning.diff` |
| A6 code-reviewer | dispatched (real subagent); 0 Critical/High/Medium; 5 Low + Architecture note | below |
| Doc | l.4 byte-exact; 7 TEMPLATE headings in order; mutant block `cmp`-equal to `b-round-417/mutants/summary.txt` | — |

Not run by A (gate rows): full vitest, build, `npm run verify`. No browser run by A (row 4–6 are C's).

## code-reviewer findings (score 8/10)
- **A-R418-REVIEW-L1 (Low, sketch logic):** `preview.client.ts` ~125-131 — `readTime` falls back to `start`, fixed at element creation; a same-url seek does not update it. Seek to 12 + throwing setter → `fail()` reports 0, fallback restarts at 0. No row covers it. Not fixed (sketch files are frozen; Low, not a STOP under L11). Doc ruling 5 wording corrected to say so.
- **A-R418-REVIEW-L2 (Low, pre-existing):** `getLibraryPreviewOffset` (~l.219) still reads `active.element.currentTime` unguarded (same class as GATE395-L1). Not fixed (frozen).
- **A-R418-REVIEW-L3 (Low, test naming):** PC12's title says "a stall after the seek" but its body dispatches `error`; stall-after-seek is only exercised in browser R1b. Confirmed by reading l.1110-1126. Not fixed (test file frozen); doc states it honestly.
- Reviewer L4 "doc cites missing evidence files": **false positive** — `tmp/studio-real-loop/b-round-417/sketch-review.md`, `mutants/summary.txt` and `a-round-418/a2-vitest.log` exist (outside the store repo; doc 268 uses the same convention). No change.
- Reviewer L5 (optional, old code): duplicated player-creation block (`ArrangementContext.tsx` ~1929-1935 and ~2021-2027). Not in scope.
- Doc fixes applied: typo "საჭიროე"→"საჭიროებს"; unverified `setTimeout` claim in alternatives softened; ruling-5 and R1b/PC12 wording made accurate; the three Lows listed in TODO.

## For B
- **Non-blocking question for B (not a STOP):** ruling 5 says a throwing getter returns "the request's start offset"; the sketch's `readTime` returns the element-creation `start`, which a same-url seek does not update (A-R418-REVIEW-L1, Low; only reachable when the `currentTime` getter throws after a seek). A changed neither the code nor the ruling; doc 269 describes the code's behaviour. B decides whether the prose or the code is intended.
- **Doc 269 was edited after the reviewer ran** (typo, softened alternatives sentence, ruling-5 / PC12 wording, three Lows in TODO). No code changed after the review (L11 re-review clause covers code).
- **Architecture note (proposal, not done):** reviewer Signal 3 — `ArrangementContext.tsx` preview region (~1785-1793, ~1909-2046) changed repeatedly across rounds 392–418. Proposal: one bounded `createLibraryPreviewController` in `app/lib/arrangement/` with injected `ensureDecoded`/`setStatus`/`decodedBuffers`/source-id setter, hook surface unchanged, PS/PC rows moved to unit tests. This is the already-open ARCH-CHECKPOINT-PREVIEW-AFTER-13C — count once.
- Reviewer confirmed keep-the-counter over per-request AbortController (no extra race caught, player signature stays frozen).
- New Lows above → `deferred_low_polish` per the 2026-10-23 gate (L1 + L2 could close together with a `readTime` on `ActiveStreamPreview` + updatable start; L3 is a rename).

## Exact next C checks
Per task §6: row 3 mutants (HEAD scratch, expect the 12 summary lines + one loaded replicate 40/40), rows 4–6 browser at 1440×900 and 1280×720 on the running server **http://127.0.0.1:5173** (R1/R1b/R10, R5, R6, R7, R9 → `ALL EQUAL` 14 cells; play-stop smoke; auth), then rows 1, 2, 7, 8. Extra probe worth adding: R1b is the only stall-after-seek coverage (A-R418-REVIEW-L3).

## B acceptance (A-owned) passed
A1 ✔, A2 ✔, A3 ✔, A4 ✔, A5 ✔, A6 ✔ (no Medium+ in sketch logic). C rows 1–8 are not claimed.

## Final doc re-verify (after all doc edits)
- l.4: `**სტატუსი:** Completed (C round 418 PASS)`
- l.4 byte-exact: yes
- headings: ## კონტექსტი|## მიდგომა|## არქიტექტურა|## შეცვლილი ფაილები|## პრობლემები და გადაწყვეტები|## ტესტირება|## TODO / შემდეგი ნაბიჯები|
- mutant block cmp-equal to b-round-417/mutants/summary.txt: yes
- status:
     M app/contexts/ArrangementContext.tsx
     M app/lib/arrangement/__tests__/library-preview-stream.test.tsx
     M app/lib/arrangement/preview.client.ts
    ?? docs/implementation/2026/quarter-IV/269-sys-preview-controller.md
- 7 headings equal TEMPLATE's 7 in order; every cited row (PS8, PS13, PS27, PC1–PC12) exists in the test file (grep).
- lessons.md A self-check read: L11 (no STOP condition: no Medium+, no code after review), L12–L15 N/A (no testids/classes/dialogs/colours), L26 ✔, L28 ✔.
