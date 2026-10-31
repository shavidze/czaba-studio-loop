# B round 297 → 298 planning

**Date:** 2026-10-31. **Decisions:** D-29z758 to D-29z763. **Next task:** `current-task.md`, round 298, STUDIO-LINK-a3 (test-only Medium fix-up).

The round-297 task is archived as `tasks/round-297.md` (copied, not moved; `cmp` equal).

## 1. Evidence read
- **C round 297** (`c-round-297.json`, `c-round-297.md`): **PASS**.
  - 9 rows passed, 0 failed, 0 blocked. `browserVerified` and `realVerified` are true.
  - The browser rows were the cold deep link at both viewports and auth.
  - C reproduced the mutants: e → LH1+LH3 red, g → LH4 red, f equivalent, identity order → LH1+LH2 red.
- **A round 297:** the sketch was copied byte for byte, with no STOP.
- **Gate 297** (`gates/gate-round-297.json`): **published** `77d5341` on both remotes. `gates/round-297/review.md` is 7/10, COMMIT OK, with finding F1 and suggestions S2–S5.
- **Baseline for round 298:** HEAD `77d5341`, clean tree. Frozen list `b-round-297-r298-tree-sha256.txt` (1167).
- No new Saba, root or user-review decision file. `root-pre-push-review.md` and `publication-checkpoint.json` hold old content.
- **Regression:** due on or after 2026-11-02, so not now. **RETRO:** round 305.

## 2. Backlog updates (C and gate evidence only; script `b-round-297/update-backlog.py`)
- **STUDIO-LINK-a2 → done** (D-29z758).
- A-R296-REVIEW-2 and -5 are closed. A-R296-REVIEW-1 is closed for its focus/selection half; its warning half becomes GATE297-F1.
- **New open findings:**
  - GATE297-F1 (Medium);
  - GATE297-S2 and GATE297-S3 (Low, in fix);
  - INFO-C297-01…04.
- **New deferred Low:** GATE297-S5-VIDEO-MUTED-SSR.
- **New retro candidates:** RC-R297-SCRATCH-CACHEDIR and RC-R297-JSDOM-SSR-MUTANT. `lessons.md` is unchanged (59 lines).
- **Queue:** new stage STUDIO-LINK-a3 (round 298). STUDIO-LINK-b moves to round 299. STUDIO-LINK-DYNAMIC gains the INFO-C297-02 row.
- `rounds`: 297 → `c_pass_published`, and 298 is added. `current_task` and `version` (256) are updated.
- `feature-status.md`: round 297 is **მზადაა**, round 298 is **მუშავდება**, and the PD-REVIEW row is updated.
- **Backups:** `b-round-297/backlog-before-298.json`, `b-next-before-298.json`, `feature-status-before-298.md` and `lessons-before-298.md`.

## 3. Why round 298 is a test fix-up and not STUDIO-LINK-b
The gate reviewer showed that LH3's "no hydration mismatch" assertion cannot fail when its file runs whole.
- React 18.3.1 prints one prop-mismatch warning per load (`didWarnInvalidHydration`).
- LH1 hydrates first and consumes it.

**B reproduced it at HEAD.** Mutant (h), an option attribute that differs between server and client, leaves 4/4 green (`mutant-h-at-head-file.log`). With LH3 alone in its own file, the same mutant is red.

That is a vacuous assertion of the L52 class, which B rules **Medium**, the same as A-R296-REVIEW-1 last round. The 2026-10-23 bug gate fixes Medium findings before new scope. S2 (the regex) and S3 (leaked roots) are in the same two files, so the round has three related items.

**B's correction during planning.** B's first probe used a `typeof window` mutant, which is invalid under jsdom `renderToString`, and briefly concluded the split would not work. B retested with mutant (h) and the split does work for the library subtree. Recorded as RC-R297-JSDOM-SSR-MUTANT.

**Sketch pre-run** (`/tmp/b298-scratch`, `git archive` of `77d5341`, own Vite `cacheDir`):
- 7 files, 58 tests green;
- `tsc` rc 0, and Biome is clean;
- mutants: (h) LH3 red; (e) LH1+LH3 red; (g) LH4 red; identity order LH3 red; (i) green, as designed.

C runs one real-browser cold deep-link row at both viewports, plus auth.

## 4. Consults
- **Advisor:** available and consulted once, before writing. Its advice covered the STUDIO-LINK-b design (`StudioWorkspace` contextmenu probe, a separate library menu, the new-tab blur focus trap, L49/L23 sweeps), it pointed B to the unread gate-297 review, and it covered housekeeping. The gate review then changed the round's scope to the Medium fix-up. The STUDIO-LINK-b advice is saved for round 299.
- **product-designer** (read-only) was consulted for STUDIO-LINK-b:
  - a one-item context menu with "View in store" as a real `<a target=_blank rel=noopener noreferrer>`;
  - unmapped sources keep the native menu;
  - the title is unchanged;
  - a `?` sheet row "View in store (new tab)";
  - S4 = first load only.

  Saved in `b-round-297/product-designer-studio-link-b.md` for round 299.
- **Reference** (Ableton Live 12 manual, Working with the Browser, fetched 2026-10-31):
  - §4.7.3.3: a Splice sample's context menu can "view the sample's pack"; where it opens is not stated;
  - §4.7.7: "Show in Explorer/Finder";
  - no keyboard access to browser context menus is documented.

  Saved with the design notes.

## 5. Order after 298 (D-29z763)
REGRESSION if round 299 is planned on or after 2026-11-02. Otherwise:
1. STUDIO-LINK-b (299)
2. NAME-AND-HINT
3. PERF-3c and the rest of STUDIO-PERFORMANCE
4. STEM-LANES
5. SYS-1…3
6. STORE-2b…5
7. REVIEW-RECOMMENDATIONS
8. T12-ADVANCED
9. The phase-2 entries (skip rule)

SRW-21-PLAN stays parallel. RETRO is at round 305.

**Architecture checkpoint:** not yet. B requests one at the PD-REVIEW boundary (after STUDIO-LINK-b / NAME-AND-HINT). Its inputs are GATE296-ARCH-ROUTE-DOM-FOCUS and the library-menu vs marker-menu duplication question.

## 6. Ready for commit?
- **Round 297:** already published as `77d5341`.
- **Round 298:** after C PASS and the gate, root publishes the 3 §4 paths.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:** STUDIO-LINK-a3/b, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and every deferred Low remain. SRW-21 is `deferred_user`.
- **Not BLOCKED:** nothing external is missing.

## 8. Housekeeping
- The store tree was untouched: `git status` is empty, and the claims re-run after the last edit equals `claims-298-output.txt`.
- B ran no dev server and no browser this round. The :5173 server was only checked with one `curl`.
- Scratch vitest runs used their own `cacheDir` (`/tmp/b298-vite-cache`).
- Artifacts are in `b-round-297/`:
  - claims: `claims-298.sh`, `-output.txt`, `-after-sketch.txt`;
  - the 3 sketch files and `sketch.patch`;
  - logs: the covering run, `tsc`, mutants h/e/g/i, `mutant-h-at-head-file.log` and `vacuity-identity-order.log`;
  - `mutant-h-option-mismatch.py`;
  - `product-designer-studio-link-b.md`;
  - the backups and `update-backlog.py`.
