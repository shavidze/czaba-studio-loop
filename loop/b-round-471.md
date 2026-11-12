# B round 471 → 472 planning (2026-11-12)

**Advisor:** available, and consulted once after orientation. Its points were applied:
- guard the `@theme` end index and strip comments;
- re-run the mutants on the frozen sha;
- `tech-lead` review plus `l58-check` in the claims script;
- a dirty-tree baseline;
- doc 306 l.4 set for round 472;
- every A-R471 item ruled by id;
- the full C route.

**Consults:** `tech-lead` (sketch review, APPROVE). `product-designer` was not needed: no user-visible change this round.

**Archive:** `tasks/round-471.md` is an unchanged copy of the round-471 `current-task.md`, made before the rewrite. Backups: `b-round-471/backlog-before-472.json`, `feature-status-before-472.md`, `b-next-before.json`.

## Inputs read
- **`c-round-471.md` / `.json`: FAIL, short route (L22).**
  - `browserVerified` and `realVerified` are false.
  - Passed: C11 scope, C13 auth, C14 claims. Not run: C1–C9, C12.
  - C10 confirmed A's mutant finding. Bug C-R471-01 (Medium, origin B spec).
- **`a-round-471.md`:** STOP on A-R471-REVIEW-M1 with a diff. A applied the sketch verbatim, wrote doc 306 and ran typecheck, lint and the 126 covering tests.
- **`gates/gate-round-471.json`:** skipped (C taskStatus FAIL). The baseline HEAD stays `5cd9645` (gate 470, published).
- **Dates:** `regression-last.json` is 2026-11-10 and `date -u` is 2026-11-12, so regression is not due yet.

## Backlog updates (from C's evidence only)
- **D-29z1661: STORE-2c-1 is not done.** C did not run the browser rows. C-R471-01 is opened as Medium.
- **D-29z1662: the ruling on C-R471-01.**
  - **Chosen:** FN4 reads only the store `@theme` block and pins the exact token values, and FN6 is hardened. Both are in the file round 471 already granted.
  - **Rejected:** pinning in `store-theme-tokens.test.ts`, which would add a grant file and a third copy of the literals.
- **D-29z1663: rulings on each reviewer Low.**
  - `.artist-title` → 2c-2;
  - `<kbd>`/↵ → 2c-3 (recorded in C6 this round);
  - FN6 residuals SR-472-L1/L2 → 2c-4;
  - the stale primitives are a For Saba proposal;
  - Georgian faked bold is not applicable (K15 = 0).

  These are in `deferred_low_polish`, each with its owning stage.
- **D-29z1664: process miss B-R471-SKETCH-UNREVIEWED.** Round 471 was dispatched with no `sketch-review.md` (`l58-check-round471.txt`, rc 1). L58 already covers this, so `lessons.md` stays at 60 lines. A RETRO-480 candidate was added as RC-R471-L58-SKIPPED.
- **Architecture signal, not a task:** SIG-R472-FONT-STACK-DUP.
- **Deep compare against `backlog-before-472.json`:**
  - the same top-level keys;
  - only these differ: `updated`, `current_task`, `advisor_used_by_B`, `rounds`, the STORE-REDESIGN status, `narrow_grants`, `open_findings`, `architecture_signals`, `deferred_low_polish`, `decisions_log_b`, `retro_candidates`;
  - no duplicate IDs;
  - the original JSON style is kept (`ensure_ascii`, indent 2).

## Dispatch
**Round 472 = STORE-2c-1 fix-up** (D-29z1665).
- **Baseline:** the round-471 tree is kept as is, with no revert. HEAD is `5cd9645` plus 3 paths; the diff sha is `60a7043de64c22c8` and the `app.css` sha is `d3af7582d8199712`.
- **A's work:**
  - apply `b-round-471/sketch-472.patch.txt` (sha `b9b91596…`; test-only, relative to the tree);
  - rewrite doc 306 (l.4 `C round 472 PASS`, M1 solved).
- **C's work:** the full C1–C14 run in the browser, with C10 rewritten around B's named mutants.
- **Measurements on the sketch:**
  - 7 of 7 should-be-red mutants are red;
  - control: 6 passed;
  - 4 covering files: 126 passed;
  - `tsc` rc 0;
  - the obsidian mutant is caught by ST4 and TH2 (`mutants-summary.txt`, `sketch-review.md`).
- **Claims:** `b-round-471/claims-472.sh` → `claims-472-planning-output.txt`, with 0 MISSING, `L58 OK`, and stable on a re-run.
- **Browser numbers:** B's round-471 numbers (b-round-470 K12/K15/K16) carry over, because `app.css` is byte-identical to the sketch they were measured on.

## Architecture checkpoint
Not requested. This is a test-only delta on one owner, and the tech-lead note is recorded as a signal.

## Commit readiness
Nothing is ready. Round 471 was not published. After round 472's C PASS, root's gate publishes STORE-2c-1, i.e. rounds 471 and 472 together.

## Scratch
`b-round-471/scratch` (a full copy of the tree) was removed after the runs: the `node_modules` symlink was unlinked first. The store tree was checked afterwards: the same 3 paths, the same diff sha, and `/studio-lab` returns HTTP 200.

## Second advisor pass (before hand-off) and what changed
The advisor was consulted a second time, after the files were written. Its points were applied:
- **A's reviewer.** A step 5 now lists the findings that are already ruled (D-29z1663, D-29z1666). A reports them and does not STOP on them; only a new Medium or higher is a STOP. Round 471 was lost that way.
- **Doc 306, read in full.** The l.48 "C5 ამოწმებს" pending clause, the l.49 Georgian-bold line, and l.94, l.97 and l.106 (round-471 values) are now in the grant (D-29z1666). C12 greps for `pending` and for any leftover round-471 lines.
- **The last unruled A item.** A-R471-REVIEW-INFO-COVERAGE (Plex Mono width, Cyrillic and Greek coverage) now has an owner: 2c-3 and 2c-4 (`deferred_low_polish`).
- **`mutants.sh`** takes `S` and `B` from the environment. A step 4 and C10 give the exact call, with `B` set to the caller's own folder, so B's logs are never overwritten.
- **`feature-status.md`:** C-R471-01 is added to §3, and the round line is in the active list. `backlog.json` `items` has no STORE-2c-1 "dispatched round 471" entry to update.
- **Re-checks:** claims re-run (0 MISSING, `L58 OK`); the backlog compare is unchanged in shape (same keys, no duplicate D-IDs); the store tree still has the same 3 paths.
