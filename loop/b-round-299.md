# B round 299 → 300 planning

**Date:** 2026-10-31. **Decisions:** D-29z769 to D-29z773. **Next task:** `current-task.md`, round 300, STUDIO-LINK-b (feature).

The round-299 task is archived as `tasks/round-299.md`. It was copied, not moved, and is `cmp`-equal to the original.

## 1. Evidence read
- **C round 299** (`c-round-299.json`, `c-round-299.md`): **PASS**.
  - 12 rows passed, 0 failed, 0 blocked. `browserVerified` and `realVerified` are true.
  - The browser rows were the dock with both `<video>` muted, the cold deep link (both at both viewports) and auth.
  - C's own mutant w showed that the muted helper does not hide a real `muted` mismatch.
- **A round 299:** a byte copy of the sketch, with no STOP. Its reviewer reported REVIEW-1…4 and an Architecture note (the hydration harness, 3rd round).
- **Gate 299** (`gates/gate-round-299.json`): **published** `61c37d8` on both remotes. `verify` ran 229 files and 3,416 tests. The review (`gates/round-299/review.md`) scored 8.5/10, COMMIT OK, with S1–S3 (= A-R299-REVIEW-1…3).
- **Baseline for round 300:** HEAD `61c37d8`, the gate's `commit` field, with a clean tree. Frozen list: `b-round-299-r300-tree-sha256.txt` (1,168 entries).
- **Other inputs:** there is no new Saba, root or user-review decision file. `root-pre-push-review.md` and `publication-checkpoint.json` hold old content.
- **Schedule:** regression is due on or after 2026-11-02 (`regression-last.json`: 2026-10-30), so not now. RETRO is at round 305.

## 2. Backlog updates (C and gate evidence only)
Scripts: `b-round-299/update-backlog.py` and `update-backlog-2.py`. The backlog version is now 259.
- **STUDIO-LINK-a4 → done** (D-29z769). `browserVerified` was true, so it is **მზადაა**.
- **Closed:** C-R298-01, GATE297-F1 (fully), GATE297-S5 (a jsdom-only gap, closed by the test helper), GATE298-S3, GATE298-S1 and A-R298-REVIEW-5.
- **Ruled Low and deferred (D-29z770):** A-R299-REVIEW-1…4 (= GATE299-S1…S3). All go to `deferred_low_polish`, routed to A-R298-ARCH-HYDRATE-HARNESS.
  - **Why REVIEW-1 is Low, not the reviewer's Medium:** no failure or vacuous pass was reproduced (C's INFO-C299-02; NG9 turns red under mutants x, v, y, h, r2 and w today). It is test-only with no product behaviour, and it is the same class as A-R298-REVIEW-6, already Low (D-29z765).
  - Leaving it Medium would force a fourth test-only round on the same harness. The harness extraction closes all of them together.
- **Info, no task:** INFO-C299-01 and INFO-C299-02. INFO-C298-01 stays a signal.
- **Architecture signals:**
  - A-R298-ARCH-HYDRATE-HARNESS is now a 3-round signal (297–299) from 2 independent reviewers.
  - New: B-R299-LIBRARY-MENU-DUPLICATION.
  - Neither is scheduled; both are inputs to the checkpoint in §6.
- **New, D-29z773:**
  - SABA-Q-STUDIO-LINK-B (`awaiting_user`, non-blocking);
  - B-R299-IM24-LOAD-SIGNAL (info).
- **`rounds`:** 299 → `c_pass_published`; 300 is added as dispatched.
- **`feature-status.md`:** round 299 **მზადაა**, round 300 **მუშავდება**. The PD-REVIEW row is updated.
- **`lessons.md`:** unchanged at 59 lines, because no new failure class appeared.
- **Backups:** `b-round-299/backlog-before-300.json`, `b-next-before-300.json`, `feature-status-before-300.md` and `lessons-before-300.md`.

## 3. Why round 300 is STUDIO-LINK-b
- No Critical, High or Medium finding is open from round 299, so the bug gate allows new scope.
- STUDIO-LINK-b is the next item in the D-29z768 order, and Saba approved its scope on 2026-10-31.
- **No AGREE note:** the scope is "already agreed", the same as SABA-B-9/10/11. The reference section, the product-designer framing and the acceptance rows are in the task.
- **It is not split.** product-designer rejected a tooltip-only half.

**What the task specifies:**
- **Menu:** a right-click, Shift+F10 or the ContextMenu key on a mapped option opens a one-item menu. The item is an `<a role="menuitem" target="_blank" rel="noopener noreferrer">` "View in store".
- **Unmapped options:** the browser's native menu.
- **Focus:** every close returns focus to the option, including the window reason (L47).
- **Right-click:** keeps `selectLibraryOption`'s side effects (L49).
- **Keys:** Space activates the link, Enter keeps its native activation, and neither reaches the Studio shortcuts.
- **Also:** a `?` sheet row, a reverse map with a two-way test, and doc 220 stage 2 with l.4 Completed (L28).

