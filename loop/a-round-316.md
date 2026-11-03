# A round 316: PERF-7 self-hosted fonts

No STOP was hit. Every row below was actually run on 2026-11-03 against the base `c136dfd`.

## Changed files (40 entries in `git status --short --untracked-files=all`)
- M `app/root.tsx`, `app/styles/app.css`, `app/routes/studio-lab.tsx`, `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx`: applied from `b-round-315/sketch.patch.txt`. Each is `cmp`-equal to its `sketch-*.txt`.
- ?? `app/assets/fonts/fonts.css`, `app/lib/__tests__/self-hosted-fonts.test.ts`: from the sketch, `cmp`-equal.
- ?? 25 `app/assets/fonts/*.woff2` and 5 `app/assets/fonts/licenses/OFL-*.txt`: copied with `cp` from `fonts-src/`.
- M `app/lib/third-party-licenses.ts`: new `NOTICES_FONTS_SECTION`, rendered right after `NOTICES_LAME_SECTION` (§4.2).
- M `app/lib/__tests__/third-party-licenses.test.ts`: new describe `TL10` with 3 `it`s.
- M `THIRD_PARTY_NOTICES.md`: regenerated with `-u`. The only change is the inserted fonts section (19 lines added, 0 removed), placed between LAME and MPL-2.0.
- ?? `docs/implementation/2026/quarter-IV/229-perf-self-hosted-fonts.md`.
- No change outside the §5 grants. Protected files: `sha256sum -c b-round-312/protected-sha256.txt` gives 11/11 OK.

## Rows run
| Row | Result |
|---|---|
| A-CLAIMS | PASS. `claims-316.sh` output is identical to `claims-316-head-output.txt` (empty diff) |
| A-APPLY | PASS. `git apply --check` and `git apply` OK. woff2: 25 OK. Licences: 5 OK. All 6 §4.1 files `cmp`-equal |
| A-NOTICES | PASS. The TL file gives 70/70 with `-u` and 70/70 without `-u` (after the final wording fix) |
| A-TYPE | PASS. `npm run typecheck` rc 0 |
| A-LINT | PASS. `npm run lint` rc 0 (205 warnings and 1 info, repo-wide and pre-existing). Biome on the 6 owned `.ts`/`.tsx` files: only the 3 known `noDangerouslySetInnerHtml` warnings in `root.tsx` |
| A-UNIT | PASS. The 16 files of §7 step 4 give 236/236. That is B's 233 plus the 3 TL10 tests. Slowest test 90 ms; the default timeout is 5 s. I re-ran all 16 files after the final notices wording: 236/236 again, and the tree still has 40 entries |
| A-MUTANTS | PASS. `unit-mutants-316.py` on scratch `/tmp/a316-scratch` matches `precheck-unit-mutants-316.txt` exactly (12 red, restored 17 passed). MU-NOTICES-DROP-FAMILY (drop the Inter bullet) is red on TL10 and TL5, and 70/70 after restoring. I re-ran it after the wording fix |
| A-DOC | Done. Doc 229 has l.4 `**სტატუსი:** Completed (C round 316 PASS)` and the 7 TEMPLATE headings in order. It cites FN1–FN5, TH7, TL10 and C's row names |
| A-REVIEW | `code-reviewer` ran (agentId ac786171be8b89a03): score 8.5/10, 0 Critical/High/Medium. See below |

I did not run the full suite, the build, `verify` or the browser rows; they belong to the gate and to C.

## Review findings
- **Low, fixed** (`third-party-licenses.ts`, inside the grant): the reviewer flagged "not renamed" as an overstatement, because the file names differ from Google's hashed URLs. The notices now say the fonts are not re-subset, re-encoded or renamed, "(only the file names differ from the Google Fonts URLs)". The TL10 words (`unmodified`, `Google Fonts`, `sha256`, both RFNs) are kept.
- **Low, fixed:** the notices said the licence text "ships next to the font files". Nothing imports the `.txt` files, so they are not in `build/client`. The wording is now "its licence text is in the repository at the path below". Regenerated and re-tested.
- Not re-reviewed, because both fixes were Low and text-only. L11's re-review applies to Medium+.
- **Proposals for B (frozen sketch files, not edited):**
  - A-R316-REVIEW-P1 (Low): FN4 checks only the generic OFL 1.1 header. Swapped licence texts would pass. Proposal: check line 1 of each file for its family or copyright holder, and check for the RFN in the Playfair and Plex files.
  - A-R316-REVIEW-P2 (Low): FN1 scans only `app/**` `.ts`/`.tsx`/`.css`, not `public/`, `vite.config.ts` or `*.html`. The reviewer's repo-wide grep found Google hosts only in tests.
  - A-R316-REVIEW-P3 (Info): the `.` in TH7's file-name regex is unescaped. TH7 proves only the dev href suffix; a single download is proven only by C's FONT-NET and FONT-PRELOAD.
  - A-R316-REVIEW-P4 (Info): the two Noto `data:` stubs mean a future CSP needs `font-src 'self' data:`.
  - A-R316-REVIEW-P5 (Info): the doc 229 premise table has no raw FCP/DCL columns (copied from B's §0.1). C may add them from FONT-NET.
- **Architecture note:** none. The reviewer considered `@import` of `fonts.css` inside `app.css` (one fewer request) and recommended keeping the separate link. FN1 and FN5 enforce that. Revisit only if PERF-11 shows the request on the critical path.

## Known gaps
- No browser row was run by A. Real hrefs, the single download, pixels, glyphs, FCP and cache headers are unproven until C runs them.
- B's acceptance rows marked passed here are only A-CLAIMS, A-APPLY, A-NOTICES, A-TYPE, A-LINT, A-UNIT, A-MUTANTS, A-DOC and A-REVIEW.

## Next C checks (exact)
- SOURCE-SCOPE: 40 entries; protected 11/11.
- CLAIMS: re-run, then compare with `claims-316-sketch-output.txt`. Expected differences: K2 `40 c136dfd`, K9 229, and K10 gains `## Fonts (SIL Open Font License 1.1)`.
- SKETCH-EQUAL.
- UNIT and mutants, plus MU-NOTICES-DROP-FAMILY (remove the line `'- Inter: ...rsms/inter',` from `NOTICES_FONTS_SECTION`: TL10 and TL5 go red).
- Browser rows: FONT-NET, FONT-PRELOAD, FONT-CACHE, FONT-PIXEL, FONT-GLYPHS, FCP, PERF-LOAD (alone), G316-AUTH on :5173.
- NOTICES: the section text changed from B's description only in the two reviewer wordings above.
- DOC.

## Scope
Round 316 A work is complete. PERF-7 is not done until C PASS and the gate.
