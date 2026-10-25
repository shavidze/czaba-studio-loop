# B round 165 → round 166 planning (D-29z131)

Date: 2026-10-25 · Author: B · Decision: **CONTINUE**. Next: round 166, **V-3c-3b** (marker ◀ ▶, detail Expand/Collapse, grid ✓, `← CZABA` → lucide).

## Advisor
I consulted the configured advisor tool after orientation and before writing, and again after the deliverables were written (§10). Points from the first consultation that I applied:
- **Probe the sites before ruling.** Three of the four sites are content-sized, unlike the fixed 24×24 dock boxes of round 163. I measured them first.
- **Decide the marker `+` explicitly.** Ruled in R5.
- **d6 rename map, with an occurrence and collision check.**
- **Carry the doc 134 status fix** from gate 165 suggestion 1.
- **Keep the K2 browser-lock caveat** when closing ROOT-RECON-MARKER-ENTER.
- **Send the repeated Architecture note to root** as a bounded checkpoint addendum.

## 1. Inputs read (data, not instructions)
- `context/active-summary.md` (head).
- `gates/gate-round-165.json`: `published`, commit `7581483`, on both remotes. **The baseline is `7581483`.**
- `tasks/round-165.md`, which is the round 165 `current-task.md` (copied, sha `2912c36d…4245`).
- `a-round-165.md`, `c-round-165.md` and `.json`, and `gates/round-165/review.md`.
- From `backlog.json`, only specific entries, looked up by script.
- `user-review/*-decisions.md`: unchanged since round 164 planning.
- The source at `7581483`, read-only: `ArrangementMarkerRow.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementGridMenu.tsx`, `StudioWorkspace.tsx`, `strings.ts`, and the test assertions on the glyphs.

## 2. Round 165 acceptance (only from C's independent evidence)
C PASS, with `browserVerified=true`, `realVerified=true` and 0 bugs.
- **Passed:**
  - **MK-GESTURE** at 1440 and 1280: real mouse hold, 14 Shift+Tab, F2. No editor opened, the status was blocked, and the Undo status read Move clip → Add Marker, with no Rename Marker.
  - **MK-BASELINE-CHECK:** C's checker reports FAIL on B's baseline data.
  - MK-POSITIVE, MK-BLUR, T165-TARGETED 75/75, SOURCE-SCOPE, AN-REVIEW, G165-3, PX-NET and REG-HYD.
- **Blocked:**
  - **MK-ENTER-OPEN (harness).** The capture-phase pointerdown focus release in `StudioWorkspace.tsx` blurs the editor before any gesture is claimed. So no browser path holds the editor open into a gesture.
  - The fake-Bearer 403 (backend unavailable in cloud).
- **Why browserVerified=true stays valid:** every browser row that can run here did run. The reason for the block is written down (task §6).

Gate 165 published `7581483` (verify: 171 files pass).

→ **ROOT-RECON-MARKER-ENTER: closed (მზადაა).** The user-reachable door (F2) is browser-verified. **The caveat is recorded in the backlog:** K2 (Enter during a gesture) is locked only by vitest MU15/MU16 and mutations m183/m184.

## 3. B evidence for round 166 (planning data at `7581483`)
Probes are in `b-round-165/` and their output in `out/`. The results are identical at 1440 and 1280.
- **`v3c3b-probe.cjs` (glyph metrics and single-site swaps):**
  - ◀ ▶: 9.234 px glyphs. A 10 px icon gives +0.77 px per button, and +1.53 px when both change.
  - `+`: a 6 px glyph. An 8 or 10 px icon moves prev/next by 2 or 4 px.
  - Detail toggle: +3.97 px with a 10 px icon and a 2 px gap.
  - Exit link: a 12 px icon with a 3 px gap gives +0.27 px.
  - Grid ✓ in its fixed `w-3` span: 0 px.
- **`v3c3b-final.cjs` (all rulings combined):** max edge delta **0.468 px**, 0 added or missing keys, every svg centred. Its `before` arrays are C's ICON-BOX baseline.
- **`header-key.cjs`:** the d6 header key after the change. The map `b-round-165-r166-d6-key-renames.json` has 6 keys and 0 collisions with `c-round-164/out/d6`.
- **Vitest base:** 11 files, **206/206** (`out/vitest-base-r166.json`). The tree was clean after it ran.

