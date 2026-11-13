# C round 491 — B-R487-PROFILE-EDITOR-NARROW-OVERFLOW: **PASS** (browserVerified true)

HEAD `53ff249`, tree = 3 granted paths only. Production build of the tree on :5193 (own port), warm-up load first, probes run alone.

| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS: 3 paths (` M account.tsx`, ` M 315-…md`, `?? 317-…md`), K3 `0 0 0`; same at end | c1-status.txt, c1-status-end.txt |
| C2 CLAIMS | PASS: output equals `claims-491-sketch-output.txt` at start and at end, stderr empty | claims-start/end.txt |
| C3 APPLY | PASS: K5 `===`, patch sha `a3b6e637eedddbe2` = recorded | claims-start.txt l.5 |
| C4 COVERING | PASS: 5 files / 82 tests (own run) | covering.log |
| C5 DESKTOP | PASS: `1440x900 equal`, `1280x720 equal` vs HEAD prod | desk-eq.txt |
| C6 NARROW | PASS: `c6-check.py` rc 0, `C6 PASS`. 375/360/320: Save/Cancel `hit: self`, 32×32, right edge in viewport (375: 315/359; 320: 260/304), inputs 121.5 / 94 px; mouse and tap Save = 1 PUT and editor closes; Cancel closes; kb focus-visible. HEAD control (B's file) is `C6 RED`, 23 RED | c6.txt, c6-head.txt, tree-narrow.json |
| C7 MUTANT | PASS: M0 PASS, MA_no_min_w_0 RED at 375 and 320 (buttons pushed to 392/436) | mut.out, mutants.json |
| C8 VISUAL | PASS: viewed `tree-long-375x812` (✓ ✕ visible beside fields, long names) and `tree-ring-320x640` (focus ring on ✕ unclipped); desktop equal per C5 | shots/ |
| C9 AUTH+STUDIO | PASS at 1440×900 and 1280×720, fresh contexts: `/account` "Sign in required", no "Full Name", `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; `/studio-lab` anonymous, `Demo collection ready`; click + Enter on library item adds 1 Music clip (screenshot; my testid-count selector returned 0, the screenshot is the evidence); Space → `Playing` clock `00:01.471` (1280) / `00:01.483` (1440), Space → `Stopped` | c9.json, c9b.json, c9/ |
| C10 DOC | PASS: 317 l.4 exact; 7 TEMPLATE headings in order; 0 `pending`; 315 has new line, no "round 489"; 121.5/94 and PUT/RED numbers match this round's runs | — |
| C11 L57 | PASS: checker rc 0 | l57-check.txt |
| OWN-BACKEND | BLOCKED: backend unavailable in cloud | — |
| gate | root gate only | — |

Bugs: none. Info: Studio audio graph/export WAV integrity and video transport are outside this round and were not measured (only the transport clock smoke). Ableton conformance: not applicable (Store page). Manual: TLM-R491-PHONE-NAME-EDITOR (real phone/WebKit/Firefox) remains open. Stubbed rows prove the client path only (L36).
