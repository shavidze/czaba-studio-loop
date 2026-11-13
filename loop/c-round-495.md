# C round 495 — RETRO 495 verification

**Verdict: PASS (RETRO, no app code).** A wrote one line, no implementation. HEAD 3bcf8cb, tree clean before and after.

| # | Row | Result |
|---|---|---|
| 1,14 | SOURCE-SCOPE | 0 status lines, r495 manifest rc 0, protected manifest rc 0 (start and end) |
| 2 | G495-AUTH (browser, 1440x900 + 1280x720) | `auth_user` null and /studio-lab opens. /studio/middle-east shows "Sign in required", 0 `audio[src]`. `/api/studio-token` returns 401. Fake-bearer path BLOCKED (backend unavailable in cloud). Evidence `rows23.json`, `c495-protected-*.png` |
| 3 | STUDIO-SMOKE-495 | Clips 0→1, state Stopped→Playing→Stopped, position 00:00.000→00:01.471→00:01.5xx, export dialog opens and closes on Esc, both viewports. `rows23.json`, `c495-smoke-*.png` |
| 4 | RT-SCREEN | Line counts 138/168/118/144 and outside 97/124/86/101, identical to B (delta 0). Journey: 3 clips at left 512/1152/1792, 4th at 00:48.000 "(nearest free spot)", try-link visible, "Middle East — public preview" selected. SR-290-1 is visible: "Time selection" is cut under the footer at 1280x720 (`screens/journey495-3-export-1280x720.png`). Opened the DEMO 1280 full PNG; "No new SR" is product-designer's opinion. A first capture run timed out waiting for the timeline while the dev server was cold; the warmed re-run passed (environment, not an app defect) |
| 5 | CLAIMS | stderr empty, 0 MISSING. One difference: K24b prints "re-dispatched (D-29z1758)" for the three password Mediums because `find-ids.py` returns the first of two archive entries. The archive also holds the later `done (D-29z1764), client path` entries. The status is the same, the tool reports the older copy first (Low info for B) |
| 6 | RT-NUM | All 22 data outputs and the L57/L58 windows are byte-identical to B's (`cmp`). Totals $247.20, B 175.31, A 47.47, C 24.42, B share 70.9 %, median 16.77, B median 12.58, FAIL total 69.53, stage sums, STOPs 487/489/492/493 confirmed by hand |
| 7 | RT-CAUSE | Spot checks of 487/489/492/493 STOP lines, C bug ids/origins, tasks/round-493 STOP list, tasks/round-489 "Why we missed it", sketch-review l.9 and the account.tsx focus hits all match |
| 8 | RT-IDS | All named ids present with the right prefixes; retro_runs has 495; next_due names 510 |
| 9 | RT-LESSONS | 60 lines, 57,164 B, 3 sections, line 3 pointer ok |
| 10 | RT-CHECKERS | L57 4 INCOMPLETE (485, 487, 488, 493), L58 OK for 481–494, current task rc 0 |
| 11 | RT-SABA | Q1–Q6 each with a default. Q1 opens SABA-DEVICE-CHECKS. Q4 says hiding or rewording the button needs Saba's permission |
| 12,13 | RT-PRIMITIVES / LEDGER | K26/K27 counts and lines equal. auth.ts l.379–391 and a-round-488 l.50 match the addendum |

Not verified: Ableton conformance, product-designer step, screen budget (not applicable to a RETRO round). Gate rows (full verify) belong to the gate.
