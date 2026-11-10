# B — round 428 → 429 planning (2026-11-10)

**Decision:** CONTINUE. Round 429 = **SYS-2 stage 5 (2b-ii-b, final)**. The last six inline held-Enter copies (marker row 5, library menu 1) move to `preventRepeatedEnterKeyDown` with no change in behaviour. Rows HK1–HK4 and a closing repo scan (HS1/HS2) are added, and docs 274–277 become Completed. Decisions D-29z1505 … D-29z1509, `backlog.json` v409. Baseline is `b604cfb`, which gate 428 published.

**Advisor:** available. I consulted it after orientation and before close. It confirmed SYS-2 stage 5 for round 429. It also asked me to record the new Saba item today without displacing the round, to re-run C's evidence myself, and to forbid a second dev server during C's auth row.

**Consults:**
- `tech-lead` reviewed the v1 sketch `4a52f823…`: approve-with-lows, no Medium.
- It then reviewed the test-only delta to `c75c6186…`: approve-with-lows, no Medium.
- Both reviews and B's rulings on TL-R429-01…08 are in `b-round-428/sketch-review.md`.
- I did not consult `product-designer` or `ableton-arrangement-expert`: nothing visible changes and no per-press behaviour changes.

## 1. Round 428 accepted from C evidence (D-29z1505)
- `c-round-428.json`: PASS, 0 bugs, `browserVerified` and `realVerified` true.
- My own checks:
  - `tools/l57-check.py` gives L57 OK (`b-round-428/l57-check-c428.txt`);
  - C's compare re-run on C's JSONs gives `ALL OK (13 cells)` (`b-round-428/recompare/`);
  - C's mutant summary is identical to `b-round-427/mutants/summary.txt`.
- C's first auth attempt hit a hydration error caused by its own second Vite server. The saved JSON still shows workspace false and `audio[src]` 0 on every read, so there was no bypass. Recorded as INFO-C428-AUTH-SECOND-VITE.
- Gate 428 published `b604cfb` on both remotes. **SYS-2 stage 4 is done.**

## 2. Rulings
- **D-29z1506:**
  - A-R428-REVIEW-L1 (an HQ1 assert that cannot fail) goes to `deferred_low_polish` (origin B spec) and is fixed together with SIG-R427-HELD-ENTER-TEST-HELPER.
  - A's Architecture note is recorded as `confirmedBy` on SIG-R426 and SIG-R427.
  - INFO-C428-SPACE-ON-FOCUSED-BUTTON is origin B spec: task 428 row 5 item 4 was B's own unprobed premise. Space is the global Play shortcut, identical at HEAD and consistent with Live. Closed by design.
- **D-29z1507, Saba 2026-11-10 (native form controls) → SABA-B-12, Medium.** Recorded in `open_findings` and `feature-status.md` (L42).
  - It is not round 429: its policy line has no "fix next" clause, and round 429 was already sketched.
  - **It is placed first after SYS-2 stage 5 and the due REGRESSION-2026-11-13, ahead of SYS-1/SYS-3.** The 2026-10-23 bug gate fixes reproducible Mediums before new scope. **Root may overrule this placement**, for example to park it in REVIEW-RECOMMENDATIONS as its priority line suggests.
  - Starting evidence: `b-round-428/data/saba-b-12-native-controls-grep.txt`.
  - At that planning, B runs the browser audit and writes the Reference section, the product-designer consult and `Why we missed it`, plus its lesson.
- **D-29z1509 (close, advisor):**
  - Gate 428 review (`gates/round-428/review.md`: 3 Lows, 0 Medium+): each Low is recorded as `confirmedBy` on its existing id, and the Architecture note (a button-guard allowlist test) on ARCH-CHECKPOINT-SYS-2.
  - The closing claims now include the button scan K9c (9 non-guarded hits, each ruled) and the `/studio-lab` import closure K9d (only `ui/*` through the barrel, of which Studio imports only Modal; no AuthModal opener and no toast caller in the closure).
  - K13 is checked by location.
  - L31 is measured per test (K31: CP12c at 12 % at most).
  - Row 4 states which guards the browser can and cannot discriminate.
  - The stray :5174 scratch server (cwd `/tmp/b429`) was stopped.
