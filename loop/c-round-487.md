# C round 487: B-R486-PROFILE-NAME-KEYBOARD — FAIL (open Medium), browserVerified true

Tree: HEAD bb82154 + A's byte-equal sketch (K15 2 of 2). A stopped on an unruled Medium. All verification below is in a real Chromium (Playwright) against http://127.0.0.1:5173.

## Result
- All sketch behaviour rows match B's recorded values in `b-round-486/probe/v4/*` exactly (JSON-equal for named, extra, noname).
- One Medium is open and reproduced: **C-R487-01 focus steal on save settle**. By the 2026-10-23 bug gate a Medium caused by this round blocks. B must rule on A's proposed fix (activeElement guard) and on Esc-in-flight → settle (PN9), then A applies it and adds the unit row.
- Severity note: the PasswordModal does not move or trap focus itself (pre-existing), so the practical impact is focus landing on a control behind an open modal. I keep Medium (wrong focus on an a11y fix) but it is arguably low-frequency.

## Rows (evidence: c-round-487/*.json, shots/)
| Row | Result |
|---|---|
| C-SCOPE / C-APPLY | pass (claims-end.txt equals the start output; K15 2 of 2; K17 L58 OK) |
| PN-TAB / KEYS / FOCUS / ESC-INFLIGHT / HELD / HELD-FAST / KBSAVE-500 / AX | pass at 1440, 1280 (and 375 where asserted); nameStop 12/12/8; held Enter 1 PUT vs HEAD 6; aria `button "Full Name Eve User"`, noname equal to B |
| PN-RING, PN-BOX, PN-PRESS-SELECT | pass (outline 1px brass 0.8, offset 2px, focus-visible only; pressed transform none) |
| PN-PIXEL | 0 px in 18 pairs vs headctl, YMIN=80 (pxdiff.txt) |
| G487-AUTH | pass, no premium bypass (auth.json, auth-*.png) |
| Focus-steal replay | **FAIL**, 4/4 runs show the steal (focus-steal-replay.json) |
| HS1-SCAN / covering vitest | 74/74 pass |
| OWN-BACKEND | BLOCKED, backend unavailable in cloud |
| Not run by C | the 14-mutant script; full doc content audit |

## Known gaps
- 375 editor overflow is pre-existing (round 489), not failed here.
- A's report asks B to reconcile the §1/C-APPLY clause (A may change a sketch line for a reviewer Medium) with the §2 STOP threshold. That is a task-text conflict for B.
- Reviewer Lows (no unit for ✓-click save, unawaited handleNameSave, PN8 weak, no unmount-during-save test) are unverified by C; record as deferred Lows.

## Next
Round 487 fix-up: B rules; A applies the guard + unit row + doc focus rule; C re-runs the replay and the PN-FOCUS/ESC-INFLIGHT/HELD rows.
