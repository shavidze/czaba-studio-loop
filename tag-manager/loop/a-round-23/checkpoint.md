# A round 23 checkpoint

- 13:19 UTC: baseline ok — HEAD bb4671d = chore(release): v1.4.0 on top of 9d1c97e (only version fields), tree clean.
- 13:19:42 UTC: read primitives TESTING, TYPESCRIPT_STRICT, AGENT_DISCOVERABLE_CODE, STATE_MANAGEMENT, GEORGIAN_DOCS (via Bash cat, before any edit).
- 13:20:14–13:20:23 UTC (log mtimes): step 1 done — (z12) + (i1)/(i2) added via Edit. Red: part B on mockClear 1 failed/49 passed "promise rejected \"Error: leaked\" instead of resolving" (red-partB-mockClear.log); part A M7 copy /tmp/a-r23-m7 1 failed/19 passed "expected [ 'dx.wav' ] to deeply equal [ 'cx.wav', 'dx.wav' ]" (red-partA-M7.log). Read-primitives hook did not fire on first Edit.
- step 2 done — mockReset; green 70/70 for the two files (green-partAB.log). Biome before: 8 warnings (biome-before.log).
- step 3 done — D-32 via Edit; `grep -c " as "` 8 → 2; src diff byte-identical to B's experiment diff.
- step 4 done — docs/bugs/001-save-and-selection-known-limits.md (8 entries) + README row.
- verifyCommand exit 0 (Biome 8 warnings same list, tsc 0, renderer 201/201 10 files, main 93/93, E2E 7/7); --retries=0 7/7 (verify.log, e2e-retries0.log).
- equivalence: old 9d1c97e src + new tests 201/201 (equiv-oldsrc-newtests.log). MI-1..5 each killed by (i2) (mutants-MI.log).
- qa-engineer: no regression. code-reviewer: no blocking; 2 docs fixes applied (D-32 defined, :201-228); (i1) name kept (task-mandated).
- final gate after last edit: verify exit 0 (201/93/7, Biome 8), --retries=0 7/7. a-round-23.md written. DONE.
