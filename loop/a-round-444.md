# A round 444: SYS-3 stage 2a (IME in Library search, sheet search, focus-source)

STATUS: A done → C. No commit/push.

## Scope completed
- Precondition `claims-444.sh | grep K1|K2|K5|K6` printed exactly the four required lines.
- Sketch `b-round-443/sketch-444.patch.txt` applied with `git apply --check` then `git apply -p1`. No hand edits.
- Doc 288 l.4 only → `**სტატუსი:** In Progress (stage 1 of 3; C round 443 PASS)`.
- Doc 289 created (Georgian, TEMPLATE headings in order; l.4 `**სტატუსი:** In Progress (stage 2 of 3; C round 444 PASS)`). Content: 4-site table, sheet-local vs Modal (TL-R444-L2), IME-owns-the-key + recorded native search clear (TL-R444-L1), TL-R444-I1 sentence, composing Tab (TL-R444-L3), held Escape (TL-R444-I2), AltGraph browser limit, 8 mutant ids, both browser lines, FT7–FT9 and IME8–IME10, TODO (stage 2b, TLM-SYS3-IME-PLATFORMS new step, TL-R444-L2 deferred). After the code review it also gained one sentence on the `stopPropagation` consequence.

## Changed files (8 = grants-444.txt; `git status` shows exactly 8)
- app/components/arrangement/ArrangementLibrary.tsx
- app/components/arrangement/ArrangementShortcutSheet.tsx
- app/components/arrangement/studio-ime-composition.ts
- app/lib/focus-source.ts
- app/lib/__tests__/focus-source-typing.test.tsx
- app/lib/arrangement/__tests__/ime-composition-stage2-ui.test.tsx (new)
- docs/implementation/2026/quarter-IV/288-sys-3-stage-1-ime-composition.md (l.4)
- docs/implementation/2026/quarter-IV/289-sys-3-stage-2a-ime-search-fields.md (new)

## A checks (actually run)
| # | Result | Evidence |
|---|---|---|
| A1 | PASS: 6/6 identical (`cmp`) | a-round-444/a1-cmp.txt |
| A2 | PASS: rc 0, 25 files, 440/440 | a-round-444/a2-vitest.log |
| A3 | PASS: typecheck rc 0; lint rc 0 `Found 205 warnings.`; `npx biome check` on the 6 sketch paths rc 0 | a-round-444/typecheck.log, lint.log, biome-scoped.log |
| A4 | PASS: claims-444.sh vs claims-444-sketch-output.txt, no diff (rc 0). Re-run after the last doc edit | a-round-444/claims-after.txt, claims-diff.txt (empty) |
| A5 | PASS: doc 289 has TL-R444-I1 ×1 and each of the 8 mutant ids ×1 (`grep -c`) | — |

Final re-check after the last doc 289 edit (the IME9/IME10 titles written out in full and the round-444 check results filled in): A1 still 6/6, A4 diff rc 0, A5 still ×1 each, `git status` shows exactly the 8 paths. L26: each of the 6 backticked test titles in doc 289 (FT7–FT9, IME8–IME10) gives `grep -cF` = 1 in its test file. The `## ` headings equal TEMPLATE's seven, in order. The forms `isComposing` and `keyCode229` match `IME_FORMS`.
L11 timeout check: 5 covering tests take more than 2.5 s (max 3.4 s, UC5). All 5 have declared timeouts of 15 s (render-budget) or 20 s (track-groups / track-group-collapse), so the worst is about 23 %, and gate 443's verify.log shows similar times (2.3–3.2 s). None is above 50 % of its timeout, so this is not a STOP.
Pre-flight: the gate was stated in chat before any change. The source was applied byte-for-byte from B's reviewed sketch. For the docs A read TEMPLATE.md, GEORGIAN_DOCS.md (60 of its 100 lines), doc 288 for style, and lessons L11, L12–L15, L26, L28 and L47.

Not run by A (gate or C rows): the full vitest suite, build, verify, the mutant runner (C4) and every browser row (C5–C8). A did no browser check.

## code-reviewer (actual subagent, 8 files)
Score 8.5/10. 0 Critical/High/Medium, so there is no STOP.
- **A-R444-REVIEW-L1 (Low, origin B spec):** `focus-source.ts:53-54,70`. The AltGraph check now runs before the modifier return and no longer excludes `metaKey`. In browsers that report macOS Option as AltGraph (Firefox), Cmd+Option+char stays on `pointer`. Suggested fix: `isFocusSourceAltGraphCharacter` requires `!event.metaKey`, plus an FT9 row. **Not fixed:** the sketch must stay byte-identical (A1/C2). Proposed for stage 2b.
- **A-R444-REVIEW-I1 (Info, existing behaviour):** `StudioWorkspace.tsx:2747-2754`. After a fresh Escape closes the sheet, held Escape repeats reach the floating-video handler, which has no `event.repeat` check, so the held key can collapse an expanded video. Proposed for stage 2b's held-key work (TL-R443-G3).
- **Info, addressed in doc 289:** the capture-phase `stopPropagation` means a future Escape handler on the sheet input never runs while composing or on repeat. One sentence was added to the Rulings.
- **Info:** `key.length === 1` misses non-BMP characters. The same limit exists elsewhere in the file; no action.
- **Architecture note (for B, not acted on):** keep. There is no extraction: `studio-ime-composition.ts` holds the native and React forms of one predicate, and stage 2b adds the shared settle-key helper. A `Modal` `shouldCloseOnEscape` predicate is the alternative for the deferred Modal round (TL-R444-L2) once the protected ExportDialog question allows it.

## Known gaps
- Real IME platforms, the native search clear under a real IME, and AltGr/Option are TLM-only (TLM-SYS3-IME-PLATFORMS). They cannot be verified in this Chromium.
- B acceptance criteria marked passed by A: A1–A5 only. Nothing in C1–C11 is claimed.

## Exact next C checks
C1/C10 scope = these 8 paths. C2 6/6 cmp. C3 covering set: 25 files, 440. C4 mutants 8/8 equal to results.jsonl. C5 `ime-stage2.mjs` → `ALL OK (18 cells)`, plus the HEAD control on :5177 → `NOT ALL OK (14 of 18 failing)`. C6 ime-sites and ime-held → both ALL OK. C7 focus-targets → `ALL SAME (6 cells)`. C8 smoke + auth. C9 docs 288/289 l.4 byte-exact, TEMPLATE headings, named tests exist, `C round N pending` grep = 0. C11 claims diff.
