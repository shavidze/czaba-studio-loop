# tech-lead review of the PERF-11c-iii-e-ii sketch (B round 408 -> 409). Read-only; the agent edited no files. Relayed by B, close to verbatim.

## Pass 1: v2, sha256 bd47148b0d1717d4752743de0abb7fb37f33c453ded6b3f22abf847edf50c420 (kept: sketch-logs/v2/sketch-409-v2.patch.txt)
Verdict: APPROVE WITH LOWS. Behaviour-preserving; no stale prop/closure: the comparator compared all 8 ArrangementTrack fields; inner handlers read live values via getArrangement() (track.volume only as a compared-field fallback); sourceDurations/laneSources/laneGhostTitles/hasArrangementClips changes change identity/value -> worst case an extra render, never stale; ghost titles depend on arrangement.clips; audioNote guard equivalent (WorkspaceVideoSource.audio required). Object.entries annotated [string, unknown][] only widens (not an assertion); absent-vs-undefined optional prop -> key-count mismatch -> extra render, never stale; the only caller passes a fixed key set. Shell hooks unconditional, render pure, useMemo deps complete (two mutants prove it). Tests not vacuous; track names differ from clip titles.
- TL-R409-SK-1 Low: field chain -> new ArrangementTrack field silently ignored; fix: table typed over keyof ArrangementTrack (-?) + Object.values(...).every.
- TL-R409-SK-2 Low: RB-LEAF8 lane.textContent; fix: query title by role/name/testid.
- TL-R409-SK-3 Low: RB-LEAF9 toBe(2) unexplained; fix: assert the source lane state or per-lane counts.
- TL-R409-SK-4 Low: volume/pan/name/groupId not mutant-covered; fix: SK-1 or a pan/volume commit row.
- TL-R409-SK-5 Info: transport-undo/redo render all 4 inners because they undo/redo the Bass add (layout props change) - expected.
- TL-R409-SK-6 Info: sourceDurations whole map -> all lanes on a duration arrival; rare, safe.
- TL-R409-SK-7 Info: naming follows ArrangementVideoDock.tsx (ViewInner / memo View / exported shell).

## Pass 2: v3 = the dispatched patch, sha256 1beedffbda3eca0f6b7befe112c8d7729b0684929cb60633e1024fe5e49c50ac
Verdict: APPROVE. All four Lows resolved, nothing new.
- SK-1 resolved: table typed over keyof Required<ArrangementTrack> (ArrangementLane.tsx:205-221); tsc-mutant-NEW-TRACK-FIELD.log rc 2, TS2741 at l.207 naming colour; a removed field becomes an excess-property error.
- SK-2 resolved: getAllByTitle(studioClipStrings.moveTitle(title)) expects exactly one (render-budget.test.tsx:1110).
- SK-3 resolved: blocked ghost (1) before valid (2, target + source lane), data-blocked checked in both states (l.1144).
- SK-4 resolved: setTrackPan('music', 0.5) -> 1 inner render and Pan slider '25' (l.1090); MU-409-DROP-PAN-FIELD red.
- Note (not a finding): shells() <= 3 (l.1044, 1050) also passes at 0; acceptable as an upper budget per performance-optimizer.
- Evidence checked: mutants/summary.txt 9/9 red with named rows, pristine rc 0; precheck-full.log 262/3885 rc 0. The browser probe file was not opened by the reviewer.
