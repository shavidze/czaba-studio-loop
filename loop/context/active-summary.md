# Active loop summary (2026-11-08T04:15:33.141Z)

- backlog.json 2918 KB -> active view 273 KB
- status: G_ROOT_GATE round 401
- servers: `{"checkedUtc":"2026-11-08T04:09:37.1548619Z","round":401,"attempt":1,"store":200}`
- last publication: c17d0e9e12476ee2b496e89506775eb4b8a52c4b (rounds 399-400)
- last root gate: round 401 skipped - C taskStatus FAIL

## Current items: -

## Open findings: 900 (6 Critical/High/Medium)
- **A-R73-SAFARI-FLAG-FOCUS** / medium / environment_webkit_unavailable: Chromium fixed (round 74 B1 explicit flag focus; C round 75 MK rows PASS); Safari/Firefox-mac unverified - only Chromium on the cloud runner (same class as GATE97-S2); Tech Lead manual check, does not block T12 per the 2026-10-23 rule / Safari / Firefox-mac: clicking flag B does not move focus off flag A while B becomes aria-current; Delete would remove A
- **GATE232-S2** / medium / contract half verified (C round 264, c-round-264/cc.json; published 2ea196e); platform half open_tech_lead_manual (does not block, 2026-10-23 root clarification) (D-29z552) | L46 deadline RETRO 260 passed (D-29z521): contract half -> L46-CONTRACT-CHECKS; platform half with Saba | open_tech_lead_manu …[see backlog.json] / Windows maps left Ctrl+Alt to AltGr on AltGr layouts; if Chromium reports getModifierState('AltGraph') for left Ctrl+Alt the toggle never fi
- **GATE271-S1-NO-REALIGN** / medium / awaiting_user (D-29z593): product decision, tied to SABA-Q-11C-REALIGN; the reviewer's two options (0 as a magnetic edge; Alt with Snap on = absolute) added to user-review/questions-11c-stage2.md as (a) and (d); not a bug of round 271 (Saba option (a) contract); not scheduled until Saba answers / once a clip is off the grid, a Snap-on drag cannot put it back on a grid line (relative snap keeps the offset; start 0 unreachable for a cli
- **GATE274-S1-HELD-REPEAT-ANNOUNCE** / medium / open_tech_lead_manual (D-29z606): per-step announcement is the round-274 contract (SK13, doc 205); the only remaining step is a real screen-reader check (2026-10-23 root clarification: does not block); manual row TLM-R274-SR-HELD-REPEAT, deadline RETRO 290 (L46). If Saba reproduces it, it becomes a  …[see backlog.json] / a held ArrowRight on one clip writes a new nudge text on every key repeat (function form, new start each step), so the aria-live span is re-
- **GATE304-M1-PERF-LIB-NOT-IN-GATE** / medium / open_root (D-29z800): = ROOT-REQ-VITEST-PERF-INCLUDE (vitest.config.ts is outside loop grants); non-blocking for the loop (as the 2026-10-23 root clarification for root/manual-only Mediums); until root lands it, every PERF task cites the scratch-config command for perf/lib tests as an A and C row / vitest.config.ts includes app/** only, so perf/lib/report.test.ts and zoom-probe.test.ts (ZP1-ZP6) never run in the gate; only scratch-confi
- **TL-R398-SK-M1** / medium / sketch_input (D-29z1364): not in app code; fix in sketch-14bii-lane before 14b-ii dispatch (add window blur unpin, remove all 3 listeners) with a row + mutant / PERF-14b-ii lane sketch: gesture pin cleared only on pointerup/pointercancel; touch/pen pointerId churn + window blur leaves a permanent pin
- ... and 894 Low/info (see backlog.json)
