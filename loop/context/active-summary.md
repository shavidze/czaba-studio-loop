# Active loop summary (2026-11-06T06:52:03.101Z)

- backlog.json 2673 KB -> active view 255 KB
- status: G_ROOT_GATE round 364
- servers: `{"checkedUtc":"2026-11-06T06:29:55.7134382Z","round":364,"attempt":1,"store":200}`
- last publication: df4e5b13c51596f7eb9e942e7545c7cea6ad023e (rounds 363-364)
- last root gate: round 364 published - commit df4e5b13c51596f7eb9e942e7545c7cea6ad023e pushed

## Current items: -

## Open findings: 839 (7 Critical/High/Medium)
- **A-R73-SAFARI-FLAG-FOCUS** / medium / environment_webkit_unavailable: Chromium fixed (round 74 B1 explicit flag focus; C round 75 MK rows PASS); Safari/Firefox-mac unverified - only Chromium on the cloud runner (same class as GATE97-S2); Tech Lead manual check, does not block T12 per the 2026-10-23 rule / Safari / Firefox-mac: clicking flag B does not move focus off flag A while B becomes aria-current; Delete would remove A
- **GATE232-S2** / medium / contract half verified (C round 264, c-round-264/cc.json; published 2ea196e); platform half open_tech_lead_manual (does not block, 2026-10-23 root clarification) (D-29z552) | L46 deadline RETRO 260 passed (D-29z521): contract half -> L46-CONTRACT-CHECKS; platform half with Saba | open_tech_lead_manu …[see backlog.json] / Windows maps left Ctrl+Alt to AltGr on AltGr layouts; if Chromium reports getModifierState('AltGraph') for left Ctrl+Alt the toggle never fi
- **GATE271-S1-NO-REALIGN** / medium / awaiting_user (D-29z593): product decision, tied to SABA-Q-11C-REALIGN; the reviewer's two options (0 as a magnetic edge; Alt with Snap on = absolute) added to user-review/questions-11c-stage2.md as (a) and (d); not a bug of round 271 (Saba option (a) contract); not scheduled until Saba answers / once a clip is off the grid, a Snap-on drag cannot put it back on a grid line (relative snap keeps the offset; start 0 unreachable for a cli
- **GATE274-S1-HELD-REPEAT-ANNOUNCE** / medium / open_tech_lead_manual (D-29z606): per-step announcement is the round-274 contract (SK13, doc 205); the only remaining step is a real screen-reader check (2026-10-23 root clarification: does not block); manual row TLM-R274-SR-HELD-REPEAT, deadline RETRO 290 (L46). If Saba reproduces it, it becomes a  …[see backlog.json] / a held ArrowRight on one clip writes a new nudge text on every key repeat (function form, new start each step), so the aria-live span is re-
- **GATE304-M1-PERF-LIB-NOT-IN-GATE** / medium / open_root (D-29z800): = ROOT-REQ-VITEST-PERF-INCLUDE (vitest.config.ts is outside loop grants); non-blocking for the loop (as the 2026-10-23 root clarification for root/manual-only Mediums); until root lands it, every PERF task cites the scratch-config command for perf/lib tests as an A and C row / vitest.config.ts includes app/** only, so perf/lib/report.test.ts and zoom-probe.test.ts (ZP1-ZP6) never run in the gate; only scratch-confi
- **C-R363-01** / medium / scheduled (D-29z1185): round 364 option (a) via b-round-363/sketch-perflib.patch.txt (B sketch 40/40, MU-K/MU-N red); closes on C PASS / perf/lib/report.test.ts DC-KINDS regex/length does not know interact.drag.background-range.stopped.commits-per-move(.6x); perf-lib 39/40
- **C-R363-02** / medium / scheduled (D-29z1187): round 364 docs 234/168 (l.4 Completed (C round 364 PASS)); closes on C PASS / doc 234 l.4 still In Progress (stage 4 of 5), no stage-5 section; doc 168 no background-range mentions; reviewer Lows unapplied
- ... and 832 Low/info (see backlog.json)
