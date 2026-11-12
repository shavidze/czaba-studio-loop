# A round 461 — SABA-B-13 test hardening (real `hydrateRoot` rows)

**Status:** implementation done; awaiting C. No STOP.

## Changed files (exactly the 2 grant paths)
- `app/lib/__tests__/store-entrance-loader.test.tsx` — `b-round-460/sketch-461.patch.txt` applied byte for byte with `git apply`. No hand edits.
  - `sha256sum -c b-round-460/sketch-461.sha256` → `sketch-461.patch.txt: OK`.
  - `sha256sum -c b-round-460/sketch-461-files-sha256.txt` (store root) → `store-entrance-loader.test.tsx: OK`.
- `docs/implementation/2026/quarter-IV/300-saba-b-13-store-entrance-cover.md`:
  - l.4 → `**სტატუსი:** Completed (C round 461 PASS)` (L28 form).
  - Under `## ტესტირება`, before the "not tested in the cloud" bullet: a round-461 paragraph in Georgian. It names E1b, E9, E20, E20b, E21 and E21b and A-R460-REVIEW-1/-6/-7, explains why E21/E21b come before E20/E20b, labels E21b a React tripwire with no source mutant, and records tech-lead's three production gaps (`startTransition`; a mismatch removes the whole `<html>` while the test empties only `head`; the foreign node is in `head`, not `body`). It says these gaps stay covered only by the browser rows (round 460 C11–C13, round 461 C7). It also mentions GATE460-4/-5.
  - Under `## TODO / შემდეგი ნაბიჯები`: the deferred Lows A-R460-REVIEW-2, -4, -5 and GATE460-2.
  - No other section was changed. `grep -ci pending` on doc 300 = 0. `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 hits.
  - L26: every row the doc names exists in the test file (grep: `'E1b`, `'E9 `, `'E20 `, `'E20b`, `'E21 `, `'E21b` each 1 hit; `hydrateHeadCover` 5).

No app source was touched: `git diff --name-only ffd0c7c -- app/components app/root.tsx` prints nothing.

## Checks actually run (logs in `a-round-461/`)
| Check | Result |
|---|---|
| Claims before (`bash b-round-460/claims-461.sh`) | rc 0, `cmp` identical to `claims-461-planning-output.txt`, stderr empty (`claims-before.txt`) |
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0, `Found 207 warnings.`, the same as B's `precheck-lint.txt` (`lint.log`) |
| `npx biome check` on the 2 grant paths | rc 0, "Checked 1 file … No fixes applied" (Biome does not process `.md`) (`biome.log`) |
| `npx vitest run` on the 3 files in `covering-461.txt` | rc 0, 3 files / 62 tests passed; 0 `Hydration failed` lines; E1b, E9, E21, E21b, E20 and E20b are listed as passed, in that order (`covering.log`) |
| Mutants: `python3 -I b-round-460/mutants/mutants.py /tmp/a461-scratch a-round-461/mutants whole` | rc 0; `a-round-461/mutants/mutants.txt` is **byte-identical** to `b-round-460/mutants/mutants.txt`: BASE and BASE-ALL GREEN, M1–M10 RED, each target row among the failing rows |
| Claims after | rc 0, `cmp` identical to `claims-461-expected-after-A.txt`, stderr empty (`claims-after.txt`) |
| Scope `git status --short --untracked-files=all` | exactly the 2 grant paths |

Mutant scratch: `git clone --shared` of the store at `ffd0c7c` plus the sketch, with `node_modules` symlinked. A process note: the first mutant run failed with `FileNotFoundError`, because `mutants.py` does not create its output directory. After `mkdir -p a-round-461/mutants`, the re-run passed. C5 should create `c-round-461/mutants` first. After the run, the scratch shows only the sketch diff, so the script restores its mutants.

Not run, as A's speed rules require: the full suite, `npm run verify` and the build. These are gate rows. A code-reviewer was not invoked: only 2 files changed, the task makes it optional, and the test file is B's sketch, which tech-lead approved 3 times.

## B acceptance actually met by A
- §2.1 sketch applied byte for byte, sha OK.
- §2.2 doc 300 edits (l.4, the paragraph, the TODO list, 0 `pending`).
- §4 steps 2, 3, 5, 6 and 7, all with identical outputs.

The C rows (C1–C10) are C's to judge; A does not mark them.

## Known gaps
- Firefox and Safari stay untested (TLM-R459-FIREFOX-SAFARI-ENTRANCE, deadline RETRO 465).
- The three production gaps (`startTransition`, removal of the whole `<html>`, a foreign node in `body`) are not covered by the unit test. They depend on the C7 browser anchor.
- A did not run the browser anchor (C7) or the Studio and protection row (C8). The app code is unchanged against `ffd0c7c`.
- Low, process: `b-round-460/mutants/mutants.py` needs its output directory created beforehand.

## Next C checks
C1 scope → C2 claims + L29 grep → C3 sha → C4 covering (3 files / 62) → C5 mutants (`mkdir -p c-round-461/mutants` first, then compare with B's `mutants.txt`) → C6 E21b tripwire label in doc 300 → C7 prod browser anchor on :5191 with the mock API → C8 Studio and protection on :5173 → C9 doc 300 (l.4, 0 `pending`, headings, paragraph, TODO) → C10 L57.

## Process notes (stated plainly)
- **Pre-flight:** A read `.claude/skills/pre-flight/SKILL.md` *after* applying the patch, not before. The round adds no new code of A's own: the test file is B's patch applied byte for byte. The doc edits are exactly the task's §2.2. Nothing in the checklist conflicts with what was done:
  - **Assumptions:** the 2 grant paths only, the sketch byte for byte, and doc 300 with 0 `pending`.
  - **Success criteria:** the commands in task §4.
- **/check:** A read `.claude/skills/source-command-check/SKILL.md` and `.claude/commands/check.md`. Those files ask for `npm run verify` plus `test:e2e:smoke`. Under the 2026-10-21 speed rules and the task's §4, A ran only typecheck, lint, scoped Biome and the covering files. `verify` and smoke are **not run by A** and stay gate rows.
- **Context:** A skimmed `context/active-summary.md`, which shows ENV_CHECK round 461 and last publication `ffd0c7c`.
- **Primitives:** A read `TESTING_QUALITY_GATES.md` in full, `GEORGIAN_DOCS.md` in full, and lines 1–80 of `BUG_HUNTING_TESTS.md`.
- **Doc 300 follow-up edit:** after an advisor check, the A-R460-REVIEW-5 TODO line was aligned with its backlog title ("stale comment: the entrance timeline no longer reads `data-start`"). The doc greps were re-run afterwards: `pending` 0, l.4 exact, and the 7 TEMPLATE headings in order (l.7, 18, 35, 63, 71, 90, 130).
- The doc's statements about E1b (server render with `window` undefined gives `not all`), E9 (2 and 1 listeners before the takeover, 0 after) and E20/E21/E21b were checked against the test source (l.354–368, 414–415, 441–453, 560–575, 716–770).

## For B / root
- No architecture notes. No code-reviewer was run.
