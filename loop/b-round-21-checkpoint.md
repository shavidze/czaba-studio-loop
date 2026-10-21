# B round 21 → 22 checkpoint (2026-10-11)

- Done: tasks/round-21.md archived (sha 74b5d3d0… = current-task.md at start). Read a-round-21.md, c-round-21.md/json, feature-status.md, plan.md D-29k/l, backlog sections.
- Verified live: b-round-20-tree-sha256.txt 50 OK, git status 42 lines, HEAD c5ed47b.
- C round 21: FAIL only by C-R21-01 (Low, mute tail ~120 ms, graph.client.ts:7 τ 0.015 / l.163). All other run-2 IDs PASS; C-R12-01 closed (margin 0.13 ms). Notes: R11-P1c text "one history entry" wrong (original = no entry); R2-V1 MOV wording -> probe.
- Plan: round 22 = C-R21-01 only (graph.client.ts setTrackGain: short de-click τ for transitions to/from 0, keep 0.015 for volume; graph.test.ts; doc 028). Frozen list for round 22 = 49 files (b-round-20 list minus graph.client.ts) -> b-round-21-tree-sha256.txt.
- Then round 23+: A round-11 follow-ups + ArrangementLane.tsx:661, then SRW-13.
- Still to write: b-round-21-tree-sha256.txt, current-task.md, b-round-21.md, b-next.json, feature-status.md, backlog.json, plan.md D-29m.

- 02:37Z: written b-round-21-tree-sha256.txt (49 OK) and current-task.md (round 22, D-29m). Remaining: b-round-21.md, b-next.json, feature-status.md, backlog.json, plan.md.
- 02:39Z: backlog.json v23 written (backup backlog.json.bak-before-b-round-21). b-round-21.md, b-next.json done. Remaining: feature-status.md (backup made), plan.md D-29m.
- 02:41Z: feature-status.md and plan.md D-29m written. All B round-21 artifacts done; store untouched (42 lines, 50 OK).
- 02:44Z: advisor post-write fixes applied (R22-M2 beep tone 2 ms blocks, R22-A1 spy-only, vitest floor, edge case, round-23 contract open). Draft kept as current-task.round22-draft1.md. DONE.
