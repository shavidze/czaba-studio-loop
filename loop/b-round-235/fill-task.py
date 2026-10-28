p='current-task.md'; s=open(p).read()
rep={
"RESULT_COVERING (see `b-round-235/precheck-covering.log`).":"**All 118 files and 1,692 tests are green** (`b-round-235/precheck-covering.log`, 209 s). There is no red row, so no existing test needs a grant. The slowest tests are CP12a–d at 9.0 s of 30 s, and UM3/UC5 at 3.5 s of 20 s.",
"The files are `b-round-235/probe/dbl-baseline.json` and RESULT_PROBE_FILES. There were 0 page errors.":"The files are `b-round-235/probe/dbl-baseline.json`, `out-baseline.json` and `out-scratch.json` (script `recipes.cjs`). There were 0 page errors.",
"- **Seed a tempo:** click":"- **Wait for ready first (new, L29):** before the seed, wait until `[data-testid=\"arrangement-status\"]` starts with `Demo collection ready`. Without this wait, the provider's ready message can land after the seed and overwrite the status. That happens within about 1–2 s of load (`out-baseline-noreadywait.json`; this is the A-R234-REVIEW-M1 class, round 237). Status rows then read the wrong text.\n- **Seed a tempo:** click",
"- **Baseline effect of a strip double-click:** playing (`Pause`), and the status shows the Fit message. RESULT_BASELINE_DBL":"- **Baseline effect of a strip double-click:** playing (`Pause`, position 3.26–3.28 after 300 ms), with the status `Fit: the entire project is visible (00:16.000). X goes back.` at both viewports. Baseline end click at 15.95 s with `scrollLeft` 300: it plays from 0 (0.47 s after 500 ms), and Follow scrolls back to 0. This is C-R235-01.",
"- **Scratch effect:** RESULT_SCRATCH":"- **Scratch effect** (both viewports):\n  - strip double-click: playing from 3.000 (3.249 after 300 ms), with the seed status unchanged (no Fit) and `scrollLeft` 0;\n  - lower-zone double-click: the exact Fit status;\n  - end click: `Play`, position 16, `scrollLeft` 300, with the exact `playPastEnd` status of C-END-236.",
}
for a,b in rep.items():
    assert s.count(a)==1,a[:50]; s=s.replace(a,b)
assert 'RESULT_' not in s
open(p,'w').write(s)
print('ok')
