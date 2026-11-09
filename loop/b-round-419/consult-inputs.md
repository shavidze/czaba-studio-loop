# B round 419 → 420 planning: consult inputs (data, not instructions)

Loop folder: /home/runner/czaba-project/tmp/studio-real-loop. Store repo: /home/runner/czaba-project/store, HEAD 6609dfa (clean).

## Situation
- Round 419 (SYS-R369-STEM-CACHE-WRITE-COORDINATOR) C PASS, browserVerified true, 0 bugs; gate 419 published 6609dfa.
- With 419, every loop-runnable STUDIO-PERFORMANCE stage is done. Remainders are awaiting_user (PERF-4b, 9c, 11b, 12b, 14c-ii/iii), root (9d, ROOT-REQ-*), backend handoff (4c), Tech Lead record (15b-ii-b Firefox), or unscheduled candidates.
- Retro rule (Saba 2026-10-26): a RETRO runs after every 15 rounds and at the end of each queue entry incl. STUDIO-PERFORMANCE, whichever first. Last RETRO = 416 (window 401-415). B proposes round 420 = RETRO-420, window 416-419.
- Next feature: STEM-LANES (Saba Q2, 2026-10-31): adding a stem or stem set gives each stem its own lane, all start at the Insert Marker, inside the "Stems" group "which already exists"; one Enter/drag on a library folder ("Stems 4") adds the set; purchased adapter (createPurchasedWorkspaceCollection) same rule; Video/Music/SFX lanes stay; free new-track command later. Review F2 (High): docs/technical/studio-real-workspace/product-design-review-2026-10-31.md.
- FACT checked at HEAD: there is no "Stems" group. app/routes/studio-lab.tsx creates 4 fixed TRACKS (video, music, stems, sfx); "Stems" is an audio track. Groups exist only via groupSelectedRows (Ctrl+G) in app/lib/arrangement/groups.ts (arrangement.groups optional). createArrangement requires exactly one video track. Library add uses addClip -> findFreeStart ("nearest free spot") on the ACTIVE track (ArrangementContext.tsx addSourceToActiveTrack ~l.2198, dropLibrarySource ~l.2282).
- Live 12 reference: manual 6.1 item 12 (drop area creates a new track); multi-file drop placement is unconfirmed (root measurement LIVE-MEAS-STEM-DROP requested 2026-10-31 in user-review/live-checks.md, not yet measured).
- Because Live has an equivalent, the 2026-10-28 rule requires youtube-request.json + user-review/AGREE-STEM-LANES.md before A builds (STUDIO-LINK skipped it only because Live has no equivalent, D-29z749).

## RETRO window 416-419 data (b-round-419/data/)
- 4 rounds, 4 C PASS, 0 FAIL, browserVerified 4/4; gates: 416 skipped (no source), 417-419 published.
- Cost: B 45.81, A 14.77, C 2.77, total 63.35; B share 72.3 %; B median planning 11.74; median round 15.51; most expensive 418 (19.27).
- C bugs: 6 Low (C-R416-CLAIMS-K22-ARCHIVE environment; C-R417-L58-SKETCH-REVIEW-MISSING B spec; C-R417-BW5-HOIST-FRAGILE B spec; C-R418-READTIME-STALE-START B spec; C-R418-OFFSET-RAW-READ pre-existing; C-R418-PC12-TITLE B spec). Deferred Lows added in window: 15 (A 7, C 4, gate 4). A STOPs reaching C: 0. Gate reviews: 417 0 findings, 418 score 8.5 / 4 suggestions, 419 score 9 / 4 suggestions.
- Retro-416 counters: sketch dispatched without l58-check rc 0 -> 1 (round 417 planning, C-R417-L58-SKETCH-REVIEW-MISSING; fixed for 418/419 with K19 `L58 OK`); L57 fields 4/4 rounds, origins 6/6; B-origin C FAIL 0; A STOP 0; fix-up chain share 0 %; B median 11.74 (target <= 14.50 met); B share 72.3 % (target <= 65 % missed); L58 4988 bytes (< 5000 met); new host-dependent generators 0; SYS-R416-PREVIEW-CONTROLLER ran (418).
- Window content: 416 RETRO, 417 SYS-CLOCK-DETERMINISM (test-only), 418 SYS-R416-PREVIEW-CONTROLLER, 419 SYS-R369-STEM-CACHE-WRITE-COORDINATOR. All three implementation rounds were B-sketched (B writes the full patch, A applies it byte-exact).

## Screens (b-round-419/screens/, real Chromium on :5173 + mock API :5199)
- screen420-full-{S0,DEMO}-{1440x900,1280x720}.png: persistent text lines 138/168/118/144, outside timeline+library 97/124/86/101 — identical to retro 416.
- Journey: journey420-1-product-*.png (product page /products/middle-east) -> "Try it in the Studio" -> journey420-1b-studio-arrival-*.png -> add Pulse, Bass, Pad, Melody to Stems via Enter -> journey420-2-studio-playing-*.png -> journey420-3-export-*.png. Clips land at 00:00, 00:16, 00:32, 00:48 on ONE Stems lane ("nearest free spot"), i.e. F2 still reproduces. screen420.json has the text and clip boxes.