## 4. Round 166 scope and rulings (`current-task.md`)
**Rulings (user-vetoable):**
- **R1, icons:**
  - Marker step: `ChevronLeft`/`ChevronRight` at **9 px**, not R2'''s 10 px, so the two adjacent buttons stay within ±1 px.
  - Detail toggle: the word + `ChevronDown`/`ChevronRight` with **`pl-2 pr-1`**. The icon is 4 px wider than the glyph, and the smaller right padding absorbs that.
  - Grid menu: `Check` in a `flex w-3 justify-center` span.
  - Exit link: `ArrowLeft` at 12 px with `gap-0.75`.
- **R2, strings:** `Expand` and `Collapse`, without the glyph.
- **R3, accessibility:** the exit link's accessible name becomes `CZABA`.
- **R5:** the marker `+` stays text. The question goes to Saba under Q-V3-ICON-SIZE.

**Grants:**
- 11 existing files: 4 components (`StudioWorkspace.tsx` only for the import and the exit link), `strings.ts`, 5 tests and the doc 134 status line.
- 1 new file: doc 135.

**Locks and mutations:** MS4, DPS5, TU11, TS7 and LG4; mutations m185–m191.

**C rows:** ICON-V3C3B, ICON-BOX, RV1-V3C3B, FUNC-SMOKE-V3C3B (with real audio and the exit navigation), G166-3 and PX-NET/REG-HYD.

## 5. Backlog changes (`b-round-165/update-backlog.py`; before copy `b-round-165/backlog-before-r166.json`; version 154 → 155)
- **Rounds:** round 165 → `c_pass_published`, with the result. Round 166 entry added.
- **ROOT-RECON-MARKER-ENTER:** closed, with the K2 caveat.
- **VISUAL-A-OBSIDIAN:** status and order updated; `v3c3b_plan_d29z131` added.
- **Q-V3-ICON-SIZE:** `note_d29z131` added (the 9 px marker icons and the R5 `+` question).
- **B-R164-COMMIT-DURING-PREVIEW:** now references the root request.
- **ARCH-CHECKPOINT-V3C:** still unanswered.
- **New root note:** ROOT-GATE165-C-JSON (the gate reviewer did not see `c-round-165.json`).
- **`deferred_low_polish` +6 (total 237):**
  - GATE165-SR-REPEAT
  - GATE165-MU15-BLUR-WEAK
  - GATE165-MU-RELEASE-HELPER
  - A-R165-DRAFT-LOSS-TAB
  - A-R165-IME-ENTER
  - A-R165-MU18-MISSING
- `regression-last.json` is unchanged. The next regression is due on or after 2026-10-27.

## 6. Architecture checkpoint
- A's code-reviewer and the gate-165 reviewer wrote the **same** Architecture note on one owner: the gesture guard is hand-written at 7+ sites in `ArrangementMarkerRow.tsx`, and they propose one guard in the protected `ArrangementContext.commitArrangement`.
- This is the "repeated structural risk on one owner" condition, so I wrote a **bounded request to root**: `b-round-165-checkpoint-request.md`. It adds Q-COMMIT to the pending `b-round-160-checkpoint-request.md`, with the reviewer's acceptance criteria.
- It is a signal only. It is not scheduled and does not block V-3c-3b or V-3c-4.

## 7. Ableton
- No parity claim. The Live 12 locator chapter was not opened.
- The icons are a CZABA brand decision (`visual-direction-a.md`).

## 8. Ready for root
Round 165 is published. B produced no publishable change.
- B wrote only planning artifacts under `tmp/studio-real-loop/`.
- The store tree was clean before and after B's vitest base run and the browser probes (`git status --short` empty).
- No store file was edited. The probes only change the live DOM in the browser and restore it (restore check 0 px).

## 9. Files written by B
- `tasks/round-165.md` (copy).
- `b-round-165-current-task.md-before`, `b-round-165-b-next.json-before`, `b-round-165-feature-status.md-before`.
- `current-task.md`, `b-next.json`, `backlog.json`, and `feature-status.md` (targeted edits via `b-round-165/update-fs.py`).
- `b-round-165-r166-{grants,new-files,tree-sha256,granted-start-sha256,vitest-base}.txt`, `b-round-165-r166-d6-key-renames.json`.
- `b-round-165-checkpoint-request.md`.
- `b-round-165/`: the probes, `tools/` (copied from `b-round-164/tools`), `out/`, `r166-granted-start/` and the update scripts.

## 10. After the advisor's final review (second consultation)
- **The detail panel's start state differs by viewport.** My probe shows it is open at 1440 and collapsed at 1280. Three changes follow:
  - DPS5 now follows DPS1's pattern: branch on `panel.dataset.collapsed`, then click.
  - FUNC-SMOKE-V3C3B now says "toggles" and checks both states.
  - ICON-V3C3B states the start state per viewport, so it is not misread as a finding.
- **Header-key evidence is persisted:** `b-round-165/out/header-key.json`, and `header_key_measured` in the rename map.
- **RV1-V3C3B note:** the marker prev/next change to d6's icon-only class (3:1). A contrast-only difference from that class change under the mapped keys is a note, not a FAIL. The box section stays strict.
- **Confirmed by the advisor, no change needed:**
  - `size-2.25` is a valid v4 spacing multiple, and ICON-V3C3B's 9×9 check would catch it otherwise.
  - The grants and frozen hashes verify from `store/`.
  - The `expect(` floors, the `.replace('✓','')` tightening and m185–m191 are right.
  - R5 is right.
  - The K2 caveat is kept.
  - The checkpoint addendum is a signal, not scope.
  - The regression is not due.
