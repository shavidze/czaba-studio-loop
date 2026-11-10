# Architecture checkpoint request — ARCH-CHECKPOINT-SYS-2 (B, 2026-11-10, D-29z1511)

**For:** root. Run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`.
**Blocking:** no. Round 430 (SABA-B-12 stage 1) does not touch these files and runs regardless.
**Baseline:** `76f4147` (gate 429). SYS-2 is closed: stages 1–5, rounds 422 and 426–429, all C PASS and published.

## Why now
- This is a feature boundary: SYS-2 (held-Enter safety) is complete.
- Five rounds touched the same concern across Studio components.
- Gate 428, gate 429 and both A reviewers each raised the same Architecture note.

## Questions (keep or extract, value, risk; at most 3 sentences each)
1. **Per-button opt-in vs enforcement.**
   - Today: `onKeyDown={preventRepeatedEnterKeyDown}` on about 60 buttons (`app/components/arrangement/studio-repeat-safe.ts`), policed by the regex scan `app/lib/arrangement/__tests__/held-enter-source-scan.test.ts` (HS1/HS2).
   - Options: keep this; a Biome/AST lint rule; a `StudioButton` wrapper; a capture-phase listener.
   - Signals: SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT, SIG-R422-REPEAT-SAFE-BUTTON-PROPS.
2. **The delegated form.** `if (!event.repeat)` acts once while Enter or Space is always prevented. It is in GridMenu and MarkerMenu as menu containers, and in DetailPanel, Library and GroupHeader as element handlers. Should it get a sibling helper, or stay inline?
3. **Test helper.** Should one shared held-Enter test helper replace the per-file repeat fixtures (SIG-R427-HELD-ENTER-TEST-HELPER)?
4. **Known scan limits:**
   - TL-R429-06: parenthesised operands, bracket access, named constants.
   - A-R429-REVIEW-SCAN-NEGATED-REPEAT: a false positive on `!event.repeat && key === 'Enter'`.

   Does the answer to 1 remove them?

## Evidence
- Doc 277 (`docs/implementation/2026/quarter-IV/277-sys-held-enter-closing.md`): closure table and TODO.
- `gates/round-428/review.md` and `gates/round-429/review.md`: the Architecture notes.
- `a-round-429.md`, For B.

## After the result
B turns an approved change into one bounded task with a single owner and behaviour-preserving rows: all HK, HS, HM and HP rows stay green. Deferred Lows A-R429-REVIEW-SCAN-NEGATED-REPEAT, A-R429-REVIEW-EDITOR-REPEAT-ESCAPE and A-R429-REVIEW-ROW-ID-COLLISIONS go with it.
