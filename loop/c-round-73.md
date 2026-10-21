# C round 73 — C-R72-01 fix (SRW-16 stage 1) — verdict PASS, browserVerified=true

Verifier C · 2026-10-21 · Linux cloud · Playwright Chromium, fresh context per run, 1440x900 and 1280x720 (+1280x500 for stickiness). Artifacts: `c-round-73/` (tools, run logs, JSON, shots), `c-round-73.json`.
Env: `:5173/studio-lab` 200 at start and end; backend `:5199` unavailable (expected).
Source unchanged: HEAD 1e469e5, the same 10 status lines; owned files `67e1786e…`, `d5e854bf…`, `adb44c78…` equal A's report at C start and end; other7 OK; frozen 449/449 OK. C edited no app source.

## Results (real browser, both viewports)
| Row | Result | Evidence |
|---|---|---|
| C73-1 | PASS. Drop, ruler 5 s, M, Enter (flag@5 focused), REAL clip-body click (focus→BODY, ring-brand) then Delete: clip removed, marker 5.000 kept, status «კლიპი წაიშალა; სიცარიელე დარჩა.», Undo `კლიპის წაშლა` restores it. Second flag@8, clip click, → : start 0.000→1.000 (Snap on, 1 s), markers unchanged, active BODY | run-mt73-*.txt, shots/c73-1-* |
| C73-2 | PASS. Flag focused → (a) sfx lane background → BODY; (b) ruler → BODY; (c) flag 8 → flag 8 focused + aria-current; (d) F2, click in the input → input stays focused, editor open. MK-DELETE: only marker 5 removed, focus on flag 8, clip kept, Undo restores | mt73-*.json |
| C73-3 | PASS. + opens editor, Escape → focus `arrangement-marker-add` (A's documented Chromium behaviour), no marker, «მარკერი არ დაემატა»; `m` in search/BPM stays text; MK-NAV 5,8,101.352 / 8,5,0 | |
| MK-ADD-PLAYING | PASS. Marker 1.471 vs readout 1.462–1.471 at M (task tolerance ±0.15 s), 0 extra createBufferSource, position advancing | |
| C73-4a | PASS. Visible header link «Studio Lab Demo» on `/` → `/studio-lab`, workspace + demo badge | g73-*.json, shots/header-entry-* |
| C73-4b | PASS. Real overflow: 1280x500 natively (154 px), 1280x720 after REAL track-height drags (119 px). Wheel scroll moved lanes 154/119 px; ruler 229, tempo 258.5, marker row 277 unchanged | stick-*.json, shots/stick-* |
| C73-4c | PASS. Range 12–16 (all lanes), ruler click 17, M → marker 12.000, range kept | |
| REG-KEYS | PASS. Space/Home/G/1/2, arrow nudge (body), Ctrl+Shift+L, Volume fader (input type=range, the range-input branch) click → clip click → Delete removes the clip | |
| REG-HYD | PASS. 0 hydration warnings, 0 non-env console errors | |
| G73-3 | PASS (non-backend). `/studio-lab` anon demo badge; `/studio/middle-east` «Sign in required», no workspace; `/api/studio-token?product&file` anon 401; 0 forbidden requests, 0 Authorization headers. **Fake Bearer 403: BLOCKED** (backend unavailable in cloud, got 500) | g73-*.json, token-api.json |
| gate rows | `gate` (root) — not claimed | |

## Bugs
None in scope.

## Notes for B
- Harness note: C's first 1440 run failed three rows because of C's own off-screen ruler clicks (30/40 s past the 1440 px viewport with ruler left at 512 px) and a 20 ms tolerance stricter than the task's 0.15 s. Fixed in the harness; the raw log is kept (`run-mt73-1440x900-attempt1.txt`). Not app bugs. A second correction was needed: 25 s was still off-screen, so the final run uses 15/17 s with an on-screen guard. The attempt-2 log was overwritten; the attempt-1 log and the final log are kept.
- Snap is off by default; C's setup turned it on, so rows ran with Snap on and a 1 s grid.
- Not run: the Safari/WebKit flag-to-flag focus case (A review Medium 1). C checked Chromium only. This is pre-existing and outside ownership; it stays a signal.
- ROW-RANGE-M behaves as spec R6 says. It is still a stage-2 signal.
- Ableton: C73-1..4 არ ეხება (CZABA focus model). Clip Delete/nudge follows the ableton_round72 reference; C did not research it again.
