p='current-task.md'; s=open(p,encoding='utf-8').read()
R=[
("<li>Space → playing from 6. After about 1 s, drag a 1 s body range on the clip: no playhead jump (monotonic, no step > 0.1).</li><li>Click an empty lane point at 6 to clear the range; that point becomes the new insert marker (L29: Escape does not clear a range).</li><li>Space → playing from 6. Space at ≈ 7.2 → stopped.",
 "<li>Space → playing from 6. After about 1 s, drag a 1 s body range on the clip: no playhead jump (monotonic, no step > 0.1).</li><li>**Space → stopped.** Only now, while stopped, click an empty lane point at 6. This clears the range, and that point becomes the new insert marker (the C-N229-S3 recipe; L29: Escape does not clear a range). Do not click the lane while playing: a click during playback moves only the insert marker (Saba decision 1).</li><li>Space → playing from 6. Space at ≈ 7.2 → stopped."),
("<li>\"Next-marker key\": Home, then Ctrl+Right → 12.000.</li>",
 "<li>\"Next-marker key\": Home, then Ctrl+Right. If Ctrl+Right stops at a clip edge first, press it again until the flag at 12 is reached. The expected readouts, as in C-NAV-ORIGIN-252: the flag at 12 has `aria-current`, `[data-insert-marker]` = `12.000`, the playhead is 12, and the clock reads `00:12.000`.</li>"),
("<li>During a fader drag while playing, playback continues with no restart: the output RMS stays > 0 at every 50 ms sample.</li></ul> |",
 "<li>**No graph restart during a drag while playing** is not re-measured here. RR-PERF's fader scenarios carry it: PERF-1a's track, group, master, pan and clip-gain drags while playing, with 0 restarts as the PERF-FADER budget. An output-RMS liveness check would false-fail on the gapped pulse stem (round 199 RG-18).</li></ul> |"),
("  - Expected: 3/3 pass, and the deterministic medians equal the last accepted oracle (`b-round-222/scripts/equiv-check.py`, as in rounds 223 and 225).\n",
 "  - **PASS:** rc 0, 3/3 specs pass, every budget row passes its contract (`perf/budgets*.json`), `complete` is true, 0 aborts and 0 page errors. A budget assertion that fails on a valid isolated run is a **finding**. Its severity is Medium for a fader, drag or playback budget, and Low otherwise.\n  - **Comparison with the last accepted oracle (report, not a pass criterion):**\n    - The oracle is `c-round-225/latest-interactions.json` and `latest-resources.json`, accepted at gate 225 (`80fbb3b`).\n    - `npm run test:perf` has not run on a published commit since then (`git log -- perf/` ends at `80fbb3b`), while the transport, the insert marker and the grid changed in rounds 234–257.\n    - Run `python3 -I b-round-224/scripts/equiv-check-b2.py` against that oracle, and list every deterministic row that differs, with its scenario id and both values.\n    - B rules those deltas at the round 258 → 259 planning (L10). A delta alone is not a FAIL.\n"),
("    - `MobileBlocker` blocks the Studio below 1024 px (`app/components/ui/MobileWarning.tsx` l.103, used by `studio.$productId.tsx` l.301, \"Studio is Desktop-Only\");",
 "    - `MobileBlocker` shows \"Studio is Desktop-Only\" below 1024 px (`app/components/ui/MobileWarning.tsx` l.103), but only on the purchased route `studio.$productId.tsx` (l.301), and it offers \"continue anyway\". **`/studio-lab` has no blocker at all**, so the 1024 px floor is the project's stated intent, not a guard on the lab;"),
]
for a,b in R:
    assert s.count(a)==1, a[:60]
    s=s.replace(a,b)
open(p,'w',encoding='utf-8').write(s); print('task ok')
import json
P='backlog.json'; bj=json.load(open(P))
for f in bj['open_findings']+bj['deferred_low_polish']:
    if f.get('id')=='GATE257-NARROW-TOOLBAR-OVERLAP' and 'no blocker' not in f['status']:
        f['status']+=' | floor nuance: MobileBlocker (with continue-anyway) is only on the purchased studio.$productId route; /studio-lab has no blocker - the 1024 floor is stated intent, not a lab guard'
for t in bj['tech_lead_manual_checks']:
    if t.get('id')=='TL-Q-VIEWPORT': t['status']+=' (note: /studio-lab has no MobileBlocker; only the purchased route blocks < 1024 with continue-anyway)'
for r in bj['rounds']:
    if r.get('round')==258: r['note']+='; advisor fixes: RG-04 stop before lane click, RR-FADER restart check carried by RR-PERF, RR-PERF oracle c-round-225/latest-*.json (80fbb3b) deltas reported for B ruling, RG-16 readouts per C-NAV-ORIGIN-252'
json.dump(bj,open(P,'w'),ensure_ascii=False,indent=1); print('backlog ok')
fs=open('feature-status.md',encoding='utf-8').read()
a='Round 258 = **REGRESSION-ROUND-2026-10-30 — მოწმდება**'
assert fs.count(a)==1
fs=fs.replace(a,'Round 258 = **REGRESSION-ROUND-2026-10-30 — მუშავდება**')
open('feature-status.md','w',encoding='utf-8').write(fs)
bn=json.load(open('b-next.json'))
bn['remaining']=[x.replace('SABA-B-9 (stage 1 round 256, stage 2 master bottom-right)','SABA-B-9 (stage 1 done rounds 256-257; stage 2 master bottom-right)') for x in bn['remaining']]
json.dump(bn,open('b-next.json','w'),ensure_ascii=False,indent=1); print('bnext ok')
