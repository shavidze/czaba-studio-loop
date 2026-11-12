# A round 467 — STORE-2b-3c-2b fix-up (C-R466-01, test-only)

No STOP. Sketch applied byte-for-byte. No further edits were made. Evidence is in `a-round-467/`.

## Steps and results (all run from `store/`)

| # | Step | Command | Result |
|---|---|---|---|
| 1 | Start state (L11) | `git rev-parse`; `git status --short --untracked-files=all`; `sha256sum -c b-round-465/sketch-466-files-sha256.txt`; `sha256sum -c --quiet b-round-318/protected-sha256.txt` | HEAD `6d321c7`. Status shows exactly 3 `M` (`style-scan.ts`, `store-teal-sweep.test.ts`, doc 299) and 1 `??` (doc 304). Round-466 post-image hashes: 2× OK, rc 0. protectedRc 0 (`start-state.txt`) |
| 2 | Primitives | Read `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md` | read |
| 3 | Apply sketch | Sketch sha256 `924c2700…f6ac` matches. `git apply b-round-466/sketch-467.patch.txt` | applyRc 0. `sha256sum -c b-round-466/sketch-467-files-sha256.txt`: 4/4 OK, rc 0. `git diff -- app docs` saved as `applied.patch.txt` (tracked files only; doc 304 is untracked and pinned by the hash list) |
| 4 | Doc leak (absolute root) | Temporary copy of `a-round-463/tw-doc-leak.mjs` at the store root; `node <copy> "$PWD" docs/…/304-….md`; copy deleted | rc 0. `docCandidates 69 extraOnlyInDoc 5 cssEqual true` (`tw-doc-leak.txt`) |
| 5a | Typecheck | `npm run typecheck` | rc 0 (`typecheck.log`) |
| 5b | Biome | `npx biome check app/lib/__tests__/store-teal-sweep.test.ts app/lib/__tests__/helpers/style-scan.ts` | rc 0, "Checked 2 files, no fixes" (`biome.log`) |
| 5c | Covering | `npx vitest run` on store-teal-sweep, store-live-teal, store-glow-shadow and store-gradient-text | rc 0. **4 files, 31 tests passed.** TS7 and TS8 are listed, and TS8 has the new title (`covering-vitest.log`) |
| 6 | Pre-check removal | Scratch copy `a-round-467/scratch-noprecheck` (git archive 6d321c7 + the 4 granted files + `node_modules` symlink; sketch-467 hash list 4/4 OK). At l.198, `if (!/shadow/i.test(source)) {` → `if (false) {`. Ran `store-teal-sweep.test.ts`. Scratch copy deleted | rc 1. **`× TS8`** ("expected 1 to be +0", the `scansAfterSkipped` assertion). TS1–TS7 ✓; 1 failed, 7 passed (`noprecheck-vitest.log`) |
| 7 | code-reviewer | Actual `code-reviewer` subagent on the 4 files, given C-R466-01, M14, `sketch-review.md` and the deferred ids | Score 9/10. **No Critical/High/Medium.** One new Low (below). Architecture note: none |

**End state (`end-state.txt`).** I re-ran the checks after step 6 and the reviewer:
- sketch-467 hash list: 4/4 OK, rc 0;
- protectedRc 0;
- `git status` shows exactly the same 4 paths.

Nothing else was touched: no protected files, and no files outside the grants. The temporary doc-leak copy and the scratch tree are deleted.

**Covering durations (L11).** The slowest covering test is LT7 at 356 ms, then LT9 at 208 ms. TS1–TS8 are all ≤ 157 ms. vitest.config sets no `testTimeout`, so the default 5000 ms applies, and every test is under 10 % of it. No test is at or above 50 %, so there is no STOP.

**Reviewer method (row 7).** The code-reviewer had no shell in its session, so it could not run `git diff`. It read the 4 files directly and checked the doc claims against the loop files.

## Changed files this round
- `app/lib/__tests__/store-teal-sweep.test.ts`: the `vi` import and the TS8 block (spy, retitle). This came from the sketch.
- `docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md` (untracked): l.4 status, the C-R466-01 Problem → Solution entry, the TS8 and M14 lines, and the TODO. This came from the sketch.
- `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md`: l.4 only. This came from the sketch.
- `app/lib/__tests__/helpers/style-scan.ts`: **unchanged** this round. It is still at its round-466 post-image, and the hash list shows OK.

## Pre-flight
I did not run pre-flight as a separate step before step 3. I applied B's pinned sketch and wrote no code of my own. I went through the checklist afterwards:
- **Assumptions:** apply the sketch exactly as pinned, and add no edits of my own.
- **Simplicity:** there are 0 lines of code by A.
- **Surgical scope:** only the 4 granted paths, enforced by the hash list.
- **Success criteria:** §2 steps 3–7, all met above.

## Reviewer findings
- **A-R467-REVIEW-L1 (Low, origin: B sketch / A review; new).** Doc 304 l.5 says `**შეცვლილი პროექტი:** Store (2 ტესტ ფაილი, ეს დოკუმენტი)`, but its own `## შეცვლილი ფაილები` list (l.40–43) also names doc 299. Suggested wording: "2 ტესტ ფაილი, 2 დოკუმენტი". I checked this against the file. **I did not fix it:** doc 304 is "changed only by the sketch", and the hash list pins it. It goes to B for `deferred_low_polish`, or as a one-line grant in a later round.
- The reviewer checked and found no problem with: spy leakage or concurrency (synchronous use, `mockRestore` in `finally`, no concurrent config); a vacuous pass (the rising-count assertions fail if the spy stops seeing calls); TS strictness and semicolons; doc claims (15/8 TS7 fixtures, 31 `it(` blocks, the mutant ids); and both l.4 status lines being exactly `**სტატუსი:** Completed (C round 467 PASS)`.
- The already-ruled TL-R466-L1/L2 and A-R466-REVIEW-L1…L4 were not reported again.

## B acceptance (A-side only)
- [x] §2.1 start state correct
- [x] §2.3 sketch applied; 4/4 hashes OK
- [x] §2.4 `cssEqual true`
- [x] §2.5 typecheck rc 0, Biome rc 0, covering 4 files / 31 tests
- [x] §2.6 TS8 red with the pre-check removed (`if (false)` form)
- [x] §2.7 code-reviewer: no new Medium+
- Not claimed (C or gate): mutants on the tree (C4), the delete-lines form (C13), corpus (C5), browser GLOW-COMPUTED (C6), build compare (C7), AUTH + SMOKE browser (C8), DOCS (C9), claims (C11), the full suite / verify (gate). I did not use a browser this round. The task has no A browser step, so there is no `a-browse.json`.

## Known gaps
- A-R467-REVIEW-L1 (Low) above is open.
- The TS8 spy is tied to `String.prototype.matchAll`. This is the already-deferred TL-R466-L1.
- I did not run the full suite (speed rule; the gate runs it).

## Next C checks
C1 → C13 as in task §3, browser rows first: C6, then C8 at 1440×900 and 1280×720. For C13, delete the 3 pre-check lines independently; my run covered only the `if (false)` form. For C9, read `a-round-467/tw-doc-leak.txt`. C should also judge A-R467-REVIEW-L1's wording claim.

## Scope completed
The round-467 A steps 1–8 are complete. The backlog item is **not** marked complete; that waits for C.
