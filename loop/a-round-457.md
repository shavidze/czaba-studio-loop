STOP — needs B ruling on A-R457-REVIEW-M1 (task §2 STOP list: "a new silent-drop form of the walker"): the walker resolves a directory specifier to a same-name sibling file; fail open, invisible to LT9

# A round 457 — STORE-2b-3c-2a re-dispatch

- **Source.** The code-reviewer, Medium, run on the applied delta. A reproduced it on the scratch (`/tmp/a457-scratch`, db95f40 + sketch-456 + delta-457). The probe source is `a-round-457/zz-a457-probe.test.ts`; copy it into a scratch's `app/lib/__tests__/` to replay. Its output is in `a-round-457/probe-dir-slash.txt`.
- **The bug.**
  - `resolveSpecifier` (tree `style-scan.ts:82-93`) strips a trailing `/` and `/index`; `scriptFileFor` (tree l.412) then tries `X.ts`/`X.tsx` before `X/index.ts`.
  - Three origins:
    - the `/index` strip is at HEAD `db95f40` (l.85, used then only by GT5b);
    - the walker that turns this resolution into a mount verdict came with the unpublished round-456 sketch;
    - the trailing-slash strip comes from this round-457 delta (M32 pins it).
  - So `'~/lib/u/'` and `'~/lib/u/index'` resolve to `lib/u.ts`. **TypeScript resolves them to `u/index.ts`:** A measured this with `tsc --noEmit --moduleResolution bundler` in `/tmp/a457-tsc`, using `u.ts` exporting `Z`, `u/index.ts` exporting `Y`, and an importer of `{ Y } from './u/'`, `{ Y } from './u/index'` and `{ Z } from './u'`; rc 0. Vite's resolver is an inference (same rule), not measured.
  - The directory barrel and its leaves are never reached, and `unfollowedLocalSpecifiers` returns `[]`, so LT9 stays green.
- **Probe results** (P1–P3 use the same files: `lib/u.ts`, `lib/u/index.ts` re-exporting `Y`, `lib/u/Y.tsx`):
  - P1 `'~/lib/u/'`: reached = `[lib/u.ts, routes/a.tsx]`, unfollowed `[]`. **Fail open.**
  - P2 `'~/lib/u/index'`: the same result. **Fail open** (the strip is at HEAD; the walker is from the unpublished sketch-456).
  - P3 `'~/lib/u'` (control): reached `lib/u.ts`, which is correct, because the file wins in the real resolver.
- **Exposure today: latent.**
  - There is exactly one sibling pair in `app/`: `lib/utils.ts` + `lib/utils/index.ts` (`a-round-457/sibling-pairs.txt`).
  - Zero non-test importers use a `…/` or `…/index` local specifier.
  - So LT7's verdicts at HEAD are unaffected.
  - The reviewer's alternative fix, an LT9 invariant "no `X.ts` next to `X/index.ts`", would be **red on today's tree** because of that one pair. B must choose between that invariant (with an allow-list entry) and a directory-only resolution flag.
