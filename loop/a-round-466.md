# A round 466: STORE-2b-3c-2b (test-only), the zero-offset glow scanner forms

**STOP — needs B ruling on a code-reviewer Medium: TS8 cannot detect removal of the `/shadow/i` pre-check (`app/lib/__tests__/store-teal-sweep.test.ts:161`).**
The task's step 6 says any Medium+ is a STOP (L11) and is not fixed in place. The fix the reviewer asks for (retitle TS8, replace line 161) would touch a hash-pinned sketch file. I did not edit it. The tree is at the last consistent state: the sketch is applied, doc 304 is written, and doc 299's line 4 is set. Measurement: §3.

## 1. Changed files (all granted)
- `app/lib/__tests__/helpers/style-scan.ts`: the sketch only. Post-image sha OK.
- `app/lib/__tests__/store-teal-sweep.test.ts`: the sketch only. Post-image sha OK.
- `docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md`: new.
- `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md`: line 4 only (`git diff -U0` shows one hunk at line 4).

## 2. Steps and results
| Step | Command | Result |
|---|---|---|
| 1 | Both manifests (`sha256sum -c --quiet`), r465 and `b-round-318/protected-sha256.txt`; `git status` | manifestRc 0, protectedRc 0, 0 status lines, HEAD `6d321c7` (`a-round-466/start-state.txt`) |
| 2 | Read the primitives | Read `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md` and the pre-flight skill |
| 3 | `git apply` the sketch (sha `06b2af46…44da`), then `sha256sum -c sketch-466-files-sha256.txt` | apply rc 0; both OK, rc 0. `git diff -- app` saved as `a-round-466/applied.patch.txt` |
| 4 | Doc 304 and doc 299's line 4 | Both line 4s are exactly `**სტატუსი:** Completed (C round 466 PASS)`. The 7 TEMPLATE headings are in order (diff empty). The bracket grep `[a-z]-\[` or `\[[a-z-]+:` gives 0 hits. `C round N pending` gives 0 hits. The doc names the 3 closed ids, the backgroundClip ruling and B-R465-TEST-FIXTURE-CSS-LEAK, and cites only TS7 and TS8 |
| 5 | tw-doc-leak | **Deviation:** the literal command `node <copy> . <doc>` exited rc 1 (Tailwind `resolve 'tailwindcss' in 'app/styles'`, because the root was relative). The rerun with the absolute store root (`node <copy> "$PWD" <doc>`) gave rc 0: `files scanned 1308 doc scanned true`, `docCandidates 65 extraOnlyInDoc 5 cssEqual true` (`a-round-466/tw-doc-leak.txt`). The copy was deleted |
| 6 | `npm run typecheck` | rc 0 (`a-round-466/typecheck.log`) |
| 6 | `npx biome check` on the 2 files | rc 0, "Checked 2 files … No fixes applied" (`biome.log`) |
| 6 | `npx vitest run` on the 4 covering files | rc 0, **4 files / 31 tests passed**; TS7 and TS8 are listed (`vitest.log`). Slowest is LT7 at 371 ms, far below 50 % of 5 s |
| 6 | code-reviewer (actual subagent) | **1 Medium** (the STOP), 4 Low, Info. Score 8/10. Details: §4 |

I did not run the full suite or verify; the gate does that.

## 3. Measurement for the Medium (scratch copy, store tree untouched)
**§3a.** I built a scratch copy with the task's copy recipe: `git archive 6d321c7` plus the 4 granted files and a `node_modules` symlink. The sketch's post-image sha was OK. I deleted only the 3 pre-check lines (`if (!/shadow/i.test(source)) { return 0; }`) from the copy's `style-scan.ts` and ran the 4 covering files.
- **Result: rc 0, 4 files / 31 tests passed, TS8 included** (`a-round-466/noprecheck-vitest.log`).
- This confirms the reviewer's Medium: no covering test detects removal of the pre-check. I deleted the scratch copy afterwards. The store tree was not touched.

