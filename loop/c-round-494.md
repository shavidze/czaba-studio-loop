# C round 494 — PASS, browserVerified true

Task: B-R488-PASSWORD-MODAL-DIALOG re-dispatch, docs-only v6 (C-R493-01). Store `/account` dialog; no Studio change. HEAD e4e1d1c, tree = v6 on the 6 granted paths; source unchanged by C (status identical at start and end).

| Row | Result | Evidence |
|---|---|---|
| C1 SCOPE | PASS | `status-start.txt`; K3 `0 0 0` |
| C2 CLAIMS | PASS | `claims-start.txt`, `claims-end.txt` equal `claims-494-sketch-output.txt`; stderr empty |
| C3 APPLY | PASS | K5 `======`, patch and delta sha equal recorded |
| C4 COVERING | PASS | 6 files / 97 tests (`covering.log`) |
| C5 DIALOG | PASS | production build of the tree (:5195); `PW-CHECK PASS`, 54 rows (18 × 1440/1280/375), `pw-check.txt`; CSS sha256 equal to B's v5/v3 hashes |
| C5b BACKDROP | PASS | `backdrop-probe.json`: strip 40 px, hit = page `min-h-screen` div, dialog count 1 after the strip click, all 3 viewports |
| C6 MUTANTS | PASS | M0 33 passed; 20 RED, 0 survived (`mutants/mutants-summary.txt`) |
| C7 VISUAL | PASS | `c7.json`, `shots/c7-*`: keyboard open → solid 1px brass (80%) ring; mouse open → none; `px.json`: tree vs HEAD mouse-open 0 px over 16/255, 823/823/1158 px differ ≤ 8/255 |
| C8 AUTH+STUDIO | PASS | `c8.json`: /account and /studio/middle-east "Sign in required", 0 `audio[src]` (premium not bypassed); /studio-lab demo, `auth_user` null, Enter 0→1 clip, Space Playing (clock ~1.77 s) → Space Stopped, both viewports |
| C9 DOC | PASS | l.4 byte-exact, 7 headings, pending 0, pd-ids-missing empty, round493 0/0/0, round492 0/0/2; l.22 numbers and ring reproduced by C's own run; l.36/l.95 match C5b; l.93: `ctrlk/ctrlk-esc-probe.json` byte-equal to B's (Esc closes both on tree, only the palette at HEAD); `ctrlk-v5-open.png` shows the palette dimmed behind the dialog |
| C10 L57 | PASS | `l57-check.txt` |
| OWN-BACKEND | BLOCKED | backend unavailable in cloud; not in `passed` |
| gate | — | root gate only |

## Findings
No new bugs. C-R493-01 is fixed. Not re-measured by C: doc 318 l.64 "before" half and l.90 (A's ledger gaps R2/R3, for B to cite in the ledger); l.86 wording note (R4) is accurate. Manual row TLM-R492-SR-PASSWORD-DIALOG is still Saba's (RETRO 510).

## For B
The three Mediums (MODAL-DIALOG, FIELDS-UNNAMED, ERROR-NOT-ANNOUNCED) now have C browser PASS rows on the final tree (P1–P18). Ready for root gate.
Studio flow (find sound → fit video → export) was not in this round's scope beyond the C8 smoke; no export/WAV measurement was run.
