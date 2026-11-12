# A round 473: STORE-2c-1 doc fix-up (C-R472-01)

**Status:** DONE (A side). Awaiting C round 473. No STOP.

## Start state (L11)
- `claims-473.sh` at start was byte-identical to `b-round-472/claims-473-planning-output.txt` (K1 3 paths / tracked diff `7a5ee8da803b7379`, K3 `d3af7582d8199712`, K4 `bb46efc7302706ef` + reverse-check rc 0, K5 `242b45e3f214c8f7`/116, K8 protected rc 0, `L58 OK`).

## Changed files
- `docs/implementation/2026/quarter-IV/306-store-2c-1-font-family-tokens.md` only. Full diff: `a-round-473/doc306.diff`.
- `app.css` (`d3af7582d8199712`) and `self-hosted-fonts.test.ts` (`bb46efc7302706ef`) byte-unchanged. `git status` still shows exactly the same 3 paths.

### Edits by line
| Line | Grant | Change |
|---|---|---|
| l.4 | exact (L28) | `… C round 473 PASS)`; byte-exact vs `b-round-472/doc306-l4.txt` |
| l.78 | exact | three constants; byte-exact vs `doc306-l78.txt` |
| l.79 | exact | FN4 reads only the comment-stripped Store `@theme {` block; byte-exact vs `doc306-l79.txt` |
| l.90 | exact | FN6 Inter/Playfair in single or double quotes; byte-exact vs `doc306-l90.txt` |
| l.96 | accuracy grant (reviewer finding 1) | "whitespace-ის მიუხედავად" overstated the FN6 regex (test l.229: `(?:^\|\n)body\s*\{[^}]*\bfont-family:\s*var\(--font-sans\);`). Now: whitespace is allowed only between `body` and `{` and after `:`, and `body` starts a line. Also "არც ერთი" → "არც ერთმაგი" (meant single quotes, matching l.90 and the `['"]` regex) |
| l.97 | accuracy grant (reviewer Info) | Citation added for the ST4/TH2 red claim: `b-round-471/mutant-obsidian-sans-georgia-siblings.log` (2 failed, 48 passed; checked: l.8 ST4 ×, l.45 TH2 ×, l.115). The claim itself is unchanged |

- Line count 116. Seven `## ` headings unchanged and in order. l.48, l.94 and l.106 still say "round 472". No new test or browser claims.

## Final K5/K6 lines (`a-round-473/claims-473-a-output.txt`, rc 0)
- K5 doc306 sha `d4c6551db072107e`, lines 116, l.4 `**სტატუსი:** In Progress (stage 1 of 4; C round 473 PASS)`
- K6 l.78/l.79/l.90 equal the granted files (checked with `diff <(sed -n Np doc) b-round-472/doc306-lN.txt`, all empty).
- K10: 'მთელ ფაილში' 0, 'obsidian ბლოკის ჩათვლით' 0, pending 0, 'ელოდება' 0, 'C5 ამოწმებს' 0.
- Compared with the planning output, only K5, K6 and K10 differ. Last line `L58 OK`.

## Checks actually run
- `npx vitest run app/lib/__tests__/self-hosted-fonts.test.ts`: rc 0, 6/6 passed (`a-round-473/vitest-fonts.log`). Source unchanged; sanity only.
- Claims script before and after the edits (see above).
- No typecheck or lint: no source changed, as the task says. Biome does not cover `.md`.

## code-reviewer (real subagent, read-only), score 9/10, no Medium
1. **l.96 whitespace overstatement (Low):** fixed (see table).
2. **l.4 "C round 473 PASS" not yet backed (Info):** kept. L28 requires the post-PASS form, and the line is granted byte-exact. `c-round-473.json` stays the source of truth.
3. **l.97 citation (Info):** fixed by adding the citation.
4. **l.79 is less complete than l.95 (Info, omission):** not changed. l.79 is granted byte-exact, and l.95 already carries the detail.
5. **l.95 "OFL ლიცენზია აქვს" is a global licence-dir check (Info):** already ruled a wording nit by B. Not changed.
- **Source notes (byte-locked, reported only, not edited):**
  - FN4 l.200–203: a duplicate token inside the Store `@theme` silently takes the last value.
  - FN4 l.196: the block ends at the first column-0 `}`, so a future flush-left nested at-rule would cut it short.
  - FN6 whitespace limits; SR-472-L2 (unquoted Inter) and A-R472-REVIEW-L4 (FN6 does not strip comments) are already ruled.
  - Suggested owner for all of these: STORE-2c-4, when the FN/TL rows are rewritten.
- **Architecture note:** none.

## Known gaps
- None in scope. The source notes above are proposals for B.

## Exact next C checks
- C1: same 3 paths; tracked diff sha `7a5ee8da803b7379`; `app.css` `d3af7582…`; test `bb46efc7…`; protected rc 0.
- C2: read the doc in full against the test and `app.css`. Expect l.4/78/79/90 byte-exact. Check that l.96 and l.97 (the edits above) are true against test l.229 and the siblings log.
- C3: run the hygiene greps.
- C4: run vitest 6/6.
- C5/C6: browser smoke at :5173 and the studio-token 401.
- C7: claims (K5/K6/K10 differ only).

## Scope completed
- A steps 1–5 are done. B acceptance is not self-marked; C2–C7 are C's.
