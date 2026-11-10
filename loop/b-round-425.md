# B — round 425 → 426 planning (2026-11-10)

**Decision:** CONTINUE. Round 426 = **SYS-2 stage 2a** (held Enter on the lane, group, master and tempo-row buttons). D-29z1487 … D-29z1491, `backlog.json` v402.
**Advisor:** available; consulted after orientation and before close.
**Consults:** `tech-lead` reviewed the sketch (approve-with-lows, 8 findings, all Low/Info) and then the post-review delta (approve-with-lows on `c97f080f`, 2 test Lows deferred); `b-round-425/sketch-review.md`. `product-designer` and `ableton-arrangement-expert` were not consulted: no visible or per-press behaviour changes and no Live behaviour applies.

## 1. Round 425 accepted from C evidence (D-29z1487)
- `c-round-425.json`: PASS, 0 failed / inconclusive / notRun, `browserVerified` and `realVerified` true. L57 OK (`b-round-425/l57-check-c425.txt`).
- B spot-checked two evidence files rather than the summary:
  - `c-round-425/out/g390-auth.json`: pass true; anonymous `/studio-lab` workspace with the badge and `auth_user` null; `/studio/middle-east` Sign in required with 0 `audio[src]`; the token API gives 401 with no header, 400 bare, and 403 for the fake bearer from the mock.
  - `c-round-425/out/rvm-1440.json`: load 0 empty, loads 1–3 Sign in required.
- The fake-bearer row with a real backend is BLOCKED (backend unavailable in cloud); it stays open backend evidence and does not make `browserVerified` false.
- Gate 425 `skipped` (no real changes), so the baseline stays `f6c76f4` (gate 424 published).
- **REGRESSION-2026-11-10 is closed.** `regression-last.json` = `{2026-11-10, 425}`. REGRESSION-2026-11-13 is planned, with its carries (R-RVM, R-CROSS-LANE-FIBERS, R-FOLLOW-OFFSET, R-DEV-WARMUP, R-EVICT-PIN; base copies in `c-round-425/`).

## 2. Rulings on C's findings and lookups
- **C-R425-01 → Low, cause unattributed, `deferred_low_polish` (D-29z1488).**
  - Evidence: 1 of 12 C dev loads; 0 of 8 production loads; B's 4 fresh-context dev loads all clean (`b-round-425/probe/rvm-cold-1440.json`, one deps hash, no 504). **Correction:** the :5173 dev server had run since 02:30 and had already served the route to C, so B's loads were warm, not cold; they do not test the cold-start hypothesis.
  - The signature (Invalid hook call, null `useState`, hydration fallback) matches two React copies after a Vite dev dependency re-optimisation. That cause is an **inference**, not confirmed.
  - Task 425 §3 said "an empty auth-guard page is Medium". B reads that as a reproducible failure in a user-reachable (production) build. Production is clean, and nothing was exposed.
  - The next regression makes production authoritative and runs a true cold replicate (a scratch server with a fresh `cacheDir` per start, the route loaded first, the Vite log kept). A production reproduction, or a cold dev failure without a re-optimise/reload line in the log, is Medium.
- **Lookups (D-29z1490):**
  - EVICT re-pinned to 0 `stop()` calls (round 393 streaming preview); HEAP `[2,5,16,16,16,16,16]` kept.
  - R340-CROSS-LANE +4 rendered fibers: attributed to round 424's inner lane component (`c-round-424.md` row 4). It stays a hypothesis (+1 per mounted lane) as INFO-C425-CROSS-LANE-FIBERS, re-pinned at the next regression.
  - Follow scrollLeft +2/+5 px: no named round explains it, so per task 425 §4 it is a finding, **C-R425-02** (Low, deferred).
  - Dev re-optimisation → harness fact (warm-up MP3 export first). Waveform decimals, refusal copy and empty `starts` are attributed (record only).
- **L7 sweep:** no earlier id shares these causes; INFO-C390-RV-M-HYDRATION-GLITCH is the same family as C-R425-01 and is referenced in D-29z1488.

## 3. Why SYS-2 stage 2a now (D-29z1489)
- Task 425 §10 row 1 applies: no Medium+ finding. STEM-LANES has no answer from Saba (`AGREE-STEM-LANES.md` has none, and `STEM-LANES-transcripts.md` does not exist), so the queue opens SYS-2 stage 2a, then 2b, SYS-1 and SYS-3.
- **The defect is real in Chromium at HEAD** (`b-round-425/probe/head/`): held Enter re-toggles track Mute and Solo, track and group folds, group Mute and Solo, Master Mute and the metronome, and reopens the video file chooser.
- **Not BLOCKED, not COMPLETE:** everything in this task runs in the cloud.

