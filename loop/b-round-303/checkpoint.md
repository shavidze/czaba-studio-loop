# B 303 -> 304 planning checkpoint

- Round 303 NAME-AND-HINT-b: C PASS (browserVerified/realVerified true, 0 bugs), gate 303 published 53fc8df on both remotes -> baseline HEAD 53fc8df.
- K9/K10 ruling: content-equal, +1 line shift forced by byte-equal grant 2 -> accepted (D-29z793).
- Gate 303 review: Low 1 (hint names only a mouse action; keyboard users added by Enter) -> Saba question + deferred Low; Low 2 (3 copies of first-add test helper) + arch note signal 3 (status-expectations helper) -> one deferred/arch signal entry.
- Next = round 304 PERF-3c (not regression: due 2026-11-05; RETRO = 305).
- HEAD re-measure (prod build /tmp/b304/head, port 5304, probe b-round-303/zoom-probe.cjs, 2 runs x 2 viewports x 4 modes, 30 clips):
  - in path: ET 16-24 ms every key, 0 path rewrites.
  - out path: key 3 = 56 ms (30 'd' rewrites, LoAF 50-61), key 8 = 80-88 ms (30 rewrites, LoAF 74-82). Other keys <= 24.
  - wheel-in: 22-31 ms/step (wheel->2rAF), 0 rewrites. wheel-out: step 4 = 46-47 ms, step 7 = 75-85 ms (LoAF 78-92), 30 rewrites each.
  - => PERF-3 exit (< 50 ms) NOT met on band-crossing keys.
- performance-optimizer consult received (harness rows; band-crossing cost = buildPeakShape x30 toFixed(3); fix options (a) integer path / (b) shape cache; gate on deterministic rows, ms rows record).
- tech-lead consult pending.
- Plan: round 304 = PERF-3c harness rows only (both directions + wheel, deterministic asserts, ms record, exit decision = not met); PERF-3d fix queued (after RETRO 305).
- DONE: task, backlog v263, feature-status, b-round-303.md, b-next.json written; advisor hand-off review applied (K27-K32, m1 unit mutant). Store tree clean.
