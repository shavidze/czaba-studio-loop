STOP — needs B ruling on A-R438-REVIEW-M1-NF2-TAG-NARROWING (code-reviewer Medium, not ruled in `b-round-437/sketch-review.md`; task §3 / L11). Measured: mutant M17 is red at HEAD and green on the sketch.

# A round 438 — SYS-R435-SOURCE-SCAN-HELPER (test-only)

- **Finding (Medium, origin: B spec — it is in the dispatched sketch `1b88d0ec…`):** HEAD's NF2 matched `NUMBER_INPUT = /type=["'`{]+number["'`}]+/g` over the whole file text, so `type="number"` on **any** element (e.g. `<Input type="number" />` from `~/components/ui/Input.tsx`, which forwards `type` and `className`) made the file an owner and turned the owner pin red. The ported NF2 (`studio-number-field.test.ts` l.16–19, `numberInputTags()`) selects only the lowercase `input` tag via `scanJsxOpeningTags('input', …)`. A capitalised wrapper with `type="number"` would now pass silently. IN1 also checks `input` only, and F10 covers only the Detail panel.
- **A verified it:** `git show HEAD:app/lib/arrangement/__tests__/studio-number-field.test.ts` l.8 and l.29–31 (whole-text regex), against the working-tree l.16–19. `grep -rnE "<[A-Z][A-Za-z]*[^>]*type=" app/components/arrangement` gives 0 hits, so **there is no false pass today**.
- **Measurement (L11).** Scratch trees under `a-round-438/m17/`: `old` = `git archive HEAD`, `new` = the same plus the 8 sketch test paths, each with a `node_modules` symlink; `store/` untouched. Mutant M17 adds a new file `app/components/arrangement/ArrangementMutantM17.tsx` that renders `<Input type="number" className="x" />` (from `~/components/ui/Input`). Running `npx vitest run app/lib/arrangement/__tests__/studio-number-field.test.ts`:
  - without the mutant: old rc 0, new rc 0;
  - with the mutant: **old rc 1** (NF2 owner pin red: received `['ArrangementDetailPanel.tsx', …(1)]`), **new rc 0** (2/2 green, a false pass).
  - Logs: `a-round-438/m17/old-base.log`, `old-m17.log`, `new-base.log`, `new-m17.log`.
- **Scope verified by A at HEAD:** NF2 is the only suite affected. At HEAD, RD2 already scanned only extracted `<input …/>` tags (`INPUT_TAG = /<input\b[\s\S]*?\/>/g`), and SF2 only scanned from `indexOf('<input')`. Neither saw capitalised wrappers at HEAD either, so their tag-name filters are not a narrowing. PG2's whole-text `<progress\b` is the separate Low L1 below. It is an assertion narrowed against HEAD, which conflicts with the task's "no assertion lost" rule (§3 item 3, L4) and with doc 285's line "არცერთი assertion არ დაკარგულა".
- **Why it is not ruled:** `sketch-review.md` has no row on wrapper or capitalised tags. Tech-lead v1 says "(d) right (… no capitalised wrappers under arrangement)", but that describes the current code. It is not a ruling on the narrowing against HEAD.
- **The reviewer's suggested fix:** select number fields by `attributes.get('type') === 'number'` on every JSX opening element, whatever the tag name, and pin non-`input` owners separately (an empty list today). This needs a helper variant that visits every tag. It is a sketch change, so A did not make it (task §3: "Do not hand-edit the sketch").
- **Options for B:**
  - (1) Accept the narrowing with a ruling line and a deferred Low, and C proceeds.
  - (2) Issue a v4 sketch with the attribute-based NF2, and reuse M17 above as its red-proof (it is ready to use).
  - Either way, doc 285's sentence "არცერთი assertion არ დაკარგულა" (section "შეცვლილი ფაილები") is A's addition, which task §3 item 4 does not require. Under option (1) it must be reworded to name the accepted narrowing. Under option (2) it holds again. A has left the doc untouched since the STOP.

**Tree state:** the last consistent state. The sketch is applied unchanged (8/8 `cmp` identical) and doc 285 is written. Nothing else changed. A changed no code after the review.

## Process
- Read: the `pre-flight` skill (gate stated in chat); primitives `AGENT_DISCOVERABLE_CODE.md`, `GEORGIAN_DOCS.md` and `TESTING_QUALITY_GATES.md`; `lessons.md`; the task; `sketch-review.md`.
- `/check` was applied as a scoped `npx biome check` on the 8 test paths (rc 0).

## Changed files (9 grants, nothing outside)
- `app/lib/arrangement/__tests__/helpers/source-scan.ts` (new, from the sketch)
- `app/lib/arrangement/__tests__/source-scan.test.ts` (new, from the sketch)
- `app/lib/arrangement/__tests__/studio-number-field.test.ts`, `studio-radio.test.ts`, `studio-progress.test.ts`, `studio-search-field.test.ts`, `studio-dialog-scrollbar.test.tsx`, `held-enter-source-scan.test.ts` (ported, from the sketch)
- `docs/implementation/2026/quarter-IV/285-sys-r435-source-scan-helper.md` (written by A: TEMPLATE headings in order, l.4 exactly `**სტატუსი:** Completed (C round 438 PASS)`, rulings (0) and (a)–(g), the closes table, the note on docs 277–282 and doc 282 point 7, and the (f) items). If B picks option (2), the doc's "Rulings" and "Changed files" sections need a matching edit.

## A's checks (logs in `a-round-438/`)
| # | Result | Evidence |
|---|---|---|
| A1 | PASS: `git apply --check` OK, applied, 8/8 `cmp` identical | `a-round-438/a1-cmp.txt` |
| A2 | PASS: 7 files, 23/23, rc 0 (2.54 s); slowest test 827 ms (17 % of 5 s) | `a-round-438/a2-covering.log` |
| A3 | PASS: `npm run typecheck` rc 0; `npm run lint` rc 0, 205 warnings (equal to `lint-sketch.log`); scoped `npx biome check` on the 8 paths rc 0 | `typecheck.log`, `lint.log`, `biome-scoped.log` |
| A4 | PASS: the claims script rc 0. Its diff against the planning output is exactly the lines in `claims-438-planning-vs-sketch.diff.txt` (K5, K9, K10), plus K2 (total 9, outside-grants 0) and K6 (doc 285 present) | `claims-438-a-output.txt`, `claims-planning-vs-a.diff.txt` |

**Not run by A** (gate rows or C rows): the full suite, `npm run verify`, the build, mutants and browser rows. No browser was used in this round.

## code-reviewer (required, 9 files; agent `code-reviewer`, verdict approve-with-findings, 8/10)
- **Medium:** M1 above → the STOP.
- **Low, new, for B to defer:**
  - **A-R438-REVIEW-L1-PG2-STRING-MARKUP:** HEAD's `<progress\b` text match also caught markup inside strings (for example `innerHTML`); the new PG2 sees only JSX and `createElement('progress')`.
  - **A-R438-REVIEW-L2-DS4-SF2-TEXT-CONTAINMENT:** DS4 (`studio-dialog-scrollbar.test.tsx` l.80) and SF2 (`studio-search-field.test.ts` l.61) still test containment on the whole tag text (`node.getText()`), so a JSX comment or a `data-…` attribute could satisfy them. This equals HEAD. A stronger form reads the attribute text by name.
  - **A-R438-REVIEW-L3-PARSE-DIAGNOSTICS:** the `ThisNodeHasError` guard (`helpers/source-scan.ts` l.66–76) misses scanner diagnostics that set no node flag. `npm run typecheck` covers this in practice.
  - The doc-status Low: the l.4 form is ruled by L28 (the post-PASS value) and is not a finding.
- **Confirmed (`confirmedBy` on the existing ids):** TL-R438-02 (MixFader `type`, `style`, then `{...props}`), TL-R438-04, TL-R438-N1, TL-R438-N2 (which also covers JSX attribute names and local declaration names) and TL-R438-N3 (`ArrangementDetailPanel.tsx:427` is fine today).
- **Positives the reviewer checked:** no `as`, `any`, `!` or `@ts-`; SS6 cleans up its temp dir; `STORE_ROOT` is correct; the doc's cited ids all exist (SS1–SS8, NF2, RD2, IN1, PG2, SF1, SF2, DS4, HS1, HS2, F10).
- **Architecture note (for B/root, not an in-round refactor):** six suites now depend on one helper. That is good: it removes the blind-spot class. But "which element counts as a number, radio or search field" still lives in each suite's tag-name filter, and M1 is the first case of that. Proposal: one bounded test-only task, together with SIG-R438-OTHER-SCANNERS, that adds an "all JSX opening tags with a literal `type`" query and a pinned list of allowed non-`input` owners, and moves NF2, RD2 and SF2 onto it.

## B acceptance criteria truly passed by A
- A1, A2, A3 and A4 (above).
- The code-reviewer row was run, and it produced the STOP.
- The round is **not** ready for C until B rules on M1.

## Next C checks (once B has ruled)
- C1/C11 SOURCE-SCOPE: the r438 manifest and the protected manifest.
- C2 PATCH-IDENTITY (8 files).
- C4 covering (7/23).
- C5 mutants (plus M17 if option (2)).
- C6 SWEEP, with an added `grep -rnE "<[A-Z][A-Za-z]*[^>]*type=\"number\"" app/components/arrangement` (0 expected).
- C7/C8 browser rows.
- C9 CLAIMS (allowed: K2, K5, K6, K9, K10).
- C10 DOC.
