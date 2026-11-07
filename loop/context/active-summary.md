# Active loop summary (2026-11-07T10:54:40.056Z)

- backlog.json 2846 KB -> active view 272 KB
- status: G_ROOT_GATE round 386
- servers: `{"checkedUtc":"2026-11-07T10:41:58.8344371Z","round":386,"attempt":1,"store":200}`
- last publication: 5312260f7cd7c6cfe519f5ee4711bb729e76fd60 (rounds 385-386)
- last root gate: round 386 published - commit 5312260f7cd7c6cfe519f5ee4711bb729e76fd60 pushed

## Current items: -

## Open findings: 896 (7 Critical/High/Medium)
- **A-R73-SAFARI-FLAG-FOCUS** / medium / environment_webkit_unavailable: Chromium fixed (round 74 B1 explicit flag focus; C round 75 MK rows PASS); Safari/Firefox-mac unverified - only Chromium on the cloud runner (same class as GATE97-S2); Tech Lead manual check, does not block T12 per the 2026-10-23 rule / Safari / Firefox-mac: clicking flag B does not move focus off flag A while B becomes aria-current; Delete would remove A
- **GATE232-S2** / medium / contract half verified (C round 264, c-round-264/cc.json; published 2ea196e); platform half open_tech_lead_manual (does not block, 2026-10-23 root clarification) (D-29z552) | L46 deadline RETRO 260 passed (D-29z521): contract half -> L46-CONTRACT-CHECKS; platform half with Saba | open_tech_lead_manu …[see backlog.json] / Windows maps left Ctrl+Alt to AltGr on AltGr layouts; if Chromium reports getModifierState('AltGraph') for left Ctrl+Alt the toggle never fi
- **GATE271-S1-NO-REALIGN** / medium / awaiting_user (D-29z593): product decision, tied to SABA-Q-11C-REALIGN; the reviewer's two options (0 as a magnetic edge; Alt with Snap on = absolute) added to user-review/questions-11c-stage2.md as (a) and (d); not a bug of round 271 (Saba option (a) contract); not scheduled until Saba answers / once a clip is off the grid, a Snap-on drag cannot put it back on a grid line (relative snap keeps the offset; start 0 unreachable for a cli
- **GATE274-S1-HELD-REPEAT-ANNOUNCE** / medium / open_tech_lead_manual (D-29z606): per-step announcement is the round-274 contract (SK13, doc 205); the only remaining step is a real screen-reader check (2026-10-23 root clarification: does not block); manual row TLM-R274-SR-HELD-REPEAT, deadline RETRO 290 (L46). If Saba reproduces it, it becomes a  …[see backlog.json] / a held ArrowRight on one clip writes a new nudge text on every key repeat (function form, new start each step), so the aria-live span is re-
- **GATE304-M1-PERF-LIB-NOT-IN-GATE** / medium / open_root (D-29z800): = ROOT-REQ-VITEST-PERF-INCLUDE (vitest.config.ts is outside loop grants); non-blocking for the loop (as the 2026-10-23 root clarification for root/manual-only Mediums); until root lands it, every PERF task cites the scratch-config command for perf/lib tests as an A and C row / vitest.config.ts includes app/** only, so perf/lib/report.test.ts and zoom-probe.test.ts (ZP1-ZP6) never run in the gate; only scratch-confi
- **GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION** / medium / dispatched round 386 (D-29z1294, D-29z1295): reproduced by B in the browser at HEAD (b-round-385/probe/head-1440.json, head-1280.json: 1 pageerror, clock running); fix = resyncAfterDecode try/catch; rows EV11 x2, EV15, PW20; closes on C round 386 PASS / ensureDecoded fulfilled handler calls syncPlayback; if it throws, the Promise.all rejects and the three void call sites (history publish ~92
- **GATE-B385-M2-APPLY-SCHEDULE-ROLLBACK** / medium / scheduled (D-29z1297, D-29z1298): own bug round after round 386 (regression first if due); scope = roll back inside graph.client.ts (stop+disconnect started sources, disconnect master, rethrow) + Play repeated-throw case / applySchedule is not all-or-nothing: a throw partway through startPlan (after master connect and some source.start calls) leaves started sou
- ... and 889 Low/info (see backlog.json)
