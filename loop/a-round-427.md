# A round 427 — SYS-2 stage 3 (2b-i): held Enter on footer toggles, library tree, detail toggle, video dock

**Status:** implemented, handed to C. **No STOP.** Reviewer: no Critical/High/Medium.

## 1. Changed files (`git status --short --untracked-files=all`: 6 ` M`, 2 `??`)
- ` M app/components/arrangement/ArrangementDetailPanel.tsx` (sketch only)
- ` M app/components/arrangement/ArrangementLibrary.tsx` (sketch only)
- ` M app/components/arrangement/ArrangementLibraryPreview.tsx` (sketch only)
- ` M app/components/arrangement/ArrangementVideoDock.tsx` (sketch only)
- ` M app/components/arrangement/StudioWorkspace.tsx` (sketch only)
- ` M app/lib/arrangement/__tests__/mixer-held-enter-ui.test.tsx` (sketch only: HM5b + one import)
- `?? app/lib/arrangement/__tests__/panel-held-enter-ui.test.tsx` (sketch only, HP1–HP9)
- `?? docs/implementation/2026/quarter-IV/275-sys-held-enter-panels.md` (written by A)

The 7 sketch files were produced only by `git apply` of `b-round-426/sketch-427.patch.txt` (sha256 `aef454cd7b9f80ddaecb51a4db5ee5227bf142e147077de41f5eb7dff280eaa2`, equal to `sketch-427.sha256`) and not edited afterwards. Nothing outside the 8 grants; protected files untouched (K4 rc 0).

## 2. Checks (logs in `a-round-427/`)
| # | Check | Result |
|---|---|---|
| A1 | `bash b-round-426/claims-427.sh` at start | rc 0; stdout byte-identical to `claims-427-planning-output.txt`; stderr empty (`claims-start.txt`, `claims-start.err`) |
| — | `git apply --check` then `git apply` | OK; 6 M + 1 new |
| A2 | `npx vitest run $(grep '^app/' …/covering-files.txt)` | rc 0; **68 files, 1226/1226** (`a2-vitest.log`, plain `a2-plain.log`). `panel-held-enter-ui` 9/9, `mixer-held-enter-ui` 18/18 |
| A3 | `npm run typecheck` | rc 0 (`typecheck.log`) |
| A3 | `npm run lint` | rc 0; 205 warnings, 1 info — same as B's sketch (`lint.log`) |
| A4 | `npx biome check` on the 7 code/test files | rc 0, "Checked 7 files … No fixes applied." (`biome7.log`) |
| A5 | claims at end | rc 0, stderr empty (`claims-end.txt`). K1 `052c76c…`; K2 `2 ?? 6 M total 8`; K2b 0; K3 1319 rc 0; K4 rc 0; K5 `no`; K6 doc 275 + l.4 `**სტატუსი:** In Progress (stage 3 of 4; C round 427 PASS)`; K8, K9, K9b, K9c, K17 equal `claims-427-sketch-output.txt`; K13 all ids located, none NOT-FOUND; K19 `L58 OK`. Diff vs planning: `claims-planning-vs-end.diff` (only K1-free, K2, K5, K6, K8/K9/K9b/K9c/K17 lines, as A5 allows) |
| A6 | code-reviewer on 8 files + doc-delta re-review | no Critical/High/Medium; 3 Lows + 4 Infos (section 4); doc Lows fixed in doc only |

**Timeout headroom (L31), A's run.** No `testTimeout` in the vitest config, so the default is 5 s (50 % = 2.5 s). Every test line ≥ 2.5 s in `a2-plain.log` (scan saved as `slow-tests.txt`, file-total lines ignored), each against its own declared timeout:
- CP12a 5.4 s, CP12b 4.9 s, CP12c 5.2 s, CP12d 4.8 s — all four come from one `it.each` (l.918) inside the 30 s describe (l.499–1154) (max 18 %);
- TC10 4.0 s — 15 s (26 %);
- render-budget "Play → Stop → Play" 2.9 s — 15 s (19 %);
- track-group-collapse UC1 2.8 s, UC5 3.1 s — describe 20 s (16 %);
- selection-wrappers SS8a 2.9 s — 20 s (15 %).
- Held-Enter files (15 s describe timeout): slowest HP4 1.9 s, HP3 1.8 s, HM1 1.8 s (≤ 13 %).

No covering test is above 50 % of its timeout. The times are higher than B's sketch numbers because A started typecheck, lint and Biome while A2 was still running (overlap), not because of the change.

**Doc byte checks:** the doc's mutant code block (2nd fenced block) is byte-identical to `b-round-426/mutants/summary.txt`, 12 lines (`doc-mutant-block.txt`, `doc-mutant-block-cmp.txt`); l.4 `cmp` OK.

