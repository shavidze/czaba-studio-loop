# A round 85 checkpoint
- baseline verified 2026-10-22: HEAD 88b0262, status 0, frozen 481 OK, snapshots 7/7, protected 4/4
- next: pre-flight, X1, E1, E3, E2, tests
- pre-flight done. Decisions: (1) E1 keeps literal `applySchedule(ctx, planSchedule(arrangement, 0)` in no-window branch (locked by frozen FD8 clip-fades l.475, clip-gain l.498, track-pan l.453 — B grep missed); window branch separate call; no "pan" substring after renderArrangementWav. (2) both scope radios disabled when no valid range (frozen export-dialog-focus C-R14-02 l.531 counts 4 enabled inputs). (3) X1 = isolate on lane body.
- step: editing X1
- X1, E1, E3, E2 source edits done; biome/tsc clean; 13 related frozen test files green (225). next: new tests export-range.test.ts, export-range-ui.test.tsx, track-header-stacking.test.tsx
- tests written: export-range (8), export-range-ui (10), track-header-stacking (4), graph.test one assertion. next: typecheck/lint/targeted/mutations/docs/review
- report a-round-85.md written; waiting for code-reviewer
- review addressed (M1 test, L4 title, L5 parens); targeted 65/1151; hashes refreshed; frozen OK