Options for B (A's suggestion, not a decision):
- (a) accept TS8 as a case-insensitivity and no-false-skip row, and retitle it in a follow-up;
- (b) re-dispatch with a revised sketch: change the TS8 title, and replace line 161 with a test that observes the skip. A no-shadow source with a construct the regex would otherwise count is impossible, because every alternative contains "shadow", so the skip can only be shown by timing or by a spy;
- (c) rule the Medium a Low and proceed to C.

## 4. code-reviewer findings (unfixed, for B)
- **Medium (STOP):** TS8 line 161 (`margin … padding …`, no "shadow") returns 0 with or without the pre-check. Only lines 162 and 163 can go red, and only when the pre-check loses its case-insensitivity or checks the wrong word (B's mutants M6 and M7 turn TS8 red). Deleting the pre-check entirely leaves TS8 green. The reviewer calls this unavoidable for an optimisation that does not change results. The title "skips only sources without the word shadow" claims more than the test proves.
  - **A's view, not a regrade:** B's corpus compare (657 files equal) is the evidence that the pre-check changes no result. None of the 13 mutants removes it.
  - Doc 304's TS8 line says only what each fixture returns, so the overclaim is in the test title alone. The reviewer suggested also rewording doc 304. I left the doc as it is, pending B.
- **Low:** the TS7 negative fixture `margin: '0rem 0 12px'` (line 154) has no "shadow", so the pre-check returns 0 before any regex runs. It does not test `ZERO_LENGTH` in a shadow context.
- **Low:** the `\.0+` branch of `ZERO_LENGTH` (`.0`) and multiple zeros (`00`) have no fixture and no mutant.
- **Low:** the function and concatenated blurs are tested only in the inline/CSS form, not in the Tailwind arbitrary, arbitrary-property or `drop-shadow(` alternatives.
- **Low:** there is no negative fixture for a ring built by concatenation (`'0 0 0 ' + w + 'px red'` gives 0 today, but nothing pins it).
- **Info:** a signed blur (`0 0 +8px`) is not counted, and `08px` was already missed at HEAD. The possible false positives are all fail-safe. No ReDoS risk was found. The pre-check is a necessary condition, because all 4 alternatives contain a literal "shadow". `setProperty('box-shadow', …)`, `boxShadow = '…'` and `--tw-shadow` are still not detected (pre-existing gaps, out of scope).
- **Reviewer claim refuted:** "Chromium 22 fixtures unsourced". `b-round-465/probe/glow-computed.json` has `allOk` true and 22 rows.
- **Reviewer caveat accepted:** doc 304's "build byte-identical" rests on B's build with the placeholder doc. For the final doc, only the `cssEqual true` proxy covers it until C7.
- **Architecture note (a proposal for B/root, not done):** signal 3, repeated costly edits to `style-scan.ts:56-66`. The reviewer's decision is keep. If this region changes again, one bounded task could move the glow fixture tables into a shared data list, mapping every regex branch to at least one positive and one negative fixture, and make the 13-mutant set a repeatable script.

## 5. Acceptance (B §2 steps), truthfully
- Steps 1–5: done (step 5 with the absolute-root deviation above).
- Step 6 commands: typecheck 0, Biome 0, covering 4/31 PASS.
- **Step 6 review gate: NOT passed (Medium → STOP).** The round is not complete on A's side. B rules.
- Step 7: this file.

## 6. Exact next checks for C (if B lets the round proceed as is)
C1/C12 scope: exactly 3 `M` (the two test files and doc 299) and 1 `??` (doc 304). The r465 manifest FAILs only those 3 paths, and protected rc is 0. Then C2 patch-equal, C3 covering 4/31, C4 mutants 13/13 on the tree, C5 corpus 657, C6 the probe with 22 rows plus C's own `0pt` and concat cases, C7 build compare 0 differing lines (this is the first real build check of the final doc 304), C8 auth + smoke, C9 docs (read `a-round-466/tw-doc-leak.txt`, from the absolute-root run), C10 and C11 claims.

## 7. Known gaps
- The reviewer's Lows above are unfixed (the sketch files are frozen).
- The final doc 304 has not been built by A. Only the Tailwind oxide proxy (`cssEqual true`) was run.

## 8. End state (`a-round-466/end-state.txt`)
- Post-image sha rc 0, protected rc 0.
- The r465 manifest FAILs only the 3 granted modified paths.
- `git status`: 3 `M` + 1 `??` (doc 304). HEAD `6d321c7`.
- No temp file at the store root. The scratch copy was deleted.