## 4. B pre-check (L58 — all on the dispatched sketch `c97f080f…`)
| Check | Result | Evidence |
|---|---|---|
| Inventory | Enter-specific scanner written because the round-421 one counted the Space-only group-fold guard as an Enter guard (INFO-B425-SCANNER-SPACE-AS-ENTER). Stage 2a at HEAD: 14 buttons, 0 Enter-guarded; on the sketch 14 ENTER-GUARD. Whole folder at HEAD: 62 buttons, 23 / 7 / 32 | `button-guard-scan-enter.py`, `data/scan-*.txt` |
| New test file | `mixer-held-enter-ui.test.tsx` HM1–HM15 + HM6b + HM11b, 17/17 | in the sketch |
| Mutants | 18 lines: each single site turns exactly its row red; HEAD-SRC 16/17; HELPER 15; SPREAD-TYPE `tsc` rc 2 | `mutants/summary.txt`, `mutants/run.py` |
| Covering | 57 files, 1015/1015 (render-count files included) | `precheck-a2.log` |
| typecheck / lint / Biome | rc 0 / rc 0 (205 warnings, 1 info) / rc 0 on 8 files | `precheck-*.log` |
| Browser, HEAD :5173 vs sketch :5174 (own `cacheDir`, stopped; scratch `vite.config.ts` reverted), both viewports | `ALL OK (28 cells)` | `probe/compare.txt` |
| Lane render names on HEAD (oracle for C row 7) | fade 4/4, trim 15/15, lane shell 0 | `probe/names-head-*.json` |
| Full vitest on the sketch | 265 files / 3,974 tests, rc 0 | `precheck-full.log` |
| Delta re-review (L58: reviewed = dispatched) | tech-lead approve-with-lows on `c97f080f`; TL-R425-09/10 (test Lows) deferred, D-29z1491 | `sketch-review.md`, `sketch-delta-68e6c66a-to-c97f080f.patch.txt` |
| Lane render names on the sketch (row 7) | equal to HEAD: fade 4/4, trim 15/15, shell 0 | `probe/names-sketch-*.json` |
| Rows 5–6 on HEAD (no per-press change in the sketch) | toggles flip once per click, Ctrl+Solo adds, group fold flips, Space plays/stops; focus to the Pan slider and to the group name, ring = `:focus-visible` + 1px solid outline | `probe/head/smoke-focus-*.json` |
| Claims | planning vs sketch: 6 expected lines differ; stderr empty | `claims-426-*` |

## 5. Signals and checkpoints
- **SIG-R422-REPEAT-SAFE-BUTTON-PROPS:** decided in this sketch (one module-level helper, not a props spread).
- **TL-R425-06 (stage 2b scope):** fold every remaining inline `key === 'Enter' && event.repeat` copy (MarkerRow, DetailPanel, ExportDialog, Library, LibraryMenu, LibraryPreview) onto the helper, with a grep row.
- **Architecture checkpoint:** none requested. The change adds a 9-line helper and props on one owner area; tech-lead found no structural risk (TL-R425-07). `ARCH-CHECKPOINT-STEM-LANES` (b-round-419) already covers the lane-module question at the STEM-LANES boundary.

## 6. Outcome, fixed in advance (for the 426 → 427 planning)
| C result | Next |
|---|---|
| PASS, no Medium+ | Gate publishes; round 427 = SYS-2 stage 2b (re-sized from `data/scan-all-head.txt`), unless the regression is due (2026-11-13) or Saba answers STEM-LANES |
| A Medium+ finding in the changed code | Round 427 = its bounded fix-up |
| A STOP from A | B rules on it (L10) before re-dispatch |
| A browser row that could run was not run | `browserVerified` false; B re-plans that half |

## 7. Ready for commit
Nothing new is ready for root this round: round 425 changed no source (gate skipped). Round 426 is ready for the gate once C passes.

## Files written by B
`tasks/round-425.md` (archive), `current-task.md`, `backlog.json` (v402), `regression-last.json`, `feature-status.md`, `b-next.json`, this file, and `b-round-425/` (checkpoint, before-copies, sketch, review, mutants, probes, claims, grants, frozen tree, prechecks, scanner, update script).
