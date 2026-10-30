# A — round 277 report (GATE276 test-only fix-up)

**Status:** done within grants. No STOP. No app code, `strings.ts`, CSS or frozen test touched. Protected auth files untouched.

**L11 slow-test check:** no covering test above 50 % of its timeout. Highest per-test time is TC10: A 1830 ms, gate-276 `verify.log` 3222 ms. Its declared timeout is 15 000 ms (`transport-centre-ui` describe). NS*/SD* use the 5 s default. No test in the three files exceeds 2500 ms in the gate log.

**Pre-flight:** the change is test-only and matches B's sketch. About 10 test lines and 3 doc lines. Success means the 3 targeted files pass, typecheck and lint give rc 0, the N1/N2 reds match the table, and the manifest check gives rc 0.

## Changed files (exactly the three §4 grants)
| File | Change |
|---|---|
| `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx` | NS1 l.222 → 4 assertions (no-target title literal, `aria-disabled="true"`; after `selectClip('music-1')`: old literal `Split at the insert marker (Ctrl+E)`, no `aria-disabled`). NS6 `expectLoopState` l.429 → `hasAttribute('disabled') === false` + `getAttribute('aria-disabled') === (disabled ? 'true' : null)`; parameter name and 3 call sites unchanged |
| `app/lib/arrangement/__tests__/transport-centre-ui.test.tsx` | TC9 l.404 → `aria-disabled === 'true'` + `toHaveProperty('disabled', false)`; `activeElement === redo` line kept |
| `docs/implementation/2026/quarter-IV/206-sys-5-disabled-reasons-stage-1.md` (untracked, stays untracked) | l.4 byte-exact as §2; one Problem → Solution bullet; one ტესტირება line naming NS1, NS6, TC9 and both files. Nothing else changed |

Hunks: the `+`/`-` lines of both test diffs are byte-identical to `b-round-276/sketch.diff` (checked with `diff`, "HUNKS-IDENTICAL"). Diffs saved: `a-round-277/a277-navigation-strings-ui.test.tsx.diff`, `a277-transport-centre-ui.test.tsx.diff`, `doc206.diff`.

No assertion lost (L4): each removed line has an equal or stronger replacement; NS1 still asserts the old Split literal, now in the clip-selected state.

## Commands actually run (logs in `a-round-277/`)
| Command | Result |
|---|---|
| `npx vitest run` navigation-strings-ui, transport-centre-ui, self-disabling-focus | 3 files, 36/36 pass (`vitest.log`) |
| `npm run typecheck` | rc 0 |
| `npm run lint` | rc 0 (205 pre-existing warnings, 1 info; no errors) |
| `npx biome check` on the two test files | rc 0, clean |
| `sha256sum -c b-round-276-r277-tree-sha256.txt` | rc 0 |
| `git status --short` | 12 lines: 9 round-276 `M`, 2 granted tests `M`, doc 206 `??` (`git-status.txt`) |
| `sha256sum -c b-round-276/grant-files-sha256-at-planning.txt` | exactly the 3 grant files differ |
| `bash b-round-276/claims.sh` on A's tree | K1 Split literal now at l.227; K2/K3 gone (replaced); K4 l.66, K5 l.216 / strings l.147 unchanged; SW-A = 14 files; SW-B = 6 hits, `navigation-strings-ui` at l.227 and l.229 (`claims-after.txt`) |

## Mutants (scratch copy `a-round-277/scratch/`, node_modules symlinked; real tree untouched, scratch file restored and `cmp`-equal)
| Mutant | Change | Expected red | Observed |
|---|---|---|---|
| N1 | `softDisabledButtonProps` drops `'aria-disabled': 'true'` (l.66) | NS1, NS6, TC9 | NS1 red (l.225), NS6 red (l.435 via l.441), TC9 red (l.404); 3 failed / 15 passed |
| N2 | no-target Split title → `splitAtInsertMarkerTitle` (l.216) | NS1 | NS1 red (l.222); 1 failed / 17 passed |

## Code review
Not run: 2 code files + 1 doc (< 3 changed code files; §5.5 says not required).

## Known gaps
- Full suite, build, `npm run verify` and `test:e2e:smoke` not run by A (speed rules; gate rows).
- No browser check by A (test-only round); B-MATCH rows are C's.

## Next C checks
SOURCE-SCOPE, HUNK-SCOPE, TEST-CHANGES, CLAIMS (on the restored scratch), SWEEP, TESTS-TARGETED, MUTANTS, B-MATCH-SPLIT/LOOP/UNDO, STUDIO-SMOKE-277 (export sha = round 276's `1fea093b…`), G277-AUTH, DOC-206 — as §6.

## Acceptance I truly passed
§2 edits, §5.1–§5.4. Browser rows and gate rows not claimed.

Doc 206 diff verified: 1 `-` line (old l.4) and 3 `+` lines (new l.4, the bullet, the ტესტირება line).

Scratch: `a-round-277/scratch/` was removed after the restored file compared equal with `cmp`. The evidence kept is `mutant-N1.log`, `mutant-N2.log` and `at.orig`.

## For B (outside the grant, not edited)
Doc 206 still says stage 2 is round 277 in two places: l.9 ("მეორე ეტაპი (277)") and the TODO at l.63 ("ეტაპი 2 (რაუნდი 277)"). Under D-29z618, stage 2 is round 278. Please grant these lines in round 278.

## Architecture notes
None new.
