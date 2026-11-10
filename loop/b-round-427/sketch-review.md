dispatched sha256 fa75fa825dc2caf8923c8d430ce55f699b97a34a3db5fcacdf8a850a5e8c37d6

# Sketch review — round 428 (SYS-2 stage 4 = 2b-ii-a)

- Dispatched sketch: `b-round-427/sketch-428.patch.txt`, sha256 `fa75fa825dc2caf8923c8d430ce55f699b97a34a3db5fcacdf8a850a5e8c37d6`.
- First review: `tech-lead` (read-only subagent; code-reviewer is not on B's consult list) on v1 `fc3d0b630bebe7878b254ba7a4b0e85ceca16fcd096493a4c21e84e5cffd4abc` (`sketch-428-v1-fc3d0b63.patch.txt`), after the mutants and pre-checks. **Verdict: approve-with-lows.**
- Delta: test-only (`sketch-delta-fc3d0b63-to-final.patch.txt`; source files byte-identical). Delta re-review by `tech-lead` on `fa75fa825dc2caf8923c8d430ce55f699b97a34a3db5fcacdf8a850a5e8c37d6`. **Verdict: approve.** Earlier lows TL-R427-01 and TL-R427-02 resolved; no new Low or above.
- No Medium or above in either review.

## Findings (first review, v1) and rulings
| id | Sev | Finding | Ruling |
|---|---|---|---|
| TL-R427-01 | Low | HS1: the repeat loop on the search field could not fail (no return assert, jsdom never edits `value`) | Fixed in the delta: each repeat asserts `toBe(true)` (the search field is deliberately unguarded); row renamed HQ1 |
| TL-R427-02 | Low | HX1: after the fresh press the Export button is disabled, so the post-press repeat loop only proved jsdom behaviour | Fixed in the delta: loop removed, `expect(primary.disabled).toBe(true)` added; the title names the pre-press repeat as the discriminator |
| TL-R427-03 | Low | Cancel and Export guards have no reproduced Chromium defect (XEXPORT `head held []`, no Cancel cell) | Ruled: preventive guards for consistency of the sweep; doc 276 says so (task ruling 3). No Cancel cell (a Chromium render is too short to hold Enter on Cancel) |
| TL-R427-04 | Info | jsdom dispatches keydown to a disabled button and React calls `onKeyDown`; Chromium cannot activate it | Recorded; HX1 no longer depends on it |
| TL-R427-05 | Info | `pressHeldEnter` is copied in three files (with `pressEnter`/`holdEnter` in two more) | Signal SIG-R427-HELD-ENTER-TEST-HELPER; candidate for 2b-ii-b or ARCH-CHECKPOINT-SYS-2 (D-29z1501) |
| TL-R427-06 | Info | implementation doc required | Doc 276 is granted to A |
| (delta) | Info | HQ1 `toBe(true)` pins the search field as unguarded; a later deliberate guard must update it | Accepted |
| (B) | — | Row-id collision: HS1–HS5 already exist in `grid-snap-ui.test.tsx` | Fixed in the delta: sheet rows are HQ1/HQ2 (claims K17 `ids-elsewhere`) |

## Checked and clean (reviewer)
- No newly guarded button had an `onKeyDown` before and none spreads props, so nothing is replaced or overridden; the Done fold is behaviour-identical.
- A fresh Enter, Space and mouse click are unchanged (probe `firstEqualsHead True` on all 13 cells).
- The sheet's window capture listener acts only on `?` repeats and Tab; the workspace's global Enter branch skips button targets.
- Scope rulings agreed: Modal ✕, CookieConsent, grid/marker menus, marker row and library menu copies (stage 5).

## Ordering matrix
Not applicable: no concurrency or ordering contract changes (L58); each guard is a synchronous `preventDefault` on a repeated Enter keydown.

## Host-dependent inputs
None: no generator, fixture or committed asset.
