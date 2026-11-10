# Active loop summary (2026-11-10T13:16:02.536Z)

- backlog.json 3120 KB -> active view 280 KB
- status: G_ROOT_GATE round 431
- servers: `{"checkedUtc":"2026-11-10T13:05:02.9342431Z","round":431,"attempt":1,"store":200}`
- last publication: 1197dcbfad097ef910a26d416a2bce9bbab0e277 (rounds 431-431)
- last root gate: round 431 published - commit 1197dcbfad097ef910a26d416a2bce9bbab0e277 pushed

## Current items: -

## Open findings: 931 (10 Critical/High/Medium)
- **A-R73-SAFARI-FLAG-FOCUS** / medium / environment_webkit_unavailable: Chromium fixed (round 74 B1 explicit flag focus; C round 75 MK rows PASS); Safari/Firefox-mac unverified - only Chromium on the cloud runner (same class as GATE97-S2); Tech Lead manual check, does not block T12 per the 2026-10-23 rule / Safari / Firefox-mac: clicking flag B does not move focus off flag A while B becomes aria-current; Delete would remove A
- **GATE232-S2** / medium / contract half verified (C round 264, c-round-264/cc.json; published 2ea196e); platform half open_tech_lead_manual (does not block, 2026-10-23 root clarification) (D-29z552) | L46 deadline RETRO 260 passed (D-29z521): contract half -> L46-CONTRACT-CHECKS; platform half with Saba | open_tech_lead_manu …[see backlog.json] / Windows maps left Ctrl+Alt to AltGr on AltGr layouts; if Chromium reports getModifierState('AltGraph') for left Ctrl+Alt the toggle never fi
- **GATE271-S1-NO-REALIGN** / medium / awaiting_user (D-29z593): product decision, tied to SABA-Q-11C-REALIGN; the reviewer's two options (0 as a magnetic edge; Alt with Snap on = absolute) added to user-review/questions-11c-stage2.md as (a) and (d); not a bug of round 271 (Saba option (a) contract); not scheduled until Saba answers / once a clip is off the grid, a Snap-on drag cannot put it back on a grid line (relative snap keeps the offset; start 0 unreachable for a cli
- **GATE274-S1-HELD-REPEAT-ANNOUNCE** / medium / open_tech_lead_manual (D-29z606): per-step announcement is the round-274 contract (SK13, doc 205); the only remaining step is a real screen-reader check (2026-10-23 root clarification: does not block); manual row TLM-R274-SR-HELD-REPEAT, deadline RETRO 290 (L46). If Saba reproduces it, it becomes a  …[see backlog.json] / a held ArrowRight on one clip writes a new nudge text on every key repeat (function form, new start each step), so the aria-live span is re-
- **GATE304-M1-PERF-LIB-NOT-IN-GATE** / medium / open_root (D-29z800): = ROOT-REQ-VITEST-PERF-INCLUDE (vitest.config.ts is outside loop grants); non-blocking for the loop (as the 2026-10-23 root clarification for root/manual-only Mediums); until root lands it, every PERF task cites the scratch-config command for perf/lib tests as an A and C row / vitest.config.ts includes app/** only, so perf/lib/report.test.ts and zoom-probe.test.ts (ZP1-ZP6) never run in the gate; only scratch-confi
- **STUDIO-VIS-4** / medium / scheduled (D-29z1512): COPY-PD-VIS (after SABA-B-12 stage 3) / Rename "Source offset" -> "Clip origin" (strings.ts sourceOffsetLabel + selectedClipDetail)
- **STUDIO-VIS-5** / medium / scheduled (D-29z1512): REVIEW-RECOMMENDATIONS (Saba: defer) / Detail panel spacing (gap-0.5 -> gap-1, px-3 -> px-4)
- **STUDIO-VIS-6** / medium / scheduled (D-29z1512): COPY-PD-VIS (after SABA-B-12 stage 3) / "From, s" / "To, s" -> "From" / "To"
- **STUDIO-VIS-2** / medium / in_progress (D-29z1519): SABA-B-12 stage 2a, round 431 | severity set to the parent SABA-B-12 Medium (D-29z1520) / 6 native radios in ArrangementExportDialog -> theme-drawn dot (STUDIO_RADIO_CLASS)
- **SABA-B-12-STAGE-2B-PROGRESS** / medium / scheduled (D-29z1517): next UI round after 431 (after REGRESSION-2026-11-13 when due) / Export dialog <progress> (determinate + indeterminate PU4 encoder-load state) drawn by the theme, not the browser; neutral colour role kept 
- ... and 921 Low/info (see backlog.json)
