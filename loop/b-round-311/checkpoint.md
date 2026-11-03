# B round 311 -> 312 planning checkpoint
1. DONE: tasks/round-311.md archived (cmp equal). backlog v271 written (D-29z832 close-out, D-29z833 Lows deferred). Backup b-round-311/backlog-before-312.json.
2. DONE: L37 premise probe at HEAD dfa4502 on dev :5173 (b-round-311/probe/peaks-probe.cjs, dev-head*.json, analyze.py):
   computePeaks main-thread inclusive 55-86 ms per load (3 runs); per call 0.9/1.6/0.9/2.8/25.9/14.2/19.2 ms; all from ArrangementContext collection .then.
   Other main-thread: synthesizeDemoSamples (SFX soft-impact/slow-rise) ~20 ms still on main thread (PERF-2 remainder signal).
3. NEXT: consults performance-optimizer + tech-lead; node timing of 5-min stem; write task PERF-5a; feature-status; b-round-311.md; b-next.json.
4. DONE: browser-copy.cjs (Chromium 143, 5-min 48k stereo): computePeaks 29.6-32.6 ms; copyFromChannel into FRESH Float32Arrays 58-82 ms total (any chunk size); into ONE REUSED buffer 5.6-9.3 ms total, max slice 0.1-3.5 ms; main-thread time-sliced compute 43-47 ms total. => worker only wins with recycled chunk buffers (pool ping-pong); fresh-copy design is worse than HEAD.
5. DONE: performance-optimizer consult (saved summary in b-round-311.md §consults). Waiting tech-lead.
6. DONE: current-task.md (round 312 PERF-5a), claims-312.sh + outputs, backlog v271 (D-29z832..836), feature-status, b-round-311.md, b-next.json CONTINUE. Store tree clean. Remaining: advisor final check.
