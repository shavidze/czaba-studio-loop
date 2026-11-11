# A round 445: SYS-3 stage 2b (inline editor key intent + held Escape keeps the floating video)

**Implementer:** A (Claude Opus 5.5), 2026-11-11. Task: `current-task.md` (round 445). The store is uncommitted, and nothing was committed or pushed.

## Scope done
- Precondition (task §2.1): `claims-445.sh` K1/K2/K5/K6 printed exactly the expected lines (`a-round-445/claims-pre.txt`).
- §2.2: `git apply --check` + `git apply -p1 b-round-444/sketch-445.patch.txt`, rc 0. The sketch was applied unchanged, with no hand edits.
- §2.3 doc 288:
  - l.4 = `**სტატუსი:** Completed (C round 445 PASS)`.
  - The IME6 bullet = the new test title verbatim + ` (round 443; round 445-ში editor-ებად დაიყო)`.
- §2.4 doc 289:
  - l.4 = `**სტატუსი:** Completed (C round 445 PASS)`.
  - l.13 `(Windows AltGr, macOS Option)` → `(Windows/Linux AltGr)`.
  - One FT9 sentence added after the FT9 title bullet (AltGr only; macOS Option not covered, GATE444-L1-MACOS-OPTION deferred).
- §2.5 new doc 290: `docs/implementation/2026/quarter-IV/290-sys-3-stage-2b-inline-editor-key-intent.md`.
  - It uses the TEMPLATE headings in order and l.4 is exact.
  - It contains: the site table, the HEAD truth table + GATE443-L1 ruling, the video fix with both browser lines and the FV-HELD-is-synthetic note, gate-444 finding 3, the 12 mutant ids, the test titles, the tech-lead keep note, and the TODO ids. The TODO ids are GATE444-L1-MACOS-OPTION, A-R444-REVIEW-L1-ALTGRAPH-META, SIG-R444-COMPOSING-LIB-HELPER, TL-R445-I1 and TLM-SYS3-IME-PLATFORMS (RETRO 450).
- §2.6 grants: `git status` shows exactly the 13 granted paths (8 M + 2 new tests + 2 M docs + 1 new doc). No protected file was touched.

## Changed files (13 = `b-round-444/grants-445.txt`)
- app/components/arrangement/{ArrangementDetailPanel,ArrangementGroupHeader,ArrangementMarkerRow,ArrangementTempoRow,StudioWorkspace}.tsx, studio-ime-composition.ts (sketch)
- app/lib/arrangement/__tests__/{floating-video,ime-composition-ui}.test.tsx (sketch), ime-composition-stage2b-ui.test.tsx, ime-composition-source-scan.test.ts (sketch, new)
- docs/implementation/2026/quarter-IV/288-…, 289-… (edited), 290-… (new)

## A checks (actually run)
| # | Result | Evidence |
|---|---|---|
| A1 | 10/10 identical to `b-round-444/sketch-files/` | `a-round-445/a1.txt` |
| A2 | `npx vitest run $(cat covering-files.txt)`: 60 files, 1082 passed, rc 0 | `a-round-445/a2-covering.log` |
| A3 | typecheck rc 0; lint rc 0 `Found 205 warnings.`; `npx biome check` on the 10 sketch paths rc 0 ("Checked 10 files … No fixes applied") | `a-round-445/a3.txt`, `typecheck.log`, `lint.log`, `biome-scoped.log` |
| A4 | `claims-445.sh` after all edits vs `claims-445-sketch-output.txt`: no diff (rc 0) | `a-round-445/claims-after.txt`, `a4-claims.diff` (empty) |
| A5 | doc 290: each of the 12 mutant ids ≥ 1, `FV-HELD` 4, `GATE443-L1` 1 | `a-round-445/a5.txt` |
| L26 | every test title named in doc 290 exists in the test files (11/11 found once) | `a-round-445/doc290-tests.txt` |

I did not run the full suite or `npm run verify`; those are gate rows. A ran no browser probe and does not claim any C5–C7 browser result. Doc 290 cites B's planning probe lines (HEAD 8/14 failing, sketch ALL OK 14); C's run is the evidence that counts.

