# B round 161 → round 162 planning (D-29z127)

Author: B · Date: 2026-10-25 · Next task: `current-task.md` (round 162, V-3c-2) · Archive of the completed task: `tasks/round-161.md` (sha256 `6a343648…4b7c82`, an exact copy)

## 1. What I read (as data)
- `current-task.md` (round 161), `a-round-161.md`, `c-round-161.md`, `c-round-161.json`, `gates/gate-round-161.json`, `gates/round-161/review.md`, `context/active-summary.md`, and specific `backlog.json` IDs: VISUAL-A `v3c_plan_d29z126`, rounds 159–161, Q-V3-ICON-SIZE, ARCH-CHECKPOINT-V3C, C-R154-02, GATE139-EMPTY-VIDEO-FORMATTER, C-R151-2/3.
- `regression-last.json` (2026-10-24, so the next regression is due 2026-10-27) and `user-review/` (no decision files).
- Source read-only:
  - `ArrangementLane.tsx` l.660–740, l.861;
  - `ArrangementGroupHeader.tsx` l.200–285;
  - `ArrangementClip.tsx` l.820–870;
  - `strings.ts` glyph lines;
  - `StudioWorkspace.tsx` l.360–430 and l.1576–1625 (pointer and focus guards);
  - the five test files that assert these glyphs.
- `visual-direction-a.md` § „იკონები“.

## 2. Backlog changes, from independent evidence only
- **Round 161 → `c_pass_published`.**
  - C's report has `browserVerified=true` and `realVerified=true`, 0 bugs, and 13 passed rows. The only blocked row is the backend-only fake-Bearer 403.
  - Gate 161 published `f08c7ce` on both remotes.
  - **V-3c-1 → მზადაა.**
- **New signals, not scheduled:**
  - ARCH-R161-ICON-RECIPE: the reviewer's architecture note, attached to the checkpoint.
  - INFO-C161-BRAND-EQ-ACCENT: C's note, for V-3c-4.
- **New deferred Low:** REVIEW-R161-SVG-IN-DRAGGABLE (gate reviewer suggestion 1; Firefox is not available in the cloud runner). The list now has 221 entries.
- **Q-V3-ICON-SIZE:** the reviewer's question (outline `Square` vs filled ■) is attached here for Saba.
- **ARCH-CHECKPOINT-V3C:** still unanswered. It is non-blocking for V-3c-1…3.

## 3. Decision for round 162: V-3c-2
**Why:**
- It is fixed in advance by `tasks/round-161.md` §7 (C PASS row).
- The regression is not due.
- There is no open Critical, High or Medium finding, and no user decision has arrived.

**Scope:**
- Three owners: `ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementClip.tsx`.
- Two strings.
- 11 grants, the same size as round 161, so no split is needed.

**Two deferred Lows close by construction in code this round already owns (the 2026-10-23 rule allows this when it is cheap):**
- C-R154-02 (▣ DejaVu fallback);
- GATE139-EMPTY-VIDEO-FORMATTER (the hint now interpolates one constant).

### Probe evidence (real Chromium, `f08c7ce`, both viewports)
- **First probe with R2'' as written:** fixed boxes 0.000 px. But content-sized hosts drift:
  - the import button shrinks 2 px and the track-name button grows 2 px;
  - clip titles move +0.77 / +1.20 px;
  - the group name moves −1.34 px.
  - I did not carry over the round-161 "0 px" claim.
- **R2''' (box-preserving gap: import `gap-1`, group name `gap-1.25`, clip header `gap-0.75`):** max 0.344 px. That shift is only inner text; every testid/aria-label/clip/header element is 0.000 px. The `before` arrays are C's baseline.
- **Pointer-target grep:** no guard on these paths rejects an `SVGElement`, so no `pointer-events-none` is ruled. C grabs or clicks each icon in FUNC-SMOKE-LANE, which is the functional discriminator this round has and V-3c-1 did not (gesture surfaces).
- **d6 rename map:** 6 keys, enumerated from the c-round-161 reference, with 0 collisions.
- **Vitest base:** 19 files, 353/353 at `f08c7ce`. The tree was clean after the run.

### Rulings (user-vetoable, recorded in `feature-status.md` and `backlog.json`)
- **R1 R2''':** in content-sized hosts, icon size + gap = old glyph advance + old gap, within ±0.5 px. This is the smallest honest reading of the spec's "the element does not move".
- **R2:** chevrons for both folds; `Plus` for import; `Layers` for the group mark (alternatives `SquareSquare`, `Group`); `Film` for the video clip mark (a kind marker, not a control, the same reasoning as the V-3c-1 expand ruling); `GripVertical` for the audio grip (literal 2×3 dots on the move handle).
- **R3:** the group fold becomes a children svg. The `before:content` pair and the dead test hook `data-fold-glyph` are removed; the state stays in `aria-expanded`.
- **R4:** `Your own video` label; the hint is built from the same constant.

### Ableton
Not applicable. This is a brand decision from the approved spec; no parity claim is made.

## 4. Neighbour risks and the rows that cover them
Track header widths → RV1-V3C2 and LANE-STATES-BOX (b). Clip move from the header → FUNC-SMOKE-LANE. Group collapse and selection → FUNC-SMOKE-LANE and T162-TARGETED. Video import → FUNC-SMOKE-LANE (file chooser and real clip). Clip title truncation → LANE-STATES-BOX (c).

## 5. Architecture checkpoint
- No new request. `b-round-160-checkpoint-request.md` is still pending and now also carries ARCH-R161-ICON-RECIPE.
- It is needed before V-3c-4 (surfaces). Without an answer by then, fallback (c) applies.

## 6. Completion status
**CONTINUE.** Still open:
- V-3c-2..5, M1/M3/M4, RV-1/2/3/5;
- the deferred Low polish (221 entries);
- T12-ADVANCED and the final regression;
- the awaiting_user items, SRW-21 (deferred_user), and the Tech Lead manual checks.

Nothing needs external input to continue.

## 7. Ready for commit
- Round 161 is already published by root (`f08c7ce`).
- Round 162 starts from a clean tree.

## 8. Artifacts
- **Root files:** `current-task.md`, `tasks/round-161.md`, `b-round-161-r162-{grants,new-files,tree-sha256,granted-start-sha256}.txt`, `b-round-161-r162-vitest-base.txt`, `b-round-161-r162-d6-key-renames.json`.
- **`b-round-161/`:** `r162-granted-start/`, `v3c2-probe.cjs`, `v3c2-probe-final.cjs`, `out/*.json`/png, `tools/` (copies of C's helpers), `checkpoint.md`, and pre-revision copies of `backlog.json`, `b-next.json` and `feature-status.md`.