- **D-29z1508, round 429 scope:**
  - The delegated menu form stays: it is a different contract.
  - AuthModal and Toast cannot be reached on `/studio-lab` (claims K20, K20b, K21).
  - The scan's literal-form limits (TL-R429-06) go to the doc 277 TODO and to ARCH-CHECKPOINT-SYS-2.

## 3. B pre-check (L58: everything on the dispatched sketch `c75c6186…`, except the browser cells; their source is byte-identical to v1)
| Check | Result | Evidence |
|---|---|---|
| Real Chromium at HEAD, both viewports | No defect on the marker +, editor, flag or library-menu link (`head-defect-cells []`) | `probe/head/*.json` |
| Sketch | 2 source files + 3 test files; typecheck rc 0, lint rc 0 (205 warnings, 1 info, same as HEAD), Biome rc 0 | `sketch-429.patch.txt`, `precheck-*.log`, `tools/make-sketch-*.py` |
| Mutants | 13 lines. HEAD source → HS1 red. Each guard removal turns its own HK row red. Six copy-form re-insertions → HS1 red | `mutants/summary.txt`, `mutants/hk1-params.txt` (v1 run: `mutants-v1-4a52f823/`) |
| Covering / full | 47 files 920/920 / 267 files 3,998 tests, rc 0 | `precheck-a2.log`, `precheck-full.log` (v1: `*-v1.log`) |
| Browser, HEAD :5173 vs sketch :5174 (own `cacheDir`; server stopped, scratch config reverted) | `ALL OK (8 cells)` | `probe/compare.txt` |
| Auth at HEAD | pass, both viewports; 401/400 | `probe/auth-head/g428-auth.json` |
| L50 | 15 pre-existing hits; 0 sketch source lines match | `data/l50-focus-origins.txt` |
| Claims | planning output, stderr empty, `L58 OK` | `claims-429-*` |

## 4. Checkpoints and queue
- **ARCH-CHECKPOINT-SYS-2:** filed with root after round 429 passes C. Scope: per-button opt-in vs a wrapper or lint rule, the delegated form, the scan limits, and SIG-R427-HELD-ENTER-TEST-HELPER. It is non-blocking.
- **Next rounds:** REGRESSION-2026-11-13 (due on or after that date), then SABA-B-12. STEM-LANES still has no Saba answer.
- **Not done** (scope is not reduced):
  - SYS-1, SYS-3;
  - STORE-REDESIGN: `direction-decision.md` now exists; the STORE-2b+ gate is to be re-read when STORE resumes;
  - REVIEW-RECOMMENDATIONS, T12-ADVANCED;
  - the phase-2 queues;
  - SRW-21: `deferred_user`; the protected route waits for Saba and root;
  - COPY-PD, the deferred Lows, and the parked STUDIO-PERFORMANCE remainders.

## 5. Ready for commit
Nothing new is ready: round 428 is already published as `b604cfb`. Round 429 is ready for the gate once C passes.

## Files written by B
- `tasks/round-428.md` (archive copy, identical to the round-428 task);
- `current-task.md`;
- `backlog.json` (v407 → v409, via `b-round-428/update-backlog.py` and `update-backlog-2.py`);
- `feature-status.md`;
- `b-next.json`;
- this file;
- `b-round-428/`: the checkpoint, before-copies, sketch v1/final/delta, review, mutants, probes, claims, grants, frozen tree, prechecks, tools and data.

No store file was modified. The scratch trees are `/tmp/b429` (the sketch is applied there, uncommitted) and `/tmp/b429-mut`.