## Code review (3+ files rule; actual `code-reviewer` subagent run)
Verdict: **0 Critical/High/Medium**, score 9/10. All five handlers and the Workspace branch are equal to HEAD except the intended repeat guard. Lows (all inside B's sketch, so A did not change them, because A1/C2 require byte identity):
- **A-R445-REVIEW-L1**: IME12 drives composing only in the `isComposing` form. The keyCode 229 form is not covered for the group editor and From/To; IME6 covers BPM, marker and Clip Gain (`ime-composition-stage2b-ui.test.tsx:173-178`).
- **A-R445-REVIEW-L2**: IME12/IME13 use only the From field; To shares the handler but is not exercised (`…stage2b-ui.test.tsx:160`).
- **A-R445-REVIEW-L3**: the IME14 scan misses bracket access (`event['isComposing']`), a named constant for 229 and `'isComposing' in event`. The first overlaps TL-R445-I1; IME15's title claims somewhat more than the regex covers.
- Style-only: `ArrangementDetailPanel.tsx:779-783` `else if (event.key === 'Escape')` is always true there. B ruled this deliberately (tech-lead L1, typed list), so no action.

**Architecture note (for B, not a refactor instruction):** keep `inlineEditorKeyIntent` in `studio-ime-composition.ts`. It is a pure classifier; the effects and their order stay visible per component, and IME14 guards against hand-rolled bypasses. Do not extract a `useInlineEditorKeys`/handler factory: per-editor stopPropagation, key lists and blur differ, so a factory would be flag-driven. This agrees with tech-lead's keep note. No task.

## Known gaps / notes
- `lessons.md` is at `/home/runner/work/czaba-studio-loop/czaba-studio-loop/loop/lessons.md` (not under `tmp/studio-real-loop`). After the advisor pointed it out, A read the "Before handing over (A self-check)" part. L11: no STOP condition. The covering tests are green. The slowest covering test is CP12a, 3.5 s against its declared 30 s timeout (12 %), and none is above 50 %. L12–L15: no selectors, testids, dialogs or colours touched. L26: every doc 290 test title exists (11/11) and the TEMPLATE headings are in order. L28: l.4 is final.
- Pre-flight: A read the pre-flight skill and stated the gate (assumptions, files, success = A1–A5) before applying the sketch, in its session output. It was not written into a file before this report.
- Doc 290 fix-ups after the advisor, before hand-off:
  - the SIG-R444-COMPOSING-LIB-HELPER TODO line is cut to "(signal only, gate-444 Architecture note)", because its meaning is not recorded in the sources A could find;
  - the A-R443-REVIEW-L1/L2 context sentence is corrected per `a-round-443.md` l.32-33 (L1 = weak `!== '-3'` assertion; L2 = three editors in one `it`);
  - the testing section now says the browser lines are B's planning run (`b-round-444/probe/`) and adds A's actual results.
  - After the fix-ups A re-ran A4 (no diff), A5 (all ≥ 1), the test-title loop (11/11) and `git status` (13 paths). l.4 is unchanged.
- No browser verification by A. C5 (held Escape video), C6, C7 and C8 are open for C.
- The reviewer Lows above are proposals for B (`deferred_low_polish` candidates). The code did not change after the review; the only post-review edits were doc 290 prose.

## Acceptance A truly passed
A1, A2, A3, A4, A5 and the §2.6 grants check. B's §3 rows (C1–C11) are not claimed.

## Exact next C checks
C1 SOURCE-SCOPE → C2 PATCH-IDENTITY → C5 HELD-ESC-VIDEO (on :5173 + HEAD on :5177; expect tree `ALL OK (14 cells)` / `FRESH ALL SAME (14 cells)`, HEAD `NOT ALL OK (8 of 14 failing)` with the cells of `b-round-444/probe/compare-head.txt`) → C6 neighbour probes (`ALL OK (18 cells)` ×3) → C7 plain held (`ALL SAME (18 cells)`) → C8 smoke+auth, both viewports. Run C5–C7 before any vitest (L38). Then C3 covering (60/1082), C4 mutants (12 lines equal to `results.jsonl`), C9 docs (doc 290 headings, l.4, mutant ids, browser lines, GATE443-L1, TODO ids, tests exist; docs 288/289 l.4, IME6 bullet, l.13 AltGr, FT9 sentence; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0), C10 and C11 (claims diff empty).
