# A round 448 — STORE-2b-2b: Hire-Us inquiry e-mail leaves teal, readable in every client

**Status:** implementation complete, handed to C. No STOP. Nothing committed/pushed.
**Baseline:** `cce5eda` (clean at start). Evidence folder: `a-round-448/`.

## Changed files (6, all in `b-round-447/grants-448.txt`)
- NEW `app/lib/hire-us-inquiry-email.server.ts` (from sketch)
- M `app/routes/hire-us.tsx` (from sketch)
- NEW `app/lib/__tests__/hire-us-inquiry-email.test.ts` (HE1–HE7, from sketch)
- NEW `app/lib/__tests__/hire-us-inquiry-email-contrast.test.ts` (HE8–HE9, from sketch)
- M `app/lib/__tests__/store-teal-sweep.test.ts` (exact counts, TS5 perf scan, from sketch)
- NEW `docs/implementation/2026/quarter-IV/293-store-2b-2b-hire-us-email.md` (written by A)

The five code/test files are exactly the dispatched sketch (`sketch-448.patch.txt`, sha256 `76965797…8afe` = `sketch-review.md`), `git apply` clean, no hand-port, no edits after apply. Proof: `cmp` of each of the 5 files against the scratch `/tmp/a448-scratch` (`cce5eda` + sketch, commit `f9d5e3e`) = identical, all 5.

