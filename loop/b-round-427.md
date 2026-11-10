# B — round 427 → 428 planning (2026-11-10)

**Decision:** CONTINUE. Round 428 = **SYS-2 stage 4 (2b-ii-a)**: a held Enter acts once on the footer Shortcuts button, the shortcut sheet Close, the narrow-screen Send link and the export dialog Export/Cancel/Done. Decisions D-29z1498 … D-29z1504, `backlog.json` v407.

**Advisor:** available. Consulted after orientation and before close. It drove the import-closure scope, the side-effect counters in the probe, the opener round-trip cells, the 800×700 Send link cell and the settled-state auth row.

**Consults:**
- `tech-lead` reviewed the v1 sketch `fc3d0b63…`: approve-with-lows, TL-R427-01…06, no Medium.
- It then reviewed the test-only delta on `fa75fa82…`: approve.
- Both reviews are in `b-round-427/sketch-review.md`.
- `product-designer` and `ableton-arrangement-expert` were not consulted: nothing visible changes, no per-press behaviour changes, and no Live behaviour applies.

## 1. Round 427 accepted from C evidence (D-29z1498)
- `c-round-427.json`: PASS, 0 bugs, `browserVerified` and `realVerified` true.
- B ran its own checks:
  - `tools/l57-check.py` gives L57 OK (`b-round-427/l57-check-c427.txt`);
  - re-running C's compare on C's JSONs gives `ALL OK (18 cells)`;
  - C's mutant summary is identical to `b-round-426/mutants/summary.txt`.
- Gate 427 ran 266 files and 3,984 tests and published `ffae71c` on both remotes. That is the new baseline.
- **SYS-2 stage 3 is done.** TL-R425-09 is closed (HM5b).
- **The auth note (D-29z1502, D-29z1504).** One of C's reads showed a transient `signIn:false`.
  - C did not save that raw read. Its workspace-false and `audio[src]`-0 values are as reported by C.
  - B checked what was saved: the final `auth.log` passes, and `c-round-427/legacy-1440.png` shows "Sign in required".
  - B then ran the settled-state recipe (`b-round-427/probe/g428-auth.cjs`) at HEAD on both viewports. It passes: every sample at 0.5, 3 and 10 s shows the sign-in gate, with no workspace and 0 `audio[src]`.
  - Recorded as INFO-C427-AUTH-TRANSIENT-FIRST-READ, origin environment. Purchase protection holds.
  - Round 428's auth row reads only a settled state. Any workspace or `audio[src]` > 0 is Critical.

## 2. Rulings
- **A's reviewer items (D-29z1499):**
  - A-R427-REVIEW-L3 (loose HM5b assert) is a Low, origin B spec. It goes to `deferred_low_polish` as A-R427-REVIEW-L3-HM5B-LOOSE, with I1 and I3 attached as notes. They are fixed together with the test-helper extraction.
  - L2/L2b (wrong covering-file names in task 427 §7) is origin B spec. A already fixed it in doc 275, so it is recorded closed as INFO-B427-COVERING-WORDING.
- **Stage 2b-ii split again (D-29z1500)**, after a real Chromium HEAD probe at `ffae71c`:
  - Real defects exist only on the sheet Close (the sheet reopens through the footer button) and on Send link (4 clipboard writes).
  - Stage 4 (this round) covers those two, plus preventive guards on Export and Cancel and the Done fold.
  - Stage 5 covers the MarkerRow and LibraryMenu inline copies, the delegated menu form, and a closing grep with one mutant per copy form. It also grants l.4 of docs 274–276 to Completed (L28).
- **Scope from the `/studio-lab` import closure**, not the arrangement folder glob (closes the round-427 ruling 7 promise):
  - the Modal ✕ (shared Store UI; no defect, because focus returns to the guarded Export opener) is excluded with evidence;
  - CookieConsent is excluded: it is not rendered without a GA4 id;
  - AuthModal and Toast: not probed (see below).
- **Grid menu.** Choosing an item from a pointer-opened grid menu with no prior focus returns focus to BODY. This is pre-existing, with the same root cause as C-R301-01, so it is recorded there as `confirmedBy` (D-29z1504). The probe records GMENU focus and does not assert it.
- **XEXPORT hardening (D-29z1504).** `compare.py` leaves the wallclock-dependent `downloads` out of the comparisons and asserts the totals instead: 1 render and 1 download. With HEAD as the sketch it fails 3 of 13 cells.
- **AuthModal and Toast** were not probed. They are ruled in stage 5 with the closing scan.
- **Signals (D-29z1501).**
  - The gate 427 Architecture note is recorded as `confirmedBy` on SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT.
  - A's helper-extraction note and TL-R427-05 become the new SIG-R427-HELD-ENTER-TEST-HELPER, attached to ARCH-CHECKPOINT-SYS-2 (still non-blocking, filed after stage 5 passes).

## 3. B pre-check (L58: all on the dispatched sketch `fa75fa82…`, except the browser cells, which ran on v1 with identical source)
| Check | Result | Evidence |
|---|---|---|
| HEAD defect, real Chromium, both viewports (+800×700) | SCLOSE and NSEND change state on the repeats; 5 other surfaces do not | `probe/head/*.json` |
| Sketch | 4 source files plus 3 test files; typecheck rc 0, lint rc 0 (205 warnings, 1 info, same as HEAD), Biome rc 0 | `sketch-428.patch.txt`, `precheck-*.log`, `tools/make-sketch-*.py` |
| Mutants | 7 lines: HEAD-SRC turns HN1, HQ1, HQ2, HX1 and HX2 red; each guard turns its own row red; HX3 is green at HEAD by design | `mutants/summary.txt`, `mutant-*.log` (v1 run kept in `mutants/v1-fc3d0b63/`) |
| Covering / full | 59 files, 996/996 / 266 files, 3,990 tests, rc 0 (final sketch; v1 gave the same) | `precheck-a2.log`, `precheck-full.log`, `precheck-full-v1.log` |
| Browser, HEAD :5173 vs sketch :5174 (own `cacheDir`; stopped; scratch config reverted) | `ALL OK (13 cells)`, `firstEqualsHead` on every cell, focus map with a solid ring | `probe/compare.txt` |
| L50 focus origins | 48 pre-existing hits; 0 added or removed sketch lines match | `data/l50-focus-origins.txt` |
| Claims | planning output, stderr empty, `L58 OK` | `claims-428-*` |

## 4. Checkpoints and queue
- **ARCH-CHECKPOINT-SYS-2:** planned for after stage 5 passes.
- **ARCH-CHECKPOINT-STEM-LANES:** unchanged.
- **Regression:** due on or after 2026-11-13. If round 428 closes on or after that date, the 428 → 429 planning opens REGRESSION-2026-11-13 before stage 5.
- STEM-LANES still has no Saba answer.

## 5. Ready for commit
Nothing new is ready for root at this planning: round 427 is already published as `ffae71c`. Round 428 is ready for the gate once C passes.

## Files written by B
- `tasks/round-427.md` (archive copy);
- `current-task.md`;
- `backlog.json` (v405 → v407, via `b-round-427/update-backlog.py` and `update-backlog-2.py`);
- `feature-status.md`;
- `b-next.json`;
- this file;
- `b-round-427/`: checkpoint, before-copies, sketch v1, final and delta, review, mutants, probes, claims, grants, frozen tree, prechecks, tools, data.

No store file was modified. The scratch trees are `/tmp/b428` and `/tmp/b428-mut`.
