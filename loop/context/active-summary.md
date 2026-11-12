# Active loop summary (2026-11-12T10:04:41.040Z)

- backlog.json 3358 KB -> active view 295 KB
- status: G_ROOT_GATE round 465
- servers: `{"checkedUtc":"2026-11-12T09:57:41.3758361Z","round":465,"attempt":1,"store":200}`
- last publication: 6d321c740ed4343ab185381f7ae4216d9a350290 (rounds 464-464)
- last root gate: round 465 skipped - no real changes

## Current items: -

## Open findings: 968 (8 Critical/High/Medium)
- **A-R73-SAFARI-FLAG-FOCUS** / medium / listed in the Safari list (user-review/questions-retro-465.md Q2, D-29z1638); does not block | environment_webkit_unavailable: Chromium fixed (round 74 B1 explicit flag focus; C round 75 MK rows PASS); Safari/Firefox-mac unverified - only Chromium on the cloud runner (same class as GATE97-S2); Tech  …[see backlog.json] / Safari / Firefox-mac: clicking flag B does not move focus off flag A while B becomes aria-current; Delete would remove A
- **GATE232-S2** / medium / contract half verified (C round 264, c-round-264/cc.json; published 2ea196e); platform half open_tech_lead_manual (does not block, 2026-10-23 root clarification) (D-29z552) | L46 deadline RETRO 260 passed (D-29z521): contract half -> L46-CONTRACT-CHECKS; platform half with Saba | open_tech_lead_manu …[see backlog.json] / Windows maps left Ctrl+Alt to AltGr on AltGr layouts; if Chromium reports getModifierState('AltGraph') for left Ctrl+Alt the toggle never fi
- **GATE271-S1-NO-REALIGN** / medium / awaiting_user (D-29z593): product decision, tied to SABA-Q-11C-REALIGN; the reviewer's two options (0 as a magnetic edge; Alt with Snap on = absolute) added to user-review/questions-11c-stage2.md as (a) and (d); not a bug of round 271 (Saba option (a) contract); not scheduled until Saba answers / once a clip is off the grid, a Snap-on drag cannot put it back on a grid line (relative snap keeps the offset; start 0 unreachable for a cli
- **GATE274-S1-HELD-REPEAT-ANNOUNCE** / medium / open_tech_lead_manual (D-29z606): per-step announcement is the round-274 contract (SK13, doc 205); the only remaining step is a real screen-reader check (2026-10-23 root clarification: does not block); manual row TLM-R274-SR-HELD-REPEAT, deadline RETRO 290 (L46). If Saba reproduces it, it becomes a  …[see backlog.json] / a held ArrowRight on one clip writes a new nudge text on every key repeat (function form, new start each step), so the aria-live span is re-
- **GATE304-M1-PERF-LIB-NOT-IN-GATE** / medium / open_root (D-29z800): = ROOT-REQ-VITEST-PERF-INCLUDE (vitest.config.ts is outside loop grants); non-blocking for the loop (as the 2026-10-23 root clarification for root/manual-only Mediums); until root lands it, every PERF task cites the scratch-config command for perf/lib tests as an A and C row / vitest.config.ts includes app/** only, so perf/lib/report.test.ts and zoom-probe.test.ts (ZP1-ZP6) never run in the gate; only scratch-confi
- **STUDIO-VIS-5** / medium / scheduled (D-29z1512): REVIEW-RECOMMENDATIONS (Saba: defer) / Detail panel spacing (gap-0.5 -> gap-1, px-3 -> px-4)
- **SABA-B-12** / medium / in_progress (D-29z1515, D-29z1521, D-29z1523, D-29z1527, D-29z1532, D-29z1536, D-29z1538): stages 1, 2a, 2b, 3, 3b passed C and are published (5a30894, 1197dcb, 1a417fb, 0c22ac9, 8233840); stage 4 (selects, STUDIO-VIS-3) in REVIEW-RECOMMENDATIONS / Browser-default form controls in Studio (number spinbutton arrows on Detail panel From/To/Clip Gain; audit every input, select, search cance
- **GATE462-M1-EMAIL-SERVER-POLICY** / medium / open_root (D-29z1632): question ROOT-REQ-EMAIL-SERVER-DELETION; non-blocking for the loop (2026-10-23 root clarification class: root-only); app/lib/email.server.ts is not in global_forbidden_files (claims-463 K11); 0 importers; r2-tokens.server.ts and every download route unchanged; C round 462 C8 p …[see backlog.json] / Round 462 deleted app/lib/email.server.ts (dead order-paid email builder that used getDownloadUrl); root to confirm the deletion is acceptab
- ... and 960 Low/info (see backlog.json)
