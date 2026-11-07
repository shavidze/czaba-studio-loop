# A round 378 — PERF-11c-iii-c2a (LoopBrace leaf, pattern A)

No STOP. Scope completed: task §2 items 1–2 and §3 checks.

## Changed files (exactly the 4 granted, `b-round-377/grants-378.txt`)
- `app/components/arrangement/ArrangementLoopBrace.tsx` (M) — sketch only
- `app/components/arrangement/StudioWorkspace.tsx` (M) — sketch only
- `app/lib/arrangement/__tests__/render-budget.test.tsx` (M) — sketch only (RB-LEAF5)
- `docs/implementation/2026/quarter-IV/244-perf-loop-brace-leaf.md` (new)

`git status --short --untracked-files=all`: 4 lines (3 M + doc 244).

## Sketch application
- `sha256sum b-round-377/sketch.patch.txt` = `28d86d7b01d4…9378` = `sketch-dispatched.sha256` (K13).
- `patch -p1 < ../tmp/studio-real-loop/b-round-377/sketch.patch.txt`: clean, 3 files.
- `sha256sum -c b-round-377/sketch-files-sha256.txt`: 3/3 OK (K11), re-checked at the end.
- No edit beyond the patch in the three code/test files.
- Frozen manifest `b-round-377/r378-frozen-sha256.txt`: rc 0. Protected `b-round-318/protected-sha256.txt`: rc 0.

## Checks actually run (logs in `a-round-378/`)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0; 205 warnings / 1 info repo-wide, no errors (`lint.log`) |
| `npx biome check` on the 3 code/test files | rc 0, "Checked 3 files" (`biome.log`) |
| `npx vitest run` render-budget + gesture-reentry + grid-snap-loop-drop | 3 files, 69/69 pass; render-budget 19 tests (`vitest.log`, `vitest.json`) |
| Extra covering files (reviewer Low): gesture-guard, ArrangementContext, marker-time-snap-ui, mode-toggle-colour-ui, studio-theme-obsidian, affordance-colour-ui, strings, studio-focus-ring | 8 files, 155/155 pass (`vitest-extra.json`) |
| render-budget counts | `expect(` 197, `it(` 19 (= `expect-counts-378.txt`) |

**Timeouts (L11):** no test above 50 % of its declared timeout. Slowest in the 3 task files: 1,468 ms (render-budget "does not re-render clips, overview bars…"; declared timeout 5 s default or 15 s per-row at l.369/l.418 — under 30 % either way). Slowest in the extra set: 509 ms (marker-time-snap-ui TS1). Full suite and `npm run verify` not run (speed rules: gate's job).

## Doc 244
- l.4 byte-for-byte `**სტატუსი:** Completed (C round 378 PASS)` (shell string compare).
- `## ` headings in TEMPLATE order: კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, TODO / შემდეგი ნაბიჯები.
- Records: premise numbers (leaf-head-378), pattern-A shape, RB-LEAF5, the 3 mutants with red rows from `mutants/sketch-run/*.full.log` (each: RB-LEAF5 only, 1 failed / 5 passed / 13 skipped), perf 264 rows / 0 count differences (harness has no mute/undo, gain only in jsdom + leaf probe), leaf-probe sketch values, TL-R378-L1..L3 rulings. Loop paths as `tmp/studio-real-loop/…`, labelled outside the repository.
- Cited rows/files exist: RB-LEAF5, SL10 (grid-snap-loop-drop l.896), marker-time-snap-ui, docs 238/241/242/243, GATE375-L1-UNUSED-WRAPPERS (backlog).
- `grep -rn 'C round [0-9]* pending' docs/implementation`: 0 hits.

## code-reviewer (actual subagent, once, on the full change)
Score 9/10, no Critical/High/Medium.
- Confirmed: 5 callbacks stable (chains end in `[]`, refs or once-created stores); handlers never read the `loop` prop (use `getArrangement()`/gesture state); no in-place `arrangement.loop` mutation in `app/`; RB-LEAF5 non-vacuous; no `any`/assertions; doc citations exist.
- **Low — more covering tests should run:** addressed: the 8 extra files above, 155/155 pass.
- **Info — "(L23)" in the doc unclear:** doc edited to "ლუპის lesson L23, `tmp/studio-real-loop/lessons.md`, repository-ს გარეთ" (L23 does hold the `XInner` + `memo` clause). Doc-only text edit after the review; no code changed after the review.
- **Info — RB-LEAF5 has no snap/grid positive control:** not added (test file is sketch-frozen; memo compares those props; SL10 covers behaviour). Signal for B.
- **Architecture note (signal for B, not acted on):** a fifth leaf now has `loop` + actions plumbed from `StudioWorkspace` (l.1035, l.3546). Reviewer: keep for this round; fold into ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING with GATE375-L1-UNUSED-WRAPPERS before VideoDock/Lane.

## Known gaps
- A ran no browser rows, perf spec, mutants-on-tree, leaf probe or loop recipe (C rows).
- Full vitest / `npm run verify` / build not run by A (gate).

## Acceptance (only what A truly passed)
- [x] Sketch sha K13, 3/3 file sha K11, no extra edits; frozen + protected rc 0.
- [x] Doc 244: l.4, headings, 0 pending hits.
- [x] typecheck, lint, Biome (3 files), 3 named vitest files pass, render-budget 19 tests, no test > 50 % timeout.
- [x] code-reviewer run, findings recorded; no Medium+.
- [ ] All C rows — for C.

## Exact next C checks
Task §4 as written: SOURCE-SCOPE (4 lines), CLAIMS (`bash b-round-377/claims-378.sh`), SKETCH-EQUAL, ASSERT-COUNT 197/19, UNIT (`covering-378.txt` + shuffle seed 42), MUTANTS-TREE (`run-mutants-378.sh` on a `cp -a` copy), PERF-INTERACT (alone), LEAF-PROBE and LOOP-BROWSER vs a HEAD `79ed8a9` copy at 1440×900 and 1280×720, G378-AUTH, STUDIO-SMOKE-378, DOCS. Note for DOCS: doc 244 l.17 cites "ლუპის lesson L23" (post-review text-only edit).

## Post-review checks (advisor-prompted)
- **Gate timing (L11 "higher time decides"):** `gates/round-377/verify.log` has file-level times only: render-budget 18 tests 13,610 ms (K21 matches), grid-snap-loop-drop 36 tests 6,239 ms, gesture-reentry 14 tests 316 ms. No per-test durations in the gate log, so the gate side cannot be checked per test. File averages (≈ 756 ms/test for render-budget) and A's per-test maximum (1,468 ms) are both below 50 % of the 5 s default. No STOP.
- **CLAIMS run by A:** `bash b-round-377/claims-378.sh` from the loop root, rc 0, 0 `MISSING` (`a-round-378/claims.txt`). Diff against `claims-378-sketch-output.txt` shows only K2 (2739 on the scratch → 4 on store/) and K19 (files 1, l.4 '**სტატუსი:** Completed (C round 378 PASS)', RB-LEAF5 mentions 5). These are exactly the deltas the task expects. All other lines equal the sketch.
