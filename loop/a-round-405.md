# A round 405: SYS-R385-LEAF-ACTIONS-CONTEXT stage 2 of 2

**Status:** implemented. No STOP.

**For B, at the top (A5 rule: a test-strength Medium in the patch is reported, not edited):** A-R405-REVIEW-GH5-G1-VACUOUS (Medium, test strength, from the code-reviewer; A confirmed it in the source).
- The line is `expect(muted[0].id).not.toBe('g1')` at `selection-wrappers-render.test.tsx:490`. It can never fail: `groupSelectedRows` defaults `groupId` to `crypto.randomUUID()` (`groups.ts:333-336`), and `mountCollapsedGroup` makes its groups through the G key, not a fixture id.
- The `groupHeaderIds` toEqual `[muted[0].id]` assertion is live. It shows the header that rendered is the muted group's.
- But no assertion shows by id that the muted group is the second group and not the folded `Group 1`.
- Suggested fix for a later bounded task: assert `muted[0].name === 'Group 2'`, or compare against the folded group's id.
- Not edited (reviewed = dispatched). Doc 258's GH5 row and TODO now describe it truthfully.

## 1. Changed files (`git status --short --untracked-files=all`: exactly 7 ` M`)
- Patch, applied byte-for-byte (`b-round-404/sketch-405.patch.txt`, sha256 `c64a5589ed319464f2e58b35faa0b43cf5849cacd80feaa83e1a850c9fbd9d92`; `git apply --check` clean, then `git apply`; not edited afterwards):
  - `app/components/arrangement/ArrangementLibrary.tsx`
  - `app/lib/arrangement/__tests__/actions-context.test.tsx`
  - `app/lib/arrangement/__tests__/fader-pointer-preview.test.tsx`
  - `app/lib/arrangement/__tests__/master-ui.test.tsx`
  - `app/lib/arrangement/__tests__/render-budget.test.tsx`
  - `app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx`
- Doc: `docs/implementation/2026/quarter-IV/258-sys-arrangement-actions-context.md`
  - l.4 is byte-exact `**სტატუსი:** Completed (C round 405 PASS)`.
  - The title now says "(rounds 404–405)". The `შეცვლილი პროექტი` line names the 6 stage-2 files.
  - `## შეცვლილი ფაილები` gets a stage-2 list.
  - New `### ეტაპი 2 (round 405)` inside `## ტესტირება`. It holds the closed ids, the AC7, AC4, FP0, master-ui footer, RB-LEAF1 and GH5 rows, the comparator closure with the four mutant ids, `summary.txt` verbatim (programmatic copy), the GH5 equivalence note, the perf note and a pointer to A/C reports.
  - TODO: the stage-2 items are marked `[x]`. GATE375-L1 stays with Saba (D-29z1398). The deferred Lows TL-R403-SK2-L3, TL-R403-SK-L1 and GATE404-L2/L3 stay. The AC4 scope note now includes the `markers` array.
  - One sentence in `## მიდგომა` changed: AC1's coverage gap now points to AC7 instead of the TODO list.
  - `## ` headings: the 7 TEMPLATE headings in order (l.7, 15, 33, 50, 67, 74, 175). `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0.

## 2. Checks (logs in `a-round-405/`)
| # | Check | Result |
|---|---|---|
| A1 | `bash b-round-404/claims-405.sh` at start | rc 0, stderr 0 bytes. `diff` against `claims-405-planning-output.txt` shows no difference (`claims-start.txt`) |
| A2 | `npm run typecheck` / `npm run lint` / `npx biome check` on the 6 patch files | rc 0 / 0 / 0 (`typecheck.log`, `lint.log`, `biome.log`) |
| A3 | `npx vitest run` on the 6 files (actions-context, render-budget, selection-wrappers-render, library-preview, master-ui, fader-pointer-preview) | rc 0. 6 files, 85 tests passed (`vitest.log`, `vitest.json`) |
| A4 | Claims at end | rc 0, stderr 0 bytes (`claims-end.txt`, `claims-planning-vs-end.diff`). It differs from planning only on K2 (0→7), K5 (yes→no), K6 (new l.4), K6b (8→7, pending-form 0) and K7–K13. K7, K7b, K8, K9, K10, K11, K12 and K13 equal `claims-405-sketch-output.txt` line for line. K3 frozen 1292 rc 0; K4 protected rc 0, granted-protected 0 |
| A5 | `code-reviewer` (7 files) | see §4 |

**Slowest tests (L31; timeouts from the task's A3 figures, and render-budget `15_000` re-read from source):**

| Test | Time | Timeout | Share |
|---|---|---|---|
| render-budget "does not re-render clips, overview bars…" | 2251 ms | 15 000 ms | 15 % |
| selection-wrappers SS8a | 1591 ms | 20 000 ms | 8 % |
| render-budget RB-IM | 1522 ms | 15 000 ms | 10 % |
| master-ui footer | 1384 ms | 15 000 ms | 9 % |
| fader FP12 | 1049 ms | 20 000 ms | 5 % |

The new rows ran in AC7 16 ms, AC4 16 ms and FP0 368 ms. No test is above 50 % of its timeout.

## 3. Not run by A (speed rules)
- The full vitest suite, `npm run verify` and the build are gate rows.
- No browser or perf check: C owns rows 3–4, and perf is not asserted (L58).
- A did not re-run the mutants. They are B's evidence; C's row 5 runs them on the tree.

## 4. Code-reviewer (actual subagent `code-reviewer`, 7 files, score 8/10; no Critical/High, no Medium in the patch logic)
| Finding | Severity | Action |
|---|---|---|
| GH5 `not.toBe('g1')` vacuous | Medium (test strength) | Reported for B at the top. The patch file is not edited |
| Doc l.4 says `Completed (C round 405 PASS)` before C has run | Medium (reviewer) | **Rejected under L28.** A writes the post-PASS value; it is a claim pending C, and `c-round-405.json` stays the source of truth. The task fixes l.4 byte-exact. The same ruling covers the reviewer's `[x]` on GATE371/375: D-29z1400 says the TODO marks the stage-2 items done, and `### ეტაპი 2` states the C row-5 condition |
| Doc GH5 row overstated ("muted second group's id, not g1") | Medium (doc) | **Fixed** in doc 258: the row says what is really checked and names A-R405-REVIEW-GH5-G1-VACUOUS. A TODO note was added |
| AC7 relies on two microtask ticks for `song` ready | Low | Recorded; the task already rules on this (§1 side effects: same flush as `mountProbe`) |
| The 34 keys live in three places | Low | Already deferred (TL-R403-SK-L1) |
| `meter-ui.test.tsx` counts only `'ArrangementMaster'`, never `ArrangementMasterViewInner` | Low (outside scope) | For B. Not vacuous: that file mounts `<ArrangementMaster />` directly (task K8 note) |

