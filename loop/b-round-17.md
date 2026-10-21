# B — Round 17 decision record (round 18 planning, bounded workflow)

Date: 2026-10-11 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. The second call, after writing, is in §9.

**Subagents.** B's session has no Agent tool, so the `code-reviewer` run (and the optional `design-philosopher` run) stays with A (task §7).

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- **Round 17 task.** `current-task.md` (round 17), archived unchanged as `tasks/round-17.md`. No earlier `round-17` archive existed, so nothing was overwritten. `b-round-17-result.json` (0 bytes) belongs to the harness and was not touched.
- **Agent reports.**
  - `c-round-17.md` and `c-round-17.json`, in full;
  - `c-round-17-result.json` (C's summary);
  - `a-round-17.md` §8–§10.
- **B's own records.** `b-round-16.md`, `b-round-16-checkpoint.md`, `b-next.json`, `feature-status.md`, `b-scripts/status-r17.js` and `b-scripts/plan-md-r17.js`, and in `backlog.json` v18: SRW-11B's `open_bugs`, `recorded_followups`, `stages_status`, `planned_rounds` and `tech_lead_manual_checks`.
- **Plan.** `plan.md`: D-29h, §4, §5 and §10.
- **Root items.** `root-pre-push-review.md` and `publication-checkpoint.json` are unchanged since round 16, and C's §9 carry list still matches them.
- **Original reviewer notes for 14b:**
  - `a-round-8.md` l.32–34 (design (a)–(d)) and l.171 (L11);
  - `a-round-9.md` §7 l.220–240 (round-9 L4–L8);
  - the A round-11 follow-ups, `a-round-11.md` l.371–374.
- **Prototype, read-only:** `output/studio-workspace-prototype/index.html` l.24. The detail panel uses `დასაწყისი` and `სიგრძე`, and the range fields sit under `მონაკვეთი` with the aria text `მონაკვეთის დასაწყისი წამებში`.
- **Source, read-only, to make the task concrete:**
  - `ArrangementDetailPanel.tsx`, the full 642 lines:
    - l.218–226: the reset effect depends on `range` as a whole object (L4);
    - l.188: the overlay `bg-foreground/60` (design (b));
    - l.596: the `biome-ignore` text (L6);
    - l.281, 289, 303, 324 and 340: the Latin labels (design (d));
    - l.270: the `w-56` info column;
    - l.321: the `w-44` input column with `w-20` inputs;
  - `ArrangementContext.tsx`:
    - `setTimeRange` (l.1026) does not touch the selection;
    - every `setRange(` caller (l.933–1702) either changes the selection or sets `null`. So **no user path changes the range while one clip stays selected**, and L4 is defensive;
    - `nudgeSelectedClip` (l.1238);
  - `ArrangementClip.tsx`:
    - l.281: a range gesture calls `selectClip`;
    - l.589: the lane overlay has the same `bg-foreground/60`;
  - `StudioWorkspace.tsx` l.940–975: the marquee and empty-lane paths set `null`;
  - tests: `detail-panel.test.tsx` (harness l.113–180; `live(api).setTimeRange` available), `render-budget.test.tsx` l.455–510 (R9-D3) and `track-layout.test.tsx` l.851 (the footer's Latin text).

    A grep found no test asserting `start`, `offset`, `start, წმ` or `end, წმ`. C's scripts use test ids.
- **Tree.** `git status` shows 18 M and 20 Studio `??`, plus the 2 foreign files. That equals C's end status. The live hashes of the 4 round-17 owned files equal `c-round-17/gates/owned-sha.txt`.

## 2. C's round-17 result, as evidenced

**C `taskStatus: PASS`, with no new bug.** All numbers below are C's own.

| Area | Result | Evidence |
|---|---|---|
| R17-P1 | **PASS**, measured with C's rangeLines | `c-round-17.md` §2. Row 32 = 2 × 16 and preview 167 in all 24 cells. Δ0 across lanes and widths. `title` exact. The price (+16 px in the one-line states) matches A cell for cell |
| R17-P2 | **PASS** | §3. Body Δ0 and the box unchanged across SFX/music/stems/video at 1440/288, 1280/480 and 1280/288. 0 samples in the box (round 16: 136/216) |
| R17-P3, R17-M | **PASS** | §4. Preview RMS −14.9 dBFS and silent after stop. Space/ArrowRight +1.000 s. Find → add = one Undo entry. The library playhead node stays the same, follows Play and the counters stay 0 |
| R17-U, R17-Doc | **PASS** | §5–§6. A's guards G1–G4 plus C's G5–G7 each fail as expected. G4 also fails the frozen R9-L1 |
| Adjacent | **PASS** | §7: R16-F2/F3/F1, R15-P2, R13-F3, R11A-1, dock, RF7-P2, and a real WAV export of 18.000 s |
| Gates | G17-1 (983/983), G17-2 (44/44 frozen OK), G17-3: **PASS** | §1 |

## 3. Decisions

### 3.1 Status changes, only from C evidence

| ID | Before | After | C evidence |
|---|---|---|---|
| C-R16-01 | open (Low) | **closed** | R17-P1/P2 (`c-round-17/runs/p1-*.txt`, `p2-*.txt`, `shots/c-r16-01-repro-fixed-1440-288.png`) |
| M-R10-1/M2 (round-9 reviewer) | recorded follow-up | **done** | R17-M (`runs/p3m-1440-288.txt`), guards G3/G4 (`gates/guard-c17.txt`) |
| SRW-11B / FB-08 | ბაგია | **ბაგია**: C-R8-01 (Medium), polish 14b in work | same |
| SRW-12 | მზადაა | მზადაა, with new evidence | R17-P3 |

Nothing new moved to **მზადაა**: SRW-11B still has C-R8-01 and polish open.

### 3.2 C's wording notes and A's deviations (D-29i)

- **A deviations 1 and 2 are B wording errors.** C showed both:
  - (1) `round(scrollHeight / line-height)` is structurally 2 under a fixed height. From now on, lines are counted with `rangeLines` or a page-state unclamp;
  - (2) the x = 284 sample column hits the library separator. The wording is now "0 samples in the box; the rest hit the preview or the separator".

  Round 18 uses both corrections (task §6.4).
- **Deviation 3, CDP denied.** "Real click" now means `$B click` at the element centre; coordinate clicks inside an element are synthetic. This stops both agents from re-probing.
- **Deviation 4, the python kill, goes to root** (`open_findings` `a-r17-dev-4-python-kill`). The round-18 task forbids killing processes the agent did not start.
- **Deviation 5:** the `—` state is test-only. Accepted.
- **R17-T** gains C's detail: a third line hides the playhead time.

### 3.3 Round 18 = polish 14b, as scheduled in D-29h

**Why now:**
- No C bug that code can fix is open;
- the Mediums wait on the Tech Lead;
- C-R12-01 waits on the milestone.

**Grouping.** Five items in one file:
- three change behaviour: L4, L11 and (b). C checks each with its own observable criterion;
- two change only text: L6 and (d).

A round-11's "Home on separators" is **not** added, because it would be a sixth item. It goes to the milestone fix round, together with the other A round-11 follow-ups. It is recorded, not dropped.

**The smallest honest contracts (D-29i):**
- **L4.** The reset effect depends only on the derived on-clip primitives plus the clip bounds.
  - There is no user path today, so a browser criterion would be fake. The acceptance is a component test (`setTimeRange` on another lane, `null`, and a same-value new object) plus a mutation (deps back to `range`).
- **L11.** One native `{ passive: false }` wheel listener on the content `<div>`, which prevents default only for a focused number input.
  - Rejected alternatives: React `onWheel` is passive and cannot prevent default; `blur` would steal focus; a document listener is banned.
  - jsdom never changes a number input on wheel, so "value unchanged" would be vacuous. The tests assert `defaultPrevented`, `passive: false` and cleanup.
  - The price is that the wheel does not scroll the content while the pointer is over a focused input.
- **Design (b).** `bg-foreground/60` → `/30`. The contrast inside the overlay is (1 − α) of the contrast outside, so the "≥ 50 %" rule equals α ≤ 0.5. C reads the computed alpha, which is deterministic; the screenshot is secondary.
  - The lane overlay in the frozen `ArrangementClip.tsx` stays `/60`. The difference is recorded and is aligned when that file is owned (SRW-14/18) or on a bug.
- **L6.** Only the reason text changes; the rule name stays.
- **Design (d).** The info column uses the prototype words `დასაწყისი` and `სიგრძე`.
  - `offset` becomes `წყაროდან` ("from the source"). That is short, and it does not repeat `დასაწყისი`.
  - The range fields become `საიდან, წმ` / `სადამდე, წმ`. Otherwise "დასაწყისი" would appear three times in one panel; the prototype also sets the fields apart (`მონაკვეთი`).
  - The `aria-label`s, test ids and footer stay verbatim. The footer is in the frozen `StudioWorkspace.tsx`, and `track-layout.test.tsx` l.851 asserts it.
- **The width risk in design (d).** `დასაწყისი 00:02.000 · სიგრძე 00:08.000` may not fit the 224 px `w-56` column. So A measures before code in page state and follows a fixed order:
  - `w-56`, then `w-60`, then `w-64`;
  - it stops if none fits, if the waveform would drop below 128 px at 1280/480, or if the content would start to scroll at the 142/144 heights;
  - the price goes into doc 027, and C verifies it.

## 4. Advisor advice applied

- **Decision:** CONTINUE. C-R16-01 and M-R10-1 are dropped from `remaining`.
- **L4:** I grepped every `setRange(` caller before writing the criterion. No user path exists, so the acceptance is a component test plus a mutation. The effect body references only the derived primitives, so Biome's exhaustive-deps rule stays quiet.
- **L11:**
  - `defaultPrevented` on a cancelable `WheelEvent`, `passive: false` through an `addEventListener` spy, and cleanup;
  - one listener on the content `<div>`, not one per input;
  - C runs the same check in page;
  - the real wheel goes to the Tech Lead (R18-T).
- **Design (b):** the computed alpha as the criterion. The lane overlay inconsistency is recorded in D-29i.
- **Design (d):** a §1.4 pre-code measurement (lines, widths, fit) with a stop rule. There is no triple "დასაწყისი". The reason the footer stays Latin is recorded.
- **Records:**
  - A deviations 1–2 recorded as B wording errors;
  - "real click" defined;
  - deviation 4 and C's `node_modules` copy recorded;
  - R17-T enriched;
  - vitest floor 983;
  - a 48-file sha reference. The frozen set is those 48 files minus `ArrangementDetailPanel.tsx` and doc 026.

## 5. Artifacts written

| File | Change |
|---|---|
| `b-round-17-checkpoint.md` | Context checkpoint, written first and updated during the work |
| `tasks/round-17.md` | Archive of the round-17 task (copy) |
| `b-round-17-tree-sha256.txt` | 48 files: the 46 round-16 entries re-hashed, plus `library-preview.test.tsx` and doc 026. 48/48 OK on the live tree. Against `b-round-16-tree-sha256.txt`, exactly `ArrangementLibraryPreview.tsx` and doc 025 differ, as in C's G17-2 |
| `backlog.json` | **v19.** Changes: C-R16-01 closed with evidence; M-R10-1/M2 DONE; the round-17 deviation records; stage-3 `evidence_round17`; `stages_status`; D-29i; round 17 `c_pass`; round 18 dispatched; Tech Lead R17-T and R18-W; open finding `a-r17-dev-4-python-kill`; `baseline_tree_at_round18`; `vitest_floor_round18` 983. Script: `b-scripts/status-r18.js`. Backup: `b-scripts/backlog.before-r18.json` |
| `docs/technical/studio-real-workspace/plan.md` | D-29i; the §4 FB-08 row; the §5 row 18; §10 (advisor line, round-17 result, round-18 dispatch, the SRW-11B remaining line). Script: `b-scripts/plan-md-r18.js`. Backup: `b-scripts/plan.before-r18.md` |
| `feature-status.md` | The board for round 18. Script: `b-scripts/feature-status-r18.js`. Backup: `b-scripts/feature-status.before-r18.md` |
| `current-task.md` | Round 18 |
| `b-next.json` | CONTINUE. Backup: `b-scripts/b-next.before-r18.json` |

No app source, test or other agent's file was touched.

## 6. Round-18 acceptance summary (for traceability)

- **The fixes:**
  - **R18-L4:** component tests and a mutation;
  - **R18-W:** component `defaultPrevented`, `passive: false`, cleanup and three mutations, plus an in-page check;
  - **R18-B:** computed alpha 0.3 ± 0.01 against A's recorded string, the borders, the overlay geometry on `lay11` and the R9-D3 diff;
  - **R18-D:** the texts, the line count `round(offsetHeight / line-height)`, the fit, the price against A's record, the footer verbatim;
  - **R18-L6**;
  - **R18-A:** browser apply, Enter, invalid input, no Undo;
  - **R18-U:** the six-part guard proof;
  - **R18-Doc**.
- **Adjacent:** R8 detail quick, R16-H1 quick, R16-F1 quick, R9-D3/RF7-P2 (detail playhead style writes in page), and the lane range drag.
- **Gates:** G18-1..3; vitest floor 983; frozen reference `b-round-17-tree-sha256.txt`, plus `library.ts` clean in git.

## 7. Remaining scope (not shrunk)

- **Open bugs:**
  - C-R6-02 and C-R8-01 (Medium; Tech Lead);
  - C-R12-01 (Low; milestone RF5-3).
- **Polish:**
  - 14b: L4, L11, (b), L6, (d) (round 18);
  - M1/L8 (after the Tech Lead run, or with SRW-13);
  - L2/L3 (with C-R8-01);
  - A round-11 follow-ups (milestone fix round);
  - aligning the lane overlay alpha (when `ArrangementClip.tsx` is owned).
- **Features:**
  - SRW-13 (FB-04/05/14 and the export 0 dBFS hard-clip);
  - SRW-14 (FB-13);
  - SRW-15 (FB-09/11; grid tempo only, never audio stretch);
  - SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06);
  - SRW-19 (FB-07, in scope);
  - SRW-20;
  - the SRW-21 adapter (the route mount needs approval);
  - T12 afterwards.
- **Verification:**
  - the milestone regression (21 regression-debt IDs plus C-R12-01);
  - the Tech Lead manual list: RF7-2/RF7-3, R23-1/2, R12-L4, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, the new R18-T, and Lenis.
- **Root carry:**
  - the purchased loader hardcodes middle-east;
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip;
  - the final commit/push after everything;
  - the foreign untracked agent files;
  - the shared Modal focus gap;
  - root GA `scroll` with consent denied;
  - the uncommitted tree (18 M + 20 untracked);
  - fake Bearer → 500 (no token);
  - the CDP allowlist;
  - A round-17 deviation 4;
  - the `publication-checkpoint.json` requirements.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - FB-04..07 and FB-09..14 are not started;
  - two Medium bugs are open;
  - SRW-11B has polish 14b open;
  - the milestone regression and the Tech Lead checks are pending.
- **Not BLOCKED:** round 18 needs no external information, approval or credentials.

## 9. Second advisor call

I made it after all the artifacts were written. The advisor confirmed CONTINUE and found the chain consistent: archive → backlog v19 → D-29i → board → task → b-next.

The archive check was the earlier `cp -n`, run before `current-task.md` was overwritten, with a matching size of 31 307 bytes. A later `cmp` compared the file with itself, so it is not cited as evidence.

I applied these before reporting (script inline; backup `b-scripts/current-task.before-r18-fix.md`):
1. **One ID, two meanings.** `R18-W` was both C's L11 acceptance and the Tech Lead real-wheel item. The Tech Lead item is now **R18-T**, following the R17-T convention, in `backlog.json`, `feature-status.md`, `plan.md` D-29i, the task (§4 and §6.6), `b-next.json` and this record.
2. **Line count for the detail `<p>`s.** The R17 `rangeLines` correction does not transfer: the `font-mono` lines contain `font-sans` label spans, whose inline boxes have different tops on one visual line. That would wrongly trigger the width fallback or a FAIL. For these lines, which have no fixed height, §1.4(a) and R18-D.2 now use `round(offsetHeight / line-height)`.
3. **The overlay colour.** Tailwind v4 compiles `/30` to `color-mix`, and Chrome's computed form may not round-trip to the token RGB. R18-B.2 is now alpha 0.3 ± 0.01, parsed from any computed form and compared with the exact string A records in §1.4. RGB is not a criterion.
4. **The layout.** R18-B and R18-A are pinned to C's `lay11` (music 0–16 s), so `21.875 %` / `23.4375 %` and "20/21 is invalid" are determined.
5. **Minor.** The "detached node is not prevented" check was vacuous, because a detached input is never focused. It is replaced by a `removeEventListener`-with-the-same-handler spy. The "inputs disabled" case is kept, but it does not count toward the guard proof.

The backlog's D-29i entry records points 2–4. The decision is unchanged: **CONTINUE**.