Not run by A (gate rows): full `npm run test:run`, `npm run build`, `npm run verify`. No browser probe was run by A (B's sketch probe exists; C rows 4–6 run it). Dev server :5173 was not touched.

## 3. Doc 275
- l.4 byte-exact `**სტატუსი:** In Progress (stage 3 of 4; C round 427 PASS)` (L28).
- The 7 TEMPLATE `## ` headings in order (კონტექსტი … TODO / შემდეგი ნაბიჯები).
- Rulings 1–8; ID table (A-R107-SWEEP-HELD-ENTER-TOOLBAR → HP1–HP9 partial; TL-R425-09 → HM5b characterization); HEAD counts from §1 (K8, K9, K9b); mutant block = the 12 lines of `b-round-426/mutants/summary.txt`; browser HEAD-vs-sketch table from `b-round-426/probe/compare.txt` (+ smoke `EQUAL` from `smoke-compare.txt`); TODO SYS-2 stage 4 (2b-ii).
- Cites rows HP1–HP9, HM5b, HM5, TH5, and for the folded inline copies the covering rows LF8 (`library-focus-handoff`), HT1 (`library-preview`), HA5 (`held-enter-add`) and HE4 (`status-announcement-ui`); every id was grep-checked in its test file. After the reviewer's L2/L2b, the doc no longer cites `detail-panel*` or `self-disabling-focus`.

## 4. Reviewer findings (actual `code-reviewer` subagent, score 8.5/10)
| id | Sev | Finding | Action |
|---|---|---|---|
| A-R427-REVIEW-L1 | Low | Doc 275 said results were "in `a-round-427.md`", read as inside the log folder | Doc: cites `tmp/studio-real-loop/a-round-427.md` + log folder and states the numbers inline |
| A-R427-REVIEW-L2 | Low | Doc said `detail-panel*` covers the folded DetailPanel copies; no repeat row there. Real cover: `status-announcement-ui` HE4 | Doc fixed. Delta re-review then found `self-disabling-focus` also has no Library/Preview repeat row (A-R427-REVIEW-L2b, Low); doc now names rows LF8, HT1, HA5, HE4 (each grep-verified). The task §7 text has the same `detail-panel*`/`self-disabling-focus` wording; those files are still in the A2 set, which is fine |
| A-R427-REVIEW-L3 | Low | HM5b `toBeGreaterThan(before.statusSequence)` is loose; a double refusal write on the fresh press would pass. Suggested `toBe(before.statusSequence + 1)` | **Not changed:** the test file is sketch-only (task §3 "do not edit"). Routed to B. HM5b is characterization (ruling 6). The point that the store skips duplicate refusals confirms `sketch-review.md` Item 3 and TL-R426-03 (`confirmedBy`, not a new id). Only the `toBe(+1)` tightening is new |
| A-R427-REVIEW-I1 | Info | HM5b leaves a pointer gesture open (no pointerUp/cancel); relies on unmount cleanup | Routed to B (sketch-only file) |
| A-R427-REVIEW-I2 | Info | HP5 search-field tail cannot fail (already labelled characterization); redundant `if (search)` | Confirms TL-R426-08 (`confirmedBy`), not a new id |
| A-R427-REVIEW-I3 | Info | Unused `trackHeader`, `EnterModifiers`/`ctrlKey` in the new test; `MIXER_CLIPS` name copied | Routed to B (sketch-only) |
| A-R427-REVIEW-I4 | Info | Scanner labels library option KEYDOWN-NO-ENTER though its Enter branch is in a delegated handler | Doc l.22 now says so |

Reviewer confirmed: no handler overwrite/ordering issue at any site; per-press behaviour unchanged (no stopPropagation; only Escape and drop read `defaultPrevented`); detail toggle Space branch untouched; doc l.4, headings and mutant block correct. Every doc edit after the first review went to a delta re-review (edits 1 and 3 clean; edit 2 → L2b fixed). The final L2b fix replaces file names with the four row ids I grep-verified (`LF8` l.451, `HT1` l.295, `HA5` l.266, `HE4` l.1051); it was not sent for a third review.

## 5. Known gaps
- No browser run by A in this round (C rows 4–6).
- SYS-2 stage 4 (2b-ii) remains: transient surfaces, Shortcuts footer button, closing grep across every folder `/studio-lab` renders.

## 6. Next C checks
Exactly task §6 rows 1–8 in L59 order: row 3 mutants on a HEAD scratch, rows 4–6 browser (probe `ALL OK (18 cells)` incl. focus map; smoke equal to HEAD; auth), then claims/patch identity/doc/scope. Doc row 7: `cmp` the mutant block against `summary.txt`.

## 7. For B
- **Architecture note (proposal only, not done):** `panel-held-enter-ui.test.tsx` l.1–181 copies the mixer test setup (env stubs, `pressEnter`, `holdEnter`, mount, snapshot). Stage 4 (2b-ii) would make a third copy. Proposal: one bounded test-only task to move `pressEnter`, `holdEnter` and a configurable snapshot builder into `__tests__/helpers/held-enter.ts`; acceptance: all 27 rows + HM5b green with the same assertions, no production change. The reviewer kept per-button guards over a capture-phase listener (explicit, greppable, mutant-testable).
- A-R427-REVIEW-L3 / I1 / I3 are sketch-test Lows/Infos for B to rule on (deferred_low_polish or fold into 2b-ii, which touches the same held-Enter tests).
- Task §7 wording names `detail-panel*` and `self-disabling-focus` as covering the folds; the real repeat rows are HE4, LF8, HT1 and HA5 (A-R427-REVIEW-L2/L2b, origin B spec).

## 8. Scope completed
- Passed by A: A1, A2 (68/1226), A3 (typecheck, lint), A4 (Biome 7 files), A5 (end claims match the allowed deltas; final re-run after the last doc edit, every value below read from that run: rc 0, stderr empty, K2 `2 ?? 6 M total 8`, K2b 0, K3 1319 rc 0, K4 rc 0, K5 no, K19 L58 OK, K8/K9/K9b/K9c/K17 = sketch output, no NOT-FOUND), A6 (no Medium+).
- Not claimed: every C row (§6 rows 1–8), the browser rows, and the gate rows (full suite, build, verify). The whole backlog and SYS-2 are not complete; stage 4 (2b-ii) remains.