- **Why STOP rather than fix.** The fix is in `style-scan.ts` and needs a new LT9 fixture. Both are sha-pinned ("no hand edits"). The task's STOP list names "a new silent-drop form of the walker". The finding is not on TL-R455-WALKER-LIMITS (checked in `backlog.json`) and not in `b-round-456/sketch-review.md`; finding 2/N3 there introduced the trailing-slash strip but did not consider a sibling file. The ruling's sentence "`resolveSpecifier` … can only add matches" is contradicted by P1/P2. The same sentence is in doc 299's მიდგომა (B ruling text); I left it for B and did not edit it.
- **Two related Low fail-open forms (reviewer Low #2), also reproduced. Same class; B may rule on all three together:**
  - P4b: a non-barrel importer with `export interface P {}\nexport { Row } from '~/kit';`. The `IMPORT_STATEMENT` clause runs across the earlier `{}`, `Row` is not forwarded, and `kit/Row.tsx` is not reached. LT9 is green. P4, the same shape inside the barrel, is fail-closed: the file is not a barrel, so all of it is followed.
  - P5: a second import of the same barrel placed between `'audio/*'` and `'*/'`, with a comment inside its braces. The raw arm drops it because of the comment, and the stripped arm has eaten it. `kit/Row.tsx` is not reached, and LT9 is green, because the target is followed through the first import.
  - Neither shape exists in `app/` today (reviewer's multiline grep).
- **Tree state.** The delta is applied (sha 4 OK, re-checked after all runs) and doc 299 is rewritten. Nothing was reverted. Status shows exactly the 6 grants. The tree is consistent and fully green; the open question is only whether this round may close with the finding deferred, or needs a delta v4.

## Steps actually run
| Step | Result | Evidence |
|---|---|---|
| 1 reading | `lessons.md` A part (L11–L15, L26, L28); `GEORGIAN_DOCS.md` (whole); `TEMPLATE.md` (Prompt section and headings). The pinned sha means the step-1 naming check needs no action. A did not re-read `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` or `AGENT_DISCOVERABLE_CODE.md` this round, because no test code was hand-written. Doc 299 matches the TEMPLATE: headings in order, no code fragments besides Mermaid. | — |
| 2 claims-before | equal to `claims-457-planning-output.txt`, stderr empty | `a-round-457/claims-before.txt` |
| 3 pre/post sha + apply | pre 3 OK; delta sha OK; `git apply` OK; post 4 OK | — |
| 4 doc 299 | rewritten: l.3 `2026-11-11`, l.4 exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 457 PASS)`, l.5 lists the 4 test files, TEMPLATE headings in order, no `pending`, union + LT9 + GT5b described, A-R456-REVIEW-M1 Problem → Solution entry, round-457 test results; doc 298 untouched (diff vs db95f40 = l.4 only) | doc file |
| 5 typecheck | rc 0 | `a-round-457/typecheck.log` |
| 5 lint | rc 0, 205 warnings (= precheck) | `a-round-457/lint.log` |
| 5 Biome scoped (4 test files, check only) | rc 0, no fixes | `a-round-457/biome-scoped.log` |
| 5 covering | 4 files / 27 tests passed; LT1–LT9, GS1–GS4, GT1/1b/2/3/4/4b/5/5b, TS1–TS6; slowest LT7 444 ms (default 5 s timeout) | `a-round-457/covering.log` |
| 6 mutants | 34 lines, `cmp`-equal to `b-round-456/mutants/mutants.txt` (BASE and C1 green, M1–M32 red); scratch restored clean | `a-round-457/mutants/` |
| 7 claims-after | `cmp`-equal to `claims-457-expected-after-A.txt`, stderr empty | `a-round-457/claims-after.txt` |
| 8 scope | 6 grant paths only | — |
| 9 code-reviewer | ran (actual subagent); score 8/10; 1 Medium (above, STOP), 5 Lows | summary below |

No browser check was run by A, and no C acceptance row is marked. Full suite, build and verify are gate rows and were not run.

## code-reviewer: other findings (verbatim summary for B)
- **Low #2:** name loss with LT9 green (P4b, P5 above).
- **Low #3:** the LT7 consumer lookahead `(?![\w-])` treats `_` as part of the name, so `animate-[playButtonPulse_1s_infinite]` or `[&_.value-card_span]` is not counted as a consumer (`store-live-teal.test.ts:343-344`). Suggested fix: `(?![A-Za-z0-9-])`. No use today.
- **Low #4:** duplicate assertion: `bodies.length === count` repeats the line above (`store-live-teal.test.ts:432`).
- **Low #5:** `target === null` in `unfollowedLocalSpecifiers` (`style-scan.ts:405`) is unreachable, because the literal regex guarantees a local prefix. The stale-entry check is vacuous while the allow-list is empty; the doc says so.
- **Low #6 (doc 299), A's disposition:**
  - "four sources" vs five code arms: B's grouping, kept.
  - The l.4 PASS string: required by L28.
  - "only adds matches": B's ruling text, contradicted by M1 and routed to B (above).
- **Architecture note (proposal for B/root; A did not act):** `style-scan.ts:330-471` now holds a module-resolution/import-graph walker next to the CSS/teal scanners. Keeping them together is fine for now: test-only, one consumer cluster. If a fourth caller appears or M1 is fixed, move the walker into `helpers/mount-graph.ts` with the same exports, and make LT8/LT9 its acceptance tests. This adds a signal to ARCH-CHECKPOINT-STYLE-SCAN.

## Changed files (this round)
- `app/lib/__tests__/helpers/style-scan.ts`, `store-live-teal.test.ts`, `store-gradient-text.test.ts`: the delta patch applied byte-exact. `store-glow-shadow.test.ts` is unchanged since round 456.
- `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md`: rewritten.

## Known gaps
- A-R457-REVIEW-M1 is open (STOP).
- The Lows above are new. None are fixed, because the files are pinned.

## Next C checks (L22: a STOP on a ruled clause, with a diff)
- C1 SOURCE-SCOPE.
- C2 CLAIMS.
- The purchase-protection half of C7.
- A replay of the probe:
  - Recipe: `git clone --shared <store> S && git -C S checkout db95f40`; copy the tree's 4 granted test files into S; `ln -s <store>/node_modules S/node_modules`; copy `a-round-457/zz-a457-probe.test.ts` into `S/app/lib/__tests__/`.
  - Run `npx vitest run app/lib/__tests__/zz-a457-probe.test.ts 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E '^\+ +"P'`.
  - The probe fails by design (`expect(out).toEqual([])`) so that it prints its six lines; compare them with `a-round-457/probe-dir-slash.txt`.
  - P1, P2, P4b and P5 miss the leaf with `unfollowed=[]`. P3 and P4 are controls.
- Then a short FAIL "STOPPED — routed to B".

## Scope completed
Steps 2–9 executed. B acceptance is **not** claimed complete: the round stops on A-R457-REVIEW-M1.
