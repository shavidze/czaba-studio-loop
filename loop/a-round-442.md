# A round 442: SYS-3 stage 1 (IME composition guard)

**STOP — needs B ruling on A-R442-REVIEW-M1** (a held Enter/Escape after a composing first keydown; `b-round-441/sketch-review.md` does not rule it). Under L11 / task §2 ("a Medium+ finding that `sketch-review.md` does not rule is a STOP"), I did not change code for it. I did not edit the sketch, the test or doc 288's R3 for it either. The tree is at its last consistent state: the dispatched sketch applied byte-identically, plus doc 288. A1–A4 pass on this tree.

**No covering test is slow (L11 slow-test clause).** No covering test exceeds 50 % of its declared timeout. The slowest are:

| Test | Declared timeout | A's time | Gate 441 `verify.log` |
|---|---|---|---|
| CP12a–d | 30 s | 4.8 s | — |
| DXM3 | 20 s | 2.9 s | 2.3 s |
| TG1 | 20 s | 2.9 s | 2.4 s |
| UC5 | 20 s | 2.9 s | 2.4 s |
| UM1/3/4 | 20 s | 2.8 s | — |

## A-R442-REVIEW-M1 (code-reviewer: Medium; severity is not downgraded by A)

Reviewer text, per site. The first keydown is guarded. The reviewer assumes that the auto-repeat keydowns after it arrive as `isComposing: false`, keyCode 13/27, `repeat: true`.
- Group `ArrangementGroupHeader.tsx:304` and From/To `ArrangementDetailPanel.tsx:678` ignore repeats, so they are safe.
- Marker `ArrangementMarkerRow.tsx:982` filters only a repeated **Enter** (`studio-repeat-safe.ts:4`). A repeated **Escape** reaches `settleEditor('escape')` and discards the draft.
- Tempo `ArrangementTempoRow.tsx:260-270` has no repeat check. A repeated Enter blurs and commits; a repeated Escape discards the draft.
- Clip Gain Escape `ArrangementDetailPanel.tsx:776` has no repeat check. A repeated Escape reverts the text.

**Data for the ruling.** This is A's reading of the code; it was not measured. Sequence: a composing keydown, then non-composing repeat keydowns. That real IMEs deliver this sequence is a hypothesis; the reviewer could not confirm it either.

| Site / key | HEAD end state | Tree end state |
|---|---|---|
| Tempo Enter | first key blurs + commits | first key ignored; first repeat blurs + commits (same end state as HEAD, one repeat later) |
| Tempo Escape | first key cancels + blurs | first repeat cancels + blurs (same as HEAD) |
| Marker Escape | first key cancels the editor | first repeat cancels (same as HEAD) |
| Marker Enter | first key adds the marker | repeats filtered; editor stays open (better than HEAD) |
| Clip Gain Escape | first key reverts the text | first repeat reverts (same as HEAD) |

Inference: in every cell the held-key end state equals HEAD's or is better, so this is not a regression against HEAD. But the stage-1 goal ("a composing key never commits or cancels") does not hold for a held key on Tempo Enter/Escape, Marker Escape and Clip Gain Escape. If B rules a code change, the sketch, mutants and probe all need a new version.

**Optional held-key CDP probe: not run.** Any CDP `autoRepeat` run would be synthetic and would not show what a real IME does with repeats (`realVerified=false` for this question either way). I skipped it to stay inside the round. It is a candidate for B's ruling or for TLM-SYS3-IME-PLATFORMS.

## Changed files (7, exactly `b-round-441/grants-442.txt`)
- `app/components/arrangement/studio-ime-composition.ts` (new, from the sketch)
- `app/components/arrangement/ArrangementTempoRow.tsx` (sketch)
- `app/components/arrangement/ArrangementMarkerRow.tsx` (sketch)
- `app/components/arrangement/ArrangementGroupHeader.tsx` (sketch)
- `app/components/arrangement/ArrangementDetailPanel.tsx` (sketch)
- `app/lib/arrangement/__tests__/ime-composition-ui.test.tsx` (new, from the sketch)
- `docs/implementation/2026/quarter-IV/288-sys-3-stage-1-ime-composition.md` (new, written by A; line 4 is exact per task; Georgian; includes the site table, R1–R3, the 14 mutant ids, the HEAD repro 18/18, the stage-2 TODO and TLM-SYS3-IME-PLATFORMS)

The sketch was applied with `git apply -p1`, with no hand edits. Patch sha256 `0715fbdf…dc0d5` equals `sketch-442.sha256`.

