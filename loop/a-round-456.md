# A round 456 — STORE-2b-3c-2a

## STOP — needs B ruling on A-R456-REVIEW-M1 (walker misses re-exports with a comment inside the brace list)

- **Finding (code-reviewer Medium, reproduced by A):** `reachableScripts` reports a **mounted** file as unreachable when its barrel re-export has a comment inside `export { … }`. `helpers/style-scan.ts:79-80` `IMPORT_STATEMENT` only allows `[\w$*\s{},]` between braces, so the `// Variants for custom use` line in `app/components/animations/index.ts` (l.7-20) stops the match; `isReExportBarrel` (l.335-344) strips comments first, so the file still counts as a barrel and is followed by name only through recorded statements.
- **Measurement:** on the scratch (`db95f40` + sketch, sha OK) `reachableScripts(appScriptSources())` → 288 files; `components/animations/ScrollReveal.tsx` → **false**, although `routes/_index.tsx:39` imports `{ ScrollReveal }` from `~/components/animations` (`a-round-456/probe/scrollreveal-probe.txt`).
- **Why a STOP:** it fails in the **unsafe** direction for LT7's `unmounted` verdicts (a mounted dead-class consumer behind such a barrel would pass as unmounted). It is not on TL-R455-WALKER-LIMITS (that list has commented-out imports, which fail closed). The fix (run the matcher on comment-stripped source in the walker + an LT8 fixture with a commented barrel) is in `style-scan.ts` / `store-live-teal.test.ts`, which the task grants **sketch only, no hand edits** (sha-pinned). L11: Medium+ shown by my reviewer, fix outside what I may edit → STOP.
- **Effect today: none (measured by A).** Probe `a-round-456/probe/zz-flip-probe.test.ts` (log `flip-probe.log`) runs `reachableScripts` on raw sources and on a copy with block comments and whole-line `//` comments stripped: raw 288, stripped 289; the only file that flips to reachable is `components/animations/ScrollReveal.tsx`, which holds no `DEAD_RULE_TOKENS` token; none of the four `unmounted` consumers (TrackRow, WaveForm, TrackRowSkeleton, PianoLoadingAnimation) becomes reachable; nothing is lost. So LT7's verdicts hold at HEAD; the guard is weaker than doc 299 and the task claim.
- **Wider than barrels:** any `import`/`export … from` whose brace list contains a comment is dropped by `IMPORT_STATEMENT`, in non-barrel files too.
- **Origin:** B spec for the unsafe use (LT7's `unmounted` verdict is new in the dispatched sketch `b-round-455/sketch-456.patch.txt`; A changed none of it). The matcher itself predates the sketch: `IMPORT_STATEMENT` at `db95f40` (`style-scan.ts:73-74`) is byte-identical to the sketch's l.79-80, and GT5b at HEAD reads the same matcher (pre-existing for that use).
- **Fact vs inference:** the probe ran on the byte-exact sketch (fact). B's prototype `reach.py` reporting the same 288 suggests it shares the gap (inference, not checked).
- **Tree left at the last consistent state:** sketch applied byte-exact + the two docs. Doc 299 l.4 says `C round 456 PASS` per the task; its "მიდგომა" walker sentence ("follows `import`/`export … from`") overstates the walker in this case — B may want a doc line in the ruling.

## Changed files (exactly the 5 grants)
- `app/lib/__tests__/helpers/style-scan.ts`, `app/lib/__tests__/store-live-teal.test.ts`, `app/lib/__tests__/store-glow-shadow.test.ts` — `git apply b-round-455/sketch-456.patch.txt`, no hand edits; `sha256sum -c sketch-files-sha256.txt` 3 OK.
- `docs/implementation/2026/quarter-IV/298-saba-b-14-store-seek-thumb.md` — l.4 only → `**სტატუსი:** Completed (C round 455 PASS)` (`git diff --numstat db95f40` = `1 1`).
- `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md` — new; l.3 `**თარიღი:** 2026-11-11`, l.4 `**სტატუსი:** In Progress (stage 1 of 2; C round 456 PASS)`, 7 TEMPLATE headings in order, `grep -ci pending` = 0, cited LT1/LT5/LT6/LT7/LT8/GS2/GS3/GS4 each present in the test files.

## A steps (actually run)
- **Pre-flight:** the `pre-flight` skill file was read **after** the sketch was applied (read late, not run first as the prompt asked). Its content for this round: no new code by A (sketch applied byte-exact), files touched = the 5 grants, success = covering 4/26 green + mutants equal to B's; all met.
| Step | Result | Evidence |
|---|---|---|
| 1 read lessons (A), TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, AGENT_DISCOVERABLE_CODE, TEMPLATE | done | — |
| 2 claims-before | equal to `claims-456-planning-output.txt`, stderr 0 bytes | `a-round-456/claims-before.txt` |
| 3 sketch sha / apply / file sha | OK / OK / 3 OK | — |
| 4 docs 298 l.4, 299 | done | see above |
| 5 typecheck | rc 0 | `a-round-456/typecheck.log` |
| 5 lint | rc 0, 205 warnings = B's HEAD log | `a-round-456/lint.log` |
| 5 scoped biome (3 test files) | rc 0, "No fixes applied" | `a-round-456/biome-scoped.log` |
| 5 covering (`covering-456.txt`, verbose) | 4 files / 26 tests passed, 929 ms total (no test near its timeout) | `a-round-456/covering.log` |
| 6 mutants (scratch `/tmp/a456-scratch` = `git clone --shared` @ db95f40 + sketch, node_modules symlink) | identical to `b-round-455/mutants/mutants.txt` (22 lines; BASE, C1 green; M1–M20 red) | `a-round-456/mutants/mutants.txt` |
| 7 claims-after | = `claims-456-sketch-output.txt` except K2 `dirty=5` and K10 (`Completed (C round 455 PASS) \| 299=1`); stderr 0 bytes | `a-round-456/claims-after.txt` |
| 8 git status | only the 5 grants (re-checked after the scratch probes: still exactly 5) | — |
| 9 code-reviewer (real subagent) | approve-with-Medium, score 8/10 → STOP above | this file |

Not run by A (gate rows): full vitest, build, `npm run verify`. No browser work by A this round (test-only; C7 is C's).

## code-reviewer findings (other than M1)
- **A-R456-REVIEW-L1 (Low):** `ImportBinding.exported` holds the local alias for `import { A as B }` (`style-scan.ts:67-70, 104-113`); only read from barrel re-exports, where it is correct. Name `local`/`alias` would fit both. Sketch-pinned → not edited.
- **A-R456-REVIEW-L2 (Low):** `cssRuleBodies` matches the last compound of each selector (`.hero .a` counts as `.a`), while `cssRuleBlocksListing`/`cssRuleSelectorCount` require an exact comma part (`style-scan.ts:291-305`); names do not show the difference (AGENT_DISCOVERABLE_CODE rule 2). Correct callers today.
- **Info:** `hitsByCssRule(path, css, count)` two adjacent strings (rule 4), matches existing `hitsByFile` style. Doc 299 l.4 written as the task requires.
- **Clean:** no assertion weakened (LT1 stronger, LT5/LT6 key-form only, LT6 fixtures superset, GS3 stronger, GS4 row split stronger); no `any`/`@ts-ignore`/assertions; doc 299 numbers match logs.

## Architecture note (for B/root, not acted on)
`style-scan.ts` now holds two independent subsystems: CSS rule reader (l.240-327) and import-graph walker (l.329-403). Already requested as ARCH-CHECKPOINT-STYLE-SCAN. Reviewer suggestion: a bounded task moving the walker to `helpers/import-graph.ts`, with the M1 comment-stripping fix and an LT8 commented-barrel fixture as acceptance. Reviewer keeps the regex approach over a TS-compiler graph.

## Acceptance (B criteria A can claim)
- A steps 1–8: passed as listed. Step 9: run; produced the STOP.
- C rows C1–C9: not claimed by A. Expected for C: C1/C3/C8 should match (scope, sha, docs); C4/C5 match A's runs. Per lesson L22, a STOP naming an unruled Medium is a short FAIL route unless B rules first.

## Exact next checks for C
**Short route first (C runs before any B ruling; lesson L22: a STOP naming an unruled Medium is a short FAIL):** C1 SOURCE-SCOPE, C2 CLAIMS, C7 purchase/auth guard (c12 tree probe), then the named STOP probe: copy `a-round-456/probe/zz-flip-probe.test.ts` into a C scratch (`git clone --shared` @ db95f40 + sketch, node_modules symlink; never the store tree), run it, expect `raw=288 stripped=289`, flipped = ScrollReveal only, the four `unmounted` false. Then short FAIL "STOPPED — routed to B" with all L57 fields.

**If re-dispatched after a B ruling:** C1 (5 grants, doc 298 diff 1 line); C2 claims (clone = planning output; tree = sketch output except K2/K10); C3 `sha256sum -c b-round-455/sketch-files-sha256.txt` 3 OK; C4 verbose covering LT1–LT8, GS1–GS4 passed; C5 mutants on a C scratch with A's diff committed = B's `mutants.txt`; C6 `expect(` counts vs `b-round-455/expect-counts.txt`; C7 c12 tree at 1440/1280; C8 docs; C9 l57-check.

## Known gaps
- A-R456-REVIEW-M1 open (STOP). TL-R455-WALKER-LIMITS unchanged. Scratch `/tmp/a456-scratch` left in place (outside store; probe files removed from it; does not survive the job).
