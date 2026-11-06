# B round 360 -> 361 checkpoint (predictions written before any run)

Baseline: gate 360 published 93ea6c1 (= HEAD, clean). Sketch: apply-sketch.py (activeTrackId -> selection store; field removed from ArrangementContextValue; Lane boolean selector; LibraryPreview hook; group-header containsActive leaf; probe helpers). Rows: ss-rows.py (SS8-SS11).

## Predictions
- Full vitest on sketch (before SS rows): all pass (the two ArrangementContextValue probes in grid-snap-position / marker-time-snap-ui are patched; useWorkspaceProbe spreads activeTrackId).
- Perf sketch: interact.click.components 83 -> between 15 and 40 (PO-R361-1: 20-35); interact.click.commits 2 -> 1 or 2 (unknown second commit); select.same-lane 15 and reclick 0 unchanged; load row unchanged or lower; no asserted row red; 0 NEW.
- MU-1 (StudioWorkspace subscribes at top): click.components >= 70 (back near 83).
- MU-2 (state mirror in value deps): SS8 red (context renders +1); perf click.components >= 70.
- MU-3 (no store guard): SS9 red (listener called on same value).
- MU-4 (first track of any kind): SS10 red ('video'); also UC-type tests may fail.
- MU-5 (paste reads render snapshot): SS11 red (pasted on 'music').

## Added after the advisor review (prediction written before the run)
- MU-7 (provider `setActiveTrackId` also schedules `setStatus(\`mutant ${next}\`)` 100 ms later; same shape as round 360's M-P2): `interact.click.commits` 3 (> 2, red) and `interact.click.components` > 42 (red; a status write re-renders the provider value, SIG-R360). Other rows whose scenario changes the active track may also move; recorded, not predicted.
