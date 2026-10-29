# A round 255 — SABA-B-10b fix-up (doc 192 only)

**STOP:** none.

## Start state (§0, all checked before editing)
- HEAD `c65e5e9ab7d53d66d2225ed794bd0c7ef657151b`; status = the 8 lines of §0 exactly.
- Carried sha256 rc 0; carried diff sha256 `a8492a4c8a23b7a1f1a12b7697d883518eb63e4a5b7ed53e1d6e833b099a46d5`.
- Frozen tree (1,110) rc 0; root files rc 0; grants start rc 0; all 7 protected files `git diff --quiet HEAD` rc 0.

## Changed file (grant 1 only)
`docs/implementation/2026/quarter-IV/192-saba-b-10b-visible-insert-marker.md`

`diff` against `b-round-254/r255-granted-start/` shows exactly three hunks:
1. **l.4** is now byte-exact `**სტატუსი:** Completed (C round 255 PASS)`.
2. **New last bullet in `## პრობლემები და გადაწყვეტები`** (l.99–107), Problem → Solution: C-R254-01 (Low), `scrollHeight` HEAD 1230 → 1260 px at both viewports, `clientHeight` 808 / 646 unchanged, +30 px = wrapping (+10 grid row, +20 `marker` row); the round-254 clause was tighter than the sheet's pattern; ruling D-29z476 with the bound ≤ 1260 px, no horizontal overflow, the 5 changed/added rows ≤ 2 lines (≤ 40 px), other rows equal HEAD; copy not shortened.
3. **Optional TODO bullet** (l.139–140): C-R254-OBS-01, deferred Low with C-R253-01, identical at HEAD.

The 7 TEMPLATE headings are unchanged and in order (l.7, 25, 56, 68, 83, 109, 132). l.121 → l.130 `INFO-B254-INK-ON-BRASS` is untouched.

## Checks after the edit
- `sha256sum -c --quiet b-round-254-r255-carried-sha256.txt` rc 0.
- Carried diff sha256 still `a8492a4c…46d5`.
- `sha256sum -c --quiet b-round-254-r255-tree-sha256.txt` rc 0 (1,110 files).
- Root files rc 0. Status unchanged (same 8 lines).
- Biome: not applicable to `docs/` (L30). No tests, typecheck or code-reviewer: one docs-only file, no code changed (§2.4).
- No Playwright run: browser rows are C's.

## Known gaps
- l.4 says "C round 255 PASS" ahead of C's verdict, as the grant requires (L28). If C fails, the line must be corrected in the fix-up.

## Next C checks
§3.1 as written: C-SCOPE-255 (doc diff vs `r255-granted-start/` = the 3 hunks above), C-UNIT-255, C-SHEET-255 (≤ 1260, per-row heights vs HEAD control), C-VIDEO-ZORDER-255, C-LESSON-255, AN-REVIEW-255, LAB-SMOKE-255, Auth; purchased origin BLOCKED (backend unavailable in cloud).

## Scope completed
Grant 1 (§0.1) and A steps §2.1–2.4. No B acceptance row is claimed by A; all §3 rows are C's.
