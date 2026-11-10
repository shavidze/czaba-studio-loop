# B — round 426 → 427 planning (2026-11-10)

**Decision:** CONTINUE. Round 427 = **SYS-2 stage 2b-i**: a held Enter acts once on the footer toggles, the library tree, the detail toggle and the video dock. Decisions D-29z1492 … D-29z1497, `backlog.json` v405.

**Advisor:** available. Consulted after orientation (it shaped the inventory, the split and the focus hand-offs) and before close.

**Consults:**
- `tech-lead` reviewed the v1 sketch (approve-with-lows, TL-R426-01…09, all Low/Info). It then reviewed the test-only delta (approve-with-lows on `aef454cd`): `b-round-426/sketch-review.md`.
- `product-designer` and `ableton-arrangement-expert` were not consulted. Nothing visible changes, no per-press behaviour changes, and no Live behaviour applies.

## 1. Round 426 accepted from C evidence (D-29z1492)
- `c-round-426.json`: PASS, 0 bugs, `browserVerified` and `realVerified` true. B ran `tools/l57-check.py` on it: L57 OK.
- B did not rely on C's summary alone:
  - re-ran C's compare on C's own JSONs: `python3 -I c-round-426/probe/compare.py c-round-426/probe` gives `ALL OK (28 cells)`;
  - diffed `c-round-426/b425copy/mutants/summary.txt` against `b-round-425/mutants/summary.txt`: identical.
- The fake-bearer row with a real backend stays BLOCKED (backend unavailable in cloud). It is open backend evidence, not a `browserVerified` gap.
- Gate 426 published `052c76c` on both remotes. That is the new baseline.
- **SYS-2 stage 2a is done.**
  - A-R422-REVIEW-L1 is closed by HM15.
  - A-R107 is advanced and stays open.

## 2. Rulings
- **TL-R425-09 (D-29z1493, D-29z1496).** A's reviewer rated it Medium; B had ruled it Low. The premise was wrong.
  - During a pointer gesture, the StudioWorkspace window keydown handler prevents a fresh Enter before any button clicks.
  - A refused Pan reset is therefore unreachable by Enter.
  - HM5b now pins the real path as a characterization row. It checks: Enter prevented, pan kept, focus kept, refusal written once, and the whole snapshot including `statusSequence` unchanged after the repeats.
  - B first filed a Low for "refusal re-announced per repeat". The tech-lead review (item 3) and the full-snapshot assert show that the refusal is not re-announced in the steady state, so that Low is withdrawn. The moving-drag variant is kept as a hypothesis: INFO-TL-R426-MOVING-DRAG-REPEAT.
- **Stage 2b split (D-29z1494).** By surface, per the advisor and the L50 size rule:
  - **2b-i (persistent surfaces):** this round.
  - **2b-ii (transient surfaces) is next.** It covers:
    - the export dialog;
    - the grid and marker menus;
    - the marker row flag and editor, including a held-Escape probe at HEAD;
    - the shortcut sheet Close and the footer Shortcuts button;
    - the library menu;
    - the narrow screen Send link;
    - folding the 7 remaining inline copies, then a closing grep row: 0 copies outside `studio-repeat-safe.ts` over `app/**` and `perf/**`.
  - **Stage numbering:** 4 stages. The 2b-ii task grants doc 274's and doc 275's l.4 to Completed (L28).
- **Gate 426 Architecture note (D-29z1495).** Recorded as signal SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT, not as a task.
  - The note's suggestion 1 is `confirmedBy` on TL-R425-04.
  - Tech-lead's view: use a check (a grep/lint row), not a `StudioButton` wrapper. A wrapper collides with `onKeyDown?: never` and with buttons that have their own key handlers.
  - **Checkpoint request:** after 2b-ii passes, B files one bounded frontend-architect checkpoint request with root (`ARCH-CHECKPOINT-SYS-2`, planned in `architecture_checkpoint_requests`, D-29z1497). It is non-blocking.

## 3. B pre-check (L58: all on the dispatched sketch `aef454cd…`, except the browser rows, see below)
| Check | Result | Evidence |
|---|---|---|
| Inventory at `052c76c` | Whole folder: 37 ENTER-GUARD, 4 KEYDOWN-NO-ENTER, 21 NONE. Also covered: `role=menuitem*`/`option` and the `<a>` in LibraryMenu, and 12 inline copies across 6 files | `data/scan-all-head.txt`, claims K8/K9/K9b/K9c |
| HEAD defect, real Chromium, both viewports | 14 of 18 cells change state on the repeats | `probe/head/*.json` |
| Sketch | 5 source files plus 2 test files; typecheck rc 0, lint rc 0 (205 warnings, 1 info), Biome rc 0 | `sketch-427.patch.txt`, `precheck-*.log`, `tools/make-sketch.py` |
| Mutants | 12 lines. HEAD-SRC turns HP1–9 red. Each single site turns exactly its row red. VIDEO-EXPAND turns HP7–9 red (focus hand-off) | `mutants/summary.txt` and `mutant-*.log` |
| Covering / full | 68 files, 1226/1226 / 266 files, 3984/3984, rc 0 | `precheck-a2.log`, `precheck-full.log` |
| Browser, HEAD :5173 vs sketch :5174 (own `cacheDir`; stopped; scratch `vite.config.ts` reverted) | `ALL OK (18 cells)`. Focus targets: search field, Expand, and the target itself, each with `:focus-visible` and a solid outline | `probe/compare.txt` |
| Per-press smoke, HEAD vs sketch | EQUAL at both viewports | `probe/smoke-compare.txt` |
| Review | approve-with-lows (v1), then approve-with-lows on `aef454cd` (delta is test-only) | `sketch-review.md` |
| Focus map and ring (advisor close check) | `compare.py` asserts the expected focus element, `:focus-visible` and a solid outline for all 18 cells: ALL OK | `probe/compare.txt` |
| L50 focus origins | 71 pre-existing hits in the 5 granted files; 0 added and 0 removed lines of the sketch match; one class ruling | `data/l50-focus-origins.txt` (K31) |
| Claims | planning vs sketch: 16 expected diff lines; stderr empty; `L58 OK` | `claims-427-*` |

The browser probe and the smoke ran on the v1 source. The delta to `aef454cd` changes only the two test files; the reviewer diffed it independently.

## 4. Signals and checkpoints
- **SIG-R426-STUDIO-BUTTON-REPEAT-DEFAULT:** new, see §2.
- **ARCH-CHECKPOINT-STEM-LANES:** unchanged. It is still requested and covers the lane module at the STEM-LANES boundary.
- **Regression:** due on or after 2026-11-13. If round 427 closes on or after that date, the 427 → 428 planning opens REGRESSION-2026-11-13 before 2b-ii.

## 5. Ready for commit
Nothing new is ready for root at this planning: round 426 is already published as `052c76c`. Round 427 is ready for the gate once C passes.

## Files written by B
- `tasks/round-426.md` (archive copy);
- `current-task.md`;
- `backlog.json` (v403 → v404, via `b-round-426/update-backlog.py` and `update-backlog-2.py`);
- `feature-status.md`;
- `b-next.json`;
- this file;
- `b-round-426/`: checkpoint, before-copies, sketch v1 and final, delta, review, mutants, probes, claims, grants, frozen tree, prechecks, tools, data.

No store file was modified. The scratch trees live under `/tmp/b427/`.
