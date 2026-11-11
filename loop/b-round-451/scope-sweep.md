# Scope sweep HEAD a8599a2 -> sketch v5 (B round 451 planning, advisor step 4)

Question: does any HEAD row scan fewer files, or exclude more, on v5? (The v4 miss: a shared exclusion list grew.)

Command: `python3 -I b-round-451/scope-sweep.py <HEAD teal> <HEAD gradient> <v5 teal> <v5 gradient>` -> `scope-sweep-raw.txt`.

| HEAD constant / filter | v5 | Verdict |
|---|---|---|
| TEAL_ALLOW_LIST, GRANTED_TEAL_FREE_SOURCES, GLOW_TOKENS, GRADIENT_TEXT_TOKENS, MIN_SCANNED_SOURCES, MIN_SCANNED_PERF_SOURCES, SPOTLIGHT_LOADER_PATH | EQUAL | same |
| RETIRED_CLASS_ALLOW_LIST, RETIRED_CLASS_PATTERN, RETIRED_TOKEN_PATTERN, MIN_SCANNED_SOURCES (gradient) | EQUAL | same |
| **BARREL_FILES (GT5 exclusion)** | **EQUAL (HEAD's 3)**; v4 had 5 | v5 fixes A-R451-REVIEW-M1-GT5-BARREL-SCOPE |
| GT5b exclusion | per dead module, its own `barrels` + `/index.ts` (Timeline: `components/audio/index.ts`, `components/index.ts`; email.server: none) | narrower than v4's 5 shared barrels (stronger) |
| DEAD_COMPONENTS | HEAD's 4 + CinemaCurtainLoader | superset (stronger) |
| GRADIENT_TEXT_ALLOW_LIST | key `styles/app.css .loading-brand` (was `.loading-brand`), hits 3 | ruled key format, D-29z1604 / task §4 |
| TEAL_PATTERN_SOURCE, GRADIENT_TEXT_PATTERN | moved into the helper | golden G1 `equal: true` (verbatim HEAD functions) |
| GT1 file filter `styles/app.css` or `styles/base/*` | all app CSS (5 files) | superset |
| HEAD `stripComments` (GT1/GT4 CSS reader) | `blankCommentsAndQuotedDelimiters` one-pass tokenizer | not in B's constant sweep; tech-lead review 4 compared both on 5 hostile CSS strings: v5 finds every HEAD hit plus a `"/*"`-in-string case HEAD missed (`sketch-review.md`) |
| `__tests__` skip in the walk | same in `listFiles` | golden G1 walk sizes equal (appTs 349, perfTs 17, appCss 5, appAny 354) |

Scope of B's own sweep: constants, lists and file filters; the CSS reader row comes from tech-lead review 4. Conclusion: on v5 every HEAD row scans a file set equal to or a superset of HEAD's, and no HEAD exclusion list is wider. HEAD-pin mutants N11 (root barrel alias) and N11b (audio barrel alias) prove the GT5 half both ways (mutants.txt, head-mutants/mutants.txt, v4-mutants/mutants.txt).