**Process notes (truthful):** pre-flight gate stated before applying. Primitives: AGENT_DISCOVERABLE_CODE, TESTING_QUALITY_GATES, API_ERROR_HANDLING and SECURITY_AUDIT were skimmed by heading only (the code is B's frozen, reviewed sketch; A wrote no code). GEORGIAN_DOCS.md was read in full only after doc 293 was first written; on re-check, doc 293 fits it (Georgian prose, English technical terms, no code comments), and its structure follows `docs/implementation/TEMPLATE.md`. `/check` (`.claude/commands/check.md`) prescribes `npm run verify` + e2e smoke; per the speed rules A ran only scoped checks (below). verify/smoke were not run and belong to the gate.

## Steps and actual results
1. **Claims pre-edit:** `claims-pre.txt` identical to `claims-448-planning-output.txt` (K19 0/0).
2. **Sketch apply:** sha256 matched; `git apply --check` + apply rc 0.
3. **Mutants** (scratch `/tmp/a448-scratch` = `cce5eda` + sketch, committed, node_modules symlink): 10/10 red on exactly K13's rows — `mutants.txt` (M1 HE4; M2 HE3; M3 HE1 HE2 TS1 TS3; M4 HE5 TS1 TS3; M5 TS2; M6 TS5; M7 HE2; M8 HE9; M9 HE3 HE8 HE9; M10 HE6).
4. **Doc 293:** l.3 `**თარიღი:** 2026-11-11`; l.4 exactly `**სტატუსი:** In Progress (stage 2b-2b of STORE-2b; C round 448 PASS)`; 7 TEMPLATE headings in order; 0 `pending`; cites only HE1–HE9, TS1, TS2, TS3, TS5 (all exist). Mutants and browser measurement are labelled as process evidence, not repo tests.
5. **Checks:**
   - `npx vitest run $(cat covering-448.txt)`: 6 files / 71 tests passed, rc 0, 2.2 s; slowest HE5 529 ms (default 5 s timeout, < 50 %) — `vitest-covering.log`.
   - `npm run typecheck` rc 0 — `typecheck.log`.
   - `npm run lint` rc 0, 205 warnings; HEAD `cce5eda` measured on scratch = 205 — `lint.log`.
   - `npx biome check` on the 5 code/test paths rc 0, 1 warning = pre-existing `hire-us.tsx:162` `noLabelWithoutControl` (K23) — `biome-scoped.log`.
   - `npm run build` rc 0; `grep -rl buildHireUsInquiryEmailHtml build/client` = 0 files (build/server = 1) — `build.log`.
6. **E-mail capture + Chromium measurement** (B's §6 commands; contrast script copied to `/tmp/a448-tools`): `email-a.html` is byte-identical to B's `probe/hire-us-email-sketch.html`; light client 12 rows / 0 failing, dark 12 / 0 failing, min ratio 7.06 (= K11) — `email-a.json`, `email-a-shot-light.png`, `email-a-shot-dark.png`. Structure diff vs HEAD capture (`email-structure-diff.txt`) = only the ruled changes (outer table/tr/td, div `background-color`/`color`, message box `background`→`background-color`), identical to B's sketch diff.
7. **Claims post-edit:** differences vs planning only in K3 K4 K7 K9 K16 K19 K24 K25; K3/K4/K7/K9/K24/K25 equal `claims-448-sketch-output.txt`; K16 = doc l.4; K19 `dirty-outside-grants 0 dirty-in-grants 6` — `claims-diff.txt`, `claims-post.txt` (K16 re-checked after the post-review doc edit: l.4 unchanged).
8. **git status:** exactly the 6 granted paths.

## Code review (real `code-reviewer` subagent, 6 files) — score 8/10, no Critical/High
- **Scope caveat:** review 1 had no shell and could not open HEAD, so it did not verify that the action is preserved. A saved `a-round-448/hire-us-route.diff` and `hire-us-HEAD.tsx.txt` and ran a **delta review** (score 9/10, no Critical/High). It found: action behaviour preserved (validation, no-key 500, fetch, sender, replyTo, subject text and escaping, fallbacks, responses); `escapeEmailHtml` body identical to HEAD's `escapeHtml` (only the parameter name changed, `str`→`value`); all 6 user-value sinks escaped, none newly unescaped; template equal to HEAD apart from the ruled changes. Its one Low (h2/h3 brand colour → foreground) is the task's own colour map, so it is intended.
- **M1 (Medium, reviewer's severity): "nothing pins the template to HEAD"** (no golden-string test). See "For B".
- **L1** HE8 title says "its own inline colour" but checks own-or-inherited: = B's already-deferred D1; doc describes it correctly. Not changed.
- **L2** HE9 falls back to `#000/#fff` (21:1) when a colour is unresolved, so HE9 alone could pass vacuously (HE8 catches it). Proposal `A-R448-REVIEW-L2`.
- **L3** message box `background:`→`background-color:`: intended per task "Ruling lines". No action.
- **L4** doc cited mutants/measurement as if tests → **fixed** in doc 293 (labelled process evidence).
- **L5** doc said the `td` "keeps" padding although the `td` is new → **fixed**.
- Only doc 293 wording changed after review (no code), so no re-review run.
- **Architecture note:** none ("bounded, pure, single-owner change — keep it").

## For B
- **A-R448-REVIEW-M1-GOLDEN** (reviewer: Medium). There is no golden or visible-text-order test that pins the builder template to HEAD; HE5 compares the builder with itself. Not applied, because the sketch is frozen (L11). This round it is covered empirically: the A structure diff equals B's 10-line `email-structure-diff-sketch.txt`, and C4 checks the same. B rules on the severity and schedule.
- **A-R448-REVIEW-L2** (Low): HE9 falls back to #000 on #fff when a colour cannot be resolved, so HE9 alone can pass vacuously.
- Architecture note: none.

## B acceptance A truly passed (A side only)
- §2 steps 1–8 as above.
- Not claimed: any C row, the `/hire-us` page no-change browser check (A did not run it this round), real mail-client rendering.

## Known gaps
- No real Brevo send and no real mail-client rendering (cloud has none) → TLM-R448-HIREUS-EMAIL-CLIENTS.
- Deferred pre-existing action Lows (TL-R448-L6-*) intentionally untouched.
- SABA-Q-HIREUS-EMAIL-THEME awaiting Saba; dark ships.
- Full suite / `npm run verify` not run (speed rules; gate's job).

## Exact next C checks (B's rows, task §3)
- **C1 SOURCE-SCOPE:** A sees 6 granted paths, 0 outside.
- **C2 CLAIMS:** A's post diff = the allowed Ks only; K3 teal-total 20.
- **C3 EMAIL-CONTRAST:** A tree result: light 0/12 failing, dark 0/12, min 7.06. C also reproduces HEAD (10/12 light, 1/12 dark).
- **C4 EMAIL-STRUCTURE:** A's `email-structure-diff.txt` (10 lines) equals `email-structure-diff-sketch.txt`.
- **C5 EMAIL-ESCAPE:** not run by A (`<img onerror>` payload, unknown project type).
- **C6 HIRE-US-PAGE** at 1440/1280/375 against HEAD on `:5178`: not run by A.
- **C7:** BLOCKED (no Brevo key or mail client in the cloud).
- **C8 COVERING:** A got 71/71.
- **C9 MUTANTS:** A got 10/10 = K13.
- **C10–C12:** not touched by A's diff, which has no Studio or style files.
- **C13 DOCS:** l.4 exact; 7 headings in order; ids HE1–HE9, TS1, TS2, TS3, TS5 and M1–M10; 0 `pending`.
