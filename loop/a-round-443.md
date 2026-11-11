# A round 443 — SYS-3 stage 1 fix-up (C-R442-M1): held Enter/Escape after IME composition

**Status:** implementation complete, no STOP; awaiting C. No commit/push.

## Precondition
`bash b-round-442/claims-443.sh | grep -E '^K(1|2|5|6) '` → K1 `head 4aa3c82 gate442 published 4aa3c82`, K2 `total 0 outside-grants 0`, K5 `yes`, K6 `6b68ac9e67276bd9 expected 6b68ac9e67276bd9`. OK.

## Changed files (5, exactly `b-round-442/grants-443.txt`)
- `app/components/arrangement/ArrangementTempoRow.tsx` — sketch (git apply)
- `app/components/arrangement/ArrangementMarkerRow.tsx` — sketch
- `app/components/arrangement/ArrangementDetailPanel.tsx` — sketch
- `app/lib/arrangement/__tests__/ime-composition-ui.test.tsx` — sketch (IME6, IME7, IME1 status assertion)
- `docs/implementation/2026/quarter-IV/288-sys-3-stage-1-ime-composition.md` — line 4 `… C round 443 PASS)`; new `### Fix-up (round 443)` subsection under მიდგომა (ruling fact vs not confirmed, 3-site table, 7 mutant ids, both browser lines); შეცვლილი ფაილები line; IME6/IME7 names + IME1 assertion in ტესტირება; TODO: stage 2 gains shared settle-key helper + scan (SIG-R442) and TL-R443-G3; TLM-SYS3-IME-PLATFORMS gains the held-key step. (The previous doc had no separate held-key gap entry to remove.)

Sketch applied with `git apply --check` then `git apply -p1`; not hand-edited.

## A checks (actually run)
| # | Result | Evidence |
|---|---|---|
| A1 | 4/4 identical (`cmp`) | console; also K4 `4/4` |
| A2 | covering set: 60 files passed, 1118/1118 tests, rc 0 | `a-round-443/covering.log` |
| A3 | `npm run typecheck` rc 0; `npm run lint` rc 0 `Found 205 warnings.` (= HEAD); scoped `npx biome check` on 4 sketch paths rc 0 | `a-round-443/typecheck.log`, `lint.log`, `biome-scoped.log` |
| A4 | claims diff vs planning output: only K2 (`total 5 outside-grants 0`), K4 (`4/4`), K5 (`no`), K9 (`IME6 1 IME7 1`), K11 (line 4 `… C round 443 PASS)`) differ | `a-round-443/claims-after.txt` |

Not run by A (per speed rules): full suite, build, verify (gate); browser probes (C5–C7 are C's rows; A did not open a browser this round).

## Pre-flight / lessons
No separate pre-flight step was run: the code is B's dispatched sketch v2 (sha 6b68ac9e…), applied verbatim. Read: `lessons.md` (A self-check L11, L12, L26, L28), `GEORGIAN_DOCS.md`, `TEMPLATE.md` headings, `b-round-442/sketch-review.md` (tech-lead: approve v2, 0 Medium+). L26: IME1/IME6/IME7 rows exist (grep 1 each). L28: line 4 exact. Doc `## ` headings keep TEMPLATE order (the fix-up is a `###` under მიდგომა).

## Code review (actual `code-reviewer` subagent, on the final source; the later doc-only edit was not re-reviewed)
Verdict: 0 Critical/High/Medium, score 9/10. No source changed after review; sketch files untouched (A must not hand-edit the sketch).
- **Low A-R443-REVIEW-L1** `ime-composition-ui.test.tsx:312`: IME6 Clip Gain asserts `gain.value !== '-3'` (weak); suggest `toBe(shown)` as IME7 does. Not fixed (sketch file) → B, candidate for TL-R443-G3 / deferred_low_polish.
- **Low A-R443-REVIEW-L2** `ime-composition-ui.test.tsx:263-318`: IME6 covers three editors in one `it`; an early failure hides later ones. Not fixed (sketch) → B.
- **Info:** marker editor uses early `return` while group editor uses `if (!event.repeat) { settle }` (equivalent); Tempo mixes both forms (justified by the `skipCommitRef` order). HS1 still green.
- **Architecture note (proposal for B, not scheduled):** Enter/Escape + IME + repeat classification is duplicated in five handlers (TempoRow, MarkerRow, GroupHeader, DetailPanel ×2); suggest a bounded `inlineEditorKeyIntent(event)` helper next to `studio-ime-composition.ts`, ordering (stopPropagation, skipCommitRef) staying per owner. Matches SIG-R442-INLINE-EDITOR-KEYS / SYS-3 stage 2.

## Doc edits after review
Fix-up section made self-contained (IME6, IME7, IME1 assertion, TLM held-key step) and a round-443 A-checks line under ტესტირება. Claims re-run afterwards: same 5-line diff as A4.

## Known gaps
- Real OS IME held-key sequence is not confirmed (TLM-SYS3-IME-PLATFORMS, deadline RETRO 450).
- Plain (non-IME) held-key jsdom rows: TL-R443-G3 → SYS-3 stage 2.

## Next C checks
C1, C2, C3 (60 files/1118), C4 mutants (7 lines equal `b-round-442/mutants/results.jsonl`), C5 held-IME browser `ALL OK (18 cells)` + C5-HEAD control `NOT ALL OK (8 of 18 failing)`, C6 stage-1 neighbour `ALL OK (18 cells)`, C7 plain held `ALL SAME (18 cells)`, C8 smoke/auth, C9 doc 288, C10, C11. Browser rows before vitest (L38).

## Scope / acceptance
A1–A4 passed. C rows not claimed.