Confirmed fine by the reviewer:
- the Library change is the rename only;
- no `any`, `@ts-ignore` or `as`, and the semicolons are present;
- the RB-LEAF1 removal loses nothing;
- the AC4 `not.toBeNull` removal is safe;
- FP0 and the master-ui clear are live;
- every doc row exists in its test file;
- the TEMPLATE heading order is correct;
- the summary block equals `summary.txt`.

**Architecture note:** none.

After the doc edits, the end claims were re-run: rc 0, stderr 0 bytes, the same 24 diff lines as before (K2/K5/K6/K6b/K7–K13 only). K3 1292 rc 0, K4 rc 0.

## 5. Known gaps
- The comparator closure (GATE371-L2, GATE375-L2) is real only when C's row 5 shows the four comparator mutants red on the tree. The doc says so.
- GATE404-L2/L3 are listed as deferred because the task names them. A did not open their content.

## 6. Exact next C checks
- Rows 1–7 of task §6.
- Row 5: run the mutants with `S=/tmp/c405-scratch OUT=<loop>/c-round-405/mutants`, never with the default OUT.
- Row 6: compare the doc's fenced `summary.txt` block against `b-round-404/mutants/summary.txt` byte for byte. Grep AC7 in `actions-context.test.tsx:320`, FP0 in `fader-pointer-preview.test.tsx:470` and GH5 in `selection-wrappers-render.test.tsx:472`.

## 7. Acceptance A truly passed
A1, A2, A3 and A4. A5 also passes: there is no Critical/High/Medium in the patch logic, and the one test-strength Medium is reported, not edited. Doc findings are fixed in doc 258. C rows: none claimed.

## For B
- A-R405-REVIEW-GH5-G1-VACUOUS (Medium, test strength): see the top of this report.
- A-R405-REVIEW-METER-UI-NAME (Low): `meter-ui.test.tsx:496-513` could also count `ArrangementMasterViewInner`.
- AC7 timing Low: already ruled by the task.

## Final re-check of doc 258 (after all edits)
- The 7 `## ` headings are in TEMPLATE order: l.7, 15, 33, 50, 67, 74, 175.
- `C round N pending` hits: 0.
- The fenced `summary.txt` block equals `b-round-404/mutants/summary.txt` (`diff` empty).
- `git status --short`: 7 lines.
