B380 checkpoint 1: archived tasks/round-380.md; round 380 C PASS + gate published 9a05c82
checkpoint 2: advisor -> 12b awaiting_user (no accepted tolerance), round 381 = PERF-13a; next: locate code, measure, consult
checkpoint 3: premise facts: res.mem.backing-ready-mib = 19.3 MiB at HEAD (c-round-380/perf-res.log l.100) vs plan target <=60 (premise 140 predates PERF-2/5) -> plan exit already met on that metric. Decoded AudioBuffers held in ArrangementContext buffersRef (l.798), set at l.2638 (video) and l.4057 (collection, eager decode of every source at load), never pruned. Next: consult perf-optimizer + tech-lead to shape PERF-13a.
checkpoint 4: consults perf-optimizer + tech-lead launched (PERF-13a shape); backlog bookkeeping pending (379->done, 380 done, 12b awaiting_user, gate380 Lows)
checkpoint 5: backlog D-29z1267..1269 written (380 accepted, gate380 Lows, 12b awaiting_user)
checkpoint 6: perf-optimizer consult: metric (a) init-script WeakRef registry over decodeAudioData/createBuffer/AudioBuffer ctor, sum len*ch*4 after 2x collectGarbage -> res.mem.pcm-live-mib-ready (+count, +after-preview-sweep); (b) Tracing memory-infra record only; 13a harness-only record; 13b R314 demo-buffer 6x longtask fix; 13c LRU for unplaced sources only, needs long-stem scenario (no backend-free long source today: DEMO_STEM_DURATION=16 demo-synth.ts:31; only file input is video; WAV rejected).
checkpoint 7: current-task.md (round 381 PERF-13a) written; claims-381 output saved; next: backlog D-29z1270/1271, feature-status, b-round-380.md, b-next.json
checkpoint 8: all artifacts written (task, b-round-380.md, b-next.json, backlog v347, feature-status)
checkpoint 9: advisor final fixes applied (K20-K23, readiness wait, locator, K10=3)