**B's pre-run** (scratch `/tmp/b300-scratch`, own `cacheDir`s):
- **Gates:** `tsc` rc 0; Biome clean (205 pre-existing warnings).
- **New tests:** 21, all green.
- **Mutants:** m1–m10 all turn their rows red (`mutants/summary.txt`). Every restore was `cmp`-equal.
- **Covering set:** 114 test files.
  - The first run found one L23 collision, PNR2. It is now granted.
  - The final run had 1 failure, IM24. It is a playing-state row unrelated to the menu, and it ran while B's dev server and Playwright probes loaded the machine. Alone it passed 3/3, and it passed in gate 299. Recorded as a load signal; the task tells A to run the covering set alone.
- **Browser probe** (:5300, both viewports):
  - the menu, the new tab with `opener` null, focus back on the option, the keyboard open and the painted ring;
  - no window blur fires in headless when the tab opens;
  - the HEAD premise (native menu, no selection change on a right-click) is in `probe/head-premise.txt`.
- **Second probe** after the advisor's final check (`probe/space-preview-sketch.json`):
  - Space opens the product page, focus returns to the option, and the transport stays stopped.
  - A right-click moves an active preview to the clicked source, the same as a left click.
- **Claims:** K20 was added (the outside-press swallow and the marker item's focus classes), and §2.3, §4.1 and §7 were tagged.
- **Housekeeping:** the dev server was stopped afterwards. :5173 still returns 200.

## 4. Consults
- **Advisor:** available, consulted once before writing. It recommended:
  - the order (durable backlog and status files first);
  - the Low ruling for A-R299-REVIEW-1;
  - the AGREE ruling line;
  - L28 for doc 220;
  - no `preventDefault` on Enter, and Space → `click()`;
  - the L49 preview-switch decision;
  - the synchronous refocus and a blur probe;
  - the unreachable-filter ruling;
  - the mock-API journey;
  - a global `contextmenu` grep;
  - no `aria-haspopup`;
  - the covering and mutant sets.

  B followed all of these. The final advisor check found three things: an unprobed Space premise (now probed), a covering-set check for the two scanner tests (both are already in the 114), and three untagged facts (now tagged in K20 and K3). One divergence: B made **every** close refocus the option, including the window reason, which the advisor did not spell out. L47 forbids BODY, and the marker menu's window skip would leave BODY. 
- **Project subagents:** no new consult. The product-designer framing and the Live references from round 297 (`b-round-297/product-designer-studio-link-b.md`) were reused, as allowed for an existing research entry with its sources.

## 5. Order after 300 (D-29z772)
REGRESSION comes first if round 301 is planned on or after 2026-11-02. Otherwise:
1. NAME-AND-HINT (301)
2. **Frontend-architect checkpoint request to root** (§6)
3. PERF-3c and the rest of STUDIO-PERFORMANCE
4. STEM-LANES
5. SYS-1…3
6. STORE-2b…5
7. REVIEW-RECOMMENDATIONS
8. T12-ADVANCED
9. The phase-2 entries (skip rule)

SRW-21-PLAN stays parallel. RETRO is at round 305.

## 6. Frontend-architect checkpoint request (bounded, for root, after round 300's gate)
Root calls the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`. It should give one keep-or-extract answer for each input:
1. **A-R298-ARCH-HYDRATE-HARNESS** together with ROOT-RECON-GRID-HARNESS: one shared hydrate-route test harness. It would close A-R298-REVIEW-6 and A-R299-REVIEW-1…4.
2. **B-R299-LIBRARY-MENU-DUPLICATION:** `ArrangementLibraryMenu` and `ArrangementMarkerMenu` (and the grid menu) could share one menu primitive.
3. **GATE296-ARCH-ROUTE-DOM-FOCUS:** the route's DOM query for option focus, compared with the library's `optionRefs`.

Each answer gives its value, its risk and at most three sentences. An approved extraction becomes a separate B task with one owner and behaviour-preserving tests. It does not delay NAME-AND-HINT or PERF-3c.

## 7. Ready for commit?
- **Round 299:** already published as `61c37d8`.
- **Round 300:** after C PASS and the gate, root publishes the 9 §5 paths. That completes STUDIO-LINK.

## 8. Why not COMPLETE or BLOCKED
- **Not COMPLETE:** these all remain:
  - STUDIO-LINK-b and NAME-AND-HINT;
  - STUDIO-PERFORMANCE, STEM-LANES and SYS-1…3;
  - STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - every deferred Low.

  SRW-21 is `deferred_user`.
- **Not BLOCKED:** nothing external is missing.

## 9. Housekeeping
- **Store tree untouched:** `git status` is empty. The claims re-run after the last edit equals `claims-300-output.txt`.
- **Servers:** B started a sketch dev server on :5300 (own `cacheDir`) and stopped it afterwards. :5173 was used only for read-only Playwright probes.
- **Artifacts in `b-round-299/`:**
  - claims: `claims-300.sh`, `claims-300-output.txt` and `claims-300-after-sketch.txt`;
  - sketches: the 9 sketch files and `sketch.patch.txt`;
  - runs: `covering-files.txt`, the two covering logs, `sketch-tsc.log` and `im24-sketch-alone.txt`;
  - mutants: `run-mutant.sh` and `mutants/`;
  - `probe/`;
  - the backups and both backlog scripts.
- **Unverified Low candidate, not scheduled:** pressing `?` while the library or marker menu is open reaches the shortcut sheet's capture listener first [K16], so the sheet may open over the menu. This is source reading only; C may record it if it reproduces.