## A's checks (actually run)
| # | Result | Evidence |
|---|---|---|
| Precondition | `K1 head 5d81795 gate441 published 5d81795`, `K2 status total 0 outside-grants 0`, `K6 sketch-applies yes` | `a-round-442/claims-before.txt` |
| A1 | 6/6 identical (`cmp`) | — |
| A2 | rc 0, 60 files, 1114/1114 | `a-round-442/covering.log` |
| A3 | typecheck rc 0; lint rc 0, 205 warnings; scoped Biome on 6 sketch paths rc 0 | `typecheck.log`, `lint.log`, `biome-scoped.log` |
| A4 | the claims diff equals `claims-442-expected-after-A.diff.txt` (K2 → 7/0, K5 6/6, K6 no, K7 2/5) | `a-round-442/claims-diff.txt`, `claims-after.txt` |
| Browser (extra, not a C row) | **Run 1: NOT ALL OK (1 of 18).** The failing cell is 1440x900 TEMPO-ENTER: `page.waitForFunction` timed out after 180 s. My inference, not verified, is that Vite was cold-compiling after the file changes. **Run 2 (the one replacement): ALL OK (18 cells).** Port :5173, no vitest running. | `a-round-442/ime-sites-tree.json` + `compare-tree.txt` (run 1), `ime-sites-tree-2.json` + `compare-tree-2.txt` (run 2) |

Not run by A (they are gate rows): the full suite, build and verify.

## Code-reviewer (actual `code-reviewer` subagent, score 8/10)
The reviewer had only Read/Grep/Glob, so it reviewed the working tree, not `git diff`.
- **M1 (Medium):** see the STOP above.
- **L1 (Low), A-R442-REVIEW-L1-NO-PLAIN-ESCAPE:** IME1–IME5 never send a plain **Escape** after a composing key. Only a plain Enter is checked.
- **L2 (Low), A-R442-REVIEW-L2-IME1-WEAK-FINAL:** IME1's final assertion (`ime-composition-ui.test.tsx:161`) checks only that `statusSequence` increased. It does not check that the tempo is 96.
- **Info:** propagation is safe (`StudioWorkspace.tsx:2731` uses the `isTypingTarget` early return). The marker/group R1 order is correct and pinned. Blur commit is unchanged. `keyCode` is `@deprecated` in the types but is kept per R2. Doc 288 matches the code.
- Not addressed by A: L1 and L2 would mean edits to the sketch test, which the task forbids. They are handed to B as they are.

**Architecture note (proposal for B/root, not acted on):** keyboard-safety rules for inline editors (the held-Enter check, the IME guard, stage 2 next) are copied by hand into each `onKeyDown`. Each copy has its own order, and that drift caused the uneven repeat handling in M1. The per-call-site guards stay for now. The proposal is one bounded task:
- a source-scan test, modelled on `held-enter-source-scan.test.ts`, that requires every Enter/Escape branch in `app/components/arrangement/` to call `isImeCompositionKeyDown` and a repeat check;
- optionally, a shared settle-key helper for the marker, group and tempo editors.

Cost: low.

## Acceptance status
- Passed: precondition, A1, A2, A3, A4, grants (7 paths only), doc 288 written to the task spec.
- **Not passed:** "no unruled Medium+ reviewer finding" (M1 is open, which is why this is a STOP).
- Not claimed: every C row and the gate rows.

## Known gaps
- M1 held key (above).
- Reviewer Lows L1 and L2.
- Real-platform IME (TLM-SYS3-IME-PLATFORMS, RETRO 450).
- Blur mid-composition (R3, Low).
- Stage 2 (`focus-source.ts` M1/I1, the Library search, Modal/sheet Escape).

## Next C checks (they wait on B's ruling of M1)
If B rules "no change in stage 1" (for example, it records M1 as a stage-2 item or a TLM item), C runs task §3 as written:
- C1 source scope;
- C2 patch identity;
- C3 covering 60/1114;
- C4 the 14 mutants;
- C5 claims plus the tag grep;
- C6 the IME browser probe at :5173. The first cell may need its cold-start replacement; see A's run 1;
- C6-HEAD control on :5177;
- C7 smoke + auth;
- C8 held-Enter neighbour. The MEDIT and GEDIT browser cells are worth running here because of M1;
- C9 doc 288;
- C10 source scope again at the end.

If B rules a code change, B must issue a new sketch, mutants and probe first.
